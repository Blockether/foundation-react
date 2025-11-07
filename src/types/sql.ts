/**
 * SQL Cockpit component types
 *
 * These interfaces define the complete data model for the SQL Cockpit component,
 * including query execution, results, errors, and saved queries.
 */

import { ReactNode, ComponentPropsWithoutRef } from 'react'

/**
 * SQL Cockpit component interface
 *
 * A comprehensive SQL query interface that integrates Monaco Editor and DuckDB-WASM
 * for browser-based SQL execution with professional toolbar, syntax highlighting,
 * and formatted results display.
 */
export interface SQLCockpitProps extends ComponentPropsWithoutRef<'div'> {
  /**
   * Default SQL query to populate in the editor when component loads
   */
  initialQuery?: string

  /**
   * Callback function for executing SQL queries with DuckDB-WASM
   */
  onQueryExecute?: (query: string) => Promise<QueryResult>

  /**
   * Whether the SQL editor should be in read-only mode
   */
  readOnly?: boolean

  /**
   * Whether to display line numbers in the Monaco editor
   */
  showLineNumbers?: boolean

  /**
   * Editor theme preference
   */
  theme?: 'light' | 'dark' | 'auto'

  /**
   * Placeholder text to display in the editor when empty
   */
  placeholder?: string

  /**
   * Additional TailwindCSS classes for customization
   */
  className?: string

  /**
   * Child components to be rendered within the cockpit container
   */
  children?: ReactNode

  /**
   * List of saved queries for quick selection from toolbar
   */
  savedQueries?: SavedQuery[]

  /**
   * Callback when a saved query is selected from the dropdown
   */
  onSavedQuerySelect?: (query: SavedQuery) => void

  /**
   * Whether to show the help button in the toolbar
   */
  showHelp?: boolean

  /**
   * Custom help content or documentation URL
   */
  helpContent?: ReactNode | string

  /**
   * Maximum height for the results display area
   */
  resultsMaxHeight?: string
}

/**
 * Query execution result interface
 */
export interface QueryResult {
  /**
   * Array of data rows returned by the query
   */
  data: Record<string, unknown>[]

  /**
   * Column metadata for the result set
   */
  columns: QueryColumn[]

  /**
   * Number of rows affected (for INSERT/UPDATE/DELETE queries)
   */
  rowCount?: number

  /**
   * Query execution time in milliseconds
   */
  executionTime: number

  /**
   * Whether the query has more results (for pagination)
   */
  hasMore?: boolean

  /**
   * Total count of results (if available)
   */
  totalCount?: number
}

/**
 * Query column metadata interface
 */
export interface QueryColumn {
  /**
   * Column name
   */
  name: string

  /**
   * Column data type
   */
  type: 'string' | 'number' | 'boolean' | 'date' | 'binary'

  /**
   * Whether the column can contain null values
   */
  nullable: boolean

  /**
   * Column size or precision (if applicable)
   */
  size?: number

  /**
   * Column description or comment
   */
  description?: string
}

/**
 * SQL execution error interface
 */
export interface SQLError {
  /**
   * Error type classification
   */
  type:
    | 'syntax'
    | 'runtime'
    | 'connection'
    | 'memory'
    | 'permission'
    | 'timeout'

  /**
   * Human-readable error message
   */
  message: string

  /**
   * Error code (if available)
   */
  code?: string | number

  /**
   * Line number where error occurred (if applicable)
   */
  line?: number

  /**
   * Column number where error occurred (if applicable)
   */
  column?: number

  /**
   * SQL statement that caused the error
   */
  statement?: string

  /**
   * Stack trace or additional error details
   */
  details?: string
}

/**
 * Saved query interface
 */
export interface SavedQuery {
  /**
   * Unique identifier for the saved query
   */
  id: string

  /**
   * Display name for the query
   */
  name: string

  /**
   * Optional description of what the query does
   */
  description?: string

  /**
   * The actual SQL query text
   */
  query: string

  /**
   * Tags for categorizing queries
   */
  tags?: string[]

  /**
   * When the query was created
   */
  createdAt: Date

  /**
   * When the query was last modified
   */
  updatedAt: Date

  /**
   * Number of times this query has been executed
   */
  executionCount?: number

  /**
   * Average execution time in milliseconds
   */
  averageExecutionTime?: number

  /**
   * Whether this query is a favorite/bookmarked
   */
  isFavorite?: boolean
}

/**
 * SQL execution state interface
 */
export interface SQLExecutionState {
  /**
   * Whether a query is currently executing
   */
  isExecuting: boolean

  /**
   * Current execution progress (0-100)
   */
  progress?: number

  /**
   * Status message during execution
   */
  status?: string

  /**
   * Execution start time
   */
  startTime?: Date

  /**
   * Current query being executed
   */
  currentQuery?: string
}

/**
 * SQL editor options interface
 */
export interface SQLEditorOptions {
  /**
   * Whether to enable SQL syntax highlighting
   */
  enableSyntaxHighlighting?: boolean

  /**
   * Whether to enable SQL autocompletion
   */
  enableAutoComplete?: boolean

  /**
   * Whether to enable query formatting
   */
  enableFormatting?: boolean

  /**
   * Editor font size
   */
  fontSize?: number

  /**
   * Editor tab size
   */
  tabSize?: number

  /**
   * Whether to wrap long lines
   */
  wordWrap?: boolean

  /**
   * Whether to show the minimap
   */
  minimap?: boolean

  /**
   * Editor theme
   */
  theme?: 'light' | 'dark' | 'auto'
}

/**
 * Results panel options interface
 */
export interface ResultsPanelOptions {
  /**
   * Maximum height for the results panel
   */
  maxHeight?: string

  /**
   * Message to show when no results are available
   */
  emptyMessage?: string

  /**
   * Whether to show row numbers
   */
  showRowNumbers?: boolean

  /**
   * Whether to enable column resizing
   */
  enableColumnResize?: boolean

  /**
   * Whether to enable column sorting
   */
  enableColumnSort?: boolean

  /**
   * Maximum number of rows to display
   */
  maxRows?: number

  /**
   * Export options
   */
  exportFormats?: ('csv' | 'json' | 'excel')[]
}

/**
 * Toolbar action interface
 */
export interface ToolbarAction {
  /**
   * Action identifier
   */
  id: string

  /**
   * Display label for the action
   */
  label: string

  /**
   * Icon component or name
   */
  icon?: ReactNode

  /**
   * Keyboard shortcut
   */
  shortcut?: string

  /**
   * Action handler function
   */
  handler: () => void

  /**
   * Whether the action is currently disabled
   */
  disabled?: boolean

  /**
   * Tooltip text for the action
   */
  tooltip?: string

  /**
   * Action variant/style
   */
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost'
}
