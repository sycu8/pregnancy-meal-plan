import type { Locale } from "@/lib/i18n";

export const AI_UNAVAILABLE_CODE = "ai_unavailable";

export function aiUnavailableMessage(locale: Locale): string {
  if (locale === "vi") {
    return "Không tạo được thực đơn AI lúc này. Hãy thử lại hoặc dùng thực đơn cơ bản.";
  }
  return "The AI meal plan is unavailable right now. Try again, or use the basic plan.";
}

/** Cloudflare and gateway failures sometimes return an HTML error page instead of JSON. */
export function looksLikeHtmlError(value: string | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.startsWith("<!doctype") ||
    trimmed.startsWith("<html") ||
    trimmed.startsWith("<head") ||
    trimmed.startsWith("<body") ||
    /<\/?(html|head|body|title|h1)\b/i.test(value)
  );
}

/** Provider text and model ids must not be shown to people using the planner. */
export function leaksProviderDetail(value: string | undefined): boolean {
  if (!value) return false;
  return /@cf\/|@hf\/|llama-3|workers ai|openai request|no such model|binding is unavailable/i.test(value);
}

export function clientVisibleMealPlanError(locale: Locale, raw: string | undefined, status?: number): string {
  if (status === 502 || looksLikeHtmlError(raw) || leaksProviderDetail(raw)) {
    return aiUnavailableMessage(locale);
  }
  const text = raw?.trim();
  if (!text) return aiUnavailableMessage(locale);
  return text;
}
