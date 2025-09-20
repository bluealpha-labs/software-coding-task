"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts"
import { useTimeSeriesData } from "@/hooks/use-mmm-data"
import { useThemeColors } from "@/hooks/use-theme-colors"
import { useState } from "react"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"

const CHANNEL_COLORS = [
  "#2563eb", // Blue
  "#7c3aed", // Purple  
  "#059669", // Green
  "#dc2626", // Red
  "#ea580c", // Orange
]

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const totalSpend = payload.reduce((sum, entry) => sum + (entry.value || 0), 0)
    
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">Week of {label}</p>
        <p className="text-sm font-medium mb-2">
          Total: ${totalSpend.toLocaleString()}
        </p>
        {payload
          .sort((a, b) => (b.value || 0) - (a.value || 0))
          .map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.dataKey}:</span>
            <span className="font-medium">
              ${Number(entry.value).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function TimeSeriesChart() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [appliedDateRange, setAppliedDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  const { data, loading, error } = useTimeSeriesData(
    appliedDateRange.startDate || undefined,
    appliedDateRange.endDate || undefined
  )
  const { colors } = useThemeColors()
  const [viewType, setViewType] = useState<'stacked' | 'individual'>('stacked')

  // Date range handlers
  const applyDateFilter = () => {
    setAppliedDateRange({ ...dateRange })
  }

  const resetDateFilter = () => {
    setDateRange({ startDate: '', endDate: '' })
    setAppliedDateRange({ startDate: '', endDate: '' })
  }

  const setYearRange = (year: number) => {
    const range = {
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`
    }
    setDateRange(range)
    setAppliedDateRange(range)
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Spend Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-red-600">Error loading time series data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Spend Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for the chart
  const chartData = data[0]?.data_points.map((_, index) => {
    const point: any = {
      date: data[0].data_points[index]?.date || '',
    }
    
    data.forEach(channel => {
      if (channel.data_points[index]) {
        point[channel.channel] = channel.data_points[index].spend
      }
    })
    
    return point
  }) || []

  // Calculate some insights
  const totalSpendByChannel = data.map(channel => ({
    channel: channel.channel,
    total: channel.data_points.reduce((sum, point) => sum + point.spend, 0)
  })).sort((a, b) => b.total - a.total)

  // Find seasonal patterns (simplified)
  const avgSpendByMonth = chartData.reduce((acc: any, point) => {
    const month = new Date(point.date).getMonth()
    const monthName = new Date(point.date).toLocaleDateString('en', { month: 'short' })
    const totalSpend = data.reduce((sum, channel) => 
      sum + (point[channel.channel] || 0), 0)
    
    if (!acc[monthName]) {
      acc[monthName] = { total: 0, count: 0 }
    }
    acc[monthName].total += totalSpend
    acc[monthName].count += 1
    
    return acc
  }, {})

  const seasonalInsights = Object.entries(avgSpendByMonth).map(([month, data]: [string, any]) => ({
    month,
    avgSpend: data.total / data.count
  })).sort((a, b) => b.avgSpend - a.avgSpend)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weekly Spend Trends</span>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('stacked')}
              className={`px-3 py-1 text-xs rounded ${
                viewType === 'stacked' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Stacked
            </button>
            <button
              onClick={() => setViewType('individual')}
              className={`px-3 py-1 text-xs rounded ${
                viewType === 'individual' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Individual
            </button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

          {/* Date Range Filter */}
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Date Range Filter</Label>

              {/* Year Filter Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setYearRange(2021)}
                  className="text-xs"
                >
                  2021
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setYearRange(2022)}
                  className="text-xs"
                >
                  2022
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setYearRange(2023)}
                  className="text-xs"
                >
                  2023
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setYearRange(2024)}
                  className="text-xs"
                >
                  2024
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetDateFilter}
                  className="text-xs"
                >
                  All Time
                </Button>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en', { 
                    month: 'short', 
                    year: '2-digit' 
                  })}
                  className="text-xs"
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {data.map((channel, index) => (
                  <Area
                    key={channel.channel}
                    type="monotone"
                    dataKey={channel.channel}
                    stackId={viewType === 'stacked' ? "1" : channel.channel}
                    stroke={colors.chartColors[index % colors.chartColors.length]}
                    fill={colors.chartColors[index % colors.chartColors.length]}
                    fillOpacity={viewType === 'stacked' ? 0.7 : 0.4}
                    strokeWidth={2}
                    animationDuration={1200}
                    animationBegin={index * 150}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
