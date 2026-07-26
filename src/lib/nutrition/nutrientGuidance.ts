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

export function getNutrientGuidance(locale: "vi" | "en" = "vi") {
  return { items: nutrientGuidance, references: referenceSources, locale };
}

export const referenceSources: ReferenceSource[] = [
  {
    name: "WHO",
    description: "Daily iron and folic acid supplementation in pregnant women — global public-health guidance.",
    href: "https://www.who.int/publications/i/item/9789241501996"
  },
  {
    name: "ACOG",
    description: "Healthy Eating During Pregnancy: folic acid, iron, calcium, vitamin D, choline and omega-3.",
    href: "https://www.acog.org/womens-health/faqs/healthy-eating-during-pregnancy"
  },
  {
    name: "CDC",
    description: "Safer Food Choices for Pregnant Women: guidance on undercooked foods, unpasteurized dairy, deli meats and high-mercury fish.",
    href: "https://www.cdc.gov/food-safety/foods/pregnant-women.html"
  },
  {
    name: "NHS",
    description: "Foods to avoid in pregnancy from the UK National Health Service.",
    href: "https://www.nhs.uk/pregnancy/keeping-well/foods-to-avoid/"
  },
  {
    name: "NIH ODS",
    description: "U.S. NIH Office of Dietary Supplements fact sheets for folate, iron, calcium and other prenatal nutrients.",
    href: "https://ods.od.nih.gov/factsheets/list-all/"
  },
  {
    name: "FDA",
    description: "U.S. FDA food-safety guidance for people at higher risk of foodborne illness, including pregnancy.",
    href: "https://www.fda.gov/food/people-risk-foodborne-illness/people-risk-getting-food-poisoning"
  },
  {
    name: "Mayo Clinic",
    description: "Pregnancy week-by-week nutrition and infant health guidance from Mayo Clinic.",
    href: "https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week"
  },
  {
    name: "Vinmec",
    description: "Vinmec healthcare system: obstetrics and maternal–child nutrition articles (Vietnam reference).",
    href: "https://www.vinmec.com/vie/chuyen-khoa/san-phu-khoa/"
  }
];
