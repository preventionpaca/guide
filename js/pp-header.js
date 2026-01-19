// ==========================================================
// PP HEADER — loader centralise (iframe-safe) + navigation fiable
// ==========================================================
(function () {

  async function loadHeader() {
    const host = document.getElementById("header-container");
    if (!host) return;

    const url = window.PP_HEADER_URL;
    if (!url) {
      console.error("[pp-header] PP_HEADER_URL manquant (pp-config.js non charge ?)");
      return;
    }

    try {
      // Header statique : on autorise le cache navigateur.
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);

      const html = await res.text();

      // Anti-404 "silencieux"
      if (/404\s*:\s*Not\s*Found/i.test(html)) {
        throw new Error("Le contenu charge ressemble a une page 404");
      }

      host.innerHTML = html;

      bindNavLinks();
      markActiveNav();
      buildBreadcrumb();
      bindThemeToggle();

    } catch (err) {
      console.error("[pp-header] echec chargement header :", err);
      host.innerHTML = "";
      host.style.display = "none";
    }
  }

  // Navigation robuste en contexte Grist embed :
  // 1) si on est dans une iframe, on demande au parent (index GitHub) de naviguer via postMessage
  // 2) sinon, on applique une navigation classique
  function navigateTo(key, href) {
    if (!key && !href) return;

    // 1) Contexte iframe : on demande au parent (index) de changer le hash.
    // Dans Grist embed, la navigation top peut etre bloquee (sandbox).
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "pp:navigate", key: key || "home" }, "*");
        return;
      }
    } catch (e) {
      // on tombe en fallback ci-dessous
    }

    // 2) Fallback : navigation directe (hors iframe)
    if (!href) {
      try {
        const base = (window.PP_SITE_BASE || (location.origin + location.pathname));
        href = base.replace(/#.*$/, "") + "#" + (key || "home");
      } catch (e) {
        href = "#" + (key || "home");
      }
    }

    try {
      const topWin = (window.top && window.top !== window) ? window.top : window;

      // Cas penible : recliquer sur la meme destination.
      const current = String(topWin.location.href);
      if (current === href) {
        const u = new URL(href);
        const wantedHash = u.hash || "";
        topWin.location.hash = "";
        setTimeout(() => { topWin.location.hash = wantedHash; }, 30);
        return;
      }

      topWin.location.href = href;
    } catch (e) {
      window.location.href = href;
    }
  }

  function bindNavLinks() {
    const links = window.PP_LINKS || {};
    document.querySelectorAll("[data-nav]").forEach(el => {
      const key = el.dataset.nav;
      const href = links[key];
      if (!href) return;

      // On met HREF pour hover/curseur
      el.setAttribute("href", href);
      // Iframe-safe : on sort du cadre Grist
      el.setAttribute("target", "_top");
      el.setAttribute("rel", "noopener noreferrer");

      // Navigation fiable (meme si on reclique sur le meme hash)
      el.addEventListener("click", (ev) => {
        // Laisse les ctrl/cmd clic etc.
        if (ev.defaultPrevented) return;
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
        ev.preventDefault();
        navigateTo(key, href);
      });
    });
  }

  function markActiveNav() {
    const current = (window.PP_PAGE || "").trim();
    if (!current) return;

    document.querySelectorAll(".ppp-nav-pill[data-nav]").forEach(a => {
      a.classList.toggle("ppp-nav-pill--active", a.dataset.nav === current);
    });
  }

  function bindThemeToggle() {
    const btn = document.getElementById("themeToggle");
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
      apply(document.body.classList.contains("light-theme") ? "dark" : "light");
    });
  }

  document.addEventListener("DOMContentLoaded", loadHeader);
})();

function buildBreadcrumb() {
  const nav = document.querySelector(".ppp-breadcrumb");
  if (!nav) return;

  const page = window.PP_PAGE;
  const map  = window.PP_BREADCRUMB || {};
  const items = map[page];

  if (!items || !items.length) {
    nav.style.display = "none";
    return;
  }

  nav.innerHTML = items
    .map((label, i) =>
      i === 0
        ? `<span class="ppp-bc-root">${label}</span>`
        : `<span class="ppp-bc-sep">›</span><span>${label}</span>`
    )
    .join("");
}
