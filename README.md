# Noctune Android

Native Android wrapper for [Noctune](https://noctune.pages.dev) built with Capacitor.

The web app lives in its own repository ([ASMR-Mixer](https://github.com/techweave-ds/ASMR-Mixer))
and is built from source into `www/` at build time — web source is never duplicated here.

## Structure

| Path | Purpose |
|---|---|
| `www/` | Capacitor webDir — built static export from the web repo (git-ignored) |
| `android/` | Native Android project (Gradle) |
| `scripts/build-web.mjs` | Clones/builds the web repo, copies `out/` → `www/` |
| `.github/workflows/build-apk.yml` | CI: builds debug APK + release AAB |

## Prerequisites

- Node.js 20+
- Android Studio (for local builds: JDK 17 + Android SDK 35)

## Quick start

```bash
npm install
npm run sync        # build web assets from source + sync Capacitor
npm run apk:debug   # build debug APK → android/app/build/outputs/apk/debug/app-debug.apk
```

Or open the project in Android Studio and run on a device/emulator.

## Release build

Release AABs are built in CI when the `ANDROID_KEYSTORE`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, and `ANDROID_KEY_PASSWORD` GitHub secrets are set.

For a local release build, create `android/keystore.properties`:

```properties
storeFile=keystore.jks
storePassword=...
keyAlias=...
keyPassword=...
```

```bash
npm run build:web
npx cap sync android
cd android && ./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

## How the web build works

`npm run build:web` runs `scripts/build-web.mjs`, which:

1. Resolves the latest `v*` release tag from the web repo (override with `WEB_REF=...`)
2. Clones it into `.web-source/`, runs `npm ci && npm run build`
3. Copies the static export `out/` into `www/`

The `www/` directory is regenerated on every sync and never committed.
