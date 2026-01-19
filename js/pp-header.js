// ==========================================================
// PP HEADER — loader + navigation robuste en iframe (Grist sandbox2)
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
      const res = await fetch(url, { cache: "force-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status} – ${res.statusText}`);
      const html = await res.text();
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

  function goToHref(href, key) {
    if (!href) return;

    // 1) Voie la plus fiable depuis une iframe sandbox : demander au parent (routeur GitHub)
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "pp:navigate", href, key }, "*");
        // On ne return pas : on garde un fallback au cas ou le parent n'ecoute pas.
      }
    } catch (e) {}

    // 2) Fallback : essayer de naviguer dans la fenetre du haut (peut etre bloque)
    try {
      const topWin = (window.top && window.top !== window) ? window.top : window;
      const current = String(topWin.location.href);
      if (current === href) {
        // decollage/recollage pour declencher un hashchange
        const u = new URL(href);
        const wantedHash = u.hash || "";
        topWin.location.hash = "";
        setTimeout(() => { topWin.location.hash = wantedHash; }, 30);
        return;
      }
      topWin.location.href = href;
      return;
    } catch (e) {}

    // 3) Dernier filet : tentative "_top" via window.open (souvent autorisee en sandbox)
    try {
      window.open(href, "_top");
      return;
    } catch (e) {}

    // 4) En ultime recours : navigation locale (dans l'iframe)
    window.location.href = href;
  }

  function bindNavLinks() {
    const links = window.PP_LINKS || {};
    document.querySelectorAll("[data-nav]").forEach(el => {
      const key = el.dataset.nav;
      const href = links[key];
      if (!href) return;

      // rendre le lien "normal" (hover, barre d'etat etc.)
      el.setAttribute("href", href);
      el.setAttribute("target", "_top");
      el.setAttribute("rel", "noopener noreferrer");

      el.addEventListener("click", (ev) => {
        if (ev.defaultPrevented) return;
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
        ev.preventDefault();
        goToHref(href, key);
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
