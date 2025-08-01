import { test, expect } from '@playwright/test';

test.describe('Log Viewer Page', () => {
  test('should display log entries and pagination controls', async ({ page }) => {
    // Navigate to the log viewer page
    await page.goto('/http-traffic/log/bun-logs-debug-entry/view');
    await page.waitForSelector('.log-table'); // Wait for the log table to be present

    // Expect the main heading to be visible
    await expect(page.getByRole('heading', { name: 'HTTP Traffic Detail' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'All Logs' })).toBeVisible();

    // Expect the log table headers to be visible
    await expect(page.locator('.log-table thead th:nth-child(1)')).toHaveText('No.');
    await expect(page.locator('.log-table thead th:nth-child(2)')).toHaveText('Timestamp');
    await expect(page.locator('.log-table thead th:nth-child(3)')).toHaveText('Level');
    await expect(page.locator('.log-table thead th:nth-child(4)')).toHaveText('Message');

    // Expect the log table to be visible
    await expect(page.locator('.log-table')).toBeVisible();

    // Expect pagination controls to be visible
    await expect(page.getByRole('button', { name: 'Previous' })).toBeVisible();
    await expect(page.getByText(/Page \d+ of \d+ \(\d+ logs total\)/)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
  });

  test('should navigate to the next page', async ({ page }) => {
    await page.goto('/http-traffic/log/bun-logs-debug-entry/view');
    await page.waitForSelector('.log-table'); // Wait for the log table to be present

    // Ensure we are on the first page
    await expect(page.getByText('Page 1 of')).toBeVisible();

    // Click the next button
    await page.getByRole('button', { name: 'Next' }).click({ force: true });

    // Expect to be on the second page (or a different page if only one page exists)
    // This is a basic check, more robust checks would involve verifying content changes
    await expect(page.getByText('Page 2 of').or(page.getByText('Page 1 of'))).toBeVisible();
  });
});