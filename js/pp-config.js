/* =====================================================
   PP-CONFIG.JS — VERSION SUPABASE + AUTH CENTRALISÉE
   -----------------------------------------------------
   - Auth via Supabase Edge Functions
   - Lecture / écriture sécurisée Grist
   - Token JWT stocké en sessionStorage
   - Compatible avec ton wrapper + hash + navigation
   ===================================================== */

/* ===============================
   CONFIG GLOBALE
   =============================== */

window.PP_CONFIG = window.PP_CONFIG || {};

PP_CONFIG.SUPABASE_URL = "https://hpiqwvwpxzppxpxhjede.supabase.co";
PP_CONFIG.API_BASE = PP_CONFIG.SUPABASE_URL + "/functions/v1";

PP_CONFIG.APP_DEFAULT = "equipements";

/* ===============================
   AUTH MODULE
   =============================== */

window.ppAuth = {

  async login(code) {
    if (!code || !code.trim()) {
      throw new Error("Code manquant");
    }

    const r = await fetch(`${PP_CONFIG.API_BASE}/auth-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() })
    });

    const data = await r.json();
    if (!data.ok) throw new Error(data.error || "Erreur authentification");

    const payload = {
      token: data.token,
      role: data.role,
      etabName: data.etabName || "",
      codepaca: data.codepaca || "",
      ts: Date.now()
    };

    sessionStorage.setItem("pp_auth", JSON.stringify(payload));

    return payload;
  },

  logout() {
    sessionStorage.removeItem("pp_auth");
  },

  getSession() {
    try {
      return JSON.parse(sessionStorage.getItem("pp_auth") || "null");
    } catch (e) {
      return null;
    }
  },

  getToken() {
    const s = this.getSession();
    return s?.token || null;
  },

  getUser() {
    const s = this.getSession();
    if (!s) return null;
    return {
      role: s.role,
      etabName: s.etabName,
      codepaca: s.codepaca
    };
  },

  ensure() {
    return !!this.getToken();
  }
};

/* ===============================
   API MODULE
   =============================== */

window.ppAPI = {

  async read(app = PP_CONFIG.APP_DEFAULT, params = {}) {
    const url = new URL(`${PP_CONFIG.API_BASE}/read-app`);
    url.searchParams.set("app", app);

    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });

    const r = await fetch(url.toString());
    const data = await r.json();
    if (!data.ok) throw new Error(data.error || "Erreur lecture");
    return data;
  },

  async write(app = PP_CONFIG.APP_DEFAULT, payload) {
    const token = ppAuth.getToken();
    if (!token) throw new Error("Non authentifié");

    const url = new URL(`${PP_CONFIG.API_BASE}/write-app`);
    url.searchParams.set("app", app);

    const r = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json();
    if (!data.ok) throw new Error(data.error || "Erreur écriture");
    return data;
  }
};

/* ===============================
   HELPERS UX
   =============================== */

window.ppUI = {

  async loginPrompt(label = "Code d’accès") {
    const code = prompt(label + " :");
    if (!code) return null;
    return await ppAuth.login(code);
  },

  showUserBadge() {
    const u = ppAuth.getUser();
    if (!u) return;

    let txt = "";
    if (u.role === "admin") txt = "Mode administrateur";
    else if (u.role === "ddfpt") txt = `Établissement : ${u.etabName}`;
    else txt = u.role;

    console.log("[AUTH]", txt);
  }
};

/* ===============================
   DEBUG (facultatif)
   =============================== */

window.PP_DEBUG = true;

function ppLog(...args) {
  if (window.PP_DEBUG) console.log("[PP]", ...args);
}

ppLog("pp-config.js chargé avec Supabase + Auth");
