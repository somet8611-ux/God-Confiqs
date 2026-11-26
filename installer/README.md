# GOD CONFIQS Installer — source snapshot

This folder is a source-controlled snapshot of the deployed `god-confiqs-installer` Worker, retrieved from Cloudflare on **26 November 2026**. It is kept on a separate branch so the existing application branches and Workers are not changed.

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

The user reviews and approves the request directly at Cloudflare. Wrangler stores OAuth credentials locally using the operating system credential store/keyring. The installer then asks the user to type `YES` before provisioning. No Cloudflare OAuth credential is sent to the installer Worker.

Cloudflare documents this device flow and `--use-keyring` in [Wrangler general commands](https://developers.cloudflare.com/workers/wrangler/commands/general/).

**Important permission limitation:** Cloudflare's [Workers authorization documentation](https://developers.cloudflare.com/workers/authorization/) says Wrangler's OAuth login does not currently support granular authorization. Creating a new Worker requires the Workers product Admin role. Therefore the OAuth grant must be treated as broad account/product access, not a grant limited to one new Worker or one D1 database. The landing page discloses broad Workers/D1 permissions; users must understand and explicitly accept them.

## Local requirements and flow

1. A computer with Node.js 20 or newer and a terminal (Windows, macOS, or Linux).
2. Open the installer page and download/run its local script.
3. Approve Wrangler's device code directly in Cloudflare.
4. Select the target account if multiple accounts are available.
5. Type `YES` to confirm creation.
6. The script downloads templates and checks their SHA-256 hashes, creates randomly named Worker/D1 resources, applies the schema, deploys to `workers.dev`, and checks `/health`.
7. The one-time first-admin code is written to a local `.bootstrap-code` file with restrictive permissions and printed to the terminal. Keep it private and delete it after first admin registration.

An iPhone can approve the device code in a browser, but it cannot run the Wrangler installer by itself. This is a secure local-CLI alternative, not yet the requested browser-only few-button flow.

## Scope

This installer creates a separate Worker and D1 database for each person who runs it. It does not install Xray/V2Ray or provision a VLESS server. The customer template currently provides first-admin registration/login and basic user records; full proxy/configuration management remains incomplete.

Do not use this preview for real customer data until the end-to-end authorization, deployment, registration, session, and isolation tests in `SECURITY-REVIEW.md` pass.
