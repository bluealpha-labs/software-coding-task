"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Badge } from "@workspace/ui/components/badge";
import { Database, FileText } from "lucide-react";

interface DataSourceInfo {
  using_model: boolean;
  using_mock_data: boolean;
  model_loaded: boolean;
  data_source: "model" | "mock";
}

export function DataSourceIndicator() {
  const { data: dataSourceInfo, isLoading } = useQuery({
    queryKey: ["data-source"],
    queryFn: async () => {
      const response = await api.getDataSourceInfo();
      return response.data as DataSourceInfo;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        <FileText className="h-3 w-3 mr-1" />
        Loading...
      </Badge>
    );
  }

  if (!dataSourceInfo) {
    return null;
  }

  const isUsingModel = dataSourceInfo.using_model;
  const icon = isUsingModel ? Database : FileText;
  const Icon = icon;
  const variant = isUsingModel ? "default" : "secondary";
  const text = isUsingModel ? "Model Data" : "Mock Data";

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {text}
    </Badge>
  );
}
