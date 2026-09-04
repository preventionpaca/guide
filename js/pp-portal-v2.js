/* Contrôleur de portail authentifié commun DEV/PROD — 2.1.0-dev.149. */
(function (window, document) {
  "use strict";
  var submitting = false;
  function element(id) { return document.getElementById(id); }
  function show(state) {
    document.querySelectorAll("[data-portal-state]").forEach(function (node) { node.hidden = node.getAttribute("data-portal-state") !== state; });
  }
  function message(text, isError) {
    var node = element("auth-message");
    node.textContent = text || "";
    node.className = isError ? "pp-field-message pp-field-message--error" : "pp-help";
  }
  function friendly(error) {
    var code = error && error.message;
    if (code === "CONFIG_UNAVAILABLE") return "Le backend DEV n’est pas configuré. Utilisez le mode simulation explicitement prévu pour la recette locale.";
    if (code === "NETWORK_TIMEOUT") return "Le service met trop de temps à répondre.";
    if (code === "NETWORK_ERROR") return "La connexion réseau avec le service a échoué.";
    if (code === "INVALID_RESPONSE") return "Le service a retourné une réponse impossible à interpréter.";
    if (code === "REQUEST_IN_PROGRESS") return "Une vérification est déjà en cours.";
    return "Le service est temporairement indisponible.";
  }
  function renderPortal(data) {
    element("profile-name").textContent = data.user.displayName;
    element("profile-role").textContent = data.user.role.replace(/_/g, " ");
    element("profile-entity").textContent = data.user.entityName || "";
    var cards = element("portal-cards");
    cards.replaceChildren();
    data.cards.forEach(function (card) {
      var link = document.createElement("a"); link.className = "pp-card"; link.href = card.href;
      var title = document.createElement("h3"); title.textContent = card.label;
      var description = document.createElement("p"); description.textContent = card.description;
      var status = document.createElement("small"); status.textContent = "Accès préparatoire";
      link.append(title, description, status); cards.appendChild(link);
    });
    var header = document.querySelector('[data-pp-component="header"]');
    header.setAttribute("data-state", "connected");
    header.setAttribute("data-role", data.user.role.toLowerCase());
    header.setAttribute("data-display-name", data.user.displayName);
    window.PPNavigation.mount(header.parentNode);
    bindHeaderActions();
    show("connected");
  }
  async function restore() {
    var stored = window.PPAuthV2.read();
    if (!stored) { show("disconnected"); return; }
    show("loading");
    try {
      var session = await window.PPAuthV2.session();
      if (!session || !session.ok) { show("expired"); return; }
      var portal = await window.PPAuthV2.portal();
      if (!portal || !portal.ok) { show("expired"); return; }
      renderPortal(portal.data);
    } catch (error) { window.PPAuthV2.clear(); show("expired"); }
  }
  async function submit(event) {
    event.preventDefault();
    if (submitting) return;
    var input = element("code-paca");
    if (!input.value.trim()) { input.setAttribute("aria-invalid", "true"); message("Saisissez votre Code PACA.", true); input.focus(); return; }
    input.removeAttribute("aria-invalid"); message("", false); submitting = true; element("login-submit").disabled = true; show("loading");
    try {
      var response = await window.PPAuthV2.login(input.value);
      input.value = "";
      if (!response.ok) {
        if (response.error.code === "AUTH_TOO_MANY_ATTEMPTS") show("locked");
        else { show("disconnected"); message(response.error.message || "Connexion impossible.", true); }
        return;
      }
      var portal = await window.PPAuthV2.portal();
      if (!portal || !portal.ok) { show("expired"); return; }
      renderPortal(portal.data);
    } catch (error) { show("disconnected"); message(friendly(error), true); }
    finally { submitting = false; element("login-submit").disabled = false; }
  }
  async function logout() { await window.PPAuthV2.logout(); window.location.hash = "connexion"; show("disconnected"); }
  function bindHeaderActions() {
    document.querySelectorAll('[data-pp-auth-action="logout"]').forEach(function (button) { button.addEventListener("click", logout, { once:true }); });
    document.querySelectorAll('[data-pp-auth-action="login"]').forEach(function (button) { button.addEventListener("click", function () { element("code-paca").focus(); }); });
  }
  document.addEventListener("DOMContentLoaded", function () {
    element("simulation-notice").hidden = !window.PPApiV2.isSimulation();
    element("login-form").addEventListener("submit", submit);
    document.querySelectorAll("[data-return-login]").forEach(function (button) { button.addEventListener("click", function () { window.PPAuthV2.clear(); show("disconnected"); element("code-paca").focus(); }); });
    bindHeaderActions(); restore();
  });
}(window, document));
