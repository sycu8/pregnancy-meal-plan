/** Hub and sibling projects for Cường Lê Sỹ. URLs are the public production hosts. */
export const ORANGE_CLOUD_HUB = "https://orangecloud.vn";
export const ORANGE_CLOUD_PERSON_ID = "https://orangecloud.vn/#person";
export const ORANGE_CLOUD_PERSON_NAME = "Cường Lê Sỹ";

export const siblingProjects = [
  {
    href: "https://onboarding.orangecloud.vn/",
    label: { vi: "Onboarding Cloudflare", en: "Cloudflare Onboarding" },
    note: { vi: "Lộ trình học Cloudflare", en: "Cloudflare learning paths" }
  },
  {
    href: "https://ready.orangecloud.vn/",
    label: { vi: "CF Ready", en: "CF Ready" },
    note: { vi: "Kiểm tra trước khi đưa site lên Cloudflare", en: "Checks before a Cloudflare deploy" }
  },
  {
    href: "https://blog.orangecloud.vn/",
    label: { vi: "OrangeCloud Insights", en: "OrangeCloud Insights" },
    note: { vi: "Ghi chú kỹ thuật", en: "Technical notes" }
  }
] as const;
