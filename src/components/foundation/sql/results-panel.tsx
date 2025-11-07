/**
 * Results Panel Component
 *
 * This component displays SQL query results in a formatted table or shows error messages
 * when queries fail. It handles different data types, empty states, and loading indicators.
 */

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table'
import { QueryResult, SQLError } from '../../../types/sql'
import { cn } from '../../../lib/utils'

interface ResultsPanelProps {
  result: QueryResult | null
  error: SQLError | null
  isLoading?: boolean
  maxHeight?: string
  className?: string
}

/**
 * Results Panel component for displaying query results or errors
 */
export function ResultsPanel({
  result,
  error,
  isLoading = false,
  maxHeight = '600px',
  className,
}: ResultsPanelProps): React.ReactNode {
  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn('border-t bg-background shadow-xl', className)}
        style={{ maxHeight }}
      >
        {/* Results toolbar - 24px height */}
        <div className="flex items-center justify-between px-3 border-b h-6 bg-muted border-border">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-medium text-foreground">Executing Query...</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Processing
          </div>
        </div>

        {/* Loading content */}
        <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 24px)` }}>
          <div className="flex items-center justify-center min-h-[200px] bg-background">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mb-4 mx-auto">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                Running SQL Query
              </h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Your query is being executed. This may take a moment depending on the complexity of your query and data size.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn('border-t bg-background shadow-xl', className)}
        style={{ maxHeight }}
      >
        {/* Results toolbar - 24px height */}
        <div className="flex items-center justify-between px-3 border-b h-6 bg-destructive/10 border-destructive/20">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-medium text-destructive">
              {getErrorTypeLabel(error.type)}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Query failed
          </div>
        </div>

        {/* Error content */}
        <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 24px)` }}>
          <div className="p-6 bg-background">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-destructive mb-2">
                    {getErrorTypeLabel(error.type)}
                  </h3>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-sm p-4 mb-3">
                    <p className="text-sm text-destructive font-mono">
                      {error.message}
                    </p>
                  </div>
                  {(error.line || error.column) && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-sm">
                      <span className="font-medium">Location:</span> Line {error.line}, Column {error.column}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No results state
  if (!result) {
    return (
      <div
        className={cn('border-t bg-background shadow-xl', className)}
        style={{ maxHeight }}
      >
        {/* Results toolbar - 24px height */}
        <div className="flex items-center justify-between px-3 border-b h-6 bg-muted border-border">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-medium text-muted-foreground">No Results</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Ready to execute query
          </div>
        </div>

        {/* Empty state content */}
        <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 24px)` }}>
          <div className="flex items-center justify-center min-h-[200px] bg-background">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mb-4 mx-auto">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-foreground mb-2">
                No Results to Display
              </h3>
              <p className="text-sm text-muted-foreground max-w-md px-8">
                Run a SQL query to see results here. Use the editor above to write and execute your query.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Empty result set
  if (result.data.length === 0) {
    return (
      <div
        className={cn('border-t bg-background shadow-xl', className)}
        style={{ maxHeight }}
      >
        {/* Results toolbar - 24px height */}
        <div className="flex items-center justify-between px-3 border-b h-6 bg-muted border-border">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-medium text-foreground">0 rows returned</span>
            {result.columns && (
              <span className="text-muted-foreground">
                {result.columns.length} columns
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {result.executionTime}ms
          </div>
        </div>

        {/* Empty result content */}
        <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 24px)` }}>
          <div className="flex items-center justify-center min-h-[150px] bg-gradient-to-b from-background to-muted/10">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-muted/30 rounded-full mb-3 mx-auto">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-foreground mb-1">
                Query Returned No Results
              </h3>
              <p className="text-xs text-muted-foreground">
                The query executed successfully but returned 0 rows
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Display results
  return (
    <div
      className={cn('border-t bg-background/95 backdrop-blur-sm shadow-xl', className)}
      style={{ maxHeight }}
    >
      {/* Results summary toolbar - 24px height */}
      <div className="flex items-center justify-between px-3 border-b bg-muted/50 h-6">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-medium text-foreground">
            {result.rowCount
              ? `${result.rowCount.toLocaleString()} rows affected`
              : `${result.data.length.toLocaleString()} rows returned`}
          </span>
          {result.columns && (
            <span className="text-muted-foreground">
              {result.columns.length} columns
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {result.executionTime}ms
        </div>
      </div>

      {/* Results table */}
      <div
        className="overflow-auto bg-background"
        style={{ maxHeight: `calc(${maxHeight} - 24px)` }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              {result.columns.map((column: QueryResult['columns'][0], index: number) => (
                <TableHead key={index} className="font-medium">
                  {column.name}
                  {column.nullable && (
                    <span className="text-xs text-muted-foreground ml-1">
                      (nullable)
                    </span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.data.map((row: Record<string, unknown>, rowIndex: number) => (
              <TableRow key={rowIndex} className="hover:bg-muted/50">
                {result.columns.map((column: QueryResult['columns'][0], colIndex: number) => {
                  const value = row[column.name]
                  return (
                    <TableCell key={colIndex}>
                      <CellValue value={value} type={column.type} />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Accessibility announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        Query completed successfully. {result.data.length} rows returned.
      </div>
    </div>
  )
}

/**
 * Cell value renderer for different data types
 */
function CellValue({
  value,
  type,
}: {
  value: unknown
  type: QueryResult['columns'][0]['type']
}): React.ReactNode {
  // Handle null values
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">NULL</span>
  }

  // Handle different data types
  switch (type) {
    case 'boolean':
      return (
        <span
          className={cn(
            'inline-flex items-center px-2 py-1 text-xs font-medium',
            value
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {value.toString()}
        </span>
      )

    case 'number':
      // Format numbers with appropriate precision
      if (Number.isInteger(value as number)) {
        return (
          <span className="font-mono">
            {(value as number).toLocaleString()}
          </span>
        )
      } else {
        return (
          <span className="font-mono">
            {(value as number).toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })}
          </span>
        )
      }

    case 'date':
      return <DateCellValue value={value} />

    case 'string':
    default:
      // Handle long strings
      const stringValue = String(value)
      if (stringValue.length > 100) {
        return (
          <span className="font-mono" title={stringValue}>
            {stringValue.substring(0, 100)}...
          </span>
        )
      }
      return <span className="font-mono">{stringValue}</span>
  }
}

/**
 * Date cell value component (separated to avoid JSX in try/catch)
 */
function DateCellValue({ value }: { value: unknown }): React.ReactNode {
  let formattedDate: string

  try {
    const date = new Date(value as string)
    formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  } catch {
    formattedDate = String(value)
  }

  return <span className="font-mono">{formattedDate}</span>
}

/**
 * Get error type label for display
 */
function getErrorTypeLabel(type: SQLError['type']): string {
  switch (type) {
    case 'syntax':
      return 'Syntax Error'
    case 'runtime':
      return 'Runtime Error'
    case 'connection':
      return 'Connection Error'
    case 'memory':
      return 'Memory Error'
    default:
      return 'Error'
  }
}