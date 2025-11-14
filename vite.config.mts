import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer';

const withReport = ['true', '1', 'yes'].some(val => process.env.BUNDLE_SIZE_VISUALIZAION === val)

const plugins = [
  tailwindcss() as PluginOption,
  react() as PluginOption,
  dts({
    insertTypesEntry: true,
    include: ['src/**/*'],
    exclude: ['src/**/*.test.*', 'src/**/*.spec.*', 'examples/**'],
    rollupTypes: true,
  }) as PluginOption
]

if (withReport) {
  plugins.push(
    visualizer({
      template: "sunburst", // or sunburst
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: "size-analysis.html", // will be saved in project's root
    })
  )
}

const externals = [
  'react',
  'react-dom',
  '@duckdb/duckdb-wasm',
  '@monaco-editor/react',
  'recharts',
  'tokenlens',
  'sql-formatter',
  'use-stick-to-bottom',
  'nanoid',
  'embla-carousel-react',
  'cmdk',
  'motion',
  'apache-arrow',
  'sonner',
  'streamdown',
  'monaco-editor'
]

export default defineConfig({
  plugins: plugins,
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
      external: (id) => externals.includes(id) || id.includes('.worker') || id.startsWith('@duckdb/duckdb-wasm/dist/duckdb-') && id.endsWith('?url'),
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
    sourcemap: false,
    emptyOutDir: true,
  },
  // Configure Monaco Editor worker handling
  optimizeDeps: {
    exclude: ['@monaco-editor/react', 'monaco-editor', '@duckdb/duckdb-wasm', 'sql-formatter', 'apache-arrow'],
  }
})