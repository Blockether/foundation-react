/**
 * SQL Utilities
 *
 * This module provides utility functions for SQL query processing, validation,
 * formatting, and analysis. It includes functions for parsing SQL, extracting
 * metadata, and performing common SQL operations.
 */

// Import DuckDB types if available
type DuckDBConnection = unknown // Using unknown instead of any

/**
 * Validate SQL syntax
 */
export function validateSQLSyntax(query: string): {
  isValid: boolean
  error?: string
} {
  if (!query?.trim()) {
    return { isValid: false, error: 'Query cannot be empty' }
  }

  // Basic SQL syntax validation
  const trimmedQuery = query.trim()

  // Check for basic SQL structure
  const validStarts = [
    'SELECT',
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'DROP',
    'ALTER',
    'WITH',
    'SHOW',
    'DESCRIBE',
    'EXPLAIN',
    'TRUNCATE',
    'MERGE',
  ]

  const startsWithValid = validStarts.some(start =>
    trimmedQuery.toUpperCase().startsWith(start)
  )

  if (!startsWithValid) {
    return {
      isValid: false,
      error: 'Query must start with a valid SQL statement',
    }
  }

  // Check for balanced parentheses
  const openParens = (query.match(/\(/g) || []).length
  const closeParens = (query.match(/\)/g) || []).length

  if (openParens !== closeParens) {
    return { isValid: false, error: 'Unbalanced parentheses in query' }
  }

  // Check for balanced quotes
  const singleQuotes = (query.match(/'/g) || []).length
  const doubleQuotes = (query.match(/"/g) || []).length

  if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
    return { isValid: false, error: 'Unbalanced quotes in query' }
  }

  return { isValid: true }
}

/**
 * Validate SQL query (alias for consistency)
 */
export const validateSQL = validateSQLSyntax

/**
 * Extract SQL keywords from a query
 */
export function extractSQLKeywords(query: string): string[] {
  if (!query?.trim()) return []

  // Common SQL keywords
  const sqlKeywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'DROP',
    'ALTER',
    'TABLE',
    'INDEX',
    'VIEW',
    'DATABASE',
    'SCHEMA',
    'PRIMARY',
    'KEY',
    'FOREIGN',
    'REFERENCES',
    'NOT',
    'NULL',
    'UNIQUE',
    'CHECK',
    'DEFAULT',
    'AUTO_INCREMENT',
    'INNER',
    'OUTER',
    'LEFT',
    'RIGHT',
    'FULL',
    'JOIN',
    'ON',
    'USING',
    'GROUP',
    'BY',
    'HAVING',
    'ORDER',
    'ASC',
    'DESC',
    'LIMIT',
    'OFFSET',
    'UNION',
    'ALL',
    'DISTINCT',
    'COUNT',
    'SUM',
    'AVG',
    'MIN',
    'MAX',
    'AND',
    'OR',
    'NOT',
    'IN',
    'EXISTS',
    'BETWEEN',
    'LIKE',
    'ILIKE',
    'IS',
    'NULL',
    'TRUE',
    'FALSE',
    'CASE',
    'WHEN',
    'THEN',
    'ELSE',
    'END',
    'AS',
    'CAST',
    'CONVERT',
    'IF',
    'COALESCE',
  ]

  const words = query.toUpperCase().split(/\s+/)
  return words.filter(word => sqlKeywords.includes(word))
}

/**
 * Detect SQL dialect from query
 */
export function detectSQLDialect(query: string): string {
  if (!query?.trim()) return 'generic'

  const upperQuery = query.toUpperCase()

  // DuckDB specific features
  if (
    upperQuery.includes('PARQUET') ||
    upperQuery.includes('CSV') ||
    upperQuery.includes('LIST')
  ) {
    return 'duckdb'
  }

  // PostgreSQL specific features
  if (
    upperQuery.includes('SERIAL') ||
    upperQuery.includes('BIGSERIAL') ||
    upperQuery.includes('JSONB') ||
    upperQuery.includes('ARRAY[')
  ) {
    return 'postgresql'
  }

  // MySQL specific features
  if (
    upperQuery.includes('AUTO_INCREMENT') ||
    upperQuery.includes('ENUM') ||
    upperQuery.includes('TINYINT') ||
    upperQuery.includes('TEXT(')
  ) {
    return 'mysql'
  }

  // SQLite specific features
  if (
    upperQuery.includes('AUTOINCREMENT') ||
    upperQuery.includes('INTEGER PRIMARY KEY')
  ) {
    return 'sqlite'
  }

  // BigQuery specific features
  if (
    upperQuery.includes('ARRAY') ||
    upperQuery.includes('STRUCT') ||
    upperQuery.includes('TIMESTAMP_TRUNC')
  ) {
    return 'bigquery'
  }

  return 'generic'
}

/**
 * Format SQL query with basic indentation
 */
export function formatSQL(
  query: string,
  options: {
    indent?: string
    uppercase?: boolean
    commaPosition?: 'before' | 'after'
  } = {}
): string {
  if (!query?.trim()) return query

  const { indent = '  ', uppercase = true, commaPosition = 'after' } = options

  let formatted = query.trim()

  // Convert keywords to uppercase if requested
  if (uppercase) {
    const keywords = [
      'SELECT',
      'FROM',
      'WHERE',
      'INSERT',
      'UPDATE',
      'DELETE',
      'CREATE',
      'DROP',
      'ALTER',
      'TABLE',
      'INDEX',
      'VIEW',
      'DATABASE',
      'SCHEMA',
      'PRIMARY',
      'KEY',
      'FOREIGN',
      'REFERENCES',
      'NOT',
      'NULL',
      'UNIQUE',
      'CHECK',
      'DEFAULT',
      'AUTO_INCREMENT',
      'INNER',
      'OUTER',
      'LEFT',
      'RIGHT',
      'FULL',
      'JOIN',
      'ON',
      'USING',
      'GROUP',
      'BY',
      'HAVING',
      'ORDER',
      'ASC',
      'DESC',
      'LIMIT',
      'OFFSET',
      'UNION',
      'ALL',
      'DISTINCT',
      'COUNT',
      'SUM',
      'AVG',
      'MIN',
      'MAX',
      'AND',
      'OR',
      'NOT',
      'IN',
      'EXISTS',
      'BETWEEN',
      'LIKE',
      'ILIKE',
      'IS',
      'NULL',
      'TRUE',
      'FALSE',
      'CASE',
      'WHEN',
      'THEN',
      'ELSE',
      'END',
      'AS',
      'CAST',
      'CONVERT',
      'IF',
      'COALESCE',
    ]

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, keyword)
    })
  }

  // Basic formatting rules
  formatted = formatted
    // Add newlines after major keywords
    .replace(
      /\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET)\b/gi,
      '\n$1'
    )
    // Add newlines after JOIN keywords
    .replace(/\b(INNER|LEFT|RIGHT|FULL) JOIN\b/gi, '\n$1 JOIN')
    // Add newlines after UNION
    .replace(/\bUNION\b/gi, '\nUNION')
    // Handle commas
    .replace(/,/g, commaPosition === 'before' ? '\n,' : ',\n')
    // Clean up extra whitespace and newlines
    .replace(/\n\s*\n/g, '\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '')
    .trim()

  // Add proper indentation
  const lines = formatted.split('\n')
  let indentLevel = 0
  const result: string[] = []

  lines.forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine) return

    // Decrease indent for certain keywords
    if (
      /^(FROM|WHERE|GROUP BY|ORDER BY|HAVING|LIMIT|OFFSET)$/i.test(trimmedLine)
    ) {
      indentLevel = Math.max(0, indentLevel - 1)
    }

    result.push(indent.repeat(indentLevel) + trimmedLine)

    // Increase indent for certain keywords
    if (
      /^(FROM|WHERE|GROUP BY|ORDER BY|HAVING|CASE|WHEN|THEN|ELSE)$/i.test(
        trimmedLine
      )
    ) {
      indentLevel++
    }

    // Decrease indent after END
    if (/^END$/i.test(trimmedLine)) {
      indentLevel = Math.max(0, indentLevel - 1)
    }
  })

  return result.join('\n')
}

/**
 * Extract table names from SQL query
 */
export function extractTableNames(query: string): string[] {
  if (!query?.trim()) return []

  const tables: string[] = []
  const upperQuery = query.toUpperCase()

  // Extract FROM clause tables
  const fromMatch = upperQuery.match(/FROM\s+([^;\s]+)/)
  if (fromMatch) {
    const tableNames = fromMatch[1]
      .split(',')
      .map(t => t.trim().replace(/[`\"\[\]]/g, ''))
    tables.push(...tableNames)
  }

  // Extract JOIN clause tables
  const joinMatches = upperQuery.match(
    /(?:INNER|LEFT|RIGHT|FULL)\s+JOIN\s+([^;\s]+)/gi
  )
  if (joinMatches) {
    joinMatches.forEach(match => {
      const tableMatch = match.match(/JOIN\s+([^;\s]+)/i)
      if (tableMatch) {
        const tableName = tableMatch[1].trim().replace(/[`\"\[\]]/g, '')
        tables.push(tableName)
      }
    })
  }

  // Extract INSERT INTO tables
  const insertMatch = upperQuery.match(/INSERT\s+INTO\s+([^;\s(]+)/)
  if (insertMatch) {
    const tableName = insertMatch[1].trim().replace(/[`\"\[\]]/g, '')
    tables.push(tableName)
  }

  // Extract UPDATE tables
  const updateMatch = upperQuery.match(/UPDATE\s+([^;\s]+)/)
  if (updateMatch) {
    const tableName = updateMatch[1].trim().replace(/[`\"\[\]]/g, '')
    tables.push(tableName)
  }

  // Extract CREATE TABLE tables
  const createMatch = upperQuery.match(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([^;\s(]+)/
  )
  if (createMatch) {
    const tableName = createMatch[1].trim().replace(/[`\"\[\]]/g, '')
    tables.push(tableName)
  }

  return [...new Set(tables)] // Remove duplicates
}

/**
 * Execute SQL query with DuckDB
 */
export async function executeDuckDBQuery(
  connection: DuckDBConnection | null,
  query: string
): Promise<{
  data: Record<string, unknown>[]
  columns: { name: string; type: string }[]
  executionTime: number
}> {
  if (!connection) {
    throw new Error('DuckDB connection is not available')
  }

  if (!query?.trim()) {
    throw new Error('Query cannot be empty')
  }

  const startTime = performance.now()

  try {
    // This is a mock implementation since we don't have DuckDB WASM fully set up
    // In a real implementation, you would use the DuckDB connection to execute the query
    await new Promise(resolve => setTimeout(resolve, 10)) // Simulate query execution

    const endTime = performance.now()
    const executionTime = Math.round(endTime - startTime)

    // Mock result for demonstration
    const mockData: Record<string, unknown>[] = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ]

    const mockColumns = [
      { name: 'id', type: 'INTEGER' },
      { name: 'name', type: 'VARCHAR' },
      { name: 'email', type: 'VARCHAR' },
    ]

    return {
      data: mockData,
      columns: mockColumns,
      executionTime,
    }
  } catch (error) {
    const endTime = performance.now()
    const executionTime = Math.round(endTime - startTime)

    // Re-throw with execution time
    const enhancedError = new Error(
      error instanceof Error ? error.message : 'Unknown error occurred'
    )
    const errorRecord = enhancedError as unknown as Record<string, unknown>
    errorRecord.executionTime = executionTime
    throw errorRecord
  }
}

/**
 * Parse CSV data and convert to SQL INSERT statements
 */
export function csvToSQLInsert(
  csvData: string,
  tableName: string,
  options: {
    delimiter?: string
    hasHeaders?: boolean
    batchSize?: number
  } = {}
): string[] {
  const { delimiter = ',', hasHeaders = true, batchSize = 1000 } = options

  if (!csvData?.trim()) {
    throw new Error('CSV data cannot be empty')
  }

  if (!tableName?.trim()) {
    throw new Error('Table name cannot be empty')
  }

  const lines = csvData.trim().split('\n')
  const headers = hasHeaders ? lines.shift()?.split(delimiter) : []

  if (!headers || headers.length === 0) {
    throw new Error('No columns found in CSV data')
  }

  const cleanHeaders = headers.map(h => h.trim().replace(/[`\"\[\]]/g, ''))
  const insertStatements: string[] = []

  let currentBatch: string[] = []

  for (let i = hasHeaders ? 1 : 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = line.split(delimiter).map(v => {
      const cleaned = v.trim()
      // Try to detect if it's a number
      if (/^\d+$/.test(cleaned)) {
        return cleaned
      }
      // Escape quotes and wrap in single quotes
      return `'${cleaned.replace(/'/g, "''")}'`
    })

    currentBatch.push(`(${values.join(', ')})`)

    // Create batch insert statement when batch size is reached
    if (currentBatch.length >= batchSize) {
      const insertStatement = `INSERT INTO ${tableName} (${cleanHeaders.join(', ')}) VALUES\n${currentBatch.join(',\n')};`
      insertStatements.push(insertStatement)
      currentBatch = []
    }
  }

  // Add remaining records
  if (currentBatch.length > 0) {
    const insertStatement = `INSERT INTO ${tableName} (${cleanHeaders.join(', ')}) VALUES\n${currentBatch.join(',\n')};`
    insertStatements.push(insertStatement)
  }

  return insertStatements
}

/**
 * Generate SQL query based on natural language input (basic implementation)
 */
export function naturalLanguageToSQL(
  input: string,
  context?: {
    availableTables?: string[]
    availableColumns?: Record<string, string[]>
  }
): string {
  if (!input?.trim()) {
    throw new Error('Input cannot be empty')
  }

  const lowerInput = input.toLowerCase().trim()

  // Basic pattern matching for common queries
  if (
    lowerInput.includes('show') ||
    lowerInput.includes('get') ||
    lowerInput.includes('list')
  ) {
    if (lowerInput.includes('all')) {
      if (context?.availableTables?.[0]) {
        return `SELECT * FROM ${context.availableTables[0]};`
      }
      return 'SELECT * FROM table_name;'
    }

    if (lowerInput.includes('users')) {
      return 'SELECT * FROM users;'
    }

    if (lowerInput.includes('count')) {
      if (context?.availableTables?.[0]) {
        return `SELECT COUNT(*) FROM ${context.availableTables[0]};`
      }
      return 'SELECT COUNT(*) FROM table_name;'
    }
  }

  if (lowerInput.includes('create') && lowerInput.includes('table')) {
    return `CREATE TABLE table_name (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
  }

  // Default fallback
  return '-- Unable to parse natural language query. Please write SQL directly.'
}

/**
 * Calculate query complexity score
 */
export function calculateQueryComplexity(query: string): {
  score: number
  level: 'simple' | 'moderate' | 'complex'
  factors: string[]
} {
  if (!query?.trim()) {
    return { score: 0, level: 'simple', factors: [] }
  }

  const upperQuery = query.toUpperCase()
  const factors: string[] = []
  let score = 0

  // Joins increase complexity
  const joinCount = (upperQuery.match(/JOIN/g) || []).length
  if (joinCount > 0) {
    score += joinCount * 10
    factors.push(`${joinCount} JOIN${joinCount > 1 ? 's' : ''}`)
  }

  // Subqueries increase complexity
  const subqueryCount = (upperQuery.match(/\(SELECT/gi) || []).length
  if (subqueryCount > 0) {
    score += subqueryCount * 15
    factors.push(`${subqueryCount} subquer${subqueryCount > 1 ? 'ies' : 'y'}`)
  }

  // Aggregations increase complexity
  const aggCount = (upperQuery.match(/\b(COUNT|SUM|AVG|MIN|MAX)\b/g) || [])
    .length
  if (aggCount > 0) {
    score += aggCount * 5
    factors.push(`${aggCount} aggregation${aggCount > 1 ? 's' : ''}`)
  }

  // GROUP BY increases complexity
  if (upperQuery.includes('GROUP BY')) {
    score += 8
    factors.push('GROUP BY')
  }

  // Window functions increase complexity
  if (
    upperQuery.includes('OVER(') ||
    upperQuery.includes('ROW_NUMBER') ||
    upperQuery.includes('RANK')
  ) {
    score += 20
    factors.push('window functions')
  }

  // CTEs increase complexity
  if (upperQuery.includes('WITH')) {
    score += 12
    factors.push('CTE')
  }

  // Complex WHERE conditions
  const whereAndCount = (upperQuery.match(/WHERE.*AND.*AND/gi) || []).length
  if (whereAndCount > 0) {
    score += whereAndCount * 3
    factors.push('complex WHERE')
  }

  // Determine complexity level
  let level: 'simple' | 'moderate' | 'complex' = 'simple'
  if (score >= 30) {
    level = 'complex'
  } else if (score >= 10) {
    level = 'moderate'
  }

  return { score, level, factors }
}