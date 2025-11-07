/**
 * SQL Editor Component
 *
 * This component wraps Monaco Editor with SQL language support, syntax highlighting,
 * formatting, and keyboard shortcuts. It integrates with the SQL Cockpit component.
 */

import React, { useRef, useEffect, useCallback } from 'react'
import { Editor, OnMount } from '@monaco-editor/react'
import { cn } from '../../../lib/utils'
import { useCockpitTheme } from '../../../contexts/cockpit-theme-context'

// Extend Window interface to include Monaco
declare global {
  interface Window {
    monaco?: any
  }
}

interface SQLEditorProps {
  value: string
  onChange: (value: string) => void
  onExecute?: () => void
  onFormat?: () => void
  onMount?: (editor: any) => void

  // Editor configuration
  readOnly?: boolean
  showLineNumbers?: boolean
  placeholder?: string
  fontSize?: number
  tabSize?: number
  wordWrap?: boolean
  minimap?: boolean

  // SQL features
  enableAutoComplete?: boolean
  enableSyntaxHighlighting?: boolean
  enableFormatting?: boolean

  // Theme handling
  onThemeChange?: (theme: 'light' | 'dark' | 'auto') => void

  // Styling
  className?: string
  height?: string | number
  minHeight?: string
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
  readOnly = false,
  showLineNumbers = true,
  placeholder = 'Enter SQL query here...',
  fontSize = 14,
  tabSize = 2,
  wordWrap = true,
  minimap = false,
  enableAutoComplete = true,
  enableSyntaxHighlighting = true,
  enableFormatting = true,
  onThemeChange,
  className,
  height = '100%',
  minHeight = '300px',
}: SQLEditorProps): React.ReactNode {
  const editorRef = useRef<any>(null)
  const { theme } = useCockpitTheme()
  const monacoTheme = theme === 'auto' ? (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'light') : theme === 'dark' ? 'vs-dark' : 'light'

  // Configure editor options
  const editorOptions = React.useMemo(
    () => ({
      // Basic options
      readOnly,
      fontSize,
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
      wordBasedSuggestions: enableAutoComplete ? ('matchingDocuments' as const) : ('off' as const),
      suggestSelection: 'first' as const,

      // Line numbers
      lineNumbers: showLineNumbers ? ('on' as const) : ('off' as const),
      lineNumbersMinChars: showLineNumbers ? 3 : 0,

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
    [
      readOnly,
      fontSize,
      tabSize,
      wordWrap,
      minimap,
      enableAutoComplete,
      showLineNumbers,
    ]
  )

  // Handle editor mount
  const handleEditorDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor

      // Set up keyboard shortcuts
      if (onExecute) {
        editor.addAction({
          id: 'execute-query',
          label: 'Execute Query',
          keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
          ],
          run: () => {
            if (!readOnly) {
              onExecute()
            }
          },
        })
      }

      if (onFormat && enableFormatting) {
        editor.addAction({
          id: 'format-query',
          label: 'Format Query',
          keybindings: [
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
          ],
          run: () => {
            if (!readOnly) {
              onFormat()
            }
          },
        })
      }

      // Add comment toggle shortcut
      editor.addAction({
        id: 'toggle-comment',
        label: 'Toggle Comment',
        keybindings: [
          monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash,
        ],
        run: () => {
          if (!readOnly) {
            const selection = editor.getSelection()
            if (selection && !selection.isEmpty()) {
              const model = editor.getModel()
              if (model) {
                const selectedText = model.getValueInRange(selection)
                const commentedText = selectedText.startsWith('--')
                  ? selectedText.replace(/^-- ?/gm, '')
                  : selectedText
                      .split('\n')
                      .map((line: string) => `-- ${line}`)
                      .join('\n')

                model.pushEditOperations(
                  [],
                  [
                    {
                      range: selection,
                      text: commentedText,
                    },
                  ],
                  () => null
                )
              }
            }
          }
        },
      })

      // Configure SQL language features
      if (enableSyntaxHighlighting) {
        const model = editor.getModel()
        if (model) {
          // Set language to SQL
          monaco.editor.setModelLanguage(model, 'sql')
        }
      }

      // Show placeholder when editor mounts
      const placeholderElement = document.querySelector(
        '.monaco-placeholder'
      ) as HTMLElement | null
      if (value) {
        placeholderElement!.style.display = 'none'
      } else {
        placeholderElement!.style.display = 'block'
      }

      // Call custom onMount callback
      if (onMount) {
        onMount(editor)
      }
    },
    [
      onExecute,
      onFormat,
      onMount,
      readOnly,
      enableFormatting,
      enableSyntaxHighlighting,
      onThemeChange,
    ]
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

  // Handle Monaco editor events
  const handleEditorOnChange = (
    newValue: string | undefined,
    _ev: any
  ) => {
    // Handle placeholder visibility based on editor content
    const placeholder = document.querySelector(
      '.monaco-placeholder'
    ) as HTMLElement | null
    if (!newValue) {
      placeholder!.style.display = 'block'
    } else {
      placeholder!.style.display = 'none'
    }

    // Call parent onChange
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  return (
    <div
      className={cn('relative', className)}
      style={{ height, minHeight }}
    >
      {/* Monaco Editor - use theme prop for dynamic theming */}
      <Editor
        height="100%"
        language="sql"
        value={value}
        onChange={handleEditorOnChange}
        theme={monacoTheme}
        options={editorOptions}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-sm text-muted-foreground">
              Loading SQL editor...
            </div>
          </div>
        }
      />

      {/* Placeholder */}
      <div className="monaco-placeholder absolute top-0 left-14 text-muted-foreground pointer-events-none whitespace-pre-wrap">
        {placeholder}
      </div>

      {/* Accessibility announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {readOnly && 'Editor is in read-only mode'}
      </div>
    </div>
  )
}