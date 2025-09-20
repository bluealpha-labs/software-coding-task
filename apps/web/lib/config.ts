export const API_CONFIG = {
  BASE_URL: "http://localhost:8000/api/v1",
} as const

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
  },
  DASHBOARD: {
    SUMMARY: "/dashboard/summary",
    CONTRIBUTION: "/dashboard/contribution",
    RESPONSE_CURVES: "/dashboard/response-curves",
    RESPONSE_CURVE_BY_CHANNEL: "/dashboard/response-curves",
    TIME_SERIES: "/dashboard/time-series",
    METRICS: "/dashboard/metrics",
    CHANNELS: "/dashboard/channels",
  },
} as const