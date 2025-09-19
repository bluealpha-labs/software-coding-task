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
} as const