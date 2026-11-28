# GOD CONFIQS Installer — source snapshot

This folder is a source-controlled snapshot of the deployed `god-confiqs-installer` Worker, retrieved from Cloudflare on **26 November 2026**. The `installer-hardening-2026-11-27` branch contains a proposed 0.2.7 security and consistency patch; that patch is not deployed until its checks and runtime verification pass. All changes remain isolated from the protected application Workers.

## Files

- `worker.mjs` — exact deployed Worker entry point.
- `index.html` — installer landing page served at `/`.
- `installer.mjs` — local Node.js provisioning program downloaded by the landing page.
- `templates/customer-worker.js` — isolated customer panel template.
- `templates/schema.sql` — fresh D1 schema used for each installation.
- `SECURITY-REVIEW.md` — current audit findings and uncompleted tests.

## Current deployment

- Worker: [god-confiqs-installer](https://god-confiqs-installer.zeus-n73k47.workers.dev/)
- Deployment annotation: `GOD CONFIQS installer v0.2.6.1`
- Deployment created: 25 November 2026, 14:35 UTC
- Cloudflare reports the `workers.dev` subdomain enabled and this deployment at 100%.
- The source's `/health` response still says `0.2.6-preview`; this does not match the deployment annotation and must be corrected before a release.
- The public runtime could not be independently reached from the current verification environment, so the URL is not declared production-ready.

## Authorization model

The installer does **not** collect a Cloudflare API token or password in its web page. It downloads a local Node.js script which invokes Wrangler's built-in OAuth Device Authorization Grant:

```sh
npx wrangler@4.119.0 login --device --use-keyring --scopes "account:read user:read workers:write workers_scripts:write d1:write"
```

The user reviews and approves the request directly at Cloudflare. Wrangler stores OAuth credentials locally using the operating system credential store/keyring. The installer then asks the user to type `YES` before provisioning. No Cloudflare OAuth credential is sent to the installer Worker. The CLI removes inherited API-token/key/email and account-ID environment overrides from its Wrangler child processes so a shell-level token cannot silently replace the device-flow identity.

Cloudflare documents this device flow and `--use-keyring` in [Wrangler general commands](https://developers.cloudflare.com/workers/wrangler/commands/general/).

### Why browser-only public OAuth is not enabled

Cloudflare's self-managed third-party OAuth clients support Authorization Code (with PKCE for browser/public clients), but not Device Authorization. A public client also requires a verified client URL domain; Cloudflare verifies ownership through a DNS TXT record. This project currently uses only a `workers.dev` hostname and cannot publish a TXT record in that DNS zone. Therefore a public browser-only OAuth client cannot be enabled yet without a domain whose DNS we control. The supported no-domain alternative is the Cloudflare-owned Wrangler Device Flow run locally with OS-keyring storage. See [Create your OAuth client](https://developers.cloudflare.com/fundamentals/oauth/create-an-oauth-client/) and [Wrangler login](https://developers.cloudflare.com/workers/wrangler/commands/general/).

**Important permission limitation:** Cloudflare's [Workers authorization documentation](https://developers.cloudflare.com/workers/authorization/) says Wrangler's OAuth login does not currently support granular authorization. Creating a new Worker requires the Workers product Admin role. Therefore the OAuth grant must be treated as broad account/product access, not a grant limited to one new Worker or one D1 database. The landing page discloses broad Workers/D1 permissions; users must understand and explicitly accept them. Wrangler's `whoami` output does not expose the granted scope list; the Cloudflare consent screen is the authoritative review. The proposed 0.2.7 CLI checks that the active identity is an OAuth token and that credentials are stored in the encrypted OS keyring, but it does not claim to independently verify the granted scope list.

## Local requirements and flow

1. A computer with Node.js 20 or newer and a terminal (Windows, macOS, or Linux).
2. Open the installer page and download/run its local script.
3. Approve Wrangler's device code directly in Cloudflare.
4. Select the target account if multiple accounts are available.
5. Type `YES` to confirm creation.
6. The script downloads templates and checks their SHA-256 hashes, creates randomly named Worker/D1 resources, applies the schema, deploys to `workers.dev`, and checks `/health`.
7. The one-time first-admin code is written to a local `.bootstrap-code` file with restrictive permissions and printed to the terminal. Keep it private and delete it after first admin registration.

An iPhone can approve the device code in a browser, but it cannot run the Wrangler installer by itself. This is a secure local-CLI alternative, not yet the requested browser-only few-button flow. If you enter an Account ID, the installer validates that it is exactly 32 hexadecimal characters before any resource-creation command runs.

## Scope

This installer creates a separate Worker and D1 database for each person who runs it. It does not install Xray/V2Ray or provision a VLESS server. The customer template currently provides first-admin registration/login and basic user records; full proxy/configuration management remains incomplete.

Do not use this preview for real customer data until the end-to-end authorization, deployment, registration, session, and isolation tests in `SECURITY-REVIEW.md` pass.


## Automated installer checks

The GitHub Actions workflow runs static source/security checks, customer Worker integration tests against isolated in-memory D1 databases, and a mocked CLI integration suite. The CLI suite verifies OAuth-only acceptance, encrypted-keyring confirmation, removal of inherited API credential overrides, explicit cancellation, Account ID validation, D1 binding creation, single- or multi-label `workers.dev` URL parsing, health-check handling, and private local bootstrap-code output. It mocks Wrangler and HTTP responses; it does not replace the still-required live test on a separate Cloudflare account.


## 28 November 2026 — v0.2.7 staging version uploaded

- Uploaded the 0.2.7 Worker source as Cloudflare Worker version **13** (62f96f79-aab2-43cc-8219-45869508bb00) from commit 1c3ef531fe2b3dcc59551f106f6258f394b1aa04.
- Created the public version alias staging: https://staging-god-confiqs-installer.zeus-n73k47.workers.dev/
- Enabled Version URLs for the installer Worker only. Its current bindings remain empty.
- **The production/root route was not promoted:** Cloudflare still reports version 11 (v0.2.6.1) at 100% traffic. Version 13 is a staging URL only.
- The version URL uses the installer's existing Worker configuration/resources; it is not an isolated Cloudflare account or separate environment.
- The verification environment could not resolve/fetch the public workers.dev host. Open /health and / in an external browser before promoting the version. Do not treat this preview as production-ready.
