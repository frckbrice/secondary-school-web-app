import { test, expect } from '@playwright/test';

test('homepage loads and shows main heading', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await expect(page).toHaveTitle(/GBHS Bafia/i);
  await expect(
    page.getByRole('heading', { name: /GBHS Bafia/i })
  ).toBeVisible();
});
