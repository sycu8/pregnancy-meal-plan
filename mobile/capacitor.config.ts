import type { CapacitorConfig } from "@capacitor/cli";

const productionUrl = process.env.CAPACITOR_SERVER_URL ?? "https://mebauangi.info";

const config: CapacitorConfig = {
  appId: "info.mebauangi.app",
  appName: "Bầu Ăn Gì?",
  webDir: "www",
  server: {
    androidScheme: "https",
    iosScheme: "https",
    hostname: "app.mebauangi.info",
    allowNavigation: ["mebauangi.info", "*.mebauangi.info"]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: "#fffaf5",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#bd5f42"
    }
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    contentInset: "automatic",
    scrollEnabled: true,
    allowsLinkPreview: false
  }
};

// Local dev: CAPACITOR_SERVER_URL=http://10.0.2.2:3000 pnpm sync
if (process.env.CAPACITOR_SERVER_URL) {
  config.server = {
    ...config.server,
    url: productionUrl,
    cleartext: productionUrl.startsWith("http://")
  };
}

export default config;
