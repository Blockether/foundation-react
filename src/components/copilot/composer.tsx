/**
 * CopilotComposer Component
 *
 * A tabbed component that can accept named/prebuilt sections like SQL Cockpit.
 * Shows tabs only when there are multiple copilots for a clean interface.
 */

import { useState, ReactNode } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

/**
 * Props for CopilotComposer component
 */
export interface CopilotSection {
  /** Unique identifier for the copilot section */
  id: string
  /** Display name for the tab (shown only when multiple copilots) */
  name: string
  /** React node content for this copilot section */
  component: ReactNode
  /** Optional icon component for the tab */
  icon?: ReactNode
  /** Whether this section is disabled */
  disabled?: boolean
}

export interface CopilotComposerProps {
  /** Array of copilot sections to display */
  copilots: CopilotSection[]
  /** Initially active copilot ID (defaults to first copilot) */
  defaultActiveId?: string
  /** Callback when active copilot changes */
  onActiveChange?: (copilotId: string) => void
  /** Custom class names */
  className?: string
  /** Whether to show tabs header even with single copilot */
  forceShowTabs?: boolean
  /** Tab orientation (horizontal or vertical) */
  orientation?: 'horizontal' | 'vertical'
}

/**
 * CopilotComposer component that manages multiple copilot sections with tabs
 */
export function CopilotComposer({
  copilots,
  defaultActiveId,
  onActiveChange,
  className,
  forceShowTabs = false,
  orientation = 'horizontal',
}: CopilotComposerProps) {
  // Validate copilots array
  if (!copilots || copilots.length === 0) {
    console.warn('CopilotComposer: No copilots provided')
    return null
  }

  // Set initial active copilot
  const initialActiveId = defaultActiveId || copilots[0]!.id
  const [activeCopilotId, setActiveCopilotId] = useState(initialActiveId)

  // Find the currently active copilot
  const activeCopilot = copilots.find(c => c.id === activeCopilotId) || copilots[0]!

  // Handle copilot change
  const handleCopilotChange = (copilotId: string) => {
    if (copilotId === activeCopilotId) return

    setActiveCopilotId(copilotId)
    onActiveChange?.(copilotId)
  }

  // Determine if we should show tabs
  const shouldShowTabs = forceShowTabs || copilots.length > 1

  // Single copilot mode - just render the component directly
  if (!shouldShowTabs) {
    return (
      <div className={cn('h-full w-full', className)}>
        {copilots[0]!.component}
      </div>
    )
  }

  // Multiple copilots mode - render with tabs
  return (
    <div
      className={cn(
        'h-full w-full',
        orientation === 'vertical' ? 'flex flex-row' : 'flex flex-col',
        className
      )}
    >
      <Tabs
        value={activeCopilotId}
        onValueChange={handleCopilotChange}
        orientation={orientation}
        className={cn(
          'flex gap-0',
          orientation === 'vertical' ? 'flex-row' : 'flex-col',
          'flex-1'
        )}
      >
        {/* Tab Headers */}
        <TabsList
          className={cn(
            'bg-transparent p-0 mb-0 mt-0 h-auto',
            orientation === 'vertical'
              ? 'flex flex-col border-r border-border w-[88px] min-w-[88px] max-w-[88px]'
              : 'w-full flex flex-row border-b border-border'
          )}
        >
          {copilots.map((copilot) => (
            <TabsTrigger
              key={copilot.id}
              value={copilot.id}
              disabled={copilot.disabled}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-none transition-all',
                orientation === 'vertical'
                  ? 'border-r-[3px] border-r-transparent data-[state=active]:border-r-primary data-[state=active]:bg-background data-[state=active]:shadow-md w-full justify-start'
                  : 'border-b-[3px] border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-background data-[state=active]:shadow-md flex-1 justify-center',
                'cursor-pointer hover:bg-muted/50',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:text-muted-foreground'
              )}
            >
              {copilot.icon && (
                <span className="w-4 h-4 flex-shrink-0">
                  {copilot.icon}
                </span>
              )}
              <span className="truncate">{copilot.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <TabsContent
          value={activeCopilotId}
          className={cn(
            'flex-1 mt-0 outline-none p-4 border-2 border-solid border-border h-full w-full max-h-full max-w-full',
            orientation === 'vertical' ? 'border-l-0' : 'border-t-0'
          )}
        >
          <div className="h-full w-full overflow-hidden">
            {activeCopilot.component}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

