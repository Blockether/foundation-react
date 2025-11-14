/**
 * Composer Component
 *
 * A tabbed component that can accept named/prebuilt sections like SQL Cockpit.
 * Shows tabs only when there are multiple cockpits for a clean interface.
 */

import { useState, ReactNode } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

/**
 * Props for Composer component
 */
export interface CockpitSection {
  /** Unique identifier for the Cockpit section */
  id: string
  /** Display name for the tab (shown only when multiple cockpits) */
  name: string
  /** React node content for this Cockpit section */
  component: ReactNode
  /** Optional icon component for the tab */
  icon?: ReactNode
  /** Whether this section is disabled */
  disabled?: boolean
}

export interface CockpitComposerProps {
  /** Array of Cockpit sections to display */
  cockpits: CockpitSection[]
  /** Initially active Cockpit ID (defaults to first Cockpit) */
  defaultActiveId?: string
  /** Callback when active Cockpit changes */
  onActiveChange?: (cockpitId: string) => void
  /** Custom class names */
  className?: string
  /** Whether to show tabs header even with single Cockpit */
  forceShowTabs?: boolean
  /** Tab orientation (horizontal or vertical) */
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Composer component that manages multiple Cockpit sections with tabs
 */
export function Composer({
  cockpits,
  defaultActiveId,
  onActiveChange,
  className,
  forceShowTabs = false,
  orientation = 'horizontal',
}: CockpitComposerProps) {
  // Validate cockpits array
  if (!cockpits || cockpits.length === 0) {
    console.warn('[blockether-foundation-react] Composer: No cockpits provided')
    return null
  }

  // Set initial active Cockpit
  const initialActiveId = defaultActiveId || cockpits[0]!.id
  const [activeCockpitId, setActiveCockpitId] = useState(initialActiveId)

  // Find the currently active Cockpit
  const activeCockpit =
    cockpits.find(c => c.id === activeCockpitId) || cockpits[0]!

  // Handle Cockpit change
  const handleCockpitChange = (CockpitId: string) => {
    if (CockpitId === activeCockpitId) return

    setActiveCockpitId(CockpitId)
    onActiveChange?.(CockpitId)
  }

  // Determine if we should show tabs
  const shouldShowTabs = forceShowTabs || cockpits.length > 1

  // Single Cockpit mode - just render the component directly
  if (!shouldShowTabs) {
    return (
      <div className={cn('h-full w-full', className)}>
        {cockpits[0]!.component}
      </div>
    )
  }

  // Multiple cockpits mode - render with tabs
  return (
    <div
      className={cn(
        'h-full w-full border-2 overflow-y-auto',
        orientation === 'vertical' ? 'flex flex-row' : 'flex flex-col',
        className
      )}
    >
      <Tabs
        value={activeCockpitId}
        onValueChange={handleCockpitChange}
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
            'p-0 mb-0 mt-0 h-auto',
            orientation === 'vertical'
              ? 'flex flex-col border-r w-[88px] min-w-[88px] max-w-[88px]'
              : 'w-full flex flex-row border-b'
          )}
        >
          {cockpits.map(cockpit => (
            <TabsTrigger
              key={cockpit.id}
              value={cockpit.id}
              disabled={cockpit.disabled}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-none transition-all',
                orientation === 'vertical'
                  ? 'border-r-[3px] border-r-transparent data-[state=active]:border-r-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md w-full justify-start'
                  : 'border-b-[3px] border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-md flex-1 justify-center',
                'text-foreground/70 hover:text-foreground data-[state=active]:text-foreground',
                'focus-visible:bg-accent focus-visible:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:text-muted-foreground'
              )}
            >
              {cockpit.icon && (
                <span className="w-4 h-4 shrink-0">{cockpit.icon}</span>
              )}
              <span className="truncate">{cockpit.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <TabsContent
          value={activeCockpitId}
          className={cn(
            'flex-1 mt-0 outline-none p-4 border-solid h-full w-full max-h-full max-w-full bg-background',
            orientation === 'vertical' ? 'border-l-0' : 'border-t-0'
          )}
        >
          <div className="h-full w-full overflow-hidden">
            {activeCockpit.component}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
