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
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ReferenceDot
} from "recharts"
import { useResponseCurves } from "@/hooks/use-mmm-data"
import { useThemeColors } from "@/hooks/use-theme-colors"
import { useState } from "react"

// Same color palette as contribution chart for consistency
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
    return (
      <div className="bg-background border rounded-lg p-3 shadow-lg">
        <p className="font-semibold">Spend: ${Number(label).toLocaleString()}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.dataKey}:</span>
            <span className="font-medium">
              {Number(entry.value).toLocaleString()} incremental conversions
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function ResponseCurvesChart() {
  const { data, loading, error } = useResponseCurves()
  const { colors } = useThemeColors()
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Curves</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-red-600">Error loading response curves</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Response Curves</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform data for the chart - All channels now use same spend range
  const chartData: any[] = []

  // Since all channels now have same spend points, we can use any channel's curve_points for spend values
  if (data.length > 0) {
    const numPoints = data[0].curve_points.length

    for (let i = 0; i < numPoints; i++) {
      const point: any = {
        spend: data[0].curve_points[i].spend  // All channels have same spend values now
      }

      // Add each channel's incremental conversions for this spend level
      data.forEach(channel => {
        if (channel.curve_points[i]) {
          point[channel.channel] = channel.curve_points[i].incremental_conversions
        }
      })

      chartData.push(point)
    }
  }

  // Find most and least efficient channels
  const channelEfficiencies = data.map(channel => {
    const lastPoint = channel.curve_points[channel.curve_points.length - 1]
    return {
      channel: channel.channel,
      efficiency: lastPoint ? lastPoint.efficiency : 0
    }
  }).sort((a, b) => b.efficiency - a.efficiency)

  const mostEfficient = channelEfficiencies[0]
  const leastEfficient = channelEfficiencies[channelEfficiencies.length - 1]

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  const visibleChannels = selectedChannels.length > 0 ? selectedChannels : data.map(d => d.channel)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col space-y-1">
          <span>Response curves by marketing channel (top 5)</span>
          <span className="text-sm font-normal text-muted-foreground">
            Incremental conversions
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">

          {/* Channel Toggle Buttons */}
          <div className="flex flex-wrap gap-2">
            {data.map((channel, index) => (
              <button
                key={channel.channel}
                onClick={() => toggleChannel(channel.channel)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  visibleChannels.includes(channel.channel)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
                style={visibleChannels.includes(channel.channel) ? {
                  backgroundColor: colors.chartColors[index % colors.chartColors.length],
                  borderColor: colors.chartColors[index % colors.chartColors.length]
                } : {}}
              >
                {channel.channel}
              </button>
            ))}
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="spend"
                  tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  label={{
                    value: 'Spend ($)',
                    position: 'insideBottom',
                    offset: -10,
                    style: { textAnchor: 'middle', fill: 'currentColor', fontSize: '12px' }
                  }}
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  className="text-xs"
                  tick={{ fill: 'currentColor', fontSize: 12 }}
                  label={{
                    value: 'Incremental Conversions',
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fill: 'currentColor', fontSize: '12px' }
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                    color: 'currentColor'
                  }}
                />
                
                {data.map((channel, index) => (
                  visibleChannels.includes(channel.channel) && (
                    <Line
                      key={channel.channel}
                      type="monotone"
                      dataKey={channel.channel}
                      stroke={colors.chartColors[index % colors.chartColors.length]}
                      strokeWidth={3}
                      dot={false}  // Remove all dots from the line
                      activeDot={{
                        r: 6,
                        strokeWidth: 2,
                        fill: colors.chartColors[index % colors.chartColors.length],
                        stroke: '#fff',
                        style: { filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))' }
                      }}
                      animationDuration={1000}
                      animationBegin={index * 100}
                    />
                  )
                ))}

                {/* Current spend markers - show current spend level for each channel */}
                {data.map((channel, index) => {
                  if (!visibleChannels.includes(channel.channel)) return null

                  // Find the point closest to current spend
                  const currentSpend = channel.current_spend
                  const closestPoint = channel.curve_points.reduce((closest, point) => {
                    return Math.abs(point.spend - currentSpend) < Math.abs(closest.spend - currentSpend)
                      ? point
                      : closest
                  })

                  return (
                    <ReferenceDot
                      key={`current-${channel.channel}`}
                      x={currentSpend}
                      y={closestPoint.incremental_conversions}
                      r={8}
                      fill={colors.chartColors[index % colors.chartColors.length]}
                      stroke="#fff"
                      strokeWidth={3}
                      style={{
                        filter: 'drop-shadow(0px 2px 6px rgba(0,0,0,0.3))',
                        cursor: 'pointer'
                      }}
                    />
                  )
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </CardContent>
    </Card>
  )
}
