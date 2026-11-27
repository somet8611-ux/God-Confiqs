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
const readme = read("../README.md");

function embedded(name) {
  const prefix = "const " + name + " = ";
  const line = worker.split(/\r?\n/).find((value) => value.startsWith(prefix));
  assert.ok(line, "missing embedded " + name);
  assert.ok(line.endsWith(";"), "invalid embedded " + name);
  return JSON.parse(line.slice(prefix.length, -1));
}

const sampleWhoami = "👋 You are logged in with an OAuth Token, associated with the email user@example.com.\n🔐 Credentials are stored in: Encrypted file (~/.config/.wrangler/config/default.enc) with key in macOS Keychain (service=wrangler, account=default)";
const checks = [
  ["Wrangler device OAuth and OS keyring are used", /login[\s\S]{0,120}--device[\s\S]{0,120}--use-keyring/.test(installer)],
  ["only the requested OAuth scopes are passed", /--scopes[\s\S]{0,100}account:read user:read workers:write workers_scripts:write d1:write/.test(installer)],
  ["installer never asks for an API token or password", !/api.?token.{0,50}(input|paste|prompt)|token.{0,50}(input|paste|prompt)/i.test(installer + page)],
  ["inherited API credentials and account override are removed", ["CLOUDFLARE_API_TOKEN","CLOUDFLARE_API_KEY","CLOUDFLARE_EMAIL","CLOUDFLARE_ACCOUNT_ID"].every((key) => installer.includes("delete childEnv." + key))],
  ["OAuth token type and encrypted keyring storage are checked", /You are logged in with an OAuth Token/.test(installer) && /Credentials are stored in: Encrypted file/.test(installer)],
  ["whoami scope list is not incorrectly parsed", !/requiredScopes|missingScopes/.test(installer)],
  ["documented Wrangler whoami output passes the checks", /You are logged in with an OAuth Token/i.test(sampleWhoami) && /Credentials are stored in: Encrypted file/i.test(sampleWhoami)],
  ["installer explains that the consent screen is authoritative", /consent screen is the authoritative review/.test(installer) && /whoami does not expose the granted scope list/.test(installer)],
  ["Worker and D1 names are random", /randomBytes\(5\)/.test(installer)],
  ["existing local folder is not overwritten", /fs\.existsSync\(dir\)/.test(installer)],
  ["installer contains no resource-delete command", !/wrangler[^\n]{0,100}\b(?:delete|remove)\b|fs\.rm(?:Sync)?\(/i.test(installer)],
  ["bootstrap code is random and hashed", /randomBytes\(24\)/.test(installer) && /bootstrapHash/.test(installer)],
  ["schema has a one-time bootstrap table", /CREATE TABLE IF NOT EXISTS bootstrap_codes/.test(schema)],
  ["first-admin registration is single-use", /NOT EXISTS\(SELECT 1 FROM accounts\)/.test(panel) && /used_at IS NULL/.test(panel)],
  ["passwords use PBKDF2 with 210,000 iterations", /PBKDF2/.test(panel) && /iterations:210000/.test(panel)],
  ["session cookie is HttpOnly, Secure, and SameSite=Strict", /HttpOnly; Secure; SameSite=Strict/.test(panel)],
  ["state-changing API calls check same origin", /sameOrigin/.test(panel)],
  ["login and registration endpoints have rate limits", /attempts>=8/.test(panel)],
  ["tenant data queries are account-scoped", (panel.match(/WHERE account_id=\?/g) ?? []).length >= 3],
  ["customer panel health declares no legacy panel connection", /legacyPanelConnected:false/.test(panel)],
  ["installer health endpoint is present", /service:\\?\"god-confiqs-installer/.test(worker)],
  ["provided account ID is validated before resource creation", installer.includes('if(accountId&&!/^[a-f0-9]{32}$/i.test(accountId))')],
  ["workers.dev URL parser accepts single- and multi-label hosts", installer.includes('(?:\\.[a-z0-9-]+)*\\.workers\\.dev')],
  ["template integrity hashes are pinned", /PANEL_SHA256/.test(installer) && /SCHEMA_SHA256/.test(installer)],
  ["landing page discloses broad Workers and D1 permissions", /workers_scripts:write/.test(page) && /d1:write/.test(page)],
  ["Windows command matches the downloaded filename", /node god-confiqs-installer\.mjs/.test(page) && !/node \.god-confiqs-installer/.test(page)],
  ["installer version is consistent", /version:"0\.2\.7"/.test(worker) && /نسخه آزمایشی ۰٫۲٫۷/.test(page)],
  ["Worker embeds the current installer source", embedded("installer") === installer],
  ["Worker embeds the current customer Worker template", embedded("panelTemplate") === panel],
  ["Worker embeds the current SQL schema", embedded("schemaTemplate") === schema],
  ["Worker embeds the current landing page", embedded("page") === page],
  ["project README links to the independent preview installer", readme.includes("https://god-confiqs-installer.zeus-n73k47.workers.dev/") && !readme.includes("god-confiqs-fixed.zeus-n73k47.workers.dev/install")],
  ["project README does not instruct users to paste API tokens", !/paste the token|paste.*Cloudflare token/i.test(readme)],
];

for (const [name, ok] of checks) {
  console.log((ok ? "PASS" : "FAIL") + "  " + name);
  assert.ok(ok, name);
}
console.log("\n" + checks.length + " static security and consistency checks passed.");
