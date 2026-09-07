import { test, expect } from "@playwright/test";

test.describe("Admin UI", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "e2e-admin@example.test");
    await page.fill('input[name="password"]', "E2eTestPass!23");
    await Promise.all([
      page.waitForNavigation({ url: "**/app" }),
      page.click('button[type="submit"]'),
    ]);
  });

  test("admin dashboard shows expected nav items", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.getByRole("link", { name: "Campaigns" })).toBeVisible();
  });
});
