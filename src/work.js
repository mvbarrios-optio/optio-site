/* Optio — work
 * Work hero slide cloud and gallery (crossfade, thumbs, auto-advance).
 * Loads on: Work
 */
(function () {
  var d = document,
    W = window,
    mq = W.matchMedia ? W.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function RM() {
    return !!(mq && mq.matches);
  }
  function $(s, r) {
    return (r || d).querySelector(s);
  }
  function $$(s, r) {
    return Array.prototype.slice.call((r || d).querySelectorAll(s));
  }
  function clamp(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }
  var imgs = $$("[data-w-view] img");
  if (!imgs.length) return;
  /* the gallery images are the one source of slides, hero cards and thumbs */
  var SL = imgs.map(function (im) {
    return { sm: im.getAttribute("src"), alt: im.getAttribute("alt") || "" };
  });
  var N = SL.length;

  /* HERO: seeded spread layout from the board (1440x860 frame), orbit, bob, tilt, parallax, clears on scroll */
  var hero = $("[data-w-hero]"),
    stage = $("[data-w-stage]"),
    box = $("[data-w-cards]"),
    head = $("[data-w-head]");
  if (hero && stage && box && head)
    (function () {
      var seed = 23;
      function rnd() {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      }
      var placed = [],
        L = [];
      function tier(i) {
        return i < 7
          ? [124, 150, 0.4, 0.62]
          : i < 22
            ? [84, 102, 0.48, 0.86]
            : [54, 70, 0.58, 1.0];
      }
      function hit(x, y, w, h, pad) {
        if (Math.abs(x) < 330 + w / 2 && Math.abs(y) < 125 + h / 2) return true;
        return placed.some(function (q) {
          return (
            Math.abs(q.x - x) < (q.w + w) / 2 + pad &&
            Math.abs(q.y - y) < ((q.w * 9) / 16 + h) / 2 + pad
          );
        });
      }
      for (var i = 0; i < N; i++) {
        var T = tier(i),
          w = T[0] + rnd() * (T[1] - T[0]),
          h = (w * 9) / 16,
          best = null;
        for (var k = 0; k < 600 && !best; k++) {
          var pad = k < 400 ? 26 : 12,
            ang = rnd() * Math.PI * 2,
            r = T[2] + rnd() * (T[3] - T[2]),
            x = Math.cos(ang) * r * (690 - w / 2),
            y = Math.sin(ang) * r * (370 - h / 2);
          if (!hit(x, y, w, h, pad)) best = { x: x, y: y, w: w };
        }
        if (!best)
          best = {
            x: (rnd() - 0.5) * 1300,
            y: (rnd() < 0.5 ? -1 : 1) * (300 + rnd() * 60),
            w: w,
          };
        placed.push(best);
        var ax = best.x / (690 - w / 2),
          ay = best.y / (370 - h / 2);
        L.push({
          w: w,
          h: h,
          d: Math.min(1, Math.hypot(best.x / 690, best.y / 370)),
          ang: Math.atan2(ay, ax),
          rad: Math.hypot(ax, ay),
          ph: rnd() * Math.PI * 2,
        });
      }
      var cards = SL.map(function () {
        var c = d.createElement("div");
        c.setAttribute("data-w-card", "1");
        box.appendChild(c);
        return c;
      });
      var a = { sp: 0, t: 0, t0: 0, mx: 0, my: 0, tx: 0, ty: 0 },
        mode = "",
        SW = 1440,
        SH = 860,
        HW = 0,
        HH = 0,
        run = false,
        vis = false,
        raf = 0;
      function ease(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }
      function back(t) {
        var c = 1.6;
        return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
      }
      function getMode() {
        return W.innerWidth < 768 ? "row" : RM() ? "still" : "anim";
      }
      /* headline box in screen px, plus room for bob and parallax */
      function measure() {
        var h1 = $("h1", head),
          p = $("p", head),
          tw = 0;
        if (h1 && d.createRange) {
          var rg = d.createRange();
          rg.selectNodeContents(h1);
          tw = rg.getBoundingClientRect().width;
        }
        if (p) tw = Math.max(tw, p.getBoundingClientRect().width);
        HW = tw / 2 + 40;
        HH = head.offsetHeight / 2 + 30;
      }
      function render() {
        var still = mode === "still",
          p = still ? 0 : a.sp,
          out = ease(clamp(p / 0.85)),
          pop = still ? 1 : clamp((a.t - a.t0) / 1300),
          t = still ? 0 : a.t / 1000,
          sx = Math.min(1, (SW - 40) / 1400),
          sy = Math.min(1, (SH - 40) / 820),
          cs = 0.55 + 0.45 * Math.min(sx, sy),
          spread = 1 + out * 0.9;
        for (var i = 0; i < N; i++) {
          var l = L[i],
            H = l.h,
            k = clamp((pop - l.d * 0.55) / 0.45),
            kk = k > 0 ? back(k) : 0,
            th = l.ang + t * 0.045,
            Ax = 690 - l.w / 2,
            Ay = 370 - H / 2,
            c = Math.abs(Math.cos(th)) || 1e-6,
            sn = Math.abs(Math.sin(th)) || 1e-6;
          /* a slide nearing the headline swings wide of it (board rmin; clear zone never smaller than the real headline; slides shrink a little on narrow stages) */
          var rmin =
              Math.min(
                (Math.max(330 * sx, HW) + (l.w * cs) / 2) / (c * Ax * sx),
                (Math.max(125 * sy, HH) + (H * cs) / 2) / (sn * Ay * sy),
              ) + 0.04,
            r = Math.max(l.rad, rmin),
            dep = l.w / 150;
          var bx = Math.sin(t * 0.7 + l.ph) * 8 - a.mx * 26 * dep,
            by = Math.cos(t * 0.55 + l.ph * 1.3) * 8 - a.my * 18 * dep,
            m = Math.min(1, kk);
          var x = (Math.cos(th) * r * Ax * sx + bx) * m * spread,
            y = (Math.sin(th) * r * Ay * sy + by) * m * spread,
            rot = still ? 0 : Math.sin(t * 0.4 + l.ph) * 2.5,
            sc = Math.max(0, 0.25 + 0.75 * kk) * cs,
            op = Math.min(1, k * 2) * clamp(1 - out * (1.2 + l.d * 0.8));
          var s = cards[i].style;
          s.transform =
            "translate(" +
            x.toFixed(1) +
            "px," +
            y.toFixed(1) +
            "px) rotate(" +
            rot.toFixed(2) +
            "deg) scale(" +
            sc.toFixed(4) +
            ")";
          s.opacity = op.toFixed(3);
          s.visibility = op > 0 ? "" : "hidden";
        }
        head.style.transform = out
          ? "translateY(" + (-out * 40).toFixed(1) + "px)"
          : "";
        head.style.opacity = clamp(1 - out * 2.2).toFixed(3);
      }
      function frame(now) {
        raf = 0;
        if (!run) return;
        a.t = now;
        if (!a.t0) a.t0 = now;
        a.mx += (a.tx - a.mx) * 0.06;
        a.my += (a.ty - a.my) * 0.06;
        var r = hero.getBoundingClientRect(),
          tot = r.height - SH,
          tg = tot > 0 ? clamp(-r.top / tot) : 0;
        a.sp += (tg - a.sp) * 0.12;
        render();
        raf = requestAnimationFrame(frame);
      }
      function start() {
        if (run || mode !== "anim" || !vis) return;
        run = true;
        raf = requestAnimationFrame(frame);
      }
      function stop() {
        run = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }
      function setup() {
        stop();
        mode = getMode();
        if (mode === "row") {
          hero.style.height = "";
          stage.style.height = "";
          stage.style.position = "";
          head.style.transform = "";
          head.style.opacity = "";
          cards.forEach(function (c, i) {
            c.style.cssText = 'background-image:url("' + SL[i].sm + '")';
          });
          return;
        }
        SW = stage.clientWidth || W.innerWidth;
        SH = Math.max(560, Math.min(860, W.innerHeight));
        stage.style.height = SH + "px";
        if (mode === "still") {
          hero.style.height = SH + "px";
          stage.style.position = "relative";
        } else {
          hero.style.height = "";
          stage.style.position = "";
        }
        measure();
        cards.forEach(function (c, i) {
          var l = L[i];
          c.style.cssText =
            "position:absolute;left:50%;top:50%;width:" +
            l.w.toFixed(1) +
            "px;height:" +
            l.h.toFixed(1) +
            "px;margin-left:" +
            (-l.w / 2).toFixed(1) +
            "px;margin-top:" +
            (-l.h / 2).toFixed(1) +
            'px;background:var(--_primitives---optio--ink) url("' +
            SL[i].sm +
            '") center/cover no-repeat;border-radius:0.125rem;box-shadow:0 0 0 0.0313rem color-mix(in srgb, var(--_primitives---optio--ink) 20%, transparent);z-index:' +
            Math.round(l.w) +
            ";opacity:0;will-change:transform,opacity";
        });
        render();
        start();
      }
      stage.addEventListener("mousemove", function (e) {
        if (mode !== "anim") return;
        var r = stage.getBoundingClientRect();
        a.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        a.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      });
      stage.addEventListener("mouseleave", function () {
        a.tx = 0;
        a.ty = 0;
      });
      if ("IntersectionObserver" in W)
        new IntersectionObserver(function (e) {
          vis = e[0].isIntersecting;
          if (vis) start();
          else stop();
        }).observe(hero);
      else vis = true;
      var rt,
        lw = W.innerWidth,
        lh = W.innerHeight;
      W.addEventListener("resize", function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
          if (
            W.innerWidth === lw &&
            Math.abs(W.innerHeight - lh) < 120 &&
            mode !== "still"
          )
            return;
          lw = W.innerWidth;
          lh = W.innerHeight;
          setup();
        }, 150);
      });
      if (mq && mq.addEventListener) mq.addEventListener("change", setup);
      if (d.fonts && d.fonts.ready)
        d.fonts.ready.then(function () {
          if (mode !== "row") {
            measure();
            if (mode === "still") render();
          }
        });
      setup();
    })();

  /* GALLERY: crossfade, progress line, prev/next, thumbs centred on the current slide, auto-advance on screen only */
  var gal = $("[data-w-gal]");
  if (gal)
    (function () {
      var view = $("[data-w-view]", gal),
        bar = $("[data-w-bar]", gal),
        track = $("[data-w-track]", gal),
        prev = $("[data-w-prev]", gal),
        next = $("[data-w-next]", gal),
        cur = 0,
        p = 0,
        t0 = 0,
        hov = false,
        foc = false,
        vis = false,
        run = false,
        raf = 0,
        DUR = 4500,
        th = [];
      if (view) view.classList.add("is-js");
      if (track)
        SL.forEach(function (s, i) {
          var b = d.createElement("button");
          b.type = "button";
          b.setAttribute("data-w-thumb", "1");
          b.setAttribute("aria-label", s.alt.replace(/ slide$/, ""));
          b.style.backgroundImage = 'url("' + s.sm + '")';
          b.addEventListener("click", function () {
            user(i);
          });
          track.appendChild(b);
          th.push(b);
        });
      function paint() {
        imgs.forEach(function (im, i) {
          var on = i === cur;
          im.classList.toggle("is-on", on);
          if (on) {
            im.removeAttribute("aria-hidden");
            if (im.loading === "lazy") im.loading = "eager";
          } else im.setAttribute("aria-hidden", "true");
        });
        var nx = imgs[(cur + 1) % N];
        if (nx && nx.loading === "lazy") nx.loading = "eager";
        th.forEach(function (b, i) {
          var on = i === cur;
          b.classList.toggle("is-on", on);
          b.style.opacity = on
            ? "1"
            : Math.max(0.25, 0.7 - Math.abs(i - cur) * 0.06).toFixed(2);
          b.tabIndex = on ? 0 : -1;
          if (on) b.setAttribute("aria-current", "true");
          else b.removeAttribute("aria-current");
        });
        if (track && th[0]) {
          var tw = th[0].offsetWidth || 120,
            tg = parseFloat(getComputedStyle(track).columnGap) || 10;
          track.style.transform =
            "translateX(" + -(cur * (tw + tg) + tw / 2) + "px)";
        }
        if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
      }
      function go(i) {
        cur = ((i % N) + N) % N;
        p = 0;
        t0 = performance.now();
        paint();
      }
      /* a manual move pauses briefly, then auto-advance resumes */
      var ht = 0;
      function user(i) {
        go(i);
        stop();
        clearTimeout(ht);
        ht = setTimeout(function () {
          hov = false;
          foc = false;
          start();
        }, 3500);
      }
      function frame(now) {
        raf = 0;
        if (!run) return;
        p = Math.min(1, (now - t0) / DUR);
        if (p >= 1) go(cur + 1);
        else if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
        raf = requestAnimationFrame(frame);
      }
      function start() {
        if (run || !vis || hov || foc || RM()) return;
        run = true;
        t0 = performance.now() - p * DUR;
        raf = requestAnimationFrame(frame);
      }
      function stop() {
        run = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }
      function ctl(el, dir) {
        if (el)
          el.addEventListener("click", function () {
            user(cur + dir);
          });
      }
      ctl(prev, -1);
      ctl(next, 1);
      gal.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        var onThumb = th.indexOf(d.activeElement) > -1;
        user(cur + (e.key === "ArrowLeft" ? -1 : 1));
        if (onThumb) th[cur].focus({ preventScroll: true });
      });
      gal.addEventListener("pointerenter", function (e) {
        if (e.pointerType !== "mouse") return;
        hov = true;
        stop();
      });
      gal.addEventListener("pointerleave", function (e) {
        if (e.pointerType !== "mouse") return;
        hov = false;
        start();
      });
      gal.addEventListener("focusin", function (e) {
        var fv = false;
        try {
          fv = e.target.matches(":focus-visible");
        } catch (x) {}
        if (fv) {
          foc = true;
          stop();
        }
      });
      gal.addEventListener("focusout", function (e) {
        if (!gal.contains(e.relatedTarget)) {
          foc = false;
          start();
        }
      });
      if ("IntersectionObserver" in W)
        new IntersectionObserver(function (e) {
          vis = e[0].isIntersecting;
          if (vis) start();
          else stop();
        }).observe(gal);
      else vis = true;
      if (mq && mq.addEventListener)
        mq.addEventListener("change", function () {
          if (RM()) {
            stop();
            p = 0;
            paint();
          } else start();
        });
      W.addEventListener("resize", function () {
        paint();
      });
      paint();
    })();
})();
