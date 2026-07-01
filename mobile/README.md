# Bầu Ăn Gì? — Mobile (iOS & Android)

Native shells for [mebauangi.info](https://mebauangi.info) built with [Capacitor 7](https://capacitorjs.com/). The apps open the production web experience in a secure WebView with native splash screen, status bar, and back-button handling.

| | |
|--|--|
| App ID | `info.mebauangi.app` |
| Display name | Bầu Ăn Gì? |
| Web entry | `www/` → redirects to `https://mebauangi.info` |

## Prerequisites

### All platforms

- Node.js 20+
- Dependencies: `cd mobile && npm install`

### Android

- JDK 17 or 21
- Android Studio (latest stable) with SDK 34+
- Environment variables:

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

### iOS (macOS only)

- Xcode 15+
- CocoaPods (`sudo gem install cocoapods`)
- Apple Developer account for device testing and App Store upload

## Quick start

```bash
cd mobile
npm install
npm run sync          # copy www + update native projects
npm run open:android  # Android Studio
npm run open:ios      # Xcode (macOS)
```

### Local development against Next.js

With the web app running at `http://localhost:3000`:

```bash
# Android emulator → host machine
CAPACITOR_SERVER_URL=http://10.0.2.2:3000 npm run sync

# iOS simulator
CAPACITOR_SERVER_URL=http://localhost:3000 npm run sync
```

Remove `CAPACITOR_SERVER_URL` before release builds so the app loads production.

## Icons and splash

Source files live in `resources/`. Regenerate platform assets after updating `icon.png` or `splash.png`:

```bash
npm run assets
npm run sync
```

Brand colors: icon `#bd5f42`, splash `#fffaf5`.

## Release builds

### Android (Google Play)

1. Create a upload keystore (once):

```bash
keytool -genkey -v -keystore bau-an-gi-release.keystore -alias bau-an-gi -keyalg RSA -keysize 2048 -validity 10000
```

2. Add signing config to `android/app/build.gradle` or `gradle.properties` (do not commit secrets).

3. Build:

```bash
npm run build:android:bundle   # AAB for Play Console
# or
npm run build:android          # APK for sideload/testing
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

### iOS (App Store)

1. Open `ios/App/App.xcworkspace` in Xcode.
2. Select your Team under Signing & Capabilities.
3. Set version/build (1.0 / 1).
4. Product → Archive → Distribute App → App Store Connect.

Run `pod install` in `ios/App` if CocoaPods dependencies are missing.

## Store listing copy

Full descriptions, privacy answers, screenshot captions, and checklists:

**[`docs/STORE_SUBMISSION.md`](../docs/STORE_SUBMISSION.md)**

## Project layout

```txt
mobile/
  capacitor.config.ts   # App ID, plugins, allowNavigation
  www/                  # Launch shell (splash + redirect)
  resources/            # icon.png, splash.png for asset generation
  android/              # Gradle project
  ios/                  # Xcode project
```

## Plugins

- `@capacitor/app` — Android back button
- `@capacitor/splash-screen` — launch splash
- `@capacitor/status-bar` — brand-colored status bar

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank WebView after launch | Check device internet; confirm `mebauangi.info` is reachable |
| SSL errors | Ensure `androidScheme` / `iosScheme` are `https` in `capacitor.config.ts` |
| iOS pod errors | `cd ios/App && pod install` |
| Gradle SDK not found | Set `ANDROID_HOME` and install SDK Platform 34 in Android Studio |

## Medical disclaimer

The mobile apps surface the same educational meal-planning experience as the website. They are not medical devices. Store listings must include the disclaimer from `docs/STORE_SUBMISSION.md`.
