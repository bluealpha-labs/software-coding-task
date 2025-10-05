"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { ContributionChart } from "../charts/contribution-chart";
import { ResponseCurvesChart } from "../charts/response-curves-chart";
import { AIInsightsPanel } from "../ai/ai-insights-panel";
import { AIExplanationPanel } from "../ai/ai-explanation-panel";
import { DataSourceIndicator } from "../data-source-indicator";
import { useAuth } from "../../lib/auth";
import { AIExplainRequest } from "../../lib/mmm-api";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [explainRequest, setExplainRequest] = useState<AIExplainRequest | null>(
    null
  );
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);

  const handleExplainRequest = (request: AIExplainRequest) => {
    setExplainRequest(request);
    setIsExplanationOpen(true);
  };

  const handleCloseExplanation = () => {
    setIsExplanationOpen(false);
    setExplainRequest(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  Marketing Mix Modeling Dashboard
                </h1>
                <DataSourceIndicator />
              </div>
              <p className="text-gray-600">
                Welcome back, {user?.full_name || user?.email}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Analyze channel performance and response curves using Google
                Meridian MMM
              </p>
            </div>
            <Button onClick={logout} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* AI Insights Panel */}
        <div className="mb-8">
          <AIInsightsPanel />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contribution Chart */}
          <div className="lg:col-span-1">
            <ContributionChart onExplainRequest={handleExplainRequest} />
          </div>

          {/* Response Curves Chart */}
          <div className="lg:col-span-1">
            <ResponseCurvesChart onExplainRequest={handleExplainRequest} />
          </div>
        </div>

        {/* AI Explanation Panel */}
        <AIExplanationPanel
          isOpen={isExplanationOpen}
          onClose={handleCloseExplanation}
          explainRequest={explainRequest}
        />
      </main>
    </div>
  );
}
