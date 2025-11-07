import type { Preview } from '@storybook/react-vite'
import { useEffect } from 'react'

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
      default: 'light',
      values: {
        light: {
          name: 'Light',
          value: '#ffffff',
        },
        dark: {
          name: 'Dark',
          value: '#2d2d30',
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
      const { theme } = context.globals

      useEffect(() => {
        // Apply theme class to document element for Tailwind dark: variants
        const documentElement = document.documentElement
        if (theme === 'dark') {
          documentElement.classList.add('dark')
          documentElement.classList.remove('light')
        } else {
          documentElement.classList.add('light')
          documentElement.classList.remove('dark')
        }

        // Also update color scheme
        documentElement.style.colorScheme = theme === 'dark' ? 'dark' : 'light'

        // Store in localStorage for persistence
        localStorage.setItem('theme', theme)
      }, [theme])

      return (
        <div
          className={`${theme === 'dark' ? 'dark' : 'light'}`}
          style={{
            padding: '8px',
            minHeight: '100vh',
            backgroundColor: theme === 'dark' ? '#2d2d30' : '#ffffff',
          }}
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