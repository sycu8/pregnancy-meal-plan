const REFERRAL_KEY = "bau-an-gi:referral";

export function captureReferralFromUrl() {
  if (typeof window === "undefined") return;
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref) window.localStorage.setItem(REFERRAL_KEY, ref);
}

export function getReferralCode() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFERRAL_KEY);
}

export function buildReferralShareUrl(locale: "vi" | "en", code: string) {
  const base = locale === "en" ? "https://mebauangi.info/en" : "https://mebauangi.info";
  return `${base}?ref=${encodeURIComponent(code)}`;
}
