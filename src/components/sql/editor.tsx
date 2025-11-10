/**
 * SQL Editor Component
 *
 * This component wraps Monaco Editor with SQL language support, syntax highlighting,
 * formatting, and keyboard shortcuts. It integrates with the SQL Cockpit component.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react'
import { Editor, OnMount } from '@monaco-editor/react'
import { cn } from '@/lib/utils'
import { useTheme } from '../theme'
import { DataSource } from '@/types/sql'
import { registerDuckDBCompletionProvider, CompletionContext } from '@/lib/sql-completion'


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
  placeholder?: string
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
  placeholder,
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
  const { theme } = useTheme()
  const monacoTheme = theme === 'light' ? 'light' : 'vs-dark'
  const [currentValue, setCurrentValue] = useState(value)

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

      // Register DuckDB completion provider
      if (enableAutoComplete) {
        const completionContext: CompletionContext = {
          dataSources,
          query: value,
          position: editor.getPosition()?.column || 0,
          connection
        }

        completionProviderRef.current = registerDuckDBCompletionProvider(monaco, completionContext)
      }

      // Handle focus/blur to control selection behavior
      editor.onDidFocusEditorText(() => {
        // Notify parent component
        if (onFocus) onFocus()

        const container = document.querySelector('[data-sql-editor="true"]') as HTMLElement
        if (container) {
          (container.style as any).userSelect = 'auto'
            ; (container.style as any).webkitUserSelect = 'auto'
            ; (container.style as any).MozUserSelect = 'auto'
            ; (container.style as any).msUserSelect = 'auto'
        }
      })

      editor.onDidBlurEditorText(() => {
        // Notify parent component
        if (onBlur) onBlur()

        const container = document.querySelector('[data-sql-editor="true"]') as HTMLElement
        if (container) {
          (container.style as any).userSelect = 'none'
            ; (container.style as any).webkitUserSelect = 'none'
            ; (container.style as any).MozUserSelect = 'none'
            ; (container.style as any).msUserSelect = 'none'
        }
      })

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
            monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF,
          ],
          run: () => {

            onFormat()

          },
        })
      }

      // Add our comment toggle shortcut with better keybinding approach
      setTimeout(() => {
        // Try to override Monaco's built-in comment action first
        const commentAction = editor.getAction('editor.action.commentLine')
        if (commentAction) {
          // Create a custom action that calls the built-in one
          editor.addAction({
            id: 'override-comment-line',
            label: 'Toggle Line Comment',
            keybindings: [
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash,
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.NumpadDivide,
              // Add support for German layout (Shift+7 for /)
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit7,
            ],
            run: () => {
              console.log('Override comment action triggered')
              commentAction.run()
            }
          })
        } else {
          // Fallback to manual implementation
          editor.addAction({
            id: 'toggle-comment',
            label: 'Toggle Comment',
            keybindings: [
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash,
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.NumpadDivide,
              // Add support for German layout (Shift+7 for /)
              monaco.KeyMod.CtrlCmd | monaco.KeyCode.Digit7,
            ],
            run: () => {
              console.log('Toggle comment action triggered')
              const selection = editor.getSelection()
              const model = editor.getModel()

              if (!model || !selection) {
                console.log('No model or selection found')
                return
              }

              // Manual implementation for SQL commenting
              const getPosition = selection.getPosition()
              if (!getPosition) {
                console.log('No cursor position found')
                return
              }

              console.log('Cursor position:', getPosition.lineNumber, getPosition.column)
              console.log('Selection is empty:', selection.isEmpty())

              let startLine: number
              let endLine: number

              if (selection.isEmpty()) {
                // No selection - comment/uncomment current line where cursor is
                startLine = getPosition.lineNumber
                endLine = getPosition.lineNumber
                console.log('No selection - commenting line:', startLine)
              } else {
                // Selection exists - comment/uncomment selected lines
                startLine = selection.getStartPosition().lineNumber
                endLine = selection.getEndPosition().lineNumber
                console.log('Selection found - commenting lines:', startLine, 'to', endLine)
              }

              // Process each line in the range
              for (let line = startLine; line <= endLine; line++) {
                const lineContent = model.getLineContent(line)
                const trimmedLine = lineContent.trimStart()
                const isCommented = trimmedLine.startsWith('--')

                if (isCommented) {
                  // Remove comment - preserve original indentation
                  const uncommented = lineContent.replace(/^(\s*)--\s?/, '$1')
                  model.applyEdits([{
                    range: {
                      startLineNumber: line,
                      startColumn: 1,
                      endLineNumber: line,
                      endColumn: lineContent.length + 1
                    },
                    text: uncommented
                  }])
                } else {
                  // Add comment - preserve original indentation
                  const commented = `-- ${lineContent}`
                  model.applyEdits([{
                    range: {
                      startLineNumber: line,
                      startColumn: 1,
                      endLineNumber: line,
                      endColumn: lineContent.length + 1
                    },
                    text: commented
                  }])
                }
              }
            }
          })
        }
      }, 100)

      // Configure SQL language features
      if (enableSyntaxHighlighting) {
        const model = editor.getModel()
        if (model) {
          // Set language to SQL
          monaco.editor.setModelLanguage(model, 'sql')

          // Configure comment tokens for SQL
          monaco.languages.setLanguageConfiguration('sql', {
            comments: {
              blockComment: ['/*', '*/'],
              lineComment: '--'
            },
            autoClosingPairs: [
              { open: '{', close: '}' },
              { open: '[', close: ']' },
              { open: '(', close: ')' },
              { open: '"', close: '"', notIn: ['string'] },
              { open: "'", close: "'", notIn: ['string', 'comment'] }
            ]
          })

          // Add context menu item for commenting
          editor.addAction({
            id: 'comment-line-context',
            label: 'Toggle Line Comment',
            contextMenuGroupId: 'modification',
            contextMenuOrder: 1,
            run: () => {
              const selection = editor.getSelection()
              const model = editor.getModel()

              if (!model || !selection) return

              const getPosition = selection.getPosition()
              if (!getPosition) return

              const lineNumber = getPosition.lineNumber
              const lineContent = model.getLineContent(lineNumber)
              const isCommented = lineContent.trimStart().startsWith('--')

              if (isCommented) {
                const uncommented = lineContent.replace(/^(\s*)--\s?/, '$1')
                model.applyEdits([{
                  range: {
                    startLineNumber: lineNumber,
                    startColumn: 1,
                    endLineNumber: lineNumber,
                    endColumn: lineContent.length + 1
                  },
                  text: uncommented
                }])
              } else {
                const commented = `-- ${lineContent}`
                model.applyEdits([{
                  range: {
                    startLineNumber: lineNumber,
                    startColumn: 1,
                    endLineNumber: lineNumber,
                    endColumn: lineContent.length + 1
                  },
                  text: commented
                }])
              }
            }
          })
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

  // Update completion context when data sources change
  useEffect(() => {
    if (editorRef.current && enableAutoComplete && completionProviderRef.current) {
      const editor = editorRef.current
      const monaco = (window as any).monaco

      // Dispose existing provider
      completionProviderRef.current.dispose()

      // Register new provider with updated context
      const completionContext: CompletionContext = {
        dataSources,
        query: currentValue,
        position: editor.getPosition()?.column || 0,
        connection
      }

      completionProviderRef.current = registerDuckDBCompletionProvider(monaco, completionContext)
    }
  }, [dataSources, enableAutoComplete, connection])

  // Update current value for completion context
  useEffect(() => {
    setCurrentValue(value)
  }, [value])

  // Cleanup completion provider on unmount
  useEffect(() => {
    return () => {
      if (completionProviderRef.current) {
        completionProviderRef.current.dispose()
      }
    }
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
      style={{
        height: "100%",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none"
      } as React.CSSProperties}
      data-sql-editor="true"
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
      <div className="monaco-placeholder absolute top-2 left-13 text-muted-foreground/40 text-sm pointer-events-none whitespace-pre-wrap">
        {placeholder}
      </div>
    </div>
  )
}