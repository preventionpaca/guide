// ==========================================================
// PP CONFIG — un seul endroit à modifier pour tout le portail
// ==========================================================
(function () {
  "use strict";

  // URL du partial header
  window.PP_HEADER_URL = "https://preventionpaca.github.io/guide/partials/pp-header.html";

  // Page active (optionnel)
  // Exemples : 'home' | 'portal' | 'admin' | 'ddfpt' | ...
  window.PP_PAGE = window.PP_PAGE || "";

  // ========================================================
  // ✅ GRIST — identifiants centralisés (à modifier ICI SEULEMENT)
  // ========================================================
  // Quand tu dupliques / changes de document Grist, tu changes :
  //  - DOC_ID
  //  - DOC_PATH (slug dans l'URL)
  // Et tout le reste (liens header + QR + wrappers) suit.
  window.PP_GRIST_DOC_ID = window.PP_GRIST_DOC_ID || "bFa3ksN92YFd";
  window.PP_GRIST_DOC_PATH = window.PP_GRIST_DOC_PATH || "Base-Equipements-et-Produits";

  // Paramètres iframe Grist (ceux qui masquent les éléments Grist côté UI)
  window.PP_GRIST_IFRAME_PARAMS = window.PP_GRIST_IFRAME_PARAMS ||
    "embed=true&style=singlePage&exclude-headers=true";

  // ========================================================
  // ✅ Site — URL de base (GitHub Pages)
  // ========================================================
  // IMPORTANT : ici, l'index est la racine /guide/
  window.PP_SITE_BASE = window.PP_SITE_BASE || "https://preventionpaca.github.io/guide/";

  // ========================================================
  // Helpers d'URL (utilisés par header + QR + pages)
  // ========================================================
  function _ensureTrailingSlash(u) {
    return u.endsWith("/") ? u : (u + "/");
  }

  function _gristRoot() {
    return "https://docs.getgrist.com/" + window.PP_GRIST_DOC_ID + "/" + window.PP_GRIST_DOC_PATH;
  }

  function _gristPageUrl(pageId) {
    const p = Number(pageId);
    if (!p) return "";
    return _gristRoot() + "/p/" + p + "?" + window.PP_GRIST_IFRAME_PARAMS;
  }

  // Wrap 1 : navigation rapide (route/hash du routeur)
  function _wrapRoute(route) {
    const base = _ensureTrailingSlash(window.PP_SITE_BASE);
    const r = String(route || "").replace(/^#/, "");
    return base + "#" + (r || "home");
  }

  // Wrap 2 : deep-link (QR code, liens qui doivent pointer vers une ancre interne Grist)
  // -> index lit ?src=... et charge l'iframe correspondante
  function _wrapSrc(gristUrl) {
    const base = _ensureTrailingSlash(window.PP_SITE_BASE);
    return base + "?src=" + encodeURIComponent(String(gristUrl || "").trim());
  }

  // Normalise une URL "Docs" Grist provenant d'un tableau (ancienne base, ancienne syntaxe, etc.)
  // Puis la re-pointe vers le DOC_ID/DOC_PATH actuel si possible.
  function _normalizeToCurrentDoc(rawUrl) {
    const s = String(rawUrl || "").trim();
    if (!s) return "";

    // Déjà un lien site (routeur)
    if (/^https?:\/\//i.test(s) && s.includes("preventionpaca.github.io/guide")) return s;

    // Ancienne forme : guide_iframe.html#https://docs.getgrist.com/...
    // Ancienne forme : guide_iframe.html?src=https%3A%2F%2Fdocs.getgrist.com%2F...
    // -> on extrait l'URL Grist, on la ré-ancre sur le doc courant, puis wrap ?src=
    try {
      const u = new URL(s, window.location.href);
      const src = u.searchParams.get("src");
      if (src) {
        const gr = decodeURIComponent(src);
        return _wrapSrc(_retargetDoc(gr));
      }
    } catch (e) {}

    // Hash direct qui contient une URL Grist
    if (s.includes("#https://docs.getgrist.com")) {
      const idx = s.indexOf("#");
      const gr = s.slice(idx + 1);
      return _wrapSrc(_retargetDoc(gr));
    }

    // URL Grist brute
    if (s.includes("docs.getgrist.com")) {
      return _wrapSrc(_retargetDoc(s));
    }

    // Sinon, on la laisse telle quelle
    return s;
  }

  // Remplace docId/slug de n'importe quelle URL Grist par ceux du doc courant.
  // Ça permet : QR codes et liens "Docs" toujours valides après migration.
  function _retargetDoc(gristUrl) {
    const s = String(gristUrl || "").trim();
    if (!s) return "";
    try {
      const u = new URL(s);
      if (!/(^|\.)getgrist\.com$/i.test(u.hostname)) return s;

      const parts = u.pathname.split("/").filter(Boolean);
      // Attendu : /<docId>/<slug>/p/<n>
      if (parts.length >= 4 && parts[2] === "p") {
        // Rare (sans slug) -> on reconstruit
        u.pathname = "/" + window.PP_GRIST_DOC_ID + "/" + window.PP_GRIST_DOC_PATH + "/p/" + parts[3];
        return u.toString();
      }
      if (parts.length >= 4 && parts[2] !== "p" && parts[3] === "p") {
        // Cas normal : [docId, slug, 'p', page]
        parts[0] = window.PP_GRIST_DOC_ID;
        parts[1] = window.PP_GRIST_DOC_PATH;
        u.pathname = "/" + parts.join("/");
        return u.toString();
      }

      // Fallback : on tente un remplacement simple du début du path
      u.pathname = u.pathname.replace(/^\/[^/]+\/[^/]+\//, "/" + window.PP_GRIST_DOC_ID + "/" + window.PP_GRIST_DOC_PATH + "/");
      return u.toString();
    } catch (e) {
      return s;
    }
  }

  // Exposition (utilisable dans tes pages / widgets)
  window.PP_GRIST = {
    root: _gristRoot,
    pageUrl: _gristPageUrl,
    wrapRoute: _wrapRoute,
    wrapSrc: _wrapSrc,
    normalizeDocsUrl: _normalizeToCurrentDoc,
    retargetDoc: _retargetDoc
  };

  // Alias pratique (pour les QR codes)
  window.PP_WRAP_SRC = _wrapSrc;

  // ========================================================
  // Liens header (UN SEUL endroit à maintenir)
  // → On navigue via le routeur (hash), pas via les URLs Grist
  // ========================================================
  window.PP_LINKS = {
    home:   _wrapRoute("home"),
    portal: _wrapRoute("home"),
    admin:  _wrapRoute("admin"),
    ddfpt:  _wrapRoute("ddfpt")
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
  diplo:   ["Accueil", "Accès DDFPT", "Association Diplômes/Etablissement"]
};
