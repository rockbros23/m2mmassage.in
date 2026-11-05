/* =========================================================
   M²M Massage — site interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---- Edit these four values when your details are ready ---- */
  var SITE = {
    name: "M²M Massage",
    whatsapp: "6364548340", // country code + number, digits only
    email: "rockbros23@gmail.com"
  };

  var d = document;
  var body = d.body;

  /* ---------- Year ---------- */
  d.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- WhatsApp links ---------- */
  d.querySelectorAll("[data-wa]").forEach(function (link) {
    try {
      var current = new URL(link.href);
      var text = current.searchParams.get("text") || "Hi " + SITE.name + ", I'd like to book a massage.";
      link.href = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(text);
    } catch (e) {
      link.href = "https://wa.me/" + SITE.whatsapp;
    }
  });

  /* ---------- Sticky header ---------- */
  var header = d.getElementById("header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile navigation ---------- */
  var toggle = d.querySelector(".nav-toggle");
  var nav = d.getElementById("nav");
  var scrim = d.querySelector(".nav-scrim");

  function closeNav() {
    body.classList.remove("nav-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
    }
  }

  function openNav() {
    body.classList.add("nav-open");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      body.classList.contains("nav-open") ? closeNav() : openNav();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    if (scrim) scrim.addEventListener("click", closeNav);

    d.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeNav();
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = d.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reveals.length) {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach(function (el) { el.classList.add("is-visible"); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach(function (el) { observer.observe(el); });
    }
  }

  /* ---------- Testimonial carousel ---------- */
  var quotes = d.querySelector("[data-quotes]");
  if (quotes) {
    var step = function () {
      var first = quotes.firstElementChild;
      return first ? first.getBoundingClientRect().width + 19 : 340;
    };
    var next = d.querySelector("[data-quotes-next]");
    var prev = d.querySelector("[data-quotes-prev]");

    if (next) {
      next.addEventListener("click", function () {
        var end = quotes.scrollLeft + quotes.clientWidth >= quotes.scrollWidth - 12;
        if (end) {
          quotes.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          quotes.scrollBy({ left: step(), behavior: "smooth" });
        }
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        if (quotes.scrollLeft <= 12) {
          quotes.scrollTo({ left: quotes.scrollWidth, behavior: "smooth" });
        } else {
          quotes.scrollBy({ left: -step(), behavior: "smooth" });
        }
      });
    }
  }

  /* ---------- FAQ: open one at a time ---------- */
  d.querySelectorAll(".faq").forEach(function (list) {
    list.addEventListener("toggle", function (e) {
      var item = e.target;
      if (!item.open) return;
      list.querySelectorAll("details[open]").forEach(function (other) {
        if (other !== item) other.open = false;
      });
    }, true);
  });

  /* ---------- Today highlight ---------- */
  var today = new Date().getDay();
  d.querySelectorAll("[data-day]").forEach(function (el) {
    if (Number(el.getAttribute("data-day")) === today) el.classList.add("is-today");
  });

  /* ---------- Date minimum ---------- */
  d.querySelectorAll('input[type="date"]').forEach(function (input) {
    var now = new Date();
    var iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    input.min = iso;
    if (!input.value) input.value = iso;
  });

  /* ---------- Booking form ---------- */
  var booking = d.querySelector("[data-booking-form]");
  if (booking) {
    var bookingWrap = d.querySelector("[data-booking-wrap]");
    var bookingSuccess = d.querySelector("[data-booking-success]");
    var bookingSummary = d.querySelector("[data-booking-summary]");
    var bookingWa = d.querySelector("[data-booking-wa]");
    var area = booking.querySelector('[name="area"]');
    var locationRadios = booking.querySelectorAll('[name="location"]');

    function syncArea() {
      if (!area) return;
      var chosen = booking.querySelector('[name="location"]:checked');
      var isOutcall = chosen && chosen.value === "outcall";
      area.required = !!isOutcall;
      var field = area.closest(".field");
      if (field) field.classList.toggle("is-required", !!isOutcall);
    }
    locationRadios.forEach(function (r) { r.addEventListener("change", syncArea); });
    syncArea();

    /* Pre-select service from ?service=... */
    var params = new URLSearchParams(window.location.search);
    var requested = params.get("service");
    var serviceSelect = booking.querySelector('select[name="service"]');
    if (requested && serviceSelect) {
      var match = Array.prototype.some.call(serviceSelect.options, function (opt) {
        return opt.value === requested;
      });
      if (match) serviceSelect.value = requested;
    }

    booking.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!booking.checkValidity()) {
        booking.reportValidity();
        return;
      }

      var fd = new FormData(booking);
      var get = function (name) { return (fd.get(name) || "").toString().trim(); };

      var durationInput = booking.querySelector('[name="duration"]:checked');
      var duration = durationInput ? durationInput.value : "";
      var service = serviceSelect && serviceSelect.selectedIndex >= 0
        ? serviceSelect.options[serviceSelect.selectedIndex].text
        : get("service");
      var therapist = get("therapist") || "No preference";
      var location = get("location") === "outcall"
        ? "Outcall" + (get("area") ? " — " + get("area") : "")
        : "Studio (Electronic City, Bengaluru)";
      var dateValue = get("date");
      var prettyDate = dateValue
        ? new Date(dateValue + "T00:00:00").toLocaleDateString("en-IN", {
            weekday: "short", day: "numeric", month: "short", year: "numeric"
          })
        : "";
      var name = get("name");

      var rows = [
        ["Name", name],
        ["Service", service],
        ["Duration", duration],
        ["Date", prettyDate],
        ["Time", get("time")],
        ["Where", location],
        ["Therapist", therapist]
      ];

      if (bookingSummary) {
        bookingSummary.textContent = "";
        rows.forEach(function (row) {
          if (!row[1]) return;
          var dt = d.createElement("dt");
          var dd = d.createElement("dd");
          dt.textContent = row[0];
          dd.textContent = row[1];
          bookingSummary.appendChild(dt);
          bookingSummary.appendChild(dd);
        });
      }

      var message = [
        "Hi " + SITE.name + ", I'd like to request a booking.",
        "",
        "Name: " + name,
        "Service: " + service,
        "Duration: " + duration,
        "Date: " + prettyDate,
        "Time: " + get("time"),
        "Location: " + location,
        "Therapist: " + therapist,
        get("notes") ? "Notes: " + get("notes") : "",
        "",
        "Please confirm availability. Thank you."
      ].filter(function (line) { return line !== ""; }).join("\n");

      if (bookingWa) {
        bookingWa.href = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(message);
      }

      if (bookingWrap) bookingWrap.hidden = true;
      if (bookingSuccess) {
        bookingSuccess.classList.add("is-shown");
        bookingSuccess.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        var heading = bookingSuccess.querySelector("h2");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      }
    });

    var resetBooking = d.querySelector("[data-booking-reset]");
    if (resetBooking) {
      resetBooking.addEventListener("click", function () {
        if (bookingSuccess) bookingSuccess.classList.remove("is-shown");
        if (bookingWrap) bookingWrap.hidden = false;
        booking.reset();
        syncArea();
        var dateField = booking.querySelector('input[type="date"]');
        if (dateField && dateField.min) dateField.value = dateField.min;
        window.scrollTo({ top: booking.offsetTop - 120, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
  }

  /* ---------- Contact form ---------- */
  d.querySelectorAll("[data-contact-form]").forEach(function (form) {
    var wrap = form.closest("[data-contact-wrap]");
    var success = d.querySelector("[data-contact-success]");
    var waLink = success ? success.querySelector("[data-contact-wa]") : null;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var fd = new FormData(form);
      var name = (fd.get("name") || "").toString().trim();
      var email = (fd.get("email") || "").toString().trim();
      var message = (fd.get("message") || "").toString().trim();

      var text = [
        "Hi " + SITE.name + ",",
        "",
        "Name: " + name,
        email ? "Email: " + email : "",
        "",
        message
      ].filter(Boolean).join("\n");

      if (waLink) {
        waLink.href = "https://wa.me/" + SITE.whatsapp + "?text=" + encodeURIComponent(text);
      }
      if (wrap) wrap.hidden = true;
      if (success) {
        success.classList.add("is-shown");
        success.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      }
    });
  });

  /* ---------- PWA: install prompt + service worker ---------- */
  var DISMISS_KEY = "m2m-install-dismissed";
  var DISMISS_DAYS = 14;
  var standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  var isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  var deferredPrompt = null;
  var installUi = null;
  var installHint = null;

  function installWasDismissed() {
    try {
      var at = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
      return at > 0 && Date.now() - at < DISMISS_DAYS * 864e5;
    } catch (e) {
      return false;
    }
  }

  function rememberInstallDismissal() {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (e) {
      /* storage can be unavailable in private mode */
    }
  }

  function buildInstallUi() {
    if (installUi) return installUi;

    installUi = d.createElement("div");
    installUi.className = "install-prompt";
    installUi.hidden = true;
    installUi.innerHTML =
      '<button class="install-prompt__chip" type="button">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"/>' +
        "</svg>" +
        '<span data-install-label>Install app</span>' +
      "</button>" +
      '<button class="install-prompt__close" type="button" aria-label="Dismiss install prompt">&times;</button>' +
      '<div class="install-hint" hidden>' +
        "<strong>Add to Home Screen</strong>" +
        "<p>Tap the <em>Share</em> button in Safari, then choose <em>Add to Home Screen</em> to keep M2M Massage one tap away.</p>" +
        '<button class="install-hint__done" type="button">Got it</button>' +
      "</div>";

    body.appendChild(installUi);

    var chip = installUi.querySelector(".install-prompt__chip");
    var label = installUi.querySelector("[data-install-label]");
    var close = installUi.querySelector(".install-prompt__close");
    installHint = installUi.querySelector(".install-hint");

    if (isIos) {
      label.textContent = "Add to Home Screen";
      chip.setAttribute("aria-expanded", "false");
    }

    chip.addEventListener("click", function () {
      if (isIos) {
        installHint.hidden = !installHint.hidden;
        chip.setAttribute("aria-expanded", String(!installHint.hidden));
        return;
      }
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function (choice) {
          if (choice && choice.outcome === "accepted") rememberInstallDismissal();
          installUi.hidden = true;
          deferredPrompt = null;
        });
      }
    });

    close.addEventListener("click", function () {
      rememberInstallDismissal();
      installUi.hidden = true;
    });

    var hintDone = installUi.querySelector(".install-hint__done");
    if (hintDone) {
      hintDone.addEventListener("click", function () {
        installHint.hidden = true;
        chip.setAttribute("aria-expanded", "false");
      });
    }

    return installUi;
  }

  function showInstallUi() {
    if (standalone || installWasDismissed()) return;
    var ui = buildInstallUi();
    ui.hidden = false;
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    showInstallUi();
  });

  window.addEventListener("appinstalled", function () {
    installUi && (installUi.hidden = true);
    deferredPrompt = null;
  });

  if (isIos && !standalone) {
    window.setTimeout(showInstallUi, 2600);
  }

  if ("serviceWorker" in navigator && /^https?:$/.test(window.location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () {
        /* offline support is optional; never block the page */
      });
    });
  }

})();
