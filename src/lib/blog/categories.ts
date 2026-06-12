import type { BlogCategory, BlogCategorySlug, BlogLocale, BlogTrimester, BabyAgeRange } from "@/types/blog";

const categoriesVi: BlogCategory[] = [
  {
    slug: "dinh-duong-ba-bau",
    name: "Dinh dưỡng bà bầu",
    description:
      "Hướng dẫn dinh dưỡng thai kỳ theo từng giai đoạn: axit folic, sắt, canxi, protein và thực phẩm an toàn cho mẹ bầu.",
    metaTitle: "Dinh dưỡng bà bầu | Blog Bầu Ăn Gì?",
    metaDescription:
      "Bài viết về dinh dưỡng khi mang thai: chất cần bổ sung, thực phẩm nên ăn và cần tránh, tổng hợp từ WHO, CDC, NHS, ACOG."
  },
  {
    slug: "thuc-don-ba-bau",
    name: "Thực đơn bà bầu",
    description:
      "Gợi ý thực đơn tuần, khẩu phần tham khảo và cách lên thực đơn theo tuần thai, BMI và ngân sách.",
    metaTitle: "Thực đơn bà bầu | Blog Bầu Ăn Gì?",
    metaDescription:
      "Thực đơn mẫu và mẹo lên thực đơn 7 ngày cho mẹ bầu Việt Nam, kèm danh sách đi chợ và ước tính chi phí."
  },
  {
    slug: "truoc-sinh",
    name: "Trước sinh",
    description:
      "Chuẩn bị trước sinh: khám thai, túi đi sinh, dấu hiệu chuyển dạ và những điều cần biết trước ngày sinh.",
    metaTitle: "Chuẩn bị trước sinh | Blog Bầu Ăn Gì?",
    metaDescription:
      "Checklist và tips trước sinh cho mẹ bầu: chuẩn bị tâm lý, vật dụng, dinh dưỡng 3 tháng cuối và khi nào cần đến bệnh viện."
  },
  {
    slug: "sau-sinh",
    name: "Sau sinh",
    description:
      "Hồi phục sau sinh, cho con bú, dinh dưỡng sau sinh và chăm sóc mẹ trong những tuần đầu.",
    metaTitle: "Sau sinh & hồi phục | Blog Bầu Ăn Gì?",
    metaDescription:
      "Hướng dẫn sau sinh: dinh dưỡng cho mẹ khi cho con bú, nghỉ ngơi, dấu hiệu cần tái khám và chăm sóc vết mổ hoặc sinh thường."
  },
  {
    slug: "cham-con-0-24-thang",
    name: "Chăm con 0–24 tháng",
    description:
      "Chăm sóc trẻ sơ sinh, ăn dặm, giấc ngủ, tiêm chủng và phát triển từ 0 đến 24 tháng tuổi.",
    metaTitle: "Chăm con 0–24 tháng | Blog Bầu Ăn Gì?",
    metaDescription:
      "Tips chăm con nhỏ: sơ sinh, ăn dặm 6 tháng, dinh dưỡng 12–24 tháng, tham khảo UNICEF, WHO và hướng dẫn y khoa."
  }
];

const categoriesEn: BlogCategory[] = [
  {
    slug: "dinh-duong-ba-bau",
    name: "Prenatal nutrition",
    description:
      "Pregnancy nutrition by stage: folic acid, iron, calcium, protein and food safety for expectant mothers.",
    metaTitle: "Prenatal nutrition | Bầu Ăn Gì? Blog",
    metaDescription:
      "Articles on nutrition during pregnancy: key nutrients, foods to enjoy and avoid — based on WHO, CDC, NHS and ACOG."
  },
  {
    slug: "thuc-don-ba-bau",
    name: "Pregnancy meal plans",
    description: "Sample weekly menus, portion guidance and planning by gestational week, BMI and budget.",
    metaTitle: "Pregnancy meal plans | Bầu Ăn Gì? Blog",
    metaDescription:
      "Sample 7-day meal plans for Vietnamese mothers, with shopping lists and cost estimates."
  },
  {
    slug: "truoc-sinh",
    name: "Before birth",
    description: "Birth preparation: prenatal visits, hospital bag, labour signs and what to know before delivery.",
    metaTitle: "Birth preparation | Bầu Ăn Gì? Blog",
    metaDescription:
      "Pre-birth checklists and tips: mindset, essentials, third-trimester nutrition and when to go to hospital."
  },
  {
    slug: "sau-sinh",
    name: "Postpartum",
    description: "Recovery after birth, breastfeeding, postpartum nutrition and caring for yourself in early weeks.",
    metaTitle: "Postpartum recovery | Bầu Ăn Gì? Blog",
    metaDescription:
      "Postpartum guidance: nutrition while breastfeeding, rest, warning signs and C-section or vaginal recovery."
  },
  {
    slug: "cham-con-0-24-thang",
    name: "Baby care 0–24 months",
    description: "Newborn care, starting solids, sleep, vaccines and development from birth to 24 months.",
    metaTitle: "Baby care 0–24 months | Bầu Ăn Gì? Blog",
    metaDescription:
      "Tips for young children: newborns, weaning at 6 months, nutrition 12–24 months — UNICEF, WHO and medical sources."
  }
];

export const blogCategoriesByLocale: Record<BlogLocale, BlogCategory[]> = {
  vi: categoriesVi,
  en: categoriesEn
};

export const blogCategories = categoriesVi;

export const trimesterLabels: Record<BlogLocale, Record<BlogTrimester, string>> = {
  vi: {
    "3-thang-dau": "3 tháng đầu",
    "3-thang-giua": "3 tháng giữa",
    "3-thang-cuoi": "3 tháng cuối"
  },
  en: {
    "3-thang-dau": "First trimester",
    "3-thang-giua": "Second trimester",
    "3-thang-cuoi": "Third trimester"
  }
};

export const babyAgeLabels: Record<BlogLocale, Record<BabyAgeRange, string>> = {
  vi: {
    "0-6-thang": "0–6 tháng",
    "6-12-thang": "6–12 tháng",
    "12-24-thang": "12–24 tháng"
  },
  en: {
    "0-6-thang": "0–6 months",
    "6-12-thang": "6–12 months",
    "12-24-thang": "12–24 months"
  }
};

export const medicalDisclaimer: Record<BlogLocale, string> = {
  vi: "Nội dung chỉ mang tính tham khảo, không thay thế tư vấn từ bác sĩ/chuyên gia y tế. Nếu bạn có triệu chứng bất thường hoặc bệnh nền, hãy hỏi cơ sở y tế trước khi áp dụng.",
  en: "This content is for general information only and does not replace advice from your doctor or qualified health professional. If you have unusual symptoms or a medical condition, consult a clinician before applying any guidance."
};

/** @deprecated use medicalDisclaimer[locale] */
export const MEDICAL_CONTENT_DISCLAIMER = medicalDisclaimer.vi;

export function getBlogCategories(locale: BlogLocale = "vi"): BlogCategory[] {
  return blogCategoriesByLocale[locale];
}

export function getCategoryBySlug(slug: string, locale: BlogLocale = "vi"): BlogCategory | undefined {
  return getBlogCategories(locale).find((c) => c.slug === slug);
}

export function isCategorySlug(slug: string): slug is BlogCategorySlug {
  return categoriesVi.some((c) => c.slug === slug);
}
