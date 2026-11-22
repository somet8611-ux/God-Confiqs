# GOD CONFIQS

**GOD CONFIQS** is an independent VLESS panel and customer-management project built around Cloudflare Workers and D1. Its installer is designed to create a separate Worker and database in each customer's own Cloudflare account.

## Quick access

| Page | Link |
|---|---|
| Automatic installer | [Open Installer](https://god-confiqs-fixed.zeus-n73k47.workers.dev/install) |
| Customer portal | [Open Customer Portal](https://god-confiqs-fixed.zeus-n73k47.workers.dev/portal) |
| Mini App prototype source | [miniapp/index.html](miniapp/index.html) |
| Source code | [GitHub repository](https://github.com/somet8611-ux/God-Confiqs) |

## Mini App prototype

The initial responsive Mini App interface is in `miniapp/index.html`. It includes dashboard, VLESS configuration, customer, sales, team, language, and theme screens. It uses Vazirmatn for Persian, Inter/Noto Sans for English, and Noto Sans Arabic for Arabic. Telegram Web App SDK initialization is included.

**Prototype limitation:** this is a front-end prototype using browser local storage for sample data. It is not yet connected to customer D1 databases, secure authentication, the installer-issued bot access code, or production VLESS provisioning. Do not use it to store real customer credentials or configuration secrets.

## What the installer does

The installer provisions a customer's panel inside the Cloudflare account selected by that customer. It is intended to create:

- A dedicated Cloudflare Worker for the customer.
- A separate Cloudflare D1 database for that Worker.
- A customer-specific `workers.dev` address to open the panel.

The customer does not need to create database tables or upload Worker code manually. The installer performs those provisioning steps after the Cloudflare token is verified and the account is selected.

## VLESS server requirement

The installer creates the customer's dashboard Worker and D1 database; it does **not** create a VPS, deploy Xray/V2Ray/sing-box, or change an existing VLESS server. The customer must already have a compatible VLESS server and add each generated UUID to that server's inbound configuration before the connection can work. The current customer template generates VLESS-over-WebSocket connection links with TLS enabled or disabled; it is not yet a universal subscription manager or a server-side provisioning system.

## Install your own panel

### 1. Open the installer

Go to the [GOD CONFIQS Installer](https://god-confiqs-fixed.zeus-n73k47.workers.dev/install).

### 2. Create a pre-configured Cloudflare API token

Click **Create pre-configured token**. Cloudflare opens its API Token page with the permissions requested by the installer already filled in.

Sign in if Cloudflare asks you to. Review the permissions and account scope, then create the token. Cloudflare displays the token after creation.

### 3. Copy and verify the token

Copy the token from Cloudflare, return to the installer, and paste it into the token field. Click **Verify token & load accounts**.

The installer checks that the token is active and retrieves the Cloudflare accounts it can access. If you have access to multiple accounts, make sure you choose the correct one.

### 4. Create your panel

Choose the Cloudflare account where you want the panel, then click **Create my dedicated panel**.

The installer creates a D1 database, initializes its tables, uploads the customer Worker, and enables its `workers.dev` address. Wait for the success message rather than closing the page during setup.

### 5. Save your panel address

When installation finishes, copy the panel URL shown on the result screen and keep it somewhere safe. Open that URL to access your dedicated panel and complete its initial setup.

## Cloudflare token permissions

The pre-configured token requests these permissions:

| Permission | Why it is needed |
|---|---|
| Workers Scripts — Edit | Upload and manage the dedicated customer Worker |
| D1 — Edit | Create and initialize the customer's database |
| Memberships — Read | Read the Cloudflare account memberships available to the token |

If your Cloudflare login has access to several accounts, restrict the token to the intended account where possible and select that same account in the installer. Cloudflare may require you to enable a `workers.dev` subdomain before it can publish the new Worker.

## Security recommendations

- Treat the API token like a password. Do not share it with anyone.
- Never paste the token into GitHub, public messages, screenshots, or support chats.
- Use the token only for the installation process.
- After installation, revoke the temporary token in Cloudflare if you no longer need it.
- Keep your panel login details private.

The installer uses the submitted token to make the provisioning requests. It is not intended to become a stored customer credential.

## Troubleshooting

**Cloudflare says the token is invalid or inactive**
- Create a new token from the installer's pre-configured token link.
- Check that the token was copied completely and has not expired or been revoked.
- Confirm that the requested permissions are present.

**No Cloudflare account appears**
- Confirm that the Cloudflare user has access to an account.
- Check that the token's account scope includes the account you want to use.
- Create a replacement token with the correct account scope if necessary.

**The Worker address cannot be enabled**
- Open the Cloudflare dashboard for the selected account.
- Enable or configure the account's `workers.dev` subdomain, then retry installation.

**Installation fails**
- Read the error shown by the installer.
- Verify the token permissions and selected account.
- Do not share your token when asking for help; share only the error message with the token removed.

## Project files

- `worker.js` — main application, installer interface, and provisioning API.
- `customer-worker-template.js` — standalone Worker template deployed for each customer.
- `miniapp/index.html` — initial Telegram Mini App / responsive web interface prototype.
- `wrangler.toml` — configuration for the main application deployment.

## Important

Each customer installation is intended to have its own Worker and D1 database in the customer's selected Cloudflare account. A customer's panel resources are separate from the main GOD CONFIQS application resources.

The installer does not yet issue a secure Telegram bot pairing code or automatically connect the Mini App to each newly installed customer panel. That integration must be implemented and tested before it is described as available.

The installer and customer provisioning flow should be tested with a controlled Cloudflare account before being offered as a public production service.

## Contact

📩 For collaboration opportunities and further information, please contact the creator: @itsmamadhasan

📢 Join our official Telegram channel for updates and announcements: ⬇️

https://t.me/thegodconfigs