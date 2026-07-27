/* Prévention PACA — navigation et fragments locaux — 2.0.0-dev.3. */
(function (window, document) {
  "use strict";

  var roleLinks = {
    invite: ["Accueil", "Book", "Travaux réglementés", "Documentation"],
    etablissement: ["Accueil", "Book", "Dérogations", "Mon établissement", "Contributions"],
    entreprise: ["Accueil", "Book", "Dérogations", "Mon entreprise"],
    ddfpt: ["Accueil", "Book", "Dérogations", "Espace DDFPT", "Contributions"],
    validateur_metier: ["Accueil", "Book", "Contributions", "Validation métier"],
    medecin: ["Accueil", "Book", "Avis médicaux"],
    administrateur: ["Accueil", "Book", "Contributions", "Validation métier", "Administration"]
  };

  function headerMarkup(options) {
    var connected = !!options.connected;
    var version = (window.PP_V2_CONFIG && window.PP_V2_CONFIG.version) || "2.0.0-dev.3";
    var identity = options.displayName ? String(options.displayName) : "Utilisateur connecté";
    return [
      '<a class="pp-skip-link" href="#contenu">Aller au contenu</a>',
      '<header class="pp-site-header">',
      '<div class="pp-container pp-site-header__top">',
      '<a class="pp-site-brand" href="#accueil" aria-label="Prévention PACA — accueil">',
      '<span class="pp-site-brand__logo" aria-hidden="true">PACA</span>',
      '<span class="pp-site-brand__text"><strong>Prévention PACA</strong><small>Prévention des risques professionnels</small></span>',
      '</a>',
      '<div class="pp-site-header__identity">',
      '<span class="pp-badge">DEV · ' + version + '</span>',
      connected ? '<span class="pp-identity-text">' + escapeHtml(identity) + '</span><button class="pp-button pp-button--secondary" data-pp-auth-action="logout" type="button">Se déconnecter</button>'
        : '<span class="pp-identity-text">Non connecté</span><button class="pp-button pp-button--secondary" data-pp-auth-action="login" type="button">Se connecter</button>',
      '<button class="pp-button pp-button--secondary pp-menu-toggle" type="button" aria-expanded="false" aria-controls="pp-main-menu"><span aria-hidden="true">☰</span><span class="pp-visually-hidden">Ouvrir le menu</span></button>',
      '</div></div>',
      '<nav class="pp-main-nav" id="pp-main-menu" aria-label="Navigation principale"><div class="pp-container"><ul class="pp-main-nav__list" data-pp-role-nav></ul></div></nav>',
      '</header>'
    ].join("");
  }

  function escapeHtml(value) {
    var node = document.createElement("span");
    node.textContent = String(value || "");
    return node.innerHTML;
  }

  function footerMarkup() {
    return [
      '<footer class="pp-site-footer"><div class="pp-container">',
      '<div class="pp-site-footer__grid">',
      '<section><h2>Prévention PACA</h2><p>Plateforme régionale de prévention des risques professionnels.</p><p class="pp-help">Emplacements réservés aux logos officiels fournis.</p></section>',
      '<nav aria-label="Liens utiles"><h2>Liens utiles</h2><ul><li><a href="#mentions">Mentions légales</a></li><li><a href="#accessibilite">Accessibilité</a></li><li><a href="#confidentialite">Confidentialité</a></li></ul></nav>',
      '<nav aria-label="Aide et contact"><h2>Aide</h2><ul><li><a href="#contact">Contact</a></li><li><a href="#documentation">Documentation</a></li><li><a href="#partenaires">Partenaires institutionnels</a></li></ul></nav>',
      '</div><div class="pp-site-footer__meta"><span>Environnement DEV</span><span>Version 2.0.0-dev.2</span></div>',
      '</div></footer>'
    ].join("");
  }

  function renderRoleNavigation(root, role) {
    var list = root.querySelector("[data-pp-role-nav]");
    if (!list) return;
    list.replaceChildren();
    (roleLinks[role] || roleLinks.invite).forEach(function (label, index) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#demo-" + label.toLowerCase().replace(/\s+/g, "-");
      link.textContent = label;
      if (index === 0) link.setAttribute("aria-current", "page");
      item.appendChild(link);
      list.appendChild(item);
    });
  }

  function mount(root) {
    var scope = root || document;
    scope.querySelectorAll('[data-pp-component="header"]').forEach(function (host) {
      host.innerHTML = headerMarkup({
        connected: host.getAttribute("data-state") === "connected",
        displayName: host.getAttribute("data-display-name") || ""
      });
      renderRoleNavigation(host, host.getAttribute("data-role") || "invite");
      var toggle = host.querySelector(".pp-menu-toggle");
      var menu = host.querySelector(".pp-main-nav");
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        menu.setAttribute("data-open", String(!open));
        toggle.querySelector(".pp-visually-hidden").textContent = open ? "Ouvrir le menu" : "Fermer le menu";
      });
    });
    scope.querySelectorAll('[data-pp-component="footer"]').forEach(function (host) {
      host.innerHTML = footerMarkup();
    });
  }

  function breadcrumb(container, items) {
    if (!container) return;
    var nav = document.createElement("nav");
    nav.className = "pp-breadcrumb";
    nav.setAttribute("aria-label", "Fil d’Ariane");
    var list = document.createElement("ol");
    items.forEach(function (item, index) {
      var li = document.createElement("li");
      if (index === items.length - 1) {
        var current = document.createElement("span");
        current.textContent = item.label;
        current.setAttribute("aria-current", "page");
        li.appendChild(current);
      } else {
        var link = document.createElement("a");
        link.href = item.href || "#";
        link.textContent = item.label;
        li.appendChild(link);
      }
      list.appendChild(li);
    });
    nav.appendChild(list);
    container.replaceChildren(nav);
  }

  function closeMenuOnEscape(event) {
    if (event.key !== "Escape") return;
    document.querySelectorAll('.pp-main-nav[data-open="true"]').forEach(function (menu) {
      menu.setAttribute("data-open", "false");
      var toggle = document.querySelector('[aria-controls="' + menu.id + '"]');
      if (toggle) { toggle.setAttribute("aria-expanded", "false"); toggle.focus(); }
    });
  }

  window.PPNavigation = Object.freeze({
    mount: mount,
    breadcrumb: breadcrumb,
    renderRoleNavigation: renderRoleNavigation,
    headerMarkup: headerMarkup
  });
  document.addEventListener("keydown", closeMenuOnEscape);
  document.addEventListener("DOMContentLoaded", function () { mount(document); });
}(window, document));
