// ===== SQL STORIES =====
// These stories are focused on SQL Cockpit functionality

import {
  formatLLMCompletionPrompt,
  SQLCockpit,
} from '@/components/cockpit/sql/cockpit'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { InsightsQuery, QueryResult } from '@/types/sql'
import { Meta, StoryObj } from '@storybook/react'
import {
  Activity,
  BarChartIcon,
  Building,
  CheckCircle,
  DollarSign,
  LineChart,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

type Story = StoryObj<typeof SQLCockpit>

export default {
  title: 'SQL Cockpit',
  component: SQLCockpit,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'SQL Cockpit component for interactive SQL querying with data visualization, analytics, and AI assistance capabilities.',
      },
    },
  },
  tags: ['autodocs'],
} as Meta<typeof SQLCockpit>

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
const mockAnalyticalQueries: InsightsQuery[] = [
  {
    id: 'summary-stats',
    name: 'Summary Statistics',
    description: 'Get basic statistical summary of the data',
    query: 'SELECT COUNT(*) as total_rows FROM users;',
    icon: '📊',
    category: 'summary',
    renderer: (result: QueryResult) => {
      const totalRows = Number(result.data[0]?.total_rows || 0)
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
                const uniqueCount = Number(row.unique_count || 0)
                const totalCount = Number(row.total_count || 0)
                const completeness =
                  totalCount > 0
                    ? ((uniqueCount / totalCount) * 100).toFixed(1)
                    : '0'
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
                      {uniqueCount.toLocaleString()} unique values out of{' '}
                      {totalCount.toLocaleString()} total
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
        ...result.data.map((row: any) => Number(row.frequency || 0))
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
                const frequency = Number(row.frequency || 0)
                const percentage =
                  maxFrequency > 0
                    ? ((frequency / maxFrequency) * 100).toFixed(1)
                    : '0'
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{row.name}</span>
                      <Badge variant="outline">
                        {frequency.toLocaleString()} ({percentage}%)
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
        (sum, row: any) => sum + Number(row.count || 0),
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
                const count = Number(row.count || 0)
                const percentage =
                  totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0'
                return (
                  <div key={index} className="text-center p-4rounded-lg border">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {row.id_pattern}
                    </div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      {count.toLocaleString()}
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

// Default - SQL Cockpit - Basic SQL functionality without Cockpit wrapper
export const Default: Story = {
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
        story:
          'Default SQL Cockpit component without Composer wrapper. Shows basic SQL query functionality with saved queries.',
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
                      - Click the <strong>Database icon</strong> in toolbar to
                      see data sources
                    </li>
                    <li>
                      - Each data source shows relevant analytical queries based
                      on targeting rules
                    </li>
                    <li>
                      - Click the <strong>Chart icon</strong> next to data
                      sources to run analytical queries
                    </li>
                    <li>
                      - Charts are automatically generated from query results
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">📊 Available Charts:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>
                      - <strong>Summary Statistics</strong> - Bar charts for
                      counts and averages
                    </li>
                    <li>
                      - <strong>Data Profiling</strong> - Quality metrics and
                      completeness charts
                    </li>
                    <li>
                      - <strong>Top Values</strong> - Frequency distribution
                      charts
                    </li>
                    <li>
                      - <strong>Data Distribution</strong> - Pattern analysis
                      visualizations
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                    💡 Tip: Try different analytical queries to see various
                    chart types!
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
          initialQuery={
            '-- Click the magic wand button (purple icon) in the toolbar\n-- to use AI-assisted query generation!\n\nSELECT * FROM users LIMIT 10;'
          }
          savedQueries={mockSavedQueries}
          analyticalQueries={mockAnalyticalQueries}
          initialDataSources={mockDataSources}
          llmCompletionFunction={formatLLMCompletionPrompt}
          helpContent={
            <div className="p-4">
              <h3 className="font-semibold mb-2">
                AI-Assisted Query Generation
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                This demo shows the AI assistant feature that accepts an LLM
                completion function. Check your browser console to see the full
                context sent to the function!
              </p>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-2">🪄 How to Use:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>
                      - Click the <strong>magic wand button</strong> (purple
                      icon) in the toolbar
                    </li>
                    <li>
                      - Describe what you want to query in natural language
                    </li>
                    <li>
                      - The function receives: user request, data sources with
                      schemas, and current query
                    </li>
                    <li>
                      - Open browser console to see the full context being sent
                    </li>
                    <li>
                      - The generated query will be inserted into the editor
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">
                    📋 Context Sent to LLM Function:
                  </p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>
                      - <strong>userRequest</strong>: Your natural language
                      request
                    </li>
                    <li>
                      - <strong>dataSources</strong>: Array of available tables
                      with schemas
                    </li>
                    <li>
                      - <strong>currentQuery</strong>: Current SQL in the editor
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">💡 Try These Requests:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>- "Show me the top 10 users"</li>
                    <li>- "Count the total number of products"</li>
                    <li>- "Join users and orders tables"</li>
                    <li>- "Get all active users with their order history"</li>
                  </ul>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded">
                  <p className="text-xs font-medium text-purple-800 dark:text-purple-200">
                    🔍 Check Console: Open your browser's developer console to
                    see the complete context object logged when you click
                    "Generate Query"
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
          "Demonstrates the AI-assisted query generation feature. When you provide an llmCompletionFunction, a magic wand button appears in the toolbar. This function receives the user's natural language request, all available data sources with their schemas, and the current query in the editor. The mock function in this story logs all received context to the browser console so you can see exactly what data is sent to your LLM. Try different requests and check the console to see the full context!",
      },
    },
  },
}

// SQL Cockpit with JavaScript Array Data Source - Direct data from JavaScript objects
export const SQLWithJavascriptArrayDatasource: Story = {
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
        projects: 12,
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
        projects: 8,
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
        projects: 15,
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
        projects: 20,
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
        projects: 6,
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
        projects: 9,
      },
    ]

    // Mock data source using raw JavaScript array (JSON)
    const javascriptDataSource = {
      id: 'js-array-data',
      name: 'JavaScript Employee Data (Raw JSON)',
      type: 'file' as const,
      tableName: 'employees',
      description:
        'Employee data sourced directly from JavaScript array of objects (raw JSON)',
      data: javascriptEmployeeData, // Direct JavaScript array - SQL Cockpit will auto-convert!
      // Explicit column ordering - ensures columns appear in this exact order
      columnOrder: [
        'id',
        'name',
        'email',
        'department',
        'position',
        'salary',
        'startDate',
        'location',
        'status',
        'skills',
        'projects',
      ],
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
        query:
          'SELECT COUNT(*) as total_employees, AVG(salary) as avg_salary FROM employees;',
        icon: '📊',
        category: 'summary' as const,
        renderer: (result: QueryResult) => {
          const totalEmployees = Number(result.data[0]?.total_employees || 0)
          const avgSalary = Number(result.data[0]?.avg_salary || 0)
          return (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Summary
                </CardTitle>
                <CardDescription>Basic workforce statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {totalEmployees.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Employees
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      $
                      {avgSalary.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Salary
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        },
      },
      {
        id: 'department-breakdown',
        name: 'Department Breakdown',
        description: 'Analyze employee distribution by department',
        query:
          'SELECT department, COUNT(*) as employee_count, AVG(salary) as avg_salary FROM employees GROUP BY department ORDER BY employee_count DESC;',
        icon: '🏢',
        category: 'insights' as const,
        renderer: (result: QueryResult) => {
          return (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Department Analysis
                </CardTitle>
                <CardDescription>
                  Employee distribution by department
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.data.map((row: any, index) => (
                    <div key={index} className="p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{row.department}</h4>
                        <Badge variant="outline">
                          {Number(row.employee_count || 0).toLocaleString()}{' '}
                          employees
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Average Salary: $
                        {Number(row.avg_salary || 0).toLocaleString(undefined, {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${Math.max(
                              ...result.data.map((r: any) =>
                                Number(r.employee_count || 0)
                              )
                            ) > 0
                                ? (Number(row.employee_count || 0) /
                                  Math.max(
                                    ...result.data.map((r: any) =>
                                      Number(r.employee_count || 0)
                                    )
                                  )) *
                                100
                                : 0
                              }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        },
      },
      {
        id: 'top-earners',
        name: 'Top Earners',
        description: 'Find highest paid employees',
        query:
          'SELECT name, position, department, salary FROM employees ORDER BY salary DESC LIMIT 5;',
        icon: '💰',
        category: 'insights' as const,
        renderer: (result: QueryResult) => {
          return (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Top Earners
                </CardTitle>
                <CardDescription>
                  Highest paid employees in the organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.data.map((row: any, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-semibold">{row.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {row.position} - {row.department}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${Number(row.salary || 0).toLocaleString()}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        },
      },
      {
        id: 'active-status',
        name: 'Active Status Analysis',
        description: 'Analyze employee status distribution',
        query:
          'SELECT status, COUNT(*) as count, ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM employees), 2) as percentage FROM employees GROUP BY status;',
        icon: '✅',
        category: 'validation' as const,
        renderer: (result: QueryResult) => {
          return (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Status Distribution
                </CardTitle>
                <CardDescription>Employee status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.data.map((row: any, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg ${row.status === 'active'
                          ? 'bg-green-50 dark:bg-green-950/20'
                          : 'bg-red-50 dark:bg-red-950/20'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium capitalize">
                          {row.status}
                        </span>
                        <Badge
                          variant={
                            row.status === 'active' ? 'default' : 'destructive'
                          }
                        >
                          {Number(row.count || 0).toLocaleString()} employees
                        </Badge>
                      </div>
                      <Progress value={row.percentage} className="h-2" />
                      <div className="text-sm text-muted-foreground mt-1">
                        {row.percentage}% of workforce
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        },
      },
      {
        id: 'project-performance',
        name: 'Project Performance',
        description: 'Analyze project distribution across employees',
        query:
          'SELECT department, AVG(projects) as avg_projects, MAX(projects) as max_projects, MIN(projects) as min_projects FROM employees GROUP BY department ORDER BY avg_projects DESC;',
        icon: '📈',
        category: 'pattern' as const,
        renderer: (result: QueryResult) => {
          return (
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Project Performance
                </CardTitle>
                <CardDescription>
                  Project distribution across departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.data.map((row: any, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">{row.department}</h4>
                        <Badge variant="outline">
                          {row.avg_projects.toFixed(1)} avg projects
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Min:</span>
                          <span className="ml-2 font-medium">
                            {row.min_projects}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Max:</span>
                          <span className="ml-2 font-medium">
                            {row.max_projects}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={
                          Math.max(
                            ...result.data.map((r: any) =>
                              Number(r.avg_projects || 0)
                            )
                          ) > 0
                            ? (Number(row.avg_projects || 0) /
                              Math.max(
                                ...result.data.map((r: any) =>
                                  Number(r.avg_projects || 0)
                                )
                              )) *
                            100
                            : 0
                        }
                        className="mt-3 h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        },
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
              query:
                "SELECT name, position, salary FROM employees WHERE department = 'Engineering' ORDER BY salary DESC;",
              description: 'View engineering team members',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
            },
            {
              id: 'high-salary',
              name: 'High Salary Employees',
              query:
                'SELECT name, position, department, salary FROM employees WHERE salary > 90000 ORDER BY salary DESC;',
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
                This demo shows data loaded directly from a JavaScript array of
                objects as raw JSON. The SQL Cockpit automatically converts it
                to SQL!
              </p>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-2">🔍 Data Source:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>
                      - <strong>Origin:</strong> JavaScript array of objects
                      (raw JSON)
                    </li>
                    <li>
                      - <strong>Structure:</strong> Employee records with
                      properties like name, email, department, salary
                    </li>
                    <li>
                      - <strong>Size:</strong> 6 employee records
                    </li>
                    <li>
                      - <strong>Format:</strong> Raw JSON data, auto-converted
                      to SQL by SQL Cockpit
                    </li>
                    <li>
                      - <strong>Column Order:</strong> Explicit ordering defined
                      via columnOrder property
                    </li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">💡 Try These Queries:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground font-mono text-xs">
                    <li>
                      - SELECT department, COUNT(*) FROM employees GROUP BY
                      department;
                    </li>
                    <li>- SELECT * FROM employees WHERE salary &gt; 90000;</li>
                    <li>- SELECT AVG(salary) as avg_salary FROM employees;</li>
                    <li>
                      - SELECT name, projects FROM employees ORDER BY projects
                      DESC;
                    </li>
                  </ul>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded">
                  <p className="text-xs font-medium text-green-800 dark:text-green-200">
                    ✨ This demonstrates how JavaScript arrays can be used as
                    data sources for SQL analysis!
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
          'Demonstrates using a JavaScript array of objects as the primary data source. The employee data is defined directly in JavaScript as an array of objects and automatically made available for SQL querying. This shows how in-memory data can be analyzed using SQL Cockpit without requiring external files or databases.',
      },
    },
  },
}

// SQL Cockpit with Custom Column Order - Demonstrates columnOrder with skills first
export const SQLWithCustomColumnOrder: Story = {
  render: () => {
    // JavaScript array of objects - same data as previous story
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
        projects: 12,
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
        projects: 8,
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
        projects: 15,
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
        projects: 20,
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
        projects: 6,
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
        projects: 9,
      },
    ]

    // Data source with custom column order - skills FIRST!
    const customOrderDataSource = {
      id: 'custom-order-data',
      name: 'Employee Data (Skills First)',
      type: 'file' as const,
      tableName: 'employees_skills_first',
      description:
        'Employee data with custom column ordering - skills column appears first!',
      data: javascriptEmployeeData,
      // Custom column order with skills as the FIRST column
      columnOrder: [
        'skills',
        'name',
        'position',
        'department',
        'id',
        'email',
        'salary',
        'startDate',
        'location',
        'status',
        'projects',
      ],
      createdAt: new Date('2024-01-15'),
      file: {
        name: 'employees_custom_order.json',
        size: JSON.stringify(javascriptEmployeeData).length,
        type: 'application/json',
      },
    }

    return (
      <div className="h-screen">
        <SQLCockpit
          initialQuery={`-- Custom Column Order Demo!
-- Notice how 'skills' appears as the FIRST column in the results.
-- This is controlled by the columnOrder property in the data source.

SELECT * FROM employees_skills_first LIMIT 10;`}
          savedQueries={[
            {
              id: 'skills-based-query',
              name: 'View Skills First',
              query:
                'SELECT skills, name, position FROM employees_skills_first ORDER BY name;',
              description: 'Query with skills column prominently displayed',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
            },
            {
              id: 'all-custom-order',
              name: 'All Columns (Custom Order)',
              query: 'SELECT * FROM employees_skills_first ORDER BY name;',
              description: 'Show all columns in custom order',
              createdAt: new Date('2024-01-15'),
              updatedAt: new Date('2024-01-15'),
            },
          ]}
          initialDataSources={[customOrderDataSource]}
          helpContent={
            <div className="p-4">
              <h3 className="font-semibold mb-2">Custom Column Order Demo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                This demo shows the columnOrder property in action. The 'skills'
                column is configured to appear FIRST, even though it's not the
                first property in the JavaScript objects.
              </p>

              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium mb-2">🎯 Column Order:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground font-mono text-xs">
                    <li>1. skills</li>
                    <li>2. name</li>
                    <li>3. position</li>
                    <li>4. department</li>
                    <li>5. id</li>
                    <li>6. email</li>
                    <li>7. salary</li>
                    <li>8. startDate</li>
                    <li>9. location</li>
                    <li>10. status</li>
                    <li>11. projects</li>
                  </ul>
                </div>

                <div>
                  <p className="font-medium mb-2">💡 Try This:</p>
                  <ul className="space-y-1 ml-4 text-muted-foreground">
                    <li>
                      - Run{' '}
                      <code className="font-mono text-xs">
                        SELECT * FROM employees_skills_first LIMIT 5;
                      </code>
                    </li>
                    <li>- Notice skills appears as the first column!</li>
                    <li>- Compare with the regular employee data story</li>
                  </ul>
                </div>

                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded">
                  <p className="text-xs font-medium text-purple-800 dark:text-purple-200">
                    ✨ The columnOrder property gives you complete control over
                    column ordering!
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
          'Demonstrates the columnOrder property by placing the "skills" column first, even though it\'s not the first property in the JavaScript objects. This shows how you can explicitly control column ordering when loading data from JavaScript arrays, which is useful for highlighting important columns or maintaining consistent ordering across different data sources.',
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
                      - <strong>Red X</strong> - Failed data sources show error
                      status
                    </li>
                    <li>
                      - <strong>Hover</strong> - Mouse over error icons for
                      details
                    </li>
                    <li>
                      - <strong>Remove Button</strong> - Failed sources can be
                      removed
                    </li>
                    <li>
                      - <strong>Disabled</strong> - Failed sources are not
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
