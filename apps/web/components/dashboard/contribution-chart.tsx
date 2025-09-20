"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useContributionData } from "@/hooks/use-mmm-data"
import { useThemeColors } from "@/hooks/use-theme-colors"

type MetricType = 'spend' | 'impressions'

// Professional color palette for channels
const CHANNEL_COLORS = [
  "#2563eb", // Blue - Top performer
  "#7c3aed", // Purple - Strong performer  
  "#059669", // Green - Good performer
  "#dc2626", // Red - Moderate performer
  "#ea580c", // Orange - Underperformer
]

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

function CustomTooltip({ active, payload, metricType }: CustomTooltipProps & { metricType: MetricType }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">{data.channel}</p>
        <p className="text-sm text-muted-foreground">
          Contribution: <span className="font-medium text-foreground">{data.display_percentage}%</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Total Spend: <span className="font-medium text-foreground">${data.total_spend.toLocaleString()}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Impressions: <span className="font-medium text-foreground">{data.total_impressions.toLocaleString()}</span>
        </p>
        {metricType === 'spend' && (
          <p className="text-xs text-primary">
            Based on: Media Spend
          </p>
        )}
        {metricType === 'impressions' && (
          <p className="text-xs text-primary">
            Based on: Impressions Volume
          </p>
        )}
      </div>
    )
  }
  return null
}

function CustomLegend({ payload }: { payload?: any[] }) {
  if (!payload) return null

  return (
    <div className="flex flex-col space-y-2 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="font-medium">{entry.value}</span>
          <span className="text-muted-foreground">
            ({entry.payload?.display_percentage}%)
          </span>
        </div>
      ))}
    </div>
  )
}

export function ContributionChart() {
  const { data, loading, error } = useContributionData()
  const { colors } = useThemeColors()
  const [metricType, setMetricType] = useState<MetricType>('spend')

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-red-600">Error loading contribution data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Key Insight Skeleton */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
              <div className="h-4 bg-primary/20 rounded animate-pulse"></div>
            </div>
            
            {/* Chart Skeleton */}
            <div className="h-64 flex items-center justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-8 border-muted animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              </div>
            </div>
            
            {/* Legend Skeleton */}
            <div className="border-t pt-4 space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-sm bg-muted animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse flex-1 max-w-24"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate contribution percentages based on selected metric
  const calculateContribution = (data: any[], metric: MetricType) => {
    const total = data.reduce((sum, item) => {
      return sum + (metric === 'spend' ? item.total_spend : item.total_impressions)
    }, 0)

    return data.map(item => {
      const value = metric === 'spend' ? item.total_spend : item.total_impressions
      const percentage = ((value / total) * 100)
      return {
        ...item,
        contribution_percentage: Math.round(percentage * 10) / 10, // Keep as number, rounded to 1 decimal
        display_percentage: percentage.toFixed(1) // String for display
      }
    }).sort((a, b) => b.contribution_percentage - a.contribution_percentage)
  }

  // Prepare data for the chart based on selected metric
  const processedData = calculateContribution(data, metricType)
  const chartData = processedData.map((item, index) => ({
    ...item,
    fill: colors.chartColors[index % colors.chartColors.length]
  }))

  // Find the top performer for narrative
  const topPerformer = processedData[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span>Channel Contribution</span>
            <span className="text-sm font-normal text-muted-foreground">
              {metricType === 'spend' ? 'By Media Spend' : 'By Impressions Volume'}
            </span>
          </div>

          {/* Toggle Buttons */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">View by:</span>
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMetricType('spend')}
                className={`text-xs h-7 transition-all ${metricType === 'spend'
                  ? 'bg-background text-foreground shadow-sm border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                💰 Spend
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMetricType('impressions')}
                className={`text-xs h-7 transition-all ${metricType === 'impressions'
                  ? 'bg-background text-foreground shadow-sm border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                👁️ Impressions
              </Button>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

          {/* Key Insight */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-sm font-medium text-primary">
              💡 <strong>{topPerformer.channel}</strong> leads with{" "}
              <strong>{topPerformer.display_percentage}%</strong> of total{" "}
              {metricType === 'spend' ? 'media spend' : 'impressions'}
              {metricType === 'spend' && (
                <span> (${parseInt(topPerformer.total_spend).toLocaleString()})</span>
              )}
              {metricType === 'impressions' && (
                <span> ({parseInt(topPerformer.total_impressions).toLocaleString()} impressions)</span>
              )}
            </p>
          </div>

          {/* Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="contribution_percentage"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill}
                      stroke={entry.fill}
                      strokeWidth={0}
                      style={{
                        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))',
                        transition: 'all 0.2s ease-in-out'
                      }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip metricType={metricType} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="border-t pt-4">
            <CustomLegend payload={chartData.map(item => ({
              value: item.channel,
              color: item.fill,
              payload: item
            }))} />
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
