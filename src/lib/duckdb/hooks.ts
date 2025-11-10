import { AsyncDuckDB, AsyncDuckDBConnection } from "@duckdb/duckdb-wasm";

import { getDuckDB, isLoaded } from "./init";
import { useEffect } from "react";
import React from "react";
import { DuckDBConnectionState, DuckDBLoadingState, DuckDBQueryState } from "./types";

/**
 * React hook to access a singleton DuckDb instance within components or other hooks.
 */
export const useDuckDB = (): {
    db: AsyncDuckDB | undefined;
    state: DuckDBLoadingState;
    error: Error | undefined;
} => {
    const [db, setDb] = React.useState<AsyncDuckDB | undefined>(undefined);
    const [state, setState] = React.useState<DuckDBLoadingState>(isLoaded() ? DuckDBLoadingState.DuckDBLoaded : DuckDBLoadingState.DuckDBLoading);
    const [error, setError] = React.useState<Error | undefined>(undefined);

    useEffect(() => {
        const fetchDB = async () => {
            try {
                const db = await getDuckDB();
                setDb(db);
                setState(DuckDBLoadingState.DuckDBLoaded);
            } catch (error) {
                setError(error instanceof Error ? error : new Error(String(error)));
                setState(DuckDBLoadingState.DuckDBError);
            }
        };
        fetchDB();
    }, []);

    return { db, state, error };
};

export const useDuckDBConnection = (db: AsyncDuckDB | undefined): {
    connection: AsyncDuckDBConnection | undefined;
    state: DuckDBConnectionState;
    close: () => Promise<void>;
} => {
    const [connection, setConnection] = React.useState<AsyncDuckDBConnection | undefined>(undefined);
    const [state, setState] = React.useState<DuckDBConnectionState>(DuckDBConnectionState.ConnectionClosed);

    const close = React.useCallback(async () => {
        if (connection) {
            await connection.close?.();
            setConnection(undefined);
            setState(DuckDBConnectionState.ConnectionClosed);
        };
    }, [connection]);

    useEffect(() => {
        if (!db) {
            console.log("No DB instance available, closing connection if any.");
            close();
            return;
        }
        let activeConnection: AsyncDuckDBConnection | undefined;

        const createConnection = async () => {
            const conn = await db.connect();
            activeConnection = conn;
            setConnection(conn);
            setState(DuckDBConnectionState.ConnectionOpen);
        };

        createConnection();

        return () => {
            setConnection(undefined);
            if (activeConnection) {
                void activeConnection.close?.();
            }
        };
    }, [db]);

    return {
        connection,
        state,
        close
    }
}

export const useDuckDBQuery = (
    connection: AsyncDuckDBConnection | undefined,
    query: string,

): {
    result: any[] | undefined;
    state: DuckDBQueryState;
    error: Error | undefined;
    cancel: () => void;
} => {
    const [state, setState] = React.useState<DuckDBQueryState>(isLoaded() ? DuckDBQueryState.QueryIdle : DuckDBQueryState.QueryDBNotStarted);
    const [result, setResult] = React.useState<any[] | undefined>(undefined);
    const [error, setError] = React.useState<Error | undefined>(undefined);

    const cancel = React.useCallback(async () => {
        if (!connection) {
            return
        }
        setState(DuckDBQueryState.QueryInterrupting);
        await connection.cancelSent();
        setState(DuckDBQueryState.QueryIdle);
    }, [connection]);

    useEffect(() => {
        if (!connection) {
            setState(DuckDBQueryState.QueryDBNotStarted);
            return;
        }

        const executeQuery = async () => {
            setState(DuckDBQueryState.QueryRunning);
            try {
                const res = await connection.query(query);
                setResult(res.toArray());
                setState(DuckDBQueryState.QueryCompleted);

            } catch (error) {
                setError(error instanceof Error ? error : new Error(String(error)));
                setState(DuckDBQueryState.QueryError);
            }
        };

        executeQuery();
    }, [connection, query]);

    return { result, state, error, cancel };
};