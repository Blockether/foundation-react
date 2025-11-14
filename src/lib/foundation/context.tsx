import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { Logger, LogLevel, LoggerConfig, DEFAULT_LOGGER_CONFIG } from '../logging'

export type Theme = 'dark' | 'light' | 'system'

export interface FoundationConfig {
  // Theme configuration
  defaultTheme?: Theme

  // Logging configuration
  logging?: Partial<LoggerConfig>

  // Shadow DOM configuration
  container?: HTMLElement | ShadowRoot | null
}

interface FoundationContextValue {
  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void

  // Logging
  logger: Logger
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
  logLevel: LogLevel
  setLogLevel: (level: LogLevel) => void

  // Shadow DOM
  container: HTMLElement | ShadowRoot | null
}

const FoundationContext = createContext<FoundationContextValue | undefined>(undefined)

interface FoundationProviderProps {
  children: ReactNode
  config?: FoundationConfig
}

export function FoundationProvider({ children, config = {} }: FoundationProviderProps): ReactNode {
  // Theme state
  const [theme, setTheme] = useState<Theme>(config.defaultTheme || 'system')

  // Logging state
  const [loggerConfig, setLoggerConfig] = useState<LoggerConfig>(() => ({
    ...DEFAULT_LOGGER_CONFIG,
    ...config.logging,
  }))
  const [logger] = useState<Logger>(() => {
    const instance = new Logger(loggerConfig)
    // Update global logger for non-React usage
    if (typeof window !== 'undefined') {
      (window as any).__FOUNDATION_GLOBAL_LOGGER__ = instance
    }
    return instance
  })

  // Shadow DOM state
  const container = config.container || null

  // Theme effects
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  // Logging effects
  const setEnabled = (enabled: boolean): void => {
    const newConfig = { ...loggerConfig, enabled }
    setLoggerConfig(newConfig)
    logger.updateConfig({ enabled })
  }

  const setLogLevel = (level: LogLevel): void => {
    const newConfig = { ...loggerConfig, level }
    setLoggerConfig(newConfig)
    logger.updateConfig({ level })
  }

  // Update logger when config changes
  useEffect(() => {
    logger.updateConfig(loggerConfig)
  }, [loggerConfig, logger])

  const value: FoundationContextValue = {
    // Theme
    theme,
    setTheme,

    // Logging
    logger,
    isEnabled: loggerConfig.enabled,
    setEnabled,
    logLevel: loggerConfig.level,
    setLogLevel,

    // Shadow DOM
    container,
  }

  return (
    <FoundationContext.Provider value={value}>
      {children}
    </FoundationContext.Provider>
  )
}

export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void } {
  const context = useContext(FoundationContext)
  if (!context) {
    throw new Error('useTheme must be used within a FoundationProvider')
  }
  return {
    theme: context.theme,
    setTheme: context.setTheme,
  }
}

export function useLogger(): Logger {
  const context = useContext(FoundationContext)
  if (!context) {
    // Fallback to global logger if no context provider
    if (typeof window !== 'undefined' && (window as any).__FOUNDATION_GLOBAL_LOGGER__) {
      return (window as any).__FOUNDATION_GLOBAL_LOGGER__
    }
    // Create minimal fallback logger
    return new Logger(DEFAULT_LOGGER_CONFIG)
  }
  return context.logger
}

export function useLoggingConfig(): {
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
  logLevel: LogLevel
  setLogLevel: (level: LogLevel) => void
} {
  const context = useContext(FoundationContext)
  if (!context) {
    // Fallback values if no context provider
    return {
      isEnabled: DEFAULT_LOGGER_CONFIG.enabled,
      setEnabled: () => {}, // No-op for global logger
      logLevel: DEFAULT_LOGGER_CONFIG.level,
      setLogLevel: () => {}, // No-op for global logger
    }
  }
  return {
    isEnabled: context.isEnabled,
    setEnabled: context.setEnabled,
    logLevel: context.logLevel,
    setLogLevel: context.setLogLevel,
  }
}

export function useShadowDOM(): { container: HTMLElement | ShadowRoot | null } {
  const context = useContext(FoundationContext)
  return {
    container: context?.container || null,
  }
}

// Global logger getter for non-React usage
export const getGlobalLogger = (): Logger => {
  if (typeof window !== 'undefined' && (window as any).__FOUNDATION_GLOBAL_LOGGER__) {
    return (window as any).__FOUNDATION_GLOBAL_LOGGER__
  }
  return new Logger(DEFAULT_LOGGER_CONFIG)
}

export const setGlobalLogger = (config: Partial<LoggerConfig>): void => {
  const logger = new Logger({ ...DEFAULT_LOGGER_CONFIG, ...config })
  if (typeof window !== 'undefined') {
    (window as any).__FOUNDATION_GLOBAL_LOGGER__ = logger
  }
}