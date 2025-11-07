# @blockether/foundation-react

React-based chat UI foundation with integrated SQL analysis capabilities.

## Installation

```bash
npm install @blockether/foundation-react
# or
pnpm add @blockether/foundation-react
# or
yarn add @blockether/foundation-react
```

## Quick Start

### Basic SQL Cockpit Usage

The SQL Cockpit component provides a complete SQL query interface with Monaco Editor integration and DuckDB-WASM support. **Important:** The SQL Cockpit should always be wrapped within a `CockpitsComposer` component.

```tsx
import { CockpitsComposer, SQLCockpit } from '@blockether/foundation-react'

function App() {
  return (
    <CockpitsComposer className="p-6">
      <SQLCockpit
        initialQuery="SELECT * FROM users WHERE active = true;"
        placeholder="Enter your SQL query here..."
        editorMinHeight="400px"
        resultsMaxHeight="500px"
      />
    </CockpitsComposer>
  )
}
```

### Advanced Example with Saved Queries

```tsx
import { CockpitsComposer, SQLCockpit } from '@blockether/foundation-react'

function AdvancedSQLApp() {
  const savedQueries = [
    {
      id: '1',
      name: 'Active Users',
      description: 'Get all active users',
      query: 'SELECT * FROM users WHERE active = true ORDER BY created_at DESC;',
      tags: ['users', 'filter'],
      createdAt: new Date(),
      updatedAt: new Date(),
      executionCount: 15,
      averageExecutionTime: 45,
      isFavorite: true,
    },
  ]

  const handleQueryExecute = async (query: string) => {
    // Execute query with DuckDB-WASM
    console.log('Executing query:', query)
    return { data: [], columns: [], executionTime: 0 }
  }

  return (
    <CockpitsComposer className="p-6">
      <SQLCockpit
        initialQuery="SELECT * FROM users;"
        onQueryExecute={handleQueryExecute}
        savedQueries={savedQueries}
        showHelp={true}
        theme="auto"
      />
    </CockpitsComposer>
  )
}
```

## Architecture

### Foundation Cockpit Pattern

The `CockpitsComposer` component serves as the foundational container for all Blockether components:

```tsx
// ✅ Correct - Always wrap SQL Cockpit in Foundation Cockpit
<CockpitsComposer className="p-6">
  <SQLCockpit {...props} />
</CockpitsComposer>

// ❌ Incorrect - SQL Cockpit should not be used standalone
<SQLCockpit {...props} />
```

### Component Hierarchy

```
CockpitsComposer (Container)
└── SQLCockpit (SQL Interface)
    ├── SQLToolbar (Action Bar)
    ├── SQLEditor (Monaco Editor)
    └── ResultsPanel (Query Results)
```

## Components

### SQL Cockpit Components

- **SQLCockpit**: Main SQL query interface component
- **SQLToolbar**: Professional toolbar with Run/Format/Help actions
- **SQLEditor**: Monaco Editor wrapper with SQL language support
- **ResultsPanel**: Query results display with formatted tables
- **SavedQueries**: Dropdown for managing saved SQL queries
- **HelpDialog**: Modal dialog for help content and keyboard shortcuts

### Foundation Components

- **CockpitsComposer**: Foundational container component
- **Card**: shadcn/ui Card component

## Hooks

### SQL Cockpit Hooks

- **useDuckDBQuery**: DuckDB-WASM integration for query execution
- **useSQLFormatter**: SQL query formatting with multiple dialects
- **useSQLAutocomplete**: Comprehensive SQL autocomplete functionality

```tsx
import { useDuckDBQuery } from '@blockether/foundation-react'

function MyComponent() {
  const { databaseStatus, executeQuery, result, error } = useDuckDBQuery({
    autoConnect: true
  })

  // Use the hook for query execution
  const handleRunQuery = async () => {
    try {
      const result = await executeQuery('SELECT * FROM users')
      console.log('Query result:', result)
    } catch (error) {
      console.error('Query error:', error)
    }
  }
}
```

## SQL Utilities

The library provides comprehensive SQL utility functions:

```tsx
import {
  validateSQL,
  formatSQL,
  extractTableNames,
  calculateQueryComplexity,
  naturalLanguageToSQL,
  csvToSQLInsert
} from '@blockether/foundation-react'

// Validate SQL syntax
const validation = validateSQL('SELECT * FROM users')
console.log(validation.isValid) // true

// Format SQL
const formatted = formatSQL('select * from users where active=true', {
  uppercase: true,
  indent: '  '
})

// Extract table names
const tables = extractTableNames('SELECT u.* FROM users u JOIN orders o ON u.id = o.user_id')
// ['users', 'orders']

// Calculate query complexity
const complexity = calculateQueryComplexity('SELECT * FROM users u JOIN orders o ON u.id = o.user_id WHERE u.active = true')
// { score: 10, level: 'moderate', factors: ['1 JOIN'] }
```

## TypeScript Support

All components are fully typed with comprehensive TypeScript interfaces:

```tsx
import type {
  SQLCockpitProps,
  QueryResult,
  SQLError,
  DatabaseStatus,
  SavedQuery
} from '@blockether/foundation-react'

interface MyCustomSQLEditorProps extends SQLCockpitProps {
  customTheme?: 'dark' | 'light'
  onCustomAction?: () => void
}
```

## Examples

See the exported example components for complete implementation patterns:

- **SQLCockpitExample**: Basic integration with saved queries
- **MultiSQLCockpitExample**: Tabbed interface with multiple SQL editors
- **FullPageSQLCockpitExample**: Full-page application with sidebar navigation

```tsx
import { SQLCockpitExample, MultiSQLCockpitExample, FullPageSQLCockpitExample } from '@blockether/foundation-react'

function Demo() {
  return <SQLCockpitExample />
}
```

## License

MIT