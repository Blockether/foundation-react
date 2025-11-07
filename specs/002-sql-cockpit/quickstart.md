# Quickstart Guide: SQL Cockpit Component

**Date**: 2025-11-06
**Purpose**: Developer usage guide and integration examples for the SQL Cockpit component

## Overview

The SQL Cockpit is a comprehensive SQL query interface that integrates Monaco Editor and DuckDB-WASM for browser-based SQL execution. It provides a professional development experience with syntax highlighting, query formatting, and real-time results display, all while maintaining the shadcn/ui design system and TailwindCSS theming.

## Installation

```bash
npm install @blockether/foundation-react
# or
pnpm add @blockether/foundation-react
# or
yarn add @blockether/foundation-react
```

## Basic Usage

### Import

```typescript
import { SQLCockpit } from '@blockether/foundation-react';
```

### Simple Example

```tsx
import { SQLCockpit } from '@blockether/foundation-react';

function App() {
  const handleQueryExecute = async (query: string) => {
    // Your DuckDB-WASM integration here
    const results = await executeDuckDBQuery(query);
    return results;
  };

  return (
    <div style={{ height: '600px' }}>
      <SQLCockpit onQueryExecute={handleQueryExecute} />
    </div>
  );
}
```

## Props Reference

### SQLCockpitProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onQueryExecute` | `(query: string) => Promise<QueryResult>` | `undefined` | Callback for executing SQL queries |
| `initialQuery` | `string` | `undefined` | Default SQL query for the editor |
| `readOnly` | `boolean` | `false` | Whether the editor is read-only |
| `showLineNumbers` | `boolean` | `true` | Whether to show line numbers in editor |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Editor theme preference |
| `placeholder` | `string` | `"Enter your SQL query here..."` | Placeholder text for empty editor |
| `className` | `string` | `undefined` | Additional TailwindCSS classes |
| `savedQueries` | `SavedQuery[]` | `[]` | List of saved queries for quick access |
| `onSavedQuerySelect` | `(query: SavedQuery) => void` | `undefined` | Callback when saved query is selected |
| `showHelp` | `boolean` | `true` | Whether to show help button |
| `helpContent` | `ReactNode \| string` | `undefined` | Custom help content or documentation URL |
| `editorMinHeight` | `string` | `'300px'` | Minimum height for editor area |
| `resultsMaxHeight` | `string` | `'400px'` | Maximum height for results area |

## Examples

### Basic SQL Editor

```tsx
import { SQLCockpit } from '@blockether/foundation-react';

function BasicSQLEditor() {
  return (
    <SQLCockpit
      initialQuery="SELECT * FROM users;"
      placeholder="Type your SQL query here..."
    />
  );
}
```

### With Custom Query Execution

```tsx
import { SQLCockpit } from '@blockether/foundation-react';
import { createDuckDB } from '@duckdb/duckdb-wasm';

function InteractiveSQLEditor() {
  const [db, setDb] = useState(null);

  useEffect(() => {
    const initDB = async () => {
      const duckdb = await createDuckDB();
      setDb(duckdb);
    };
    initDB();
  }, []);

  const handleQueryExecute = async (query: string) => {
    if (!db) throw new Error('Database not initialized');

    const startTime = performance.now();
    const conn = await db.connect();

    try {
      const result = await conn.query(query);
      const executionTime = performance.now() - startTime;

      return {
        data: result.toArray(),
        columns: result.schema.fields.map(field => ({
          name: field.name,
          type: mapDuckDBType(field.type),
          nullable: field.nullable,
        })),
        executionTime,
      };
    } finally {
      await conn.close();
    }
  };

  return (
    <SQLCockpit
      onQueryExecute={handleQueryExecute}
      placeholder="Execute SQL queries against DuckDB-WASM..."
    />
  );
}

function mapDuckDBType(duckDBType: string) {
  switch (duckDBType.toLowerCase()) {
    case 'varchar':
    case 'text':
      return 'string';
    case 'integer':
    case 'bigint':
    case 'double':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
    case 'timestamp':
      return 'date';
    default:
      return 'string';
  }
}
```

### With Saved Queries

```tsx
import { SQLCockpit } from '@blockether/foundation-react';

function SQLEditorWithSavedQueries() {
  const savedQueries = [
    {
      id: '1',
      name: 'All Users',
      query: 'SELECT * FROM users ORDER BY created_at DESC;',
      description: 'Retrieve all users sorted by creation date',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    },
    {
      id: '2',
      name: 'Active Users',
      query: 'SELECT * FROM users WHERE active = true;',
      description: 'Get only active users',
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    },
  ];

  const handleSavedQuerySelect = (query) => {
    console.log('Selected query:', query.name);
    // You could also automatically execute the query
  };

  return (
    <SQLCockpit
      savedQueries={savedQueries}
      onSavedQuerySelect={handleSavedQuerySelect}
      initialQuery={savedQueries[0].query}
    />
  );
}
```

### Custom Theming

```tsx
import { SQLCockpit } from '@blockether/foundation-react';

function ThemedSQLEditor() {
  return (
    <div className="dark">
      <SQLCockpit
        theme="dark"
        className="border-blue-200 shadow-lg"
        editorMinHeight="400px"
        resultsMaxHeight="500px"
      />
    </div>
  );
}
```

### With Help Documentation

```tsx
import { SQLCockpit } from '@blockether/foundation-react';

function SQLEditorWithHelp() {
  const helpContent = (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">How to Use SQL Cockpit</h3>

      <div>
        <h4 className="font-medium mb-2">Basic SQL Commands</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code>SELECT</code> - Retrieve data from tables</li>
          <li><code>INSERT</code> - Add new records</li>
          <li><code>UPDATE</code> - Modify existing records</li>
          <li><code>DELETE</code> - Remove records</li>
        </ul>
      </div>

      <div>
        <h4 className="font-medium mb-2">Keyboard Shortcuts</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><kbd>Ctrl</kbd> + <kbd>Enter</kbd> - Execute query</li>
          <li><kbd>Ctrl</kbd> + <kbd>S</kbd> - Format query</li>
          <li><kbd>Ctrl</kbd> + <kbd>/</kbd> - Toggle comment</li>
        </ul>
      </div>

      <div>
        <h4 className="font-medium mb-2">Documentation</h4>
        <p className="text-sm text-muted-foreground mb-2">
          For comprehensive SQL documentation, visit:
        </p>
        <a
          href="https://duckdb.org/docs/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline text-sm"
        >
          DuckDB Documentation
        </a>
      </div>
    </div>
  );

  return (
    <SQLCockpit
      helpContent={helpContent}
      placeholder="Try: SELECT column_name FROM table_name;"
    />
  );
}
```

### Read-only Mode

```tsx
import { SQLCockpit } from '@blockether/foundation-react';

function ReadOnlySQLEditor() {
  const query = `-- This is a read-only SQL example
SELECT
  user_id,
  username,
  email,
  created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 10;`;

  return (
    <SQLCockpit
      initialQuery={query}
      readOnly={true}
      showLineNumbers={true}
      theme="light"
    />
  );
}
```

### Embedded in Foundation Cockpit

```tsx
import { CockpitsComposer } from '@blockether/foundation-react';
import { SQLCockpit } from '@blockether/foundation-react';

function EmbeddedSQLEditor() {
  return (
    <CockpitsComposer className="p-4">
      <h2 className="text-xl font-semibold mb-4">SQL Query Interface</h2>
      <SQLCockpit
        onQueryExecute={async (query) => {
          // Your DuckDB-WASM implementation
          console.log('Executing:', query);
          return {
            data: [],
            columns: [],
            executionTime: 0,
          };
        }}
        editorMinHeight="350px"
        className="border-0"
      />
    </CockpitsComposer>
  );
}
```

## DuckDB-WASM Integration

### Complete Example

```tsx
import { useState, useEffect, useCallback } from 'react';
import { SQLCockpit } from '@blockether/foundation-react';
import { createDuckDB, selectBundle } from '@duckdb/duckdb-wasm';

const DUCKDB_BUNDLES = {
  mvp: {
    mainModule: '/duckdb-mvp.wasm',
    mainWorker: '/duckdb-node-mvp.worker.js',
  },
  eh: {
    mainModule: '/duckdb-eh.wasm',
    mainWorker: '/duckdb-node-eh.worker.js',
  },
};

function DuckDBSQLEditor() {
  const [db, setDb] = useState(null);
  const [status, setStatus] = useState('initializing');

  useEffect(() => {
    const initializeDB = async () => {
      try {
        setStatus('connecting');
        const bundle = selectBundle(DUCKDB_BUNDLES);
        const duckdb = await createDuckDB(bundle);
        setDb(duckdb);
        setStatus('connected');
      } catch (error) {
        console.error('Failed to initialize DuckDB:', error);
        setStatus('error');
      }
    };

    initializeDB();
  }, []);

  const handleQueryExecute = useCallback(async (query: string) => {
    if (!db || status !== 'connected') {
      throw new Error('Database not connected');
    }

    const startTime = performance.now();
    const conn = await db.connect();

    try {
      const result = await conn.query(query);
      const executionTime = performance.now() - startTime;

      return {
        data: result.toArray(),
        columns: result.schema.fields.map(field => ({
          name: field.name,
          type: mapDuckDBType(field.type),
          nullable: field.nullable,
        })),
        executionTime,
      };
    } finally {
      await conn.close();
    }
  }, [db, status]);

  if (status === 'initializing' || status === 'connecting') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Initializing database...</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-destructive">
          Failed to initialize database. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <SQLCockpit
      onQueryExecute={handleQueryExecute}
      placeholder="Execute SQL queries against DuckDB..."
      initialQuery="-- DuckDB is ready!\n-- Try: SELECT 'Hello, DuckDB!' as greeting;"
    />
  );
}

function mapDuckDBType(duckDBType: string): QueryColumn['type'] {
  switch (duckDBType.toLowerCase()) {
    case 'varchar':
    case 'text':
    case 'char':
      return 'string';
    case 'integer':
    case 'bigint':
    case 'double':
    case 'float':
    case 'decimal':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'date':
    case 'timestamp':
      return 'date';
    default:
      return 'string';
  }
}
```

## Data Management

### Query Results

The `QueryResult` interface returned by `onQueryExecute`:

```typescript
interface QueryResult {
  data: Record<string, any>[];        // Array of result rows
  columns: QueryColumn[];              // Column metadata
  rowCount?: number;                  // Affected rows (for INSERT/UPDATE/DELETE)
  executionTime: number;              // Execution time in milliseconds
}

interface QueryColumn {
  name: string;                        // Column name
  type: 'string' | 'number' | 'boolean' | 'date';  // Data type
  nullable: boolean;                   // Whether column allows nulls
}
```

### Error Handling

```tsx
function SQLEditorWithErrorHandling() {
  const [error, setError] = useState(null);

  const handleQueryExecute = async (query: string) => {
    try {
      setError(null);
      const results = await executeQuery(query);
      return results;
    } catch (err) {
      setError(err);
      throw err; // Re-throw to let SQL Cockpit display the error
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
          <p className="text-sm text-destructive">Global error: {error.message}</p>
        </div>
      )}
      <SQLCockpit onQueryExecute={handleQueryExecute} />
    </div>
  );
}
```

## Styling and Theming

### Custom Styling

```tsx
function CustomStyledSQLEditor() {
  return (
    <SQLCockpit
      className="border-2 border-blue-300 shadow-xl rounded-lg"
      editorMinHeight="500px"
      resultsMaxHeight="600px"
      theme="auto"
    />
  );
}
```

### Dark Mode Integration

```tsx
function DarkModeSQLEditor() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="flex items-center justify-between mb-4">
        <h2>SQL Editor</h2>
        <button
          onClick={() => setIsDark(!isDark)}
          className="px-3 py-1 rounded border"
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <SQLCockpit theme={isDark ? 'dark' : 'light'} />
    </div>
  );
}
```

## Testing

### Component Testing

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SQLCockpit } from '@blockether/foundation-react';

describe('SQLCockpit', () => {
  it('executes queries correctly', async () => {
    const mockExecute = jest.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Test' }],
      columns: [
        { name: 'id', type: 'number', nullable: false },
        { name: 'name', type: 'string', nullable: false },
      ],
      executionTime: 50,
    });

    render(<SQLCockpit onQueryExecute={mockExecute} />);

    const user = userEvent.setup();
    const editor = screen.getByRole('textbox');
    const runButton = screen.getByRole('button', { name: /run query/i });

    await user.type(editor, 'SELECT * FROM test;');
    await user.click(runButton);

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith('SELECT * FROM test;');
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
```

## Best Practices

### Performance Optimization

```tsx
import { memo, useCallback, useMemo } from 'react';

const OptimizedSQLEditor = memo(({ onQueryExecute, ...props }) => {
  const handleQueryExecute = useCallback(async (query: string) => {
    // Add query caching if needed
    const cacheKey = query.trim().toLowerCase();
    // ... caching logic

    return onQueryExecute(query);
  }, [onQueryExecute]);

  const savedQueries = useMemo(() => [
    // Expensive computations here
  ], []);

  return (
    <SQLCockpit
      {...props}
      onQueryExecute={handleQueryExecute}
      savedQueries={savedQueries}
    />
  );
});
```

## Troubleshooting

### Common Issues

**Q: Monaco Editor doesn't load**
```tsx
// Ensure you're importing the component correctly
import { SQLCockpit } from '@blockether/foundation-react';

// Check browser console for worker loading errors
// Make sure your server serves WASM files with correct MIME types
```

**Q: DuckDB queries fail**
```tsx
// Check if DuckDB-WASM is properly initialized
const [db, setDb] = useState(null);

useEffect(() => {
  const init = async () => {
    try {
      const duckdb = await createDuckDB();
      setDb(duckdb);
    } catch (error) {
      console.error('DuckDB initialization failed:', error);
    }
  };
  init();
}, []);
```

**Q: Results don't display**
```tsx
// Ensure your QueryResult has the correct structure
const result = {
  data: [{ id: 1, name: 'test' }],  // Array of objects
  columns: [                           // Array of column metadata
    { name: 'id', type: 'number', nullable: false },
    { name: 'name', type: 'string', nullable: false },
  ],
  executionTime: 100,                 // Required execution time
};
```

**Q: Styling issues**
```tsx
// Make sure TailwindCSS is properly configured
// Check that your component is wrapped in a container with defined height
<div style={{ height: '600px' }}>
  <SQLCockpit />
</div>
```

## Migration Guide

### From Regular Text Area

```tsx
// Before
<textarea value={query} onChange={handleChange} />

// After
<SQLCockpit
  initialQuery={query}
  onQueryExecute={handleQueryExecute}
/>
```

### From Other SQL Editors

```tsx
// Before
<OtherSQLEditor value={query} onExecute={executeQuery} />

// After
<SQLCockpit
  initialQuery={query}
  onQueryExecute={executeQuery}
  theme="dark"  // Additional theming support
  savedQueries={savedQueries}  // Built-in saved queries
/>
```

## Support

For issues, questions, or contributions:
- GitHub Repository: [link to repo]
- Documentation: [link to docs]
- Monaco Editor: https://microsoft.github.io/monaco-editor/
- DuckDB-WASM: https://duckdb.org/docs/api/wasm/