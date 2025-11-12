import type { Preview } from '@storybook/react-vite'
import { useEffect } from 'react'
import { ThemeProvider, useTheme, type Theme } from '../src/components/theme'

// Import the main CSS file for styling
import '../src/styles/globals.css'

const StoryThemeProviderWrapper = ({ children, theme }: { children: React.ReactNode; theme: Theme }) => {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(theme)
  }, [theme, setTheme])

  return <>{children}</>
}

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

      return (
        <div className='p-2'>
          <ThemeProvider defaultTheme={theme}>
            <StoryThemeProviderWrapper theme={theme}>
              <Story />
            </StoryThemeProviderWrapper>
          </ThemeProvider>
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