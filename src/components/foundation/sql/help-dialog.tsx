/**
 * Help Dialog Component
 *
 * This component provides a modal dialog for displaying help content, documentation,
 * and keyboard shortcuts for the SQL Cockpit. It supports both custom content and
 * default help information.
 */

import React, { useRef, useEffect } from 'react'
import { Button } from '../../ui/button'
import { cn } from '../../../lib/utils'

// Lucide React icons
import { X, ExternalLink, Keyboard, BookOpen, Code, Zap } from 'lucide-react'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
  helpContent?: React.ReactNode | string
  title?: string
  className?: string
}

/**
 * Help Dialog component for displaying SQL documentation and shortcuts
 */
export function HelpDialog({
  isOpen,
  onClose,
  helpContent,
  title = 'SQL Cockpit Help',
  className,
}: HelpDialogProps): React.ReactNode {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)

  // Focus management
  useEffect(() => {
    if (isOpen && titleRef.current) {
      titleRef.current.focus()
    }
  }, [isOpen])

  // Handle escape key with higher priority
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true) // Use capture to ensure highest priority
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen, onClose])

  // Trap focus within dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return

    const focusableElements = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (event: KeyboardEvent): void => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
          }
        }
      }
    }

    const dialogElement = dialogRef.current
    dialogElement.addEventListener('keydown', handleTabKey)
    return () => {
      dialogElement?.removeEventListener('keydown', handleTabKey)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close help dialog"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-dialog-title"
        className={cn(
          'relative bg-background border shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2
            ref={titleRef}
            id="help-dialog-title"
            className="text-xl font-semibold flex items-center gap-2 text-foreground"
            tabIndex={-1}
          >
            <BookOpen className="h-5 w-5 text-foreground" />
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-foreground hover:bg-accent hover:text-accent-foreground hover:cursor-pointer"
            aria-label="Close help dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {helpContent ? (
            typeof helpContent === 'string' ? (
              <HelpContentRenderer content={helpContent} />
            ) : (
              <div className="text-foreground">{helpContent}</div>
            )
          ) : (
            <DefaultHelpContent />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Press{' '}
              <kbd className="px-1 py-0.5 bg-background border text-xs text-foreground">
                Esc
              </kbd>{' '}
              to close
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Default help content for SQL Cockpit
 */
function DefaultHelpContent(): React.ReactNode {
  return (
    <div className="space-y-6 text-foreground">
      {/* Quick Start */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
          <Zap className="h-5 w-5 text-foreground" />
          Quick Start
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Get started with SQL Cockpit by writing and executing SQL queries
          against DuckDB.
        </p>
        <ol className="text-sm space-y-2 list-decimal list-inside text-foreground">
          <li>Type your SQL query in the editor below</li>
          <li>
            Press{' '}
            <kbd className="px-1 py-0.5 bg-background border text-xs text-foreground">
              Ctrl+Enter
            </kbd>{' '}
            to execute
          </li>
          <li>View results in the table below the editor</li>
          <li>
            Use{' '}
            <kbd className="px-1 py-0.5 bg-background border text-xs text-foreground">
              Ctrl+S
            </kbd>{' '}
            to format your query
          </li>
        </ol>
      </section>

      {/* Keyboard Shortcuts */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
          <Keyboard className="h-5 w-5 text-foreground" />
          Keyboard Shortcuts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ShortcutItem keys="Ctrl+Enter" description="Execute query" />
          <ShortcutItem keys="Ctrl+S" description="Format query" />
          <ShortcutItem keys="Ctrl+/" description="Toggle comment" />
          <ShortcutItem keys="Esc" description="Close dialogs" />
        </div>
      </section>

      {/* SQL Basics */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
          <Code className="h-5 w-5 text-foreground" />
          SQL Basics
        </h3>
        <div className="space-y-3 text-sm text-foreground">
          <div>
            <h4 className="font-medium mb-1 text-foreground">Basic Commands</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <code className="px-1 py-0.5 bg-muted text-xs">
                  SELECT
                </code>{' '}
                - Retrieve data from tables
              </li>
              <li>
                <code className="px-1 py-0.5 bg-muted text-xs">
                  INSERT
                </code>{' '}
                - Add new records
              </li>
              <li>
                <code className="px-1 py-0.5 bg-muted text-xs">
                  UPDATE
                </code>{' '}
                - Modify existing records
              </li>
              <li>
                <code className="px-1 py-0.5 bg-muted text-xs">
                  DELETE
                </code>{' '}
                - Remove records
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1 text-foreground">Query Examples</h4>
            <div className="space-y-2">
              <div className="p-2 bg-muted text-xs font-mono text-foreground">
                SELECT * FROM users LIMIT 10;
              </div>
              <div className="p-2 bg-muted text-xs font-mono text-foreground">
                SELECT COUNT(*) FROM users WHERE active = true;
              </div>
              <div className="p-2 bg-muted text-xs font-mono text-foreground">
                INSERT INTO users (name, email) VALUES ('John',
                'john@example.com');
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DuckDB Resources */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-foreground">DuckDB Resources</h3>
        <div className="space-y-2 text-sm">
          <ExternalLinkComponent
            href="https://duckdb.org/docs/"
            label="DuckDB Documentation"
          />
          <ExternalLinkComponent
            href="https://duckdb.org/docs/sql/introduction.html"
            label="SQL Functions Reference"
          />
          <ExternalLinkComponent
            href="https://duckdb.org/docs/data/csv/overview.html"
            label="CSV Import Guide"
          />
          <ExternalLinkComponent
            href="https://duckdb.org/docs/data/parquet/overview.html"
            label="Parquet Import Guide"
          />
        </div>
      </section>
    </div>
  )
}

/**
 * Render help content from string (supports basic markdown)
 */
function HelpContentRenderer({
  content,
}: {
  content: string
}): React.ReactNode {
  // Simple markdown parser for basic formatting
  const processedContent = content
    // Headers
    .replace(
      /^### (.+)$/gm,
      '<h3 class="text-lg font-semibold mb-3 mt-4 text-foreground">$1</h3>'
    )
    .replace(
      /^## (.+)$/gm,
      '<h2 class="text-xl font-semibold mb-4 mt-6 text-foreground">$1</h2>'
    )
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 mt-8 text-foreground">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      '<pre class="p-3 bg-muted text-xs font-mono overflow-x-auto mt-2 mb-2 text-foreground"><code>$2</code></pre>'
    )
    // Inline code
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1 py-0.5 bg-muted text-xs text-foreground">$1</code>'
    )
    // Links - use theme-aware colors
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:text-primary/80 underline">$1</a>'
    )
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-3 text-foreground">')
    .replace(/\n/g, '<br />')

  return (
    <div className="prose prose-sm max-w-none text-foreground">
      <p className="mb-3">{processedContent}</p>
    </div>
  )
}

/**
 * Keyboard shortcut item component
 */
function ShortcutItem({
  keys,
  description,
}: {
  keys: string
  description: string
}): React.ReactNode {
  return (
    <div className="flex items-center justify-between p-2 bg-muted">
      <span className="text-sm text-foreground">{description}</span>
      <div className="flex items-center gap-1">
        {keys.split('+').map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-muted-foreground text-xs leading-none">+</span>
            )}
            <kbd className="px-2 py-1 bg-background border text-xs font-mono text-foreground leading-none">
              {key.trim()}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

/**
 * External link component
 */
function ExternalLinkComponent({
  href,
  label,
}: {
  href: string
  label: string
}): React.ReactNode {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 underline"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}