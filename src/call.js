/* Optio — call
 * Call page tabs (book / message / roast), placeholders and Roast-my-deck PDF upload. Calendly widget.js is loaded separately.
 * Loads on: Call
 */
(function () {
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };
  var tabs = $$("[data-c-tab]"),
    panels = $$("[data-c-panel]"),
    list = document.querySelector("[data-c-tabs]"),
    win = document.querySelector("[data-c-win]");
  var RM =
    window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* placeholders live in data-ph (the Webflow API cannot write placeholder) */
  $$("[data-ph]").forEach(function (el) {
    el.setAttribute("placeholder", el.getAttribute("data-ph"));
  });
  if (!tabs.length || !panels.length) return;
  /* tab order and default: Book a call, New message, Roast my deck. /call#message and /call#roast open the others. */
  var DEF = "book";
  var alias = {
    book: "book",
    call: "book",
    roast: "roast",
    deck: "roast",
    message: "message",
    contact: "message",
  };
  if (list) {
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", "Ways to reach us");
  }
  tabs.forEach(function (t) {
    var k = t.getAttribute("data-c-tab"),
      p = document.querySelector('[data-c-panel="' + k + '"]');
    t.setAttribute("role", "tab");
    t.id = "c-tab-" + k;
    t.setAttribute("aria-controls", "c-panel-" + k);
    if (p) {
      p.id = "c-panel-" + k;
      p.setAttribute("role", "tabpanel");
      p.setAttribute("aria-labelledby", t.id);
    }
  });
  function sel(k, focus) {
    if (!k) return;
    tabs.forEach(function (t) {
      var on = t.getAttribute("data-c-tab") === k;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
      if (on && focus) t.focus();
    });
    panels.forEach(function (p) {
      p.classList.toggle("is-off", p.getAttribute("data-c-panel") !== k);
    });
  }
  function show() {
    if (!win) return;
    var r = win.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight * 0.5) {
      window.scrollTo({
        top: Math.max(0, window.pageYOffset + r.top - 16),
        behavior: RM ? "auto" : "smooth",
      });
    }
  }
  function setHash(k) {
    try {
      history.replaceState(
        null,
        "",
        k === DEF ? location.pathname + location.search : "#" + k,
      );
    } catch (e) {}
  }
  function fromHash() {
    var k = alias[(location.hash || "").slice(1).toLowerCase()];
    if (k) {
      sel(k);
      show();
    }
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function (e) {
      e.preventDefault();
      var k = t.getAttribute("data-c-tab");
      sel(k);
      setHash(k);
    });
    t.addEventListener("keydown", function (e) {
      var n = -1;
      if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = tabs.length - 1;
      else if (e.key === " ") {
        e.preventDefault();
        t.click();
        return;
      }
      if (n < 0) return;
      e.preventDefault();
      var k = tabs[n].getAttribute("data-c-tab");
      sel(k, true);
      setHash(k);
    });
  });
  $$("[data-c-go]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var k = alias[a.getAttribute("data-c-go")];
      if (!k) return;
      e.preventDefault();
      sel(k);
      setHash(k);
      show();
    });
  });
  window.addEventListener("hashchange", fromHash);
  sel(DEF);
  fromHash();
})();

(function () {
  /* Roast my deck upload: Webflow's file field needs the Business plan, so the PDF goes to Optio Review's storage and its link fills the hidden "Deck link" field */
  var form = document.querySelector('[data-c-form="roast"]'),
    box = form && form.querySelector("[data-c-deck]"),
    out = box && box.querySelector("#c-roast-link");
  if (!box || !out) return;
  var API = "https://review.optio.io/api/roast/upload-url",
    MAX = 25 * 1024 * 1024,
    busy = false,
    xhr = null;
  out.removeAttribute("required");
  out.style.display = "none";
  out.tabIndex = -1;
  out.setAttribute("aria-hidden", "true");
  out.value = "";
  function el(t, c, s) {
    var e = document.createElement(t);
    if (c) e.className = c;
    if (s) e.setAttribute("style", s);
    return e;
  }
  var pick = el("input");
  pick.type = "file";
  pick.accept = ".pdf,application/pdf";
  pick.style.display = "none";
  var btn = el("button", "call-form_upload");
  btn.type = "button";
  var ICO =
    '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 11V2.5M4.5 6 8 2.5 11.5 6M2.5 10.5v3h11v-3"/></svg>';
  var lbl = el("span");
  btn.innerHTML = ICO;
  btn.appendChild(lbl);
  var info = el("div", "call-form_upload-info");
  info.textContent = "PDF only, up to 25MB.";
  var chip = el("div", "call-form_upload-file", "display:none");
  var nm = el("span", "call-form_upload-name");
  var rm = el("button", "call-form_upload-remove");
  rm.type = "button";
  rm.textContent = "Remove";
  rm.setAttribute("aria-label", "Remove file");
  chip.appendChild(nm);
  chip.appendChild(rm);
  var err = el("div", "call-form_upload-error", "display:none");
  err.setAttribute("role", "alert");
  out.parentNode.insertBefore(pick, out);
  [btn, chip, info, err].forEach(function (n) {
    out.parentNode.insertBefore(n, out);
  });
  function say(m) {
    err.textContent = m || "";
    err.style.display = m ? "block" : "none";
  }
  function idle() {
    busy = false;
    btn.disabled = false;
    btn.style.cursor = "";
    lbl.textContent = "Upload PDF";
    btn.style.display = "inline-flex";
    chip.style.display = "none";
    info.style.display = "block";
  }
  function fail(m) {
    out.value = "";
    idle();
    say(m);
  }
  function send(f) {
    say("");
    if (!f) return;
    if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf")
      return fail(
        "Only PDF files, please. Export your deck as a PDF and try again.",
      );
    if (f.size > MAX)
      return fail("That file is over 25MB. Try a smaller export of the PDF.");
    if (!f.size) return fail("That file is empty.");
    busy = true;
    btn.disabled = true;
    btn.style.cursor = "progress";
    lbl.textContent = "Uploading… 0%";
    info.style.display = "none";
    fetch(API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: /\.pdf$/i.test(f.name) ? f.name : f.name + ".pdf",
        bytes: f.size,
      }),
    })
      .then(function (r) {
        return r
          .json()
          .catch(function () {
            return {};
          })
          .then(function (j) {
            if (!r.ok || !j.upload)
              throw new Error(j.error || "Upload failed. Please try again.");
            return j;
          });
      })
      .then(function (j) {
        return new Promise(function (res, rej) {
          xhr = new XMLHttpRequest();
          xhr.open("PUT", j.upload.url);
          xhr.setRequestHeader("content-type", j.upload.contentType);
          xhr.upload.onprogress = function (e) {
            if (e.lengthComputable)
              lbl.textContent =
                "Uploading… " + Math.round((e.loaded / e.total) * 100) + "%";
          };
          xhr.onload = function () {
            xhr.status >= 200 && xhr.status < 300
              ? res(j.link)
              : rej(new Error("Upload failed. Please try again."));
          };
          xhr.onerror = function () {
            rej(
              new Error("Upload failed. Check your connection and try again."),
            );
          };
          xhr.onabort = function () {
            rej(null);
          };
          xhr.send(f);
        });
      })
      .then(function (link) {
        xhr = null;
        busy = false;
        out.value = link;
        nm.textContent = f.name;
        btn.style.display = "none";
        chip.style.display = "flex";
        info.style.display = "none";
      })
      .catch(function (e) {
        xhr = null;
        if (e) fail(e.message);
        else idle();
      });
  }
  btn.addEventListener("click", function () {
    pick.value = "";
    pick.click();
  });
  pick.addEventListener("change", function () {
    send(pick.files && pick.files[0]);
  });
  rm.addEventListener("click", function () {
    if (xhr) xhr.abort();
    out.value = "";
    say("");
    idle();
    btn.focus();
  });
  ["dragenter", "dragover"].forEach(function (t) {
    btn.addEventListener(t, function (e) {
      e.preventDefault();
      btn.classList.add("is-drag");
    });
  });
  ["dragleave", "drop"].forEach(function (t) {
    btn.addEventListener(t, function () {
      btn.classList.remove("is-drag");
    });
  });
  btn.addEventListener("drop", function (e) {
    e.preventDefault();
    if (!busy) send(e.dataTransfer && e.dataTransfer.files[0]);
  });
  /* runs before Webflow's own submit handler (delegated on document) and stops it until the deck is in */
  document.addEventListener(
    "submit",
    function (e) {
      if (e.target !== form) return;
      var m = busy
        ? "Wait for your deck to finish uploading."
        : !out.value
          ? "Add your deck first."
          : "";
      if (m) {
        e.preventDefault();
        e.stopImmediatePropagation();
        say(m);
      }
    },
    true,
  );
  idle();
})();
