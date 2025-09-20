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
  ResponsiveContainer 
} from "recharts"
import { useGeoReachFrequency } from "@/hooks/use-mmm-data"
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
        <p className="font-semibold mb-2">{data.geo}</p>
        <div className="space-y-1 text-sm">
          <p>
            <span className="text-muted-foreground">Reach Penetration:</span>
            <span className="font-medium ml-1">{(data.reach_penetration * 100).toFixed(1)}%</span>
          </p>
          <p>
            <span className="text-muted-foreground">Avg Reach:</span>
            <span className="font-medium ml-1">{data.avg_reach.toLocaleString()}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Avg Frequency:</span>
            <span className="font-medium ml-1">{data.avg_frequency.toFixed(2)}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Population:</span>
            <span className="font-medium ml-1">{data.population.toLocaleString()}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Reach Efficiency:</span>
            <span className="font-medium ml-1">{data.reach_efficiency.toFixed(4)}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function GeoReachChart() {
  const { data: geoRfData, loading, error } = useGeoReachFrequency()
  const [sortBy, setSortBy] = useState<'penetration' | 'reach' | 'efficiency'>('penetration')

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Reach Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-red-600">Error loading geographic reach data</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Reach Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sort Toggle Skeleton */}
            <div className="flex space-x-2">
              {[1,2,3].map(i => (
                <div key={i} className="h-8 w-20 bg-muted rounded animate-pulse"></div>
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

  // Sort data based on selected criteria
  const sortedData = [...geoRfData].sort((a, b) => {
    switch (sortBy) {
      case 'penetration':
        return b.reach_penetration - a.reach_penetration
      case 'reach':
        return b.avg_reach - a.avg_reach
      case 'efficiency':
        return b.reach_efficiency - a.reach_efficiency
      default:
        return 0
    }
  })

  // Color code based on performance
  const dataWithColors = sortedData.map((item, index) => ({
    ...item,
    fill: sortBy === 'penetration'
      ? item.reach_penetration > 0.5 ? '#059669' : item.reach_penetration > 0.4 ? '#ea580c' : '#dc2626'
      : sortBy === 'reach'
      ? item.avg_reach > 400000 ? '#059669' : item.avg_reach > 200000 ? '#ea580c' : '#dc2626'
      : item.reach_efficiency > 30 ? '#059669' : item.reach_efficiency > 20 ? '#ea580c' : '#dc2626'
  }))

  const getYAxisDataKey = () => {
    switch (sortBy) {
      case 'penetration':
        return 'reach_penetration'
      case 'reach':
        return 'avg_reach'
      case 'efficiency':
        return 'reach_efficiency'
      default:
        return 'reach_penetration'
    }
  }

  const formatYAxis = (value: number) => {
    switch (sortBy) {
      case 'penetration':
        return `${(value * 100).toFixed(0)}%`
      case 'reach':
        return `${(value / 1000).toFixed(0)}K`
      case 'efficiency':
        return value.toFixed(1)
      default:
        return value.toString()
    }
  }

  const getYAxisLabel = () => {
    switch (sortBy) {
      case 'penetration':
        return 'Reach Penetration %'
      case 'reach':
        return 'Average Reach'
      case 'efficiency':
        return 'Reach Efficiency'
      default:
        return ''
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Geographic Reach Analysis - TV</span>
          <span className="text-sm font-normal text-muted-foreground">
            40 Geographies
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Sort Toggle */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSortBy('penetration')}
              className={`px-3 py-1 text-xs rounded ${
                sortBy === 'penetration'
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Penetration
            </button>
            <button
              onClick={() => setSortBy('reach')}
              className={`px-3 py-1 text-xs rounded ${
                sortBy === 'reach'
                  ? 'bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Reach
            </button>
            <button
              onClick={() => setSortBy('efficiency')}
              className={`px-3 py-1 text-xs rounded ${
                sortBy === 'efficiency'
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Efficiency
            </button>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataWithColors} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="geo" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12, fill: 'currentColor' }}
                  label={{
                    value: getYAxisLabel(),
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: 'currentColor', fontSize: '12px' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey={getYAxisDataKey()}
                  fill="#2563eb"
                  radius={[2, 2, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
            <div className="text-center">
              <p className="font-semibold text-green-600">Top Penetration</p>
              <p className="text-muted-foreground">
                {dataWithColors[0]?.geo}: {(dataWithColors[0]?.reach_penetration * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-blue-600">Highest Reach</p>
              <p className="text-muted-foreground">
                {[...geoRfData].sort((a, b) => b.avg_reach - a.avg_reach)[0]?.geo}: {[...geoRfData].sort((a, b) => b.avg_reach - a.avg_reach)[0]?.avg_reach.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-purple-600">Best Efficiency</p>
              <p className="text-muted-foreground">
                {[...geoRfData].sort((a, b) => b.reach_efficiency - a.reach_efficiency)[0]?.geo}: {[...geoRfData].sort((a, b) => b.reach_efficiency - a.reach_efficiency)[0]?.reach_efficiency.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
