/* Optio — scorecard
 * Pitch deck scorecard: questions, slider, email step and results.
 * Loads on: Scorecard
 */
(function () {
  /* =====================================================================
   OPTIO PITCH DECK SCORECARD — every word the questions use lives in SC.
   Edit wording here. a = area (0 Story, 1 Proof, 2 Clarity).
   Scored answers: first option = 2 points, second = 1, third = 0.
   Any answer below the top one adds that question's fix to the results.
   ===================================================================== */
  var SC = {
    areas: ["Story", "Proof", "Clarity"],
    scale: ["Yes", "Sort of", "Not yet"],
    q: [
      {
        a: 0,
        q: "Could an investor repeat what you do to their partner in one sentence?",
        fix: "Write the one sentence your investor will say to their partner on Monday. Then make your deck say it.",
      },
      {
        a: 0,
        q: "Do your first slides open on your customer’s problem?",
        fix: "Your customer is the hero. The first five to eight slides are the story. Start with them.",
      },
      {
        a: 1,
        q: "Do your headlines say the point, or just the topic?",
        ex: "headline",
        o: ["They say the point", "A mix of both", "They say the topic"],
        fix: "A headline is the one thing you want investors to believe. Everything under it is evidence. “The Problem” is a topic. “Labor is construction’s $4 trillion problem” is a point.",
      },
      {
        a: 1,
        q: "Does your deck give investors a reason to be greedy and a reason to feel safe?",
        hint: "Greedy: market and vision. Safe: team and traction.",
        fix: "Market and vision make investors greedy. Team and traction make them safe. Give them both.",
      },
      {
        a: 2,
        q: "How many slides is your main deck?",
        count: true,
        fix: "Aim for about 14 slides, one message each. Everything else goes in a strong appendix.",
      },
      {
        a: 2,
        q: "Could someone get each slide in about 6 seconds?",
        fix: "Investors spend under two minutes on a deck (DocSend). Be simple, not precise.",
      },
      {
        a: 2,
        q: "Do your slides show more than they tell?",
        ex: "show",
        fix: "“I hate bullet points. I tolerate boxes.” Show, don’t tell. Design should communicate instead of decorate.",
      },
    ],
    /* slide-count slider: 10-20 scores 2, 8-9 or 21-25 scores 1, anything else 0 */
    count: { min: 5, max: 40, start: 20 },
    /* about you (not scored). stage option 5 = sales deck; sales decks skip the list question */
    about: [
      {
        k: "stage",
        q: "What stage are you at?",
        o: [
          "Pre-seed or seed",
          "Series A",
          "Series B or later",
          "Raising a fund",
          "It’s a sales deck",
        ],
      },
      {
        k: "timing",
        q: "When do you start pitching?",
        o: [
          "I’m pitching now",
          "In the next 3 months",
          "In 3 to 6 months",
          "Later than that",
        ],
      },
      {
        k: "history",
        q: "What’s happened so far?",
        o: [
          "I haven’t sent it yet",
          "Sent it, got few meetings",
          "Meetings, still waiting on a term sheet",
          "I’ve raised before and I’m raising again",
        ],
      },
      {
        k: "list",
        q: "Do you have a list of investors to send it to?",
        o: ["Yes, a real list", "A few names", "Not yet"],
        skipSales: true,
      },
      {
        k: "help",
        q: "What would help most?",
        o: [
          "Videos and templates",
          "Feedback on my deck",
          "A team to rebuild it with me",
        ],
      },
    ],
    /* [min score, verdict, line, line for sales decks] */
    tiers: [
      [
        80,
        "Your deck is ready to send.",
        "Tighten the slides below and get it out the door.",
        "Tighten the slides below and take it to your next meeting.",
      ],
      [
        50,
        "You’re close.",
        "A few slides are costing you meetings. Start here.",
        "A few slides are costing you deals. Start here.",
      ],
      [
        0,
        "Start with the story.",
        "Investors give a deck under two minutes. Yours needs a new story first, and these are the places to start.",
        "Buyers give a deck a couple of minutes. Yours needs a new story first.",
      ],
    ],
    /* shown when every answer is the top one; these founders still go to route A (a call) */
    allYes:
      "Top marks on paper. Investors grade harder than a quiz, so let’s walk through it together before you send it.",
    /* route C "Watch:" line, by weakest area (Story, Proof, Clarity). There is no story video yet, so Story uses the build video. */
    videos: [
      {
        t: "How to make a pitch deck that gets funded",
        u: "https://www.youtube.com/watch?v=Dt5EFTlf8oE",
      },
      {
        t: "How to make a pitch deck that gets funded",
        u: "https://www.youtube.com/watch?v=Dt5EFTlf8oE",
      },
      {
        t: "How to design a pitch deck",
        u: "https://www.youtube.com/watch?v=k1MmoLVWpwM",
      },
    ],
    ui: {
      question: "Question",
      of: "of",
      about: "About you",
      took: "Takes about three minutes.",
      last: "Scorecard · Last step",
      result: "Scorecard · Your score",
      keys3: "Esc to go back",
      keysN: "Esc to go back",
      keysCount: "← → to adjust · Enter for next",
      keysEmail: "Enter to see your score",
      run: "> scorecard --run",
      score: "> scorecard --score",
      slides: "slides",
    },
  };
  /* route: A = talk to a strategist, C = free stuff. ab holds option indexes */
  function route(ab) {
    if (ab.timing > 1) return "C"; /* not pitching within 3 months */
    if (ab.stage === 4) return "A"; /* sales deck pitching within 3 months */
    return ab.help >= 1 || ab.history === 3 || ab.stage >= 1 ? "A" : "C";
  }
  function countPts(n) {
    return n >= 10 && n <= 20 ? 2 : n >= 8 && n <= 25 ? 1 : 0;
  }
  /* ===================================================================== */

  var root = document.querySelector('[data-sc-screen="run"]'),
    intro = document.querySelector('[data-sc-screen="intro"]');
  if (!root || !intro) return;
  var RM =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) {
      return (r || root).querySelector(s);
    },
    $$ = function (s, r) {
      return Array.prototype.slice.call((r || root).querySelectorAll(s));
    };
  var NQ = SC.q.length,
    NA = SC.about.length,
    EMAIL = NQ + NA + 1,
    RESULT = EMAIL + 1;
  var el = {
    tab: $("[data-sc-tab]"),
    took: $("[data-sc-took]"),
    top: $("[data-sc-top]"),
    back: $("[data-sc-back]"),
    count: $("[data-sc-count]"),
    prog: $("[data-sc-prog]"),
    pane: $("[data-sc-pane]"),
    cmd: $("[data-sc-cmd]"),
    keys: $("[data-sc-keys]"),
    qgrid: $("[data-sc-qgrid]"),
    q: $("[data-sc-q]"),
    hint: $("[data-sc-hint]"),
    opts: $("[data-sc-opts]"),
    cq: $("[data-sc-cq]"),
    num: $("[data-sc-num]"),
    range: $("[data-sc-range]"),
    minis: $("[data-sc-minis]"),
    next: $("[data-sc-next]"),
    cform: $("[data-sc-countform]"),
    eq: $("[data-sc-eq]"),
    form: $("[data-sc-form]"),
    score: $("[data-sc-score]"),
    verdict: $("[data-sc-verdict]"),
    vline: $("[data-sc-vline]"),
    fixes: $("[data-sc-fixes]"),
    allyes: $("[data-sc-allyes]"),
    watch: $("[data-sc-watch]"),
  };
  var bodies = {};
  $$("[data-sc-body]").forEach(function (b) {
    bodies[b.getAttribute("data-sc-body")] = b;
  });
  var optEls = $$("[data-sc-opt]"),
    exEls = $$("[data-sc-ex]"),
    bars = $$("[data-sc-bar]"),
    fixEls = $$("[data-sc-fix]"),
    routes = $$("[data-sc-route]");
  var st = {
    n: 0,
    pts: [],
    ans: {},
    ab: {},
    count: SC.count.start,
    busy: false,
    v: "",
  };
  try {
    st.v = new URLSearchParams(location.search).get("v") || "";
  } catch (e) {}
  if (st.v) root.setAttribute("data-sc-v", st.v);

  function txt(e, t) {
    if (e) e.textContent = t;
  }
  function gone(e, on) {
    if (e) e.classList.toggle("is-hidden", !!on);
  }
  function sales() {
    return st.ab.stage === 4;
  }
  function skipped(n) {
    var i = n - NQ - 1;
    return i >= 0 && i < NA && SC.about[i].skipSales && sales();
  }
  function total() {
    return NQ + NA - (sales() ? 1 : 0);
  }
  function shown(n) {
    return n - (n > NQ + 4 && sales() ? 1 : 0);
  }
  function step(n, d) {
    n += d;
    while (skipped(n)) n += d;
    return n;
  }

  function show(kind) {
    for (var k in bodies) bodies[k].classList.toggle("is-visible", k === kind);
    intro.classList.add("is-hidden");
    root.classList.add("is-visible");
    if (el.pane && !RM) {
      el.pane.classList.remove("is-anim");
      void el.pane.offsetWidth;
      el.pane.classList.add("is-anim");
    }
  }
  function frame(tab, took, n, keys, cmd) {
    txt(el.tab, tab);
    txt(el.took, took);
    txt(el.keys, keys);
    txt(el.cmd, cmd || SC.ui.run);
    gone(el.top, n === null);
    if (n !== null) {
      var t = total();
      txt(el.count, n + " / " + t);
      if (el.prog) el.prog.style.width = (n / t) * 100 + "%";
    }
  }
  function focus(h) {
    if (!h) return;
    h.setAttribute("tabindex", "-1");
    try {
      h.focus({ preventScroll: true });
    } catch (e) {
      h.focus();
    }
  }
  function reveal() {
    var r = root.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.5)
      window.scrollTo({
        top: window.pageYOffset + r.top - 16,
        behavior: RM ? "auto" : "smooth",
      });
  }

  function go(n, quiet) {
    st.n = n;
    st.busy = false;
    if (n <= 0) {
      root.classList.remove("is-visible");
      intro.classList.remove("is-hidden");
      for (var k in bodies) bodies[k].classList.remove("is-visible");
      if (!quiet) {
        reveal();
        var b = intro.querySelector("[data-sc-start]");
        if (b) b.focus();
      }
      return;
    }
    if (n === RESULT) {
      results();
      return;
    }
    if (n === EMAIL) {
      show("email");
      frame(SC.ui.last, "", total(), SC.ui.keysEmail);
      if (!quiet) {
        reveal();
        focus(el.eq);
      }
      return;
    }
    var t = total(),
      k = shown(n);
    if (n <= NQ && SC.q[n - 1].count) {
      var x = SC.q[n - 1];
      show("count");
      txt(el.cq, x.q);
      setCount(st.count);
      frame(
        SC.areas[x.a] +
          " · " +
          SC.ui.question +
          " " +
          k +
          " " +
          SC.ui.of +
          " " +
          t,
        SC.ui.took,
        k,
        SC.ui.keysCount,
      );
      if (!quiet) {
        reveal();
        focus(el.cq);
      }
      return;
    }
    var isQ = n <= NQ,
      x = isQ ? SC.q[n - 1] : SC.about[n - NQ - 1],
      list = isQ ? x.o || SC.scale : x.o;
    show("q");
    txt(el.q, x.q);
    if (el.hint) {
      txt(el.hint, x.hint || "");
      gone(el.hint, !x.hint);
    }
    if (el.qgrid) el.qgrid.classList.toggle("is-example", !!x.ex);
    exEls.forEach(function (e) {
      gone(e, e.getAttribute("data-sc-ex") !== x.ex);
    });
    if (el.opts)
      el.opts.setAttribute("data-sc-size", x.ex ? "s" : isQ ? "l" : "m");
    optEls.forEach(function (o, i) {
      var on = i < list.length;
      gone(o, !on);
      o.classList.remove("is-on", "is-end");
      if (!on) return;
      txt($(".scorecard_opt-t", o), list[i]);
      txt($(".scorecard_opt-n", o), (i < 9 ? "0" : "") + (i + 1));
      if (st.ans[n] === i) o.classList.add("is-on");
      if (i === list.length - 1) o.classList.add("is-end");
    });
    var keys =
      list.length <= 3 ? SC.ui.keys3 : SC.ui.keysN.replace("{n}", list.length);
    frame(
      (isQ ? SC.areas[x.a] : SC.ui.about) +
        " · " +
        SC.ui.question +
        " " +
        k +
        " " +
        SC.ui.of +
        " " +
        t,
      SC.ui.took,
      k,
      keys,
    );
    if (!quiet) {
      reveal();
      focus(el.q);
    }
  }
  function choose(v) {
    if (st.busy) return;
    var n = st.n;
    if (n < 1 || n > NQ + NA || (n <= NQ && SC.q[n - 1].count)) return;
    var len =
      n <= NQ
        ? (SC.q[n - 1].o || SC.scale).length
        : SC.about[n - NQ - 1].o.length;
    if (v < 0 || v >= len) return;
    st.busy = true;
    st.ans[n] = v;
    if (n <= NQ) st.pts[n - 1] = Math.max(0, 2 - v);
    else st.ab[SC.about[n - NQ - 1].k] = v;
    optEls.forEach(function (o, i) {
      o.classList.toggle("is-on", i === v);
    });
    setTimeout(
      function () {
        go(step(n, 1));
      },
      RM ? 0 : 170,
    );
  }
  function back() {
    if (st.n >= 1 && st.n <= EMAIL) go(step(st.n, -1));
  }

  /* slide-count slider */
  function setCount(v) {
    v = Math.max(
      SC.count.min,
      Math.min(SC.count.max, Math.round(+v || SC.count.start)),
    );
    st.count = v;
    if (el.range && +el.range.value !== v) el.range.value = v;
    txt(el.num, v >= SC.count.max ? SC.count.max + "+" : String(v));
    if (el.range)
      el.range.setAttribute(
        "aria-valuetext",
        (v >= SC.count.max ? SC.count.max + "+" : v) + " " + SC.ui.slides,
      );
    if (el.minis) {
      var c = el.minis.children.length;
      while (c < v) {
        el.minis.appendChild(document.createElement("i"));
        c++;
      }
      while (c > v) {
        el.minis.removeChild(el.minis.lastChild);
        c--;
      }
    }
  }
  function countNext() {
    if (st.n < 1 || st.n > NQ || !SC.q[st.n - 1].count) return;
    st.ans[st.n] = st.count;
    st.pts[st.n - 1] = countPts(st.count);
    go(step(st.n, 1));
  }
  if (el.range) {
    el.range.addEventListener("input", function () {
      setCount(el.range.value);
    });
    el.range.addEventListener("change", function () {
      setCount(el.range.value);
    });
  }
  if (el.cform)
    el.cform.addEventListener("submit", function (e) {
      e.preventDefault();
      e.stopPropagation();
      countNext();
    });
  if (el.next)
    el.next.addEventListener("click", function (e) {
      e.preventDefault();
      countNext();
    });

  /* results: computed in the browser only, never sent anywhere */
  function score() {
    var area = [0, 0, 0],
      max = [0, 0, 0],
      sum = 0;
    SC.q.forEach(function (x, i) {
      var p = st.pts[i] || 0;
      area[x.a] += p;
      max[x.a] += 2;
      sum += p;
    });
    var rate = area.map(function (v, i) {
      return v / max[i];
    });
    var fixes = SC.q
      .map(function (x, i) {
        return { i: i, a: x.a, p: st.pts[i] || 0, fix: x.fix };
      })
      .filter(function (f) {
        return f.p < 2;
      })
      .sort(function (m, n) {
        return m.p - n.p || rate[m.a] - rate[n.a] || m.i - n.i;
      })
      .slice(0, 3);
    var tot = Math.round((sum / (NQ * 2)) * 100),
      tier = SC.tiers.filter(function (t) {
        return tot >= t[0];
      })[0];
    return {
      total: tot,
      area: area,
      max: max,
      fixes: fixes,
      tier: tier,
      weak: rate.indexOf(Math.min.apply(null, rate)),
      route: fixes.length ? route(st.ab) : "A",
    };
  }
  function results() {
    var r = score(),
      sl = sales();
    st.n = RESULT;
    st.result = { total: r.total, route: r.route };
    show("result");
    frame(SC.ui.result, "", null, "", SC.ui.score);
    txt(el.verdict, r.tier[1]);
    txt(el.vline, r.tier[sl ? 3 : 2]);
    bars.forEach(function (b, i) {
      var f = $("[data-sc-barf]", b);
      txt($("[data-sc-barv]", b), r.area[i] + " / " + r.max[i]);
      if (f) {
        f.style.width = "0%";
        var w = (r.area[i] / r.max[i]) * 100 + "%";
        if (RM) f.style.width = w;
        else
          setTimeout(
            function () {
              f.style.width = w;
            },
            120 + i * 150,
          );
      }
    });
    fixEls.forEach(function (li, i) {
      var f = r.fixes[i];
      gone(li, !f);
      li.classList.toggle("is-end", i === r.fixes.length - 1);
      if (f) txt($("[data-sc-fixt]", li), f.fix);
    });
    gone(el.fixes, !r.fixes.length);
    if (el.allyes) {
      txt(el.allyes, SC.allYes);
      gone(el.allyes, !!r.fixes.length);
    }
    routes.forEach(function (b) {
      gone(b, b.getAttribute("data-sc-route") !== r.route);
    });
    if (el.watch) {
      var vd = SC.videos[r.weak] || SC.videos[1];
      txt(el.watch, vd.t);
      el.watch.setAttribute("href", vd.u);
    }
    root.setAttribute("data-sc-result", r.route);
    if (el.score) {
      if (RM) txt(el.score, r.total);
      else {
        var t0 = null;
        txt(el.score, "0");
        (function tick(now) {
          if (t0 === null) t0 = now;
          var p = Math.min(1, (now - t0) / 1000);
          txt(el.score, Math.round(r.total * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        })(performance.now());
      }
    }
    reveal();
    focus(el.verdict);
    return r;
  }

  /* email step: a real Webflow form (name, email, memo only). Webflow submits it; we show the results at once. */
  if (el.form)
    el.form.addEventListener("submit", function () {
      if (el.form.checkValidity && !el.form.checkValidity()) return;
      results();
    });

  /* clicks */
  var start = intro.querySelector("[data-sc-start]");
  if (start)
    start.addEventListener("click", function (e) {
      e.preventDefault();
      go(1);
    });
  if (el.back) {
    el.back.setAttribute("role", "button");
    el.back.addEventListener("click", function (e) {
      e.preventDefault();
      back();
    });
  }
  optEls.forEach(function (o) {
    o.setAttribute("role", "button");
    o.addEventListener("click", function (e) {
      e.preventDefault();
      choose(+o.getAttribute("data-sc-opt"));
    });
  });

  /* keys: 1-5 answer, Esc back, slider arrows + Enter */
  document.addEventListener("keydown", function (e) {
    if (st.n < 1 || st.n === RESULT || e.metaKey || e.ctrlKey || e.altKey)
      return;
    var t = e.target,
      tag = t && t.tagName,
      typing =
        (tag === "INPUT" && t.type !== "range" && t.type !== "checkbox") ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (t && t.isContentEditable);
    if (e.key === "Escape" || e.key === "Esc") {
      e.preventDefault();
      back();
      return;
    }
    if (typing) return;
    var isCount = st.n <= NQ && SC.q[st.n - 1].count;
    if (isCount) {
      if (e.key === "Enter" && !(t.closest && t.closest("a"))) {
        e.preventDefault();
        countNext();
      } else if (
        (e.key === "ArrowLeft" || e.key === "ArrowRight") &&
        t !== el.range
      ) {
        e.preventDefault();
        setCount(st.count + (e.key === "ArrowRight" ? 1 : -1));
      }
      return;
    }
    if (st.n <= NQ + NA && /^[1-9]$/.test(e.key)) {
      e.preventDefault();
      choose(+e.key - 1);
    }
  });

  setCount(st.count);
  /* for tests and later use: no storage, nothing sent */
  window.optioScorecard = {
    SC: SC,
    state: st,
    go: go,
    results: results,
    score: score,
    route: route,
  };
})();
