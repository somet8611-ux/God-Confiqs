# GOD CONFIQS

Independent VLESS configuration and customer-management platform built on Cloudflare Workers.

## Live links

- **Automatic customer installer:** https://god-confiqs-fixed.zeus-n73k47.workers.dev/install
- **Customer portal:** https://god-confiqs-fixed.zeus-n73k47.workers.dev/portal
- **GitHub repository:** https://github.com/somet8611-ux/God-Confiqs

## Customer installation (automatic)

Each customer creates their own Worker and D1 database in their own Cloudflare account:

1. Open the [GOD CONFIQS Installer](https://god-confiqs-fixed.zeus-n73k47.workers.dev/install).
2. Select **Create pre-configured token**. Cloudflare opens the API Token form with the required permissions preselected.
3. Sign in to Cloudflare if requested, review the permissions and account scope, then create the token.
4. Copy the token from Cloudflare and return to the Installer. Paste it into the token field.
5. Select **Verify token & load accounts**.
6. Choose the Cloudflare account where the panel should be created.
7. Select **Create my dedicated panel**. The installer creates a dedicated D1 database, uploads a separate customer Worker, and enables its `workers.dev` address.
8. Save the resulting panel URL. It belongs to the customer's Cloudflare account.

The installer requests these token permissions: **Workers Scripts: Edit**, **D1: Edit**, and **Memberships: Read**. If the Cloudflare user can access multiple accounts, select or restrict the token to the intended account. Cloudflare may require the customer to enable a `workers.dev` subdomain before the Worker can be published.

**Token safety:** Never send an API token to anyone or commit it to GitHub. The installer uses the submitted token for the provisioning request and does not intentionally save it as a customer setting. Revoke the token in Cloudflare after installation if it is no longer needed.

## Owner / developer deployment

The production Worker is named `god-confiqs-fixed`. To deploy this project from GitHub:

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com/) and select **Workers & Pages**.
2. Connect the repository `somet8611-ux/God-Confiqs` using Workers Builds, with production branch `main`.
3. Set the deploy command to `npx wrangler deploy`. The repository root contains `wrangler.toml`.
4. Keep the D1 and service bindings in `wrangler.toml` configured for the production account. The current main Worker expects `PANEL_AUTH_DB`, `PANEL_DB`, `RECOVERY_DB`, `TENANTS_DB`, and the `PANEL_BACKEND` service binding.
5. Run the first deployment and verify the main site, `/install`, and `/portal`.

Do not copy production database IDs or service bindings into another customer's installation. Customer installations are provisioned separately by the installer.

## Project layout

- `worker.js` — main Worker source: website, admin UI, customer portal, installer UI, and API routes.
- `customer-worker-template.js` — standalone Worker source uploaded for each customer.
- `wrangler.toml` — main Worker identity and production resource bindings.
- `README.md` — project overview and installation instructions.
- `.gitignore` — local-only files and secrets excluded from version control.

## Important notes

- Each successful customer installation creates a separate Worker and D1 database in the selected customer's Cloudflare account.
- The customer Worker template is independent and does not use the main Worker's `PANEL_BACKEND` service binding.
- Keep the existing `vless-admin-panel` Worker unchanged.
- A successful deployment of the main Worker is separate from testing a real customer provisioning flow. Test installation with a controlled Cloudflare account before offering it publicly.
- Never commit API tokens, passwords, private keys, database credentials, or local `.env` files.
