/**
 * Sonner Toast Component
 *
 * A wrapper around Sonner toast notifications that integrates with the theme system.
 */

import { useTheme } from '@/lib/foundation'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()
  const resolvedTheme = (theme || 'system') as 'light' | 'dark' | 'system'

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            'group toast !rounded-none group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton:
            'group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:hover:group-[.toast]:bg-muted',
          success:
            '!bg-green-50 !text-green-900 !border-green-200 dark:!bg-green-950 dark:!text-green-100 dark:!border-green-800',
          error:
            '!bg-red-50 !text-red-900 !border-red-200 dark:!bg-red-950 dark:!text-red-100 dark:!border-red-800',
          info: '!bg-blue-50 !text-blue-900 !border-blue-200 dark:!bg-blue-950 dark:!text-blue-100 dark:!border-blue-800',
          warning:
            '!bg-yellow-50 !text-yellow-900 !border-yellow-200 dark:!bg-yellow-950 dark:!text-yellow-100 dark:!border-yellow-800',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
