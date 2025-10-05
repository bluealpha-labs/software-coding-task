import { test, expect } from "@playwright/test";

test.describe("Regression Tests", () => {
  test.describe("Form Validation Issues", () => {
    test("should not throw TypeError on form validation", async ({ page }) => {
      // Navigate to login page
      await page.goto("/auth");

      // Fill in invalid email to trigger validation
      await page.fill('[data-testid="email-input"]', "invalid-email");
      await page.fill('[data-testid="password-input"]', "weak");

      // Submit form and check for validation errors (not TypeError)
      await page.click('[data-testid="login-button"]');

      // Should show validation errors, not crash
      await expect(
        page.locator("text=Please enter a valid email address")
      ).toBeVisible();
      await expect(
        page.locator("text=Password must be at least 8 characters")
      ).toBeVisible();

      // Check that no JavaScript errors occurred
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      // Verify no TypeError occurred
      expect(
        errors.filter((error) =>
          error.includes("Cannot read properties of null")
        )
      ).toHaveLength(0);
    });

    test("should handle validation functions returning proper format", async ({
      page,
    }) => {
      await page.goto("/auth");

      // Test email validation
      await page.fill('[data-testid="email-input"]', "test@example.com");
      await page.fill('[data-testid="password-input"]', "ValidPassword123");

      // Submit should work without errors
      await page.click('[data-testid="login-button"]');

      // Should not show any validation errors for valid input
      await expect(
        page.locator("text=Please enter a valid email address")
      ).not.toBeVisible();
    });

    test("should handle register form validation", async ({ page }) => {
      await page.goto("/auth");

      // Switch to register form
      await page.click('[data-testid="register-tab"]');

      // Fill invalid data
      await page.fill('[data-testid="email-input"]', "invalid");
      await page.fill('[data-testid="password-input"]', "weak");
      await page.fill('[data-testid="fullname-input"]', "A".repeat(300)); // Too long

      await page.click('[data-testid="register-button"]');

      // Should show validation errors without crashing
      await expect(
        page.locator("text=Please enter a valid email address")
      ).toBeVisible();
      await expect(
        page.locator("text=Password must be at least 8 characters")
      ).toBeVisible();
      await expect(
        page.locator("text=Full name must be less than 255 characters")
      ).toBeVisible();
    });
  });

  test.describe("AI Chat Interface", () => {
    test("should open AI chat without errors", async ({ page }) => {
      await page.goto("/");

      // Click on AI chat button
      await page.click('[data-testid="ai-chat-button"]');

      // Should open chat interface
      await expect(
        page.locator('[data-testid="ai-chat-interface"]')
      ).toBeVisible();

      // Should show welcome message
      await expect(
        page.locator("text=Hi! I'm your AI assistant")
      ).toBeVisible();
    });

    test("should handle AI chat interactions", async ({ page }) => {
      await page.goto("/");

      // Open AI chat
      await page.click('[data-testid="ai-chat-button"]');

      // Send a message
      await page.fill(
        '[data-testid="ai-chat-input"]',
        "Explain the contribution chart"
      );
      await page.click('[data-testid="ai-chat-send"]');

      // Should show AI response
      await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();

      // Should not show any JavaScript errors
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      expect(
        errors.filter((error) => error.includes("TypeError"))
      ).toHaveLength(0);
    });

    test("should handle recommendation implementation", async ({ page }) => {
      await page.goto("/");

      // Open AI chat
      await page.click('[data-testid="ai-chat-button"]');

      // Click on a recommendation implement button
      await page.click('[data-testid="implement-recommendation-button"]');

      // Should open implementation modal
      await expect(
        page.locator('[data-testid="recommendation-implementer"]')
      ).toBeVisible();

      // Should show implementation plan
      await expect(page.locator("text=Implementation Plan")).toBeVisible();
    });
  });

  test.describe("Dashboard Functionality", () => {
    test("should load dashboard without errors", async ({ page }) => {
      await page.goto("/");

      // Should load main dashboard components
      await expect(page.locator('[data-testid="dashboard"]')).toBeVisible();
      await expect(
        page.locator('[data-testid="ai-insights-panel"]')
      ).toBeVisible();

      // Should not show any loading errors
      await expect(page.locator("text=Failed to load")).not.toBeVisible();
    });

    test("should handle chart interactions", async ({ page }) => {
      await page.goto("/");

      // Click on chart explain button
      await page.click('[data-testid="explain-chart-button"]');

      // Should open explanation modal
      await expect(
        page.locator('[data-testid="chart-explanation"]')
      ).toBeVisible();
    });

    test("should handle context awareness", async ({ page }) => {
      await page.goto("/");

      // Interact with different charts
      await page.click('[data-testid="contribution-chart"]');
      await page.click('[data-testid="response-curves-chart"]');

      // Open AI chat to test context awareness
      await page.click('[data-testid="ai-chat-button"]');

      // AI should be aware of current context
      await expect(page.locator("text=Currently viewing")).toBeVisible();
    });
  });

  test.describe("API Integration", () => {
    test("should handle API errors gracefully", async ({ page }) => {
      // Mock API to return error
      await page.route("**/api/**", (route) => {
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        });
      });

      await page.goto("/");

      // Should show error state, not crash
      await expect(page.locator("text=Failed to load")).toBeVisible();
    });

    test("should handle network timeouts", async ({ page }) => {
      // Mock API to timeout
      await page.route("**/api/**", (route) => {
        // Don't fulfill the route, let it timeout
      });

      await page.goto("/");

      // Should show loading state, then error
      await expect(page.locator('[data-testid="loading"]')).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should be accessible with keyboard navigation", async ({ page }) => {
      await page.goto("/");

      // Tab through interactive elements
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      // Should not lose focus or cause errors
      const focusedElement = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(focusedElement).toBeTruthy();
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await page.goto("/");

      // Check for proper ARIA labels
      const elementsWithAria = await page.locator("[aria-label]").count();
      expect(elementsWithAria).toBeGreaterThan(0);
    });
  });

  test.describe("Performance", () => {
    test("should load within acceptable time", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test("should not have memory leaks", async ({ page }) => {
      await page.goto("/");

      // Interact with various components
      await page.click('[data-testid="ai-chat-button"]');
      await page.click('[data-testid="close-chat"]');
      await page.click('[data-testid="explain-chart-button"]');
      await page.click('[data-testid="close-explanation"]');

      // Check memory usage
      const memoryUsage = await page.evaluate(() => {
        return (performance as any).memory?.usedJSHeapSize || 0;
      });

      // Should not exceed reasonable memory usage (50MB)
      expect(memoryUsage).toBeLessThan(50 * 1024 * 1024);
    });
  });
});
