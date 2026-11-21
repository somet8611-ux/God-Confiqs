# GOD CONFIQS

An independent VLESS configuration and customer-management platform.

## Links

- **Automatic installer:** https://god-confiqs-fixed.zeus-n73k47.workers.dev/install
- **Customer portal:** https://god-confiqs-fixed.zeus-n73k47.workers.dev/portal
- **Source repository:** https://github.com/somet8611-ux/God-Confiqs

## Install your own panel

GOD CONFIQS is designed to create a separate Worker and D1 database in your own Cloudflare account.

1. Open the [GOD CONFIQS Installer](https://god-confiqs-fixed.zeus-n73k47.workers.dev/install).
2. Click **Create pre-configured token**. Cloudflare opens the API Token page with the required permissions preselected.
3. Sign in to Cloudflare if requested. Review the requested permissions and account scope, then create the token.
4. Copy the token and return to the installer.
5. Paste the token and click **Verify token & load accounts**.
6. Select the Cloudflare account where you want your panel.
7. Click **Create my dedicated panel** and wait for setup to finish.
8. Save your new panel URL. Your Worker and database are created in the selected Cloudflare account.

### Required Cloudflare permissions

The installer requests:

- **Workers Scripts — Edit**
- **D1 — Edit**
- **Memberships — Read**

If your Cloudflare login has access to multiple accounts, make sure the token is scoped to the account where you want the panel created. Cloudflare may ask you to enable a `workers.dev` subdomain before publishing your Worker.

### Keep your token safe

- Never share your API token with anyone or publish it.
- Do not paste your token into GitHub, public messages, or support chats.
- The installer uses the token to perform setup; it is not intended to be stored as your panel credential.
- Once installation is complete, revoke the temporary token in Cloudflare if you no longer need it.

## Project files

- `worker.js` — application and installer source.
- `customer-worker-template.js` — source used to create each customer's separate Worker.
- `wrangler.toml` — deployment configuration.
