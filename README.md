# GOD CONFIQS

Independent VLESS configuration and customer-management platform built on Cloudflare Workers.

## Project layout

- `worker.js` — Cloudflare Worker entry point, admin UI, customer portal, owner accounts UI, and API routes.
- `README.md` — project overview.
- `.gitignore` — local-only files and secrets excluded from version control.

## Deployment notes

The production Worker is currently named `god-confiqs-fixed`.

Configure production bindings and secrets in Cloudflare separately. Never commit API tokens, passwords, private keys, database credentials, or local `.env` files.

Required Worker bindings currently used by the source:
- `PANEL_AUTH_DB`
- `PANEL_BACKEND` (service binding to the existing `vless-admin-panel`)
- `PANEL_DB`
- `RECOVERY_DB`
- `TENANTS_DB`

Keep the existing `vless-admin-panel` Worker unchanged. This repository contains the GOD CONFIQS Worker source only.

## Important

The source snapshot is copied from the current deployed Worker. Changes committed here do not automatically deploy to Cloudflare until a deployment workflow is deliberately configured and tested.
