"use client"

import { RouteGuard } from "@/components/route-guard"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@workspace/ui/components/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { ContributionChart } from "@/components/dashboard/contribution-chart"
import { ResponseCurvesChart } from "@/components/dashboard/response-curves-chart"
import { TimeSeriesChart } from "@/components/dashboard/time-series-chart"
import { GeoPerformanceChart } from "@/components/dashboard/geo-performance-chart"
import { GeoInsightsPanel } from "@/components/dashboard/geo-insights-panel"
import { ReachFrequencyChart } from "@/components/dashboard/reach-frequency-chart"
import { GeoReachChart } from "@/components/dashboard/geo-reach-chart"

function DashboardContent() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">BlueAlpha Marketing Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Google Meridian MMM Performance Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <ThemeToggle />
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section with Key Message */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Channel Performance Overview
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive analysis of your marketing mix performance across 5 channels 
            over 156 weeks, revealing optimization opportunities and efficiency gaps.
          </p>
        </div>

        {/* KPI Overview Cards */}
        <KPICards />

        {/* Main Visualizations Grid */}
        <div className="grid gap-6 lg:gap-8 xl:grid-cols-2">
          {/* Contribution Chart */}
          <div className="order-1">
            <ContributionChart />
          </div>

          {/* Response Curves */}
          <div className="order-2">
            <ResponseCurvesChart />
          </div>
        </div>

        {/* Full-width Time Series */}
        <TimeSeriesChart />

        {/* Geographic Analysis Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Geographic Performance Analysis
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Regional breakdown of marketing performance across 40 geographies, 
              revealing optimization opportunities and efficiency gaps by location.
            </p>
          </div>

          {/* Full-width Geographic Performance Chart */}
          <GeoPerformanceChart />

          {/* Geographic Insights - Now organized in a responsive grid */}
          <GeoInsightsPanel />
        </div>

        {/* Reach/Frequency Analysis Section */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Advanced Media Planning
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Reach and frequency analysis for TV channel across national and geographic levels, 
              enabling optimal media planning and budget allocation decisions.
            </p>
          </div>

          {/* Reach/Frequency Charts - Separate Rows */}
          <div className="space-y-8">
            {/* National Reach/Frequency Analysis */}
            <ReachFrequencyChart />
            
            {/* Geographic Reach Analysis */}
            <GeoReachChart />
          </div>
        </div>

      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <RouteGuard>
      <DashboardContent />
    </RouteGuard>
  )
}