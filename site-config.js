/* Configuration publique non sensible du routeur Prévention PACA. */
window.PP_SITE_CONFIG = Object.freeze({
  maintenance: true,
  environment: "DEV",
  appUrl: "https://script.google.com/macros/s/AKfycbxp1WsKD41zQUphVPNJ5MfcjO6eN6NjGEkBpxB9D-2QW-mZplS1j0j4i4p7YGn7oTLE/exec",
  gristHost: "https://camin.getgrist.com",
  externalGristDocuments: Object.freeze({
    functionalDiagram: Object.freeze({
      host: "https://docs.getgrist.com",
      docId: "gvPEJV3qAHS9",
      purpose: "Schéma fonctionnel distinct de la base principale"
    })
  })
});
window.MAINTENANCE = window.PP_SITE_CONFIG.maintenance;
window.PP_GRIST_HOST = window.PP_SITE_CONFIG.gristHost;
