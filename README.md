# GOD CONFIQS

Independent VLESS configuration and customer-management platform built on Cloudflare Workers.

## Project layout
- `worker.js` — current deployed Worker source: admin UI, customer portal, owner accounts UI, and API routes.
- `wrangler.toml` — Worker identity and existing production resource bindings for reproducible deployment.
- `README.md` — project overview.
- `.gitignore` — local-only files and secrets excluded from version control.

## Deployment
The production Worker is named `god-confiqs-fixed`. Cloudflare Workers Builds can deploy this repository on pushes to `main`.

Configure production secrets in Cloudflare separately. Never commit API tokens, passwords, private keys, database credentials, or local `.env` files.

The Wrangler configuration preserves the existing bindings, including the service binding to `vless-admin-panel`. Keep that separate Worker unchanged.

Changes committed here do not deploy until the repository is connected under the Worker Settings → Builds in Cloudflare. After connecting, verify the first build and runtime behavior before relying on automatic deployment.
