"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts"
import { useGeoPerformance, useGeoComparison } from "@/hooks/use-mmm-data"
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
        <p className="font-semibold">{data.geo}</p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Efficiency:</span>
            <span className="font-medium ml-1">{data.efficiency_score.toFixed(4)} conv/$</span>
          </p>
          <p>
            <span className="text-muted-foreground">Total Spend:</span>
            <span className="font-medium ml-1">${data.total_spend.toLocaleString()}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Per Capita:</span>
            <span className="font-medium ml-1">${data.spend_per_capita.toFixed(2)}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Population:</span>
            <span className="font-medium ml-1">{data.population.toLocaleString()}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function GeoPerformanceChart() {
  const { data: geoData, loading, error } = useGeoPerformance()
  const { data: comparison } = useGeoComparison()
  const { colors } = useThemeColors()
  const [viewMode, setViewMode] = useState<'top10' | 'bottom10' | 'all'>('top10')

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-red-600">Error loading geographic data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Performance</CardTitle>
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

  // Prepare data based on view mode
  let chartData = geoData
  if (viewMode === 'top10') {
    chartData = geoData.slice(0, 10)
  } else if (viewMode === 'bottom10') {
    chartData = geoData.slice(-10)
  }

  // Add color coding based on performance
  const dataWithColors = chartData.map((geo, index) => ({
    ...geo,
    fill: viewMode === 'top10' 
      ? `hsl(142, ${Math.max(70 - index * 7, 30)}%, 45%)` // Green gradient for top performers
      : viewMode === 'bottom10'
      ? `hsl(0, ${Math.max(70 - (9 - index) * 7, 30)}%, 45%)` // Red gradient for bottom performers  
      : geo.efficiency_score > 300 
      ? '#059669' // Green for high performers
      : geo.efficiency_score > 280
      ? '#ea580c' // Orange for medium performers
      : '#dc2626' // Red for low performers
  }))

  const bestGeo = comparison?.top_performing_geos[0]
  const worstGeo = comparison?.bottom_performing_geos[comparison.bottom_performing_geos.length - 1]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Geographic Performance Analysis</span>
          <span className="text-sm font-normal text-muted-foreground">
            40 Geographies
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

          {/* View Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('top10')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'top10'
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Top 10
            </button>
            <button
              onClick={() => setViewMode('bottom10')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'bottom10'
                  ? 'bg-red-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Bottom 10
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1 text-xs rounded ${
                viewMode === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              All 40
            </button>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataWithColors} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="geo" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(0)}`}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Conversions per $', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="efficiency_score" 
                  fill={colors.primary}
                  radius={[2, 2, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
