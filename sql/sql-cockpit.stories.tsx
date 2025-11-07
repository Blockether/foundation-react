/**
 * Storybook stories for SQL Cockpit component
 *
 * These stories demonstrate different variants and states of the SQL Cockpit component.
 * They should FAIL before implementation and PASS after implementation.
 */

import type { Meta, StoryObj } from '@storybook/react'
import React, { useEffect } from 'react'
import { SQLCockpit } from '../../src/components/foundation/sql/cockpit'

// Mock DuckDB results
const mockQueryResult = {
  data: [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice@example.com',
      active: true,
      created_at: '2023-01-15T10:30:00Z',
    },
    {
      id: 2,
      name: 'Bob Smith',
      email: 'bob@example.com',
      active: false,
      created_at: '2023-01-16T14:20:00Z',
    },
    {
      id: 3,
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      active: true,
      created_at: '2023-01-17T09:15:00Z',
    },
  ],
  columns: [
    { name: 'id', type: 'number' as const, nullable: false },
    { name: 'name', type: 'string' as const, nullable: false },
    { name: 'email', type: 'string' as const, nullable: true },
    { name: 'active', type: 'boolean' as const, nullable: false },
    { name: 'created_at', type: 'date' as const, nullable: false },
  ],
  executionTime: 125,
}

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
  {
    id: '3',
    name: 'Recent Users',
    query:
      "SELECT * FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';",
    description: 'Get users created in last 30 days',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
  },
]

const meta: Meta<typeof SQLCockpit> = {
  title: 'SQL/SQLCockpit',
  component: SQLCockpit,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A comprehensive SQL query interface with Monaco Editor integration and DuckDB-WASM support.',
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
    initialQuery: {
      control: 'text',
      description: 'Default SQL query to populate in the editor',
    },

    placeholder: {
      control: 'text',
      description: 'Placeholder text for empty editor',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    savedQueries: {
      control: 'object',
      description: 'List of saved queries',
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// Basic story with default configuration
export const Default: Story = {}

// Story with initial query
export const WithInitialQuery: Story = {
  args: {
    initialQuery:
      'SELECT id, name, email, active FROM users WHERE active = true ORDER BY created_at DESC;',
  },
}

// Story with saved queries
export const WithSavedQueries: Story = {
  args: {
    savedQueries: mockSavedQueries,
  },
}

// Story with custom help content
export const WithCustomHelp: Story = {
  args: {
    helpContent: (
      <div style={{ padding: '16px' }}>
        <h3>SQL Help</h3>
        <p>Use this SQL editor to write and execute queries against DuckDB.</p>
        <h4>Basic Commands:</h4>
        <ul>
          <li>
            <code>SELECT</code> - Retrieve data
          </li>
          <li>
            <code>INSERT</code> - Add data
          </li>
          <li>
            <code>UPDATE</code> - Modify data
          </li>
          <li>
            <code>DELETE</code> - Remove data
          </li>
        </ul>
        <h4>Keyboard Shortcuts:</h4>
        <ul>
          <li>
            <kbd>Ctrl</kbd> + <kbd>Enter</kbd> - Run query
          </li>
          <li>
            <kbd>Ctrl</kbd> + <kbd>S</kbd> - Format query
          </li>
          <li>
            <kbd>Ctrl</kbd> + <kbd>/</kbd> - Toggle comment
          </li>
        </ul>
      </div>
    ),
    showHelp: true,
  },
}

// Read-only mode story
export const ReadOnly: Story = {
  args: {
    readOnly: true,
    initialQuery:
      "-- This is a read-only SQL example\nSELECT user_id, username, email, created_at\nFROM users\nWHERE status = 'active'\nORDER BY created_at DESC\nLIMIT 10;",
  },
}

// Read-only mode in dark theme
export const ReadOnlyDark: Story = {
  args: {
    readOnly: true,
    initialQuery:
      "-- This is a read-only SQL example\nSELECT user_id, username, email, created_at\nFROM users\nWHERE status = 'active'\nORDER BY created_at DESC\nLIMIT 10;",
  },
  globals: {
    theme: 'dark',
    backgrounds: {
      value: 'dark',
    },
  },
}

// Responsive story
export const Responsive: Story = {
  args: {
    initialQuery: 'SELECT id, name, email FROM users;',
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

// Advanced SQL query with CTEs and joins
export const AdvancedQuery: Story = {
  args: {
    initialQuery: `WITH user_stats AS (
  SELECT
    user_id,
    COUNT(*) as query_count,
    AVG(execution_time) as avg_time,
    MAX(execution_time) as max_time
  FROM query_log
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY user_id
)
SELECT
  u.username,
  u.email,
  s.query_count,
  ROUND(s.avg_time, 2) as avg_execution_time,
  ROUND(s.max_time, 2) as max_execution_time,
  CASE
    WHEN s.query_count > 100 THEN 'Power User'
    WHEN s.query_count > 50 THEN 'Active User'
    WHEN s.query_count > 10 THEN 'Regular User'
    ELSE 'Light User'
  END as user_category
FROM users u
JOIN user_stats s ON u.id = s.user_id
WHERE u.active = true
ORDER BY s.query_count DESC, s.avg_time ASC;`,
  }
}
