(function () {
  var APP_URL = "https://mebauangi.info";
  var RETRY_MS = 4000;

  function setStatus(message) {
    var node = document.getElementById("shell-status");
    if (node) node.textContent = message;
  }

  function navigateToApp() {
    window.location.replace(APP_URL);
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
