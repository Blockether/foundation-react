/**
 * DuckDB Query Hook
 *
 * This hook provides a React interface for executing SQL queries using DuckDB-WASM.
 * It handles connection management, query execution, error handling, and state management.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  QueryResult,
  SQLError,
  DatabaseStatus,
  SQLExecutionState,
} from '../types/sql'

interface UseDuckDBQueryOptions {
  autoConnect?: boolean
  maxRetries?: number
  retryDelay?: number
}

interface UseDuckDBQueryReturn {
  // State
  databaseStatus: DatabaseStatus
  executionState: SQLExecutionState
  result: QueryResult | null
  error: SQLError | null

  // Actions
  executeQuery: (query: string) => Promise<QueryResult>
  connect: () => Promise<void>
  disconnect: () => void
  clearError: () => void
  reset: () => void
}

/**
 * Custom hook for DuckDB query execution
 *
 * @param options DuckDB configuration options
 * @returns DuckDB query interface and state
 */
export function useDuckDBQuery(
  options: UseDuckDBQueryOptions = {}
): UseDuckDBQueryReturn {
  const {
    autoConnect = true,
    maxRetries = 3,
    retryDelay = 1000,
  } = options

  // State management
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>({
    state: 'disconnected',
    message: 'Not connected',
  })

  const [executionState, setExecutionState] = useState<SQLExecutionState>({
    isExecuting: false,
  })

  const [result, setResult] = useState<QueryResult | null>(null)
  const [error, setError] = useState<SQLError | null>(null)

  // Refs for connection management
  const retryCountRef = useRef(0)

  // Connect to DuckDB
  const connect = useCallback(async (): Promise<void> => {
    if (databaseStatus.state === 'connected') {
      return
    }

    setDatabaseStatus({
      state: 'connecting',
      message: 'Connecting ...',
    })
    setError(null)

    try {
      // Simulate connection for now since DuckDB-WASM is not fully set up
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Reset retry count on successful connection
      retryCountRef.current = 0

      setDatabaseStatus({
        state: 'connected',
        message: 'Connected ',
        connectionInfo: {
          type: 'DuckDB WASM',
          location: 'In-memory',
        },
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to connect '
      const sqlError: SQLError = {
        type: 'connection',
        message: errorMessage,
        details: `Attempt: ${retryCountRef.current + 1}`,
      }

      setError(sqlError)
      setDatabaseStatus({
        state: 'error',
        message: 'Connection failed',
        error: errorMessage,
      })

      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setTimeout(() => {
          connect()
        }, retryDelay)
      }
    }
  }, [databaseStatus.state, maxRetries, retryDelay])

  // Disconnect from DuckDB
  const disconnect = useCallback((): void => {
    setDatabaseStatus({ state: 'disconnected', message: 'Disconnected' })
    setResult(null)
  }, [])

  // Execute SQL query
  const executeQuery = useCallback(
    async (query: string): Promise<QueryResult> => {
      if (databaseStatus.state !== 'connected') {
        throw new Error('Database not connected. Call connect() first.')
      }

      if (!query?.trim()) {
        throw new Error('Query cannot be empty')
      }

      // Clear previous errors and results
      setError(null)
      setResult(null)

      // Set execution state
      setExecutionState({
        isExecuting: true,
        progress: 0,
        status: 'Executing query...',
        startTime: new Date(),
        currentQuery: query,
      })

      const startTime = performance.now()

      try {
        // Simulate query execution for now since DuckDB-WASM is not fully set up
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock result for demonstration
        const mockData: Record<string, unknown>[] = [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        ]

        const mockColumns = [
          { name: 'id', type: 'number' as const, nullable: false },
          { name: 'name', type: 'string' as const, nullable: false },
          { name: 'email', type: 'string' as const, nullable: false },
        ]

        // Calculate execution time
        const endTime = performance.now()
        const executionTime = Math.round(endTime - startTime)

        // Create result object
        const queryResult: QueryResult = {
          data: mockData,
          columns: mockColumns,
          executionTime,
        }

        // Update state
        setResult(queryResult)
        setExecutionState({
          isExecuting: false,
          status: 'Query completed successfully',
          progress: 100,
        })

        return queryResult
      } catch (err) {
        const endTime = performance.now()
        const executionTime = Math.round(endTime - startTime)

        const errorMessage =
          err instanceof Error ? err.message : 'Query execution failed'
        const sqlError: SQLError = {
          type: detectErrorType(errorMessage),
          message: errorMessage,
          statement: query,
          details: `Execution time: ${executionTime}ms`,
        }

        setError(sqlError)
        setExecutionState({
          isExecuting: false,
          status: 'Query failed',
        })

        throw sqlError
      }
    },
    [databaseStatus.state]
  )

  // Clear error
  const clearError = useCallback((): void => {
    setError(null)
  }, [])

  // Reset all state
  const reset = useCallback((): void => {
    setResult(null)
    setError(null)
    setExecutionState({ isExecuting: false })
  }, [])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    // Cleanup on unmount
    return () => {
      disconnect()
    }
  }, [autoConnect, connect, disconnect])

  return {
    databaseStatus,
    executionState,
    result,
    error,
    executeQuery,
    connect,
    disconnect,
    clearError,
    reset,
  }
}

/**
 * Detect error type from error message
 */
function detectErrorType(message: string): SQLError['type'] {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('syntax') || lowerMessage.includes('parse')) {
    return 'syntax'
  }
  if (lowerMessage.includes('connection') || lowerMessage.includes('network')) {
    return 'connection'
  }
  if (
    lowerMessage.includes('memory') ||
    lowerMessage.includes('out of memory')
  ) {
    return 'memory'
  }
  if (
    lowerMessage.includes('permission') ||
    lowerMessage.includes('access denied')
  ) {
    return 'permission'
  }
  if (lowerMessage.includes('timeout')) {
    return 'timeout'
  }

  return 'runtime'
}