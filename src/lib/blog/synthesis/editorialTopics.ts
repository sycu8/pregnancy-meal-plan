import type { BlogCategorySlug } from "@/types/blog";

export type EditorialTopic = {
  id: string;
  title: string;
  snippet: string;
  category: BlogCategorySlug;
  tags: string[];
};

/** Rotating topic bank focused on mother/baby nutrition & pregnancy meal plans (SEO/GEO). */
export const EDITORIAL_TOPICS: EditorialTopic[] = [
  {
    id: "thuc-don-me-bau-tuan-1",
    title: "Thực đơn mẹ bầu 7 ngày: gợi ý món Việt cân bằng dinh dưỡng",
    snippet:
      "Gợi ý thực đơn 7 ngày cho mẹ bầu với bữa chính và bữa phụ, ưu tiên sắt, folate, canxi và protein từ nguyên liệu dễ mua tại Việt Nam.",
    category: "thuc-don-ba-bau",
    tags: ["thuc-don", "me-bau", "mon-viet"]
  },
  {
    id: "dinh-duong-tam-ca-nguyet-1-seo",
    title: "Dinh dưỡng 3 tháng đầu: checklist axit folic, sắt và thực phẩm an toàn",
    snippet:
      "Checklist dinh dưỡng tam cá nguyệt 1 giúp mẹ ưu tiên axit folic, sắt, hạn chế thực phẩm nguy cơ và biết khi nào cần hỏi bác sĩ.",
    category: "dinh-duong-ba-bau",
    tags: ["folate", "sat", "tcn1"]
  },
  {
    id: "thuc-don-nghen-nang",
    title: "Thực đơn khi nghén nặng: món dễ ăn, đủ nước và đủ năng lượng",
    snippet:
      "Gợi ý thực đơn khi nghén: chia nhỏ bữa, chọn món dễ tiêu, bổ sung nước và theo dõi dấu hiệu mất nước cần khám.",
    category: "thuc-don-ba-bau",
    tags: ["nghen", "thuc-don"]
  },
  {
    id: "thuc-don-tieu-duong-thai-ky",
    title: "Thực đơn tham khảo cho mẹ bầu theo dõi đường huyết thai kỳ",
    snippet:
      "Nguyên tắc sắp xếp tinh bột, đạm và chất xơ trong ngày khi mẹ đang theo dõi đường huyết thai kỳ — mang tính tham khảo, cần bác sĩ chỉ định.",
    category: "thuc-don-ba-bau",
    tags: ["tieu-duong-thai-ky", "thuc-don"]
  },
  {
    id: "an-dam-6-thang-thuc-don",
    title: "Thực đơn ăn dặm 6 tháng: bắt đầu an toàn theo dấu hiệu sẵn sàng",
    snippet:
      "Hướng dẫn bắt đầu ăn dặm khoảng 6 tháng: dấu hiệu sẵn sàng, nhóm thực phẩm ưu tiên và lưu ý an toàn khi chế biến.",
    category: "cham-con-0-24-thang",
    tags: ["an-dam", "6-thang"]
  },
  {
    id: "dinh-duong-me-cho-con-bu",
    title: "Dinh dưỡng mẹ cho con bú: đạm, nước và thực phẩm hỗ trợ phục hồi",
    snippet:
      "Gợi ý dinh dưỡng sau sinh khi cho con bú: đủ năng lượng, đạm, nước, canxi và cách sắp xếp bữa ăn thực tế.",
    category: "sau-sinh",
    tags: ["cho-con-bu", "sau-sinh"]
  },
  {
    id: "thuc-don-3-thang-cuoi",
    title: "Thực đơn 3 tháng cuối thai kỳ: đủ năng lượng, giảm ợ nóng",
    snippet:
      "Thực đơn tam cá nguyệt 3: tăng nhẹ năng lượng, ưu tiên chất xơ, chia nhỏ bữa để giảm trào ngược và táo bón.",
    category: "thuc-don-ba-bau",
    tags: ["tcn3", "thuc-don"]
  },
  {
    id: "thuc-pham-can-tranh-me-bau",
    title: "Thực phẩm mẹ bầu nên hạn chế hoặc nấu chín kỹ",
    snippet:
      "Tổng hợp nhóm thực phẩm cần hạn chế khi mang thai theo hướng dẫn an toàn thực phẩm: sống/tái, pate, đồ chưa tiệt trùng.",
    category: "dinh-duong-ba-bau",
    tags: ["an-toan-thuc-pham", "me-bau"]
  },
  {
    id: "bo-sung-dha-omega3",
    title: "Omega-3 và DHA cho mẹ bầu: nguồn thực phẩm và lưu ý khi dùng",
    snippet:
      "Vai trò omega-3/DHA trong thai kỳ, nguồn cá và thực phẩm thay thế, khi nào nên hỏi bác sĩ trước khi dùng viên uống.",
    category: "dinh-duong-ba-bau",
    tags: ["omega-3", "dha"]
  },
  {
    id: "thuc-don-thieu-mau",
    title: "Thực đơn hỗ trợ mẹ bầu thiếu máu thiếu sắt (tham khảo)",
    snippet:
      "Gợi ý món giàu sắt heme/non-heme kết hợp vitamin C, lưu ý trà/cà phê và khi nào cần điều trị theo chỉ định.",
    category: "thuc-don-ba-bau",
    tags: ["thieu-mau", "sat"]
  },
  {
    id: "bua-phu-me-bau",
    title: "Bữa phụ mẹ bầu: 10 ý tưởng lành mạnh dưới 15 phút",
    snippet:
      "Ý tưởng bữa phụ nhanh: sữa chua, trứng, trái cây, đậu, bánh mì nguyên cám — giúp đủ năng lượng giữa các bữa chính.",
    category: "thuc-don-ba-bau",
    tags: ["bua-phu", "thuc-don"]
  },
  {
    id: "dinh-duong-tre-12-24",
    title: "Dinh dưỡng trẻ 12–24 tháng: chuyển sang ăn cùng gia đình",
    snippet:
      "Nguyên tắc dinh dưỡng 12–24 tháng: đa dạng nhóm chất, hạn chế đường muối, và cách chuyển dần sang khẩu phần gia đình.",
    category: "cham-con-0-24-thang",
    tags: ["12-24-thang", "dinh-duong"]
  }
];

export function pickEditorialTopics(count: number, daySeed = new Date().toISOString().slice(0, 10)): EditorialTopic[] {
  if (count <= 0) return [];
  const offset = hashString(daySeed) % EDITORIAL_TOPICS.length;
  const picked: EditorialTopic[] = [];
  for (let i = 0; i < Math.min(count, EDITORIAL_TOPICS.length); i++) {
    picked.push(EDITORIAL_TOPICS[(offset + i) % EDITORIAL_TOPICS.length]!);
  }
  return picked;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}
