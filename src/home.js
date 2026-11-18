/* Optio — home
 * Hero ring of slides (scroll-driven), with reduced-motion fallback.
 * Loads on: Home
 */
(function () {
  var $ = function (s, r) {
      return (r || document).querySelector(s);
    },
    $$ = function (s, r) {
      return Array.prototype.slice.call((r || document).querySelectorAll(s));
    };
  var hero = $("[data-h-hero]");
  if (!hero) return;
  var stage = $("[data-h-stage]", hero),
    ring = $("[data-h-ring]", hero),
    grid = $("[data-h-grid]", hero),
    center = $("[data-h-center]", hero),
    work = $("[data-h-work]", hero);
  if (!stage || !ring) return;
  var cards = $$("img", ring),
    N2 = cards.length;
  if (!N2) return;
  var C = -1;
  for (var ci = 0; ci < N2; ci++) {
    if (/red-bull/i.test(cards[ci].getAttribute("src") || "")) {
      C = ci;
      break;
    }
  }
  if (C < 0) C = Math.round((N2 * 25) / 46);
  var mq = window.matchMedia
      ? matchMedia("(prefers-reduced-motion:reduce)")
      : { matches: false },
    a = { spin: 0, sp: 0, last: 0 },
    live = false,
    near = true,
    raf = 0,
    key = "",
    dims = "";
  var clamp = function (v) {
      return v < 0 ? 0 : v > 1 ? 1 : v;
    },
    lerp = function (x, y, t) {
      return x + (y - x) * t;
    },
    ease = function (t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },
    range = function (p, x, y) {
      return clamp((p - x) / (y - x));
    },
    wrap = function (v) {
      return ((((v + N2 / 2) % N2) + N2) % N2) - N2 / 2;
    };
  function target() {
    var r = hero.getBoundingClientRect(),
      total = hero.offsetHeight - stage.offsetHeight;
    return total > 0 ? clamp(-r.top / total) : 0;
  }
  function step(now) {
    var dt = a.last ? Math.min(64, now - a.last) : 16;
    a.last = now;
    var t = target();
    a.sp += (t - a.sp) * 0.12;
    if (Math.abs(t - a.sp) < 1e-4) a.sp = t;
    var q = clamp((a.sp - 0.01) / 0.23);
    if (q < 1) a.spin += dt * 0.000045 * (1 - q * 0.9);
  }
  function render() {
    var SW = stage.clientWidth,
      SH = stage.clientHeight,
      W = Math.min(380, Math.max(220, SW * 0.25), SH * 0.42),
      H = (W * 9) / 16,
      R = Math.min(SW, SH) * 0.5 * (SW < 768 ? 0.86 : 0.76),
      sc0 = (R * 0.3) / W,
      OV = SW < 480 ? 1.18 : 1;
    var SKEW = 27,
      SQX = 0.8,
      A = 1.32,
      dx = 0.894,
      dy = -0.447,
      oy = 40 + Math.max(0, 860 - SH) * 0.5,
      G = W,
      need = SW / 2 / dx + W,
      stp = Math.max(10, (need - G) / (C - 1)),
      p = a.sp,
      q = range(p, 0.01, 0.24),
      s = range(p, 0.26, 0.97) * N2;
    var k2 =
      p.toFixed(5) +
      "|" +
      (q < 1 ? a.spin.toFixed(5) : "") +
      "|" +
      SW +
      "|" +
      SH;
    if (k2 === key) return;
    key = k2;
    var d2 = W.toFixed(1);
    if (d2 !== dims) {
      dims = d2;
      cards.forEach(function (c) {
        c.style.width = W.toFixed(1) + "px";
        c.style.height = H.toFixed(1) + "px";
        c.style.marginLeft = (-W / 2).toFixed(1) + "px";
        c.style.marginTop = (-H / 2).toFixed(1) + "px";
      });
    }
    for (var i = 0; i < N2; i++) {
      var k = wrap(i - C - s),
        ak = Math.abs(k),
        th = a.spin * Math.PI * 2 + (i / N2) * Math.PI * 2 - Math.PI / 2,
        cx = Math.cos(th) * R,
        cy = Math.sin(th) * R * OV,
        cr = ((th * 180) / Math.PI) % 360;
      if (cr > 180) cr -= 360;
      if (cr < -180) cr += 360;
      var off =
          (k < 0 ? -1 : k > 0 ? 1 : 0) * (ak < 1 ? G * ak : G + (ak - 1) * stp),
        sSc = lerp(A, 1, Math.min(1, ak)),
        sx = off * dx,
        sy = oy + off * dy,
        t = ease(clamp((q - (i / N2) * 0.45) / 0.55));
      var c = cards[i];
      c.style.transform =
        "translate3d(" +
        lerp(cx, sx, t).toFixed(2) +
        "px," +
        lerp(cy, sy, t).toFixed(2) +
        "px,0) rotate(" +
        lerp(cr, 0, t).toFixed(2) +
        "deg) skewY(" +
        lerp(0, SKEW, t).toFixed(2) +
        "deg) scale(" +
        (lerp(sc0, sSc, t) * lerp(1, SQX, t)).toFixed(4) +
        "," +
        lerp(sc0, sSc, t).toFixed(4) +
        ")";
      c.style.zIndex = t < 0.5 ? N2 - i : 400 - Math.round(k * 6);
    }
    var intro = 1 - range(p, 0.005, 0.05),
      w = range(p, 0.17, 0.26);
    if (center) {
      center.style.opacity = intro.toFixed(3);
      center.style.transform =
        "translate(-50%,calc(-50% + " + ((1 - intro) * -24).toFixed(1) + "px))";
      center.style.visibility = intro < 0.02 ? "hidden" : "visible";
    }
    if (grid) grid.style.opacity = w.toFixed(3);
    if (work) {
      work.style.opacity = w.toFixed(3);
      work.style.transform = "translateY(" + ((1 - w) * 20).toFixed(1) + "px)";
      work.style.pointerEvents = w > 0.5 ? "auto" : "none";
      work.style.visibility = w < 0.01 ? "hidden" : "visible";
    }
  }
  function loop(now) {
    raf = 0;
    if (!live || !near) return;
    step(now);
    render();
    raf = requestAnimationFrame(loop);
  }
  function kick() {
    if (live && near && !raf) {
      a.last = 0;
      raf = requestAnimationFrame(loop);
    }
  }
  function clear() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    cards.forEach(function (c) {
      c.style.cssText = "";
    });
    [grid, center, work].forEach(function (e) {
      if (e) e.style.cssText = "";
    });
    hero.removeAttribute("data-h-ready");
    key = "";
    dims = "";
  }
  function mode() {
    var l = !mq.matches;
    if (l === live) return;
    live = l;
    if (!live) {
      clear();
      return;
    }
    a.sp = target();
    a.spin = 0;
    render();
    hero.setAttribute("data-h-ready", "1");
    kick();
  }
  if ("IntersectionObserver" in window)
    new IntersectionObserver(
      function (e) {
        near = e[0].isIntersecting;
        kick();
      },
      { rootMargin: "300px 0px" },
    ).observe(hero);
  if (mq.addEventListener) mq.addEventListener("change", mode);
  addEventListener("resize", function () {
    key = "";
    if (live) render();
  });
  mode();
})();
