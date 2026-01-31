export function isInGristWidget() {
  return !!(window.grist && window.grist.docApi && window.parent !== window);
}

// BONUS: on l'expose aussi en global pour les scripts non-module
window.isInGristWidget = isInGristWidget;
