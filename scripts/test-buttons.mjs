/**
 * Smoke-test interactive buttons/links on production.
 * Run: node scripts/test-buttons.mjs [baseUrl]
 */
import { chromium } from "playwright";

const base = process.argv[2] ?? "https://mebauangi.info";

const failures = [];

function fail(name, err) {
  failures.push({ name, err: String(err).slice(0, 300) });
}

async function clickNextStep(page) {
  const progress = page.locator(".mb-5 span").first();
  const before = await progress.textContent();
  const next = page.getByRole("button", { name: /Tiếp tục|Continue/i });
  for (let attempt = 0; attempt < 12; attempt++) {
    await next.click();
    try {
      await page.waitForFunction(
        (prev) => document.querySelector(".mb-5 span")?.textContent !== prev,
        before,
        { timeout: 2000 }
      );
      return;
    } catch {
      await page.waitForTimeout(250);
    }
  }
  throw new Error(`Step did not advance from ${before}`);
}

async function advancePlannerSteps(page, count = 4) {
  for (let i = 0; i < count; i++) {
    await clickNextStep(page);
  }
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on("pageerror", (e) => fail("pageerror", e.message));

  // Home CTA
  try {
    await page.goto(`${base}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.getByRole("link", { name: /Tạo thực đơn miễn phí|Create a free plan/i }).first().click();
    await page.waitForURL(/\/planner/, { timeout: 10000 });
  } catch (e) {
    fail("home -> planner CTA", e);
  }

  // Planner wizard submit
  try {
    await page.goto(`${base}/planner`, { waitUntil: "domcontentloaded" });
    await advancePlannerSteps(page, 4);
    await page.getByRole("button", { name: /Tạo thực đơn miễn phí|Generate|Create plan/i }).click({ timeout: 5000 });
    await page.waitForURL(/\/result/, { timeout: 90000 });
  } catch (e) {
    fail("planner wizard submit", e);
  }

  // Result page buttons
  try {
    await page.getByRole("button", { name: /Lưu thực đơn|Save plan|Save/i }).click({ timeout: 5000 });
    await page.getByRole("tab", { name: /Ngày 2|Day 2/i }).click({ timeout: 5000 });
    await page.getByRole("link", { name: /Tạo lại|Create again|Regenerate/i }).click({ timeout: 5000 });
    await page.waitForURL(/\/planner/, { timeout: 10000 });
  } catch (e) {
    fail("result page buttons", e);
  }

  // History open (plan saved above)
  try {
    await page.goto(`${base}/history`, { waitUntil: "domcontentloaded" });
    const open = page.getByRole("link", { name: /Mở lại|Open/i }).first();
    if (await open.isVisible()) {
      await open.click();
      await page.waitForURL(/\/result/, { timeout: 10000 });
      await page.getByRole("heading", { name: /Tuần thai|Pregnancy week/i }).waitFor({ timeout: 5000 });
    }
  } catch (e) {
    fail("history open plan", e);
  }

  // Blog search VI
  try {
    await page.goto(`${base}/blog`, { waitUntil: "domcontentloaded" });
    await page.getByRole("searchbox").fill("folate");
    await page.getByRole("button", { name: /Tìm kiếm/i }).click();
    await page.waitForURL(/q=folate/, { timeout: 10000 });
  } catch (e) {
    fail("blog search VI", e);
  }

  // Blog search EN
  try {
    await page.goto(`${base}/en/blog`, { waitUntil: "domcontentloaded" });
    await page.getByRole("searchbox").fill("iron");
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForURL(/q=iron/, { timeout: 10000 });
  } catch (e) {
    fail("blog search EN", e);
  }

  // Blog pagination
  try {
    await page.goto(`${base}/blog`, { waitUntil: "domcontentloaded" });
    const page2 = page.getByRole("link", { name: /Trang 2|Page 2/i });
    if (await page2.isVisible()) {
      await page2.click();
      await page.waitForURL(/page=2/, { timeout: 10000 });
    }
  } catch (e) {
    fail("blog pagination", e);
  }

  // Language switcher
  try {
    await page.goto(`${base}/blog`, { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /English|Tiếng Việt/i }).click();
    await page.waitForURL(/\/en\/blog/, { timeout: 10000 });
  } catch (e) {
    fail("language switcher", e);
  }

  // Profile save
  try {
    await page.goto(`${base}/profile`, { waitUntil: "domcontentloaded" });
    await advancePlannerSteps(page, 4);
    await page.getByRole("button", { name: /Lưu hồ sơ|Save profile/i }).click({ timeout: 5000 });
  } catch (e) {
    fail("profile save", e);
  }

  // History empty CTA (separate context without saved plans)
  try {
    const emptyPage = await context.newPage();
    await emptyPage.goto(`${base}/history`, { waitUntil: "domcontentloaded" });
    await emptyPage.evaluate(() => localStorage.clear());
    await emptyPage.reload({ waitUntil: "domcontentloaded" });
    const cta = emptyPage.getByRole("link", { name: /Tạo thực đơn miễn phí|Create a free plan/i });
    if (await cta.isVisible()) {
      await cta.click();
      await emptyPage.waitForURL(/\/planner/, { timeout: 10000 });
    }
    await emptyPage.close();
  } catch (e) {
    fail("history empty CTA", e);
  }

  await browser.close();

  if (failures.length) {
    console.error("FAILURES:", JSON.stringify(failures, null, 2));
    process.exit(1);
  }
  console.log("All button smoke tests passed on", base);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
