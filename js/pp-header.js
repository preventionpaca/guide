/* ==========================================================
   PP HEADER — loader centralisé (iframe-safe, anti-404)
   Dépendances : pp-config.js (chargé AVANT)
   ========================================================== */
(function () {
  const DEFAULT_HEADER_URL =
    "https://preventionpaca.github.io/guide/partials/pp-header.html";

  function setHref(el, href) {
    if (!href) return;
    el.setAttribute("href", href);
    // Sortir de l’iframe Grist
    el.setAttribute("target", "_top");
    el.setAttribute("rel", "noopener noreferrer");
    el.style.cursor = "pointer";
  }

  function bindNavLinks(scope) {
    const links = window.PP_LINKS || {};
    (scope || document).querySelectorAll("[data-nav]").forEach((el) => {
      const key = el.dataset.nav;
      setHref(el, links[key]);
    });
  }

  function bindThemeToggle(scope) {
    const btn = (scope || document).getElementById("themeToggle");
    if (!btn) return;

    const STORAGE_KEY = window.PP_THEME_KEY || "ppp-theme";

    function apply(theme) {
      const isLight = theme === "light";
      document.body.classList.toggle("light-theme", isLight);
      btn.textContent = isLight ? "Mode sombre" : "Mode clair";
      btn.setAttribute("aria-pressed", isLight ? "true" : "false");
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    }

    let current = "dark";
    try { current = localStorage.getItem(STORAGE_KEY) || "dark"; } catch (e) {}
    apply(current);

    btn.addEventListener("click", () => {
      const next = document.body.classList.contains("light-theme") ? "dark" : "light";
      apply(next);
    });
  }

  async function loadHeader() {
    const host = document.getElementById("header-container");
    if (!host) return;

    const url = window.PP_HEADER_URL || DEFAULT_HEADER_URL;

    try {
      const res = await fetch(url, { cache: "no-store" });

      // ✅ si 404/500 : on STOP, on n’injecte RIEN
      if (!res.ok) throw new Error(`Header HTTP ${res.status} ${res.statusText}`);

      const html = await res.text();

      // Garde-fou : GitHub Pages 404 peut renvoyer une page HTML
      if (/404\s*:\s*Not\s*Found/i.test(html)) {
        throw new Error("Header content looks like a 404 page");
      }

      host.innerHTML = html;

      // On “scoppe” les binds dans le header injecté
      bindNavLinks(host);
      bindThemeToggle(document);

    } catch (e) {
      console.error("[pp-header] impossible de charger le header :", e);
      // On n’affiche pas de 404 dans la page, on masque juste le host
      host.innerHTML = "";
      host.style.display = "none";
    }
  }

  document.addEventListener("DOMContentLoaded", loadHeader);
})();
