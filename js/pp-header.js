// ==========================================================
// PP HEADER — loader centralisé (iframe-safe, anti-404)
// ==========================================================
(function () {

  async function loadHeader() {
    const host = document.getElementById("header-container");
    if (!host) return;

    const url =
      window.PP_HEADER_URL ||
      "https://preventionpaca.github.io/guide/partials/pp-header.html";

    try {
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} – ${res.statusText}`);
      }

      const html = await res.text();

      // Sécurité anti-injection de page 404
      if (/404\s*:\s*Not\s*Found/i.test(html)) {
        throw new Error("Le contenu chargé ressemble à une page 404");
      }

      host.innerHTML = html;

      bindNavLinks();
      bindThemeToggle();

    } catch (err) {
      console.error("[pp-header] échec chargement header :", err);
      host.remove();
    }
  }

  function bindNavLinks() {
    if (!window.PP_LINKS) return;

    document.querySelectorAll("[data-nav]").forEach(el => {
      const key = el.dataset.nav;
      const href = window.PP_LINKS[key];
      if (!href) return;

      el.setAttribute("href", href);
      el.setAttribute("target", "_top");
    });
  }

  function bindThemeToggle() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;

    const STORAGE_KEY = "ppp-theme";

    function apply(theme) {
      const isLight = theme === "light";
      document.body.classList.toggle("light-theme", isLight);
      btn.textContent = isLight ? "Mode sombre" : "Mode clair";
      try { localStorage.setItem(STORAGE_KEY, theme); } catch(e){}
    }

    let current = "dark";
    try { current = localStorage.getItem(STORAGE_KEY) || "dark"; } catch(e){}
    apply(current);

    btn.addEventListener("click", () => {
      apply(document.body.classList.contains("light-theme") ? "dark" : "light");
    });
  }

  document.addEventListener("DOMContentLoaded", loadHeader);

})();
