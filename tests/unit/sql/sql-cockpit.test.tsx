/**
 * Unit tests for SQLCockpit component
 *
 * These tests verify the basic rendering and behavior of the SQL Cockpit component.
 * They should FAIL before implementation and PASS after implementation.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SQLCockpit } from '../../../src/components/sql/cockpit';

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

// Mock DuckDB-WASM
jest.mock('@duckdb/duckdb-wasm', () => ({
  createDuckDB: jest.fn(),
}));

// Mock sql-formatter
jest.mock('sql-formatter', () => ({
  format: jest.fn((query: string) => query),
}));

describe('SQLCockpit', () => {
  const defaultProps = {
    onQueryExecute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render SQL Cockpit component with toolbar, editor, and results area', () => {
      render(<SQLCockpit {...defaultProps} />);

      // Toolbar should be present
      expect(screen.getByRole('toolbar')).toBeInTheDocument();

      // Editor should be present
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();

      // Results area should be present
      expect(screen.getByTestId('results')).toBeInTheDocument();
    });

    it('should display Run Query button in toolbar', () => {
      render(<SQLCockpit {...defaultProps} />);

      const runButton = screen.getByRole('button', { name: /run query/i });
      expect(runButton).toBeInTheDocument();
      expect(runButton).not.toBeDisabled();
    });

    it('should display Format Query button in toolbar', () => {
      render(<SQLCockpit {...defaultProps} />);

      const formatButton = screen.getByRole('button', { name: /format query/i });
      expect(formatButton).toBeInTheDocument();
      expect(formatButton).not.toBeDisabled();
    });

    it('should display Help button in toolbar when showHelp is true', () => {
      render(<SQLCockpit {...defaultProps} showHelp={true} />);

      const helpButton = screen.getByRole('button', { name: /help/i });
      expect(helpButton).toBeInTheDocument();
    });

    it('should not display Help button when showHelp is false', () => {
      render(<SQLCockpit {...defaultProps} showHelp={false} />);

      const helpButton = screen.queryByRole('button', { name: /help/i });
      expect(helpButton).not.toBeInTheDocument();
    });
  });

  describe('Query Execution', () => {
    it('should call onQueryExecute when Run Query button is clicked', async () => {
      const mockExecute = jest.fn().mockResolvedValue({
        data: [{ id: 1, name: 'test' }],
        columns: [{ name: 'id', type: 'number', nullable: false }],
        executionTime: 100,
      });

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      const runButton = screen.getByRole('button', { name: /run query/i });

      // Type a query
      await userEvent.type(editor, 'SELECT * FROM test;');

      // Click run button
      await userEvent.click(runButton);

      expect(mockExecute).toHaveBeenCalledWith('SELECT * FROM test;');
    });

    it('should show loading state while query is executing', async () => {
      const mockExecute = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      const runButton = screen.getByRole('button', { name: /run query/i });

      await userEvent.type(editor, 'SELECT * FROM test;');
      await userEvent.click(runButton);

      // Should show loading state
      expect(runButton).toBeDisabled();
      expect(screen.getByText(/executing/i)).toBeInTheDocument();
    });

    it('should display query results when execution succeeds', async () => {
      const mockResult = {
        data: [{ id: 1, name: 'test' }],
        columns: [
          { name: 'id', type: 'number', nullable: false },
          { name: 'name', type: 'string', nullable: false },
        ],
        executionTime: 100,
      };

      const mockExecute = jest.fn().mockResolvedValue(mockResult);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      const runButton = screen.getByRole('button', { name: /run query/i });

      await userEvent.type(editor, 'SELECT * FROM test;');
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText('test')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('should display error message when query execution fails', async () => {
      const mockError = new Error('Syntax error');
      const mockExecute = jest.fn().mockRejectedValue(mockError);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      const runButton = screen.getByRole('button', { name: /run query/i });

      await userEvent.type(editor, 'INVALID SQL');
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByText(/syntax error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Query Formatting', () => {
    it('should format query when Format button is clicked', async () => {
      render(<SQLCockpit {...defaultProps} />);

      const editor = screen.getByTestId('monaco-editor');
      const formatButton = screen.getByRole('button', { name: /format query/i });

      // Type unformatted query
      await userEvent.type(editor, 'select id,name from users where active=1');

      // Click format button
      await userEvent.click(formatButton);

      await waitFor(() => {
        expect(editor).toHaveValue('SELECT\n  id,\n  name\nFROM users\nWHERE active = 1;');
      });
    });
  });

  describe('Saved Queries', () => {
    const savedQueries = [
      {
        id: '1',
        name: 'All Users',
        query: 'SELECT * FROM users;',
        description: 'Get all users',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should display saved queries dropdown when provided', () => {
      render(
        <SQLCockpit
          {...defaultProps}
          savedQueries={savedQueries}
        />
      );

      expect(screen.getByText(/all users/i)).toBeInTheDocument();
    });

    it('should call onSavedQuerySelect when saved query is selected', async () => {
      const mockSelect = jest.fn();

      render(
        <SQLCockpit
          {...defaultProps}
          savedQueries={savedQueries}
          onSavedQuerySelect={mockSelect}
        />
      );

      const savedQueryButton = screen.getByText(/all users/i);
      await userEvent.click(savedQueryButton);

      expect(mockSelect).toHaveBeenCalledWith(savedQueries[0]);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on toolbar', () => {
      render(<SQLCockpit {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveAttribute('aria-label', 'SQL editor toolbar');
    });

    it('should support keyboard navigation', async () => {
      render(<SQLCockpit {...defaultProps} />);

      const runButton = screen.getByRole('button', { name: /run query/i });

      // Tab to run button
      await userEvent.tab();
      expect(runButton).toHaveFocus();

      // Activate with Enter
      await userEvent.keyboard('{Enter}');

      // Should trigger query execution
      expect(defaultProps.onQueryExecute).toHaveBeenCalled();
    });
  });

  describe('Props Handling', () => {
    it('should use initialQuery prop when provided', () => {
      render(<SQLCockpit {...defaultProps} initialQuery="SELECT * FROM test;" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveValue('SELECT * FROM test;');
    });

    it('should use placeholder prop when provided', () => {
      render(
        <SQLCockpit
          {...defaultProps}
          placeholder="Type your SQL here..."
        />
      );

      const editor = screen.getByPlaceholderText('Type your SQL here...');
      expect(editor).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <SQLCockpit
          {...defaultProps}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should handle readOnly prop correctly', () => {
      render(<SQLCockpit {...defaultProps} readOnly={true} />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toBeDisabled();
    });

    it('should handle theme prop correctly', () => {
      render(<SQLCockpit {...defaultProps} theme="dark" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveClass('dark-theme');
    });
  });

  describe('Responsive Behavior', () => {
    it('should adapt to different screen sizes', () => {
      const { container } = render(<SQLCockpit {...defaultProps} />);

      // Should be responsive by default
      expect(container.firstChild).toHaveClass('responsive');
    });
  });
});