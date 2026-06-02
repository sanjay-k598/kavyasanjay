const config = window.WEDDING_CONFIG;

const qs = (sel) => document.querySelector(sel);
const qsa = (sel) => [...document.querySelectorAll(sel)];

function fmtDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function fmtEventDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { weekday: "", dateTime: "" };
  return {
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
    dateTime: d.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  };
}

function eventLocationLabel(event) {
  if (event.atResidence) {
    const note = event.locationNote ? ` ${event.locationNote}` : "";
    return `At our residence${note}`;
  }
  return event.location || "";
}

function eventCalendarAddress(event) {
  if (event.atResidence) return config.residence?.address || "At our residence";
  return event.location || "";
}

function createGoogleCalendarUrl(event) {
  const start = new Date(event.datetime);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const fmt = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const text = encodeURIComponent(`${event.name} - ${config.brideName} & ${config.groomName}`);
  const dates = `${fmt(start)}/${fmt(end)}`;
  const details = encodeURIComponent("Wedding celebration");
  const location = encodeURIComponent(eventCalendarAddress(event));
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
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
  qs("#weddingHashtag").textContent = config.weddingDateDisplay || "";
  qs("#brandMark").textContent = `${config.brideName[0]} & ${config.groomName[0]}`;
  qs("#footerText").textContent = `${config.brideName} & ${config.groomName} · With love ♥️`;

  const dateEl = qs("#heroDate");
  if (dateEl) {
    dateEl.hidden = Boolean(config.weddingDateDisplay);
  }
}

function renderEvents() {
  const grid = qs("#eventsGrid");
  config.events.forEach((event) => {
    const card = document.createElement("article");
    card.className = "card";
    const { weekday, dateTime } = fmtEventDate(event.datetime);
    const muhurthamHtml = event.muhurtham
      ? ` <span class="event-muhurtham">· ${event.muhurtham}</span>`
      : "";
    card.innerHTML = `
      <h3>${event.name}${muhurthamHtml}</h3>
      <p class="event-day">${weekday}</p>
      <p class="event-meta">${dateTime}<br>${eventLocationLabel(event)}</p>
      <div class="calendar-row">
        <a class="btn btn-outline btn-sm" target="_blank" rel="noreferrer" href="${createGoogleCalendarUrl(event)}">Add to Calendar</a>
      </div>`;
    grid.append(card);
  });
}

function renderVenue() {
  const temple = config.venue;
  qs("#venueName").textContent = temple.name;
  qs("#venueHall").textContent = temple.hall || "";
  qs("#venueAddress").textContent = temple.address;
  qs("#venueParking").textContent = temple.parking;
  qs("#templeMapLink").href = temple.googleMapsLink || "#";
  qs("#templeMap").src = temple.embedMap;

  const home = config.residence;
  if (home) {
    qs("#residenceAddress").textContent = home.address;
    qs("#residenceMapLink").href = home.googleMapsLink || "#";
    qs("#residenceMap").src = home.embedMap || "";
  }
}

function renderSimpleCards(id, items, mapFn) {
  const wrap = qs(id);
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = mapFn(item);
    wrap.append(card);
  });
}

function renderTravel() {
  const wrap = qs("#travelGrid");
  const dict = window.__i18n || config.i18n.en;
  const a = config.arrival;

  const arrivalCard = document.createElement("article");
  arrivalCard.className = "card";
  arrivalCard.innerHTML = `
    <h3>${a.title}</h3>
    <p>${a.text}</p>
    <a class="btn btn-outline btn-sm" href="${a.link}" target="_blank" rel="noreferrer" data-i18n="dtwInfo">DTW Airport Info</a>`;
  wrap.append(arrivalCard);

  const hotels = config.hotelBooking;
  if (hotels?.bookUrl) {
    const hotelCard = document.createElement("article");
    hotelCard.className = "card";
    hotelCard.innerHTML = `
      <h3 data-i18n="nearbyHotels">${dict.nearbyHotels || "Nearby Hotels"}</h3>
      <p data-i18n="hotelsNote">${dict.hotelsNote || hotels.note}</p>
      <a class="btn btn-primary btn-sm" href="${hotels.bookUrl}" target="_blank" rel="noreferrer" data-i18n="bookHotels">Book Hotels</a>`;
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
  const labels = ["Days", "Hours", "Mins"];

  const renderUnits = (d, h, m) => {
    wrap.innerHTML = [
      { v: d, l: labels[0] },
      { v: h, l: labels[1] },
      { v: m, l: labels[2] }
    ]
      .map(
        (u) =>
          `<div class="countdown-unit"><strong>${u.v}</strong><span>${u.l}</span></div>`
      )
      .join("");
  };

  const tick = () => {
    const diff = target - new Date();
    if (Number.isNaN(diff)) {
      wrap.innerHTML = `<p style="width:100%;text-align:center;color:var(--muted);font-size:0.85rem;">July 2, 2026</p>`;
      return;
    }
    if (diff <= 0) {
      wrap.innerHTML = `<p style="width:100%;text-align:center;font-family:Cinzel,serif;color:var(--primary);">It's wedding day — July 2!</p>`;
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff / 3600000) % 24);
    const m = Math.floor((diff / 60000) % 60);
    renderUnits(d, h, m);
  };
  tick();
  setInterval(tick, 30000);
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
    const dict = config.i18n[lang] || config.i18n.en;
    window.__i18n = dict;
    qsa("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;
      if (dict[key]) {
        if (el.tagName === "INPUT" || el.tagName === "BUTTON") {
          el.value = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    });
    document.documentElement.lang = lang;
    document.body.style.fontFamily =
      lang === "te"
        ? '"Noto Serif Telugu", "Inter", sans-serif'
        : lang === "kn"
          ? '"Noto Serif Kannada", "Inter", sans-serif'
          : '"Inter", sans-serif';
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

function initQuickNav() {
  const sections = ["invitation", "couple-photo", "events", "venue", "rsvp", "travel", "contact"];
  const labels = {
    invitation: "Invite",
    "couple-photo": "Us",
    events: "Events",
    venue: "Venue",
    rsvp: "RSVP",
    travel: "Travel",
    contact: "Contact"
  };
  const nav = qs("#quickNav");
  sections.forEach((id) => {
    const a = document.createElement("a");
    a.href = `#${id}`;
    a.textContent = labels[id];
    nav.append(a);
  });

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
  sections.forEach((id) => {
    const el = qs(`#${id}`);
    if (el) observer.observe(el);
  });
}

function initFloatingActions() {
  qs("#whatsAppFloat").href = `https://wa.me/${config.whatsappNumber}`;
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
  const guest = new URLSearchParams(location.search).get("guest");
  if (guest) {
    qs("#guestGreeting").textContent = `Dear ${guest} family, we can't wait to celebrate with you.`;
  }
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
  document.title = `${config.brideName} & ${config.groomName} | Wedding Invitation`;
  const desc = `You're invited to celebrate ${config.brideName} & ${config.groomName}'s wedding.`;
  const set = (sel, val) => document.querySelector(sel)?.setAttribute("content", val);
  set('meta[name="description"]', desc);
  set('meta[property="og:title"]', `${config.brideName} & ${config.groomName}`);
  set('meta[property="og:description"]', desc);
  set('meta[property="og:image"]', config.invitationImage);
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
  if (config.introVideoMode === "template") {
    initIntroTemplateVideo();
    return;
  }

  initPhotoCinematic({
    cinematic: qs("#inviteCinematic"),
    generate: qs("#inviteGenerate"),
    frame: qs("#inviteFrame"),
    img: qs("#invitationImage"),
    lightboxSrc: () => config.invitationImage
  });
  initIntroGreenScreen();
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
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) setPlayingUi(true);
          if (event.data === YT.PlayerState.PAUSED) setPlayingUi(false);
        }
      }
    });
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
    if (!userStarted) {
      play();
      return;
    }
    toggle();
  });

  const startOnGesture = () => {
    if (!userStarted) play();
  };

  document.addEventListener("click", startOnGesture, { once: true });
  document.addEventListener("touchstart", startOnGesture, { once: true, passive: true });

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

function boot() {
  renderInviteAndCouple();
  initInviteSection();
  initCoupleCinematic();
  initBackgroundMusic();
  renderEvents();
  renderVenue();
  renderRSVP();
  renderTravel();
  renderSimpleCards(
    "#contactGrid",
    config.contact,
    (x) => {
      const digits = x.phone.replace(/\D/g, "");
      const tel = digits.length === 10 ? `+1${digits}` : digits ? `+${digits}` : x.phone;
      return `<h3>${x.title}</h3><p><a href="tel:${tel}">${x.phone}</a></p>`;
    }
  );

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
