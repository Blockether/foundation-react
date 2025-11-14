/**
 * SQL Cockpit Component
 *
 * This is the main SQL Cockpit component that brings together the Monaco Editor,
 * DuckDB-WASM integration, and professional toolbar for a complete SQL query
 * interface in the browser.
 */

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Toaster } from '@/components/ui/sonner'
import { Textarea } from '@/components/ui/textarea'
import { useSQLFormatter } from '@/hooks/use-sql-formatter'
import {
  exportQueryResultToCSVFile,
  exportQueryResultToJSONFile,
  transformDuckDBResult,
  transformErrorToSQLError,
  useDuckDB,
  useDuckDBConnection,
} from '@/lib/duckdb'
import { DuckDBQueryState } from '@/lib/duckdb/types'
import { cn } from '@/lib/utils'
import {
  DataSource,
  InsightsQuery,
  QueryResult,
  SavedQuery,
  SQLCockpitProps,
  SQLError,
} from '@/types/sql'
import { Loader2 } from 'lucide-react'
import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { toast } from 'sonner'
import { SQLEditor } from './editor'
import { HelpDialog } from './help'
import { ResultsPanel } from './results'
import { SQLToolbar } from './toolbar'

/**
 * Helper component to display table/data source names with styling
 */
const TableName = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block px-2 bg-muted font-mono text-sm mx-1 rounded-sm">
    {children}
  </span>
)

/**
 * SQL Cockpit component that integrates all SQL functionality
 */
export function SQLCockpit({
  initialQuery = '',
  savedQueries = [],
  insightQueries,
  initialDataSources,
  autoCleanupRemovedDataSources = false,
  llmCompletionFunction,
}: SQLCockpitProps): React.ReactNode {
  return (
    <SQLCockpitWrappedContent
      initialQuery={initialQuery}
      savedQueries={savedQueries}
      {...(insightQueries && { insightQueries })}
      {...(initialDataSources && { initialDataSources })}
      {...(autoCleanupRemovedDataSources && { autoCleanupRemovedDataSources })}
      {...(llmCompletionFunction && { llmCompletionFunction })}
    />
  )
}

const SQLCockpitWrappedContent = ({
  initialQuery,
  savedQueries,
  insightQueries,
  initialDataSources,
  autoCleanupRemovedDataSources,
  llmCompletionFunction,
}: {
  initialQuery: string
  savedQueries?: SavedQuery[]
  insightQueries?: InsightsQuery[]
  initialDataSources?: DataSource[]
  autoCleanupRemovedDataSources?: boolean
  llmCompletionFunction?: (params: {
    userRequest: string
    dataSources: Array<{
      name: string
      tableName: string
      schema?: any[]
    }>
    currentQuery: string
  }) => Promise<string>
}): React.ReactNode => {
  // SQL editor state
  const [query, setQuery] = useState(initialQuery)
  const queryRef = useRef(query)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showAIAssistDialog, setShowAIAssistDialog] = useState(false)
  const [aiUserRequest, setAiUserRequest] = useState('')
  const [isGeneratingQuery, setIsGeneratingQuery] = useState(false)

  // Database status indicator state
  const [showDbStatusRed, setShowDbStatusRed] = useState(false)

  // Keep queryRef in sync with query state
  React.useEffect(() => {
    queryRef.current = query
  }, [query])

  // DuckDB state
  const { db } = useDuckDB()
  const { connection } = useDuckDBConnection(db)

  // Track which data source IDs have been loaded (to handle dynamic updates)
  const loadedDataSourceIdsRef = useRef<Set<string>>(new Set())

  // Query execution state
  const [queryState, setQueryState] = useState<DuckDBQueryState>(
    DuckDBQueryState.QueryIdle
  )
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [queryError, setQueryError] = useState<SQLError | null>(null)

  // Selection state
  const [selectedColumns, setSelectedColumns] = useState<Set<number>>(new Set())
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  // Database status indicator effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (db) {
      // Database is available, clear any existing timer and show green
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      setShowDbStatusRed(false)
    } else {
      // Database is not available, start a 5-second timer
      timer = setTimeout(() => {
        setShowDbStatusRed(true)
      }, 5000)
    }

    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [db])

  // Data sources state
  const [dataSources, setDataSources] = useState<DataSource[]>(() => {
    // Initialize datasources: mark ones that claim to be 'loaded' but aren't verified as 'verification_needed'
    if (!initialDataSources) return []

    return initialDataSources.map(ds => {
      // If datasource claims to be loaded, mark as verification needed until we verify it actually exists
      if (ds.loadingStatus === 'loaded') {
        return { ...ds, loadingStatus: 'verification_needed' as const }
      }
      return ds
    })
  })

  // Use ref for batch loading to avoid race conditions with effects
  const isLoadingBatchRef = useRef(false)
  const currentLoadOperationRef = useRef<number | null>(null)
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)

  // Helper to get current loading state (for reading in render)
  const getIsLoadingBatch = () => isLoadingBatchRef.current
  const setIsLoadingBatch = (value: boolean) => {
    isLoadingBatchRef.current = value
    forceUpdate() // Trigger re-render to show updated state
  }

  // Insights query state
  const [currentInsightsQuery, setCurrentInsightsQuery] =
    useState<InsightsQuery | null>(null)

  // SQL formatter
  const {
    formatQuery: formatQueryAsync,
    lastError: formatError,
    clearError: clearFormatError,
  } = useSQLFormatter({
    dialect: 'sql',
    keywordCase: 'upper',
  })

  // Execute query
  const handleRunQuery = useCallback(async (): Promise<void> => {
    if (!query.trim() || !connection) {
      return
    }

    const startTime = Date.now()
    setQueryState(DuckDBQueryState.QueryRunning)
    setQueryError(null)
        setCurrentInsightsQuery(null)

    // Clear format error when running a new query
    clearFormatError()

    try {
      const result = await transformDuckDBResult(connection, query, startTime)
      setQueryResult(result)
      setQueryState(DuckDBQueryState.QueryCompleted)
    } catch (err) {
      setQueryError(transformErrorToSQLError(err))
      setQueryState(DuckDBQueryState.QueryError)
    }
  }, [query, connection])

  // Cancel query
  const handleCancelQuery = useCallback(async (): Promise<void> => {
    if (!connection) {
      return
    }

    setQueryState(DuckDBQueryState.QueryInterrupting)
    try {
      await connection.cancelSent()
      setQueryState(DuckDBQueryState.QueryIdle)
    } catch (err) {
      console.error('[blockether-foundation-react] Failed to cancel query:', err)
      setQueryState(DuckDBQueryState.QueryIdle)
    }
  }, [connection])

  // Format query
  const handleFormatQuery = useCallback(async (): Promise<void> => {
    try {
      const currentQuery = queryRef.current
      const formatted = await formatQueryAsync(currentQuery)
      setQuery(formatted)
    } catch (err) {
      // Formatting errors are handled by the hook
    }
  }, [formatQueryAsync])

  // Show help
  const handleShowHelp = useCallback((): void => {
    setShowHelpDialog(true)
  }, [])

  // Hide help
  const handleCloseHelp = useCallback((): void => {
    setShowHelpDialog(false)
  }, [])

  // Show AI assist dialog
  const handleShowAIAssist = useCallback((): void => {
    setShowAIAssistDialog(true)
    setAiUserRequest('')
  }, [])

  // Handle AI query generation
  const handleGenerateAIQuery = useCallback(async (): Promise<void> => {
    if (!llmCompletionFunction || !aiUserRequest.trim()) {
      return
    }

    setIsGeneratingQuery(true)

    try {
      console.log('[blockether-foundation-react] AI Assistant - Starting data source preparation')
      console.log('[blockether-foundation-react] Available data sources:', dataSources.length)
      console.log(
        '[blockether-foundation-react] Data sources details:',
        dataSources.map(ds => ({
          name: ds.name,
          tableName: ds.tableName,
          loadingStatus: ds.loadingStatus,
          schemaColumns: ds.schema?.length || 0,
        }))
      )

      // Prepare data source information with sample data
      const dataSourcesInfo = await Promise.all(
        dataSources
          .filter(ds => {
            console.log(
              `[blockether-foundation-react] Checking data source: ${ds.name}, status: ${ds.loadingStatus}`
            )
            return ds.loadingStatus === 'loaded'
          })
          .map(async ds => {
            const dsInfo: any = {
              name: ds.name,
              tableName: ds.tableName,
              ...(ds.schema && { schema: ds.schema }),
            }

            // Fetch sample data (5 rows) for this table
            try {
              if (!connection) {
                throw new Error('No connection available')
              }

              console.log(`[blockether-foundation-react] Fetching sample data for table: ${ds.tableName}`)
              const sampleQuery = `SELECT * FROM "${ds.tableName}" LIMIT 5`
              console.log(`[blockether-foundation-react] Sample query: ${sampleQuery}`)

              const sampleResult = await transformDuckDBResult(
                connection,
                sampleQuery,
                Date.now()
              )
              console.log(`[blockether-foundation-react] Sample result:`, sampleResult)

              if (sampleResult.data && sampleResult.data.length > 0) {
                dsInfo.sampleData = sampleResult.data
              }
            } catch (error) {
              console.warn(
                `[blockether-foundation-react] Failed to fetch sample data for ${ds.tableName}:`,
                error
              )
            }

            return dsInfo
          })
      )

      console.log(
        '[blockether-foundation-react] Prepared data sources for LLM:',
        dataSourcesInfo.map(ds => ({
          name: ds.name,
          tableName: ds.tableName,
          hasSchema: !!ds.schema,
          schemaColumns: ds.schema?.length || 0,
          hasSampleData: !!ds.sampleData,
          sampleDataRows: ds.sampleData?.length || 0,
        }))
      )

      // Call the LLM completion function
      const generatedQuery = await llmCompletionFunction({
        userRequest: aiUserRequest,
        dataSources: dataSourcesInfo,
        currentQuery: queryRef.current,
      })

      // Update the query in the editor
      setQuery(generatedQuery)

      // Close dialog
      setShowAIAssistDialog(false)
      setAiUserRequest('')

      toast.success('AI-generated query inserted successfully')
    } catch (error) {
      console.error('[blockether-foundation-react] Failed to generate AI query:', error)
      toast.error(
        <span>
          Failed to generate query:{' '}
          {error instanceof Error ? error.message : 'Unknown error'}
        </span>
      )
    } finally {
      setIsGeneratingQuery(false)
    }
  }, [llmCompletionFunction, aiUserRequest, dataSources])

  // Handle saved query selection
  const handleSavedQuerySelect = useCallback(
    (selectedQuery: SavedQuery): void => {
      setQuery(selectedQuery.query)
    },
    []
  )

  // Enhanced function to get table schema using DuckDB DESCRIBE
  const getTableSchema = useCallback(
    async (tableName: string): Promise<DataSource['schema']> => {
      if (!connection) return []

      try {
        // Use DuckDB's DESCRIBE to get column information
        const describeResult = await connection.query(`DESCRIBE ${tableName}`)
        const schemaData = describeResult.toArray()

        return schemaData.map((col: any) => ({
          name: col.column_name,
          type: col.column_type,
          nullable: col.null === 'YES',
        }))
      } catch (error) {
        console.warn('[blockether-foundation-react] Failed to get table schema:', error)
        return []
      }
    },
    [connection]
  )

  // Handle file import
  const handleImportFile = useCallback(
    async (file: File, existingDataSourceId?: string): Promise<void> => {
      if (!connection) {
        console.error('[blockether-foundation-react] No database connection available')
        return
      }

      try {
        // Generate table name - use existing datasource's tableName if updating, otherwise derive from filename
        let tableName: string
        if (existingDataSourceId) {
          const existingDataSource = dataSources.find(
            ds => ds.id === existingDataSourceId
          )
          tableName =
            existingDataSource?.tableName ||
            file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_')
        } else {
          tableName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_]/g, '_')
        }

        // Read file content
        const arrayBuffer = await file.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        // Register the file with DuckDB
        await db?.registerFileBuffer(file.name, uint8Array)

        // Determine file type and create appropriate SQL
        let createTableSQL = ''
        if (file.name.endsWith('.csv')) {
          console.log(`[blockether-foundation-react] Importing CSV file: ${file.name}`)
          console.log(`[blockether-foundation-react] Table name: ${tableName}`)

          // First, let's check what DuckDB sees in the CSV
          try {
            // Use sample_size=-1 to force DuckDB to scan entire file for type detection
            // Combined with all_varchar=true to prevent type inference issues
            const previewQuery = `SELECT * FROM read_csv('${file.name}', header=true, delim=',', quote='"', sample_size=-1, all_varchar=true) LIMIT 3`
            console.log(`[blockether-foundation-react] Preview query: ${previewQuery}`)
            const preview = await connection.query(previewQuery)
            const previewData = preview.toArray()
            console.log(`[blockether-foundation-react] CSV Preview (first 3 rows):`, previewData)
            console.log(
              `[blockether-foundation-react] Detected columns:`,
              preview.schema.fields.map((f: any) => f.name)
            )
          } catch (error) {
            console.error(`[blockether-foundation-react] Failed to preview CSV:`, error)
          }

          // Use explicit parameters: sample_size=-1 ensures full file scan, all_varchar prevents type confusion
          createTableSQL = `CREATE TABLE ${tableName} AS SELECT * FROM read_csv('${file.name}', header=true, delim=',', quote='"', sample_size=-1, all_varchar=true)`
        } else if (file.name.endsWith('.parquet')) {
          createTableSQL = `CREATE TABLE ${tableName} AS SELECT * FROM read_parquet('${file.name}')`
        } else if (
          file.name.endsWith('.json') ||
          file.name.endsWith('.jsonl')
        ) {
          createTableSQL = `CREATE TABLE ${tableName} AS SELECT * FROM read_json('${file.name}', AUTO_DETECT=TRUE)`
        } else {
          throw new Error(`Unsupported file type: ${file.name}`)
        }

        // Execute the CREATE TABLE query
        console.log(`[blockether-foundation-react] Executing CREATE TABLE: ${createTableSQL}`)
        await connection.query(createTableSQL)

        // Verify table was created correctly
        try {
          const verifyQuery = `SELECT * FROM ${tableName} LIMIT 3`
          const verifyResult = await connection.query(verifyQuery)
          const verifyData = verifyResult.toArray()
          console.log(`[blockether-foundation-react] Table created. First 3 rows:`, verifyData)
          console.log(
            `[blockether-foundation-react] Table columns:`,
            verifyResult.schema.fields.map((f: any) => f.name)
          )
          console.log(
            `[blockether-foundation-react] Total rows in table:`,
            (
              await connection.query(
                `SELECT COUNT(*) as count FROM ${tableName}`
              )
            ).toArray()[0].count
          )
        } catch (error) {
          console.error(`[blockether-foundation-react] Failed to verify table:`, error)
        }

        // Get table schema using DuckDB DESCRIBE
        const schema = await getTableSchema(tableName)

        // If updating an existing datasource, preserve its metadata
        if (existingDataSourceId) {
          setDataSources(prev =>
            prev.map(ds => {
              if (ds.id === existingDataSourceId) {
                return {
                  ...ds,
                  file: {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                  },
                  ...(schema && { schema }),
                }
              }
              return ds
            })
          )
        } else {
          // Add to data sources as a new entry
          const newDataSource: DataSource = {
            id: `file_${Date.now()}`,
            name: file.name,
            type: 'file',
            tableName,
            file: {
              name: file.name,
              size: file.size,
              type: file.type,
            },
            ...(schema && { schema }),
            createdAt: new Date(),
            loadingStatus: 'loaded',
          }

          setDataSources(prev => [...prev, newDataSource])
        }
      } catch (error) {
        console.error('[blockether-foundation-react] Failed to import file:', error)
        throw error
      }
    },
    [connection, db, getTableSchema, dataSources]
  )

  // Handle data source selection
  const handleSelectDataSource = useCallback((dataSource: DataSource): void => {
    // Insert a SELECT query for the data source
    const selectQuery = `SELECT * FROM ${dataSource.tableName} LIMIT 100;`
    setQuery(selectQuery)
  }, [])

  // Handle insights query execution
  const handleExecuteInsightsQuery = useCallback(
    async (
      insightsQuery: InsightsQuery,
      dataSource?: DataSource
    ): Promise<void> => {
      if (!connection) {
        toast.error(<span>No database connection available</span>)
        return
      }

      const startTime = Date.now()
      setQueryState(DuckDBQueryState.QueryRunning)
      setQueryError(null)
            setCurrentInsightsQuery(insightsQuery)

      // Clear format error when running insights query
      clearFormatError()

      try {
        // Update table references in insights query to use the actual data source
        let queryToExecute = insightsQuery.query
        if (dataSource) {
          // Replace generic table references with the actual data source table name
          queryToExecute = insightsQuery.query.replace(
            /\busers\b/g,
            dataSource.tableName
          )
        }

        // Execute the insights query
        const result = await transformDuckDBResult(
          connection,
          queryToExecute,
          startTime
        )
        setQueryResult(result)
        setQueryState(DuckDBQueryState.QueryCompleted)

        toast.success(
          <span>
            {insightsQuery.name} on table{' '}
            <TableName>{dataSource?.tableName || 'unknown'}</TableName>{' '}
            completed successfully
          </span>
        )
      } catch (err) {
        setQueryError(transformErrorToSQLError(err))
        setQueryState(DuckDBQueryState.QueryError)
        toast.error(
          <span>
            Insights query on table{' '}
            <TableName>{dataSource?.tableName || 'unknown'}</TableName> failed:{' '}
            {err instanceof Error ? err.message : 'Unknown error'}
          </span>
        )
      }
    },
    [connection]
  )

  // Load initial data sources when connection is ready (handles dynamic updates)
  React.useEffect(() => {
    if (!connection || !db) {
      console.log('[blockether-foundation-react] Waiting for DuckDB connection...', {
        connection: !!connection,
        db: !!db,
      })
      return
    }

    if (!initialDataSources || initialDataSources.length === 0) {
      console.log('[blockether-foundation-react] No initial data sources provided')
      return
    }

    const loadInitialDataSources = async () => {
      // Generate unique operation ID for this load
      const operationId = Date.now()
      currentLoadOperationRef.current = operationId

      // Set batch loading state immediately at the start
      setIsLoadingBatch(true)

      // Filter to datasources that need loading:
      // Skip only if: in loadedDataSourceIdsRef AND has loadingStatus: 'loaded'
      // Everything else gets loaded (new datasources, failed ones, verification_needed ones)
      const newDataSources = initialDataSources.filter(ds => {
        const isActuallyLoaded =
          loadedDataSourceIdsRef.current.has(ds.id) &&
          ds.loadingStatus === 'loaded'
        return !isActuallyLoaded
      })

      if (newDataSources.length === 0) {
        // Need to clear the batch loading state since we're done
        setIsLoadingBatch(false)
        return // Nothing new to load
      }

      // Commented out loading toast for less intrusive experience
      // toast.info(
      //   <span>
      //     Loading {newDataSources.length} data source{newDataSources.length > 1 ? 's' : ''}...
      //   </span>
      // )

      for (let index = 0; index < newDataSources.length; index++) {
        // Check if operation was cancelled
        if (currentLoadOperationRef.current !== operationId) {
          return // Silently exit if operation was cancelled
        }

        const dataSource = newDataSources[index]

        // Mark as loading FIRST so individual indicators show immediately
        setDataSources(prev =>
          prev.map(ds =>
            ds.id === dataSource.id
              ? { ...ds, loadingStatus: 'loading' as const }
              : ds
          )
        )

        // Exponential backoff delay: 2^index seconds
        // Index 0: 0s (immediate)
        // Index 1: 2s
        // Index 2: 4s
        // Index 3: 8s
        // Index 4: 16s
        if (index > 0) {
          const delayMs = Math.pow(2, index) * 1000
          await new Promise(resolve => setTimeout(resolve, delayMs))

          // Check if operation was cancelled during delay
          if (currentLoadOperationRef.current !== operationId) {
            return // Silently exit if operation was cancelled
          }
        }

        try {
          console.log(
            `[blockether-foundation-react] Processing: ${dataSource.name} (${dataSource.tableName})`
          )

          // Load from raw data first (highest priority)
          if (dataSource.data && dataSource.data.length > 0) {
            // Create a temporary CSV from the data
            // Use explicit columnOrder if provided, otherwise use Object.keys()
            let columns =
              dataSource.columnOrder || Object.keys(dataSource.data[0])

            // Validate columnOrder for duplicates
            if (dataSource.columnOrder) {
              const columnSet = new Set(dataSource.columnOrder)
              if (columnSet.size !== dataSource.columnOrder.length) {
                const duplicates = dataSource.columnOrder.filter(
                  (col, index) => dataSource.columnOrder!.indexOf(col) !== index
                )
                const uniqueDuplicates = [...new Set(duplicates)]

                console.warn(
                  `[blockether-foundation-react] Duplicate columns detected in columnOrder for ${dataSource.name}: ${uniqueDuplicates.join(', ')}`
                )

                toast.error(
                  <span>
                    Duplicate columns in columnOrder for table{' '}
                    <TableName>{dataSource.tableName}</TableName>:{' '}
                    {uniqueDuplicates.join(', ')}
                  </span>
                )

                // Remove duplicates - keep first occurrence only
                columns = [...columnSet]
                console.log(
                  `[blockether-foundation-react] Removed duplicates, using: ${columns.join(', ')}`
                )
              }
            }

            const csvHeaders = columns.join(',')
            const csvRows = dataSource.data.map(row =>
              columns
                .map(col => {
                  const value = row[col]

                  // Handle arrays by joining with semicolon and wrapping in quotes
                  if (Array.isArray(value)) {
                    const arrayString = value.join('; ')
                    return `"${arrayString.replace(/"/g, '""')}"`
                  }

                  // Handle strings that contain commas or quotes
                  if (
                    typeof value === 'string' &&
                    (value.includes(',') ||
                      value.includes('"') ||
                      value.includes('\n'))
                  ) {
                    return `"${value.replace(/"/g, '""')}"`
                  }

                  // Handle null/undefined values
                  if (value === null || value === undefined) {
                    return ''
                  }

                  return String(value)
                })
                .join(',')
            )
            const csvContent = [csvHeaders, ...csvRows].join('\n')

            // Register as a temporary file in DuckDB
            const tempFileName = `${dataSource.tableName}.csv`
            const encoder = new TextEncoder()
            const uint8Array = encoder.encode(csvContent)
            await db.registerFileBuffer(tempFileName, uint8Array)

            // Debug: Log the actual CSV content being generated
            console.log(
              `[blockether-foundation-react] Generated CSV headers: "${csvHeaders}"`
            )
            console.log(
              `[blockether-foundation-react] Number of header columns: ${columns.length}`
            )
            console.log(
              `[blockether-foundation-react] Column order source: ${dataSource.columnOrder ? 'explicit columnOrder' : 'Object.keys()'}`
            )
            console.log(`[blockether-foundation-react] First CSV row: "${csvRows[0]}"`)
            console.log(
              `[blockether-foundation-react] Number of values in first row: ${csvRows[0]?.split(',').length}`
            )
            console.log(
              `[blockether-foundation-react] Sample object keys: ${Object.keys(dataSource.data[0]).join(', ')}`
            )
            console.log(
              `[blockether-foundation-react] Sample skills value:`,
              dataSource.data[0]?.skills
            )
            console.log(
              `[blockether-foundation-react] Sample skills type:`,
              typeof dataSource.data[0]?.skills
            )
            console.log(
              `[blockether-foundation-react] Full first object:`,
              dataSource.data[0]
            )

            // Create table with explicit CSV parameters: sample_size=-1 for full scan, all_varchar to prevent type confusion
            // This prevents DuckDB from using heuristics that might treat data rows as headers
            await connection.query(
              `CREATE OR REPLACE TABLE ${dataSource.tableName} AS SELECT * FROM read_csv('${tempFileName}', header=true, delim=',', quote='"', sample_size=-1, all_varchar=true)`
            )

            // Verify the table was created with proper column names
            const tableInfo = await connection.query(
              `PRAGMA table_info('${dataSource.tableName}')`
            )
            const actualColumns = tableInfo
              .toArray()
              .map((row: any) => row.name)
            console.log(
              `[blockether-foundation-react] Table ${dataSource.tableName} created with columns:`,
              actualColumns
            )

            // If columns are still generic, recreate with explicit definitions
            if (actualColumns.some(col => col.startsWith('column'))) {
              console.log(
                `[blockether-foundation-react] Detected generic column names, recreating table with explicit definitions...`
              )

              // Drop the table and recreate with explicit column definitions
              await connection.query(
                `DROP TABLE IF EXISTS ${dataSource.tableName}`
              )

              const columnDefs = columns
                .map(col => `"${col}" VARCHAR`)
                .join(', ')
              await connection.query(
                `CREATE TABLE ${dataSource.tableName} (${columnDefs})`
              )

              // Insert data using the CSV with explicit header=true
              await connection.query(
                `INSERT INTO ${dataSource.tableName} SELECT * FROM read_csv('${tempFileName}', AUTO_DETECT=TRUE, header=true)`
              )

              console.log(
                `[blockether-foundation-react] Recreated table with explicit column definitions`
              )
            }

            // Clean up temp file
            await db.dropFile(tempFileName)

            console.log(
              `[blockether-foundation-react] Created table ${dataSource.tableName} from raw data (${dataSource.data.length} rows)`
            )

            // Update schema information
            const schemaResult = await connection.query(`
              SELECT column_name, data_type, is_nullable
              FROM information_schema.columns
              WHERE table_name = '${dataSource.tableName}'
              ORDER BY ordinal_position
            `)

            const schema = schemaResult.toArray().map((row: any) => ({
              name: row.column_name as string,
              type: row.data_type as string,
              nullable: (row.is_nullable as string).toUpperCase() === 'YES',
            }))

            loadedDataSourceIdsRef.current.add(dataSource.id)
            setDataSources(prev =>
              prev.map(ds => {
                if (ds.id === dataSource.id) {
                  const { loadingError, ...rest } = ds
                  return { ...rest, loadingStatus: 'loaded' as const, schema }
                }
                return ds
              })
            )

            // Commented out toast for less intrusive loading
            // toast.success(
            //   <span>
            //     Loaded table <TableName>{dataSource.tableName}</TableName>
            //   </span>
            // )
            continue
          }

          // For data sources with URL, proceed directly to load (no need to verify existing table)
          // For data sources without URL, verify if table already exists
          if (!dataSource.url) {
            // Skip if the table already exists (e.g., manually created or rehydrated state)
            try {
              await connection.query(
                `SELECT 1 FROM ${dataSource.tableName} LIMIT 1`
              )
              console.log(
                `[blockether-foundation-react] Table ${dataSource.tableName} already exists, skipping load but marking as loaded`
              )
              loadedDataSourceIdsRef.current.add(dataSource.id)
              setDataSources(prev =>
                prev.map(ds =>
                  ds.id === dataSource.id
                    ? { ...ds, loadingStatus: 'loaded' as const }
                    : ds
                )
              )
              continue
            } catch {
              // Table doesn't exist, but we can't load it without URL, so mark as failed
              console.log(
                `[blockether-foundation-react] Table ${dataSource.tableName} does not exist and no URL provided`
              )
              setDataSources(prev =>
                prev.map(ds =>
                  ds.id === dataSource.id
                    ? {
                      ...ds,
                      loadingStatus: 'failed' as const,
                      loadingError: `Table ${dataSource.tableName} does not exist and no URL provided to load it`,
                    }
                    : ds
                )
              )
              continue
            }
          }

          // Load from URL
          if (dataSource.url) {
            console.log(
              `[blockether-foundation-react] Fetching from URL: ${dataSource.url}`
            )

            // Check if table already exists before attempting to create
            try {
              await connection.query(
                `SELECT 1 FROM ${dataSource.tableName} LIMIT 1`
              )
              console.log(
                `[blockether-foundation-react] Table ${dataSource.tableName} already exists, skipping URL load but marking as loaded`
              )
              loadedDataSourceIdsRef.current.add(dataSource.id)
              setDataSources(prev =>
                prev.map(ds =>
                  ds.id === dataSource.id
                    ? { ...ds, loadingStatus: 'loaded' as const }
                    : ds
                )
              )
              continue
            } catch {
              // Table doesn't exist, proceed with URL load
              console.log(
                `[blockether-foundation-react] Table ${dataSource.tableName} doesn't exist yet, loading from URL`
              )
            }
            const response = await fetch(dataSource.url)

            if (!response.ok) {
              throw new Error(
                `Failed to fetch ${dataSource.url}: ${response.status} ${response.statusText}`
              )
            }

            const blob = await response.blob()
            const fileName = dataSource.url.split('/').pop() || dataSource.name
            const file = new File([blob], fileName, {
              type: blob.type || 'text/csv',
            })

            console.log(
              `[blockether-foundation-react] Importing file: ${fileName} (${blob.size} bytes)`
            )
            // Pass the existing datasource ID to update it instead of creating a new one
            await handleImportFile(file, dataSource.id)
            loadedDataSourceIdsRef.current.add(dataSource.id)

            // Mark as loaded
            setDataSources(prev =>
              prev.map(ds => {
                if (ds.id === dataSource.id) {
                  const { loadingError, ...rest } = ds
                  return { ...rest, loadingStatus: 'loaded' as const }
                }
                return ds
              })
            )

            // Commented out toast for less intrusive loading
            // toast.success(
            //   <span>
            //     Loaded table <TableName>{dataSource.tableName}</TableName>
            //   </span>
            // )
            console.log(
              `[blockether-foundation-react] Successfully loaded: ${dataSource.name}`
            )
            continue
          }

          // Load from fileData
          if (dataSource.fileData) {
            // Pass the existing datasource ID to update it instead of creating a new one
            await handleImportFile(dataSource.fileData, dataSource.id)
            loadedDataSourceIdsRef.current.add(dataSource.id)

            // Mark as loaded
            setDataSources(prev =>
              prev.map(ds => {
                if (ds.id === dataSource.id) {
                  const { loadingError, ...rest } = ds
                  return { ...rest, loadingStatus: 'loaded' as const }
                }
                return ds
              })
            )

            // Commented out toast for less intrusive loading
            // toast.success(
            //   <span>
            //     Loaded table <TableName>{dataSource.tableName}</TableName>
            //   </span>
            // )
            continue
          }
        } catch (error) {
          console.error(
            `[blockether-foundation-react] Failed to load data source ${dataSource.name}:`,
            error
          )

          const errorMessage =
            error instanceof Error ? error.message : String(error)

          // Mark as failed but DO NOT add to loaded set so it can be retried
          // loadedDataSourceIdsRef.current.add(dataSource.id) // Commented out to allow retries

          setDataSources(prev =>
            prev.map(ds =>
              ds.id === dataSource.id
                ? {
                  ...ds,
                  loadingStatus: 'failed' as const,
                  loadingError: errorMessage,
                }
                : ds
            )
          )
        }
      }

      // All datasources processed, clear batch loading state
      setIsLoadingBatch(false)
      currentLoadOperationRef.current = null
    }

    loadInitialDataSources()

    // Cleanup function to cancel current operation if effect runs again
    return () => {
      currentLoadOperationRef.current = null
      setIsLoadingBatch(false)
    }
  }, [connection, db, initialDataSources]) // Remove handleImportFile from dependencies to prevent race conditions

  // Cleanup removed data sources (optional, controlled by prop)
  React.useEffect(() => {
    if (!connection || !autoCleanupRemovedDataSources) {
      return
    }

    const cleanupRemovedDataSources = async () => {
      // Get current data source IDs from prop
      const currentIds = new Set(initialDataSources?.map(ds => ds.id) || [])

      // Find IDs that were loaded but are no longer in the prop
      const removedIds = Array.from(loadedDataSourceIdsRef.current).filter(
        id => !currentIds.has(id)
      )

      if (removedIds.length === 0) {
        return
      }

      console.log(`[blockether-foundation-react] Cleaning up ${removedIds.length} removed data sources...`)

      for (const removedId of removedIds) {
        try {
          // Find the corresponding table name from dataSources state
          const dataSource = dataSources.find(ds => ds.id === removedId)
          if (dataSource) {
            await connection.query(
              `DROP TABLE IF EXISTS ${dataSource.tableName}`
            )
            console.log(`[blockether-foundation-react] Dropped table: ${dataSource.tableName}`)
            toast.success(
              <span>
                Removed table <TableName>{dataSource.tableName}</TableName>
              </span>
            )

            // Remove from dataSources state
            setDataSources(prev => prev.filter(ds => ds.id !== removedId))
          }

          // Remove from loaded IDs
          loadedDataSourceIdsRef.current.delete(removedId)
        } catch (error) {
          console.error(`[blockether-foundation-react] Failed to cleanup data source ${removedId}:`, error)
        }
      }
    }

    cleanupRemovedDataSources()
  }, [
    connection,
    initialDataSources,
    autoCleanupRemovedDataSources,
    dataSources,
  ])

  // Prevent selection event handlers
  const handlePreventSelection = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      // Only prevent selection for cockpit interactions that aren't already handled by child components
      if (
        (e as React.TouchEvent).touches &&
        (e as React.TouchEvent).touches.length > 0
      ) {
        e.preventDefault()
      }
    },
    []
  )

  // Drag and drop handlers
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)

      const files = Array.from(e.dataTransfer.files)

      for (const file of files) {
        try {
          await handleImportFile(file)
        } catch (error) {
          console.error(`[blockether-foundation-react] Failed to import file ${file.name}:`, error)
        }
      }
    },
    [handleImportFile]
  )

  // Save results handlers
  const handleSaveResults = useCallback((): void => {
    setShowSaveDialog(true)
  }, [])

  const handleSaveAsFormat = useCallback(
    async (format: 'csv' | 'json' | 'parquet'): Promise<void> => {
      if (!queryResult || !queryResult.data || queryResult.data.length === 0) {
        return
      }

      try {
        let file: File

        // Check if we have selections and use selected data instead
        const hasSelections = selectedColumns.size > 0 || selectedRows.size > 0

        switch (format) {
          case 'csv':
            if (hasSelections) {
              if (selectedColumns.size > 0) {
                // Save only selected columns
                file = exportQueryResultToCSVFile(
                  queryResult,
                  `selected_columns_${Date.now()}.csv`,
                  { selectedColumns: Array.from(selectedColumns) }
                )
              } else {
                // Save only selected rows
                file = exportQueryResultToCSVFile(
                  queryResult,
                  `selected_rows_${Date.now()}.csv`,
                  { selectedRows: Array.from(selectedRows) }
                )
              }
            } else {
              // Full dataset
              file = exportQueryResultToCSVFile(
                queryResult,
                `query_results_${Date.now()}.csv`
              )
            }
            break

          case 'json':
            if (hasSelections) {
              if (selectedColumns.size > 0) {
                // Save only selected columns
                file = exportQueryResultToJSONFile(
                  queryResult,
                  `selected_columns_${Date.now()}.json`,
                  { selectedColumns: Array.from(selectedColumns) }
                )
              } else {
                // Save only selected rows
                file = exportQueryResultToJSONFile(
                  queryResult,
                  `selected_rows_${Date.now()}.json`,
                  { selectedRows: Array.from(selectedRows) }
                )
              }
            } else {
              // Full dataset
              file = exportQueryResultToJSONFile(
                queryResult,
                `query_results_${Date.now()}.json`
              )
            }
            break

          default:
            throw new Error(`Unsupported format: ${format}`)
        }

        // Create and download file
        const url = URL.createObjectURL(file)
        const link = document.createElement('a')
        link.href = url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setShowSaveDialog(false)
      } catch (error) {
        console.error('[blockether-foundation-react] Failed to save results:', error)
      }
    },
    [queryResult, selectedColumns, selectedRows]
  )

  return (
    <div
      className={cn('h-full relative')}
      style={
        {
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        } as React.CSSProperties
      }
      data-sql-cockpit="true"
      onTouchStart={handlePreventSelection}
      onMouseDown={handlePreventSelection}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col h-full bg-background border">
        {/* Toolbar */}

        <SQLToolbar
          onRunQuery={handleRunQuery}
          onCancelQuery={handleCancelQuery}
          onFormatQuery={handleFormatQuery}
          db={db}
          showDbStatusRed={showDbStatusRed}
          queryState={queryState}
          queryResult={queryResult}
          queryError={queryError}
          query={query}
          onHelp={handleShowHelp}
          onSaveResults={handleSaveResults}
          {...(llmCompletionFunction && { onAIAssist: handleShowAIAssist })}
          hasLLMCompletion={!!llmCompletionFunction}
          savedQueries={savedQueries || []}
          onSavedQuerySelect={handleSavedQuerySelect}
          dataSources={dataSources}
          isLoadingBatch={getIsLoadingBatch()}
          onImportFile={handleImportFile}
          onSelectDataSource={handleSelectDataSource}
          onExecuteInsightsQuery={handleExecuteInsightsQuery}
          insightQueries={insightQueries || []}
          currentInsightsQuery={currentInsightsQuery}
        />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* SQL Editor */}

          <SQLEditor
            value={query}
            onChange={setQuery}
            onExecute={handleRunQuery}
            onFormat={handleFormatQuery}
            enableSyntaxHighlighting={true}
            enableAutoComplete={true}
            enableFormatting={true}
            dataSources={dataSources}
            connection={connection}
          />

          {/* Results Panel */}
          <div className="flex-3 min-h-[200px] shadow-inner">
            <ResultsPanel
              result={queryResult}
              error={queryError || formatError}
              isLoading={queryState === DuckDBQueryState.QueryRunning}
              maxHeight="none"
              insightsQuery={currentInsightsQuery}
              onSelectionChange={(columns, rows) => {
                setSelectedColumns(columns)
                setSelectedRows(rows)
              }}
            />
          </div>
        </div>

        {/* Help Dialog */}
        <HelpDialog isOpen={showHelpDialog} onClose={handleCloseHelp} />

        {/* AI Assist Dialog */}
        <Dialog open={showAIAssistDialog} onOpenChange={setShowAIAssistDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>AI-Assisted Query Generation</DialogTitle>
              <DialogDescription>
                Describe what you want to query and the AI will generate a SQL
                query for you based on your available data sources.
              </DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <Textarea
                placeholder="Describe what you want to query in natural language..."
                value={aiUserRequest}
                onChange={e => setAiUserRequest(e.target.value)}
                className="min-h-[120px]"
                disabled={isGeneratingQuery}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleGenerateAIQuery()
                  }
                }}
              />
              {dataSources.filter(ds => ds.loadingStatus === 'loaded').length >
                0 && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <span className="font-medium">Available data sources:</span>{' '}
                    {dataSources
                      .filter(ds => ds.loadingStatus === 'loaded')
                      .map(ds => ds.tableName)
                      .join(', ')}
                  </div>
                )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAIAssistDialog(false)}
                disabled={isGeneratingQuery}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateAIQuery}
                disabled={!aiUserRequest.trim() || isGeneratingQuery}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isGeneratingQuery && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Generate Query
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Save Results Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Results</DialogTitle>
              <DialogDescription>
                Choose a format to save your query results. CSV is compatible
                with spreadsheets and JSON is ideal for web applications.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleSaveAsFormat('csv')}
                >
                  <div className="w-full text-left">
                    <div className="font-medium wrap-break-word">CSV</div>
                    <div className="text-xs text-muted-foreground wrap-break-word whitespace-normal">
                      Comma-separated values, compatible with Excel and
                      spreadsheets
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto p-4 cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleSaveAsFormat('json')}
                >
                  <div className="w-full text-left">
                    <div className="font-medium wrap-break-word">JSON</div>
                    <div className="text-xs text-muted-foreground wrap-break-word whitespace-normal">
                      JavaScript Object Notation, ideal for web applications
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Toast Notifications */}
        <Toaster position="top-right" />

        {/* Drag and Drop Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-start justify-center pt-20 pointer-events-none z-1">
            <div className="bg-background border border-blue-500 rounded-lg p-6 shadow-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="text-blue-500 font-semibold">
                  Drop to Import Files
                </div>
                <div className="text-sm text-muted-foreground">
                  Supported formats: CSV, Parquet, JSON, JSONL
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

