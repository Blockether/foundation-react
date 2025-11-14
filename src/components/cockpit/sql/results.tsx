/**
 * Results Panel Component
 *
 * This component displays SQL query results in a formatted table or shows error messages
 * when queries fail. It handles different data types, empty states, and loading indicators.
 */

import { cn } from '@/lib/utils'
import { QueryResult, SQLError, InsightsQuery } from '@/types/sql'
import {
  exportQueryResultToCSV,
  exportQueryResultToJSON,
  exportQueryResultToCSVFile,
  exportQueryResultToJSONFile,
} from '@/lib/duckdb/ops'
import React from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Columns,
  Rows,
  FileText,
  Save,
  FileSpreadsheet,
  Braces,
  X,
  Copy,
  BarChart3,
  Table as TableIcon,
} from 'lucide-react'
import { usePagination } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { TypeBadge } from '@/lib/duckdb/type-labels'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const MIN_COLUMN_WIDTH = 160
const COLUMN_PADDING_BUFFER = 16

interface ResultsPanelProps {
  result: QueryResult | null
  error: SQLError | null
  isLoading?: boolean
  maxHeight?: string
  className?: string
  onSelectionChange?: (
    selectedColumns: Set<number>,
    selectedRows: Set<number>
  ) => void

  // Insights query - if provided, shows chart visualization
  insightsQuery?: InsightsQuery | null
}

type PaginationControls = ReturnType<typeof usePagination>

interface ResultsSelectionToolbarProps {
  result: QueryResult | null
  showCopyButton: boolean
  selectedColumns: Set<number>
  selectedRows: Set<number>
  pagination: PaginationControls
  isEditingPage: boolean
  pageInput: string
  pageInputRef: React.RefObject<HTMLInputElement>
  onPageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPageInputBlur: () => void
  onPageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onPageClick: () => void
  onCopySelectedColumnsAsCSV: () => Promise<void>
  onCopySelectedColumnsAsJSON: () => Promise<void>
  onCopySelectedRowsAsCSV: () => Promise<void>
  onCopySelectedRowsAsJSON: () => Promise<void>
  onSaveAsCSV: () => Promise<void>
  onSaveAsJSON: () => Promise<void>
  onDownloadSelectedAsCSV: (selectionType: 'columns' | 'rows') => Promise<void>
  onDownloadSelectedAsJSON: (selectionType: 'columns' | 'rows') => Promise<void>
  onDownloadFullCSV: () => void
  onDownloadFullJSON: () => void
  onClearSelection: () => void
}

/**
 * State transition wrapper for smooth animations
 */
function StateTransition({
  children,
  isVisible,
  className,
}: {
  children: React.ReactNode
  isVisible: boolean
  className?: string
}): React.ReactNode {
  return (
    <div
      className={cn(
        'transition-opacity duration-200 ease-in-out',
        isVisible
          ? 'opacity-100'
          : 'opacity-0 pointer-events-none absolute inset-0',
        className
      )}
      style={{ top: '68px' }}
    >
      {children}
    </div>
  )
}

function ResultsSelectionToolbar({
  result,
  showCopyButton,
  selectedColumns,
  selectedRows,
  pagination,
  isEditingPage,
  pageInput,
  pageInputRef,
  onPageInputChange,
  onPageInputBlur,
  onPageInputKeyDown,
  onPageClick,
  onCopySelectedColumnsAsCSV,
  onCopySelectedColumnsAsJSON,
  onCopySelectedRowsAsCSV,
  onCopySelectedRowsAsJSON,
  onSaveAsCSV,
  onSaveAsJSON,
  onDownloadSelectedAsCSV,
  onDownloadSelectedAsJSON,
  onDownloadFullCSV,
  onDownloadFullJSON,
  onClearSelection,
}: ResultsSelectionToolbarProps): React.ReactNode {
  return (
    <div
      className="sticky bottom-0 h-[68px] min-h-[68px] border-t backdrop-blur-sm z-1 bg-background flex items-center justify-between px-3 py-2 shrink-0"
      data-selection-toolbar="true"
    >
      {result && result.data.length > 0 && (
        <div className="flex items-center justify-between w-full h-full">
          <div className="flex items-center gap-3 text-sm">
            {showCopyButton && (
              <span className="font-medium text-foreground">Text selected</span>
            )}
            {selectedColumns.size > 0 && (
              <div className="flex items-center gap-2">
                <Columns className="h-4 w-4 text-foreground" />
                <span className="font-medium text-foreground">
                  {selectedColumns.size} column
                  {selectedColumns.size > 1 ? 's' : ''}
                </span>
              </div>
            )}
            {selectedRows.size > 0 && (
              <div className="flex items-center gap-2">
                <Rows className="h-4 w-4 text-foreground" />
                <span className="font-medium text-foreground">
                  {selectedRows.size} row{selectedRows.size > 1 ? 's' : ''}
                </span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              Showing{' '}
              {pagination.isPaginationEnabled
                ? `${pagination.startIndex + 1} - ${pagination.endIndex}`
                : `1 - ${result?.data.length}`}{' '}
              of {result?.data.length.toLocaleString()} rows
            </span>
          </div>

          {pagination.isPaginationEnabled && (
            <div className="flex items-center gap-2 pl-4 border-l border-border/60 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => pagination.setCurrentPage(1)}
                disabled={pagination.currentPage === 1}
                className="h-8 w-8 p-0 rounded-sm cursor-pointer"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={pagination.prevPage}
                disabled={pagination.currentPage === 1}
                className="h-8 w-8 p-0 rounded-sm cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {isEditingPage ? (
                <input
                  ref={pageInputRef}
                  type="number"
                  min="1"
                  max={pagination.totalPages}
                  value={pageInput}
                  onChange={onPageInputChange}
                  onBlur={onPageInputBlur}
                  onKeyDown={onPageInputKeyDown}
                  className="w-16 h-8 px-2 text-sm border rounded bg-muted/50 text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-center"
                />
              ) : (
                <span
                  className="text-sm text-foreground whitespace-nowrap px-2 cursor-pointer hover:bg-muted/50 rounded transition-colors"
                  onClick={onPageClick}
                  title="Click to jump to page"
                >
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={pagination.nextPage}
                disabled={pagination.currentPage === pagination.totalPages}
                className="h-8 w-8 p-0 rounded-sm cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => pagination.setCurrentPage(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="h-8 w-8 p-0 rounded-sm cursor-pointer"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-xs bg-green-500 text-white hover:bg-green-600 shadow-sm cursor-pointer rounded-sm"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-1">
                  {selectedColumns.size > 0 && (
                    <>
                      <DropdownMenuItem onClick={onCopySelectedColumnsAsCSV}>
                        <FileText className="h-4 w-4 mr-2" />
                        Copy as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onCopySelectedColumnsAsJSON}>
                        <Braces className="h-4 w-4 mr-2" />
                        Copy as JSON
                      </DropdownMenuItem>
                    </>
                  )}
                  {selectedRows.size > 0 && (
                    <>
                      <DropdownMenuItem onClick={onCopySelectedRowsAsCSV}>
                        <FileText className="h-4 w-4 mr-2" />
                        Copy as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onCopySelectedRowsAsJSON}>
                        <Braces className="h-4 w-4 mr-2" />
                        Copy as JSON
                      </DropdownMenuItem>
                    </>
                  )}
                  {selectedColumns.size === 0 && selectedRows.size === 0 && (
                    <>
                      <DropdownMenuItem onClick={onSaveAsCSV}>
                        <FileText className="h-4 w-4 mr-2" />
                        Copy as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={onSaveAsJSON}>
                        <Braces className="h-4 w-4 mr-2" />
                        Copy as JSON
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 px-3 text-xs bg-blue-500 text-white hover:bg-blue-600 shadow-sm cursor-pointer rounded-sm"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-1">
                  {selectedColumns.size > 0 && (
                    <>
                      <DropdownMenuItem
                        onClick={() => onDownloadSelectedAsCSV('columns')}
                        className="cursor-pointer"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Save as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDownloadSelectedAsJSON('columns')}
                        className="cursor-pointer"
                      >
                        <Braces className="h-4 w-4 mr-2" />
                        Save as JSON
                      </DropdownMenuItem>
                    </>
                  )}
                  {selectedRows.size > 0 && (
                    <>
                      <DropdownMenuItem
                        onClick={() => onDownloadSelectedAsCSV('rows')}
                        className="cursor-pointer"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Save as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDownloadSelectedAsJSON('rows')}
                        className="cursor-pointer"
                      >
                        <Braces className="h-4 w-4 mr-2" />
                        Save as JSON
                      </DropdownMenuItem>
                    </>
                  )}
                  {selectedColumns.size === 0 && selectedRows.size === 0 && (
                    <>
                      <DropdownMenuItem
                        onClick={onDownloadFullCSV}
                        className="cursor-pointer"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Save as CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={onDownloadFullJSON}
                        className="cursor-pointer"
                      >
                        <Braces className="h-4 w-4 mr-2" />
                        Save as JSON
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {(selectedColumns.size > 0 || selectedRows.size > 0) && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClearSelection}
                  className="h-8 px-3 text-xs bg-background hover:bg-muted shadow-sm cursor-pointer rounded-sm border"
                  onMouseDown={e => e.stopPropagation()}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Results Panel component for displaying query results or errors
 */
export function ResultsPanel({
  result,
  error,
  isLoading = false,
  maxHeight = '600px',
  className,
  onSelectionChange,
  insightsQuery = null,
}: ResultsPanelProps): React.ReactNode {
  const [isEditingPage, setIsEditingPage] = React.useState(false)
  const [pageInput, setPageInput] = React.useState('')
  const pageInputRef = React.useRef<HTMLInputElement>(null)
  const [hoveredColumn, setHoveredColumn] = React.useState<string | null>(null)
  const [showCopyButton, setShowCopyButton] = React.useState(false)
  const headerScrollRef = React.useRef<HTMLDivElement>(null)
  const bodyScrollRef = React.useRef<HTMLDivElement>(null)
  const scrollSyncLockRef = React.useRef<'header' | 'body' | null>(null)
  const [columnWidths, setColumnWidths] = React.useState<number[]>([])
  const totalColumnWidth = React.useMemo(
    () => columnWidths.reduce((total, width) => total + width, 0),
    [columnWidths]
  )

  // Toggle between chart and table view for insights queries
  const [showChartView, setShowChartView] = React.useState(!!insightsQuery)

  // Enhanced selection state
  const [selectionMode, setSelectionMode] = React.useState<
    'none' | 'column' | 'row'
  >('none')
  const [selectedColumns, setSelectedColumns] = React.useState<Set<number>>(
    new Set()
  )
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set())
  const [lastSelectionIndex, setLastSelectionIndex] = React.useState<
    number | null
  >(null)
  const [selectionStartIndex, setSelectionStartIndex] = React.useState<
    number | null
  >(null)

  const pagination = usePagination({
    totalItems: result?.data.length || 0,
    itemsPerPage: 100,
    paginationThreshold: 1024,
  })

  const handleBodyScrollSync = React.useCallback(() => {
    const header = headerScrollRef.current
    const body = bodyScrollRef.current
    if (!header || !body) return

    if (scrollSyncLockRef.current === 'header') {
      scrollSyncLockRef.current = null
      return
    }

    if (header.scrollLeft !== body.scrollLeft) {
      scrollSyncLockRef.current = 'body'
      header.scrollLeft = body.scrollLeft
    }
  }, [])

  const handleHeaderScrollSync = React.useCallback(() => {
    const header = headerScrollRef.current
    const body = bodyScrollRef.current
    if (!header || !body) return

    if (scrollSyncLockRef.current === 'body') {
      scrollSyncLockRef.current = null
      return
    }

    if (body.scrollLeft !== header.scrollLeft) {
      scrollSyncLockRef.current = 'header'
      body.scrollLeft = header.scrollLeft
    }
  }, [])

  React.useEffect(() => {
    const header = headerScrollRef.current
    const body = bodyScrollRef.current
    if (!header || !body) return

    // Keep header aligned when data or pagination resets scroll
    header.scrollLeft = body.scrollLeft
  }, [result, pagination.currentPage])

  const measureColumnWidths = React.useCallback(() => {
    if (!result || !result.columns.length) {
      setColumnWidths(prev => (prev.length ? [] : prev))
      return
    }

    if (insightsQuery && showChartView) {
      return
    }

    const headerTable = headerScrollRef.current?.querySelector('table') ?? null
    const bodyTable = bodyScrollRef.current?.querySelector('table') ?? null

    if (!headerTable && !bodyTable) {
      return
    }

    const columnCount = result.columns.length
    const nextWidths = Array.from(
      { length: columnCount },
      () => MIN_COLUMN_WIDTH
    )
    const restoreStack: Array<() => void> = []

    const prepareTableForMeasurement = (
      table: HTMLTableElement | null
    ): void => {
      if (!table) return

      const previousWidth = table.style.width
      table.style.width = 'auto'
      restoreStack.push(() => {
        table.style.width = previousWidth
      })

      const previousLayout = table.style.tableLayout
      table.style.tableLayout = 'auto'
      restoreStack.push(() => {
        table.style.tableLayout = previousLayout
      })

      const previousMinWidth = table.style.minWidth
      table.style.minWidth = '0px'
      restoreStack.push(() => {
        table.style.minWidth = previousMinWidth
      })

      const cols = table.querySelectorAll('col')
      if (cols.length > 0) {
        const previousColWidths = Array.from(cols).map(col => col.style.width)
        Array.from(cols).forEach(col => {
          col.style.width = 'auto'
        })
        restoreStack.push(() => {
          Array.from(cols).forEach((col, index) => {
            col.style.width = previousColWidths[index]
          })
        })
      }
    }

    prepareTableForMeasurement(headerTable)
    prepareTableForMeasurement(bodyTable)

    const measureElementWidth = (element: HTMLElement): number => {
      const intrinsicWidth = Math.ceil(
        Math.max(element.scrollWidth, element.clientWidth)
      )
      if (intrinsicWidth <= 0 || Number.isNaN(intrinsicWidth)) {
        return MIN_COLUMN_WIDTH
      }
      return Math.max(MIN_COLUMN_WIDTH, intrinsicWidth + COLUMN_PADDING_BUFFER)
    }

    try {
      if (headerTable) {
        const headerCells = headerTable.querySelectorAll('thead th')
        headerCells.forEach((cell, index) => {
          if (index >= columnCount) {
            return
          }
          const measuredWidth = measureElementWidth(cell as HTMLElement)
          if (measuredWidth > nextWidths[index]) {
            nextWidths[index] = measuredWidth
          }
        })
      }

      if (bodyTable) {
        const bodyRows = bodyTable.querySelectorAll('tbody tr')
        bodyRows.forEach(row => {
          Array.from(row.children).forEach((cell, index) => {
            if (index >= columnCount) {
              return
            }
            const measuredWidth = measureElementWidth(cell as HTMLElement)
            if (measuredWidth > nextWidths[index]) {
              nextWidths[index] = measuredWidth
            }
          })
        })
      }
    } finally {
      while (restoreStack.length > 0) {
        const restore = restoreStack.pop()
        if (restore) {
          restore()
        }
      }
    }

    setColumnWidths(prev => {
      if (
        prev.length === nextWidths.length &&
        prev.every((value, index) => value === nextWidths[index])
      ) {
        return prev
      }
      return nextWidths
    })
  }, [result, insightsQuery, showChartView])

  React.useEffect(() => {
    if (!result || !result.columns.length) {
      setColumnWidths([])
      return
    }

    const frame = window.requestAnimationFrame(() => {
      measureColumnWidths()
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [
    result,
    pagination.currentPage,
    pagination.itemsPerPage,
    measureColumnWidths,
    insightsQuery,
    showChartView,
  ])

  React.useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      return
    }

    if (!bodyScrollRef.current) {
      return
    }

    const observer = new ResizeObserver(() => {
      measureColumnWidths()
    })

    observer.observe(bodyScrollRef.current)

    return () => {
      observer.disconnect()
    }
  }, [measureColumnWidths])

  React.useEffect(() => {
    const handleResize = (): void => {
      measureColumnWidths()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [measureColumnWidths])

  const handleCopySelection = async (): Promise<void> => {
    const selection = window.getSelection()
    if (!selection || selection.toString().length === 0) return

    try {
      await navigator.clipboard.writeText(selection.toString())
      setShowCopyButton(false)
      toast.success('Selection copied to clipboard')
    } catch (err) {
      console.error('[blockether-foundation-react] Failed to copy selection:', err)
      toast.error('Failed to copy selection')
    }
  }

  // Copy functions for different formats
  const copySelectedColumnsAsCSV = async (): Promise<void> => {
    if (selectedColumns.size === 0 || !result) return

    const csvContent = exportQueryResultToCSV(result, {
      selectedColumns: Array.from(selectedColumns),
    })

    try {
      await navigator.clipboard.writeText(csvContent)
      toast.success(
        `${selectedColumns.size} column${selectedColumns.size > 1 ? 's' : ''} copied as CSV`
      )
    } catch (err) {
      console.error('[blockether-foundation-react] Failed to copy columns:', err)
      toast.error('Failed to copy columns')
    }
  }

  const copySelectedColumnsAsJSON = async (): Promise<void> => {
    if (selectedColumns.size === 0 || !result) return

    const jsonContent = exportQueryResultToJSON(result, {
      selectedColumns: Array.from(selectedColumns),
    })

    try {
      await navigator.clipboard.writeText(jsonContent)
      toast.success(
        `${selectedColumns.size} column${selectedColumns.size > 1 ? 's' : ''} copied as JSON`
      )
    } catch (err) {
      console.error('[blockether-foundation-react] Failed to copy columns:', err)
      toast.error('Failed to copy columns')
    }
  }

  const copySelectedRowsAsCSV = async (): Promise<void> => {
    if (selectedRows.size === 0 || !result) return

    const csvContent = exportQueryResultToCSV(result, {
      selectedRows: Array.from(selectedRows),
    })

    try {
      await navigator.clipboard.writeText(csvContent)
      toast.success(
        `${selectedRows.size} row${selectedRows.size > 1 ? 's' : ''} copied as CSV`
      )
    } catch (err) {
      console.error('[blockether-foundation-react] Failed to copy rows:', err)
      toast.error('Failed to copy rows')
    }
  }

  const copySelectedRowsAsJSON = async (): Promise<void> => {
    if (selectedRows.size === 0 || !result) return

    const jsonContent = exportQueryResultToJSON(result, {
      selectedRows: Array.from(selectedRows),
    })

    try {
      await navigator.clipboard.writeText(jsonContent)
      toast.success(
        `${selectedRows.size} row${selectedRows.size > 1 ? 's' : ''} copied as JSON`
      )
    } catch (err) {
      console.error('[blockether-foundation-react] Failed to copy rows:', err)
      toast.error('Failed to copy rows')
    }
  }

  // Save functions for full dataset export
  const saveAsCSV = async (): Promise<void> => {
    if (!result) return

    const csvContent = exportQueryResultToCSV(result)

    try {
      await navigator.clipboard.writeText(csvContent)
      toast.success(`Full dataset (${result.data.length} rows) copied as CSV`)
    } catch (err) {
      console.error('[blockether-foundation-react] Failed to save CSV:', err)
      toast.error('Failed to save CSV')
    }
  }

  const downloadSelectedAsCSV = async (
    selectionType: 'columns' | 'rows'
  ): Promise<void> => {
    if (!result) return

    if (selectionType === 'columns' && selectedColumns.size > 0) {
      const file = exportQueryResultToCSVFile(
        result,
        `selected_columns_${Date.now()}.csv`,
        { selectedColumns: Array.from(selectedColumns) }
      )
      downloadFile(file)
      toast.success(
        `${selectedColumns.size} column${selectedColumns.size > 1 ? 's' : ''} saved as CSV`
      )
    } else if (selectionType === 'rows' && selectedRows.size > 0) {
      const file = exportQueryResultToCSVFile(
        result,
        `selected_rows_${Date.now()}.csv`,
        { selectedRows: Array.from(selectedRows) }
      )
      downloadFile(file)
      toast.success(
        `${selectedRows.size} row${selectedRows.size > 1 ? 's' : ''} saved as CSV`
      )
    }
  }

  const downloadSelectedAsJSON = async (
    selectionType: 'columns' | 'rows'
  ): Promise<void> => {
    if (!result) return

    if (selectionType === 'columns' && selectedColumns.size > 0) {
      const file = exportQueryResultToJSONFile(
        result,
        `selected_columns_${Date.now()}.json`,
        { selectedColumns: Array.from(selectedColumns) }
      )
      downloadFile(file)
      toast.success(
        `${selectedColumns.size} column${selectedColumns.size > 1 ? 's' : ''} saved as JSON`
      )
    } else if (selectionType === 'rows' && selectedRows.size > 0) {
      const file = exportQueryResultToJSONFile(
        result,
        `selected_rows_${Date.now()}.json`,
        { selectedRows: Array.from(selectedRows) }
      )
      downloadFile(file)
      toast.success(
        `${selectedRows.size} row${selectedRows.size > 1 ? 's' : ''} saved as JSON`
      )
    }
  }

  const downloadFile = (file: File): void => {
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleDownloadFullResultAsCSV = (): void => {
    if (!result) return

    const file = exportQueryResultToCSVFile(result, `results_${Date.now()}.csv`)
    downloadFile(file)
    toast.success(`Full dataset (${result.data.length} rows) saved as CSV`)
  }

  const handleDownloadFullResultAsJSON = (): void => {
    if (!result) return

    const file = exportQueryResultToJSONFile(
      result,
      `results_${Date.now()}.json`
    )
    downloadFile(file)
    toast.success(`Full dataset (${result.data.length} rows) saved as JSON`)
  }

  const saveAsJSON = async (): Promise<void> => {
    if (!result) return

    const jsonContent = exportQueryResultToJSON(result)

    try {
      await navigator.clipboard.writeText(jsonContent)
      toast.success(`Full dataset (${result.data.length} rows) copied as JSON`)
    } catch (err) {
      console.error('[blockether-foundation-react] Failed to save JSON:', err)
      toast.error('Failed to save JSON')
    }
  }

  const handleColumnClick = (
    columnIndex: number,
    event: React.MouseEvent
  ): void => {
    event.preventDefault()
    event.stopPropagation()

    if (
      event.shiftKey &&
      selectedColumns.size > 0 &&
      selectionStartIndex !== null
    ) {
      // Range selection for columns
      const start = Math.min(selectionStartIndex, columnIndex)
      const end = Math.max(selectionStartIndex, columnIndex)
      const newSelection = new Set<number>()
      for (let i = start; i <= end; i++) {
        newSelection.add(i)
      }
      setSelectedColumns(newSelection)
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle selection for multiple columns
      const newSelection = new Set(selectedColumns)
      if (newSelection.has(columnIndex)) {
        newSelection.delete(columnIndex)
      } else {
        newSelection.add(columnIndex)
      }
      setSelectedColumns(newSelection)
      setSelectionStartIndex(columnIndex)
    } else {
      // Single column selection
      setSelectedColumns(new Set([columnIndex]))
      setSelectionStartIndex(columnIndex)
    }

    setSelectionMode('column')
    setSelectedRows(new Set())
  }

  const handleRowClick = (rowIndex: number, event: React.MouseEvent): void => {
    event.preventDefault()
    event.stopPropagation()

    if (!result) return

    const actualRowIndex = pagination.startIndex + rowIndex

    if (
      event.shiftKey &&
      selectedRows.size > 0 &&
      lastSelectionIndex !== null
    ) {
      // Range selection for rows
      const start = Math.min(lastSelectionIndex, actualRowIndex)
      const end = Math.max(lastSelectionIndex, actualRowIndex)
      const newSelection = new Set<number>()
      for (let i = start; i <= end; i++) {
        if (i < result.data.length) {
          newSelection.add(i)
        }
      }
      setSelectedRows(newSelection)
    } else if (event.ctrlKey || event.metaKey) {
      // Toggle selection for multiple rows
      const newSelection = new Set(selectedRows)
      if (newSelection.has(actualRowIndex)) {
        newSelection.delete(actualRowIndex)
      } else {
        newSelection.add(actualRowIndex)
      }
      setSelectedRows(newSelection)
      setLastSelectionIndex(actualRowIndex)
    } else {
      // Single row selection
      setSelectedRows(new Set([actualRowIndex]))
      setLastSelectionIndex(actualRowIndex)
    }

    setSelectionMode('row')
    setSelectedColumns(new Set())
  }

  const clearSelection = (): void => {
    setSelectionMode('none')
    setSelectedColumns(new Set())
    setSelectedRows(new Set())
    setLastSelectionIndex(null)
    setSelectionStartIndex(null)
  }

  // Listen for text selection changes within results panel only
  React.useEffect(() => {
    const handleSelectionChange = (): void => {
      const selection = window.getSelection()
      if (selection && selection.toString().length > 0) {
        // Check if selection is within the results panel
        const range = selection.getRangeAt(0)
        const resultsContainer = document.querySelector('[data-results-panel]')
        const isWithinResults =
          resultsContainer &&
          resultsContainer.contains(range.commonAncestorContainer)
        setShowCopyButton(!!isWithinResults)
      } else {
        setShowCopyButton(false)
      }
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      // Always handle Escape key globally to clear selections
      if (e.key === 'Escape') {
        e.preventDefault()
        clearSelection()
        return
      }

      // Only handle other shortcuts when no input is focused and within results panel
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Check if the active element is within the results panel
      const resultsContainer = document.querySelector('[data-results-panel]')
      const isWithinResults =
        resultsContainer && resultsContainer.contains(document.activeElement)

      if (!isWithinResults && document.activeElement !== document.body) {
        return
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        // Select all rows in the current page
        if (result && result.data.length > 0) {
          const pageEndIndex = pagination.endIndex
          const startIndex = pagination.startIndex

          // Select all visible rows
          const newSelection = new Set<number>()
          for (
            let i = 0;
            i < Math.min(pageEndIndex - startIndex, result.data.length);
            i++
          ) {
            newSelection.add(startIndex + i)
          }
          setSelectedRows(newSelection)
          setSelectedColumns(new Set())
          setSelectionMode('row')
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()

        if (selectedColumns.size > 0) {
          copySelectedColumnsAsCSV()
        } else if (selectedRows.size > 0) {
          copySelectedRowsAsCSV()
        } else {
          handleCopySelection()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()

        if (selectedColumns.size > 0) {
          // Save selected columns as CSV
          downloadSelectedAsCSV('columns')
        } else if (selectedRows.size > 0) {
          // Save selected rows as CSV
          downloadSelectedAsCSV('rows')
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    selectedColumns,
    selectedRows,
    result,
    pagination.startIndex,
    pagination.endIndex,
    copySelectedColumnsAsCSV,
    copySelectedRowsAsCSV,
    handleCopySelection,
  ])

  // Notify parent component of selection changes
  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedColumns, selectedRows)
    }
  }, [selectedColumns, selectedRows, onSelectionChange])

  // Clear selection when clicking outside results panel, selection toolbar, or dropdowns
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      // Don't clear selection if we have active selections (rows or columns)
      if (selectedColumns.size > 0 || selectedRows.size > 0) {
        return
      }

      // Use composedPath() for Shadow DOM compatibility
      const path = e.composedPath()

      const resultsContainer = document.querySelector('[data-results-panel]')
      const selectionToolbar = document.querySelector(
        '[data-selection-toolbar]'
      )

      const isClickWithinResults =
        resultsContainer && path.includes(resultsContainer)
      const isClickWithinToolbar =
        selectionToolbar && path.includes(selectionToolbar)

      // Only clear if clicking completely outside the results area and toolbar
      if (!isClickWithinResults && !isClickWithinToolbar) {
        const selection = window.getSelection()
        if (!selection || selection.toString().length === 0) {
          clearSelection()
        }
      }
    }

    document.addEventListener('click', handleClickOutside, true) // Use capture to catch earlier
    return () => {
      document.removeEventListener('click', handleClickOutside, true)
    }
  }, [selectedColumns.size, selectedRows.size])

  const handlePageClick = (): void => {
    setIsEditingPage(true)
    setPageInput(String(pagination.currentPage))
  }

  const handlePageInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setPageInput(e.target.value)
  }

  const handlePageInputSubmit = (): void => {
    const pageNum = parseInt(pageInput, 10)
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pagination.totalPages) {
      pagination.setCurrentPage(pageNum)
    }
    setIsEditingPage(false)
    setPageInput('')
  }

  const handlePageInputBlur = (): void => {
    handlePageInputSubmit()
  }

  const handlePageInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === 'Enter') {
      handlePageInputSubmit()
    } else if (e.key === 'Escape') {
      setIsEditingPage(false)
      setPageInput('')
    }
  }

  // Focus input when editing starts
  React.useEffect(() => {
    if (isEditingPage && pageInputRef.current) {
      pageInputRef.current.focus()
      pageInputRef.current.select()
    }
  }, [isEditingPage])

  // Get paginated data
  const displayData = result ? pagination.getPaginatedData(result.data) : []

  // Loading state content without header (for unified toolbar)
  const loadingContentNoHeader = (
    <div className="overflow-y-auto bg-background text-foreground flex-1 grow min-h-[30vh]">
      <div className="flex items-center justify-center min-h-[30vh]">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mb-4 mx-auto">
            <svg
              className="animate-spin h-8 w-8"
              viewBox="0 0 100 100"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <defs>
                {/* 3D gradient for faces */}
                <linearGradient
                  id="topFace"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#93c5fd" />
                  <stop offset="50%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>

                <linearGradient
                  id="leftFace"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#1e40af" />
                </linearGradient>

                <linearGradient
                  id="rightFace"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>

                {/* Shadow filter */}
                <filter id="shadow3d">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                  <feOffset dx="2" dy="2" result="offsetblur" />
                  <feFlood floodColor="#000000" floodOpacity="0.3" />
                  <feComposite in2="offsetblur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Back shadow layer */}
              <polygon
                points="52,7 92,27 92,77 52,97 12,77 12,27"
                fill="#000000"
                opacity="0.2"
                transform="translate(2, 2)"
              />

              {/* Left face (darker) */}
              <polygon
                points="50,5 52,7 52,97 50,95 10,75 10,25"
                fill="url(#leftFace)"
                filter="url(#shadow3d)"
              />

              {/* Right face (medium) */}
              <polygon
                points="50,5 90,25 92,27 52,7 52,97 90,77"
                fill="url(#rightFace)"
                filter="url(#shadow3d)"
              />

              {/* Top face (brightest) */}
              <polygon
                points="50,5 90,25 90,75 50,95 10,75 10,25"
                fill="url(#topFace)"
                filter="url(#shadow3d)"
              />

              {/* Highlight edge */}
              <polygon
                points="50,5 90,25 90,75 50,95 10,75 10,25"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.5"
                opacity="0.6"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-foreground mb-2">
            Running SQL Query
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Your query is being executed. This may take a moment depending on
            the complexity of your query and data size.
          </p>
        </div>
      </div>
    </div>
  )

  // Error state content without header (for unified toolbar)
  const errorContentNoHeader = (
    <div className="overflow-y-auto flex-1 grow min-h-[30vh]">
      <div className="flex items-center justify-center min-h-[30vh] p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <div className="shrink-0 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center border border-destructive/20">
              <svg
                className="w-6 h-6 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-destructive mb-4 transition-all duration-300 ease-in-out">
            {getErrorTypeLabel(error?.type || 'runtime')}
          </h3>
          <div className="bg-destructive/10 border border-destructive/20 rounded-sm p-4 mb-3 min-h-[94px] transition-all duration-300 ease-in-out flex items-center justify-center">
            <p className="text-sm text-destructive font-mono transition-all duration-300 ease-in-out text-center">
              {error?.message || 'Unknown error occurred'}
            </p>
          </div>
          {(error?.line || error?.column) && (
            <div className="text-xs bg-muted/50 text-muted-foreground p-3 rounded-sm text-left">
              <span className="font-medium">Location:</span> Line {error?.line},
              Column {error?.column}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // No results state content without header (for unified toolbar)
  const noResultsContentNoHeader = (
    <div className="overflow-y-auto bg-background flex-1 grow min-h-[30vh]">
      <div className="flex items-center justify-center min-h-[30vh]">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mb-4 mx-auto border">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-foreground mb-2">
            No results to display
          </h3>
          <p className="text-sm text-muted-foreground max-w-md px-8">
            Run a SQL query to see results here. Use the editor above to write
            and execute your query.
          </p>
        </div>
      </div>
    </div>
  )

  // Empty result set content without header (for unified toolbar)
  const emptyResultContentNoHeader = (
    <div className="overflow-y-auto bg-background flex-1 grow min-h-[30vh]">
      <div className="flex items-center justify-center min-h-[30vh]">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mb-4 mx-auto border">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-medium text-foreground mb-2">
            No results to display
          </h3>
          <p className="text-sm text-muted-foreground max-w-md px-8">
            The query executed successfully but returned 0 rows. Try modifying
            your query or check if the data exists.
          </p>
        </div>
      </div>
    </div>
  )

  // Results table content (table only)
  const resultsTableContent = (
    <div className="h-full bg-muted/50 flex flex-col mt-0">
      {/* Fixed Header */}
      <div className="sticky top-0 z-1 bg-background border-b border-border">
        <div
          className="overflow-x-auto blockether-scrollbar-hidden"
          ref={headerScrollRef}
          onScroll={handleHeaderScrollSync}
        >
          <Table
            className="border-separate border-spacing-0"
            style={{
              tableLayout: columnWidths.length ? 'fixed' : 'auto',
              width: '100%',
              minWidth: columnWidths.length
                ? `${totalColumnWidth}px`
                : undefined,
            }}
          >
            <colgroup>
              {result?.columns.map((_, index: number) => (
                <col
                  key={index}
                  style={
                    columnWidths[index]
                      ? { width: `${columnWidths[index]}px` }
                      : undefined
                  }
                />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow>
                {result?.columns.map(
                  (column: QueryResult['columns'][0], index: number) => (
                    <TableHead
                      key={index}
                      className={cn(
                        'text-foreground h-10 px-3 text-left align-middle whitespace-nowrap border-y-2 font-bold transition-colors cursor-pointer select-none border-b-3 bg-muted/50 hover:bg-muted/50 border-r',
                        hoveredColumn === column.name
                          ? 'bg-primary/10'
                          : 'hover:bg-muted/50',
                        selectedColumns.has(index) &&
                        'bg-primary/20 ring-2 ring-primary/50',
                        selectionMode === 'column' && 'hover:bg-primary/30'
                      )}
                      style={{ minWidth: `${MIN_COLUMN_WIDTH}px` }}
                      onMouseEnter={() => setHoveredColumn(column.name)}
                      onMouseLeave={() => setHoveredColumn(null)}
                      onClick={e => handleColumnClick(index, e)}
                    >
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="truncate mr-2">{column.name}</span>
                        <TypeBadge
                          type={column.type}
                          nullable={column.nullable}
                        />
                      </div>
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
          </Table>
        </div>
      </div>

      {/* Results table - flex-1 to take remaining height */}
      <div
        className={cn('overflow-auto relative flex-1 h-full border-b-2')}
        ref={bodyScrollRef}
        onScroll={handleBodyScrollSync}
      >
        <div className="overflow-x-visible">
          <Table
            className="w-full border-separate border-spacing-0"
            style={{
              tableLayout: columnWidths.length ? 'fixed' : 'auto',
              minWidth: columnWidths.length
                ? `${totalColumnWidth}px`
                : undefined,
            }}
          >
            <colgroup>
              {result?.columns.map((_, index: number) => (
                <col
                  key={index}
                  style={
                    columnWidths[index]
                      ? { width: `${columnWidths[index]}px` }
                      : undefined
                  }
                />
              ))}
            </colgroup>
            <TableBody>
              {(displayData as Array<Record<string, unknown>>).map(
                (row: Record<string, unknown>, rowIndex: number) => {
                  const actualRowIndex = pagination.startIndex + rowIndex
                  const isRowSelected = selectedRows.has(actualRowIndex)

                  return (
                    <TableRow
                      key={actualRowIndex}
                      className={cn(
                        'transition-colors cursor-pointer select-none',
                        isRowSelected
                          ? 'bg-primary/20 ring-2 ring-primary/50'
                          : 'hover:bg-primary/10',
                        selectionMode === 'row' && 'hover:bg-primary/30'
                      )}
                      onClick={e => handleRowClick(rowIndex, e)}
                    >
                      {result?.columns.map(
                        (
                          column: QueryResult['columns'][0],
                          colIndex: number
                        ) => {
                          const value = row[column.name]
                          const isColumnSelected = selectedColumns.has(colIndex)

                          return (
                            <TableCell
                              key={colIndex}
                              className={cn(
                                'align-middle whitespace-nowrap text-foreground transition-colors select-none border-r',
                                isColumnSelected && 'bg-primary/15',
                                hoveredColumn === column.name && 'bg-primary/10'
                              )}
                              style={{ minWidth: `${MIN_COLUMN_WIDTH}px` }}
                            >
                              <CellValue value={value} type={column.type} />
                            </TableCell>
                          )
                        }
                      )}
                    </TableRow>
                  )
                }
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )

  // Main render with animated state transitions
  return (
    <div className="bg-background relative flex flex-col h-full max-h-[65vh]">
      {/* Unified results summary toolbar - always present with consistent height */}
      <div className="h-[68px] max-h-[68px] flex items-center justify-between px-3 py-2 bg-background border-t border-b transition-all duration-200 ease-in-out shrink-0">
        <div className="flex items-center gap-3 text-xs min-w-0 flex-1 transition-all duration-200 ease-in-out">
          <span className="font-medium text-foreground transition-all duration-200 ease-in-out min-w-[92px] inline-block">
            {isLoading
              ? 'Executing Query...'
              : error
                ? `${getErrorTypeLabel(error.type || 'runtime')}`
                : !result
                  ? 'No Results'
                  : result.data.length === 0
                    ? '0 rows returned'
                    : result.rowCount
                      ? `${result.rowCount.toLocaleString()} rows affected`
                      : `${result.data.length.toLocaleString()} rows returned`}
          </span>
          <span className="text-muted-foreground transition-all duration-200 ease-in-out min-w-20 inline-block">
            {!error && result?.columns && <>{result.columns.length} columns</>}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 transition-all duration-200 ease-in-out">
          {/* Insights query toggle button */}
          {insightsQuery && result && result.data.length > 0 && (
            <div className="flex items-center bg-muted/50 border rounded-sm">
              <Button
                size="sm"
                variant={showChartView ? 'default' : 'ghost'}
                onClick={() => setShowChartView(true)}
                className="h-5 px-2 text-xs rounded-r-none border-r-0 cursor-pointer rounded-sm"
                title="Show chart view"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Insights
              </Button>
              <Button
                size="sm"
                variant={!showChartView ? 'default' : 'ghost'}
                onClick={() => setShowChartView(false)}
                className="h-5 px-2 text-xs rounded-l-none cursor-pointer rounded-sm"
                title="Show table view"
              >
                <TableIcon className="h-3 w-3 mr-1" />
                Table
              </Button>
            </div>
          )}
          <div className="ml-3 text-xs bg-muted/50 text-foreground px-1.5 py-0 rounded border transition-all duration-300 ease-in-out">
            {result?.executionTime || '0'}ms
          </div>
        </div>
      </div>
      <div
        className={cn('flex-1 overflow-y-auto', className)}
        style={{ maxHeight }}
        data-results-panel="true"
      >
        <StateTransition isVisible={isLoading}>
          {loadingContentNoHeader}
        </StateTransition>

        <StateTransition isVisible={!!error}>
          {errorContentNoHeader}
        </StateTransition>

        <StateTransition isVisible={!result && !isLoading && !error}>
          {noResultsContentNoHeader}
        </StateTransition>

        <StateTransition
          isVisible={
            !!result && result.data.length === 0 && !isLoading && !error
          }
        >
          {emptyResultContentNoHeader}
        </StateTransition>

        <StateTransition
          isVisible={!!result && result.data.length > 0 && !isLoading && !error}
        >
          {insightsQuery && result && showChartView
            ? insightsQuery.renderer(result)
            : resultsTableContent}
        </StateTransition>
      </div>

      {/* Selection toolbar - truly sticky at bottom */}
      {result && result.data && result.data.length > 0 && (
        <ResultsSelectionToolbar
          result={result}
          showCopyButton={showCopyButton}
          selectedColumns={selectedColumns}
          selectedRows={selectedRows}
          pagination={pagination}
          isEditingPage={isEditingPage}
          pageInput={pageInput}
          pageInputRef={pageInputRef}
          onPageInputChange={handlePageInputChange}
          onPageInputBlur={handlePageInputBlur}
          onPageInputKeyDown={handlePageInputKeyDown}
          onPageClick={handlePageClick}
          onCopySelectedColumnsAsCSV={copySelectedColumnsAsCSV}
          onCopySelectedColumnsAsJSON={copySelectedColumnsAsJSON}
          onCopySelectedRowsAsCSV={copySelectedRowsAsCSV}
          onCopySelectedRowsAsJSON={copySelectedRowsAsJSON}
          onSaveAsCSV={saveAsCSV}
          onSaveAsJSON={saveAsJSON}
          onDownloadSelectedAsCSV={downloadSelectedAsCSV}
          onDownloadSelectedAsJSON={downloadSelectedAsJSON}
          onDownloadFullCSV={handleDownloadFullResultAsCSV}
          onDownloadFullJSON={handleDownloadFullResultAsJSON}
          onClearSelection={clearSelection}
        />
      )}

      {/* Accessibility announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        Query completed successfully. {result?.data.length} rows returned.
      </div>
    </div>
  )
}

/**
 * Cell value renderer for different data types
 */
function CellValue({
  value,
  type,
}: {
  value: unknown
  type: QueryResult['columns'][0]['type']
}): React.ReactNode {
  // Handle null values
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">NULL</span>
  }

  // Handle different data types
  switch (type) {
    case 'boolean':
      return (
        <span
          className={cn(
            'inline-flex items-center px-2 py-1 text-xs font-medium rounded',
            value
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-muted text-muted-foreground'
          )}
        >
          {value.toString()}
        </span>
      )

    case 'number':
      // Format numbers with appropriate precision
      if (Number.isInteger(value as number)) {
        return (
          <span className="font-mono">
            {(value as number).toLocaleString()}
          </span>
        )
      } else {
        return (
          <span className="font-mono">
            {(value as number).toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })}
          </span>
        )
      }

    case 'date':
      return <DateCellValue value={value} />

    case 'string':
    default:
      // Handle long strings
      const stringValue = String(value)
      if (stringValue.length > 100) {
        return (
          <span className="font-mono" title={stringValue}>
            {stringValue.substring(0, 100)}...
          </span>
        )
      }
      return <span className="font-mono">{stringValue}</span>
  }
}

/**
 * Date cell value component (separated to avoid JSX in try/catch)
 */
function DateCellValue({ value }: { value: unknown }): React.ReactNode {
  let formattedDate: string

  try {
    const date = new Date(value as string)
    formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
  } catch {
    formattedDate = String(value)
  }

  return <span className="font-mono">{formattedDate}</span>
}

/**
 * Get error type label for display
 */
function getErrorTypeLabel(type: SQLError['type']): string {
  switch (type) {
    case 'syntax':
      return 'Syntax Error'
    case 'runtime':
      return 'Runtime Error'
    case 'connection':
      return 'Connection Error'
    case 'memory':
      return 'Memory Error'
    default:
      return 'Error'
  }
}
