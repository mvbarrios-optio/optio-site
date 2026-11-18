/* Optio — reviews
 * Reviews pile: stacked notes that open on hover; stacked list on phones.
 * Loads on: Home, Work
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

  $$("[data-reviews]").forEach(function (root) {
    var wrap = $("[data-rev-wrap]", root),
      pile = $("[data-rev-pile]", root),
      notes = $$(".reviews_note", pile);
    if (!wrap || !pile || !notes.length) return;
    var open = -1,
      shown = notes.length,
      mode = "",
      timer = 0;
    function m() {
      return innerWidth < 768 ? "stack" : RM ? "flat" : "reveal";
    }
    function paint() {
      notes.forEach(function (n, i) {
        if (mode === "stack") {
          n.style.cssText = "";
          return;
        }
        var on = i === open,
          vis = i < shown;
        n.style.position = "absolute";
        n.style.left = n.getAttribute("data-x") + "px";
        n.style.top = n.getAttribute("data-y") + "px";
        n.style.width = (on ? 500 : 330) + "px";
        n.style.zIndex = on ? 100 : n.getAttribute("data-z");
        n.style.opacity = vis ? 1 : 0;
        n.style.transform =
          "rotate(" +
          (on ? 0 : n.getAttribute("data-r")) +
          "deg) scale(" +
          (on ? 1.06 : vis ? 1 : 0.9) +
          ")";
      });
    }
    function layout() {
      var was = mode;
      mode = m();
      if (mode === "stack") {
        wrap.style.cssText = "";
        pile.style.cssText = "";
        shown = notes.length;
        paint();
        return;
      }
      if (mode === "reveal" && was !== "reveal") shown = 0;
      var k = Math.min(1, wrap.clientWidth / 1152);
      wrap.style.cssText =
        "position:relative;height:" + Math.round(660 * k) + "px";
      pile.style.cssText =
        "position:absolute;left:50%;top:0;width:1152px;height:660px;transform-origin:50% 0;transform:translateX(-50%) scale(" +
        k.toFixed(4) +
        ")";
      scroll();
    }
    function scroll() {
      if (mode !== "reveal") {
        shown = notes.length;
        paint();
        return;
      }
      if (timer || shown >= notes.length) return;
      if (wrap.getBoundingClientRect().top < innerHeight * 0.8) {
        (function next() {
          shown++;
          paint();
          timer = shown < notes.length ? setTimeout(next, 170) : 0;
        })();
      }
    }
    notes.forEach(function (n, i) {
      n.addEventListener("mouseenter", function () {
        if (mode === "stack") return;
        open = i;
        n.classList.add("is-open");
        paint();
      });
      n.addEventListener("mouseleave", function () {
        if (open === i) open = -1;
        n.classList.remove("is-open");
        paint();
      });
    });
    layout();
    paint();
    addEventListener(
      "scroll",
      function () {
        if (mode === "reveal" && shown < notes.length) scroll();
      },
      { passive: true },
    );
    var rt;
    addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(layout, 120);
    });
  });
})();
