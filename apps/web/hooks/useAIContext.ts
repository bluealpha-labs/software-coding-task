/**
 * Hook for managing AI context awareness
 * Provides the AI with current dashboard state, user interactions, and data context
 */

import { useState, useEffect, useCallback } from "react";
import { useDashboardData } from "./useDashboardData";

export interface DashboardContext {
  currentView?: "overview" | "contributions" | "response_curves" | "insights";
  selectedChart?: string;
  selectedMetric?: string;
  timeRange?: string;
  filters?: Record<string, any>;
  userInteractions?: UserInteraction[];
  dataSnapshot?: DataSnapshot;
}

export interface UserInteraction {
  id: string;
  type:
    | "chart_click"
    | "filter_change"
    | "time_range_change"
    | "metric_selection";
  timestamp: Date;
  data: any;
  context: string;
}

export interface DataSnapshot {
  summaryMetrics?: any;
  contributionData?: any;
  responseCurves?: any;
  aiInsights?: any;
  lastUpdated: Date;
}

export interface AIContextState {
  context: DashboardContext;
  updateContext: (updates: Partial<DashboardContext>) => void;
  addInteraction: (
    interaction: Omit<UserInteraction, "id" | "timestamp">
  ) => void;
  getContextualInsights: () => string[];
  getRecommendationContext: () => RecommendationContext;
}

export interface RecommendationContext {
  currentPerformance: {
    topChannels: string[];
    underperformingChannels: string[];
    efficiencyMetrics: Record<string, number>;
  };
  optimizationOpportunities: {
    budgetReallocation: string[];
    channelExpansion: string[];
    efficiencyImprovements: string[];
  };
  userBehavior: {
    frequentlyViewedCharts: string[];
    recentInteractions: string[];
    preferredMetrics: string[];
  };
}

export function useAIContext(): AIContextState {
  const dashboardData = useDashboardData();
  const [context, setContext] = useState<DashboardContext>({
    currentView: "overview",
    userInteractions: [],
    dataSnapshot: undefined,
  });

  // Update context when dashboard data changes
  useEffect(() => {
    if (
      dashboardData.summaryMetrics?.data ||
      dashboardData.contributionData?.data ||
      dashboardData.responseCurves?.data
    ) {
      const dataSnapshot: DataSnapshot = {
        summaryMetrics: dashboardData.summaryMetrics?.data,
        contributionData: dashboardData.contributionData?.data,
        responseCurves: dashboardData.responseCurves?.data,
        aiInsights: dashboardData.aiInsights?.data,
        lastUpdated: new Date(),
      };

      setContext((prev) => {
        // Only update if the data has actually changed
        if (
          JSON.stringify(prev.dataSnapshot) === JSON.stringify(dataSnapshot)
        ) {
          return prev;
        }
        return {
          ...prev,
          dataSnapshot,
        };
      });
    }
  }, [
    dashboardData.summaryMetrics?.data,
    dashboardData.contributionData?.data,
    dashboardData.responseCurves?.data,
    dashboardData.aiInsights?.data,
  ]);

  const updateContext = useCallback((updates: Partial<DashboardContext>) => {
    setContext((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const addInteraction = useCallback(
    (interaction: Omit<UserInteraction, "id" | "timestamp">) => {
      const newInteraction: UserInteraction = {
        ...interaction,
        id: `interaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      setContext((prev) => ({
        ...prev,
        userInteractions: [
          ...(prev.userInteractions || []).slice(-9),
          newInteraction,
        ], // Keep last 10 interactions
      }));
    },
    []
  );

  const getContextualInsights = useCallback((): string[] => {
    const insights: string[] = [];
    const { dataSnapshot, currentView, userInteractions = [] } = context;

    if (!dataSnapshot) return insights;

    // Analyze current view context
    switch (currentView) {
      case "contributions":
        if (dataSnapshot.contributionData?.contributions) {
          const contributions = dataSnapshot.contributionData.contributions;
          const topChannel = contributions.reduce(
            (max: any, curr: any) => (curr.value > max.value ? curr : max),
            contributions[0]
          );
          insights.push(
            `Currently viewing contribution analysis with ${topChannel.channel} as top performer`
          );
        }
        break;

      case "response_curves":
        insights.push(
          "User is analyzing response curves for optimization opportunities"
        );
        break;

      case "insights":
        insights.push(
          "User is reviewing AI-generated insights and recommendations"
        );
        break;
    }

    // Analyze user behavior patterns
    const recentInteractions = userInteractions.slice(-5);
    const interactionTypes = recentInteractions.map((i) => i.type);

    if (interactionTypes.includes("chart_click")) {
      insights.push("User is actively exploring specific data points");
    }

    if (interactionTypes.includes("filter_change")) {
      insights.push("User is refining analysis with different filters");
    }

    // Analyze data patterns
    if (dataSnapshot.aiInsights?.recommendations?.length > 0) {
      insights.push(
        `AI has identified ${dataSnapshot.aiInsights.recommendations.length} optimization opportunities`
      );
    }

    if (dataSnapshot.aiInsights?.anomalies?.length > 0) {
      insights.push(
        `System detected ${dataSnapshot.aiInsights.anomalies.length} data anomalies requiring attention`
      );
    }

    return insights;
  }, [context]);

  const getRecommendationContext = useCallback((): RecommendationContext => {
    const { dataSnapshot, userInteractions = [] } = context;

    // Analyze current performance
    const topChannels: string[] = [];
    const underperformingChannels: string[] = [];
    const efficiencyMetrics: Record<string, number> = {};

    if (dataSnapshot?.contributionData?.contributions) {
      const contributions = dataSnapshot.contributionData.contributions;
      const sortedChannels = contributions.sort(
        (a: any, b: any) => b.value - a.value
      );

      // Top 3 channels
      topChannels.push(
        ...sortedChannels.slice(0, 3).map((c: any) => c.channel)
      );

      // Bottom 2 channels (underperforming)
      underperformingChannels.push(
        ...sortedChannels.slice(-2).map((c: any) => c.channel)
      );

      // Calculate efficiency metrics
      contributions.forEach((contrib: any) => {
        efficiencyMetrics[contrib.channel] =
          contrib.value / (contrib.value * 0.1); // Mock efficiency calculation
      });
    }

    // Analyze user behavior
    const frequentlyViewedCharts = userInteractions
      .filter((i: UserInteraction) => i.type === "chart_click")
      .reduce(
        (acc: Record<string, number>, interaction: UserInteraction) => {
          const chart = interaction.data?.chartType || "unknown";
          acc[chart] = (acc[chart] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

    const recentInteractions = userInteractions
      .slice(-5)
      .map((i: UserInteraction) => i.type);

    const preferredMetrics = userInteractions
      .filter((i: UserInteraction) => i.type === "metric_selection")
      .map((i: UserInteraction) => i.data?.metric)
      .filter(Boolean);

    // Generate optimization opportunities
    const budgetReallocation: string[] = [];
    const channelExpansion: string[] = [];
    const efficiencyImprovements: string[] = [];

    if (topChannels.length > 0) {
      budgetReallocation.push(
        `Increase budget for ${topChannels[0]} (top performer)`
      );
      channelExpansion.push(`Explore similar channels to ${topChannels[0]}`);
    }

    if (underperformingChannels.length > 0) {
      budgetReallocation.push(
        `Reduce budget for ${underperformingChannels[0]} (underperforming)`
      );
      efficiencyImprovements.push(
        `Optimize targeting for ${underperformingChannels[0]}`
      );
    }

    return {
      currentPerformance: {
        topChannels,
        underperformingChannels,
        efficiencyMetrics,
      },
      optimizationOpportunities: {
        budgetReallocation,
        channelExpansion,
        efficiencyImprovements,
      },
      userBehavior: {
        frequentlyViewedCharts: Object.keys(frequentlyViewedCharts),
        recentInteractions,
        preferredMetrics,
      },
    };
  }, [context]);

  return {
    context,
    updateContext,
    addInteraction,
    getContextualInsights,
    getRecommendationContext,
  };
}
