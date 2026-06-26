# Bầu Ăn Gì? — Roadmap 12 tháng

Tài liệu triển khai roadmap sản phẩm + kỹ thuật. Cập nhật khi hoàn thành từng phase.

## Phase 1 — Ổn định & tăng trưởng (Tháng 1–2)

- [x] `PlannerForm` gọi `POST /api/generate-meal-plan` qua `fetchMealPlan`
- [x] RSS outbound `/blog/feed.xml` và `/en/blog/feed.xml`
- [x] CTA blog → planner (`BlogPlannerCta`)
- [x] Bật nguồn NHS, ACOG trong `sources.ts`
- [x] Workflow deploy `.github/workflows/deploy.yml` (push `main`)
- [x] Cloudflare Web Analytics (`NEXT_PUBLIC_CF_BEACON_TOKEN`)
- [x] In thực đơn (`window.print` + `.no-print`)

## Phase 2 — AI cá nhân hóa (Tháng 3–4)

- [x] `aiClient.ts` — Workers AI / OpenAI với fallback rule-based
- [x] Turnstile verify (`TURNSTILE_SECRET_KEY`)
- [x] Đổi món từng bữa (`regenerateMealInPlan` + API)
- [x] Feature flags KV / env (`FEATURE_AI_PLANNER_ENABLED`)

## Phase 3 — Tài khoản & đồng bộ (Tháng 5–6)

- [x] D1 schema `migrations/0001_init.sql` + `cloudStorage.ts`
- [x] OAuth client_credentials (`/oauth/token`, `/oauth/authorize`)
- [x] Opt-in sync banner (`SyncOptInBanner`)
- [x] Privacy policy pages (VI/EN) — `/privacy`, `/en/privacy`

## Phase 4 — Content engine & SEO (Tháng 7–9)

- [x] Editorial synthesis `src/lib/blog/synthesis/synthesizePost.ts`
- [x] Unified sitemap crawl trong `ingest.ts`
- [x] Markdown v2 (ảnh, bảng, blockquote)
- [x] Topic hubs `/blog/topics`

## Phase 5 — Agents & scale (Tháng 10–12)

- [x] Live MCP `/mcp` — `create_meal_plan`, `get_nutrient_guidance`, `search_blog`
- [x] Rate limiting (`rateLimit.ts`)
- [x] Premium limits scaffold (`src/lib/premium/limits.ts`)
- [x] Playwright E2E `tests/e2e/planner.spec.ts`
- [x] Wrangler bindings: AI, KV, D1, R2

## Env secrets (không commit)

```bash
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
NEXT_PUBLIC_CF_BEACON_TOKEN=
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=
AI_PROVIDER=workers-ai
OPENAI_API_KEY=
FEATURE_AI_PLANNER_ENABLED=true
```

## KPI

| Phase | Metric |
|-------|--------|
| 1 | Auto-crawl success > 95%, Lighthouse mobile > 85 |
| 2 | p95 generate < 3s, 0 safety violations in tests |
| 3 | Opt-in sync preference stored |
| 4 | 300+ indexed posts |
| 5 | MCP tools live, 99.9% uptime target |
