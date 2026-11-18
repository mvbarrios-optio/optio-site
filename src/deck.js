/* Optio — deck
 * Deck viewer: slides, thumbnails, progress, prev/next, arrow keys, swipe.
 * Loads on: Decks template (/decks/*)
 */
(function () {
  var d = document,
    W = window,
    mq = W.matchMedia ? W.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function $(s, r) {
    return (r || d).querySelector(s);
  }
  var gal = $("[data-d-gal]"),
    view = gal && $("[data-d-view]", gal);
  if (!view) return;
  var imgs = Array.prototype.slice.call(view.querySelectorAll("img")),
    N = imgs.length;
  if (!N) return;
  var bar = $("[data-d-bar]", gal),
    track = $("[data-d-track]", gal),
    prev = $("[data-d-prev]", gal),
    next = $("[data-d-next]", gal),
    count = $("[data-d-count]", gal),
    h1 = $("[data-d-sec] h1");
  var cur = 0,
    hov = false,
    th = [];
  view.classList.add("is-js");
  view.setAttribute("tabindex", "0");
  view.setAttribute("role", "region");
  view.setAttribute("aria-roledescription", "carousel");
  view.setAttribute(
    "aria-label",
    ((h1 && h1.textContent.trim()) || "Deck") + " slides",
  );
  if (track)
    imgs.forEach(function (im, i) {
      var b = d.createElement("button");
      b.type = "button";
      b.setAttribute("data-d-thumb", "1");
      b.setAttribute("aria-label", "Slide " + (i + 1));
      b.addEventListener("click", function () {
        go(i);
      });
      track.appendChild(b);
      th.push(b);
    });
  /* slides stay display:none (so the lazy load doesn't fetch all 15 at once) until they are about to be shown; once shown they stay */
  function load(im) {
    if (!im) return;
    im.classList.add("is-load");
    if (im.loading === "lazy") im.loading = "eager";
  }
  /* thumbs get their image only when they come into view in the strip */
  function thumbs() {
    if (!track || !th[0]) return;
    var tw = th[0].offsetWidth || 120,
      tg = parseFloat(getComputedStyle(track).columnGap) || 10,
      k = Math.ceil((track.parentNode.clientWidth || W.innerWidth) / (tw + tg) / 2) + 1;
    for (var i = Math.max(0, cur - k); i <= Math.min(N - 1, cur + k); i++)
      if (!th[i].style.backgroundImage)
        th[i].style.backgroundImage = 'url("' + imgs[i].getAttribute("src") + '")';
  }
  function paint() {
    imgs.forEach(function (im, i) {
      var on = i === cur;
      im.classList.toggle("is-on", on);
      if (on) im.removeAttribute("aria-hidden");
      else im.setAttribute("aria-hidden", "true");
    });
    load(imgs[cur]);
    load(imgs[(cur + 1) % N]);
    if (cur > 0) load(imgs[cur - 1]);
    th.forEach(function (b, i) {
      var on = i === cur;
      b.classList.toggle("is-on", on);
      b.style.opacity = on
        ? "1"
        : Math.max(0.3, 0.75 - Math.abs(i - cur) * 0.06).toFixed(2);
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
    thumbs();
    if (bar) bar.style.width = (((cur + 1) / N) * 100).toFixed(2) + "%";
    if (count) count.textContent = cur + 1 + " / " + N;
  }
  function go(i) {
    cur = ((i % N) + N) % N;
    paint();
  }
  /* prev/next are real <button>s, so Enter and Space already work */
  if (prev)
    prev.addEventListener("click", function () {
      go(cur - 1);
    });
  if (next)
    next.addEventListener("click", function () {
      go(cur + 1);
    });
  gal.addEventListener("mouseenter", function () {
    hov = true;
  });
  gal.addEventListener("mouseleave", function () {
    hov = false;
  });
  /* arrow keys while the viewer has focus or the pointer is over it; never while typing */
  d.addEventListener("keydown", function (e) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var a = d.activeElement,
      inGal = gal.contains(a);
    if (!inGal && !hov) return;
    if (
      !inGal &&
      a &&
      (/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName) || a.isContentEditable)
    )
      return;
    e.preventDefault();
    var onThumb = th.indexOf(a) > -1;
    go(cur + (e.key === "ArrowLeft" ? -1 : 1));
    if (onThumb) th[cur].focus({ preventScroll: true });
  });
  /* swipe on touch screens */
  var sx = 0,
    sy = 0;
  view.addEventListener(
    "touchstart",
    function (e) {
      var t = e.touches[0];
      sx = t.clientX;
      sy = t.clientY;
    },
    { passive: true },
  );
  view.addEventListener(
    "touchend",
    function (e) {
      var t = e.changedTouches[0],
        dx = t.clientX - sx,
        dy = t.clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3)
        go(cur + (dx < 0 ? 1 : -1));
    },
    { passive: true },
  );
  var rt;
  W.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(paint, 100);
  });
  if (mq && mq.addEventListener) mq.addEventListener("change", paint);
  paint();
})();
