
function activerMenuBurger() {
  const toggle = document.getElementById("menu-toggle");
  const menu = document.getElementById("menu");

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
      } else {
        menu.style.display = "none";
      }
    });
  }
}

function include(file, elementId) {
  fetch(file)
    .then(response => response.text())
    .then(html => {
      document.getElementById(elementId).innerHTML = html;

      if (elementId === "header-container") {
        activerMenuBurger();

        const breadcrumb = document.getElementById("breadcrumb");
        if (breadcrumb) {
          const filename = window.location.pathname.split('/').pop().replace('.html', '');
          const pageName = {
            "index": "Accueil",
            "guide": "Guide",
            "reglementation": "Réglementation",
            "base-paca": "Base PACA",
            "edition": "Édition de documents",
            "contact": "Contact"
          }[filename] || filename;
          breadcrumb.innerHTML = filename !== "index"
            ? `<a href="index.html">Accueil</a> &gt; ${pageName}`
            : "Accueil";
        }
      }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  include("header.html", "header-container");
  include("footer.html", "footer-container");
});
