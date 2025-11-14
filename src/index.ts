import './styles/globals.css'

export { ThemeProvider, useTheme } from './components/theme'

// AI Assistant components
export { AssistantCockpit } from './components/cockpit/ai/assistant'

// SQL Cockpit components
export { SQLCockpit } from './components/cockpit/sql/cockpit'
export { SQLEditor } from './components/cockpit/sql/editor'
export { SQLToolbar } from './components/cockpit/sql/toolbar'
export { ResultsPanel } from './components/cockpit/sql/results'
export { DataSources } from './components/cockpit/sql/datasources'

// SQL Cockpit hooks
export { useSQLFormatter } from './hooks/use-sql-formatter'
export { useTableColumnSync } from './hooks/use-table-column-sync'
export { useCopyColumn, usePagination } from './lib/hooks'

// DuckDB integration
export * from './lib/duckdb'

// LLM utilities
export { formatLLMCompletionPrompt } from './lib/llm-utils'

// Composer component
export { Composer } from './components/cockpit/composer'

// Shadow DOM utilities
export { ShadowDOMProvider, useShadowDOM } from './lib/shadow-dom'

// AI Assistant types
export type {
  AssistantCockpitProps,
  ActionMenuItem,
  ActionCallbacks,
  Context,
  State,
  Tool,
  ToastStatus,
  Message as AIMessage,
  ChatSession,
} from './components/cockpit/ai/assistant'

// SQL Types
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
  InsightsQuery,
} from './types/sql'
