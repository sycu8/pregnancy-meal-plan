# Bầu Ăn Gì?

AI meal planner miễn phí cho mẹ bầu Việt Nam. MVP này tạo thực đơn 7 ngày món Việt, BMI/tăng cân thai kỳ tham khảo, danh sách đi chợ và cảnh báo an toàn thực phẩm.

## Tính năng

- Landing page với CTA “Tạo thực đơn miễn phí”
- Form nhiều bước, mobile-first, không bắt buộc đăng nhập
- BMI trước mang thai và đánh giá tăng cân thai kỳ tham khảo
- Thực đơn 7 ngày gồm bữa sáng, phụ sáng, trưa, phụ chiều, tối
- Danh sách đi chợ gom theo nhóm thực phẩm
- Cảnh báo thực phẩm nên tránh trong thai kỳ
- Gợi ý để đảm bảo các nhóm chất quan trọng: đạm, sắt, vitamin C, canxi, vitamin D, folate, omega-3, choline, iodine, chất xơ và nước
- Khối nguồn tham khảo chính thống từ ACOG, CDC, NHS và WHO
- Ghi chú cho nghén, táo bón, thiếu máu, tiểu đường thai kỳ, tăng huyết áp, phù, trào ngược, tăng/giảm cân
- Hồ sơ và lịch sử thực đơn lưu bằng `localStorage`
- API `POST /api/generate-meal-plan` sẵn abstraction để nâng cấp sang AI

## Tech Stack Cloudflare-First

- Next.js App Router + TypeScript
- Tailwind CSS, component style theo tinh thần shadcn/ui
- Rule-based meal planner ở MVP, không cần AI key
- Cloudflare Workers/OpenNext adapter qua `@opennextjs/cloudflare`
- Cloudflare Pages/Workers static assets qua Wrangler

## Chạy local

```bash
corepack pnpm install
corepack pnpm dev
```

Mở `http://localhost:3000`.

Nếu máy đã có shim `pnpm`, có thể dùng:

```bash
pnpm install
pnpm dev
```

Project có `.npmrc` dùng `node-linker=hoisted` để OpenNext/Cloudflare bundle ổn định với pnpm.

## Kiểm tra

```bash
corepack pnpm test
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm build
```

## Deploy Cloudflare

Cloudflare hiện khuyến nghị OpenNext cho Next.js trên Workers runtime. Cấu hình chính nằm ở:

- `wrangler.jsonc`
- `open-next.config.ts`
- script `deploy:cloudflare`

Deploy:

```bash
corepack pnpm deploy:cloudflare
```

Preview runtime Cloudflare:

```bash
corepack pnpm preview:cloudflare
```

Trong dashboard Cloudflare, có thể kết nối repository và dùng build command:

```bash
corepack pnpm install && corepack pnpm deploy:cloudflare
```

## Cấu trúc thư mục

```txt
src/
  app/
    api/generate-meal-plan/route.ts
    history/
    planner/
    profile/
    result/
  components/
    history/
    planner/
    result/
    shared/
  lib/
    cloudflare/
    nutrition/
    storage/
  types/
```

## Vì sao MVP chưa cần database

Giai đoạn đầu không có account, login, payment, pricing hoặc subscription. Hồ sơ và lịch sử thực đơn chỉ dùng trên một thiết bị, nên `localStorage` đủ nhanh, rẻ và giảm rủi ro lưu dữ liệu nhạy cảm trên server.

## Data Privacy

Ở phiên bản miễn phí đầu tiên, thông tin của bạn được lưu trên trình duyệt bằng `localStorage`. Ứng dụng chưa đồng bộ dữ liệu lên server.

Luồng UI mặc định tạo thực đơn client-side, không gửi hồ sơ mẹ bầu lên server. API `POST /api/generate-meal-plan` tồn tại để nâng cấp sau này; nếu dùng API, chỉ gửi dữ liệu cần thiết cho việc tạo thực đơn.

## Lưu ý an toàn y tế

Thực đơn được tạo tự động dựa trên thông tin bạn cung cấp và chỉ mang tính tham khảo. Ứng dụng không chẩn đoán, điều trị hoặc thay thế tư vấn từ bác sĩ sản khoa/chuyên gia dinh dưỡng. Nếu bạn có tiểu đường thai kỳ, tăng huyết áp, tiền sản giật, thiếu máu nặng, thai chậm tăng trưởng hoặc bất kỳ vấn đề y khoa nào, hãy hỏi bác sĩ trước khi áp dụng.

## Nguồn tham khảo chính thống

- ACOG: Healthy Eating During Pregnancy, các nhóm chất cần chú ý trong thai kỳ.
- CDC: Safer Food Choices for Pregnant Women, hướng dẫn an toàn thực phẩm cho phụ nữ mang thai.
- NHS: Foods to avoid in pregnancy, thực phẩm cần tránh hoặc cần nấu chín kỹ.
- WHO: Daily iron and folic acid supplementation in pregnant women, khuyến nghị sắt và acid folic ở cấp sức khỏe cộng đồng.

## Roadmap Cloudflare

1. Workers AI hoặc OpenAI qua Worker
2. Cloudflare AI Gateway để log, cache, rate limit AI calls
3. D1 cho user profile khi có account
4. KV cho public config/cache meal templates
5. R2 cho PDF export hoặc upload xét nghiệm
6. Turnstile chống spam
7. Web Analytics
8. Rate Limiting

## Optional Env Sau Này

MVP không bắt buộc env. Khi bật AI có thể thêm:

```bash
OPENAI_API_KEY=
AI_PROVIDER=openai
AI_GATEWAY_URL=
```

Nếu thiếu env hoặc AI lỗi, abstraction trong `src/lib/cloudflare/aiClient.ts` fallback về rule-based planner.
