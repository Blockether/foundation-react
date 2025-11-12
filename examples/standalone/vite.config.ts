import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    build: {
        // Lib mode for browser <script> usage
        lib: {
            entry: './wrapper.tsx',
            name: 'AIInsights',                    // window.AIInsights
            fileName: () => 'foundation-wrapper.standalone.js',
            formats: ['iife']                      // or ['umd']
        },
        target: 'es2019',
        minify: 'esbuild',
        sourcemap: false,
        rollupOptions: {
            // Option 1: bundle everything (remove external)
            // Option 2: keep React external and use CDN/script tags
            //   external: ['react', 'react-dom'],
            output: {
                // globals: {
                //   react: 'React',
                //   'react-dom': 'ReactDOM'
                // }
            }
        }
    },
    define: {
        'process.env.NODE_ENV': JSON.stringify('production')
    }
})