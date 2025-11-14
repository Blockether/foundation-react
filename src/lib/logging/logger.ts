/**
 * BlockEther Foundation React Logger
 *
 * Centralized logging system with conditional logging support and consistent formatting.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  prefix: string
}

class Logger {
  private config: LoggerConfig
  private static instance: Logger | null = null

  constructor(config: LoggerConfig) {
    this.config = config
  }

  static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      if (!config) {
        throw new Error('Logger config required for first initialization')
      }
      Logger.instance = new Logger(config)
    }
    return Logger.instance
  }

  static resetInstance(): void {
    Logger.instance = null
  }

  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  getConfig(): LoggerConfig {
    return { ...this.config }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && level >= this.config.level
  }

  private formatMessage(level: string, message: string, ...args: any[]): [string, ...any[]] {
    const timestamp = new Date().toISOString()
    const levelStr = level.padEnd(5)
    return [`[${timestamp}] ${this.config.prefix} ${levelStr} ${message}`, ...args]
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('DEBUG', message, ...args)
      console.log(formattedMessage, ...formattedArgs)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('INFO', message, ...args)
      console.log(formattedMessage, ...formattedArgs)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('WARN', message, ...args)
      console.warn(formattedMessage, ...formattedArgs)
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const [formattedMessage, ...formattedArgs] = this.formatMessage('ERROR', message, ...args)
      console.error(formattedMessage, ...formattedArgs)
    }
  }

  // Legacy methods for backward compatibility
  log(message: string, ...args: any[]): void {
    this.info(message, ...args)
  }

  // Performance logging
  startTimer(label: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.debug(`${label} completed in ${duration.toFixed(2)}ms`)
    }
  }

  logElapsedTime(label: string, start: number, end?: number): void {
    const duration = (end || performance.now()) - start
    this.info(`${label}: ${duration.toFixed(2)}ms`)
  }
}

// Default logger configuration
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  enabled: true,
  level: LogLevel.INFO,
  prefix: '[blockether-foundation-react]',
}

// Global logger instance for non-React usage
let globalLogger: Logger | null = null

export const getGlobalLogger = (): Logger => {
  if (!globalLogger) {
    globalLogger = Logger.getInstance(DEFAULT_LOGGER_CONFIG)
  }
  return globalLogger
}

export const setGlobalLogger = (config: Partial<LoggerConfig>): void => {
  globalLogger = Logger.getInstance({ ...DEFAULT_LOGGER_CONFIG, ...config })
}

// Export Logger class for external usage
export { Logger }