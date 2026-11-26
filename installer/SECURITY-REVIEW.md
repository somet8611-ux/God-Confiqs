# Security and verification review

Audit date: 26 November 2026. Scope: read-only inspection of the deployed `god-confiqs-installer` Worker and its source. No changes were made to `god-confiqs`, `god-confiqs-fixed`, or `vless-admin-panel`.

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
