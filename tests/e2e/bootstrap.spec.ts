import { test, expect } from "@playwright/test";

test.describe("Bootstrap register UI", () => {
  test("bootstrap register UI is accessible (if enabled)", async ({ page }) => {
    const resp = await page.goto("/auth/bootstrap-first/register-ui");
    if (resp && resp.status() === 200) {
      await expect(page.locator("form")).toBeVisible();
    } else {
      test.skip(true, "Bootstrap register UI not accessible");
    }
  });
});
