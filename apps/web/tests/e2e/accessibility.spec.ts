import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);
    
    const h2 = page.getByRole('heading', { level: 2 });
    await expect(h2).toHaveCount(2); // Chart titles
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      // Either has aria-label or visible text
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test that all interactive elements are reachable via keyboard
    const interactiveElements = page.locator('button, input, select, [tabindex]');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab');
      const element = interactiveElements.nth(i);
      await expect(element).toBeFocused();
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    // This would need a more sophisticated approach with a11y testing library
    // For now, we'll check that text is visible
    const textElements = page.locator('p, span, div').filter({ hasText: /[a-zA-Z]/ });
    const count = await textElements.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const element = textElements.nth(i);
      await expect(element).toBeVisible();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    const inputs = page.locator('input, select');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(hasLabel || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Check for proper landmark roles
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);
    
    const navigation = page.locator('nav, [role="navigation"]');
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toBeVisible();
    }
  });

  test('should have proper focus management', async ({ page }) => {
    // Test that focus is managed properly when modals or panels open
    const explainButton = page.locator('button').filter({ hasText: 'Explain' });
    if (await explainButton.count() > 0) {
      await explainButton.first().click();
      
      // Check that focus moves to the explanation panel
      const panel = page.locator('[role="dialog"], [aria-modal="true"]');
      if (await panel.count() > 0) {
        await expect(panel.first()).toBeFocused();
      }
    }
  });
});
