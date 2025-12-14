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
