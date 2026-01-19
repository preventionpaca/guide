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
