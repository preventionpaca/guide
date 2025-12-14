// ========================
// Chargement du header depuis GitHub
// ========================
document.addEventListener("DOMContentLoaded", () => {
  const headerContainer = document.getElementById("header-container");
  
  // URL du fichier header à charger depuis GitHub
  const headerUrl = "https://raw.githubusercontent.com/preventionpaca/guide/main/header.html";  // Adaptez cette URL si nécessaire

  fetch(headerUrl)
    .then(response => response.text())
    .then(html => {
      // Injecter le HTML du header dans l'élément #header-container
      headerContainer.innerHTML = html;

      // Liaison des liens de navigation avec les URLs depuis la config
      document.querySelectorAll("[data-nav]").forEach(el => {
        const key = el.dataset.nav;
        if (PPP_LINKS[key]) {
          el.setAttribute("href", PPP_LINKS[key]);
          el.setAttribute("target", "_top"); // Sortir de l'iframe Grist
        }
      });
      
      // Activer le bascule du thème
      const btn = document.getElementById("themeToggle");
      if (btn) {
        const STORAGE_KEY = "ppp-theme";

        function applyTheme(theme) {
          const isLight = theme === "light";
          document.body.classList.toggle("light-theme", isLight);
          btn.textContent = isLight ? "Mode sombre" : "Mode clair";
          try {
            localStorage.setItem(STORAGE_KEY, theme);
          } catch (e) {}
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
      }
    })
    .catch(error => console.error("Erreur de chargement du header depuis GitHub : ", error));
});

async function loadHeaderInto(containerId, url) {
  const host = document.getElementById(containerId);
  if (!host) return;

  try {
    const res = await fetch(url, { cache: "no-store" });

    // ✅ NE PAS injecter si 404 / 500 / etc.
    if (!res.ok) throw new Error(`Header fetch failed: ${res.status} ${res.statusText}`);

    const html = await res.text();

    // Petit garde-fou supplémentaire (optionnel)
    if (/404\s*:\s*Not\s*Found/i.test(html)) {
      throw new Error("Header content looks like a 404 page");
    }

    host.innerHTML = html;
  } catch (e) {
    console.error("[pp-header] impossible de charger le header :", e);
    // On évite d’afficher un truc moche dans la page
    host.innerHTML = "";
    host.style.display = "none";
  }
}

