/**
 * Unit tests for ResultsPanel component
 *
 * These tests verify the display of query results, error messages, and empty states.
 * They should FAIL before implementation and PASS after.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ResultsPanel } from '../../../src/components/sql/results-panel';
import { QueryResult, SQLError } from '../../../src/types/sql';

describe('ResultsPanel', () => {
  const defaultProps = {
    result: null,
    error: null,
    isLoading: false,
  };

  const mockResult: QueryResult = {
    data: [
      { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false },
    ],
    columns: [
      { name: 'id', type: 'number', nullable: false },
      { name: 'name', type: 'string', nullable: false },
      { name: 'email', type: 'string', nullable: true },
      { name: 'active', type: 'boolean', nullable: false },
    ],
    executionTime: 150,
  };

  const mockError: SQLError = {
    message: 'Table "users" does not exist',
    type: 'runtime',
    line: 1,
    column: 15,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should display empty state when no results or errors', () => {
      render(<ResultsPanel {...defaultProps} />);

      expect(screen.getByText('No results to display')).toBeInTheDocument();
      expect(screen.getByText('Run a query to see results here')).toBeInTheDocument();
    });

    it('should display empty state with custom message when provided', () => {
      render(
        <ResultsPanel
          {...defaultProps}
          emptyMessage="Custom empty message"
        />
      );

      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading indicator when isLoading is true', () => {
      render(<ResultsPanel {...defaultProps} isLoading={true} />);

      expect(screen.getByText('Executing query...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('should not show loading indicator when isLoading is false', () => {
      render(<ResultsPanel {...defaultProps} isLoading={false} />);

      expect(screen.queryByText('Executing query...')).not.toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('Results Display', () => {
    it('should display query results when provided', () => {
      render(<ResultsPanel {...defaultProps} result={mockResult} />);

      // Should show data table
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('id')).toBeInTheDocument();
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();

      // Should show data rows
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display execution time', () => {
      render(<ResultsPanel {...defaultProps} result={mockResult} />);

      expect(screen.getByText('Query executed in 150ms')).toBeInTheDocument();
    });

    it('should display row count', () => {
      render(<ResultsPanel {...defaultProps} result={mockResult} />);

      expect(screen.getByText('2 rows returned')).toBeInTheDocument();
    });

    it('should handle empty result set', () => {
      const emptyResult: QueryResult = {
        data: [],
        columns: mockResult.columns,
        executionTime: 25,
      };

      render(<ResultsPanel {...defaultProps} result={emptyResult} />);

      expect(screen.getByText('No rows returned')).toBeInTheDocument();
      expect(screen.getByText('Query executed in 25ms')).toBeInTheDocument();
    });

    it('should display affected rows for INSERT/UPDATE/DELETE', () => {
      const updateResult: QueryResult = {
        data: [],
        columns: [],
        rowCount: 5,
        executionTime: 75,
      };

      render(<ResultsPanel {...defaultProps} result={updateResult} />);

      expect(screen.getByText('5 rows affected')).toBeInTheDocument();
    });
  });

  describe('Data Type Rendering', () => {
    it('should render boolean values correctly', () => {
      render(<ResultsPanel {...defaultProps} result={mockResult} />);

      // Check boolean cells
      const booleanCells = screen.getAllByText(/true|false/i);
      expect(booleanCells).toHaveLength(2);
      expect(screen.getByText('true')).toBeInTheDocument();
      expect(screen.getByText('false')).toBeInTheDocument();
    });

    it('should render null values correctly', () => {
      const resultWithNull: QueryResult = {
        data: [{ id: 1, name: null }],
        columns: [
          { name: 'id', type: 'number', nullable: false },
          { name: 'name', type: 'string', nullable: true },
        ],
        executionTime: 10,
      };

      render(<ResultsPanel {...defaultProps} result={resultWithNull} />);

      const nullCells = screen.getAllByText('NULL');
      expect(nullCells).toHaveLength(1);
      expect(nullCells[0]).toHaveClass('text-muted-foreground');
    });

    it('should render date values correctly', () => {
      const date = new Date('2023-01-15T10:30:00Z');
      const resultWithDate: QueryResult = {
        data: [{ id: 1, created_at: date }],
        columns: [
          { name: 'id', type: 'number', nullable: false },
          { name: 'created_at', type: 'date', nullable: false },
        ],
        executionTime: 10,
      };

      render(<ResultsPanel {...defaultProps} result={resultWithDate} />);

      expect(screen.getByText(/2023-01-15/)).toBeInTheDocument();
    });

    it('should render long strings with truncation', () => {
      const longString = 'a'.repeat(200);
      const resultWithLongString: QueryResult = {
        data: [{ id: 1, description: longString }],
        columns: [
          { name: 'id', type: 'number', nullable: false },
          { name: 'description', type: 'string', nullable: true },
        ],
        executionTime: 10,
      };

      render(<ResultsPanel {...defaultProps} result={resultWithLongString} />);

      const truncatedCell = screen.getByText(/a+\.{3}/);
      expect(truncatedCell).toBeInTheDocument();
    });
  });

  describe('Error Display', () => {
    it('should display error message when error is provided', () => {
      render(<ResultsPanel {...defaultProps} error={mockError} />);

      expect(screen.getByText('Query Error')).toBeInTheDocument();
      expect(screen.getByText('Table "users" does not exist')).toBeInTheDocument();
    });

    it('should display error type', () => {
      render(<ResultsPanel {...defaultProps} error={mockError} />);

      expect(screen.getByText('Runtime Error')).toBeInTheDocument();
    });

    it('should display line and column information when available', () => {
      render(<ResultsPanel {...defaultProps} error={mockError} />);

      expect(screen.getByText('Line 1, Column 15')).toBeInTheDocument();
    });

    it('should use different styling for different error types', () => {
      const syntaxError: SQLError = {
        message: 'Unexpected token',
        type: 'syntax',
        line: 2,
        column: 8,
      };

      render(<ResultsPanel {...defaultProps} error={syntaxError} />);

      const errorContainer = screen.getByTestId('error-container');
      expect(errorContainer).toHaveClass('syntax-error');
      expect(screen.getByText('Syntax Error')).toBeInTheDocument();
    });

    it('should handle errors without line/column information', () => {
      const connectionError: SQLError = {
        message: 'Connection timeout',
        type: 'connection',
      };

      render(<ResultsPanel {...defaultProps} error={connectionError} />);

      expect(screen.getByText('Connection Error')).toBeInTheDocument();
      expect(screen.queryByText(/Line \d+, Column \d+/)).not.toBeInTheDocument();
    });
  });

  describe('Table Features', () => {
    it('should enable row selection when enabled', async () => {
      render(
        <ResultsPanel
          {...defaultProps}
          result={mockResult}
          enableRowSelection={true}
        />
      );

      const rows = screen.getAllByRole('row');
      expect(rows.length).toBeGreaterThan(1); // Header + data rows

      // Click first data row
      await userEvent.click(rows[1]);
      expect(rows[1]).toHaveClass('selected');
    });

    it('should enable column sorting when enabled', async () => {
      render(
        <ResultsPanel
          {...defaultProps}
          result={mockResult}
          enableSorting={true}
        />
      );

      const nameHeader = screen.getByText('name');
      expect(nameHeader).toHaveAttribute('aria-sort', 'none');

      // Click to sort
      await userEvent.click(nameHeader);
      expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    });

    it('should show pagination for large result sets', () => {
      const largeResult: QueryResult = {
        data: Array.from({ length: 150 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
        })),
        columns: [
          { name: 'id', type: 'number', nullable: false },
          { name: 'name', type: 'string', nullable: false },
        ],
        executionTime: 200,
      };

      render(
        <ResultsPanel
          {...defaultProps}
          result={largeResult}
          enablePagination={true}
          pageSize={50}
        />
      );

      expect(screen.getByText('Showing 1-50 of 150')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next page/i })).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt table layout for small screens', () => {
      // Mock small screen
      global.innerWidth = 500;
      global.dispatchEvent(new Event('resize'));

      render(<ResultsPanel {...defaultProps} result={mockResult} />);

      const table = screen.getByRole('table');
      expect(table).toHaveClass('responsive-table');
    });

    it('should show horizontal scroll for wide tables', () => {
      const wideResult: QueryResult = {
        data: [{ id: 1, name: 'test' }],
        columns: Array.from({ length: 20 }, (_, i) => ({
          name: `column_${i}`,
          type: 'string' as const,
          nullable: false,
        })),
        executionTime: 10,
      };

      render(<ResultsPanel {...defaultProps} result={wideResult} />);

      const tableContainer = screen.getByTestId('table-container');
      expect(tableContainer).toHaveClass('overflow-x-auto');
    });
  });

  describe('Accessibility', () => {
    it('should have proper table semantics', () => {
      render(<ResultsPanel {...defaultProps} result={mockResult} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(4);
      expect(screen.getAllByRole('row')).toHaveLength(3); // Header + 2 data rows
    });

    it('should announce results to screen readers', () => {
      render(<ResultsPanel {...defaultProps} result={mockResult} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent('Query completed successfully');
    });

    it('should announce errors to screen readers', () => {
      render(<ResultsPanel {...defaultProps} error={mockError} />);

      const alertRegion = screen.getByRole('alert');
      expect(alertRegion).toHaveTextContent('Query failed');
    });
  });

  describe('Performance', () => {
    it('should handle large result sets efficiently', () => {
      const largeResult: QueryResult = {
        data: Array.from({ length: 1000 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
        })),
        columns: [
          { name: 'id', type: 'number', nullable: false },
          { name: 'name', type: 'string', nullable: false },
          { name: 'email', type: 'string', nullable: true },
        ],
        executionTime: 500,
      };

      const startTime = performance.now();
      render(<ResultsPanel {...defaultProps} result={largeResult} />);
      const endTime = performance.now();

      // Should render within 200ms
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ResultsPanel
          {...defaultProps}
          className="custom-results-panel"
        />
      );

      expect(container.firstChild).toHaveClass('custom-results-panel');
    });

    it('should use custom maxHeight', () => {
      render(
        <ResultsPanel
          {...defaultProps}
          result={mockResult}
          maxHeight="300px"
        />
      );

      const container = screen.getByTestId('results-container');
      expect(container).toHaveStyle({ maxHeight: '300px' });
    });
  });
});