# Pregnancy Meal Planner — Social Brand Kit

Brand kit for **Facebook Page**, **X (Twitter)**, and **TikTok**.  
Aligned with the live product at [pregnancymeal.tips](https://pregnancymeal.tips) (`#fffaf5` cream · `#287a69` teal · `#34231d` ink).

Machine-readable tokens: [`tokens.json`](./tokens.json)

---

## 1. Brand foundation

| Token | Hex | Use |
| --- | --- | --- |
| Cream | `#fffaf5` | Backgrounds, covers, post canvases |
| Ink | `#34231d` | Headlines, wordmark |
| Muted | `#7b655b` | Subcopy, captions |
| Blush | `#f4e9df` | Soft cards / washes |
| Border | `#ead8ca` | Hairlines, frames |
| Teal | `#287a69` | Logo disc, CTA, links |
| Teal soft | `#f5fffb` | Text on teal |
| Terracotta | `#bd5f42` | Sparse warmth only (never dominate) |

**Personality:** calm · practical · trustworthy · warm · never clinical-scare  
**Promise:** Personalized 7-day prenatal meal plans by week — with shopping lists and food-safety notes.  
**Disclaimer posture:** Educational reference; not medical advice.

### Logo system

1. **Mark** — teal disc + white bowl/leaf icon (best for tiny avatars, TikTok, favicons)
2. **Lockup** — mark + “Pregnancy Meal Planner” wordmark (covers, launch creatives)
3. **Wordmark-only** — dark serif on cream (rare; when mark already appears nearby)

**Clear space:** ≥ 1/4 of the mark diameter on all sides.  
**Do not:** recolor the mark to neon, add drop shadows, put the mark on busy food photography, or stretch the disc.

### Typography

- **Display:** Fraunces / Libre Baskerville / Source Serif 4 — brand name & big titles  
- **Body:** Be Vietnam Pro / Source Sans 3 / DM Sans — bios, captions, UI  
- Avoid default UI stacks (Inter, Roboto, Arial) for brand-facing creatives

---

## 2. Assets to upload

| Platform | Asset | Path | Size |
| --- | --- | --- | --- |
| All | Avatar (lockup) | `shared/avatar-1080.png` | 1080×1080 |
| All | Avatar (mark only) | `shared/mark-1080.png` | 1080×1080 |
| Facebook | Profile | `facebook/profile-1080.png` *or* `facebook/mark-1080.png` | 1080×1080 |
| Facebook | Cover (preferred) | `facebook/cover-1640x924.png` | 1640×924 |
| Facebook | Cover (legacy) | `facebook/cover-820x312.png` | 820×312 |
| X | Avatar | `x/mark-400.png` (preferred) or `x/avatar-400.png` | 400×400 |
| X | Header | `x/header-1500x500.png` | 1500×500 |
| TikTok | Avatar | `tiktok/mark-1080.png` (preferred) | 1080×1080 |
| TikTok | Video / pinned cover | `tiktok/video-cover-1080x1920.png` | 1080×1920 |

Public mirrors (for site / link-in-bio): `/brand/social/*` on the web root.

**Recommendation:** use **mark-only** as the profile picture on X + TikTok (reads at 32–48px). Use lockup on Facebook if the page name is already shown beside the avatar; otherwise mark-only is safer.

---

## 3. Facebook Page

### Setup
- **Page name:** Pregnancy Meal Planner  
- **Username:** `@PregnancyMealPlanner` (or closest available)  
- **Category:** Health & wellness website / App page  
- **Website:** `https://pregnancymeal.tips`  
- **CTA button:** “Sign up” or “Learn more” → `https://pregnancymeal.tips/planner`

### About (EN)
> Free 7-day pregnancy meal plans personalized by week, taste, budget, and common prenatal concerns — plus shopping lists and food-safety notes. Educational reference only; not medical advice. Also in Vietnamese.

### Giới thiệu (VI)
> Thực đơn mẹ bầu 7 ngày theo tuần thai, khẩu vị, ngân sách và triệu chứng thường gặp — kèm danh sách đi chợ và lưu ý an toàn thực phẩm. Chỉ mang tính tham khảo giáo dục, không thay thế bác sĩ.

### Cover rules
- Upload `cover-1640x924.png`
- Keep the headline in the **left ~55%** — mobile crops the right side under the profile photo
- Do not overlay extra promo stickers on the cover

### Post formats that fit the brand
1. **Tip cards** — cream canvas, teal accent bar, 1 tip + CTA  
2. **Blog share** — article title + 1 sentence takeaway + link  
3. **Planner CTA** — “Create this week’s plan” → `/planner`  
4. **Myth vs fact** — calm tone, cite WHO/CDC/NHS lightly

---

## 4. X (Twitter)

### Setup
- **Display name:** Pregnancy Meal Planner  
- **Handle:** `@PregMealTips` (suggested)  
- **Location:** —  
- **Website:** `https://pregnancymeal.tips`

### Bio (EN, ≤160)
> 7-day prenatal meal plans by week · shopping lists · food safety notes · EN + VI · free to start → pregnancymeal.tips

### Bio (VI alternative)
> Thực đơn mẹ bầu 7 ngày · danh sách đi chợ · EN + VI · bắt đầu miễn phí → pregnancymeal.tips

### Header rules
- Upload `header-1500x500.png`
- Avatar sits on the **bottom-left** of the header — keep that zone free of critical text (already designed in)

### Content cadence (starter)
- 4–5 posts/week  
- Mix: 40% tips · 30% blog links · 20% planner CTAs · 10% social proof / product updates  
- Prefer 1 link per post; use UTM: `?utm_source=x&utm_medium=social&utm_campaign=brand`

---

## 5. TikTok

### Setup
- **Name:** Pregnancy Meal Planner  
- **Username:** `@pregnancymeal.tips` (or `@pregmealtips`)  
- **Avatar:** `tiktok/mark-1080.png`  
- **Website / link:** `https://pregnancymeal.tips` (or `/social` when live)

### Bio (EN)
> Prenatal meals, week by week 🌿  
> Free 7-day planner + shopping list  
> EN · VI · pregnancymeal.tips

### Bio (VI)
> Thực đơn mẹ bầu theo tuần 🌿  
> Planner 7 ngày miễn phí + list đi chợ  
> pregnancymeal.tips

### Video cover / pinned
- Use `video-cover-1080x1920.png` as a brand bumper or pinned series cover  
- Keep on-screen text in the **middle 60%** vertically (UI chrome covers edges)

### Native video style
- Soft cream end-card with teal CTA pill  
- Voiceover: calm, 15–30s, one tip only  
- Caption hook in first line; CTA in last line  
- On-screen type: serif for the tip title, sans for the body  
- Avoid trending “shock” medical claims

---

## 6. Voice samples

### Facebook / X tip (EN)
> Morning nausea tip: keep a small protein + carb snack by the bed (yogurt + banana, or crackers + cheese). Eat before standing up.  
> Build a full week around your symptoms → pregnancymeal.tips/planner

### Facebook / X tip (VI)
> Mẹo nghén buổi sáng: để sẵn bữa phụ đạm + tinh bột cạnh giường (sữa chua + chuối, hoặc bánh quy + phô mai). Ăn một ít trước khi ngồi dậy.  
> Lên thực đơn cả tuần theo triệu chứng → pregnancymeal.tips/vi/planner

### TikTok hook lines
- EN: “What to eat in week 12 when nothing sounds good”  
- EN: “3 grocery swaps for gestational diabetes meal planning”  
- VI: “Tuần 12 nghén nặng thì ăn gì?”  
- VI: “3 món dễ nấu cho mẹ bầu thiếu sắt”

---

## 7. Hashtags & UTM

**Core (use 1–3):** `#PregnancyMealPlan` `#PrenatalNutrition` `#PregnancyTips`  
**VI (use 1–2):** `#ThucDonMeBau` `#DinhDuongThaiKy` `#MeBau`

**UTM template**
```
https://pregnancymeal.tips/planner?utm_source=facebook&utm_medium=social&utm_campaign=brand_kit
https://pregnancymeal.tips/planner?utm_source=x&utm_medium=social&utm_campaign=brand_kit
https://pregnancymeal.tips/planner?utm_source=tiktok&utm_medium=social&utm_campaign=brand_kit
```

---

## 8. Checklist — go live

- [ ] Upload mark avatar on X + TikTok; lockup or mark on Facebook  
- [ ] Upload Facebook cover `1640×924` + X header `1500×500`  
- [ ] Paste EN/VI bios; set website + CTA to planner  
- [ ] Pin one intro post / TikTok brand cover  
- [ ] First 7 posts from section 6 voice samples  
- [ ] Track clicks with UTM in the first two weeks  

---

## 9. Legal / safety line (pin or About)

EN: *Educational information only. Not a substitute for obstetric or dietitian advice.*  
VI: *Chỉ mang tính giáo dục tham khảo. Không thay thế tư vấn bác sĩ sản hoặc chuyên gia dinh dưỡng.*
