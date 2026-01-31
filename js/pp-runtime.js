export function isInGristWidget() {
  return !!(
    window.grist &&
    window.grist.docApi &&
    window.parent !== window
  );
}
