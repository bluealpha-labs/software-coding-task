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
import { useAuth } from "../../lib/auth";
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
  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [contributionData, setContributionData] =
    useState<ContributionData | null>(null);
  const [responseCurvesData, setResponseCurvesData] =
    useState<ResponseCurvesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Use consistent token retrieval from cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const [summaryRes, contributionRes, responseRes] = await Promise.all([
        axios.get(`${API_URL}/api/summary-metrics`, { headers }),
        axios.get(`${API_URL}/api/contribution-data`, { headers }),
        axios.get(`${API_URL}/api/response-curves`, { headers }),
      ]);

      setSummary(summaryRes.data);
      setContributionData(contributionRes.data);
      setResponseCurvesData(responseRes.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-lg">Loading dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">
                MMM Dashboard
              </h1>
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
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Spend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${summary.total_spend.toLocaleString()}
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
                  ${summary.total_contribution.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {summary.roi.toFixed(1)}%
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
                <div className="text-2xl font-bold">{summary.top_channel}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contributionData && <ContributionChart data={contributionData} />}
          {responseCurvesData && (
            <ResponseCurvesChart data={responseCurvesData} />
          )}
        </div>
      </main>
    </div>
  );
}
