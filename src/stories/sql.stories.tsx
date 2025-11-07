/**
 * Storybook stories for Composer component
 *
 * These stories demonstrate the composer pattern with automatic theme derivation
 * and optional SQL sections.
 */

import { SQLCockpit } from '@/components/sql/cockpit'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

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

const meta: Meta<typeof SQLCockpit> = {
  title: 'Composer',
  component: SQLCockpit,
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
  argTypes: {}
}

export default meta
type Story = StoryObj<typeof meta>

// SQL Composer (using raw Composer)
export const Default: Story = {
  render: (args: any) => {
    return (
      <SQLCockpit
        initialQuery={'SELECT id, name, email, active FROM users WHERE active = true ORDER BY created_at DESC;'}
        savedQueries={mockSavedQueries}
      />
    )
  }
}
