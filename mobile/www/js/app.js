(function () {
  var APP_ORIGIN = "https://mebauangi.info";
  var RETRY_MS = 4000;

  function setStatus(message) {
    var node = document.getElementById("shell-status");
    if (node) node.textContent = message;
  }

  function resolveAttributionSource() {
    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return "mobile-web";

    var platform = window.Capacitor.getPlatform ? window.Capacitor.getPlatform() : "native";
    if (platform === "ios") return "ios-app";
    if (platform === "android") return "android-app";
    return "native-app";
  }

  function buildAppUrl() {
    var url = new URL(APP_ORIGIN);
    url.searchParams.set("utm_source", resolveAttributionSource());
    url.searchParams.set("utm_medium", "app");
    url.searchParams.set("utm_campaign", "capacitor-shell");
    return url.toString();
  }

  function navigateToApp() {
    window.location.replace(buildAppUrl());
  }

  function configureNativeChrome() {
    if (!window.Capacitor || !window.Capacitor.isNativePlatform()) return Promise.resolve();

    var tasks = [];

    if (window.Capacitor.Plugins && window.Capacitor.Plugins.StatusBar) {
      tasks.push(
        window.Capacitor.Plugins.StatusBar.setStyle({ style: "LIGHT" }).catch(function () {}),
        window.Capacitor.Plugins.StatusBar.setBackgroundColor({ color: "#bd5f42" }).catch(function () {})
      );
    }

    if (window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
      window.Capacitor.Plugins.App.addListener("backButton", function () {
        if (window.history.length > 1) {
          window.history.back();
        }
      });

      window.Capacitor.Plugins.App.addListener("appUrlOpen", function (event) {
        if (!event || !event.url) return;
        try {
          var incoming = new URL(event.url);
          var target = new URL(incoming.pathname + incoming.search, APP_ORIGIN);
          target.searchParams.set("utm_source", resolveAttributionSource());
          target.searchParams.set("utm_medium", "deeplink");
          window.location.replace(target.toString());
        } catch (_error) {
          navigateToApp();
        }
      });
    }

    return Promise.all(tasks);
  }

  function boot() {
    configureNativeChrome()
      .then(function () {
        setStatus("Đang kết nối…");
        navigateToApp();
      })
      .catch(function () {
        setStatus("Không thể mở ứng dụng. Thử lại sau vài giây…");
        window.setTimeout(navigateToApp, RETRY_MS);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
