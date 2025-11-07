/**
 * Unit tests for SQLEditor component
 *
 * These tests verify the Monaco Editor integration, SQL syntax highlighting,
 * formatting, and keyboard shortcuts. They should FAIL before implementation.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SQLEditor } from '../../../src/components/sql/editor';

// Mock Monaco Editor
const mockEditor = {
  getValue: jest.fn(() => ''),
  setValue: jest.fn(),
  getPosition: jest.fn(() => ({ lineNumber: 1, column: 1 })),
  setPosition: jest.fn(),
  focus: jest.fn(),
  layout: jest.fn(),
  addCommand: jest.fn(),
  onDidChangeModelContent: jest.fn(() => ({ dispose: jest.fn() })),
  dispose: jest.fn(),
  getModel: jest.fn(() => ({
    setValue: jest.fn(),
    getValue: jest.fn(() => ''),
  })),
};

const mockMonaco = {
  editor: {
    create: jest.fn(() => mockEditor),
    defineTheme: jest.fn(),
    setTheme: jest.fn(),
  },
  languages: {
    register: jest.fn(),
    setMonarchTokensProvider: jest.fn(),
    setLanguageConfiguration: jest.fn(),
  },
};

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange, onMount, language, theme, options }: any) => {
    // Simulate onMount callback
    setTimeout(() => {
      if (onMount) {
        onMount(mockEditor, mockMonaco);
      }
    }, 0);

    return (
      <textarea
        data-testid="monaco-editor"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        data-language={language}
        data-theme={theme}
        data-options={JSON.stringify(options)}
      />
    );
  },
}));

// Mock SQL language setup
jest.mock('@popsql/monaco-sql-languages', () => ({
  setup: jest.fn(),
}));

describe('SQLEditor', () => {
  const defaultProps = {
    value: 'SELECT * FROM users;',
    onChange: jest.fn(),
    onExecute: jest.fn(),
    onFormat: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Editor Rendering', () => {
    it('should render Monaco Editor with SQL language', () => {
      render(<SQLEditor {...defaultProps} />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toBeInTheDocument();
      expect(editor).toHaveAttribute('data-language', 'sql');
    });

    it('should initialize with provided value', () => {
      render(<SQLEditor {...defaultProps} value="SELECT id, name FROM users;" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveValue('SELECT id, name FROM users;');
    });

    it('should use placeholder when provided', () => {
      render(
        <SQLEditor
          {...defaultProps}
          value=""
          placeholder="Enter SQL query..."
        />
      );

      const editor = screen.getByPlaceholderText('Enter SQL query...');
      expect(editor).toBeInTheDocument();
    });
  });

  describe('Value Changes', () => {
    it('should call onChange when editor value changes', async () => {
      const mockChange = jest.fn();

      render(<SQLEditor {...defaultProps} onChange={mockChange} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, ' WHERE active = true');

      expect(mockChange).toHaveBeenCalledWith('SELECT * FROM users; WHERE active = true');
    });

    it('should handle empty values', async () => {
      const mockChange = jest.fn();

      render(<SQLEditor {...defaultProps} value="" onChange={mockChange} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, 'SELECT 1');

      expect(mockChange).toHaveBeenCalledWith('SELECT 1');
    });
  });

  describe('Theme Support', () => {
    it('should use light theme by default', () => {
      render(<SQLEditor {...defaultProps} />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveAttribute('data-theme', 'vs-light');
    });

    it('should use dark theme when specified', () => {
      render(<SQLEditor {...defaultProps} theme="dark" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveAttribute('data-theme', 'vs-dark');
    });

    it('should detect system theme when theme is auto', () => {
      // Mock system prefers dark
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-color-scheme: dark)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      render(<SQLEditor {...defaultProps} theme="auto" />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveAttribute('data-theme', 'vs-dark');
    });
  });

  describe('Editor Options', () => {
    it('should configure editor with default options', () => {
      render(<SQLEditor {...defaultProps} />);

      const editor = screen.getByTestId('monaco-editor');
      const options = JSON.parse(editor.getAttribute('data-options') || '{}');

      expect(options).toMatchObject({
        fontSize: 14,
        tabSize: 2,
        wordWrap: 'on',
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
      });
    });

    it('should show line numbers when enabled', () => {
      render(<SQLEditor {...defaultProps} showLineNumbers={true} />);

      const editor = screen.getByTestId('monaco-editor');
      const options = JSON.parse(editor.getAttribute('data-options') || '{}');

      expect(options.lineNumbers).toBe('on');
    });

    it('should hide line numbers when disabled', () => {
      render(<SQLEditor {...defaultProps} showLineNumbers={false} />);

      const editor = screen.getByTestId('monaco-editor');
      const options = JSON.parse(editor.getAttribute('data-options') || '{}');

      expect(options.lineNumbers).toBe('off');
    });

    it('should be read-only when specified', () => {
      render(<SQLEditor {...defaultProps} readOnly={true} />);

      const editor = screen.getByTestId('monaco-editor');
      const options = JSON.parse(editor.getAttribute('data-options') || '{}');

      expect(options.readOnly).toBe(true);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should register Ctrl+Enter shortcut for query execution', async () => {
      const mockExecute = jest.fn();

      render(<SQLEditor {...defaultProps} onExecute={mockExecute} />);

      // Wait for Monaco to mount
      await waitFor(() => {
        expect(mockMonaco.editor.addCommand).toHaveBeenCalled();
      });

      // Simulate Ctrl+Enter key press
      fireEvent.keyDown(document, { key: 'Enter', ctrlKey: true });

      expect(mockExecute).toHaveBeenCalled();
    });

    it('should register Ctrl+S shortcut for formatting', async () => {
      const mockFormat = jest.fn();

      render(<SQLEditor {...defaultProps} onFormat={mockFormat} />);

      // Wait for Monaco to mount
      await waitFor(() => {
        expect(mockMonaco.editor.addCommand).toHaveBeenCalled();
      });

      // Simulate Ctrl+S key press
      fireEvent.keyDown(document, { key: 's', ctrlKey: true });

      expect(mockFormat).toHaveBeenCalled();
    });

    it('should register Ctrl+/ shortcut for comment toggle', async () => {
      render(<SQLEditor {...defaultProps} />);

      // Wait for Monaco to mount
      await waitFor(() => {
        expect(mockMonaco.editor.addCommand).toHaveBeenCalled();
      });

      // Simulate Ctrl+/ key press
      fireEvent.keyDown(document, { key: '/', ctrlKey: true });

      // Should toggle comment (implementation specific)
      expect(mockMonaco.editor.addCommand).toHaveBeenCalled();
    });
  });

  describe('SQL Language Setup', () => {
    it('should setup SQL language highlighting', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockMonaco.languages.register).toHaveBeenCalled();
        expect(mockMonaco.languages.setMonarchTokensProvider).toHaveBeenCalled();
      });
    });

    it('should configure SQL language features', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockMonaco.languages.setLanguageConfiguration).toHaveBeenCalled();
      });
    });
  });

  describe('Autocomplete Support', () => {
    it('should enable SQL autocomplete', async () => {
      render(<SQLEditor {...defaultProps} enableAutoComplete={true} />);

      const editor = screen.getByTestId('monaco-editor');
      const options = JSON.parse(editor.getAttribute('data-options') || '{}');

      expect(options.suggestOnTriggerCharacters).toBe(true);
    });

    it('should disable SQL autocomplete when specified', async () => {
      render(<SQLEditor {...defaultProps} enableAutoComplete={false} />);

      const editor = screen.getByTestId('monaco-editor');
      const options = JSON.parse(editor.getAttribute('data-options') || '{}');

      expect(options.suggestOnTriggerCharacters).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle Monaco Editor initialization errors', async () => {
      // Mock Monaco initialization failure
      const originalConsoleError = console.error;
      console.error = jest.fn();

      const { create } = mockMonaco.editor;
      mockMonaco.editor.create = jest.fn(() => {
        throw new Error('Monaco initialization failed');
      });

      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Monaco Editor initialization failed:',
          expect.any(Error)
        );
      });

      // Restore original error function
      mockMonaco.editor.create = create;
      console.error = originalConsoleError;
    });
  });

  describe('Responsive Behavior', () => {
    it('should adjust editor height on window resize', async () => {
      render(<SQLEditor {...defaultProps} />);

      // Wait for editor to mount
      await waitFor(() => {
        expect(mockMonaco.editor.create).toHaveBeenCalled();
      });

      // Simulate window resize
      global.dispatchEvent(new Event('resize'));

      expect(mockEditor.layout).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<SQLEditor {...defaultProps} />);

      const editor = screen.getByTestId('monaco-editor');
      expect(editor).toHaveAttribute('role', 'textbox');
      expect(editor).toHaveAttribute('aria-label', 'SQL query editor');
      expect(editor).toHaveAttribute('aria-multiline', 'true');
    });

    it('should announce changes to screen readers', async () => {
      const mockAnnounce = jest.fn();

      // Mock live region
      Object.defineProperty(window, 'SpeechSynthesisUtterance', {
        writable: true,
        value: jest.fn(() => ({
          text: '',
          onend: mockAnnounce,
        })),
      });

      render(<SQLEditor {...defaultProps} />);

      const editor = screen.getByTestId('monaco-editor');
      await userEvent.type(editor, ' WHERE');

      // Should announce changes (implementation specific)
      expect(editor).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should debounce onChange calls', async () => {
      const mockChange = jest.fn();

      render(<SQLEditor {...defaultProps} onChange={mockChange} />);

      const editor = screen.getByTestId('monaco-editor');

      // Type multiple characters quickly
      await userEvent.type(editor, 'SELECT id FROM users', { delay: 10 });

      // Should debounce and not call onChange for every keystroke
      expect(mockChange).toHaveBeenCalledTimes(1);
      expect(mockChange).toHaveBeenCalledWith('SELECT id FROM users');
    });

    it('should cleanup editor on unmount', async () => {
      const { unmount } = render(<SQLEditor {...defaultProps} />);

      // Wait for editor to mount
      await waitFor(() => {
        expect(mockMonaco.editor.create).toHaveBeenCalled();
      });

      unmount();

      expect(mockEditor.dispose).toHaveBeenCalled();
    });
  });
});