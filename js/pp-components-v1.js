/* Prévention PACA — composants interactifs sans framework — 2.0.0-dev.2. */
(function (window, document) {
  "use strict";

  var previousFocus = null;
  var activeOverlay = null;

  function focusable(container) {
    return Array.from(container.querySelectorAll(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )).filter(function (item) { return !item.hidden && item.offsetParent !== null; });
  }

  function openOverlay(overlay, trigger) {
    if (!overlay) return;
    previousFocus = trigger || document.activeElement;
    activeOverlay = overlay;
    overlay.hidden = false;
    document.body.classList.add("pp-overlay-open");
    var targets = focusable(overlay);
    (targets[0] || overlay).focus();
  }

  function closeOverlay(overlay) {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove("pp-overlay-open");
    activeOverlay = null;
    if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
    previousFocus = null;
  }

  function initTabs(root) {
    root.querySelectorAll("[data-pp-tabs]").forEach(function (tabs) {
      var buttons = Array.from(tabs.querySelectorAll('[role="tab"]'));
      function activate(button, setFocus) {
        buttons.forEach(function (item) {
          var selected = item === button;
          item.setAttribute("aria-selected", String(selected));
          item.tabIndex = selected ? 0 : -1;
          var panel = document.getElementById(item.getAttribute("aria-controls"));
          if (panel) panel.hidden = !selected;
        });
        if (setFocus) button.focus();
      }
      buttons.forEach(function (button, index) {
        button.addEventListener("click", function () { activate(button, false); });
        button.addEventListener("keydown", function (event) {
          var next = null;
          if (event.key === "ArrowRight") next = buttons[(index + 1) % buttons.length];
          if (event.key === "ArrowLeft") next = buttons[(index - 1 + buttons.length) % buttons.length];
          if (event.key === "Home") next = buttons[0];
          if (event.key === "End") next = buttons[buttons.length - 1];
          if (next) { event.preventDefault(); activate(next, true); }
        });
      });
    });
  }

  function initAccordions(root) {
    root.querySelectorAll("[data-pp-accordion-button]").forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = document.getElementById(button.getAttribute("aria-controls"));
        var expanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!expanded));
        if (panel) panel.hidden = expanded;
      });
    });
  }

  function initOverlays(root) {
    root.querySelectorAll("[data-pp-open]").forEach(function (button) {
      button.addEventListener("click", function () {
        openOverlay(document.getElementById(button.getAttribute("data-pp-open")), button);
      });
    });
    root.querySelectorAll("[data-pp-close]").forEach(function (button) {
      button.addEventListener("click", function () { closeOverlay(button.closest(".pp-modal,.pp-drawer")); });
    });
    root.querySelectorAll(".pp-modal,.pp-drawer").forEach(function (overlay) {
      overlay.addEventListener("mousedown", function (event) {
        if (event.target === overlay) closeOverlay(overlay);
      });
    });
  }

  function initDemoForms(root) {
    root.querySelectorAll("[data-pp-demo-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var invalid = form.querySelector(":invalid");
        if (invalid) {
          invalid.focus();
          toast("Veuillez vérifier les champs signalés.", "danger");
          return;
        }
        toast("Démonstration : le formulaire n’a pas été envoyé.", "success");
      });
    });
  }

  function initToastTriggers(root) {
    root.querySelectorAll("[data-pp-toast]").forEach(function (button) {
      button.addEventListener("click", function () {
        toast(button.getAttribute("data-pp-toast"), button.getAttribute("data-pp-toast-status") || "info");
      });
    });
  }

  function toast(message, status) {
    var region = document.querySelector("[data-pp-toast-region]");
    if (!region) {
      region = document.createElement("div");
      region.className = "pp-toast-region";
      region.setAttribute("data-pp-toast-region", "");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    var item = document.createElement("div");
    item.className = "pp-toast";
    item.setAttribute("role", status === "danger" ? "alert" : "status");
    item.textContent = message;
    region.appendChild(item);
    window.setTimeout(function () { item.remove(); }, 5000);
  }

  function onDocumentKeydown(event) {
    if (!activeOverlay) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeOverlay(activeOverlay);
      return;
    }
    if (event.key === "Tab") {
      var targets = focusable(activeOverlay);
      if (!targets.length) { event.preventDefault(); return; }
      var first = targets[0];
      var last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  }

  function init(root) {
    var scope = root || document;
    initTabs(scope);
    initAccordions(scope);
    initOverlays(scope);
    initDemoForms(scope);
    initToastTriggers(scope);
  }

  document.addEventListener("keydown", onDocumentKeydown);
  window.PPComponents = Object.freeze({
    init: init,
    openOverlay: openOverlay,
    closeOverlay: closeOverlay,
    toast: toast
  });
  document.addEventListener("DOMContentLoaded", function () { init(document); });
}(window, document));
