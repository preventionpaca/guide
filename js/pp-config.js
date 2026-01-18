// ==========================================================
// PP CONFIG — un seul endroit à modifier pour tout le portail
// ==========================================================
(function () {
  // === Site (routeur) ===
  window.PP_SITE_BASE  = window.PP_SITE_BASE  || "https://preventionpaca.github.io/guide/";
  window.PP_HEADER_URL = "https://preventionpaca.github.io/guide/partials/pp-header.html";

  // Page active (optionnel)
  window.PP_PAGE = window.PP_PAGE || "";

  // Thème
  window.PP_THEME_KEY = "ppp-theme";

  // ==========================================================
  // ⚠️ GRIST : À MODIFIER UNIQUEMENT ICI en cas de ré-import
  // ==========================================================
  window.PP_GRIST_DOC_ID   = window.PP_GRIST_DOC_ID   || "4eHMq8g5jsqb";
  window.PP_GRIST_DOC_PATH = window.PP_GRIST_DOC_PATH || "Base-Equipements-et-Produits";

  // Paramètres embed Grist
  window.PP_GRIST_IFRAME_PARAMS =
    window.PP_GRIST_IFRAME_PARAMS || "embed=true&style=singlePage&exclude-headers=true";

  // Helpers centralisés
  window.PP_GRIST = window.PP_GRIST || {
    root: function () {
      return "https://docs.getgrist.com/" + window.PP_GRIST_DOC_ID + "/" + window.PP_GRIST_DOC_PATH;
    },
    pageUrl: function (pageId) {
      return this.root() + "/p/" + pageId + "?" + window.PP_GRIST_IFRAME_PARAMS;
    }
  };

  // ==========================================================
  // QR / Deep-link : toujours via le routeur (rapide)
  // ==========================================================
  window.PP_WRAP_SRC = window.PP_WRAP_SRC || function (gristUrl) {
    return window.PP_SITE_BASE + "?src=" + encodeURIComponent(gristUrl || "");
  };

  // ==========================================================
  // Liens header : routes hash => évite les reloads après warm-up
  // ==========================================================
  const ROUTER = window.PP_SITE_BASE;
  window.PP_LINKS = {
    home:   ROUTER + "#home",
    portal: ROUTER + "#home",
    admin:  ROUTER + "#admin",
    ddfpt:  ROUTER + "#ddfpt"
  };

  // ==========================================================
  // Pages principales (IDs)
  // ==========================================================
  window.PP_PAGES = window.PP_PAGES || {
    home:      { id: 59,  label: "Portail (Accueil)" },
    dashboard: { id: 143, label: "Tableau de bord" },

    derogp:    { id: 60,  label: "Dérogation personnalisée" },
    derogm:    { id: 136, label: "Dérogation mutualisée" },

    avisp:     { id: 141, label: "Avis médical personnalisé" },
    avism:     { id: 67,  label: "Avis médical mutualisé" },

    ddfpt:     { id: 74,  label: "Accès DDFPT" },
    admin:     { id: 75,  label: "Accès Admin" },

    contact:   { id: 91,  label: "Contacts" },
    analyse:   { id: 138, label: "Analyse par diplôme" },
    ressources:{ id: 79,  label: "Ressources" },
    guide:     { id: 78,  label: "Guide de prévention" },

    base:      { id: 119, label: "Base (Consultation équipements/produits)" }
  };

  // ==========================================================
  // Préchargement : ordre par défaut (tu peux réduire si tu veux)
  // ==========================================================
  window.PP_PRELOAD_KEYS = window.PP_PRELOAD_KEYS || [
    "dashboard",
    "derogp",
    "derogm",
    "avism",
    "avisp",
    "ddfpt",
    "admin",
    "contact",
    "analyse",
    "ressources",
    "guide",
    "base"
  ];
})();

// ==========================================================
// Fil d'Ariane — structure des pages
// ==========================================================
window.PP_BREADCRUMB = window.PP_BREADCRUMB || {
  home:   ["Accueil"],
  portal: ["Accueil", "Portail prévention PACA"],
  admin:  ["Accueil", "Accès administrateur"],
  ddfpt:  ["Accueil", "Accès Directeurs Délégués aux Formations"],
  derogp: ["Accueil", "Accès DDFPT", "Dérogations"],
  derogm: ["Accueil", "Accès DDFPT", "Dérogations"],
  avisp:  ["Accueil", "Accès DDFPT", "Avis médical personnalisé"],
  avism:  ["Accueil", "Accès DDFPT", "Avis médical mutualisé"],
  conta:  ["Accueil", "Accès DDFPT", "Contacts"],
  qrcode: ["Accueil", "Accès DDFPT", "QRCode"],
  diplo:  ["Accueil", "Accès DDFPT", "Association Diplômes/Etablissement"]
};
