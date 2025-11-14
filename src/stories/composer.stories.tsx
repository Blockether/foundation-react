// ===== COPILOT COMPOSER STORIES =====
// These stories are focused on Cockpit Composer tabbed interface functionality

import { Composer } from '@/components/cockpit/composer'
import { SQLCockpit } from '@/components/cockpit/sql/cockpit'
import {
  MessageSquare,
  FileText,
  BarChart3,
  Database,
  TrendingUp,
  Target,
  Activity,
} from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { InsightsQuery, QueryResult } from '@/types/sql'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart3 as BarChartIcon } from 'lucide-react'

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
]

// Mock insights queries
const mockinsightQueries: InsightsQuery[] = [
  {
    id: 'summary-stats',
    name: 'Summary Statistics',
    description: 'Get basic statistical summary of the data',
    query: 'SELECT COUNT(*) as total_rows FROM users;',
    icon: '📊',
    category: 'summary',
    renderer: (result: QueryResult) => {
      const totalRows = (result.data[0]?.total_rows as number) || 0
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5" />
              Summary Statistics
            </CardTitle>
            <CardDescription>
              Basic statistical overview of the dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalRows.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {Math.round(totalRows * 0.7).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Est. Active Records
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {result.columns.length}
                </div>
                <div className="text-sm text-muted-foreground">Columns</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
  },
  {
    id: 'data-profiling',
    name: 'Data Profiling',
    description: 'Analyze data quality and completeness',
    query:
      "SELECT \n  'id' as column_name, COUNT(*) as total_count, COUNT(DISTINCT id) as unique_count\nFROM users\nUNION ALL\nSELECT \n  'name' as column_name, COUNT(*) as total_count, COUNT(DISTINCT name) as unique_count\nFROM users\nWHERE name IS NOT NULL;",
    icon: '🔍',
    category: 'validation' as const,
    targetCategories: ['table' as const, 'view' as const],
    renderer: (result: QueryResult) => {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Data Quality Analysis
            </CardTitle>
            <CardDescription>
              Data completeness and uniqueness profiling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.data.map((row: any, index) => {
                const completeness = (
                  (row.unique_count / row.total_count) *
                  100
                ).toFixed(1)
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{row.column_name}</span>
                      <Badge
                        variant={
                          parseInt(completeness) > 90 ? 'default' : 'secondary'
                        }
                      >
                        {completeness}% Complete
                      </Badge>
                    </div>
                    <Progress
                      value={parseFloat(completeness)}
                      className="h-2"
                    />
                    <div className="text-xs text-muted-foreground">
                      {row.unique_count.toLocaleString()} unique values out of{' '}
                      {row.total_count.toLocaleString()} total
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )
    },
  },
  {
    id: 'top-values',
    name: 'Top Values',
    description: 'Find most frequent values in columns',
    query:
      'SELECT name, COUNT(*) as frequency FROM users WHERE name IS NOT NULL GROUP BY name ORDER BY frequency DESC LIMIT 10;',
    icon: '🏆',
    category: 'insights' as const,
    targetTables: ['users', 'products'],
    renderer: (result: QueryResult) => {
      const maxFrequency = Math.max(
        ...result.data.map((row: any) => row.frequency as number)
      )
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Values Analysis
            </CardTitle>
            <CardDescription>
              Most frequent values in the dataset
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.data.map((row: any, index) => {
                const percentage = (
                  (row.frequency / maxFrequency) *
                  100
                ).toFixed(1)
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{row.name}</span>
                      <Badge variant="outline">
                        {row.frequency.toLocaleString()} ({percentage}%)
                      </Badge>
                    </div>
                    <Progress value={parseFloat(percentage)} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )
    },
  },
  {
    id: 'data-distribution',
    name: 'Data Distribution',
    description: 'Analyze data distribution patterns',
    query:
      "SELECT \n  CASE \n    WHEN id % 2 = 0 THEN 'Even'\n    ELSE 'Odd'\n  END as id_pattern,\n  COUNT(*) as count\nFROM users \nGROUP BY id_pattern \nORDER BY count DESC;",
    icon: '📈',
    category: 'pattern' as const,
    targetCategories: ['table' as const],
    renderer: (result: QueryResult) => {
      const totalCount = result.data.reduce(
        (sum, row: any) => sum + row.count,
        0
      )
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Data Distribution Patterns
            </CardTitle>
            <CardDescription>
              Analysis of data distribution patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.data.map((row: any, index) => {
                const percentage = ((row.count / totalCount) * 100).toFixed(1)
                return (
                  <div
                    key={index}
                    className="text-center p-4 rounded-lg border"
                  >
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {row.id_pattern}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {row.count.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {percentage}% of total
                    </div>
                    <Progress
                      value={parseFloat(percentage)}
                      className="mt-2 h-1"
                    />
                  </div>
                )
              })}
            </div>
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div className="text-sm text-muted-foreground">
                Total records analyzed:{' '}
                <span className="font-semibold">
                  {totalCount.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    },
  },
]

// Mock data sources with actual data URLs
const mockDataSources = [
  {
    id: '1',
    name: 'Users Table',
    type: 'url' as const,
    tableName: 'users',
    description: 'User account information',
    url: '/.storybook/dataset/users.csv', // This will be loaded automatically
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Products CSV',
    type: 'url' as const,
    tableName: 'products',
    description: 'Product catalog data',
    url: '/.storybook/dataset/products.csv', // This will be loaded automatically
    createdAt: new Date('2023-01-15'),
    file: {
      name: 'products.csv',
      size: 813,
      type: 'text/csv',
    },
  },
  {
    id: '3',
    name: 'Orders Data',
    type: 'url' as const,
    tableName: 'orders',
    description: 'Order transaction data',
    url: '/.storybook/dataset/orders.csv', // This will be loaded automatically
    createdAt: new Date('2023-02-01'),
  },
]

const meta: Meta<typeof Composer> = {
  title: 'Cockpit Composer',
  component: Composer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A tabbed component that displays tabs only when there are multiple cockpits. Each Cockpit can be a named/prebuilt section like SQL Cockpit.',
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
    viewport: {
      viewports: {
        fullscreen: {
          name: 'Fullscreen',
          styles: {
            width: '100vw',
            height: '100vh',
          },
        },
      },
      defaultViewport: 'fullscreen',
    },
  },
  argTypes: {
    cockpits: {
      description: 'Array of Cockpit sections to display',
      control: 'object',
    },
    defaultActiveId: {
      description: 'Initially active Cockpit ID',
      control: 'text',
    },
    forceShowTabs: {
      description: 'Show tabs even with single Cockpit',
      control: 'boolean',
    },
    orientation: {
      description: 'Tab orientation',
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Composer>

// Default - Single Cockpit - No tabs shown
export const Default: Story = {
  render: () => {
    const cockpits = [
      {
        id: 'sql',
        name: 'SQL Cockpit',
        component: (
          <SQLCockpit
            initialQuery="SELECT * FROM users LIMIT 10;"
            savedQueries={mockSavedQueries}
            insightQueries={mockinsightQueries}
            initialDataSources={mockDataSources}
          />
        ),
        icon: <Database className="w-4 h-4" />,
      },
    ]

    return (
      <div className="h-screen">
        <Composer cockpits={cockpits} />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Default Cockpit Composer showing a single SQL Cockpit. With a single Cockpit, no tabs are shown. The component renders directly for a clean interface.',
      },
    },
  },
}

// Multiple cockpits - Tabs shown
export const Multiplecockpits: Story = {
  render: () => {
    const cockpits = [
      {
        id: 'sql',
        name: 'SQL Cockpit',
        component: (
          <SQLCockpit
            initialQuery="SELECT * FROM users LIMIT 10;"
            savedQueries={mockSavedQueries}
            insightQueries={mockinsightQueries}
            initialDataSources={mockDataSources}
          />
        ),
        icon: <Database className="w-4 h-4" />,
      },
      {
        id: 'chat',
        name: 'AI Assistant',
        component: (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-foreground/70" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                AI Assistant
              </h3>
              <p className="text-foreground/80">
                Chat with AI to get help with your data analysis and SQL
                queries. This Cockpit can provide intelligent suggestions and
                help you understand your data better.
              </p>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2 text-foreground">
                  Features:
                </p>
                <ul className="text-sm text-foreground/70 text-left space-y-1">
                  <li>- Natural language to SQL</li>
                  <li>- Query optimization suggestions</li>
                  <li>- Data analysis guidance</li>
                  <li>- Real-time assistance</li>
                </ul>
              </div>
            </div>
          </div>
        ),
        icon: <MessageSquare className="w-4 h-4" />,
      },
      {
        id: 'analytics',
        name: 'Analytics',
        component: (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-foreground/70" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Analytics Dashboard
              </h3>
              <p className="text-foreground/80">
                Visualize your data with interactive charts and analytics. Build
                dashboards and share insights from your SQL queries.
              </p>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2 text-foreground">
                  Chart Types:
                </p>
                <ul className="text-sm text-foreground/70 text-left space-y-1">
                  <li>- Bar charts</li>
                  <li>- Line graphs</li>
                  <li>- Pie charts</li>
                  <li>- Scatter plots</li>
                </ul>
              </div>
            </div>
          </div>
        ),
        icon: <BarChart3 className="w-4 h-4" />,
      },
    ]

    return (
      <div className="h-screen">
        <Composer cockpits={cockpits} defaultActiveId="sql" />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'With multiple cockpits, tabs are displayed for navigation. Each Cockpit represents a different section or functionality.',
      },
    },
  },
}

// With Disabled Cockpit
export const WithDisabledCockpit: Story = {
  render: () => {
    const cockpits = [
      {
        id: 'sql',
        name: 'SQL Cockpit',
        component: (
          <SQLCockpit
            initialQuery="SELECT * FROM users LIMIT 10;"
            savedQueries={mockSavedQueries}
            insightQueries={mockinsightQueries}
            initialDataSources={mockDataSources}
          />
        ),
        icon: <Database className="w-4 h-4" />,
      },
      {
        id: 'chat',
        name: 'AI Assistant',
        component: (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-foreground/70" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                AI Assistant (Disabled)
              </h3>
              <p className="text-foreground/80">
                This Cockpit is currently disabled and cannot be accessed.
              </p>
            </div>
          </div>
        ),
        icon: <MessageSquare className="w-4 h-4" />,
        disabled: true,
      },
      {
        id: 'docs',
        name: 'Documentation',
        component: (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <FileText className="w-12 h-12 mx-auto mb-4 text-foreground/70" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Documentation
              </h3>
              <p className="text-foreground/80">
                Browse comprehensive documentation for SQL Cockpit, including
                tutorials, API references, and best practices.
              </p>
            </div>
          </div>
        ),
        icon: <FileText className="w-4 h-4" />,
      },
    ]

    return (
      <div className="h-screen">
        <Composer cockpits={cockpits} />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates how disabled cockpits are handled. Disabled tabs are shown but not clickable.',
      },
    },
  },
}

// Vertical Tabs
export const VerticalTabs: Story = {
  render: () => {
    const cockpits = [
      {
        id: 'sql',
        name: 'SQL',
        component: (
          <SQLCockpit
            initialQuery="SELECT * FROM users LIMIT 10;"
            savedQueries={mockSavedQueries}
            insightQueries={mockinsightQueries}
            initialDataSources={mockDataSources}
          />
        ),
        icon: <Database className="w-4 h-4" />,
      },
      {
        id: 'chat',
        name: 'AI',
        component: (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-foreground/70" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                AI Assistant
              </h3>
              <p className="text-foreground/80">
                Vertical tabs layout for different screen orientations.
              </p>
            </div>
          </div>
        ),
        icon: <MessageSquare className="w-4 h-4" />,
      },
    ]

    return (
      <div className="h-screen">
        <Composer cockpits={cockpits} orientation="vertical" />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Shows vertical tab orientation, useful for different layouts or screen orientations.',
      },
    },
  },
}

// Force Show Tabs with Single Cockpit
export const ForceShowTabs: Story = {
  render: () => {
    const cockpits = [
      {
        id: 'sql',
        name: 'SQL Cockpit',
        component: (
          <SQLCockpit
            initialQuery="SELECT * FROM users LIMIT 10;"
            savedQueries={mockSavedQueries}
            insightQueries={mockinsightQueries}
            initialDataSources={mockDataSources}
          />
        ),
        icon: <Database className="w-4 h-4" />,
      },
    ]

    return (
      <div className="h-screen">
        <Composer cockpits={cockpits} forceShowTabs={true} />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Using forceShowTabs prop to display tabs even with a single Cockpit. Useful for consistent UI patterns.',
      },
    },
  },
}
