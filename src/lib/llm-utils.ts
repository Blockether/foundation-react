/**
 * LLM Utility Functions
 *
 * Utility functions for LLM completion and prompt formatting.
 */


/**
 * Format LLM completion prompt with data sources context
 */
export const formatLLMCompletionPrompt = async (params: {
  userRequest: string
  dataSources: Array<{
    name: string
    tableName: string
    description?: string
    schema?: Array<{
      name: string
      type: string
      nullable: boolean
    }>
    sampleData?: Array<Record<string, any>>
  }>
  currentQuery: string
}): Promise<string> => {
  let comments = `-- Supported SQL Dialect: DuckDB SQL (https://duckdb.org/docs/stable/sql/introduction)\n--\n-- User Request: ${params.userRequest.trim()}\n--\n-- Available Data Sources:\n`

  params.dataSources.forEach((ds: any) => {
    comments += `-- ${ds.name} (${ds.tableName})`
    if (ds.description) {
      comments += ` - ${ds.description}`
    }
    if (ds.schema && ds.schema.length > 0) {
      comments += `\n--   Columns: ${ds.schema.map((col: any) => `${col.name} (${col.type})${col.nullable ? ' | null' : ''}`).join(', ')}`
    }
    if (ds.sampleData && ds.sampleData.length > 0) {
      comments += `\n--   Sample Data retrieved via \`SELECT * from ${ds.tableName} LIMIT 3\`: ${JSON.stringify(ds.sampleData.slice(0, 3))}`
    }
    comments += '\n'
  })

  comments += `-- Current Query: ${params.currentQuery}\n\n`

  return comments + 'Based on the user request and available data sources, please generate an SQL query that:'
}