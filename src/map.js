/* Optio — map
 * Founders map: dot map drawn as SVG; countries light up as the list types in.
 * Loads on: Home
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

  $$("[data-map]").forEach(function (root) {
    var box = $("[data-map-dots]", root),
      src = box && box.getAttribute("data-map-data");
    if (!box || !src) return;
    var ns = "http://www.w3.org/2000/svg",
      svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 764 304");
    svg.setAttribute("aria-hidden", "true");
    var groups = {};
    function g(c) {
      if (!groups[c]) {
        var e = document.createElementNS(ns, "g");
        e.style.fill = "var(--_primitives---optio--map-grey)";
        e.setAttribute("opacity", ".5");
        groups[c] = e;
        svg.appendChild(e);
      }
      return groups[c];
    }
    src.split("|").forEach(function (row, r) {
      if (!row) return;
      row.split(" ").forEach(function (run) {
        var p = run.split("."),
          st = parseInt(p[0], 36),
          n = parseInt(p[1], 36),
          c = parseInt(p[2], 36);
        for (var j = 0; j < n; j++) {
          var ci = document.createElementNS(ns, "circle");
          ci.setAttribute("cx", (3.6 + 2.6 * (st + 2 * j)).toFixed(1));
          ci.setAttribute("cy", 6 + 5 * r);
          ci.setAttribute("r", c ? 1.37 : 1.15);
          g(c).appendChild(ci);
        }
      });
    });
    var img = $("img", box);
    if (img) img.style.display = "none";
    box.appendChild(svg);
    var lis = $$("[data-map-list] li", root),
      cnt = $("[data-map-count]", root),
      typ = $("[data-map-typed]", root),
      N = lis.length || 31;
    function lit(k, hot) {
      for (var c = 1; c <= N; c++) {
        var e = groups[c];
        if (!e) continue;
        e.style.fill = hot[c]
          ? "var(--_primitives---optio--orange)"
          : c <= k
            ? "var(--_primitives---optio--sky)"
            : "var(--_primitives---optio--map-grey)";
        e.setAttribute("opacity", c <= k ? 1 : 0.5);
      }
      lis.forEach(function (l, i) {
        l.classList.toggle("is-off", i >= k);
        l.classList.toggle("is-hot", !!hot[i + 1]);
      });
      if (cnt) cnt.textContent = k;
    }
    lit(N, {});
    var r0 = root.getBoundingClientRect();
    if (RM || (r0.top < innerHeight && r0.bottom > 0)) return;
    var full = typ ? typ.textContent : "";
    if (typ) typ.textContent = "";
    lit(0, {});
    onView(root, 0.35, function () {
      var hot = {},
        K = 0;
      if (typ)
        for (var i = 1; i <= full.length; i++)
          (function (i) {
            setTimeout(function () {
              typ.textContent = full.slice(0, i);
            }, i * 45);
          })(i);
      for (var c = 1; c <= N; c++)
        (function (c) {
          setTimeout(
            function () {
              hot[c] = 1;
              K = c;
              lit(K, hot);
            },
            500 + (c - 1) * 150,
          );
          setTimeout(
            function () {
              delete hot[c];
              lit(K, hot);
            },
            500 + (c - 1) * 150 + 500,
          );
        })(c);
    });
  });
})();
