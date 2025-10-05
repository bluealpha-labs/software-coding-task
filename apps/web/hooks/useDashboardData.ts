/**
 * React Query hooks for dashboard data with memoization and caching
 */
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import {
  api,
  SummaryMetrics,
  ContributionData,
  ResponseCurvesData,
  AIInsights,
} from "../lib/api";

// Query keys for consistent caching
export const queryKeys = {
  summaryMetrics: ["dashboard", "summary-metrics"] as const,
  contributionData: ["dashboard", "contribution-data"] as const,
  responseCurves: ["dashboard", "response-curves"] as const,
  aiInsights: ["dashboard", "ai-insights"] as const,
  cacheStats: ["dashboard", "cache-stats"] as const,
};

// Summary metrics hook
export function useSummaryMetrics(): UseQueryResult<SummaryMetrics, Error> {
  return useQuery({
    queryKey: queryKeys.summaryMetrics,
    queryFn: async () => {
      const response = await api.getSummaryMetrics();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Contribution data hook
export function useContributionData(): UseQueryResult<ContributionData, Error> {
  return useQuery({
    queryKey: queryKeys.contributionData,
    queryFn: async () => {
      const response = await api.getContributionData();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Response curves hook
export function useResponseCurves(): UseQueryResult<ResponseCurvesData, Error> {
  return useQuery({
    queryKey: queryKeys.responseCurves,
    queryFn: async () => {
      const response = await api.getResponseCurves();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// AI insights hook
export function useAIInsights(): UseQueryResult<AIInsights, Error> {
  return useQuery({
    queryKey: queryKeys.aiInsights,
    queryFn: async () => {
      const response = await api.getAIInsights();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (AI insights change less frequently)
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Cache stats hook
export function useCacheStats(): UseQueryResult<any, Error> {
  return useQuery({
    queryKey: queryKeys.cacheStats,
    queryFn: async () => {
      const response = await api.getCacheStats();
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes (renamed from cacheTime)
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });
}

// Combined dashboard data hook
export function useDashboardData() {
  const summaryMetrics = useSummaryMetrics();
  const contributionData = useContributionData();
  const responseCurves = useResponseCurves();
  const aiInsights = useAIInsights();

  return {
    summaryMetrics,
    contributionData,
    responseCurves,
    aiInsights,
    isLoading:
      summaryMetrics.isLoading ||
      contributionData.isLoading ||
      responseCurves.isLoading,
    isError:
      summaryMetrics.isError ||
      contributionData.isError ||
      responseCurves.isError,
    error:
      summaryMetrics.error || contributionData.error || responseCurves.error,
  };
}
