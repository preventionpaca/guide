/* ==========================================================
   PP CONFIG — UNE SEULE FOIS POUR TOUT LE PORTAIL
   ========================================================== */
(function () {
  // URL du partial header (votre fichier existe bien)
  window.PP_HEADER_URL = "https://preventionpaca.github.io/guide/partials/pp-header.html";

  // Liens de navigation (à modifier ici, et ça s’applique partout)
  window.PP_LINKS = {
    home:   "https://preventionpaca.github.io/guide/",
    portal: "https://preventionpaca.github.io/guide/portail.html",

    // ⚠️ Remplacez les "..." par vos vraies URLs Grist complètes
    admin:  "https://preventionpaca.github.io/guide/guide_iframe.html#https://docs.getgrist.com/gvPEJV3qAHS9/Equipements-de-travail-et-produits/p/75?embed=true&style=singlePage&exclude-headers=true",
    ddfpt:  "https://preventionpaca.github.io/guide/guide_iframe.html#https://docs.getgrist.com/gvPEJV3qAHS9/Equipements-de-travail-et-produits/p/74?embed=true&style=singlePage&exclude-headers=true"
  };

  // Optionnel : clé de stockage thème
  window.PP_THEME_KEY = "ppp-theme";
})();

