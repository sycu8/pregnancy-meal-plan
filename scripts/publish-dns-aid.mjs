#!/usr/bin/env node
/**
 * Publish DNS-AID SVCB/HTTPS records for pregnancymeal.tips via the Cloudflare API.
 *
 * Requires CLOUDFLARE_API_TOKEN with Zone:DNS:Edit on pregnancymeal.tips.
 * DNSSEC is already enabled for the zone (DS present at the parent).
 */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, existsSync } from "node:fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tokenPath = resolve(root, "cf-deploy.token");
if (existsSync(tokenPath) && !process.env.CLOUDFLARE_API_TOKEN?.trim()) {
  process.env.CLOUDFLARE_API_TOKEN = readFileSync(tokenPath, "utf8").trim();
}

const token = process.env.CLOUDFLARE_API_TOKEN?.trim();
const zoneName = process.env.DNS_AID_ZONE ?? "pregnancymeal.tips";
const target = process.env.DNS_AID_TARGET ?? "pregnancymeal.tips";

if (!token) {
  console.error("Missing CLOUDFLARE_API_TOKEN");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json"
};

async function cf(path, init) {
  const response = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers ?? {}) }
  });
  const json = await response.json();
  return { response, json };
}

const zoneRes = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
if (!zoneRes.json.success || !zoneRes.json.result?.[0]) {
  console.error("Unable to resolve zone", zoneRes.json.errors ?? zoneRes.json);
  process.exit(1);
}
const zoneId = zoneRes.json.result[0].id;

const desired = [
  {
    type: "SVCB",
    name: `_index._agents.${zoneName}`,
    ttl: 3600,
    data: { priority: 1, target, value: 'alpn="h2" port=443 mandatory=alpn,port' }
  },
  {
    type: "SVCB",
    name: `_mcp._agents.${zoneName}`,
    ttl: 3600,
    data: { priority: 1, target, value: 'alpn="mcp,h2" port=443 mandatory=alpn,port' }
  },
  {
    type: "HTTPS",
    name: `_index._agents.${zoneName}`,
    ttl: 3600,
    data: { priority: 1, target, value: 'alpn="h2" port=443' }
  },
  {
    type: "HTTPS",
    name: `_mcp._agents.${zoneName}`,
    ttl: 3600,
    data: { priority: 1, target, value: 'alpn="mcp,h2" port=443' }
  }
];

const existingRes = await cf(`/zones/${zoneId}/dns_records?per_page=500`);
if (!existingRes.json.success) {
  // Soft-fail: Workers deploy tokens often lack Zone DNS Edit. Manual zone apply remains valid.
  console.warn("DNS list failed — token may lack Zone DNS Edit.");
  console.warn(existingRes.json.errors ?? existingRes.json);
  console.warn("Apply records manually from dns/dns-aid.zone (CI continues).");
  process.exit(0);
}

const existing = existingRes.json.result ?? [];
let failures = 0;

for (const record of desired) {
  const match = existing.find((row) => row.type === record.type && row.name === record.name);
  if (match) {
    const updated = await cf(`/zones/${zoneId}/dns_records/${match.id}`, {
      method: "PUT",
      body: JSON.stringify({ ...record, proxied: undefined })
    });
    if (updated.json.success) {
      console.log(`updated ${record.type} ${record.name}`);
    } else {
      failures += 1;
      console.warn(`failed update ${record.type} ${record.name}`, updated.json.errors ?? "");
    }
  } else {
    const created = await cf(`/zones/${zoneId}/dns_records`, {
      method: "POST",
      body: JSON.stringify(record)
    });
    if (created.json.success) {
      console.log(`created ${record.type} ${record.name}`);
    } else {
      failures += 1;
      console.warn(`failed create ${record.type} ${record.name}`, created.json.errors ?? "");
    }
  }
}

if (failures > 0) {
  console.warn(`${failures} DNS-AID record(s) not published. Apply manually from dns/dns-aid.zone`);
  process.exit(0);
}

console.log("Done. Validate with:");
console.log(`  curl -s 'https://cloudflare-dns.com/dns-query?name=_index._agents.${zoneName}&type=SVCB' -H 'accept: application/dns-json'`);
