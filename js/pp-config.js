// ===============================
// PP CONFIG (ROUTER + QR + PRELOAD)
// Un seul endroit a modifier quand le document Grist change.
// ===============================
(function () {
  // --- Site ---
  // Base ABSOLUE (avec / final). Si tu changes de repo/chemin, c'est ici.
  window.PP_SITE_BASE  = "https://preventionpaca.github.io/guide/";
  window.PP_HEADER_URL = "https://preventionpaca.github.io/guide/partials/pp-header.html";
  window.PP_THEME_KEY  = "ppp-theme";
  window.PP_PAGE       = window.PP_PAGE || "";

  // --- PRELOAD ---
  // Mettre a false pour desactiver totalement le prechargement des pages.
  // (Utile si tu veux tester la perf "sans preheat" ou si cela perturbe la navigation.)
  window.PP_PRELOAD_ENABLED = false;

  // --- GRIST (a modifier uniquement ici si reimport) ---
  window.PP_GRIST_DOC_ID   = "4eHMq8g5jsqb";
  window.PP_GRIST_DOC_PATH = "Base-Equipements-et-Produits";
  window.PP_GRIST_IFRAME_PARAMS = "embed=true&style=singlePage&exclude-headers=true";

  // Helpers Grist
  window.PP_GRIST = {
    root: function () {
      return "https://docs.getgrist.com/" + window.PP_GRIST_DOC_ID + "/" + window.PP_GRIST_DOC_PATH;
    },
    pageUrl: function (pageId) {
      return this.root() + "/p/" + pageId + "?" + window.PP_GRIST_IFRAME_PARAMS;
    }
  };

  // Route hash (navigation instantanee)
  window.PP_ROUTE = function (key) {
    return window.PP_SITE_BASE + "#" + (key || "home");
  };

  // Deep-link QR (ouvre la page dans le routeur via ?src=...)
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
    guide:      { id: 78,  label: "Guide de prevention" },
    base:       { id: 119, label: "Base" }
  };

  // Liens header + lien utilisables dans tes tuiles (table Blocs)
  // => tu peux utiliser PP_LINKS.<cle> partout
  window.PP_LINKS = {
    // Navigation principale
    home:      window.PP_ROUTE("home"),
    portal:    window.PP_ROUTE("home"),
    dashboard: window.PP_ROUTE("dashboard"),
    base:      window.PP_ROUTE("base"),

    // Acces
    admin:     window.PP_ROUTE("admin"),
    ddfpt:     window.PP_ROUTE("ddfpt"),

    // Formulaires
    derogp:    window.PP_ROUTE("derogp"),
    derogm:    window.PP_ROUTE("derogm"),
    avisp:     window.PP_ROUTE("avisp"),
    avism:     window.PP_ROUTE("avism"),

    // Pages
    contact:   window.PP_ROUTE("contact"),
    analyse:   window.PP_ROUTE("analyse"),
    ressources:window.PP_ROUTE("ressources"),
    guide:     window.PP_ROUTE("guide")
  };

  // Prechargement (ordre)
  // Pour changer l'ordre : reordonne simplement ce tableau.
  window.PP_PRELOAD_KEYS = [
    "home",
    "base",
    "ddfpt",
    "admin",
    "avism",
    "avisp",
    "derogm",
    "derogp",
    "dashboard",
    "contact",
    "analyse",
    "ressources",
    "guide"
  ];

  // Fil d'Ariane
  window.PP_BREADCRUMB = {
    home:   ["Accueil"],
    portal: ["Accueil", "Portail prevention PACA"],
    admin:  ["Accueil", "Acces administrateur"],
    ddfpt:  ["Accueil", "Acces Directeurs Delegues aux Formations"],
    derogp: ["Accueil", "Acces DDFPT", "Derogations"],
    derogm: ["Accueil", "Acces DDFPT", "Derogations"],
    avisp:  ["Accueil", "Acces DDFPT", "Avis medical personnalise"],
    avism:  ["Accueil", "Acces DDFPT", "Avis medical mutualise"],
    contact:["Accueil", "Acces DDFPT", "Contacts"],
    qrcode: ["Accueil", "Acces DDFPT", "QRCode"],
    diplo:  ["Accueil", "Acces DDFPT", "Association Diplomes/Etablissement"]
  };

  // Marqueur pour verifier que c'est bien la bonne version
  window.PP_CONFIG_VERSION = "ROUTER-2026-01-19";
})();
