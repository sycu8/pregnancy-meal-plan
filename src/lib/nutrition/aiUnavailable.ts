import type { Locale } from "@/lib/i18n";

export const AI_UNAVAILABLE_CODE = "ai_unavailable";

export type MealPlanErrorKind = "ai" | "rate_limit" | "turnstile" | "server" | "invalid" | "aborted";

export type MealPlanErrorAction = "ai" | "retry" | "recheck";

const MESSAGES: Record<MealPlanErrorKind, Record<Locale, string>> = {
  ai: {
    vi: "Không tạo được thực đơn AI lúc này. Hãy thử lại hoặc dùng thực đơn cơ bản.",
    en: "The AI meal plan is unavailable right now. Try again, or use the basic plan."
  },
  rate_limit: {
    vi: "Bạn gửi yêu cầu quá nhanh. Hãy đợi một lát rồi thử lại.",
    en: "You sent requests too quickly. Wait a moment, then try again."
  },
  turnstile: {
    vi: "Chưa xác minh được yêu cầu. Hãy kiểm tra lại.",
    en: "We could not verify this request. Check it and submit again."
  },
  server: {
    vi: "Máy chủ tạm thời gặp sự cố. Hãy thử lại.",
    en: "The server had a problem. Try again."
  },
  invalid: {
    vi: "Thông tin gửi lên chưa đúng. Hãy kiểm tra lại các bước.",
    en: "The details sent were not accepted. Check the steps and submit again."
  },
  aborted: {
    vi: "Yêu cầu đã bị dừng. Hãy thử lại.",
    en: "The request was stopped. Try again."
  }
};

export function aiUnavailableMessage(locale: Locale): string {
  return mealPlanErrorMessage(locale, "ai");
}

export function mealPlanErrorMessage(locale: Locale, kind: MealPlanErrorKind): string {
  return MESSAGES[kind][locale];
}

export function mealPlanErrorAction(kind: MealPlanErrorKind): MealPlanErrorAction {
  if (kind === "ai") return "ai";
  if (kind === "turnstile" || kind === "invalid") return "recheck";
  return "retry";
}

export function classifyMealPlanStatus(status: number): MealPlanErrorKind {
  if (status === 429) return "rate_limit";
  if (status === 403) return "turnstile";
  if (status === 400 || status === 422) return "invalid";
  if (status === 502) return "ai";
  if (status >= 500) return "server";
  return "server";
}

export function mealPlanKindFromCode(code: string | undefined): MealPlanErrorKind | null {
  if (code === AI_UNAVAILABLE_CODE || code === "ai") return "ai";
  if (code === "rate_limit" || code === "turnstile" || code === "server" || code === "invalid" || code === "aborted") {
    return code;
  }
  return null;
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
  return /@cf\/|@hf\/|llama-3|workers ai|openai request|no such model|binding is unavailable|too many requests|turnstile/i.test(value);
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}
