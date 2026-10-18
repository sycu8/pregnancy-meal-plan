import { chromium } from "playwright";

const base = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const chrome = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";

const locales = [
  {
    id: "vi",
    path: "/vi/planner",
    step: (n) => `Bước ${n}/5`,
    next: "Tiếp tục",
    submit: "Tạo thực đơn miễn phí",
    basic: "Dùng thực đơn cơ bản",
    heading: "Thực đơn tuần thai",
    meal: "Bữa sáng"
  },
  {
    id: "en",
    path: "/planner",
    step: (n) => `Step ${n}/5`,
    next: "Continue",
    submit: "Create a free plan",
    basic: "Use basic plan",
    heading: "Meal plan for pregnancy week",
    meal: "Breakfast"
  }
];

async function launch() {
  const browser = await chromium.launch({
    executablePath: chrome,
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });
  return browser;
}

async function walkToSubmit(page, locale) {
  for (let step = 1; step <= 4; step += 1) {
    await page.getByText(locale.step(step)).waitFor();
    const nextStep = page.getByText(locale.step(step + 1));
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.getByRole("button", { name: locale.next }).click();
      try {
        await nextStep.waitFor({ timeout: 2000 });
        break;
      } catch (error) {
        if (attempt === 2) throw error;
      }
    }
  }
}

async function renderBasicPlanOffline(browser, locale) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${base}${locale.path}`, { waitUntil: "load" });
  await page.getByText(locale.step(1)).waitFor();
  await context.setOffline(true);
  await walkToSubmit(page, locale);
  await page.getByRole("button", { name: locale.submit }).click();
  await page.getByRole("button", { name: locale.basic }).click();
  await page.getByRole("heading", { name: locale.heading }).waitFor({ timeout: 8000 });
  const url = page.url();
  const text = await page.locator("body").innerText();
  if (url.includes("/result")) throw new Error(`${locale.id} navigated to ${url}`);
  if (!url.includes(locale.path)) throw new Error(`${locale.id} left the planner at ${url}`);
  if (/ERR_INTERNET_DISCONNECTED/i.test(text)) throw new Error(`${locale.id} showed the browser offline error`);
  const normalized = text.toLowerCase();
  if (!normalized.includes(locale.heading.toLowerCase()) || !normalized.includes(locale.meal.toLowerCase())) {
    throw new Error(`${locale.id} did not render the basic plan at ${url}`);
  }
  await context.close();
  return { locale: locale.id, url, heading: locale.heading };
}

async function englishSwapTryAgain(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  let swapAttempts = 0;
  await page.route("**/api/generate-meal-plan", async (route) => {
    const body = route.request().postDataJSON();
    if (body?.regenerate) {
      swapAttempts += 1;
      return route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "<html>@cf/meta/llama-3</html>" })
      });
    }
    return route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ error: "Workers AI request failed", code: "ai_unavailable" })
    });
  });
  const locale = locales[1];
  await page.goto(`${base}${locale.path}`, { waitUntil: "load" });
  await walkToSubmit(page, locale);
  await page.getByRole("button", { name: locale.submit }).click();
  await page.getByRole("button", { name: locale.basic }).click();
  await page.getByRole("heading", { name: locale.heading }).waitFor({ timeout: 8000 });
  await page.getByRole("button", { name: "Swap meal" }).first().click();
  await page.getByText("Could not swap meal").waitFor({ timeout: 8000 });
  const tryAgain = page.getByRole("button", { name: "Try again" });
  await tryAgain.waitFor();
  await tryAgain.click();
  await page.getByText("Could not swap meal").waitFor();
  if (swapAttempts < 2) throw new Error(`Try again did not resend the swap (${swapAttempts})`);
  const text = await page.locator("body").innerText();
  if (/@cf\/|<html/i.test(text)) throw new Error("swap error leaked provider text");
  await context.close();
  return { swapAttempts };
}

const browser = await launch();
try {
  const offline = [];
  for (const locale of locales) offline.push(await renderBasicPlanOffline(browser, locale));
  const swap = await englishSwapTryAgain(browser);
  console.log(JSON.stringify({ offline, swap }, null, 2));
} finally {
  await browser.close();
}
