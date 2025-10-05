"use client";

import { useEffect, useState } from "react";
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
import { DataSourceIndicator } from "../data-source-indicator";
import { AdminOnly } from "../rbac/role-guard";
import { useAuth } from "../../lib/auth";
import { useDashboardData } from "../../hooks/useDashboardData";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SummaryMetrics {
  total_spend: number;
  total_contribution: number;
  roi: number;
  top_channel: string;
  total_channels: number;
}

interface ContributionData {
  channels: string[];
  spend: number[];
  contribution: number[];
}

interface ResponseCurvesData {
  channels: string[];
  curves: Record<string, Array<{ spend: number; response: number }>>;
}

export function Dashboard() {
  const { user, logout } = useAuth();
  const {
    summaryMetrics,
    contributionData,
    responseCurves,
    aiInsights,
    isLoading,
    isError,
    error,
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-900">
            Loading dashboard...
          </p>
          <p className="mt-2 text-sm text-gray-500">Preparing your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  MMM Dashboard
                </h1>
                <DataSourceIndicator />
              </div>
              <p className="text-gray-600">
                Welcome back, {user?.full_name || user?.email}
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
        {/* Summary Cards */}
        {summaryMetrics.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Spend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summaryMetrics.data.total_spend.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Contribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summaryMetrics.data.total_contribution.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summaryMetrics.data.roi.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Top Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summaryMetrics.data.top_channel}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* AI Insights Panel */}
        <div className="mb-8">
          <AIInsightsPanel />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contributionData.data && (
            <ContributionChart data={contributionData.data} />
          )}
          {responseCurves.data && (
            <ResponseCurvesChart data={responseCurves.data} />
          )}
        </div>
      </main>
    </div>
  );
}
