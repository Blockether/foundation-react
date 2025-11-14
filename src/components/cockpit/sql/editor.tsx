/**
 * SQL Editor Component
 *
 * This component wraps Monaco Editor with SQL language support, syntax highlighting,
 * formatting, and keyboard shortcuts. It integrates with the SQL Cockpit component.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Editor, OnMount } from '@monaco-editor/react'
import { cn } from '@/lib/utils'
import { useTheme } from '../../theme'
import { DataSource } from '@/types/sql'
import {
  registerDuckDBCompletionProvider,
  CompletionContext,
} from '@/lib/sql-completion'
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

interface SQLEditorProps {
  value: string
  onChange: (value: string) => void
  onExecute?: () => void
  onFormat?: () => void
  onMount?: (editor: any) => void
  onFocus?: () => void
  onBlur?: () => void

  // Editor configuration
  readOnly?: boolean
  showLineNumbers?: boolean
  fontSize?: number
  tabSize?: number
  wordWrap?: boolean
  minimap?: boolean

  // SQL features
  enableAutoComplete?: boolean
  enableSyntaxHighlighting?: boolean
  enableFormatting?: boolean

  // Data sources for completion
  dataSources?: DataSource[]
  connection?: any

  // Styling
  className?: string
}

/**
 * SQL Editor component with Monaco Editor integration
 */
export function SQLEditor({
  value,
  onChange,
  onExecute,
  onFormat,
  onMount,
  onFocus,
  onBlur,
  tabSize = 2,
  wordWrap = true,
  minimap = false,
  enableAutoComplete = true,
  enableSyntaxHighlighting = true,
  enableFormatting = true,
  dataSources = [],
  connection,
  className,
}: SQLEditorProps): React.ReactNode {
  const editorRef = useRef<any>(null)
  const completionProviderRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const { theme } = useTheme()
  const monacoTheme = theme === 'light' ? 'light' : 'vs-dark'
  const [currentValue, setCurrentValue] = useState(value)
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false)

  // Initialize Monaco Editor for Vite
  useEffect(() => {
    // Configure Monaco workers for Vite
    self.MonacoEnvironment = {
      getWorker(_, label) {
        if (label === 'json') {
          return new jsonWorker()
        }
        if (label === 'css' || label === 'scss' || label === 'less') {
          return new cssWorker()
        }
        if (label === 'html' || label === 'handlebars' || label === 'razor') {
          return new htmlWorker()
        }
        if (label === 'typescript' || label === 'javascript') {
          return new tsWorker()
        }
        return new editorWorker()
      },
    }

    loader.config({ monaco })

    // Initialize Monaco and mark as loaded
    loader
      .init()
      .then(monaco => {
        // Expose monaco globally for completion provider access
        ;(window as any).monaco = monaco
        console.log('[blockether-foundation-react] Monaco initialized and exposed globally')
        setIsMonacoLoaded(true)
      })
      .catch(error => {
        console.error('[blockether-foundation-react] Failed to initialize Monaco Editor:', error)
      })
  }, [])

  // Configure editor options
  const editorOptions = React.useMemo(
    () => ({
      // Basic options
      readOnly: false,
      fontSize: 14,
      tabSize,
      wordWrap: wordWrap ? ('on' as const) : ('off' as const),
      minimap: { enabled: minimap },
      scrollBeyondLastLine: false,
      automaticLayout: true,

      // SQL-specific options
      suggestOnTriggerCharacters: enableAutoComplete,
      quickSuggestions: enableAutoComplete
        ? { other: true, comments: false, strings: false }
        : false,
      parameterHints: { enabled: enableAutoComplete },
      wordBasedSuggestions: enableAutoComplete
        ? ('matchingDocuments' as const)
        : ('off' as const),
      suggestSelection: 'first' as const,

      // Line numbers
      lineNumbers: 'on' as const,
      lineNumbersMinChars: 3,

      // Appearance
      fontFamily: '"Monaco", "Menlo", "Ubuntu Mono", monospace',
      renderLineHighlight: 'line' as const,
      renderWhitespace: 'selection' as const,
      bracketPairColorization: { enabled: true },
      guides: {
        indentation: true,
        bracketPairs: true,
      },

      // Performance
      folding: true,
      foldingStrategy: 'indentation' as const,
      showFoldingControls: 'mouseover' as const,

      // Behavior
      cursorBlinking: 'smooth' as const,
      cursorSmoothCaretAnimation: 'on' as const,
      smoothScrolling: true,
      mouseWheelZoom: false,
    }),
    [tabSize, wordWrap, minimap, enableAutoComplete]
  )

  // Handle editor mount
  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor
      monacoRef.current = monaco

      // Register DuckDB completion provider
      if (enableAutoComplete && monaco && monaco.languages) {
        const completionContext: CompletionContext = {
          dataSources,
          query: value,
          position: editor.getPosition()?.column || 0,
          connection,
        }

        completionProviderRef.current = registerDuckDBCompletionProvider(
          monaco,
          completionContext
        )
      } else if (enableAutoComplete) {
        console.warn(
          '[blockether-foundation-react] SQL autocomplete disabled - Monaco not properly initialized'
        )
      }

      // Handle focus/blur to control selection behavior
      editor.onDidFocusEditorText(() => {
        // Notify parent component
        if (onFocus) onFocus()

        const container = document.querySelector(
          '[data-sql-editor="true"]'
        ) as HTMLElement
        if (container) {
          ;(container.style as any).userSelect = 'auto'
          ;(container.style as any).webkitUserSelect = 'auto'
          ;(container.style as any).MozUserSelect = 'auto'
          ;(container.style as any).msUserSelect = 'auto'
        }
      })

      editor.onDidBlurEditorText(() => {
        // Notify parent component
        if (onBlur) onBlur()

        const container = document.querySelector(
          '[data-sql-editor="true"]'
        ) as HTMLElement
        if (container) {
          ;(container.style as any).userSelect = 'none'
          ;(container.style as any).webkitUserSelect = 'none'
          ;(container.style as any).MozUserSelect = 'none'
          ;(container.style as any).msUserSelect = 'none'
        }
      })

      // Set up keyboard shortcuts
      if (onExecute) {
        editor.addAction({
          id: 'execute-query',
          label: 'Execute Query',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
          run: () => {
            onExecute()
          },
        })
      }

      if (onFormat && enableFormatting) {
        editor.addAction({
          id: 'format-query',
          label: 'Format Query',
          keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
          ],
          run: () => {
            onFormat()
          },
        })
      }

      // Call custom onMount callback
      if (onMount) {
        onMount(editor)
      }
    },
    [onExecute, onFormat, onMount, enableFormatting, enableSyntaxHighlighting]
  )

  // Handle window resize
  useEffect(() => {
    const handleResize = (): void => {
      if (editorRef.current) {
        editorRef.current.layout()
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update completion context when data sources change
  useEffect(() => {
    if (
      editorRef.current &&
      enableAutoComplete &&
      completionProviderRef.current &&
      isMonacoLoaded
    ) {
      const editor = editorRef.current

      // Dispose existing provider safely
      if (
        completionProviderRef.current &&
        completionProviderRef.current.dispose
      ) {
        completionProviderRef.current.dispose()
        completionProviderRef.current = null
      }

      // Register new provider with updated context using the stored monaco reference
      const completionContext: CompletionContext = {
        dataSources,
        query: currentValue,
        position: editor.getPosition()?.column || 0,
        connection,
      }

      // Use the stored monaco instance
      const monaco = monacoRef.current
      if (monaco && monaco.languages) {
        completionProviderRef.current = registerDuckDBCompletionProvider(
          monaco,
          completionContext
        )
      }
    }
  }, [dataSources, enableAutoComplete, connection, isMonacoLoaded])

  // Update current value for completion context
  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  // Cleanup completion provider on unmount
  useEffect(() => {
    return () => {
      if (
        completionProviderRef.current &&
        completionProviderRef.current.dispose
      ) {
        completionProviderRef.current.dispose()
        completionProviderRef.current = null
      }
    }
  }, [])

  // Handle Monaco editor events
  const handleEditorOnChange = (newValue: string | undefined, _ev: any) => {
    // Call parent onChange
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  return (
    <div
      className={cn('relative', className)}
      style={
        {
          height: '30vh',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        } as React.CSSProperties
      }
      data-sql-editor="true"
    >
      {/* Show loading state while Monaco is initializing */}
      {!isMonacoLoaded ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-sm">Loading editor...</div>
        </div>
      ) : (
        /* Monaco Editor - use theme prop for dynamic theming */
        <Editor
          height="100%"
          language="sql"
          className="pt-2 pb-2"
          value={value}
          onChange={handleEditorOnChange}
          theme={monacoTheme}
          options={editorOptions}
          onMount={handleEditorDidMount}
        />
      )}
    </div>
  )
}
