/**
 * Mock for @monaco-editor/react
 *
 * This mock provides a lightweight implementation of Monaco Editor for testing
 * without loading the actual Monaco Editor which requires web workers and is
 * heavy for unit tests.
 */

import React, { useRef, useEffect, forwardRef } from 'react';

// Mock Monaco Editor interface
export interface MonacoEditorProps {
  value?: string;
  defaultValue?: string;
  language?: string;
  theme?: string;
  height?: string | number;
  width?: string | number;
  options?: any;
  onChange?: (value: string | undefined) => void;
  onMount?: (editor: any, monaco: any) => void;
  loading?: React.ReactNode;
  path?: string;
}

// Mock editor instance
const mockEditor = {
  getValue: () => '',
  setValue: () => {},
  getModel: () => ({
    setValue: () => {},
    getValue: () => '',
  }),
  getPosition: () => ({ lineNumber: 1, column: 1 }),
  setPosition: () => {},
  focus: () => {},
  layout: () => {},
  addCommand: () => {},
  onDidChangeModelContent: () => ({ dispose: () => {} }),
  dispose: () => {},
};

// Mock Monaco API
const mockMonaco = {
  editor: {
    create: () => mockEditor,
    onDidCreateEditor: () => ({ dispose: () => {} }),
    defineTheme: () => {},
    setTheme: () => {},
  },
  languages: {
    register: () => {},
    setMonarchTokensProvider: () => {},
    setLanguageConfiguration: () => {},
  },
};

// Mock Monaco Editor component
export const MonacoEditor = forwardRef<any, MonacoEditorProps>(
  (
    {
      value = '',
      defaultValue = '',
      language = 'sql',
      theme = 'vs-light',
      height = '100%',
      width = '100%',
      options = {},
      onChange,
      onMount,
      loading = <div>Loading editor...</div>,
      path,
      ...props
    },
    ref
  ) => {
    const editorRef = useRef<any>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      if (onMount && textareaRef.current) {
        // Create a mock editor instance
        const editorInstance = {
          ...mockEditor,
          getValue: () => textareaRef.current?.value || '',
          setValue: (val: string) => {
            if (textareaRef.current) {
              textareaRef.current.value = val;
            }
          },
          focus: () => textareaRef.current?.focus(),
        };

        editorRef.current = editorInstance;
        onMount(editorInstance, mockMonaco);
      }
    }, [onMount]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = event.target.value;
      if (onChange) {
        onChange(newValue);
      }
    };

    return (
      <div
        ref={ref}
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          height: typeof height === 'number' ? `${height}px` : height,
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '8px',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          backgroundColor: theme === 'vs-dark' ? '#1e1e1e' : '#ffffff',
          color: theme === 'vs-dark' ? '#d4d4d4' : '#000000',
        }}
        {...props}
      >
        <textarea
          ref={textareaRef}
          value={value || defaultValue}
          onChange={handleChange}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            resize: 'none',
          }}
          placeholder="Enter SQL query here..."
          spellCheck={false}
        />
      </div>
    );
  }
);

MonacoEditor.displayName = 'MonacoEditor';

// Mock DiffEditor component
export const DiffEditor = forwardRef<any, any>((props, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        height: '400px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        padding: '8px',
        fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      }}
      {...props}
    >
      <div>Diff Editor (Mock)</div>
    </div>
  );
});

DiffEditor.displayName = 'DiffEditor';

// Mock loader
export const loader = {
  init: () => Promise.resolve(),
  config: () => Promise.resolve(),
};

// Default export
export default MonacoEditor;