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
// Using native select for now since shadcn select component is not available
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  mmmApi,
  ResponseCurveResponse,
  AIExplainRequest,
  getCachedExplanation,
  setCachedExplanation,
} from "../../lib/mmm-api";
import { toast } from "react-hot-toast";

interface ResponseCurvesChartProps {
  onExplainRequest?: (request: AIExplainRequest) => void;
}

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#ff00ff",
];

export function ResponseCurvesChart({
  onExplainRequest,
}: ResponseCurvesChartProps) {
  const [data, setData] = useState<ResponseCurveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [explaining, setExplaining] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [availableChannels, setAvailableChannels] = useState<string[]>([]);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchResponseCurve(selectedChannel);
    }
  }, [selectedChannel]);

  const fetchChannels = async () => {
    try {
      // Get available channels from contributions endpoint
      const response = await mmmApi.getContributions();
      const channels = response.data.contributions.map((c) => c.channel);
      setAvailableChannels(channels);
      if (channels.length > 0) {
        setSelectedChannel(channels[0] || "");
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
      toast.error("Failed to load available channels");
    }
  };

  const fetchResponseCurve = async (channel: string) => {
    try {
      setLoading(true);
      const response = await mmmApi.getResponseCurve(channel);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching response curve:", error);
      toast.error("Failed to load response curve data");
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
        chart_type: "response_curve",
        metric: "response",
        series: data.points.map((p) => ({
          spend: p.spend,
          response: p.response,
        })),
        filters: { channel: data.channel },
        date_range: {},
        stats: {
          max_response: Math.max(...data.points.map((p) => p.response)),
          max_spend: Math.max(...data.points.map((p) => p.spend)),
          efficiency: data.metadata?.elasticity || 0,
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
          <CardTitle>Response Curves</CardTitle>
          <CardDescription>Loading response curve data...</CardDescription>
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
          <CardTitle>Response Curves</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            Failed to load response curve data
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="response-curves-chart">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Response Curves</CardTitle>
            <CardDescription>
              Channel response to increased investment
            </CardDescription>
          </div>
          <Button
            onClick={handleExplain}
            disabled={explaining}
            variant="outline"
            size="sm"
          >
            {explaining ? "Analyzing..." : "Explain"}
          </Button>
        </div>
        <div className="mt-4">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Select channel</option>
            {availableChannels.map((channel) => (
              <option key={channel} value={channel}>
                {channel}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data.points}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="spend"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString()}`,
                  name === "response" ? "Response" : name,
                ]}
                labelFormatter={(value) =>
                  `Spend: $${Number(value).toLocaleString()}`
                }
              />
              <Line
                type="monotone"
                dataKey="response"
                stroke="#8884d8"
                strokeWidth={3}
                dot={false}
                name="Response"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {data.metadata && (
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Efficiency</div>
              <div className="font-semibold">
                {(data.metadata.elasticity || 0).toFixed(2)}x
              </div>
            </div>
            <div>
              <div className="text-gray-500">ROI</div>
              <div className="font-semibold">
                {(data.metadata.roi || 0).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-gray-500">Saturation Point</div>
              <div className="font-semibold">
                {data.metadata.saturation_point
                  ? `$${(data.metadata.saturation_point / 1000).toFixed(0)}k`
                  : "N/A"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
