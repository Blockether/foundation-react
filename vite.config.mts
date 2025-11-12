import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*'],
      exclude: ['src/**/*.test.*', 'src/**/*.spec.*'],
      rollupTypes: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/lib': resolve(__dirname, './src/lib'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/types': resolve(__dirname, './src/types'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'BlocketherFoundationReact',
      formats: ['es'], // ESM-only as required by constitution
      fileName: 'foundation-react',
    },
    cssCodeSplit: false, // Bundle all CSS into one file
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@duckdb/duckdb-wasm',
        '@monaco-editor/react',
        'recharts',
        'apache-arrow',
        'tokenlens',
        'use-stick-to-bottom',
        'nanoid',
        'embla-carousel-react',
        'cmdk',
        'motion',
        'sonner',
        'streamdown'

      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'foundation-react.css'
          }
          return assetInfo.name || 'assets/[name][extname]'
        },
      },
    },
    // Optimize for browser distribution
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true,
    emptyOutDir: true,
  },
  // Configure Monaco Editor worker handling
  optimizeDeps: {
    exclude: ['@monaco-editor/react'],
  },
  server: {
    fs: {
      // Ensure Monaco Editor workers can be served
      allow: ['..'],
    },
  },
  define: {
    // Enable Monaco Editor features for browser
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
})