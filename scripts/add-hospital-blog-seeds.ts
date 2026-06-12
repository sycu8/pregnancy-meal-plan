/**
 * Synthesized blog posts inspired by Vinmec & Tam Anh Hospital articles (original Vietnamese).
 * Run: npm run add:hospital-blog-seeds && npm run sync:blog
 */
import fs from "node:fs";
import path from "node:path";
import type { BlogPost } from "../src/types/blog";

const postsDir = path.join(process.cwd(), "content/blog/posts");
const accessed = "2026-05-31";
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
    title: "Mang thai lần đầu: chuẩn bị dinh dưỡng và khám thai",
    slug: "mang-thai-lan-dau-can-biet",
    excerpt:
      "Lần mang thai đầu tiên cần chuẩn bị sớm về folate, khám thai, vận động và tâm lý — tham khảo Vinmec, ACOG, NHS.",
    category: "truoc-sinh",
    tags: ["lan-dau", "kham-thai", "dinh-duong"],
    reviewer: "Tham chiếu Vinmec, ACOG, NHS",
    publishedAt: "2026-05-31T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Mang thai lần đầu cần biết gì? | Blog Bầu Ăn Gì?",
    metaDescription: "Chuẩn bị mang thai lần đầu: dinh dưỡng, khám thai, vận động — Vinmec, ACOG.",
    sourceReferences: [
      ref(
        "Những điều cần biết khi mang thai lần đầu",
        "https://www.vinmec.com/vie/bai-viet/nhung-dieu-can-biet-khi-mang-thai-lan-dau-de-ca-me-va-be-cung-khoe-manh-vi",
        "Vinmec"
      ),
      ref("ACOG — Nutrition During Pregnancy", "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy", "ACOG")
    ],
    content: `## Tâm lý và chuẩn bị ban đầu\n\nMang thai lần đầu thường kèm vui mừng và lo lắng. Việc nắm thông tin cơ bản giúp mẹ chủ động hơn — nhưng mọi quyết định y khoa vẫn cần theo bác sĩ sản khoa.\n\n## Dinh dưỡng từ sớm\n\n- Bắt đầu **folic acid** trước hoặc ngay khi biết mang thai (theo chỉ định).\n- Ăn đủ đạm, sắt, canxi, chất xơ; tránh rượu, thuốc lá.\n- Không tự uống thuốc bổ liều cao.\n\n## Khám thai và xét nghiệm\n\nĐăng ký khám thai sớm; làm các xét nghiệm theo lịch (nhóm máu, HIV, giang mai, tiểu đường thai kỳ… tùy cơ sở).\n\n## Vận động và nghỉ ngơi\n\nĐi bộ nhẹ, ngủ đủ; tránh nâng vật nặng nếu bác sĩ hạn chế.\n\n## Khi cần liên hệ ngay\n\nRa máu, đau bụng dữ, sốt, nôn không giữ nước — đến cơ sở y tế.`
  }),
  post({
    title: "Vitamin A trong thai kỳ: vừa đủ, tránh thừa",
    slug: "vitamin-a-trong-thai-ky",
    excerpt:
      "Vitamin A cần cho mắt và miễn dịch thai nhi, nhưng liều retinol cao có thể gây hại — tham khảo Vinmec, WHO, NHS.",
    category: "dinh-duong-ba-bau",
    tags: ["vitamin-a", "dinh-duong", "an-toan"],
    reviewer: "Tham chiếu Vinmec, WHO, NHS",
    publishedAt: "2026-05-31T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Vitamin A khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Vitamin A trong thai kỳ: nguồn beta-caroten, tránh thừa retinol — Vinmec, WHO.",
    sourceReferences: [
      ref(
        "Tầm quan trọng của vitamin A trong thai kỳ",
        "https://www.vinmec.com/vie/bai-viet/tam-quan-trong-cua-vitamin-trong-thai-ki-vi",
        "Vinmec"
      ),
      ref("NHS — Vitamins, supplements and nutrition in pregnancy", "https://www.nhs.uk/pregnancy/keeping-well/vitamins-supplements-and-nutrition/", "NHS")
    ],
    content: `## Vai trò\n\nVitamin A hỗ trợ thị lực, miễn dịch và phát triển tế bào. Thiếu hụt có thể ảnh hưởng thai nhi; **thừa retinol** (dạng vitamin A từ động vật/bổ sung) cũng có thể gây hại.\n\n## Nguồn an toàn\n\n- Rau cam, cà rốt, khoai lang, bí đỏ (beta-caroten).\n- Trứng, sữa tiệt trùng với lượng vừa.\n\n## Cần hạn chế\n\n- **Gan** ăn quá thường xuyên (retinol cao).\n- Thuốc bổ chứa liều cao vitamin A retinol không kê đơn.\n\n## Bổ sung\n\nChỉ theo chỉ định bác sĩ; prenatal thông thường đã cân bằng liều.`
  }),
  post({
    title: "Lịch khám thai định kỳ: mốc quan trọng cho mẹ bầu",
    slug: "lich-kham-thai-dinh-ky",
    excerpt:
      "Khám thai đúng lịch giúp phát hiện sớm tiểu đường thai kỳ, thiếu máu, bất thường thai nhi — tham khảo Vinmec, WHO.",
    category: "truoc-sinh",
    tags: ["kham-thai", "san-khoa", "tam-soat"],
    reviewer: "Tham chiếu Vinmec, WHO",
    publishedAt: "2026-05-31T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Lịch khám thai định kỳ | Blog Bầu Ăn Gì?",
    metaDescription: "Các mốc khám thai quan trọng trong thai kỳ — Vinmec, WHO.",
    sourceReferences: [
      ref(
        "Hướng dẫn lịch khám thai định kỳ cho mẹ bầu",
        "https://www.vinmec.com/vie/bai-viet/huong-dan-lich-kham-thai-dinh-ky-cho-me-bau-vi",
        "Vinmec"
      ),
      ref("WHO — Antenatal care recommendations", "https://www.who.int/publications/i/item/9789241549912", "WHO")
    ],
    content: `## Vì sao cần khám định kỳ?\n\nTheo dõi tăng cân, huyết áp, protein niệu, cử động thai và siêu âm giúp phát hiện sớm tiền sản giật, thai chậm tăng trưởng, đái tháo đường thai kỳ.\n\n## Mốc tham khảo (có thể khác theo cơ sở)\n\n- **Tuần 6–12:** xác nhận thai, ước lượng tuổi thai.\n- **Tuần 11–14:** sàng lọc sớm (tùy chỉ định).\n- **Tuần 24–28:** nghiệm pháp dung nạp glucose.\n- **Tuần 28 trở đi:** khám dày hơn, theo dõi cử động.\n\n## Chuẩn bị mỗi lần khám\n\n- Mang sổ thai, danh sách thuốc đang dùng.\n- Ghi câu hỏi về ăn uống, bổ sung, triệu chứng.\n\n## Lưu ý\n\nLịch cụ thể do bác sĩ điều chỉnh theo tuổi thai, bệnh nền và nguy cơ.`
  }),
  post({
    title: "Dấu hiệu sảy thai: khi nào cần đến viện ngay",
    slug: "dau-hieu-say-thai-can-lam-gi",
    excerpt:
      "Ra máu, đau bụng hoặc chảy máu nhiều trong tam cá nguyệt đầu cần được đánh giá y khoa — tham khảo Vinmec, NHS.",
    category: "truoc-sinh",
    tags: ["say-thai", "can-gap", "3-thang-dau"],
    trimester: "3-thang-dau",
    reviewer: "Tham chiếu Vinmec, NHS",
    publishedAt: "2026-05-30T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Dấu hiệu sảy thai cần làm gì | Blog Bầu Ăn Gì?",
    metaDescription: "Nhận biết dấu hiệu sảy thai và khi cần cấp cứu — Vinmec, NHS.",
    sourceReferences: [
      ref(
        "Cần phải làm gì khi có dấu hiệu sảy thai?",
        "https://www.vinmec.com/vie/bai-viet/can-phai-lam-gi-khi-co-dau-hieu-say-thai-vi",
        "Vinmec"
      ),
      ref("NHS — Miscarriage", "https://www.nhs.uk/conditions/miscarriage/", "NHS")
    ],
    content: `## Sảy thai là gì?\n\nMất thai trước khoảng **20 tuần** (định nghĩa có thể khác nhẹ theo hướng dẫn). Khá phổ biến ở tam cá nguyệt đầu; không phải lúc nào cũng do lỗi của mẹ.\n\n## Dấu hiệu cần đánh giá\n\n- Ra máu âm đạo (đỏ hoặc nâu).\n- Đau bụng dưới, cramp.\n- Chảy máu nhiều, chóng mặt, ngất.\n\n## Việc nên làm\n\n1. **Liên hệ cơ sở y tế** — không tự chẩn đoán.\n2. Nghỉ ngơi, tránh quan hệ tình dục nếu đang ra máu.\n3. Không tự dùng thuốc cầm máu/giảm đau mạnh.\n\n## Hỗ trợ tâm lý\n\nSảy thai có thể gây buồn bã sâu sắc; hỏi bác sĩ về tư vấn hoặc nhóm hỗ trợ nếu cần.`
  }),
  post({
    title: "Thai lưu: dấu hiệu nhận biết và tầm quan trọng của khám thai",
    slug: "thai-luu-dau-hieu-nhan-biet",
    excerpt:
      "Thai chết lưu khác sảy thai sớm; giảm cử động thai là dấu hiệu cần khám ngay — tham khảo Vinmec, NHS.",
    category: "truoc-sinh",
    tags: ["thai-luu", "cu-dong-thai", "can-gap"],
    reviewer: "Tham chiếu Vinmec, NHS",
    publishedAt: "2026-05-30T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Dấu hiệu thai lưu | Blog Bầu Ăn Gì?",
    metaDescription: "Nhận biết thai lưu và khi cần đến viện — Vinmec, NHS.",
    sourceReferences: [
      ref(
        "Những dấu hiệu giúp nhận biết thai lưu",
        "https://www.vinmec.com/vie/bai-viet/nhung-dau-hieu-giup-nhan-biet-thai-luu-vi",
        "Vinmec"
      ),
      ref("NHS — Your baby's movements", "https://www.nhs.uk/pregnancy/keeping-well/your-babys-movements/", "NHS")
    ],
    content: `## Khái niệm\n\n**Thai lưu** (thai chết lưu) là thai nhi không còn tim thai sau tuần thứ 20 (theo nhiều định nghĩa lâm sàng). Khác với sảy thai sớm.\n\n## Dấu hiệu gợi ý\n\n- **Giảm hoặc mất cử động thai** (đặc biệt từ tuần 28).\n- Ra hồng âm đạo, đau bụng.\n- Ngừng triệu chứng thai kỳ đột ngột (không chẩn đoán chỉ bằng triệu chứng).\n\n## Việc cần làm\n\nĐến cơ sở y tế **ngay** để siêu âm, tim thai. Đừng trì hoãn vì nghĩ “bé nghỉ ngơi”.\n\n## Theo dõi cử động\n\nHọc cách đếm cử động theo hướng dẫn bác sĩ; báo ngay nếu khác thường.`
  }),
  post({
    title: "Hội chứng ống cổ tay khi mang thai và sau sinh",
    slug: "hoi-chung-ong-co-tay-khi-mang-thai",
    excerpt:
      "Tê bì ngón tay, đau cổ tay thường gặp cuối thai kỳ và sau sinh do phù nề; gợi ý tư thế và khi nào cần khám — Vinmec.",
    category: "truoc-sinh",
    tags: ["ong-co-tay", "dau-nhuc", "sau-sinh"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu Vinmec, NHS",
    publishedAt: "2026-05-30T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Ống cổ tay khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Hội chứng ống cổ tay thai kỳ và sau sinh — Vinmec, NHS.",
    sourceReferences: [
      ref(
        "Hội chứng ống cổ tay khi mang thai và sau sinh",
        "https://www.vinmec.com/vie/bai-viet/hoi-chung-ong-co-tay-khi-mang-thai-va-sau-sinh-vi",
        "Vinmec"
      ),
      ref("NHS — Carpal tunnel syndrome", "https://www.nhs.uk/conditions/carpal-tunnel-syndrome/", "NHS")
    ],
    content: `## Triệu chứng\n\nTê, ngứa ran, đau ngón cái–áp út–giữa; thường nặng hơn ban đêm. Hormone thai kỳ và giữ nước làm chèn ép dây thần kinh giữa.\n\n## Tự chăm sóc\n\n- Nẹp cổ tay khi ngủ (nếu bác sĩ gợi ý).\n- Giảm gõ bàn phím liên tục; nghỉ tay.\n- Vận động nhẹ cổ tay theo hướng dẫn vật lý trị liệu.\n\n## Sau sinh\n\nNhiều trường hợp cải thiện khi phù giảm; nếu kéo dài > vài tháng — khám chuyên khoa.\n\n## Khi cần khám\n\nYếu liệt tay, teo cơ, triệu chứng một bên đột ngột nặng.`
  }),
  post({
    title: "Đau lưng sau sinh: nguyên nhân và cách hỗ trợ tại nhà",
    slug: "dau-lung-sau-sinh",
    excerpt:
      "Đau lưng sau sinh thường hoặc mổ phổ biến; tư thế bế bé, canxi và vận động nhẹ có thể giúp — tham khảo Vinmec, NHS.",
    category: "sau-sinh",
    tags: ["dau-lung", "hoi-phuc", "sau-sinh"],
    reviewer: "Tham chiếu Vinmec, NHS",
    publishedAt: "2026-05-29T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Đau lưng sau sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Nguyên nhân và cách giảm đau lưng sau sinh — Vinmec, NHS.",
    sourceReferences: [
      ref(
        "Cách giải thoát cơn đau lưng cho bà mẹ sau sinh",
        "https://www.vinmec.com/vie/bai-viet/cach-giai-thoat-con-dau-lung-cho-ba-me-sau-sinh-vi",
        "Vinmec"
      ),
      ref(
        "Lý do mẹ thường đau lưng sau sinh",
        "https://www.vinmec.com/vie/bai-viet/ly-do-me-thuong-dau-lung-sau-sinh-vi",
        "Vinmec"
      )
    ],
    content: `## Vì sao hay đau lưng?\n\nCơ bụng và lưng yếu sau mang thai, tư thế bế/bú sai, thiếu ngủ, stress. Sau mổ có thể thêm đau vết mổ.\n\n## Cách hỗ trợ\n\n1. **Tư thế bế:** lấy bé sát người, dùng gối kê tay.\n2. **Vận động nhẹ:** đi bộ, bài tập cơ sàn chậu theo chỉ định.\n3. **Canxi & vitamin D** đủ từ thực phẩm hoặc bổ sung theo bác sĩ.\n4. Chườm ấm/lạnh ngắn nếu được phép.\n\n## Khi cần khám\n\nĐau lan xuống chân, tê bì, sốt, vết mổ đỏ sư — loại trừ nhiễm trùng hoặc thoát vị đĩa đệm.`
  }),
  post({
    title: "Thai kỳ có vết mổ cũ: nguy cơ và theo dõi sát",
    slug: "thai-ky-co-vet-mo-cu",
    excerpt:
      "Mang thai sau mổ tử cung/bụng cần theo dõi nhau cài răng lược, thai bám sẹo — tham khảo Bệnh viện Tâm Anh, ACOG.",
    category: "truoc-sinh",
    tags: ["vet-mo-cu", "san-khoa", "nguy-co-cao"],
    reviewer: "Tham chiếu Tâm Anh Hospital, ACOG",
    publishedAt: "2026-05-29T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Thai kỳ có vết mổ cũ | Blog Bầu Ăn Gì?",
    metaDescription: "Nguy cơ thai kỳ sau mổ cũ và cách theo dõi — Tâm Anh, ACOG.",
    sourceReferences: [
      ref(
        "Thai kỳ có vết mổ cũ và những nguy cơ tiềm ẩn",
        "https://tamanhhospital.vn/tin-tuc/thai-ky-co-vet-mo-cu-va-nhung-nguy-co-tiem-an-can-dac-biet-luu-y/",
        "Tâm Anh Hospital"
      ),
      ref("ACOG — Vaginal Birth After Cesarean Delivery", "https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2019/02/vaginal-birth-after-previous-cesarean-delivery", "ACOG")
    ],
    content: `## Bối cảnh\n\nPhụ nữ từng mổ tử cung hoặc phẫu thuật bụng có thể mang thai an toàn nhưng thuộc nhóm **theo dõi sát**.\n\n## Nguy cơ cần lưu ý\n\n- Thai bám tại sẹo mổ cũ.\n- Nhau cài răng lược.\n- Vỡ tử cung (hiếm nhưng nguy hiểm).\n\n## Việc nên làm\n\n- Khám thai tại cơ sở có kinh nghiệm sản khoa.\n- Siêu âm đánh giá vị trí nhau, sẹo theo chỉ định.\n- Thảo luận **sinh thường hay mổ lại** với bác sĩ (VBAC không phù hợp mọi trường hợp).\n\n## Dấu hiệu cấp cứu\n\nĐau bụng dữ đột ngột, ra máu nhiều, tim thai bất thường — đến viện ngay.`
  }),
  post({
    title: "Tiền sản giật: dấu hiệu cảnh báo và khi cần cấp cứu",
    slug: "tien-san-giat-dau-hieu-can-gap",
    excerpt:
      "Đau đầu, nhìn mờ, phù nặng có thể là tiền sản giật nặng — cần mổ/khám gấp; tham khảo Tâm Anh, NHS.",
    category: "truoc-sinh",
    tags: ["tien-san-giat", "can-gap", "tang-huyet-ap"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu Tâm Anh Hospital, NHS",
    publishedAt: "2026-05-29T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Tiền sản giật: dấu hiệu cảnh báo | Blog Bầu Ăn Gì?",
    metaDescription: "Nhận biết tiền sản giật nặng và khi cần cấp cứu — Tâm Anh, NHS.",
    sourceReferences: [
      ref(
        "Sản phụ nguy kịch do tiền sản giật",
        "https://tamanhhospital.vn/tin-tuc/san-phu-nguy-kich-do-tien-san-giat/",
        "Tâm Anh Hospital"
      ),
      ref("NHS — Pre-eclampsia", "https://www.nhs.uk/conditions/pre-eclampsia/", "NHS")
    ],
    content: `## Tiền sản giật là gì?\n\nTăng huyết áp kèm protein niệu hoặc dấu hiệu cơ quan khác sau tuần 20. Có thể tiến triển nhanh, đe dọa mẹ và thai.\n\n## Dấu hiệu nguy hiểm\n\n- Đau đầu dữ, không đỡ bằng paracetamol thông thường.\n- Nhìn mờ, chấm sáng.\n- Phù mặt/tay bất thường, đau thượng vị.\n- Giảm cử động thai.\n\n## Liên quan dinh dưỡng\n\nKhông tự hạn muối cực đoan; tuân theo **chế độ ăn và thuốc** bác sĩ kê. Magnesium sulfate và các biện pháp khác chỉ trong bệnh viện.\n\n## Hành động\n\nGọi cấp cứu hoặc đến khoa sản **ngay** khi có dấu hiệu trên — không chờ hẹn khám.`
  }),
  post({
    title: "Loãng xương sau sinh: dinh dưỡng canxi và vận động",
    slug: "loang-xuong-sau-sinh",
    excerpt:
      "Mẹ sau sinh dễ nhức mỏi xương khớp; đủ canxi, vitamin D và vận động nhẹ hỗ trợ — tham khảo Vinmec, WHO.",
    category: "sau-sinh",
    tags: ["loang-xuong", "canxi", "sau-sinh"],
    reviewer: "Tham chiếu Vinmec, WHO",
    publishedAt: "2026-05-28T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Loãng xương sau sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Dinh dưỡng và vận động hỗ trợ xương sau sinh — Vinmec, WHO.",
    sourceReferences: [
      ref(
        "Phụ nữ sau sinh thường mắc bệnh loãng xương",
        "https://www.vinmec.com/vie/bai-viet/phu-nu-sau-sinh-thuong-mac-benh-loang-xuong-vi",
        "Vinmec"
      ),
      ref("WHO — Calcium supplementation", "https://www.who.int/tools/elena/interventions/calcium-pregnancy", "WHO")
    ],
    content: `## Vì sao quan tâm?\n\nThai kỳ và cho con bú làm mẹ chuyển canxi cho con; nếu dự trữ thấp, có thể đau lưng, mỏi khớp kéo dài.\n\n## Dinh dưỡng\n\n- Sữa tiệt trùng, sữa chua, cá có xương mềm, đậu phụ, rau xanh.\n- Vitamin D từ thực phẩm, ánh nắng ngắn, bổ sung nếu bác sĩ chỉ định.\n\n## Vận động\n\nĐi bộ, bài tập nhẹ sau khi được phép; tránh nằm lâu.\n\n## Khám\n\nĐo mật độ xương hoặc xét nghiệm chỉ khi bác sĩ đề nghị — không tự chẩn loãng xương.`
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

console.log(`Hospital blog seeds: ${written} new posts written, ${skipped} skipped.`);
