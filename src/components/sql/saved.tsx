/**
 * Saved Queries Component
 *
 * This component provides a dropdown interface for selecting and managing saved SQL queries.
 * It displays query names, descriptions, and allows for easy selection.
 */

import React, { useState, useRef, useEffect } from 'react'
// Lucide React icons
import { Clock, Search, X, History } from 'lucide-react'
import { SavedQuery } from '@/types/sql'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SavedQueriesProps {
  queries: SavedQuery[]
  onSelect: (query: SavedQuery) => void
  className?: string
}

/**
 * Saved Queries dropdown component
 */
export function SavedQueries({
  queries,
  onSelect,
  className,
}: SavedQueriesProps): React.ReactNode {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const triggerButtonRef = useRef<HTMLButtonElement>(null)

  // Filter queries based on search term
  const filteredQueries = React.useMemo(() => {
    if (!searchTerm) return queries

    const lowerSearchTerm = searchTerm.toLowerCase()
    return queries.filter(
      query =>
        query.name.toLowerCase().includes(lowerSearchTerm) ||
        query.description?.toLowerCase().includes(lowerSearchTerm) ||
        query.query.toLowerCase().includes(lowerSearchTerm)
    )
  }, [queries, searchTerm])

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
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleSelect = (query: SavedQuery): void => {
    onSelect(query)
    setIsOpen(false)
    setSearchTerm('')
      }

  const formatLastModified = (date: Date): string => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`
    } else {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months > 1 ? 's' : ''} ago`
    }
  }

  return (
    <div className={cn('relative bg-background', className)}>
      {/* Trigger button */}
      <Button
        ref={triggerButtonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 p-0 hover:cursor-pointer"
        aria-label="Query history"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <History className="h-4 w-4" />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full right-0 mt-1 w-80 border shadow-lg bg-background text-foreground rounded-sm z-[50] flex flex-col"
        >
          {/* Search input */}
          {queries.length > 3 && (
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 " />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value)
                                      }}
                  className="w-full pl-10 pr-10 py-1.5 text-xs  border focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                                            searchInputRef.current?.focus()
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:"
                  >
                    <X className="h-3 w-3 cursor-pointer" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Query list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredQueries.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm">
                {searchTerm
                  ? 'No queries found matching your search.'
                  : 'No saved queries available.'}
              </div>
            ) : (
              <div role="menu">
                {filteredQueries.map((query, index) => (
                  <button
                    key={query.id}
                    role="menuitem"
                    className={cn(
                      'w-full text-left px-3 py-3 text-sm',
                      'focus:outline-none cursor-pointer',
                      'hover:bg-muted transition-colors',
                      index < filteredQueries.length - 1 && 'border-b'
                    )}
                    onClick={() => handleSelect(query)}
                                      >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{query.name}</div>
                        {query.description && (
                          <div className="text-xs mt-1 line-clamp-2">
                            {query.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 " />
                          <span className="text-xs">
                            {formatLastModified(query.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {filteredQueries.length > 0 && (
            <div className="px-3 py-2 border-t bg-background rounded-b-sm">
              <div className="text-xs ">
                {filteredQueries.length}{' '}
                {filteredQueries.length === 1 ? 'query' : 'queries'} found
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status announcement for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {isOpen &&
          `Dropdown open with ${filteredQueries.length} queries available`}
      </div>
    </div>
  )
}