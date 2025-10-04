"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ContributionData {
  channels: string[];
  spend: number[];
  contribution: number[];
}

interface ContributionChartProps {
  data: ContributionData;
}

export function ContributionChart({ data }: ContributionChartProps) {
  const chartData = data.channels.map((channel, index) => ({
    channel,
    spend: data.spend[index],
    contribution: data.contribution[index],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Channel Performance</CardTitle>
        <CardDescription>Spend vs Contribution by Channel</CardDescription>
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
      </CardContent>
    </Card>
  );
}
