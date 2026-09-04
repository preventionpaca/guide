/* Session navigateur temporaire isolée par environnement — 2.1.0-dev.149. */
(function (window) {
  "use strict";
  var environment = String(window.PP_V2_CONFIG && window.PP_V2_CONFIG.environment || "UNKNOWN").toLowerCase();
  var STORAGE_KEY = "pp_v2_session_" + environment;

  function read() {
    var raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      var value = JSON.parse(raw);
      if (!value.token || !value.expiresAt || Date.parse(value.expiresAt) <= Date.now()) { clear(); return null; }
      return value;
    } catch (error) { clear(); return null; }
  }
  function save(data) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token:data.sessionToken, expiresAt:data.expiresAt }));
  }
  function clear() { window.sessionStorage.removeItem(STORAGE_KEY); }
  async function login(codePaca) {
    var response = await window.PPApiV2.call("pp_v2_auth_login", { codePaca: codePaca });
    if (response.ok) save(response.data);
    return response;
  }
  async function session() {
    var stored = read();
    if (!stored) return null;
    var response = await window.PPApiV2.call("pp_v2_auth_session", { sessionToken: stored.token });
    if (!response.ok) clear();
    return response;
  }
  async function logout() {
    var stored = read();
    try {
      if (stored) await window.PPApiV2.call("pp_v2_auth_logout", { sessionToken: stored.token });
    } finally { clear(); }
  }
  async function portal() {
    var stored = read();
    if (!stored) return null;
    var response = await window.PPApiV2.call("pp_v2_portal_get", { sessionToken: stored.token });
    if (!response.ok && response.error && /^AUTH_SESSION_/.test(response.error.code)) clear();
    return response;
  }
  window.PPAuthV2 = Object.freeze({ login:login, session:session, logout:logout, portal:portal, read:read, clear:clear });
}(window));
