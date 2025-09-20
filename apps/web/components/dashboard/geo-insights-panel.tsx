"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { useGeoComparison } from "@/hooks/use-mmm-data"
import { TrendingUp, TrendingDown, MapPin, DollarSign, Users } from "lucide-react"

export function GeoInsightsPanel() {
  const { data: comparison, loading, error } = useGeoComparison()

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <p className="text-sm text-red-600">Error loading insights</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Insights Skeleton */}
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-start space-x-2">
                <div className="w-4 h-4 bg-muted rounded animate-pulse mt-0.5"></div>
                <div className="h-4 bg-muted rounded animate-pulse flex-1"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!comparison) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No geographic data available</p>
        </CardContent>
      </Card>
    )
  }

  const topGeos = comparison.top_performing_geos.slice(0, 3)
  const bottomGeos = comparison.bottom_performing_geos.slice(-3)

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
      {/* Key Insights Card */}
      <Card className="lg:col-span-2 xl:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Geographic Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {comparison.geo_insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                <p className="text-sm text-muted-foreground">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card className="lg:col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Top Performers</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topGeos.map((geo, index) => (
              <div key={geo.geo} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100 text-sm">{geo.geo}</p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      {geo.efficiency_score.toFixed(2)} conv/$
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="font-medium">${geo.spend_per_capita.toFixed(2)}/capita</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom Performers */}
      <Card className="lg:col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span>Optimization Opportunities</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bottomGeos.reverse().map((geo, index) => (
              <div key={geo.geo} className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {bottomGeos.length - index}
                  </div>
                  <div>
                    <p className="font-semibold text-red-900 dark:text-red-100 text-sm">{geo.geo}</p>
                    <p className="text-xs text-red-700 dark:text-red-300">
                      {geo.efficiency_score.toFixed(2)} conv/$
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <p className="font-medium">${geo.spend_per_capita.toFixed(2)}/capita</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
