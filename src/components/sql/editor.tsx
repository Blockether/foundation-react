/**
 * SQL Editor Component
 *
 * This component wraps Monaco Editor with SQL language support, syntax highlighting,
 * formatting, and keyboard shortcuts. It integrates with the SQL Cockpit component.
 */

import React, { useRef, useEffect, useCallback } from 'react'
import { Editor, OnMount } from '@monaco-editor/react'
import { cn } from '@/lib/utils'
import { useTheme } from '../theme'

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
  placeholder = 'Enter SQL query here...',
  tabSize = 2,
  wordWrap = true,
  minimap = false,
  enableAutoComplete = true,
  enableSyntaxHighlighting = true,
  enableFormatting = true,
  className,
}: SQLEditorProps): React.ReactNode {
  const editorRef = useRef<any>(null)
  const { theme } = useTheme()
  console.log('Current theme in SQLEditor:', theme)
  const monacoTheme = theme === 'light' ? 'light' : 'vs-dark'

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
      wordBasedSuggestions: enableAutoComplete ? ('matchingDocuments' as const) : ('off' as const),
      suggestSelection: 'first' as const,

      // Line numbers
      lineNumbers: "on" as const,
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
    [
      tabSize,
      wordWrap,
      minimap,
      enableAutoComplete,
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

            onExecute()

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

            onFormat()

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
      enableFormatting,
      enableSyntaxHighlighting,
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
      style={{ height: "100%" }}
    >
      {/* Monaco Editor - use theme prop for dynamic theming */}
      <Editor
        height="100%"
        language="sql"
        className='pt-2 pb-2'
        value={value}
        onChange={handleEditorOnChange}
        theme={monacoTheme}
        options={editorOptions}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="text-sm ">
              Loading SQL editor...
            </div>
          </div>
        }
      />

      {/* Placeholder */}
      <div className="monaco-placeholder absolute top-2 left-14  pointer-events-none whitespace-pre-wrap">
        {placeholder}
      </div>
    </div>
  )
}