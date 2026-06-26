#!/usr/bin/env node
/** Run wrangler with CLOUDFLARE_API_TOKEN from cf-deploy.token (gitignored). */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokenPath = resolve(root, 'cf-deploy.token');
const accountIdPath = resolve(root, 'cf-deploy.account-id');

if (existsSync(tokenPath)) {
  process.env.CLOUDFLARE_API_TOKEN = readFileSync(tokenPath, 'utf8').trim();
}

if (existsSync(accountIdPath) && !process.env.CLOUDFLARE_ACCOUNT_ID?.trim()) {
  process.env.CLOUDFLARE_ACCOUNT_ID = readFileSync(accountIdPath, 'utf8').trim();
}

if (!process.env.CLOUDFLARE_API_TOKEN?.trim()) {
  console.error('Missing CLOUDFLARE_API_TOKEN. Create cf-deploy.token or set the env var.');
  process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/wrangler-with-env.mjs <wrangler-args...>');
  process.exit(1);
}

const result = spawnSync('npx', ['wrangler', ...args], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
});

process.exit(result.status ?? 1);
