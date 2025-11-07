/**
 * Composer types
 *
 * These interfaces define the composer that can contain
 * optional sections and provide theme context to nested components.
 */

import { ReactNode, ComponentPropsWithoutRef } from 'react'

/**
 * Available section types
 */
export type SectionType = 'sql' | 'chart' | 'table' | 'form'

/**
 * Base interface for all section configurations
 */
export interface SectionConfig {
  /**
   * Type identifier for the section
   */
  type: SectionType

  /**
   * Whether the section is enabled/visible
   */
  enabled: boolean

  /**
   * Optional custom title for the section
   */
  title?: string

  /**
   * Whether the section can be collapsed
   */
  collapsible?: boolean

  /**
   * Initial collapsed state
   */
  collapsed?: boolean
}

/**
 * SQL section configuration
 */
export interface SQLSectionConfig extends SectionConfig {
  type: 'sql'
  /**
   * SQL section specific props
   */
  props?: {
    initialQuery?: string
    onQueryExecute?: (query: string) => Promise<any>
    readOnly?: boolean
    showLineNumbers?: boolean
    placeholder?: string
    className?: string
    savedQueries?: any[]
    onSavedQuerySelect?: (query: any) => void
    showHelp?: boolean
    helpContent?: React.ReactNode
    editorMinHeight?: string
    children?: React.ReactNode
    /**
     * Callback when theme changes within this section
     */
    onThemeChange?: (theme: 'light' | 'dark' | 'auto') => void
  }
}

/**
 * Union type for all possible section configurations
 */
export type SectionConfigUnion = SQLSectionConfig

/**
 * Composer interface
 */
export interface ComposerProps
  extends ComponentPropsWithoutRef<'div'> {
  /**
   * Sections to render
   */
  sections?: SectionConfigUnion[]

  /**
   * Theme for all nested components
   */
  theme?: 'light' | 'dark' | 'auto'

  /**
   * Whether to show section headers
   */
  showSectionHeaders?: boolean

  /**
   * Whether sections can be reordered
   */
  allowReordering?: boolean

  /**
   * Whether sections can be resized
   */
  allowResizing?: boolean

  /**
   * Layout direction for sections
   */
  layout?: 'vertical' | 'horizontal' | 'grid'

  /**
   * Custom header content
   */
  header?: ReactNode

  /**
   * Custom footer content
   */
  footer?: ReactNode

  /**
   * Child components to be rendered within the composer
   */
  children?: ReactNode

  /**
   * Additional TailwindCSS classes for customization
   */
  className?: string

  /**
   * Whether to render as child element (shadcn/ui pattern)
   */
  asChild?: boolean
}

/**
 * Theme context value interface
 */
export interface CockpitThemeContextValue {
  /**
   * Current theme
   */
  theme: 'light' | 'dark' | 'auto'

  /**
   * Function to update theme
   */
  setTheme?: (theme: 'light' | 'dark' | 'auto') => void

  /**
   * Whether theme is auto-detected
   */
  isAuto?: boolean
}

/**
 * SQL Composer convenience type
 */
export type SQLComposerProps = Omit<
  ComposerProps,
  'sections'
> & {
  /**
   * SQL section configuration
   */
  sqlConfig?: Omit<SQLSectionConfig, 'type' | 'enabled'>
}