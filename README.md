# GOD CONFIQS

Independent VLESS configuration and customer-management platform built on Cloudflare Workers.

## Project layout
- `worker.js` — current deployed Worker source: admin UI, customer portal, owner accounts UI, and API routes.
- `README.md` — project overview.
- `.gitignore` — local-only files and secrets excluded from version control.

## Deployment
The production Worker is named `god-confiqs-fixed`. Configure production bindings and secrets in Cloudflare separately. Never commit API tokens, passwords, private keys, database credentials, or local `.env` files.

Required bindings currently used:
- `PANEL_AUTH_DB`
- `PANEL_BACKEND` (service binding to the existing `vless-admin-panel`)
- `PANEL_DB`
- `RECOVERY_DB`
- `TENANTS_DB`

Keep `vless-admin-panel` unchanged. This repository contains only the GOD CONFIQS Worker source.

Changes committed here do not automatically deploy to Cloudflare; a deployment workflow must be configured and tested separately.
