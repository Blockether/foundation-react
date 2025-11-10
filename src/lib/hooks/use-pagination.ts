/**
 * usePagination Hook
 *
 * Custom hook for handling pagination state and logic
 */

import { useState, useMemo } from 'react'

interface UsePaginationProps {
  totalItems: number
  itemsPerPage?: number
  enablePagination?: boolean
  paginationThreshold?: number
}

interface UsePaginationReturn<T> {
  currentPage: number
  totalPages: number
  itemsPerPage: number
  isPaginationEnabled: boolean
  setCurrentPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  getPaginatedData: (data: T[]) => T[]
  startIndex: number
  endIndex: number
}

/**
 * Hook to handle pagination logic
 *
 * @param totalItems - Total number of items
 * @param itemsPerPage - Number of items to show per page (default: 100)
 * @param enablePagination - Force enable/disable pagination (default: auto based on threshold)
 * @param paginationThreshold - Enable pagination when items exceed this number (default: 1024)
 * @returns Pagination state and helper functions
 */
export function usePagination<T = unknown>({
  totalItems,
  itemsPerPage = 100,
  enablePagination,
  paginationThreshold = 1024,
}: UsePaginationProps): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1)

  // Determine if pagination should be enabled
  const isPaginationEnabled = useMemo(() => {
    if (enablePagination !== undefined) return enablePagination
    return totalItems > paginationThreshold
  }, [enablePagination, totalItems, paginationThreshold])

  // Calculate total pages
  const totalPages = useMemo(() => {
    if (!isPaginationEnabled) return 1
    return Math.ceil(totalItems / itemsPerPage)
  }, [isPaginationEnabled, totalItems, itemsPerPage])

  // Calculate start and end indices
  const startIndex = useMemo(() => {
    if (!isPaginationEnabled) return 0
    return (currentPage - 1) * itemsPerPage
  }, [isPaginationEnabled, currentPage, itemsPerPage])

  const endIndex = useMemo(() => {
    if (!isPaginationEnabled) return totalItems
    return Math.min(startIndex + itemsPerPage, totalItems)
  }, [isPaginationEnabled, startIndex, itemsPerPage, totalItems])

  // Navigation functions
  const nextPage = (): void => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  const prevPage = (): void => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  // Get paginated data
  const getPaginatedData = (data: T[]): T[] => {
    if (!isPaginationEnabled) return data
    return data.slice(startIndex, endIndex)
  }

  // Reset to page 1 when total items changes significantly
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    isPaginationEnabled,
    setCurrentPage,
    nextPage,
    prevPage,
    getPaginatedData,
    startIndex,
    endIndex,
  }
}
