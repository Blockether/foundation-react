/**
 * Unit tests for SQLToolbar component
 *
 * These tests verify the toolbar functionality including buttons, status indicators,
 * and user interactions. They should FAIL before implementation and PASS after.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SQLToolbar } from '../../../src/components/sql/sql-toolbar';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Play: () => <div data-testid="play-icon">Play</div>,
  Format: () => <div data-testid="format-icon">Format</div>,
  HelpCircle: () => <div data-testid="help-icon">Help</div>,
  Database: () => <div data-testid="database-icon">Database</div>,
  ChevronDown: () => <div data-testid="chevron-icon">Chevron</div>,
}));

describe('SQLToolbar', () => {
  const defaultProps = {
    onRunQuery: jest.fn(),
    onFormatQuery: jest.fn(),
    onHelp: jest.fn(),
    isExecuting: false,
    databaseStatus: {
      state: 'connected' as const,
      message: 'Connected',
    },
    savedQueries: [],
    onSavedQuerySelect: jest.fn(),
    showHelp: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Toolbar Rendering', () => {
    it('should render toolbar with proper ARIA attributes', () => {
      render(<SQLToolbar {...defaultProps} />);

      const toolbar = screen.getByRole('toolbar');
      expect(toolbar).toBeInTheDocument();
      expect(toolbar).toHaveAttribute('aria-label', 'SQL editor toolbar');
    });

    it('should display Run Query button', () => {
      render(<SQLToolbar {...defaultProps} />);

      const runButton = screen.getByRole('button', { name: /run query/i });
      expect(runButton).toBeInTheDocument();
      expect(screen.getByTestId('play-icon')).toBeInTheDocument();
    });

    it('should display Format Query button', () => {
      render(<SQLToolbar {...defaultProps} />);

      const formatButton = screen.getByRole('button', { name: /format query/i });
      expect(formatButton).toBeInTheDocument();
      expect(screen.getByTestId('format-icon')).toBeInTheDocument();
    });

    it('should display Help button when showHelp is true', () => {
      render(<SQLToolbar {...defaultProps} showHelp={true} />);

      const helpButton = screen.getByRole('button', { name: /help/i });
      expect(helpButton).toBeInTheDocument();
      expect(screen.getByTestId('help-icon')).toBeInTheDocument();
    });

    it('should not display Help button when showHelp is false', () => {
      render(<SQLToolbar {...defaultProps} showHelp={false} />);

      const helpButton = screen.queryByRole('button', { name: /help/i });
      expect(helpButton).not.toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('should call onRunQuery when Run button is clicked', async () => {
      const mockRun = jest.fn();
      render(<SQLToolbar {...defaultProps} onRunQuery={mockRun} />);

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.click(runButton);

      expect(mockRun).toHaveBeenCalledTimes(1);
    });

    it('should call onFormatQuery when Format button is clicked', async () => {
      const mockFormat = jest.fn();
      render(<SQLToolbar {...defaultProps} onFormatQuery={mockFormat} />);

      const formatButton = screen.getByRole('button', { name: /format query/i });
      await userEvent.click(formatButton);

      expect(mockFormat).toHaveBeenCalledTimes(1);
    });

    it('should call onHelp when Help button is clicked', async () => {
      const mockHelp = jest.fn();
      render(<SQLToolbar {...defaultProps} onHelp={mockHelp} />);

      const helpButton = screen.getByRole('button', { name: /help/i });
      await userEvent.click(helpButton);

      expect(mockHelp).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading States', () => {
    it('should disable Run button and show loading when isExecuting is true', () => {
      render(<SQLToolbar {...defaultProps} isExecuting={true} />);

      const runButton = screen.getByRole('button', { name: /executing/i });
      expect(runButton).toBeDisabled();
      expect(screen.getByText(/executing/i)).toBeInTheDocument();
    });

    it('should enable Run button when isExecuting is false', () => {
      render(<SQLToolbar {...defaultProps} isExecuting={false} />);

      const runButton = screen.getByRole('button', { name: /run query/i });
      expect(runButton).not.toBeDisabled();
    });
  });

  describe('Database Status', () => {
    it('should display database status indicator', () => {
      render(<SQLToolbar {...defaultProps} />);

      expect(screen.getByTestId('database-icon')).toBeInTheDocument();
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('should show connecting status', () => {
      const connectingStatus = {
        state: 'connecting' as const,
        message: 'Connecting...',
      };

      render(<SQLToolbar {...defaultProps} databaseStatus={connectingStatus} />);

      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('should show error status', () => {
      const errorStatus = {
        state: 'error' as const,
        message: 'Connection failed',
      };

      render(<SQLToolbar {...defaultProps} databaseStatus={errorStatus} />);

      expect(screen.getByText('Connection failed')).toBeInTheDocument();
    });
  });

  describe('Saved Queries Dropdown', () => {
    const mockSavedQueries = [
      {
        id: '1',
        name: 'All Users',
        query: 'SELECT * FROM users;',
        description: 'Get all users',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        name: 'Active Users',
        query: 'SELECT * FROM users WHERE active = true;',
        description: 'Get active users only',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should display saved queries dropdown when queries are provided', () => {
      render(
        <SQLToolbar
          {...defaultProps}
          savedQueries={mockSavedQueries}
        />
      );

      const dropdown = screen.getByRole('button', { name: /select query/i });
      expect(dropdown).toBeInTheDocument();
      expect(screen.getByText(/select query/i)).toBeInTheDocument();
    });

    it('should not display dropdown when no saved queries provided', () => {
      render(<SQLToolbar {...defaultProps} savedQueries={[]} />);

      const dropdown = screen.queryByRole('button', { name: /select query/i });
      expect(dropdown).not.toBeInTheDocument();
    });

    it('should open dropdown when button is clicked', async () => {
      render(
        <SQLToolbar
          {...defaultProps}
          savedQueries={mockSavedQueries}
        />
      );

      const dropdown = screen.getByRole('button', { name: /select query/i });
      await userEvent.click(dropdown);

      // Should show saved query options
      await waitFor(() => {
        expect(screen.getByText('All Users')).toBeInTheDocument();
        expect(screen.getByText('Active Users')).toBeInTheDocument();
      });
    });

    it('should call onSavedQuerySelect when query is selected', async () => {
      const mockSelect = jest.fn();

      render(
        <SQLToolbar
          {...defaultProps}
          savedQueries={mockSavedQueries}
          onSavedQuerySelect={mockSelect}
        />
      );

      const dropdown = screen.getByRole('button', { name: /select query/i });
      await userEvent.click(dropdown);

      const firstQuery = screen.getByText('All Users');
      await userEvent.click(firstQuery);

      expect(mockSelect).toHaveBeenCalledWith(mockSavedQueries[0]);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should trigger Run Query on Ctrl+Enter', async () => {
      const mockRun = jest.fn();
      render(<SQLToolbar {...defaultProps} onRunQuery={mockRun} />);

      fireEvent.keyDown(document, { key: 'Enter', ctrlKey: true });

      expect(mockRun).toHaveBeenCalledTimes(1);
    });

    it('should trigger Format Query on Ctrl+S', async () => {
      const mockFormat = jest.fn();
      render(<SQLToolbar {...defaultProps} onFormatQuery={mockFormat} />);

      fireEvent.keyDown(document, { key: 's', ctrlKey: true });

      expect(mockFormat).toHaveBeenCalledTimes(1);
    });

    it('should trigger Help on Ctrl+/', async () => {
      const mockHelp = jest.fn();
      render(<SQLToolbar {...defaultProps} onHelp={mockHelp} />);

      fireEvent.keyDown(document, { key: '/', ctrlKey: true });

      expect(mockHelp).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on all buttons', () => {
      render(<SQLToolbar {...defaultProps} />);

      const runButton = screen.getByRole('button', { name: /run query/i });
      expect(runButton).toHaveAttribute('aria-label', 'Run SQL Query');

      const formatButton = screen.getByRole('button', { name: /format query/i });
      expect(formatButton).toHaveAttribute('aria-label', 'Format SQL Query');

      const helpButton = screen.getByRole('button', { name: /help/i });
      expect(helpButton).toHaveAttribute('aria-label', 'Show Help');
    });

    it('should support keyboard navigation', async () => {
      render(<SQLToolbar {...defaultProps} />);

      // Tab through toolbar buttons
      await userEvent.tab();
      expect(screen.getByRole('button', { name: /run query/i })).toHaveFocus();

      await userEvent.tab();
      expect(screen.getByRole('button', { name: /format query/i })).toHaveFocus();

      await userEvent.tab();
      if (defaultProps.showHelp) {
        expect(screen.getByRole('button', { name: /help/i })).toHaveFocus();
      }
    });

    it('should announce status changes to screen readers', async () => {
      const { rerender } = render(<SQLToolbar {...defaultProps} isExecuting={false} />);

      // Change to executing state
      rerender(<SQLToolbar {...defaultProps} isExecuting={true} />);

      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toBeInTheDocument();
      expect(statusRegion).toHaveTextContent(/executing/i);
    });
  });

  describe('Tooltip Support', () => {
    it('should show tooltip on hover for Run button', async () => {
      render(<SQLToolbar {...defaultProps} />);

      const runButton = screen.getByRole('button', { name: /run query/i });
      await userEvent.hover(runButton);

      await waitFor(() => {
        expect(screen.getByText('Run query (Ctrl+Enter)')).toBeInTheDocument();
      });
    });

    it('should show tooltip on hover for Format button', async () => {
      render(<SQLToolbar {...defaultProps} />);

      const formatButton = screen.getByRole('button', { name: /format query/i });
      await userEvent.hover(formatButton);

      await waitFor(() => {
        expect(screen.getByText('Format query (Ctrl+S)')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should collapse buttons on small screens', () => {
      // Mock small screen width
      global.innerWidth = 500;
      global.dispatchEvent(new Event('resize'));

      render(<SQLToolbar {...defaultProps} />);

      // Should show icon-only buttons on small screens
      const runButton = screen.getByRole('button', { name: /run/i });
      expect(runButton).toBeInTheDocument();
      expect(screen.queryByText('Run Query')).not.toBeInTheDocument();
    });

    it('should show full button labels on large screens', () => {
      // Mock large screen width
      global.innerWidth = 1200;
      global.dispatchEvent(new Event('resize'));

      render(<SQLToolbar {...defaultProps} />);

      // Should show full button text on large screens
      const runButton = screen.getByRole('button', { name: /run query/i });
      expect(runButton).toBeInTheDocument();
      expect(screen.getByText('Run Query')).toBeInTheDocument();
    });
  });
});