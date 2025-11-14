/**
 * Global build-time constants defined via Vite's `define` option
 */

/**
 * Location prefix for DuckDB WASM files
 * - Empty string ('') in main library: uses ?url imports (externalized)
 * - Custom path ('./assets/') in standalone: loads from assets folder
 */
declare global {
  const BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION: string
}

export {}
