/**
 * Help Dialog Component
 *
 * This component provides a modal dialog for displaying help content, documentation,
 * and keyboard shortcuts for the SQL Cockpit. It supports both custom content and
 * default help information.
 */

import React, { useRef, useEffect } from 'react'

// Lucide React icons
import { X, ExternalLink, Keyboard, BookOpen, Code, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  className?: string
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
/**
 * Help Dialog component for displaying SQL documentation and shortcuts
 */
export function HelpDialog({
  isOpen,
  onClose,
  title = 'SQL Cockpit',
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
            className="bg-background hover:cursor-pointer"
            aria-label="Close help dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <DefaultHelpContent />

        {/* Footer */}
        <div className="p-4 border-t border-bottom">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-muted border text-foreground text-xs rounded">
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
    <div className="space-y-6 p-6 overflow-y-auto flex-1">
      {/* Quick Start */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
          <Zap className="h-5 w-5 text-foreground" />
          Quick Start
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Get started with SQL Cockpit by writing and running a query against
          the built-in DuckDB database. These steps mirror what most analysts do
          each time they explore data.
        </p>
        <ol className="text-sm text-foreground space-y-2 list-decimal list-inside">
          <li>Type your SQL query in the editor.</li>
          <li>
            Press{' '}
            <kbd className="px-1.5 py-0.5 bg-muted border text-foreground text-xs rounded">
              Ctrl+Enter
            </kbd>{' '}
            (or{' '}
            <kbd className="px-1.5 py-0.5 bg-muted border text-foreground text-xs rounded">
              Cmd+Enter
            </kbd>{' '}
            on macOS) to run the query.
          </li>
          <li>Review the results in the table beneath the editor.</li>
          <li>
            Use{' '}
            <kbd className="px-1.5 py-0.5 bg-muted border text-foreground text-xs rounded">
              Ctrl+Shift+F
            </kbd>{' '}
            (or{' '}
            <kbd className="px-1.5 py-0.5 bg-muted border text-foreground text-xs rounded">
              Cmd+Shift+F
            </kbd>{' '}
            on macOS) to auto-format the SQL.
          </li>
        </ol>
      </section>

      {/* Keyboard Shortcuts */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
          <Keyboard className="h-5 w-5 text-foreground" />
          Keyboard Shortcuts
        </h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left p-3 font-medium text-foreground">
                  Command
                </th>
                <th className="text-right p-3 font-medium text-foreground">
                  Shortcut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-foreground">Execute query</td>
                <td className="p-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center justify-end gap-1">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Ctrl
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Enter
                      </kbd>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Cmd
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Enter
                      </kbd>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-foreground">Format query</td>
                <td className="p-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center justify-end gap-1">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Ctrl
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Shift
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        F
                      </kbd>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Cmd
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Shift
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        F
                      </kbd>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-foreground">Save results to file</td>
                <td className="p-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center justify-end gap-1">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Ctrl
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        S
                      </kbd>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Cmd
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        S
                      </kbd>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-foreground">Toggle comment</td>
                <td className="p-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center justify-end gap-1">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Ctrl
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        /
                      </kbd>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Cmd
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        /
                      </kbd>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-foreground">Show help</td>
                <td className="p-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center justify-end gap-1">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        F1
                      </kbd>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Ctrl
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        H
                      </kbd>
                    </div>
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        Cmd
                      </kbd>
                      <span className="text-muted-foreground text-xs leading-none">
                        +
                      </span>
                      <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                        H
                      </kbd>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-muted/30 transition-colors">
                <td className="p-3 text-foreground">Close dialogs</td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <kbd className="px-2 py-1 bg-muted border border-border text-foreground text-xs font-mono leading-none rounded">
                      Esc
                    </kbd>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SQL Basics */}
      <section>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
          <Code className="h-5 w-5 text-foreground" />
          DuckDB SQL Basics
        </h3>
        <div className="space-y-6 text-sm text-foreground">
          <article className="space-y-2">
            <h4 className="font-medium">1. SELECT – choose columns</h4>
            <p>
              Start every query with <code>SELECT</code>. List the columns or
              expressions you need. DuckDB includes helpers like <code>*</code>,{' '}
              <code>COLUMNS('pattern')</code>, <code>EXCLUDE</code>,{' '}
              <code>REPLACE</code>,<code>DISTINCT</code>, and{' '}
              <code>DISTINCT ON</code> to reshape results quickly.
            </p>
            <div className="p-3 text-xs font-mono bg-muted rounded border">
              SELECT DISTINCT ON (country) city, population
              <br />
              FROM cities
              <br />
              ORDER BY country, population DESC;
            </div>
          </article>

          <article className="space-y-2">
            <h4 className="font-medium">
              2. FROM &amp; JOIN – pick data sources
            </h4>
            <p>
              <code>FROM</code> comes next and can reference tables, views,
              subqueries, or table functions (for example{' '}
              <code>read_parquet</code>). Combine sources with inner, outer,
              semi, anti, positional, <code>LATERAL</code>, or <code>ASOF</code>{' '}
              joins. Use <code>USING</code> for same-name columns or{' '}
              <code>WITH ORDINALITY</code> to number rows coming from table
              functions.
            </p>
            <div className="p-3 text-xs font-mono bg-muted rounded border">
              SELECT t.i, s.name
              <br />
              FROM range(10) AS t(i)
              <br />
              JOIN stations s USING (i);
            </div>
          </article>

          <article className="space-y-2">
            <h4 className="font-medium">3. WHERE – filter early</h4>
            <p>
              Apply row filters before any grouping. Combine conditions with{' '}
              <code>AND</code> or <code>OR</code>, use <code>IN</code>,{' '}
              <code>BETWEEN</code>, or <code>LIKE</code>/<code>ILIKE</code>, and
              remember that <code>NULL</code> comparisons need{' '}
              <code>IS NULL</code> or <code>IS NOT NULL</code>.
            </p>
            <div className="p-3 text-xs font-mono bg-muted rounded border">
              SELECT * FROM weather
              <br />
              WHERE city = 'Paris' AND temp BETWEEN 15 AND 25;
            </div>
          </article>

          <article className="space-y-2">
            <h4 className="font-medium">4. GROUP BY – aggregate rows</h4>
            <p>
              Group rows before aggregating. Every expression in the select list
              must either be aggregated or listed in <code>GROUP BY</code>. Use{' '}
              <code>GROUP BY ALL</code> to automatically include all
              non-aggregated select columns.
            </p>
            <div className="p-3 text-xs font-mono bg-muted rounded border">
              SELECT city, AVG(temp) AS avg_temp
              <br />
              FROM weather
              <br />
              GROUP BY ALL;
            </div>
          </article>

          <article className="space-y-2">
            <h4 className="font-medium">
              5. GROUPING SETS, ROLLUP, CUBE – multi-level totals
            </h4>
            <p>
              Produce multiple aggregation levels in one pass. DuckDB fills
              missing grouping columns with <code>NULL</code>. Call{' '}
              <code>GROUPING_ID()</code> if you need to distinguish real{' '}
              <code>NULL</code> values from subtotal rows.
            </p>
            <div className="p-3 text-xs font-mono bg-muted rounded border">
              SELECT city, street, SUM(sales) AS total_sales
              <br />
              FROM orders
              <br />
              GROUP BY ROLLUP (city, street);
            </div>
          </article>

          <article className="space-y-2">
            <h4 className="font-medium">6. HAVING – filter after grouping</h4>
            <p>
              Use <code>HAVING</code> to remove groups based on aggregate
              calculations. It runs after <code>GROUP BY</code>, so it can refer
              to aggregates such as <code>COUNT(*)</code> or <code>AVG()</code>.
            </p>
            <div className="p-3 text-xs font-mono bg-muted rounded border">
              SELECT city, COUNT(*) AS trips
              <br />
              FROM rideshare
              <br />
              GROUP BY city
              <br />
              HAVING COUNT(*) &gt;= 50;
            </div>
          </article>

          <article className="space-y-2">
            <h4 className="font-medium">7. WITH – reusable subqueries</h4>
            <p>
              Common table expressions (CTEs) keep queries readable. Add{' '}
              <code>MATERIALIZED</code> or <code>NOT MATERIALIZED</code> to
              override DuckDB&apos;s automatic choice. Use{' '}
              <code>WITH RECURSIVE</code> for hierarchies or graph traversals,
              and <code>USING KEY</code> to deduplicate rows between iterations.
            </p>
            <div className="p-3 text-xs font-mono bg-muted rounded border">
              WITH recent AS NOT MATERIALIZED (<br />
              &nbsp;&nbsp;SELECT * FROM sales WHERE date &gt; current_date -
              INTERVAL 30 DAY
              <br />
              )<br />
              SELECT store, SUM(amount)
              <br />
              FROM recent
              <br />
              GROUP BY store;
            </div>
          </article>

          <article className="space-y-2">
            <h4 className="font-medium">8. ORDER BY – sort results</h4>
            <p>
              Sort near the end of the query. Specify columns, expressions, or
              positions and add <code>ASC</code> or <code>DESC</code> plus{' '}
              <code>NULLS FIRST</code> or <code>NULLS LAST</code>. Use{' '}
              <code>ORDER BY ALL</code> to sort by every column in the select
              list, left to right.
            </p>
            <div className="p-3 text-xs font-mono bg-muted rounded border">
              SELECT city, temp
              <br />
              FROM weather
              <br />
              ORDER BY temp DESC NULLS LAST;
            </div>
          </article>

          <article className="space-y-2">
            <h4 className="font-medium">
              9. LIMIT &amp; OFFSET – control how much you see
            </h4>
            <p>
              Trim the final output. Set a row count or percentage (for example{' '}
              <code>LIMIT 10%</code>) and optionally add an <code>OFFSET</code>{' '}
              for paging. Pair with <code>ORDER BY</code> for repeatable
              results.
            </p>
            <div className="p-3 text-xs font-mono bg-muted rounded border">
              SELECT * FROM weather
              <br />
              ORDER BY date DESC
              <br />
              LIMIT 10 OFFSET 20;
            </div>
          </article>
        </div>
      </section>

      {/* DuckDB Resources */}
      <section>
        <h3 className="text-lg font-semibold mb-3 text-foreground">
          DuckDB Resources
        </h3>
        <div className="space-y-2 text-sm">
          <ExternalLinkComponent
            href="https://duckdb.org/docs/stable/sql/introduction"
            label="SQL Introduction & Reference"
          />
          <ExternalLinkComponent
            href="https://duckdb.org/docs/stable/clients/wasm/extensions"
            label="DuckDB-WASM Extensions"
          />
          <ExternalLinkComponent
            href="https://duckdb.org/docs/"
            label="Full DuckDB Documentation"
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
