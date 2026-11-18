/* Optio — free
 * Free resources: library window, filters, memo placeholder, scorecard band.
 * Loads on: Free
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
  /* hero library window: rows slide in one by one and count up */
  var rows = $$("[data-f-row]");
  if (rows.length && !RM && window.innerHeight <= 1800) {
    rows.forEach(function (r) {
      r.classList.add("is-off");
      var c = $("[data-f-n]", r);
      if (c) c.textContent = "00";
    });
    rows.forEach(function (r, i) {
      setTimeout(
        function () {
          r.classList.remove("is-off");
          var c = $("[data-f-n]", r);
          if (!c) return;
          var to = +c.getAttribute("data-f-n"),
            t0 = performance.now();
          (function tick(now) {
            var p = Math.min(1, Math.max(0, (now - t0) / 600));
            c.textContent = String(
              Math.round(to * (1 - Math.pow(1 - p, 3))),
            ).padStart(2, "0");
            if (p < 1) requestAnimationFrame(tick);
          })(t0);
        },
        250 + i * 200,
      );
    });
  }
  /* library filters; the hero window row for the chosen kind lights up (none for All) */
  var btns = $$("[data-f-filter]"),
    cards = $$("[data-f-cat]"),
    keys = ["templates", "videos", "tools"];
  function setF(k) {
    btns.forEach(function (b) {
      var on = b.getAttribute("data-f-filter") === k;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
      var n = $(".free-library_filter-count", b);
      if (n) n.classList.toggle("is-active", on);
    });
    cards.forEach(function (c) {
      c.style.display =
        k === "all" || c.getAttribute("data-f-cat") === k ? "" : "none";
    });
    rows.forEach(function (r, i) {
      var on = keys[i] === k;
      r.classList.toggle("is-active", on);
      var c = $("[data-f-n]", r);
      if (c) c.classList.toggle("is-hot", on);
    });
  }
  var lib = $("#library");
  rows.forEach(function (r, i) {
    if (!keys[i]) return;
    r.setAttribute("role", "button");
    r.setAttribute("tabindex", "0");
    r.setAttribute("aria-label", "Show " + keys[i]);
    function go() {
      setF(keys[i]);
      if (lib)
        lib.scrollIntoView({
          behavior: RM ? "auto" : "smooth",
          block: "start",
        });
    }
    r.addEventListener("click", go);
    r.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });
  btns.forEach(function (b) {
    b.setAttribute("role", "button");
    b.addEventListener("click", function (e) {
      e.preventDefault();
      setF(b.getAttribute("data-f-filter"));
    });
    b.addEventListener("keydown", function (e) {
      if (e.key === " ") {
        e.preventDefault();
        setF(b.getAttribute("data-f-filter"));
      }
    });
  });
  /* /free#templates, #videos or #tools opens the library on that filter */
  function fromHash() {
    var k = (location.hash || "").slice(1).toLowerCase();
    if (keys.indexOf(k) < 0) return false;
    setF(k);
    if (lib)
      setTimeout(function () {
        lib.scrollIntoView({ behavior: "auto", block: "start" });
      }, 60);
    return true;
  }
  if (btns.length && !fromHash()) setF("all");
  window.addEventListener("hashchange", fromHash);
  /* memo email: placeholder (the API cannot set it) and label link */
  var em = $("#memo-email");
  if (em && !em.getAttribute("placeholder"))
    em.setAttribute("placeholder", "you@company.com");
  var lb = $("label.free-memo_label");
  if (lb && em) lb.setAttribute("for", em.id);
  /* scorecard band: bars grow when it scrolls into view (the score uses the shared data-count hook) */
  var band = $("[data-f-band]"),
    fills = $$("[data-f-bar]");
  if (
    band &&
    fills.length &&
    !RM &&
    "IntersectionObserver" in window &&
    band.getBoundingClientRect().top > window.innerHeight
  ) {
    fills.forEach(function (f) {
      f.style.width = "0%";
    });
    var io = new IntersectionObserver(
      function (e) {
        if (!e[0].isIntersecting) return;
        io.disconnect();
        fills.forEach(function (f) {
          f.style.width = "";
        });
      },
      { threshold: 0.4 },
    );
    io.observe(band);
  }
})();
