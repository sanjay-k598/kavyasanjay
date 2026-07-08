const config = window.WEDDING_CONFIG;

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => [...document.querySelectorAll(sel)];

let currentLang = "en";

const LOCALE_MAP = { en: "en-US", te: "te-IN", kn: "kn-IN" };

function getDict(lang = currentLang) {
  return config.i18n[lang] || config.i18n.en;
}

function getLocale(lang = currentLang) {
  return LOCALE_MAP[lang] || "en-US";
}

function eventDictKey(event, suffix = "") {
  const base = event.id || event.name;
  return suffix ? `event_${base}_${suffix}` : `event_${base}`;
}

function eventName(event, dict = getDict()) {
  return dict[eventDictKey(event)] || event.name || event.id || "";
}

function eventMuhurtham(event, dict = getDict()) {
  return dict[eventDictKey(event, "muhurtham")] || event.muhurtham || "";
}

function eventLunch(event, dict = getDict()) {
  return dict[eventDictKey(event, "lunch")] || event.lunch || "";
}

function eventDateOnly(iso) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(iso).trim());
}

function parseEventDate(iso) {
  if (eventDateOnly(iso)) return new Date(`${iso}T12:00:00`);
  return new Date(iso);
}

function fmtEventDate(iso, lang = currentLang, hideTime = false) {
  const d = parseEventDate(iso);
  const locale = getLocale(lang);
  if (Number.isNaN(d.getTime())) return { weekday: "", dateTime: "" };
  const weekday = d.toLocaleDateString(locale, { weekday: "long" });
  if (hideTime || eventDateOnly(iso)) {
    return {
      weekday,
      dateTime: d.toLocaleDateString(locale, { month: "long", day: "numeric", year: "numeric" })
    };
  }
  return {
    weekday,
    dateTime: d.toLocaleString(locale, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  };
}

function eventLocationLabel(event, dict = getDict()) {
  if (event.atResidence) {
    return config.residence?.address || "29581 Greening St, Farmington Hills, MI 48334";
  }
  return dict[eventDictKey(event, "location")] || event.location || "";
}

function eventCalendarAddress(event, dict = getDict()) {
  return eventLocationLabel(event, dict);
}

function createGoogleCalendarUrl(event, dict = getDict()) {
  const text = encodeURIComponent(`${eventName(event, dict)} - ${config.brideName} & ${config.groomName}`);
  const details = encodeURIComponent(dict.calendarDetails || "Wedding celebration");
  const location = encodeURIComponent(eventCalendarAddress(event, dict));

  if (event.hideTime || eventDateOnly(event.datetime)) {
    const day = String(event.datetime).slice(0, 10).replace(/-/g, "");
    const nextDay = new Date(parseEventDate(event.datetime).getTime() + 86400000)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    const dates = `${day}/${nextDay}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
  }

  const start = parseEventDate(event.datetime);
  const end = event.endDatetime
    ? parseEventDate(event.endDatetime)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dates = `${fmt(start)}/${fmt(end)}`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}

function toIcsDate(iso) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${m[1]}${m[2]}${m[3]}`;
}

function toIcsLocal(iso) {
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!m) return "";
  return `${m[1]}${m[2]}${m[3]}T${m[4]}${m[5]}${m[6]}`;
}

function icsEscape(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function eventEndIso(event) {
  if (event.endDatetime) return event.endDatetime;
  if (event.hideTime || eventDateOnly(event.datetime)) {
    const d = parseEventDate(event.datetime);
    return new Date(d.getTime() + 86400000).toISOString().slice(0, 10);
  }
  const start = parseEventDate(event.datetime);
  return new Date(start.getTime() + 2 * 60 * 60 * 1000).toISOString();
}

function buildAllEventsICS(dict = getDict()) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kavya Sanjay Wedding//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH"
  ];

  config.events.forEach((event, index) => {
    const uid = `${event.id || index}@kavyasanjay.com`;
    const allDay = event.hideTime || eventDateOnly(event.datetime);
    lines.push("BEGIN:VEVENT", `UID:${uid}`, `DTSTAMP:${stamp}`);
    if (allDay) {
      lines.push(
        `DTSTART;VALUE=DATE:${toIcsDate(event.datetime)}`,
        `DTEND;VALUE=DATE:${toIcsDate(eventEndIso(event))}`
      );
    } else {
      lines.push(`DTSTART:${toIcsLocal(event.datetime)}`, `DTEND:${toIcsLocal(eventEndIso(event))}`);
    }
    lines.push(
      `SUMMARY:${icsEscape(`${eventName(event, dict)} - ${config.brideName} & ${config.groomName}`)}`,
      `LOCATION:${icsEscape(eventCalendarAddress(event, dict))}`,
      `DESCRIPTION:${icsEscape(dict.calendarDetails || "Wedding celebration")}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadAllEventsCalendar() {
  const dict = getDict();
  const blob = new Blob([buildAllEventsICS(dict)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "kavya-sanjay-wedding-events.ics";
  link.click();
  URL.revokeObjectURL(url);
}

function getCoupleNames(lang = currentLang) {
  const dict = getDict(lang);
  return {
    bride: dict.brideName || config.brideName,
    groom: dict.groomName || config.groomName
  };
}

function coupleNamesHtml(lang = currentLang) {
  const { bride, groom } = getCoupleNames(lang);
  return `${bride}<span class="amp">&</span>${groom}`;
}

function getInitialLanguage() {
  const options = config.languageOptions || ["en"];
  const fromUrl = new URLSearchParams(location.search).get("lang")?.toLowerCase();
  if (fromUrl && options.includes(fromUrl)) return fromUrl;
  return "en";
}

function syncLanguageToUrl(lang) {
  const url = new URL(location.href);
  if (lang === "en") url.searchParams.delete("lang");
  else url.searchParams.set("lang", lang);
  history.replaceState(null, "", url);
}

function updateCoupleNames() {
  const { bride, groom } = getCoupleNames();
  const namesEl = qs("#coupleNames");
  if (namesEl) namesEl.innerHTML = coupleNamesHtml();
  const brand = qs("#brandMark");
  if (brand) brand.textContent = `${bride[0]} & ${groom[0]}`;
}

function formatTelLink(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return digits ? `+${digits}` : phone;
}

function absoluteAssetUrl(path) {
  if (!path || path.startsWith("http")) return path || "";
  const base = (config.siteUrl || window.location.origin).replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}

function renderInviteAndCouple() {
  const inviteImg = qs("#invitationImage");
  if (inviteImg) {
    inviteImg.src = config.invitationImage;
    inviteImg.addEventListener("click", () => {
      qs("#lightboxImage").src = config.invitationImage;
      qs("#lightbox").showModal();
    });
  }
  qs("#couplePhotoImage").src = config.couplePhoto;
  updateCoupleNames();

  const dateEl = qs("#heroDate");
  if (dateEl) {
    dateEl.hidden = Boolean(config.weddingDateDisplay);
  }
}

function renderEvents() {
  const grid = qs("#eventsGrid");
  if (!grid) return;
  const dict = getDict();
  grid.innerHTML = "";
  config.events.forEach((event) => {
    const card = document.createElement("article");
    card.className = "card";
    const { weekday, dateTime } = fmtEventDate(event.datetime, currentLang, event.hideTime);
    const muhurtham = eventMuhurtham(event, dict);
    const lunch = eventLunch(event, dict);
    const muhurthamHtml = muhurtham ? ` <span class="event-muhurtham">· ${muhurtham}</span>` : "";
    const lunchHtml = lunch ? `<br>${lunch}` : "";
    card.innerHTML = `
      <h3>${eventName(event, dict)}${muhurthamHtml}</h3>
      <p class="event-day">${weekday}</p>
      <p class="event-meta">${dateTime}<br>${eventLocationLabel(event, dict)}${lunchHtml}</p>
      <div class="calendar-row">
        <a class="btn btn-outline btn-sm" target="_blank" rel="noreferrer" href="${createGoogleCalendarUrl(event, dict)}">${dict.addToCalendar}</a>
      </div>`;
    grid.append(card);
  });
}

function renderVenue() {
  const temple = config.venue;
  const dict = getDict();
  qs("#venueName").textContent = dict.venueName || temple.name;
  qs("#venueHall").textContent = dict.venueHall || temple.hall || "";
  qs("#venueAddress").textContent = temple.address;
  qs("#venueParking").textContent = dict.venueParking || temple.parking;
  qs("#templeMapLink").href = temple.googleMapsLink || "#";
  qs("#templeMapLink").textContent = dict.directions || "Directions";
  qs("#templeMap").src = temple.embedMap;

  const tips = qs("#venueTips");
  if (tips) {
    const tipLines = [dict.venueArriveBy, dict.venueEntrance, dict.venueAskFor].filter(Boolean);
    tips.innerHTML = tipLines.map((line) => `<li>${line}</li>`).join("");
  }
}

function renderContact() {
  const wrap = qs("#contactGrid");
  if (!wrap) return;
  const dict = getDict();
  wrap.innerHTML = "";
  config.contact.forEach((person) => {
    const card = document.createElement("article");
    card.className = "card contact-card";
    card.innerHTML = `
      <h3>${person.title}</h3>
      <p class="contact-phone-line">${person.phone}</p>`;
    wrap.append(card);
  });
}

function renderLivestream() {
  const card = qs("#livestreamCard");
  if (!card) return;
  const section = qs("#livestream");
  const dict = getDict();
  const url = config.livestreamUrl?.trim();
  if (url) {
    section?.classList.remove("hidden");
    card.innerHTML = `<a class="btn btn-primary" href="${url}" target="_blank" rel="noreferrer">${dict.watchLive}</a>`;
    return;
  }
  section?.classList.add("hidden");
  card.innerHTML = `<p>${dict.livestreamNote}</p>`;
}

function updateRsvpDeadline() {
  const el = qs("#rsvpDeadline");
  if (!el) return;
  el.textContent = getDict().rsvpDeadlineNote || "";
}

function updateAddAllCalendarButton() {
  const btn = qs("#addAllCalendarBtn");
  if (!btn) return;
  btn.textContent = getDict().addAllToCalendar;
}

function renderTravel() {
  const wrap = qs("#travelGrid");
  if (!wrap) return;
  const dict = getDict();
  const a = config.arrival;
  wrap.innerHTML = "";

  const arrivalCard = document.createElement("article");
  arrivalCard.className = "card";
  arrivalCard.innerHTML = `
    <h3>${dict.arrivalTitle || a.title}</h3>
    <p>${dict.arrivalText || a.text}</p>
    <a class="btn btn-outline btn-sm" href="${a.link}" target="_blank" rel="noreferrer">${dict.dtwInfo}</a>`;
  wrap.append(arrivalCard);

  const hotels = config.hotelBooking;
  if (hotels?.bookUrl) {
    const hotelCard = document.createElement("article");
    hotelCard.className = "card";
    hotelCard.innerHTML = `
      <h3>${dict.nearbyHotels}</h3>
      <p>${dict.hotelsNote || hotels.note}</p>
      <a class="btn btn-primary btn-sm" href="${hotels.bookUrl}" target="_blank" rel="noreferrer">${dict.bookHotels}</a>`;
    wrap.append(hotelCard);
  }
}

function toGoogleFormEmbedUrl(url) {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (trimmed.includes("embedded=true")) return trimmed;
  if (trimmed.includes("viewform")) {
    return trimmed.includes("?") ? `${trimmed}&embedded=true` : `${trimmed}?embedded=true`;
  }
  return trimmed;
}

function renderRsvpFormHeader() {
  const namesEl = qs("#rsvpCoupleNames");
  if (!namesEl) return;

  namesEl.innerHTML = coupleNamesHtml();
}

function renderRSVP() {
  const embedUrl = toGoogleFormEmbedUrl(config.googleFormEmbedUrl || config.googleFormViewUrl);
  const container = qs("#googleFormContainer");
  const iframe = qs("#googleFormEmbed");
  const setupNote = qs("#rsvpSetupNote");
  const openLink = qs("#googleFormOpenLink");
  const dict = window.__i18n || config.i18n.en;

  if (embedUrl) {
    renderRsvpFormHeader();
    const clipPx = config.googleFormClipPx ?? 360;
    container.style.setProperty("--form-clip", `${clipPx}px`);
    iframe.src = embedUrl;
    container.classList.remove("hidden");
    qs("#rsvpFormNote")?.classList.remove("hidden");
    setupNote.classList.add("hidden");

    const viewUrl =
      config.googleFormViewUrl ||
      embedUrl.replace("?embedded=true", "").replace("&embedded=true", "");
    openLink.href = viewUrl;
    openLink.classList.remove("hidden");
    return;
  }

  container.classList.add("hidden");
  openLink.classList.add("hidden");
  setupNote.classList.remove("hidden");
  setupNote.textContent =
    "RSVP form: add your Google Form embed URL in data/config.js (see RSVP_GOOGLE_FORM.md).";
}

function initCountdown() {
  const wrap = qs("#countdown");
  const target = new Date(`${config.weddingDate} ${config.muhurthamTime || "06:00"}`);

  const renderUnits = (d, h, m) => {
    const dict = getDict();
    wrap.innerHTML = [
      { v: d, l: dict.countdownDays },
      { v: h, l: dict.countdownHours },
      { v: m, l: dict.countdownMins }
    ]
      .map(
        (u) =>
          `<div class="countdown-unit"><strong>${u.v}</strong><span>${u.l}</span></div>`
      )
      .join("");
  };

  const tick = () => {
    const dict = getDict();
    const diff = target - new Date();
    if (Number.isNaN(diff)) {
      wrap.innerHTML = `<p style="width:100%;text-align:center;color:var(--muted);font-size:0.85rem;">${dict.countdownFallback}</p>`;
      return;
    }
    if (diff <= 0) {
      wrap.innerHTML = `<p style="width:100%;text-align:center;font-family:Cinzel,serif;color:var(--primary);">${dict.countdownWeddingDay}</p>`;
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    renderUnits(d, h, m);
  };
  window.__countdownTick = tick;
  tick();
  setInterval(tick, 30000);
}

function updateGuestGreeting() {
  const guest = new URLSearchParams(location.search).get("guest");
  const el = qs("#guestGreeting");
  if (!guest || !el) return;
  const dict = getDict();
  el.textContent = (dict.guestGreeting || "").replace("{guest}", guest);
}

function updateLocalizedChrome() {
  const dict = getDict();
  updateCoupleNames();
  qs("#weddingHashtag").textContent = dict.weddingDateDisplay || config.weddingDateDisplay || "";
  const { bride, groom } = getCoupleNames();
  qs("#footerText").innerHTML = `${bride} & ${groom} · ${dict.footerWithLove} <span class="footer-love" aria-hidden="true">♥</span>`;
  updateGuestGreeting();
}

function refreshLocalizedContent() {
  updateLocalizedChrome();
  renderEvents();
  renderVenue();
  renderTravel();
  renderContact();
  renderLivestream();
  renderRsvpFormHeader();
  updateRsvpDeadline();
  updateAddAllCalendarButton();
  window.__countdownTick?.();
}

function applyI18nAttributes(dict) {
  qsa("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if (!dict[key]) return;
    if (el.tagName === "INPUT" || el.tagName === "BUTTON") {
      el.value = dict[key];
    } else {
      el.textContent = dict[key];
    }
  });
}

function initLanguage() {
  const sel = qs("#langSelect");
  const optLabels = { en: "EN", te: "TE", kn: "KN" };
  sel.innerHTML = "";
  (config.languageOptions || ["en"]).forEach((lang) => {
    const opt = document.createElement("option");
    opt.value = lang;
    opt.textContent = optLabels[lang] || lang.toUpperCase();
    sel.append(opt);
  });

  const apply = (lang) => {
    currentLang = lang;
    const dict = getDict(lang);
    window.__i18n = dict;
    window.__lang = lang;
    sel.value = lang;
    syncLanguageToUrl(lang);
    applyI18nAttributes(dict);
    document.documentElement.lang = lang;
    document.body.style.fontFamily =
      lang === "te"
        ? '"Noto Serif Telugu", "Inter", sans-serif'
        : lang === "kn"
          ? '"Noto Serif Kannada", "Inter", sans-serif'
          : '"Inter", sans-serif';
    renderQuickNav();
    refreshLocalizedContent();
    applySeoMeta();
  };
  sel.addEventListener("change", () => apply(sel.value));
  apply(getInitialLanguage());
}

function initTheme() {
  qs("#themeToggle").addEventListener("click", () => {
    const isDark = document.body.dataset.theme === "dark";
    document.body.dataset.theme = isDark ? "" : "dark";
  });
}

const NAV_SECTIONS = ["invitation", "couple-photo", "events", "venue", "rsvp", "travel", "contact"];

function navLabel(id, dict = getDict()) {
  const map = {
    invitation: dict.navInvite,
    "couple-photo": dict.navUs,
    events: dict.navEvents,
    venue: dict.navVenue,
    rsvp: dict.navRsvp,
    travel: dict.navTravel,
    contact: dict.navContact
  };
  return map[id] || id;
}

function renderQuickNav() {
  const nav = qs("#quickNav");
  if (!nav) return;
  const activeHref = nav.querySelector("a.active")?.getAttribute("href");
  nav.innerHTML = "";
  NAV_SECTIONS.forEach((id) => {
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = navLabel(id);
    if (activeHref === `#${id}`) a.classList.add("active");
    nav.append(a);
  });
}

function initQuickNav() {
  renderQuickNav();

  const nav = qs("#quickNav");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        nav.querySelectorAll("a").forEach((a) => a.classList.remove("active"));
        nav.querySelector(`a[href="#${entry.target.id}"]`)?.classList.add("active");
      });
    },
    { threshold: 0.35 }
  );
  NAV_SECTIONS.forEach((id) => {
    const el = qs(`#${id}`);
    if (el) observer.observe(el);
  });
}

function initFloatingActions() {
  const raw = String(config.whatsappNumber || "").replace(/\D/g, "");
  const number = raw.length === 10 ? `1${raw}` : raw;
  qs("#whatsAppFloat").href = number ? `https://wa.me/${number}` : "#";
}

function initAnimations() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    qsa(".fade-in").forEach((el) => el.classList.add("visible"));
    return;
  }

  document.body.classList.add("animations-ready");

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -5% 0px" }
  );

  qsa(".fade-in").forEach((el) => io.observe(el));
}

function initGuestGreeting() {
  updateGuestGreeting();
}

function injectSchema() {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${config.brideName} & ${config.groomName} Wedding`,
    startDate: config.events[0]?.datetime || "",
    location: { "@type": "Place", name: config.venue.name, address: config.venue.address }
  });
  document.head.append(script);
}

function applySeoMeta() {
  const dict = getDict();
  document.title = `${config.brideName} & ${config.groomName} | ${dict.navInvite}`;
  const desc = `You are invited to celebrate ${config.brideName} and ${config.groomName}'s wedding.`;
  const ogImage = absoluteAssetUrl(config.ogShareImage || config.invitationImage);
  const siteUrl = config.siteUrl || window.location.origin;
  const set = (sel, val) => document.querySelector(sel)?.setAttribute("content", val);
  set('meta[name="description"]', desc);
  set('meta[property="og:title"]', `${config.brideName} & ${config.groomName}`);
  set('meta[property="og:description"]', desc);
  set('meta[property="og:image"]', ogImage);
  set('meta[property="og:url"]', `${siteUrl.replace(/\/$/, "")}/`);
}

function initLightbox() {
  qs("#closeLightbox").addEventListener("click", () => qs("#lightbox").close());
}

function initPhotoCinematic({ cinematic, generate, frame, img, lightboxSrc, whenVisible, onRevealed }) {
  if (!cinematic || !frame || !img) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let started = false;

  const finishReveal = () => {
    generate?.classList.add("is-done");
    cinematic.classList.add("is-ready");
    onRevealed?.();
    setTimeout(() => generate?.remove(), 800);
  };

  const runReveal = () => {
    if (started) return;
    started = true;

    if (reduced) {
      generate?.remove();
      cinematic.classList.add("is-ready");
      onRevealed?.();
      return;
    }

    const startReveal = () => setTimeout(finishReveal, 2400);
    if (img.complete) startReveal();
    else img.addEventListener("load", startReveal, { once: true });
    setTimeout(finishReveal, 4500);
  };

  if (whenVisible) {
    const section = cinematic.closest("section");
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        runReveal();
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );
    if (section) io.observe(section);
    else runReveal();
  } else {
    runReveal();
  }

  frame.addEventListener("click", () => {
    if (!cinematic.classList.contains("is-ready")) return;
    qs("#lightboxImage").src = lightboxSrc();
    qs("#lightbox").showModal();
  });
}

function initIntroGreenScreen() {
  if (config.introVideoEnabled === false || config.introVideoChromaKey === false) return;

  const url = config.introVideoUrl?.trim();
  const layer = qs("#introGreenLayer");
  const video = qs("#introGreenVideo");
  const canvas = qs("#introGreenCanvas");
  if (!url || !layer || !video || !canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  let rafId = 0;

  const resize = () => {
    const rect = layer.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  };

  const chromaKey = () => {
    if (video.readyState < 2) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = frame.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      if (g > 150 && g > r * 1.28 && g > b * 1.28) d[i + 3] = 0;
    }
    ctx.putImageData(frame, 0, 0);
  };

  const render = () => {
    chromaKey();
    rafId = requestAnimationFrame(render);
  };

  const startPlayback = () => {
    resize();
    layer.hidden = false;
    video.play().catch(() => {});
    if (!rafId) render();
  };

  video.addEventListener("loadeddata", startPlayback, { once: true });
  video.addEventListener("error", () => layer.remove());
  window.addEventListener("resize", resize);
  video.src = url;
  video.load();
}

function initIntroTemplateVideo() {
  if (config.introVideoEnabled === false) return;
  if (config.introVideoMode !== "template") return;

  const url = config.introVideoUrl?.trim();
  const video = qs("#introTemplateVideo");
  if (!url || !video) return;

  video.src = `${url}?v=14`;
  video.loop = config.introVideoLoop === true;
  video.muted = true;
  video.playsInline = true;

  const tryPlay = () => video.play().catch(() => {});
  video.addEventListener("loadeddata", tryPlay, { once: true });
  video.addEventListener("canplay", tryPlay, { once: true });
  video.load();
  tryPlay();
}

function initInviteSection() {
  const templateWrap = qs("#inviteTemplateWrap");
  const cardWrap = qs("#inviteCardWrap");
  const inviteSection = qs("#invitation");

  const useVideo =
    config.introVideoEnabled !== false &&
    config.introVideoMode === "template" &&
    Boolean(config.introVideoUrl?.trim());

  if (useVideo) {
    templateWrap?.removeAttribute("hidden");
    cardWrap?.setAttribute("hidden", "");
    initIntroTemplateVideo();
    return;
  }

  // Image-only invite: hide the unused template video wrapper.
  templateWrap?.setAttribute("hidden", "");
  cardWrap?.removeAttribute("hidden");
  inviteSection?.classList.add("invite-section--image-only");

  const templateVideo = qs("#introTemplateVideo");
  if (templateVideo) {
    templateVideo.setAttribute("hidden", "");
    templateVideo.removeAttribute("src");
    templateVideo.load?.();
  }
}

function enableMusicOnFirstInteraction(action) {
  if (window.__musicGestureBound) return;
  window.__musicGestureBound = true;

  const resume = () => {
    const ok = action();
    if (ok === false) return;
    document.removeEventListener("pointerdown", resume);
    document.removeEventListener("touchstart", resume);
    document.removeEventListener("keydown", resume);
  };

  document.addEventListener("pointerdown", resume, { passive: true });
  document.addEventListener("touchstart", resume, { passive: true });
  document.addEventListener("keydown", resume, { passive: true });
}

function loadYouTubeIframeApi() {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") previous();
      resolve();
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.append(tag);
    }
  });
}

function initBackgroundMusic() {
  if (config.musicAutoplay === false) return;

  const mp3 = config.musicUrl?.trim();
  const ytId = config.youtubeMusicId?.trim();
  const useMp3 = Boolean(mp3 && !mp3.includes("{{"));
  const useYouTube = Boolean(ytId && !ytId.includes("{{") && !useMp3);

  if (useMp3) {
    initMp3Autoplay(mp3);
    return;
  }

  if (useYouTube) {
    initYouTubeAutoplay(ytId);
  }
}

function initMp3Autoplay(mp3) {
  const audio = qs("#bgMusic");
  const source = audio?.querySelector("source");
  if (!audio) return;

  audio.setAttribute("playsinline", "");
  if (source) source.src = mp3;
  audio.loop = config.musicLoop !== false;
  audio.volume = (config.musicVolume ?? 60) / 100;
  audio.preload = "auto";

  const start = async () => {
    try {
      await audio.play();
    } catch {
      enableMusicOnFirstInteraction(() => {
        audio.play().catch(() => {});
        return true;
      });
    }
  };

  audio.addEventListener("canplaythrough", start, { once: true });
  audio.addEventListener("error", () => {});
  audio.load();
}

function initYouTubeAutoplay(videoId) {
  let player = null;
  let isPlaying = false;

  const resumeFromGesture = () => {
    if (!player) return false;
    try {
      player.setVolume(config.musicVolume ?? 60);
      player.unMute();
      player.playVideo();
      isPlaying = true;
      return true;
    } catch {
      return false;
    }
  };

  const playMuted = () => {
    if (!player) return;
    try {
      player.mute();
      player.playVideo();
    } catch {
      /* ignored */
    }
  };

  const tryAudible = () => {
    if (!player || !isPlaying) return;
    try {
      player.setVolume(config.musicVolume ?? 60);
      player.unMute();
    } catch {
      /* ignored */
    }
  };

  loadYouTubeIframeApi().then(() => {
    player = new YT.Player("youtubeMusicPlayer", {
      height: "1",
      width: "1",
      videoId,
      playerVars: {
        autoplay: 1,
        mute: 1,
        loop: 1,
        playlist: videoId,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        enablejsapi: 1,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          playMuted();
          enableMusicOnFirstInteraction(resumeFromGesture);
          window.setTimeout(() => {
            if (!isPlaying) return;
            tryAudible();
          }, 800);
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            tryAudible();
          }
        },
        onError: () => {
          enableMusicOnFirstInteraction(resumeFromGesture);
        }
      }
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && player && isPlaying) {
      resumeFromGesture();
    }
  });
}

function initCoupleCinematic() {
  initPhotoCinematic({
    cinematic: qs("#coupleCinematic"),
    generate: qs("#coupleGenerate"),
    frame: qs("#coupleFrame"),
    img: qs("#couplePhotoImage"),
    lightboxSrc: () => config.couplePhoto,
    whenVisible: true,
    onRevealed: () => qs("#couple-photo")?.classList.add("couple-revealed")
  });
}

function initAddAllCalendar() {
  qs("#addAllCalendarBtn")?.addEventListener("click", downloadAllEventsCalendar);
}

function boot() {
  renderInviteAndCouple();
  initInviteSection();
  initCoupleCinematic();
  initBackgroundMusic();
  renderRSVP();
  initAddAllCalendar();

  initCountdown();
  initLanguage();
  initTheme();
  initQuickNav();
  initFloatingActions();
  initAnimations();
  initGuestGreeting();
  initLightbox();
  injectSchema();
  applySeoMeta();
}

boot();
