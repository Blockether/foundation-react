/**
 * SQL Toolbar Component
 *
 * This component provides a professional toolbar with action buttons for SQL query
 * management, including Run Query, Format Query, Saved Queries, Help, and database status.
 */

import React, { useEffect } from 'react'
import { Button } from '../../ui/button'
import { SavedQueries } from './saved'
import { DatabaseStatus, SavedQuery } from '../../../types/sql'
import { cn } from '../../../lib/utils'

// Lucide React icons
import { Play, Pause, FileText, HelpCircle, Database } from 'lucide-react'

interface SQLToolbarProps {
  // Actions
  onRunQuery: () => void
  onFormatQuery: () => void
  onHelp?: () => void

  // State
  isExecuting: boolean
  databaseStatus: DatabaseStatus
  readOnly?: boolean

  // Saved queries
  savedQueries?: SavedQuery[]
  onSavedQuerySelect?: (query: SavedQuery) => void

  // UI options
  showHelp?: boolean
  className?: string
}

/**
 * SQL Toolbar component with action buttons and status indicators
 */
export function SQLToolbar({
  onRunQuery,
  onFormatQuery,
  onHelp,
  isExecuting,
  databaseStatus,
  readOnly = false,
  savedQueries = [],
  onSavedQuerySelect,
  className,
}: SQLToolbarProps): React.ReactNode {
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault()
            if (!isExecuting && !readOnly) {
              onRunQuery()
            }
            break
          case 's':
            event.preventDefault()
            if (!readOnly) {
              onFormatQuery()
            }
            break
          case 'h':
            event.preventDefault()
            if (onHelp) {
              onHelp()
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onRunQuery, onFormatQuery, onHelp, isExecuting, readOnly])

  const getStatusColor = (): string => {
    switch (databaseStatus.state) {
      case 'connected':
        return 'text-green-600 dark:text-green-400'
      case 'connecting':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'error':
        return 'text-red-600 dark:text-red-400'
      case 'disconnected':
        return 'text-muted-foreground'
      default:
        return 'text-muted-foreground'
    }
  }

  const getStatusIcon = (): React.ReactNode => {
    switch (databaseStatus.state) {
      case 'connected':
        return <Database className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'connecting':
        return <Database className="h-4 w-4 text-yellow-600 dark:text-yellow-400 animate-pulse" />
      case 'error':
        return <Database className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <Database className="h-4 w-4 text-muted-foreground" />
    }
  }

  
  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b bg-muted shadow-md backdrop-blur-sm border-border z-50',
          className
        )}
        role="toolbar"
        aria-label="SQL editor toolbar"
      >
        {/* Left side - Action buttons */}
        <div className="flex items-center gap-1">
          {/* Run Query button */}
          <div title={isExecuting ? 'Executing query...' : 'Run query (Ctrl+Enter)'}>
            <Button
              size="sm"
              onClick={onRunQuery}
              disabled={isExecuting || readOnly}
              className={cn(
                "min-w-[40px] hover:cursor-pointer",
                isExecuting
                  ? "bg-yellow-500 text-black hover:bg-yellow-700"
                  : "bg-green-500 text-white hover:bg-green-700"
              )}
              aria-label={
                isExecuting ? 'Executing query...' : 'Run SQL Query (Ctrl+Enter)'
              }
            >
              {isExecuting ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="sr-only">{isExecuting ? 'Executing Query' : 'Run Query'}</span>
            </Button>
          </div>

          {/* Format Query button */}
          <div title="Format query (Ctrl+S)">
            <Button
              size="sm"
              variant="ghost"
              onClick={onFormatQuery}
              disabled={readOnly}
              className="text-foreground hover:bg-accent hover:text-accent-foreground hover:cursor-pointer"
              aria-label="Format SQL Query (Ctrl+S)"
            >
              <FileText className="h-4 w-4" />
              <span className="sr-only">Format Query</span>
            </Button>
          </div>
        </div>

        {/* Right side - Status, History and Help */}
        <div className="flex items-center gap-1">
          {/* Database status */}
          <div className="flex items-center mr-3 gap-1">
            {getStatusIcon()}
            <span className={cn('text-sm font-medium', getStatusColor())}>
              {databaseStatus.message}
            </span>
          </div>

          {/* Saved Queries component */}
          {savedQueries.length > 0 && onSavedQuerySelect && (
            <div className="relative">
              <SavedQueries
                queries={savedQueries}
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
                className="text-foreground hover:bg-accent hover:text-accent-foreground hover:cursor-pointer"
                aria-label="Show help documentation (Ctrl+H)"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Status announcement for screen readers */}
        <div role="status" aria-live="polite" className="sr-only">
          {isExecuting && 'Executing SQL query'}
          {databaseStatus.state === 'connected' && 'Database connected'}
          {databaseStatus.state === 'error' &&
            `Database error: ${databaseStatus.error}`}
        </div>
      </div>

      </>
  )
}