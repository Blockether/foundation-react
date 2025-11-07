/**
 * Mock for @duckdb/duckdb-wasm
 *
 * This mock provides a lightweight implementation of DuckDB-WASM for testing
 * without loading the actual WebAssembly binaries which are heavy and require
 * specific browser environments.
 */

// Mock DuckDB connection
export class MockDuckDBConnection {
  async query(query: string): Promise<any> {
    // Mock query result based on query type
    const upperQuery = query.toUpperCase().trim();

    if (upperQuery.startsWith('SELECT')) {
      return new MockQueryResult([
        { id: 1, name: 'Test User 1', email: 'test1@example.com' },
        { id: 2, name: 'Test User 2', email: 'test2@example.com' },
      ], [
        { name: 'id', type: 'INTEGER', nullable: false },
        { name: 'name', type: 'VARCHAR', nullable: false },
        { name: 'email', type: 'VARCHAR', nullable: true },
      ]);
    }

    if (upperQuery.startsWith('INSERT')) {
      return new MockQueryResult([], [], 1);
    }

    if (upperQuery.startsWith('UPDATE')) {
      return new MockQueryResult([], [], 2);
    }

    if (upperQuery.startsWith('DELETE')) {
      return new MockQueryResult([], [], 1);
    }

    // Default result
    return new MockQueryResult([], []);
  }

  async close(): Promise<void> {
    // Mock close operation
  }

  async registerBuffer(): Promise<void> {
    // Mock buffer registration
  }

  async registerFile(): Promise<void> {
    // Mock file registration
  }

  async insertCSVFromPath(): Promise<void> {
    // Mock CSV insertion
  }

  async insertJSONFromPath(): Promise<void> {
    // Mock JSON insertion
  }
}

// Mock QueryResult
class MockQueryResult {
  constructor(
    private data: any[],
    private schema: any[],
    private rowCount?: number
  ) {}

  get schema() {
    return {
      fields: this.schema.map((field: any) => ({
        name: field.name,
        type: { toString: () => field.type },
        nullable: field.nullable,
      })),
    };
  }

  toArray(): any[] {
    return this.data;
  }

  get num_rows(): number {
    return this.rowCount || this.data.length;
  }
}

// Mock DuckDB instance
export class MockDuckDB {
  private connections: MockDuckDBConnection[] = [];

  async connect(): Promise<MockDuckDBConnection> {
    const connection = new MockDuckDBConnection();
    this.connections.push(connection);
    return connection;
  }

  async registerFileText(): Promise<void> {
    // Mock file text registration
  }

  async registerFileBuffer(): Promise<void> {
    // Mock file buffer registration
  }

  async open(): Promise<void> {
    // Mock database open
  }

  async close(): Promise<void> {
    // Close all connections
    for (const connection of this.connections) {
      await connection.close();
    }
    this.connections = [];
  }

  async reset(): Promise<void> {
    // Mock database reset
  }

  async instantiate(): Promise<void> {
    // Mock WebAssembly instantiation
  }

  get dropFiles(): string[] {
    return [];
  }

  get version(): string {
    return '0.9.2-mock';
  }
}

// Mock database functions
export async function createDuckDB(options?: any): Promise<MockDuckDB> {
  return new MockDuckDB();
}

export async function selectBundle(bundles: any): Promise<any> {
  return bundles.mvp || bundles[Object.keys(bundles)[0]];
}

export const DuckDBWorker = MockDuckDB;

// Mock WebAssembly support
export const isWebAssemblySupported = true;
export const isCrossOriginEnabled = false;
export const isSharedArrayBufferSupported = true;

// Mock logger
export const DuckDBLogger = {
  info: (...args: any[]) => console.log('[DuckDB]', ...args),
  warn: (...args: any[]) => console.warn('[DuckDB]', ...args),
  error: (...args: any[]) => console.error('[DuckDB]', ...args),
  debug: (...args: any[]) => console.debug('[DuckDB]', ...args),
};

// Mock configuration
export const DEFAULT_BUNDLES = {
  mvp: {
    mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm',
    mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/duckdb-node-mvp.worker.js',
  },
  eh: {
    mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/duckdb-eh.wasm',
    mainWorker: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/duckdb-node-eh.worker.js',
  },
};

// Mock status types
export const DuckDBConnectionStatus = {
  UNINITIALIZED: 'UNINITIALIZED',
  CONNECTING: 'CONNECTING',
  CONNECTED: 'CONNECTED',
  ERROR: 'ERROR',
  CLOSED: 'CLOSED',
} as const;

export type DuckDBConnectionStatusType = typeof DuckDBConnectionStatus[keyof typeof DuckDBConnectionStatus];

// Mock error types
export class DuckDBError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'DuckDBError';
  }
}

// Export default mock
export default {
  createDuckDB,
  selectBundle,
  DuckDBWorker,
  DuckDBLogger,
  DEFAULT_BUNDLES,
  DuckDBConnectionStatus,
  DuckDBError,
  isWebAssemblySupported,
  isCrossOriginEnabled,
  isSharedArrayBufferSupported,
};