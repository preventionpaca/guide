
function include(file, elementId) {
  fetch(file)
    .then(response => response.text())
    .then(html => document.getElementById(elementId).innerHTML = html)
    .then(() => {
      if (elementId === "header-container") {
        const breadcrumb = document.getElementById("breadcrumb");
        const path = window.location.pathname.split("/").pop().replace(".html", "");
        const title = document.title || path;
        if (breadcrumb && path !== "index") {
          breadcrumb.innerHTML = '<a href="index.html">Accueil</a> &gt; ' + title;
        }
      }
    });
}
document.addEventListener("DOMContentLoaded", () => {
  include("header.html", "header-container");
  include("footer.html", "footer-container");
});
