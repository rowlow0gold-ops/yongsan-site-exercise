import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should load the homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/minhojan-world/);
  });

  test("should display the main banner", async ({ page }) => {
    await page.goto("/");
    // Wait for content to load
    await page.waitForLoadState("networkidle");
    // Check that main content area exists
    await expect(page.locator("#app")).toBeVisible();
  });

  test("should have navigation bar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Nav should be visible
    const nav = page.locator("nav, header").first();
    await expect(nav).toBeVisible();
  });

  test("should navigate to board1 (칭찬합시다)", async ({ page }) => {
    await page.goto("/board1");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=칭찬합시다").first()).toBeVisible();
  });

  test("should navigate to board2 (나도한마디)", async ({ page }) => {
    await page.goto("/board2");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=나도한마디").first()).toBeVisible();
  });

  test("should show 404 for unknown routes", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await page.waitForLoadState("networkidle");
    // Should show the 404 page content
    await expect(page.locator("body")).toContainText(/찾을 수 없|not found|404/i);
  });
});
