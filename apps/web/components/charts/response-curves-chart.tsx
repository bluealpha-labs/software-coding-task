"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
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

interface ResponseCurvesData {
  channels: string[];
  curves: Record<string, Array<{ spend: number; response: number }>>;
}

interface ResponseCurvesChartProps {
  data: ResponseCurvesData;
}

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#00ff00",
  "#ff00ff",
];

export function ResponseCurvesChart({ data }: ResponseCurvesChartProps) {
  // Transform data for the chart
  const maxSpend = Math.max(
    ...Object.values(data.curves)
      .flat()
      .map((d) => d.spend)
  );
  const spendPoints = Array.from({ length: 20 }, (_, i) => (i * maxSpend) / 19);

  const chartData = spendPoints.map((spend) => {
    const point: any = { spend };
    data.channels.forEach((channel, index) => {
      const curve = data.curves[channel];
      const closestPoint = curve.reduce((prev, curr) =>
        Math.abs(curr.spend - spend) < Math.abs(prev.spend - spend)
          ? curr
          : prev
      );
      point[channel] = closestPoint.response;
    });
    return point;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response Curves</CardTitle>
        <CardDescription>
          Channel response to increased investment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
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
                  name,
                ]}
                labelFormatter={(value) =>
                  `Spend: $${Number(value).toLocaleString()}`
                }
              />
              <Legend />
              {data.channels.map((channel, index) => (
                <Line
                  key={channel}
                  type="monotone"
                  dataKey={channel}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
