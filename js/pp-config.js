// PP_CONFIG – Portail Prévention PACA
// Version: AUTH-V1-2026-02-01
// Objectifs :
// - Centraliser les URLs (routes, liens header)
// - Centraliser l'auth "code établissement" (DDFPT) + persistance inter-pages (localStorage)
// - Fournir un helper compatible avec les anciennes pages : PP.auth.authWithCode(code)

(function () {
  // -----------------------------
  // 1) CONFIG SITE / ROUTES
  // -----------------------------
  const SITE_BASE = "https://preventionpaca.github.io/guide/";
  const APP_DIR   = "0306/";
  const APP_BASE  = SITE_BASE + APP_DIR;

  window.PP_SITE_BASE = window.PP_SITE_BASE || SITE_BASE;
  window.PP_APP_DIR   = window.PP_APP_DIR   || APP_DIR;
  window.PP_APP_BASE  = window.PP_APP_BASE  || APP_BASE;

  // Supabase (Edge Functions)
  window.PP_SUPABASE_URL = window.PP_SUPABASE_URL || "https://hpiqwvwpxzppxpxhjede.supabase.co";
  const SB_BASE = String(window.PP_SUPABASE_URL || "").replace(/\/+$/, "");
  window.PP_SUPABASE_FN_BASE = window.PP_SUPABASE_FN_BASE || (SB_BASE + "/functions/v1");

  // Endpoints Edge Functions
  window.PP_SB_ROOT      = window.PP_SB_ROOT      || window.PP_SUPABASE_FN_BASE;
  window.PP_SB_API_READ  = window.PP_SB_API_READ  || (window.PP_SB_ROOT + "/read-app");
  window.PP_SB_API_WRITE = window.PP_SB_API_WRITE || (window.PP_SB_ROOT + "/write-app");
  window.PP_SB_API_AUTH  = window.PP_SB_API_AUTH  || (window.PP_SB_ROOT + "/auth-code");
  window.PP_SB_API_RESOLVE_APP = window.PP_SB_API_RESOLVE_APP || (window.PP_SB_ROOT + "/resolve-app");

  // App registre (resolve-app)
  window.PP_APP_DEFAULT = window.PP_APP_DEFAULT || "equipements";
  window.PP_APP_NAME    = window.PP_APP_NAME    || window.PP_APP_DEFAULT;

  // Partials
  window.PP_HEADER_URL = window.PP_HEADER_URL || (SITE_BASE + "partials/pp-header.html");

  // Router
  window.PP_ROUTE = window.PP_ROUTE || function (key) {
    const k = String(key || "home").toLowerCase();
    const map = {
      home:        APP_BASE + "portail.html",
      portal:      APP_BASE + "portail.html",
      dashboard:   APP_BASE + "tableaubord.html",
      base:        APP_BASE + "base.html",
      ddfpt:       APP_BASE + "ddfpt.html",
      admin:       APP_BASE + "admin.html",
      avisp:       APP_BASE + "avismedical_P.html",
      avism:       APP_BASE + "avismedical.html",
      analyse:     APP_BASE + "analyse_dipl.html",
      contact:     APP_BASE + "contact.html",
      ressources:  APP_BASE + "ressources.html",
      presentation:APP_BASE + "presentation.html",
      assocdipl:   APP_BASE + "assoc_etab_dipl.html",
      derogp:      APP_BASE + "derogation_P.html",
      derogm:      APP_BASE + "derogation_M.html"
    };
    return map[k] || (SITE_BASE + "#" + k);
  };

  // Liens standard utilisés par le header
  window.PP_LINKS = window.PP_LINKS || {
    portal:    window.PP_ROUTE("portal"),
    admin:     window.PP_ROUTE("admin"),
    ddfpt:     window.PP_ROUTE("ddfpt"),
    home:      window.PP_ROUTE("home"),
    base:      window.PP_ROUTE("base"),
    dashboard: window.PP_ROUTE("dashboard")
  };

  // Debug
  window.PP_CONFIG_VERSION = window.PP_CONFIG_VERSION || "AUTH-V1-2026-02-01";

  // -----------------------------
  // 2) AUTH PARTAGÉE (DDFPT)
  // -----------------------------
  const STORE_KEY = "ppp_auth_v1";

  function nowMs() { return Date.now(); }

  function safeJsonParse(s) {
    try { return JSON.parse(s); } catch (e) { return null; }
  }

  function readState() {
    try { return safeJsonParse(localStorage.getItem(STORE_KEY) || "null"); }
    catch (e) { return null; }
  }

  function writeState(st) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(st)); } catch (e) {}
  }

  function clearState() {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
  }

  function isValid(st) {
    return !!(st && st.ok === true && typeof st.expiresAt === "number" && st.expiresAt > nowMs());
  }

  // Modal unique (injectée une seule fois)
  function ensureModal() {
    if (document.getElementById("ppAuthOverlay")) return;

    // style "lock" (cache le contenu derrière l'overlay tant que non auth)
    const style = document.createElement("style");
    style.id = "ppAuthStyle";
    style.textContent = `
      html.pp-locked body { visibility: hidden; }
      #ppAuthOverlay { visibility: visible; }
    `;
    document.head.appendChild(style);

    const overlay = document.createElement("div");
    overlay.id = "ppAuthOverlay";
    overlay.style.cssText = `
      position:fixed; inset:0; background:rgba(15,23,42,.9);
      z-index:99999; display:none; align-items:center; justify-content:center;
    `;

    overlay.innerHTML = `
      <div style="
        background:#0b2238; color:#e5f0ff; border-radius:18px; padding:24px 28px;
        max-width:420px; width:92%; box-shadow:0 20px 45px rgba(0,0,0,.6);
        border:1px solid #f97316; font-family:system-ui,-apple-system,Segoe UI,sans-serif;
      ">
        <h2 style="margin:0 0 6px; font-size:1.15rem; font-weight:650;">Accès réservé</h2>
        <p style="margin:0 0 14px; font-size:.85rem; color:#9ca3af;">
          Saisissez le code établissement (DDFPT). Une fois validé, l’accès restera actif sur les autres pages.
        </p>
        <input id="ppAuthInput" type="password" autocomplete="off" placeholder="Code établissement"
          style="width:100%; border-radius:999px; border:1px solid #374151; padding:9px 12px;
                 background:#020617; color:#e5f0ff; font-size:.95rem;" />
        <div id="ppAuthError" style="margin:6px 0 0; font-size:.82rem; color:#fecaca; min-height:1.1em; white-space:pre-wrap;"></div>
        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
          <button id="ppAuthSubmit" type="button"
            style="border-radius:999px; border:none; padding:8px 16px; background:#f97316; color:#111827; font-weight:700; cursor:pointer;">
            Valider
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const input  = overlay.querySelector("#ppAuthInput");
    const err    = overlay.querySelector("#ppAuthError");
    const submit = overlay.querySelector("#ppAuthSubmit");

    async function authWithCode(code) {
      const url = String(window.PP_SB_API_AUTH || "").trim();
      if (!url) throw new Error("PP_SB_API_AUTH non défini");

      // NB: la fonction Edge n'attend que {code}. Les champs en trop sont ignorés.
      const payload = { code: String(code || "").trim() };

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify(payload)
      });

      const j = await r.json().catch(() => null);
      if (!r.ok || !j || !j.ok) throw new Error(j?.error || ("HTTP " + r.status));

      // Persistance
      const ttlSec = Number(j.expiresInSec || 1800); // fallback 30 min
      const st = {
        ok: true,
        role: j.role || "ddfpt",
        token: j.token || null,
        codepaca: j.codepaca || null,
        etabName: j.etabName || null,
        expiresAt: nowMs() + ttlSec * 1000
      };
      writeState(st);

      // Aussi compatible avec vos scripts existants
      try { localStorage.setItem("pp_token", String(j.token || "")); } catch (e) {}
      try { sessionStorage.setItem("pp_auth", JSON.stringify(j)); } catch (e) {}

      document.dispatchEvent(new CustomEvent("pp:auth-changed", { detail: st }));
      return st;
    }

    async function doSubmit() {
      err.textContent = "";
      const code = (input.value || "").trim().replace(/\s+/g, "");
      if (!code) { err.textContent = "Merci de saisir un code."; return; }

      submit.disabled = true;
      submit.textContent = "Vérification…";
      try {
        const st = await authWithCode(code);

        // Par défaut, on autorise "ddfpt" + "admin" + "dreets" à passer sur les pages DDFPT
        if (!st || !st.role) throw new Error("Réponse auth invalide");

        overlay.style.display = "none";
        input.value = "";

        // déverrouille l'affichage si la page était verrouillée
        document.documentElement.classList.remove("pp-locked");
      } catch (e) {
        err.textContent = (e && e.message) ? e.message : "Code invalide.";
      } finally {
        submit.disabled = false;
        submit.textContent = "Valider";
      }
    }

    submit.addEventListener("click", doSubmit);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); doSubmit(); }
    });

    // Expose l'implémentation pour réutilisation (admin.html, etc.)
    window.PP = window.PP || {};
    window.PP.auth = window.PP.auth || {};
    if (typeof window.PP.auth.authWithCode !== "function") {
      window.PP.auth.authWithCode = authWithCode;
    }
  }

  function openModal() {
    ensureModal();
    document.documentElement.classList.add("pp-locked");
    const overlay = document.getElementById("ppAuthOverlay");
    const input = overlay.querySelector("#ppAuthInput");
    overlay.style.display = "flex";
    setTimeout(() => input && input.focus(), 50);
  }

  async function requireRole(requiredRole) {
    const st = readState();
    if (isValid(st)) {
      // Si on demande "ddfpt", on accepte aussi admin/dreets
      if (requiredRole === "ddfpt") {
        const r = String(st.role || "");
        if (r === "ddfpt" || r === "admin" || r === "dreets") return st;
      } else if (String(st.role || "") === String(requiredRole)) {
        return st;
      }
    }
    openModal();
    throw new Error("AUTH_REQUIRED");
  }

  // API globale, simple à appeler dans les pages
  window.PP_AUTH = window.PP_AUTH || {
    get() {
      const st = readState();
      return isValid(st) ? st : null;
    },
    logout() {
      clearState();
      try { localStorage.removeItem("pp_token"); } catch (e) {}
      try { sessionStorage.removeItem("pp_auth"); } catch (e) {}
      document.dispatchEvent(new CustomEvent("pp:auth-changed", { detail: null }));
    },
    requireDdfpt() { return requireRole("ddfpt"); },
    requireAdmin() { return requireRole("admin"); }
  };

  // -----------------------------
  // 3) VERROU "AUTO" AU DÉMARRAGE (optionnel)
  // -----------------------------
  // Dans une page, mettre dans <head> :
  //   <script>window.PP_REQUIRE_DDFPT = true;</script>
  // avant de charger pp-config.js
  document.addEventListener("DOMContentLoaded", () => {
    if (window.PP_REQUIRE_DDFPT === true) {
      window.PP_AUTH.requireDdfpt()
        .then(() => { document.documentElement.classList.remove("pp-locked"); })
        .catch(() => { /* modal ouverte => on laisse la page verrouillée */ });
    }
    if (window.PP_REQUIRE_ADMIN === true) {
      window.PP_AUTH.requireAdmin()
        .then(() => { document.documentElement.classList.remove("pp-locked"); })
        .catch(() => { /* modal ouverte */ });
    }
  });
})();
