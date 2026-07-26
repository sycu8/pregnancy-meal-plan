import { resolveUserIdFromRequest } from "@/lib/auth/session";
import { getUserById } from "@/lib/auth/user";
import type { PremiumTier } from "@/lib/premium/limits";

/**
 * Server-side premium entitlement.
 * Only trust authenticated D1 `users.premium` — never client `x-premium-tier` headers
 * (those are UI hints and can be spoofed).
 */
export async function resolvePremiumTier(request: Request): Promise<PremiumTier> {
  const userId = await resolveUserIdFromRequest(request);
  if (!userId) return "free";

  const user = await getUserById(userId);
  return user?.premium ? "premium" : "free";
}
