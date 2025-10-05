"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  mmmApi,
  ContributionsResponse,
  AIExplainRequest,
  getCachedExplanation,
  setCachedExplanation,
} from "@/lib/mmm-api";
import { toast } from "react-hot-toast";

interface ContributionChartProps {
  onExplainRequest?: (request: AIExplainRequest) => void;
}

export function ContributionChart({
  onExplainRequest,
}: ContributionChartProps) {
  const [data, setData] = useState<ContributionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await mmmApi.getContributions();
      setData(response.data);
    } catch (error) {
      console.error("Error fetching contribution data:", error);
      toast.error("Failed to load contribution data");
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async () => {
    if (!data) return;

    try {
      setExplaining(true);

      // Create explanation request
      const explainRequest: AIExplainRequest = {
        chart_type: "contribution",
        metric: "contribution",
        series: data.contributions.map((c) => ({
          channel: c.channel,
          value: c.value,
        })),
        filters: {},
        date_range: {},
        stats: {
          total_contribution: data.total_contribution,
          total_spend: data.total_spend,
          roi: data.roi,
        },
      };

      // Check cache first
      const cached = getCachedExplanation(explainRequest);
      if (cached) {
        onExplainRequest?.(explainRequest);
        return;
      }

      // Get AI explanation
      const response = await mmmApi.getAIExplanation(explainRequest);
      setCachedExplanation(explainRequest, response.data);

      onExplainRequest?.(explainRequest);
    } catch (error) {
      console.error("Error getting AI explanation:", error);
      toast.error("Failed to get AI explanation");
    } finally {
      setExplaining(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
          <CardDescription>Loading contribution data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Channel Performance</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            Failed to load contribution data
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.contributions.map((contribution) => ({
    channel: contribution.channel,
    contribution: contribution.value,
    spend: contribution.value * 1.25, // Estimate spend from contribution
  }));

  return (
    <Card data-testid="contribution-chart">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Contribution by Channel</CardDescription>
          </div>
          <Button
            onClick={handleExplain}
            disabled={explaining}
            variant="outline"
            size="sm"
            aria-label="Explain contribution chart"
          >
            {explaining ? "Analyzing..." : "Explain"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="channel"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString()}`,
                  name === "spend" ? "Spend" : "Contribution",
                ]}
              />
              <Bar dataKey="spend" fill="#8884d8" name="Spend" />
              <Bar dataKey="contribution" fill="#82ca9d" name="Contribution" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Total Contribution</div>
            <div className="font-semibold">
              ${data.total_contribution.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Total Spend</div>
            <div className="font-semibold">
              ${data.total_spend.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-gray-500">ROI</div>
            <div className="font-semibold">{data.roi.toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
