/**
 * Storybook stories for Composer component
 *
 * These stories demonstrate the composer pattern with automatic theme derivation
 * and optional SQL sections.
 */

import type { Meta, StoryObj, DecoratorFunction } from '@storybook/react'
import React, { useEffect } from 'react'
import {
  Composer
} from '../src/components/foundation/composer'

// Mock saved queries
const mockSavedQueries = [
  {
    id: '1',
    name: 'Active Users',
    query: 'SELECT * FROM users WHERE active = true;',
    description: 'Get all active users',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'User Count by Status',
    query: 'SELECT active, COUNT(*) as count FROM users GROUP BY active;',
    description: 'Count users by activation status',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
  },
]

const meta: Meta<typeof Composer> = {
  title: 'Composer',
  component: Composer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Composer with automatic theme context and SQL sections.',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'Light',
          value: '#ffffff',
        },
        {
          name: 'Dark',
          value: '#2d2d30',
        },
      ],
    },
  },
  argTypes: {
    theme: {
      control: 'select',
      options: ['light', 'dark', 'auto'],
      description: 'Theme for all nested components (automatically derived by child components)',
    },
    layout: {
      control: 'select',
      options: ['vertical', 'horizontal', 'grid'],
      description: 'Layout direction for sections',
    },
    showSectionHeaders: {
      control: 'boolean',
      description: 'Whether to show section headers',
    },
    allowReordering: {
      control: 'boolean',
      description: 'Whether sections can be reordered',
    },
    allowResizing: {
      control: 'boolean',
      description: 'Whether sections can be resized',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  decorators: [
    ((Story: any, context: any) => {
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
            padding: '16px',
            minHeight: '100vh',
            backgroundColor: theme === 'dark' ? '#2d2d30' : '#ffffff',
          }}
        >
          <Story />
        </div>
      )
    }) as DecoratorFunction,
  ],
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
  initialGlobals: {
    theme: 'light',
    backgrounds: {
      value: 'light',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

// Basic story with SQL section
export const Default: Story = {
  args: {
    theme: 'light',
    layout: 'vertical',
    sections: [
      {
        type: 'sql',
        enabled: true,
        title: 'SQL Query Interface',
        collapsible: false,
        props: {
          initialQuery: 'SELECT * FROM users LIMIT 10;',
          showHelp: true,
        },
      },
    ],
  },
}

// SQL Composer (using raw Composer)
export const SQLComposerStory: Story = {
  render: (args: any) => {
    const [currentQuery, setCurrentQuery] = React.useState('SELECT id, name, email, active FROM users WHERE active = true ORDER BY created_at DESC;')

    const handleSavedQuerySelect = (query: any) => {
      console.log('Story: handleSavedQuerySelect called with:', query)
      setCurrentQuery(query.query)
    }

    return (
      <Composer
        {...args}
        sections={[
          {
            type: 'sql',
            enabled: true,
            title: 'SQL Database Explorer',
            collapsible: true,
            props: {
              initialQuery: currentQuery,
              savedQueries: mockSavedQueries,
              onSavedQuerySelect: handleSavedQuerySelect,
              showHelp: true,
            },
          },
        ]}
      />
    )
  },
  args: {
    theme: 'light',
    layout: 'vertical',
  },
}

// Dark theme story
export const DarkTheme: Story = {
  args: {
    theme: 'dark',
    layout: 'vertical',
    sections: [
      {
        type: 'sql',
        enabled: true,
        title: 'SQL Query Interface - Dark Theme',
        props: {
          initialQuery: `-- Advanced SQL query with CTEs
WITH user_stats AS (
  SELECT
    user_id,
    COUNT(*) as query_count,
    AVG(execution_time) as avg_time
  FROM query_log
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY user_id
)
SELECT
  u.username,
  u.email,
  s.query_count,
  ROUND(s.avg_time, 2) as avg_execution_time
FROM users u
JOIN user_stats s ON u.id = s.user_id
WHERE u.active = true
ORDER BY s.query_count DESC;`,
          showHelp: true,
          showLineNumbers: true,
        },
      },
    ],
  },
}

// Auto theme story
export const AutoTheme: Story = {
  args: {
    theme: 'auto',
    layout: 'vertical',
    sections: [
      {
        type: 'sql',
        enabled: true,
        title: 'Auto-Detecting Theme',
        props: {
          initialQuery: 'SELECT CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP;',
          showHelp: true,
        },
      },
    ],
  },
}

// Horizontal layout
export const HorizontalLayout: Story = {
  args: {
    theme: 'light',
    layout: 'horizontal',
    sections: [
      {
        type: 'sql',
        enabled: true,
        title: 'Query Editor',
        props: {
          initialQuery: 'SELECT * FROM users;',
        },
      },
    ],
  },
}

// Grid layout with multiple SQL sections
export const GridLayout: Story = {
  args: {
    theme: 'light',
    layout: 'grid',
    sections: [
      {
        type: 'sql',
        enabled: true,
        title: 'User Queries',
        props: {
          initialQuery: 'SELECT COUNT(*) as total_users FROM users;',
          editorMinHeight: '200px',
        },
      },
      {
        type: 'sql',
        enabled: true,
        title: 'Analytics',
        props: {
          initialQuery: 'SELECT status, COUNT(*) FROM users GROUP BY status;',
          editorMinHeight: '200px',
        },
      },
    ],
  },
}

// With custom header and footer
export const WithHeaderFooter: Story = {
  args: {
    theme: 'light',
    layout: 'vertical',
    header: (
      <div className="text-center p-4 bg-muted/50 border-b">
        <h2 className="text-2xl font-bold text-foreground">SQL Cockpit Interface</h2>
        <p className="text-muted-foreground mt-2">Professional SQL query interface with automatic theme detection</p>
      </div>
    ),
    footer: (
      <div className="text-center p-4 bg-muted/50 border-t">
        <p className="text-sm text-muted-foreground">
          Powered by DuckDB-WASM • Theme automatically derived from context
        </p>
      </div>
    ),
    sections: [
      {
        type: 'sql',
        enabled: true,
        title: 'SQL Query Editor',
        props: {
          initialQuery: 'SELECT * FROM sample_data LIMIT 100;',
          showHelp: true,
        },
      },
    ],
  },
}

// Complex multi-section setup
export const ComplexSetup: Story = {
  args: {
    theme: 'dark',
    layout: 'vertical',
    showSectionHeaders: true,
    sections: [
      {
        type: 'sql',
        enabled: true,
        title: 'Data Explorer',
        collapsible: true,
        collapsed: false,
        props: {
          initialQuery: 'SELECT table_name FROM information_schema.tables WHERE table_schema = main;',
          savedQueries: mockSavedQueries,
          showHelp: true,
          editorMinHeight: '250px',
        },
      },
    ],
  },
}

// Responsive story
export const Responsive: Story = {
  args: {
    theme: 'auto',
    layout: 'vertical',
    sections: [
      {
        type: 'sql',
        enabled: true,
        title: 'Responsive SQL Interface',
        props: {
          initialQuery: 'SELECT * FROM users WHERE created_at >= CURRENT_DATE - 30;',
          showHelp: true,
        },
      },
    ],
  },
  parameters: {
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1200px',
            height: '800px',
          },
        },
      },
    },
  },
}

// Empty composer (showing it works without sections)
export const EmptyComposer: Story = {
  args: {
    theme: 'light',
    layout: 'vertical',
    header: (
      <div className="text-center p-8">
        <h3 className="text-lg font-semibold text-foreground mb-2">Empty Cockpit Composer</h3>
        <p className="text-muted-foreground">
          This composer has no SQL sections configured. Add sections via the 'sections' prop.
        </p>
      </div>
    ),
  },
}