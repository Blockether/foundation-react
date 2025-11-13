import * as duckdb from '@duckdb/duckdb-wasm'
import { AsyncDuckDB, DuckDBConfig } from '@duckdb/duckdb-wasm'
import { getPerformanceNow, logElapsedTime } from './perf'

let GlobalDatabaseHandle: Promise<AsyncDuckDB> | undefined

/**
 * Initialize DuckDB, ensuring we only initialize it once.
 *
 * @param debug If true, log DuckDB logs and elapsed times to the console.
 * @param config An optional DuckDBConfig object.
 */
export default async function initializeDuckDb(options?: {
  debug?: boolean
  config?: DuckDBConfig
}): Promise<AsyncDuckDB> {
  const { debug, config } = options || {}
  const start = getPerformanceNow()
  debug && logElapsedTime('initializeDuckDb', start)

  if (GlobalDatabaseHandle === undefined) {
    GlobalDatabaseHandle = _initializeDuckDb(config)
  }
  const end = getPerformanceNow()

  debug && logElapsedTime('initializeDuckDb finished', start, end)

  return GlobalDatabaseHandle
}

/**
 * Get DuckDB bundles using dynamic imports for code splitting
 */
const getDuckDBBundles = async () => {
  const [duckdb_wasm, mvp_worker, duckdb_wasm_next, eh_worker] =
    await Promise.all([
      import('@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'),
      import('@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url'),
      import('@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'),
      import('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url'),
    ])

  return {
    mvp: {
      mainModule: duckdb_wasm.default,
      mainWorker: mvp_worker.default,
    },
    eh: {
      mainModule: duckdb_wasm_next.default,
      mainWorker: eh_worker.default,
    },
  }
}

/**
 * Initialize DuckGlobalDatabaseHandle with a browser-specific Wasm bundle.
 */
const _initializeDuckDb = async (
  config?: DuckDBConfig
): Promise<AsyncDuckDB> => {
  const start = performance.now()

  const bundles = await getDuckDBBundles()

  // Select a bundle based on browser checks
  const bundle = await duckdb.selectBundle(bundles)

  if (!bundle.mainWorker) {
    throw new Error('No suitable DuckDB WASM bundle found for this browser.')
  }

  // Instantiate the asynchronus version of DuckDB-wasm
  const worker = new Worker(bundle.mainWorker)
  const logger = new duckdb.ConsoleLogger()
  const db = new duckdb.AsyncDuckDB(logger, worker)
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker)

  if (config) {
    if (config.path) {
      const res = await fetch(config.path)
      const buffer = await res.arrayBuffer()
      const fileNameMatch = config.path.match(/[^/]*$/)
      if (fileNameMatch) {
        config.path = fileNameMatch[0]
      }
      await db.registerFileBuffer(config.path, new Uint8Array(buffer))
    }
    await db.open(config)
  }

  logElapsedTime('DuckDB initialized', start)
  if (config) {
    console.debug(`DuckDbConfig: ${JSON.stringify(config, null, 2)}`)
  }

  return db
}

/**
 * Get the instance of DuckDB, initializing it if needed.
 *
 * Typically `useDuckDB` is used in React components instead, but this
 * method provides access outside of React contexts.
 */
export const getDuckDB = async (): Promise<AsyncDuckDB> => {
  if (GlobalDatabaseHandle) {
    return GlobalDatabaseHandle
  } else {
    return await initializeDuckDb()
  }
}

export const isLoaded = (): boolean => {
  return GlobalDatabaseHandle !== undefined
}
