# Security and verification review

Audit date: 27 November 2026. Scope: read-only inspection of the deployed `god-confiqs-installer` Worker and its source. No changes were made to `god-confiqs`, `god-confiqs-fixed`, or `vless-admin-panel`.

## Verified from the deployed source/configuration

- The installer Worker has no configured bindings.
- The Cloudflare `workers.dev` subdomain is enabled for the installer and the latest listed deployment has 100% traffic.
- The local CLI uses Wrangler OAuth Device Authorization Grant (`--device`) and requests OS-keyring storage (`--use-keyring`).
- The landing page/CLI do not contain an API-token input flow. The installer does not ask users to paste tokens into its page.
- The CLI requires Node.js 20+, asks the user to approve Cloudflare access, displays the requested scopes, and requires the user to type `YES` before creating resources.
- Worker and D1 names are randomly generated. The CLI refuses to reuse an existing local destination folder and contains no Worker/D1 deletion or overwrite command.
- The CLI generates a random one-time bootstrap code, stores only its SHA-256 hash in the D1 bootstrap table, and writes the raw code to a local file.
- The customer template uses a one-time first-admin registration gate, PBKDF2 password hashing, IP-based rate limiting, HttpOnly/Secure/SameSite=Strict session cookies, and same-origin checks for state-changing API calls.
- Customer-owned user/proxy/settings queries are scoped by `account_id`.
- The panel health check requires the expected D1 tables and reports `legacyPanelConnected:false`.
- The template includes no service binding to the legacy `vless-admin-panel`.

## Cloudflare account state checked read-only

- `god-confiqs-tenants` exists and contains the earlier multi-tenant schema, but its inspected account/session/customer/workspace/user/proxy tables all have zero rows. It is not treated as a successful live tenant installation.
- The existing `god-confiqs-fixed` Worker still has a service binding named `PANEL_BACKEND` targeting `vless-admin-panel`, plus its existing D1 bindings. Neither Worker was modified in this audit.
- The separate `god-confiqs-installer` Worker is independent and has no bindings.

## Important limitations / blockers

1. **OAuth is not resource-granular.** Cloudflare documents that Wrangler OAuth does not currently support granular authorization. Creating a new Worker requires the Workers product Admin role. The requested access can therefore reach existing resources in the user's account; the script's no-delete/no-overwrite behavior is an application safeguard, not a Cloudflare permission boundary.
2. **Not a browser-only installer.** Each user needs a computer, Node.js 20+, and a terminal. The phone can approve the device code but cannot run Wrangler itself.
3. **Not end-to-end tested on a second Cloudflare account.** Device authorization, account selection, D1 creation, deployment, and rollback have not been exercised with a fresh external account.
4. **Runtime endpoint not independently verified in this environment.** Cloudflare API confirms the deployment and enabled subdomain, but the external fetch environment denied access to the workers.dev host.
5. **Health version mismatch.** Deployment annotation is `0.2.6.1`; the source's `/health` endpoint returns `0.2.6-preview`.
6. **Feature scope incomplete.** The customer panel is a minimal independent account/user prototype; proxy management, actual VLESS configuration/subscription workflows, production UI, and broader operational controls are unfinished.

## Required release test matrix

- [ ] Approve the device flow from a fresh Cloudflare test account; verify cancellation creates no resources.
- [ ] Verify the granted scopes and account selected by Wrangler.
- [ ] Create a new Worker and D1; verify unique names, tables, workers.dev URL, and `/health`.
- [ ] Register the first admin using the one-time bootstrap code; verify the code cannot be reused and public registration remains closed.
- [ ] Verify login/logout, session expiry, rate limiting, and CSRF/origin protections.
- [ ] Create two distinct owner accounts in two isolated test installations and confirm neither can read or mutate the other's records.
- [ ] Confirm no existing Worker or D1 is overwritten or deleted.
- [ ] Verify the generated panel URL is reachable from an external browser and matches the selected account.
- [ ] Correct the health version string and verify the installer release version consistently.


## 27 November 2026 follow-up — hardening patch prepared

- `wrangler whoami` reports the OAuth token type and where credentials are stored, but does **not** return the granted OAuth scope list. The previous CLI version attempted to parse scope labels from this output and therefore stopped before creating any resources, even after a successful device login. The 0.2.7 source patch removes that invalid check and instead requires both an OAuth token and encrypted keyring storage. The Cloudflare consent screen is explicitly identified as the authoritative place to review granted permissions.
- The CLI now removes inherited `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_API_KEY`, `CLOUDFLARE_EMAIL`, and `CLOUDFLARE_ACCOUNT_ID` from child processes. This prevents a shell-level API credential or stale account selection from silently overriding the explicit Wrangler device-flow authorization.
- The Windows install instructions previously used `node .god-confiqs-installer.mjs`, which did not match the downloaded filename. The command is corrected to `node god-confiqs-installer.mjs`.
- The Worker health version is aligned with the proposed source version 0.2.7, and the embedded installer, panel, SQL schema, and landing page are regenerated from the separately maintained files.
- The `god-confiqs-tenants` D1 database contains its earlier schema (13 tables were visible through `sqlite_master`) but the D1 list metadata field `num_tables` reports 0. Direct counts for the inspected account, session, customer, workspace, user, proxy, settings, and recovery tables are all zero. Do not rely on the stale `num_tables` metadata field as proof that the database is empty or initialized.
- The `god-confiqs-fixed` Worker still has its legacy service binding to `vless-admin-panel` and a `TENANTS_DB` binding to `god-confiqs-tenants`. It remains outside this patch and was not modified.

The proposed 0.2.7 changes are on a separate branch and are **not deployed yet**. The existing installer deployment remains 0.2.6.1 until the updated CI checks pass and a controlled runtime test is completed.


## 27 November 2026 CLI verification follow-up

- The optional target Account ID is now validated as exactly 32 hexadecimal characters before the user is asked to confirm resource creation. This prevents malformed IDs from reaching Wrangler or creating partial resources.
- A new mocked CLI integration suite exercises the success, explicit-cancel, malformed-account-ID, and API-token-rejection paths. It verifies that inherited `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_API_KEY`, `CLOUDFLARE_EMAIL`, and `CLOUDFLARE_ACCOUNT_ID` values are not passed to Wrangler; the installer host receives only unauthenticated GET template/health requests; the bootstrap code is stored locally with restrictive permissions; and no real Cloudflare resource is created during the test.
- These tests improve local safety verification but do not prove real Cloudflare OAuth approval, D1 creation, or external `workers.dev` reachability. Those live tests remain release blockers.


## 27 November 2026 deployment URL parser fix

- The mocked CLI integration test exposed a real post-deploy bug: the URL regular expression required an extra hostname label and did not match the valid `worker.workers.dev` form. The installer could therefore deploy a new Worker and D1, then stop before reporting the panel URL and health result.
- The parser now accepts both `worker.workers.dev` and `worker.account-subdomain.workers.dev`. The static suite checks the parser pattern, and the CLI mock exercises the single-label form.
- This fixes the source-level defect; actual Wrangler output and a live `workers.dev` health request still need to be verified on a separate test account.


## 27 November 2026 public OAuth prerequisite review

- Cloudflare's self-managed third-party OAuth clients support Authorization Code (PKCE for browser/public clients), but not Device Authorization. Cloudflare requires a public client's URL domain to be verified by publishing a DNS TXT record.
- The current installer has only a `workers.dev` hostname, whose DNS zone is not controlled by this project. Without a domain and DNS zone the project can verify, the public browser-only OAuth route is blocked. Do not claim public OAuth is available.
- The implemented alternative is Cloudflare's own Wrangler Device Authorization Grant, executed locally with `--use-keyring`. It avoids exposing tokens to the installer but requires a computer/Node.js and grants broad, non-resource-granular permissions. The consent screen remains authoritative.
- References: https://developers.cloudflare.com/fundamentals/oauth/create-an-oauth-client/ and https://developers.cloudflare.com/workers/wrangler/commands/general/.
