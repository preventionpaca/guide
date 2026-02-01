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
})();
