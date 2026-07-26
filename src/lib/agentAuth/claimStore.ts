import { getBindings } from "@/lib/cloudflare/bindings";

export type ClaimRecord = {
  claimToken: string;
  userCode: string;
  email?: string;
  status: "pending" | "verified";
  createdAt: number;
  expiresAt: number;
};

/** In-memory fallback for local/dev when D1 is unavailable. Not shared across isolates. */
const memoryClaims = new Map<string, ClaimRecord>();
const memoryByCode = new Map<string, string>();

const CLAIM_TTL_SECONDS = 900;
let ensuredTable = false;

export function mintOpaque(prefix: string) {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "")
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${Buffer.from(`${prefix}:${rand}`).toString("base64url")}`;
}

export function mintUserCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function ensureClaimsTable() {
  if (ensuredTable) return;
  const { DB } = await getBindings();
  if (!DB) return;
  // D1 prepared statements expose `.run()` directly; our typings require `.bind()`.
  const stmt = DB.prepare(
    `CREATE TABLE IF NOT EXISTS agent_claims (
      claim_token TEXT PRIMARY KEY NOT NULL,
      user_code TEXT NOT NULL UNIQUE,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    )`
  ) as unknown as { run: () => Promise<unknown>; bind: (...args: unknown[]) => { run: () => Promise<unknown> } };
  if (typeof stmt.run === "function") {
    await stmt.run();
  } else {
    await stmt.bind().run();
  }
  ensuredTable = true;
}

function rowToClaim(row: {
  claim_token: string;
  user_code: string;
  email: string | null;
  status: string;
  created_at: number;
  expires_at: number;
}): ClaimRecord | null {
  if (row.expires_at < Date.now()) return null;
  return {
    claimToken: row.claim_token,
    userCode: row.user_code,
    email: row.email ?? undefined,
    status: row.status === "verified" ? "verified" : "pending",
    createdAt: row.created_at,
    expiresAt: row.expires_at
  };
}

export async function createClaim(input: { email?: string; claimToken?: string; userCode?: string }): Promise<ClaimRecord> {
  const now = Date.now();
  const record: ClaimRecord = {
    claimToken: input.claimToken ?? mintOpaque("claim"),
    userCode: input.userCode ?? mintUserCode(),
    email: input.email?.trim().toLowerCase() || undefined,
    status: "pending",
    createdAt: now,
    expiresAt: now + CLAIM_TTL_SECONDS * 1000
  };

  memoryClaims.set(record.claimToken, record);
  memoryByCode.set(record.userCode, record.claimToken);

  const { DB } = await getBindings();
  if (!DB) {
    // Local/dev fallback only — production Workers always bind D1.
    if (process.env.NODE_ENV === "production") {
      throw new Error("D1 not configured for agent claims");
    }
    return record;
  }

  await ensureClaimsTable();
  await DB.prepare(
    `INSERT INTO agent_claims (claim_token, user_code, email, status, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(claim_token) DO UPDATE SET
       user_code = excluded.user_code,
       email = excluded.email,
       status = excluded.status,
       created_at = excluded.created_at,
       expires_at = excluded.expires_at`
  )
    .bind(
      record.claimToken,
      record.userCode,
      record.email ?? null,
      record.status,
      record.createdAt,
      record.expiresAt
    )
    .run();

  return record;
}

export async function getClaimByToken(claimToken: string): Promise<ClaimRecord | null> {
  const { DB } = await getBindings();
  if (DB) {
    await ensureClaimsTable();
    const row = await DB.prepare(
      `SELECT claim_token, user_code, email, status, created_at, expires_at FROM agent_claims WHERE claim_token = ?`
    )
      .bind(claimToken)
      .first<{
        claim_token: string;
        user_code: string;
        email: string | null;
        status: string;
        created_at: number;
        expires_at: number;
      }>();
    if (row) {
      const claim = rowToClaim(row);
      if (claim) {
        memoryClaims.set(claim.claimToken, claim);
        memoryByCode.set(claim.userCode, claim.claimToken);
      }
      return claim;
    }
  }

  const cached = memoryClaims.get(claimToken);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    memoryClaims.delete(claimToken);
    memoryByCode.delete(cached.userCode);
    return null;
  }
  return cached;
}

export async function getClaimByUserCode(userCode: string): Promise<ClaimRecord | null> {
  const { DB } = await getBindings();
  if (DB) {
    await ensureClaimsTable();
    const row = await DB.prepare(
      `SELECT claim_token, user_code, email, status, created_at, expires_at FROM agent_claims WHERE user_code = ?`
    )
      .bind(userCode)
      .first<{
        claim_token: string;
        user_code: string;
        email: string | null;
        status: string;
        created_at: number;
        expires_at: number;
      }>();
    if (row) return rowToClaim(row);
  }

  const fromMemory = memoryByCode.get(userCode);
  if (!fromMemory) return null;
  return getClaimByToken(fromMemory);
}

async function writeClaim(record: ClaimRecord) {
  memoryClaims.set(record.claimToken, record);
  memoryByCode.set(record.userCode, record.claimToken);

  const { DB } = await getBindings();
  if (!DB) return;
  await ensureClaimsTable();
  await DB.prepare(
    `INSERT INTO agent_claims (claim_token, user_code, email, status, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(claim_token) DO UPDATE SET
       user_code = excluded.user_code,
       email = excluded.email,
       status = excluded.status,
       created_at = excluded.created_at,
       expires_at = excluded.expires_at`
  )
    .bind(
      record.claimToken,
      record.userCode,
      record.email ?? null,
      record.status,
      record.createdAt,
      record.expiresAt
    )
    .run();
}

/** Human completes ownership by presenting the issued user_code. */
export async function verifyClaim(input: {
  userCode: string;
  email?: string;
  claimToken?: string;
}): Promise<{ ok: true; claim: ClaimRecord } | { ok: false; error: string }> {
  const byCode = await getClaimByUserCode(input.userCode);
  if (!byCode) return { ok: false, error: "invalid_user_code" };
  if (input.claimToken && input.claimToken !== byCode.claimToken) {
    return { ok: false, error: "claim_token_mismatch" };
  }
  if (byCode.email && input.email && byCode.email !== input.email.trim().toLowerCase()) {
    return { ok: false, error: "email_mismatch" };
  }

  const next: ClaimRecord = {
    ...byCode,
    status: "verified",
    email: input.email?.trim().toLowerCase() || byCode.email
  };
  await writeClaim(next);
  return { ok: true, claim: next };
}
