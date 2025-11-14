/// <reference types="../../../types/env.d.ts" />

/**
 * Monaco Editor Worker Configuration
 *
 * Utility functions for Monaco Editor worker management, supporting both
 * bundled and standalone deployment modes.
 */

/**
 * Get Monaco Editor worker based on deployment mode
 */
export const getMonacoEditorWorker = async (): Promise<Worker> => {
  return await getMonacoEditorWorkerAsync()
}

/**
 * Get Monaco Editor worker (async version for Monaco environment)
 */
export const getMonacoEditorWorkerAsync = async (): Promise<Worker> => {
  try {
    if (BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION !== '') {
      // Standalone mode: use worker from external location
      const workerPath = BLOCKETHER_FOUNDATION_DUCK_DB_LOCATION + 'editor.worker.js'
      console.log('[blockether-foundation-react] Creating standalone Monaco worker:', workerPath)

      // Validate that the worker path is properly resolved
      if (workerPath !== 'editor.worker.js') {
        return new Worker(workerPath)
      } else {
        throw new Error('Invalid Monaco worker path resolved')
      }
    } else {
      // Bundled mode: use Vite bundled worker
      console.log('[blockether-foundation-react] Using bundled Monaco worker')
      const editorWorker = await import('monaco-editor/esm/vs/editor/editor.worker?worker')
      return new editorWorker.default()
    }
  } catch (error) {
    console.error('[blockether-foundation-react] Failed to create Monaco worker:', error)
    throw error
  }
}

/**
 * Configure Monaco environment with proper worker
 */
export const configureMonacoEnvironment = (): void => {
  try {
    console.log('[blockether-foundation-react] Configuring Monaco environment...')

    // Set up Monaco environment
    self.MonacoEnvironment = {
      getWorker: async (_, __) => {
        return await getMonacoEditorWorkerAsync()
      },
    }

    console.log('[blockether-foundation-react] Monaco environment configured successfully')
  } catch (error) {
    console.error('[blockether-foundation-react] Failed to configure Monaco environment:', error)
    throw error
  }
}