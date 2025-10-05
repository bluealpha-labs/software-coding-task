import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../lib/auth";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock js-cookie
jest.mock("js-cookie", () => ({
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
}));

// Test component that uses auth
const TestComponent = () => {
  const { user, login, register, logout, loading } = useAuth();

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : user ? (
        <div>
          <div>Welcome, {user.email}</div>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={() => login("test@example.com", "password")}>
            Login
          </button>
          <button
            onClick={() =>
              register("test@example.com", "password", "Test User")
            }
          >
            Register
          </button>
        </div>
      )}
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("handles successful login", async () => {
    const mockToken = "mock-token";
    const mockUser = {
      id: 1,
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
    };

    mockedAxios.post.mockResolvedValueOnce({
      data: { access_token: mockToken },
    });
    mockedAxios.get.mockResolvedValueOnce({
      data: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("Welcome, test@example.com")).toBeInTheDocument();
    });
  });

  it("handles login error", async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        status: 401,
        data: { detail: "Invalid credentials" },
      },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Login"));

    // Should still show login button after error
    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });

  it("handles successful registration", async () => {
    const mockToken = "mock-token";
    const mockUser = {
      id: 1,
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
    };

    mockedAxios.post
      .mockResolvedValueOnce({ data: {} }) // Registration response
      .mockResolvedValueOnce({ data: { access_token: mockToken } }); // Login response
    mockedAxios.get.mockResolvedValueOnce({
      data: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Register")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Register"));

    await waitFor(() => {
      expect(screen.getByText("Welcome, test@example.com")).toBeInTheDocument();
    });
  });

  it("handles logout", async () => {
    const mockUser = {
      id: 1,
      email: "test@example.com",
      full_name: "Test User",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
    };

    // Mock initial auth check
    mockedAxios.get.mockResolvedValueOnce({
      data: mockUser,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Welcome, test@example.com")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });
});
