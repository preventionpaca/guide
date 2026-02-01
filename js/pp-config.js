// PP_CONFIG nettoyé – registre-first (avec ROUTE + LINKS)
(function () {
  // --- Site ---
  window.PP_SITE_BASE = "https://preventionpaca.github.io/guide/";
  window.PP_APP_DIR   = "0306/";
  window.PP_APP_BASE  = window.PP_SITE_BASE + window.PP_APP_DIR;

  // --- Supabase (Edge Functions) ---
  window.PP_SUPABASE_URL     = "https://hpiqwvwpxzppxpxhjede.supabase.co";
  window.PP_SUPABASE_FN_BASE = window.PP_SUPABASE_URL.replace(/\/+$/, "") + "/functions/v1";

  // --- App registre (resolve-app) ---
  // IMPORTANT : on garde le registre existant => "equipements"
  window.PP_APP_DEFAULT = "equipements";

  // --- Partials ---
  window.PP_HEADER_URL = "https://preventionpaca.github.io/guide/partials/pp-header.html";

  // --- Router (liens internes) ---
  window.PP_ROUTE = function (key) {
    const k = (key || "home").toLowerCase();
    const map = {
      home:      window.PP_APP_BASE + "portail.html",
      portal:    window.PP_APP_BASE + "portail.html",
      dashboard: window.PP_APP_BASE + "tableaubord.html",
      base:      window.PP_APP_BASE + "base.html",
      ddfpt:     window.PP_APP_BASE + "ddfpt.html",
      admin:     window.PP_APP_BASE + "admin.html",
      avisp:     window.PP_APP_BASE + "avismedical_P.html",
      avism:     window.PP_APP_BASE + "avismedical_P.html",
      analyse:   window.PP_APP_BASE + "analyse_dipl.html",
      contact:   window.PP_APP_BASE + "contact.html",
      ressources:window.PP_APP_BASE + "ressources.html",
      presentation: window.PP_APP_BASE + "presentation.html"
      
    };
    return map[k] || (window.PP_SITE_BASE + "#" + k);
  };

  // --- Liens standard utilisés par le header ---
  window.PP_LINKS = {
    portal: window.PP_ROUTE("portal"),
    admin:  window.PP_ROUTE("admin"),
    ddfpt:  window.PP_ROUTE("ddfpt"),
    home:   window.PP_ROUTE("home"),
    base:   window.PP_ROUTE("base"),
    dashboard: window.PP_ROUTE("dashboard")
  };

  // debug (tu peux enlever après)
  window.PP_CONFIG_VERSION = "REGISTRY-FIRST-0306-CLEAN+LINKS";
    // --- App courante (consommée par le data layer) ---
  window.PP_APP_NAME = window.PP_APP_NAME || window.PP_APP_DEFAULT;

})();
<script>
(function () {
  const STORE_KEY = "ppp_ddfpt_auth_v1";
  const DEFAULT_TTL_HOURS = 12;

  function now() { return Date.now(); }

  function readState() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "null"); }
    catch { return null; }
  }
  function writeState(st) {
    localStorage.setItem(STORE_KEY, JSON.stringify(st));
  }
  function clearState() {
    localStorage.removeItem(STORE_KEY);
  }
  function isValid(st) {
    return st && st.ok === true && typeof st.expiresAt === "number" && st.expiresAt > now();
  }

  // --- Modal unique ---
  function ensureModal() {
    if (document.getElementById("ppAuthOverlay")) return;

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
        <h2 style="margin:0 0 6px; font-size:1.15rem; font-weight:650;">Accès réservé DDFPT</h2>
        <p style="margin:0 0 14px; font-size:.85rem; color:#9ca3af;">
          Saisissez le code établissement. Une fois validé, vous pourrez accéder aux pages verrouillées.
        </p>
        <input id="ppAuthInput" type="password" autocomplete="off" placeholder="Code établissement"
          style="width:100%; border-radius:999px; border:1px solid #374151; padding:9px 12px;
                 background:#020617; color:#e5f0ff; font-size:.95rem;" />
        <div id="ppAuthError" style="margin:6px 0 0; font-size:.82rem; color:#fecaca; min-height:1.1em;"></div>
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

    async function verifyViaEdgeFunction(code) {
      const url = (window.PP_SB_API_AUTH || "").trim();
      if (!url) throw new Error("PP_SB_API_AUTH non défini");

      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({ app: (window.PP_APP_NAME || "site"), code })
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j || !j.ok) throw new Error(j?.error || "Code invalide");

      // Attendu : { ok:true, ttlHours?:12 } (tu peux renvoyer aussi etabCode si tu veux)
      const ttl = Number(j.ttlHours || DEFAULT_TTL_HOURS);
      writeState({ ok: true, expiresAt: now() + ttl * 3600 * 1000 });
    }

    async function doSubmit() {
      err.textContent = "";
      const code = (input.value || "").trim().replace(/\s+/g, "");
      if (!code) { err.textContent = "Merci de saisir un code."; return; }

      submit.disabled = true;
      submit.textContent = "Vérification…";
      try {
        await verifyViaEdgeFunction(code);

        overlay.style.display = "none";
        input.value = "";
        document.dispatchEvent(new CustomEvent("pp:auth-changed", { detail: readState() }));
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
  }

  function openModal() {
    ensureModal();
    const overlay = document.getElementById("ppAuthOverlay");
    const input = overlay.querySelector("#ppAuthInput");
    overlay.style.display = "flex";
    setTimeout(() => input && input.focus(), 50);
  }

  // --- API globale ---
  window.PP_AUTH = {
    get() {
      const st = readState();
      return isValid(st) ? st : null;
    },
    logout() { clearState(); document.dispatchEvent(new CustomEvent("pp:auth-changed", { detail: null })); },
    async requireDdfpt() {
      const st = this.get();
      if (st) return st;
      openModal();
      throw new Error("AUTH_REQUIRED");
    }
  };
})();
</script>

