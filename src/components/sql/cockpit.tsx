/**
 * SQL Cockpit Component
 *
 * This is the main SQL Cockpit component that brings together the Monaco Editor,
 * DuckDB-WASM integration, and professional toolbar for a complete SQL query
 * interface in the browser.
 */

import React, { useState, useCallback, useRef, useReducer } from 'react'
import { SQLEditor } from './editor'
import { SQLToolbar } from './toolbar'
import { ResultsPanel } from './results'
import { HelpDialog } from './help'
import { useSQLFormatter } from '@/hooks/use-sql-formatter'
import { cn } from '@/lib/utils'
import {
  SavedQuery,
  QueryResult,
  SQLError,
  DataSource,
  AnalyticalQuery,
  SQLCockpitProps,
} from '@/types/sql'
import {
  useDuckDB,
  useDuckDBConnection,
  transformDuckDBResult,
  transformErrorToSQLError,
} from '@/lib/duckdb'
import { DuckDBQueryState } from '@/lib/duckdb/types'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

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
  placeholder = 'Enter SQL query here...',
  savedQueries = [],
  analyticalQueries,
  initialDataSources,
  autoCleanupRemovedDataSources = false,
}: SQLCockpitProps): React.ReactNode {
  return (
    <SQLCockpitWrappedContent
      initialQuery={initialQuery}
      placeholder={placeholder}
      savedQueries={savedQueries}
      {...(analyticalQueries && { analyticalQueries })}
      {...(initialDataSources && { initialDataSources })}
      {...(autoCleanupRemovedDataSources && { autoCleanupRemovedDataSources })}
    />
  )
}

const SQLCockpitWrappedContent = ({
  initialQuery,
  savedQueries,
  placeholder,
  analyticalQueries,
  initialDataSources,
  autoCleanupRemovedDataSources,
}: {
  initialQuery: string
  placeholder?: string
  savedQueries?: SavedQuery[]
  analyticalQueries?: AnalyticalQuery[]
  initialDataSources?: DataSource[]
  autoCleanupRemovedDataSources?: boolean
}): React.ReactNode => {
  // SQL editor state
  const [query, setQuery] = useState(initialQuery)
  const queryRef = useRef(query)
  const [showHelpDialog, setShowHelpDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)

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

  // Analytical query state
  const [isAnalyticalQuery, setIsAnalyticalQuery] = useState(false)
  const [currentAnalyticalQuery, setCurrentAnalyticalQuery] =
    useState<AnalyticalQuery | null>(null)

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
    setIsAnalyticalQuery(false)
    setCurrentAnalyticalQuery(null)

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
      console.error('Failed to cancel query:', err)
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

  // Handle saved query selection
  const handleSavedQuerySelect = useCallback(
    (selectedQuery: SavedQuery): void => {
      const editorPlaceholder = document.querySelector('.monaco-placeholder')
      if (editorPlaceholder) {
        editorPlaceholder.setAttribute('style', 'display: none !important;')
      }

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
        console.warn('Failed to get table schema:', error)
        return []
      }
    },
    [connection]
  )

  // Handle file import
  const handleImportFile = useCallback(
    async (file: File, existingDataSourceId?: string): Promise<void> => {
      if (!connection) {
        console.error('No database connection available')
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
          createTableSQL = `CREATE TABLE ${tableName} AS SELECT * FROM read_csv('${file.name}', AUTO_DETECT=TRUE)`
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
        await connection.query(createTableSQL)

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
            enableAnalysis: true,
            createdAt: new Date(),
          }

          setDataSources(prev => [...prev, newDataSource])
        }
      } catch (error) {
        console.error('Failed to import file:', error)
        throw error
      }
    },
    [connection, db, getTableSchema, dataSources]
  )

  // Handle data source selection
  const handleSelectDataSource = useCallback((dataSource: DataSource): void => {
    const editorPlaceholder = document.querySelector('.monaco-placeholder')
    if (editorPlaceholder) {
      editorPlaceholder.setAttribute('style', 'display: none !important;')
    }

    // Insert a SELECT query for the data source
    const selectQuery = `SELECT * FROM ${dataSource.tableName} LIMIT 100;`
    setQuery(selectQuery)
  }, [])

  // Handle analytical query execution
  const handleExecuteAnalyticalQuery = useCallback(
    async (
      analyticalQuery: AnalyticalQuery,
      dataSource?: DataSource
    ): Promise<void> => {
      if (!connection) {
        toast.error(<span>No database connection available</span>)
        return
      }

      const startTime = Date.now()
      setQueryState(DuckDBQueryState.QueryRunning)
      setQueryError(null)
      setIsAnalyticalQuery(true)
      setCurrentAnalyticalQuery(analyticalQuery)

      // Clear format error when running analytical query
      clearFormatError()

      try {
        // Substitute table name placeholder with actual table name
        let queryToExecute = analyticalQuery.query
        if (dataSource) {
          queryToExecute = analyticalQuery.query.replace(
            /\busers\b/g,
            dataSource.tableName
          )
          console.log(
            `Substituted table name: "${dataSource.tableName}"`,
            queryToExecute
          )
        }

        // Execute the analytical query
        const result = await transformDuckDBResult(
          connection,
          queryToExecute,
          startTime
        )
        setQueryResult(result)
        setQueryState(DuckDBQueryState.QueryCompleted)

        toast.success(
          <span>
            {analyticalQuery.name} on table{' '}
            <TableName>{dataSource?.tableName || 'unknown'}</TableName>{' '}
            completed successfully
          </span>
        )
      } catch (err) {
        setQueryError(transformErrorToSQLError(err))
        setQueryState(DuckDBQueryState.QueryError)
        toast.error(
          <span>
            Analytical query on table{' '}
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
      console.log('[DataSourceLoader] Waiting for DuckDB connection...', {
        connection: !!connection,
        db: !!db,
      })
      return
    }

    if (!initialDataSources || initialDataSources.length === 0) {
      console.log('[DataSourceLoader] No initial data sources provided')
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
            `[DataSourceLoader] Processing: ${dataSource.name} (${dataSource.tableName})`
          )

          // For data sources with URL, proceed directly to load (no need to verify existing table)
          // For data sources without URL, verify if table already exists
          if (!dataSource.url) {
            // Skip if the table already exists (e.g., manually created or rehydrated state)
            try {
              await connection.query(
                `SELECT 1 FROM ${dataSource.tableName} LIMIT 1`
              )
              console.log(
                `[DataSourceLoader] Table ${dataSource.tableName} already exists, skipping load but marking as loaded`
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
                `[DataSourceLoader] Table ${dataSource.tableName} does not exist and no URL provided`
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
              `[DataSourceLoader] Fetching from URL: ${dataSource.url}`
            )

            // Check if table already exists before attempting to create
            try {
              await connection.query(
                `SELECT 1 FROM ${dataSource.tableName} LIMIT 1`
              )
              console.log(
                `[DataSourceLoader] Table ${dataSource.tableName} already exists, skipping URL load but marking as loaded`
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
                `[DataSourceLoader] Table ${dataSource.tableName} doesn't exist yet, loading from URL`
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
              `[DataSourceLoader] Importing file: ${fileName} (${blob.size} bytes)`
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
              `[DataSourceLoader] Successfully loaded: ${dataSource.name}`
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

          // Load from raw data
          if (dataSource.data && dataSource.data.length > 0) {
            // Create a temporary CSV from the data
            const columns = Object.keys(dataSource.data[0])
            const csvHeaders = columns.join(',')
            const csvRows = dataSource.data.map(row =>
              columns
                .map(col => {
                  const value = row[col]
                  if (
                    typeof value === 'string' &&
                    (value.includes(',') || value.includes('"'))
                  ) {
                    return `"${value.replace(/"/g, '""')}"`
                  }
                  return String(value ?? '')
                })
                .join(',')
            )
            const csvContent = [csvHeaders, ...csvRows].join('\n')

            // Register as a temporary file in DuckDB
            const tempFileName = `${dataSource.tableName}.csv`
            const encoder = new TextEncoder()
            const uint8Array = encoder.encode(csvContent)
            await db.registerFileBuffer(tempFileName, uint8Array)

            // Create table from CSV
            await connection.query(
              `CREATE TABLE ${dataSource.tableName} AS SELECT * FROM read_csv('${tempFileName}', AUTO_DETECT=TRUE)`
            )

            // Clean up temp file
            await db.dropFile(tempFileName)

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
          }
        } catch (error) {
          console.error(
            `[DataSourceLoader] Failed to load data source ${dataSource.name}:`,
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

      console.log(`Cleaning up ${removedIds.length} removed data sources...`)

      for (const removedId of removedIds) {
        try {
          // Find the corresponding table name from dataSources state
          const dataSource = dataSources.find(ds => ds.id === removedId)
          if (dataSource) {
            await connection.query(
              `DROP TABLE IF EXISTS ${dataSource.tableName}`
            )
            console.log(`Dropped table: ${dataSource.tableName}`)
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
          console.error(`Failed to cleanup data source ${removedId}:`, error)
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
          console.error(`Failed to import file ${file.name}:`, error)
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
        let content: string
        let filename: string
        let mimeType: string

        // Check if we have selections and use selected data instead
        const hasSelections = selectedColumns.size > 0 || selectedRows.size > 0

        switch (format) {
          case 'csv':
            let csvHeaders: string[]
            let csvRows: string[][]

            if (hasSelections) {
              if (selectedColumns.size > 0) {
                // Save only selected columns
                const sortedColumns = Array.from(selectedColumns).sort(
                  (a, b) => a - b
                )
                csvHeaders = sortedColumns.map(
                  index => queryResult.columns[index].name
                )
                csvRows = queryResult.data.map(row =>
                  sortedColumns.map(index => {
                    const value = row[queryResult.columns[index].name]
                    if (typeof value === 'bigint') {
                      return value.toString()
                    }
                    if (
                      typeof value === 'string' &&
                      (value.includes(',') || value.includes('"'))
                    ) {
                      return `"${value.replace(/"/g, '""')}"`
                    }
                    return String(value ?? 'NULL')
                  })
                )
                filename = `selected_columns_${Date.now()}.csv`
              } else {
                // Save only selected rows
                const sortedRows = Array.from(selectedRows).sort(
                  (a, b) => a - b
                )
                csvHeaders = queryResult.columns.map(col => col.name)
                csvRows = sortedRows.map(rowIndex =>
                  queryResult.data[rowIndex]
                    ? queryResult.columns.map(col => {
                      const value = queryResult.data[rowIndex][col.name]
                      if (typeof value === 'bigint') {
                        return value.toString()
                      }
                      if (
                        typeof value === 'string' &&
                        (value.includes(',') || value.includes('"'))
                      ) {
                        return `"${value.replace(/"/g, '""')}"`
                      }
                      return String(value ?? 'NULL')
                    })
                    : ([] as string[])
                )
                filename = `selected_rows_${Date.now()}.csv`
              }
            } else {
              // Full dataset
              csvHeaders = queryResult.columns.map(col => col.name)
              csvRows = queryResult.data.map(row =>
                queryResult.columns.map(col => {
                  const value = row[col.name]
                  if (typeof value === 'bigint') {
                    return value.toString()
                  }
                  if (
                    typeof value === 'string' &&
                    (value.includes(',') || value.includes('"'))
                  ) {
                    return `"${value.replace(/"/g, '""')}"`
                  }
                  return String(value ?? '')
                })
              ) as string[][]
              filename = `query_results_${Date.now()}.csv`
            }

            content = [csvHeaders, ...csvRows]
              .map(row => row.join(','))
              .join('\n')
            mimeType = 'text/csv'
            break

          case 'json':
            // Convert to JSON with BigInt support
            let jsonData: any[]

            if (hasSelections) {
              if (selectedColumns.size > 0) {
                // Save only selected columns
                const sortedColumns = Array.from(selectedColumns).sort(
                  (a, b) => a - b
                )
                jsonData = queryResult.data.map(row => {
                  const obj: Record<string, unknown> = {}
                  sortedColumns.forEach(index => {
                    obj[queryResult.columns[index].name] =
                      row[queryResult.columns[index].name] ?? null
                  })
                  return obj
                })
                filename = `selected_columns_${Date.now()}.json`
              } else {
                // Save only selected rows
                const sortedRows = Array.from(selectedRows).sort(
                  (a, b) => a - b
                )
                jsonData = sortedRows.map(rowIndex => {
                  const obj: Record<string, unknown> = {}
                  queryResult.columns.forEach(col => {
                    obj[col.name] =
                      queryResult.data[rowIndex]?.[col.name] ?? null
                  })
                  return obj
                })
                filename = `selected_rows_${Date.now()}.json`
              }
            } else {
              // Full dataset
              jsonData = queryResult.data
              filename = `query_results_${Date.now()}.json`
            }

            content = JSON.stringify(
              jsonData,
              (_key, value) =>
                typeof value === 'bigint' ? value.toString() : value,
              2
            )
            mimeType = 'application/json'
            break

          default:
            throw new Error(`Unsupported format: ${format}`)
        }

        // Create and download file
        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        setShowSaveDialog(false)
      } catch (error) {
        console.error('Failed to save results:', error)
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
          queryState={queryState}
          queryResult={queryResult}
          queryError={queryError}
          query={query}
          onHelp={handleShowHelp}
          onSaveResults={handleSaveResults}
          savedQueries={savedQueries || []}
          onSavedQuerySelect={handleSavedQuerySelect}
          dataSources={dataSources}
          isLoadingBatch={getIsLoadingBatch()}
          onImportFile={handleImportFile}
          onSelectDataSource={handleSelectDataSource}
          onExecuteAnalyticalQuery={handleExecuteAnalyticalQuery}
          analyticalQueries={analyticalQueries || []}
          isAnalyticalQuery={isAnalyticalQuery}
          currentAnalyticalQuery={currentAnalyticalQuery}
        />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* SQL Editor */}
          <div className="flex-shrink-0 h-[240px]">
            <SQLEditor
              value={query}
              onChange={setQuery}
              onExecute={handleRunQuery}
              onFormat={handleFormatQuery}
              placeholder={placeholder || ''}
              enableSyntaxHighlighting={true}
              enableAutoComplete={true}
              enableFormatting={true}
              dataSources={dataSources}
              connection={connection}
            />
          </div>

          {/* Results Panel */}
          <div className="flex-[1] min-h-0 shadow-inner">
            <ResultsPanel
              result={queryResult}
              error={queryError || formatError}
              isLoading={queryState === DuckDBQueryState.QueryRunning}
              maxHeight="none"
              analyticalQuery={currentAnalyticalQuery}
              onSelectionChange={(columns, rows) => {
                setSelectedColumns(columns)
                setSelectedRows(rows)
              }}
            />
          </div>
        </div>

        {/* Help Dialog */}
        <HelpDialog isOpen={showHelpDialog} onClose={handleCloseHelp} />

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
                    <div className="font-medium break-words">CSV</div>
                    <div className="text-xs text-muted-foreground break-words whitespace-normal">
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
                    <div className="font-medium break-words">JSON</div>
                    <div className="text-xs text-muted-foreground break-words whitespace-normal">
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
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg flex items-start justify-center pt-20 pointer-events-none z-50">
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
