/* Contrôleur du Book DEV — lecture seule — 2.0.0-dev.5. */
(function (window, document) {
  "use strict";
  var configuration = null;
  var currentPage = 1;

  function element(id) { return document.getElementById(id); }
  function show(state) {
    document.querySelectorAll("[data-book-state]").forEach(function (node) {
      node.hidden = node.getAttribute("data-book-state") !== state;
    });
  }
  function storedSession() { return window.PPAuthV2.read(); }
  function safeText(value) { return String(value == null ? "" : value); }
  function setText(id, value) { element(id).textContent = safeText(value); }
  function isSessionError(response) {
    return response && response.error && /^AUTH_SESSION_/.test(response.error.code);
  }
  function requestParameters() {
    return {
      query: element("book-query").value.trim(),
      type: element("book-type").value,
      family: element("book-family").value,
      regime: element("book-regime").value,
      sort: element("book-sort").value || "name_asc",
      pageSize: Number(element("book-page-size").value || 20),
      page: currentPage
    };
  }
  function addOptions(select, values, placeholder) {
    select.replaceChildren();
    if (placeholder != null) {
      var empty = document.createElement("option");
      empty.value = ""; empty.textContent = placeholder; select.appendChild(empty);
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = typeof value === "object" ? value.id : value;
      option.textContent = typeof value === "object" ? value.label : value;
      select.appendChild(option);
    });
  }
  function applyUrlToForm() {
    var params = new URLSearchParams(window.location.search);
    ["query","type","family","regime","sort"].forEach(function (name) {
      var control = element("book-" + (name === "query" ? "query" : name));
      if (control && params.has(name)) control.value = params.get(name);
    });
    if (params.has("pageSize")) element("book-page-size").value = params.get("pageSize");
    currentPage = Math.max(1, Number(params.get("page") || 1) || 1);
  }
  function writeUrl(equipmentId) {
    var params = new URLSearchParams();
    var criteria = requestParameters();
    Object.keys(criteria).forEach(function (key) {
      var value = criteria[key];
      if (value !== "" && !(key === "page" && value === 1)) params.set(key, value);
    });
    if (equipmentId) params.set("id", equipmentId);
    window.history.pushState({}, "", window.location.pathname + (params.toString() ? "?" + params.toString() : ""));
  }
  function imageNode(media, className) {
    var wrapper = document.createElement("div");
    wrapper.className = className;
    wrapper.textContent = "Photo indisponible";
    if (!media || !media.available || !/^https:\/\//i.test(media.url || "")) return wrapper;
    var image = document.createElement("img");
    image.src = media.url;
    image.alt = "";
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", function () {
      image.remove(); wrapper.textContent = "Photo indisponible";
    });
    wrapper.replaceChildren(image);
    return wrapper;
  }
  function resultRow(item) {
    var row = document.createElement("tr");
    var mediaCell = document.createElement("td"); mediaCell.dataset.label = "Photo"; mediaCell.appendChild(imageNode(item.thumbnail, "pp-book-thumbnail"));
    var nameCell = document.createElement("td"); nameCell.dataset.label = "Désignation";
    var strong = document.createElement("strong"); strong.textContent = item.name; nameCell.appendChild(strong);
    var typeCell = document.createElement("td"); typeCell.dataset.label = "Type"; typeCell.textContent = item.type || "—";
    var familyCell = document.createElement("td"); familyCell.dataset.label = "Famille"; familyCell.textContent = item.family || "—";
    var regimeCell = document.createElement("td"); regimeCell.dataset.label = "Régime"; regimeCell.textContent = item.regime || "—";
    var actionCell = document.createElement("td"); actionCell.dataset.label = "Action";
    var button = document.createElement("button"); button.className = "pp-button pp-button--secondary"; button.type = "button"; button.textContent = "Consulter";
    button.addEventListener("click", function () { openDetail(item.id); });
    actionCell.appendChild(button);
    row.append(mediaCell, nameCell, typeCell, familyCell, regimeCell, actionCell);
    return row;
  }
  function renderResults(data) {
    var body = element("book-results");
    body.replaceChildren();
    data.items.forEach(function (item) { body.appendChild(resultRow(item)); });
    element("book-empty").hidden = data.items.length !== 0;
    element("book-table-wrap").hidden = data.items.length === 0;
    setText("book-result-count", data.items.length
      ? "Résultats " + data.resultStart + " à " + data.resultEnd + " sur " + data.total
      : "Aucun résultat");
    setText("book-page-label", "Page " + data.page);
    element("book-previous").disabled = !data.hasPrevious;
    element("book-next").disabled = !data.hasNext;
    setText("book-search-status", data.cacheHit ? "Résultats mis en cache." : "Référentiel actualisé.");
    element("book-results-section").hidden = false;
    element("book-detail").hidden = true;
  }
  async function search(options) {
    options = options || {};
    var session = storedSession();
    if (!session) { show("session-required"); return; }
    if (options.resetPage) currentPage = 1;
    setText("book-search-status", "Recherche en cours…");
    try {
      var response = await window.PPApiV2.call("pp_v2_book_search", Object.assign({ sessionToken: session.token }, requestParameters()));
      if (!response.ok) {
        if (isSessionError(response)) { window.PPAuthV2.clear(); show("session-required"); return; }
        if (response.error.code === "AUTH_PERMISSION_DENIED") { show("denied"); return; }
        throw new Error(response.error.code);
      }
      currentPage = response.data.page;
      renderResults(response.data);
      if (!options.preserveUrl) writeUrl("");
    } catch (error) {
      setText("book-error-message", error.message === "NETWORK_TIMEOUT"
        ? "Le service met trop de temps à répondre."
        : "La consultation du référentiel a échoué.");
      show("error");
    }
  }
  function detailSection(title, value) {
    if (!value) return null;
    var section = document.createElement("section"); section.className = "pp-book-section";
    var heading = document.createElement("h3"); heading.textContent = title;
    var content = document.createElement("p"); content.textContent = value;
    section.append(heading, content); return section;
  }
  function renderDetail(detail) {
    var content = element("book-detail-content"); content.replaceChildren();
    var hero = document.createElement("div"); hero.className = "pp-book-detail-hero";
    hero.appendChild(imageNode(detail.media, "pp-book-detail-image"));
    var intro = document.createElement("div");
    var eyebrow = document.createElement("p"); eyebrow.className = "pp-eyebrow"; eyebrow.textContent = detail.type || "Équipement ou produit";
    var title = document.createElement("h2"); title.id = "book-detail-title"; title.textContent = detail.name;
    var definition = document.createElement("dl"); definition.className = "pp-definition-list";
    [["Identifiant",detail.id],["Famille",detail.family],["Régime",detail.regime],["Domaines",detail.domains]].forEach(function (entry) {
      if (!entry[1]) return;
      var term = document.createElement("dt"); term.textContent = entry[0];
      var value = document.createElement("dd"); value.textContent = entry[1];
      definition.append(term, value);
    });
    intro.append(eyebrow, title, definition); hero.appendChild(intro); content.appendChild(hero);
    var sections = document.createElement("div"); sections.className = "pp-book-sections";
    [
      detailSection("Précisions réglementaires", detail.regimeDetails),
      detailSection("Travaux réglementés", detail.regulatedWorks),
      detailSection("Nature des travaux", detail.workNature),
      detailSection("Articles du Code du travail", detail.legalArticles),
      detailSection("Vérification générale périodique", detail.periodicInspection),
      detailSection("Diplômes concernés", detail.diplomas),
      detailSection("Observations particulières", detail.observations)
    ].filter(Boolean).forEach(function (section) { sections.appendChild(section); });
    var chemicalValues = detail.chemical && Object.keys(detail.chemical).some(function (key) { return !!detail.chemical[key]; });
    if (chemicalValues) {
      var chemical = document.createElement("section"); chemical.className = "pp-book-section";
      var chemicalTitle = document.createElement("h3"); chemicalTitle.textContent = "Informations produit chimique";
      var chemicalList = document.createElement("dl"); chemicalList.className = "pp-definition-list";
      [["Type",detail.chemical.type],["Famille",detail.chemical.family],["Régime applicable aux mineurs",detail.chemical.minorsRegime],["Agents chimiques principaux",detail.chemical.mainAgents],["Dangers CLP",detail.chemical.clpHazards],["EPI recommandés",detail.chemical.recommendedPpe]].forEach(function (entry) {
        if (!entry[1]) return;
        var dt = document.createElement("dt"); dt.textContent = entry[0];
        var dd = document.createElement("dd"); dd.textContent = entry[1];
        chemicalList.append(dt, dd);
      });
      chemical.append(chemicalTitle, chemicalList); sections.appendChild(chemical);
    }
    if (detail.documents && detail.documents.length) {
      var documentSection = document.createElement("section"); documentSection.className = "pp-book-section";
      var documentTitle = document.createElement("h3"); documentTitle.textContent = "Documents";
      var list = document.createElement("ul"); list.className = "pp-book-documents";
      detail.documents.forEach(function (documentItem) {
        var item = document.createElement("li"); var link = document.createElement("a");
        link.href = documentItem.url; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = documentItem.label;
        item.appendChild(link); list.appendChild(item);
      });
      documentSection.append(documentTitle, list); sections.appendChild(documentSection);
    }
    content.appendChild(sections);
    element("book-results-section").hidden = true;
    element("book-detail").hidden = false;
    element("book-detail").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function openDetail(id, preserveUrl) {
    var session = storedSession();
    if (!session) { show("session-required"); return; }
    setText("book-search-status", "Ouverture de la fiche…");
    try {
      var response = await window.PPApiV2.call("pp_v2_book_get", { sessionToken: session.token, equipmentId: id });
      if (!response.ok) {
        if (isSessionError(response)) { window.PPAuthV2.clear(); show("session-required"); return; }
        if (response.error.code === "AUTH_PERMISSION_DENIED") { show("denied"); return; }
        throw new Error(response.error.code);
      }
      renderDetail(response.data);
      if (!preserveUrl) writeUrl(id);
    } catch (error) {
      setText("book-error-message", "La fiche demandée n’est pas disponible.");
      show("error");
    }
  }
  function connectHeader(profile) {
    var header = document.querySelector('[data-pp-component="header"]');
    header.setAttribute("data-state", "connected");
    header.setAttribute("data-role", safeText(profile.role).toLowerCase());
    header.setAttribute("data-display-name", profile.displayName || "");
    window.PPNavigation.mount(header.parentNode);
    document.querySelectorAll('[data-pp-auth-action="logout"]').forEach(function (button) {
      button.addEventListener("click", async function () {
        await window.PPAuthV2.logout(); window.location.href = "portail-v2-dev.html";
      }, { once: true });
    });
  }
  async function initialize() {
    window.PPNavigation.breadcrumb(element("book-breadcrumb"), [
      { label: "Accueil", href: "portail-v2-dev.html" },
      { label: "Book des équipements et produits" }
    ]);
    var session = storedSession();
    if (!session) { show("session-required"); return; }
    try {
      var sessionResponse = await window.PPAuthV2.session();
      if (!sessionResponse || !sessionResponse.ok) { show("session-required"); return; }
      if (sessionResponse.data.profile.permissions.indexOf("BOOK_VIEW") === -1) { show("denied"); return; }
      connectHeader(sessionResponse.data.profile);
      var configResponse = await window.PPApiV2.call("pp_v2_book_config", { sessionToken: session.token });
      if (!configResponse.ok) {
        if (isSessionError(configResponse)) { show("session-required"); return; }
        if (configResponse.error.code === "AUTH_PERMISSION_DENIED") { show("denied"); return; }
        throw new Error(configResponse.error.code);
      }
      configuration = configResponse.data;
      addOptions(element("book-type"), configuration.facets.types, "Tous les types");
      addOptions(element("book-family"), configuration.facets.families, "Toutes les familles");
      addOptions(element("book-regime"), configuration.facets.regimes, "Tous les régimes");
      addOptions(element("book-sort"), configuration.sorts, null);
      addOptions(element("book-page-size"), configuration.pageSizes.map(function (size) { return { id:String(size),label:String(size) }; }), null);
      element("book-media-notice").hidden = !configuration.mediaPolicy.legacyProviderPresent;
      applyUrlToForm();
      show("ready");
      await search({ preserveUrl:true });
      var requestedId = new URLSearchParams(window.location.search).get("id");
      if (requestedId) await openDetail(requestedId, true);
    } catch (error) {
      setText("book-error-message", "Le chargement initial du Book a échoué.");
      show("error");
    }
  }
  document.addEventListener("DOMContentLoaded", function () {
    element("book-search-form").addEventListener("submit", function (event) { event.preventDefault(); search({ resetPage:true }); });
    element("book-reset").addEventListener("click", function () {
      element("book-search-form").reset(); currentPage = 1; search();
    });
    element("book-previous").addEventListener("click", function () { if (currentPage > 1) { currentPage -= 1; search(); } });
    element("book-next").addEventListener("click", function () { currentPage += 1; search(); });
    element("book-back").addEventListener("click", function () {
      element("book-detail").hidden = true; element("book-results-section").hidden = false; writeUrl("");
    });
    element("book-retry").addEventListener("click", function () { show("loading"); initialize(); });
    window.addEventListener("popstate", function () { window.location.reload(); });
    initialize();
  });
}(window, document));
