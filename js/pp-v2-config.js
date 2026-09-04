/* Adaptateur de configuration publique commun DEV/PROD — 2.1.0-dev.149. */
(function (window) {
  var site = window.PP_SITE_CONFIG || {};
  window.PP_V2_CONFIG = Object.freeze({
    environment: String(site.environment || ""),
    version: "2.1.0-dev.149",
    appUrl: String(site.appUrl || ""),
    requestTimeoutMs: 15000,
    simulationEnabled: String(site.environment || "") === "DEV"
  });
}(window));
