/* Homepage recruitment pop-up (wearables study). Shows at most once every
   7 days per visitor. Dismiss with X, "Maybe later", backdrop click, or Escape. */
(function () {
  var KEY = "tenjRecruitPopup";
  var WEEK = 7 * 24 * 60 * 60 * 1000;
  var overlay = document.getElementById("recruit-popup");
  if (!overlay) return;

  function suppressed() {
    try {
      var t = parseInt(localStorage.getItem(KEY), 10);
      return !!t && (Date.now() - t) < WEEK;
    } catch (e) { return false; }
  }
  function remember() {
    try { localStorage.setItem(KEY, String(Date.now())); } catch (e) {}
  }
  if (suppressed()) return;

  var lastFocus = null;

  function onKey(e) {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "Tab") {
      var f = overlay.querySelectorAll("a[href], button");
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  function open() {
    lastFocus = document.activeElement;
    overlay.classList.add("rp-open");
    overlay.setAttribute("aria-hidden", "false");
    var cta = overlay.querySelector(".rp-cta");
    if (cta) cta.focus();
    document.addEventListener("keydown", onKey);
  }
  function close() {
    overlay.classList.remove("rp-open");
    overlay.setAttribute("aria-hidden", "true");
    remember();
    document.removeEventListener("keydown", onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  overlay.querySelector(".rp-close").addEventListener("click", close);
  overlay.querySelector(".rp-later").addEventListener("click", close);
  overlay.querySelector(".rp-cta").addEventListener("click", remember);
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });

  setTimeout(open, 1200);
})();
