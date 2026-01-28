// ===============================
// PP CONFIG (ROUTER + QR + PRELOAD)
// Version: ROUTER-2026-01-19b
// ===============================
(function () {
  // --- Site ---
  window.PP_SITE_BASE  = "https://preventionpaca.github.io/guide/";
  window.PP_HEADER_URL = "https://preventionpaca.github.io/guide/partials/pp-header.html";
  window.PP_THEME_KEY  = "ppp-theme";
  window.PP_PAGE       = window.PP_PAGE || "";

  // --- PRELOAD ---
  // IMPORTANT: boolean uniquement (true/false), pas de texte.
  window.PP_PRELOAD_ENABLED = false;

  // --- GRIST ---
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

  window.PP_ROUTE = function (key) {
    return window.PP_SITE_BASE + "#" + (key || "home");
  };

  window.PP_WRAP_SRC = function (gristUrl) {
    return window.PP_SITE_BASE + "?src=" + encodeURIComponent(gristUrl || "");
  };

  // Pages principales (IDs Grist)
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

  // Liens utilisables partout
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

  // Ordre de preload (au cas ou tu le reactives)
  window.PP_PRELOAD_KEYS = [
    "home","base","ddfpt","admin",
    "avism","avisp","derogm","derogp",
    "dashboard","contact","analyse","ressources",
    "presentation","schema"
  ];

  window.PP_CONFIG_VERSION = "ROUTER-2026-01-19b";
})();
/* =====================================================
   SUPABASE + AUTH CENTRALISÉ (AJOUT)
   -----------------------------------------------------
   - Ne remplace PAS la config routeur/Gris existante.
   - Ajoute ppAuth / ppAPI utilisables sur toutes les pages.
   ===================================================== */

(function () {
  // --- Supabase (Edge Functions) ---
  // Si tu changes de projet Supabase, tu ne modifies que ces 2 lignes.
  window.PP_SUPABASE_URL = window.PP_SUPABASE_URL || "https://hpiqwvwpxzppxpxhjede.supabase.co";
  window.PP_SUPABASE_FN_BASE = window.PP_SUPABASE_FN_BASE || (window.PP_SUPABASE_URL + "/functions/v1");

  // App par défaut (registre Supabase : app=equipements)
  window.PP_APP_DEFAULT = window.PP_APP_DEFAULT || "equipements";

  // Stockage session (évite de garder un token après fermeture onglet)
  const KEY = "pp_auth";

  function safeParse(v) {
    try { return JSON.parse(v); } catch { return null; }
  }

  window.ppAuth = window.ppAuth || {
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

    logout() {
      sessionStorage.removeItem(KEY);
    },

    getSession() {
      return safeParse(sessionStorage.getItem(KEY) || "null");
    },

    getToken() {
      const s = this.getSession();
      return s && s.token ? s.token : null;
    },

    getUser() {
      const s = this.getSession();
      if (!s) return null;
      return { role: s.role, etabName: s.etabName, codepaca: s.codepaca };
    },

    isLogged() {
      return !!this.getToken();
    }
  };

  window.ppAPI = window.ppAPI || {
    async read(app = window.PP_APP_DEFAULT, params = {}) {
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

    async write(app = window.PP_APP_DEFAULT, payload) {
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
        // Si token expiré → message explicite pour déclencher une reconnexion
        const msg = String(data.error || "Erreur écriture");
        if (msg.toLowerCase().includes("expired")) {
          throw new Error("Session expirée : merci de ressaisir le code.");
        }
        throw new Error(msg);
      }
      return data;
    }
  };

  // Petit helper optionnel (debug)
  window.ppUI = window.ppUI || {
    async loginPrompt(label = "Code d’accès") {
      const code = prompt(label + " :");
      if (!code) return null;
      return await window.ppAuth.login(code);
    }
  };
})();


/* ============================================================
   Supabase Edge Functions helper (auth + rpcFetch)
   - Stores token in sessionStorage under 'pp_auth'
   - Provides window.rpcFetch(urlOrPath, options)
   - Provides window.ppAuth.loginWithCode(code) -> {ok, token, role, expiresInSec, ...}
   ============================================================ */
(function(){
  const KEY = 'pp_auth';

  function getSupabaseBase() {
    // allow override
    const u = window.PP_SUPABASE_URL || window.PP_SUPABASE_BASE || '';
    return String(u).replace(/\/+$/,'');
  }
  function getFunctionsBase() {
    const base = getSupabaseBase();
    if (!base) return '';
    return base + '/functions/v1';
  }

  function readAuth() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch(e) { return null; }
  }
  function writeAuth(obj) {
    try { sessionStorage.setItem(KEY, JSON.stringify(obj || null)); } catch(e) {}
  }
  function clearAuth() {
    try { sessionStorage.removeItem(KEY); } catch(e) {}
  }

  function authHeader(extra) {
    const h = new Headers(extra || {});
    const a = readAuth();
    if (a && a.token) h.set('Authorization', 'Bearer ' + a.token);
    if (!h.has('Content-Type')) h.set('Content-Type', 'application/json');
    return h;
  }

  async function rpcFetch(urlOrPath, options) {
    const opt = options || {};
    let url = String(urlOrPath || '');
    const fnBase = getFunctionsBase();

    if (url.startsWith('/functions/v1/')) {
      url = (getSupabaseBase() || '') + url;
    } else if (!/^https?:\/\//i.test(url)) {
      // assume function name
      if (!fnBase) throw new Error('Supabase base URL manquante (PP_SUPABASE_URL).');
      url = fnBase + '/' + url.replace(/^\/+/,'');
    }

    const headers = authHeader(opt.headers);
    const res = await fetch(url, { ...opt, headers });
    const ct = res.headers.get('content-type') || '';
    let data = null;
    if (ct.includes('application/json')) {
      data = await res.json().catch(()=>null);
    } else {
      data = await res.text().catch(()=>null);
    }
    if (!res.ok) {
      const msg = (data && data.error) ? data.error : (res.status + ' ' + res.statusText);
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  async function loginWithCode(code) {
    const fnBase = getFunctionsBase();
    if (!fnBase) throw new Error('Supabase base URL manquante (PP_SUPABASE_URL).');
    const payload = { code: String(code || '').trim() };
    const res = await fetch(fnBase + '/auth-code', {
      method: 'POST',
      headers: new Headers({ 'Content-Type':'application/json' }),
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(()=>({ok:false,error:'Réponse non JSON'}));
    if (!res.ok || !data || data.ok !== true || !data.token) {
      const msg = (data && data.error) ? data.error : ('HTTP ' + res.status);
      throw new Error(msg);
    }
    // store token
    writeAuth({
      token: data.token,
      role: data.role || '',
      expiresInSec: data.expiresInSec || data.expiresIn || null,
      etabName: data.etabName || null,
      ts: Date.now()
    });
    return data;
  }

  window.rpcFetch = rpcFetch;
  window.ppAuth = {
    read: readAuth,
    write: writeAuth,
    clear: clearAuth,
    loginWithCode
  };
})();
