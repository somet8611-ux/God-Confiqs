# GOD CONFIQS

**GOD CONFIQS** is an independent VLESS configuration, customer-management, and business-management platform. The project is built around Cloudflare Workers and D1, with the goal of giving each operator a separate workspace and keeping customer data isolated.

> **Project status:** GOD CONFIQS is under active development. The installer and customer Worker are separate from the Mini App prototype. Features marked as planned are not yet production-ready.

## Quick access

| Resource | Description |
|---|---|
| [Automatic installer](https://god-confiqs-fixed.zeus-n73k47.workers.dev/install) | Start creating a dedicated customer panel |
| [Customer portal](https://god-confiqs-fixed.zeus-n73k47.workers.dev/portal) | Open the installer portal |
| [Mini App source](miniapp/index.html) | Responsive Telegram Mini App / web interface prototype |
| [GitHub repository](https://github.com/somet8611-ux/God-Confiqs) | Source code and project updates |

## What is GOD CONFIQS?

GOD CONFIQS is intended to bring VLESS operations and day-to-day business management into one platform. Each customer/operator should have their own panel, data, settings, and team rather than sharing one common customer database.

The long-term product direction includes:

- Creating and managing VLESS configurations.
- Managing customers, sales, and payment records.
- Providing a personal dashboard for each operator.
- Allowing each operator to customize the panel's language and appearance.
- Allowing each operator to create team members and assign roles.
- Supporting a Telegram Mini App as well as a standalone web experience.
- Keeping each customer's workspace and database separate.

These are product goals; consult the implementation status below before relying on any feature.

## Mini App

The first Mini App interface prototype is located at [`miniapp/index.html`](miniapp/index.html).

### What the current prototype demonstrates

- A responsive dashboard layout for desktop and mobile screens.
- Navigation between Dashboard, Configurations, Customers, Sales, Team, and Settings.
- Demo forms to add and remove VLESS configuration records, customer records, sales records, and team entries.
- Dashboard counters based on the records entered in the browser.
- Persian, English, and Arabic interface options, including right-to-left / left-to-right layout changes.
- Accent-color selection.
- Telegram Web App SDK initialization using `ready()` and `expand()` when the page is opened inside Telegram.

### How to try the prototype

1. Open the [Mini App source file](miniapp/index.html) in GitHub.
2. To run it as a webpage, serve the file from a web host or a local static web server. A GitHub source-code page is not itself the running Mini App.
3. Open the hosted page in a browser. For Telegram testing, configure a Telegram bot's Mini App entry point to use the hosted HTTPS address, then open it from Telegram.
4. Add sample records in the different sections and change the language or accent color in Settings.

### Important prototype limitations

The current Mini App is a **front-end demonstration**, not a production-connected application:

- Its sample records are stored in the browser's `localStorage`; they are not stored in the customer's Cloudflare D1 database.
- It does not yet authenticate a panel owner or verify Telegram `initData` on a trusted server.
- It is not yet connected to the installer, customer Worker APIs, or a bot-pairing flow.
- The displayed configuration/customer/sales/team records are not provisioned or synchronized with a real VLESS server.
- The current interface offers Persian, English, and Arabic only. Additional language support and script-specific font coverage can be added as localization is developed.
- A production PWA setup (web app manifest, service worker, install/offline behavior) has not yet been completed.

Do not use this prototype to store real customer information, passwords, API tokens, UUIDs, or other sensitive configuration data.

## Intended customer journey

The intended end-to-end flow is:

1. An operator opens the GOD CONFIQS installer.
2. The operator authorizes the installation by supplying a Cloudflare API token with the required permissions and selecting an account.
3. The installer creates a dedicated customer Worker and D1 database in that Cloudflare account.
4. The operator opens the new panel URL and completes the initial panel setup.
5. In a future integration, a secure, expiring, single-use pairing code will connect the operator's panel to their Telegram bot / Mini App.
6. The operator manages their own configurations, customers, sales, team, language, and appearance from their workspace.

**Steps 1–4 describe the intended installer workflow. Steps 5–6 are planned integration/product behavior and must not be considered available until implemented and tested.**

## Architecture

| Component | Responsibility |
|---|---|
| `worker.js` | Main GOD CONFIQS application, installer interface, and provisioning API |
| `customer-worker-template.js` | Worker template deployed for an individual customer |
| `miniapp/index.html` | Front-end prototype for Telegram and web |
| `wrangler.toml` | Main application deployment configuration |
| Cloudflare Workers | Run the main application and customer-specific panel Workers |
| Cloudflare D1 | Provide a separate database for each customer installation |

The intended isolation model is one customer Worker and one D1 database per customer installation. The existing `vless-admin-panel` Worker is a separate legacy service and is not the target of this project's customer provisioning workflow.

## What the installer does

The installer is designed to provision a customer's panel inside the Cloudflare account selected by that customer. It creates:

- A dedicated Cloudflare Worker for the customer.
- A separate Cloudflare D1 database for that Worker.
- A customer-specific `workers.dev` address for the panel.

The customer should not need to create database tables or upload the Worker code manually. The installer performs the provisioning steps after the Cloudflare token is verified and an account is selected.

### Install your own panel

1. Open the [GOD CONFIQS Installer](https://god-confiqs-fixed.zeus-n73k47.workers.dev/install).
2. Select **Create pre-configured token**. Cloudflare opens its API Token page with the requested permissions filled in.
3. Review the permissions and account scope, create the token, and copy it.
4. Return to the installer and paste the token. Select **Verify token & load accounts**.
5. Choose the Cloudflare account where you want your panel, then select **Create my dedicated panel**.
6. Wait for the installer to finish creating the D1 database, initializing its tables, uploading the customer Worker, and enabling its `workers.dev` address.
7. Save the panel URL shown by the installer and open it to complete the initial setup.

The exact result depends on the selected Cloudflare account, token permissions, and account-level Workers configuration.

## Cloudflare token permissions

The installer requests the following permissions:

| Permission | Purpose |
|---|---|
| Workers Scripts — Edit | Upload and manage the dedicated customer Worker |
| D1 — Edit | Create and initialize the customer's database |
| Memberships — Read | Read the Cloudflare account memberships available to the token |

Where possible, restrict the token to the intended account. Cloudflare may require the account's `workers.dev` subdomain to be enabled before it can publish the customer Worker.

## VLESS server requirement

The installer creates the customer's dashboard Worker and D1 database. It does **not**:

- Provide a VPS or hosting server.
- Install or operate Xray, V2Ray, or sing-box.
- Create or modify a VLESS inbound on an external server.
- Guarantee that a generated connection will work without a compatible server configuration.

The customer must already have access to a compatible VLESS server and add the relevant client UUIDs to that server's inbound configuration. The current customer template generates VLESS-over-WebSocket links with TLS enabled or disabled; it is not yet a universal subscription manager or server-side provisioning system.

## Feature status

| Feature | Current status |
|---|---|
| Main installer and customer Worker provisioning | Implemented; test with a controlled Cloudflare account before public production use |
| Separate customer Worker and D1 database | Intended provisioning architecture |
| Customer panel initial setup | Available in the customer Worker flow; test in the target account |
| Mini App dashboard and section navigation | Front-end prototype |
| Demo configuration, customer, sales, and team records | Browser-local prototype data only |
| Persian / English / Arabic UI selector | Present in prototype |
| Accent-color selector | Present in prototype |
| Telegram Web App SDK initialization | Present; bot launch configuration and secure identity verification are not complete |
| Secure Telegram bot pairing code | Not implemented |
| Mini App connected to each customer's D1/API | Not implemented |
| Production authentication and role-based team permissions | Not implemented in the Mini App |
| Production PWA manifest, service worker, and offline support | Not implemented |
| Automatic VLESS server provisioning | Not implemented |

## Security recommendations

- Treat your Cloudflare API token like a password. Never share it.
- Never commit tokens, bot tokens, passwords, private keys, or customer secrets to GitHub.
- Use a narrowly scoped token for installation and revoke it when it is no longer needed.
- Keep panel login details private.
- Do not store real credentials or sensitive customer data in the current Mini App prototype.
- Before production Telegram integration, validate Telegram `initData` server-side and use short-lived, single-use pairing codes. Never trust a Telegram user ID supplied only by browser JavaScript.
- Enforce tenant authorization on the server for every customer API request; hiding another customer's data in the UI is not sufficient.

The installer uses the submitted token to make provisioning requests. It is not intended to become a permanently stored customer credential.

## Troubleshooting

**Cloudflare says the token is invalid or inactive**
- Create a new token from the installer's pre-configured token link.
- Check that it was copied completely and has not expired or been revoked.
- Confirm that the requested permissions are present.

**No Cloudflare account appears**
- Confirm that the Cloudflare user has access to an account.
- Check that the token's account scope includes the intended account.

**The Worker address cannot be enabled**
- Open the Cloudflare dashboard for the selected account.
- Enable or configure the account's `workers.dev` subdomain, then retry installation.

**Installation fails**
- Read the error shown by the installer.
- Verify the token permissions and selected account.
- Do not share your token when asking for help; share only the error message with the token removed.

## Contributing

Contributions, bug reports, and suggestions are welcome. Before submitting changes:

1. Explain the problem or proposed improvement.
2. Keep customer data isolation and server-side authorization in mind.
3. Never include real credentials, tokens, UUIDs, or private customer data in commits or issues.
4. Clearly distinguish working features from prototypes and planned features.

## Contact

📩 Creator and collaboration: [@itsmamadhasan](https://t.me/itsmamadhasan)

📢 Official Telegram channel: [t.me/thegodconfigs](https://t.me/thegodconfigs)

---

# 📱 GOD CONFIQS Mobile App (Android / iOS)

The repository also contains an independent Expo + React Native mobile-app development branch. Its goal is to give customers a dedicated mobile experience for their GOD CONFIQS workspace.

## ⬇️ Android APK download

**[Download GOD-CONFIQS-Android-APK.zip](https://github.com/somet8611-ux/God-Confiqs/actions/runs/45233825604/artifacts/14848776864)**

The ZIP contains `app-debug.apk`, an installable Android debug build generated by GitHub Actions.

- Build status: successful
- Approximate ZIP size: 47.2 MiB
- Artifact expiration: 7 December 2026
- Build type: **debug / testing**, not a production-signed release

**Install:** Download the ZIP, extract it, then open `app-debug.apk` on your Android device. Android may ask you to allow installation from that source.

> GitHub Actions artifacts expire and may require repository access. This is a temporary build download, not a permanent public release. For the latest APK, see the [Android build workflow](https://github.com/somet8611-ux/God-Confiqs/actions/workflows/android-apk.yml).

## Mobile app overview

The mobile app is built with Expo, React Native, and TypeScript. The current starter build includes:

- Appwrite email/password registration and sign-in.
- A dark dashboard and navigation shell.
- Configurations, Subscriptions, Devices, and Settings sections.
- English, Persian, and Arabic interface labels.
- An explicit notice that a real Xray-compatible VLESS node is required.

### Mobile app implementation status

The mobile app is an early development build. The configuration, subscription, and device screens are placeholders; dashboard counters are not live statistics. Secure tenant-scoped workspaces, persistent customer data, role-based administration, Telegram pairing, and real VLESS provisioning are not yet complete.

Appwrite authentication is enabled in the mobile client, but authentication alone does not provide tenant isolation. All workspace access and privileged actions must be enforced by trusted server-side code. Never place Appwrite API keys, bot tokens, or other secrets in the app.

### Run the mobile app locally

The app source is on the `expo-mobile-app` branch, under `mobile-app/`.

```bash
git clone https://github.com/somet8611-ux/God-Confiqs.git
cd God-Confiqs
git checkout expo-mobile-app
cd mobile-app
npm install
npx expo start
```

Configure `EXPO_PUBLIC_APPWRITE_ENDPOINT` and `EXPO_PUBLIC_APPWRITE_PROJECT_ID` using `.env.example`, and enable Email/Password authentication in the Appwrite Console. Never add a server API key to an `EXPO_PUBLIC_` variable.

### Build workflow

The [Android APK GitHub Actions workflow](https://github.com/somet8611-ux/God-Confiqs/actions/workflows/android-apk.yml) builds a debug APK when relevant mobile-app files are pushed to `expo-mobile-app`.

The mobile app is a separate development track. It does not connect to or modify the legacy `vless-admin-panel` Worker.

