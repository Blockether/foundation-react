/**
 * SQL Formatter Hook
 *
 * This hook provides SQL query formatting functionality using the sql-formatter
 * library. It handles different SQL dialects and provides async formatting with
 * error handling.
 */

import { useState, useCallback } from 'react'
import { format } from 'sql-formatter'
import { SQLError } from '../types/sql'

type SQLDialect = 'sql' | 'mysql' | 'postgresql' | 'sqlite' | 'bigquery'

interface UseSQLFormatterOptions {
  dialect?: SQLDialect
  keywordCase?: 'upper' | 'lower'
  identifierCase?: 'preserve' | 'upper' | 'lower'
  indentStyle?: 'standard' | undefined
  tabWidth?: number
  useTabs?: boolean
  logicalOperatorNewline?: 'before' | 'after'
  expressionWidth?: number
  linesBetweenQueries?: number
  denseOperators?: boolean
  newlineBeforeSemicolon?: boolean
}

interface UseSQLFormatterReturn {
  // State
  isFormatting: boolean
  lastError: SQLError | null

  // Actions
  formatQuery: (query: string) => Promise<string>
  formatQuerySync: (query: string) => string
  clearError: () => void
}

/**
 * Custom hook for SQL query formatting
 *
 * @param options Formatting configuration options
 * @returns SQL formatter interface and state
 */
export function useSQLFormatter(
  options: UseSQLFormatterOptions = {}
): UseSQLFormatterReturn {
  const {
    dialect = 'sql',
    keywordCase = 'upper',
    identifierCase = 'preserve',
    indentStyle = 'standard',
    tabWidth = 2,
    useTabs = false,
    logicalOperatorNewline = 'before',
    expressionWidth = 120,
    linesBetweenQueries = 2,
    denseOperators = false,
    newlineBeforeSemicolon = false,
  } = options

  // State management
  const [isFormatting, setIsFormatting] = useState(false)
  const [lastError, setLastError] = useState<SQLError | null>(null)

  // Format SQL query (async version)
  const formatQuery = useCallback(
    async (query: string): Promise<string> => {
      // Validate input
      if (!query?.trim()) {
        return query
      }

      setIsFormatting(true)
      setLastError(null)

      try {
        const formatted = await new Promise<string>((resolve, reject) => {
          try {
            const result = format(query, {
              language: dialect,
              keywordCase,
              identifierCase,
              indentStyle,
              tabWidth,
              useTabs,
              logicalOperatorNewline,
              expressionWidth,
              linesBetweenQueries,
              denseOperators,
              newlineBeforeSemicolon,
            })
            resolve(result)
          } catch (error) {
            reject(error)
          }
        })

        setIsFormatting(false)
        return formatted
      } catch (error) {
        setIsFormatting(false)

        // Handle formatting errors
        const sqlError: SQLError = {
          type: 'syntax',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to format SQL query',
          line: 1,
          column: 1,
        }

        setLastError(sqlError)
        return query // Return original query on error
      }
    },
    [
      dialect,
      keywordCase,
      identifierCase,
      indentStyle,
      tabWidth,
      useTabs,
      logicalOperatorNewline,
      expressionWidth,
      linesBetweenQueries,
      denseOperators,
      newlineBeforeSemicolon,
    ]
  )

  // Format SQL query (sync version)
  const formatQuerySync = useCallback(
    (query: string): string => {
      // Validate input
      if (!query?.trim()) {
        return query
      }

      try {
        return format(query, {
          language: dialect,
          keywordCase,
          identifierCase,
          indentStyle,
          tabWidth,
          useTabs,
          logicalOperatorNewline,
          expressionWidth,
          linesBetweenQueries,
          denseOperators,
          newlineBeforeSemicolon,
        })
      } catch (error) {
        // Handle formatting errors
        const sqlError: SQLError = {
          type: 'syntax',
          message:
            error instanceof Error
              ? error.message
              : 'Failed to format SQL query',
          line: 1,
          column: 1,
        }

        setLastError(sqlError)
        return query // Return original query on error
      }
    },
    [
      dialect,
      keywordCase,
      identifierCase,
      indentStyle,
      tabWidth,
      useTabs,
      logicalOperatorNewline,
      expressionWidth,
      linesBetweenQueries,
      denseOperators,
      newlineBeforeSemicolon,
    ]
  )

  // Clear last error
  const clearError = useCallback((): void => {
    setLastError(null)
  }, [])

  return {
    isFormatting,
    lastError,
    formatQuery,
    formatQuerySync,
    clearError,
  }
}
