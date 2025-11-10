/**
 * DuckDB Type Label System
 *
 * Defines visual representation for all DuckDB data types
 */

import React from 'react'
import { cn } from '@/lib/utils'

export type DuckDBType =
  // Numeric types
  | 'TINYINT' | 'SMALLINT' | 'INTEGER' | 'BIGINT' | 'HUGEINT'
  | 'UTINYINT' | 'USMALLINT' | 'UINTEGER' | 'UBIGINT'
  | 'FLOAT' | 'DOUBLE' | 'REAL' | 'DECIMAL' | 'NUMERIC'
  // String types
  | 'VARCHAR' | 'TEXT' | 'CHAR' | 'BPCHAR' | 'STRING'
  // Date/Time types
  | 'DATE' | 'TIMESTAMP' | 'TIMESTAMPTZ' | 'TIME' | 'TIMETZ' | 'INTERVAL'
  // Boolean
  | 'BOOLEAN' | 'BOOL'
  // Binary
  | 'BLOB' | 'BYTEA' | 'BINARY' | 'VARBINARY'
  // Structured types
  | 'ARRAY' | 'LIST' | 'STRUCT' | 'MAP' | 'UNION'
  // Special types
  | 'UUID' | 'JSON' | 'ENUM'
  // Fallback
  | string

interface TypeConfig {
  label: string
  color: string
  bgColor: string
  borderColor: string
}

const TYPE_CONFIGS: Record<string, TypeConfig> = {
  // Numeric types - blue shades
  TINYINT: { label: 'INT8', color: 'text-blue-600 dark:text-blue-200', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },
  SMALLINT: { label: 'INT16', color: 'text-blue-600 dark:text-blue-200', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },
  INTEGER: { label: 'INT32', color: 'text-blue-600 dark:text-blue-200', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },
  BIGINT: { label: 'INT64', color: 'text-blue-600 dark:text-blue-200', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },
  HUGEINT: { label: 'INT128', color: 'text-blue-600 dark:text-blue-200', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },

  // Unsigned integers
  UTINYINT: { label: 'UINT8', color: 'text-blue-600 dark:text-blue-200', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },
  USMALLINT: { label: 'UINT16', color: 'text-blue-600 dark:text-blue-200', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },
  UINTEGER: { label: 'UINT32', color: 'text-blue-600 dark:text-blue-200', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },
  UBIGINT: { label: 'UINT64', color: 'text-blue-600 dark:text-blue-200', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },

  // Floating point - cyan shades
  FLOAT: { label: 'FLOAT', color: 'text-cyan-600 dark:text-cyan-200', bgColor: 'bg-cyan-50 dark:bg-cyan-950', borderColor: 'border-cyan-200 dark:border-cyan-800' },
  DOUBLE: { label: 'DOUBLE', color: 'text-cyan-600 dark:text-cyan-200', bgColor: 'bg-cyan-50 dark:bg-cyan-950', borderColor: 'border-cyan-200 dark:border-cyan-800' },
  REAL: { label: 'REAL', color: 'text-cyan-600 dark:text-cyan-200', bgColor: 'bg-cyan-50 dark:bg-cyan-950', borderColor: 'border-cyan-200 dark:border-cyan-800' },
  DECIMAL: { label: 'DECIMAL', color: 'text-cyan-600 dark:text-cyan-200', bgColor: 'bg-cyan-50 dark:bg-cyan-950', borderColor: 'border-cyan-200 dark:border-cyan-800' },
  NUMERIC: { label: 'NUMERIC', color: 'text-cyan-600 dark:text-cyan-200', bgColor: 'bg-cyan-50 dark:bg-cyan-950', borderColor: 'border-cyan-200 dark:border-cyan-800' },

  // String types - green shades
  VARCHAR: { label: 'VARCHAR', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-200 dark:border-green-800' },
  TEXT: { label: 'TEXT', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-200 dark:border-green-800' },
  CHAR: { label: 'CHAR', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-200 dark:border-green-800' },
  BPCHAR: { label: 'CHAR', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-200 dark:border-green-800' },
  STRING: { label: 'STRING', color: 'text-green-700 dark:text-green-300', bgColor: 'bg-green-50 dark:bg-green-950', borderColor: 'border-green-200 dark:border-green-800' },

  // Date/Time types - purple shades
  DATE: { label: 'DATE', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-950', borderColor: 'border-purple-200 dark:border-purple-800' },
  TIMESTAMP: { label: 'TIMESTAMP', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-950', borderColor: 'border-purple-200 dark:border-purple-800' },
  TIMESTAMPTZ: { label: 'TIMESTAMPTZ', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-950', borderColor: 'border-purple-200 dark:border-purple-800' },
  TIME: { label: 'TIME', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-950', borderColor: 'border-purple-200 dark:border-purple-800' },
  TIMETZ: { label: 'TIMETZ', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-950', borderColor: 'border-purple-200 dark:border-purple-800' },
  INTERVAL: { label: 'INTERVAL', color: 'text-purple-700 dark:text-purple-300', bgColor: 'bg-purple-50 dark:bg-purple-950', borderColor: 'border-purple-200 dark:border-purple-800' },

  // Boolean - amber shades
  BOOLEAN: { label: 'BOOL', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-50 dark:bg-amber-950', borderColor: 'border-amber-200 dark:border-amber-800' },
  BOOL: { label: 'BOOL', color: 'text-amber-700 dark:text-amber-300', bgColor: 'bg-amber-50 dark:bg-amber-950', borderColor: 'border-amber-200 dark:border-amber-800' },

  // Binary types - slate shades
  BLOB: { label: 'BLOB', color: 'text-slate-700 dark:text-slate-300', bgColor: 'bg-slate-50 dark:bg-slate-950', borderColor: 'border-slate-200 dark:border-slate-800' },
  BYTEA: { label: 'BYTEA', color: 'text-slate-700 dark:text-slate-300', bgColor: 'bg-slate-50 dark:bg-slate-950', borderColor: 'border-slate-200 dark:border-slate-800' },
  BINARY: { label: 'BINARY', color: 'text-slate-700 dark:text-slate-300', bgColor: 'bg-slate-50 dark:bg-slate-950', borderColor: 'border-slate-200 dark:border-slate-800' },
  VARBINARY: { label: 'VARBINARY', color: 'text-slate-700 dark:text-slate-300', bgColor: 'bg-slate-50 dark:bg-slate-950', borderColor: 'border-slate-200 dark:border-slate-800' },

  // Structured types - indigo shades
  ARRAY: { label: 'ARRAY', color: 'text-indigo-700 dark:text-indigo-300', bgColor: 'bg-indigo-50 dark:bg-indigo-950', borderColor: 'border-indigo-200 dark:border-indigo-800' },
  LIST: { label: 'LIST', color: 'text-indigo-700 dark:text-indigo-300', bgColor: 'bg-indigo-50 dark:bg-indigo-950', borderColor: 'border-indigo-200 dark:border-indigo-800' },
  STRUCT: { label: 'STRUCT', color: 'text-indigo-700 dark:text-indigo-300', bgColor: 'bg-indigo-50 dark:bg-indigo-950', borderColor: 'border-indigo-200 dark:border-indigo-800' },
  MAP: { label: 'MAP', color: 'text-indigo-700 dark:text-indigo-300', bgColor: 'bg-indigo-50 dark:bg-indigo-950', borderColor: 'border-indigo-200 dark:border-indigo-800' },
  UNION: { label: 'UNION', color: 'text-indigo-700 dark:text-indigo-300', bgColor: 'bg-indigo-50 dark:bg-indigo-950', borderColor: 'border-indigo-200 dark:border-indigo-800' },

  // Special types - rose shades
  UUID: { label: 'UUID', color: 'text-rose-700 dark:text-rose-300', bgColor: 'bg-rose-50 dark:bg-rose-950', borderColor: 'border-rose-200 dark:border-rose-800' },
  JSON: { label: 'JSON', color: 'text-rose-700 dark:text-rose-300', bgColor: 'bg-rose-50 dark:bg-rose-950', borderColor: 'border-rose-200 dark:border-rose-800' },
  ENUM: { label: 'ENUM', color: 'text-rose-700 dark:text-rose-300', bgColor: 'bg-rose-50 dark:bg-rose-950', borderColor: 'border-rose-200 dark:border-rose-800' },

  // Generic types - used when specific DuckDB type isn't available
  NUMBER: { label: 'NUMBER', color: 'text-blue-600 dark:text-blue-200', bgColor: 'bg-blue-50 dark:bg-blue-950', borderColor: 'border-blue-200 dark:border-blue-800' },
}

/**
 * Normalize type name to match our config keys
 */
function normalizeType(type: string): string {
  return type.toUpperCase().trim()
}

/**
 * Get configuration for a data type
 */
export function getTypeConfig(type: string): TypeConfig {
  const normalized = normalizeType(type)
  return TYPE_CONFIGS[normalized] || {
    label: normalized,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-border',
  }
}

/**
 * Type Badge Component
 */
interface TypeBadgeProps {
  type: string
  nullable?: boolean | undefined
  className?: string
}

export function TypeBadge({ type, nullable, className }: TypeBadgeProps): React.ReactNode {
  const config = getTypeConfig(type)

  const tooltipText = nullable
    ? `Type: ${type} - This column can contain NULL values (missing/empty data)`
    : `Type: ${type}`

  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 text-xs font-mono rounded border',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
      title={tooltipText}
    >
      {config.label}{nullable && '?'}
    </span>
  )
}

/**
 * Column Header with Type Info
 */
interface ColumnHeaderProps {
  name: string
  type: string
  nullable?: boolean
}

export function ColumnHeader({ name, type, nullable }: ColumnHeaderProps): React.ReactNode {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-medium">{name}</span>
      <TypeBadge type={type} nullable={nullable} />
    </div>
  )
}
