# GOD CONFIQS PWA preview

This directory is a UI-only Progressive Web App preview of the existing Mini App prototype.

## Included

- Web App Manifest with standalone display, app name, start URL, and icon.
- Service worker that caches the app shell and serves the last cached screen when offline.
- iPhone/iPad installation guidance inside the app.
- No account registration, cloud sync, real customer records, or production API integration.

## Publish a preview with GitHub Pages

The workflow `.github/workflows/pwa-preview.yml` deploys this directory to GitHub Pages when the `pwa-preview` branch changes.

If GitHub Pages has not been enabled for the repository yet:

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, select **GitHub Actions** as the source.
3. Open the **Actions** tab and check the **GOD CONFIQS PWA Preview** workflow.
4. After a successful deployment, the workflow's deployment environment shows the preview URL.

The expected project-site URL is `https://somet8611-ux.github.io/God-Confiqs/`, provided Pages is enabled and the workflow completes successfully.

## Install on iPhone

1. Open the deployed HTTPS URL in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**.
4. Keep **Open as Web App** enabled, then tap **Add**.

## Install on Android

Open the HTTPS URL in Chrome and use **Install app** or **Add to Home screen** from the browser menu.

## Important demo-data warning

The existing prototype uses browser `localStorage`. Test records are local to the browser/app installation and are not securely synchronized. A Home Screen web app can have a separate storage area from the Safari tab, so enter fresh demo records after installing. Do not enter real customer information, VLESS credentials, UUIDs, passwords, or API tokens.

This preview is not the production GOD CONFIQS customer platform.
