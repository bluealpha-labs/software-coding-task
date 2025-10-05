"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toastService } from "./toast";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/auth/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid token
      Cookies.remove("token", { path: "/" });
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const formData = new FormData();
      formData.append("username", email);
      formData.append("password", password);

      const response = await axios.post(`${API_URL}/auth/token`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { access_token } = response.data;
      // Set secure cookie with httpOnly-like behavior
      Cookies.set("token", access_token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });

      // Get user info
      const userResponse = await axios.get(`${API_URL}/auth/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setUser(userResponse.data);
      toastService.success("Login successful!");
      
      // Small delay to ensure cookie is set before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error: any) {
      console.error("Login failed:", error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message = error.response.data?.detail || "Login failed";

        if (status === 401) {
          toastService.error("Invalid email or password");
          throw new Error("Invalid email or password");
        } else if (status === 422) {
          toastService.error("Invalid input data");
          throw new Error("Invalid input data");
        } else if (status >= 500) {
          toastService.error("Server error. Please try again later.");
          throw new Error("Server error. Please try again later.");
        } else {
          toastService.error(message);
          throw new Error(message);
        }
      } else if (error.request) {
        // Network error
        toastService.error("Network error. Please check your connection.");
        throw new Error("Network error. Please check your connection.");
      } else {
        // Other error
        toastService.error("An unexpected error occurred. Please try again.");
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const register = async (
    email: string,
    password: string,
    fullName?: string
  ) => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        full_name: fullName,
      });

      // Auto-login after registration
      await login(email, password);
      toastService.success("Registration successful!");
    } catch (error: any) {
      console.error("Registration failed:", error);

      // Handle different types of errors
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.detail || "Registration failed";

        if (status === 400) {
          if (message.includes("already registered")) {
            throw new Error("Email is already registered");
          } else {
            throw new Error("Invalid registration data");
          }
        } else if (status === 422) {
          throw new Error("Invalid input data. Please check your information.");
        } else if (status >= 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(message);
        }
      } else if (error.request) {
        throw new Error("Network error. Please check your connection.");
      } else {
        throw new Error("An unexpected error occurred. Please try again.");
      }
    }
  };

  const logout = () => {
    Cookies.remove("token", { path: "/" });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
