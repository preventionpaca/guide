// ========================
//  Configuration des URLs
// ========================
//
// À modifier UNE SEULE FOIS ici pour tout le portail.
// (Les pages utilisent data-nav="home" | "portal" | "admin" | "ddfpt")

const PPP_LINKS = {
  home:   "https://preventionpaca.github.io/guide/",           // page portail d'accueil Grist ou GitHub
  portal: "https://preventionpaca.github.io/guide/",   // bouton « Portail prévention PACA »
  admin:  "https://preventionpaca.github.io/guide/guide_iframe.html#https://docs.getgrist.com/gvPEJV3qAHS9/Equipements-de-travail-et-produits/p/75?embed=true&style=singlePage&exclude-headers=true",             // bouton « Accès administrateur »
  ddfpt:  "https://preventionpaca.github.io/guide/guide_iframe.html#https://docs.getgrist.com/gvPEJV3qAHS9/Equipements-de-travail-et-produits/p/74?embed=true&style=singlePage&exclude-headers=true"              // bouton « Accès Directeurs Délégués aux Formations »
};

// ========================
// Affectation des liens
// ========================

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-nav]").forEach(el => {
    const key = el.dataset.nav;
    if (!key || !PPP_LINKS[key]) return;
    el.setAttribute("href", PPP_LINKS[key]);
    el.setAttribute("target", "_top"); // sort de l'iframe Grist
  });

  // ========================
  // Gestion du thème
  // ========================
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const STORAGE_KEY = "ppp-theme";

  function applyTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light-theme", isLight);
    btn.textContent = isLight ? "Mode sombre" : "Mode clair";
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // si localStorage est bloqué, on ignore
    }
  }

  let current = "dark";
  try {
    current = localStorage.getItem(STORAGE_KEY) || "dark";
  } catch (e) {}

  applyTheme(current);

  btn.addEventListener("click", () => {
    current = document.body.classList.contains("light-theme") ? "dark" : "light";
    applyTheme(current);
  });
});
