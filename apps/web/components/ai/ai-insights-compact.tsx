"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { useAIInsights } from "../../hooks/useDashboardData";
import { useAIContext } from "../../hooks/useAIContext";
import { AIChatInterface } from "./ai-chat-interface";
import { RecommendationImplementer } from "./recommendation-implementer";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  CheckCircle,
  XCircle,
  MessageSquare,
  Play,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@workspace/ui/lib/utils";

interface AIInsights {
  recommendations: string[];
  anomalies: string[];
  trends: string[];
  confidence_score: number;
}

export function AIInsightsCompact() {
  const { data: insights, isLoading, isError } = useAIInsights();
  const { context, addInteraction } = useAIContext();
  const queryClient = useQueryClient();
  const [showChat, setShowChat] = useState(false);
  const [showImplementer, setShowImplementer] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard", "ai-insights"] });
  };

  const handleImplementRecommendation = (recommendation: string) => {
    setSelectedRecommendation(recommendation);
    setShowImplementer(true);
    setShowChat(false);
  };

  const handleChatToggle = () => {
    setShowChat(!showChat);
    setShowImplementer(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
            <span className="ml-3 text-gray-600">Analyzing data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-red-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Failed to load AI insights</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const mockInsights: AIInsights = {
    recommendations: [
      "Increase TV spend by 15% for better reach",
      "Optimize digital campaigns for Q4 performance",
      "Consider radio advertising for brand awareness",
    ],
    anomalies: [
      "Unusual spike in social media engagement",
      "Print advertising showing lower ROI than expected",
    ],
    trends: [
      "Digital channels showing 23% growth",
      "TV remains the top performing channel",
      "Social media engagement trending upward",
    ],
    confidence_score: 0.87,
  };

  const insightsData = insights || mockInsights;

  return (
    <div className="space-y-4">
      {/* Main AI Insights Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <CardTitle>AI Insights</CardTitle>
              <Badge variant="secondary" className="ml-2">
                {Math.round(insightsData.confidence_score * 100)}% confidence
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleChatToggle}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isExpanded && (
            <div className="space-y-4">
              {/* Recommendations */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Recommendations
                </h4>
                <div className="space-y-2">
                  {insightsData.recommendations.slice(0, 2).map((rec: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <p className="text-sm text-gray-700 flex-1">{rec}</p>
                      <Button
                        size="sm"
                        onClick={() => handleImplementRecommendation(rec)}
                        className="ml-2 flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        Implement
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Anomalies */}
              {insightsData.anomalies.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Anomalies
                  </h4>
                  <div className="space-y-2">
                    {insightsData.anomalies.slice(0, 1).map((anomaly: string, index: number) => (
                      <div
                        key={index}
                        className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                      >
                        <p className="text-sm text-orange-800">{anomaly}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trends */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Trends
                </h4>
                <div className="space-y-2">
                  {insightsData.trends.slice(0, 2).map((trend: string, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <p className="text-sm text-green-800">{trend}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Chat Interface */}
      {showChat && (
        <AIChatInterface
          dashboardContext={{
            currentView: "insights" as const,
            selectedChart: "ai-insights",
            dataSnapshot: context.dataSnapshot,
            userInteractions: context.userInteractions,
          }}
          onImplementRecommendation={handleImplementRecommendation}
          onExplainChart={(chartType, data) => {
            addInteraction({
              type: "chart_click",
              data: { action: "explain_chart", chartType, data },
              context: "AI Chat Interface",
            });
          }}
        />
      )}

      {/* Recommendation Implementer */}
      {showImplementer && selectedRecommendation && (
        <RecommendationImplementer
          recommendation={selectedRecommendation}
          onImplementationComplete={(plan) => {
            // Implementation completed
            setShowImplementer(false);
            setSelectedRecommendation("");
          }}
          onCancel={() => {
            setShowImplementer(false);
            setSelectedRecommendation("");
          }}
        />
      )}
    </div>
  );
}
