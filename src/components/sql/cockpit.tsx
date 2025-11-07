/**
 * SQL Cockpit Component
 *
 * This is the main SQL Cockpit component that brings together the Monaco Editor,
 * DuckDB-WASM integration, and professional toolbar for a complete SQL query
 * interface in the browser.
 */

import React, { useState, useCallback } from 'react'
import { SQLEditor } from './editor'
import { SQLToolbar } from './toolbar'
import { ResultsPanel } from './results'
import { HelpDialog } from './help'
import { useSQLFormatter } from '@/hooks/use-sql-formatter'
import { cn } from '@/lib/utils'
import { SavedQuery } from '@/types/sql'

/**
 * SQL Cockpit component that integrates all SQL functionality
 */
export function SQLCockpit({
  initialQuery = '',
  onQueryExecute,
  placeholder = 'Enter SQL query here...',
  className,
  savedQueries = []
}: {
  initialQuery?: string
  onQueryExecute?: (query: string) => Promise<any>
  placeholder?: string
  className?: string
  savedQueries?: any[]
}): React.ReactNode {

  // SQL editor state
  const [query, setQuery] = useState(initialQuery)
  const [showHelpDialog, setShowHelpDialog] = useState(false)

  // DuckDB integration
  const {
    executionState,
    result,
    error,
    executeQuery,
  } = { executionState: { isExecuting: false }, result: null, error: null, executeQuery: async () => { /* mock implementation */ } } // Replace with actual hook

  // SQL formatter
  const { formatQuery: formatQueryAsync, lastError: formatError } = useSQLFormatter({
    dialect: 'sql',
    keywordCase: 'upper',
  })

  // Execute query
  const handleRunQuery = useCallback(async (): Promise<void> => {
    if (query.trim()) {
      try {
        // await executeQuery(query)
        if (onQueryExecute) {
          await onQueryExecute(query)
          // Query executed successfully
        }
      } catch (err) {
        // Error handling is managed by the hook
      }
    }
  }, [query, executeQuery, onQueryExecute])

  // Format query
  const handleFormatQuery = useCallback(async (): Promise<void> => {
    try {
      const formatted = await formatQueryAsync(query)
      setQuery(formatted)
    } catch (err) {
      // Formatting errors are handled by the hook
    }
  }, [query, formatQueryAsync])

  // Show help
  const handleShowHelp = useCallback((): void => {
    setShowHelpDialog(true)
  }, [])

  // Hide help
  const handleCloseHelp = useCallback((): void => {
    setShowHelpDialog(false)
  }, [])

  // Handle saved query selection
  const handleSavedQuerySelect = useCallback((selectedQuery: SavedQuery): void => {
    const editorPlaceholder = document.querySelector('.monaco-placeholder')
    if (editorPlaceholder) {
      editorPlaceholder.setAttribute('style', 'display: none !important;')
    }

    setQuery(selectedQuery.query)
  }, [query])

  return (
    <div className={cn('h-full p-2', className)}>
      <div className="flex flex-col h-full bg-background border shadow-md rounded-sm">
        {/* Toolbar */}

        <SQLToolbar
          onRunQuery={handleRunQuery}
          onFormatQuery={handleFormatQuery}
          isExecuting={executionState.isExecuting}
          // databaseStatus={databaseStatus}
          savedQueries={savedQueries}
          onSavedQuerySelect={handleSavedQuerySelect}
        />


        {/* Main content area */}
        <div className="flex flex-col flex-1 min-h-0 ">
          {/* SQL Editor */}
          <div className="h-[300px]   flex-shrink-0 lg:h-[400px] xl:h-[45vh]">
            <SQLEditor
              value={query}
              onChange={setQuery}
              onExecute={handleRunQuery}
              onFormat={handleFormatQuery}
              placeholder={placeholder}
              enableSyntaxHighlighting={true}
              enableAutoComplete={true}
              enableFormatting={true}
            />
          </div>

          {/* Results Panel */}
          <div className="flex-[1] min-h-0 min-h-[200px] shadow-inner">
            <ResultsPanel
              result={result}
              error={error || formatError}
              isLoading={executionState.isExecuting}
              maxHeight="none"
            />
          </div>
        </div>

        {/* Help Dialog */}

        <HelpDialog
          isOpen={showHelpDialog}
          onClose={handleCloseHelp}
        />

      </div>
    </div>
  )
}