/**
 * Storybook stories for CopilotComposer component
 *
 * These stories demonstrate the tabbed interface that shows tabs only when
 * there are multiple copilots, with named/prebuilt sections.
 */

import { CopilotComposer } from '@/components/copilot/composer'
import { SQLCockpit, formatLLMCompletionPrompt } from '@/components/sql/cockpit'
import { MessageSquare, FileText, BarChart3, Database } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react'
import type { AnalyticalQuery } from '@/types/sql'

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

// Mock analytical queries
const mockAnalyticalQueries: AnalyticalQuery[] = [
  {
    id: 'summary-stats',
    name: 'Summary Statistics',
    description: 'Get basic statistical summary of the data',
    query: 'SELECT COUNT(*) as total_rows FROM users;',
    icon: '📊',
    category: 'summary',
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
const mockDataSources = [
  {
    id: '1',
    name: 'Users Table',
    type: 'url' as const,
    tableName: 'users',
    description: 'User account information',
    url: '/.storybook/dataset/users.csv', // This will be loaded automatically
    enableAnalysis: true,
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'Products CSV',
    type: 'url' as const,
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
    type: 'url' as const,
    tableName: 'orders',
    description: 'Order transaction data',
    url: '/.storybook/dataset/orders.csv', // This will be loaded automatically
    enableAnalysis: true,
    createdAt: new Date('2023-02-01'),
  },
]

const meta: Meta<typeof CopilotComposer> = {
  title: 'CopilotComposer',
  component: CopilotComposer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A tabbed component that displays tabs only when there are multiple copilots. Each copilot can be a named/prebuilt section like SQL Cockpit.',
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
    copilots: {
      description: 'Array of copilot sections to display',
      control: 'object',
    },
    defaultActiveId: {
      description: 'Initially active copilot ID',
      control: 'text',
    },
    forceShowTabs: {
      description: 'Show tabs even with single copilot',
      control: 'boolean',
    },
    orientation: {
      description: 'Tab orientation',
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
}

export default meta
type Story = StoryObj<typeof CopilotComposer>

// Single Copilot - No tabs shown
export const SingleCopilot: Story = {
  render: () => {
    const copilots = [
      {
        id: 'sql',
        name: 'SQL Cockpit',
        component: (
          <SQLCockpit
            initialQuery="SELECT * FROM users LIMIT 10;"
            savedQueries={mockSavedQueries}
            analyticalQueries={mockAnalyticalQueries}
            initialDataSources={mockDataSources}
          />
        ),
        icon: <Database className="w-4 h-4" />,
      },
    ]

    return (
      <div className="h-screen">
        <CopilotComposer copilots={copilots} />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'With a single copilot, no tabs are shown. The component renders directly for a clean interface.',
      },
    },
  },
}

// Multiple Copilots - Tabs shown
export const MultipleCopilots: Story = {
  render: () => {
    const copilots = [
      {
        id: 'sql',
        name: 'SQL Cockpit',
        component: (
          <SQLCockpit
            initialQuery="SELECT * FROM users LIMIT 10;"
            savedQueries={mockSavedQueries}
            analyticalQueries={mockAnalyticalQueries}
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
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
              <p className="text-muted-foreground">
                Chat with AI to get help with your data analysis and SQL queries.
                This copilot can provide intelligent suggestions and help you understand your data better.
              </p>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Features:</p>
                <ul className="text-sm text-muted-foreground text-left space-y-1">
                  <li>• Natural language to SQL</li>
                  <li>• Query optimization suggestions</li>
                  <li>• Data analysis guidance</li>
                  <li>• Real-time assistance</li>
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
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-muted-foreground">
                Visualize your data with interactive charts and analytics.
                Build dashboards and share insights from your SQL queries.
              </p>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Chart Types:</p>
                <ul className="text-sm text-muted-foreground text-left space-y-1">
                  <li>• Bar charts</li>
                  <li>• Line graphs</li>
                  <li>• Pie charts</li>
                  <li>• Scatter plots</li>
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
        <CopilotComposer
          copilots={copilots}
          defaultActiveId="sql"
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'With multiple copilots, tabs are displayed for navigation. Each copilot represents a different section or functionality.',
      },
    },
  },
}

// With Disabled Copilot
export const WithDisabledCopilot: Story = {
  render: () => {
    const copilots = [
      {
        id: 'sql',
        name: 'SQL Cockpit',
        component: (
          <SQLCockpit
            initialQuery="SELECT * FROM users LIMIT 10;"
            savedQueries={mockSavedQueries}
            analyticalQueries={mockAnalyticalQueries}
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
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">AI Assistant (Disabled)</h3>
              <p className="text-muted-foreground">
                This copilot is currently disabled and cannot be accessed.
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
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Documentation</h3>
              <p className="text-muted-foreground">
                Browse comprehensive documentation for SQL Cockpit,
                including tutorials, API references, and best practices.
              </p>
            </div>
          </div>
        ),
        icon: <FileText className="w-4 h-4" />,
      },
    ]

    return (
      <div className="h-screen">
        <CopilotComposer copilots={copilots} />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how disabled copilots are handled. Disabled tabs are shown but not clickable.',
      },
    },
  },
}

// Vertical Tabs
export const VerticalTabs: Story = {
  render: () => {
    const copilots = [
      {
        id: 'sql',
        name: 'SQL',
        component: (
          <SQLCockpit
            initialQuery="SELECT * FROM users LIMIT 10;"
            savedQueries={mockSavedQueries}
            analyticalQueries={mockAnalyticalQueries}
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
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">AI Assistant</h3>
              <p className="text-muted-foreground">
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
        <CopilotComposer
          copilots={copilots}
          orientation="vertical"
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows vertical tab orientation, useful for different layouts or screen orientations.',
      },
    },
  },
}

// Force Show Tabs with Single Copilot
export const ForceShowTabs: Story = {
  render: () => {
    const copilots = [
      {
        id: 'sql',
        name: 'SQL Cockpit',
        component: (
          <SQLCockpit
            initialQuery="SELECT * FROM users LIMIT 10;"
            savedQueries={mockSavedQueries}
            analyticalQueries={mockAnalyticalQueries}
            initialDataSources={mockDataSources}
          />
        ),
        icon: <Database className="w-4 h-4" />,
      },
    ]

    return (
      <div className="h-screen">
        <CopilotComposer
          copilots={copilots}
          forceShowTabs={true}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Using forceShowTabs prop to display tabs even with a single copilot. Useful for consistent UI patterns.',
      },
    },
  },
}

// ===== SQL STORIES =====
// These stories are focused on SQL Cockpit functionality

// SQL Cockpit - Basic SQL functionality without copilot wrapper
export const SQL: Story = {
  render: () => {
    return (
      <div className="h-screen">
        <SQLCockpit
          initialQuery={
            'SELECT id, name, email, active FROM users WHERE active = true ORDER BY created_at DESC;'
          }
          savedQueries={mockSavedQueries}
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Direct SQL Cockpit component without CopilotComposer wrapper. Shows basic SQL query functionality with saved queries.',
      },
    },
  },
}

// SQL Cockpit with Analytics and Charts - Comprehensive demo
export const SQLAnalyticsAndCharts: Story = {
  render: () => {
    return (
      <div className="h-screen">
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

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    💡 Tip: Try different analytical queries to see various chart
                    types!
                  </p>
                </div>
              </div>
            </div>
          }
        />
      </div>
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

// SQL Cockpit with AI Assistant - Demonstrates LLM completion function
export const SQLWithAIAssistant: Story = {
  render: () => {

    return (
      <div className="h-screen">
        <SQLCockpit
          initialQuery={'-- Click the magic wand button (purple icon) in the toolbar\n-- to use AI-assisted query generation!\n\nSELECT * FROM users LIMIT 10;'}
          savedQueries={mockSavedQueries}
          analyticalQueries={mockAnalyticalQueries}
          initialDataSources={mockDataSources}
          llmCompletionFunction={formatLLMCompletionPrompt}
          helpContent={
            <div className="p-4">
              <h3 className="font-semibold mb-2">AI-Assisted Query Generation</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This demo shows the AI assistant feature that accepts an LLM completion function.
                Check your browser console to see the full context sent to the function!
              </p>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-2">🪄 How to Use:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>• Click the <strong>magic wand button</strong> (purple icon) in the toolbar</li>
                    <li>• Describe what you want to query in natural language</li>
                    <li>• The function receives: user request, data sources with schemas, and current query</li>
                    <li>• Open browser console to see the full context being sent</li>
                    <li>• The generated query will be inserted into the editor</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">📋 Context Sent to LLM Function:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>• <strong>userRequest</strong>: Your natural language request</li>
                    <li>• <strong>dataSources</strong>: Array of available tables with schemas</li>
                    <li>• <strong>currentQuery</strong>: Current SQL in the editor</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">💡 Try These Requests:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>• "Show me the top 10 users"</li>
                    <li>• "Count the total number of products"</li>
                    <li>• "Join users and orders tables"</li>
                    <li>• "Get all active users with their order history"</li>
                  </ul>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded">
                  <p className="text-xs font-medium text-purple-800 dark:text-purple-200">
                    🔍 Check Console: Open your browser's developer console to see the complete context object logged when you click "Generate Query"
                  </p>
                </div>
              </div>
            </div>
          }
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the AI-assisted query generation feature. When you provide an llmCompletionFunction, a magic wand button appears in the toolbar. This function receives the user\'s natural language request, all available data sources with their schemas, and the current query in the editor. The mock function in this story logs all received context to the browser console so you can see exactly what data is sent to your LLM. Try different requests and check the console to see the full context!',
      },
    },
  },
}

// SQL Cockpit with JavaScript Array Data Source - Direct data from JavaScript objects
export const SQLWithJavaScriptArrayData: Story = {
  render: () => {
    // JavaScript array of objects as the primary data source
    const javascriptEmployeeData = [
      {
        id: 1,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@company.com',
        department: 'Engineering',
        position: 'Senior Developer',
        salary: 95000,
        startDate: '2022-03-15',
        location: 'San Francisco, CA',
        status: 'active',
        skills: ['React', 'TypeScript', 'Node.js'],
        projects: 12
      },
      {
        id: 2,
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        department: 'Design',
        position: 'UX Designer',
        salary: 82000,
        startDate: '2021-07-22',
        location: 'New York, NY',
        status: 'active',
        skills: ['Figma', 'Sketch', 'Adobe XD'],
        projects: 8
      },
      {
        id: 3,
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@company.com',
        department: 'Marketing',
        position: 'Marketing Manager',
        salary: 88000,
        startDate: '2020-11-10',
        location: 'Austin, TX',
        status: 'active',
        skills: ['SEO', 'Content Strategy', 'Analytics'],
        projects: 15
      },
      {
        id: 4,
        name: 'David Kim',
        email: 'david.kim@company.com',
        department: 'Engineering',
        position: 'DevOps Engineer',
        salary: 105000,
        startDate: '2019-05-30',
        location: 'Seattle, WA',
        status: 'active',
        skills: ['Docker', 'Kubernetes', 'AWS'],
        projects: 20
      },
      {
        id: 5,
        name: 'Jessica Taylor',
        email: 'jessica.taylor@company.com',
        department: 'Sales',
        position: 'Sales Representative',
        salary: 65000,
        startDate: '2023-01-12',
        location: 'Chicago, IL',
        status: 'inactive',
        skills: ['CRM', 'Negotiation', 'Presentation'],
        projects: 6
      },
      {
        id: 6,
        name: 'Robert Martinez',
        email: 'robert.martinez@company.com',
        department: 'Engineering',
        position: 'Backend Developer',
        salary: 87000,
        startDate: '2022-09-01',
        location: 'Denver, CO',
        status: 'active',
        skills: ['Python', 'Django', 'PostgreSQL'],
        projects: 9
      }
    ]

    // Mock data source using raw JavaScript array (JSON)
    const javascriptDataSource = {
      id: 'js-array-data',
      name: 'JavaScript Employee Data (Raw JSON)',
      type: 'file' as const,
      tableName: 'employees',
      description: 'Employee data sourced directly from JavaScript array of objects (raw JSON)',
      data: javascriptEmployeeData, // Direct JavaScript array - SQL Cockpit will auto-convert!
      enableAnalysis: true,
      createdAt: new Date('2024-01-15'),
      file: {
        name: 'employees.json',
        size: JSON.stringify(javascriptEmployeeData).length,
        type: 'application/json',
      },
    }

    // Enhanced analytical queries for employee data
    const employeeAnalyticalQueries = [
      {
        id: 'employee-summary',
        name: 'Employee Summary',
        description: 'Get basic employee statistics',
        query: 'SELECT COUNT(*) as total_employees, AVG(salary) as avg_salary FROM employees;',
        icon: '📊',
        category: 'summary' as const,
      },
      {
        id: 'department-breakdown',
        name: 'Department Breakdown',
        description: 'Analyze employee distribution by department',
        query: 'SELECT department, COUNT(*) as employee_count, AVG(salary) as avg_salary FROM employees GROUP BY department ORDER BY employee_count DESC;',
        icon: '🏢',
        category: 'insights' as const,
      },
      {
        id: 'top-earners',
        name: 'Top Earners',
        description: 'Find highest paid employees',
        query: 'SELECT name, position, department, salary FROM employees ORDER BY salary DESC LIMIT 5;',
        icon: '💰',
        category: 'insights' as const,
      },
      {
        id: 'active-status',
        name: 'Active Status Analysis',
        description: 'Analyze employee status distribution',
        query: 'SELECT status, COUNT(*) as count, ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees), 2) as percentage FROM employees GROUP BY status;',
        icon: '✅',
        category: 'validation' as const,
      },
      {
        id: 'project-performance',
        name: 'Project Performance',
        description: 'Analyze project distribution across employees',
        query: 'SELECT department, AVG(projects) as avg_projects, MAX(projects) as max_projects, MIN(projects) as min_projects FROM employees GROUP BY department ORDER BY avg_projects DESC;',
        icon: '📈',
        category: 'pattern' as const,
      },
    ]

    return (
      <div className="h-screen">
        <SQLCockpit
          initialQuery={`-- Employee data loaded from raw JSON!
-- This data comes directly from a JavaScript array of objects.
-- No CSV conversion or external files needed - SQL Cockpit handles it!

SELECT * FROM employees LIMIT 10;`}
          savedQueries={[
            {
              id: 'all-employees',
              name: 'All Employees',
              query: 'SELECT * FROM employees ORDER BY name;',
              description: 'View all employee records',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
            },
            {
              id: 'engineering-team',
              name: 'Engineering Team',
              query: "SELECT name, position, salary FROM employees WHERE department = 'Engineering' ORDER BY salary DESC;",
              description: 'View engineering team members',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
            },
            {
              id: 'high-salary',
              name: 'High Salary Employees',
              query: 'SELECT name, position, department, salary FROM employees WHERE salary > 90000 ORDER BY salary DESC;',
              description: 'Employees earning more than $90k',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
            },
          ]}
          analyticalQueries={employeeAnalyticalQueries}
          initialDataSources={[javascriptDataSource]}
          helpContent={
            <div className="p-4">
              <h3 className="font-semibold mb-2">Raw JSON Data Source</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This demo shows data loaded directly from a JavaScript array of objects
                as raw JSON. The SQL Cockpit automatically converts it to SQL!
              </p>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-2">🔍 Data Source:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>• <strong>Origin:</strong> JavaScript array of objects (raw JSON)</li>
                    <li>• <strong>Structure:</strong> Employee records with properties like name, email, department, salary</li>
                    <li>• <strong>Size:</strong> 6 employee records</li>
                    <li>• <strong>Format:</strong> Raw JSON data, auto-converted to SQL by SQL Cockpit</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">💡 Try These Queries:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground font-mono text-xs">
                    <li>• SELECT department, COUNT(*) FROM employees GROUP BY department;</li>
                    <li>• SELECT * FROM employees WHERE salary &gt; 90000;</li>
                    <li>• SELECT AVG(salary) as avg_salary FROM employees;</li>
                    <li>• SELECT name, projects FROM employees ORDER BY projects DESC;</li>
                  </ul>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-xs font-medium text-green-800 dark:text-green-200">
                    ✨ This demonstrates how JavaScript arrays can be used as data sources for SQL analysis!
                  </p>
                </div>
              </div>
            </div>
          }
        />
      </div>
    )
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates using a JavaScript array of objects as the primary data source. The employee data is defined directly in JavaScript as an array of objects and automatically made available for SQL querying. This shows how in-memory data can be analyzed using SQL Cockpit without requiring external files or databases.',
      },
    },
  },
}

// SQL Cockpit with Failed Data Sources - Demonstrates error handling
export const SQLFailedDataSources: Story = {
  render: () => {
    // Mock data sources with various failure states
    const failedDataSources = [
      {
        id: '1',
        name: 'Broken CSV File',
        type: 'url' as const,
        tableName: 'broken_data',
        description: 'This CSV file has parsing errors and cannot be loaded',
        url: '/.storybook/dataset/broken.csv',
        enableAnalysis: true,
        createdAt: new Date('2023-01-01'),
        loadingStatus: 'failed' as const,
        loadingError:
          'CSV parsing error: Invalid format on line 42. Expected 3 columns but found 5.',
      },
      {
        id: '2',
        name: 'Missing Parquet File',
        type: 'url' as const,
        tableName: 'missing_data',
        description: 'This parquet file does not exist at the specified URL',
        url: '/.storybook/dataset/nonexistent.parquet',
        enableAnalysis: true,
        createdAt: new Date('2023-01-15'),
        loadingStatus: 'failed' as const,
        loadingError:
          'HTTP 404: File not found at /.storybook/dataset/nonexistent.parquet',
      },
      {
        id: '3',
        name: 'Working Data',
        type: 'url' as const,
        tableName: 'working_table',
        description: 'This data source loads successfully',
        url: '/.storybook/dataset/users.csv',
        enableAnalysis: true,
        createdAt: new Date('2023-01-01'),
        loadingStatus: 'loaded' as const,
      },
    ]

    return (
      <div className="h-screen">
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
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded">
                  <p className="text-xs">
                    <strong>Note:</strong> One data source loads successfully to
                    show mixed success/failure scenarios.
                  </p>
                </div>
              </div>
            </div>
          }
        />
      </div>
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