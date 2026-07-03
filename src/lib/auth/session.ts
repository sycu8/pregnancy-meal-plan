import { getBindings } from "@/lib/cloudflare/bindings";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function createToken() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `tok_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export async function createSession(userId: string): Promise<string> {
  const { DB } = await getBindings();
  if (!DB) throw new Error("D1 not configured");

  const token = createToken();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_MS);

  await DB.prepare(`INSERT INTO auth_sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`)
    .bind(token, userId, now.toISOString(), expires.toISOString())
    .run();

  return token;
}

export async function resolveUserIdFromRequest(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  if (!token) return null;

  const { DB } = await getBindings();
  if (!DB) return null;

  const row = await DB.prepare(
    `SELECT user_id, expires_at FROM auth_sessions WHERE token = ?`
  )
    .bind(token)
    .first<{ user_id: string; expires_at: string }>();

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return row.user_id;
}

export async function deleteUserSessions(userId: string) {
  const { DB } = await getBindings();
  if (!DB) throw new Error("D1 not configured");
  await DB.prepare(`DELETE FROM auth_sessions WHERE user_id = ?`).bind(userId).run();
}
