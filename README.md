# GOD CONFIQS

**An independent platform for VLESS configuration management, customer workspaces, and business operations.**

GOD CONFIQS is being developed around Cloudflare Workers and D1, with a separate workspace and database for each operator. The project also includes a Telegram/web Mini App prototype and an Expo-based Android/iOS app.

> **Development status:** GOD CONFIQS is under active development. The installer/customer Worker, Mini App prototype, and mobile app are separate parts of the project with different implementation status. Read the status notes below before using any feature with real customer data.

## Quick links

| Resource | What it is |
|---|---|
| [Open the independent installer preview](https://god-confiqs-installer.zeus-n73k47.workers.dev/) | Wrangler OAuth Device Flow installer; desktop CLI preview only |
| [Installer source and security review](https://github.com/somet8611-ux/God-Confiqs/tree/installer-hardening-2026-11-27/installer) | Current preview source; not a production release |
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
| Independent installer preview | Available on workers.dev; desktop CLI preview, not production-ready |
| Dedicated customer Worker and D1 database | Provisioning code is implemented; fresh-account end-to-end test is pending |
| Customer panel initial setup | One-time first-admin bootstrap prototype; full VLESS management is incomplete |
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

- A Cloudflare account you own and control.
- A Windows, macOS, or Linux computer with Node.js 20 or newer.
- Permission to create Workers (Workers product Admin) and create D1 databases.
- An enabled Cloudflare `workers.dev` subdomain for the selected account.
- A phone or computer browser to approve Wrangler's device code. The phone can approve the code but cannot run this CLI installer by itself.

### Installation steps

1. Open the [GOD CONFIQS Installer preview](https://god-confiqs-installer.zeus-n73k47.workers.dev/).
2. Download `god-confiqs-installer.mjs`.
3. Open a terminal in the download folder and run `node god-confiqs-installer.mjs`.
4. Wrangler displays a Cloudflare Device Authorization code. Open the official Cloudflare verification page and review the permissions shown there before approving.
5. Select the intended account (if prompted) and type `YES` only after reviewing the account and broad permissions.
6. The CLI creates uniquely named new Worker and D1 resources, applies the schema, adds the D1 binding, deploys to `workers.dev`, and checks the panel's `/health` endpoint.
7. Keep the one-time first-admin code in the local `.bootstrap-code` file private. Delete it after the first administrator account is created.

The website never asks for an API Token or Cloudflare password. Do not paste tokens into the installer or send them to anyone.

### Authorization model and limitations

The installer uses Wrangler's built-in OAuth Device Authorization Grant. Credentials are stored by Wrangler in the operating system keychain/credential store through `--use-keyring`. The CLI also strips inherited Cloudflare API-token/key/email and account-ID environment overrides before invoking Wrangler.

Requested scopes are `account:read`, `user:read`, `workers:write`, `workers_scripts:write`, and `d1:write`; Wrangler adds `offline_access` for token refresh. Wrangler OAuth does **not** currently support granular resource authorization. Creating a new Worker requires Workers product Admin access, and the D1 write scope is not limited to one database. This is broad account/product access, not a per-resource grant. The installer is designed to create only new randomly named resources and has no delete/overwrite path, but that application safeguard is not a Cloudflare permission boundary.

Wrangler's `whoami` command confirms the OAuth token type and encrypted credential storage; it does not return the granted scope list. The Cloudflare consent screen is the authoritative place to review permissions. Cancel if the displayed access is broader than you accept.

This is a desktop CLI preview, not a browser-only or phone-only installer. Public OAuth for GOD CONFIQS has not been approved or implemented. Do not use this preview with real customer data until the external-account, authorization, registration, isolation, deployment, and generated-link tests pass.
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
- The current installer preview does not collect or store Cloudflare API tokens; it uses Wrangler Device OAuth and the OS keyring. Its OAuth permissions are broad and must be reviewed directly on Cloudflare's consent screen.
- Use a narrowly scoped Cloudflare token and revoke it when it is no longer needed.
- Do not place server API keys in mobile-app code or `EXPO_PUBLIC_` environment variables.
- Do not store real credentials or sensitive customer data in the current Mini App prototype.
- Validate Telegram `initData` on the server before trusting a Telegram identity.
- Use short-lived, single-use pairing codes for a future Telegram pairing flow.
- Enforce tenant authorization on the server for every customer API request. Hiding another customer's data in the UI is not sufficient.

The installer does not receive or store a submitted Cloudflare API token. Wrangler performs OAuth locally and keeps credentials in the OS keyring. The installer preview still needs fresh-account end-to-end testing and is not production-ready.

## Troubleshooting

**Wrangler cannot store credentials securely**
- On Linux, install the supported `secret-tool` / libsecret keyring dependency and retry.
- On macOS, allow access to the system Keychain. On Windows, allow Wrangler to install its small Credential Manager binding.

**The device code expires**
- Run the installer again and approve the new code within the five-minute window.

**Cloudflare reports insufficient permissions**
- Review the requested scopes on the Cloudflare consent screen.
- Creating a new Worker requires Workers product Admin access, and D1 creation requires D1 write access. Cancel if you do not accept the breadth of access.

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
