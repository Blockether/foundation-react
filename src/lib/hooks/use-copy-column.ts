/**
 * useCopyColumn Hook
 *
 * Custom hook for copying column data to clipboard with visual feedback
 */

import { useState } from 'react'

interface UseCopyColumnReturn {
  copiedColumn: string | null
  copyColumn: (
    columnName: string,
    data: Array<Record<string, unknown>>
  ) => Promise<void>
}

/**
 * Hook to handle copying column data to clipboard
 *
 * @returns Object containing copiedColumn state and copyColumn function
 */
export function useCopyColumn(): UseCopyColumnReturn {
  const [copiedColumn, setCopiedColumn] = useState<string | null>(null)

  const copyColumn = async (
    columnName: string,
    data: Array<Record<string, unknown>>
  ): Promise<void> => {
    // Extract all values for this column
    const columnValues = data.map(row => {
      const value = row[columnName]
      if (value === null || value === undefined) return 'NULL'
      return String(value)
    })

    // Join with newlines for easy paste into spreadsheets
    const columnText = columnValues.join('\n')

    try {
      await navigator.clipboard.writeText(columnText)
      setCopiedColumn(columnName)
      setTimeout(() => setCopiedColumn(null), 2000)
    } catch (err) {
      console.error('[blockether-foundation-react] Failed to copy column:', err)
    }
  }

  return {
    copiedColumn,
    copyColumn,
  }
}
