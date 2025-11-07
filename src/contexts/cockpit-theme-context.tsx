/**
 * Cockpit Theme Context
 *
 * Provides theme context to cockpit components, allowing them to derive
 * their theme from the outer scope rather than explicit props.
 */

import React, { createContext, useContext, useEffect, useState } from 'react'
import { CockpitThemeContextValue } from '../types/composer'

const CockpitThemeContext = createContext<CockpitThemeContextValue | undefined>(
  undefined
)

/**
 * Hook to use cockpit theme context
 */
export function useCockpitTheme(): CockpitThemeContextValue {
  const context = useContext(CockpitThemeContext)
  if (context === undefined) {
    // Default to light theme if no context is provided
    return {
      theme: 'light',
      isAuto: false,
    }
  }
  return context
}

/**
 * Cockpit Theme Provider component
 */
export function CockpitThemeProvider({
  children,
  initialTheme = 'light',
}: {
  children: React.ReactNode
  initialTheme?: 'light' | 'dark' | 'auto'
}) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(initialTheme)
  const isAuto = theme === 'auto'

  // Auto-detect theme if 'auto' is selected
  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        // Update document classes for Tailwind
        if (e.matches) {
          document.documentElement.classList.add('dark')
          document.documentElement.classList.remove('light')
        } else {
          document.documentElement.classList.add('light')
          document.documentElement.classList.remove('dark')
        }
      }

      // Initial detection
      handleChange(mediaQuery as any)

      // Listen for changes
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else {
      // Apply explicit theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      }
    }
    return undefined
  }, [theme])

  const contextValue: CockpitThemeContextValue = {
    theme,
    setTheme,
    isAuto,
  }

  return (
    <CockpitThemeContext.Provider value={contextValue}>
      {children}
    </CockpitThemeContext.Provider>
  )
}