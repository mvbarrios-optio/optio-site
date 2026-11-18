/* Optio — core
 * Nav active state, count-ups and typed lines. Each block only runs if its data-* hook is on the page.
 * Loads on: every page (site-wide)
 */
(function () {
  var RM =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) {
      return (r || document).querySelector(s);
    },
    $$ = function (s, r) {
      return Array.prototype.slice.call((r || document).querySelectorAll(s));
    };
  function onView(el, th, fn, rm) {
    if (!("IntersectionObserver" in window)) {
      fn();
      return;
    }
    var io = new IntersectionObserver(
      function (e) {
        if (e[0].isIntersecting) {
          io.disconnect();
          fn();
        }
      },
      { threshold: th, rootMargin: rm || "0px" },
    );
    io.observe(el);
  }

  var page = (location.pathname.split("/")[1] || "home").toLowerCase();
  page =
    { scorecard: "free", decks: "work" }[page] ||
    (page.indexOf("deck-") === 0 ? "work" : page);
  $$("[data-nav]").forEach(function (a) {
    if (a.getAttribute("data-nav") === page) a.classList.add("is-active");
    else if (page !== "home") a.classList.add("is-dim");
  });

  $$("[data-count]").forEach(function (el) {
    if (RM) return;
    var to = parseFloat(el.getAttribute("data-count")),
      pre = el.getAttribute("data-prefix") || "",
      suf = el.getAttribute("data-suffix") || "",
      dec = +(el.getAttribute("data-dec") || 0),
      fin = el.getAttribute("data-final") || el.textContent,
      dur = +(el.getAttribute("data-dur") || 1400);
    var fmt = function (v) {
      return pre + v.toFixed(dec) + suf;
    };
    el.textContent = fmt(0);
    onView(
      el,
      0.9,
      function () {
        setTimeout(
          function () {
            var t0 = performance.now();
            (function tick(now) {
              var p = Math.min(1, (now - t0) / dur);
              el.textContent = p < 1 ? fmt(to * (1 - Math.pow(1 - p, 3))) : fin;
              if (p < 1) requestAnimationFrame(tick);
            })(t0);
          },
          +(el.getAttribute("data-delay") || 350),
        );
      },
      "0px 0px -30% 0px",
    );
  });

  $$("[data-type]").forEach(function (el) {
    if (RM) return;
    var ls = $$("[data-type-line]", el),
      tx = ls.map(function (l) {
        return l.textContent;
      });
    ls.forEach(function (l) {
      l.textContent = "";
    });
    onView(el, 0.45, function () {
      var li = 0,
        ci = 0;
      (function step() {
        if (li >= ls.length) return;
        ci++;
        ls[li].textContent = tx[li].slice(0, ci);
        if (ci >= tx[li].length) {
          li++;
          ci = 0;
        }
        setTimeout(step, 60);
      })();
    });
  });
})();
