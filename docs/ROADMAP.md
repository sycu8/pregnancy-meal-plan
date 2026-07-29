# Pregnancy Meal Planner — Product & engineering roadmap

Living roadmap for product + technical delivery. Prefer product streams over calendar months. Update status when work ships.

Status legend:

- **Shipped** — live in production or merged and deployable
- **Ongoing** — continuous / not a one-off checkbox
- **Next** — near-term priority
- **Optional** — backlog / nice-to-have

Brand note: product name is **Pregnancy Meal Planner** (legacy “Bầu Ăn Gì?” may still appear in older copy).

---

## 1. Core planner & safety — shipped

- [x] Multi-step `PlannerForm` → `POST /api/generate-meal-plan` via `fetchMealPlan`
- [x] Rule-based 7-day plan (breakfast, morning snack, lunch, afternoon snack, dinner)
- [x] BMI + pregnancy weight-gain reference ranges
- [x] Safety warnings (ACOG / CDC / NHS / WHO-oriented copy in `safetyRules.ts` + `sources.ts`)
- [x] Nutrient guidance panel + trusted sources block
- [x] Shopping list + 2–3 day fresh grocery batches
- [x] Print meal plan (`window.print` + `.no-print`)
- [x] Meal swap (`regenerateMealInPlan` + API)
- [x] Postpartum mode (0–24 months)
- [x] Regional cuisine tags Bắc / Trung / Nam + scoring
- [x] Gestational diabetes strict (low-GI) mode

## 2. AI personalization — shipped

- [x] `aiClient.ts` — Workers AI / OpenAI with rule-based fallback
- [x] Turnstile verify (`TURNSTILE_SECRET_KEY`)
- [x] Feature flags KV / env (`FEATURE_AI_PLANNER_ENABLED`)
- [x] English-first AI prompt → locale-adapted `specialNotes`

## 3. Accounts, sync & premium — shipped / next

### Shipped

- [x] D1 schema `migrations/0001_init.sql` + `cloudStorage.ts`
- [x] OAuth client_credentials (`/oauth/token`, `/oauth/authorize`) for B2B / machine clients
- [x] End-user email register → session token
- [x] Opt-in sync banner (`SyncOptInBanner`)
- [x] Merge localStorage → D1 on login (`/api/sync` POST); pull cloud → local on `/account`
- [x] Account settings: export JSON, delete cloud account
- [x] Privacy + Terms (VI/EN) — `/privacy`, `/vi/privacy`, `/terms`, `/vi/terms`
- [x] Free limits enforced (see `src/lib/premium/limits.ts`): **1 AI plan/day**, **2 swaps/day**, **5 history plans**; Premium removes caps + enables cloud export
- [x] Server-side daily usage counters (KV) on `/api/generate-meal-plan`
- [x] Client usage UI (`PremiumUsageHint`) + upsell (`PremiumUpsell`)
- [x] Stripe web checkout scaffold (`/api/premium/checkout`, `/premium`)
- [x] Premium tier resolution from authenticated user (`resolvePremiumTier`)
- [x] Plan export (`/api/export/plan` + result export button)
- [x] Favorites (`FavoriteButton` + `/api/favorites`)
- [x] B2B API key bypass on generate (`B2B_API_KEY`)

### Next

- [ ] Google Play Billing + Apple IAP live

## 4. Content, SEO & growth — shipped / ongoing

### Shipped

- [x] Editorial synthesis `src/lib/blog/synthesis/synthesizePost.ts`
- [x] Unified sitemap crawl / ingest pipeline
- [x] Markdown v2 (images, tables, blockquotes)
- [x] Topic hubs `/blog/topics` (+ `/vi/blog/topics`)
- [x] Workers AI + AI Gateway text/images → R2 publish pipeline
- [x] Editorial SEO seeds (dinh dưỡng / thực đơn mẹ bầu)
- [x] GEO: `/llms.txt`, `/llms-full.txt`, blog markdown negotiation, FAQ JSON-LD
- [x] RSS: `/blog/feed.xml` (EN) and `/vi/blog/feed.xml` (VI)
- [x] Blog → planner CTA (`BlogPlannerCta`)
- [x] Structured data `MobileApplication` + FAQ on landing
- [x] Referral share loop (`ReferralShare`, `?ref=` capture)
- [x] Hospital / pharmacy co-marketing badges (`PartnerBadges`)
- [x] Telegram bot wrapper (`/api/bot/telegram`)
- [x] Deploy workflow `.github/workflows/deploy.yml` (push `main`)
- [x] Cloudflare Web Analytics (`NEXT_PUBLIC_CF_BEACON_TOKEN`)
- [x] Rate limiting (`rateLimit.ts`)
- [x] Live MCP `/mcp` — `create_meal_plan`, `get_nutrient_guidance`, `search_blog`
- [x] Playwright E2E `tests/e2e/planner.spec.ts`
- [x] Wrangler bindings: AI, KV, D1, R2

### Ongoing

- [ ] Grow toward **300+ indexed bilingual blog posts** (auto-crawl + editorial seeds)

## 5. Mobile distribution — shipped / next

### Shipped

- [x] Capacitor iOS + Android shell (`mobile/`, bundle `info.mebauangi.app`)
- [x] Store submission kit `docs/STORE_SUBMISSION.md`
- [x] Mobile UTM attribution (`utm_source=ios-app|android-app`)
- [x] Deep links `/result?plan=` + `apple-app-site-association` + Android App Links
- [x] Support / FAQ — `/support`, `/vi/support`
- [x] GitHub Actions debug Android build
- [x] Env-based `APPLE_TEAM_ID` + `ANDROID_SHA256_FINGERPRINT` for AASA / assetlinks
- [x] Share meal plan (Web Share API + clipboard fallback)
- [x] Offline cache last plan + profile (`offlineCache.ts`)
- [x] In-app review prompt after 3rd plan (`ReviewPrompt`)

### Next

- [ ] Release signing (Android keystore, Apple distribution)
- [ ] Store screenshots + feature graphic
- [ ] Google Play + App Store submission approved
- [ ] Push reminders (FCM + APNs, opt-in)

### Optional

- [ ] Android widget / iOS Live Activity

---

## 6. Internationalization & global pricing — shipped / next

English is the authoring language for meal content; Vietnamese UI must always display Vietnamese copy. Grocery estimates follow where the creator shops.

### Shipped

- [x] Locale routing EN unprefixed (`/planner`) + VI (`/vi/planner`)
- [x] Residence-country selector on planner (`residenceCountry` in `PregnancyProfile` / `PlannerForm`)
- [x] Country pricing configs + currencies (`src/lib/nutrition/countries.ts`)
- [x] Vietnam: keep existing VND supermarket estimate (Kingfoodmart / WinMart / GO!/BigC/Tops)
- [x] Abroad: public supermarket / convenience-store reference prices per country (`src/lib/nutrition/priceGuide.ts`)
- [x] Local-currency formatting on result (`formatMoney` + `MealPlanResult`)
- [x] English-first meal strings + VI translations (`src/lib/nutrition/mealLocales.ts`)
- [x] Display-time relocalization so VI never leaves English leftovers (`localizeMealPlanForLocale`)
- [x] Homepage intro for country-based grocery pricing (`LandingPage` + `landingContent`)

Key files:

- `src/lib/nutrition/countries.ts`
- `src/lib/nutrition/priceGuide.ts`
- `src/lib/nutrition/mealLocales.ts`
- `src/lib/nutrition/localizeMealPlan.ts`
- `src/components/planner/PlannerForm.tsx`
- `src/components/result/MealPlanResult.tsx`
- `src/components/home/LandingPage.tsx`

### Next

- [ ] Focused tests / QA for locale-switch persistence and country-pricing UX
- [ ] Expand or refresh public price snapshots (seasonality, more chains)

### Optional

- [ ] Additional residence countries beyond the current set (VN, US, JP, KR, SG, AU, GB, CA, DE, FR, TH, MY, TW)

---

## 7. Documentation alignment — next

README still describes older MVP constraints (localStorage-only, Vietnam-only VND pricing, “no account”). Keep product truth in this roadmap; then sync README.

- [ ] Update `README.md` for: account sync, premium limits, multilingual EN/VI, international pricing, Cloudflare OpenNext deploy reality
- [ ] Fix any stale paths (`/en/...` vs unprefixed EN routes)
- [ ] Keep env secret list below in sync with `wrangler.jsonc` + GitHub Actions

---

## Env secrets (do not commit)

```bash
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
NEXT_PUBLIC_CF_BEACON_TOKEN=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
AI_PROVIDER=workers-ai
AI_GATEWAY_ID=default
OPENAI_API_KEY=
FEATURE_AI_PLANNER_ENABLED=true
FEATURE_BLOG_AI_ENABLED=true
BLOG_AI_TEXT_MODEL=@cf/meta/llama-3.3-70b-instruct-fp8-fast
BLOG_AI_IMAGE_MODEL=@cf/black-forest-labs/flux-1-schnell
BLOG_R2_BUCKET=bau-an-gi-exports
APPLE_TEAM_ID=
ANDROID_SHA256_FINGERPRINT=
B2B_API_KEY=
STRIPE_CHECKOUT_URL=https://buy.stripe.com/7sYbJ1eoCeDA0f462McZa00
TELEGRAM_BOT_TOKEN=
```

---

## KPI snapshot

| Stream | Metric |
|--------|--------|
| Core / AI | p95 generate &lt; 3s; 0 safety-rule regressions in tests |
| Content | Auto-crawl success &gt; 95%; progress toward 300+ indexed bilingual posts |
| Premium | Free caps match `premiumLimits`; Stripe checkout reachable |
| Mobile | Store listing assets ready; signed release builds |
| International | VI locale always Vietnamese meal copy; costs match selected country currency |
| Quality | Lighthouse mobile &gt; 85; deploy workflow green on `main` |

---

## Near-term priority order

1. Documentation: align `README.md` with this roadmap
2. Mobile release: signing + screenshots + store submission
3. Monetization: Google Play Billing / Apple IAP
4. Engagement: push meal reminders (opt-in)
5. Growth: keep bilingual blog publish pipeline filling toward 300+ posts
6. International QA: locale switch + country pricing coverage
