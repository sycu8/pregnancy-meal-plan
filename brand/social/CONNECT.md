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
X_ACCESS_TOKEN=...          # user access token
# optional alias
TWITTER_ACCESS_TOKEN=...
```

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
FACEBOOK_PAGE_ACCESS_TOKEN=...
FACEBOOK_PAGE_ID=...          # numeric id (khuyến nghị)
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

## 6) Checklist CMO 7 ngày

- [ ] Bio + avatar + cover đã khớp `brand/social/BRAND_KIT.md`  
- [ ] Link bio trỏ về `https://pregnancymeal.tips/social`  
- [ ] Chạy `marketing:drafts` và đăng 3 post đầu tay để kiểm tra giọng điệu  
- [ ] Kết nối X token → `marketing:publish --platforms=x --live`  
- [ ] Kết nối Facebook Page token → `--platforms=facebook --live`  
- [ ] Bật cron dry-run 3 ngày, rồi `live=1`  
- [ ] TikTok: đăng tay theo draft cho đến khi API được duyệt  

---

## 7) An toàn nội dung

Mọi caption generator đều kèm disclaimer giáo dục.  
Không đăng chẩn đoán / cam kết y khoa. Ưu tiên tip + CTA planner/blog.
