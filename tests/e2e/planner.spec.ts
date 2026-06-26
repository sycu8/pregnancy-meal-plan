import { test, expect } from "@playwright/test";

test("planner landing CTA navigates to planner", async ({ page }) => {
  await page.goto("https://mebauangi.info/");
  await page.getByRole("link", { name: /Tạo thực đơn|Create a free plan/i }).first().click();
  await expect(page).toHaveURL(/\/planner/);
});
