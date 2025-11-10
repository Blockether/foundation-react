/**
 * Chart Components for Analytical Queries
 *
 * This component provides chart visualizations for different types of analytical queries
 * using Recharts library. It supports summary statistics, data profiling, validation,
 * and insights query categories.
 */

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  AnalyticalQuery,
  QueryResult,
  AnalyticalQueryCategory,
} from '@/types/sql'
import { cn } from '@/lib/utils'

interface AnalyticalChartProps {
  query: AnalyticalQuery
  result: QueryResult
  className?: string
}

// Color palette for charts - matches shadcn/ui theme
const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  tertiary: '#f59e0b',
  quaternary: '#ef4444',
  quinary: '#8b5cf6',
  senary: '#06b6d4',
  muted: '#6b7280',
  background: '#f9fafb',
  grid: '#e5e7eb',
}

// Future: Add pie colors when implementing pie charts

/**
 * Custom tooltip component for charts
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-md shadow-lg p-3">
        <p className="font-medium text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}:{' '}
            {typeof entry.value === 'number'
              ? entry.value.toLocaleString()
              : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

/**
 * Process analytical query result data for charting
 * Handles both predefined and custom categories
 */
const processChartData = (
  result: QueryResult,
  category: AnalyticalQueryCategory
) => {
  const data = result.data

  // Handle predefined categories with specific processors
  switch (category) {
    case 'summary':
      return processSummaryData(data)
    case 'pattern':
      return processProfilingData(data)
    case 'validation':
      return processValidationData(data)
    case 'insights':
      return processInsightsData(data)
    case 'correlation':
      return processCorrelationData(data)
    case 'forecasting':
      return processForecastingData(data)
    case 'clustering':
      return processClusteringData(data)
    case 'anomaly':
      return processAnomalyData(data)
    case 'trend':
      return processTrendData(data)
    case 'benchmarking':
      return processBenchmarkingData(data)
    case 'health':
      return processHealthData(data)
    case 'compliance':
      return processComplianceData(data)
    default:
      // Handle custom categories with generic processing
      return processCustomCategoryData(data)
  }
}

/**
 * Process summary statistics data
 */
const processSummaryData = (data: any[]) => {
  if (data.length === 0) return []

  const row = data[0]
  const processedData: any[] = []

  // Extract numeric columns for bar chart
  Object.entries(row).forEach(([key, value]) => {
    const numValue = Number(value)
    if (!isNaN(numValue) && key !== 'total_rows') {
      // Convert snake_case to TitleCase without extra transformations
      let displayName = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())

      processedData.push({
        column: displayName,
        value: numValue,
        originalKey: key,
      })
    }
  })

  return processedData
}

/**
 * Process data profiling data
 */
const processProfilingData = (data: any[]) => {
  return data.map((row: any) => ({
    feature: row.feature,
    analysis: row.analysis,
    displayValue: row.analysis,
  }))
}

/**
 * Process validation data
 */
const processValidationData = (data: any[]) => {
  if (data.length === 0) return []

  const row = data[0]
  const validationData: any[] = []

  Object.entries(row).forEach(([key, value]) => {
    const numValue = Number(value)
    if (!isNaN(numValue) && numValue > 0) {
      // Convert snake_case to TitleCase without extra transformations
      let displayName = key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())

      validationData.push({
        issue: displayName,
        count: numValue,
        originalKey: key,
      })
    }
  })

  return validationData
}

/**
 * Process insights data
 */
const processInsightsData = (data: any[]) => {
  return data.map((row: any) => ({
    table: row.table_name,
    totalRows: Number(row.total_rows),
    ...Object.fromEntries(
      Object.entries(row)
        .filter(([key]) => key.includes('_top_values'))
        .map(([key, value]) => {
          const columnName = key.replace('_top_values', '')
          return [`top_${columnName}`, value]
        })
    ),
  }))
}

/**
 * Summary Statistics Chart - Bar chart for numeric aggregations
 */
const SummaryChart = ({ data }: { data: any[] }) => {
  if (data.length === 0) return null

  // Split data into different metrics for better visualization
  const countMetrics = data.filter(d => d.originalKey.includes('_count'))
  const avgMetrics = data.filter(d => d.originalKey.includes('_avg'))

  return (
    <div className="space-y-6">
      {countMetrics.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Column Counts</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={countMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="column"
                textAnchor="middle"
                height={60}
                fontSize={12}
                tick={{ fill: CHART_COLORS.muted }}
              />
              <YAxis fontSize={12} tick={{ fill: CHART_COLORS.muted }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill={CHART_COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {avgMetrics.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-3">Average Values</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={avgMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis
                dataKey="column"
                textAnchor="middle"
                height={60}
                fontSize={12}
                tick={{ fill: CHART_COLORS.muted }}
              />
              <YAxis fontSize={12} tick={{ fill: CHART_COLORS.muted }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill={CHART_COLORS.secondary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

/**
 * Data Profiling Chart - Displays data quality metrics
 */
const ProfilingChart = ({ data }: { data: any[] }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((row: any, index: number) => (
          <div key={index} className="bg-muted/30 border rounded-md p-4">
            <h5 className="font-medium text-sm mb-2">{row.feature}</h5>
            <p className="text-lg font-semibold text-primary">
              {row.displayValue}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Data Validation Chart - Shows validation issues
 */
const ValidationChart = ({ data }: { data: any[] }) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">
          No validation issues found ✅
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="issue"
          textAnchor="middle"
          height={60}
          fontSize={12}
          tick={{ fill: CHART_COLORS.muted }}
        />
        <YAxis fontSize={12} tick={{ fill: CHART_COLORS.muted }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="count"
          fill={CHART_COLORS.quaternary}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * Quick Insights Chart - Summary with top values
 */
const InsightsChart = ({ data }: { data: any[] }) => {
  if (data.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((row: any, index: number) => (
          <div
            key={index}
            className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-md p-4"
          >
            <h5 className="text-sm font-medium text-muted-foreground mb-1">
              {row.table}
            </h5>
            <p className="text-2xl font-bold text-primary">
              {row.totalRows?.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Rows</p>
          </div>
        ))}
      </div>

      {/* Top values for each column */}
      {data.map((row: any, rowIndex: number) => {
        const topValueKeys = Object.keys(row).filter(key =>
          key.startsWith('top_')
        )
        if (topValueKeys.length === 0) return null

        return (
          <div key={rowIndex} className="space-y-2">
            <h4 className="text-sm font-medium">Top Values for {row.table}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {topValueKeys.map((key: string, colIndex: number) => {
                const columnName = key.replace('top_', '')
                const values = row[key]?.split(',') || []

                return (
                  <div
                    key={colIndex}
                    className="bg-muted/20 border rounded-md p-3"
                  >
                    <h6 className="text-xs font-medium text-muted-foreground mb-2">
                      {columnName}
                    </h6>
                    <div className="space-y-1">
                      {values
                        .slice(0, 3)
                        .map((value: string, valIndex: number) => (
                          <div
                            key={valIndex}
                            className="text-xs truncate"
                            title={value}
                          >
                            • {value}
                          </div>
                        ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Generic processor for custom categories
 */
const processCustomCategoryData = (data: any[]) => {
  // For custom categories, try to intelligently process the data
  if (data.length === 0) return []

  // Detect data patterns and suggest appropriate visualization
  const firstRow = data[0]
  const columns = Object.keys(firstRow)

  // Try to detect if this is time series data
  if (
    columns.some(
      col =>
        col.toLowerCase().includes('date') ||
        col.toLowerCase().includes('time') ||
        col.toLowerCase().includes('timestamp')
    )
  ) {
    return data.map((row, index) => ({
      index: index + 1,
      ...row,
      // Convert date columns for better visualization
      ...Object.fromEntries(
        Object.entries(row).map(([key, value]) => {
          if (
            key.toLowerCase().includes('date') ||
            key.toLowerCase().includes('time')
          ) {
            return [key, String(value)]
          }
          return [key, value]
        })
      ),
    }))
  }

  // Default: return data as-is for generic table/chart display
  return data
}

/**
 * Processor for correlation analysis data
 */
const processCorrelationData = (data: any[]) => {
  // Expecting: column1, column2, correlation_coefficient
  return data.map(row => ({
    x: row.column1 || row.feature_x,
    y: row.column2 || row.feature_y,
    correlation: Number(row.correlation || row.coefficient),
    strength: Math.abs(Number(row.correlation || row.coefficient)),
  }))
}

/**
 * Processor for forecasting data
 */
const processForecastingData = (data: any[]) => {
  // Expecting: date, actual, predicted, confidence_lower, confidence_upper
  return data.map(row => ({
    date: row.date || row.timestamp || row.period,
    actual: Number(row.actual || row.value),
    predicted: Number(row.predicted || row.forecast),
    confidence_lower: Number(row.confidence_lower || row.lower_bound),
    confidence_upper: Number(row.confidence_upper || row.upper_bound),
  }))
}

/**
 * Processor for clustering data
 */
const processClusteringData = (data: any[]) => {
  // Expecting: cluster_id, centroid_x, centroid_y, member_count
  return data.map(row => ({
    cluster: row.cluster_id || row.cluster || row.group,
    x: Number(row.centroid_x || row.x || row.feature1),
    y: Number(row.centroid_y || row.y || row.feature2),
    size: Number(row.member_count || row.size || row.count),
    members: row.members || [],
  }))
}

/**
 * Processor for anomaly detection data
 */
const processAnomalyData = (data: any[]) => {
  // Expecting: anomaly_score, threshold, is_anomaly, feature_values
  return data.map(row => ({
    score: Number(row.anomaly_score || row.score),
    threshold: Number(row.threshold || row.cutoff),
    isAnomaly: Boolean(row.is_anomaly || row.anomaly || row.outlier),
    features: row.feature_values || row.features || {},
  }))
}

/**
 * Processor for trend analysis data
 */
const processTrendData = (data: any[]) => {
  // Expecting: period, trend_value, seasonality, residual
  return data.map(row => ({
    period: row.period || row.date || row.time,
    trend: Number(row.trend_value || row.trend),
    seasonal: Number(row.seasonality || row.seasonal),
    residual: Number(row.residual || row.error),
    actual: Number(row.actual || row.value),
  }))
}

/**
 * Processor for benchmarking data
 */
const processBenchmarkingData = (data: any[]) => {
  // Expecting: metric_name, current_value, benchmark_value, percentile
  return data.map(row => ({
    metric: row.metric_name || row.metric,
    current: Number(row.current_value || row.current),
    benchmark: Number(row.benchmark_value || row.benchmark),
    percentile: Number(row.percentile || row.rank),
    performance: Number(
      ((row.current_value || row.current) /
        (row.benchmark_value || row.benchmark)) *
        100
    ),
  }))
}

/**
 * Processor for health scoring data
 */
const processHealthData = (data: any[]) => {
  // Expecting: dimension, score, weight, status
  return data.map(row => ({
    dimension: row.dimension || row.aspect || row.category,
    score: Number(row.score || row.rating),
    weight: Number(row.weight || row.importance),
    status: row.status || row.grade,
    weightedScore:
      Number(row.score || row.rating) * Number(row.weight || row.importance),
  }))
}

/**
 * Processor for compliance data
 */
const processComplianceData = (data: any[]) => {
  // Expecting: rule_name, compliance_status, risk_level, details
  return data.map(row => ({
    rule: row.rule_name || row.rule || row.check,
    status: row.compliance_status || row.status,
    risk: row.risk_level || row.risk || row.severity,
    details: row.details || row.description,
    passed: row.compliance_status === 'PASS' || row.status === 'compliant',
  }))
}

// Placeholder chart components for new categories
const CorrelationChart = ({ data: _data }: { data: any[] }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-medium">Correlation Analysis</h4>
    <div className="text-center py-8 text-muted-foreground text-sm">
      Correlation chart visualization coming soon...
    </div>
    {/* Future: Scatter plot matrix, heatmap */}
  </div>
)

const ForecastingChart = ({ data: _data }: { data: any[] }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-medium">Forecasting Analysis</h4>
    <div className="text-center py-8 text-muted-foreground text-sm">
      Forecasting chart visualization coming soon...
    </div>
    {/* Future: Line chart with confidence intervals */}
  </div>
)

const ClusteringChart = ({ data: _data }: { data: any[] }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-medium">Clustering Analysis</h4>
    <div className="text-center py-8 text-muted-foreground text-sm">
      Clustering chart visualization coming soon...
    </div>
    {/* Future: Scatter plot with cluster centers */}
  </div>
)

const AnomalyChart = ({ data: _data }: { data: any[] }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-medium">Anomaly Detection</h4>
    <div className="text-center py-8 text-muted-foreground text-sm">
      Anomaly detection chart coming soon...
    </div>
    {/* Future: Time series with anomaly highlights */}
  </div>
)

const TrendChart = ({ data: _data }: { data: any[] }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-medium">Trend Analysis</h4>
    <div className="text-center py-8 text-muted-foreground text-sm">
      Trend analysis chart coming soon...
    </div>
    {/* Future: Trend line with seasonal decomposition */}
  </div>
)

const BenchmarkingChart = ({ data: _data }: { data: any[] }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-medium">Benchmarking Analysis</h4>
    <div className="text-center py-8 text-muted-foreground text-sm">
      Benchmarking chart coming soon...
    </div>
    {/* Future: Gauge charts, performance comparisons */}
  </div>
)

const HealthChart = ({ data: _data }: { data: any[] }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-medium">Data Health Assessment</h4>
    <div className="text-center py-8 text-muted-foreground text-sm">
      Health assessment chart coming soon...
    </div>
    {/* Future: Radial chart, health score indicators */}
  </div>
)

const ComplianceChart = ({ data: _data }: { data: any[] }) => (
  <div className="space-y-4">
    <h4 className="text-sm font-medium">Compliance Analysis</h4>
    <div className="text-center py-8 text-muted-foreground text-sm">
      Compliance chart coming soon...
    </div>
    {/* Future: Status indicators, risk assessment */}
  </div>
)

const CustomCategoryChart = ({
  data,
  category,
}: {
  data: any[]
  category: string
}) => (
  <div className="space-y-4">
    <h4 className="text-sm font-medium">Custom Analysis: {category}</h4>
    {data.length > 0 ? (
      <div className="bg-muted/20 border rounded-md p-4">
        <p className="text-sm text-muted-foreground mb-2">
          Custom category visualization detected.
        </p>
        <div className="text-xs">
          <p>
            <strong>Data shape:</strong> {data.length} rows ×{' '}
            {Object.keys(data[0] || {}).length} columns
          </p>
          <p>
            <strong>Columns:</strong> {Object.keys(data[0] || {}).join(', ')}
          </p>
        </div>
      </div>
    ) : (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No data available for custom category visualization
      </div>
    )}
  </div>
)

/**
 * Main Analytical Chart Component
 */
export function AnalyticalChart({
  query,
  result,
  className,
}: AnalyticalChartProps): React.ReactNode {
  const chartData = processChartData(result, query.category)

  const renderChart = () => {
    switch (query.category) {
      case 'summary':
        return <SummaryChart data={chartData} />
      case 'pattern':
        return <ProfilingChart data={chartData} />
      case 'validation':
        return <ValidationChart data={chartData} />
      case 'insights':
        return <InsightsChart data={chartData} />
      case 'correlation':
        return <CorrelationChart data={chartData} />
      case 'forecasting':
        return <ForecastingChart data={chartData} />
      case 'clustering':
        return <ClusteringChart data={chartData} />
      case 'anomaly':
        return <AnomalyChart data={chartData} />
      case 'trend':
        return <TrendChart data={chartData} />
      case 'benchmarking':
        return <BenchmarkingChart data={chartData} />
      case 'health':
        return <HealthChart data={chartData} />
      case 'compliance':
        return <ComplianceChart data={chartData} />
      default:
        // Handle custom categories with generic visualization
        return (
          <CustomCategoryChart data={chartData} category={query.category} />
        )
    }
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Chart header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{query.name}</h3>
        <p className="text-sm text-muted-foreground">{query.description}</p>
      </div>

      {/* Chart content */}
      <div className="bg-background border rounded-lg p-4">
        {result.data.length > 0 ? (
          renderChart()
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No data available to display
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticalChart
