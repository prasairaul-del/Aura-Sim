import { test, expect } from '@playwright/test';

test.describe('Aura-Sim Core Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should display dashboard and KPI values', async ({ page }) => {
    await expect(page.getByText('Aura-Sim')).toBeVisible();
    await expect(page.getByText('Total Liquidity')).toBeVisible();
    await expect(page.getByText('Fleet Viability')).toBeVisible();
  });

  test('should toggle simulation state', async ({ page }) => {
    const simulateButton = page.getByRole('button', { name: /ENGAGE SIMULATION|HALT SIMULATION/ });
    const initialText = await simulateButton.innerText();
    
    await simulateButton.click();
    await expect(simulateButton).not.toHaveText(initialText);
  });

  test('should add a transaction manually', async ({ page }) => {
    await page.fill('input[name="merchant"]', 'Test Merchant');
    await page.fill('input[name="amount"]', '500');
    await page.selectOption('select[name="type"]', 'income');
    await page.click('button:has-text("Commit to Ledger")');

    await expect(page.getByText('Test Merchant')).toBeVisible();
    await expect(page.getByText('+$500.00')).toBeVisible();
  });

  test('should show Virtual COO report', async ({ page }) => {
    await expect(page.getByText('Neural Core Active')).toBeVisible();
    
    const cooLocator = page.locator('.font-mono p').first();
    
    // Wait for the typewriter effect to start or finish with any substantial text
    await page.waitForFunction(() => {
      const text = document.querySelector('.font-mono p')?.textContent || "";
      return text.length > 10 && !text.includes("Awaiting neural link");
    }, { timeout: 15000 });
    
    const cooText = await cooLocator.innerText();
    expect(cooText.length).toBeGreaterThan(10);
  });
});
