"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { TrendingUp, Target, DollarSign, Calendar } from "lucide-react"
import { useDashboardSummary } from "@/hooks/use-mmm-data"

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  loading?: boolean
}

function KPICard({ title, value, subtitle, icon, trend = "neutral", loading }: KPICardProps) {
  const trendColor = trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? (
            <div className="h-8 w-24 bg-muted rounded animate-shimmer" />
          ) : (
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {value}
            </span>
          )}
        </div>
        {subtitle && (
          <p className={`text-xs ${trendColor} mt-1`}>
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function KPICards() {
  const { data: summary, loading, error } = useDashboardSummary()

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Unable to Load
              </CardTitle>
              <div className="text-red-500">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">--</div>
              <p className="text-xs text-red-500 mt-1">
                Data unavailable
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    return `$${amount.toLocaleString()}`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    return num.toLocaleString()
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KPICard
        title="Total Media Investment"
        value={loading ? "" : formatCurrency(summary?.total_spend || 0)}
        subtitle="3-year campaign spend"
        icon={<DollarSign className="h-4 w-4" />}
        trend="up"
        loading={loading}
      />
      
      <KPICard
        title="Top Performing Channel"
        value={loading ? "" : summary?.top_performing_channel || ""}
        subtitle="Highest spend allocation"
        icon={<Target className="h-4 w-4" />}
        trend="up"
        loading={loading}
      />
      
      <KPICard
        title="Total Conversions"
        value={loading ? "" : formatNumber(summary?.total_conversions || 0)}
        subtitle="Across all channels"
        icon={<TrendingUp className="h-4 w-4" />}
        trend="up"
        loading={loading}
      />
      
      <KPICard
        title="Analysis Period"
        value={loading ? "" : `${summary?.total_weeks || 0} weeks`}
        subtitle={loading ? "" : summary?.period || ""}
        icon={<Calendar className="h-4 w-4" />}
        trend="neutral"
        loading={loading}
      />
    </div>
  )
}
