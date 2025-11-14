/// <reference types="../../../types/env.d.ts" />
import { AsyncDuckDB, DuckDBConfig, selectBundle, ConsoleLogger } from '@duckdb/duckdb-wasm'
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


const duckdbBundles = async () => {
  try {
    console.log('[blockether-foundation-react] Loading DuckDB bundles...')

    const [duckdb_wasm, mvp_worker, duckdb_wasm_next, eh_worker] =
      await Promise.all([
        import('@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'),
        import('@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url'),
        import('@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'),
        import('@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url'),
      ])

    console.log('[blockether-foundation-react] DuckDB bundles loaded successfully')

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
  } catch (error) {
    console.error('[blockether-foundation-react] Failed to load DuckDB bundles:', error)
    throw error
  }
}

const MVP_MODULE = (BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION !== '' && BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION + 'duckdb-mvp.wasm') || 'unknown';
const MVP_WORKER = (BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION !== '' && BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION + 'duckdb-browser-mvp.worker.js') || 'unknown';
const EH_MODULE = (BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION !== '' && BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION + 'duckdb-eh.wasm') || 'unknown';
const EH_WORKER = (BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION !== '' && BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION + 'duckdb-browser-eh.worker.js') || 'unknown';

const bundleResolver = BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION !== '' ?
  (
    async () => {
      try {
        console.log('[blockether-foundation-react] Standalone DuckDB paths:', {
          BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION,
          MVP_MODULE,
          MVP_WORKER,
          EH_MODULE,
          EH_WORKER
        });

        // Validate that all modules are properly resolved
        if (MVP_MODULE === 'unknown' || MVP_WORKER === 'unknown' ||
          EH_MODULE === 'unknown' || EH_WORKER === 'unknown') {
          throw new Error('Invalid DuckDB bundle paths: one or more modules resolved to "unknown"')
        }

        const bundles = {
          mvp: { mainModule: MVP_MODULE, mainWorker: MVP_WORKER },
          eh: { mainModule: EH_MODULE, mainWorker: EH_WORKER },
        };

        console.log('[blockether-foundation-react] Standalone bundles:', bundles);
        return bundles;
      } catch (error) {
        console.error('[blockether-foundation-react] Failed to resolve standalone DuckDB bundles:', error)

        // Re-throw with more descriptive error message
        if (error instanceof Error) {
          throw new Error(`Failed to resolve standalone DuckDB bundles: ${error.message}`)
        } else {
          throw new Error('Failed to resolve standalone DuckDB bundles: Unknown error')
        }
      }
    }
  ) : duckdbBundles


/**
 * Initialize DuckGlobalDatabaseHandle with a browser-specific Wasm bundle.
 */
const _initializeDuckDb = async (
  config?: DuckDBConfig
): Promise<AsyncDuckDB> => {
  const start = performance.now()

  try {
    console.log('[blockether-foundation-react] Initializing DuckDB...')

    // Select a bundle based on browser checks
    const bundles = await bundleResolver()

    // Select a bundle based on browser checks
    const bundle = await selectBundle(bundles)

    if (!bundle.mainWorker) {
      throw new Error('No suitable DuckDB WASM bundle found for this browser.')
    }

    console.log('[blockether-foundation-react] Selected DuckDB bundle:', {
      mainModule: bundle.mainModule,
      mainWorker: bundle.mainWorker
    })

    // Instantiate the asynchronus version of DuckDB-wasm
    const worker = new Worker(bundle.mainWorker)
    const logger = new ConsoleLogger()
    const db = new AsyncDuckDB(logger, worker)

    console.log('[blockether-foundation-react] Instantiating DuckDB database...')
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
    console.log('[blockether-foundation-react] DuckDB database instantiated successfully')

    if (config) {
      if (config.path) {
        console.log('[blockether-foundation-react] Loading database file:', config.path)
        const res = await fetch(config.path)
        if (!res.ok) {
          throw new Error(`Failed to fetch database file: ${res.status} ${res.statusText}`)
        }
        const buffer = await res.arrayBuffer()
        const fileNameMatch = config.path.match(/[^/]*$/)
        if (fileNameMatch) {
          config.path = fileNameMatch[0]
        }
        await db.registerFileBuffer(config.path, new Uint8Array(buffer))
        console.log('[blockether-foundation-react] Database file loaded successfully')
      }
      console.log('[blockether-foundation-react] Opening database with config...')
      await db.open(config)
      console.log('[blockether-foundation-react] Database opened successfully')
    }

    logElapsedTime('DuckDB initialized', start)
    if (config) {
      console.debug(`[blockether-foundation-react] DuckDbConfig: ${JSON.stringify(config, null, 2)}`)
    }

    return db
  } catch (error) {
    console.error('[blockether-foundation-react] Failed to initialize DuckDB:', error)

    // Re-throw with more descriptive error message
    if (error instanceof Error) {
      throw new Error(`DuckDB initialization failed: ${error.message}`)
    } else {
      throw new Error('DuckDB initialization failed: Unknown error')
    }
  }
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
