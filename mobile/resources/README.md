# Mobile app assets

Source icon: `icon.svg` (copied from `src/app/icon.svg`).

Generate launcher icons and splash screens:

```bash
cd mobile
pnpm install
pnpm assets
```

`@capacitor/assets` expects `resources/icon.png` (1024×1024) and optional `resources/splash.png` (2732×2732).

If you only have SVG, export PNG once (Figma, Inkscape, or macOS Preview) before running `pnpm assets`.

Brand colors:

- Icon background: `#bd5f42`
- Splash background: `#fffaf5`
