import { createContext, useContext, ReactNode, useEffect, useState } from 'react'
import { Logger, LogLevel, LoggerConfig, DEFAULT_LOGGER_CONFIG, getGlobalLogger } from './logger'

interface LoggingContextValue {
  logger: Logger
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
  logLevel: LogLevel
  setLogLevel: (level: LogLevel) => void
}

const LoggingContext = createContext<LoggingContextValue | undefined>(undefined)

interface LoggingProviderProps {
  children: ReactNode
  config?: Partial<LoggerConfig>
}

export function LoggingProvider({ children, config = {} }: LoggingProviderProps): ReactNode {
  const [loggerConfig, setLoggerConfig] = useState<LoggerConfig>(() => ({
    ...DEFAULT_LOGGER_CONFIG,
    ...config,
  }))

  const [logger] = useState<Logger>(() => Logger.getInstance(loggerConfig))

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

  // Update global logger when config changes
  useEffect(() => {
    logger.updateConfig(loggerConfig)
  }, [loggerConfig, logger])

  const value: LoggingContextValue = {
    logger,
    isEnabled: loggerConfig.enabled,
    setEnabled,
    logLevel: loggerConfig.level,
    setLogLevel,
  }

  return (
    <LoggingContext.Provider value={value}>
      {children}
    </LoggingContext.Provider>
  )
}

export function useLogger(): Logger {
  const context = useContext(LoggingContext)
  if (!context) {
    // Fallback to global logger if no context provider
    return getGlobalLogger()
  }
  return context.logger
}

export function useLoggingConfig(): {
  isEnabled: boolean
  setEnabled: (enabled: boolean) => void
  logLevel: LogLevel
  setLogLevel: (level: LogLevel) => void
} {
  const context = useContext(LoggingContext)
  if (!context) {
    // Fallback values if no context provider
    const globalLogger = getGlobalLogger()
    const config = globalLogger.getConfig()
    return {
      isEnabled: config.enabled,
      setEnabled: () => {}, // No-op for global logger
      logLevel: config.level,
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

// Export for backward compatibility
export { LogLevel } from './logger'