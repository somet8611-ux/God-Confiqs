import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (path) => readFileSync(join(root, path), "utf8");
const worker = read("worker.mjs");
const installer = read("installer.mjs");
const page = read("index.html");
const panel = read("templates/customer-worker.js");
const schema = read("templates/schema.sql");

const checks = [
  ["Wrangler device OAuth is used", /login[\s\S]{0,100}--device[\s\S]{0,100}--use-keyring/.test(installer)],
  ["installer does not request API tokens", !/CLOUDFLARE_API_TOKEN|api.?token.{0,40}(input|paste|prompt)|token.{0,40}(input|paste|prompt)/i.test(installer + page)],
  ["Worker and D1 names are random", /randomBytes\(5\)/.test(installer)],
  ["existing local folder is not overwritten", /fs\.existsSync\(dir\)/.test(installer)],
  ["installer contains no resource-delete command", !/wrangler[^\n]{0,100}\b(?:delete|remove)\b|fs\.rm(?:Sync)?\(/i.test(installer)],
  ["bootstrap code is random and hashed", /randomBytes\(24\)/.test(installer) && /bootstrapHash/.test(installer)],
  ["schema has one-time bootstrap table", /CREATE TABLE IF NOT EXISTS bootstrap_codes/.test(schema)],
  ["first-admin registration is single-use", /NOT EXISTS\(SELECT 1 FROM accounts\)/.test(panel) && /used_at IS NULL/.test(panel)],
  ["passwords use PBKDF2 with 210,000 iterations", /PBKDF2/.test(panel) && /iterations:210000/.test(panel)],
  ["session cookie is HttpOnly, Secure, and SameSite=Strict", /HttpOnly; Secure; SameSite=Strict/.test(panel)],
  ["state-changing API calls check same origin", /sameOrigin/.test(panel)],
  ["login/register endpoints have rate limits", /attempts>=8/.test(panel)],
  ["tenant data queries are account-scoped", (panel.match(/WHERE account_id=\?/g) ?? []).length >= 3],
  ["panel health declares no legacy panel connection", /legacyPanelConnected:false/.test(panel)],
  ["installer health endpoint is present", /service:\\?"god-confiqs-installer/.test(worker)],
  ["template integrity hashes are pinned", /PANEL_SHA256/.test(worker) && /SCHEMA_SHA256/.test(worker)],
  ["page discloses Workers and D1 permissions", /workers_scripts:write/.test(page) && /d1:write/.test(page)],
];

for (const [name, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  assert.ok(ok, name);
}
console.log(`\n${checks.length} static security checks passed.`);
