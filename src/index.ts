// Foundation components
export { Composer } from './components/foundation/composer'

// SQL Cockpit components
export { SQLCockpit } from './components/foundation/sql/cockpit'
export { SQLToolbar } from './components/foundation/sql/toolbar'
export { SQLEditor } from './components/foundation/sql/editor'
export { ResultsPanel } from './components/foundation/sql/results'
export { SavedQueries } from './components/foundation/sql/saved'
export { HelpDialog } from './components/foundation/sql/help'

// SQL Cockpit hooks
export { useDuckDBQuery } from './hooks/use-duckdb-query'
export { useSQLFormatter } from './hooks/use-sql-formatter'
export { useSQLAutocomplete } from './hooks/use-sql-autocomplete'

// SQL Cockpit utilities
export * from './utils/utils'

// Types
export type {
  ComposerProps,
  SQLComposerProps,
  SectionConfig,
  SQLSectionConfig,
  SectionType,
  CockpitThemeContextValue
} from './types/composer'
export type {
  SQLCockpitProps,
  QueryResult,
  QueryColumn,
  SQLError,
  SavedQuery,
  DatabaseStatus,
  SQLExecutionState,
  SQLEditorOptions,
  ResultsPanelOptions,
  ToolbarAction,
} from './types/sql'