"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { API_ENDPOINTS } from "@/lib/config"

// Types for MMM data
export interface ContributionData {
  channel: string
  contribution_percentage: number
  total_spend: number
  total_impressions: number
}

export interface ResponseCurvePoint {
  spend: number
  incremental_conversions: number
  efficiency: number
}

export interface ResponseCurveData {
  channel: string
  curve_points: ResponseCurvePoint[]
  current_spend: number
  max_efficient_spend: number
}

export interface TimeSeriesPoint {
  date: string
  spend: number
  conversions: number
  impressions: number
}

export interface ChannelTimeSeries {
  channel: string
  data_points: TimeSeriesPoint[]
}

export interface ChannelMetrics {
  channel: string
  total_spend: number
  total_conversions: number
  total_impressions: number
  avg_cpc: number
  avg_cpm: number
  efficiency_score: number
}

export interface MMModelSummary {
  total_weeks: number
  date_range: {
    start: string
    end: string
  }
  total_channels: number
  channels: string[]
  total_spend: number
  total_conversions: number
  top_performing_channel: string
  period: string
}

export interface GeoPerformance {
  geo: string
  total_spend: number
  total_conversions: number
  total_impressions: number
  efficiency_score: number
  population: number
  spend_per_capita: number
  conversions_per_capita: number
}

export interface GeoComparison {
  top_performing_geos: GeoPerformance[]
  bottom_performing_geos: GeoPerformance[]
  geo_insights: string[]
}

export interface ReachFrequencyPoint {
  date: string
  reach: number
  frequency: number
  impressions: number
  spend: number
  conversions: number
}

export interface ReachFrequencyAnalysis {
  channel: string
  time_series: ReachFrequencyPoint[]
  avg_reach: number
  avg_frequency: number
  total_reach: number
  reach_efficiency: number
  frequency_efficiency: number
}

export interface GeoReachFrequency {
  geo: string
  avg_reach: number
  avg_frequency: number
  total_conversions: number
  reach_efficiency: number
  frequency_efficiency: number
  population: number
  reach_penetration: number
}

// Hook for dashboard summary
export function useDashboardSummary() {
  const [data, setData] = useState<MMModelSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<MMModelSummary>(API_ENDPOINTS.DASHBOARD.SUMMARY)
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard summary')
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  return { data, loading, error, refetch: () => setLoading(true) }
}

// Hook for contribution data
export function useContributionData() {
  const [data, setData] = useState<ContributionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContribution = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<ContributionData[]>(API_ENDPOINTS.DASHBOARD.CONTRIBUTION)
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch contribution data')
      } finally {
        setLoading(false)
      }
    }

    fetchContribution()
  }, [])

  return { data, loading, error }
}

// Hook for response curves
export function useResponseCurves() {
  const [data, setData] = useState<ResponseCurveData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResponseCurves = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<ResponseCurveData[]>(API_ENDPOINTS.DASHBOARD.RESPONSE_CURVES)
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch response curves')
      } finally {
        setLoading(false)
      }
    }

    fetchResponseCurves()
  }, [])

  return { data, loading, error }
}

// Hook for time series data
export function useTimeSeriesData(startDate?: string, endDate?: string) {
  const [data, setData] = useState<ChannelTimeSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTimeSeries = async () => {
      try {
        setLoading(true)

        // Build query parameters for date filtering
        const params = new URLSearchParams()
        if (startDate) params.append('start_date', startDate)
        if (endDate) params.append('end_date', endDate)

        const url = `${API_ENDPOINTS.DASHBOARD.TIME_SERIES}${params.toString() ? `?${params.toString()}` : ''}`
        const response = await apiClient.get<ChannelTimeSeries[]>(url)
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch time series data')
      } finally {
        setLoading(false)
      }
    }

    fetchTimeSeries()
  }, [startDate, endDate])

  return { data, loading, error }
}

// Hook for channel metrics
export function useChannelMetrics() {
  const [data, setData] = useState<ChannelMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<ChannelMetrics[]>(`${API_ENDPOINTS.DASHBOARD.SUMMARY.replace('/summary', '/metrics')}`)
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch channel metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  return { data, loading, error }
}

// Hook for geographic performance data
export function useGeoPerformance() {
  const [data, setData] = useState<GeoPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGeoPerformance = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<GeoPerformance[]>("/dashboard/geo/performance")
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch geographic performance')
      } finally {
        setLoading(false)
      }
    }

    fetchGeoPerformance()
  }, [])

  return { data, loading, error }
}

// Hook for geographic comparison data
export function useGeoComparison() {
  const [data, setData] = useState<GeoComparison | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGeoComparison = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<GeoComparison>("/dashboard/geo/comparison")
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch geographic comparison')
      } finally {
        setLoading(false)
      }
    }

    fetchGeoComparison()
  }, [])

  return { data, loading, error }
}

// Hook for reach/frequency analysis
export function useReachFrequencyAnalysis() {
  const [data, setData] = useState<ReachFrequencyAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReachFrequency = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<ReachFrequencyAnalysis>("/dashboard/reach-frequency/analysis")
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reach/frequency analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchReachFrequency()
  }, [])

  return { data, loading, error }
}

// Hook for geographic reach/frequency data
export function useGeoReachFrequency() {
  const [data, setData] = useState<GeoReachFrequency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGeoReachFrequency = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get<GeoReachFrequency[]>("/dashboard/reach-frequency/geo")
        setData(response.data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch geographic reach/frequency')
      } finally {
        setLoading(false)
      }
    }

    fetchGeoReachFrequency()
  }, [])

  return { data, loading, error }
}

