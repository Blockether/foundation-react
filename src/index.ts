import "./styles/globals.css"

export { ThemeProvider, useTheme } from './components/theme'

// SQL Cockpit components
export { SQLCockpit } from './components/sql/cockpit'
export { SQLEditor } from './components/sql/editor'
export { SQLToolbar } from './components/sql/toolbar'
export { ResultsPanel } from './components/sql/results'
export { DataSources } from './components/sql/datasources'

// SQL Cockpit hooks
export { useSQLFormatter } from './hooks/use-sql-formatter'
export { useTableColumnSync } from './hooks/use-table-column-sync'
export { useCopyColumn, usePagination } from './lib/hooks'

// DuckDB integration
export * from './lib/duckdb'

// Types
export type {
  SQLCockpitProps,
  QueryResult,
  QueryColumn,
  SQLError,
  SavedQuery,
  SQLExecutionState,
  SQLEditorOptions,
  ResultsPanelOptions,
  ToolbarAction,
  DataSource,
  DataSourceLoadingStatus,
  AnalyticalQuery,
} from './types/sql'
