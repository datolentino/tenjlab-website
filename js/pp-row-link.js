/* Make each "Selected publications" row open its article (the DOI link),
   so the whole row is clickable, not just the small "doi" link. */
(function () {
  var rows = document.querySelectorAll(".pp-pub");
  rows.forEach(function (row) {
    var link = row.querySelector(".pp-pub__m a[href]");
    if (!link) return;
    var href = link.getAttribute("href");
    row.setAttribute("role", "link");
    row.setAttribute("tabindex", "0");
    row.setAttribute("aria-label", "Open article");
    function go(newTab) { window.open(href, "_blank", "noopener"); }
    row.addEventListener("click", function (e) {
      if (e.target.closest("a")) return; // let real links (doi) work normally
      go();
    });
    row.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); go(); }
    });
  });
})();
