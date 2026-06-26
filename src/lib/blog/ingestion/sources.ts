import type { SourceConfig } from "@/types/blog";

export const BLOG_USER_AGENT = "MeBauAnGiBlogBot/1.0 (+https://mebauangi.info/robots.txt; research-ingestion)";

export const DEFAULT_RATE_LIMIT_MS = 1500;

export const blogSources: SourceConfig[] = [
  {
    name: "WHO News",
    baseUrl: "https://www.who.int",
    rssUrl: "https://www.who.int/rss-feeds/news-english.xml",
    topics: ["pregnancy", "maternal", "nutrition", "infant", "breastfeeding", "child", "health", "immunization", "iodine", "iron"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 24
  },
  {
    name: "UNICEF",
    baseUrl: "https://www.unicef.org",
    rssUrl: "https://www.unicef.org/feed",
    topics: ["child", "nutrition", "breastfeeding", "infant", "maternal", "health", "immunization"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 24
  },
  {
    name: "CDC Pregnancy",
    baseUrl: "https://www.cdc.gov",
    rssUrl: "https://tools.cdc.gov/api/v2/resources/media/403372.rss",
    allowedPaths: ["/pregnancy", "/breastfeeding", "/infant-toddler-nutrition"],
    topics: ["pregnancy", "food", "safety", "breastfeeding", "maternal", "infant", "vaccine", "flu"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 24
  },
  {
    name: "CDC Breastfeeding",
    baseUrl: "https://www.cdc.gov",
    rssUrl: "https://tools.cdc.gov/api/v2/resources/media/403313.rss",
    topics: ["breastfeeding", "infant", "maternal", "nutrition", "milk"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 24
  },
  {
    name: "CDC Infant Nutrition",
    baseUrl: "https://www.cdc.gov",
    rssUrl: "https://tools.cdc.gov/api/v2/resources/media/403424.rss",
    topics: ["infant", "nutrition", "baby", "feeding", "child"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 24
  },
  {
    name: "Healthline Pregnancy",
    baseUrl: "https://www.healthline.com",
    rssUrl: "https://www.healthline.com/health/pregnancy/feed",
    topics: ["pregnancy", "parenting", "baby", "nutrition", "health"],
    credibility: "parenting",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 48
  },
  {
    name: "Mayo Clinic Health System",
    baseUrl: "https://www.mayoclinic.org",
    rssUrl: "https://www.mayoclinic.org/rss/all-mayo-clinic-news",
    allowedPaths: ["/healthy-lifestyle/pregnancy-week-by-week", "/healthy-lifestyle/infant-and-toddler-health"],
    topics: ["pregnancy", "infant", "baby", "health", "nutrition", "parent"],
    credibility: "medical",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 48
  },
  {
    name: "NHS",
    baseUrl: "https://www.nhs.uk",
    rssUrl: "https://www.nhs.uk/rss/news.xml",
    allowedPaths: ["/pregnancy", "/conditions/pregnancy-and-childbirth", "/baby"],
    topics: ["pregnancy", "baby", "weaning", "maternal"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 48
  },
  {
    name: "ACOG",
    baseUrl: "https://www.acog.org",
    rssUrl: "https://www.acog.org/rss.xml",
    allowedPaths: ["/clinical", "/patient-resources", "/womens-health"],
    topics: ["pregnancy", "nutrition", "postpartum"],
    credibility: "medical",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 48
  },
  {
    name: "Vinmec",
    baseUrl: "https://www.vinmec.com",
    allowedPaths: ["/vie/bai-viet/", "/vie/chuyen-khoa/san-phu"],
    topics: ["thai", "san", "mang thai", "dinh duong", "me bau", "sau sinh", "cho con bu", "an dam", "tre so sinh"],
    credibility: "hospital",
    language: "vi",
    enabled: true,
    crawlFrequencyHours: 48
  },
  {
    name: "Tâm Anh Hospital",
    baseUrl: "https://tamanhhospital.vn",
    allowedPaths: ["/tin-tuc/", "/chu-de/san-phu-khoa/"],
    topics: ["thai", "san", "mang thai", "san phu", "me bau", "sau sinh", "dinh duong", "tiem chung"],
    credibility: "hospital",
    language: "vi",
    enabled: true,
    crawlFrequencyHours: 48
  },
  {
    name: "Medlatec",
    baseUrl: "https://medlatec.vn",
    allowedPaths: ["/tin-tuc/"],
    topics: ["thai", "mang thai", "me bau", "dinh duong", "sau sinh", "tre so sinh", "tieu duong", "xet nghiem"],
    credibility: "hospital",
    language: "vi",
    enabled: true,
    crawlFrequencyHours: 48
  },
  {
    name: "Long Châu",
    baseUrl: "https://nhathuoclongchau.com.vn",
    allowedPaths: ["/bai-viet/"],
    topics: ["thai", "mang thai", "me bau", "dinh duong", "sau sinh", "tre so sinh", "vitamin", "bo sung"],
    credibility: "medical",
    language: "vi",
    enabled: true,
    crawlFrequencyHours: 48
  },
  {
    name: "Bộ Y tế Việt Nam",
    baseUrl: "https://moh.gov.vn",
    allowedPaths: ["/"],
    topics: ["suc-khoe", "thai-san", "tiem-chung"],
    credibility: "official",
    language: "vi",
    enabled: false,
    crawlFrequencyHours: 72
  }
];

export function getEnabledSources(): SourceConfig[] {
  return blogSources.filter((s) => s.enabled);
}
