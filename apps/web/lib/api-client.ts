import axios, { AxiosInstance, AxiosResponse } from "axios"
import { API_CONFIG, API_ENDPOINTS } from "./config"

const API_BASE_URL = API_CONFIG.BASE_URL

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("access_token")
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            await this.refreshToken()
            const token = localStorage.getItem("access_token")
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return this.client(originalRequest)
          } catch (refreshError) {
            this.logout()
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem("refresh_token")

    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      refresh_token: refreshToken,
    })

    const { access_token, refresh_token: newRefreshToken } = response.data

    localStorage.setItem("access_token", access_token)
    localStorage.setItem("refresh_token", newRefreshToken)
  }

  private logout(): void {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    window.location.href = "/login"
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await this.client.post(API_ENDPOINTS.AUTH.LOGIN, { email, password })
    return response.data
  }

  async register(username: string, email: string, password: string): Promise<{ access_token: string; refresh_token: string }> {
    const response = await this.client.post(API_ENDPOINTS.AUTH.REGISTER, { username, email, password })
    return response.data
  }

  async getCurrentUser(): Promise<any> {
    const response = await this.client.get(API_ENDPOINTS.AUTH.ME)
    return response.data
  }

  // Generic HTTP methods
  async get<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.client.get(url)
  }

  async post<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post(url, data)
  }

  async put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put(url, data)
  }

  async delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url)
  }
}

export const apiClient = new ApiClient()
export default apiClient