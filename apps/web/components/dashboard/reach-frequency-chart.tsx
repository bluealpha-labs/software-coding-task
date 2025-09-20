"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts"
import { useReachFrequencyAnalysis } from "@/hooks/use-mmm-data"
import { useThemeColors } from "@/hooks/use-theme-colors"
import { useState } from "react"

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold mb-2">Week of {label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Reach: {data.reach.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Frequency: {data.frequency.toFixed(2)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Spend: ${data.spend.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Conversions: {data.conversions.toLocaleString()}</span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export function ReachFrequencyChart() {
  const { data: rfData, loading, error } = useReachFrequencyAnalysis()
  const { colors } = useThemeColors()
  const [viewType, setViewType] = useState<'reach' | 'frequency' | 'both'>('both')

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reach & Frequency Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-red-600">Error loading reach/frequency data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reach & Frequency Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* View Toggle Skeleton */}
            <div className="flex space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-8 w-16 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
            
            {/* Chart Skeleton */}
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!rfData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reach & Frequency Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No reach/frequency data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Reach & Frequency Analysis - TV</span>
          <span className="text-sm font-normal text-muted-foreground">
            156 Weeks
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Explanation */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-blue-700 dark:text-blue-300">Reach:</span>
                  <span className="text-muted-foreground ml-1">Unique people who saw TV ads</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full mt-1 flex-shrink-0"></div>
                <div>
                  <span className="font-medium text-purple-700 dark:text-purple-300">Frequency:</span>
                  <span className="text-muted-foreground ml-1">Average times reached people saw ads</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{rfData.avg_reach.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Avg Reach</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{rfData.avg_frequency.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Avg Frequency</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{rfData.reach_efficiency.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Conv/Reach</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{(rfData.frequency_efficiency / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-muted-foreground">Conv/Freq</p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewType('reach')}
              className={`px-3 py-1 text-xs rounded ${
                viewType === 'reach'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Reach Only
            </button>
            <button
              onClick={() => setViewType('frequency')}
              className={`px-3 py-1 text-xs rounded ${
                viewType === 'frequency'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Frequency Only
            </button>
            <button
              onClick={() => setViewType('both')}
              className={`px-3 py-1 text-xs rounded ${
                viewType === 'both'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Both
            </button>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rfData.time_series}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en', { 
                    month: 'short', 
                    day: 'numeric'
                  })}
                  className="text-xs"
                />
                <YAxis 
                  yAxisId="reach"
                  orientation="left"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  className="text-xs"
                  hide={viewType === 'frequency'}
                />
                <YAxis 
                  yAxisId="frequency"
                  orientation="right"
                  tickFormatter={(value) => value.toFixed(1)}
                  className="text-xs"
                  hide={viewType === 'reach'}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                
                {(viewType === 'reach' || viewType === 'both') && (
                  <Line
                    yAxisId="reach"
                    type="monotone"
                    dataKey="reach"
                    stroke={colors.primary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors.primary }}
                    activeDot={{ r: 5 }}
                    name="Reach"
                    animationDuration={1000}
                  />
                )}
                
                {(viewType === 'frequency' || viewType === 'both') && (
                  <Line
                    yAxisId="frequency"
                    type="monotone"
                    dataKey="frequency"
                    stroke={colors.secondary}
                    strokeWidth={2}
                    dot={{ r: 3, fill: colors.secondary }}
                    activeDot={{ r: 5 }}
                    name="Frequency"
                    animationDuration={1200}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
