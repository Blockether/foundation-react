import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { PluginOption } from 'vite'

export default defineConfig({
    plugins: [
        react() as PluginOption,
        tailwindcss() as PluginOption,
        viteStaticCopy({
            targets: [
                {
                    src: 'index.html',
                    dest: '.'
                },
                {
                    src: 'node_modules/@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm',
                    dest: 'assets'
                },
                {
                    src: 'node_modules/@duckdb/duckdb-wasm/dist/duckdb-eh.wasm',
                    dest: 'assets'
                },
                {
                    src: 'node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js',
                    dest: 'assets'
                },
                {
                    src: 'node_modules/@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js',
                    dest: 'assets'
                }
            ]
        })
    ],
    define: {
        'process.env': JSON.stringify({
            NODE_ENV: 'production'
        }),
        BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION: JSON.stringify('/assets/')
    },
    build: {
        // Lib mode for proper ES module exports
        lib: {
            entry: './wrapper.tsx',
            formats: ['es'],
            fileName: () => 'foundation-wrapper.standalone.js',
        },
        target: 'es2020',
        minify: 'esbuild',
        sourcemap: false,
        rollupOptions: {
            output: {
                chunkFileNames: 'chunks/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash][extname]',
                // Don't use manualChunks in lib mode - it causes circular dependencies
                // Let Vite handle chunking automatically
            },
        }
    }
})