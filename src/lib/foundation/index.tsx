/**
 * BlockEther Foundation React FoundationProvider
 *
 * Unified provider for theme, logging, and shadow DOM functionality.
 */

export {
  FoundationProvider,
  useTheme,
  useLogger,
  useLoggingConfig,
  useShadowDOM,
  getGlobalLogger,
  setGlobalLogger,
  type FoundationConfig,
  type Theme,
} from './context'

// Re-export logging types for convenience
export {
  Logger,
  LogLevel,
  type LoggerConfig,
} from '../logging'

// Re-export DEFAULT_LOGGER_CONFIG
export { DEFAULT_LOGGER_CONFIG } from '../logging'