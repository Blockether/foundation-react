/**
 * Composer Component
 *
 * This component serves as the primary container for cockpit sections,
 * providing theme context and layout management for nested components.
 */

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/utils'
import { Card } from '../ui/card'
import {
  ComposerProps,
  SectionConfig,
  SQLSectionConfig
} from '../../types/composer'
import { SQLCockpit } from './sql/cockpit'
import { CockpitThemeProvider, useCockpitTheme } from '../../contexts/cockpit-theme-context'
import type { ReactNode, ComponentPropsWithoutRef } from 'react'

/**
 * Renders a specific cockpit section based on its configuration
 */
function Section({
  config,
  onThemeChange,
}: {
  config: SectionConfig
  onThemeChange?: (theme: 'light' | 'dark' | 'auto') => void
}) {
  if (!config.enabled) return null

  const sectionId = `section-${config.type}-${React.useId()}`

  switch (config.type) {
    case 'sql':
      return (
        <div
          id={sectionId}
          className={cn(
            'section',
            config.collapsible && 'collapsible',
            config.collapsed && 'collapsed'
          )}
        >
          <SQLCockpit
            {...(config as SQLSectionConfig).props}
            {...(onThemeChange ? { onThemeChange } : {})}
            {...((config as SQLSectionConfig).props?.onThemeChange ? { onThemeChange: (config as SQLSectionConfig).props!.onThemeChange } : {})}
          />
        </div>
      )

    default:
      return (
        <div id={sectionId} className="section">
          <div className="p-4 border border-dashed border-muted rounded-lg">
            <p className="text-muted-foreground text-center">
              Unknown section type: {config.type}
            </p>
          </div>
        </div>
      )
  }
}

/**
 * Composer with theme context and section management
 */
export const Composer = React.forwardRef<
  HTMLDivElement,
  ComposerProps
>(({
  sections = [],
  theme = 'light',
  showSectionHeaders = true,
  layout = 'vertical',
  header,
  footer,
  children,
  className,
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : Card

  // Auto-create SQL section if none provided but children exist
  const resolvedSections = React.useMemo(() => {
    if (sections.length === 0 && React.Children.count(children) > 0) {
      // Assume children contain SQL cockpit if no sections specified
      const hasSQLContent = React.Children.toArray(children).some(child =>
        React.isValidElement(child) &&
        ((child.type as any)?.name === 'SQLCockpit' ||
        (React.isValidElement(child) && (child.props as any)?.className?.includes('sql-cockpit')))
      )

      if (hasSQLContent) {
        return [{
          type: 'sql' as const,
          enabled: true,
          collapsible: false,
          collapsed: false,
        }]
      }
    }
    return sections
  }, [sections, children])

  const layoutClasses = React.useMemo(() => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-row gap-4'
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 gap-4'
      case 'vertical':
      default:
        return 'flex flex-col gap-4'
    }
  }, [layout])

  return (
    <CockpitThemeProvider initialTheme={theme}>
      <ComposerContent
        ref={ref}
        Comp={Comp}
        layoutClasses={layoutClasses}
        sections={resolvedSections}
        showSectionHeaders={showSectionHeaders}
        header={header}
        footer={footer}
        children={children}
        className={className}
        {...props}
      />
    </CockpitThemeProvider>
  )
})

/**
 * Inner component that can access theme context
 */
const ComposerContent = React.forwardRef<
  HTMLDivElement,
  {
    Comp: React.ComponentType<any>
    layoutClasses: string
    sections: SectionConfig[]
    showSectionHeaders: boolean
    header?: ReactNode
    footer?: ReactNode
    children?: ReactNode
  } & ComponentPropsWithoutRef<'div'>
>(({
  Comp,
  layoutClasses,
  sections,
  showSectionHeaders,
  header,
  footer,
  children,
  className,
  ...props
}, ref) => {
  // Access theme context for theme switching
  const { setTheme } = useCockpitTheme()

  const handleThemeChange = React.useCallback((newTheme: 'light' | 'dark' | 'auto') => {
    if (setTheme) {
      setTheme(newTheme)
    }
  }, [setTheme])

  return (
    <Comp
      ref={ref}
      className={cn(
        // Core responsive behavior - inherit parent width
        'w-full',
        // Layout classes
        layoutClasses,
        // Custom styling through className prop
        className
      )}
      {...props}
    >
      {/* Custom Header */}
      {header && (
        <div className="composer-header border-b pb-4 mb-4">
          {header}
        </div>
      )}

      {/* Sections */}
      <div className="composer-sections">
        {sections.map((config, index) => (
          <div key={`${config.type}-${index}`}>
            {showSectionHeaders && config.title && (
              <div className="section-header mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {config.title}
                </h3>
              </div>
            )}
            <Section config={config} onThemeChange={handleThemeChange} />
          </div>
        ))}

        {/* Render children if no sections defined */}
        {sections.length === 0 && (
          <div className="composer-children">
            {children}
          </div>
        )}
      </div>

      {/* Custom Footer */}
      {footer && (
        <div className="composer-footer border-t pt-4 mt-4">
          {footer}
        </div>
      )}
    </Comp>
  )
})

ComposerContent.displayName = 'ComposerContent'

Composer.displayName = 'Composer'