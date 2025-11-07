/**
 * SQL Cockpit Component
 *
 * This is the main SQL Cockpit component that brings together the Monaco Editor,
 * DuckDB-WASM integration, and professional toolbar for a complete SQL query
 * interface in the browser.
 */

import React, { useState, useCallback, useEffect } from 'react'
import { SQLEditor } from './sql-editor'
import { SQLToolbar } from './sql-toolbar'
import { ResultsPanel } from './results-panel'
import { HelpDialog } from './help-dialog'
import { useDuckDBQuery } from '../../../hooks/use-duckdb-query'
import { useSQLFormatter } from '../../../hooks/use-sql-formatter'
import {
  SavedQuery,
} from '../../../types/sql'
import { cn } from '../../../lib/utils'
import { useCockpitTheme } from '../../../contexts/cockpit-theme-context'

/**
 * SQL Cockpit component that integrates all SQL functionality
 */
export function SQLCockpit({
  initialQuery = '',
  onQueryExecute,
  readOnly = false,
  showLineNumbers = true,
  placeholder = 'Enter SQL query here...',
  className,
  savedQueries = [],
  onSavedQuerySelect,
  showHelp = true,
  helpContent,
  editorMinHeight = '300px',
  children,
  onThemeChange,
}: {
  initialQuery?: string
  onQueryExecute?: (query: string) => Promise<any>
  readOnly?: boolean
  showLineNumbers?: boolean
  placeholder?: string
  className?: string
  savedQueries?: any[]
  onSavedQuerySelect?: (query: any) => void
  showHelp?: boolean
  helpContent?: React.ReactNode
  editorMinHeight?: string
  children?: React.ReactNode
  onThemeChange?: (theme: 'light' | 'dark' | 'auto') => void
}): React.ReactNode {
  // Get theme context
  useCockpitTheme()

  // SQL editor state
  const [query, setQuery] = useState(initialQuery)
  const [showHelpDialog, setShowHelpDialog] = useState(false)

  // Debug query state changes
  useEffect(() => {
    console.log('SQL Cockpit: Query state changed to:', query)
  }, [query])


  // DuckDB integration
  const {
    databaseStatus,
    executionState,
    result,
    error,
    executeQuery,
  } = useDuckDBQuery({
    autoConnect: true,
  })

  // SQL formatter
  const { formatQuery: formatQueryAsync, lastError: formatError } = useSQLFormatter({
    dialect: 'sql',
    keywordCase: 'upper',
  })

  // Execute query
  const handleRunQuery = useCallback(async (): Promise<void> => {
    if (query.trim()) {
      try {
        await executeQuery(query)
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
    console.log('SQL Cockpit handleSavedQuerySelect called with:', selectedQuery)
    console.log('Current query before update:', query)
    console.log('Setting new query to:', selectedQuery.query)
    setQuery(selectedQuery.query)
    console.log('Calling parent onSavedQuerySelect callback...')
    onSavedQuerySelect?.(selectedQuery)
  }, [onSavedQuerySelect, query])

  return (
    <div className={cn('h-full p-2', className)}>
      <div className="flex flex-col h-full bg-background border shadow-md rounded-sm">
        {/* Toolbar */}
      {showHelp ? (
        <SQLToolbar
          onRunQuery={handleRunQuery}
          onFormatQuery={handleFormatQuery}
          onHelp={handleShowHelp}
          isExecuting={executionState.isExecuting}
          databaseStatus={databaseStatus}
          readOnly={readOnly}
          savedQueries={savedQueries}
          onSavedQuerySelect={handleSavedQuerySelect}
          showHelp={showHelp}
        />
      ) : (
        <SQLToolbar
          onRunQuery={handleRunQuery}
          onFormatQuery={handleFormatQuery}
          isExecuting={executionState.isExecuting}
          databaseStatus={databaseStatus}
          readOnly={readOnly}
          savedQueries={savedQueries}
          onSavedQuerySelect={handleSavedQuerySelect}
          showHelp={showHelp}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-h-0 bg-background">
        {/* SQL Editor */}
        <div className="h-[300px] border-b bg-background flex-shrink-0 lg:h-[400px] xl:h-[45vh]">
          <SQLEditor
            value={query}
            onChange={setQuery}
            onExecute={handleRunQuery}
            onFormat={handleFormatQuery}
            readOnly={readOnly}
            showLineNumbers={showLineNumbers}
            placeholder={placeholder}
            minHeight={editorMinHeight}
            enableSyntaxHighlighting={true}
            enableAutoComplete={true}
            enableFormatting={true}
            {...(onThemeChange ? { onThemeChange } : {})}
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

      {/* Child components */}
      {children}

      {/* Help Dialog */}
      {showHelp && (
        <HelpDialog
          isOpen={showHelpDialog}
          onClose={handleCloseHelp}
          helpContent={helpContent}
        />
      )}
      </div>
    </div>
  )
}