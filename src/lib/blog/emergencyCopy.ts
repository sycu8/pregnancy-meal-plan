/**
 * Standard emergency lines from the 18 Oct 2026 Vietnamese linguist review.
 * Shared by the article template and the "Lưu ý y tế" footer.
 * Signed off by Cuong on 18 Oct 2026. The only helpline in this copy is 115.
 */

export const EMERGENCY_NOW_VI =
  "Cần cấp cứu ngay (gọi 115 hoặc đến bệnh viện gần nhất): ra máu nhiều, đau bụng dữ dội, khó thở, ngất, co giật, vỡ ối, thai máy giảm rõ hoặc không thấy thai máy.";

export const SEEK_CARE_SOON_VI =
  "Nên đi khám sớm: triệu chứng kéo dài hoặc nặng dần, sốt, nôn không giữ được nước.";

export const EMERGENCY_NOW_EN =
  "Get emergency care now (call 115 or go to the nearest hospital): heavy bleeding, severe abdominal pain, trouble breathing, fainting, seizures, waters breaking, or a clear drop in fetal movement or no fetal movement.";

export const SEEK_CARE_SOON_EN =
  "Seek care soon: symptoms that persist or get worse, fever, or vomiting that keeps you from keeping fluids down.";

export const emergencyNow = { vi: EMERGENCY_NOW_VI, en: EMERGENCY_NOW_EN } as const;
export const seekCareSoon = { vi: SEEK_CARE_SOON_VI, en: SEEK_CARE_SOON_EN } as const;
