/**
 * Synthesized blog posts inspired by Medlatec & Long Châu articles.
 * Run: npm run add:pharmacy-blog-seeds && npm run sync:blog && npm run publish:blog:en
 */
import fs from "node:fs";
import path from "node:path";
import type { BlogPost } from "../src/types/blog";

const postsDir = path.join(process.cwd(), "content/blog/posts");
const accessed = "2026-06-01";
const author = "Đội ngũ Bầu Ăn Gì?";

function ref(title: string, url: string, publisher: string) {
  return { title, url, publisher, accessedAt: accessed };
}

function post(partial: BlogPost): BlogPost {
  return {
    ...partial,
    readingTimeMinutes: partial.readingTimeMinutes ?? 5,
    status: partial.status ?? "published",
    author: partial.author ?? author
  };
}

const seeds: BlogPost[] = [
  post({
    title: "Cân nặng thai nhi: tiêu chuẩn theo tuần và khi nào cần lo",
    slug: "can-nang-thai-nhi-tieu-chuan",
    excerpt:
      "Bảng tham khảo cân nặng thai nhi theo tuần, yếu tố ảnh hưởng và dấu hiệu cần khám sớm — tham khảo Medlatec, ACOG.",
    category: "truoc-sinh",
    tags: ["can-nang-thai-nhi", "sieu-am", "tam-soat"],
    reviewer: "Tham chiếu Medlatec, ACOG",
    publishedAt: "2026-06-01T08:00:00+07:00",
    updatedAt: "2026-06-01T08:00:00+07:00",
    metaTitle: "Cân nặng thai nhi theo tuần | Blog Bầu Ăn Gì?",
    metaDescription: "Tiêu chuẩn cân nặng thai nhi, siêu âm và khi cần can thiệp — Medlatec, ACOG.",
    sourceReferences: [
      ref(
        "Cân nặng thai nhi như thế nào là đạt tiêu chuẩn?",
        "https://medlatec.vn/tin-tuc/can-nang-thai-nhi-nhu-the-nao-la-dat-tieu-chuan-s166-n33666",
        "Medlatec"
      ),
      ref("ACOG — Fetal Growth Restriction", "https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2018/01/fetal-growth-restriction", "ACOG")
    ],
    content: `## Vì sao theo dõi cân nặng thai nhi?\n\nCân nặng ước tính qua siêu âm giúp đánh giá thai có tăng trưởng phù hợp tuổi thai. Chỉ số này **không chính xác tuyệt đối** nhưng hữu ích khi so với đường cong chuẩn.\n\n## Yếu tố ảnh hưởng\n\n- Tuổi thai, số thai.\n- Gen, dinh dưỡng mẹ, bệnh nền (tiểu đường, tăng huyết áp…).\n- Ngày kinh cuối không chắc chắn → sai lệch tuổi thai.\n\n## Khi nào cần hỏi bác sĩ?\n\n- Cân nặng ước tính < percentile 10 hoặc > 90 (theo biểu đồ đơn vị khám).\n- Tăng trưởng chậm liên tiếp trên 2 lần siêu âm.\n- Giảm cử động thai.\n\n## Dinh dưỡng hỗ trợ\n\nĂn đủ đạm, sắt, folate; không tự ăn kiêng quá mức hoặc tăng cân quá nhanh nếu chưa được tư vấn.`
  }),
  post({
    title: "Khám thai lần đầu nên vào tuần thứ mấy?",
    slug: "kham-thai-lan-dau-tuan-bao-nhieu",
    excerpt:
      "Lịch khám thai đầu tiên, xét nghiệm thường gặp và chuẩn bị trước buổi hẹn — tham khảo Medlatec, WHO.",
    category: "truoc-sinh",
    tags: ["kham-thai", "lan-dau", "xet-nghiem"],
    trimester: "3-thang-dau",
    reviewer: "Tham chiếu Medlatec, WHO",
    publishedAt: "2026-06-01T09:00:00+07:00",
    updatedAt: "2026-06-01T08:00:00+07:00",
    metaTitle: "Khám thai lần đầu vào tuần mấy? | Blog Bầu Ăn Gì?",
    metaDescription: "Khi nào đi khám thai lần đầu và cần làm gì — Medlatec, WHO.",
    sourceReferences: [
      ref(
        "Khám thai lần đầu vào tuần thứ mấy cần lưu ý?",
        "https://medlatec.vn/tin-tuc/kham-thai-lan-dau-vao-tuan-thu-may-can-luu-y-s166-n33520",
        "Medlatec"
      ),
      ref("WHO — Antenatal care", "https://www.who.int/publications/i/item/9789241549912", "WHO")
    ],
    content: `## Thời điểm khuyến nghị\n\nNhiều hướng dẫn gợi ý **khám trong 8–12 tuần đầu** hoặc ngay khi biết mang thai (đặc biệt nếu có bệnh nền, thuốc đang dùng, đau bụng, ra máu).\n\n## Buổi khám thường có\n\n- Hỏi tiền sử, thuốc, dị ứng.\n- Khám lâm sàng, đo huyết áp.\n- Xét nghiệm máu, nước tiểu (tùy cơ sở).\n- Siêu âm xác nhận thai trong tử cung, tim thai, ước tính tuổi thai.\n\n## Chuẩn bị\n\n- Mang danh sách thuốc/vitamin.\n- Ghi câu hỏi về ăn uống, nghén, vận động.\n- Mang theo kết quả xét nghiệm cũ nếu có.\n\n## Lưu ý\n\nKhông trì hoãn nếu có ra máu, đau một bên bụng dữ (lo thai ngoài tử cung).`
  }),
  post({
    title: "Gợi ý thực đơn cho mẹ bầu tiểu đường thai kỳ",
    slug: "thuc-don-me-bau-tieu-duong-goi-y",
    excerpt:
      "Nguyên tắc chia bữa, chỉ số đường huyết và món ăn Việt Nam phù hợp khi đã được chẩn đoán GDM — Medlatec, ADA.",
    category: "dinh-duong-ba-bau",
    tags: ["tieu-duong-thai-ky", "thuc-don", "duong-huyet"],
    reviewer: "Tham chiếu Medlatec, ADA",
    publishedAt: "2026-06-01T10:00:00+07:00",
    updatedAt: "2026-06-01T08:00:00+07:00",
    metaTitle: "Thực đơn tiểu đường thai kỳ | Blog Bầu Ăn Gì?",
    metaDescription: "Ăn uống khi tiểu đường thai kỳ: chia bữa, chỉ số đường — Medlatec.",
    sourceReferences: [
      ref(
        "Gợi ý thực đơn cho bà bầu tiểu đường 3 tháng",
        "https://medlatec.vn/tin-tuc/goi-y-thuc-don-cho-ba-bau-tieu-duong-3-thang-s166-n33510",
        "Medlatec"
      ),
      ref("ADA — Gestational Diabetes", "https://diabetes.org/about-diabetes/gestational-diabetes", "ADA")
    ],
    content: `## Nguyên tắc chung\n\nMục tiêu: **ổn định đường huyết** theo mục tiêu bác sĩ đặt. Thường chia **3 bữa chính + 2–3 bữa phụ**, không bỏ bữa.\n\n## Chọn carbohydrate\n\n- Ưu tiên gạo lứt, yến mạch, khoai lang; hạn chế đồ ngọt, nước ngọt.\n- Kết hợp **đạm + chất xơ + chất béo lành mạnh** mỗi bữa để hấp thu chậm hơn.\n\n## Mẫu bữa tham khảo\n\n- **Sáng:** cháo yến mạch + trứng luộc + rau.\n- **Phụ sáng:** sữa chua không đường + hạnh nhân.\n- **Trưa:** cơm gạo lứt + cá nấu chín + canh rau.\n- **Phụ chiều:** trái cây ít ngọt (táo, ổi) + đậu phụ.\n- **Tối:** miến/bún + thịt nạc + salad.\n\n## Theo dõi\n\nĐo đường huyết tại nhà nếu được chỉ định; ghi nhận phản ứng sau bữa. Thuốc/insulin chỉ theo đơn.`
  }),
  post({
    title: "Dấu hiệu tiền sản giật mẹ bầu cần ghi nhớ",
    slug: "dau-hieu-tien-san-giat-som",
    excerpt:
      "Đau đầu, nhìn mờ, phù nặng có thể là tiền sản giật — khi nào cần đến viện ngay — Medlatec, NHS.",
    category: "truoc-sinh",
    tags: ["tien-san-giat", "can-gap", "tang-huyet-ap"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu Medlatec, NHS",
    publishedAt: "2026-05-31T14:00:00+07:00",
    updatedAt: "2026-06-01T08:00:00+07:00",
    metaTitle: "Dấu hiệu tiền sản giật | Blog Bầu Ăn Gì?",
    metaDescription: "Nhận biết tiền sản giật sớm — Medlatec, NHS.",
    sourceReferences: [
      ref(
        "Những dấu hiệu tiền sản giật mẹ bầu cần ghi nhớ",
        "https://medlatec.vn/tin-tuc/nhung-dau-hieu-tien-san-giat-me-bau-can-ghi-nho-s166-n33480",
        "Medlatec"
      ),
      ref("NHS — Pre-eclampsia", "https://www.nhs.uk/conditions/pre-eclampsia/", "NHS")
    ],
    content: `## Tiền sản giật là gì?\n\nTăng huyết áp sau tuần 20 kèm dấu hiệu tổn thương cơ quan (protein niệu, gan, thận…) hoặc triệu chứng nặng.\n\n## Dấu hiệu cảnh báo\n\n- Đau đầu dữ, không thuyên giảm.\n- Nhìn mờ, đốm sáng.\n- Đau thượng vị, buồn nôn nặng.\n- Phù mặt/tay đột ngột.\n- Giảm cử động thai.\n\n## Việc cần làm\n\n**Đến cơ sở y tế ngay** — không tự điều trị tại nhà. Có thể cần nhập viện, theo dõi con và mẹ.\n\n## Liên quan dinh dưỡng\n\nKhông tự hạn muối cực đoan; ăn đủ đạm theo chỉ định y tế.`
  }),
  post({
    title: "Tiền sản giật sau sinh: biến chứng và theo dõi",
    slug: "tien-san-giat-sau-sinh",
    excerpt:
      "Tiền sản giật có thể xuất hiện sau đẻ; dấu hiệu cần tái khám và lưu ý huyết áp — Medlatec, ACOG.",
    category: "sau-sinh",
    tags: ["tien-san-giat", "sau-sinh", "can-gap"],
    reviewer: "Tham chiếu Medlatec, ACOG",
    publishedAt: "2026-05-31T15:00:00+07:00",
    updatedAt: "2026-06-01T08:00:00+07:00",
    metaTitle: "Tiền sản giật sau sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Tiền sản giật sau sinh: dấu hiệu và theo dõi — Medlatec.",
    sourceReferences: [
      ref(
        "Tiền sản giật sau sinh: biến chứng, nhận biết",
        "https://medlatec.vn/tin-tuc/tien-san-giat-sau-sinh-bien-chung-nhan-biet-s166-n33470",
        "Medlatec"
      ),
      ref("ACOG — Hypertension in Pregnancy", "https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2020/06/gestational-hypertension-and-preeclampsia", "ACOG")
    ],
    content: `## Vì sao vẫn nguy hiểm sau sinh?\n\nHuyết áp có thể tăng cao trong **48 giờ đến vài tuần** sau sinh, kể cả khi huyết áp đã ổn trước đó.\n\n## Dấu hiệu\n\nGiống thai kỳ: đau đầu, nhìn mờ, phù, đau bụng trên. Sản phụ sau mổ hoặc sinh thường đều cần theo dõi.\n\n## Theo dõi\n\n- Đo huyết áp tại nhà nếu bác sĩ yêu cầu.\n- Tái khám đúng hẹn sau sinh.\n- Báo ngay triệu chứng nặng.\n\n## Cho con bú\n\nNhiều thuốc huyết áp tương thích cho con bú — hỏi bác sĩ, không tự ngưng thuốc.`
  }),
  post({
    title: "Tiêm vitamin K cho trẻ sơ sinh: điều cần biết",
    slug: "tiem-vitamin-k-cho-tre-so-sinh",
    excerpt:
      "Vai trò vitamin K, lịch tiêm sơ sinh và lưu ý cho mẹ sau sinh — Medlatec, CDC, AAP.",
    category: "cham-con-0-24-thang",
    tags: ["vitamin-k", "so-sinh", "tiem-chung"],
    babyAgeRange: "0-6-thang",
    reviewer: "Tham chiếu Medlatec, CDC",
    publishedAt: "2026-05-31T16:00:00+07:00",
    updatedAt: "2026-06-01T08:00:00+07:00",
    metaTitle: "Vitamin K cho trẻ sơ sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Tiêm vitamin K sơ sinh: vì sao và khi nào — Medlatec, CDC.",
    sourceReferences: [
      ref(
        "Tiêm vitamin K cho trẻ sơ sinh: những điều cha mẹ cần biết",
        "https://medlatec.vn/tin-tuc/tiem-vitamin-k-cho-tre-so-sinh-nhung-dieu-cha-me-can-biet-s166-n33540",
        "Medlatec"
      ),
      ref("CDC — Vitamin K and the Newborn", "https://www.cdc.gov/ncbddd/vitamink/index.html", "CDC")
    ],
    content: `## Vì sao cần vitamin K?\n\nTrẻ sơ sinh có nguy cơ **chảy máu do thiếu vitamin K** (VKDB) vì lượng vitamin K qua nhau thai và sữa mẹ thường thấp.\n\n## Tiêm sau sinh\n\nNhiều quốc gia khuyến cáo **một liều tiêm vitamin K** sớm sau đẻ (theo quy định địa phương). Đây là biện pháp phòng ngừa hiệu quả.\n\n## Cho con bú\n\nBú mẹ vẫn được khuyến khích; tiêm K **bổ sung** chứ không thay thế sữa mẹ.\n\n## Lưu ý\n\n- Hỏi bệnh viện về lịch tiêm chuẩn.\n- Không tự mua tiêm tại nhà nếu không có chỉ định y tế.`
  }),
  post({
    title: "Chỉ số beta-hCG tuần đầu: hiểu đúng để bớt lo",
    slug: "chi-so-beta-hcg-hai-tuan-dau",
    excerpt:
      "beta-hCG là gì, mức tham khảo tuần 2–4 và khi nào cần tái khám — Long Châu, NHS.",
    category: "truoc-sinh",
    tags: ["beta-hcg", "xet-nghiem", "3-thang-dau"],
    trimester: "3-thang-dau",
    reviewer: "Tham chiếu Long Châu, NHS",
    publishedAt: "2026-05-30T12:00:00+07:00",
    updatedAt: "2026-06-01T08:00:00+07:00",
    metaTitle: "Beta-hCG 2 tuần đầu | Blog Bầu Ăn Gì?",
    metaDescription: "Hiểu chỉ số beta-hCG khi mang thai — Long Châu, NHS.",
    sourceReferences: [
      ref(
        "Giúp mẹ bầu hiểu đúng về chỉ số beta-hCG thai 2 tuần",
        "https://nhathuoclongchau.com.vn/bai-viet/giup-me-bau-hieu-dung-ve-chi-so-beta-hcg-thai-2-tuan.html",
        "Long Châu"
      ),
      ref("NHS — Signs and symptoms of pregnancy", "https://www.nhs.uk/pregnancy/trying-for-a-baby/signs-and-symptoms-of-pregnancy/", "NHS")
    ],
    content: `## beta-hCG là gì?\n\nHormone do nhau thai tiết ra, xuất hiện trong máu và nước tiểu khi có thai. Xét nghiệm giúp **xác nhận thai sớm**.\n\n## Mức tham khảo (rất đa dạng)\n\nTuần 2–4 có thể tăng gấp đôi khoảng 48–72 giờ ở thai phát triển bình thường — nhưng **một con số không đủ** để kết luận.\n\n## Khi nào lo?\n\n- Đau bụng một bên, chóng mặt (lo thai ngoài tử cung).\n- Ra máu kèm đau.\n- Tăng chậm hoặc giảm bất thường **kèm triệu chứng** — cần siêu âm, theo dõi serial.\n\n## Lưu ý\n\nKhông so sánh với người khác trên mạng; diễn giải do bác sĩ.`
  }),
  post({
    title: "Siêu âm nhiều có ảnh hưởng thai nhi không?",
    slug: "sieu-am-thai-nhieu-co-hai-khong",
    excerpt:
      "Siêu âm thai kỳ dùng sóng âm, không phải tia X; tần suất theo chỉ định y khoa — Long Châu, FDA.",
    category: "truoc-sinh",
    tags: ["sieu-am", "tam-soat", "an-toan"],
    reviewer: "Tham chiếu Long Châu, FDA",
    publishedAt: "2026-05-30T13:00:00+07:00",
    updatedAt: "2026-06-01T08:00:00+07:00",
    metaTitle: "Siêu âm thai nhiều có hại không? | Blog Bầu Ăn Gì?",
    metaDescription: "Siêu âm thai kỳ có an toàn không — Long Châu, FDA.",
    sourceReferences: [
      ref(
        "Siêu âm nhiều có ảnh hưởng đến thai nhi không?",
        "https://nhathuoclongchau.com.vn/bai-viet/sieu-am-nhieu-co-anh-huong-den-thai-nhi-khong-thong-tin-me-bau-can-biet.html",
        "Long Châu"
      ),
      ref("FDA — Ultrasound Imaging", "https://www.fda.gov/radiation-emitting-products/medical-imaging/ultrasound-imaging", "FDA")
    ],
    content: `## Siêu âm hoạt động thế nào?\n\nDùng sóng âm tần số cao, **không dùng bức xạ ion** như CT. Được dùng rộng rãi trong thai kỳ.\n\n## Có hại không?\n\nKhi thực hiện bởi nhân viên y tế, theo **chỉ định lâm sàng**, siêu âm được coi là an toàn. Tránh siêu âm “4D thương mại” không cần thiết kéo dài.\n\n## Lịch thường gặp\n\n- Xác nhận thai, tim thai.\n- Sàng lọc giải phẫu (tuần 11–14, 18–22 tùy gói).\n- Theo dõi tăng trưởng, nhau, nước ối khi có chỉ định.\n\n## Kết luận\n\nTin vào chỉ định bác sĩ; không tự ý siêu âm quá dày vì lo lắng.`
  }),
  post({
    title: "Thai nhi hiccup (đạp nhiều): bình thường hay cần khám?",
    slug: "thai-nhi-hiccup-dap-nhieu",
    excerpt:
      "Cử động thai và “thai máy” khác nhau thế nào; khi nào đếm cử động và đi khám — Long Châu, NHS.",
    category: "truoc-sinh",
    tags: ["cu-dong-thai", "thai-nhi", "3-thang-cuoi"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu Long Châu, NHS",
    publishedAt: "2026-05-30T14:00:00+07:00",
    updatedAt: "2026-06-01T08:00:00+07:00",
    metaTitle: "Thai nhi đạp nhiều / hiccup | Blog Bầu Ăn Gì?",
    metaDescription: "Thai máy và cử động thai: khi nào bình thường — Long Châu.",
    sourceReferences: [
      ref(
        "Thai nhi đạp nhiều có sao không?",
        "https://nhathuoclongchau.com.vn/bai-viet/thai-nhi-dap-nhieu-co-sao-khong-dau-hieu-thai-may-me-bau-can-biet.html",
        "Long Châu"
      ),
      ref("NHS — Your baby's movements", "https://www.nhs.uk/pregnancy/keeping-well/your-babys-movements/", "NHS")
    ],
    content: `## Cử động vs thai máy\n\n**Cử động** là đạp, lăn. **Thai máy (hiccup)** thường cảm giác nhịp đều, nhẹ, ngắn — nhiều mẹ thấy từ tam cá nguyệt 2–3.\n\n## Bình thường\n\nĐạp nhiều sau bữa ăn, buổi tối khá phổ biến. Thai máy đôi khi kéo dài vài phút.\n\n## Cần khám khi\n\n- **Giảm** cử động rõ rệt so với thói quen (đặc biệt ≥28 tuần).\n- Không cảm thấy đạp trong 2 giờ sau khi đã thử đếm/ kích thích (theo hướng dẫn bệnh viện).\n- Đau bụng, ra máu, chảy nước ối.\n\n## Mẹo\n\nNằm nghiêng trái, uống nước ấm, đếm cử động theo protocol bác sĩ — không thay thế khám thai.`
  }),
  post({
    title: "Kế hoạch mang thai: chuẩn bị trước khi thụ thai",
    slug: "ke-hoach-mang-thai-truoc-khi-thu-thai",
    excerpt:
      "Folic acid, tiêm chủng, khám sức khỏe và thói quen trước mang thai — Long Châu, CDC, WHO.",
    category: "truoc-sinh",
    tags: ["ke-hoach-mang-thai", "folate", "truoc-mang-thai"],
    reviewer: "Tham chiếu Long Châu, CDC, WHO",
    publishedAt: "2026-05-30T15:00:00+07:00",
    updatedAt: "2026-06-01T08:00:00+07:00",
    metaTitle: "Kế hoạch mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Chuẩn bị trước khi mang thai: vitamin, khám, lối sống — Long Châu.",
    sourceReferences: [
      ref(
        "Kế hoạch mang thai",
        "https://nhathuoclongchau.com.vn/bai-viet/me-va-be/ke-hoach-mang-thai",
        "Long Châu"
      ),
      ref("CDC — Preconception Health", "https://www.cdc.gov/preconception/index.html", "CDC")
    ],
    content: `## Vì sao lập kế hoạch?\n\nGiảm nguy cơ dị tật ống thần kinh, thiếu máu, và tối ưu sức khỏe trước khi thai phát triển.\n\n## Trước khi thụ thai\n\n- **Folic acid** 400 mcg/ngày (hoặc liều cao hơn nếu bác sĩ chỉ định).\n- Khám tổng quát, răng miệng, huyết áp, đường huyết.\n- Cập nhật tiêm chủng (rubella, cúm… theo lịch).\n- Bỏ thuốc lá, rượu; duy trì cân nặng hợp lý.\n\n## Dinh dưỡng\n\nĂn đa dạng, hạn chế cá thủy ngân cao; bổ sung iod/sắt nếu vùng thiếu (theo tư vấn).\n\n## Khi đã mang thai\n\nĐăng ký khám thai sớm; không tự dùng thuốc kê sẵn.`
  })
];

fs.mkdirSync(postsDir, { recursive: true });

let written = 0;
let skipped = 0;

for (const seed of seeds) {
  const file = path.join(postsDir, `${seed.slug}.json`);
  if (fs.existsSync(file)) {
    skipped++;
    continue;
  }
  fs.writeFileSync(file, JSON.stringify(seed, null, 2) + "\n", "utf8");
  written++;
}

console.log(`Pharmacy blog seeds: ${written} new posts written, ${skipped} skipped.`);
