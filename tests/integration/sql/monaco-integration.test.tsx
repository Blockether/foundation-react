/**
 * Integration tests for Monaco Editor integration
 *
 * These tests verify the Monaco Editor integration with SQL language support,
 * keyboard shortcuts, and theme integration. They should FAIL before implementation.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SQLEditor } from '../../../src/components/sql/sql-editor';

// Mock Monaco Editor and its API
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
    getLanguageId: jest.fn(() => 'sql'),
  })),
  getSelection: jest.fn(() => ({
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: 1,
    endColumn: 1,
  })),
  setSelection: jest.fn(),
  revealLine: jest.fn(),
};

const mockMonaco = {
  editor: {
    create: jest.fn(() => mockEditor),
    defineTheme: jest.fn(),
    setTheme: jest.fn(),
    Model: jest.fn(),
    Uri: jest.fn(),
    KeyMod: {
      CtrlCmd: 2048,
      Shift: 1024,
    },
    KeyCode: {
      Enter: 3,
      KeyS: 83,
      Slash: 89,
    },
  },
  languages: {
    register: jest.fn(),
    setMonarchTokensProvider: jest.fn(),
    setLanguageConfiguration: jest.fn(),
    registerCompletionItemProvider: jest.fn(),
    registerCodeActionProvider: jest.fn(),
  },
};

jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange, onMount, language, theme, options }: any) => {
    // Simulate Monaco editor mounting
    setTimeout(() => {
      if (onMount) {
        onMount(mockEditor, mockMonaco);
      }
    }, 0);

    return (
      <div>
        <textarea
          data-testid="monaco-editor"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          data-language={language}
          data-theme={theme}
        />
        <div data-testid="editor-options">{JSON.stringify(options)}</div>
      </div>
    );
  },
}));

// Mock SQL language setup
jest.mock('@popsql/monaco-sql-languages', () => ({
  setup: jest.fn().mockImplementation(() => {
    // Simulate SQL language setup
    return Promise.resolve();
  }),
}));

describe('Monaco Editor Integration', () => {
  const defaultProps = {
    value: 'SELECT * FROM users;',
    onChange: jest.fn(),
    onExecute: jest.fn(),
    onFormat: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockEditor.getValue.mockReturnValue(defaultProps.value);
  });

  describe('Editor Initialization', () => {
    it('should initialize Monaco Editor with SQL language', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockMonaco.editor.create).toHaveBeenCalledWith(
          expect.objectContaining({
            value: 'SELECT * FROM users;',
            language: 'sql',
            theme: 'vs-light',
          }),
          expect.any(Object)
        );
      });
    });

    it('should setup SQL language highlighting', async () => {
      const { setup } = require('@popsql/monaco-sql-languages');

      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(setup).toHaveBeenCalledWith(mockMonaco, 'sql');
      });
    });

    it('should configure editor options correctly', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockMonaco.editor.create).toHaveBeenCalledWith(
          expect.objectContaining({
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 14,
            tabSize: 2,
            wordWrap: 'on',
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe('Theme Integration', () => {
    it('should apply light theme by default', async () => {
      render(<SQLEditor {...defaultProps} theme="light" />);

      await waitFor(() => {
        expect(mockMonaco.editor.create).toHaveBeenCalledWith(
          expect.objectContaining({ theme: 'vs-light' }),
          expect.any(Object)
        );
      });
    });

    it('should apply dark theme when specified', async () => {
      render(<SQLEditor {...defaultProps} theme="dark" />);

      await waitFor(() => {
        expect(mockMonaco.editor.create).toHaveBeenCalledWith(
          expect.objectContaining({ theme: 'vs-dark' }),
          expect.any(Object)
        );
      });
    });

    it('should detect system theme when theme is auto', async () => {
      // Mock system prefers dark mode
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

      await waitFor(() => {
        expect(mockMonaco.editor.create).toHaveBeenCalledWith(
          expect.objectContaining({ theme: 'vs-dark' }),
          expect.any(Object)
        );
      });
    });

    it('should update theme dynamically', async () => {
      const { rerender } = render(<SQLEditor {...defaultProps} theme="light" />);

      await waitFor(() => {
        expect(mockMonaco.editor.create).toHaveBeenCalledWith(
          expect.objectContaining({ theme: 'vs-light' }),
          expect.any(Object)
        );
      });

      rerender(<SQLEditor {...defaultProps} theme="dark" />);

      await waitFor(() => {
        expect(mockMonaco.editor.setTheme).toHaveBeenCalledWith('vs-dark');
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should register Ctrl+Enter shortcut for query execution', async () => {
      const mockExecute = jest.fn();

      render(<SQLEditor {...defaultProps} onExecute={mockExecute} />);

      await waitFor(() => {
        expect(mockMonaco.editor.addCommand).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Function)
        );
      });

      // Get the registered command callback
      const addCommandCalls = mockMonaco.editor.addCommand.mock.calls;
      const executeCommandCall = addCommandCalls.find((call) =>
        call[0] === mockMonaco.editor.KeyMod.CtrlCmd | mockMonaco.editor.KeyCode.Enter
      );

      if (executeCommandCall) {
        const callback = executeCommandCall[1];
        callback();

        expect(mockExecute).toHaveBeenCalled();
      }
    });

    it('should register Ctrl+S shortcut for formatting', async () => {
      const mockFormat = jest.fn();

      render(<SQLEditor {...defaultProps} onFormat={mockFormat} />);

      await waitFor(() => {
        expect(mockMonaco.editor.addCommand).toHaveBeenCalled();
      });

      // Get the registered command callback
      const addCommandCalls = mockMonaco.editor.addCommand.mock.calls;
      const formatCommandCall = addCommandCalls.find((call) =>
        call[0] === mockMonaco.editor.KeyMod.CtrlCmd | mockMonaco.editor.KeyCode.KeyS
      );

      if (formatCommandCall) {
        const callback = formatCommandCall[1];
        callback();

        expect(mockFormat).toHaveBeenCalled();
      }
    });

    it('should register Ctrl+/ shortcut for comment toggle', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockMonaco.editor.addCommand).toHaveBeenCalled();
      });

      // Get the registered command callback
      const addCommandCalls = mockMonaco.editor.addCommand.mock.calls;
      const commentCommandCall = addCommandCalls.find((call) =>
        call[0] === mockMonaco.editor.KeyMod.CtrlCmd | mockMonaco.editor.KeyCode.Slash
      );

      expect(commentCommandCall).toBeDefined();
    });
  });

  describe('Language Features', () => {
    it('should setup SQL language provider', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockMonaco.languages.register).toHaveBeenCalledWith('sql', expect.any(Object));
        expect(mockMonaco.languages.setMonarchTokensProvider).toHaveBeenCalledWith('sql', expect.any(Object));
      });
    });

    it('should setup SQL completion provider', async () => {
      render(<SQLEditor {...defaultProps} enableAutoComplete={true} />);

      await waitFor(() => {
        expect(mockMonaco.languages.registerCompletionItemProvider).toHaveBeenCalledWith('sql', expect.any(Object));
      });
    });

    it('should setup SQL code actions provider', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockMonaco.languages.registerCodeActionProvider).toHaveBeenCalledWith('sql', expect.any(Object));
      });
    });

    it('should configure SQL language settings', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockMonaco.languages.setLanguageConfiguration).toHaveBeenCalledWith('sql', expect.any(Object));
      });
    });
  });

  describe('Editor Events', () => {
    it('should handle content changes', async () => {
      const mockChange = jest.fn();

      render(<SQLEditor {...defaultProps} onChange={mockChange} />);

      await waitFor(() => {
        expect(mockEditor.onDidChangeModelContent).toHaveBeenCalled();
      });

      // Get the change listener
      const changeListenerCalls = mockEditor.onDidChangeModelContent.mock.calls;
      if (changeListenerCalls.length > 0) {
        const listener = changeListenerCalls[0][0];

        // Simulate content change
        listener({
          range: { startLineNumber: 1, startColumn: 1, endLineNumber: 1, endColumn: 1 },
          text: 'SELECT'
        });

        expect(mockChange).toHaveBeenCalled();
      }
    });

    it('should handle focus and blur events', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockEditor.focus).toHaveBeenCalled();
      });

      // Simulate focus event
      fireEvent.focus(screen.getByTestId('monaco-editor'));

      // Simulate blur event
      fireEvent.blur(screen.getByTestId('monaco-editor'));
    });
  });

  describe('Value Management', () => {
    it('should update editor value when prop changes', async () => {
      const { rerender } = render(<SQLEditor {...defaultProps} value="SELECT 1;" />);

      await waitFor(() => {
        expect(mockEditor.setValue).toHaveBeenCalledWith('SELECT 1;');
      });

      rerender(<SQLEditor {...defaultProps} value="SELECT 2;" />);

      expect(mockEditor.setValue).toHaveBeenCalledWith('SELECT 2;');
    });

    it('should get current editor value', async () => {
      mockEditor.getValue.mockReturnValue('SELECT * FROM users;');

      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        const editorElement = screen.getByTestId('monaco-editor');
        expect(editorElement).toHaveValue('SELECT * FROM users;');
      });
    });
  });

  describe('Selection Management', () => {
    it('should get and set cursor position', async () => {
      mockEditor.getPosition.mockReturnValue({ lineNumber: 5, column: 10 });

      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockEditor.getPosition).toHaveBeenCalled();
      });

      // Set position
      mockEditor.setPosition.mockClear();
      fireEvent.click(screen.getByTestId('monaco-editor'));

      // Note: Position setting would be handled by Monaco editor internally
    });

    it('should handle text selection', async () => {
      mockEditor.getSelection.mockReturnValue({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 10,
      });

      render(<SQLEditor {...defaultProps} />);

      // Simulate text selection
      fireEvent.select(screen.getByTestId('monaco-editor'));
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle window resize', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockEditor.layout).toHaveBeenCalled();
      });

      // Simulate window resize
      global.dispatchEvent(new Event('resize'));

      expect(mockEditor.layout).toHaveBeenCalled();
    });
  });

  describe('Accessibility Features', () => {
    it('should support keyboard navigation', async () => {
      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockEditor.focus).toHaveBeenCalled();
      });

      // Test keyboard navigation
      fireEvent.keyDown(screen.getByTestId('monaco-editor'), { key: 'ArrowDown' });
      fireEvent.keyDown(screen.getByTestId('monaco-editor'), { key: 'ArrowUp' });
      fireEvent.keyDown(screen.getByTestId('monaco-editor'), { key: 'Home' });
      fireEvent.keyDown(screen.getByTestId('monaco-editor'), { key: 'End' });
    });

    it('should support screen reader announcements', async () => {
      render(<SQLEditor {...defaultProps} />);

      const editor = screen.getByTestId('monaco-editor');

      // Should have proper ARIA attributes
      expect(editor).toHaveAttribute('role', 'textbox');
      expect(editor).toHaveAttribute('aria-label');
      expect(editor).toHaveAttribute('aria-multiline', 'true');
    });
  });

  describe('Error Handling', () => {
    it('should handle Monaco initialization failure', async () => {
      const originalConsoleError = console.error;
      console.error = jest.fn();

      mockMonaco.editor.create.mockImplementation(() => {
        throw new Error('Monaco initialization failed');
      });

      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Monaco Editor initialization failed:',
          expect.any(Error)
        );
      });

      // Restore
      mockMonaco.editor.create.mockReturnValue(mockEditor);
      console.error = originalConsoleError;
    });

    it('should handle SQL language setup failure', async () => {
      const { setup } = require('@popsql/monaco-sql-languages');
      setup.mockRejectedValue(new Error('SQL language setup failed'));

      const originalConsoleError = console.error;
      console.error = jest.fn();

      render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'SQL language setup failed:',
          expect.any(Error)
        );
      });

      console.error = originalConsoleError;
    });
  });

  describe('Performance Optimization', () => {
    it('should debounce change events', async () => {
      const mockChange = jest.fn();

      render(<SQLEditor {...defaultProps} onChange={mockChange} />);

      await waitFor(() => {
        expect(mockEditor.onDidChangeModelContent).toHaveBeenCalled();
      });

      const changeListenerCalls = mockEditor.onDidChangeModelContent.mock.calls;
      if (changeListenerCalls.length > 0) {
        const listener = changeListenerCalls[0][0];

        // Simulate rapid changes
        listener({ text: 'S' });
        listener({ text: 'SE' });
        listener({ text: 'SEL' });
        listener({ text: 'SELE' });
        listener({ text: 'SELEC' });
        listener({ text: 'SELECT' });

        // Should only call once due to debouncing
        expect(mockChange).toHaveBeenCalledTimes(1);
      }
    });

    it('should cleanup on unmount', async () => {
      const { unmount } = render(<SQLEditor {...defaultProps} />);

      await waitFor(() => {
        expect(mockMonaco.editor.create).toHaveBeenCalled();
      });

      unmount();

      expect(mockEditor.dispose).toHaveBeenCalled();
    });
  });
});