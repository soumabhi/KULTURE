import { test, expect } from "@playwright/test";

test.describe("Authentication (UI)", () => {
  test("admin can sign in with password", async ({ page }) => {
    await page.goto("/login");

    // Fill and submit login form
    await page.fill('input[name="email"]', "e2e-admin@example.test");
    await page.fill('input[name="password"]', "E2eTestPass!23");
    await Promise.all([
      page.waitForNavigation({ url: "**/app" }),
      page.click('button[type="submit"]'),
    ]);

    await expect(page).toHaveURL(/\/app/);
    // basic smoke: admin nav present (link)
    await expect(page.locator('a[href="/app/admin"]').first()).toBeVisible();
  });
});
