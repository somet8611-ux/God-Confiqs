# GOD CONFIQS — Expo mobile app

Initial Android/iOS app scaffold for GOD CONFIQS. Includes Appwrite email/password authentication, a premium dark dashboard, English/Persian/Arabic labels, and an explicit notice that VLESS provisioning is unavailable until a real Xray-compatible node is connected.

## Configure

1. Copy `.env.example` to `.env` (or configure the same values as Expo environment variables).
2. Confirm Appwrite endpoint and project ID.
3. Enable Email/Password authentication in Appwrite Console.
4. Install dependencies with `npm install`.
5. Run `npx expo start`.

## Build an APK

Run `npm install -g eas-cli`, `eas login`, `eas build:configure`, then `eas build --platform android --profile preview`. The preview profile produces an installable APK.

## Safety and implementation status

- Never put an Appwrite API key in the app. This client uses end-user Appwrite sessions.
- Workspace creation, secure tenant-scoped data access, admin-only operations, and Telegram pairing require trusted Appwrite Functions and server-side authorization before production use.
- Configurations, subscriptions, and device screens are starter placeholders; they do not provision VLESS services.
- Existing Cloudflare Worker `vless-admin-panel` is not modified or connected.
