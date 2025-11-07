import { ReactNode, ComponentPropsWithoutRef } from 'react'

export interface CockpitsComposerProps
  extends ComponentPropsWithoutRef<'div'> {
  /**
   * Child components to be rendered within the cockpit container
   */
  children?: ReactNode

  /**
   * Additional TailwindCSS classes for customization
   */
  className?: string

  /**
   * Whether to render as child element (shadcn/ui pattern)
   * When true, merges props with child element instead of wrapper
   */
  asChild?: boolean
}
