"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { useAIInsights } from "../../hooks/useDashboardData";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useQueryClient } from "react-query";

interface AIInsights {
  recommendations: string[];
  anomalies: string[];
  trends: string[];
  confidence_score: number;
}

export function AIInsightsPanel() {
  const { data: insights, isLoading, isError } = useAIInsights();
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries(["dashboard", "ai-insights"]);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>Loading AI-powered insights...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </CardTitle>
          <CardDescription>Unable to load AI insights</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  const confidenceColor =
    insights.confidence_score > 0.7
      ? "bg-green-100 text-green-800"
      : insights.confidence_score > 0.4
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>
              AI-powered analysis of your marketing performance
              <Badge className={`ml-2 ${confidenceColor}`}>
                {Math.round(insights.confidence_score * 100)}% confidence
              </Badge>
            </CardDescription>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommendations */}
        {insights.recommendations && insights.recommendations.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {insights.recommendations.map((rec: string, index: number) => (
                <li
                  key={index}
                  className="text-sm p-2 bg-blue-50 rounded-md border-l-4 border-blue-400"
                >
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Anomalies */}
        {insights.anomalies && insights.anomalies.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Anomalies Detected
            </h4>
            <ul className="space-y-2">
              {insights.anomalies.map((anomaly: string, index: number) => (
                <li
                  key={index}
                  className="text-sm p-2 bg-red-50 rounded-md border-l-4 border-red-400"
                >
                  {anomaly}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trends */}
        {insights.trends && insights.trends.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold mb-3">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Trends Analysis
            </h4>
            <ul className="space-y-2">
              {insights.trends.map((trend: string, index: number) => (
                <li
                  key={index}
                  className="text-sm p-2 bg-green-50 rounded-md border-l-4 border-green-400"
                >
                  {trend}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* No insights message */}
        {(!insights.recommendations || insights.recommendations.length === 0) &&
          (!insights.anomalies || insights.anomalies.length === 0) &&
          (!insights.trends || insights.trends.length === 0) && (
            <div className="text-center py-8">
              <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-muted-foreground">
                No specific insights available at this time. Continue collecting
                data for more detailed analysis.
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
