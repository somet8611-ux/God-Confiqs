# GOD CONFIQS

**An independent platform for VLESS configuration management, customer workspaces, and business operations.**

GOD CONFIQS is being developed around Cloudflare Workers and D1, with a separate workspace and database for each operator. The project also includes a Telegram/web Mini App prototype and an Expo-based Android/iOS app.

> **Development status:** GOD CONFIQS is under active development. The installer/customer Worker, Mini App prototype, and mobile app are separate parts of the project with different implementation status. Read the status notes below before using any feature with real customer data.

## Quick links

| Resource | What it is |
|---|---|
| [Open the installer](https://god-confiqs-fixed.zeus-n73k47.workers.dev/install) | Create a dedicated customer panel in your Cloudflare account |
| [Open the customer portal](https://god-confiqs-fixed.zeus-n73k47.workers.dev/portal) | Installer portal |
| [Mini App prototype](miniapp/index.html) | Telegram/web interface source |
| [Android APK download](https://github.com/somet8611-ux/God-Confiqs/actions/runs/45233825604/artifacts/14848776864) | Download the current Android debug-build ZIP |
| [Android build workflow](https://github.com/somet8611-ux/God-Confiqs/actions/workflows/android-apk.yml) | Build history and latest APK artifact |
| [Mobile app source](https://github.com/somet8611-ux/God-Confiqs/tree/expo-mobile-app/mobile-app) | Expo app on the `expo-mobile-app` branch |
| [GitHub repository](https://github.com/somet8611-ux/God-Confiqs) | Source code and project updates |

## Contents

- [Project vision](#project-vision)
- [Current implementation status](#current-implementation-status)
- [Create your own panel](#create-your-own-panel)
- [Architecture](#architecture)
- [VLESS server requirements](#vless-server-requirements)
- [Mini App prototype](#mini-app-prototype)
- [Mobile app](#mobile-app)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Project vision

The goal is to give every operator an independent workspace instead of putting all customers into one shared panel. The planned platform brings together:

- VLESS configuration and subscription management.
- Customer, sales, and payment records.
- A personal dashboard for each operator.
- Workspace language and appearance settings.
- Team members and role-based access.
- Telegram Mini App and standalone web access.
- Separate customer data and databases.

These are product goals, not a claim that every feature is already available.

## Current implementation status

| Component / feature | Status |
|---|---|
| Main installer and customer Worker provisioning | Implemented; test with a controlled Cloudflare account before production use |
| Dedicated customer Worker and D1 database | Installer's intended provisioning architecture |
| Customer panel initial setup | Available in the customer Worker flow; verify in the target account |
| Mini App navigation and dashboard UI | Front-end prototype |
| Mini App demo records | Stored in browser `localStorage` only |
| Persian, English, and Arabic Mini App labels | Present in prototype |
| Telegram Web App SDK initialization | Present; secure identity verification is not complete |
| Expo mobile app shell and Appwrite email/password auth | Present in development build |
| Mobile configuration, subscription, and device screens | Placeholder screens |
| Persistent tenant-scoped mobile workspaces | Not implemented |
| Secure Telegram pairing | Not implemented |
| Production role-based administration | Not implemented in the Mini App/mobile app |
| Production PWA/offline support | Not implemented |
| Automatic VLESS server/Xray provisioning | Not implemented |

## Create your own panel

The installer is designed to create a dedicated customer Worker and D1 database in the Cloudflare account you select.

### Before you start

- A Cloudflare account.
- Permission to create and manage Workers and D1 resources in that account.
- A narrowly scoped Cloudflare API token with the permissions listed below.

### Installation steps

1. Open the [GOD CONFIQS Installer](https://god-confiqs-fixed.zeus-n73k47.workers.dev/install).
2. Select **Create pre-configured token**. Cloudflare opens its API Token page with the requested permissions filled in.
3. Review the permissions and account scope, create the token, and copy it.
4. Return to the installer, paste the token, and select **Verify token & load accounts**.
5. Select the Cloudflare account where you want your panel.
6. Select **Create my dedicated panel**.
7. Wait while the installer creates the D1 database, initializes its tables, uploads the customer Worker, and enables its `workers.dev` address.
8. Save the panel URL and open it to complete the initial setup.

The result depends on the selected Cloudflare account, token permissions, and account-level Workers configuration. The account's `workers.dev` subdomain may need to be enabled in Cloudflare.

### Required Cloudflare token permissions

| Permission | Purpose |
|---|---|
| Workers Scripts — Edit | Upload and manage the dedicated customer Worker |
| D1 — Edit | Create and initialize the customer's database |
| Memberships — Read | Read the Cloudflare account memberships available to the token |

Restrict the token to the intended account wherever possible. Treat it like a password and revoke it when it is no longer needed.

## Architecture

| File / service | Responsibility |
|---|---|
| `worker.js` | Main GOD CONFIQS application, installer interface, and provisioning API |
| `customer-worker-template.js` | Worker template deployed for an individual customer |
| `miniapp/index.html` | Telegram/web Mini App front-end prototype |
| `wrangler.toml` | Main application deployment configuration |
| Cloudflare Workers | Run the main application and customer-specific panel Workers |
| Cloudflare D1 | Separate database for each customer installation |

The intended isolation model is one customer Worker and one D1 database per customer installation. The existing `vless-admin-panel` is a separate legacy service and is not part of this project's customer provisioning workflow.

## VLESS server requirements

The installer provisions the customer's dashboard Worker and D1 database. It does **not**:

- Provide a VPS or hosting server.
- Install or operate Xray, V2Ray, or sing-box.
- Create or modify a VLESS inbound on an external server.
- Guarantee a connection will work without a compatible server configuration.

You must already have access to a compatible VLESS server and configure the relevant client UUIDs on that server. The current customer template generates VLESS-over-WebSocket links with TLS enabled or disabled; it is not yet a universal subscription manager or an automatic server-provisioning system.

## Mini App prototype

The first Telegram/web Mini App interface is in [`miniapp/index.html`](miniapp/index.html).

### What it demonstrates

- Responsive desktop and mobile dashboard layout.
- Dashboard, Configurations, Customers, Sales, Team, and Settings navigation.
- Demo forms for configuration, customer, sales, and team records.
- Dashboard counters based on records entered in the browser.
- Persian, English, and Arabic interface options with RTL/LTR layout changes.
- Accent-color selection.
- Telegram Web App SDK initialization with `ready()` and `expand()` when opened inside Telegram.

### Try the prototype

1. Open [`miniapp/index.html`](miniapp/index.html) in the repository.
2. Serve the file from a web host or local static web server. The GitHub source page itself is not a running Mini App.
3. Open the hosted page in a browser.
4. For Telegram testing, configure a bot's Mini App entry point to use the hosted HTTPS URL, then launch it from Telegram.
5. Add sample records and try the language and appearance settings.

### Prototype limitations

This is a **front-end demonstration**, not a production-connected customer application:

- Sample records are stored in browser `localStorage`, not in a customer's Cloudflare D1 database.
- It does not authenticate a panel owner or verify Telegram `initData` on a trusted server.
- It is not connected to the installer, customer Worker APIs, or a bot-pairing flow.
- Records are not provisioned or synchronized with a real VLESS server.
- A production PWA manifest, service worker, install flow, and offline behavior have not been completed.

Do not use the prototype to store real customer information, passwords, API tokens, UUIDs, or other sensitive data.

## Mobile app

The repository also contains an Expo + React Native + TypeScript mobile app on the `expo-mobile-app` branch. It is intended to provide a dedicated mobile experience for each operator's GOD CONFIQS workspace.

### Android APK

**[Download GOD-CONFIQS-Android-APK.zip](https://github.com/somet8611-ux/God-Confiqs/actions/runs/45233825604/artifacts/14848776864)**

The ZIP contains `app-debug.apk`, generated by GitHub Actions.

- Build: successful
- ZIP size: approximately 47.2 MiB
- Artifact expiration: **7 December 2026**
- Build type: **debug/testing**, not a production-signed release

**Install:** Download and extract the ZIP, then open `app-debug.apk` on your Android device. Android may ask you to allow installation from that source.

GitHub Actions artifacts are temporary and may require repository access. For a newer build, check the [Android build workflow](https://github.com/somet8611-ux/God-Confiqs/actions/workflows/android-apk.yml).

### Current mobile app features

- Appwrite email/password registration and sign-in.
- Dark dashboard and navigation shell.
- Configurations, Subscriptions, Devices, and Settings sections.
- English, Persian, and Arabic interface labels.
- Notice that a real Xray-compatible VLESS node is required.

The configuration, subscription, and device screens are currently placeholders, and dashboard counters are not live statistics. Persistent tenant-scoped workspaces, role-based administration, Telegram pairing, and real VLESS provisioning are not yet complete.

Appwrite authentication alone does not provide tenant isolation. Workspace access and privileged actions must be enforced by trusted server-side code.

### Run the mobile app locally

The source is in `mobile-app/` on the `expo-mobile-app` branch:

```bash
git clone https://github.com/somet8611-ux/God-Confiqs.git
cd God-Confiqs
git checkout expo-mobile-app
cd mobile-app
npm install
npx expo start
```

Configure `EXPO_PUBLIC_APPWRITE_ENDPOINT` and `EXPO_PUBLIC_APPWRITE_PROJECT_ID` using the provided `.env.example`, and enable Email/Password authentication in the Appwrite Console. Never put a server API key in an `EXPO_PUBLIC_` variable.

### Build the Android app

The [Android APK GitHub Actions workflow](https://github.com/somet8611-ux/God-Confiqs/actions/workflows/android-apk.yml) builds a debug APK when relevant mobile-app files are pushed to `expo-mobile-app`.

The mobile app is a separate development track. It does not connect to or modify the legacy `vless-admin-panel` Worker.

## Security

- Treat Cloudflare API tokens, Appwrite server keys, bot tokens, passwords, and private keys as secrets. Never commit them to GitHub.
- Use a narrowly scoped Cloudflare token and revoke it when it is no longer needed.
- Do not place server API keys in mobile-app code or `EXPO_PUBLIC_` environment variables.
- Do not store real credentials or sensitive customer data in the current Mini App prototype.
- Validate Telegram `initData` on the server before trusting a Telegram identity.
- Use short-lived, single-use pairing codes for a future Telegram pairing flow.
- Enforce tenant authorization on the server for every customer API request. Hiding another customer's data in the UI is not sufficient.

The installer uses the submitted Cloudflare token to make provisioning requests; it is not intended to become a permanently stored customer credential.

## Troubleshooting

**The installer says the Cloudflare token is invalid or inactive**
- Create a fresh token using the installer's pre-configured token link.
- Check that it was copied completely and has not expired or been revoked.
- Confirm that the required permissions are present.

**No Cloudflare account appears**
- Confirm that your Cloudflare user has access to an account.
- Check that the token's account scope includes the intended account.

**The customer Worker address cannot be enabled**
- Open the Cloudflare dashboard for the selected account.
- Enable or configure the account's `workers.dev` subdomain, then retry.

**Installation fails**
- Read the error displayed by the installer.
- Verify the token permissions and selected account.
- Never share your token when asking for help; share only the error message with the token removed.

## Contributing

Bug reports, suggestions, and contributions are welcome.

1. Explain the problem or proposed improvement.
2. Preserve customer data isolation and server-side authorization.
3. Never include real credentials, tokens, UUIDs, or private customer data in commits or issues.
4. Clearly label working features, prototypes, and planned features.

## Contact

- Creator and collaboration: [@itsmamadhasan](https://t.me/itsmamadhasan)
- Official Telegram channel: [t.me/thegodconfigs](https://t.me/thegodconfigs)
