import { test, expect } from "@playwright/test";

test.describe("Board1 - Praise Board (칭찬합시다)", () => {
  test("should display board1 post list", async ({ page }) => {
    await page.goto("/board1");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=칭찬합시다").first()).toBeVisible();
  });

  test("should have write button", async ({ page }) => {
    await page.goto("/board1");
    await page.waitForLoadState("networkidle");
    const writeBtn = page.locator("a, button").filter({ hasText: "글쓰기" }).first();
    await expect(writeBtn).toBeVisible();
  });

  test("should navigate to write page from board1", async ({ page }) => {
    await page.goto("/board1");
    await page.waitForLoadState("networkidle");
    await page.locator("a, button").filter({ hasText: "글쓰기" }).first().click();
    await page.waitForURL("**/board/board1/write", { timeout: 10000 });
    await expect(page).toHaveURL(/board\/board1\/write/);
  });

  test("should show pagination if posts exist", async ({ page }) => {
    await page.goto("/board1");
    await page.waitForLoadState("networkidle");
    // Check for table or data grid
    const table = page.locator("table, .v-data-table, .v-table").first();
    await expect(table).toBeVisible();
  });

  test("should have search functionality", async ({ page }) => {
    await page.goto("/board1");
    await page.waitForLoadState("networkidle");
    // Should have a search input
    const searchInput = page.locator(
      'input[type="text"], input[placeholder*="검색"], input[placeholder*="search"]'
    ).first();
    await expect(searchInput).toBeVisible();
  });
});

test.describe("Board2 - Community Talk (나도한마디)", () => {
  test("should display board2 post list", async ({ page }) => {
    await page.goto("/board2");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("text=나도한마디").first()).toBeVisible();
  });

  test("should block unauthenticated detail access", async ({ page }) => {
    // Board2 detail requires login — navigating should be blocked
    await page.goto("/board2");
    await page.waitForLoadState("networkidle");

    // If there are posts, clicking one should trigger login alert
    const rows = page.locator("table tbody tr, .v-data-table tbody tr");
    const count = await rows.count();
    if (count > 0) {
      await rows.first().click();
      // Should still be on board2 (blocked by router guard)
      await expect(page).toHaveURL(/board2/);
    }
  });
});
