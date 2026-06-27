import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('Farmer can log in successfully', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[id="email"]', 'farmer@krishi.com');
    await page.fill('input[id="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Good');
  });

  test('Shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[id="email"]', 'wrong@email.com');
    await page.fill('input[id="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
