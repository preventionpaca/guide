// ===============================
// PP CONFIG (ROUTER + QR + PRELOAD + SUPABASE AUTH/API)
// Clean: REGISTRY-FIRST (DocID via resolve-app)
// ===============================
(function () {
  // --- Site ---
  window.PP_SITE_BASE  = "https://preventionpaca.github.io/guide/";

  // --- APP VERSION (pages HTML) ---
  window.PP_APP_DIR  = "0306/";
  window.PP_APP_BASE = window.PP_SITE_BASE + window.PP_APP_DIR;

  window.PP_HEADER_URL = "https://preventionpaca.github.io/guide/partials/pp-header.html";
  window.PP_THEME_KEY  = "ppp-theme";
  window.PP_PAGE       = window.PP_PAGE || "";

  // --- PRELOAD ---
  window.PP_PRELOAD_ENABLED = false;

  // =====================================================
  // ✅ REGISTRY APP NAME (SOURCE UNIQUE)
  // - Doit correspondre à une ligne "App" dans la table Apps (registre)
  // - Chez vous : "equipements" est déjà présent et actif
  // =====================================================
  window.PP_APP_NAME    = "equipements";
  window.PP_APP_DEFAULT = "equipements";

  // --- (Optionnel) GRIST direct (utile seulement si vous gardez encore des liens wrapper/iframe)
  // Pour GitHub Pages + Edge Functions, ce n'est PLUS nécessaire.
  // Je le laisse car vous avez encore PP_WRAP_SRC + pages Grist IDs.
  window.PP_GRIST_DOC_ID   = "4eHMq8g5jsqb";
  window.PP_GRIST_DOC_PATH = "Base-Equipements-et-Produits";
  window.PP_GRIST_IFRAME_PARAMS = "embed=true&style=singlePage&exclude-headers=true";

  window.PP_GRIST = {
    root: function () {
      return "https://docs.getgrist.com/" + window.PP_GRIST_DOC_ID + "/" + window.PP_GRIST_DOC_PATH;
    },
    pageUrl: function (pageId) {
      return this.root() + "/p/" + pageId + "?" + window.PP_GRIST_IFRAME_PARAMS;
    }
  };

  // --- Router ---
  window.PP_ROUTE = function (key) {
    const k = key || "home";
    const map = {
      home:      window.PP_APP_BASE + "portail.html#home",
      portal:    window.PP_APP_BASE + "portail.html#home",
      dashboard: window.PP_APP_BASE + "tableaubord.html",
      base:      window.PP_APP_BASE + "base.html#base",
      admin:     window.PP_APP_BASE + "ddfpt.html",
      ddfpt:     window.PP_APP_BASE + "ddfpt.html",
      avisp:     window.PP_APP_BASE + "avismedical_P.html",
      avism:     window.PP_APP_BASE + "avismedical_P.html"
    };
    return map[k] || (window.PP_SITE_BASE + "#" + k);
  };

  // Wrapper (si vous en avez encore besoin pour certains liens Grist)
  window.PP_WRAP_SRC = function (gristUrl) {
    return window.PP_SITE_BASE + "?src=" + encodeURIComponent(gristUrl || "");
  };

  window.PP_PAGES = {
    home:       { id: 59,  label: "Portail (Accueil)" },
    dashboard:  { id: 143, label: "Tableau de bord" },
    derogp:     { id: 60,  label: "Derogation personnalisee" },
    derogm:     { id: 136, label: "Derogation mutualisee" },
    avisp:      { id: 141, label: "Avis medical personnalise" },
    avism:      { id: 67,  label: "Avis medical mutualise" },
    ddfpt:      { id: 74,  label: "Acces DDFPT" },
    admin:      { id: 75,  label: "Acces Admin" },
    contact:    { id: 91,  label: "Contacts" },
    analyse:    { id: 138, label: "Analyse par diplome" },
    ressources: { id: 79,  label: "Ressources" },
    presentation:{ id: 78, label: "Presentation" },
    schema:     { id: 102, label: "Schema fonctionnel" },
    base:       { id: 119, label: "Base" }
  };

  window.PP_LINKS = {
    home:      window.PP_ROUTE("home"),
    portal:    window.PP_ROUTE("home"),
    dashboard: window.PP_ROUTE("dashboard"),
    base:      window.PP_ROUTE("base"),
    admin:     window.PP_ROUTE("admin"),
    ddfpt:     window.PP_ROUTE("ddfpt"),
    derogp:    window.PP_ROUTE("derogp"),
    derogm:    window.PP_ROUTE("derogm"),
    avisp:     window.PP_ROUTE("avisp"),
    avism:     window.PP_ROUTE("avism"),
    contact:   window.PP_ROUTE("contact"),
    analyse:   window.PP_ROUTE("analyse"),
    ressources:window.PP_ROUTE("ressources"),
    presentation: window.PP_ROUTE("presentation"),
    schema:    window.PP_ROUTE("schema")
  };

  window.PP_PRELOAD_KEYS = [
    "home","base","ddfpt","admin",
    "avism","avisp","derogm","derogp",
    "dashboard","contact","analyse","ressources",
    "presentation","schema"
  ];

  window.PP_CONFIG_VERSION = "REGISTRY-FIRST-0306";
})();

/* =====================================================
   ✅ SUPABASE + AUTH CENTRALISÉ (UNIQUE)
   - Token stocké en sessionStorage
   - ppAPI.read / ppAPI.write
   ===================================================== */
(function () {
  window.PP_SUPABASE_URL = window.PP_SUPABASE_URL || "https://hpiqwvwpxzppxpxhjede.supabase.co";
  window.PP_SUPABASE_FN_BASE = window.PP_SUPABASE_FN_BASE || (window.PP_SUPABASE_URL.replace(/\/+$/,'') + "/functions/v1");

  const KEY = "pp_auth";

  function safeParse(v) {
    try { return JSON.parse(v); } catch { return null; }
  }

  window.ppAuth = {
    async login(code) {
      if (!code || !String(code).trim()) throw new Error("Code manquant");
      const r = await fetch(window.PP_SUPABASE_FN_BASE + "/auth-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: String(code).trim() })
      });
      const data = await r.json().catch(() => ({}));
      if (!data.ok) throw new Error(data.error || "Erreur authentification");

      const payload = {
        token: data.token,
        role: data.role,
        etabName: data.etabName || "",
        codepaca: data.codepaca || "",
        expiresInSec: data.expiresInSec || null,
        ts: Date.now()
      };
      sessionStorage.setItem(KEY, JSON.stringify(payload));
      return payload;
    },
    logout() { sessionStorage.removeItem(KEY); },
    getSession() { return safeParse(sessionStorage.getItem(KEY) || "null"); },
    getToken() { const s = this.getSession(); return s && s.token ? s.token : null; },
    getUser() {
      const s = this.getSession();
      if (!s) return null;
      return { role: s.role, etabName: s.etabName, codepaca: s.codepaca };
    },
    isLogged() { return !!this.getToken(); }
  };

  window.ppAPI = {
    async read(app = window.PP_APP_NAME, params = {}) {
      const url = new URL(window.PP_SUPABASE_FN_BASE + "/read-app");
      url.searchParams.set("app", app);
      for (const [k, v] of Object.entries(params || {})) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
      const r = await fetch(url.toString());
      const data = await r.json().catch(() => ({}));
      if (!data.ok) throw new Error(data.error || "Erreur lecture");
      return data;
    },

    async write(app = window.PP_APP_NAME, payload) {
      const token = window.ppAuth.getToken();
      if (!token) throw new Error("Non authentifié");

      const url = new URL(window.PP_SUPABASE_FN_BASE + "/write-app");
      url.searchParams.set("app", app);

      const r = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify(payload || {})
      });

      const data = await r.json().catch(() => ({}));
      if (!data.ok) {
        const msg = String(data.error || "Erreur écriture");
        if (msg.toLowerCase().includes("expired")) {
          throw new Error("Session expirée : merci de ressaisir le code.");
        }
        throw new Error(msg);
      }
      return data;
    }
  };

  window.ppUI = {
    async loginPrompt(label = "Code d’accès") {
      const code = prompt(label + " :");
      if (!code) return null;
      return await window.ppAuth.login(code);
    }
  };
})();
