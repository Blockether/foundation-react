import type { Preview } from '@storybook/react-vite'

// Import the CSS files for styling
import '../src/styles/variables.css'
import '../src/styles/components.css'

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
      options: {
        light: {
          name: 'light',
          value: '#ffffff',
        },

        dark: {
          name: 'dark',
          value: '#333333',
        }
      }
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
      // Set the theme attribute on the root element for CSS variable switching
      const theme = context.globals.theme || 'light'

      return (
        <div
          style={{ padding: '1rem', minHeight: '100vh' }}
          data-theme={theme}
        >
          <Story />
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