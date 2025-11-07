# Component Interface Contract: SQL Cockpit

**Version**: 1.0.0
**Date**: 2025-11-06
**Component**: SQLCockpit

## Interface Specification

### TypeScript Interface

```typescript
import { ReactNode, ComponentPropsWithoutRef } from 'react';

/**
 * SQL Cockpit component interface
 *
 * A comprehensive SQL query interface that integrates Monaco Editor and DuckDB-WASM
 * for browser-based SQL execution with professional toolbar, syntax highlighting,
 * and formatted results display.
 */
export interface SQLCockpitProps
  extends ComponentPropsWithoutRef<'div'> {

  /**
   * Default SQL query to populate in the editor when component loads
   *
   * @type string
   * @default undefined
   * @required false
   * @example "SELECT * FROM users WHERE active = true;"
   */
  initialQuery?: string;

  /**
   * Callback function for executing SQL queries with DuckDB-WASM
   *
   * The component will call this function when the user clicks "Run Query".
   * The function should execute the query and return a Promise with results.
   *
   * @type (query: string) => Promise<QueryResult>
   * @default undefined
   * @required false
   * @example async function executeQuery(query) { const results = await duckdb.query(query); return { data: results.toArray(), columns: [...], executionTime: 100 }; }
   */
  onQueryExecute?: (query: string) => Promise<QueryResult>;

  /**
   * Whether the SQL editor should be in read-only mode
   *
   * When true, users cannot modify the SQL query in the editor.
   * Useful for displaying saved queries or demo purposes.
   *
   * @type boolean
   * @default false
   * @required false
   */
  readOnly?: boolean;

  /**
   * Whether to display line numbers in the Monaco editor
   *
   * @type boolean
   * @default true
   * @required false
   */
  showLineNumbers?: boolean;

  /**
   * Editor theme preference
   *
   * Controls the Monaco editor theme. When 'auto', follows system preference.
   *
   * @type 'light' | 'dark' | 'auto'
   * @default 'auto'
   * @required false
   */
  theme?: 'light' | 'dark' | 'auto';

  /**
   * Placeholder text to display in the editor when empty
   *
   * @type string
   * @default "Enter your SQL query here..."
   * @required false
   */
  placeholder?: string;

  /**
   * Additional TailwindCSS classes for customization
   *
   * These classes are merged with the base component classes.
   * Use for custom styling while maintaining component behavior.
   *
   * @type string
   * @default undefined
   * @required false
   * @example "border-blue-200 shadow-lg"
   */
  className?: string;

  /**
   * Child components to be rendered within the cockpit container
   *
   * @type ReactNode
   * @default undefined
   * @required false
   */
  children?: ReactNode;

  /**
   * List of saved queries for quick selection from toolbar
   *
   * @type SavedQuery[]
   * @default []
   * @required false
   */
  savedQueries?: SavedQuery[];

  /**
   * Callback when a saved query is selected from the dropdown
   *
   * @type (query: SavedQuery) => void
   * @default undefined
   * @required false
   */
  onSavedQuerySelect?: (query: SavedQuery) => void;

  /**
   * Whether to show the help button in the toolbar
   *
   * @type boolean
   * @default true
   * @required false
   */
  showHelp?: boolean;

  /**
   * Custom help content or documentation URL
   *
   * If provided as ReactNode, displays as modal content.
   * If provided as string, opens as external link.
   *
   * @type ReactNode | string
   * @default undefined
   * @required false
   */
  helpContent?: ReactNode | string;

  /**
   * Minimum height for the SQL editor area
   *
   * @type string
   * @default '300px'
   * @required false
   */
  editorMinHeight?: string;

  /**
   * Maximum height for the results display area
   *
   * Results area will scroll if content exceeds this height.
   *
   * @type string
   * @default '400px'
   * @required false
   */
  resultsMaxHeight?: string;
}

/**
 * Query execution result interface
 */
export interface QueryResult {
  /**
   * Array of data rows returned by the query
   */
  data: Record<string, any>[];

  /**
   * Column metadata for the result set
   */
  columns: QueryColumn[];

  /**
   * Number of rows affected (for INSERT/UPDATE/DELETE operations)
   */
  rowCount?: number;

  /**
   * Query execution time in milliseconds
   */
  executionTime: number;
}

/**
 * Column metadata interface
 */
export interface QueryColumn {
  /**
   * Column name from the result set
   */
  name: string;

  /**
   * Data type of the column
   */
  type: 'string' | 'number' | 'boolean' | 'date';

  /**
   * Whether the column allows null values
   */
  nullable: boolean;
}

/**
 * SQL error interface for error display
 */
export interface SQLError {
  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Type of SQL error
   */
  type: 'syntax' | 'runtime' | 'connection' | 'memory';

  /**
   * Line number where the error occurred (if applicable)
   */
  line?: number;

  /**
   * Column number where the error occurred (if applicable)
   */
  column?: number;
}

/**
 * Saved query interface for quick access
 */
export interface SavedQuery {
  /**
   * Unique identifier for the saved query
   */
  id: string;

  /**
   * Display name for the saved query
   */
  name: string;

  /**
   * SQL query text
   */
  query: string;

  /**
   * Optional description of what the query does
   */
  description?: string;

  /**
   * Timestamp when the query was created
   */
  createdAt: Date;

  /**
   * Timestamp when the query was last modified
   */
  updatedAt: Date;
}
```

### Component Signature

```typescript
export const SQLCockpit: React.ForwardRefExoticComponent<
  SQLCockpitProps & React.RefAttributes<HTMLDivElement>
>;
```

## Behavioral Contract

### Rendering Behavior

**Input**: SQLCockpitProps
**Output**: Rendered React element with following structure:

1. **Container Type**: HTMLDivElement with proper semantic structure
2. **Layout**: Vertical stack with toolbar, editor, and results areas
3. **Responsive**: Adapts to different screen sizes
4. **Theme**: Inherits from TailwindCSS theme system
5. **Interactive**: Supports keyboard navigation and screen readers

### Default Layout Structure

```html
<div className="sql-cockpit flex flex-col h-full">
  <!-- Toolbar -->
  <div className="sql-toolbar flex items-center justify-between p-2 border-b">
    <div className="flex items-center gap-2">
      <!-- Left side buttons: Run, Format, Select Query -->
    </div>
    <div className="flex items-center gap-2">
      <!-- Right side: Database status, Help -->
    </div>
  </div>

  <!-- Editor Area -->
  <div className="sql-editor flex-1 min-h-[300px]">
    <!-- Monaco Editor instance -->
  </div>

  <!-- Results Area -->
  <div className="sql-results border-t max-h-[400px] overflow-auto">
    <!-- Results table or error message -->
  </div>
</div>
```

### Component States

**1. Initial State**:
- Editor displays placeholder or initialQuery
- Results area empty
- Toolbar buttons enabled appropriately

**2. Query Execution**:
- Editor remains editable
- Run button shows loading state
- Results area shows loading indicator

**3. Successful Query**:
- Results area displays formatted table
- Execution time shown
- Toolbar buttons re-enabled

**4. Error State**:
- Results area displays error message with type
- Error details shown with line/column if available
- Editor maintains current query

## Styling Contract

### Base Classes

| Property | Value | Source |
|----------|-------|--------|
| Container | `flex flex-col h-full` | Component default |
| Toolbar | `flex items-center justify-between p-2 border-b` | Component default |
| Editor | `flex-1 min-h-[300px]` | Component default + props |
| Results | `border-t max-h-[400px] overflow-auto` | Component default + props |

### Class Merging Logic

```typescript
const finalClassName = cn(
  'flex flex-col h-full',     // Base container classes
  className                   // User customizations (applied last)
);
```

## Event Handling Contract

### Toolbar Events

**Run Query Button**:
- Triggers `onQueryExecute(query)` callback
- Shows loading state during execution
- Handles errors gracefully

**Format Query Button**:
- Uses sql-formatter to format current query
- Updates editor content
- Maintains cursor position when possible

**Select Query Dropdown**:
- Shows list of saved queries
- Calls `onSavedQuerySelect(query)` when selection made
- Replaces editor content with selected query

### Editor Events

**Query Change**:
- No external callback required
- Internal state management
- Error highlighting for syntax issues

**Keyboard Shortcuts**:
- Ctrl/Cmd + Enter: Execute query
- Ctrl/Cmd + S: Format query
- Ctrl/Cmd + /: Toggle comment

### Results Events

**Row Click**:
- Optional callback for row selection
- Visual feedback for selected rows
- Keyboard navigation support

## Accessibility Contract

### Semantic HTML

- **Main Container**: `<div>` with appropriate ARIA attributes
- **Toolbar**: `<div>` with `role="toolbar"`
- **Editor**: `<div>` with `role="textbox"` and proper ARIA attributes
- **Results**: `<table>` with proper headers and captions

### Required Accessibility Support

| Feature | Implementation |
|---------|----------------|
| Screen Reader Support | Proper ARIA labels, live regions for results/errors |
| High Contrast | Inherits from TailwindCSS theme variables |
| Keyboard Navigation | Full keyboard access to all interactive elements |
| Mobile Accessibility | Touch-friendly button sizes and gestures |

### Keyboard Navigation

- **Tab Navigation**: Logical tab order through toolbar, editor, results
- **Shortcuts**: Standard SQL editor shortcuts (Ctrl+Enter, Ctrl+S, etc.)
- **Focus Management**: Proper focus indicators and trap for modals

## Performance Contract

### Bundle Size

- **Component Code**: < 50KB gzipped (excluding Monaco/DuckDB)
- **Monaco Editor**: ~3MB gzipped (with code splitting)
- **DuckDB-WASM**: ~2.5MB gzipped (loaded dynamically)
- **Total Impact**: < 6MB gzipped with lazy loading

### Runtime Performance

- **Initial Render**: < 100ms target
- **Query Execution**: Varies by query complexity
- **Editor Typing**: < 50ms response time
- **Results Display**: < 200ms for 1000 rows
- **Memory**: Monitors usage, warns at 80% threshold

### Lazy Loading Strategy

- **Monaco Editor**: Loads on component mount
- **DuckDB-WASM**: Loads on first query execution
- **Saved Queries**: Loads on dropdown open
- **Help Content**: Loads on help button click

## Error Handling Contract

### Validation Rules

| Prop | Validation | Error Behavior |
|------|------------|----------------|
| `initialQuery` | String type | TypeScript compile error |
| `onQueryExecute` | Function type | TypeScript compile error |
| `theme` | String enum | TypeScript compile error |
| `readOnly` | Boolean type | TypeScript compile error |

### Runtime Errors

- **Query Execution**: Errors displayed in results area, component remains functional
- **Monaco Editor**: Error boundaries prevent component crashes
- **Saved Queries**: Invalid queries show validation errors
- **Help Content**: Missing help shows fallback documentation

### Error Display

**Syntax Errors**:
- Line and column highlighting in editor
- Clear error message in results area
- Suggestions for fixing common issues

**Runtime Errors**:
- User-friendly error messages
- Database connection status indicator
- Retry mechanisms where appropriate

## Integration Contract

### Monaco Editor Integration

- **Package**: `@monaco-editor/react`
- **Language**: SQL with enhanced syntax highlighting
- **Theme**: TailwindCSS integration with light/dark support
- **Features**: Autocomplete, formatting, syntax validation

### DuckDB-WASM Integration

- **Package**: `@duckdb/duckdb-wasm`
- **Pattern**: React hooks for query execution
- **Data Format**: Arrow format for efficient transfer
- **Memory Management**: Streaming for large result sets

### shadcn/ui Integration

- **Base Component**: shadcn/ui Card for sections
- **Icons**: Lucide React for all iconography
- **Buttons**: shadcn/ui Button with variants
- **Tables**: shadcn/ui Table for results display

## Testing Contract

### Required Test Coverage

| Test Type | Coverage Requirement |
|-----------|---------------------|
| Unit Tests | > 80% line coverage |
| Integration Tests | Monaco + DuckDB workflow |
| Accessibility Tests | Screen reader compatibility |
| Visual Tests | Storybook snapshots |

### Test Scenarios

1. **Component Rendering**: Component renders with all toolbar elements
2. **Query Execution**: Mock query execution with results display
3. **Error Handling**: Syntax errors, runtime errors, connection errors
4. **Saved Queries**: Loading, selecting, and executing saved queries
5. **Accessibility**: Keyboard navigation, screen reader support
6. **Performance**: Large result sets, memory usage monitoring
7. **Responsiveness**: Different screen sizes and orientations

## Versioning Contract

### Semantic Versioning

- **Major (X.0.0)**: Breaking changes to props or behavior
- **Minor (0.Y.0)**: New features, backward compatible
- **Patch (0.0.Z)**: Bug fixes, documentation updates

### Breaking Change Definition

Changes that require major version increment:

1. **Prop Removal**: Removing any existing prop
2. **Prop Type Change**: Changing prop type in incompatible way
3. **Default Value Change**: Changing default prop values
4. **Event Handler Signature**: Changing callback function signatures
5. **Component Structure**: Major changes to internal component architecture

### Backward Compatibility Guarantees

- **New Props**: Can be added without major version
- **New Features**: Enhancements without breaking layout
- **Performance**: Improvements without changing interface
- **TypeScript**: Stricter types without breaking usage

## Export Contract

### Module Exports

```typescript
// Named exports
export { SQLCockpit };
export type {
  SQLCockpitProps,
  QueryResult,
  QueryColumn,
  SQLError,
  SavedQuery
};

// Default export
export default SQLCockpit;
```

### ESM Bundle Structure

```javascript
// ESM export structure
export { SQLCockpit } from './components/sql/sql-cockpit';
export type { SQLCockpitProps } from './types/sql';
```

This contract defines the complete interface and behavior expectations for the SQL Cockpit component.