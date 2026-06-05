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

function fmtEventDate(iso, lang = currentLang) {
  const d = new Date(iso);
  const locale = getLocale(lang);
  if (Number.isNaN(d.getTime())) return { weekday: "", dateTime: "" };
  return {
    weekday: d.toLocaleDateString(locale, { weekday: "long" }),
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
  const start = new Date(event.datetime);
  const end = event.endDatetime
    ? new Date(event.endDatetime)
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const text = encodeURIComponent(`${eventName(event, dict)} - ${config.brideName} & ${config.groomName}`);
  const dates = `${fmt(start)}/${fmt(end)}`;
  const details = encodeURIComponent(dict.calendarDetails || "Wedding celebration");
  const location = encodeURIComponent(eventCalendarAddress(event, dict));
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
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
  const start = new Date(event.datetime);
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
    lines.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toIcsLocal(event.datetime)}`,
      `DTEND:${toIcsLocal(eventEndIso(event))}`,
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

  qs("#coupleNames").innerHTML = `${config.brideName}<span class="amp">&</span>${config.groomName}`;
  qs("#brandMark").textContent = `${config.brideName[0]} & ${config.groomName[0]}`;

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
    const { weekday, dateTime } = fmtEventDate(event.datetime);
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
  const dict = getDict();
  const url = config.livestreamUrl?.trim();
  if (url) {
    card.innerHTML = `<a class="btn btn-primary" href="${url}" target="_blank" rel="noreferrer">${dict.watchLive}</a>`;
    return;
  }
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

function renderRSVP() {
  const embedUrl = toGoogleFormEmbedUrl(config.googleFormEmbedUrl || config.googleFormViewUrl);
  const container = qs("#googleFormContainer");
  const iframe = qs("#googleFormEmbed");
  const setupNote = qs("#rsvpSetupNote");
  const openLink = qs("#googleFormOpenLink");
  const dict = window.__i18n || config.i18n.en;

  if (embedUrl) {
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
  qs("#weddingHashtag").textContent = dict.weddingDateDisplay || config.weddingDateDisplay || "";
  qs("#footerText").textContent = `${config.brideName} & ${config.groomName} · ${dict.footerWithLove}`;
  updateGuestGreeting();
}

function refreshLocalizedContent() {
  updateLocalizedChrome();
  renderEvents();
  renderVenue();
  renderTravel();
  renderContact();
  renderLivestream();
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
  apply("en");
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
    cardWrap?.setAttribute("hidden", "");
    initIntroTemplateVideo();
    return;
  }

  templateWrap?.setAttribute("hidden", "");
  cardWrap?.removeAttribute("hidden");
  inviteSection?.classList.add("invite-section--image-only");
}

function initBackgroundMusic() {
  const btn = qs("#inviteMusicBtn");
  const label = btn?.querySelector(".invite-music-label");
  const dict = () => window.__i18n || config.i18n.en;
  const ytId = config.youtubeMusicId?.trim();
  const mp3 = config.musicUrl?.trim();

  const setPlayingUi = (playing) => {
    btn?.classList.toggle("is-playing", playing);
    if (!label) return;
    const t = dict();
    label.textContent = playing ? t.pauseMusic || "Pause music" : t.playMusic || "Play music";
  };

  if (ytId && !ytId.includes("{{")) {
    initYouTubeBackgroundMusic(ytId, btn, setPlayingUi);
    return;
  }

  if (!mp3 || mp3.includes("{{")) {
    btn?.classList.add("is-unavailable");
    if (label) label.textContent = "Music unavailable";
    return;
  }

  const audio = qs("#bgMusic");
  const source = audio?.querySelector("source");
  if (source) source.src = mp3;
  audio.loop = config.musicLoop !== false;
  audio?.load();

  audio?.addEventListener("error", () => {
    btn?.classList.add("is-unavailable");
    if (label) label.textContent = "Music unavailable";
  });

  const toggleMp3 = async () => {
    if (btn.classList.contains("is-unavailable") || !audio) return;
    try {
      if (audio.paused) {
        await audio.play();
        setPlayingUi(true);
      } else {
        audio.pause();
        setPlayingUi(false);
      }
    } catch {
      btn.classList.add("is-unavailable");
      if (label) label.textContent = "Tap to allow sound";
    }
  };

  btn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMp3();
  });

  if (config.musicAutoplay !== false) {
    const start = () => toggleMp3();
    document.addEventListener("click", start, { once: true });
    document.addEventListener("touchstart", start, { once: true, passive: true });
  }
}

function initYouTubeBackgroundMusic(videoId, btn, setPlayingUi) {
  let player = null;
  let ready = false;
  let userStarted = false;
  let gestureReceived = false;

  const label = btn?.querySelector(".invite-music-label");

  // Until the YouTube player is ready, prevent the UI from looking "ready".
  // (It will be removed in onReady.)
  btn?.classList.add("is-unavailable");

  const play = () => {
    if (!player || !ready) return false;
    try {
      player.unMute();
      player.setVolume(config.musicVolume ?? 60);
      player.playVideo();
      userStarted = true;
      setPlayingUi(true);
      return true;
    } catch {
      return false;
    }
  };

  const pause = () => {
    if (!player || !ready) return;
    player.pauseVideo();
    setPlayingUi(false);
  };

  const toggle = () => {
    if (!player || !ready) return;
    const state = player.getPlayerState?.();
    if (state === YT.PlayerState.PLAYING) {
      userStarted = false;
      pause();
    } else {
      play();
    }
  };

  const createPlayer = () => {
    player = new YT.Player("youtubeMusicPlayer", {
      height: "0",
      width: "0",
      videoId,
      playerVars: {
        autoplay: 0,
        loop: 1,
        playlist: videoId,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        origin: window.location.origin
      },
      events: {
        onReady: () => {
          ready = true;
          btn?.classList.remove("is-unavailable");

          // Try autoplay after the player becomes ready; if the browser blocks,
          // the user can tap the button (or anywhere) to enable sound.
          if (config.musicAutoplay !== false) {
            if (!attemptPlay()) {
              if (label) label.textContent = "Tap to allow sound";
            }
          } else if (gestureReceived) {
            attemptPlay();
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) setPlayingUi(true);
          if (event.data === YT.PlayerState.PAUSED) setPlayingUi(false);
        }
      }
    });
  };

  const attemptPlay = () => {
    if (userStarted) return true;
    const ok = play();
    if (!ok && label) label.textContent = "Tap to allow sound";
    return ok;
  };

  if (window.YT?.Player) {
    createPlayer();
  } else {
    window.onYouTubeIframeAPIReady = createPlayer;
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.append(tag);
    }
  }

  btn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!ready) return;
    gestureReceived = true;
    if (!userStarted) {
      attemptPlay();
      return;
    }
    toggle();
  });

  const startOnGesture = () => {
    gestureReceived = true;
    attemptPlay();
  };

  // Don't use { once: true }: on mobile the first tap can happen before the
  // YouTube player becomes ready, and the previous implementation never retried.
  document.addEventListener("click", startOnGesture, { passive: true });
  document.addEventListener("touchstart", startOnGesture, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && userStarted && ready) play();
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
