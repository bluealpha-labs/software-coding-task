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
import { useAIContext, DashboardContext } from "../../hooks/useAIContext";
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
  Info,
  MessageSquare,
  Play,
  Target,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@workspace/ui/lib/utils";

interface AIInsights {
  recommendations: string[];
  anomalies: string[];
  trends: string[];
  confidence_score: number;
}

export function AIInsightsPanel() {
  const { data: insights, isLoading, isError } = useAIInsights();
  const { context, addInteraction, getContextualInsights } = useAIContext();
  const queryClient = useQueryClient();
  const [showChat, setShowChat] = useState(false);
  const [showImplementer, setShowImplementer] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<string>("");

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard", "ai-insights"] });
  };

  const handleImplementRecommendation = (recommendation: string) => {
    setSelectedRecommendation(recommendation);
    setShowImplementer(true);
    addInteraction({
      type: "chart_click",
      data: { action: "implement_recommendation", recommendation },
      context: "AI Insights Panel",
    });
  };

  const handleChatToggle = () => {
    setShowChat(!showChat);
    addInteraction({
      type: "chart_click",
      data: { action: "toggle_chat" },
      context: "AI Insights Panel",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Insights
              </CardTitle>
              <CardDescription>Loading AI-powered insights...</CardDescription>
            </div>
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 animate-spin" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Loading skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted animate-pulse">
                <div className="h-4 w-4 bg-muted-foreground/20 rounded"></div>
              </div>
              <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
              <div className="h-5 w-8 bg-muted animate-pulse rounded ml-auto"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-lg border bg-muted/20"
                >
                  <div className="h-4 w-4 bg-muted animate-pulse rounded mt-0.5 flex-shrink-0"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-muted animate-pulse rounded w-full"></div>
                    <div className="h-3 bg-muted animate-pulse rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !insights) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Insights
              </CardTitle>
              <CardDescription>Unable to load AI insights</CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="p-4 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">
              Failed to Load Insights
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              There was an error loading AI insights. Please try again.
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfidenceVariant = (score: number) => {
    if (score > 0.7) return "default";
    if (score > 0.4) return "secondary";
    return "destructive";
  };

  const confidenceVariant = getConfidenceVariant(insights.confidence_score);

  const renderMainPanel = () => (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span>AI-powered analysis of your marketing performance</span>
              <Badge variant={confidenceVariant} className="w-fit">
                {Math.round(insights.confidence_score * 100)}% confidence
              </Badge>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleChatToggle}
              variant="outline"
              size="sm"
              className="self-start sm:self-center"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with AI
            </Button>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="self-start sm:self-center"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Refresh insights</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Recommendations */}
        {insights.recommendations && insights.recommendations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-foreground">Recommendations</h4>
              <Badge variant="secondary" className="ml-auto">
                {insights.recommendations.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {insights.recommendations.map((rec: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20"
                >
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground leading-relaxed mb-2">
                      {rec}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleImplementRecommendation(rec)}
                        className="text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Implement
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowChat(true);
                          addInteraction({
                            type: "chart_click",
                            data: {
                              action: "ask_about_recommendation",
                              recommendation: rec,
                            },
                            context: "AI Insights Panel",
                          });
                        }}
                        className="text-xs"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Ask AI
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anomalies */}
        {insights.anomalies && insights.anomalies.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-semibold text-foreground">
                Anomalies Detected
              </h4>
              <Badge variant="destructive" className="ml-auto">
                {insights.anomalies.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {insights.anomalies.map((anomaly: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
                >
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {anomaly}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trends */}
        {insights.trends && insights.trends.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-foreground">Trends Analysis</h4>
              <Badge variant="outline" className="ml-auto">
                {insights.trends.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {insights.trends.map((trend: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg border border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20"
                >
                  <Info className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {trend}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No insights message */}
        {(!insights.recommendations || insights.recommendations.length === 0) &&
          (!insights.anomalies || insights.anomalies.length === 0) &&
          (!insights.trends || insights.trends.length === 0) && (
            <div className="text-center py-12">
              <div className="p-4 rounded-full bg-muted/50 w-fit mx-auto mb-4">
                <Brain className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                No Insights Available
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Continue collecting data for more detailed AI analysis and
                recommendations.
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Main AI Insights Panel */}
      {renderMainPanel()}

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
