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
    meal: "Bữa sáng",
    week: "Tuần thai hiện tại",
    again: "Tạo lại",
    edit: "Quay lại chỉnh thông tin",
    header: "Tạo thực đơn"
  },
  {
    id: "en",
    path: "/planner",
    step: (n) => `Step ${n}/5`,
    next: "Continue",
    submit: "Create a free plan",
    basic: "Use basic plan",
    heading: "Meal plan for pregnancy week",
    meal: "Breakfast",
    week: "Current pregnancy week",
    again: "Create again",
    edit: "Edit information",
    header: "Create plan"
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

async function showInlinePlan(page, locale) {
  await walkToSubmit(page, locale);
  await page.getByRole("button", { name: locale.submit }).click();
  await page.getByRole("button", { name: locale.basic }).click();
  await page.getByRole("heading", { name: locale.heading }).waitFor({ timeout: 8000 });
}

async function expectPlannerForm(page, locale) {
  await page.getByText(locale.step(1)).waitFor({ timeout: 8000 });
  const url = page.url();
  if (url.includes("/result")) throw new Error(`${locale.id} navigated to ${url}`);
  if (!url.includes(locale.path)) throw new Error(`${locale.id} left the planner at ${url}`);
  const text = await page.locator("body").innerText();
  if (/ERR_INTERNET_DISCONNECTED/i.test(text)) throw new Error(`${locale.id} showed the browser offline error`);
  if (text.includes(locale.heading)) throw new Error(`${locale.id} still showed the in-place plan`);
  let week = "";
  for (let attempt = 0; attempt < 25; attempt += 1) {
    week = await page.getByLabel(locale.week).inputValue();
    if (week === "33") break;
    await page.waitForTimeout(100);
  }
  if (week !== "33") throw new Error(`${locale.id} did not keep pregnancy week 33 (saw ${week || "empty"})`);
}

async function returnFromInlinePlan(browser, locale, offline) {
  const context = await browser.newContext();
  const page = await context.newPage();
  if (!offline) {
    await page.route("**/api/generate-meal-plan", async (route) =>
      route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "unavailable", code: "ai_unavailable" })
      })
    );
  }
  await page.goto(`${base}${locale.path}`, { waitUntil: "load" });
  await page.getByText(locale.step(1)).waitFor();
  await page.getByLabel(locale.week).fill("33");
  if (offline) await context.setOffline(true);

  const controls = [
    { id: "edit", role: "button", name: locale.edit },
    { id: "again", role: "button", name: locale.again },
    { id: "header", role: "link", name: locale.header }
  ];
  for (const control of controls) {
    await showInlinePlan(page, locale);
    await page.getByRole(control.role, { name: control.name, exact: true }).click({ force: true });
    await expectPlannerForm(page, locale);
  }

  if (!offline) {
    await page.reload({ waitUntil: "load" });
    await expectPlannerForm(page, locale);
  }

  await context.close();
  return { locale: locale.id, offline, controls: controls.map((control) => control.id) };
}

async function englishDailyLimitTryAgain(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const limit = "Daily meal-swap limit reached. Try again tomorrow or unlock Premium Lifetime.";
  await page.route("**/api/generate-meal-plan", async (route) => {
    const body = route.request().postDataJSON();
    if (body?.regenerate) {
      return route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          error: limit,
          usage: { mealSwapsUsed: 2, mealSwapsLimit: 2 }
        })
      });
    }
    return route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({ error: "unavailable", code: "ai_unavailable" })
    });
  });
  const locale = locales[1];
  await page.goto(`${base}${locale.path}`, { waitUntil: "load" });
  await walkToSubmit(page, locale);
  await page.getByRole("button", { name: locale.submit }).click();
  await page.getByRole("button", { name: locale.basic }).click();
  await page.getByRole("heading", { name: locale.heading }).waitFor({ timeout: 8000 });
  await page.getByRole("button", { name: "Swap meal" }).first().click();
  await page.getByText(limit).waitFor({ timeout: 8000 });
  const tryAgain = page.getByRole("button", { name: "Try again" });
  if (await tryAgain.isEnabled()) throw new Error("daily-limit Try again stayed enabled");
  await tryAgain.click({ force: true });
  await page.getByText(limit).waitFor();
  const text = await page.locator("body").innerText();
  if (/@cf\/|<html|too many requests/i.test(text)) throw new Error("daily limit leaked provider text");
  await context.close();
  return { limitShown: true, tryAgainEnabled: false };
}

const browser = await launch();
try {
  const offline = [];
  for (const locale of locales) offline.push(await renderBasicPlanOffline(browser, locale));
  const returned = [];
  for (const locale of locales) {
    returned.push(await returnFromInlinePlan(browser, locale, true));
    returned.push(await returnFromInlinePlan(browser, locale, false));
  }
  const swap = await englishSwapTryAgain(browser);
  const dailyLimit = await englishDailyLimitTryAgain(browser);
  console.log(JSON.stringify({ offline, returned, swap, dailyLimit }, null, 2));
} finally {
  await browser.close();
}
