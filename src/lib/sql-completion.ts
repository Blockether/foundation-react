/**
 * DuckDB SQL Completion Provider
 *
 * Provides intelligent SQL autocompletion for DuckDB with support for:
 * - DuckDB-specific functions and keywords
 * - Real table and column completion from data source schemas
 * - Context-aware suggestions based on FROM/JOIN clauses
 * - Qualified column completion (table.column notation)
 * - Function signatures and parameter hints
 * - Smart table detection with schema information
 */

import { DataSource } from '@/types/sql'

export interface CompletionContext {
  /** Current data sources available for completion */
  dataSources: DataSource[]
  /** Current query text for context analysis */
  query: string
  /** Current cursor position */
  position: number
  /** Database connection for dynamic schema inspection */
  connection?: any
}

/**
 * DuckDB-specific SQL keywords and functions
 */
const DUCKDB_KEYWORDS = [
  // Standard SQL keywords
  'SELECT',
  'DESCRIBE',
  'INSERT INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  'CREATE TABLE',
  'FROM',
  'WHERE',
  'GROUP BY',
  'HAVING',
  'ORDER BY',
  'LIMIT',
  'OFFSET',
  'INSERT',
  'UPDATE',
  'DELETE',
  'CREATE',
  'DROP',
  'ALTER',
  'TRUNCATE',
  'JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'FULL OUTER JOIN',
  'CROSS JOIN',
  'UNION',
  'UNION ALL',
  'INTERSECT',
  'EXCEPT',
  'WITH',
  'AS',
  'ON',
  'USING',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'AND',
  'OR',
  'NOT',
  'IN',
  'EXISTS',
  'BETWEEN',
  'LIKE',
  'ILIKE',
  'IS',
  'IS NULL',
  'DISTINCT',
  'ALL',
  'ANY',
  'SOME',
  'CAST',
  'EXTRACT',
  'NULLIF',
  'COALESCE',

  // DuckDB-specific keywords
  'PIVOT',
  'UNPIVOT',
  'QUALIFY',
  'EXCLUDE',
  'REPLACE',
  'ASOF',
  'INTERPOLATE',
  'ANTI',
  'SEMI',
  'POSITIONAL',
  'FIRST',
  'LAST',
  'ARBITRARY',
]

const DUCKDB_AGGREGATE_FUNCTIONS = [
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'STDDEV',
  'STDDEV_SAMP',
  'STDDEV_POP',
  'VARIANCE',
  'VAR_SAMP',
  'VAR_POP',
  'BIT_AND',
  'BIT_OR',
  'BIT_XOR',
  'BOOL_AND',
  'BOOL_OR',
  'ARG_MAX',
  'ARG_MIN',
  'MODE',
  'MEDIAN',
  'STRING_AGG',
  'LIST',
  'ARRAY_AGG',
  'HISTOGRAM',
]

const DUCKDB_WINDOW_FUNCTIONS = [
  'ROW_NUMBER',
  'RANK',
  'DENSE_RANK',
  'NTILE',
  'LAG',
  'LEAD',
  'FIRST_VALUE',
  'LAST_VALUE',
  'NTH_VALUE',
  'PERCENT_RANK',
  'CUME_DIST',
]

const DUCKDB_STRING_FUNCTIONS = [
  'LOWER',
  'UPPER',
  'LENGTH',
  'CHAR_LENGTH',
  'OCTET_LENGTH',
  'LTRIM',
  'RTRIM',
  'TRIM',
  'SUBSTRING',
  'SUBSTR',
  'LEFT',
  'RIGHT',
  'LPAD',
  'RPAD',
  'REPEAT',
  'REPLACE',
  'REGEXP_REPLACE',
  'REGEXP_MATCHES',
  'REGEXP_EXTRACT',
  'CONTAINS',
  'STARTS_WITH',
  'ENDS_WITH',
  'INSTR',
  'POSITION',
  'STRPOS',
  'CONCAT',
  'CONCAT_WS',
  'REVERSE',
  'REGEXP_SPLIT_TO_ARRAY',
  'SPLIT_PART',
  'TO_HEX',
  'FROM_HEX',
  'ENCODE',
  'DECODE',
  'HASH',
  'MD5',
  'SHA256',
]

const DUCKDB_NUMERIC_FUNCTIONS = [
  'ABS',
  'CEIL',
  'FLOOR',
  'ROUND',
  'SQRT',
  'CBRT',
  'POWER',
  'EXP',
  'LOG',
  'LOG10',
  'LOG2',
  'LN',
  'SIN',
  'COS',
  'TAN',
  'ASIN',
  'ACOS',
  'ATAN',
  'ATAN2',
  'DEGREES',
  'RADIANS',
  'PI',
  'RANDOM',
  'FACTORIAL',
  'GCD',
  'LCM',
  'SIGN',
  'MOD',
  'CEILING',
]

const DUCKDB_DATE_FUNCTIONS = [
  'CURRENT_DATE',
  'CURRENT_TIME',
  'CURRENT_TIMESTAMP',
  'NOW',
  'TODAY',
  'YESTERDAY',
  'EXTRACT',
  'DATE_PART',
  'DATE_TRUNC',
  'DATE_ADD',
  'DATE_SUB',
  'DATEDIFF',
  'AGE',
  'MAKEDATE',
  'MAKETIME',
  'YEAR',
  'MONTH',
  'DAY',
  'HOUR',
  'MINUTE',
  'SECOND',
  'STRFTIME',
  'STRPTIME',
  'TO_DAYS',
  'FROM_DAYS',
  'WEEK',
  'WEEKDAY',
  'DAYOFWEEK',
  'DAYOFMONTH',
  'DAYOFYEAR',
  'QUARTER',
]

const DUCKDB_ARRAY_FUNCTIONS = [
  'ARRAY_CREATE',
  'ARRAY_VALUE',
  'LIST_VALUE',
  'ARRAY_SLICE',
  'ARRAY_EXTRACT',
  'ARRAY_ELEMENT',
  'ARRAY_LENGTH',
  'ARRAY_CONSTRUCT',
  'ARRAY_CAT',
  'ARRAY_AGG',
  'ARRAY_UNIQUE',
  'ARRAY_SORT',
  'ARRAY_CONTAINS',
  'ARRAY_POSITION',
  'ARRAY_DISTINCT',
  'UNNEST',
  'FLATTEN',
]

const DUCKDB_JSON_FUNCTIONS = [
  'JSON_CREATE',
  'JSON_EXTRACT_PATH_TEXT',
  'JSON_EXTRACT_PATH_JSON',
  'JSON_STRUCTURE',
  'JSON_TYPE',
  'JSON_KEYS',
  'JSON_ARRAY_LENGTH',
  'JSON_CONTAINS_PATH',
  'JSON_VALID',
]

const DUCKDB_FILE_FUNCTIONS = [
  'READ_CSV',
  'READ_PARQUET',
  'READ_JSON',
  'READ_JSONL',
  'GLOB',
  'FILE_SIZE',
  'FILE_MTIME',
  'FILE_EXISTS',
  'COPY',
  'EXPORT',
]

/**
 * Function signatures for parameter hints
 */
const FUNCTION_SIGNATURES: Record<string, string> = {
  COUNT: 'COUNT(*) | COUNT(expression) | COUNT(DISTINCT expression)',
  SUM: 'SUM(expression)',
  AVG: 'AVG(expression)',
  MIN: 'MIN(expression)',
  MAX: 'MAX(expression)',
  SUBSTRING:
    'SUBSTRING(string, start, length) | SUBSTRING(string FROM start [FOR length])',
  EXTRACT: 'EXTRACT(field FROM source)',
  DATE_PART: 'DATE_PART(field, source)',
  DATE_TRUNC: 'DATE_TRUNC(unit, source)',
  DATE_ADD: 'DATE_ADD(unit, interval, source)',
  DATEDIFF: 'DATEDIFF(unit, start, end)',
  REGEXP_REPLACE: 'REGEXP_REPLACE(string, pattern, replacement, flags)',
  REGEXP_EXTRACT: 'REGEXP_EXTRACT(string, pattern, index)',
  ARRAY_EXTRACT: 'ARRAY_EXTRACT(array, index)',
  JSON_EXTRACT_PATH_TEXT: 'JSON_EXTRACT_PATH_TEXT(json_string, path...)',
  READ_CSV: 'READ_CSV(filename, [auto_detect, headers, ...])',
  READ_PARQUET: 'READ_PARQUET(filename, [binary_as_string, ...])',
  COALESCE: 'COALESCE(value1, value2, ...)',
  NULLIF: 'NULLIF(expression1, expression2)',
  CAST: 'CAST(expression AS type)',
  ROUND: 'ROUND(value, [digits])',
  POWER: 'POWER(base, exponent)',
  MOD: 'MOD(dividend, divisor)',
  GLOB: 'GLOB(pattern)',
}

/**
 * Create DuckDB completion provider for Monaco Editor
 */
export function createDuckDBCompletionProvider(
  context: CompletionContext
): any {
  console.log('🚀 Creating DuckDB completion provider with context:', {
    dataSourcesCount: context.dataSources.length,
    dataSources: context.dataSources.map(ds => ({
      name: ds.name,
      type: ds.type,
    })),
    hasConnection: !!context.connection,
  })

  // Store Monaco instance globally for completion provider access
  const monaco = (window as any).monaco
  if (!monaco) {
    console.warn('⚠️ Monaco not available on window during provider creation')
  }

  return {
    provideCompletionItems: async (model: any, position: any) => {
      console.log('🔍 Providing completions at position:', {
        line: position.lineNumber,
        column: position.column,
      })

      const word = model.getWordUntilPosition(position)
      console.log('📝 Current word:', word)

      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      // Get Monaco instance from multiple sources
      let currentMonaco = (window as any).monaco || monaco

      if (!currentMonaco) {
        console.error('❌ No Monaco instance available for completion')
        return { suggestions: [] }
      }

      console.log('✅ Monaco instance found:', !!currentMonaco)

      const suggestions: any[] = []

      // Get context around current position
      const textBeforeCursor = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      })

      console.log('📊 Text before cursor:', textBeforeCursor)
      console.log('📊 Line content:', model.getLineContent(position.lineNumber))

      // Check specific patterns for table completion
      const currentLine = model.getLineContent(position.lineNumber)
      const textBeforeCursorInLine = currentLine.substring(
        0,
        position.column - 1
      )
      const fromMatch = textBeforeCursorInLine.match(/\bFROM\s+$/i)
      const describeMatch = textBeforeCursorInLine.match(/\bDESCRIBE\s+$/i)
      const fromPartialMatch = textBeforeCursorInLine.match(/\bFROM\s+(\w*)$/i)
      const describePartialMatch =
        textBeforeCursorInLine.match(/\bDESCRIBE\s+(\w*)$/i)

      console.log('🎯 Table completion patterns:')
      console.log('  - FROM exact match:', !!fromMatch)
      console.log('  - DESCRIBE exact match:', !!describeMatch)
      console.log('  - FROM partial match:', fromPartialMatch)
      console.log('  - DESCRIBE partial match:', describePartialMatch)

      // Add keyword suggestions
      const keywordSuggestions = getKeywordSuggestions(
        range,
        textBeforeCursor,
        currentMonaco
      )
      console.log('🔤 Keyword suggestions:', keywordSuggestions.length)
      suggestions.push(...keywordSuggestions)

      // Add function suggestions
      const functionSuggestions = getFunctionSuggestions(
        range,
        textBeforeCursor,
        currentMonaco
      )
      console.log('⚡ Function suggestions:', functionSuggestions.length)
      suggestions.push(...functionSuggestions)

      // Add table suggestions from data sources
      const tableSuggestions = getTableSuggestions(
        range,
        textBeforeCursor,
        context.dataSources,
        currentMonaco
      )
      console.log('📋 Table suggestions:', tableSuggestions.length)
      suggestions.push(...tableSuggestions)

      // Add column suggestions if we're in a context where columns make sense
      const tableContext = getTableContext(
        textBeforeCursor,
        context.dataSources
      )
      console.log('🏗️ Table context:', tableContext)

      // Check if we're dealing with qualified column names (table.column)
      const qualifiedColumnMatch = textBeforeCursor.match(
        /([a-zA-Z_][a-zA-Z0-9_]*)\.$/
      )
      if (qualifiedColumnMatch) {
        console.log('🔎 Qualified column match:', qualifiedColumnMatch[1])
        const tableName = qualifiedColumnMatch[1]
        const dataSource = context.dataSources.find(
          ds => ds.tableName === tableName
        )
        if (dataSource?.schema) {
          const qualifiedColumnSuggestions = getQualifiedColumnSuggestions(
            { ...range, startColumn: range.endColumn }, // Start after the dot
            dataSource,
            currentMonaco
          )
          console.log(
            '🔎 Qualified column suggestions:',
            qualifiedColumnSuggestions.length
          )
          suggestions.push(...qualifiedColumnSuggestions)
        }
      } else if (tableContext.length > 0 || context.dataSources.length > 0) {
        const columnSuggestions = getColumnSuggestions(
          range,
          textBeforeCursor,
          tableContext,
          context.dataSources,
          currentMonaco
        )
        console.log('📊 Column suggestions:', columnSuggestions.length)
        suggestions.push(...columnSuggestions)
      }

      console.log('📈 Total suggestions generated:', suggestions.length)
      console.log(
        '💡 Sample suggestions:',
        suggestions.slice(0, 3).map(s => s.label)
      )

      return { suggestions }
    },

    provideDocumentation: (model: any, position: any) => {
      const word = model.getWordAtPosition(position)
      if (word && FUNCTION_SIGNATURES[word.word]) {
        return {
          value: `**${word.word}**\n\n\`\`\`sql\n${FUNCTION_SIGNATURES[word.word]}\n\`\`\`\n\n${getFunctionDescription(word.word)}`,
        }
      }
      return undefined
    },

    resolveCompletionItem: async (item: any) => {
      const currentMonaco = (window as any).monaco || monaco
      if (!currentMonaco) return item

      // Add detailed documentation if this is a function
      if (
        item.kind === currentMonaco.languages.CompletionItemKind.Function &&
        item.insertText
      ) {
        const functionName = item.insertText as string
        if (FUNCTION_SIGNATURES[functionName]) {
          item.documentation = FUNCTION_SIGNATURES[functionName]
          item.insertText = getInsertTextForFunction(functionName)
        }
      }
      return item
    },
  }
}

/**
 * Get keyword suggestions based on context
 */
function getKeywordSuggestions(
  range: any,
  _textBeforeCursor: string,
  monaco: any
): any[] {
  const suggestions: any[] = []

  for (const keyword of DUCKDB_KEYWORDS) {
    suggestions.push({
      label: keyword,
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: keyword,
      range,
      sortText: `a_${keyword}`,
      documentation: `SQL keyword: ${keyword}`,
    })
  }

  return suggestions
}

/**
 * Get function suggestions
 */
function getFunctionSuggestions(
  range: any,
  _textBeforeCursor: string,
  monaco: any
): any[] {
  const suggestions: any[] = []
  const allFunctions = [
    ...DUCKDB_AGGREGATE_FUNCTIONS.map(fn => ({
      name: fn,
      type: 'aggregate',
      kind: monaco.languages.CompletionItemKind.Function,
    })),
    ...DUCKDB_WINDOW_FUNCTIONS.map(fn => ({
      name: fn,
      type: 'window',
      kind: monaco.languages.CompletionItemKind.Function,
    })),
    ...DUCKDB_STRING_FUNCTIONS.map(fn => ({
      name: fn,
      type: 'string',
      kind: monaco.languages.CompletionItemKind.Function,
    })),
    ...DUCKDB_NUMERIC_FUNCTIONS.map(fn => ({
      name: fn,
      type: 'numeric',
      kind: monaco.languages.CompletionItemKind.Function,
    })),
    ...DUCKDB_DATE_FUNCTIONS.map(fn => ({
      name: fn,
      type: 'date',
      kind: monaco.languages.CompletionItemKind.Function,
    })),
    ...DUCKDB_ARRAY_FUNCTIONS.map(fn => ({
      name: fn,
      type: 'array',
      kind: monaco.languages.CompletionItemKind.Function,
    })),
    ...DUCKDB_JSON_FUNCTIONS.map(fn => ({
      name: fn,
      type: 'json',
      kind: monaco.languages.CompletionItemKind.Function,
    })),
    ...DUCKDB_FILE_FUNCTIONS.map(fn => ({
      name: fn,
      type: 'file',
      kind: monaco.languages.CompletionItemKind.Function,
    })),
  ]

  for (const func of allFunctions) {
    suggestions.push({
      label: func.name,
      kind: func.kind,
      insertText: func.name,
      range,
      sortText: `b_${func.name}`,
      documentation: `${func.type} function: ${func.name}`,
    })
  }

  return suggestions
}

/**
 * Get table suggestions from data sources
 */
function getTableSuggestions(
  range: any,
  _textBeforeCursor: string,
  dataSources: DataSource[],
  monaco: any
): any[] {
  const suggestions: any[] = []

  for (const dataSource of dataSources) {
    // Build detailed documentation with schema information
    let documentation = `${dataSource.type === 'file' ? 'Imported file' : 'Table'}: ${dataSource.name}`

    if (dataSource.schema && dataSource.schema.length > 0) {
      documentation += '\n\n**Schema:**\n'
      for (const column of dataSource.schema.slice(0, 10)) {
        // Limit to first 10 columns
        documentation += `• \`${column.name}\` (${column.type})\n`
      }
      if (dataSource.schema.length > 10) {
        documentation += `... and ${dataSource.schema.length - 10} more columns`
      }
    }

    suggestions.push({
      label: dataSource.tableName,
      kind: monaco.languages.CompletionItemKind.Class,
      insertText: dataSource.tableName,
      range,
      sortText: `c_${dataSource.tableName}`,
      documentation,
      detail: `${dataSource.schema?.length || 0} columns`,
    })
  }

  return suggestions
}

/**
 * Get table context for column completion
 */
function getTableContext(
  textBeforeCursor: string,
  dataSources: DataSource[]
): string[] {
  const tableNames: string[] = []

  // Enhanced patterns to capture table names with optional aliases
  // FROM table_name [AS alias]
  // JOIN table_name [AS alias]
  // INTO table_name
  // UPDATE table_name
  const tablePatterns = [
    /\b(FROM|JOIN|INTO|UPDATE)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:AS\s+([a-zA-Z_][a-zA-Z0-9_]*))?\s*(?:$|\s+|,|\))/gi,
    /\b(FROM|JOIN|INTO|UPDATE)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*([a-zA-Z_][a-zA-Z0-9_]*)?\s*(?:$|\s+|,|\))/gi,
  ]

  for (const pattern of tablePatterns) {
    let match
    // Reset regex lastIndex for each pattern
    pattern.lastIndex = 0

    while ((match = pattern.exec(textBeforeCursor)) !== null) {
      const tableName = match[2]
      if (dataSources.some(ds => ds.tableName === tableName)) {
        tableNames.push(tableName)
      }
    }
  }

  // Also handle subqueries and CTEs (more complex cases)
  // Look for WITH clause table definitions
  const withPattern = /\bWITH\s+([a-zA-Z_][a-zA-Z0-9_]*)\s+AS\s*\(/gi
  let withMatch
  while ((withMatch = withPattern.exec(textBeforeCursor)) !== null) {
    // CTE tables are also available for column completion
    const cteName = withMatch[1]
    tableNames.push(cteName)
  }

  return tableNames
}

/**
 * Get column suggestions for the current context
 */
function getColumnSuggestions(
  range: any,
  _textBeforeCursor: string,
  tableNames: string[],
  dataSources: DataSource[],
  monaco: any
): any[] {
  const suggestions: any[] = []
  const columnNames = new Set<string>()

  // Collect columns from the specified tables
  for (const tableName of tableNames) {
    const dataSource = dataSources.find(ds => ds.tableName === tableName)
    if (dataSource?.schema) {
      for (const column of dataSource.schema) {
        if (!columnNames.has(column.name)) {
          columnNames.add(column.name)
          suggestions.push({
            label: column.name,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: column.name,
            range,
            sortText: `d_${column.name}`,
            documentation: `Column from \`${tableName}\`: ${column.name} (${column.type})${column.nullable ? ', nullable' : ''}`,
            detail: `${column.type}${column.nullable ? ' (nullable)' : ''}`,
          })
        }
      }
    }
  }

  // If no table context found, provide columns from all available data sources
  if (tableNames.length === 0) {
    for (const dataSource of dataSources) {
      if (dataSource.schema) {
        for (const column of dataSource.schema) {
          if (!columnNames.has(column.name)) {
            columnNames.add(column.name)
            suggestions.push({
              label: column.name,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: column.name,
              range,
              sortText: `d_${column.name}`,
              documentation: `Column from \`${dataSource.tableName}\`: ${column.name} (${column.type})${column.nullable ? ', nullable' : ''}`,
              detail: `${column.type}${column.nullable ? ' (nullable)' : ''} · ${dataSource.tableName}`,
            })
          }
        }
      }
    }
  }

  // Sort suggestions alphabetically for better UX
  suggestions.sort((a, b) => a.label.localeCompare(b.label))

  return suggestions
}

/**
 * Get column suggestions for qualified column names (table.column)
 */
function getQualifiedColumnSuggestions(
  range: any,
  dataSource: DataSource,
  monaco: any
): any[] {
  const suggestions: any[] = []

  if (!dataSource.schema) return suggestions

  for (const column of dataSource.schema) {
    suggestions.push({
      label: column.name,
      kind: monaco.languages.CompletionItemKind.Field,
      insertText: column.name,
      range,
      sortText: `a_${column.name}`, // Prioritize qualified columns
      documentation: `${dataSource.tableName}.${column.name} (${column.type})${column.nullable ? ', nullable' : ''}`,
      detail: `${column.type}${column.nullable ? ' (nullable)' : ''}`,
    })
  }

  // Sort suggestions alphabetically
  suggestions.sort((a, b) => a.label.localeCompare(b.label))

  return suggestions
}

/**
 * Get insert text for function with parameter placeholders
 */
function getInsertTextForFunction(functionName: string): string {
  switch (functionName) {
    case 'COUNT':
      return 'COUNT($1)'
    case 'SUBSTRING':
      return 'SUBSTRING($1, $2, $3)'
    case 'EXTRACT':
      return 'EXTRACT($1 FROM $2)'
    case 'DATE_TRUNC':
      return 'DATE_TRUNC($1, $2)'
    case 'COALESCE':
      return 'COALESCE($1, $2, ...)'
    case 'NULLIF':
      return 'NULLIF($1, $2)'
    case 'CAST':
      return 'CAST($1 AS $2)'
    case 'ROUND':
      return 'ROUND($1, $2)'
    case 'POWER':
      return 'POWER($1, $2)'
    case 'MOD':
      return 'MOD($1, $2)'
    default:
      return `${functionName}($1)`
  }
}

/**
 * Get function description
 */
function getFunctionDescription(functionName: string): string {
  const descriptions: Record<string, string> = {
    COUNT: 'Counts the number of rows or non-null values',
    SUM: 'Calculates the sum of values',
    AVG: 'Calculates the average value',
    MIN: 'Returns the minimum value',
    MAX: 'Returns the maximum value',
    SUBSTRING: 'Extracts a substring from a string',
    EXTRACT: 'Extracts a date/time component from a value',
    DATE_TRUNC: 'Truncates a date/time to a specified precision',
    COALESCE: 'Returns the first non-null value',
    NULLIF: 'Returns null if two expressions are equal',
    CAST: 'Converts a value to a specified data type',
    ROUND: 'Rounds a number to specified digits',
    POWER: 'Raises a number to the power of another number',
    MOD: 'Returns the remainder of division',
    READ_CSV: 'Reads a CSV file into a table',
    READ_PARQUET: 'Reads a Parquet file into a table',
  }

  return descriptions[functionName] || `DuckDB SQL function: ${functionName}`
}

/**
 * Register the completion provider with Monaco
 */
export function registerDuckDBCompletionProvider(
  monaco: any,
  context: CompletionContext
): any {
  console.log(
    '🔧 Registering DuckDB completion provider with monaco:',
    !!monaco
  )
  console.log('🔧 Monaco languages available:', !!monaco?.languages)
  console.log('🔧 Context provided:', {
    dataSourcesCount: context.dataSources.length,
    hasConnection: !!context.connection,
  })

  // Validate that monaco and languages are properly initialized
  if (!monaco) {
    console.error(
      '❌ Monaco instance is required for registerDuckDBCompletionProvider'
    )
    return null
  }

  if (!monaco.languages) {
    console.error(
      '❌ Monaco languages API is not available - Monaco may not be fully initialized'
    )
    return null
  }

  if (!monaco.languages.CompletionItemKind) {
    console.error('❌ Monaco CompletionItemKind not available')
    return null
  }

  console.log('✅ Monaco validation passed, creating provider...')

  const provider = createDuckDBCompletionProvider(context)
  const registered = monaco.languages.registerCompletionItemProvider(
    'sql',
    provider
  )

  console.log('✅ Completion provider registered successfully')
  return registered
}

/**
 * Update completion context when data sources change
 */
export function updateCompletionContext(
  provider: any,
  monaco: any,
  newContext: CompletionContext
): any {
  provider.dispose()
  return registerDuckDBCompletionProvider(monaco, newContext)
}
