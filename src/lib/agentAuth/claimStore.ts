import { getBindings } from "@/lib/cloudflare/bindings";

export type ClaimRecord = {
  claimToken: string;
  userCode: string;
  email?: string;
  status: "pending" | "verified";
  createdAt: number;
  expiresAt: number;
};

const memoryClaims = new Map<string, ClaimRecord>();
const memoryByCode = new Map<string, string>();

const CLAIM_TTL_SECONDS = 900;

function kvKey(claimToken: string) {
  return `agent-claim:${claimToken}`;
}

function codeKey(userCode: string) {
  return `agent-claim-code:${userCode}`;
}

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

  const env = await getBindings();
  if (env.FEATURE_FLAGS) {
    await env.FEATURE_FLAGS.put(kvKey(record.claimToken), JSON.stringify(record), {
      expirationTtl: CLAIM_TTL_SECONDS
    });
    await env.FEATURE_FLAGS.put(codeKey(record.userCode), record.claimToken, {
      expirationTtl: CLAIM_TTL_SECONDS
    });
  }

  return record;
}

async function readClaim(claimToken: string): Promise<ClaimRecord | null> {
  const cached = memoryClaims.get(claimToken);
  if (cached) {
    if (cached.expiresAt < Date.now()) {
      memoryClaims.delete(claimToken);
      memoryByCode.delete(cached.userCode);
      return null;
    }
    return cached;
  }

  const env = await getBindings();
  if (!env.FEATURE_FLAGS) return null;
  const raw = await env.FEATURE_FLAGS.get(kvKey(claimToken));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ClaimRecord;
    if (parsed.expiresAt < Date.now()) return null;
    memoryClaims.set(claimToken, parsed);
    memoryByCode.set(parsed.userCode, claimToken);
    return parsed;
  } catch {
    return null;
  }
}

export async function getClaimByToken(claimToken: string): Promise<ClaimRecord | null> {
  return readClaim(claimToken);
}

export async function getClaimByUserCode(userCode: string): Promise<ClaimRecord | null> {
  const fromMemory = memoryByCode.get(userCode);
  if (fromMemory) return readClaim(fromMemory);

  const env = await getBindings();
  if (!env.FEATURE_FLAGS) return null;
  const claimToken = await env.FEATURE_FLAGS.get(codeKey(userCode));
  if (!claimToken) return null;
  return readClaim(claimToken);
}

async function writeClaim(record: ClaimRecord) {
  memoryClaims.set(record.claimToken, record);
  memoryByCode.set(record.userCode, record.claimToken);
  const env = await getBindings();
  if (!env.FEATURE_FLAGS) return;
  const ttl = Math.max(60, Math.floor((record.expiresAt - Date.now()) / 1000));
  await env.FEATURE_FLAGS.put(kvKey(record.claimToken), JSON.stringify(record), { expirationTtl: ttl });
  await env.FEATURE_FLAGS.put(codeKey(record.userCode), record.claimToken, { expirationTtl: ttl });
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
