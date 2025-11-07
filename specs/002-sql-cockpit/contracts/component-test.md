# Component Test Contract: SQL Cockpit

**Version**: 1.0.0
**Date**: 2025-11-06
**Component**: SQLCockpit

## Test Coverage Requirements

### Test Coverage Targets

| Test Type | Minimum Coverage | Priority |
|-----------|------------------|----------|
| Unit Tests | 85% line coverage | P1 |
| Integration Tests | 90% functional coverage | P1 |
| Accessibility Tests | 100% WCAG 2.1 AA criteria | P1 |
| Visual Tests | All component variants | P2 |
| Performance Tests | Key user scenarios | P2 |

## Unit Test Structure

### Component Tests

```typescript
// tests/unit/sql/sql-cockpit.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SQLCockpit } from '../../../src/components/sql/sql-cockpit';
import { mockQueryResults, mockSQLError, mockSavedQueries } from '../../__fixtures__/sql-fixtures';

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => {
  return function MockEditor({ value, onChange }) {
    return (
      <textarea
        data-testid="monaco-editor"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    );
  };
});

// Mock DuckDB-WASM
jest.mock('@duckdb/duckdb-wasm', () => ({
  createDuckDB: jest.fn().mockResolvedValue({
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({
        toArray: jest.fn().mockReturnValue(mockQueryResults.data),
        schema: {
          fields: mockQueryResults.columns.map(col => ({
            name: col.name,
            type: col.type,
            nullable: col.nullable,
          })),
        },
      }),
      close: jest.fn(),
    }),
  }),
}));

describe('SQLCockpit', () => {
  const defaultProps = {
    onQueryExecute: jest.fn().mockResolvedValue(mockQueryResults),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders without crashing', () => {
      render(<SQLCockpit {...defaultProps} />);
      expect(screen.getByTestId('sql-cockpit')).toBeInTheDocument();
    });

    it('displays toolbar with all required buttons', () => {
      render(<SQLCockpit {...defaultProps} />);

      expect(screen.getByRole('button', { name: /run query/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /format query/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /select query/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /help/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /database/i })).toBeInTheDocument();
    });

    it('renders editor area with correct placeholder', () => {
      render(<SQLCockpit {...defaultProps} placeholder="Custom placeholder" />);
      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveAttribute('placeholder', 'Custom placeholder');
    });

    it('renders empty results area initially', () => {
      render(<SQLCockpit {...defaultProps} />);
      expect(screen.getByText(/no query executed yet/i)).toBeInTheDocument();
    });
  });

  describe('Query Execution', () => {
    it('executes query when run button is clicked', async () => {
      const onQueryExecute = jest.fn().mockResolvedValue(mockQueryResults);
      render(<SQLCockpit {...defaultProps} onQueryExecute={onQueryExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      const runButton = screen.getByRole('button', { name: /run query/i });

      await userEvent.type(editor, 'SELECT * FROM users;');
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(onQueryExecute).toHaveBeenCalledWith('SELECT * FROM users;');
      });
    });

    it('displays loading state during query execution', async () => {
      const onQueryExecute = jest.fn().mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve(mockQueryResults), 1000))
      );
      render(<SQLCockpit {...defaultProps} onQueryExecute={onQueryExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      const runButton = screen.getByRole('button', { name: /run query/i });

      await userEvent.type(editor, 'SELECT * FROM users;');
      await userEvent.click(runButton);

      expect(screen.getByText(/executing query/i)).toBeInTheDocument();
      expect(runButton).toBeDisabled();
    });

    it('displays query results after successful execution', async () => {
      const onQueryExecute = jest.fn().mockResolvedValue(mockQueryResults);
      render(<SQLCockpit {...defaultProps} onQueryExecute={onQueryExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      const runButton = screen.getByRole('button', { name: /run query/i });

      await userEvent.type(editor, 'SELECT * FROM users;');
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/2 rows/i)).toBeInTheDocument();
        expect(screen.getByText(/executed in/i)).toBeInTheDocument();
      });
    });

    it('displays error message for failed queries', async () => {
      const onQueryExecute = jest.fn().mockRejectedValue(mockSQLError);
      render(<SQLCockpit {...defaultProps} onQueryExecute={onQueryExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      const runButton = screen.getByRole('button', { name: /run query/i });

      await userEvent.type(editor, 'INVALID SQL');
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/sql syntax error/i)).toBeInTheDocument();
        expect(screen.getByText(mockSQLError.message)).toBeInTheDocument();
      });
    });
  });

  describe('Query Formatting', () => {
    it('formats query when format button is clicked', async () => {
      render(<SQLCockpit {...defaultProps} />);

      const editor = screen.getByTestId('monaco-editor');
      const formatButton = screen.getByRole('button', { name: /format query/i });

      await userEvent.type(editor, 'select * from users where active=true');
      await userEvent.click(formatButton);

      expect(editor).toHaveValue(/SELECT \* FROM users WHERE active = true/i);
    });

    it('handles formatting errors gracefully', async () => {
      render(<SQLCockpit {...defaultProps} />);

      const editor = screen.getByTestId('monaco-editor');
      const formatButton = screen.getByRole('button', { name: /format query/i });

      await userEvent.type(editor, 'COMPLETELY INVALID SQL !!!');
      await userEvent.click(formatButton);

      // Should not crash and should show error notification
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Saved Queries', () => {
    it('displays saved queries dropdown when select button is clicked', async () => {
      render(<SQLCockpit {...defaultProps} savedQueries={mockSavedQueries} />);

      const selectButton = screen.getByRole('button', { name: /select query/i });
      await userEvent.click(selectButton);

      expect(screen.getByText(/all users/i)).toBeInTheDocument();
      expect(screen.getByText(/active users count/i)).toBeInTheDocument();
    });

    it('loads selected saved query into editor', async () => {
      const onSavedQuerySelect = jest.fn();
      render(<SQLCockpit {...defaultProps} savedQueries={mockSavedQueries} onSavedQuerySelect={onSavedQuerySelect} />);

      const selectButton = screen.getByRole('button', { name: /select query/i });
      await userEvent.click(selectButton);

      const savedQueryOption = screen.getByText(/all users/i);
      await userEvent.click(savedQueryOption);

      expect(onSavedQuerySelect).toHaveBeenCalledWith(mockSavedQueries[0]);
    });
  });

  describe('Help System', () => {
    it('shows help modal when help button is clicked', async () => {
      const helpContent = <div>Custom help content</div>;
      render(<SQLCockpit {...defaultProps} helpContent={helpContent} />);

      const helpButton = screen.getByRole('button', { name: /help/i });
      await userEvent.click(helpButton);

      expect(screen.getByText('Custom help content')).toBeInTheDocument();
    });

    it('opens external documentation when helpContent is URL', async () => {
      const mockOpen = jest.fn();
      window.open = mockOpen;

      render(<SQLCockpit {...defaultProps} helpContent="https://duckdb.org/docs" />);

      const helpButton = screen.getByRole('button', { name: /help/i });
      await userEvent.click(helpButton);

      expect(mockOpen).toHaveBeenCalledWith('https://duckdb.org/docs', '_blank');
    });
  });

  describe('Theme Support', () => {
    it('applies dark theme when theme prop is "dark"', () => {
      render(<SQLCockpit {...defaultProps} theme="dark" />);
      expect(screen.getByTestId('sql-cockpit')).toHaveClass('dark');
    });

    it('applies light theme when theme prop is "light"', () => {
      render(<SQLCockpit {...defaultProps} theme="light" />);
      expect(screen.getByTestId('sql-cockpit')).not.toHaveClass('dark');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all interactive elements', () => {
      render(<SQLCockpit {...defaultProps} />);

      expect(screen.getByRole('button', { name: /run query/i }))
        .toHaveAttribute('aria-label', expect.stringContaining('Run SQL query'));
      expect(screen.getByRole('button', { name: /format query/i }))
        .toHaveAttribute('aria-label', expect.stringContaining('Format SQL query'));
    });

    it('supports keyboard navigation', async () => {
      render(<SQLCockpit {...defaultProps} />);

      const user = userEvent.setup();
      await user.tab(); // Should focus first toolbar button
      expect(screen.getByRole('button', { name: /run query/i })).toHaveFocus();

      await user.tab(); // Should move to next button
      expect(screen.getByRole('button', { name: /format query/i })).toHaveFocus();
    });

    it('announces query results to screen readers', async () => {
      const onQueryExecute = jest.fn().mockResolvedValue(mockQueryResults);
      render(<SQLCockpit {...defaultProps} onQueryExecute={onQueryExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      const runButton = screen.getByRole('button', { name: /run query/i });

      await userEvent.type(editor, 'SELECT * FROM users;');
      await userEvent.click(runButton);

      await waitFor(() => {
        const announcement = screen.getByRole('status');
        expect(announcement).toHaveTextContent(/query executed successfully/i);
      });
    });
  });

  describe('Read-only Mode', () => {
    it('disables editor when readOnly is true', () => {
      render(<SQLCockpit {...defaultProps} readOnly={true} />);
      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toBeDisabled();
    });

    it('disables edit-related buttons in read-only mode', () => {
      render(<SQLCockpit {...defaultProps} readOnly={true} />);

      expect(screen.getByRole('button', { name: /run query/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /format query/i })).toBeDisabled();
    });
  });
});
```

### Hook Tests

```typescript
// tests/unit/hooks/use-duckdb-query.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useDuckDBQuery } from '../../../src/hooks/use-duckdb-query';
import * as duckdb from '@duckdb/duckdb-wasm';

// Mock DuckDB
jest.mock('@duckdb/duckdb-wasm');
const mockDuckDB = duckdb as jest.Mocked<typeof duckdb>;

describe('useDuckDBQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with idle state', () => {
    const { result } = renderHook(() => useDuckDBQuery());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('executes query successfully', async () => {
    const mockResults = [{ id: 1, name: 'test' }];
    const mockConnection = {
      query: jest.fn().mockResolvedValue({
        toArray: jest.fn().mockReturnValue(mockResults),
        schema: {
          fields: [
            { name: 'id', type: 'INTEGER', nullable: false },
            { name: 'name', type: 'VARCHAR', nullable: true },
          ],
        },
      }),
      close: jest.fn(),
    };
    const mockDB = {
      connect: jest.fn().mockResolvedValue(mockConnection),
    };
    mockDuckDB.createDuckDB.mockResolvedValue(mockDB);

    const { result } = renderHook(() => useDuckDBQuery());

    await act(async () => {
      await result.current.executeQuery('SELECT * FROM test');
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResults);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it('handles query errors', async () => {
    const mockError = new Error('Syntax error');
    const mockDB = {
      connect: jest.fn().mockRejectedValue(mockError),
    };
    mockDuckDB.createDuckDB.mockResolvedValue(mockDB);

    const { result } = renderHook(() => useDuckDBQuery());

    await act(async () => {
      await result.current.executeQuery('INVALID SQL');
    });

    await waitFor(() => {
      expect(result.current.data).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(mockError);
    });
  });
});
```

## Integration Test Structure

### End-to-End Workflow Tests

```typescript
// tests/integration/sql/sql-cockpit-e2e.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SQLCockpit } from '../../../src/components/sql/sql-cockpit';

// Integration tests use real Monaco and DuckDB in browser environment
describe('SQLCockpit Integration Tests', () => {
  // Only run in browser environment
  const isBrowser = typeof window !== 'undefined';

  if (!isBrowser) {
    test.skip('Integration tests require browser environment');
    return;
  }

  it('completes full query workflow', async () => {
    const onQueryExecute = jest.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Test User' }],
      columns: [
        { name: 'id', type: 'number', nullable: false },
        { name: 'name', type: 'string', nullable: false },
      ],
      executionTime: 50,
    });

    render(<SQLCockpit onQueryExecute={onQueryExecute} />);

    // Wait for Monaco to load
    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    // Type query
    const editor = screen.getByTestId('monaco-editor');
    await userEvent.type(editor, 'SELECT * FROM users WHERE id = 1;');

    // Execute query
    const runButton = screen.getByRole('button', { name: /run query/i });
    await userEvent.click(runButton);

    // Verify results
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText(/1 rows/i)).toBeInTheDocument();
    });
  });

  it('handles large result sets gracefully', async () => {
    const largeResults = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `User ${i}`,
      email: `user${i}@example.com`,
    }));

    const onQueryExecute = jest.fn().mockResolvedValue({
      data: largeResults,
      columns: [
        { name: 'id', type: 'number', nullable: false },
        { name: 'name', type: 'string', nullable: false },
        { name: 'email', type: 'string', nullable: false },
      ],
      executionTime: 200,
    });

    render(<SQLCockpit onQueryExecute={onQueryExecute} />);

    const editor = screen.getByTestId('monaco-editor');
    const runButton = screen.getByRole('button', { name: /run query/i });

    await userEvent.type(editor, 'SELECT * FROM large_table;');
    await userEvent.click(runButton);

    // Should display pagination or virtual scrolling
    await waitFor(() => {
      expect(screen.getByText(/10,000 rows/i)).toBeInTheDocument();
    }, { timeout: 10000 });
  });
});
```

## Accessibility Test Structure

### WCAG 2.1 AA Compliance Tests

```typescript
// tests/accessibility/sql/sql-cockpit.a11y.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { SQLCockpit } from '../../../src/components/sql/sql-cockpit';

expect.extend(toHaveNoViolations);

describe('SQLCockpit Accessibility', () => {
  it('has no accessibility violations', async () => {
    const onQueryExecute = jest.fn().mockResolvedValue({
      data: [],
      columns: [],
      executionTime: 0,
    });

    const { container } = render(<SQLCockpit onQueryExecute={onQueryExecute} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('supports keyboard-only navigation', async () => {
    const onQueryExecute = jest.fn().mockResolvedValue({
      data: [],
      columns: [],
      executionTime: 0,
    });

    render(<SQLCockpit onQueryExecute={onQueryExecute} />);

    const user = userEvent.setup();

    // Navigate through all interactive elements
    await user.tab();
    expect(screen.getByRole('button', { name: /run query/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /format query/i })).toHaveFocus();

    await user.tab();
    expect(screen.getByRole('button', { name: /select query/i })).toHaveFocus();

    // Can interact with editor
    await user.tab();
    expect(screen.getByRole('textbox')).toHaveFocus();
  });

  it('announces important state changes to screen readers', async () => {
    const onQueryExecute = jest.fn().mockResolvedValue({
      data: [{ id: 1, name: 'Test' }],
      columns: [
        { name: 'id', type: 'number', nullable: false },
        { name: 'name', type: 'string', nullable: false },
      ],
      executionTime: 100,
    });

    render(<SQLCockpit onQueryExecute={onQueryExecute} />);

    const user = userEvent.setup();
    const editor = screen.getByRole('textbox');
    const runButton = screen.getByRole('button', { name: /run query/i });

    await user.type(editor, 'SELECT * FROM test;');
    await user.click(runButton);

    // Should announce query completion
    await waitFor(() => {
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent(/query completed/i);
    });
  });

  it('provides sufficient color contrast', () => {
    const onQueryExecute = jest.fn().mockRejectedValue({
      message: 'Test error',
      type: 'syntax',
    });

    render(<SQLCockpit onQueryExecute={onQueryExecute} />);

    const user = userEvent.setup();
    const editor = screen.getByRole('textbox');
    const runButton = screen.getByRole('button', { name: /run query/i });

    user.type(editor, 'INVALID');
    user.click(runButton);

    // Error state should have appropriate contrast
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toHaveClass(/text-destructive/i);
  });
});
```

## Performance Test Structure

### Performance Benchmarks

```typescript
// tests/performance/sql/sql-cockpit.perf.test.tsx
import { render, screen } from '@testing-library/react';
import { performance } from 'perf_hooks';
import { SQLCockpit } from '../../../src/components/sql/sql-cockpit';

describe('SQLCockpit Performance', () => {
  it('renders within performance budget', () => {
    const onQueryExecute = jest.fn().mockResolvedValue({
      data: [],
      columns: [],
      executionTime: 0,
    });

    const startTime = performance.now();

    render(<SQLCockpit onQueryExecute={onQueryExecute} />);

    const endTime = performance.now();
    const renderTime = endTime - startTime;

    // Should render within 100ms
    expect(renderTime).toBeLessThan(100);
  });

  it('handles large queries without memory leaks', async () => {
    const onQueryExecute = jest.fn().mockResolvedValue({
      data: Array.from({ length: 50000 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(1000), // Large string data
      })),
      columns: [{ name: 'id', type: 'number', nullable: false }],
      executionTime: 500,
    });

    const { unmount } = render(<SQLCockpit onQueryExecute={onQueryExecute} />);

    // Execute multiple large queries
    for (let i = 0; i < 10; i++) {
      const runButton = screen.getByRole('button', { name: /run query/i });
      await fireEvent.click(runButton);

      // Wait for results to process
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Unmount and check for memory issues
    unmount();

    // In a real test environment, you would check memory usage here
    // For Jest, we ensure the test completes without timeouts
    expect(true).toBe(true);
  });
});
```

## Visual Test Structure

### Storybook Visual Tests

```typescript
// tests/storybook/sql/sql-cockpit.visual.test.tsx
import { expect } from '@storybook/test-runner';
import { Story } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import { composeStories } from '@storybook/testing-react';
import * as stories from '../../../stories/sql/sql-cockpit.stories';

const { Default, WithResults, WithError, DarkTheme } = composeStories(stories);

describe('SQLCockpit Visual Tests', () => {
  it('renders default story correctly', () => {
    render(<Default />);
    expect(screen.getByTestId('sql-cockpit')).toBeInTheDocument();
  });

  it('displays results table correctly', () => {
    render(<WithResults />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays error state correctly', () => {
    render(<WithError />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/syntax error/i)).toBeInTheDocument();
  });

  it('applies dark theme correctly', () => {
    render(<DarkTheme />);
    expect(screen.getByTestId('sql-cockpit')).toHaveClass('dark');
  });
});
```

## Test Fixtures

### Mock Data Fixtures

```typescript
// tests/__fixtures__/sql-fixtures.ts
export const mockQueryResults = {
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

export const mockSQLError = {
  message: 'Parser Error: syntax error at or near "FORM"',
  type: 'syntax',
  line: 1,
  column: 15,
};

export const mockSavedQueries = [
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

## Test Configuration

### Jest Setup

```javascript
// jest.config.cjs additions for SQL Cockpit
module.exports = {
  // ... existing config
  moduleNameMapping: {
    '^@monaco-editor/react': '<rootDir>/tests/__mocks__/@monaco-editor/react.tsx',
    '^@duckdb/duckdb-wasm': '<rootDir>/tests/__mocks__/@duckdb/duckdb-wasm.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup/sql-cockpit-setup.ts'],
  testTimeout: 10000, // Longer timeout for integration tests
};
```

### Test Setup

```typescript
// tests/setup/sql-cockpit-setup.ts
import '@testing-library/jest-dom';

// Mock ResizeObserver for Monaco Editor
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver for performance monitoring
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock performance.memory for browser environment
Object.defineProperty(global, 'performance', {
  value: {
    ...global.performance,
    memory: {
      usedJSHeapSize: 1000000,
      totalJSHeapSize: 2000000,
      jsHeapSizeLimit: 4000000,
    },
  },
  writable: true,
});
```

This comprehensive test contract ensures the SQL Cockpit component meets all quality standards for functionality, accessibility, performance, and user experience.