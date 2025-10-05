/**
 * Centralized API client with React Query integration for memoized API calls
 */
import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      Cookies.remove("token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// API Types
export interface SummaryMetrics {
  total_spend: number;
  total_contribution: number;
  roi: number;
  top_channel: string;
  total_channels: number;
}

export interface ContributionData {
  channels: string[];
  spend: number[];
  contribution: number[];
}

export interface ResponseCurvesData {
  channels: string[];
  curves: Record<string, Array<{ spend: number; response: number }>>;
}

export interface AIInsights {
  recommendations: string[];
  anomalies: string[];
  trends: string[];
  confidence_score: number;
}

// API Functions
export const api = {
  // Dashboard data
  getSummaryMetrics: (): Promise<AxiosResponse<SummaryMetrics>> =>
    apiClient.get("/api/summary-metrics"),

  getContributionData: (): Promise<AxiosResponse<ContributionData>> =>
    apiClient.get("/api/contribution-data"),

  getResponseCurves: (): Promise<AxiosResponse<ResponseCurvesData>> =>
    apiClient.get("/api/response-curves"),

  // AI-powered insights
  getAIInsights: (): Promise<AxiosResponse<AIInsights>> =>
    apiClient.get("/api/ai-insights"),

  // Cache stats
  getCacheStats: (): Promise<AxiosResponse<any>> =>
    apiClient.get("/api/cache-stats"),

  // Data source info
  getDataSourceInfo: (): Promise<AxiosResponse<any>> =>
    apiClient.get("/api/data-source"),

  // Health check
  getHealth: (): Promise<AxiosResponse<any>> => apiClient.get("/health"),
};

export default apiClient;
