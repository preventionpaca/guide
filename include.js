
function include(file, elementId) {
  fetch(file)
    .then(response => response.text())
    .then(html => {
      document.getElementById(elementId).innerHTML = html;
      if (elementId === "header-container") {
        const breadcrumb = document.getElementById("breadcrumb");
        if (!breadcrumb) return;
        const filename = window.location.pathname.split('/').pop().replace('.html', '');
        const pageName = {
          "index": "Accueil",
          "guide": "Guide",
          "reglementation": "Réglementation",
          "base-paca": "Base PACA",
          "edition": "Édition de documents",
          "contact": "Contact"
        }[filename] || filename;
        if (filename !== "index") {
          breadcrumb.innerHTML = '<a href="index.html">Accueil</a> &gt; ' + pageName;
        } else {
          breadcrumb.innerHTML = 'Accueil';
        }
      }
    });
}
document.addEventListener("DOMContentLoaded", () => {
  include("header.html", "header-container");
  include("footer.html", "footer-container");
});
