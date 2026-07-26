/** Canonical public site origin and support contact. */
export const DEFAULT_SITE_URL = "https://pregnancymeal.tips";
export const SUPPORT_EMAIL = "support@pregnancymeal.tips";
export const SUPPORT_EMAIL_MAILTO = `mailto:${SUPPORT_EMAIL}`;
export const SITE_HOST = "pregnancymeal.tips";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL;
}
