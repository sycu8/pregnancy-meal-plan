import { getBindings } from "@/lib/cloudflare/bindings";
import type { CloudUserRecord } from "@/lib/storage/cloudStorage";

function createUserId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `usr_${Date.now()}`;
}

export async function findOrCreateUserByEmail(email: string, locale: "vi" | "en" = "vi"): Promise<CloudUserRecord> {
  const { DB } = await getBindings();
  if (!DB) throw new Error("D1 not configured");

  const normalized = email.trim().toLowerCase();
  const existing = await DB.prepare(`SELECT id, email, locale, premium FROM users WHERE email = ?`)
    .bind(normalized)
    .first<{ id: string; email: string; locale: string; premium: number }>();

  if (existing) {
    return {
      id: existing.id,
      email: existing.email,
      locale: existing.locale === "en" ? "en" : "vi",
      premium: Boolean(existing.premium)
    };
  }

  const id = createUserId();
  const now = new Date().toISOString();
  await DB.prepare(`INSERT INTO users (id, email, created_at, locale, premium) VALUES (?, ?, ?, ?, 0)`)
    .bind(id, normalized, now, locale)
    .run();

  return { id, email: normalized, locale, premium: false };
}

export async function getUserById(userId: string): Promise<CloudUserRecord | null> {
  const { DB } = await getBindings();
  if (!DB) return null;

  const row = await DB.prepare(`SELECT id, email, locale, premium FROM users WHERE id = ?`)
    .bind(userId)
    .first<{ id: string; email: string | null; locale: string; premium: number }>();

  if (!row) return null;
  return {
    id: row.id,
    email: row.email ?? undefined,
    locale: row.locale === "en" ? "en" : "vi",
    premium: Boolean(row.premium)
  };
}

export async function deleteUserAccount(userId: string) {
  const { DB } = await getBindings();
  if (!DB) throw new Error("D1 not configured");

  await DB.prepare(`DELETE FROM favorites WHERE user_id = ?`).bind(userId).run();
  await DB.prepare(`DELETE FROM meal_plans WHERE user_id = ?`).bind(userId).run();
  await DB.prepare(`DELETE FROM profiles WHERE user_id = ?`).bind(userId).run();
  await DB.prepare(`DELETE FROM auth_sessions WHERE user_id = ?`).bind(userId).run();
  await DB.prepare(`DELETE FROM users WHERE id = ?`).bind(userId).run();
}
