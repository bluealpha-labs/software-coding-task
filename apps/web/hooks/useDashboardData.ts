/**
 * React Query hooks for dashboard data with memoization and caching
 */
import { useQuery, UseQueryResult } from "react-query";
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
  return useQuery(
    queryKeys.summaryMetrics,
    async () => {
      const response = await api.getSummaryMetrics();
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}

// Contribution data hook
export function useContributionData(): UseQueryResult<ContributionData, Error> {
  return useQuery(
    queryKeys.contributionData,
    async () => {
      const response = await api.getContributionData();
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}

// Response curves hook
export function useResponseCurves(): UseQueryResult<ResponseCurvesData, Error> {
  return useQuery(
    queryKeys.responseCurves,
    async () => {
      const response = await api.getResponseCurves();
      return response.data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}

// AI insights hook
export function useAIInsights(): UseQueryResult<AIInsights, Error> {
  return useQuery(
    queryKeys.aiInsights,
    async () => {
      const response = await api.getAIInsights();
      return response.data;
    },
    {
      staleTime: 10 * 60 * 1000, // 10 minutes (AI insights change less frequently)
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    }
  );
}

// Cache stats hook
export function useCacheStats(): UseQueryResult<any, Error> {
  return useQuery(
    queryKeys.cacheStats,
    async () => {
      const response = await api.getCacheStats();
      return response.data;
    },
    {
      staleTime: 30 * 1000, // 30 seconds
      cacheTime: 2 * 60 * 1000, // 2 minutes
      refetchInterval: 30 * 1000, // Refetch every 30 seconds
      refetchOnWindowFocus: true,
    }
  );
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
