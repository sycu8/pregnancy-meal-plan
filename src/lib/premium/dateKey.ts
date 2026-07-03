const DEFAULT_TIMEZONE = "Asia/Ho_Chi_Minh";

/** Calendar date for daily usage buckets (VN-local by default). */
export function getUsageDateKey(timeZone = DEFAULT_TIMEZONE) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export function isValidUsageDateKey(value: string | null | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}
