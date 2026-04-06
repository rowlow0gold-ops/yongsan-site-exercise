import { test, expect } from "@playwright/test";

test.describe("SEO Meta Tags", () => {
  test("homepage should have correct title", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/홈.*minhojan-world|minhojan-world/);
  });

  test("board1 page should have correct title", async ({ page }) => {
    await page.goto("/board1");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/칭찬합시다.*minhojan-world/);
  });

  test("board2 page should have correct title", async ({ page }) => {
    await page.goto("/board2");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/나도한마디.*minhojan-world/);
  });

  test("signup page should have correct title", async ({ page }) => {
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/회원가입.*minhojan-world/);
  });

  test("homepage should have og:title meta tag", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const ogTitle = await page.getAttribute('meta[property="og:title"]', "content");
    expect(ogTitle).toContain("minhojan-world");
  });

  test("homepage should have description meta tag", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const desc = await page.getAttribute('meta[name="description"]', "content");
    expect(desc).toBeTruthy();
    expect(desc.length).toBeGreaterThan(10);
  });

  test("homepage should have og:image meta tag", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const ogImage = await page.getAttribute('meta[property="og:image"]', "content");
    expect(ogImage).toContain("og-image.png");
  });

  test("404 page should have correct title", async ({ page }) => {
    await page.goto("/some-nonexistent-page");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveTitle(/찾을 수 없|minhojan-world/);
  });
});
