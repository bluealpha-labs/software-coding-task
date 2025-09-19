"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { API_CONFIG, API_ENDPOINTS } from "./config"

interface User {
  id: string
  username: string
  email: string
  created_at: string
}

interface AuthContextType {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem("access_token")
        const storedRefreshToken = localStorage.getItem("refresh_token")

        if (storedToken && storedRefreshToken) {
          setAccessToken(storedToken)
          await getCurrentUser(storedToken)
        }
      } catch (error) {
        console.error("Failed to initialize auth:", error)
        logout()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const getCurrentUser = async (token: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to get user")
    }

    const userData = await response.json()
    setUser(userData)
  }

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Login failed")
    }

    const { access_token, refresh_token } = await response.json()

    localStorage.setItem("access_token", access_token)
    localStorage.setItem("refresh_token", refresh_token)
    setAccessToken(access_token)

    await getCurrentUser(access_token)
  }

  const register = async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || "Registration failed")
    }

    const { access_token, refresh_token } = await response.json()

    localStorage.setItem("access_token", access_token)
    localStorage.setItem("refresh_token", refresh_token)
    setAccessToken(access_token)

    await getCurrentUser(access_token)
  }

  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem("refresh_token")

    if (!storedRefreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: storedRefreshToken }),
    })

    if (!response.ok) {
      logout()
      throw new Error("Token refresh failed")
    }

    const { access_token, refresh_token: newRefreshToken } = await response.json()

    localStorage.setItem("access_token", access_token)
    localStorage.setItem("refresh_token", newRefreshToken)
    setAccessToken(access_token)
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    setAccessToken(null)
    setUser(null)
    router.push("/login")
  }

  const value = {
    user,
    accessToken,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}