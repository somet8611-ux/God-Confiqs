# GOD CONFIQS

<p align="center">
  <strong>Your private workspace for VLESS management.</strong><br />
  An independent mobile-app foundation for account access, configuration management, subscriptions, and connected devices.
</p>

<p align="center">
  <a href="https://github.com/somet8611-ux/God-Confiqs/actions/workflows/android-apk.yml"><img alt="Android APK build" src="https://github.com/somet8611-ux/God-Confiqs/actions/workflows/android-apk.yml/badge.svg?branch=expo-mobile-app" /></a>
  <img alt="Platform" src="https://img.shields.io/badge/platform-Android%20%7C%20iOS-3B82F6" />
  <img alt="Framework" src="https://img.shields.io/badge/built%20with-Expo%20%2B%20React%20Native-111827" />
  <img alt="Status" src="https://img.shields.io/badge/status-early%20development-orange" />
</p>

---

## 📥 Download the Android app

<blockquote>
  <h3>GOD CONFIQS — Android APK package</h3>
  <p>The ZIP contains the installable Android debug APK produced by the project's GitHub Actions build.</p>
  <p><a href="https://github.com/somet8611-ux/God-Confiqs/actions/runs/45233825604/artifacts/14848776864"><strong>⬇️ Download GOD-CONFIQS-Android-APK.zip</strong></a></p>
  <ul>
    <li>Build: successful GitHub Actions run #4</li>
    <li>Package: <code>app-debug.apk</code> inside the ZIP</li>
    <li>ZIP size: approximately 47.2 MiB</li>
    <li>Artifact availability: until 7 December 2026</li>
    <li>Type: debug build for testing — not a signed production release</li>
  </ul>
  <p><strong>Install:</strong> Download the ZIP, extract it, then open <code>app-debug.apk</code> on your Android device. Android may ask you to allow installation from that source.</p>
</blockquote>

> **Important:** GitHub Actions artifacts expire. This download is tied to the build above and may require access to this repository. A permanent public release will be published separately when a production-ready APK is available.

To see the build details or find a newer build, visit [Android APK workflow runs](https://github.com/somet8611-ux/God-Confiqs/actions/workflows/android-apk.yml).

---

## ✨ What is GOD CONFIQS?

GOD CONFIQS is an independent project aiming to make VLESS service management easier for operators and their customers. The product direction is a personal workspace where each account can eventually manage its own configurations, subscriptions, devices, and related service data.

The project is being developed as a separate platform. It is **not a skin or remote-control interface for the legacy `vless-admin-panel`**, and this mobile app does not connect to or modify that Worker.

### Product goals

- **Personal accounts:** create an account and sign in securely.
- **Private workspaces:** give each customer an isolated place for their own data.
- **VLESS management:** create, organize, and manage connection configurations.
- **Subscriptions:** view and manage service plans and expiry information.
- **Device management:** see and manage devices associated with an account.
- **Multi-language interface:** English, Persian, and Arabic, with right-to-left support planned throughout the experience.
- **Independent infrastructure:** keep the platform separate from existing panels and customer systems.

These are the intended product capabilities. The implementation status below distinguishes what works today from what is still planned.

---

## 📱 Current mobile app

The Android/iOS app is built with **Expo, React Native, and TypeScript**. It uses Appwrite for email/password account authentication.

### Available in the current build

| Area | Current implementation |
|---|---|
| Account registration | Appwrite email/password account creation |
| Sign in / sign out | Appwrite email/password sessions |
| Dashboard | Starter dashboard with account status and placeholder counters |
| Navigation | Dashboard, Configurations, Subscriptions, Devices, and Settings |
| Languages | English, Persian, and Arabic labels |
| Account settings | Displays the signed-in account and language selector |
| VLESS readiness notice | Clearly indicates that a compatible VLESS node is required |

### Still under development

- Real workspace creation and tenant isolation.
- Persistent configuration, subscription, and device records.
- Live dashboard metrics and customer data.
- Secure role-based access and admin operations.
- Telegram account linking and bot pairing.
- Connection to a real Xray-compatible VLESS server.
- Production Android signing and a production iOS build.

The Configurations, Subscriptions, and Devices areas are currently starter placeholders. The dashboard's counters are not live service statistics.

---

## 🧱 Architecture and technology

| Layer | Technology | Purpose |
|---|---|---|
| Mobile application | Expo + React Native | Android/iOS app foundation |
| Language | TypeScript | App implementation |
| Authentication | Appwrite Account API | End-user email/password sessions |
| Backend direction | Appwrite Functions / secured APIs | Planned trusted operations and tenant authorization |
| VLESS data plane | Xray-compatible server | Required for real VLESS connections; not provisioned by this app |
| Android build | GitHub Actions + Gradle | Automated debug APK build |

### Important separation of responsibilities

The mobile app currently authenticates users through Appwrite. Authentication alone does not create a secure multi-tenant backend. Before customer data features are enabled, trusted server-side functions must enforce workspace membership and authorization on every request.

The app does not currently create VLESS inbounds, install Xray, provide a VPS, or provision a working VPN node. A compatible server and a secure provisioning integration are separate requirements.

---

## 🚀 Run the app locally

### Requirements

- Node.js (use an active LTS release)
- npm
- Android Studio / Android SDK for local Android builds, or Expo Go for supported development testing
- An Appwrite project with Email/Password authentication enabled

### 1. Get the source

```bash
git clone https://github.com/somet8611-ux/God-Confiqs.git
cd God-Confiqs/mobile-app
```

If you are working on the mobile development branch:

```bash
git checkout expo-mobile-app
```

### 2. Configure Appwrite

Copy the example environment file:

```bash
cp .env.example .env
```

Set the public project configuration:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=YOUR_APPWRITE_PROJECT_ID
```

Then, in the Appwrite Console:

1. Open the project referenced by your environment variables.
2. Enable the Email/Password authentication method.
3. Add the app's development and production platforms as required by Appwrite.

The endpoint and project ID are client configuration values. **Never put an Appwrite API key or other server secret in the mobile app or an `EXPO_PUBLIC_` variable.**

### 3. Install dependencies and start Expo

```bash
npm install
npx expo start
```

Use the Expo terminal instructions to open the app in a supported simulator or development environment.

### 4. Type-check

```bash
npm run typecheck
```

---

## 🤖 Build an Android APK with GitHub Actions

The repository includes [`.github/workflows/android-apk.yml`](.github/workflows/android-apk.yml).

The workflow runs when relevant files in `mobile-app/**` or the workflow itself change on the `expo-mobile-app` branch. It:

1. Checks out the repository.
2. Sets up Node.js and Java.
3. Installs the JavaScript dependencies.
4. Generates the Android native project with Expo Prebuild.
5. Runs Gradle's `assembleDebug` task.
6. Uploads `app-debug.apk` as the `god-confiqs-android-apk` workflow artifact.

[View build history](https://github.com/somet8611-ux/God-Confiqs/actions/workflows/android-apk.yml).

The current downloadable package is a **debug APK**. It is useful for installation and testing, but it is not a production-signed release and should not be treated as ready for public distribution.

---

## 🔐 Security principles

Security and customer isolation are core requirements for the planned platform.

- Never commit API keys, bot tokens, passwords, private keys, or customer credentials.
- Never embed an Appwrite server API key in the app.
- Enforce tenant/workspace access on trusted server-side code, not only in the UI.
- Verify Telegram Web App identity on the server before trusting account identity.
- Use short-lived, single-use pairing tokens for future Telegram linking.
- Validate and authorize every request that reads or changes customer data.
- Do not use the current placeholder screens to store real VLESS credentials or sensitive customer information.

---

## 🗺️ Development roadmap

- [x] Establish the Expo / React Native app foundation.
- [x] Add Appwrite email/password authentication.
- [x] Add the first dashboard and navigation structure.
- [x] Add English, Persian, and Arabic interface labels.
- [x] Automate Android debug APK builds with GitHub Actions.
- [ ] Implement secure workspace creation and tenant membership.
- [ ] Connect configurations, subscriptions, and devices to persistent storage.
- [ ] Add server-side authorization and role management.
- [ ] Implement secure Telegram linking and bot pairing.
- [ ] Integrate with a compatible VLESS node for real provisioning.
- [ ] Prepare signed production builds and release distribution.

---

## 📁 Repository layout

```text
God-Confiqs/
├── .github/
│   └── workflows/
│       └── android-apk.yml     # Automated Android APK build
├── mobile-app/
│   ├── App.tsx                 # Main React Native application
│   ├── app.json                # Expo app configuration
│   ├── eas.json                # EAS build profiles
│   ├── package.json            # Dependencies and scripts
│   └── src/
│       ├── appwrite.ts         # Appwrite client and account API
│       └── i18n.ts             # English / Persian / Arabic strings
└── README.md
```

---

## 🤝 Contributing

Ideas, bug reports, and contributions are welcome.

1. Describe the issue or improvement clearly.
2. Keep changes focused and document new setup requirements.
3. Never include secrets or real customer data in commits or screenshots.
4. Mark unfinished functionality honestly; do not present mock data as live service data.
5. Test authentication, language direction, and tenant authorization when changing those areas.

---

## 📬 Community

- Telegram contact: [@itsmamadhasan](https://t.me/itsmamadhasan)
- Telegram channel: [t.me/thegodconfigs](https://t.me/thegodconfigs)

---

<p align="center">
  <strong>GOD CONFIQS</strong><br />
  <sub>Independent by design. Built for private workspaces.</sub>
</p>
