import { resolveUserIdFromRequest } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/user";
import type { PremiumTier } from "@/lib/premium/limits";

export async function resolvePremiumTier(request: Request): Promise<PremiumTier> {
  const userId = await resolveUserIdFromRequest(request);
  if (userId) {
    const user = await getUserById(userId);
    if (user?.premium) return "premium";
  }

  const header = request.headers.get("x-premium-tier");
  return header === "premium" ? "premium" : "free";
}
