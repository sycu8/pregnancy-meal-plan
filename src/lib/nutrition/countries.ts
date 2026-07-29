export type ResidenceCountryCode =
  | "VN"
  | "US"
  | "JP"
  | "KR"
  | "SG"
  | "AU"
  | "GB"
  | "CA"
  | "DE"
  | "FR"
  | "TH"
  | "MY"
  | "TW";

export type CurrencyCode = "VND" | "USD" | "JPY" | "KRW" | "SGD" | "AUD" | "GBP" | "CAD" | "EUR" | "THB" | "MYR" | "TWD";

export type CountryPricingConfig = {
  code: ResidenceCountryCode;
  currency: CurrencyCode;
  /** BCP 47 locale used for currency formatting */
  numberLocale: string;
  labels: { en: string; vi: string };
  sources: string[];
  /** Public supermarket / convenience-store price snapshot date */
  updatedAt: string;
  note: { en: string; vi: string };
};

export const DEFAULT_RESIDENCE_COUNTRY: ResidenceCountryCode = "VN";

export const residenceCountries: CountryPricingConfig[] = [
  {
    code: "VN",
    currency: "VND",
    numberLocale: "vi-VN",
    labels: { en: "Vietnam", vi: "Việt Nam" },
    sources: ["Kingfoodmart", "WinMart", "GO!/BigC/Tops"],
    updatedAt: "2026-05-11",
    note: {
      en: "Costs are rough estimates from public online supermarket prices in Vietnam and may vary by region, season, pack size, and promotions.",
      vi: "Chi phí chỉ là ước tính tham khảo theo giá online/khuyến mãi công khai, có thể thay đổi theo khu vực, mùa vụ, khối lượng đóng gói và thời điểm đặt hàng."
    }
  },
  {
    code: "US",
    currency: "USD",
    numberLocale: "en-US",
    labels: { en: "United States", vi: "Hoa Kỳ" },
    sources: ["Walmart", "Target", "Costco"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from publicly listed US supermarket / warehouse prices and may vary by city, store, brand, and promotions.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị / cửa hàng lớn ở Mỹ; có thể khác theo thành phố, cửa hàng, thương hiệu và khuyến mãi."
    }
  },
  {
    code: "JP",
    currency: "JPY",
    numberLocale: "ja-JP",
    labels: { en: "Japan", vi: "Nhật Bản" },
    sources: ["AEON", "Seiyu", "Lawson / 7-Eleven"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from public Japan supermarket and convenience-store price ranges and may vary by prefecture and store.",
      vi: "Chi phí ước tính theo khoảng giá công khai tại siêu thị / cửa hàng tiện lợi Nhật Bản; có thể khác theo tỉnh và cửa hàng."
    }
  },
  {
    code: "KR",
    currency: "KRW",
    numberLocale: "ko-KR",
    labels: { en: "South Korea", vi: "Hàn Quốc" },
    sources: ["Emart", "Homeplus", "CU / GS25"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from public Korea supermarket and convenience-store prices and may vary by city and promotions.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị / cửa hàng tiện lợi Hàn Quốc; có thể khác theo thành phố và khuyến mãi."
    }
  },
  {
    code: "SG",
    currency: "SGD",
    numberLocale: "en-SG",
    labels: { en: "Singapore", vi: "Singapore" },
    sources: ["NTUC FairPrice", "Cold Storage", "7-Eleven"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from publicly listed Singapore supermarket and convenience-store prices.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị / cửa hàng tiện lợi Singapore."
    }
  },
  {
    code: "AU",
    currency: "AUD",
    numberLocale: "en-AU",
    labels: { en: "Australia", vi: "Úc" },
    sources: ["Woolworths", "Coles", "Aldi"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from public Australia supermarket prices and may vary by state and promotions.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị Úc; có thể khác theo bang và khuyến mãi."
    }
  },
  {
    code: "GB",
    currency: "GBP",
    numberLocale: "en-GB",
    labels: { en: "United Kingdom", vi: "Vương quốc Anh" },
    sources: ["Tesco", "Sainsbury's", "Tesco Express"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from public UK supermarket and convenience-store prices.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị / cửa hàng tiện lợi Anh."
    }
  },
  {
    code: "CA",
    currency: "CAD",
    numberLocale: "en-CA",
    labels: { en: "Canada", vi: "Canada" },
    sources: ["Loblaws", "Walmart", "Sobeys"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from public Canada supermarket prices and may vary by province.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị Canada; có thể khác theo tỉnh."
    }
  },
  {
    code: "DE",
    currency: "EUR",
    numberLocale: "de-DE",
    labels: { en: "Germany", vi: "Đức" },
    sources: ["REWE", "Aldi", "Lidl"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from public Germany supermarket prices.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị Đức."
    }
  },
  {
    code: "FR",
    currency: "EUR",
    numberLocale: "fr-FR",
    labels: { en: "France", vi: "Pháp" },
    sources: ["Carrefour", "Auchan", "Monoprix"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from public France supermarket prices.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị Pháp."
    }
  },
  {
    code: "TH",
    currency: "THB",
    numberLocale: "th-TH",
    labels: { en: "Thailand", vi: "Thái Lan" },
    sources: ["Tops", "Big C", "7-Eleven"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from public Thailand supermarket and convenience-store prices.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị / cửa hàng tiện lợi Thái Lan."
    }
  },
  {
    code: "MY",
    currency: "MYR",
    numberLocale: "ms-MY",
    labels: { en: "Malaysia", vi: "Malaysia" },
    sources: ["AEON", "Lotus's", "7-Eleven"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from public Malaysia supermarket and convenience-store prices.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị / cửa hàng tiện lợi Malaysia."
    }
  },
  {
    code: "TW",
    currency: "TWD",
    numberLocale: "zh-TW",
    labels: { en: "Taiwan", vi: "Đài Loan" },
    sources: ["Carrefour", "PX Mart", "7-Eleven"],
    updatedAt: "2026-07-01",
    note: {
      en: "Costs are rough estimates from public Taiwan supermarket and convenience-store prices.",
      vi: "Chi phí ước tính theo giá công khai tại siêu thị / cửa hàng tiện lợi Đài Loan."
    }
  }
];

const countryByCode = new Map(residenceCountries.map((country) => [country.code, country]));

export function getCountryPricing(code?: string | null): CountryPricingConfig {
  if (code && countryByCode.has(code as ResidenceCountryCode)) {
    return countryByCode.get(code as ResidenceCountryCode)!;
  }
  return countryByCode.get(DEFAULT_RESIDENCE_COUNTRY)!;
}

export function isResidenceCountryCode(value: string): value is ResidenceCountryCode {
  return countryByCode.has(value as ResidenceCountryCode);
}

export function formatMoney(amount: number, country: CountryPricingConfig): string {
  const zeroDecimal = country.currency === "VND" || country.currency === "JPY" || country.currency === "KRW" || country.currency === "TWD";
  return new Intl.NumberFormat(country.numberLocale, {
    style: "currency",
    currency: country.currency,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
    minimumFractionDigits: zeroDecimal ? 0 : undefined
  }).format(amount);
}

export function roundCountryCost(amount: number, currency: CurrencyCode): number {
  if (currency === "VND") return Math.max(1000, Math.round(amount / 500) * 500);
  if (currency === "JPY" || currency === "KRW" || currency === "TWD") return Math.max(10, Math.round(amount / 10) * 10);
  if (currency === "THB" || currency === "MYR") return Math.max(1, Math.round(amount));
  return Math.max(0.1, Math.round(amount * 20) / 20);
}
