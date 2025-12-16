
// ==========================================================
// PP CONFIG — un seul endroit à modifier pour tout le portail
// ==========================================================
(function () {
  // URL du partial header (OK chez toi)
  window.PP_HEADER_URL = "https://preventionpaca.github.io/guide/partials/pp-header.html";

  // Page active (optionnel, mais pratique si tu veux une pastille "active")
  // Exemple : 'home' | 'portal' | 'admin' | 'ddfpt'
  window.PP_PAGE = window.PP_PAGE || "";

  // Liens (UN SEUL endroit à maintenir)
  window.PP_LINKS = {
    home:   "https://preventionpaca.github.io/guide/",
    portal: "https://preventionpaca.github.io/guide/",
    admin:  "https://preventionpaca.github.io/guide/guide_iframe.html#https://docs.getgrist.com/gvPEJV3qAHS9/Equipements-de-travail-et-produits/p/75?embed=true&style=singlePage&exclude-headers=true",
    ddfpt:  "https://preventionpaca.github.io/guide/guide_iframe.html#https://docs.getgrist.com/gvPEJV3qAHS9/Equipements-de-travail-et-produits/p/74?embed=true&style=singlePage&exclude-headers=true"
  };

  // Clé de stockage du thème (commune)
  window.PP_THEME_KEY = "ppp-theme";
})();
// ==========================================================
// Fil d'Ariane — structure des pages
// ==========================================================
window.PP_BREADCRUMB = {
  home:   ["Accueil"],
  portal: ["Accueil", "Portail prévention PACA"],
  admin:  ["Accueil", "Accès administrateur"],
  ddfpt:  ["Accueil", "Accès Directeurs Délégués aux Formations"],
  derogp:  ["Accueil", "Accès DDFPT", "Dérogations"],
  derogm:  ["Accueil", "Accès DDFPT", "Dérogations"],
  avisp:   ["Accueil", "Accès DDFPT", "Avis médical  personnalisé"],
  avism:   ["Accueil", "Accès DDFPT", "Avis médical  mutualisé"],
  conta:   ["Accueil", "Accès DDFPT", "Avis médical  mutualisé"],
  qrcode:  ["Accueil", "Accès DDFPT", "QRCode"],
  diplo:   ["Accueil", "Accès DDFPT", "Association Diplômes/Etablissement"],
};


