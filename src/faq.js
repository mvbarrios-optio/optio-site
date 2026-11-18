/* Optio — faq
 * FAQ accordion: one item open at a time, keyboard accessible.
 * Loads on: About
 */
(function () {
  var $ = function (s, r) {
      return (r || document).querySelector(s);
    },
    $$ = function (s, r) {
      return Array.prototype.slice.call((r || document).querySelectorAll(s));
    };

  $$("[data-faq]").forEach(function (f) {
    var items = $$("[data-faq-item]", f);
    items.forEach(function (it, i) {
      var b = $("[data-faq-btn]", it);
      if (!b) return;
      b.setAttribute("role", "button");
      b.setAttribute("tabindex", "0");
      function set(on) {
        it.classList.toggle("is-open", on);
        b.setAttribute("aria-expanded", on ? "true" : "false");
        var pm = $("[data-faq-pm]", it);
        if (pm) pm.textContent = on ? "−" : "+";
      }
      set(i === 0);
      function tg(e) {
        e.preventDefault();
        var on = !it.classList.contains("is-open");
        items.forEach(function (o) {
          if (o !== it) {
            o.classList.remove("is-open");
            var ob = $("[data-faq-btn]", o);
            if (ob) ob.setAttribute("aria-expanded", "false");
            var p = $("[data-faq-pm]", o);
            if (p) p.textContent = "+";
          }
        });
        set(on);
      }
      b.addEventListener("click", tg);
      b.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") tg(e);
      });
    });
  });
})();
