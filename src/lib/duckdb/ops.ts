import { Table as Arrow, Table, tableFromIPC, tableToIPC } from 'apache-arrow'
import {
  ARROW_MIME_TYPE,
  CSV_MIME_TYPE,
  JSONObject,
  PARQUET_MIME_TYPE,
} from './types'
import { AsyncDuckDB, AsyncDuckDBConnection } from '@duckdb/duckdb-wasm'
import type { QueryResult, SQLError } from '@/types/sql'

/**
 * Is a given file a Parquet file?
 */
export const isParquetFile = async (file: File): Promise<boolean> => {
  // If the file starts with the 'PAR1' magic bytes, assume it's Parquet.
  const firstBytes = await file.slice(0, 4).text()
  return firstBytes.startsWith('PAR1')
}

/**
 * Create a temporary unique filename, to avoid collisions.
 */
export const getTempFilename = () => {
  const timestamp = Date.now().toString()
  const randomString = Math.random().toString(36).substring(2)
  return `file-${timestamp}-${randomString}`
}

/**
 * Execute a SQL query, and return the result as an Apache Arrow table.
 */
const runQuery = async (
  connection: AsyncDuckDBConnection,
  sql: string
): Promise<Table<any>> => {
  const arrow = await connection.query(sql)
  return arrow as unknown as Table<any>
}

/**
 * Is a given object an Arrow table?
 */
export const isArrow = (obj: unknown): obj is Arrow => obj instanceof Arrow

/**
 * Is a given File a valid Arrow IPC file?
 */
export const isArrowFile = async (file: File): Promise<boolean> => {
  try {
    const buffer = await file.arrayBuffer()
    arrayBufferToArrow(buffer)
    return true
  } catch {}

  return false
}

/**
 * Load an Arrow table from an IPC file, as an ArrayBuffer.
 */
export const arrayBufferToArrow = (arrayBuffer: ArrayBuffer): Arrow => {
  const arrow = tableFromIPC(new Uint8Array(arrayBuffer))
  return arrow
}

/**
 * Convert an Arrow to an IPC file, as an ArrayBuffer.
 */
export const arrowToArrayBuffer = (arrow: Arrow): SharedArrayBuffer => {
  const array = tableToIPC(arrow, 'file')
  return array.buffer as unknown as SharedArrayBuffer
}

/**
 * Convert an Apache Arrow table to an array of JSON row objects.
 */
export function arrowToJSON(arrow: Arrow): Record<string, JSONObject>[] {
  const rows: Record<string, JSONObject>[] = []
  for (let i = 0; i < arrow.numRows; i++) {
    const row = arrow.get(i)
    if (row) {
      rows.push(row.toJSON())
    }
  }
  return rows
}

/**
 * Export a DuckDB table to an Arrow file with a given filename.
 */
export const exportTableToArrow = async (
  connection: AsyncDuckDBConnection,
  tableName: string,
  filename?: string
): Promise<File> => {
  filename = filename || getExportedFilename(tableName, 'arrow')

  const arrow = await runQuery(connection, `SELECT * FROM '${tableName}'`)
  const buffer = arrowToArrayBuffer(arrow)

  return new File([buffer as unknown as ArrayBuffer], filename, {
    type: ARROW_MIME_TYPE,
  })
}

/**
 * Export a DuckDB table to a CSV file with a given filename.
 */
export const exportTableToCSV = async (
  db: AsyncDuckDB,
  connection: AsyncDuckDBConnection,
  tableName: string,
  filename?: string,
  delimiter = ','
): Promise<File> => {
  filename = filename || getExportedFilename(tableName, 'csv')

  const tempFile = getTempFilename()
  await runQuery(
    connection,
    `COPY '${tableName}' TO '${tempFile}' WITH (HEADER 1, DELIMITER '${delimiter}')`
  )

  const buffer = await db.copyFileToBuffer(tempFile)
  await db.dropFile(tempFile)

  return new File([buffer as unknown as ArrayBuffer], filename, {
    type: CSV_MIME_TYPE,
  })
}

/**
 * Export a DuckDB table to a Parquet file with a given filename.
 *
 * Uses zstd compression by default, which seems to be both smaller & faster for many files.
 */
export const exportTableToParquet = async (
  db: AsyncDuckDB,
  connection: AsyncDuckDBConnection,
  tableName: string,
  filename?: string,
  compression: 'uncompressed' | 'snappy' | 'gzip' | 'zstd' = 'zstd'
): Promise<File> => {
  filename = filename || getExportedFilename(tableName, 'parquet')

  const tempFile = getTempFilename()
  await runQuery(
    connection,
    `COPY '${tableName}' TO '${tempFile}' (FORMAT PARQUET, COMPRESSION ${compression})`
  )

  const buffer = await db.copyFileToBuffer(tempFile)
  await db.dropFile(tempFile)

  return new File([buffer as unknown as ArrayBuffer], filename, {
    type: PARQUET_MIME_TYPE,
  })
}

/** @deprecated Use exportTableToArrow instead */
export const exportArrow = exportTableToArrow

/** @deprecated Use exportTableToCSV instead */
export const exportCsv = exportTableToCSV

/** @deprecated Use exportTableToParquet instead */
export const exportParquet = exportTableToParquet

/**
 * Strip the extension off a filename, if it matches a given extension.
 */
const stripFileExtension = (filename: string, extensions: string[]) => {
  const parts = filename.split('.')
  const ext = parts.length > 1 ? (parts.pop() as string) : ''
  const basename = parts.join('.')
  if (extensions.includes(ext)) {
    return basename
  }
  return filename
}

/**
 * Get a filename to use when downloading
 */
const getExportedFilename = (tableName: string, extension: string) => {
  // If the table was imported with an extension, strip it.
  const basename = stripFileExtension(tableName, ['arrow', 'csv', 'parquet'])

  return basename + '.' + extension
}

/**
 * Map DuckDB type to QueryResult column type
 */
export function mapDuckDBTypeToQueryType(
  duckdbType: string
): 'string' | 'number' | 'boolean' | 'date' | 'binary' {
  const type = duckdbType.toLowerCase()

  if (
    type.includes('int') ||
    type.includes('float') ||
    type.includes('double') ||
    type.includes('decimal') ||
    type.includes('numeric')
  ) {
    return 'number'
  }
  if (type.includes('bool')) {
    return 'boolean'
  }
  if (
    type.includes('date') ||
    type.includes('time') ||
    type.includes('timestamp')
  ) {
    return 'date'
  }
  if (type.includes('blob') || type.includes('binary')) {
    return 'binary'
  }
  return 'string'
}

/**
 * Transform DuckDB query result to QueryResult format
 */
export async function transformDuckDBResult(
  connection: AsyncDuckDBConnection,
  query: string,
  startTime: number
): Promise<QueryResult> {
  const result = await connection.query(query)
  const data = result.toArray()
  const schema = result.schema

  // Extract column metadata
  const columns = schema.fields.map(field => ({
    name: field.name,
    type: mapDuckDBTypeToQueryType(field.type.toString()),
    nullable: field.nullable,
  }))

  return {
    data,
    columns,
    executionTime: Date.now() - startTime,
  }
}

/**
 * Transform Error to SQLError format
 */
export function transformErrorToSQLError(error: unknown): SQLError {
  const message = error instanceof Error ? error.message : String(error)

  // Try to detect error type from message
  let type: SQLError['type'] = 'runtime'
  if (message.toLowerCase().includes('syntax')) {
    type = 'syntax'
  } else if (message.toLowerCase().includes('memory')) {
    type = 'memory'
  } else if (message.toLowerCase().includes('connection')) {
    type = 'connection'
  }

  return {
    type,
    message,
  }
}

/**
 * Options for exporting QueryResult data
 */
export interface QueryResultExportOptions {
  /** Array of column indices to include (if not provided, includes all columns) */
  selectedColumns?: number[]
  /** Array of row indices to include (if not provided, includes all rows) */
  selectedRows?: number[]
}

/**
 * Export QueryResult to CSV format
 *
 * Handles proper CSV formatting including:
 * - BigInt conversion to string
 * - String quoting and escaping
 * - NULL value handling
 * - Column/row selection
 */
export function exportQueryResultToCSV(
  result: QueryResult,
  options?: QueryResultExportOptions
): string {
  const { selectedColumns, selectedRows } = options || {}

  // Determine which columns to include
  const columnIndices = selectedColumns?.length
    ? selectedColumns.sort((a, b) => a - b)
    : result.columns.map((_, index) => index)

  // Determine which rows to include
  const rowIndices = selectedRows?.length
    ? selectedRows.sort((a, b) => a - b)
    : result.data.map((_, index) => index)

  // Build CSV header
  const headers = columnIndices.map(index => result.columns[index].name)

  // Build CSV rows
  const rows = rowIndices.map(rowIndex => {
    const row = result.data[rowIndex]
    if (!row) return []

    return columnIndices.map(colIndex => {
      const value = row[result.columns[colIndex].name]

      // Handle BigInt
      if (typeof value === 'bigint') {
        return value.toString()
      }

      // Quote and escape strings
      if (typeof value === 'string') {
        const escaped = value.replace(/"/g, '""')
        return `"${escaped}"`
      }

      // Handle null/undefined
      if (value === null || value === undefined) {
        return ''
      }

      return String(value)
    })
  })

  // Construct CSV content
  const headerRow = headers.join(',')
  const dataRows = rows.map(row => row.join(',')).join('\n')
  return headerRow + '\n' + dataRows
}

/**
 * Export QueryResult to JSON format
 *
 * Handles:
 * - BigInt conversion to string
 * - NULL value preservation
 * - Column/row selection
 * - Pretty printing with 2-space indentation
 */
export function exportQueryResultToJSON(
  result: QueryResult,
  options?: QueryResultExportOptions
): string {
  const { selectedColumns, selectedRows } = options || {}

  // Determine which columns to include
  const columnIndices = selectedColumns?.length
    ? selectedColumns.sort((a, b) => a - b)
    : result.columns.map((_, index) => index)

  // Determine which rows to include
  const rowIndices = selectedRows?.length
    ? selectedRows.sort((a, b) => a - b)
    : result.data.map((_, index) => index)

  // Build JSON array
  const jsonData = rowIndices.map(rowIndex => {
    const row = result.data[rowIndex]
    if (!row) return {}

    const obj: Record<string, unknown> = {}
    columnIndices.forEach(colIndex => {
      const colName = result.columns[colIndex].name
      obj[colName] = row[colName] ?? null
    })
    return obj
  })

  // Stringify with BigInt support
  return JSON.stringify(
    jsonData,
    (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
    2
  )
}

/**
 * Export QueryResult to CSV File
 *
 * Wraps exportQueryResultToCSV and returns a File object ready for download.
 */
export function exportQueryResultToCSVFile(
  result: QueryResult,
  filename: string,
  options?: QueryResultExportOptions
): File {
  const csvContent = exportQueryResultToCSV(result, options)
  return new File([csvContent], filename, { type: CSV_MIME_TYPE })
}

/**
 * Export QueryResult to JSON File
 *
 * Wraps exportQueryResultToJSON and returns a File object ready for download.
 */
export function exportQueryResultToJSONFile(
  result: QueryResult,
  filename: string,
  options?: QueryResultExportOptions
): File {
  const jsonContent = exportQueryResultToJSON(result, options)
  return new File([jsonContent], filename, { type: 'application/json' })
}
