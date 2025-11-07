# Data Model: SQL Cockpit Component

**Date**: 2025-11-06
**Purpose**: Component interface, types, and data flow specifications

## Component Interface Definition

### TypeScript Interface

```typescript
import { ReactNode, ComponentPropsWithoutRef } from 'react';

export interface QueryResult {
  /**
   * Query execution data rows
   */
  data: Record<string, any>[];

  /**
   * Column metadata for result display
   */
  columns: QueryColumn[];

  /**
   * Number of rows affected (for INSERT/UPDATE/DELETE)
   */
  rowCount?: number;

  /**
   * Execution time in milliseconds
   */
  executionTime: number;
}

export interface QueryColumn {
  /**
   * Column name
   */
  name: string;

  /**
   * Data type (string, number, boolean, date)
   */
  type: 'string' | 'number' | 'boolean' | 'date';

  /**
   * Whether column is nullable
   */
  nullable: boolean;
}

export interface SQLError {
  /**
   * Error message
   */
  message: string;

  /**
   * Error type (syntax, runtime, connection)
   */
  type: 'syntax' | 'runtime' | 'connection' | 'memory';

  /**
   * Line number where error occurred (if applicable)
   */
  line?: number;

  /**
   * Column number where error occurred (if applicable)
   */
  column?: number;
}

export interface SavedQuery {
  /**
   * Unique identifier for saved query
   */
  id: string;

  /**
   * Query name for display
   */
  name: string;

  /**
   * SQL query text
   */
  query: string;

  /**
   * Query description
   */
  description?: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last modification timestamp
   */
  updatedAt: Date;
}

export interface DatabaseStatus {
  /**
   * Whether database is connected and ready
   */
  isConnected: boolean;

  /**
   * Database name or identifier
   */
  databaseName?: string;

  /**
   * Connection status message
   */
  status: 'connecting' | 'connected' | 'disconnected' | 'error';

  /**
   * Error message if connection failed
   */
  error?: string;
}

export interface SQLCockpitProps
  extends ComponentPropsWithoutRef<'div'> {
  /**
   * Default SQL query to populate in the editor
   */
  initialQuery?: string;

  /**
   * Callback for query execution - provides data from DuckDB-WASM
   */
  onQueryExecute?: (query: string) => Promise<QueryResult>;

  /**
   * Whether the editor should be in read-only mode
   */
  readOnly?: boolean;

  /**
   * Whether to display line numbers in the editor
   */
  showLineNumbers?: boolean;

  /**
   * Editor theme preference
   */
  theme?: 'light' | 'dark' | 'auto';

  /**
   * Placeholder text for empty editor
   */
  placeholder?: string;

  /**
   * Additional TailwindCSS classes for customization
   */
  className?: string;

  /**
   * Child components for additional content or overlays
   */
  children?: ReactNode;

  /**
   * List of saved queries for quick selection
   */
  savedQueries?: SavedQuery[];

  /**
   * Callback when saved query is selected
   */
  onSavedQuerySelect?: (query: SavedQuery) => void;

  /**
   * Whether to show help button
   */
  showHelp?: boolean;

  /**
   * Custom help content or documentation URL
   */
  helpContent?: ReactNode;

  /**
   * Minimum height for the editor area
   */
  editorMinHeight?: string;

  /**
   * Maximum height for the results area
   */
  resultsMaxHeight?: string;
}
```

### Type Analysis

**Core Props**:
- `initialQuery`: Optional default SQL query
- `onQueryExecute`: Callback for actual query execution
- `readOnly`: Boolean for read-only editor mode
- `theme`: Light/dark/auto theme selection
- `className`: Custom styling overrides
- `savedQueries`: Predefined queries for quick access

**Extended Props** (from ComponentPropsWithoutRef):
- Standard HTML div attributes (id, aria-label, etc.)
- Event handlers (onClick, onMouseOver, etc.)
- Data attributes (data-*)
- Accessibility attributes

## Component State Model

### State Management
**Type**: Stateful functional component with controlled and uncontrolled modes

**State Flow**:
```
User Input (SQL Query)
    ↓
Monaco Editor Component
    ↓ (query string)
Query Execution Hook
    ↓ (Promise<QueryResult | SQLError>)
Results Panel Component
    ↓ (formatted table/error display)
```

**State Variables**:
```typescript
interface SQLCockpitState {
  query: string;                    // Current SQL query text
  isExecuting: boolean;            // Query execution status
  results: QueryResult | null;    // Last successful query results
  error: SQLError | null;          // Last error
  isFormatting: boolean;          // SQL formatting status
  isSavedQueryOpen: boolean;      // Saved query dropdown state
  isHelpOpen: boolean;             // Help modal/dialog state
  databaseStatus: DatabaseStatus; // Database connection status
  editorTheme: 'light' | 'dark';   // Current editor theme
}
```

### Data Transformations

**Input Processing**:
1. **Query Validation**: Basic SQL syntax checking
2. **Query Formatting**: Apply SQL formatting rules
3. **Saved Query Selection**: Load saved query into editor

**Output Generation**:
1. **Results Table**: Convert QueryResult to display format
2. **Error Display**: Format SQLError for user-friendly presentation
3. **Database Status**: Visual indication of connection state

## Monaco Editor Integration Model

### Editor Configuration

**Default Options**:
```typescript
const defaultEditorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  wordWrap: 'on',
  automaticLayout: true,
  scrollBeyondLastLine: false,
  renderLineHighlight: 'line',
  selectOnLineNumbers: true,
  roundedSelection: false,
  readOnly: false,
  cursorStyle: 'line',
  quickSuggestions: true,
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
  wordBasedSuggestions: true,
  parameterHints: { enabled: true },
  ariaLabel: 'SQL query editor',
};
```

**Theme Integration**:
```typescript
const getMonacoTheme = (theme: 'light' | 'dark') => ({
  base: theme === 'dark' ? 'vs-dark' : 'vs',
  inherit: true,
  rules: [
    { token: 'keyword.sql', foreground: theme === 'dark' ? '#C586C0' : '#0000FF' },
    { token: 'string.sql', foreground: theme === 'dark' ? '#CE9178' : '#A31515' },
    { token: 'comment.sql', foreground: theme === 'dark' ? '#6A9955' : '#008000' },
    { token: 'number.sql', foreground: theme === 'dark' ? '#B5CEA8' : '#098658' },
  ],
  colors: {
    'editor.background': theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
    'editor.foreground': theme === 'dark' ? '#D4D4D4' : '#000000',
    'editor.lineHighlightBackground': theme === 'dark' ? '#2D2D30' : '#F0F0F0',
    'editorCursor.foreground': theme === 'dark' ? '#AEAFAD' : '#000000',
    'editor.selectionBackground': theme === 'dark' ? '#264F78' : '#ADD6FF',
  },
});
```

## DuckDB-WASM Integration Model

### Query Execution Flow

**Hook Structure**:
```typescript
const useDuckDBQuery = () => {
  const [db, setDb] = useState<DuckDB | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const executeQuery = useCallback(async (sql: string): Promise<QueryResult> => {
    if (!db) throw new Error('Database not connected');

    const startTime = performance.now();
    const conn = await db.connect();

    try {
      const result = await conn.query(sql);
      const executionTime = performance.now() - startTime;

      return {
        data: result.toArray(),
        columns: result.schema.fields.map(field => ({
          name: field.name,
          type: mapDuckDBTypeToType(field.type),
          nullable: field.nullable,
        })),
        executionTime,
      };
    } finally {
      await conn.close();
    }
  }, [db]);

  return { executeQuery, isConnecting, connectionError };
};
```

**Data Type Mapping**:
```typescript
const mapDuckDBTypeToType = (duckDBType: string): QueryColumn['type'] => {
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
};
```

## Results Display Model

### Table Structure

**Result Table Interface**:
```typescript
interface ResultsTableProps {
  results: QueryResult;
  maxHeight?: string;
  onRowClick?: (row: Record<string, any>) => void;
  selectedRows?: number[];
}

interface ColumnConfig {
  key: string;
  name: string;
  type: QueryColumn['type'];
  width?: string;
  sortable?: boolean;
  filterable?: boolean;
}
```

**Cell Rendering**:
```typescript
const renderCell = (value: any, type: QueryColumn['type']) => {
  switch (type) {
    case 'boolean':
      return value ? '✓' : '✗';
    case 'date':
      return new Date(value).toLocaleString();
    case 'number':
      return typeof value === 'number' ? value.toLocaleString() : value;
    default:
      return String(value || '');
  }
};
```

## Error Handling Model

### Error Classification

**Error Types**:
```typescript
const classifyError = (error: Error): SQLError['type'] => {
  if (error.message.includes('Parser Error') || error.message.includes('syntax')) {
    return 'syntax';
  }
  if (error.message.includes('Out of Memory')) {
    return 'memory';
  }
  if (error.message.includes('Connection') || error.message.includes('Worker')) {
    return 'connection';
  }
  return 'runtime';
};
```

**Error Display**:
```typescript
const formatError = (error: SQLError): ReactNode => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <span className="font-medium">
          {error.type === 'syntax' ? 'SQL Syntax Error' :
           error.type === 'memory' ? 'Memory Error' :
           error.type === 'connection' ? 'Connection Error' :
           'Runtime Error'}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      {error.line && (
        <p className="text-xs text-muted-foreground">
          Line {error.line}{error.column ? `, Column ${error.column}` : ''}
        </p>
      )}
    </div>
  );
};
```

## Performance Data Model

### Optimization Strategies

**Result Pagination**:
```typescript
interface PaginatedResults {
  data: Record<string, any>[];
  totalRows: number;
  pageSize: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const paginateResults = (
  data: Record<string, any>[],
  pageSize: number = 100
): PaginatedResults => ({
  data: data.slice(0, pageSize),
  totalRows: data.length,
  pageSize,
  currentPage: 1,
  hasNextPage: data.length > pageSize,
  hasPreviousPage: false,
});
```

**Memory Monitoring**:
```typescript
const useMemoryMonitoring = () => {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [isHighMemoryUsage, setIsHighMemoryUsage] = useState(false);

  useEffect(() => {
    const monitor = () => {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize;
        const limit = performance.memory.jsHeapSizeLimit;
        const usage = (used / limit) * 100;

        setMemoryUsage(usage);
        setIsHighMemoryUsage(usage > 80); // 80% threshold
      }
    };

    const interval = setInterval(monitor, 1000);
    return () => clearInterval(interval);
  }, []);

  return { memoryUsage, isHighMemoryUsage };
};
```

## Testing Data Model

### Test Fixtures

**Mock Data**:
```typescript
export const mockQueryResults: QueryResult = {
  data: [
    { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
  ],
  columns: [
    { name: 'id', type: 'number', nullable: false },
    { name: 'name', type: 'string', nullable: false },
    { name: 'email', type: 'string', nullable: false },
    { name: 'active', type: 'boolean', nullable: false },
  ],
  executionTime: 45.2,
};

export const mockSQLError: SQLError = {
  message: 'Syntax error near "FORM"',
  type: 'syntax',
  line: 1,
  column: 15,
};

export const mockSavedQueries: SavedQuery[] = [
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
    name: 'Active Users Count',
    query: 'SELECT COUNT(*) as active_users FROM users WHERE active = true;',
    description: 'Count of currently active users',
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-02'),
  },
];
```

## Export Data Model

### Module Exports
```typescript
// Main component export
export { SQLCockpit };

// Type exports for TypeScript users
export type {
  SQLCockpitProps,
  QueryResult,
  QueryColumn,
  SQLError,
  SavedQuery,
  DatabaseStatus
};

// Hook exports for advanced usage
export { useDuckDBQuery, useSQLFormatter };

// Utility exports
export { formatSQLQuery, validateSQLSyntax };

// Default export
export default SQLCockpit;
```

### ESM Bundle Structure
```javascript
// In final ESM bundle
export { SQLCockpit } from './components/sql/sql-cockpit';
export type { SQLCockpitProps } from './types/sql';
export { useDuckDBQuery } from './hooks/use-duckdb-query';
```

## Validation Rules

### Props Validation
```typescript
const validationRules = {
  initialQuery: {
    required: false,
    type: 'string',
    validator: (value) => typeof value === 'string',
  },
  onQueryExecute: {
    required: false,
    type: 'function',
    validator: (value) => typeof value === 'function',
  },
  readOnly: {
    required: false,
    type: 'boolean',
    default: false,
    validator: (value) => typeof value === 'boolean',
  },
  theme: {
    required: false,
    type: 'string',
    enum: ['light', 'dark', 'auto'],
    default: 'auto',
  },
};
```

### Runtime Validation
- TypeScript compile-time checking (primary)
- PropTypes runtime checking (optional, development only)
- Console warnings for invalid props (development only)
- Error boundaries for graceful degradation

This data model provides the foundation for implementing the SQL Cockpit component with full type safety, proper error handling, and optimal performance characteristics.