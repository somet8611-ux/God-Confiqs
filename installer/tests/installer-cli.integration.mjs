import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const installerPath = join(here, "..", "installer.mjs");
const panelSource = readFileSync(join(here, "..", "templates", "customer-worker.js"), "utf8");
const schemaSource = readFileSync(join(here, "..", "templates", "schema.sql"), "utf8");
const tempDirs = [];

function readJsonLines(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, "utf8").split(/\r?\n/).filter(Boolean).map(JSON.parse);
}

async function makeCase(accountInput, confirmation, authMode = "oauth") {
  const root = mkdtempSync(join(tmpdir(), "god-confiqs-cli-test-"));
  tempDirs.push(root);
  const bin = join(root, "bin");
  const fixtures = join(root, "fixtures");
  mkdirSync(bin, { recursive: true });
  mkdirSync(fixtures, { recursive: true });
  writeFileSync(join(fixtures, "customer-worker.js"), panelSource);
  writeFileSync(join(fixtures, "schema.sql"), schemaSource);

  const wranglerLog = join(root, "wrangler.jsonl");
  const fetchLog = join(root, "fetch.jsonl");
  const preloadPath = join(root, "preload.mjs");
  const stubPath = join(root, "wrangler-stub.mjs");
  const shimPath = join(bin, "npx");

  const preload = [
    'import { appendFileSync, readFileSync } from "node:fs";',
    'import { join } from "node:path";',
    'const realFetch = globalThis.fetch;',
    'globalThis.fetch = async (input, init = {}) => {',
    '  const raw = typeof input === "string" ? input : input.url;',
    '  const url = new URL(raw);',
    '  const headers = new Headers(init.headers || {});',
    '  appendFileSync(process.env.TEST_FETCH_LOG, JSON.stringify({url:url.toString(),method:init.method||"GET",hasAuthorization:headers.has("authorization"),hasBody:Boolean(init.body)}) + "\\n");',
    '  if (url.origin === "https://god-confiqs-installer.zeus-n73k47.workers.dev" && url.pathname === "/template/worker.js") return new Response(readFileSync(join(process.env.TEST_FIXTURE_ROOT,"customer-worker.js"),"utf8"),{status:200});',
    '  if (url.origin === "https://god-confiqs-installer.zeus-n73k47.workers.dev" && url.pathname === "/template/schema.sql") return new Response(readFileSync(join(process.env.TEST_FIXTURE_ROOT,"schema.sql"),"utf8"),{status:200});',
    '  if (url.hostname.endsWith(".workers.dev") && url.pathname === "/health") return Response.json({ok:true,database:true,tables:true,service:"god-confiqs-panel",legacyPanelConnected:false},{status:200});',
    '  return realFetch(input,init);',
    '};'
  ].join("\n");
  writeFileSync(preloadPath, preload);

  const stub = [
    'import { appendFileSync, readFileSync, writeFileSync } from "node:fs";',
    'import { join } from "node:path";',
    'const args = process.argv.slice(2);',
    'const command = args[2];',
    'const envState = {apiToken:Boolean(process.env.CLOUDFLARE_API_TOKEN),apiKey:Boolean(process.env.CLOUDFLARE_API_KEY),email:Boolean(process.env.CLOUDFLARE_EMAIL),accountId:Boolean(process.env.CLOUDFLARE_ACCOUNT_ID)};',
    'appendFileSync(process.env.TEST_WRANGLER_LOG,JSON.stringify({args,cwd:process.cwd(),envState}) + "\\n");',
    'if (command === "--version") { process.stdout.write("wrangler 4.119.0\\n"); }',
    'else if (command === "login") { process.stdout.write("Device flow approved (mock).\\n"); }',
    'else if (command === "whoami") {',
    '  if (process.env.TEST_AUTH_MODE === "api") process.stdout.write("You are logged in with an API Token.\\nCredentials are stored in: Encrypted file (mock)\\n");',
    '  else process.stdout.write("You are logged in with an OAuth Token, associated with the email user@example.com.\\nCredentials are stored in: Encrypted file (mock)\\n");',
    '}',
    'else if (command === "d1" && args[3] === "create") {',
    '  const dbName = args[4];',
    '  const configPath = join(process.cwd(),"wrangler.jsonc");',
    '  const config = JSON.parse(readFileSync(configPath,"utf8"));',
    '  config.d1_databases = [{binding:"TENANTS_DB",database_name:dbName,database_id:"11111111-1111-4111-8111-111111111111"}];',
    '  writeFileSync(configPath,JSON.stringify(config,null,2) + "\\n");',
    '  process.stdout.write("D1 created (mock).\\n");',
    '}',
    'else if (command === "d1" && args[3] === "execute") { process.stdout.write("D1 schema applied (mock).\\n"); }',
    'else if (command === "deploy") {',
    '  const config = JSON.parse(readFileSync(join(process.cwd(),"wrangler.jsonc"),"utf8"));',
    '  process.stdout.write("Uploaded " + config.name + " (https://" + config.name + ".workers.dev)\\n");',
    '}',
    'else { process.stderr.write("Unexpected Wrangler command: " + args.join(" ") + "\\n"); process.exitCode = 2; }'
  ].join("\n");
  writeFileSync(stubPath, stub);
  writeFileSync(shimPath, "#!/bin/sh\nexec " + JSON.stringify(process.execPath) + " " + JSON.stringify(stubPath) + " \"$@\"\n");
  chmodSync(shimPath, 0o755);

  const env = {
    ...process.env,
    PATH: bin + delimiter + (process.env.PATH || ""),
    NODE_OPTIONS: "--import=" + pathToFileURL(preloadPath).href,
    TEST_FIXTURE_ROOT: fixtures,
    TEST_WRANGLER_LOG: wranglerLog,
    TEST_FETCH_LOG: fetchLog,
    TEST_AUTH_MODE: authMode,
    CLOUDFLARE_API_TOKEN: "sentinel-api-token-must-not-reach-wrangler",
    CLOUDFLARE_API_KEY: "sentinel-api-key-must-not-reach-wrangler",
    CLOUDFLARE_EMAIL: "sentinel-email@example.invalid",
    CLOUDFLARE_ACCOUNT_ID: "sentinel-account-id-must-not-override"
  };
  const child = spawn(process.execPath, [installerPath], {
    cwd: root,
    env,
    stdio: ["pipe", "pipe", "pipe"]
  });
  const result = await new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    let accountSent = false;
    let confirmationSent = false;
    const timeout = setTimeout(() => child.kill("SIGKILL"), 45000);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
      if (accountInput !== undefined && !accountSent && stdout.includes("Optional target Account ID")) {
        child.stdin.write(accountInput + "\n");
        accountSent = true;
      }
      if (confirmation !== undefined && accountSent && !confirmationSent && stdout.includes("Type YES to create")) {
        child.stdin.write(confirmation + "\n");
        confirmationSent = true;
      }
    });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => { clearTimeout(timeout); reject(error); });
    child.on("close", (status, signal) => {
      clearTimeout(timeout);
      resolve({ status, signal, stdout, stderr, accountSent, confirmationSent });
    });
  });
  return { root, result, wranglerRows: readJsonLines(wranglerLog), fetchRows: readJsonLines(fetchLog) };
}

try {
  const accountId = "0123456789abcdef0123456789abcdef";

  const success = await makeCase(accountId, "YES");
  assert.equal(success.result.status, 0, success.result.stdout + "\n" + success.result.stderr);
  const commands = success.wranglerRows.map((row) => row.args[2] === "d1" ? row.args.slice(2, 4).join(" ") : row.args[2]);
  assert.ok(commands.includes("--version"), "Wrangler version check should run");
  assert.ok(commands.includes("login"), "OAuth device login should run");
  assert.ok(commands.includes("whoami"), "OAuth identity and keyring check should run");
  assert.ok(commands.includes("d1 create"), "a new D1 should be created only after confirmation; commands=" + JSON.stringify(commands) + "; args=" + JSON.stringify(success.wranglerRows.map((row) => row.args)));
  assert.ok(commands.includes("d1 execute"), "the D1 schema should be applied");
  assert.ok(commands.includes("deploy"), "the new customer Worker should be deployed");
  assert.ok(success.wranglerRows.every((row) => Object.values(row.envState).every((value) => value === false)), "inherited API credentials/account override must not reach Wrangler");
  assert.ok(success.fetchRows.length >= 3, "templates and generated panel health should be fetched");
  assert.ok(success.fetchRows.every((row) => row.method === "GET" && !row.hasAuthorization && !row.hasBody), "no OAuth credential, API token, or bootstrap code may be sent to the installer host");
  assert.ok(success.result.stdout.includes("SUCCESS: Worker and D1 deployed."), "success path should report deployment");
  const workerDirs = readdirSync(success.root, { withFileTypes: true }).filter((entry) => entry.isDirectory() && /^god-confiqs-[a-f0-9]{10}$/.test(entry.name));
  assert.equal(workerDirs.length, 1, "one unique local project directory should be created");
  const projectDir = join(success.root, workerDirs[0].name);
  const bootstrapPath = join(projectDir, ".bootstrap-code");
  const bootstrapCode = readFileSync(bootstrapPath, "utf8").trim();
  assert.match(bootstrapCode, /^[A-Za-z0-9_-]{32}$/);
  assert.equal(statSync(bootstrapPath).mode & 0o777, 0o600, "bootstrap code file should be private on POSIX systems");
  const config = JSON.parse(readFileSync(join(projectDir, "wrangler.jsonc"), "utf8"));
  assert.equal(config.account_id, accountId);
  assert.equal(config.name, workerDirs[0].name);
  assert.equal(config.d1_databases[0].binding, "TENANTS_DB");
  assert.ok(readFileSync(join(projectDir, "schema.sql"), "utf8").includes("bootstrap_codes"));
  assert.ok(!readFileSync(join(projectDir, "schema.sql"), "utf8").includes(bootstrapCode), "raw bootstrap code must not be inserted into SQL");
  assert.ok(!success.result.stdout.includes("sentinel-api-token-must-not-reach-wrangler"));
  console.log("PASS  mocked OAuth/keyring install, D1 binding, deploy, health URL, and private bootstrap file");

  const cancelled = await makeCase(accountId, "NO");
  assert.equal(cancelled.result.status, 0, cancelled.result.stdout + "\n" + cancelled.result.stderr);
  assert.ok(cancelled.result.stdout.includes("Cancelled. No Cloudflare resources were created."));
  assert.ok(!cancelled.wranglerRows.some((row) => row.args[2] === "d1" || row.args[2] === "deploy"), "cancellation must create no resources");
  assert.equal(readdirSync(cancelled.root, { withFileTypes: true }).filter((entry) => entry.isDirectory() && entry.name.startsWith("god-confiqs-")).length, 0);
  console.log("PASS  explicit cancellation stops before resource creation");

  const invalidAccount = await makeCase("not-a-cloudflare-account-id", undefined);
  assert.notEqual(invalidAccount.result.status, 0);
  assert.ok(invalidAccount.result.stderr.includes("32 hexadecimal characters"));
  assert.ok(!invalidAccount.wranglerRows.some((row) => row.args[2] === "d1" || row.args[2] === "deploy"));
  console.log("PASS  malformed target account ID is rejected before resource creation");

  const apiTokenLogin = await makeCase(undefined, undefined, "api");
  assert.notEqual(apiTokenLogin.result.status, 0);
  assert.ok(apiTokenLogin.result.stderr.includes("did not confirm an OAuth login"));
  assert.ok(!apiTokenLogin.wranglerRows.some((row) => row.args[2] === "d1" || row.args[2] === "deploy"));
  console.log("PASS  API-token login is rejected; installer requires the explicit OAuth device flow");

  console.log("All installer CLI integration checks passed (Wrangler and Cloudflare HTTP calls are mocked; no live resources were created).");
} finally {
  for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
}
