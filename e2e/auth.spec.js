import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should show login dialog when clicking login", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find and click the login button
    const loginBtn = page.locator("text=로그인").first();
    if (await loginBtn.isVisible()) {
      await loginBtn.click();
      // Login dialog should appear
      const dialog = page.locator(".v-dialog, .v-overlay").first();
      await expect(dialog).toBeVisible();
    }
  });

  test("should navigate to signup page", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/signup/);
    await expect(page.locator("text=회원가입").first()).toBeVisible();
  });

  test("should show signup form fields", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");

    // Should have name, email, password fields
    const inputs = page.locator("input");
    const count = await inputs.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("should block mypage access without login", async ({ page }) => {
    await page.goto("/mypage");
    await page.waitForLoadState("networkidle");
    // Should redirect to home since not authenticated
    await expect(page).toHaveURL("/");
  });
});
