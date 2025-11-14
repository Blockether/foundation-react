import type { Preview } from '@storybook/react-vite'
import { FoundationProvider, type Theme } from '../src/lib/foundation'

// Import the main CSS file for styling
import '../src/styles/globals.css'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      toc: true,
    },
    backgrounds: {
      options: {}
    },
  },

  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const { theme } = context.globals

      return (
        <div className='p-2'>
          <FoundationProvider config={{ defaultTheme: theme }}>
            <Story />
          </FoundationProvider>
        </div>
      )
    },
  ],

  initialGlobals: {
    theme: 'light',
    backgrounds: {
      value: 'light'
    }
  }
}

export default preview