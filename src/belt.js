/* Optio — belt
 * Client logo belt: clones the logos so the CSS loop never shows a gap.
 * Loads on: Home
 */
(function () {
  var $ = function (s, r) {
      return (r || document).querySelector(s);
    },
    $$ = function (s, r) {
      return Array.prototype.slice.call((r || document).querySelectorAll(s));
    };

  $$("[data-belt-track]").forEach(function (t) {
    var kids = $$(":scope > *", t);
    if (!kids.length) return;
    var w = t.scrollWidth || 1,
      n = Math.max(1, Math.ceil((window.innerWidth * 1.2) / w));
    for (var i = 1; i < n; i++)
      kids.forEach(function (k) {
        t.appendChild(k.cloneNode(true));
      });
    $$(":scope > *", t).forEach(function (k) {
      var c = k.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.setAttribute("alt", "");
      t.appendChild(c);
    });
    t.style.animationDuration = (20 * n * kids.length) / 11 + "s";
  });
})();
