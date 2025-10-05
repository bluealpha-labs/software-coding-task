import { test, expect } from '@playwright/test';

test.describe('MMM Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main dashboard title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Marketing Mix Modeling Dashboard' })).toBeVisible();
  });

  test('should show data source indicator', async ({ page }) => {
    await expect(page.getByText('Model Data')).toBeVisible();
  });

  test('should display contribution chart', async ({ page }) => {
    await expect(page.getByText('Channel Contributions')).toBeVisible();
    await expect(page.locator('[data-testid="contribution-chart"]')).toBeVisible();
  });

  test('should display response curves chart', async ({ page }) => {
    await expect(page.getByText('Response Curves')).toBeVisible();
    await expect(page.locator('[data-testid="response-curves-chart"]')).toBeVisible();
  });

  test('should show AI insights panel', async ({ page }) => {
    await expect(page.getByText('AI Insights')).toBeVisible();
    await expect(page.getByText('Channel Performance Analysis')).toBeVisible();
  });

  test('should handle chart explanation requests', async ({ page }) => {
    // Wait for charts to load
    await page.waitForSelector('[data-testid="contribution-chart"]');
    
    // Click explain button on contribution chart
    const explainButton = page.locator('[data-testid="contribution-chart"] button').filter({ hasText: 'Explain' });
    await explainButton.click();
    
    // Check if AI explanation panel appears
    await expect(page.getByText('AI Explanation')).toBeVisible();
  });

  test('should allow channel selection in response curves', async ({ page }) => {
    await page.waitForSelector('[data-testid="response-curves-chart"]');
    
    // Check if channel selector is present
    const channelSelector = page.locator('[data-testid="response-curves-chart"] select');
    await expect(channelSelector).toBeVisible();
    
    // Select a different channel
    await channelSelector.selectOption({ index: 1 });
    
    // Verify chart updates (this would need to be implemented in the component)
    await expect(page.locator('[data-testid="response-curves-chart"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that main elements are still visible
    await expect(page.getByRole('heading', { name: 'Marketing Mix Modeling Dashboard' })).toBeVisible();
    await expect(page.locator('[data-testid="contribution-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="response-curves-chart"]')).toBeVisible();
  });

  test('should handle dark mode toggle', async ({ page }) => {
    // Check if dark mode toggle exists (if implemented)
    const darkModeToggle = page.locator('[data-testid="dark-mode-toggle"]');
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.click();
      
      // Verify dark mode is applied
      const html = page.locator('html');
      await expect(html).toHaveAttribute('class', /dark/);
    }
  });

  test('should show loading states', async ({ page }) => {
    // Navigate to a fresh page to catch loading states
    await page.goto('/?fresh=true');
    
    // Check for loading indicators
    const loadingIndicators = page.locator('[data-testid="loading"]');
    if (await loadingIndicators.count() > 0) {
      await expect(loadingIndicators.first()).toBeVisible();
    }
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/mmm-dev/contributions', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.reload();
    
    // Check for error message
    await expect(page.getByText(/error|failed/i)).toBeVisible();
  });
});
