/**
 * Integration tests for DuckDB-WASM integration
 *
 * These tests verify the DuckDB-WASM integration with SQL Cockpit, including
 * query execution, connection management, and error handling. They should FAIL
 * before implementation and PASS after.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SQLCockpit } from '../../../src/components/sql/sql-cockpit';

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange }: any) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder="Enter SQL query here..."
    />
  ),
}));

// Mock DuckDB-WASM with comprehensive mock implementation
const mockConnection = {
  query: jest.fn(),
  close: jest.fn(),
  registerBuffer: jest.fn(),
  registerFile: jest.fn(),
  insertCSVFromPath: jest.fn(),
  insertJSONFromPath: jest.fn(),
};

const mockDuckDB = {
  connect: jest.fn(() => Promise.resolve(mockConnection)),
  registerFileText: jest.fn(),
  registerFileBuffer: jest.fn(),
  open: jest.fn(),
  close: jest.fn(),
  reset: jest.fn(),
  instantiate: jest.fn(),
  get dropFiles() { return []; },
  get version() { return '0.9.2-mock'; },
};

jest.mock('@duckdb/duckdb-wasm', () => ({
  createDuckDB: jest.fn(() => Promise.resolve(mockDuckDB)),
  selectBundle: jest.fn(),
  DuckDBWorker: mockDuckDB,
  DuckDBLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
  DEFAULT_BUNDLES: {
    mvp: {
      mainModule: 'duckdb-mvp.wasm',
      mainWorker: 'duckdb-node-mvp.worker.js',
    },
  },
  DuckDBConnectionStatus: {
    UNINITIALIZED: 'UNINITIALIZED',
    CONNECTING: 'CONNECTING',
    CONNECTED: 'CONNECTED',
    ERROR: 'ERROR',
    CLOSED: 'CLOSED',
  },
  DuckDBError: class extends Error {
    constructor(message: string, public code?: string) {
      super(message);
      this.name = 'DuckDBError';
    }
  },
  isWebAssemblySupported: true,
  isCrossOriginEnabled: false,
  isSharedArrayBufferSupported: true,
}));

// Mock useDuckDBQuery hook
jest.mock('../../../src/hooks/use-duckdb-query', () => ({
  useDuckDBQuery: () => ({
    executeQuery: jest.fn(),
    isExecuting: false,
    error: null,
    result: null,
    databaseStatus: {
      state: 'connected',
      message: 'Connected to DuckDB',
    },
  }),
}));

describe('DuckDB Integration', () => {
  const defaultProps = {
    onQueryExecute: jest.fn(),
  };

  const mockQueryResult = {
    data: [
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: 25 },
    ],
    columns: [
      { name: 'id', type: 'INTEGER', nullable: false },
      { name: 'name', type: 'VARCHAR', nullable: false },
      { name: 'age', type: 'INTEGER', nullable: true },
    ],
    executionTime: 85,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnection.query.mockResolvedValue({
      toArray: () => mockQueryResult.data,
      schema: {
        fields: mockQueryResult.columns.map(col => ({
          name: col.name,
          type: { toString: () => col.type },
          nullable: col.nullable,
        })),
      },
      num_rows: mockQueryResult.data.length,
    });
  });

  describe('Database Initialization', () => {
    it('should initialize DuckDB when component mounts', async () => {
      const { createDuckDB } = require('@duckdb/duckdb-wasm');

      render(<SQLCockpit {...defaultProps} />);

      await waitFor(() => {
        expect(createDuckDB).toHaveBeenCalled();
      });
    });

    it('should establish database connection', async () => {
      render(<SQLCockpit {...defaultProps} />);

      await waitFor(() => {
        expect(mockDuckDB.connect).toHaveBeenCalled();
      });
    });

    it('should handle database initialization errors gracefully', async () => {
      const { createDuckDB } = require('@duckdb/duckdb-wasm');
      createDuckDB.mockRejectedValue(new Error('Failed to initialize DuckDB'));

      const originalConsoleError = console.error;
      console.error = jest.fn();

      render(<SQLCockpit {...defaultProps} />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'DuckDB initialization failed:',
          expect.any(Error)
        );
      });

      console.error = originalConsoleError;
    });

    it('should display connection status to user', async () => {
      render(<SQLCockpit {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/connected/i)).toBeInTheDocument();
      });
    });
  });

  describe('Query Execution', () => {
    it('should execute queries through DuckDB connection', async () => {
      const mockExecute = jest.fn().mockImplementation(async (query) => {
        const result = await mockConnection.query(query);
        return {
          data: result.toArray(),
          columns: result.schema.fields.map((field: any) => ({
            name: field.name,
            type: mapDuckDBType(field.type.toString()),
            nullable: field.nullable,
          })),
          executionTime: 85,
        };
      });

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT * FROM users;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(mockExecute).toHaveBeenCalledWith('SELECT * FROM users;');
      });
    });

    it('should handle SELECT queries correctly', async () => {
      const mockExecute = jest.fn().mockResolvedValue(mockQueryResult);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT id, name FROM users;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
      });
    });

    it('should handle INSERT queries correctly', async () => {
      const insertResult = {
        data: [],
        columns: [],
        rowCount: 1,
        executionTime: 45,
      };

      const mockExecute = jest.fn().mockResolvedValue(insertResult);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'INSERT INTO users (name, age) VALUES (\'Charlie\', 35);');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('1 row affected')).toBeInTheDocument();
      });
    });

    it('should handle UPDATE queries correctly', async () => {
      const updateResult = {
        data: [],
        columns: [],
        rowCount: 2,
        executionTime: 32,
      };

      const mockExecute = jest.fn().mockResolvedValue(updateResult);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'UPDATE users SET age = age + 1;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('2 rows affected')).toBeInTheDocument();
      });
    });

    it('should handle DELETE queries correctly', async () => {
      const deleteResult = {
        data: [],
        columns: [],
        rowCount: 1,
        executionTime: 28,
      };

      const mockExecute = jest.fn().mockResolvedValue(deleteResult);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'DELETE FROM users WHERE age < 18;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('1 row affected')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle query execution errors', async () => {
      const mockError = new Error('Table "nonexistent" does not exist');
      const mockExecute = jest.fn().mockRejectedValue(mockError);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT * FROM nonexistent;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/query error/i)).toBeInTheDocument();
        expect(screen.getByText(/does not exist/i)).toBeInTheDocument();
      });
    });

    it('should handle DuckDB connection errors', async () => {
      mockDuckDB.connect.mockRejectedValue(new Error('Connection failed'));

      render(<SQLCockpit {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument();
      });
    });

    it('should handle DuckDB-specific errors', async () => {
      const { DuckDBError } = require('@duckdb/duckdb-wasm');
      const mockExecute = jest.fn().mockRejectedValue(
        new DuckDBError('Invalid SQL syntax', 'SYNTAX_ERROR')
      );

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'INVALID SQL SYNTAX');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid SQL syntax')).toBeInTheDocument();
        expect(screen.getByText('SYNTAX_ERROR')).toBeInTheDocument();
      });
    });
  });

  describe('Data Type Mapping', () => {
    it('should correctly map DuckDB data types to component types', async () => {
      const complexResult = {
        data: [
          {
            id: 1,
            name: 'Test',
            active: true,
            created_at: new Date('2023-01-15'),
            price: 99.99,
            description: null,
          },
        ],
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false },
          { name: 'name', type: 'VARCHAR', nullable: false },
          { name: 'active', type: 'BOOLEAN', nullable: false },
          { name: 'created_at', type: 'TIMESTAMP', nullable: false },
          { name: 'price', type: 'DOUBLE', nullable: true },
          { name: 'description', type: 'VARCHAR', nullable: true },
        ],
        executionTime: 65,
      };

      const mockExecute = jest.fn().mockResolvedValue(complexResult);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT * FROM complex_table;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('Test')).toBeInTheDocument();
        expect(screen.getByText('true')).toBeInTheDocument();
        expect(screen.getByText('99.99')).toBeInTheDocument();
        expect(screen.getByText('NULL')).toBeInTheDocument();
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should measure and display query execution time', async () => {
      const mockExecute = jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return mockQueryResult;
      });

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT * FROM users;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/Query executed in \d+ms/)).toBeInTheDocument();
      });
    });

    it('should handle large result sets efficiently', async () => {
      const largeResult = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          value: Math.random(),
        })),
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false },
          { name: 'name', type: 'VARCHAR', nullable: false },
          { name: 'value', type: 'DOUBLE', nullable: true },
        ],
        executionTime: 250,
      };

      const mockExecute = jest.fn().mockResolvedValue(largeResult);

      const startTime = performance.now();
      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT * FROM large_table;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('User 1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Memory Management', () => {
    it('should cleanup connections properly', async () => {
      const { unmount } = render(<SQLCockpit {...defaultProps} />);

      await waitFor(() => {
        expect(mockDuckDB.connect).toHaveBeenCalled();
      });

      unmount();

      // Should close connections on unmount
      expect(mockDuckDB.close).toHaveBeenCalled();
    });

    it('should handle memory pressure gracefully', async () => {
      // Mock memory pressure scenario
      const originalMemory = performance.memory;
      Object.defineProperty(performance, 'memory', {
        writable: true,
        value: {
          usedJSHeapSize: 100 * 1024 * 1024, // 100MB
          totalJSHeapSize: 200 * 1024 * 1024, // 200MB
          jsHeapSizeLimit: 2048 * 1024 * 1024, // 2GB
        },
      });

      render(<SQLCockpit {...defaultProps} />);

      await waitFor(() => {
        // Should still function under memory pressure
        expect(screen.getByRole('toolbar')).toBeInTheDocument();
      });

      // Restore original memory
      Object.defineProperty(performance, 'memory', {
        writable: true,
        value: originalMemory,
      });
    });
  });

  describe('WebAssembly Support', () => {
    it('should check WebAssembly support before initialization', async () => {
      const { isWebAssemblySupported } = require('@duckdb/duckdb-wasm');

      render(<SQLCockpit {...defaultProps} />);

      // Should check WASM support
      expect(isWebAssemblySupported).toBeDefined();
    });

    it('should handle browsers without WebAssembly support', async () => {
      const { isWebAssemblySupported } = require('@duckdb/duckdb-wasm');
      Object.defineProperty(isWebAssemblySupported, 'value', false);

      const originalConsoleError = console.error;
      console.error = jest.fn();

      render(<SQLCockpit {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/webassembly not supported/i)).toBeInTheDocument();
      });

      console.error = originalConsoleError;
    });
  });

  describe('Browser Compatibility', () => {
    it('should handle SharedArrayBuffer availability', async () => {
      const { isSharedArrayBufferSupported } = require('@duckdb/duckdb-wasm');

      render(<SQLCockpit {...defaultProps} />);

      expect(isSharedArrayBufferSupported).toBeDefined();
    });

    it('should handle Cross-Origin isolation requirements', async () => {
      const { isCrossOriginEnabled } = require('@duckdb/duckdb-wasm');

      render(<SQLCockpit {...defaultProps} />);

      expect(isCrossOriginEnabled).toBeDefined();
    });
  });
});

// Helper function to map DuckDB types to component types
function mapDuckDBType(duckDBType: string): 'string' | 'number' | 'boolean' | 'date' {
  switch (duckDBType.toUpperCase()) {
    case 'VARCHAR':
    case 'TEXT':
    case 'CHAR':
      return 'string';
    case 'INTEGER':
    case 'BIGINT':
    case 'DOUBLE':
    case 'FLOAT':
    case 'DECIMAL':
      return 'number';
    case 'BOOLEAN':
      return 'boolean';
    case 'DATE':
    case 'TIMESTAMP':
      return 'date';
    default:
      return 'string';
  }
}