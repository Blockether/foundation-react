/**
 * Data Sources Component
 *
 * This component provides a dropdown interface for viewing available data sources
 * and importing new files (CSV, Parquet, JSON) into DuckDB.
 */

import React, { useState, useRef, useEffect } from 'react'
// Lucide React icons
import {
  Database,
  Upload,
  FileText,
  Table2,
  Eye,
  Link,
  X,
  Search,
  BarChart3,
  Shield,
  Lightbulb,
  CheckCircle,
  XCircle,
  Loader2,
  HelpCircle,
} from 'lucide-react'
import { DataSource, InsightsQuery } from '@/types/sql'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export interface DataSourcesProps {
  dataSources: DataSource[]
  isLoadingBatch: boolean
  onImportFile?: ((file: File) => Promise<void>) | undefined
  onSelectDataSource?: ((dataSource: DataSource) => void) | undefined
  onExecuteInsightsQuery?:
    | ((query: InsightsQuery, dataSource?: DataSource) => Promise<void>)
    | undefined
  onRemoveDataSource?: ((dataSource: DataSource) => void) | undefined
  className?: string
  /**
   * Analytical queries for data analysis
   * Only user-provided queries will be available - no built-in defaults
   */
  analyticalQueries?: InsightsQuery[]
}

/**
 * Data Sources dropdown component
 */
export function DataSources({
  dataSources,
  isLoadingBatch,
  onImportFile,
  onSelectDataSource,
  onExecuteInsightsQuery,
  onRemoveDataSource,
  analyticalQueries,
  className,
}: DataSourcesProps): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const triggerButtonRef = useRef<HTMLButtonElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Filter data sources based on search term
  const filteredDataSources = React.useMemo(() => {
    if (!searchTerm) return dataSources

    const lowerSearchTerm = searchTerm.toLowerCase()
    return dataSources.filter(
      ds =>
        ds.name.toLowerCase().includes(lowerSearchTerm) ||
        ds.description?.toLowerCase().includes(lowerSearchTerm) ||
        ds.tableName.toLowerCase().includes(lowerSearchTerm)
    )
  }, [dataSources, searchTerm])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerButtonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current && dataSources.length > 3) {
      searchInputRef.current.focus()
    }
  }, [isOpen, dataSources.length])

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0]
    if (!file || !onImportFile) return

    setIsUploading(true)
    try {
      await onImportFile(file)
    } catch (error) {
      console.error('Failed to import file:', error)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDataSourceClick = (dataSource: DataSource): void => {
    // Prevent selection if failed or loading
    if (
      dataSource.loadingStatus === 'failed' ||
      dataSource.loadingStatus === 'loading'
    ) {
      return
    }

    if (onSelectDataSource) {
      onSelectDataSource(dataSource)
    }
  }

  const handleInsightsQuery = async (
    query: InsightsQuery,
    dataSource: DataSource,
    event: React.MouseEvent
  ): Promise<void> => {
    event.stopPropagation()
    event.preventDefault()

    if (onExecuteInsightsQuery) {
      await onExecuteInsightsQuery(query, dataSource)
      setIsOpen(false)
    }
  }

  const handleRemoveDataSource = (
    dataSource: DataSource,
    event: React.MouseEvent
  ): void => {
    event.stopPropagation()
    event.preventDefault()

    if (onRemoveDataSource) {
      onRemoveDataSource(dataSource)
    }
  }

  const getAvailableQueries = (dataSource: DataSource): InsightsQuery[] => {
    // Filter analytical queries based on targeting criteria
    if (!analyticalQueries) return []

    return analyticalQueries.filter(query => {
      // Check target tables - if specified, must include this data source's table
      if (query.targetTables && query.targetTables.length > 0) {
        if (!query.targetTables.includes(dataSource.tableName)) {
          return false
        }
      }

      // Check target categories - if specified, must include this data source's type
      if (query.targetCategories && query.targetCategories.length > 0) {
        if (!query.targetCategories.includes(dataSource.type)) {
          return false
        }
      }

      return true
    })
  }

  const getDataSourceIcon = (type: DataSource['type']): React.ReactNode => {
    switch (type) {
      case 'table':
        return <Table2 className="h-4 w-4" />
      case 'view':
        return <Eye className="h-4 w-4" />
      case 'file':
        return <FileText className="h-4 w-4" />
      case 'url':
        return <Link className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Check if any datasources are currently loading OR if we're loading a batch
  const hasLoadingDataSources = React.useMemo(() => {
    return (
      isLoadingBatch || dataSources.some(ds => ds.loadingStatus === 'loading')
    )
  }, [isLoadingBatch, dataSources])

  return (
    <div className={cn('relative bg-background', className)}>
      {/* Trigger button */}
      <Button
        ref={triggerButtonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0 hover:cursor-pointer relative"
        aria-label="Data sources"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Database className="h-4 w-4" />
        {/* Yellow loading indicator dot */}
        {hasLoadingDataSources && (
          <span
            className="absolute top-0 right-0 flex h-2 w-2"
            key="loading-indicator"
          >
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500 animate-pulse"></span>
          </span>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-1 w-80 border shadow-lg bg-background text-foreground rounded-sm z-50 flex flex-col min-h-[160px] overflow-visible"
        >
          {/* Header */}
          <div className="px-3 py-4 border-b">
            <h3 className="text-sm font-semibold">Data Sources</h3>
          </div>

          {/* Search input */}
          {dataSources.length > 3 && (
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search data sources..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-1.5 text-xs border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent rounded"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      searchInputRef.current?.focus()
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1"
                  >
                    <X className="h-3 w-3 cursor-pointer" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Data sources list */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-[64px]">
            {filteredDataSources.length === 0 ? (
              <div className="flex items-center justify-center min-h-[40vh] p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 bg-muted/30 rounded-full mb-4 mx-auto border">
                    <Database className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium text-foreground mb-2">
                    No data sources available
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {searchTerm
                      ? 'No data sources found matching your search. Try adjusting your search terms.'
                      : 'Import a file to get started with SQL queries.'}
                  </p>
                </div>
              </div>
            ) : (
              <div role="menu">
                {filteredDataSources.map((dataSource, index) => {
                  const availableQueries = getAvailableQueries(dataSource)
                  const hasAnalysis =
                    onExecuteInsightsQuery && availableQueries.length > 0
                  const isDisabled =
                    dataSource.loadingStatus === 'failed' ||
                    dataSource.loadingStatus === 'loading' ||
                    dataSource.loadingStatus === 'verification_needed'
                  const isFailed = dataSource.loadingStatus === 'failed'
                  const isLoading = dataSource.loadingStatus === 'loading'
                  const needsVerification =
                    dataSource.loadingStatus === 'verification_needed'

                  return (
                    <div
                      key={dataSource.id}
                      className={cn(
                        'w-full',
                        index < filteredDataSources.length - 1 && 'border-b'
                      )}
                    >
                      <div className="flex items-center">
                        {/* Main data source info */}
                        <button
                          role="menuitem"
                          disabled={isDisabled}
                          className={cn(
                            'flex-1 text-left px-3 py-2 text-sm focus:outline-none transition-colors h-16 max-h-16 w-[246px]',
                            !isDisabled && 'cursor-pointer hover:bg-muted',
                            isDisabled && 'opacity-50 cursor-not-allowed'
                          )}
                          onClick={() => handleDataSourceClick(dataSource)}
                        >
                          <div className="flex items-center gap-3 h-full overflow-hidden">
                            <div className="flex-shrink-0">
                              {getDataSourceIcon(dataSource.type)}
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="font-medium truncate overflow-hidden text-ellipsis max-w-[210px]">
                                  {dataSource.name}
                                </div>
                                {dataSource.file && (
                                  <span className="text-xs text-muted-foreground flex-shrink-0">
                                    ({formatFileSize(dataSource.file.size)})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span className="flex-shrink-0">Table:</span>
                                <span className="font-mono bg-muted inline-block px-1 truncate overflow-hidden text-ellipsis max-w-[140px]">
                                  {dataSource.tableName}
                                </span>
                                {/* Status checkmark */}
                                {isLoading && (
                                  <span
                                    title="Loading..."
                                    className="flex-shrink-0"
                                  >
                                    <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />
                                  </span>
                                )}
                                {needsVerification && (
                                  <span
                                    title="Verification needed"
                                    className="animate-pulse flex-shrink-0"
                                  >
                                    <HelpCircle className="h-3 w-3 text-yellow-600 dark:text-yellow-500" />
                                  </span>
                                )}
                                {dataSource.loadingStatus === 'loaded' && (
                                  <span
                                    title="Loaded successfully"
                                    className="flex-shrink-0"
                                  >
                                    <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-500" />
                                  </span>
                                )}
                                {isFailed && (
                                  <span
                                    className="cursor-help relative z-50 flex-shrink-0"
                                    title={
                                      dataSource.loadingError ||
                                      'Failed to load'
                                    }
                                  >
                                    <XCircle className="h-3 w-3 text-red-600 dark:text-red-500" />
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Remove button for failed sources */}
                        {isFailed && onRemoveDataSource && (
                          <div className="px-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-950/50 cursor-pointer"
                              onClick={e =>
                                handleRemoveDataSource(dataSource, e)
                              }
                              title="Remove failed data source"
                            >
                              <X className="h-4 w-4 text-red-600 dark:text-red-500" />
                            </Button>
                          </div>
                        )}

                        {/* Analyze button */}
                        {hasAnalysis && !isDisabled && (
                          <div className="px-2 cursor-pointer">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-16 w-16 p-0 bg-background transition-colors cursor-pointer"
                                  title="Analyze data"
                                >
                                  <BarChart3 className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56">
                                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                  Quick Analysis
                                </div>
                                <DropdownMenuSeparator />
                                {availableQueries.map(query => {
                                  const renderIcon = () => {
                                    // If icon is a React node, render it directly
                                    if (typeof query.icon !== 'string') {
                                      return query.icon
                                    }

                                    // If icon is a string, handle it
                                    switch (query.icon) {
                                      case 'BarChart3':
                                        return (
                                          <BarChart3 className="h-4 w-4 flex-shrink-0" />
                                        )
                                      case 'Search':
                                        return (
                                          <Search className="h-4 w-4 flex-shrink-0" />
                                        )
                                      case 'Shield':
                                        return (
                                          <Shield className="h-4 w-4 flex-shrink-0" />
                                        )
                                      case 'Lightbulb':
                                        return (
                                          <Lightbulb className="h-4 w-4 flex-shrink-0" />
                                        )
                                      default:
                                        // For string emojis or custom strings, render as text
                                        return (
                                          <span className="h-4 w-4 flex-shrink-0 flex items-center justify-center text-sm">
                                            {query.icon}
                                          </span>
                                        )
                                    }
                                  }

                                  return (
                                    <DropdownMenuItem
                                      key={query.id}
                                      onClick={e =>
                                        handleInsightsQuery(
                                          query,
                                          dataSource,
                                          e
                                        )
                                      }
                                      onMouseDown={e =>
                                        handleInsightsQuery(
                                          query,
                                          dataSource,
                                          e
                                        )
                                      }
                                      className="cursor-pointer"
                                    >
                                      <div className="flex items-center gap-3 w-full">
                                        {renderIcon()}
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium text-sm">
                                            {query.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground mt-0.5">
                                            {query.description}
                                          </div>
                                        </div>
                                      </div>
                                    </DropdownMenuItem>
                                  )
                                })}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Import file button - at bottom */}
          {onImportFile && (
            <div className="p-3 border-t">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.parquet,.json,.jsonl"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full justify-start gap-2 cursor-pointer"
                title="Supported files are: .csv, .parquet, .json, .jsonl"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Importing...' : 'Import from file'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Status announcement for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {isOpen &&
          `Dropdown open with ${filteredDataSources.length} data sources available`}
      </div>
    </div>
  )
}
