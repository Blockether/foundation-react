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

  /**
   * List of analytical queries for data analysis
   * If provided, these will be available for execution on data sources
   */
  analyticalQueries?: AnalyticalQuery[]

  /**
   * Callback function for executing analytical queries with data source context
   */
  onExecuteAnalyticalQuery?: (
    query: AnalyticalQuery,
    dataSource?: DataSource
  ) => Promise<void>

  /**
   * Initial data sources to populate the data sources panel
   * If provided, these will be available for analytical queries immediately
   */
  initialDataSources?: DataSource[]

  /**
   * Whether to automatically drop tables when data sources are removed from initialDataSources
   * Default: false (keeps tables even if removed from prop)
   */
  autoCleanupRemovedDataSources?: boolean
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

/**
 * Analytical query category type
 * Supports both predefined categories and custom extensions
 */
export type AnalyticalQueryCategory =
  | 'summary' // Basic statistical summaries
  | 'pattern' // Data profiling and patterns
  | 'validation' // Data quality validation
  | 'insights' // Quick insights and top values
  | 'correlation' // Relationship analysis between columns
  | 'forecasting' // Time series predictions
  | 'clustering' // Customer segmentation analysis
  | 'anomaly' // Outlier and anomaly detection
  | 'trend' // Trend analysis
  | 'benchmarking' // Performance comparisons
  | 'health' // Data quality scoring
  | 'compliance' // Regulatory and compliance checks
  | string // Allow custom categories for extensibility

/**
 * Analytical query interface
 */
export interface AnalyticalQuery {
  /**
   * Unique identifier for the analytical query
   */
  id: string

  /**
   * Display name for the query
   */
  name: string

  /**
   * Description of what the query analyzes
   */
  description: string

  /**
   * Generated SQL query
   */
  query: string

  /**
   * Icon to represent the query type - can be a string (emoji) or React node
   */
  icon: string | React.ReactNode

  /**
   * Query category - extensible to support custom analysis types
   */
  category: AnalyticalQueryCategory

  /**
   * Target specific table names - if specified, query only applies to these tables
   */
  targetTables?: string[]

  /**
   * Target data source types - if specified, query only applies to these source types
   */
  targetCategories?: ('table' | 'view' | 'file' | 'url')[]
}

/**
 * Analytical query execution result
 */
export interface AnalyticalQueryResult {
  /**
   * The analytical query that was executed
   */
  query: AnalyticalQuery

  /**
   * Query execution result
   */
  result: QueryResult

  /**
   * Metadata about the execution
   */
  metadata: {
    /**
     * Execution time in milliseconds
     */
    executionTime: number

    /**
     * Source table name
     */
    tableName: string

    /**
     * Total number of rows in the source table
     */
    totalRows: number

    /**
     * Whether this was an analytical query (vs manual query)
     */
    isAnalytical: boolean
  }
}

/**
 * Column information for schema inference
 */
export interface ColumnInfo {
  /**
   * Column name
   */
  name: string

  /**
   * Column data type
   */
  type: string

  /**
   * Whether the column can contain null values
   */
  nullable: boolean
}

/**
 * Data source loading status
 */
export type DataSourceLoadingStatus =
  | 'loading'
  | 'loaded'
  | 'failed'
  | 'verification_needed'

/**
 * Data source interface for SQL Cockpit
 */
export interface DataSource {
  /**
   * Unique identifier for the data source
   */
  id: string

  /**
   * Display name for the data source
   */
  name: string

  /**
   * Type of data source
   */
  type: 'table' | 'view' | 'file' | 'url'

  /**
   * Optional description
   */
  description?: string

  /**
   * File information (for file-based sources)
   */
  file?: {
    name: string
    size: number
    type: string
  }

  /**
   * Table name in DuckDB
   */
  tableName: string

  /**
   * When the data source was created/imported
   */
  createdAt: Date

  /**
   * Icon name from Lucide React
   */
  icon?: string

  /**
   * Schema information for the data source
   */
  schema?: ColumnInfo[]

  /**
   * Available analytical queries for this data source
   */
  analyticalQueries?: AnalyticalQuery[]

  /**
   * Whether analytical queries are enabled for this data source
   */
  enableAnalysis?: boolean

  /**
   * URL to fetch data from (for url type or initial loading)
   */
  url?: string

  /**
   * File object for initial loading (for file type)
   */
  fileData?: File

  /**
   * Raw data for initial loading (alternative to url/fileData)
   */
  data?: Record<string, unknown>[]

  /**
   * Loading status of the data source
   */
  loadingStatus?: DataSourceLoadingStatus

  /**
   * Error message if loading failed
   */
  loadingError?: string
}
