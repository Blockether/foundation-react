/**
 * SQL Autocomplete Hook
 *
 * This hook provides SQL autocompletion functionality with keyword suggestions,
 * table/column suggestions, and completion context detection.
 */

import { useState, useCallback, useMemo } from 'react'

interface SQLCompletion {
  text: string
  type: 'keyword' | 'table' | 'column' | 'function' | 'alias'
  description?: string
  insertText?: string
}

interface SQLContext {
  currentWord: string
  previousKeyword: string | null
  selectContext: boolean
  fromContext: boolean
  whereContext: boolean
  joinContext: boolean
}

interface UseSQLAutocompleteOptions {
  keywords?: string[]
  tables?: string[]
  tableColumns?: Record<string, string[]>
  functions?: string[]
}

interface UseSQLAutocompleteReturn {
  completions: SQLCompletion[]
  context: SQLContext
  getSuggestions: (query: string, position: number) => SQLCompletion[]
  updateContext: (query: string, position: number) => SQLContext
}

/**
 * Default SQL keywords
 */
const DEFAULT_KEYWORDS = [
  // DML
  'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'MERGE',
  // DDL
  'CREATE', 'ALTER', 'DROP', 'TRUNCATE', 'RENAME',
  // DQL
  'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
  // Joins
  'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN',
  // Set operations
  'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT',
  // Conditions
  'AND', 'OR', 'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'ILIKE', 'IS', 'NULL',
  // Aggregate functions
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  // String functions
  'CONCAT', 'SUBSTRING', 'UPPER', 'LOWER', 'TRIM', 'LENGTH',
  // Numeric functions
  'ROUND', 'FLOOR', 'CEILING', 'ABS', 'SQRT',
  // Date functions
  'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP',
  // Control flow
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'COALESCE', 'NULLIF',
  // Modifiers
  'DISTINCT', 'ALL', 'TOP', 'AS',
  // Data types
  'INTEGER', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'DECIMAL',
  // Constraints
  'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT',
  // Other
  'WITH', 'WINDOW', 'OVER', 'PARTITION BY', 'ROW_NUMBER', 'RANK', 'DENSE_RANK',
]

/**
 * Default SQL functions
 */
const DEFAULT_FUNCTIONS = [
  // Aggregate
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX',
  // String
  'CONCAT', 'SUBSTRING', 'UPPER', 'LOWER', 'TRIM', 'LENGTH', 'REPLACE',
  // Numeric
  'ROUND', 'FLOOR', 'CEILING', 'ABS', 'SQRT', 'POWER', 'MOD',
  // Date
  'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'EXTRACT', 'DATE_PART',
  // Conditional
  'COALESCE', 'NULLIF', 'GREATEST', 'LEAST',
]

/**
 * Custom hook for SQL autocompletion
 *
 * @param options Autocompletion configuration options
 * @returns SQL autocompletion interface and state
 */
export function useSQLAutocomplete(
  options: UseSQLAutocompleteOptions = {}
): UseSQLAutocompleteReturn {
  const {
    keywords = DEFAULT_KEYWORDS,
    tables = [],
    tableColumns = {},
    functions = DEFAULT_FUNCTIONS,
  } = options

  // State management
  const [context, setContext] = useState<SQLContext>({
    currentWord: '',
    previousKeyword: null,
    selectContext: false,
    fromContext: false,
    whereContext: false,
    joinContext: false,
  })

  // Parse SQL context from query and cursor position
  const updateContext = useCallback(
    (query: string, position: number): SQLContext => {
      const textBefore = query.substring(0, position)

      // Find current word
      const wordMatch = textBefore.match(/\w*$/)
      const currentWord = wordMatch ? wordMatch[0] : ''

      // Find previous keyword
      const keywordsMatch = textBefore.match(/\b(SELECT|FROM|WHERE|AND|OR|JOIN|ON|GROUP|ORDER|HAVING|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/gi)
      const previousKeyword = keywordsMatch ? keywordsMatch[keywordsMatch.length - 1].toUpperCase() : null

      // Determine context
      const selectContext = previousKeyword === 'SELECT' || textBefore.match(/\bSELECT\s+[\w\s]*$/i) !== null
      const fromContext = previousKeyword === 'FROM' || textBefore.match(/\bFROM\s*$/i) !== null
      const whereContext = ['WHERE', 'AND', 'OR'].includes(previousKeyword || '')
      const joinContext = previousKeyword === 'JOIN' || textBefore.match(/\b\s*JOIN\s*$/i) !== null

      const newContext = {
        currentWord,
        previousKeyword,
        selectContext,
        fromContext,
        whereContext,
        joinContext,
      }

      setContext(newContext)
      return newContext
    },
    []
  )

  // Generate suggestions based on context
  const getSuggestions = useCallback(
    (query: string, position: number): SQLCompletion[] => {
      const currentContext = updateContext(query, position)
      const { currentWord, selectContext, fromContext, whereContext, joinContext } = currentContext

      const suggestions: SQLCompletion[] = []

      // Always suggest keywords
      if (currentWord.length > 0) {
        const keywordMatches = keywords.filter((keyword: string) =>
          keyword.toUpperCase().startsWith(currentWord.toUpperCase())
        )

        keywordMatches.forEach((keyword: string) => {
          suggestions.push({
            text: keyword,
            type: 'keyword',
            description: `SQL keyword: ${keyword}`,
            insertText: keyword.toUpperCase(),
          })
        })
      }

      // Suggest functions when appropriate
      if (currentWord.length > 0 && !fromContext) {
        const functionMatches = functions.filter((func: string) =>
          func.toUpperCase().startsWith(currentWord.toUpperCase())
        )

        functionMatches.forEach((func: string) => {
          suggestions.push({
            text: func,
            type: 'function',
            description: `SQL function: ${func}`,
            insertText: func.toUpperCase(),
          })
        })
      }

      // Suggest tables in FROM or JOIN context
      if ((fromContext || joinContext) && currentWord.length > 0) {
        const tableMatches = tables.filter((table: string) =>
          table.toLowerCase().startsWith(currentWord.toLowerCase())
        )

        tableMatches.forEach((table: string) => {
          suggestions.push({
            text: table,
            type: 'table',
            description: `Table: ${table}`,
          })
        })
      }

      // Suggest columns in SELECT or WHERE context
      if ((selectContext || whereContext) && currentWord.length > 0) {
        // Get all available columns from all tables
        const allColumns: string[] = []
        Object.entries(tableColumns).forEach(([tableName, columns]) => {
          if (Array.isArray(columns)) {
            columns.forEach((column: string) => {
              allColumns.push(column)
              allColumns.push(`${tableName}.${column}`)
            })
          }
        })

        const columnMatches = allColumns.filter((column: string) =>
          column.toLowerCase().startsWith(currentWord.toLowerCase())
        )

        columnMatches.forEach((column: string) => {
          suggestions.push({
            text: column,
            type: 'column',
            description: `Column: ${column}`,
          })
        })
      }

      // Sort suggestions by relevance (exact matches first, then prefix matches)
      suggestions.sort((a, b) => {
        const aExact = a.text.toLowerCase() === currentWord.toLowerCase()
        const bExact = b.text.toLowerCase() === currentWord.toLowerCase()

        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1

        return a.text.localeCompare(b.text)
      })

      return suggestions
    },
    [keywords, tables, tableColumns, functions, updateContext]
  )

  return {
    completions: useMemo(() => [], []), // Current completions (can be enhanced)
    context,
    getSuggestions,
    updateContext,
  }
}