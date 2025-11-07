/**
 * End-to-end integration tests for SQL Cockpit component
 *
 * These tests verify the complete SQL workflow from typing queries to viewing results.
 * They should FAIL before implementation and PASS after full implementation.
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
  format: jest.fn((query: string) => {
    // Basic formatting simulation
    return query
      .replace(/\s+/g, ' ')
      .replace(/select/gi, 'SELECT')
      .replace(/from/gi, 'FROM')
      .replace(/where/gi, 'WHERE')
      .replace(/;/g, ';\n');
  }),
}));

describe('SQL Cockpit E2E Integration', () => {
  const mockQueryResult = {
    data: [
      { id: 1, name: 'Alice', email: 'alice@example.com', active: true },
      { id: 2, name: 'Bob', email: 'bob@example.com', active: false },
      { id: 3, name: 'Charlie', email: 'charlie@example.com', active: true },
    ],
    columns: [
      { name: 'id', type: 'number' as const, nullable: false },
      { name: 'name', type: 'string' as const, nullable: false },
      { name: 'email', type: 'string' as const, nullable: true },
      { name: 'active', type: 'boolean' as const, nullable: false },
    ],
    executionTime: 125,
  };

  const defaultProps = {
    onQueryExecute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete SQL Workflow', () => {
    it('should execute complete workflow from typing query to viewing results', async () => {
      const mockExecute = jest.fn().mockResolvedValue(mockQueryResult);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      // 1. Type a SQL query in the editor
      const editor = screen.getByTestId('monaco-editor');
      await userEvent.clear(editor);
      await userEvent.type(editor, 'SELECT * FROM users WHERE active = true;');

      // 2. Click Run Query button
      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      // 3. Verify query was executed
      expect(mockExecute).toHaveBeenCalledWith('SELECT * FROM users WHERE active = true;');

      // 4. Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
      });

      // 5. Verify results table structure
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('id')).toBeInTheDocument();
      expect(screen.getByText('name')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('active')).toBeInTheDocument();

      // 6. Verify execution stats
      expect(screen.getByText('Query executed in 125ms')).toBeInTheDocument();
      expect(screen.getByText(/rows returned/)).toBeInTheDocument();
    });

    it('should handle query workflow with keyboard shortcuts', async () => {
      const mockExecute = jest.fn().mockResolvedValue(mockQueryResult);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.clear(editor);
      await userEvent.type(editor, 'SELECT COUNT(*) FROM users;');

      // Use Ctrl+Enter to execute query
      fireEvent.keyDown(editor, { key: 'Enter', ctrlKey: true });

      expect(mockExecute).toHaveBeenCalledWith('SELECT COUNT(*) FROM users;');

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });

    it('should handle query formatting workflow', async () => {
      render(<SQLCockpit {...defaultProps} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.clear(editor);
      await userEvent.type(editor, 'select id,name from users where active=1');

      // Click Format button
      const formatButton = screen.getByRole('button', { name: /format query/i });
      await userEvent.click(formatButton);

      // Verify query was formatted
      await waitFor(() => {
        expect(editor).toHaveValue('SELECT id name FROM users WHERE active = 1;');
      });
    });

    it('should handle error workflow gracefully', async () => {
      const mockError = new Error('Table "nonexistent" does not exist');
      const mockExecute = jest.fn().mockRejectedValue(mockError);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.clear(editor);
      await userEvent.type(editor, 'SELECT * FROM nonexistent;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/query error/i)).toBeInTheDocument();
        expect(screen.getByText(/does not exist/i)).toBeInTheDocument();
      });

      // Verify editor still contains the query for correction
      expect(editor).toHaveValue('SELECT * FROM nonexistent;');
    });
  });

  describe('Saved Queries Integration', () => {
    const savedQueries = [
      {
        id: '1',
        name: 'Active Users',
        query: 'SELECT * FROM users WHERE active = true;',
        description: 'Get all active users',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01'),
      },
      {
        id: '2',
        name: 'User Count',
        query: 'SELECT COUNT(*) as total_users FROM users;',
        description: 'Count total users',
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
      },
    ];

    it('should integrate saved queries into workflow', async () => {
      const mockExecute = jest.fn().mockResolvedValue(mockQueryResult);
      const mockSelect = jest.fn();

      render(
        <SQLCockpit
          {...defaultProps}
          savedQueries={savedQueries}
          onSavedQuerySelect={mockSelect}
          onQueryExecute={mockExecute}
        />
      );

      // Open saved queries dropdown
      const savedQueryButton = screen.getByRole('button', { name: /select query/i });
      await userEvent.click(savedQueryButton);

      // Select a saved query
      await waitFor(() => {
        expect(screen.getByText('Active Users')).toBeInTheDocument();
      });
      await userEvent.click(screen.getByText('Active Users'));

      // Verify callback was triggered
      expect(mockSelect).toHaveBeenCalledWith(savedQueries[0]);

      // Execute the selected query (simulated by updating editor)
      const editor = screen.getByTestId('monaco-editor');
      await userEvent.clear(editor);
      await userEvent.type(editor, savedQueries[0].query);

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      expect(mockExecute).toHaveBeenCalledWith(savedQueries[0].query);
    });
  });

  describe('Help System Integration', () => {
    it('should integrate help system into workflow', async () => {
      const mockHelp = jest.fn();

      render(
        <SQLCockpit
          {...defaultProps}
          showHelp={true}
          helpContent={<div>Help content here</div>}
        />
      );

      // Click help button
      const helpButton = screen.getByRole('button', { name: /help/i });
      await userEvent.click(helpButton);

      // Verify help content appears
      await waitFor(() => {
        expect(screen.getByText('Help content here')).toBeInTheDocument();
      });
    });
  });

  describe('Database Status Integration', () => {
    it('should display and update database status', async () => {
      render(<SQLCockpit {...defaultProps} />);

      // Initial status should be shown
      expect(screen.getByText(/connected/i)).toBeInTheDocument();

      // Status should update during query execution
      const mockExecute = jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)));

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT 1;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      // Should show executing status
      expect(screen.getByText(/executing/i)).toBeInTheDocument();
      expect(runButton).toBeDisabled();
    });
  });

  describe('Theme Integration', () => {
    it('should work with dark theme', async () => {
      render(<SQLCockpit {...defaultProps} theme="dark" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveClass('dark-theme');

      // Execute query in dark theme
      const mockExecute = jest.fn().mockResolvedValue(mockQueryResult);
      await userEvent.type(editor, 'SELECT * FROM users;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('table')).toHaveClass('dark-theme');
      });
    });

    it('should work with light theme', async () => {
      render(<SQLCockpit {...defaultProps} theme="light" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveClass('light-theme');

      // Execute query in light theme
      const mockExecute = jest.fn().mockResolvedValue(mockQueryResult);
      await userEvent.type(editor, 'SELECT * FROM users;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('table')).toHaveClass('light-theme');
      });
    });
  });

  describe('Responsive Design Integration', () => {
    it('should adapt workflow for mobile screens', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      global.dispatchEvent(new Event('resize'));

      const mockExecute = jest.fn().mockResolvedValue(mockQueryResult);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      // Should have mobile-friendly layout
      expect(screen.getByRole('toolbar')).toHaveClass('mobile-toolbar');

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT * FROM users;');

      const runButton = screen.getByRole('button', { name: /run/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('table')).toHaveClass('mobile-table');
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('should maintain accessibility throughout workflow', async () => {
      const mockExecute = jest.fn().mockResolvedValue(mockQueryResult);

      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      // Check initial accessibility
      expect(screen.getByRole('toolbar')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      // Navigate with keyboard
      await userEvent.tab();
      expect(screen.getByRole('button', { name: /run query/i })).toHaveFocus();

      // Execute query and check results accessibility
      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT * FROM users;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getAllByRole('columnheader')).toHaveLength(4);
        expect(screen.getAllByRole('row')).toHaveLength(4); // 1 header + 3 data
      });

      // Check ARIA live regions for status updates
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Performance Integration', () => {
    it('should handle workflow within performance limits', async () => {
      const mockExecute = jest.fn().mockResolvedValue(mockQueryResult);

      const startTime = performance.now();
      render(<SQLCockpit {...defaultProps} onQueryExecute={mockExecute} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT * FROM users;');

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete within reasonable time (e.g., 1 second for UI operations)
      expect(totalTime).toBeLessThan(1000);
    });
  });
});