import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    define: {
        'process.env': JSON.stringify({
            NODE_ENV: 'production'
        }),
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
    },
})