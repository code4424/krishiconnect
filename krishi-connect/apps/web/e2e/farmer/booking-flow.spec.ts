import { test, expect } from '@playwright/test';

test.describe('Farmer Booking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as farmer
    await page.goto('/login');
    await page.fill('input[id="email"]', 'farmer@krishi.com');
    await page.fill('input[id="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('should book a tractor service end-to-end', async ({ page }) => {
    // 1. Discovery
    await page.click('text=Book a Service');
    await expect(page).toHaveURL(/.*services/);

    // 2. Select Service
    await page.click('text=View Details');
    
    // 3. Start Booking
    await page.click('text=Book Now');
    
    // 4. Step 1: Date & Time
    await page.click('.rdp-day_today'); // Select today on shadcn calendar
    await page.click('button:has-text("10:00 AM")');
    await page.click('button:has-text("Continue")');

    // 5. Step 2: Duration
    await page.click('button:has-text("2 Hours")');
    await page.click('button:has-text("Continue")');

    // 6. Step 3: Payment
    await page.click('text=Cash on Delivery');
    await page.click('button:has-text("Confirm Booking")');

    // 7. Success
    await expect(page.locator('h1')).toContainText('confirmed');
    await expect(page.locator('text=Booking ID')).toBeVisible();

    // 8. Verify in history
    await page.click('text=View Booking');
    await expect(page.locator('h3')).toContainText('Tractor');
    await expect(page.locator('text=PENDING')).toBeVisible();
  });
});
