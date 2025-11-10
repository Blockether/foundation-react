type JSONPrimitive = string | number | boolean | null;

type JSONValue =
    | JSONPrimitive
    | readonly JSONValue[]
    | {
        [key: string]: JSONValue;
    };

export type JSONObject = Record<string, JSONValue>;

export const ARROW_MIME_TYPE = "application/vnd.apache.arrow.file";
export const CSV_MIME_TYPE = "text/csv";
export const PARQUET_MIME_TYPE = "application/vnd.apache.parquet";
export const JSON_MIME_TYPE = "application/json";
export enum DuckDBLoadingState {
    DuckDBLoading,
    DuckDBLoaded,
    DuckDBError,
}

export enum DuckDBQueryState {
    QueryDBNotStarted,
    QueryIdle,
    QueryRunning,
    QueryCompleted,
    QueryError,
    QueryInterrupting
}

export enum DuckDBConnectionState {
    ConnectionClosed,
    ConnectionOpen,
}