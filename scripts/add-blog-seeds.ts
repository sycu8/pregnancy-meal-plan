/**
 * Write synthesized blog posts from editorial seeds (original Vietnamese content).
 * Run: npm run add:blog-seeds && npm run sync:blog
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
    title: "Dinh dưỡng 3 tháng cuối thai kỳ: nhu cầu tăng và cách ăn",
    slug: "dinh-duong-3-thang-cuoi-thai-ky",
    excerpt:
      "Tam cá nguyệt cuối thai nhi tăng cân nhanh; mẹ cần đủ năng lượng, sắt, canxi và protein mà không ăn quá dư — tham khảo ACOG, NHS.",
    category: "dinh-duong-ba-bau",
    tags: ["3-thang-cuoi", "dinh-duong", "tang-can"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu ACOG, NHS",
    publishedAt: "2026-05-30T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Dinh dưỡng 3 tháng cuối thai kỳ | Blog Bầu Ăn Gì?",
    metaDescription: "Ăn uống tam cá nguyệt 3: năng lượng, sắt, canxi, tránh ăn quá nhiều — ACOG, NHS.",
    sourceReferences: [
      ref("ACOG — Nutrition During Pregnancy", "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy", "ACOG"),
      ref("NHS — Have a healthy diet in pregnancy", "https://www.nhs.uk/pregnancy/keeping-well/have-a-healthy-diet/", "NHS")
    ],
    content: `## Đặc điểm tam cá nguyệt cuối\n\nTừ khoảng tuần 28–40, thai nhi tăng cân mạnh; mẹ có thể cảm thấy no nhanh, ợ nóng, khó thở khi nằm. ACOG nhắc rằng nhu cầu năng lượng tăng nhưng không cần “ăn gấp đôi”.\n\n## Nên ưu tiên\n\n- **Protein:** cá nấu chín, thịt nạc, trứng, đậu — hỗ trợ tăng trưởng thai nhi.\n- **Sắt & folate:** tiếp tục theo chỉ định khám thai.\n- **Canxi & vitamin D:** sữa tiệt trùng, sữa chua, cá có xương mềm.\n- **Chất xơ & nước:** giảm táo bón, hỗ trợ tiêu hóa khi dạ dày chậm.\n\n## Mẹo thực tế\n\n1. Chia 5–6 bữa nhỏ; tránh bữa tối quá no.\n2. Hạn chế muối nếu bác sĩ lo phù hoặc tăng huyết áp.\n3. Ngủ nghiêng trái (nếu thoải mái) theo khuyến cáo chung về an toàn thai kỳ.\n4. Theo dõi cử động thai mỗi ngày theo hướng dẫn bác sĩ.\n\n## Khi cần khám gấp\n\nĐau đầu dữ dội, nhìn mờ, phù mặt tay bất thường, giảm cử động thai — liên hệ cơ sở y tế ngay.`
  }),
  post({
    title: "Canxi và vitamin D khi mang thai: vai trò và nguồn thực phẩm",
    slug: "canxi-va-vitamin-d-khi-mang-thai",
    excerpt: "Canxi và vitamin D hỗ trợ xương mẹ và thai nhi. Gợi ý nguồn thực phẩm Việt Nam và lưu ý bổ sung — WHO, NHS.",
    category: "dinh-duong-ba-bau",
    tags: ["canxi", "vitamin-d", "dinh-duong"],
    reviewer: "Tham chiếu WHO, NHS",
    publishedAt: "2026-05-30T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Canxi & vitamin D khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Canxi, vitamin D trong thai kỳ: sữa, cá, đậu phụ và khi nào cần bổ sung — WHO, NHS.",
    sourceReferences: [
      ref("WHO — Calcium supplementation in pregnant women", "https://www.who.int/tools/elena/interventions/calcium-pregnancy", "WHO"),
      ref("NHS — Vitamins, supplements and nutrition in pregnancy", "https://www.nhs.uk/pregnancy/keeping-well/vitamins-supplements-and-nutrition/", "NHS")
    ],
    content: `## Vì sao quan trọng?\n\nCanxi cần cho xương, răng, co cơ và dẫn truyền thần kinh. Vitamin D giúp hấp thu canxi. Thai kỳ là giai đoạn nhu cầu tăng để hỗ trợ cả mẹ và bé.\n\n## Nguồn thực phẩm\n\n- Sữa tươi/sữa chua **tiệt trùng**, phô mai nấu chín.\n- Cá cơ, cá trích, cá hồi (nấu chín, lượng vừa).\n- Đậu phụ, đậu nành, rau cải, mè.\n- Trứng, hạnh nhân (nếu không dị ứng).\n\n## Lưu ý\n\n- Không tự uống liều cao canxi/vitamin D.\n- Caffeine và sắt có thể ảnh hưởng hấp thu — tuân theo hướng dẫn cá nhân.\n- Ra nắng sớm ngắn có thể hỗ trợ tổng hợp vitamin D; vẫn cần theo dõi y tế.`
  }),
  post({
    title: "Omega-3 và DHA: cá an toàn cho mẹ bầu",
    slug: "omega-3-dha-cho-me-bau",
    excerpt: "DHA hỗ trợ phát triển não và mắt thai nhi. Cách chọn cá ít thủy ngân, khẩu phần phù hợp — CDC, FDA, NHS.",
    category: "dinh-duong-ba-bau",
    tags: ["omega-3", "ca", "dha"],
    trimester: "3-thang-giua",
    reviewer: "Tham chiếu CDC, NHS",
    publishedAt: "2026-05-30T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Omega-3 & DHA khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Ăn cá an toàn khi mang thai, DHA và omega-3 — hướng dẫn CDC, NHS.",
    sourceReferences: [
      ref("CDC — Fish Advice for Pregnant Women", "https://www.cdc.gov/pregnancy/during/fish-advice.html", "CDC"),
      ref("NHS — Fish and shellfish in pregnancy", "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/#fish", "NHS")
    ],
    content: `## Omega-3 và DHA\n\nDHA là một loại omega-3 quan trọng cho phát triển não và thị giác thai nhi. Cá nấu chín là nguồn phổ biến.\n\n## Cá nên chọn\n\n- Cá hồi, cá trích, cá mòi, cá thu nhỏ (theo khuyến cáo địa phương).\n- **Hạn chế** cá thủy ngân cao: cá mập, cá kiếm, cá tilefish, cá thu nguyên con lớn.\n\n## Khẩu phần tham khảo\n\nKhoảng **2–3 bữa cá nấu chín mỗi tuần**, mỗi bữa lượng vừa (theo hướng dẫn y tế tại Việt Nam hoặc quốc tế). Nếu ăn chay hoặc không ăn cá, hỏi bác sĩ về nguồn DHA thay thế.\n\n## Lưu ý\n\n- Không ăn cá sống, sushi, cá hun khói chưa nấu chín.\n- Bổ sung dầu cá chỉ khi được tư vấn.`
  }),
  post({
    title: "Nghén nặng: ăn uống và khi nào cần truyền dịch",
    slug: "nghen-nang-an-uong-va-dieu-tri",
    excerpt: "Hyperemesis gravidarum khác nghén thông thường. Dấu hiệu cảnh báo và gợi ý ăn uống ban đầu — ACOG, NHS.",
    category: "dinh-duong-ba-bau",
    tags: ["nghen", "3-thang-dau"],
    trimester: "3-thang-dau",
    reviewer: "Tham chiếu ACOG, NHS",
    publishedAt: "2026-05-29T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Nghén nặng khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Nghén nặng vs nghén thường, ăn uống và khi cần đi viện — ACOG, NHS.",
    sourceReferences: [
      ref("NHS — Vomiting and morning sickness", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/vomiting-and-morning-sickness/", "NHS"),
      ref("ACOG — Morning Sickness: Nausea and Vomiting of Pregnancy", "https://www.acog.org/womens-health/faqs/morning-sickness-nausea-and-vomiting-of-pregnancy", "ACOG")
    ],
    content: `## Nghén thường vs nghén nặng\n\nNghén nhẹ thường giảm sau tuần 12–14. **Nghén nặng** (hyperemesis) có thể nôn liên tục, sụt cân, mất nước — cần điều trị y khoa.\n\n## Gợi ý ăn uống ban đầu\n\n- Uống từng ngụm nhỏ, ưu tiên nước lọc, nước dừa, súp loãng.\n- Ăn khô trước khi ngủ dậy: bánh quy giòn, bánh mì.\n- Tránh mùi mỡ nồng; chọn món nguội/ấm thay vì nóng hổi.\n- Chia 6–8 bữa cực nhỏ.\n\n## Dấu hiệu cần đến bệnh viện\n\n- Nôn không giữ được nước >24 giờ.\n- Tiểu ít, nước tiểu sẫm.\n- Chóng mặt, tim đập nhanh, sụt cân rõ.\n\nKhông tự uống thuốc chống nghén kê sẵn của người khác.`
  }),
  post({
    title: "Táo bón khi mang thai: chất xơ, nước và vận động",
    slug: "tao-bon-khi-mang-thai",
    excerpt: "Táo bón phổ biến do hormone và thuốc sắt. Cách tăng chất xơ an toàn — NHS, Mayo Clinic.",
    category: "dinh-duong-ba-bau",
    tags: ["tao-bon", "chat-xo"],
    reviewer: "Tham chiếu NHS, Mayo Clinic",
    publishedAt: "2026-05-29T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Táo bón khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Giảm táo bón thai kỳ: chất xơ, nước, vận động nhẹ — NHS, Mayo Clinic.",
    sourceReferences: [
      ref("NHS — Constipation in pregnancy", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/constipation/", "NHS"),
      ref("Mayo Clinic — Pregnancy constipation", "https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/pregnancy/art-20046098", "Mayo Clinic")
    ],
    content: `## Vì sao hay táo bón?\n\nProgesterone làm chậm nhu động ruột; thuốc sắt và ít vận động có thể làm nặng thêm.\n\n## Cách hỗ trợ\n\n1. **Nước:** uống đều trong ngày.\n2. **Chất xơ:** rau luộc, trái có vỏ (rửa kỹ), đậu, yến mạch, gạo lứt.\n3. **Vận động:** đi bộ 20–30 phút/ngày nếu bác sĩ cho phép.\n4. **Thói quen:** đi vệ sinh khi có cảm giác, không nhịn.\n\n## Lưu ý\n\n- Tăng chất xơ từ từ để tránh đầy hơi.\n- Thuốc nhuận tràng chỉ dùng khi bác sĩ kê.\n- Đau bụng dữ, trực tràng chảy máu — khám ngay.`
  }),
  post({
    title: "Thiếu máu thai kỳ: dấu hiệu và dinh dưỡng hỗ trợ",
    slug: "thieu-mau-thai-ky",
    excerpt: "Thiếu máu/thiếu sắt ảnh hưởng sức khỏe mẹ và thai nhi. Dấu hiệu, xét nghiệm và ăn uống — WHO, ACOG.",
    category: "dinh-duong-ba-bau",
    tags: ["thieu-mau", "sat"],
    reviewer: "Tham chiếu WHO, ACOG",
    publishedAt: "2026-05-29T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Thiếu máu thai kỳ | Blog Bầu Ăn Gì?",
    metaDescription: "Thiếu máu khi mang thai: dấu hiệu, sắt, vitamin C — WHO, ACOG.",
    sourceReferences: [
      ref("WHO — Daily iron and folic acid supplementation", "https://www.who.int/tools/elena/interventions/daily-iron-pregnancy", "WHO"),
      ref("ACOG — Anemia in Pregnancy", "https://www.acog.org/clinical/clinical-guidance/practice-bulletin/articles/2021/06/anemia-in-pregnancy", "ACOG")
    ],
    content: `## Dấu hiệu thường gặp\n\nMệt bất thường, da xanh nhạt, hồi hộp, chóng mặt khi đứng nhanh, thở gấp khi leo cầu thang.\n\n## Chẩn đoán\n\nXét nghiệm máu định kỳ trong khám thai. Chỉ bác sĩ kết luận mức thiếu máu và liều sắt/tiêm bổ sung nếu cần.\n\n## Dinh dưỡng hỗ trợ\n\n- Thịt bò, gan nấu chín (vừa phải), trứng, cá, đậu.\n- Vitamin C cùng bữa: cam, ổi, ớt chuông.\n- Tránh trà đặc ngay sau bữa giàu sắt.\n\n## Lưu ý\n\nKhông tự uống sắt liều cao; táo bón do sắt — báo bác sĩ điều chỉnh.`
  }),
  post({
    title: "Caffeine khi mang thai: cà phê, trà và giới hạn an toàn",
    slug: "caffeine-khi-mang-thai",
    excerpt: "Caffeine lọt qua nhau thai. Mức hạn chế tham khảo từ NHS, ACOG và cách tính lượng cà phê, trà, chocolate.",
    category: "dinh-duong-ba-bau",
    tags: ["caffeine", "ca-phe"],
    reviewer: "Tham chiếu NHS, ACOG",
    publishedAt: "2026-05-28T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Caffeine khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Uống cà phê, trà khi mang thai: giới hạn caffeine tham khảo — NHS, ACOG.",
    sourceReferences: [
      ref("NHS — Foods to avoid in pregnancy — caffeine", "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/", "NHS"),
      ref("ACOG — Moderate Caffeine Consumption During Pregnancy", "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2010/08/moderate-caffeine-consumption-during-pregnancy", "ACOG")
    ],
    content: `## Caffeine đi đâu?\n\nCaffeine qua nhau thai; thời gian thải trừ kéo dài hơn ở mẹ bầu.\n\n## Mức tham khảo\n\nNhiều hướng dẫn (như NHS) khuyên **dưới 200 mg caffeine/ngày** — tương đương khoảng 1–2 tách cà phê pha loãng vừa, tùy loại hạt và cách pha.\n\n## Nguồn thường gặp\n\n- Cà phê, trà đen/xanh, trà sữa.\n- Cola, nước tăng lực.\n- Socola, một số thuốc cảm (đọc nhãn).\n\n## Mẹo\n\n- Ghi chú lượng uống trong ngày.\n- Chọn decaf hoặc trà thảo mộc **được bác sĩ cho phép** (không phải loại nào cũng an toàn).`
  }),
  post({
    title: "Uống nước khi mang thai: cần bao nhiêu và dấu hiệu thiếu nước",
    slug: "uong-nuoc-khi-mang-thai",
    excerpt: "Nước hỗ trợ tuần hoàn, ối và giảm táo bón. Cách uống đủ và nhận biết mất nước — ACOG, Mayo Clinic.",
    category: "dinh-duong-ba-bau",
    tags: ["nuoc", "hydration"],
    reviewer: "Tham chiếu Mayo Clinic, NHS",
    publishedAt: "2026-05-28T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Uống nước khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Uống bao nhiêu nước khi mang thai, dấu hiệu mất nước — Mayo Clinic, NHS.",
    sourceReferences: [
      ref("Mayo Clinic — Pregnancy week by week — nutrition", "https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/pregnancy/art-20047732", "Mayo Clinic"),
      ref("NHS — Common health problems in pregnancy", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/", "NHS")
    ],
    content: `## Vai trò của nước\n\nHỗ trợ khối lượng máu tăng, tuần hoàn, hình thành ối, vận chuyển chất dinh dưỡng và giảm nguy cơ táo bón, nhiễm trùng tiết niệu.\n\n## Uống thế nào?\n\n- Uống **khi khát**, chia đều cả ngày.\n- Tăng thêm khi trời nóng, vận động, nghén nhiều.\n- Nước lọc là chính; canh loãng, sữa tiệt trùng cũng góp phần.\n\n## Dấu hiệu thiếu nước\n\nNước tiểu vàng đậm, khát nhiều, chóng mặt, đau đầu. Nghén nặng gây mất nước — cần y tế.\n\n## Tránh\n\nThay nước bằng nước ngọt có đường; lượng caffeine vượt mức khuyến cáo.`
  }),
  post({
    title: "Giấc ngủ khi mang thai: tư thế và thói quen",
    slug: "giac-ngu-khi-mang-thai",
    excerpt: "Khó ngủ phổ biến ở tam cá nguyệt 3. Tư thế nằm, gối ôm bụng và thói quen trước giờ ngủ — NHS, ACOG.",
    category: "truoc-sinh",
    tags: ["giac-ngu", "3-thang-cuoi"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu NHS, ACOG",
    publishedAt: "2026-05-28T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Giấc ngủ khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Ngủ ngon khi mang thai: tư thế, gối, thói quen — NHS, ACOG.",
    sourceReferences: [
      ref("NHS — Tiredness and sleep in pregnancy", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/tiredness/", "NHS"),
      ref("ACOG — Exercise During Pregnancy", "https://www.acog.org/womens-health/faqs/exercise-during-pregnancy", "ACOG")
    ],
    content: `## Vì sao khó ngủ?\n\nỢ nóng, tiểu đêm, đau lưng, lo lắng, cử động thai — đều có thể ảnh hưởng giấc ngủ.\n\n## Gợi ý\n\n1. **Nằm nghiêng trái** (khi thoải mái) — theo khuyến cáo chung tam cá nguyệt cuối.\n2. Gối ôm giữa đầu gối, gối kê bụng/lưng.\n3. Bữa tối nhẹ, tránh cay/no muộn.\n4. Hạn chế màn hình trước ngủ 30–60 phút.\n5. Ngủ trưa ngắn nếu mệt.\n\n## Khi cần hỏi bác sĩ\n\nNgáy to, ngưng thở khi ngủ, trầm cảm/lo âu kéo dài — cần hỗ trợ chuyên môn.`
  }),
  post({
    title: "Vận động an toàn khi mang thai",
    slug: "van-dong-an-toan-khi-mang-thai",
    excerpt: "Đi bộ, bơi, yoga bầu có thể phù hợp nếu được phép. Môn nên tránh và dấu hiệu dừng — ACOG, CDC.",
    category: "truoc-sinh",
    tags: ["van-dong", "the-duc"],
    reviewer: "Tham chiếu ACOG, CDC",
    publishedAt: "2026-05-27T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Vận động an toàn khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Tập thể dục khi mang thai: đi bộ, bơi, dấu hiệu dừng — ACOG, CDC.",
    sourceReferences: [
      ref("ACOG — Exercise During Pregnancy", "https://www.acog.org/womens-health/faqs/exercise-during-pregnancy", "ACOG"),
      ref("CDC — Physical Activity During Pregnancy", "https://www.cdc.gov/pregnancy/during/physical-activity.html", "CDC")
    ],
    content: `## Lợi ích\n\nCải thiện tinh thần, giấc ngủ, kiểm soát cân nặng, hỗ trợ chuẩn bị sinh — nếu không có chống chỉ định y khoa.\n\n## Thường phù hợp\n\n- Đi bộ nhanh vừa sức.\n- Bơi, aquafit.\n- Yoga/pilates **dành cho bầu**.\n- Kegel theo hướng dẫn.\n\n## Nên tránh / thận trọng\n\n- Va chạm mạnh, té ngã (bóng đá, võ…).\n- Lặn sâu, leo nú cao.\n- Nằm ngửa lâu tam cá nguyệt cuối (có thể chóng mặt).\n\n## Dừng ngay khi\n\nChảy máu, co thắt đều, choáng, đau ngực, thiếu oxy, giảm cử động thai.`
  }),
  post({
    title: "Hồi phục sau sinh mổ: dinh dưỡng và vận động nhẹ",
    slug: "hoi-phuc-sau-sinh-mo",
    excerpt: "Sau mổ lấy thai cần protein, chất xơ, nước và nghỉ ngơi. Gợi ý bữa ăn và khi tái khám — ACOG, NHS.",
    category: "sau-sinh",
    tags: ["sau-sinh", "mo-lay-thai"],
    reviewer: "Tham chiếu ACOG, NHS",
    publishedAt: "2026-05-27T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Hồi phục sau sinh mổ | Blog Bầu Ăn Gì?",
    metaDescription: "Ăn uống và chăm sóc sau mổ lấy thai — ACOG, NHS.",
    sourceReferences: [
      ref("NHS — Recovering from a caesarean", "https://www.nhs.uk/conditions/caesarean-section/recovery/", "NHS"),
      ref("ACOG — Cesarean Birth", "https://www.acog.org/womens-health/faqs/cesarean-birth", "ACOG")
    ],
    content: `## Ngày đầu tại bệnh viện\n\nTheo chỉ định nhịn ăn/uống và thuốc của bác sĩ. Khi được phép: súp loãng, cháo, nước lọc.\n\n## Tuần đầu ở nhà\n\n- **Protein:** trứng, cá, thịt nạc, đậu — hỗ trợ lành vết mổ.\n- **Chất xơ + nước:** giảm táo bón do thuốc giảm đau.\n- Bữa nhỏ, dễ tiêu.\n\n## Vận động\n\nĐi lại nhẹ trong nhà theo hướng dẫn; tránh nâng vật nặng. Không tự gỡ băng hay chạy bộ sớm.\n\n## Báo bác sĩ nếu\n\nSốt, vết mổ đỏ/sưng/chảy dịch, đau bụng tăng, thở khó.`
  }),
  post({
    title: "Dinh dưỡng trẻ 12–24 tháng: chuyển sang bữa gia đình",
    slug: "dinh-duong-tre-12-24-thang",
    excerpt: "Trẻ 1–2 tuổi ăn gần giống cả nhà với khẩu phần nhỏ. Sữa, sắt và an toàn nghẹn — WHO, UNICEF, NHS.",
    category: "cham-con-0-24-thang",
    tags: ["12-24-thang", "dinh-duong"],
    babyAgeRange: "12-24-thang",
    reviewer: "Tham chiếu WHO, UNICEF, NHS",
    publishedAt: "2026-05-27T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Dinh dưỡng trẻ 12–24 tháng | Blog Bầu Ăn Gì?",
    metaDescription: "Ăn uống trẻ 1–2 tuổi: bữa gia đình, sữa, an toàn nghẹn — WHO, UNICEF, NHS.",
    sourceReferences: [
      ref("WHO — Complementary feeding", "https://www.who.int/health-topics/complementary-feeding", "WHO"),
      ref("UNICEF — Feeding your baby", "https://www.unicef.org/parenting/food-nutrition", "UNICEF"),
      ref("NHS — Your baby's first solid foods", "https://www.nhs.uk/conditions/baby/weaning-and-feeding/babys-first-solid-foods/", "NHS")
    ],
    content: `## Khẩu phần\n\nTrẻ 12–24 tháng thường ăn 3 bữa chính + 1–2 bữa phụ, cùng **sữa** (mẹ hoặc sữa công thức theo hướng dẫn).\n\n## Nguyên tắc\n\n- Cắt nhỏ, nấu mềm; tránh hạt nguyên, nho nguyên quả, xúc xích tròn.\n- Hạn chố muối, đường, mật ong (<12 tháng đã cấm mật ong).\n- Đa dạng: gạo, mì, khoai, thịt/cá/đậu, rau, trái.\n\n## Sắt\n\nThịt nạc, trứng, đậu, ngũ cốc bổ sung sắt — quan trọng sau 1 tuổi.\n\n## Theo dõi\n\nCân nặng/chiều cao theo lịch khám nhi; biếng ăn kéo dài — hỏi bác sĩ.`
  }),
  post({
    title: "Thực đơn mẫu cho trẻ 6–12 tháng",
    slug: "thuc-don-mau-tre-6-12-thang",
    excerpt: "Gợi ý bữa chính và bữa phụ khi trẻ ăn dặm, kết hợp sữa mẹ. Không thay thế tư vấn nhi khoa — WHO, NHS.",
    category: "cham-con-0-24-thang",
    tags: ["6-12-thang", "an-dam", "thuc-don"],
    babyAgeRange: "6-12-thang",
    reviewer: "Tham chiếu WHO, NHS",
    publishedAt: "2026-05-26T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Thực đơn trẻ 6–12 tháng | Blog Bầu Ăn Gì?",
    metaDescription: "Thực đơn mẫu ăn dặm 6–12 tháng kèm sữa mẹ — WHO, NHS.",
    sourceReferences: [
      ref("WHO — Infant and young child feeding", "https://www.who.int/health-topics/infant-and-young-child-feeding", "WHO"),
      ref("NHS — Your baby's first solid foods", "https://www.nhs.uk/conditions/baby/weaning-and-feeding/babys-first-solid-foods/", "NHS")
    ],
    content: `## Nguyên tắc\n\nTiếp tục **bú mẹ** (hoặc sữa thay thế phù hợp). Mỗi ngày thêm 1–2 loại thực phẩm mới theo độ tuổi.\n\n## Một ngày mẫu (8 tháng)\n\n- **Sáng:** bú mẹ + cháo yến mạch nghiền, lòng đỏ trứng.\n- **Trưa:** bú + cơm nghiền, cá hấp, bí đỏ.\n- **Chiều:** bú + chuối nghiền.\n- **Tối:** bú + cháo thịt bò bằm, rau luộc nghiền.\n\n## Lưu ý\n\n- Không thêm muối, đường.\n- Quan sát dị ứng 3–5 ngày/loại mới.\n- Uống nước nhỏ từng ngụm khi ăn dặm (theo hướng dẫn y tế).`
  }),
  post({
    title: "Cho con bú khó khăn: gợi ý ban đầu và khi nào gặp chuyên gia",
    slug: "cho-con-bu-kho-khan",
    excerpt: "Đau núm, ít sữa, bé không bám ti — gợi ý sơ bộ và khi cần tư vấn cho con bú. UNICEF, WHO, NHS.",
    category: "sau-sinh",
    tags: ["cho-con-bu", "sau-sinh"],
    reviewer: "Tham chiếu UNICEF, WHO, NHS",
    publishedAt: "2026-05-26T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Cho con bú khó khăn | Blog Bầu Ăn Gì?",
    metaDescription: "Xử trí ban đầu khi cho con bú khó: tư thế, nhịp bú, khi cần chuyên gia — UNICEF, WHO.",
    sourceReferences: [
      ref("UNICEF — Breastfeeding challenges", "https://www.unicef.org/breastfeeding", "UNICEF"),
      ref("WHO — Breastfeeding", "https://www.who.int/health-topics/breastfeeding", "WHO"),
      ref("NHS — Sore or cracked nipples", "https://www.nhs.uk/conditions/baby/breastfeeding-and-bottle-feeding/breastfeeding-problems/sore-cracked-nipples/", "NHS")
    ],
    content: `## Tư thế và bám vú\n\n- Mẹ ngồi thoải mái, lưng có đệm.\n- Miệng bé mở rộng, bao gồm cả quầng vú.\n- Đổi tư thế (cradle, football…) nếu đau một bên.\n\n## Đau núm\n\n- Kiểm tra bám vú; dùng sữa mẹ thoa núm sau bú.\n- Không rửa xà phòng mạnh; để núm khô thoáng.\n\n## Lo “thiếu sữa”\n\nTheo dõi tã ướt, cân nặng bé, cữ bú — bác sĩ/tư vấn cho con bú đánh giá chính xác.\n\n## Cần gặp chuyên gia khi\n\nNúm nứt chảy máu, sốt, ứ sữa/sưng cứng, bé không tăng cân, bé li bì.`
  }),
  post({
    title: "Dinh dưỡng mẹ bầu ăn chay: cần bổ sung gì?",
    slug: "dinh-duong-me-bau-an-chay",
    excerpt: "Ăn chay khi mang thai cần đủ protein, sắt, B12, canxi, DHA. Gợi ý thực phẩm và theo dõi y tế — NHS, ACOG.",
    category: "thuc-don-ba-bau",
    tags: ["an-chay", "thuc-don"],
    reviewer: "Tham chiếu NHS, ACOG",
    publishedAt: "2026-05-26T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Mẹ bầu ăn chay | Blog Bầu Ăn Gì?",
    metaDescription: "Thực đơn chay cho mẹ bầu: B12, sắt, DHA — NHS, ACOG.",
    sourceReferences: [
      ref("NHS — Vegetarian and vegan pregnancy", "https://www.nhs.uk/pregnancy/keeping-well/vegetarian-or-vegan-and-pregnant/", "NHS"),
      ref("ACOG — Nutrition During Pregnancy", "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy", "ACOG")
    ],
    content: `## Có thể ăn chay khi mang thai?\n\nCó, nếu được lên kế hoạch dinh dưỡng và theo dõi y tế sát.\n\n## Chất dễ thiếu\n\n- **B12:** thực phẩm bổ sung hoặc viên (theo bác sĩ).\n- **Sắt:** đậu, đậu phụ, ngũ cốc bổ sung + vitamin C.\n- **Canxi:** sữa thực vật bổ sung canxi, đậu phụ, mè.\n- **DHA:** dầu tảo hoặc viên DHA vegan nếu không ăn cá.\n- **Protein:** đậu, đậu hũ, tempeh, hạt.\n\n## Mẹo bữa ăn\n\nKết hợp đậu + ngũ cốc; thêm rau xanh đậm; không chỉ ăn rau luộc đơn điệu.\n\n## Theo dõi\n\nXét nghiệm B12, sắt định kỳ theo bác sĩ.`
  }),
  post({
    title: "Phù chân khi mang thai: ăn uống và khi lo lắng",
    slug: "phu-chan-khi-mang-thai",
    excerpt: "Phù nhẹ cuối ngày có thể gặp; phù mặt tay sáng hoặc đau đầu cần khám ngay. Gợi ý giảm muối, nghỉ chân — NHS, ACOG.",
    category: "dinh-duong-ba-bau",
    tags: ["phu-chan", "3-thang-cuoi"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu NHS, ACOG",
    publishedAt: "2026-05-25T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Phù chân khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Phù chân thai kỳ: khi bình thường, khi nguy hiểm — NHS, ACOG.",
    sourceReferences: [
      ref("NHS — Common symptoms in pregnancy — Swollen ankles", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/swollen-ankles-feet-and-fingers/", "NHS"),
      ref("ACOG — Preeclampsia and High Blood Pressure During Pregnancy", "https://www.acog.org/womens-health/faqs/preeclampsia-and-high-blood-pressure-during-pregnancy", "ACOG")
    ],
    content: `## Phù nhẹ\n\nPhù mắt cá chân cuối ngày, tam cá nguyệt 3 có thể do tăng tuần hoàn. Nghỉ chân cao, mang giày rộng, uống đủ nước.\n\n## Ăn uống\n\n- Không tự **ăn kiêng muối cực đoan**; giảm đồ mặn, nước mắm nhiều nếu bác sĩ khuyên.\n- Đủ protein: cá, đậu, trứng.\n\n## Dấu hiệu nguy hiểm (tiền sản giật)\n\nPhù mặt/sưng tay sáng, nhìn mờ, đau đầu dữ, đau thượng vị — **đến cơ sở y tế ngay**.\n\nKhông tự uống thuốc lợi tiểu.`
  }),
  post({
    title: "Tăng huyết áp thai kỳ: ăn ít muối và theo dõi",
    slug: "tang-huyet-ap-thai-ky-an-uong",
    excerpt: "THA thai kỳ và tiền sản giật cần theo dõi sát. Gợi ý DASH-style, hạn chế muối — không thay thế thuốc — ACOG.",
    category: "dinh-duong-ba-bau",
    tags: ["tang-huyet-ap", "dinh-duong"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu ACOG",
    publishedAt: "2026-05-25T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Tăng huyết áp thai kỳ | Blog Bầu Ăn Gì?",
    metaDescription: "Ăn uống khi tăng huyết áp thai kỳ — tham khảo ACOG, không thay thuốc.",
    sourceReferences: [
      ref("ACOG — Preeclampsia and High Blood Pressure During Pregnancy", "https://www.acog.org/womens-health/faqs/preeclampsia-and-high-blood-pressure-during-pregnancy", "ACOG"),
      ref("CDC — High Blood Pressure During Pregnancy", "https://www.cdc.gov/bloodpressure/pregnancy.htm", "CDC")
    ],
    content: `## Quan trọng\n\nChẩn đoán và điều trị **chỉ do bác sĩ**. Bài viết chỉ gợi ý dinh dưỡng hỗ trợ.\n\n## Gợi ý ăn uống\n\n- Giảm món mặn, nước mắm, đồ chế biến sẵn.\n- Tăng rau, trái, ngũ cốc nguyên cám, đạm nạc.\n- Hạn chế đồ chiên nhiều dầu.\n\n## Theo dõi\n\nĐo huyết áp theo lịch; cân nặng, protein niệu theo chỉ định.\n\n## Khẩn cấp\n\nĐau đầu dữ, nhìn mờ, phù nặng, đau bụng trên — cấp cứu.`
  }),
  post({
    title: "Sàng lọc trước sinh: mẹ cần biết gì?",
    slug: "sang-loc-truoc-sinh-can-lam-gi",
    excerpt: "Siêu âm, xét nghiệm máu, sàng lọc dị tật — tổng quan các bước thường gặp và tại sao cần khám đúng lịch. ACOG, CDC.",
    category: "truoc-sinh",
    tags: ["sang-loc", "kham-thai"],
    reviewer: "Tham chiếu ACOG, CDC",
    publishedAt: "2026-05-25T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Sàng lọc trước sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Các xét nghiệm sàng lọc thai kỳ phổ biến — ACOG, CDC.",
    sourceReferences: [
      ref("ACOG — Prenatal Genetic Screening Tests", "https://www.acog.org/womens-health/faqs/prenatal-genetic-screening-tests", "ACOG"),
      ref("CDC — During Pregnancy", "https://www.cdc.gov/pregnancy/during/index.html", "CDC")
    ],
    content: `## Mục đích\n\nTheo dõi sự phát triển của thai nhi và sức khỏe mẹ; phát hiện sớm nguy cơ để có kế hoạch chăm sóc phù hợp.\n\n## Thường gặp\n\n- Khám thai định kỳ, đo huyết áp, cân nặng.\n- Siêu âm (có thể nhiều mốc).\n- Xét nghiệm máu, nước tiểu.\n- Sàng lọc dị tật bẩm sinh/di truyền (tùy chọn, có tư vấn).\n\n## Mẹ nên làm gì\n\n- Giữ sổ khám thai, hỏi rõ mục đích từng xét nghiệm.\n- Không bỏ lịch vì “thấy khỏe”.\n- Trao đổi với bác sĩ trước khi làm xét nghiệm xâm lấn.\n\n## Lưu ý\n\nKết quả sàng lọc không phải chẩn đoán cuối — cần xác nhận thêm nếu có nguy cơ.`
  }),
  post({
    title: "I-ốt và muối i-ốt khi mang thai",
    slug: "iot-va-muoi-i-ot-khi-mang-thai",
    excerpt: "I-ốt cần cho tuyến giáp mẹ và phát triển não thai nhi. Muối i-ốt, cá biển — WHO, UNICEF.",
    category: "dinh-duong-ba-bau",
    tags: ["iot", "dinh-duong"],
    reviewer: "Tham chiếu WHO, UNICEF",
    publishedAt: "2026-05-24T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "I-ốt khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Bổ sung i-ốt thai kỳ: muối i-ốt, thực phẩm — WHO, UNICEF.",
    sourceReferences: [
      ref("WHO — Iodine supplementation in pregnant women", "https://www.who.int/tools/elena/interventions/iodine-pregnancy", "WHO"),
      ref("UNICEF — Iodine deficiency", "https://www.unicef.org/nutrition/iodine", "UNICEF")
    ],
    content: `## Vai trò i-ốt\n\nCần cho hormone tuyến giáp và phát triển thần kinh thai nhi. Thiếu i-ốt có thể ảnh hưởng ti cân nặng và phát triển.\n\n## Nguồn\n\n- **Muối i-ốt** (theo chương trình quốc gia).\n- Cá biển nấu chín, rong biển (lượng vừa).\n- Trứng, sữa.\n\n## Lưu ý\n\n- Không ăn quá nhiều muối để “bổ i-ốt” — vượt muối không tốt nếu tăng huyết áp.\n- Bổ sung viên chỉ theo chỉ định vùng/endemic và bác sĩ.`
  }),
  post({
    title: "Sức khỏe răng miệng khi mang thai",
    slug: "suc-khoe-rang-mieng-khi-mang-thai",
    excerpt: "Viêm nướu có thể liên quan sinh non nếu không điều trị. Khám nha khoa an toàn và vệ sinh răng — NHS, ACOG.",
    category: "truoc-sinh",
    tags: ["rang-mieng", "kham-thai"],
    reviewer: "Tham chiếu NHS, ACOG",
    publishedAt: "2026-05-24T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Răng miệng khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Chăm răng khi mang thai, khám nha an toàn — NHS, ACOG.",
    sourceReferences: [
      ref("NHS — Bleeding gums in pregnancy", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/bleeding-gums/", "NHS"),
      ref("ACOG — Oral Health Care During Pregnancy", "https://www.acog.org/clinical/clinical-guidance/committee-opinion/articles/2013/08/oral-health-care-during-pregnancy-and-through-the-lifespan", "ACOG")
    ],
    content: `## Thay đổi khi mang thai\n\nNướu dễ chảy máu, viêm hơn do hormone. Một số nghiên cứu liên hệ bệnh nha khoa chưa điều trị với biến chứng thai kỳ — nên chăm sóc sớm.\n\n## Việc nên làm\n\n- Đánh răng 2 lần/ngày, chỉ nướu bằng fluor.\n- Khám nha **báo đang mang thai**; nhiều thủ thuật an toàn.\n- Hạn chế đồ ngọt dính răng.\n\n## Thuốc gây tê\n\nAn toàn trong nha khoa khi do bác sĩ thực hiện; thông báo tuần thai.\n\n## Khẩn cấp\n\nSưng nướu/sáng miệng, sốt — khám ngay.`
  }),
  post({
    title: "Trầm cảm và lo âu sau sinh: dấu hiệu cần hỗ trợ",
    slug: "tram-cam-lo-au-sau-sinh",
    excerpt: "Baby blues khác trầm cảm sau sinh. Dấu hiệu cần gặp bác sĩ và nguồn hỗ trợ — WHO, NHS, ACOG.",
    category: "sau-sinh",
    tags: ["suc-khoe-tam-than", "sau-sinh"],
    reviewer: "Tham chiếu WHO, NHS",
    publishedAt: "2026-05-24T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Trầm cảm sau sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Nhận biết trầm cảm sau sinh và khi cần giúp — WHO, NHS.",
    sourceReferences: [
      ref("WHO — Maternal mental health", "https://www.who.int/teams/maternal-newborn-child-adolescent-health-and-ageing/maternal-health", "WHO"),
      ref("NHS — Postnatal depression", "https://www.nhs.uk/mental-health/conditions/post-natal-depression/", "NHS")
    ],
    content: `## Baby blues\n\nKhóc dễ, lo lắng nhẹ vài ngày đầu sau sinh — thường tự hết.\n\n## Trầm cảm sau sinh\n\nKéo dài >2 tuần: buồn sâu, mất hứng thú, mất ngủ dù mệt, cảm giác vô dụng, lo không chăm được con, ý nghĩ làm hại bản thân/con — **cần trợ giúp y tế ngay**.\n\n## Việc có thể làm\n\n- Nói với người thân/bác sĩ; không tự trách.\n- Nghỉ khi bé ngủ; nhờ hỗ trợ việc nhà.\n- Điều trị có thể gồm tư vấn, thuốc (an toàn khi cho con bú — do bác sĩ quyết định).\n\n## Khẩn cấp\n\nÝ định tự hại — gọi cấp cứu hoặc đường dây nóng địa phương.`
  }),
  post({
    title: "Thực đơn giảm nghén: món dễ ăn cho tam cá nguyệt 1",
    slug: "thuc-don-giam-nghen-tam-ca-nguyet-1",
    excerpt: "Gợi ý món mềm, ít mùi, chia bữa nhỏ khi nghén. Không thay thế điều trị nghén nặng — NHS, ACOG.",
    category: "thuc-don-ba-bau",
    tags: ["nghen", "thuc-don", "3-thang-dau"],
    trimester: "3-thang-dau",
    reviewer: "Tham chiếu NHS, ACOG",
    publishedAt: "2026-05-23T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Thực đơn giảm nghén | Blog Bầu Ăn Gì?",
    metaDescription: "Thực đơn mềm, dễ ăn khi nghén tam cá nguyệt 1 — NHS.",
    sourceReferences: [
      ref("NHS — Vomiting and morning sickness", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/vomiting-and-morning-sickness/", "NHS"),
      ref("ACOG — Morning Sickness FAQ", "https://www.acog.org/womens-health/faqs/morning-sickness-nausea-and-vomiting-of-pregnancy", "ACOG")
    ],
    content: `## Nguyên tắc\n\n- Bữa cực nhỏ, 2–3 giờ/lần.\n- Ưu tiên **lạnh/ấm**, ít mùi mỡ.\n- Giữ bánh quy cạnh giường trước khi đứng dậy.\n\n## Gợi ý một ngày\n\n- Sáng sớm: bánh quy giòn + nước.\n- Bữa 1: cháo gạo trắng, trứng luộc.\n- Bữa 2: sữa chua tiệt trùng.\n- Bữa 3: bún thịt nạc luộc, rau chần.\n- Bữa 4: chuối.\n- Tối: cơm mềm, cá hấp gừng nhẹ, canh bí.\n\n## Tránh\n\nMón cay nồng, chiên nhiều dầu nếu làm nôn. Nghén nặng — đi viện, không cố ăn.`
  }),
  post({
    title: "Protein và choline: hai chất mẹ bầu dễ bỏ quên",
    slug: "protein-va-choline-khi-mang-thai",
    excerpt: "Protein cần cho tăng trưởng; choline hỗ trợ não thai nhi. Nguồn trứng, cá, đậu — ACOG, CDC.",
    category: "dinh-duong-ba-bau",
    tags: ["protein", "choline"],
    reviewer: "Tham chiếu ACOG, CDC",
    publishedAt: "2026-05-23T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Protein & choline thai kỳ | Blog Bầu Ăn Gì?",
    metaDescription: "Protein và choline khi mang thai — nguồn thực phẩm ACOG, CDC.",
    sourceReferences: [
      ref("ACOG — Nutrition During Pregnancy", "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy", "ACOG"),
      ref("CDC — Maternal Diet", "https://www.cdc.gov/breastfeeding/breastfeeding-special-circumstances/diet-and-micronutrients/maternal-diet.html", "CDC")
    ],
    content: `## Protein\n\nCần cho tế bào, nhau thai, tăng khối lượng máu. Mỗi bữa chính nên có một phần đạm: thịt nạc, cá chín, trứng, đậu hũ, đậu.\n\n## Choline\n\nHỗ trợ phát triển não và màng tế bào. Nguồn: **lòng đỏ trứng**, thịt, cá, đậu phộng, súp lơ.\n\n## Gợi ý bữa\n\nTrứng luộc + cơm + rau; cá hấp + canh; đậu hũ sốt cà.\n\n## Lưu ý\n\nTrứng **nấu chín**; không ăn lòng sống. Bổ sung viên theo bác sĩ nếu ăn chay hoặc dị ứng trứng.`
  }),
  post({
    title: "Tiêm chủng trước và sau sinh: tổng quan cho mẹ",
    slug: "tiem-chung-me-bau-va-sau-sinh",
    excerpt: "Uốn ván bà bầu, cúm mùa, COVID-19 (theo khuyến cáo địa phương). Không thay lịch tiêm Việt Nam — CDC, WHO.",
    category: "truoc-sinh",
    tags: ["tiem-chung", "phong-benh"],
    reviewer: "Tham chiếu CDC, WHO",
    publishedAt: "2026-05-23T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Tiêm chủng mẹ bầu | Blog Bầu Ăn Gì?",
    metaDescription: "Vaccine khi mang thai và sau sinh — tham khảo CDC, WHO, Bộ Y tế VN.",
    sourceReferences: [
      ref("CDC — Vaccines During Pregnancy", "https://www.cdc.gov/vaccines/pregnancy/", "CDC"),
      ref("WHO — Immunization", "https://www.who.int/health-topics/immunization", "WHO")
    ],
    content: `## Vì sao quan trọng?\n\nMẹ được bảo vệ; kháng thể có thể truyền cho con sơ sinh (tùy loại vaccine).\n\n## Thường được khuyến nghị (quốc tế)\n\n- **Uốn ván** (theo chương trình quốc gia).\n- **Cúm mùa** khi đang mang thai.\n- Vaccine khác theo **hướng dẫn Bộ Y tế Việt Nam** và bác sĩ.\n\n## Lưu ý\n\n- Một số vaccine **sống** không dùng khi mang thai — hỏi bác sĩ.\n- Ghi sổ tiêm, mang theo khám thai.\n\n## Sau sinh\n\nTiêm những mũi hoãn lại khi an toàn; tiêm cho con theo lịch nhi khoa.`
  }),
  post({
    title: "Ợ nóng và ợ chua khi mang thai: ăn uống giảm khó chịu",
    slug: "o-ong-nong-khi-mang-thai",
    excerpt: "Hormone thai kỳ làm chậm tiêu hóa, dễ ợ nóng. Mẹo chia bữa, tránh kích thích và khi cần thuốc — NHS, ACOG.",
    category: "dinh-duong-ba-bau",
    tags: ["o-nong", "tieu-hoa", "3-thang-cuoi"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu NHS, ACOG",
    publishedAt: "2026-05-22T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Ợ nóng khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Giảm ợ nóng, ợ chua thai kỳ bằng thực đơn và thói quen — NHS, ACOG.",
    sourceReferences: [
      ref("NHS — Indigestion and heartburn in pregnancy", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/indigestion-and-heartburn/", "NHS"),
      ref("ACOG — Problems of the Digestive System", "https://www.acog.org/womens-health/faqs/problems-of-the-digestive-system", "ACOG")
    ],
    content: `## Vì sao hay ợ nóng?\n\nProgesterone làm nhu động ruột chậm; thai lớn đẩy dạ dày. Tam cá nguyệt cuối thường nặng hơn.\n\n## Mẹo ăn uống\n\n- Bữa nhỏ, 5–6 lần/ngày; tránh no căng.\n- Hạn chế cay, chiên nhiều dầu, cà phê, socola, nước ngọt có ga.\n- Ăn chậm, ngồi thẳng sau bữa 30–60 phút.\n- Gối cao khi ngủ.\n\n## Thực phẩm dễ chịu\n\nCháo, cơm mềm, cá hấp, rau luộc, chuối, sữa chua tiệt trùng (nếu không làm nặng triệu chứng).\n\n## Khi nào gặp bác sĩ?\n\nNôn ra máu, sụt cân, đau bụng dữ dội — khám ngay. Thuốc kháng acid chỉ dùng khi được kê.`
  }),
  post({
    title: "Chuột rút chân khi mang thai: magie, vận động và nghỉ ngơi",
    slug: "chuot-rut-chan-khi-mang-thai",
    excerpt: "Chuột rút đêm thường gặp tam cá nguyệt 2–3. Bổ sung magie, giãn cơ và khi nào cần xét nghiệm — NHS, Mayo Clinic.",
    category: "truoc-sinh",
    tags: ["chuot-rut", "magie", "trieu-chung"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu NHS",
    publishedAt: "2026-05-22T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Chuột rút chân thai kỳ | Blog Bầu Ăn Gì?",
    metaDescription: "Nguyên nhân và cách giảm chuột rút khi mang thai — NHS.",
    sourceReferences: [
      ref("NHS — Common health problems in pregnancy", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/common-health-problems/", "NHS"),
      ref("Mayo Clinic — Leg cramps during pregnancy", "https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/expert-answers/leg-cramps-during-pregnancy/faq-20057766", "Mayo Clinic")
    ],
    content: `## Biểu hiện\n\nCo cứng cơ bắp chân, thường ban đêm. Phổ biến nhưng gây mất ngủ.\n\n## Việc có thể làm\n\n- Giãn cơ nhẹ trước khi ngủ; massage bắp chân.\n- Uống đủ nước ban ngày.\n- Ăn chuối, hạt, rau xanh (magie, kali tự nhiên).\n- Mang giày thoải mái; tránh đứng lâu.\n\n## Lưu ý\n\nKhông tự uống liều cao magie. Chuột rút một bên kèm sưng nóng — lo trường hợp huyết khối, khám gấp.`
  }),
  post({
    title: "Vitamin B12 khi mang thai và cho mẹ ăn chay",
    slug: "vitamin-b12-khi-mang-thai",
    excerpt: "B12 cần cho thần kinh và tạo máu. Mẹ ăn chay/thuần chay cần theo dõi sát — WHO, NHS.",
    category: "dinh-duong-ba-bau",
    tags: ["b12", "an-chay", "vitamin"],
    reviewer: "Tham chiếu WHO, NHS",
    publishedAt: "2026-05-22T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Vitamin B12 thai kỳ | Blog Bầu Ăn Gì?",
    metaDescription: "B12 khi mang thai, đặc biệt mẹ ăn chay — WHO, NHS.",
    sourceReferences: [
      ref("WHO — Vitamin B12 supplementation in pregnancy", "https://www.who.int/tools/elena/interventions/vitamin-b12-pregnancy", "WHO"),
      ref("NHS — Vegetarian and vegan pregnancy", "https://www.nhs.uk/pregnancy/keeping-well/vegetarian-or-vegan-and-pregnant/", "NHS")
    ],
    content: `## Vai trò\n\nB12 tham gia tạo máu và phát triển thần kinh thai nhi. Thiếu có thể liên quan thiếu máu mẹ.\n\n## Nguồn\n\n- Động vật: thịt, cá, trứng, sữa.\n- Chay: ngũ cốc bổ sung, nấm shiitake, men bia (đọc nhãn).\n\n## Điều quan trọng\n\nMẹ **thuần chay** thường cần bổ sung B12 suốt thai kỳ và cho con bú — theo xét nghiệm và bác sĩ. Không thay thế folate bằng B12 một cách tùy tiện.`
  }),
  post({
    title: "Phô mai mềm và sữa chưa tiệt trùng: mẹ bầu cần tránh gì?",
    slug: "pho-mem-va-sua-chua-tiet-trung-khi-mang-thai",
    excerpt: "Listeria có thể có trong phô mai mềm, sữa thô. Cách chọn sữa an toàn — NHS, CDC.",
    category: "dinh-duong-ba-bau",
    tags: ["an-toan", "listeria", "sua"],
    reviewer: "Tham chiếu NHS, CDC",
    publishedAt: "2026-05-21T11:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Phô mai & sữa khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Phô mai mềm, sữa tiệt trùng an toàn thai kỳ — NHS, CDC.",
    sourceReferences: [
      ref("NHS — Foods to avoid in pregnancy", "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/", "NHS"),
      ref("CDC — Listeria and pregnancy", "https://www.cdc.gov/listeria/risk-groups/pregnant-women.html", "CDC")
    ],
    content: `## Rủi ro\n\nListeria hiếm nhưng nguy hiểm với thai kỳ. Thường liên quan thực phẩm lạnh, chưa nấu chín kỹ.\n\n## Nên tránh\n\n- Phô mai mềm có vỏ trắng (brie, camembert) trừ khi **nấu chín**.\n- Phô mai xanh chưa nấu.\n- Sữa tươi chưa tiệt trùng.\n\n## An toàn\n\n- Sữa, sữa chua, phô mai cứng đã **tiệt trùng/pasteurized**.\n- Nấu chín phô mai mềm trước khi ăn.\n\n## Mẹo Việt Nam\n\nMua sữa có dán nhãn tiệt trùng; hạn chế phô mai nhập khẩu mềm chưa rõ nguồn.`
  }),
  post({
    title: "Phở tái, gỏi và đồ sống: hướng dẫn an toàn thực phẩm cho mẹ bầu",
    slug: "pho-tai-va-do-song-an-toan-me-bau",
    excerpt: "Thói quen ăn uống Việt Nam cần điều chỉnh khi mang thai. Cách chọn món nấu chín kỹ — WHO, NHS.",
    category: "dinh-duong-ba-bau",
    tags: ["an-toan", "thuc-pham", "viet-nam"],
    reviewer: "Tham chiếu WHO, NHS",
    publishedAt: "2026-05-21T12:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Phở tái & đồ sống khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Ăn phở, gỏi, hải sản an toàn khi mang thai — WHO, NHS.",
    sourceReferences: [
      ref("WHO — Five keys to safer food", "https://www.who.int/campaigns/world-health-day/2015/five-keys-to-safer-food", "WHO"),
      ref("NHS — Foods to avoid in pregnancy", "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/", "NHS")
    ],
    content: `## Nguyên tắc chung\n\n**Nấu chín kỹ** thịt, cá, trứng; tránh đồ sống/tái nếu không chắc chất lượng.\n\n## Món Việt thường gặp\n\n- **Phở tái:** chọn quán uy tín; thịt phải được trần sôi nước dùng đủ nóng. Khi nghi ngờ, chọn phở nạm/chín.\n- **Gỏi sống, nem chua, tiết canh:** tránh.\n- **Hải sản:** nấu chín; tránh ốc, hàu sống.\n- **Rau sống:** rửa kỹ; cân nhắc chần nếu lo nguồn nước.\n\n## Bảo quản\n\nMang thai tránh đồ để lâu ngoài nhiệt độ phòng; ăn ngay sau khi nấu.`
  }),
  post({
    title: "Thực đơn mẫu tuần tam cá nguyệt 3 cho mẹ bầu",
    slug: "thuc-don-mau-tuan-tam-ca-nguyet-3",
    excerpt: "Gợi ý 7 ngày cân bằng protein, sắt, canxi cho tam cá nguyệt cuối — tham khảo ACOG, NHS.",
    category: "thuc-don-ba-bau",
    tags: ["thuc-don", "3-thang-cuoi", "mau"],
    trimester: "3-thang-cuoi",
    reviewer: "Tham chiếu ACOG, NHS",
    publishedAt: "2026-05-20T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Thực đơn tuần TCN 3 | Blog Bầu Ăn Gì?",
    metaDescription: "Thực đơn mẫu 7 ngày tam cá nguyệt 3 — ACOG, NHS.",
    sourceReferences: [
      ref("ACOG — Nutrition During Pregnancy", "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy", "ACOG"),
      ref("NHS — Have a healthy diet in pregnancy", "https://www.nhs.uk/pregnancy/keeping-well/have-a-healthy-diet/", "NHS")
    ],
    content: `## Nguyên tắc\n\nBữa nhỏ, đủ đạm–sắt–canxi–chất xơ; uống nước đều. Điều chỉnh theo cân nặng và chỉ định bác sĩ.\n\n## Gợi ý 7 ngày (rút gọn)\n\n**T2:** Sáng cháo trứng; trưa cơm cá hấp + rau; tối bún bò nạm (ít mỡ).\n**T3:** Sữa chua + chuối; cơm thịt bò xào + cải; cháo yến mạch tối.\n**T4:** Bánh mì trứng; mì Ý sốt cà + thịt bằm; canh đậu hũ.\n**T5:** Phở gà; cơm tôm rim (tôm chín); sữa ấm.\n**T6:** Xôi đậu; cơm sườn non + dưa leo; trái cây.\n**T7:** Cháo cá; lẩu rau nấm (thịt chín); yogurt.\n**CN:** Bún chả (thịt chín kỹ); cơm chiên rau củ; hạt óc chó (vừa phải).\n\n## Lưu ý\n\nMẫu tham khảo; dị ứng, tiểu đường thai kỳ cần thực đơn riêng.`
  }),
  post({
    title: "Mang thai đôi: dinh dưỡng và tăng cân nhiều hơn thế nào?",
    slug: "thai-doi-dinh-duong-va-tang-can",
    excerpt: "Song thai cần năng lượng và vi chất cao hơn, theo dõi sát hơn. Không ăn gấp đôi — ACOG, NHS.",
    category: "dinh-duong-ba-bau",
    tags: ["thai-doi", "tang-can", "dinh-duong"],
    reviewer: "Tham chiếu ACOG, NHS",
    publishedAt: "2026-05-20T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Dinh dưỡng thai đôi | Blog Bầu Ăn Gì?",
    metaDescription: "Ăn uống khi mang song thai — ACOG, NHS.",
    sourceReferences: [
      ref("ACOG — Multifetal Pregnancy", "https://www.acog.org/womens-health/faqs/multiple-pregnancy", "ACOG"),
      ref("NHS — Twins and multiples", "https://www.nhs.uk/pregnancy/labour-and-birth/types-of-birth/twins/", "NHS")
    ],
    content: `## Khác biệt so thai đơn\n\nNhu cầu calo và protein tăng hơn, đặc biệt từ tam cá nguyệt 2; nguy cơ sinh non, tiểu đường thai kỳ, thiếu máu cao hơn.\n\n## Ưu tiên\n\n- Protein mỗi bữa; 5–6 bữa/ngày.\n- Sắt, folate, canxi theo chỉ định — thường xét nghiệm dày hơn.\n- Uống nước; hạn chống muối nếu phù.\n\n## Tăng cân\n\nTheo BMI ban đầu và khuyến cáo bác sĩ; song thai thường tăng nhiều hơn thai đơn nhưng không vô hạn.\n\n## Khám thai\n\nTuân lịch siêu âm/chuyên khoa sản khoa đôi theo hướng dẫn địa phương.`
  }),
  post({
    title: "Sau sinh mổ: chế độ ăn giai đoạn đầu và phục hồi",
    slug: "che-do-an-sau-sinh-mo-giai-doan-dau",
    excerpt: "Sau mổ cần đủ protein, chất xơ, nước để hồi phục và tránh táo bón. Không ăn kiêng quá gắt — ACOG, NHS.",
    category: "sau-sinh",
    tags: ["mo-lay-thai", "sau-sinh", "dinh-duong"],
    reviewer: "Tham chiếu ACOG, NHS",
    publishedAt: "2026-05-20T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Ăn uống sau mổ lấy thai | Blog Bầu Ăn Gì?",
    metaDescription: "Chế độ ăn sau sinh mổ giai đoạn đầu — ACOG, NHS.",
    sourceReferences: [
      ref("ACOG — Cesarean Birth", "https://www.acog.org/womens-health/faqs/cesarean-birth", "ACOG"),
      ref("NHS — Recovering from a caesarean", "https://www.nhs.uk/conditions/caesarean-section/recovery/", "NHS")
    ],
    content: `## Ngày đầu\n\nTheo chỉ định bệnh viện: thường uống nước, cháo loãng khi được phép ăn lại.\n\n## Tuần đầu\n\n- Cháo, soup, cơm mềm, thịt/cá nấu chín nhừ.\n- Rau luộc, trái mềm; tránh đồ nặng mùi nếu nôn.\n- Uống đủ nước; chất xơ chống táo bón (thuốc theo bác sĩ nếu cần).\n\n## Vài tuần sau\n\nTăng dần đạm (trứng, cá, thịt nạc) hỗ trợ lành vết mổ. Nếu cho con bú, calo cao hơn bình thường.\n\n## Tránh\n\nRượu; thuốc không kê; đồ cay nồng nếu gây khó chịu vết mổ.`
  }),
  post({
    title: "Hút sữa đúng cách: lưu ý vệ sinh và tần suất",
    slug: "hut-sua-me-dung-cach",
    excerpt: "Máy hút sữa giúp duy trì sản xuất sữa khi mẹ đi làm hoặc bé không bú trực tiếp — CDC, UNICEF.",
    category: "sau-sinh",
    tags: ["hut-sua", "cho-con-bu", "sau-sinh"],
    reviewer: "Tham chiếu CDC, UNICEF",
    publishedAt: "2026-05-19T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Hút sữa mẹ đúng cách | Blog Bầu Ăn Gì?",
    metaDescription: "Kỹ thuật hút sữa, vệ sinh máy — CDC, UNICEF.",
    sourceReferences: [
      ref("CDC — How to Keep Your Breast Pump Kit Clean", "https://www.cdc.gov/hygiene/childcare/clean-sanitize.html", "CDC"),
      ref("UNICEF — Expressing breastmilk", "https://www.unicef.org/parenting/food-nutrition/expressing-breastmilk", "UNICEF")
    ],
    content: `## Khi nào cần hút?\n\nBé không bú đủ, mẹ đi làm, tắc tia sữa có chỉ định, tăng nguồn sữa (theo tư vấn).\n\n## Quy trình\n\n1. Rửa tay; miệng hút sạch.\n2. Massage nhẹ vú trước khi hút.\n3. Hút 15–20 phút/bên hoặc đến khi sữa chảy chậm.\n4. Rửa/sấy khô phụ kiện sau mỗi lần.\n\n## Tần suất\n\nGần bằng số lần bé bú (khoảng 8 lần/24h) nếu hoàn toàn hút thay bú.\n\n## Lưu ý\n\nKhông siết quá mạnh; đau kéo dài — gặp tư vấn cho con bú.`
  }),
  post({
    title: "Bảo quản sữa mẹ: nhiệt độ, thời gian và rã đông an toàn",
    slug: "bao-quan-sua-me-an-toan",
    excerpt: "Sữa mẹ bảo quản đúng giữ dinh dưỡng và an toàn vi sinh. Hướng dẫn CDC cập nhật.",
    category: "sau-sinh",
    tags: ["sua-me", "bao-quan", "cho-con-bu"],
    reviewer: "Tham chiếu CDC",
    publishedAt: "2026-05-19T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Bảo quản sữa mẹ | Blog Bầu Ăn Gì?",
    metaDescription: "Cách bảo quản, rã đông sữa mẹ — CDC.",
    sourceReferences: [
      ref("CDC — Proper Storage and Preparation of Breast Milk", "https://www.cdc.gov/breastfeeding/recommendations/handling_breastmilk.htm", "CDC")
    ],
    content: `## Phòng mát (4°C)\n\nThường dùng trong **4 ngày** (tốt nhất 3 ngày).\n\n## Tủ đông\n\n**6 tháng** tối ưu; tối đa khoảng 12 tháng vẫn chấp nhận được.\n\n## Ngoài nhiệt độ phòng\n\nDùng trong **4 giờ** nếu vừa hút.\n\n## Rã đông\n\nĐể tủ mát qua đêm hoặc đặt túi trong nước ấm. **Không** hâm lại sữa đã hâm xong.\n\n## Ghi nhãn\n\nNgày giờ hút; dùng cũ trước (FIFO).`
  }),
  post({
    title: "Vàng da sơ sinh và cho con bú: khi nào cần điều trị?",
    slug: "vang-da-so-sinh-va-cho-con-bu",
    excerpt: "Vàng da thường gặp tuần đầu. Theo dõi mức độ, bú đủ sữa và khi cần đèn — AAP, NHS.",
    category: "cham-con-0-24-thang",
    tags: ["vang-da", "so-sinh", "cho-con-bu"],
    babyAgeRange: "0-6-thang",
    reviewer: "Tham chiếu AAP, NHS",
    publishedAt: "2026-05-19T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Vàng da sơ sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Vàng da ở trẻ sơ sinh và cho con bú — AAP, NHS.",
    sourceReferences: [
      ref("AAP — Jaundice in Newborns", "https://www.healthychildren.org/English/ages-stages/baby/Pages/jaundice.aspx", "AAP"),
      ref("NHS — Newborn jaundice", "https://www.nhs.uk/conditions/jaundice-newborn/", "NHS")
    ],
    content: `## Vì sao vàng?\n\nGan bé còn non, bilirubin cao tạm thời. Phổ biến ngày 2–5.\n\n## Việc mẹ làm\n\n- Cho bú **8–12 lần/ngày**; sữa giúp đào thải bilirubin.\n- Quan sát: vàng lan xuống bụng/chân, bé lờ đờ, bỏ bú — khám ngay.\n\n## Điều trị\n\nĐèn phototherapy hoặc theo dõi nội trú nếu mức cao.\n\n## Không tự ý\n\nNgưng sữa công thức không cần thiết nếu bác sĩ chưa chỉ định; tránh “nắm nắng” không kiểm soát.`
  }),
  post({
    title: "Sau sinh thiếu máu: ăn gì bổ sung sắt?",
    slug: "sau-sinh-thieu-mau-an-gi",
    excerpt: "Mất máu sinh có thể gây thiếu máu sau sinh. Thực phẩm giàu sắt và theo dõi — WHO, NHS.",
    category: "sau-sinh",
    tags: ["sat", "thieu-mau", "sau-sinh"],
    reviewer: "Tham chiếu WHO, NHS",
    publishedAt: "2026-05-18T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Thiếu máu sau sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Bổ sung sắt sau sinh — WHO, NHS.",
    sourceReferences: [
      ref("WHO — Iron deficiency anaemia", "https://www.who.int/news-room/fact-sheets/detail/anaemia", "WHO"),
      ref("NHS — Iron deficiency anaemia", "https://www.nhs.uk/conditions/iron-deficiency-anaemia/", "NHS")
    ],
    content: `## Nguyên nhân\n\nMất máu lúc sinh, thiếu sắt kéo dài thai kỳ.\n\n## Dấu hiệu\n\nMệt, chóng mặt, hồi hộp, da nhợt.\n\n## Thực phẩm\n\nThịt bò, gan nấu chín (vừa phải), cá, trứng, đậu, rau xanh + vitamin C (cam, ổi).\n\n## Bổ sung\n\nTheo xét nghiệm và kê đơn; uống cách sữa/cà phê vài giờ. Táo bón — tăng nước, chất xơ.\n\n## Khẩn cấp\n\nKhó thở, đau ngực — cấp cứu.`
  }),
  post({
    title: "Tập Kegel sau sinh: lợi ích và cách tập cơ bản",
    slug: "tap-kegel-sau-sinh",
    excerpt: "Củng cố sàn chậu hỗ trợ kiểm soát tiểu và phục hồi sau sinh. Không thay khám phụ khoa — NHS, ACOG.",
    category: "sau-sinh",
    tags: ["kegel", "san-chau", "phuc-hoi"],
    reviewer: "Tham chiếu NHS, ACOG",
    publishedAt: "2026-05-18T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Kegel sau sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Bài tập Kegel sau sinh — NHS, ACOG.",
    sourceReferences: [
      ref("NHS — Pelvic floor exercises", "https://www.nhs.uk/common-health-questions/womens-health/what-are-pelvic-floor-exercises/", "NHS"),
      ref("ACOG — Exercise After Pregnancy", "https://www.acog.org/womens-health/faqs/exercise-after-pregnancy", "ACOG")
    ],
    content: `## Sàn chậu là gì?\n\nNhóm cơ hỗ trợ bàng quang, tử cung, trực tràng.\n\n## Cách tập\n\n1. Co cơ như “cố nhịn tiểu” 3–5 giây, thả lỏng 3–5 giây.\n2. Lặp 10 lần, 3 chu kỳ/ngày.\n3. Thở bình thường; không siết mông.\n\n## Khi bắt đầu\n\nSau sinh thường có thể sớm nếu không đau; sau mổ hỏi bác sĩ. Tiểu không tự chủ >6 tuần — khám chuyên khoa.`
  }),
  post({
    title: "Kẽm và magie trong thai kỳ: nguồn thực phẩm Việt Nam",
    slug: "kem-va-magie-khi-mang-thai",
    excerpt: "Hai khoáng chất hỗ trợ miễn dịch, chuyển hóa và giảm chuột rút. Không tự uống liều cao — WHO, NIH.",
    category: "dinh-duong-ba-bau",
    tags: ["kem", "magie", "vi-chat"],
    reviewer: "Tham chiếu WHO, NIH ODS",
    publishedAt: "2026-05-18T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Kẽm & magie thai kỳ | Blog Bầu Ăn Gì?",
    metaDescription: "Kẽm, magie khi mang thai — nguồn thực phẩm WHO, NIH.",
    sourceReferences: [
      ref("WHO — Zinc supplementation during pregnancy", "https://www.who.int/tools/elena/interventions/zinc-pregnancy", "WHO"),
      ref("NIH ODS — Magnesium", "https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/", "NIH")
    ],
    content: `## Kẽm\n\nHỗ trợ tăng trưởng và miễn dịch. Nguồn: thịt, hải sản nấu chín, đậu, hạt bí.\n\n## Magie\n\nTham gia hàng trăm phản ứng enzyme; thiếu có thể góp phần chuột rút. Nguồn: hạt, đậu nành, chuối, ngũ cốc nguyên hạt, rau xanh.\n\n## Bổ sung\n\nNhiều vitamin bầu đã có kẽm; magie chỉ bổ sung khi có chỉ định. Liều cao gây tiêu chảy hoặc tương tác thuốc.`
  }),
  post({
    title: "Rụng tóc sau sinh: có bình thường không và dinh dưỡng hỗ trợ",
    slug: "rung-toc-sau-sinh",
    excerpt: "Telogen effluvium sau sinh thường tạm thời. Protein, sắt đủ và kiên nhẫn — ACOG, NHS.",
    category: "sau-sinh",
    tags: ["rung-toc", "sau-sinh", "dinh-duong"],
    reviewer: "Tham chiếu ACOG, NHS",
    publishedAt: "2026-05-17T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Rụng tóc sau sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Rụng tóc hậu sản và dinh dưỡng — ACOG, NHS.",
    sourceReferences: [
      ref("ACOG — Postpartum Hair Loss", "https://www.acog.org/womens-health/experts-and-stories/ask-acog/why-is-my-hair-falling-out-after-pregnancy", "ACOG"),
      ref("NHS — Hair loss", "https://www.nhs.uk/conditions/hair-loss/", "NHS")
    ],
    content: `## Cơ chế\n\nHormone giảm sau sinh; tóc rụng nhiều khoảng 3–6 tháng sau sinh, thường tự cải thiện.\n\n## Dinh dưỡng\n\n- Đủ protein (thịt, cá, trứng, đậu).\n- Sắt, kẽm nếu thiếu (xét nghiệm).\n- Không nhịn ăn khi cho con bú.\n\n## Chăm sóc\n\nTránh kéo căng tóc; dùng dầu gội nhẹ.\n\n## Khi khám\n\nRụng thành mảng, da đầu đỏ loét, mệt bất thường — lo bệnh lý khác.`
  }),
  post({
    title: "Dùng nhau đông lạnh sau sinh: an toàn và tiết kiệm thời gian",
    slug: "dung-nhau-dong-lanh-sau-sinh",
    excerpt: "Meal prep giúp mẹ mới có bữa nấu chín sẵn. Quy tắc bảo quản và hâm nóng — USDA, NHS.",
    category: "sau-sinh",
    tags: ["meal-prep", "sau-sinh", "thuc-don"],
    reviewer: "Tham chiếu USDA, NHS",
    publishedAt: "2026-05-17T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Nhau đông lạnh sau sinh | Blog Bầu Ăn Gì?",
    metaDescription: "Meal prep, đông lạnh bữa ăn sau sinh — USDA, NHS.",
    sourceReferences: [
      ref("USDA — Freezing and Food Safety", "https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/freezing-and-food-safety", "USDA"),
      ref("NHS — How to store food safely", "https://www.nhs.uk/live-well/eat-well/how-to-store-food-and-leftovers/", "NHS")
    ],
    content: `## Ý tưởng món\n\nCháo nguội chia khay; thịt nấu chín cắt miếng; canh rau củ; cơm nắm vừa phần.\n\n## Đông lạnh\n\nĐể nguội trước khi đóng túi; ghi ngày. Hầu hết món nấu chín **2–3 tháng** trong ngăn đông.\n\n## Hâm lại\n\nNóng **sôi kỹ** (≥74°C phần giữa); không hâm lại quá 1 lần.\n\n## Lưu ý cho con bú\n\nĐủ calo, protein; tránh nhịn ăn vì bận bếp.`
  }),
  post({
    title: "Trẻ táo bón khi ăn dặm: chất xơ và nước",
    slug: "tre-tao-bon-khi-an-dam",
    excerpt: "Chuyển sang thức ăn đặc dễ gây táo bón. Tăng chất xơ, nước và khi nào gặp nhi khoa — CDC, NHS.",
    category: "cham-con-0-24-thang",
    tags: ["tao-bon", "an-dam", "chat-xo"],
    babyAgeRange: "6-12-thang",
    reviewer: "Tham chiếu CDC, NHS",
    publishedAt: "2026-05-17T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Táo bón khi ăn dặm | Blog Bầu Ăn Gì?",
    metaDescription: "Trẻ táo bón lúc ăn dặm — CDC, NHS.",
    sourceReferences: [
      ref("CDC — Constipation in children", "https://www.cdc.gov/nutrition/infantandtoddlernutrition/mealtime/constipation.html", "CDC"),
      ref("NHS — Constipation in children", "https://www.nhs.uk/conditions/baby/health/constipation-in-children/", "NHS")
    ],
    content: `## Dấu hiệu\n\nĐi c cứng, khóc khi đi, <3 lần/tuần (tùy tuổi).\n\n## Điều chỉnh bữa ăn\n\n- Purée/chín mềm: bí, đậu Hà Lan, mận, lê.\n- Ngũ cốc nguyên hạt; thêm dầu ăn vừa phải theo hướng dẫn nhi khoa.\n- Nước nhỏ giọt sau 6 tháng nếu bác sĩ đồng ý.\n\n## Tránh\n\nChuối xanh quá nhiều; gạo trắng liên tục không rau.\n\n## Khám\n\nNôn, bụng chướng, máu trong phân — ngay.`
  }),
  post({
    title: "Dị ứng thực phẩm ở trẻ nhỏ: giới thiệu từng món một",
    slug: "di-ung-thuc-pham-tre-nho",
    excerpt: "Trừ khi có nguy cơ cao, thường không hoãn đậu phộng, trứng. Nhận biết phản ứng — AAP, NHS.",
    category: "cham-con-0-24-thang",
    tags: ["di-ung", "an-dam", "dau-phong"],
    babyAgeRange: "6-12-thang",
    reviewer: "Tham chiếu AAP, NHS",
    publishedAt: "2026-05-16T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Dị ứng thực phẩm trẻ nhỏ | Blog Bầu Ăn Gì?",
    metaDescription: "Giới thiệu thực phẩm dị ứng, dấu hiệu — AAP, NHS.",
    sourceReferences: [
      ref("AAP — Starting Solid Foods", "https://www.healthychildren.org/English/ages-stages/baby/feeding-nutrition/Pages/Starting-Solid-Foods.aspx", "AAP"),
      ref("NHS — Food allergies in babies", "https://www.nhs.uk/conditions/baby/weaning-and-feeding/food-allergies-in-babies/", "NHS")
    ],
    content: `## Nguyên tắc hiện nay\n\nGiới thiệu **đa dạng** từ ~6 tháng; không trì hoãn đậu phộng/trứng trừ chỉ định bác sĩ.\n\n## Cách thử\n\nMột loại mới/lần, quan sát 2–3 ngày; bắt đầu liều nhỏ buổi sáng.\n\n## Dấu hiệu nhẹ\n\nPhát ban quanh miệng thường tạm thời.\n\n## Khẩn cấp\n\nSưng môi/lưỡi, khò khè, nôn liên tục, bé trở nên xanh/xám — **115 cấp cứu**.`
  }),
  post({
    title: "Baby-led weaning (BLW): ưu nhược và an toàn",
    slug: "baby-led-weaning-la-gi",
    excerpt: "Cho bé tự cầm miếng thay vì muốn nghiền. Cần giám sát và tránh nghẹn — NHS, CDC.",
    category: "cham-con-0-24-thang",
    tags: ["blw", "an-dam", "an-toan"],
    babyAgeRange: "6-12-thang",
    reviewer: "Tham chiếu NHS, CDC",
    publishedAt: "2026-05-16T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Baby-led weaning | Blog Bầu Ăn Gì?",
    metaDescription: "BLW là gì, an toàn thế nào — NHS, CDC.",
    sourceReferences: [
      ref("NHS — Baby-led weaning", "https://www.nhs.uk/start-for-life/baby/weaning/weaning-your-baby/the-different-approaches-to-weaning/", "NHS"),
      ref("CDC — Choking Hazards", "https://www.cdc.gov/nutrition/infantandtoddlernutrition/foods-and-drinks/choking-hazards.html", "CDC")
    ],
    content: `## BLW là gì?\n\nBé tự cầm thức ăn mềm, cắn nhỏ thay vì chỉ ăn thìa.\n\n## Ưu điểm\n\nTự điều chỉnh khẩu phần; làm quen kết cấu.\n\n## An toàn\n\n- Ngồi thẳng, **không** để một mình.\n- Miếng to bằng ngón tay, mềm (chuối, bí, khoai).\n- Tránh nho nguyên, hạt nguyên, cà rốt cứng, kẹo dẻo.\n\n## Kết hợp\n\nNhiều gia đình vừa BLW vừa muốn — miễn bé đủ dinh dưỡng và sẵn sàng (≈6 tháng, ngồi vững).`
  }),
  post({
    title: "Thèm ăn đất, bột sắn (pica) khi mang thai",
    slug: "pica-khi-mang-thai",
    excerpt: "Ăn vật không dinh dưỡng có thể báo hiệu thiếu sắt. Cần khám và xét nghiệm — ACOG, NHS.",
    category: "truoc-sinh",
    tags: ["pica", "sat", "trieu-chung"],
    reviewer: "Tham chiếu ACOG, NHS",
    publishedAt: "2026-05-16T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Pica khi mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Thèm ăn đất, bột sắn thai kỳ — ACOG, NHS.",
    sourceReferences: [
      ref("ACOG — Nutrition During Pregnancy", "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy", "ACOG"),
      ref("NHS — Pica in pregnancy", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/unusual-cravings/", "NHS")
    ],
    content: `## Pica là gì?\n\nThèm ăn vật không phải thực phẩm: đất, bột sắn, băng giấy, băng keo.\n\n## Nguy cơ\n\nNhiễm khuẩn, chì, thiếu dinh dưỡng; có thể liên quan thiếu sắt.\n\n## Việc nên làm\n\n- Nói với bác sĩ **không xấu hổ**.\n- Xét nghiệm sắt, vi chất.\n- Không tự ăn đất/bột sắn “theo kinh nghiệm”.`
  }),
  post({
    title: "Theo dõi đường huyết khi tiểu đường thai kỳ",
    slug: "theo-doi-duong-huyet-tieu-duong-thai-ky",
    excerpt: "Đo đường huyết tại nhà, mục tiêu số và ghi chép giúp kiểm soát GDM — ACOG, CDC.",
    category: "dinh-duong-ba-bau",
    tags: ["tieu-duong-thai-ky", "duong-huyet", "theo-doi"],
    reviewer: "Tham chiếu ACOG, CDC",
    publishedAt: "2026-05-15T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Theo dõi đường huyết GDM | Blog Bầu Ăn Gì?",
    metaDescription: "Đo và ghi đường huyết tiểu đường thai kỳ — ACOG, CDC.",
    sourceReferences: [
      ref("ACOG — Gestational Diabetes", "https://www.acog.org/womens-health/faqs/gestational-diabetes", "ACOG"),
      ref("CDC — Gestational Diabetes", "https://www.cdc.gov/diabetes/basics/gestational.html", "CDC")
    ],
    content: `## Vì sao đo?\n\nTheo dõi phản ứng bữa ăn; điều chỉnh thực đơn hoặc insulin theo bác sĩ.\n\n## Thời điểm (thường gặp)\n\n- Đói sáng.\n- 1–2 giờ sau bữa chính.\n\nMục tiêu cụ thể do bác sĩ đặt.\n\n## Mẹo\n\nGhi lại thực đơn + số đường; mang sổ khám.\n\n## Khẩn cấp\n\nRun, vã mồ hôi, lú lẫn — ăn nhanh đường theo hướng dẫn; gọi cấp cứu nếu nặng.`
  }),
  post({
    title: "Rượu, thuốc lá và mang thai: không có mức an toàn",
    slug: "ruou-va-thuoc-la-khi-mang-thai",
    excerpt: "Alcohol và nicotine gây hại thai nhi. Cách cai và hỗ trợ — CDC, WHO.",
    category: "truoc-sinh",
    tags: ["ruou", "thuoc-la", "phong-tranh"],
    reviewer: "Tham chiếu CDC, WHO",
    publishedAt: "2026-05-15T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Rượu & thuốc lá thai kỳ | Blog Bầu Ăn Gì?",
    metaDescription: "Tránh rượu, thuốc lá khi mang thai — CDC, WHO.",
    sourceReferences: [
      ref("CDC — Alcohol Use in Pregnancy", "https://www.cdc.gov/pregnancy/during/alcohol-use.html", "CDC"),
      ref("WHO — Tobacco Free Initiative", "https://www.who.int/teams/health-promotion/tobacco-control", "WHO")
    ],
    content: `## Rượu\n\nCDC khuyến cáo **không** uống rượu khi mang thai — nguy cơ dị tật, sinh non.\n\n## Thuốc lá / vape\n\nNicotine và khói hại nhau thai, tăng sinh non, SIDS. Cai sớm nhất có thể.\n\n## Hỗ trợ\n\n- Tổng đài cai thuốc Việt Nam / phòng khám.\n- Nói với bác sĩ về patch nicotine nếu cai gấp (cân nhắc lợi/hại).\n\n## Sau sinh\n\nKhói thuốc lánh trẻ; không hút trong nhà.`
  }),
  post({
    title: "Mang thai mùa hè nóng: giữ nước và tránh say nắng",
    slug: "mang-thai-mua-he-nong",
    excerpt: "Mẹ bầu dễ mất nước và quá nhiệt. Uống nước, ăn nhẹ và nhận biết cảnh báo — CDC, NHS.",
    category: "truoc-sinh",
    tags: ["mua-he", "nuoc", "say-nang"],
    reviewer: "Tham chiếu CDC, NHS",
    publishedAt: "2026-05-15T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Mang thai mùa hè | Blog Bầu Ăn Gì?",
    metaDescription: "Tips nóng mùa hè khi mang thai — CDC, NHS.",
    sourceReferences: [
      ref("CDC — Extreme Heat", "https://www.cdc.gov/disasters/extremeheat/heattips.html", "CDC"),
      ref("NHS — Common health problems in pregnancy", "https://www.nhs.uk/pregnancy/related-conditions/common-symptoms/common-health-problems/", "NHS")
    ],
    content: `## Nguy cơ\n\nThai kỳ tăng thân nhiệt; mất nước gây co giật, sinh non nếu nặng.\n\n## Phòng\n\n- Uống nước thường xuyên; mang bình đi làm.\n- Mặc thoáng; tránh nắng 11h–15h.\n- Điều hòa/m quạt an toàn nếu có.\n\n## Ăn uống\n\nTrái có nước (dưa hấu, dưa lê); tránh đồ quá ngọt chỉ thay nước.\n\n## Cảnh báo\n\nChóng mặt, ít đi tiểu, đau đầu — vào nơi mát, uống nước, khám nếu không hết.`
  }),
  post({
    title: "Vitamin tổng hợp trước khi mang thai: bắt đầu khi nào?",
    slug: "vitamin-tong-hop-truoc-mang-thai",
    excerpt: "Axit folic nên bắt đầu trước thụ thai nếu có kế hoạch. Chọn loại phù hợp — CDC, NHS.",
    category: "dinh-duong-ba-bau",
    tags: ["prenatal", "folate", "chuan-bi"],
    reviewer: "Tham chiếu CDC, NHS",
    publishedAt: "2026-05-14T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Vitamin trước mang thai | Blog Bầu Ăn Gì?",
    metaDescription: "Prenatal vitamin, folic acid trước thai kỳ — CDC, NHS.",
    sourceReferences: [
      ref("CDC — Planning for Pregnancy", "https://www.cdc.gov/pregnancy/planning.html", "CDC"),
      ref("NHS — Vitamins, supplements and nutrition in pregnancy", "https://www.nhs.uk/pregnancy/keeping-well/vitamins-supplements-and-nutrition/", "NHS")
    ],
    content: `## Trước khi mang thai\n\nFolic acid **400 mcg/ngày** (hoặc liều cao hơn nếu bác sĩ chỉ định) từ trước khi thụ thai đến hết TCN1.\n\n## Chọn viên\n\n- Đủ folic acid, sắt, iod (tùy vùng).\n- Không vượt vitamin A retinol.\n\n## Mang thai bất ngờ\n\nBắt đầu ngay khi biết tin; khám sớm.\n\n## Bổ sung thêm\n\nChỉ khi xét nghiệm thiếu; tránh trùng nhiều loại.`
  }),
  post({
    title: "Thực đơn mẫu cho mẹ cho con bú (2000+ kcal)",
    slug: "thuc-don-mau-me-cho-con-bu",
    excerpt: "Cho con bú tăng nhu cầu năng lượng và nước. Gợi ý một ngày cân bằng — CDC, NHS.",
    category: "sau-sinh",
    tags: ["cho-con-bu", "thuc-don", "sau-sinh"],
    reviewer: "Tham chiếu CDC, NHS",
    publishedAt: "2026-05-14T09:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Thực đơn mẹ cho con bú | Blog Bầu Ăn Gì?",
    metaDescription: "Thực đơn mẫu khi cho con bú — CDC, NHS.",
    sourceReferences: [
      ref("CDC — Maternal Diet", "https://www.cdc.gov/breastfeeding/breastfeeding-special-circumstances/diet-and-micronutrients/maternal-diet.html", "CDC"),
      ref("NHS — Breastfeeding and diet", "https://www.nhs.uk/conditions/baby/breastfeeding-and-bottle-feeding/breastfeeding-and-lifestyle/diet/", "NHS")
    ],
    content: `## Nhu cầu\n\nThêm khoảng **330–400 kcal/ngày** so với trước mang thai (tùy tần suất bú); uống khi khát.\n\n## Một ngày mẫu\n\n- Sáng: phở bò nạm + trứng; nước ấm.\n- Giữa sáng: sữa chua + trái.\n- Trưa: cơm cá hồi + rau + canh đậu.\n- Xế: bánh mì bơ lạc + chuối.\n- Tối: bún gà; salad dưa leo.\n- Đêm (nếu bú đêm): bánh quy + sữa ấm.\n\n## Lưu ý\n\nHạn chế cá thủy ngân; caffeine vừa phải. Không uống rượu.`
  }),
  post({
    title: "Dinh dưỡng tam cá nguyệt 2: tăng trưởng nhanh của bé",
    slug: "dinh-duong-tam-ca-nguyet-2",
    excerpt: "Tuần 14–27 thai nhi phát triển mạnh; mẹ cần thêm protein và sắt — ACOG, WHO.",
    category: "dinh-duong-ba-bau",
    tags: ["3-thang-giua", "dinh-duong"],
    trimester: "3-thang-giua",
    reviewer: "Tham chiếu ACOG, WHO",
    publishedAt: "2026-05-14T10:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Dinh dưỡng TCN 2 | Blog Bầu Ăn Gì?",
    metaDescription: "Ăn uống tam cá nguyệt 2 — ACOG, WHO.",
    sourceReferences: [
      ref("ACOG — Nutrition During Pregnancy", "https://www.acog.org/womens-health/faqs/nutrition-during-pregnancy", "ACOG"),
      ref("WHO — Healthy diet during pregnancy", "https://www.who.int/news-room/fact-sheets/detail/healthy-diet", "WHO")
    ],
    content: `## Đặc điểm\n\nNghén thường giảm; cảm giác đói tăng. Thai nhi tăng cân, hình thành xương.\n\n## Ưu tiên\n\n- Protein mỗi bữa.\n- Sắt (xét nghiệm TCN2).\n- Canxi, chất xơ.\n- DHA từ cá nấu chín.\n\n## Tăng cân\n\nTheo BMI; trung bình thêm vài kg so với TCN1.\n\n## Vận động\n\nĐi bộ, bơi nhẹ nếu bác sĩ cho phép — hỗ trợ tiêu hóa và giấc ngủ.`
  }),
  post({
    title: "Sữa công thức khi cần: chọn loại và pha an toàn",
    slug: "sua-cong-thuc-khi-can",
    excerpt: "Không thay thế sữa mẹ khi không cần; nếu bổ sung/phải dùng — chọn và pha đúng — WHO, CDC.",
    category: "cham-con-0-24-thang",
    tags: ["sua-cong-thuc", "so-sinh", "an-toan"],
    babyAgeRange: "0-6-thang",
    reviewer: "Tham chiếu WHO, CDC",
    publishedAt: "2026-05-13T08:00:00+07:00",
    updatedAt: "2026-05-31T08:00:00+07:00",
    metaTitle: "Sữa công thức an toàn | Blog Bầu Ăn Gì?",
    metaDescription: "Pha sữa công thức đúng cách — WHO, CDC.",
    sourceReferences: [
      ref("WHO — Infant and young child feeding", "https://www.who.int/health-topics/infant-and-young-child-feeding", "WHO"),
      ref("CDC — Infant Formula Preparation", "https://www.cdc.gov/nutrition/infantandtoddlernutrition/formula-feeding/infant-formula-preparation-and-storage.html", "CDC")
    ],
    content: `## Khi nào?\n\nChỉ định y tế, mẹ không đủ sữa sau hỗ trợ, nhận con nuôi — theo bác sĩ.\n\n## Chọn loại\n\nSữa **0–6 tháng** phù hợp tuổi; không đổi thương hiệu liên tục nếu không cần.\n\n## Pha\n\n- Rửa tay; tiệt trùng bình núm.\n- Nước **ấm** (không nước sôi đổ vào bột trực tiếp trừ hướng dẫn đặc biệt).\n- Đúng tỷ lệ muỗng/can — không loãng/đặc.\n\n## An toàn\n\nDùng trong 1–2 giờ sau pha; không hâm lại sữa thừa.`
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

console.log(`Blog seeds: ${written} new posts written, ${skipped} skipped (already exist).`);
