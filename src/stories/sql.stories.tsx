/**
 * Storybook stories for Composer component
 *
 * These stories demonstrate the composer pattern with automatic theme derivation
 * and optional SQL sections.
 */

import { SQLCockpit } from '@/components/sql/cockpit'
import type { Meta, StoryObj } from '@storybook/react'
import { DataSource } from '@/types/sql'

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

// Mock analytical queries
const mockAnalyticalQueries = [
  {
    id: 'summary-stats',
    name: 'Summary Statistics',
    description: 'Get basic statistical summary of the data',
    query:
      'SELECT COUNT(*) as total_rows, AVG(id) as avg_id, MAX(id) as max_id, MIN(id) as min_id FROM users;',
    icon: '📊',
    category: 'summary' as const,
    targetCategories: ['table' as const, 'file' as const],
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
  },
]

// Mock data sources with actual data URLs
const mockDataSources: DataSource[] = [
  {
    id: '1',
    name: 'Users Table',
    type: 'url',
    tableName: 'users',
    description: 'User account information',
    url: '/.storybook/dataset/users.csv', // This will be loaded automatically
    enableAnalysis: true,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Products CSV',
    type: 'url',
    tableName: 'products',
    description: 'Product catalog data',
    url: '/.storybook/dataset/products.csv', // This will be loaded automatically
    enableAnalysis: true,
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
    type: 'url',
    tableName: 'orders',
    description: 'Order transaction data',
    url: '/.storybook/dataset/orders.csv', // This will be loaded automatically
    enableAnalysis: true,
    createdAt: new Date('2023-02-01'),
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
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof meta>

// SQL Composer (using raw Composer)
export const Default: Story = {
  render: () => {
    return (
      <SQLCockpit
        initialQuery={
          'SELECT id, name, email, active FROM users WHERE active = true ORDER BY created_at DESC;'
        }
        savedQueries={mockSavedQueries}
      />
    )
  },
}

// SQL Cockpit with Analytical Queries and Charts - Comprehensive demo
export const AnalyticsAndCharts: Story = {
  render: () => {
    return (
      <SQLCockpit
        initialQuery={
          '-- Real DuckDB data loaded from CSV files!\n-- Click the database icon to explore analytical queries.\n-- Charts will be automatically generated from query results.\n\nSELECT * FROM users LIMIT 100;'
        }
        savedQueries={mockSavedQueries}
        analyticalQueries={mockAnalyticalQueries}
        initialDataSources={mockDataSources}
        helpContent={
          <div className="p-4">
            <h3 className="font-semibold mb-2">Analytics & Charts Demo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This comprehensive demo showcases analytical queries with
              intelligent targeting and automatic chart generation.
            </p>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium mb-2">🔍 How to Use:</p>
                <ul className="space-y-1 ml-4 text-muted-foreground">
                  <li>
                    • Click the <strong>Database icon</strong> in toolbar to see
                    data sources
                  </li>
                  <li>
                    • Each data source shows relevant analytical queries based
                    on targeting rules
                  </li>
                  <li>
                    • Click the <strong>Chart icon</strong> next to data sources
                    to run analytical queries
                  </li>
                  <li>
                    • Charts are automatically generated from query results
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-2">📊 Available Charts:</p>
                <ul className="space-y-1 ml-4 text-muted-foreground">
                  <li>
                    • <strong>Summary Statistics</strong> - Bar charts for
                    counts and averages
                  </li>
                  <li>
                    • <strong>Data Profiling</strong> - Quality metrics and
                    completeness charts
                  </li>
                  <li>
                    • <strong>Top Values</strong> - Frequency distribution
                    charts
                  </li>
                  <li>
                    • <strong>Data Distribution</strong> - Pattern analysis
                    visualizations
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-2">🎯 Targeting Rules:</p>
                <ul className="space-y-1 ml-4 text-muted-foreground">
                  <li>
                    • <strong>Summary Statistics</strong> - targets tables and
                    files
                  </li>
                  <li>
                    • <strong>Data Profiling</strong> - targets tables and views
                  </li>
                  <li>
                    • <strong>Top Values</strong> - only targets specific tables
                    (users, products)
                  </li>
                  <li>
                    • <strong>Data Distribution</strong> - targets only tables
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  💡 Tip: Try different analytical queries to see various chart
                  types!
                </p>
              </div>
            </div>
          </div>
        }
        className="h-full"
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive demonstration of both analytical queries and chart functionality. Shows intelligent query targeting based on data source types and table names, with automatic chart generation from query results. Click the database icon to explore data sources and the chart icon to run analytical queries with visualizations.',
      },
    },
  },
}

// SQL Cockpit with Failed Data Sources - Demonstrates error handling
export const FailedDataSources: Story = {
  render: () => {
    // Mock data sources with various failure states
    const failedDataSources: DataSource[] = [
      {
        id: '1',
        name: 'Broken CSV File',
        type: 'url',
        tableName: 'broken_data',
        description: 'This CSV file has parsing errors and cannot be loaded',
        url: '/.storybook/dataset/broken.csv',
        enableAnalysis: true,
        createdAt: new Date('2023-01-01'),
        loadingStatus: 'failed',
        loadingError:
          'CSV parsing error: Invalid format on line 42. Expected 3 columns but found 5.',
      },
      {
        id: '2',
        name: 'Missing Parquet File',
        type: 'url',
        tableName: 'missing_data',
        description: 'This parquet file does not exist at the specified URL',
        url: '/.storybook/dataset/nonexistent.parquet',
        enableAnalysis: true,
        createdAt: new Date('2023-01-15'),
        loadingStatus: 'failed',
        loadingError:
          'HTTP 404: File not found at /.storybook/dataset/nonexistent.parquet',
      },
      {
        id: '3',
        name: 'Corrupted JSON Data',
        type: 'url',
        tableName: 'corrupted_json',
        description: 'JSON file with invalid structure causing import failure',
        url: '/.storybook/dataset/corrupted.json',
        enableAnalysis: true,
        createdAt: new Date('2023-02-01'),
        loadingStatus: 'failed',
        loadingError:
          'JSON parsing error: Unexpected token } in JSON at position 1234',
      },
      {
        id: '4',
        name: 'Large File Timeout',
        type: 'url',
        tableName: 'large_dataset',
        description: 'File too large, causing timeout during processing',
        url: '/.storybook/dataset/huge.csv',
        enableAnalysis: true,
        createdAt: new Date('2023-02-15'),
        loadingStatus: 'failed',
        loadingError:
          'Processing timeout: File exceeds maximum processing time of 30 seconds',
      },
      {
        id: '5',
        name: 'Working Data',
        type: 'url',
        tableName: 'working_table',
        description: 'This data source loads successfully',
        url: '/.storybook/dataset/users.csv',
        enableAnalysis: true,
        createdAt: new Date('2023-01-01'),
        loadingStatus: 'loaded',
      },
    ]

    return (
      <SQLCockpit
        initialQuery={
          '-- Some data sources failed to load!\n-- Click the database icon to see error details.\n-- Notice the red X indicators on failed sources.'
        }
        savedQueries={mockSavedQueries}
        analyticalQueries={mockAnalyticalQueries}
        initialDataSources={failedDataSources}
        helpContent={
          <div className="p-4">
            <h3 className="font-semibold mb-2">Failed Data Sources Demo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              This story demonstrates error handling for failed data source
              imports.
            </p>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-medium mb-1">🔍 Error Indicators:</p>
                <ul className="space-y-1 ml-4 text-muted-foreground">
                  <li>
                    • <strong>Red X</strong> - Failed data sources show error
                    status
                  </li>
                  <li>
                    • <strong>Hover</strong> - Mouse over error icons for
                    details
                  </li>
                  <li>
                    • <strong>Remove Button</strong> - Failed sources can be
                    removed
                  </li>
                  <li>
                    • <strong>Disabled</strong> - Failed sources are not
                    selectable
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">📋 Common Error Types:</p>
                <ul className="space-y-1 ml-4 text-muted-foreground">
                  <li>
                    • <strong>CSV Parsing</strong> - Invalid file format or
                    structure
                  </li>
                  <li>
                    • <strong>File Not Found</strong> - Missing files or wrong
                    URLs
                  </li>
                  <li>
                    • <strong>JSON Errors</strong> - Malformed JSON data
                  </li>
                  <li>
                    • <strong>Timeout</strong> - Files too large to process
                  </li>
                </ul>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
                <p className="text-xs">
                  <strong>Note:</strong> One data source loads successfully to
                  show mixed success/failure scenarios.
                </p>
              </div>
            </div>
          </div>
        }
        className="h-full"
      />
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates comprehensive error handling for failed data source imports. Shows various error states (CSV parsing errors, missing files, JSON corruption, timeouts) with visual indicators, error details on hover, and the ability to remove failed sources. One successful data source is included to demonstrate mixed scenarios.',
      },
    },
  },
}
