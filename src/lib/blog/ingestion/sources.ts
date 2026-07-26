import type { SourceConfig } from "@/types/blog";

export const BLOG_USER_AGENT = "PregnancyMealPlannerBot/1.0 (+https://pregnancymeal.tips/robots.txt; research-ingestion)";

export const DEFAULT_RATE_LIMIT_MS = 1200;

export const blogSources: SourceConfig[] = [
  {
    name: "WHO News",
    baseUrl: "https://www.who.int",
    rssUrl: "https://www.who.int/rss-feeds/news-english.xml",
    topics: ["pregnancy", "maternal", "nutrition", "infant", "breastfeeding", "child", "health", "immunization", "iodine", "iron", "anemia"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 6
  },
  {
    name: "UNICEF",
    baseUrl: "https://www.unicef.org",
    rssUrl: "https://www.unicef.org/feed",
    topics: ["child", "nutrition", "breastfeeding", "infant", "maternal", "health", "immunization"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 6
  },
  {
    name: "CDC Pregnancy",
    baseUrl: "https://www.cdc.gov",
    rssUrl: "https://tools.cdc.gov/api/v2/resources/media/403372.rss",
    allowedPaths: ["/pregnancy", "/breastfeeding", "/infant-toddler-nutrition", "/nutrition"],
    topics: ["pregnancy", "food", "safety", "breastfeeding", "maternal", "infant", "vaccine", "flu"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 6
  },
  {
    name: "CDC Breastfeeding",
    baseUrl: "https://www.cdc.gov",
    rssUrl: "https://tools.cdc.gov/api/v2/resources/media/403313.rss",
    topics: ["breastfeeding", "infant", "maternal", "nutrition", "milk"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 12
  },
  {
    name: "CDC Infant Nutrition",
    baseUrl: "https://www.cdc.gov",
    rssUrl: "https://tools.cdc.gov/api/v2/resources/media/403424.rss",
    topics: ["infant", "nutrition", "baby", "feeding", "child"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 12
  },
  {
    name: "NIH Office of Dietary Supplements",
    baseUrl: "https://ods.od.nih.gov",
    allowedPaths: ["/factsheets", "/HealthInformation"],
    topics: ["pregnancy", "folate", "iron", "calcium", "vitamin", "choline", "iodine", "supplement"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 12
  },
  {
    name: "FDA Food Safety",
    baseUrl: "https://www.fda.gov",
    allowedPaths: ["/food", "/consumers", "/food/people-risk-foodborne-illness"],
    topics: ["pregnancy", "food", "safety", "listeria", "mercury", "fish", "dairy"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 12
  },
  {
    name: "NHS",
    baseUrl: "https://www.nhs.uk",
    rssUrl: "https://www.nhs.uk/rss/news.xml",
    allowedPaths: ["/pregnancy", "/conditions/pregnancy-and-childbirth", "/baby", "/start-for-life"],
    topics: ["pregnancy", "baby", "weaning", "maternal", "nutrition", "breastfeeding"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 12
  },
  {
    name: "ACOG",
    baseUrl: "https://www.acog.org",
    rssUrl: "https://www.acog.org/rss.xml",
    allowedPaths: ["/clinical", "/patient-resources", "/womens-health"],
    topics: ["pregnancy", "nutrition", "postpartum", "prenatal", "breastfeeding"],
    credibility: "medical",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 12
  },
  {
    name: "Mayo Clinic",
    baseUrl: "https://www.mayoclinic.org",
    rssUrl: "https://www.mayoclinic.org/rss/all-mayo-clinic-news",
    allowedPaths: ["/healthy-lifestyle/pregnancy-week-by-week", "/healthy-lifestyle/infant-and-toddler-health", "/diseases-conditions"],
    topics: ["pregnancy", "infant", "baby", "health", "nutrition", "parent", "gestational"],
    credibility: "medical",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 12
  },
  {
    name: "Cleveland Clinic",
    baseUrl: "https://health.clevelandclinic.org",
    allowedPaths: ["/"],
    topics: ["pregnancy", "prenatal", "postpartum", "breastfeeding", "nutrition", "baby", "infant"],
    credibility: "hospital",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 12
  },
  {
    name: "Johns Hopkins Medicine",
    baseUrl: "https://www.hopkinsmedicine.org",
    allowedPaths: ["/health", "/wilmer", "/gynecology-obstetrics"],
    topics: ["pregnancy", "prenatal", "nutrition", "postpartum", "breastfeeding", "infant"],
    credibility: "hospital",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 12
  },
  {
    name: "Health Canada",
    baseUrl: "https://www.canada.ca",
    allowedPaths: ["/en/health-canada", "/en/public-health"],
    deniedPaths: ["/corporate/", "/results-at-a-glance", "/evaluation"],
    topics: ["pregnancy", "prenatal", "nutrition", "breastfeeding", "infant", "food safety", "folate"],
    credibility: "official",
    language: "en",
    enabled: true,
    crawlFrequencyHours: 24
  },
  {
    name: "Australian Pregnancy Guidelines",
    baseUrl: "https://www.health.gov.au",
    allowedPaths: ["/"],
    topics: ["pregnancy", "nutrition", "antenatal", "breastfeeding", "infant", "folate"],
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
    crawlFrequencyHours: 24
  },
  {
    name: "Vinmec",
    baseUrl: "https://www.vinmec.com",
    allowedPaths: ["/vie/bai-viet/", "/vie/chuyen-khoa/san-phu", "/eng/bai-viet/", "/eng/health-blog/", "/eng/article/"],
    deniedPaths: ["/professionals/", "/professional/", "/doctors/", "/bac-si/", "/chuyen-gia/"],
    topics: ["mang thai", "thai ky", "dinh duong", "me bau", "sau sinh", "pregnancy", "nutrition", "breastfeeding"],
    credibility: "hospital",
    language: "vi",
    enabled: true,
    crawlFrequencyHours: 48
  },
  {
    name: "Tâm Anh Hospital",
    baseUrl: "https://tamanhhospital.vn",
    allowedPaths: ["/tin-tuc/", "/chu-de/san-phu-khoa/"],
    deniedPaths: ["/chuyen-gia/", "/bac-si/", "/doi-ngu/"],
    topics: ["mang thai", "san phu", "me bau", "sau sinh", "dinh duong", "pregnancy", "nutrition"],
    credibility: "hospital",
    language: "vi",
    enabled: true,
    crawlFrequencyHours: 48
  },
  {
    name: "Medlatec",
    baseUrl: "https://medlatec.vn",
    allowedPaths: ["/tin-tuc/"],
    deniedPaths: ["/chuyen-gia/", "/bac-si/"],
    topics: ["mang thai", "me bau", "dinh duong", "sau sinh", "tre so sinh", "tieu duong thai", "pregnancy", "nutrition"],
    credibility: "hospital",
    language: "vi",
    enabled: true,
    crawlFrequencyHours: 72
  },
  {
    name: "Long Châu",
    baseUrl: "https://nhathuoclongchau.com.vn",
    allowedPaths: ["/bai-viet/"],
    deniedPaths: ["/chuyen-gia/", "/bac-si/"],
    topics: ["mang thai", "me bau", "dinh duong", "sau sinh", "tre so sinh", "pregnancy", "nutrition", "vitamin"],
    credibility: "medical",
    language: "vi",
    enabled: true,
    crawlFrequencyHours: 72
  }
];

export function getEnabledSources(): SourceConfig[] {
  return blogSources.filter((s) => s.enabled);
}
