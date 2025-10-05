import { test, expect } from "@playwright/test";

test.describe("Component Tests", () => {
  test.describe("Authentication Components", () => {
    test("LoginForm should render and validate correctly", async ({ page }) => {
      await page.goto("/auth");

      // Check form elements are present
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Test email validation
      await page.fill('input[type="email"]', "invalid-email");
      await page.fill('input[type="password"]', "ValidPassword123");
      await page.click('button[type="submit"]');

      await expect(
        page.locator("text=Please enter a valid email address")
      ).toBeVisible();
    });

    test("RegisterForm should handle all validation rules", async ({
      page,
    }) => {
      await page.goto("/auth");

      // Switch to register tab
      await page.click("text=Create Account");

      // Test all validation scenarios
      const testCases = [
        {
          email: "invalid",
          password: "weak",
          fullName: "A".repeat(300),
          expectedErrors: [
            "Please enter a valid email address",
            "Password must be at least 8 characters",
            "Full name must be less than 255 characters",
          ],
        },
        {
          email: "test@example.com",
          password: "ValidPassword123",
          fullName: "John Doe",
          expectedErrors: [],
        },
      ];

      for (const testCase of testCases) {
        await page.fill('input[type="email"]', testCase.email);
        await page.fill('input[type="password"]', testCase.password);
        if (testCase.fullName) {
          await page.fill('input[name="fullName"]', testCase.fullName);
        }

        await page.click('button[type="submit"]');

        for (const expectedError of testCase.expectedErrors) {
          await expect(page.locator(`text=${expectedError}`)).toBeVisible();
        }

        // Clear form for next test
        await page.reload();
        await page.click("text=Create Account");
      }
    });
  });

  test.describe("AI Components", () => {
    test("AIInsightsPanel should display insights correctly", async ({
      page,
    }) => {
      await page.goto("/");

      // Check AI insights panel is visible
      await expect(
        page.locator('[data-testid="ai-insights-panel"]')
      ).toBeVisible();

      // Check for recommendations, anomalies, and trends sections
      await expect(page.locator("text=Recommendations")).toBeVisible();
      await expect(page.locator("text=Anomalies Detected")).toBeVisible();
      await expect(page.locator("text=Trends Analysis")).toBeVisible();
    });

    test("AIChatInterface should handle conversations", async ({ page }) => {
      await page.goto("/");

      // Open AI chat
      await page.click('[data-testid="ai-chat-button"]');

      // Check chat interface is open
      await expect(
        page.locator('[data-testid="ai-chat-interface"]')
      ).toBeVisible();

      // Test sending messages
      await page.fill('[data-testid="ai-chat-input"]', "Hello AI");
      await page.click('[data-testid="ai-chat-send"]');

      // Should show user message
      await expect(page.locator("text=Hello AI")).toBeVisible();

      // Should show AI response
      await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
    });

    test("RecommendationImplementer should create implementation plans", async ({
      page,
    }) => {
      await page.goto("/");

      // Click on implement button for a recommendation
      await page.click('[data-testid="implement-recommendation-button"]');

      // Should open implementation modal
      await expect(
        page.locator('[data-testid="recommendation-implementer"]')
      ).toBeVisible();

      // Should show implementation plan
      await expect(page.locator("text=Implementation Plan")).toBeVisible();
      await expect(page.locator("text=Expected Impact")).toBeVisible();
      await expect(page.locator("text=Timeline")).toBeVisible();

      // Test implementation steps
      await page.click('[data-testid="start-implementation"]');

      // Should show progress
      await expect(
        page.locator('[data-testid="implementation-progress"]')
      ).toBeVisible();
    });
  });

  test.describe("Chart Components", () => {
    test("ContributionChart should render and be interactive", async ({
      page,
    }) => {
      await page.goto("/");

      // Check chart is visible
      await expect(
        page.locator('[data-testid="contribution-chart"]')
      ).toBeVisible();

      // Test chart interactions
      await page.click('[data-testid="explain-chart-button"]');

      // Should open explanation modal
      await expect(
        page.locator('[data-testid="chart-explanation"]')
      ).toBeVisible();
    });

    test("ResponseCurvesChart should handle channel selection", async ({
      page,
    }) => {
      await page.goto("/");

      // Check chart is visible
      await expect(
        page.locator('[data-testid="response-curves-chart"]')
      ).toBeVisible();

      // Test channel selection
      await page.selectOption('[data-testid="channel-select"]', "Digital Ads");

      // Chart should update
      await expect(
        page.locator('[data-testid="response-curves-chart"]')
      ).toBeVisible();
    });
  });

  test.describe("Dashboard Components", () => {
    test("Dashboard should load all components", async ({ page }) => {
      await page.goto("/");

      // Check all main dashboard components
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="ai-insights-panel"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="contribution-chart"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-testid="response-curves-chart"]')
      ).toBeVisible();
    });

    test("Dashboard should handle data loading states", async ({ page }) => {
      // Mock slow API response
      await page.route("**/api/**", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        route.continue();
      });

      await page.goto("/");

      // Should show loading states
      await expect(page.locator('[data-testid="loading"]')).toBeVisible();

      // Should eventually load data
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test("should handle API errors gracefully", async ({ page }) => {
      // Mock API error
      await page.route("**/api/**", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      });

      await page.goto("/");

      // Should show error state
      await expect(page.locator("text=Failed to load")).toBeVisible();

      // Should not crash the application
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });

    test("should handle network timeouts", async ({ page }) => {
      // Mock timeout
      await page.route("**/api/**", (route) => {
        // Don't fulfill, let it timeout
      });

      await page.goto("/");

      // Should show loading state
      await expect(page.locator('[data-testid="loading"]')).toBeVisible();
    });
  });

  test.describe("Responsive Design", () => {
    test("should work on mobile devices", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      // Should be responsive
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();

      // AI chat should work on mobile
      await page.click('[data-testid="ai-chat-button"]');
      await expect(
        page.locator('[data-testid="ai-chat-interface"]')
      ).toBeVisible();
    });

    test("should work on tablet devices", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/");

      // Should be responsive
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
    });
  });
});
