import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { webcrypto } from "node:crypto";

if (!globalThis.crypto) globalThis.crypto = webcrypto;

const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, "../templates/schema.sql"), "utf8");
const workerSource = readFileSync(join(here, "../templates/customer-worker.js"), "utf8");
const temp = mkdtempSync(join(tmpdir(), "god-confiqs-panel-test-"));
const modulePath = join(temp, "customer-worker.mjs");
writeFileSync(modulePath, workerSource, "utf8");

class MockStatement {
  constructor(owner, sql) {
    this.owner = owner;
    this.sql = sql;
    this.params = [];
  }
  bind(...params) {
    this.params = params;
    return this;
  }
  first() {
    return this.owner.raw.prepare(this.sql).get(...this.params) ?? null;
  }
  all() {
    return { results: this.owner.raw.prepare(this.sql).all(...this.params) };
  }
  run() {
    const statement = this.owner.raw.prepare(this.sql);
    if (/\bRETURNING\b/i.test(this.sql)) {
      const results = statement.all(...this.params);
      return { results, meta: { changes: results.length } };
    }
    const result = statement.run(...this.params);
    return {
      results: [],
      meta: {
        changes: Number(result.changes),
        last_row_id: Number(result.lastInsertRowid)
      }
    };
  }
}

class MockD1 {
  constructor(sql) {
    this.raw = new DatabaseSync(":memory:");
    this.raw.exec(sql);
  }
  prepare(sql) {
    return new MockStatement(this, sql);
  }
  batch(statements) {
    this.raw.exec("BEGIN");
    try {
      const results = statements.map((statement) => statement.run());
      this.raw.exec("COMMIT");
      return results;
    } catch (error) {
      this.raw.exec("ROLLBACK");
      throw error;
    }
  }
  close() {
    this.raw.close();
  }
}

async function sha(value) {
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function makeEnv(setupCode) {
  const db = new MockD1(schema);
  db.prepare("INSERT INTO bootstrap_codes(code_hash) VALUES(?)").bind(await sha(setupCode)).run();
  return { TENANTS_DB: db };
}

async function call(panel, env, host, path, options = {}) {
  const method = options.method || "GET";
  const headers = new Headers();
  headers.set("CF-Connecting-IP", options.ip || "198.51.100.25");
  if (method !== "GET" && method !== "HEAD") {
    headers.set("Origin", options.origin || host);
  }
  if (options.cookie) headers.set("Cookie", options.cookie);
  if (options.body !== undefined) headers.set("content-type", "application/json");
  const request = new Request(host + path, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  return panel.fetch(request, env);
}

function cookieFrom(response) {
  const value = response.headers.get("set-cookie");
  assert.ok(value, "expected Set-Cookie header");
  assert.match(value, /HttpOnly; Secure; SameSite=Strict/);
  return value.split(";")[0];
}

const openDatabases = [];
try {
  const { default: panel } = await import(pathToFileURL(modulePath).href);
  const hostOne = "https://god-confiqs-one.workers.dev";
  const hostTwo = "https://god-confiqs-two.workers.dev";
  const setupOne = "ABCDEFGHIJKLMNOPQRSTUVWX12345678";
  const setupTwo = "ZYXWVUTSRQPONMLKJIHGFEDCBA87654321";
  const passwordOne = "StrongPassphrase-One-2026!";
  const passwordTwo = "StrongPassphrase-Two-2026!";
  const envOne = await makeEnv(setupOne);
  const envTwo = await makeEnv(setupTwo);
  openDatabases.push(envOne.TENANTS_DB, envTwo.TENANTS_DB);

  const health = await call(panel, envOne, hostOne, "/health");
  assert.equal(health.status, 200);
  const healthData = await health.json();
  assert.equal(healthData.ok, true);
  assert.equal(healthData.database, true);
  assert.equal(healthData.tables, true);
  assert.equal(healthData.legacyPanelConnected, false);
  console.log("PASS  customer Worker health and independent D1 schema");

  const registration = await call(panel, envOne, hostOne, "/api/register", {
    method: "POST",
    body: { username: "owner_one", password: passwordOne, setup_code: setupOne }
  });
  assert.equal(registration.status, 201);
  const cookieOne = cookieFrom(registration);
  console.log("PASS  first-admin registration and secure session cookie");

  const reuse = await call(panel, envOne, hostOne, "/api/register", {
    method: "POST",
    body: { username: "owner_two", password: passwordTwo, setup_code: setupOne }
  });
  assert.equal(reuse.status, 403);
  console.log("PASS  one-time bootstrap code cannot be reused");

  const me = await call(panel, envOne, hostOne, "/api/me", { cookie: cookieOne });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).username, "owner_one");

  const addOne = await call(panel, envOne, hostOne, "/api/users", {
    method: "POST",
    cookie: cookieOne,
    body: { name: "Customer One" }
  });
  assert.equal(addOne.status, 201);
  const ownUserId = (await addOne.json()).id;

  const listOne = await call(panel, envOne, hostOne, "/api/users", { cookie: cookieOne });
  assert.equal(listOne.status, 200);
  assert.deepEqual((await listOne.json()).map((row) => row.name), ["Customer One"]);
  console.log("PASS  authenticated customer create/list");

  const foreignAccount = envOne.TENANTS_DB.raw.prepare(
    "INSERT INTO accounts(username,password_salt,password_hash) VALUES(?,?,?)"
  ).run("foreign_owner", "salt", "hash");
  const foreignAccountId = Number(foreignAccount.lastInsertRowid);
  const foreignUser = envOne.TENANTS_DB.raw.prepare(
    "INSERT INTO tenant_users(account_id,name,uuid,expire_at,note,enabled) VALUES(?,?,?,?,?,1)"
  ).run(foreignAccountId, "Foreign Private Row", "foreign-isolation-test-uuid", null, "");
  const foreignUserId = Number(foreignUser.lastInsertRowid);

  const badOrigin = await call(panel, envOne, hostOne, "/api/users", {
    method: "POST",
    cookie: cookieOne,
    origin: "https://attacker.example",
    body: { name: "CSRF attempt" }
  });
  assert.equal(badOrigin.status, 403);

  const crossAccountDelete = await call(panel, envOne, hostOne, "/api/users/" + foreignUserId, {
    method: "DELETE",
    cookie: cookieOne
  });
  assert.equal(crossAccountDelete.status, 404);
  const foreignStillExists = envOne.TENANTS_DB.raw.prepare(
    "SELECT id FROM tenant_users WHERE id=? AND account_id=?"
  ).get(foreignUserId, foreignAccountId);
  assert.ok(foreignStillExists);
  console.log("PASS  CSRF origin check and cross-account row isolation");

  const login = await call(panel, envOne, hostOne, "/api/login", {
    method: "POST",
    body: { username: "owner_one", password: passwordOne }
  });
  assert.equal(login.status, 200);
  const loginCookie = cookieFrom(login);
  const logout = await call(panel, envOne, hostOne, "/api/logout", {
    method: "POST",
    cookie: loginCookie,
    body: {}
  });
  assert.equal(logout.status, 200);
  const afterLogout = await call(panel, envOne, hostOne, "/api/me", { cookie: loginCookie });
  assert.equal(afterLogout.status, 401);
  console.log("PASS  login, logout, and session invalidation");

  for (let attempt = 0; attempt < 8; attempt++) {
    const wrong = await call(panel, envOne, hostOne, "/api/login", {
      method: "POST",
      body: { username: "owner_one", password: "DefinitelyWrongPassword!" },
      ip: "198.51.100.99"
    });
    assert.equal(wrong.status, 401);
  }
  const limited = await call(panel, envOne, hostOne, "/api/login", {
    method: "POST",
    body: { username: "owner_one", password: "DefinitelyWrongPassword!" },
    ip: "198.51.100.99"
  });
  assert.equal(limited.status, 429);
  console.log("PASS  login rate limiting");

  const registrationTwo = await call(panel, envTwo, hostTwo, "/api/register", {
    method: "POST",
    body: { username: "owner_one", password: passwordTwo, setup_code: setupTwo }
  });
  assert.equal(registrationTwo.status, 201);
  const cookieTwo = cookieFrom(registrationTwo);
  const addTwo = await call(panel, envTwo, hostTwo, "/api/users", {
    method: "POST",
    cookie: cookieTwo,
    body: { name: "Customer Two" }
  });
  assert.equal(addTwo.status, 201);

  const listTwo = await call(panel, envTwo, hostTwo, "/api/users", { cookie: cookieTwo });
  assert.deepEqual((await listTwo.json()).map((row) => row.name), ["Customer Two"]);
  const listOneAgain = await call(panel, envOne, hostOne, "/api/users", { cookie: cookieOne });
  assert.deepEqual((await listOneAgain.json()).map((row) => row.name), ["Customer One"]);
  assert.notEqual(ownUserId, (await addTwo.json()).id);
  console.log("PASS  two independent installations do not share D1 data");

  console.log("All customer Worker integration checks passed.");
} finally {
  for (const db of openDatabases) db.close();
  rmSync(temp, { recursive: true, force: true });
}
