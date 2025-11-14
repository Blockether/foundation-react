/**
 * SQL Toolbar Component
 *
 * This component provides a professional toolbar with action buttons for SQL query
 * management, including Run Query, Format Query, Saved Queries, Help, and database status.
 */

import React, { useEffect, useState } from 'react'

// Lucide React icons
import {
  Play,
  Square,
  Sparkles,
  HelpCircle,
  BarChart3,
  Wand2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SavedQueries } from './saved'
import { DataSources } from './datasources'
import { SavedQuery, DataSource, QueryResult, InsightsQuery } from '@/types/sql'
import { DuckDBQueryState } from '@/lib/duckdb/types'
import { AsyncDuckDB } from '@duckdb/duckdb-wasm'

interface SQLToolbarProps {
  // Actions
  onRunQuery: () => void
  onCancelQuery?: () => void
  onFormatQuery: () => void
  onHelp?: () => void
  onSaveResults?: () => void
  onAIAssist?: () => void

  // State
  db?: AsyncDuckDB | undefined // DuckDB database instance
  showDbStatusRed?: boolean // Whether to show red status (5-second timeout exceeded)
  queryState: DuckDBQueryState
  queryResult?: QueryResult | null
  queryError?: any
  query?: string // Current query content for format button validation
  hasLLMCompletion?: boolean // Whether LLM completion function is available

  // Saved queries
  savedQueries: SavedQuery[]
  onSavedQuerySelect?: (query: SavedQuery) => void

  // Data sources
  dataSources?: DataSource[]
  isLoadingBatch: boolean
  onImportFile?: (file: File) => Promise<void>
  onSelectDataSource?: (dataSource: DataSource) => void
  onExecuteInsightsQuery?: (
    query: InsightsQuery,
    dataSource?: DataSource
  ) => Promise<void>

  // Insights query state
  currentInsightsQuery?: InsightsQuery | null

  // Insight queries for data analysis
  insightQueries?: InsightsQuery[]

  // UI options
  className?: string
}

/**
 * SQL Toolbar component with action buttons and status indicators
 */
export function SQLToolbar({
  onRunQuery,
  onCancelQuery,
  onFormatQuery,
  onHelp,
  onSaveResults,
  onAIAssist,
  db,
  showDbStatusRed = false,
  queryState,
  queryResult,
  queryError,
  query = '',
  hasLLMCompletion = false,
  savedQueries = [],
  onSavedQuerySelect,
  dataSources = [],
  isLoadingBatch = false,
  onImportFile,
  onSelectDataSource,
  onExecuteInsightsQuery,
  currentInsightsQuery = null,
  insightQueries,
  className,
}: SQLToolbarProps): React.ReactNode {
  // Animation state for play button
  const [isPlayAnimating, setIsPlayAnimating] = useState(false)

  // Derived state helpers
  const isRunning = queryState === DuckDBQueryState.QueryRunning
  const isInterrupting = queryState === DuckDBQueryState.QueryInterrupting
  const hasQueryContent = query.trim().length > 0
  const canRun =
    db &&
    (queryState === DuckDBQueryState.QueryIdle ||
      queryState === DuckDBQueryState.QueryCompleted ||
      queryState === DuckDBQueryState.QueryError) &&
    hasQueryContent

  // Save functionality is only available when there are valid results (no errors)
  const canSave =
    queryResult &&
    queryResult.data &&
    queryResult.data.length > 0 &&
    !queryError &&
    queryState === DuckDBQueryState.QueryCompleted

  // Format functionality is only available when there's content in the editor AND database is available
  const canFormat = db && query.trim().length > 0

  // AI Assist is only available when LLM completion is enabled, database is available, AND at least one datasource is loaded
  const hasActiveDataSources = dataSources.some(
    ds => ds.loadingStatus === 'loaded'
  )
  const canUseAIAssist = db && hasLLMCompletion && onAIAssist && hasActiveDataSources

  // Reset animation when query state changes (prevents jumping)
  React.useEffect(() => {
    if (
      isRunning ||
      isInterrupting ||
      queryState === DuckDBQueryState.QueryCompleted ||
      queryState === DuckDBQueryState.QueryError
    ) {
      setIsPlayAnimating(false)
    }
  }, [queryState, isRunning, isInterrupting])

  // Handle play button click with subtle animation
  const handlePlayClick = (): void => {
    if (isRunning) {
      onCancelQuery?.()
    } else if (canRun) {
      setIsPlayAnimating(true)
      onRunQuery()
      // Reset animation after a very short delay, but let the state change handle it
      setTimeout(() => {
        if (!isRunning) {
          setIsPlayAnimating(false)
        }
      }, 75)
    }
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      // Help shortcuts (handle first to prevent conflicts)
      if (event.key === 'F1' || event.key === '?') {
        event.preventDefault()
        if (onHelp) {
          onHelp()
        }
        return
      }

      // Handle Command+H specifically to prevent system behavior
      if (event.metaKey && event.key === 'h') {
        event.preventDefault()
        event.stopPropagation()
        if (onHelp) {
          onHelp()
        }
        return
      }

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault()
            if (canRun) {
              handlePlayClick()
            }
            break
          case 's':
            event.preventDefault()
            if (canSave && onSaveResults) {
              onSaveResults()
            }
            break
          case 'h':
            // This handles Ctrl+H on Windows/Linux (Command+H on Mac handled above)
            event.preventDefault()
            if (onHelp) {
              onHelp()
            }
            break
        }
      }

      // Handle Ctrl+Shift+F for formatting
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === 'F'
      ) {
        event.preventDefault()
        if (canFormat) {
          onFormatQuery()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    handlePlayClick,
    onFormatQuery,
    onHelp,
    onSaveResults,
    canRun,
    canSave,
    canFormat,
  ])

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b rounded-t',
          className
        )}
        role="toolbar"
        aria-label="SQL editor toolbar"
      >
        {/* Left side - Action buttons */}
        <div className="flex items-center gap-1">
          {/* Run/Cancel Query button */}
          <div
            title={
              isRunning || isInterrupting
                ? 'Cancel query'
                : db && hasQueryContent
                  ? 'Run query (Ctrl+Enter)'
                  : !db
                    ? 'Run query disabled - no database available'
                    : 'Run query disabled - no content to execute'
            }
          >
            <Button
              size="sm"
              onClick={handlePlayClick}
              disabled={!canRun && !isRunning}
              className={cn(
                'min-w-10 hover:cursor-pointer transition-colors duration-150',
                isRunning
                  ? 'bg-red-500 text-white hover:bg-red-700'
                  : isInterrupting
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : cn(
                      'bg-green-500 text-white hover:bg-green-700',
                      // Subtle animation effect
                      isPlayAnimating && 'bg-green-600'
                    )
              )}
              aria-label={
                isRunning ? 'Cancel query' : 'Run SQL Query (Ctrl+Enter)'
              }
            >
              <div className="relative w-4 h-4 overflow-hidden">
                <Play
                  className={cn(
                    'h-4 w-4 absolute inset-0 transition-all duration-500 ease-in-out',
                    isRunning
                      ? 'opacity-0 -rotate-180 scale-0'
                      : 'opacity-100 rotate-0 scale-100'
                  )}
                />
                <Square
                  className={cn(
                    'h-4 w-4 absolute inset-0 transition-all duration-500 ease-in-out delay-100',
                    isRunning
                      ? 'opacity-100 rotate-0 scale-100'
                      : 'opacity-0 rotate-180 scale-0'
                  )}
                />
              </div>
              <span className="sr-only">
                {isRunning ? 'Cancel Query' : 'Run Query'}
              </span>
            </Button>
          </div>

          {/* Format Query button */}
          <div
            title={
              canFormat
                ? 'Format query (Ctrl+Shift+F)'
                : !db
                  ? 'Format query disabled - no database available'
                  : 'Format query disabled - no content to format'
            }
          >
            <Button
              size="sm"
              variant="ghost"
              onClick={onFormatQuery}
              disabled={!canFormat}
              className={cn(
                'hover:cursor-pointer',
                !canFormat && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={
                canFormat
                  ? 'Format SQL Query (Ctrl+Shift+F)'
                  : 'Format query disabled - no content to format'
              }
            >
              <Sparkles className="h-4 w-4" />
              <span className="sr-only">Format Query</span>
            </Button>
          </div>

          {/* AI Assist button */}
          {hasLLMCompletion && onAIAssist && (
            <div
              title={
                db && hasActiveDataSources
                  ? 'AI-assisted query generation'
                  : !db
                    ? 'AI Assist disabled - no database available'
                    : 'AI Assist disabled - no active data sources available'
              }
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={onAIAssist}
                disabled={!canUseAIAssist}
                className={cn(
                  'text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300',
                  canUseAIAssist ? 'hover:cursor-pointer' : 'cursor-not-allowed opacity-50'
                )}
                aria-label={
                  canUseAIAssist
                    ? 'AI-assisted query generation'
                    : 'AI Assist disabled - no database or active data sources available'
                }
              >
                <Wand2 className="h-4 w-4" />
                <span className="sr-only">AI Assist</span>
              </Button>
            </div>
          )}
        </div>

        {/* Center - Insights Query Indicator */}
        {currentInsightsQuery && (
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
            <BarChart3 className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">
              {currentInsightsQuery.name}
            </span>
          </div>
        )}

        {/* Right side - Data Sources, Saved Queries and Help */}
        <div className="flex items-center gap-1">
          {/* Data Sources component */}
          <div className="relative">
            <DataSources
              dataSources={dataSources}
              isLoadingBatch={isLoadingBatch}
              db={db}
              onImportFile={onImportFile}
              onSelectDataSource={onSelectDataSource}
              onExecuteInsightsQuery={onExecuteInsightsQuery}
              insightQueries={insightQueries}
            />
          </div>

          {/* Saved Queries component */}
          {savedQueries.length > 0 && onSavedQuerySelect && (
            <div className="relative">
              <SavedQueries
                queries={savedQueries}
                db={db}
                onSelect={onSavedQuerySelect}
              />
            </div>
          )}

          {/* Help button */}
          {onHelp && (
            <div title="Show help (Ctrl+H)">
              <Button
                size="sm"
                variant="ghost"
                onClick={onHelp}
                className="hover:cursor-pointer"
                aria-label="Show help documentation (Ctrl+H)"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Database Status Indicator */}
          <div
            className="h-8 w-8 flex items-center justify-center relative"
            title={
              db
                ? 'Database connected'
                : showDbStatusRed
                  ? 'Database not available (timeout exceeded)'
                  : 'Database loading...'
            }
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full shadow-sm transition-colors duration-300',
                db
                  ? 'bg-green-500' // Green when database is available
                  : showDbStatusRed
                    ? 'bg-red-500' // Red after 5 seconds when database is still not available
                    : 'bg-yellow-500 animate-pulse' // Yellow with pulsating animation when loading
              )}
            />
          </div>
        </div>

        {/* Status announcement for screen readers */}
        <div role="status" aria-live="polite" className="sr-only">
          {queryState === DuckDBQueryState.QueryRunning &&
            'Executing SQL query'}
          {queryState === DuckDBQueryState.QueryInterrupting &&
            'Canceling SQL query'}
          {queryState === DuckDBQueryState.QueryCompleted && 'Query completed'}
          {queryState === DuckDBQueryState.QueryError && 'Query failed'}
        </div>
      </div>
    </>
  )
}
