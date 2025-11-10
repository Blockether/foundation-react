/**
 * Hook to synchronize column widths between header and body tables
 */

import { useEffect, useRef } from 'react'

interface TableColumnSyncOptions {
  headerTableSelector?: string
  bodyTableSelector?: string
  minWidth?: number
  charWidth?: number
}

export function useTableColumnSync(
  columns: Array<{ name: string }>,
  options: TableColumnSyncOptions = {}
) {
  const {
    headerTableSelector = '[data-header-table]',
    bodyTableSelector = '[data-body-table]',
    minWidth = 180,
    charWidth = 12
  } = options

  const headerTableRef = useRef<HTMLTableElement | null>(null)
  const bodyTableRef = useRef<HTMLTableElement | null>(null)

  // Calculate column widths
  const columnWidths = columns.map(column =>
    `${Math.max(minWidth, column.name.length * charWidth)}px`
  )

  useEffect(() => {
    // Find tables
    headerTableRef.current = document.querySelector(headerTableSelector)
    bodyTableRef.current = document.querySelector(bodyTableSelector)

    if (!headerTableRef.current || !bodyTableRef.current) {
      console.warn('Tables not found for column sync')
      return
    }

    // Apply synchronized widths
    const syncColumnWidths = () => {
      const headerCols = headerTableRef.current?.querySelectorAll('col')
      const bodyCols = bodyTableRef.current?.querySelectorAll('col')

      if (!headerCols || !bodyCols || headerCols.length !== bodyCols.length) {
        return
      }

      // Apply widths to both tables
      columnWidths.forEach((width, index) => {
        if (headerCols[index]) {
          (headerCols[index] as HTMLTableColElement).style.width = width
        }
        if (bodyCols[index]) {
          (bodyCols[index] as HTMLTableColElement).style.width = width
        }
      })

      // Ensure both tables use the same layout algorithm
      if (headerTableRef.current) {
        headerTableRef.current.style.tableLayout = 'fixed'
        headerTableRef.current.style.width = '100%'
      }
      if (bodyTableRef.current) {
        bodyTableRef.current.style.tableLayout = 'fixed'
        bodyTableRef.current.style.width = '100%'
      }
    }

    // Initial sync
    syncColumnWidths()

    // Set up ResizeObserver to sync on container resize
    const resizeObserver = new ResizeObserver(() => {
      syncColumnWidths()
    })

    if (headerTableRef.current.parentElement) {
      resizeObserver.observe(headerTableRef.current.parentElement)
    }
    if (bodyTableRef.current.parentElement) {
      resizeObserver.observe(bodyTableRef.current.parentElement)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [columns, headerTableSelector, bodyTableSelector, minWidth, charWidth])

  return {
    columnWidths,
    headerTableProps: {
      'data-header-table': 'true',
      style: {
        tableLayout: 'fixed' as const,
        width: '100%'
      }
    },
    bodyTableProps: {
      'data-body-table': 'true',
      style: {
        tableLayout: 'fixed' as const,
        width: '100%'
      }
    }
  }
}