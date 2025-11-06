import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(js|jsx|mjs|ts|tsx|mdx)'],
  addons: ['@storybook/addon-docs'],

  // Configure static directories
  staticDirs: ['./dataset'],

  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },

  viteFinal: async (config) => {
    return mergeConfig(config, {
      define: {
        global: 'globalThis',
      },
      optimizeDeps: {
        include: ['react', 'react-dom'],
      },
    })
  }
}

export default config