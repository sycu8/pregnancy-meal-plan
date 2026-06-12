export type NutrientGuidanceItem = {
  title: string;
  foods: string;
  tip: string;
};

export type ReferenceSource = {
  name: string;
  description: string;
  href: string;
};

export const nutrientGuidance: NutrientGuidanceItem[] = [
  {
    title: "Đạm mỗi bữa",
    foods: "trứng chín kỹ, gà, thịt nạc, cá ít thủy ngân, đậu hũ, đậu lăng, sữa chua",
    tip: "Mỗi bữa chính nên có một nguồn đạm để hỗ trợ tăng trưởng thai và giúp mẹ no lâu hơn."
  },
  {
    title: "Sắt + vitamin C",
    foods: "thịt bò nạc, rau dền, cải bó xôi, đậu đỏ, trứng; ăn kèm cam, ổi, cà chua",
    tip: "Vitamin C hỗ trợ hấp thu sắt; nên tránh uống trà/cà phê sát bữa chính."
  },
  {
    title: "Canxi + vitamin D",
    foods: "sữa tiệt trùng, sữa chua không đường, phô mai tiệt trùng, đậu hũ, rau xanh đậm",
    tip: "Canxi và vitamin D hỗ trợ xương răng; hỏi bác sĩ nếu bạn cần bổ sung thêm."
  },
  {
    title: "Folate và rau xanh",
    foods: "rau lá xanh, bông cải xanh, đậu, cam, ngũ cốc tăng cường nếu có",
    tip: "Folate đặc biệt quan trọng trước và trong thai kỳ; prenatal vitamin nên theo hướng dẫn bác sĩ."
  },
  {
    title: "Omega-3, choline, iodine",
    foods: "cá ít thủy ngân nấu chín, trứng chín kỹ, sữa tiệt trùng, rong biển dùng vừa phải",
    tip: "Ưu tiên nguồn an toàn, nấu chín kỹ; tránh cá thủy ngân cao."
  },
  {
    title: "Chất xơ và nước",
    foods: "khoai lang, yến mạch, gạo lứt, rau xanh, trái cây nguyên miếng, đậu",
    tip: "Tăng từ từ để giảm đầy bụng; uống nước đều trong ngày, nhất là khi bị táo bón."
  }
];

export const referenceSources: ReferenceSource[] = [
  {
    name: "ACOG",
    description: "Healthy Eating During Pregnancy: các nhóm chất quan trọng như folic acid, iron, calcium, vitamin D, choline và omega-3.",
    href: "https://www.acog.org/womens-health/faqs/healthy-eating-during-pregnancy"
  },
  {
    name: "CDC",
    description: "Safer Food Choices for Pregnant Women: hướng dẫn tránh đồ sống/tái, sữa chưa tiệt trùng, thịt nguội chưa hâm nóng và cá thủy ngân cao.",
    href: "https://www.cdc.gov/food-safety/foods/pregnant-women.html"
  },
  {
    name: "NHS",
    description: "Foods to avoid in pregnancy: danh sách thực phẩm cần tránh hoặc cần nấu chín kỹ trong thai kỳ.",
    href: "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/"
  },
  {
    name: "WHO",
    description: "Daily iron and folic acid supplementation in pregnant women: khuyến nghị sắt và acid folic ở cấp sức khỏe cộng đồng.",
    href: "https://www.who.int/publications/i/item/9789241501996"
  },
  {
    name: "Vinmec",
    description: "Hệ thống y tế Vinmec: bài chuyên môn sản phụ khoa, dinh dưỡng thai kỳ, chăm sóc mẹ và bé — tham khảo định hướng lâm sàng tại Việt Nam.",
    href: "https://www.vinmec.com/vie/chuyen-khoa/san-phu-khoa/"
  },
  {
    name: "Tâm Anh",
    description: "Bệnh viện Đa khoa Tâm Anh: tin tức và tư vấn sản phụ khoa, thai kỳ nguy cơ cao, chăm sóc trước – trong – sau sinh.",
    href: "https://tamanhhospital.vn/chu-de/san-phu-khoa/"
  },
  {
    name: "Medlatec",
    description: "Medlatec: tin tức y khoa, xét nghiệm và tư vấn sức khỏe mẹ bầu, sơ sinh, dinh dưỡng thai kỳ tại Việt Nam.",
    href: "https://medlatec.vn/tin-tuc"
  },
  {
    name: "Long Châu",
    description: "Nhà thuốc FPT Long Châu: bài viết sức khỏe mẹ và bé, dinh dưỡng, vitamin và chăm sóc thai kỳ.",
    href: "https://nhathuoclongchau.com.vn/bai-viet/me-va-be/mang-thai"
  }
];
