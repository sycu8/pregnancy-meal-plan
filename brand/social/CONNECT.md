# Kết nối tự đăng bài (Marketing MVP)

Trang social trên web: [pregnancymeal.tips/social](https://pregnancymeal.tips/social)  
Profiles đã gắn:

- Facebook: https://www.facebook.com/PregnancyMealPlanner
- X: https://x.com/PregMealTips
- TikTok: https://www.tiktok.com/@pregnancymeal.tips

Pipeline trong repo:

1. `npm run marketing:drafts` — tạo caption từ blog  
2. `npm run marketing:publish` — dry-run đăng (mặc định)  
3. `npm run marketing:publish -- --live` — đăng thật khi đã có token  
4. `POST /api/cron/social-publish` — cron tự động (cần `CRON_SECRET`)

---

## 0) Chạy thử ngay (không cần token)

```bash
# Tạo draft từ 3 bài blog mới nhất (EN)
npm run marketing:drafts

# Dry-run đăng (in ra sẽ gọi API nào, không post thật)
npm run marketing:publish -- --slug=<blog-slug>

# Chỉ X + Facebook
npm run marketing:publish -- --slug=<blog-slug> --platforms=x,facebook
```

File draft mặc định: `tmp/marketing-drafts.md`

---

## 1) X / Pepsi… wait — X (@PregMealTips)

### Tạo app
1. Vào [developer.x.com](https://developer.x.com/) → tạo Project + App  
2. Bật **Read and write**  
3. User authentication settings → OAuth 2.0 → type **Native App** hoặc **Web App**  
4. Callback ví dụ: `https://pregnancymeal.tips/social`  
5. Generate **OAuth 2.0 Access Token** (user token của `@PregMealTips`) với scope `tweet.read tweet.write users.read offline.access`

### Env
```bash
X_ACCESS_TOKEN=...          # OAuth 2.0 *User Context* access token of @PregMealTips
X_REFRESH_TOKEN=...         # from the same OAuth 2.0 PKCE login
X_CLIENT_ID=...             # OAuth 2.0 Client ID (for refresh)
X_CLIENT_SECRET=...         # OAuth 2.0 Client Secret (for refresh)
# optional alias
TWITTER_ACCESS_TOKEN=...
```

> App-only Bearer token **không** đăng được tweet.  
> Cần OAuth 2.0 user token (`tweet.write`) + ideally `offline.access` refresh token.  
> Nếu API trả `402 credits depleted`: nạp credit / nâng plan tại [X Developer Console](https://developer.x.com/en/portal/dashboard) — auth đúng nhưng tài khoản hết write credits.

### Đăng thật
```bash
npm run marketing:publish -- --slug=<blog-slug> --platforms=x --live
```

---

## 2) Facebook Page (PregnancyMealPlanner)

### Tạo app Meta
1. [developers.facebook.com](https://developers.facebook.com/) → Create App → type **Business**  
2. Add product **Facebook Login** + **pages_manage_posts**, `pages_read_engagement`  
3. Trong Graph API Explorer / Business settings: lấy **Page Access Token** cho Page `PregnancyMealPlanner`  
4. Nên đổi sang **long-lived Page token** (≈ 60 ngày) hoặc System User token không hết hạn trong Business Manager

### Lấy Page ID
```bash
curl "https://graph.facebook.com/v21.0/me?access_token=PAGE_TOKEN"
# hoặc
curl "https://graph.facebook.com/v21.0/PregnancyMealPlanner?fields=id,name&access_token=PAGE_TOKEN"
```

### Env
```bash
FACEBOOK_PAGE_ACCESS_TOKEN=...   # Page token (from /me/accounts), NOT user token
FACEBOOK_PAGE_ID=1139881852552831  # Pregnancy Meal Planner (numeric). Do not use portfolio IDs like 6159…
```

### Quyền bắt buộc để đăng bài
Trong Meta App → App Review / Graph API Explorer, token cần có:
- `pages_read_engagement`
- `pages_manage_posts`  ← thiếu quyền này thì Graph trả lỗi `#200`

Lấy Page token đúng:
```bash
curl "https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token&access_token=USER_TOKEN"
```

### Đăng thật
```bash
npm run marketing:publish -- --slug=<blog-slug> --platforms=facebook --live
```

---

## 3) TikTok (@pregnancymeal.tips)

TikTok **Content Posting API** cần duyệt app (không post video bằng token cá nhân đơn giản như X).

MVP hiện tại:
- Tạo **script/caption draft** sẵn (`marketing:drafts`)
- Dry-run publisher báo thiếu `TIKTOK_ACCESS_TOKEN`
- Đăng tay trong TikTok Creator / đăng sau khi app được duyệt

Khi có app:
```bash
TIKTOK_ACCESS_TOKEN=...
```
Sau đó mở rộng `src/lib/marketing/publishers.ts` để upload video (inbox/direct post).

---

## 4) Secrets trên Cloudflare Worker

Thêm secrets (không commit vào git):

```bash
npx wrangler secret put CRON_SECRET
npx wrangler secret put X_ACCESS_TOKEN
npx wrangler secret put FACEBOOK_PAGE_ACCESS_TOKEN
npx wrangler secret put FACEBOOK_PAGE_ID
# optional later
npx wrangler secret put TIKTOK_ACCESS_TOKEN
```

Local `.dev.vars` / `.env.local`:

```bash
CRON_SECRET=choose-a-long-random-string
X_ACCESS_TOKEN=
FACEBOOK_PAGE_ACCESS_TOKEN=
FACEBOOK_PAGE_ID=
```

---

## 5) Cron tự đăng (GitHub Actions hoặc Cloudflare)

### GitHub Actions (đơn giản)
Tạo workflow gọi:

```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://pregnancymeal.tips/api/cron/social-publish?locale=en&platforms=x,facebook&live=1"
```

Lịch gợi ý: **Mon / Wed / Fri 09:00 ICT**.

### Dry-run trước khi bật live
```bash
curl -X POST \
  -H "Authorization: Bearer $CRON_SECRET" \
  "https://pregnancymeal.tips/api/cron/social-publish?locale=en&platforms=x,facebook"
```

---

## 6) Marketing portal + Zapier / n8n

Portal (noindex): [pregnancymeal.tips/marketing](https://pregnancymeal.tips/marketing)  
Mở bằng `MARKETING_API_KEY` hoặc `CRON_SECRET` (Bearer). Portal hiển thị:

- Trạng thái kết nối X / Facebook / TikTok  
- Draft queue từ blog mới nhất  
- Activity log (dry-run / live)  
- Endpoint sẵn cho automation  

Auth cho mọi API marketing:

```bash
Authorization: Bearer $CRON_SECRET
# hoặc
Authorization: Bearer $MARKETING_API_KEY
# Zapier cũng nhận header:
X-API-KEY: $CRON_SECRET
```

### Endpoints

| Method | URL | Dùng cho |
| --- | --- | --- |
| GET | `/api/marketing/status?locale=en` | Portal / health |
| GET | `/api/marketing/drafts?locale=en&limit=3` | Lấy caption |
| POST | `/api/marketing/publish` | Đăng (default dry-run) |
| GET/POST | `/api/marketing/hooks/zapier` | Zapier poll + action |
| POST | `/api/cron/social-publish` | Cron |

### Zapier (Webhooks by Zapier)

**Trigger — poll drafts**
1. App: *Webhooks by Zapier* → *Retrieve Poll*  
2. URL: `https://pregnancymeal.tips/api/marketing/hooks/zapier?locale=en&limit=3`  
3. Auth header: `Authorization: Bearer <CRON_SECRET>`  
4. Deduper key: `id`

**Action — publish**
1. *Webhooks by Zapier* → *Custom Request* (POST)  
2. URL: `https://pregnancymeal.tips/api/marketing/publish`  
3. Headers: `Authorization: Bearer <CRON_SECRET>`, `Content-Type: application/json`  
4. Body:
```json
{
  "slug": "{{slug}}",
  "locale": "en",
  "platforms": ["x", "facebook"],
  "live": false,
  "source": "zapier"
}
```
Đổi `"live": true` khi đã tin pipeline.

### n8n

1. **Cron** node (ví dụ 09:00 ICT Mon/Wed/Fri)  
2. **HTTP Request** GET `https://pregnancymeal.tips/api/marketing/drafts?locale=en&limit=1`  
   Header `Authorization: Bearer <CRON_SECRET>`  
3. **Split Out** / Item Lists trên `drafts` (tuỳ chọn)  
4. **HTTP Request** POST `https://pregnancymeal.tips/api/marketing/publish`  
```json
{
  "slug": "{{$json.drafts[0].sourceSlug}}",
  "locale": "en",
  "platforms": ["x", "facebook"],
  "live": false,
  "source": "n8n"
}
```
5. Xem kết quả trên `/marketing` → Recent activity  

Dry-run trước (`live: false`). Khi X có credit và Facebook có `pages_manage_posts`, bật `live: true`.

---

## 7) Checklist CMO 7 ngày

- [ ] Bio + avatar + cover đã khớp `brand/social/BRAND_KIT.md`  
- [ ] Link bio trỏ về `https://pregnancymeal.tips/social`  
- [ ] Chạy `marketing:drafts` và đăng 3 post đầu tay để kiểm tra giọng điệu  
- [ ] Kết nối X token → `marketing:publish --platforms=x --live`  
- [ ] Kết nối Facebook Page token → `--platforms=facebook --live`  
- [ ] Bật cron dry-run 3 ngày, rồi `live=1`  
- [ ] TikTok: đăng tay theo draft cho đến khi API được duyệt  

---

## 8) An toàn nội dung

Mọi caption generator đều kèm disclaimer giáo dục.  
Không đăng chẩn đoán / cam kết y khoa. Ưu tiên tip + CTA planner/blog.
