/* ═══════════════════════════════════════════════════════
   NSwitch Vault — app.js  (WiiU Console UI + RAWG API)
═══════════════════════════════════════════════════════ */
"use strict";

/* ══ I18N ══ */
const LANGS = {
  vi: {
    search: "Tìm game...", allGenres: "Tất cả", filterBtn: "Bộ lọc", sortBtn: "Sắp xếp",
    selectBtn: "Chọn", menuBtn: "Menu", backBtn: "Quay lại", loading: "Đang tải...",
    gameError: "Có lỗi xảy ra khi tải thông tin game.",
    noGames: "Không tìm thấy game", noDesc: "Không có mô tả.",
    noLinks: "Chưa có link tải.", addLink: "Thêm link", addTrailer: "Thêm trailer",
    save: "Lưu", cancel: "Hủy", screenshotsLabel: "Screenshots & Trailer",
    seriesLabel: "Game cùng series", downloadLabel: "Link tải",
    homepage: "Trang chủ", viewPhotos: "Xem ảnh",
    rating: "Rating", metacritic: "Metacritic", released: "Phát hành",
    playtime: "Thời gian", reviews: "Đánh giá", developer: "Developer",
    sortRating: "Đánh giá cao nhất", sortMeta: "Metacritic",
    sortNew: "Mới phát hành", sortName: "Tên A→Z",
    hours: "giờ", games: "game", filterTitle: "Thể loại & Tags",
    genreLabel: "THỂ LOẠI", tagLabel: "TAGS", sortLabel: "SẮP XẾP",
    doneBtn: "Xong", settingsTitle: "Cài đặt", musicLabel: "🎵 Nhạc nền",
    volumeLabel: "🔊 Âm lượng nhạc", sfxLabel: "🔔 Âm thanh UI",
    sfxEffect: "Hiệu ứng âm thanh", sfxOn: "BẬT", sfxOff: "TẮT",
    loginTitle: "Admin Login", loginUser: "Tên đăng nhập", loginPass: "Mật khẩu",
    loginBtn: "Đăng nhập", loginError: "Sai tên đăng nhập hoặc mật khẩu",
    sourceName: "Tên nguồn", linkPlaceholder: "VD: Google Drive, 1Fichier...",
    linkLabel: "Các link tải", addLinkBtn: "Thêm link",
    ytTrailer: "Thêm trailer YouTube", ytPlaceholder: "https://youtube.com/watch?v=...",
    detailLoading: "Đang tải thông tin game...",
    websiteBtn: "Website", photoBtn: "Ảnh",
    editLink: "Sửa link", addLinkTitle: "Thêm link tải",
    nameLabel: "Tên hiển thị", urlLabel: "URL tải",
    addUrlBtn: "Thêm URL", turnOff: "Tắt nhạc",
  },
  en: {
    search: "Search games...", allGenres: "All", filterBtn: "Filter", sortBtn: "Sort",
    selectBtn: "Select", menuBtn: "Menu", backBtn: "Back", loading: "Loading...",
    gameError: "Failed to load game info.",
    noGames: "No games found", noDesc: "No description available.",
    noLinks: "No download links yet.", addLink: "Add link", addTrailer: "Add trailer",
    save: "Save", cancel: "Cancel", screenshotsLabel: "Screenshots & Trailer",
    seriesLabel: "Same series", downloadLabel: "Download",
    homepage: "Homepage", viewPhotos: "View photos",
    rating: "Rating", metacritic: "Metacritic", released: "Released",
    playtime: "Playtime", reviews: "Reviews", developer: "Developer",
    sortRating: "Highest rated", sortMeta: "Metacritic",
    sortNew: "Newest", sortName: "Name A→Z",
    hours: "hrs", games: "games", filterTitle: "Genres & Tags",
    genreLabel: "GENRES", tagLabel: "TAGS", sortLabel: "SORT BY",
    doneBtn: "Done", settingsTitle: "Settings", musicLabel: "🎵 Music",
    volumeLabel: "🔊 Volume", sfxLabel: "🔔 Sound FX",
    sfxEffect: "Sound effects", sfxOn: "ON", sfxOff: "OFF",
    loginTitle: "Admin Login", loginUser: "Username", loginPass: "Password",
    loginBtn: "Login", loginError: "Wrong username or password",
    sourceName: "Source name", linkPlaceholder: "e.g. Google Drive, 1Fichier...",
    linkLabel: "Download links", addLinkBtn: "Add link",
    ytTrailer: "Add YouTube trailer", ytPlaceholder: "https://youtube.com/watch?v=...",
    detailLoading: "Loading game info...",
    websiteBtn: "Website", photoBtn: "Photos",
    editLink: "Edit link", addLinkTitle: "Add download link",
    nameLabel: "Display name", urlLabel: "URL",
    addUrlBtn: "Add URL", turnOff: "Turn off music",
  }
};

let currentLang = localStorage.getItem("sv_lang") || "vi";
const t = key => LANGS[currentLang][key] || LANGS.vi[key] || key;

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("sv_lang", lang);
  const flag = document.getElementById("lang-flag");
  if (flag) flag.src = lang === "vi" 
    ? "https://flagcdn.com/w40/vn.png" 
    : "https://flagcdn.com/w40/gb.png";
}

/* ══ WIIU SOUND ENGINE ══ */
const AC = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  if (!musicPlayer.sfxEnabled) return;
  const g = AC.createGain();
  g.connect(AC.destination);
  if (type === "tick") {
    const o = AC.createOscillator();
    o.connect(g); o.type = "sine"; o.frequency.value = 880;
    g.gain.setValueAtTime(0.06, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + 0.08);
    o.start(); o.stop(AC.currentTime + 0.08);
  } else if (type === "select") {
    const o = AC.createOscillator();
    o.connect(g); o.type = "sine";
    o.frequency.setValueAtTime(520, AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(880, AC.currentTime + 0.06);
    g.gain.setValueAtTime(0.12, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + 0.18);
    o.start(); o.stop(AC.currentTime + 0.18);
  } else if (type === "back") {
    const o = AC.createOscillator();
    o.connect(g); o.type = "sine";
    o.frequency.setValueAtTime(600, AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(280, AC.currentTime + 0.18);
    g.gain.setValueAtTime(0.1, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + 0.22);
    o.start(); o.stop(AC.currentTime + 0.22);
  } else if (type === "open") {
    [0, 0.07].forEach((delay, i) => {
      const o = AC.createOscillator();
      const gn = AC.createGain();
      o.connect(gn); gn.connect(AC.destination);
      o.type = "sine";
      o.frequency.value = i === 0 ? 660 : 880;
      gn.gain.setValueAtTime(0.08, AC.currentTime + delay);
      gn.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + delay + 0.12);
      o.start(AC.currentTime + delay); o.stop(AC.currentTime + delay + 0.12);
    });
  } else if (type === "screenshot") {
    const bufSize = AC.sampleRate * 0.06;
    const buf = AC.createBuffer(1, bufSize, AC.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random()*2-1) * (1 - i/bufSize);
    const src = AC.createBufferSource();
    src.buffer = buf; src.connect(g);
    g.gain.setValueAtTime(0.15, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, AC.currentTime + 0.06);
    src.start();
  }
}

/* ══ MUSIC PLAYER ══ */
const MUSIC_TRACKS = [
  { id: "off",    name: "Tắt nhạc",           sub: "", file: null },
  { id: "track1", name: "Soft System Shuffle", sub: "Soft System Shuffle", file: "music/Soft System Shuffle.mp3" },
  { id: "track2", name: "Pixel Home Screen",   sub: "Pixel Home Screen",   file: "music/Pixel Home Screen.mp3" },
  { id: "track3", name: "Bubble Menu",         sub: "Bubble Menu",         file: "music/Bubble Menu.mp3" },
  { id: "track4", name: "Sleepy Pixels",       sub: "Sleepy Pixels",       file: "music/Sleepy Pixels.mp3" },
  { id: "track5", name: "Soft Circuits",       sub: "Soft Circuits",       file: "music/Soft Circuits.mp3" },
];

const musicPlayer = {
  audio: null,
  currentId: localStorage.getItem("sv_music") || "off",
  volume: parseFloat(localStorage.getItem("sv_vol") || "0.4"),
  sfxEnabled: localStorage.getItem("sv_sfx") !== "false",

  play(trackId) {
  const track = MUSIC_TRACKS.find(t => t.id === trackId);
  if (!track) return;
  this.currentId = trackId;
  localStorage.setItem("sv_music", trackId);
  if (this.audio) { this.audio.pause(); this.audio = null; }
  if (!track.file) return;

  this.audio = new Audio(track.file);
  this.audio.loop = true;
  this.audio.volume = this.volume;
  this.audio.play().catch(() => {});
},

  setVolume(v) {
    this.volume = v;
    localStorage.setItem("sv_vol", v);
    if (this.audio) this.audio.volume = v;
  },

  init() {
  const playableTracks = MUSIC_TRACKS.filter(t => t.file);
  const randomTrack = playableTracks[Math.floor(Math.random() * playableTracks.length)];
  this.currentId = randomTrack ? randomTrack.id : "off";
  if (this.currentId !== "off") {
    const track = MUSIC_TRACKS.find(t => t.id === this.currentId);
    if (track?.file) {
      this.audio = new Audio(track.file);
      this.audio.loop = true;
      this.audio.volume = this.volume;
      this.audio.play().catch(() => {
        const resume = () => { this.audio?.play(); };
        document.addEventListener("pointerdown", resume, { once: true });
        document.addEventListener("keydown", resume, { once: true });
      });
    }
  }
}
};

document.addEventListener("pointerdown", () => { if (AC.state === "suspended") AC.resume(); }, { once: true });

const RAWG_KEY  = "33153d876f664c52b6180d903a53088b";
const RAWG_BASE = "https://api.rawg.io/api";
const SWITCH_ID = 7;
const PAGE_SIZE = 24;

const GRAD_CLASSES = ["grad-purple","grad-orange","grad-cyan","grad-blue","grad-green","grad-red","grad-gold"];
const GRAD_VALS = {
  "grad-purple": "linear-gradient(135deg,#c060f8,#8840e0,#e060c0)",
  "grad-orange": "linear-gradient(135deg,#ff9020,#f06010)",
  "grad-cyan":   "linear-gradient(135deg,#40c8e0,#1090b8)",
  "grad-blue":   "linear-gradient(135deg,#4090f0,#2060c8)",
  "grad-green":  "linear-gradient(135deg,#60d060,#308030)",
  "grad-red":    "linear-gradient(135deg,#f04040,#c01020)",
  "grad-gold":   "linear-gradient(135deg,#f8c040,#d08010)",
};
const SIZE_PATTERN = ["wide","normal","normal","tall","normal","normal","big","normal","normal","normal","wide","normal"];

const S = {
  genre: "", tag: "", order: "-rating",
  searchQ: "", currentId: null,
  scImgs: [], scIdx: 0,
  detailList: [], detailIdx: 0,
  page: 1, totalCount: 0, loading: false, hasMore: true, scrollY: 0,
  games: [],
  gameDetail: null,
  filterViethoa: false,
};

const $   = id => document.getElementById(id);
const $$  = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const deb = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

function mcClass(s) {
  if (!s) return "mc-none";
  return s >= 75 ? "mc-green" : s >= 50 ? "mc-yellow" : "mc-red";
}
function fmtDate(s) {
  if (!s) return "N/A";
  const locale = currentLang === "vi" ? "vi-VN" : "en-US";
  return new Date(s).toLocaleDateString(locale, { year: "numeric", month: "short" });
}
function ratingTo5(r) { return r ? parseFloat(r.toFixed(1)) : 0; }

/* ── SORT OPTS (dynamic) ── */
function getSortOpts() {
  return [
    { label: currentLang==="vi"?"Đánh giá cao nhất":"Highest Rated", val: "-rating"       },
    { label: currentLang==="vi"?"Phổ biến nhất":"Most Popular",      val: "-added"         },
    { label: "Metacritic",                                            val: "-metacritic"    },
    { label: currentLang==="vi"?"Mới phát hành":"Newest",            val: "-released"      },
    { label: currentLang==="vi"?"Cũ nhất":"Oldest",                  val: "released"       },
    { label: currentLang==="vi"?"Tên A→Z":"Name A→Z",                val: "name"           },
    { label: currentLang==="vi"?"Tên Z→A":"Name Z→A",                val: "-name"          },
    { label: currentLang==="vi"?"Chơi nhiều nhất":"Most Played",     val: "-playtime"      },
    { label: currentLang==="vi"?"Nhiều đánh giá nhất":"Most Reviews",val: "-ratings_count" },
  ];
}

/* ── RAWG ── */
function buildListURL() {
  const params = new URLSearchParams({
    key: RAWG_KEY, platforms: window._activePlatformId || SWITCH_ID, page_size: PAGE_SIZE, page: S.page,
  });
  if (S.searchQ) params.set("search", S.searchQ);
  if (S.genre)   params.set("genres", S.genre);
  if (S.tag)     params.set("tags", S.tag);
  const orderMap = {
  "-rating":        "-rating",
  "-metacritic":    "-metacritic",
  "-released":      "-released",
  "released":       "released",
  "name":           "name",
  "-name":          "-name",
  "-added":         "-added",
  "-playtime":      "-playtime",
  "-ratings_count": "-ratings_count",
};
  params.set("ordering", orderMap[S.order] || "-rating");
  if (S.order === "-released") {
    const today = new Date().toISOString().split("T")[0];
    params.set("dates", `2010-01-01,${today}`);
    
  }
  return `${RAWG_BASE}/games?${params}`;
}
function buildDetailURL(id)      { return `${RAWG_BASE}/games/${id}?key=${RAWG_KEY}`; }
function buildScreenshotsURL(id) { return `${RAWG_BASE}/games/${id}/screenshots?key=${RAWG_KEY}`; }

function normalizeGame(raw) {
  return {
    id:            raw.id,
    slug:          raw.slug,
    name:          raw.name,
    img:           raw.background_image || `https://placehold.co/400x400/dff1fa/009AC7?text=${encodeURIComponent((raw.name||"Game").slice(0,12))}`,
    released:      raw.released || null,
    rating:        ratingTo5(raw.rating),
    ratings_count: raw.ratings_count || 0,
    metacritic:    raw.metacritic || null,
    playtime:      raw.playtime || null,
    genres:        (raw.genres || []).map(g => g.name),
    tags:          (raw.tags || []).slice(0,5).map(t => t.slug),
    dev:           raw.developers ? raw.developers.map(d => d.name).join(", ") : (raw.developer || "N/A"),
    publishers:    raw.publishers ? raw.publishers.map(p => p.name).join(", ") : null,
    description:   raw.description_raw || raw.description || "",
    website:       raw.website || null,
    esrb:          raw.esrb_rating ? raw.esrb_rating.name : null,
    stores:        (raw.stores || []).map(s => ({ name: s.store.name, url: s.url || null })),
    platforms: (raw.platforms || []).map(p => p.platform),
    tags_top:      (raw.tags || []).filter(t => t.language === "eng").slice(0,8).map(t => t.name),
  };
}

/* ── FETCH GAMES ── */
async function fetchGames(append = false) {
  if (S.loading) return;
  if (append && !S.hasMore) return;
  S.loading = true;
  const viethoaIds = S.filterViethoa ? await getViethoaList() : (window._viethoaCache || []);
  window._viethoaCache = viethoaIds;
  if (!append) showShelfLoading();
  try {
    const isSwitch = (window._activePlatformId || SWITCH_ID) === SWITCH_ID;
    const [res, customGamesRaw] = await Promise.all([
      fetch(buildListURL()),
      (append || !isSwitch) ? Promise.resolve([]) : getCustomGames()
    ]);
    if (!res.ok) throw new Error(`RAWG API error: ${res.status}`);
    const data = await res.json();
    const activePid = window._activePlatformId || SWITCH_ID;
    const rawgGames = (data.results || [])
      .filter(g => g.platforms && g.platforms.some(p => p.platform.id === activePid))
      .map(normalizeGame);

    // Filter custom games theo search + genre + tag
    let filteredCustom = customGamesRaw.map(normalizeCustomGame);

    if (S.searchQ) {
      const q = S.searchQ.toLowerCase();
      filteredCustom = filteredCustom.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
      );
    }
    if (S.genre) {
      filteredCustom = filteredCustom.filter(g =>
        g.genres.some(genre => genre.toLowerCase().includes(S.genre.toLowerCase()))
      );
    }
    if (S.tag) {
      filteredCustom = filteredCustom.filter(g =>
        g.tags_top?.some(tag => tag.toLowerCase().includes(S.tag.toLowerCase()))
      );
    }

    // Sort custom games theo cùng tiêu chí
  if (S.order === "name") {
    filteredCustom.sort((a, b) => a.name.localeCompare(b.name));
  } else if (S.order === "-name") {
    filteredCustom.sort((a, b) => b.name.localeCompare(a.name));
  } else if (S.order === "-rating") {
    filteredCustom.sort((a, b) => (b.rating||0) - (a.rating||0) || a.name.localeCompare(b.name));
  } else if (S.order === "-released") {
    filteredCustom.sort((a, b) => {
      if (!a.released && !b.released) return a.name.localeCompare(b.name);
      if (!a.released) return 1;
      if (!b.released) return -1;
      return new Date(b.released) - new Date(a.released);
    });
  } else if (S.order === "released") {
    filteredCustom.sort((a, b) => {
      if (!a.released && !b.released) return a.name.localeCompare(b.name);
      if (!a.released) return 1;
      if (!b.released) return -1;
      return new Date(a.released) - new Date(b.released);
    });
  } else if (S.order === "-playtime") {
    filteredCustom.sort((a, b) => {
      if (!a.playtime && !b.playtime) return a.name.localeCompare(b.name);
      if (!a.playtime) return 1;
      if (!b.playtime) return -1;
      return b.playtime - a.playtime;
    });
  } else if (S.order === "-metacritic") {
    filteredCustom.sort((a, b) => {
      if (!a.metacritic && !b.metacritic) return a.name.localeCompare(b.name);
      if (!a.metacritic) return 1;
      if (!b.metacritic) return -1;
      return b.metacritic - a.metacritic;
    });
  }

  else if (S.order === "-added" || S.order === "-ratings_count") {
    filteredCustom.sort((a, b) => (b.rating||0) - (a.rating||0));
  }

  // Merge rồi sort lại toàn bộ theo đúng tiêu chí
  let normalized;
  if (!append) {
    const merged = [...filteredCustom, ...rawgGames];
    if (S.order === "name") {
      merged.sort((a, b) => a.name.localeCompare(b.name));
    } else if (S.order === "-name") {
      merged.sort((a, b) => b.name.localeCompare(a.name));
    } else if (S.order === "-rating") {
      merged.sort((a, b) => (b.rating||0) - (a.rating||0) || a.name.localeCompare(b.name));
    } else if (S.order === "-released") {
      merged.sort((a, b) => {
        if (!a.released && !b.released) return a.name.localeCompare(b.name);
        if (!a.released) return 1;
        if (!b.released) return -1;
        return new Date(b.released) - new Date(a.released);
      });
    } else if (S.order === "released") {
      merged.sort((a, b) => {
        if (!a.released && !b.released) return a.name.localeCompare(b.name);
        if (!a.released) return 1;
        if (!b.released) return -1;
        return new Date(a.released) - new Date(b.released);
      });
    } else if (S.order === "-playtime") {
      merged.sort((a, b) => {
        if (!a.playtime && !b.playtime) return a.name.localeCompare(b.name);
        if (!a.playtime) return 1;
        if (!b.playtime) return -1;
        return b.playtime - a.playtime;
      });
    } else if (S.order === "-metacritic") {
      merged.sort((a, b) => {
        if (!a.metacritic && !b.metacritic) return a.name.localeCompare(b.name);
        if (!a.metacritic) return 1;
        if (!b.metacritic) return -1;
        return b.metacritic - a.metacritic;
      });
    }
    else if (S.order === "-added" || S.order === "-ratings_count") {
      merged.sort((a, b) => {
        const aC = String(a.id).startsWith("custom_");
        const bC = String(b.id).startsWith("custom_");
        if (aC && !bC) return 1;
        if (!aC && bC) return -1;
        if (aC && bC) return (b.rating||0) - (a.rating||0);
        return (b.ratings_count||0) - (a.ratings_count||0);
      });
    }
    normalized = merged;
    normalized.forEach(g => { g.isViethoa = viethoaIds.includes(String(g.id)); });

    // Áp dụng ảnh custom cho tile ngoài shelf
    const allLinks = await fetchAllLinks();
    normalized.forEach(g => {
      const customImg = allLinks[`custom_img_${g.id}`];
      if (customImg?.cover) g.img = customImg.cover;
    });
  } else {
    normalized = rawgGames;
  }

  // Lọc Việt hóa
  if (S.filterViethoa) {
    const viethoaList = await getViethoaList();
    window._viethoaCache = viethoaList;
    normalized = normalized.filter(g => viethoaList.includes(String(g.id)));
  }

    S.games      = append ? [...S.games, ...normalized] : normalized;
    S.totalCount = data.count + (append ? 0 : filteredCustom.length);
    S.hasMore    = !!data.next;
    if (!append) renderShelf(); else appendTiles(normalized, S.games.length - normalized.length);
    updateCount();
  } catch (err) {
    showShelfError(err.message);
  } finally {
    S.loading = false;
  }
}

function appendTiles(newGames, startIdx) {
  const grid = $("shelf-grid");
  if (!grid) return;
  newGames.forEach((g, i) => {
    const idx       = startIdx + i;
    const sizeClass = SIZE_PATTERN[idx % SIZE_PATTERN.length];
    const gradVal   = GRAD_VALS[GRAD_CLASSES[idx % GRAD_CLASSES.length]];
    const mcCls     = mcClass(g.metacritic);
    const tile = document.createElement("div");
    tile.className = `game-tile ${sizeClass}`;
    tile.style.animationDelay = `${i * 35}ms`;
    tile.innerHTML = `
  <img class="tile-img" data-src="${g.img}" src="" alt="${g.name}" />
  <div class="tile-rating"><i class="ph-fill ph-star"></i> ${g.rating.toFixed(1)}</div>
  ${g.metacritic ? `<div class="tile-mc ${mcCls}">${g.metacritic}</div>` : ""}
  ${g.isViethoa  ? `<div class="tile-vn">🇻🇳</div>` : ""}
  <div class="tile-overlay"><div class="tile-name">${g.name}</div></div>`;
    const borderEl = document.createElement("div");
    borderEl.style.cssText = `position:absolute;inset:0;border-radius:18px;pointer-events:none;z-index:3;
      padding:3px;background:${gradVal};
      -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
      -webkit-mask-composite:xor;mask-composite:exclude;opacity:1;transition:opacity 0.2s;`;
    tile.appendChild(borderEl);
    const img = tile.querySelector(".tile-img");
    imgObserver.observe(img);
    tile.addEventListener("mouseenter", () => { borderEl.style.opacity = "1"; playSound("tick"); });
    tile.addEventListener("mouseleave", () => borderEl.style.opacity = "0");
    tile.addEventListener("click", e => {
      const r = document.createElement("div");
      r.className = "tile-ripple";
      const rect = tile.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      tile.appendChild(r);
      r.addEventListener("animationend", () => r.remove());
      tile.classList.add("flash");
      tile.addEventListener("animationend", () => tile.classList.remove("flash"), { once: true });
      transitionToDetail(g.id, g.slug, tile);
    });
    grid.appendChild(tile);
    tile.addEventListener("mouseenter", () => {
      const allTiles = [...document.querySelectorAll(".game-tile")];
      const idx = allTiles.indexOf(tile);
      applyRepel(allTiles, idx);
    });
  });
}

function setupInfiniteScroll() {
  $("game-shelf").addEventListener("scroll", () => {
    const shelf = $("game-shelf");
    const nearBottom = shelf.scrollTop + shelf.clientHeight >= shelf.scrollHeight - 300;
    if (nearBottom && !S.loading && S.hasMore) { S.page++; fetchGames(true); }
  });
}

const imgObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    img.onload  = () => img.classList.add("loaded");
    img.onerror = () => { img.src = `https://placehold.co/400x400/dff1fa/009AC7?text=Game`; img.classList.add("loaded"); };
    img.src = img.dataset.src;
    imgObserver.unobserve(img);
  });
}, { rootMargin: "200px" });

async function fetchGameDetail(id) {
  // Custom game — lấy từ JSONBin
  if (String(id).startsWith("custom_")) {
  const customs = await getCustomGames();
  const raw = customs.find(g => `custom_${g.id}` === String(id));
  if (!raw) throw new Error("Custom game not found");
  const game = normalizeCustomGame(raw);
  game.trailers = await getTrailers(game.id).catch(() => []);

  // Dịch description nếu lang là VI và có description
  if (game.description && currentLang === "vi") {
    try {
      const url  = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(game.description.slice(0, 4500))}`;
      const res  = await fetch(url);
      const data = await res.json();
      game.description = data[0].map(s => s[0]).join("");
    } catch { /* giữ nguyên nếu lỗi */ }
  }

  const customImg2 = (await fetchAllLinks())[`custom_img_${game.id}`];
  if (customImg2) {
    if (customImg2.cover) game.img = customImg2.cover;
    if (customImg2.screenshots?.length) game.screenshots = customImg2.screenshots;
  }

  return game;
}

  // RAWG game — giữ nguyên logic cũ
  const [detailRes, ssRes, similarRes] = await Promise.all([
    fetch(buildDetailURL(id)),
    fetch(buildScreenshotsURL(id)),
    fetch(`${RAWG_BASE}/games/${id}/game-series?key=${RAWG_KEY}&page_size=6`),
  ]);
  const detail      = await detailRes.json();
  const ssData      = await ssRes.json();
  const similarData = await similarRes.json();

  const screenshots = (ssData.results || []).map(s => s.image);
  const game        = normalizeGame(detail);
  game.screenshots  = screenshots.length ? screenshots : [game.img];
  game.similar      = (similarData.results || [])
    .filter(g => g.platforms && g.platforms.some(p => p.platform.id === SWITCH_ID))
    .slice(0, 6)
    .map(g => ({ id: g.id, slug: g.slug, name: g.name, img: g.background_image || "", rating: ratingTo5(g.rating) }));

  game.trailers = await getTrailers(game.id).catch(() => []);
  // Load ảnh custom nếu admin đã override
  const customImg = (await fetchAllLinks())[`custom_img_${game.id}`];
  if (customImg) {
    if (customImg.cover) game.img = customImg.cover;
    if (customImg.screenshots?.length) game.screenshots = customImg.screenshots;
  }
  if (game.description) {
    try {
      const rawDesc = game.description
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]*]/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim()
        .slice(0, 4500);
      const targetLang = currentLang === "vi" ? "vi" : "en";
      if (targetLang === "vi") {
        const url  = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(rawDesc)}`;
        const res  = await fetch(url);
        const data = await res.json();
        game.description = data[0].map(s => s[0]).join("");
      } else {
        game.description = rawDesc;
      }
    } catch { /* giữ nguyên */ }
  }
  return game;
}

/* ── CLOCK ── */
function startClock() {
  const el = $("hud-clock");
  function tick() {
    const locale = currentLang === "vi" ? "vi-VN" : "en-US";
    el.textContent = new Date().toLocaleTimeString(locale, { hour:"2-digit", minute:"2-digit" });
  }
  tick(); setInterval(tick, 10000);
}

/* ── BG BUBBLES ── */
function buildBubbles() {
  const layer  = $("bg-layer");
  const colors = ["#3ab4d8","#f0a500","#ff9020","#9060d8","#52b840","#e4001b","#ffffff","#40c8e0"];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement("div");
    el.className = "bg-bubble";
    const size = 50 + Math.random() * 110;
    const tx1 = (Math.random() - 0.5) * 300;
    const ty1 = (Math.random() - 0.5) * 300;
    const tx2 = (Math.random() - 0.5) * 400;
    const ty2 = (Math.random() - 0.5) * 400;
    const tx3 = (Math.random() - 0.5) * 250;
    const ty3 = (Math.random() - 0.5) * 250;
    el.style.cssText = `
      width:${size}px;height:${size}px;
      top:${Math.random()*90}%;left:${Math.random()*95}%;
      background:${colors[i % colors.length]};
      opacity:${0.08 + Math.random()*0.12};
      animation:bubble-float-${i} ${18+Math.random()*22}s ease-in-out infinite;
      animation-delay:${-Math.random()*25}s;`;
    layer.appendChild(el);
    const style = document.createElement("style");
    style.textContent = `
      @keyframes bubble-float-${i} {
        0%   { transform: translate(0,0) scale(1); }
        25%  { transform: translate(${tx1}px,${ty1}px) scale(${0.9+Math.random()*0.2}); }
        50%  { transform: translate(${tx2}px,${ty2}px) scale(${0.85+Math.random()*0.25}); }
        75%  { transform: translate(${tx3}px,${ty3}px) scale(${0.92+Math.random()*0.15}); }
        100% { transform: translate(0,0) scale(1); }
      }`;
    document.head.appendChild(style);
  }
}

musicPlayer.init();

$("hud-settings").addEventListener("click", () => {
  playSound("open");
  buildSettingsOverlay();
  $("settings-overlay").classList.remove("hidden");
});
$("settings-close").addEventListener("click", () => {
  playSound("back");
  $("settings-overlay").classList.add("hidden");
});
$("settings-overlay").addEventListener("click", e => {
  if (e.target === $("settings-overlay")) $("settings-overlay").classList.add("hidden");
});

/* ── FILTER DATA ── */
const ALL_GENRES = [
  { label:"Action", slug:"action" }, { label:"Adventure", slug:"adventure" },
  { label:"RPG", slug:"role-playing-games-rpg" }, { label:"Platformer", slug:"platformer" },
  { label:"Shooter", slug:"shooter" }, { label:"Racing", slug:"racing" },
  { label:"Fighting", slug:"fighting" }, { label:"Strategy", slug:"strategy" },
  { label:"Simulation", slug:"simulation" }, { label:"Puzzle", slug:"puzzle" },
  { label:"Indie", slug:"indie" }, { label:"Sports", slug:"sports" },
  { label:"Arcade", slug:"arcade" }, { label:"Family", slug:"family" },
  { label:"Card & Board", slug:"card" }, { label:"Educational", slug:"educational" },
  { label:"Casual", slug:"casual" }, { label:"Massively MMO", slug:"massively-multiplayer" },
];
const ALL_TAGS = [
  { label:"Singleplayer", slug:"singleplayer" }, { label:"Multiplayer", slug:"multiplayer" },
  { label:"Co-op", slug:"co-op" }, { label:"Open World", slug:"open-world" },
  { label:"Roguelike", slug:"roguelike" }, { label:"Metroidvania", slug:"metroidvania" },
  { label:"Relaxing", slug:"relaxing" }, { label:"Story Rich", slug:"story-rich" },
  { label:"2D", slug:"2d" }, { label:"3D", slug:"3d" },
  { label:"Turn-Based", slug:"turn-based" }, { label:"Hack and Slash", slug:"hack-and-slash" },
  { label:"Stealth", slug:"stealth" }, { label:"Survival", slug:"survival" },
  { label:"Horror", slug:"horror" }, { label:"Atmospheric", slug:"atmospheric" },
  { label:"Funny", slug:"funny" }, { label:"Difficult", slug:"difficult" },
  { label:"Pixel Art", slug:"pixel-art" }, { label:"Anime", slug:"anime" },
  { label:"Local Coop", slug:"local-co-op" }, { label:"Online Coop", slug:"online-co-op" },
  { label:"Crafting", slug:"crafting" }, { label:"Exploration", slug:"exploration" },
  { label:"Sandbox", slug:"sandbox" }, { label:"Tower Defense", slug:"tower-defense" },
  { label:"Visual Novel", slug:"visual-novel" }, { label:"Card Game", slug:"card-game" },
  { label:"Music", slug:"music" }, { label:"Sports", slug:"sports" },
];

/* ══ HOME VIEW ══ */
function showHome(restoreScroll = false) {
  const activePlat = PLATFORMS?.find(p => p.id === currentPlatform);
$("hud-title").innerHTML = `<i class="ph-fill ph-lightning"></i> ${activePlat ? activePlat.name + " Vault" : "NSwitch Vault"}`;
  $("hud-back").classList.add("hidden");
  $("hud-login").classList.remove("hidden");
  $("hud-btns-left").innerHTML = `
    <span class="hud-btn" id="btn-filter"><kbd>Y</kbd> ${t("filterBtn")}</span>
    <span class="hud-btn" id="btn-sort"><kbd>−</kbd> ${t("sortBtn")}</span>`;
  $("hud-btns-right").innerHTML = `
  <span class="hud-btn"><kbd>A</kbd> ${t("selectBtn")}</span>
  <span class="hud-btn" id="btn-menu"><kbd>+</kbd> ${t("menuBtn")}</span>`;
document.getElementById("btn-menu")?.addEventListener("click", openMenuOverlay);
document.getElementById("btn-menu")?.addEventListener("mouseenter", () => playSound("tick"));
  $("btn-filter")?.addEventListener("click", openFilter);
  $("btn-sort")?.addEventListener("click", openFilter);
  $("btn-filter")?.addEventListener("mouseenter", () => playSound("tick"));
  $("btn-sort")?.addEventListener("mouseenter",   () => playSound("tick"));

  $("view-detail").classList.add("hidden");  $("view-detail").classList.remove("active");
  $("view-home").classList.remove("hidden"); $("view-home").classList.add("active");

  history.replaceState(null, "", "#/home");
  buildGenrePills();

  const si = $("search-input");
  if (si) si.placeholder = t("search");


  // Xóa nút cũ nếu có
$("btn-add-game")?.remove();
    updateSEO({
    title: null,
    description: null,
    image: null,
    url: window.location.origin + "/#/home"
    });
// Hiện nút thêm game nếu là admin
if (isAdmin) {
  const addBtn = document.createElement("button");
  addBtn.id = "btn-add-game";
  addBtn.className = "dl-add-btn";
  addBtn.style.cssText = "margin:0 28px 12px;width:calc(100% - 56px);";
  addBtn.innerHTML = `<i class="ph-fill ph-plus-circle"></i> ${currentLang === "vi" ? "Thêm game mới" : "Add new game"}`;
  addBtn.addEventListener("click", () => openAddGameModal());
  const shelf = $("game-shelf");
  shelf.parentElement.insertBefore(addBtn, shelf);
}

  if (restoreScroll && S.games.length > 0) {
    updateCount();
    const target = S.scrollY;
    requestAnimationFrame(() => { $("game-shelf").scrollTop = target; });
  } else {
    S.scrollY = 0;
    fetchGames();
  }
}

function buildGenrePills() {
  const wrap = $("genre-pills");
  wrap.innerHTML =
    `<button class="genre-pill-hud ${!S.genre?"active":""}" data-g="">${t("allGenres")}</button>` +
    ALL_GENRES.map(g => `<button class="genre-pill-hud ${S.genre===g.slug?"active":""}" data-g="${g.slug}">${g.label}</button>`).join("");
  wrap.querySelectorAll(".genre-pill-hud").forEach(btn => {
    btn.addEventListener("click", () => {
      S.genre = btn.dataset.g; S.page = 1;
      wrap.querySelectorAll(".genre-pill-hud").forEach(b => b.classList.toggle("active", b.dataset.g===S.genre));
      fetchGames();
    });
  });
}


function showShelfLoading() {
  $("game-shelf").innerHTML = `<div class="shelf-grid">` +
    Array.from({length:12}, (_,i) => `<div class="game-tile ${SIZE_PATTERN[i%SIZE_PATTERN.length]} tile-skeleton"></div>`).join("") +
    `</div>`;
}

function showShelfError(msg) {
  $("game-shelf").innerHTML = `
    <div class="shelf-grid"><div class="shelf-empty" style="grid-column:1/-1">
      <div class="shelf-empty-icon"><i class="ph-fill ph-warning-circle"></i></div>
      <div class="shelf-empty-text">
        ${RAWG_KEY==="YOUR_RAWG_API_KEY_HERE"
          ? 'Chưa điền RAWG API Key!'
          : `Lỗi tải data: ${msg}`}
      </div>
    </div></div>`;
}

function renderShelf() {
  const games = S.games;
  $("game-shelf").innerHTML = `<div class="shelf-grid" id="shelf-grid"></div>`;
  const grid = $("shelf-grid");
  if (!games.length) {
    grid.innerHTML = `<div class="shelf-empty"><div class="shelf-empty-icon"><i class="ph-fill ph-game-controller"></i></div><div class="shelf-empty-text">${t("noGames")}</div></div>`;
    return;
  }
  games.forEach((g, i) => {
    const sizeClass = SIZE_PATTERN[i % SIZE_PATTERN.length];
    const gradVal   = GRAD_VALS[GRAD_CLASSES[i % GRAD_CLASSES.length]];
    const mcCls     = mcClass(g.metacritic);
    const tile = document.createElement("div");
    tile.className = `game-tile ${sizeClass}`;
    tile.style.animationDelay = `${i * 35}ms`;
    tile.innerHTML = `
      <img class="tile-img" data-src="${g.img}" src="" alt="${g.name}" />
      <div class="tile-rating"><i class="ph-fill ph-star"></i> ${g.rating.toFixed(1)}</div>
      ${g.metacritic ? `<div class="tile-mc ${mcCls}">${g.metacritic}</div>` : ""}
      <div class="tile-overlay"><div class="tile-name">${g.name}</div></div>`;
    const borderEl = document.createElement("div");
    borderEl.style.cssText = `position:absolute;inset:0;border-radius:18px;pointer-events:none;z-index:3;
      padding:3px;background:${gradVal};
      -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
      -webkit-mask-composite:xor;mask-composite:exclude;opacity:1;transition:opacity 0.2s;`;
    tile.appendChild(borderEl);
    const img = tile.querySelector(".tile-img");
    imgObserver.observe(img);
    tile.addEventListener("mouseenter", () => { borderEl.style.opacity = "1"; playSound("tick"); });
    tile.addEventListener("mouseleave", () => borderEl.style.opacity = "0");
    tile.addEventListener("click", e => {
      const r = document.createElement("div");
      r.className = "tile-ripple";
      const rect = tile.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
      tile.appendChild(r);
      r.addEventListener("animationend", () => r.remove());
      tile.classList.add("flash");
      tile.addEventListener("animationend", () => tile.classList.remove("flash"), { once: true });
      transitionToDetail(g.id, g.slug, tile);
    });
    tile.tabIndex = 0;
    tile.addEventListener("keydown", e => { if (e.key==="Enter") showDetail(g.id, g.slug); });
    grid.appendChild(tile);
  });
  requestAnimationFrame(() => requestAnimationFrame(() => initRepelEffect()));
}

function initRepelEffect() {
  const tiles = [...document.querySelectorAll(".game-tile")];
  const grid  = document.getElementById("shelf-grid");
  if (!tiles.length) return;
  tiles.forEach((tile, i) => {
    tile.addEventListener("mouseenter", () => applyRepel(tiles, i));
  });
  grid.addEventListener("mouseleave", () => {
    tiles.forEach(t => { t.style.transform = ""; t.style.zIndex = ""; t.style.filter = "";t.style.boxShadow = ""; });
  });
}

function applyRepel(tiles, hovIdx) {
  const rects = tiles.map(t => t.getBoundingClientRect());
  const hov = rects[hovIdx];
  const hcx = hov.left + hov.width / 2, hcy = hov.top + hov.height / 2;
  tiles.forEach((tile, i) => {
    if (i === hovIdx) { tile.style.transform = "scale(1.1)"; tile.style.zIndex = "30";tile.style.boxShadow = "0 20px 48px rgba(0,0,0,0.28)"; return; }
    const r = rects[i];
    const dx = (r.left + r.width/2) - hcx, dy = (r.top + r.height/2) - hcy;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const influence = (hov.width + r.width);
    if (dist < influence && dist > 0) {
      const f = Math.pow(1 - dist/influence, 1.4);
      tile.style.transform = `translate(${dx/dist*f*36}px,${dy/dist*f*36}px)`;
      tile.style.zIndex = "5";
    } else { tile.style.transform = ""; tile.style.zIndex = ""; }
  });
}

function updateCount() { $("hud-count").textContent = `${S.totalCount.toLocaleString()} ${t("games")}`; }

/* ══ DETAIL VIEW ══ */
function transitionToDetail(gameId, gameSlug, tileEl) {
  if (tileEl.dataset.transitioning) return;
  tileEl.dataset.transitioning = "1";
  playSound("select");
  const rect  = tileEl.getBoundingClientRect();
  const vw    = window.innerWidth;
  const vh    = window.innerHeight;
  const imgSrc = tileEl.querySelector(".tile-img")?.src || "";
  const overlay = document.createElement("div");
  overlay.className = "transition-overlay";
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("active"));
  const hero = document.createElement("div");
  hero.className = "tile-hero";
  hero.style.cssText = `top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px`;
  hero.innerHTML = `<img src="${imgSrc}" />`;
  document.body.appendChild(hero);
  const targetW = Math.min(vw * 0.38, 340);
  const targetH = targetW;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    hero.style.top = `${vh/2 - targetH/2}px`;
    hero.style.left = `${vw/2 - targetW/2}px`;
    hero.style.width = `${targetW}px`;
    hero.style.height = `${targetH}px`;
    hero.style.borderRadius = "28px";
    hero.style.boxShadow = "0 40px 100px rgba(0,0,0,0.55)";
    setTimeout(() => {
      hero.classList.add("pulse");
      hero.addEventListener("animationend", () => hero.classList.remove("pulse"), { once: true });
    }, 380);
    [380, 500, 640].forEach(delay => {
      setTimeout(() => {
        const wave = document.createElement("div");
        wave.className = "hero-ripple";
        const size = Math.max(targetW, targetH);
        wave.style.cssText = `width:${size}px;height:${size}px;left:${vw/2-size/2}px;top:${vh/2-size/2}px;`;
        document.body.appendChild(wave);
        wave.addEventListener("animationend", () => wave.remove());
      }, delay);
    });
  }));
  const animDone  = new Promise(res => setTimeout(res, 430));
  const dataReady = fetchGameDetail(gameId || gameSlug);
  Promise.all([animDone, dataReady]).then(([_, game]) => {
    hero.style.transition = hero.style.transition.replace(/0\.38s/g, "0.22s");
    hero.style.transform  = "translateX(-110vw) scale(0.8)";
    hero.style.opacity    = "0";
    setTimeout(() => {
      hero.remove(); overlay.remove();
      delete tileEl.dataset.transitioning;
      showDetailWithGame(game);
      $("view-detail").classList.add("swipe-in");
      $("view-detail").addEventListener("animationend", () => $("view-detail").classList.remove("swipe-in"), { once: true });
    }, 200);
  }).catch(() => {
    hero.remove(); overlay.remove();
    delete tileEl.dataset.transitioning;
    showDetail(gameId, gameSlug);
  });
}

function showDetailWithGame(game) {
    updateSEO({
    title:       game.name,
    description: game.description || "",
    image:       game.img,
    url:         window.location.origin + `/#/game/${game.slug || game.id}`
    });
  S.scrollY    = $("game-shelf").scrollTop;
  S.gameDetail = game;
  addRecent(game);
  S.currentId  = game.id;
  S.detailIdx  = S.games.findIndex(g => g.id === game.id);
  $("view-home").classList.add("hidden");    $("view-home").classList.remove("active");
  $("view-detail").classList.remove("hidden"); $("view-detail").classList.add("active");
  $("hud-title").textContent = game.name;
  $("hud-back").classList.remove("hidden");
  $("hud-login").classList.add("hidden");
  $("hud-btns-left").innerHTML = `<span class="hud-btn"><kbd>B</kbd> ${t("backBtn")}</span>`;
  $("hud-btns-right").innerHTML = `
    <span class="hud-btn detail-website-btn"><kbd>A</kbd> ${t("websiteBtn")}</span>
    <span class="hud-btn detail-media-btn"><kbd>X</kbd> ${t("photoBtn")}</span>`;
  document.querySelector(".detail-website-btn")?.addEventListener("click", () => { if (game.website) window.open(game.website,"_blank"); });
  document.querySelector(".detail-media-btn")?.addEventListener("click", () => openShowcase(game));
  renderDetailContent(game);
  fetchAllLinks().then(all => {
    const gameMusic = all[`game_music_${game.id}`];
    if (gameMusic) playGameMusic(gameMusic);
  });
  history.pushState(null, "", `#/game/${game.slug || game.id}`);
}

async function showDetail(id, slug) {
    
  S.scrollY = $("game-shelf").scrollTop;
  $("view-home").classList.add("hidden");      $("view-home").classList.remove("active");
  $("view-detail").classList.remove("hidden"); $("view-detail").classList.add("active");
  $("hud-title").textContent = t("loading");
  $("hud-back").classList.remove("hidden");
  $("hud-login").classList.add("hidden");
  $("hud-btns-left").innerHTML = `<span class="hud-btn"><kbd>B</kbd> ${t("backBtn")}</span>`;
  $("hud-btns-right").innerHTML = "";
  $("detail-left").innerHTML  = `<div class="detail-skeleton-cover"></div>`;
  $("detail-right").innerHTML = `<div class="detail-loading-text"><i class="ph-fill ph-circle-notch"></i> ${t("detailLoading")}</div>`;
  try {
    const game = await fetchGameDetail(id || slug);
    S.gameDetail = game; S.currentId = game.id;
    S.detailIdx  = S.games.findIndex(g => g.id === game.id);
    addRecent(game);
    $("hud-title").textContent = game.name;
    $("hud-btns-right").innerHTML = `
      <span class="hud-btn detail-website-btn"><kbd>A</kbd> ${t("websiteBtn")}</span>
      <span class="hud-btn detail-media-btn"><kbd>X</kbd> ${t("photoBtn")}</span>`;
    document.querySelector(".detail-website-btn")?.addEventListener("click", () => { if (game.website) window.open(game.website,"_blank"); });
    document.querySelector(".detail-media-btn")?.addEventListener("click", () => openShowcase(game));
    renderDetailContent(game);
    fetchAllLinks().then(all => {   // ← thêm
      const gameMusic = all[`game_music_${game.id}`];
      if (gameMusic) playGameMusic(gameMusic);
    });
    history.pushState(null, "", `#/game/${game.slug || game.id}`);

  } catch (err) {
    $("detail-right").innerHTML = `<div class="detail-loading-text" style="color:#c01020"><i class="ph-fill ph-warning"></i> ${t("gameError")}</div>`;
  }
}

async function renderDetailContent(game) {
  const idx   = S.detailIdx;
  const prev2 = S.games[idx - 2];
  const prev  = S.games[idx - 1];
  const next  = S.games[idx + 1];
  const next2 = S.games[idx + 2];
  const gradVal     = GRAD_VALS[GRAD_CLASSES[Math.max(0,idx) % GRAD_CLASSES.length]];
  const mcCls       = mcClass(game.metacritic);
  const mcStatClass = mcCls==="mc-green" ? "s-mc-green" : mcCls==="mc-yellow" ? "s-mc-yellow" : "s-mc-red";

  $("detail-left").innerHTML = `
    ${prev2 ? `<div class="detail-tile-adj" id="adj-prev2" title="${prev2.name}"><img src="${prev2.img}" alt="${prev2.name}" onerror="this.src='https://placehold.co/200x200/dff1fa/009AC7?text=Game'" /></div>` : ""}
    ${prev  ? `<div class="detail-tile-adj" id="adj-prev"  title="${prev.name}"><img src="${prev.img}"  alt="${prev.name}"  onerror="this.src='https://placehold.co/200x200/dff1fa/009AC7?text=Game'" /></div>` : ""}
    <div class="detail-tile-main"><img src="${game.img}" alt="${game.name}" onerror="this.src='https://placehold.co/400x400/dff1fa/009AC7?text=Game'" /></div>
    ${next  ? `<div class="detail-tile-adj" id="adj-next"  title="${next.name}"><img src="${next.img}"  alt="${next.name}"  onerror="this.src='https://placehold.co/200x200/dff1fa/009AC7?text=Game'" /></div>` : ""}
    ${next2 ? `<div class="detail-tile-adj" id="adj-next2" title="${next2.name}"><img src="${next2.img}" alt="${next2.name}" onerror="this.src='https://placehold.co/200x200/dff1fa/009AC7?text=Game'" /></div>` : ""}`;

  const mainTile = $("detail-left").querySelector(".detail-tile-main");
  if (mainTile) {
    const be = document.createElement("div");
    be.style.cssText = `position:absolute;inset:0;border-radius:22px;pointer-events:none;
      padding:3px;background:${gradVal};
      -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0);
      -webkit-mask-composite:xor;mask-composite:exclude;`;
    mainTile.appendChild(be);
  }

  const desc        = game.description || t("noDesc");
  const screenshots = game.screenshots || [game.img];
  const trailers    = game.trailers || [];

  $("detail-right").innerHTML = `
    <div>
      <div class="detail-genre-row" style="margin-bottom:10px">
        ${(game.genres||[]).map(g=>`<span class="detail-genre-badge">${g}</span>`).join("")}
      </div>
      
      <h1 class="detail-game-name">${game.name}</h1>
    </div>
    <div class="detail-stats-grid">
      <div class="stat-card s-rating">
        <div class="stat-label"><i class="ph-fill ph-star"></i> ${t("rating")}</div>
        <div class="stat-value">★ ${game.rating.toFixed(1)}</div>
      </div>
      ${game.metacritic ? `<div class="stat-card ${mcStatClass}">
        <div class="stat-label"><i class="ph-fill ph-trophy"></i> ${t("metacritic")}</div>
        <div class="stat-value">${game.metacritic} / 100</div>
      </div>` : ""}
      ${game.released ? `<div class="stat-card">
        <div class="stat-label"><i class="ph-fill ph-calendar-blank"></i> ${t("released")}</div>
        <div class="stat-value">${fmtDate(game.released)}</div>
      </div>` : ""}
      ${game.playtime ? `<div class="stat-card">
        <div class="stat-label"><i class="ph-fill ph-clock"></i> ${t("playtime")}</div>
        <div class="stat-value">${game.playtime} ${t("hours")}</div>
      </div>` : ""}
      ${game.ratings_count ? `<div class="stat-card">
        <div class="stat-label"><i class="ph-fill ph-users"></i> ${t("reviews")}</div>
        <div class="stat-value">${game.ratings_count.toLocaleString()}</div>
      </div>` : ""}
      ${game.dev && game.dev!=="N/A" ? `<div class="stat-card">
        <div class="stat-label"><i class="ph-fill ph-code"></i> ${t("developer")}</div>
        <div class="stat-value" style="font-size:0.82rem">${game.dev}</div>
      </div>` : ""}
      
    </div>
    ${(game.platforms||[]).length ? `
<div class="detail-platform-row" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:4px;">
  ${(game.platforms||[]).map(p => {
    const icons = {
  // PC / Mac / Linux
  4:  "ph-windows-logo",
  5:  "ph-apple-logo",        // macOS
  6:  "ph-linux-logo",        // Linux
  3:  "ph-apple-logo",        // iOS
  21: "ph-apple-logo",        // macOS (legacy)

  // PlayStation
  1:   "ph-playstation-logo", // PS1
  15:  "ph-playstation-logo", // PS2
  16:  "ph-playstation-logo", // PSP
  17:  "ph-playstation-logo", // PS3
  18:  "ph-playstation-logo", // PS4
  187: "ph-playstation-logo", // PS5
  19:  "ph-playstation-logo", // PS Vita
  186: "ph-playstation-logo", // PS Portable

  // Xbox
  11:  "ph-x-logo",           // Xbox (original)
  12:  "ph-x-logo",           // Xbox 360
  80:  "ph-x-logo",           // Xbox One
  186: "ph-x-logo",           // Xbox Series S/X (rawg id)
  171: "ph-x-logo",           // Xbox Series X

  // Nintendo
  7:  "ph-game-controller",   // Switch
  8:  "ph-game-controller",   // 3DS
  9:  "ph-game-controller",   // NDS
  10: "ph-game-controller",   // Wii U
  11: "ph-game-controller",   // Wii (conflict resolve bên dưới)
  13: "ph-game-controller",   // Nintendo 64 (legacy)
  83: "ph-game-controller",   // Nintendo 64
  79: "ph-game-controller",   // SNES
  49: "ph-game-controller",   // NES
  24: "ph-game-controller",   // GBA
  43: "ph-game-controller",   // GBC
  26: "ph-game-controller",   // Game Boy
  
  // Android / Mobile
  2:  "ph-device-mobile",     // iOS (RAWG)
  14: "ph-device-mobile",     // Android

  // Web / Other
  55: "ph-globe",             // Web
  74: "ph-globe",             // Web (alt)
};

const colors = {
  4: "#0078d4", 5: "#555", 6: "#e67e22", 3: "#555", 21: "#555",
  1: "#003087", 15: "#003087", 16: "#003087", 17: "#003087",
  18: "#003087", 187: "#003087", 19: "#003087", 186: "#107c10",
  11: "#107c10", 12: "#107c10", 80: "#107c10", 171: "#107c10",
  7: "#e4001b", 8: "#e4001b", 9: "#e4001b", 10: "#e4001b",
  13: "#e4001b", 83: "#e4001b", 79: "#e4001b", 49: "#e4001b",
  24: "#e4001b", 43: "#e4001b", 26: "#e4001b",
  2: "#52b840", 14: "#52b840",
  55: "#6b6b7a", 74: "#6b6b7a",
};
    const icon  = icons[p.id]  || "ph-game-controller";
    const color = colors[p.id] || "var(--tx-light)";
    return `<span style="display:inline-flex;align-items:center;gap:4px;
      background:rgba(0,0,0,0.05);border-radius:999px;padding:4px 10px;
      font-size:0.72rem;font-weight:800;color:${color};">
      <i class="ph-fill ${icon}" style="font-size:0.85rem;"></i>${p.name}
    </span>`;
  }).join("")}
</div>` : ""}
    <p class="detail-description" style="white-space:pre-line">${desc}</p>
    ${(trailers.length || screenshots.length) ? `
    <div>
      <div class="section-label" style="display:flex;align-items:center;justify-content:space-between;">
        <span><i class="ph-fill ph-images"></i> ${t("screenshotsLabel")}</span>
        ${isAdmin ? `<button class="dl-add-btn" id="btn-add-trailer" style="width:auto;padding:5px 12px;font-size:0.75rem;margin:0;">
          <i class="ph-fill ph-plus-circle"></i> ${t("addTrailer")}
        </button>` : ""}
      </div>
      <div class="detail-screenshots" id="detail-screenshots" style="margin-top:8px">
        ${trailers.map(v => `
          <div class="detail-ss-thumb detail-trailer-thumb" data-videoid="${v}" style="position:relative;">
            <img src="https://img.youtube.com/vi/${v}/mqdefault.jpg" style="width:100%;height:100%;object-fit:cover;" />
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.35);border-radius:8px;">
              <i class="ph-fill ph-youtube-logo" style="font-size:2rem;color:#ff0000;"></i>
            </div>
            ${isAdmin ? `<button class="trailer-del-btn" data-videoid="${v}" style="position:absolute;top:5px;right:5px;background:rgba(228,0,27,0.85);border:none;border-radius:6px;width:22px;height:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:white;font-size:0.7rem;z-index:10;"><i class="ph-fill ph-x"></i></button>` : ""}
          </div>`).join("")}
        ${screenshots.map((s,i) => `
          <div class="detail-ss-thumb" data-idx="${i}">
            <img src="${s}" alt="Screenshot ${i+1}" loading="lazy" />
          </div>`).join("")}
      </div>
    </div>` : ""}
    ${game.similar && game.similar.length ? `
    <div class="detail-similar">
      <div class="section-label"><i class="ph-fill ph-game-controller"></i> ${t("seriesLabel")}</div>
      <div class="similar-grid" id="similar-grid" style="margin-top:10px">
        ${game.similar.map(g=>`
          <div class="similar-card" data-id="${g.id}" data-slug="${g.slug}">
            <div class="similar-img"><img src="${g.img}" alt="${g.name}" onerror="this.src='https://placehold.co/200x200/dff1fa/009AC7?text=Game'" loading="lazy" /></div>
            <div class="similar-name">${g.name}</div>
            <div class="similar-rating"><i class="ph-fill ph-star"></i> ${g.rating.toFixed(1)}</div>
          </div>`).join("")}
      </div>
    </div>` : ""}
    
    <div class="detail-actions">
  ${game.website ? `<a href="${game.website}" target="_blank" rel="noopener" class="detail-btn detail-btn-primary">
    <i class="ph-fill ph-globe"></i> ${t("homepage")}</a>` : ""}
  <button class="detail-btn detail-btn-secondary" id="btn-open-showcase">
    <i class="ph-fill ph-images"></i> ${t("viewPhotos")}</button>
  <button class="detail-btn detail-btn-secondary" id="btn-fav" style="color:${isFavorite(game.id)?'#e4001b':'var(--tx-mid)'}">
    <i class="ph-fill ph-heart"></i>
    ${isFavorite(game.id) ? (currentLang==="vi"?"Đã thích":"Favorited") : (currentLang==="vi"?"Yêu thích":"Favorite")}
  </button>
  ${isAdmin ? `<button class="detail-btn detail-btn-secondary" id="btn-viethoa">
    <i class="ph-fill ph-flag"></i> Việt hóa...
  </button>` : ""}
  ${isAdmin ? `
  <button class="detail-btn detail-btn-secondary" id="btn-edit-cover" style="color:var(--purple)">
    <i class="ph-fill ph-image"></i>
    ${currentLang === "vi" ? "Sửa ảnh/Screenshots" : "Edit images"}
  </button>
` : ""}
${isAdmin && game.isCustom ? `
  <button class="detail-btn detail-btn-secondary" id="btn-edit-game">
    <i class="ph-fill ph-pencil-simple"></i>
    ${currentLang === "vi" ? "Sửa game" : "Edit game"}
  </button>
  <button class="detail-btn detail-btn-secondary" id="btn-del-game" style="color:var(--red)">
    <i class="ph-fill ph-trash"></i>
    ${currentLang === "vi" ? "Xóa game" : "Delete"}
  </button>
` : ""}
</div>`;

  renderDownloadLinks(game);

  $$(".detail-trailer-thumb").forEach(thumb => {
    thumb.addEventListener("mouseenter", () => playSound("tick"));
    thumb.addEventListener("click", e => {
      if (e.target.closest(".trailer-del-btn")) return;
      playSound("screenshot");
      openVideoPlayer(thumb.dataset.videoid, game.name);
    });
  });
  $$(".trailer-del-btn").forEach(btn => {
    btn.addEventListener("click", async e => {
      e.stopPropagation();
      const vid = btn.dataset.videoid;
      const list = await getTrailers(game.id);
      const newList = list.filter(v => v !== vid);
      await saveTrailers(game.id, newList);
      game.trailers = newList;
      playSound("back");
      renderDetailContent(game);
    });
  });
  $("btn-add-trailer")?.addEventListener("click", () => openTrailerModal(game));

  $$(".detail-ss-thumb:not(.detail-trailer-thumb)").forEach(thumb => {
    thumb.addEventListener("mouseenter", () => playSound("tick"));
    thumb.addEventListener("click", () => {
      playSound("tick");
      S.scImgs = screenshots;
      S.scIdx  = parseInt(thumb.dataset.idx);
      updateShowcase();
      $("showcase-overlay").classList.remove("hidden");
    });
  });

  $("btn-open-showcase")?.addEventListener("click", () => { playSound("open"); openShowcase(game); });
  $("btn-fav")?.addEventListener("click", () => {
    const added = toggleFavorite(game);
    playSound(added ? "select" : "back");
    const btn = $("btn-fav");
    btn.style.color = added ? "#e4001b" : "var(--tx-mid)";
    btn.innerHTML = `<i class="ph-fill ph-heart"></i> ${added
      ? (currentLang==="vi" ? "Đã thích" : "Favorited")
      : (currentLang==="vi" ? "Yêu thích" : "Favorite")}`;
  });
  $("btn-edit-cover")?.addEventListener("click", () => openEditImagesModal(game));

  // Init trạng thái nút Việt hóa
isViethoa(game.id).then(vh => {
  const btn = $("btn-viethoa");
  if (!btn) return;
  btn.innerHTML = `<i class="ph-fill ph-flag"></i> ${vh
    ? (currentLang==="vi"?"Có Việt hóa":"Has VN patch")
    : (currentLang==="vi"?"Đánh dấu Việt hóa":"Mark as VN patch")}`;
  btn.style.color = vh ? "#52b840" : "var(--tx-mid)";
  btn.addEventListener("click", async () => {
    const added = await toggleViethoa(game.id);
    playSound(added ? "select" : "back");
    btn.innerHTML = `<i class="ph-fill ph-flag"></i> ${added
      ? (currentLang==="vi"?"Có Việt hóa":"Has VN patch")
      : (currentLang==="vi"?"Đánh dấu Việt hóa":"Mark as VN patch")}`;
    btn.style.color = added ? "#52b840" : "var(--tx-mid)";
  });
});
  $("btn-open-showcase")?.addEventListener("mouseenter", () => playSound("tick"));
  $("btn-edit-game")?.addEventListener("click", async () => {
  const customs = await getCustomGames();
  const raw = customs.find(g => `custom_${g.id}` === String(game.id));
  if (raw) openAddGameModal(raw);
});

$("btn-del-game")?.addEventListener("click", async () => {
  if (!confirm(currentLang==="vi"?"Xóa game này?":"Delete this game?")) return;
  const customs = await getCustomGames();
  const newList = customs.filter(g => `custom_${g.id}` !== String(game.id));
  await saveCustomGames(newList);
  playSound("back");
  goHome();
});
  $$(".similar-card").forEach(card => {
    card.addEventListener("mouseenter", () => playSound("tick"));
    card.addEventListener("click", () => { playSound("select"); showDetail(parseInt(card.dataset.id), card.dataset.slug); });
  });
  $("adj-prev2")?.addEventListener("click",       () => navigateDetail(-2));
  $("adj-prev")?.addEventListener("click",        () => navigateDetail(-1));
  $("adj-next")?.addEventListener("click",        () => navigateDetail(1));
  $("adj-next2")?.addEventListener("click",       () => navigateDetail(2));
  $("adj-prev2")?.addEventListener("mouseenter",  () => playSound("tick"));
  $("adj-prev")?.addEventListener("mouseenter",   () => playSound("tick"));
  $("adj-next")?.addEventListener("mouseenter",   () => playSound("tick"));
  $("adj-next2")?.addEventListener("mouseenter",  () => playSound("tick"));
}

function openVideoPlayer(videoId, title) {
  const existing = document.getElementById("video-player-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "video-player-overlay";
  overlay.className = "showcase-overlay";
  overlay.innerHTML = `
    <button class="sc-close" id="vp-close"><i class="ph-bold ph-x"></i></button>
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
      <div style="font-size:0.9rem;font-weight:800;color:white;opacity:0.8;">${title}</div>
      <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1"
        style="width:80vw;height:45vw;max-height:75vh;border-radius:18px;border:none;box-shadow:0 20px 60px rgba(0,0,0,0.6);"
        allow="autoplay;encrypted-media" allowfullscreen></iframe>
    </div>`;
  $("console-ui").appendChild(overlay);
  $("vp-close").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") overlay.remove(); }, { once: true });
}

function navigateDetail(dir) {
  const newIdx = S.detailIdx + dir;
  if (newIdx < 0 || newIdx >= S.games.length) return;
  playSound("select");
  const adjId = dir === -2 ? "adj-prev2" : dir === -1 ? "adj-prev" : dir === 1 ? "adj-next" : "adj-next2";
  const adjEl = $(adjId);
  if (adjEl) {
    adjEl.style.animation    = "adj-spin 0.7s cubic-bezier(0.4,0,0.2,1) infinite";
    adjEl.style.opacity      = "1";
    adjEl.style.borderColor  = "var(--blue)";
    adjEl.style.pointerEvents = "none";
  }
  S.detailIdx = newIdx;
  const g = S.games[newIdx];
  const minSpinTime = new Promise(res => setTimeout(res, 600));
  Promise.all([fetchGameDetail(g.id || g.slug), minSpinTime]).then(([game]) => {
    S.gameDetail = game; S.currentId = game.id;
    addRecent(game);
    if (adjEl) { adjEl.style.animation = ""; adjEl.style.opacity = ""; adjEl.style.borderColor = ""; adjEl.style.pointerEvents = ""; }
    $("hud-title").textContent = game.name;
    $("detail-left").classList.add("no-default-anim");
    $("detail-right").classList.add("no-default-anim");
    renderDetailContent(game);
    history.pushState(null, "", `#/game/${game.slug || game.id}`);
    fetchAllLinks().then(all => {
  stopGameMusic();
  const gameMusic = all[`game_music_${game.id}`];
  if (gameMusic) playGameMusic(gameMusic);
});
    const mainTile = $("detail-left").querySelector(".detail-tile-main");
    if (mainTile) {
      mainTile.classList.add("blow-in");
      mainTile.addEventListener("animationend", () => mainTile.classList.remove("blow-in"), { once: true });
    }
    const rightPanel = $("detail-right");
    rightPanel.classList.add("blow-in");
    rightPanel.addEventListener("animationend", () => {
      rightPanel.classList.remove("blow-in");
      $("detail-left").classList.remove("no-default-anim");
      $("detail-right").classList.remove("no-default-anim");
    }, { once: true });
  }).catch(() => {
    setTimeout(() => {
      if (adjEl) { adjEl.style.animation = ""; adjEl.style.opacity = ""; adjEl.style.borderColor = ""; adjEl.style.pointerEvents = ""; }
      showDetail(g.id, g.slug);
    }, 600);
  });
}

function openShowcase(game) {
  playSound("screenshot");
  S.scImgs = game.screenshots && game.screenshots.length ? game.screenshots : [game.img];
  S.scIdx  = 0; updateShowcase();
  $("showcase-overlay").classList.remove("hidden");
}
function updateShowcase() {
  $("sc-img").src = S.scImgs[S.scIdx];
  $("sc-counter").textContent = `${S.scIdx+1} / ${S.scImgs.length}`;
}

function openFilter() {
  playSound("open");
  const sortOpts = getSortOpts();
  $("overlay-genres").innerHTML =
    `<button class="o-chip ${!S.genre?"active":""}" data-genre="">${t("allGenres")}</button>` +
    ALL_GENRES.map(g=>`<button class="o-chip ${S.genre===g.slug?"active":""}" data-genre="${g.slug}">${g.label}</button>`).join("");
  $("overlay-tags").innerHTML = ALL_TAGS.map(tg=>`<button class="o-chip ${S.tag===tg.slug?"active":""}" data-tag="${tg.slug}">${tg.label}</button>`).join("");
  $("overlay-sort").innerHTML = sortOpts.map(o=>`<button class="o-chip ${S.order===o.val?"sort-active":""}" data-sort="${o.val}">${o.label}</button>`).join("");

  // Update labels
  const genreSection  = $("overlay-genres")?.closest(".overlay-section");
const tagSection    = $("overlay-tags")?.closest(".overlay-section");
const sortSection   = $("overlay-sort")?.closest(".overlay-section");
if (genreSection) genreSection.querySelector(".overlay-section-label").textContent = t("genreLabel");
if (tagSection)   tagSection.querySelector(".overlay-section-label").textContent   = t("tagLabel");
if (sortSection)  sortSection.querySelector(".overlay-section-label").textContent  = t("sortLabel");
  const title = document.querySelector(".overlay-title");
  if (title) title.innerHTML = `<i class="ph-fill ph-game-controller"></i> ${t("filterTitle")}`;
  const closeBtn = $("overlay-close");
  if (closeBtn) closeBtn.innerHTML = `<i class="ph-bold ph-check"></i> ${t("doneBtn")}`;

  // Render Việt hóa toggle
// Render Việt hóa toggle — xóa cũ trước khi thêm mới
document.getElementById("vh-filter-section")?.remove();
const vhSection = document.createElement("div");
vhSection.id = "vh-filter-section";
vhSection.className = "overlay-section";
vhSection.innerHTML = `
  <div class="overlay-section-label">🇻🇳 VIỆT HÓA</div>
  <div class="overlay-chips">
    <button class="o-chip ${S.filterViethoa ? "active" : ""}" id="chip-viethoa">
      🇻🇳 ${currentLang === "vi" ? "Chỉ hiện game Việt hóa" : "Vietnamese only"}
    </button>
  </div>`;
const overlayInner = document.querySelector("#filter-overlay .overlay-panel-inner");
overlayInner.insertBefore(vhSection, overlayInner.querySelector(".overlay-section"));
document.getElementById("chip-viethoa")?.addEventListener("mouseenter", () => playSound("tick"));
document.getElementById("chip-viethoa")?.addEventListener("click", () => {
  S.filterViethoa = !S.filterViethoa;
  document.getElementById("chip-viethoa").classList.toggle("active", S.filterViethoa);
  playSound("tick");
});

  $("filter-overlay").classList.remove("hidden");

  $$("[data-genre]").forEach(btn => {
    btn.addEventListener("mouseenter", () => playSound("tick"));
    btn.addEventListener("click", () => {
      S.genre = btn.dataset.genre;
      $$("[data-genre]").forEach(b => b.classList.toggle("active", b.dataset.genre===S.genre));
    });
  });
  $$("[data-tag]").forEach(btn => {
    btn.addEventListener("mouseenter", () => playSound("tick"));
    btn.addEventListener("click", () => {
      S.tag = S.tag===btn.dataset.tag ? "" : btn.dataset.tag;
      $$("[data-tag]").forEach(b => b.classList.toggle("active", b.dataset.tag===S.tag));
    });
  });
  $$("[data-sort]").forEach(btn => {
    btn.addEventListener("mouseenter", () => playSound("tick"));
    btn.addEventListener("click", () => {
      S.order = btn.dataset.sort;
      $$("[data-sort]").forEach(b => b.classList.toggle("sort-active", b.dataset.sort===S.order));
    });
  });
}

(function injectCSS() {
  const style = document.createElement("style");
  style.textContent = `
    .tile-img { background:rgba(0,0,0,0.06); opacity:0;
      transition:opacity 0.3s ease, transform 0.35s var(--ease-smooth);
      width:100%; height:100%; object-fit:cover; display:block; }
    .tile-img.loaded { opacity:1; }
    .game-tile:hover .tile-img { transform:scale(1.06); }
    .tile-skeleton {
      background:linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.03) 50%,rgba(0,0,0,0.06) 75%);
      background-size:200% 100%; animation:skeleton-slide 1.4s ease-in-out infinite;
    }
    @keyframes skeleton-slide { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes skeleton-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
    .detail-skeleton-cover {
      width:150px; height:150px; border-radius:22px;
      background:rgba(0,0,0,0.07); animation:skeleton-pulse 1.2s ease-in-out infinite;
    }
    .detail-loading-text { padding:20px; color:var(--tx-light); font-weight:700; display:flex; align-items:center; gap:8px; }
    .section-label { font-size:0.7rem; font-weight:800; color:var(--blue2); text-transform:uppercase; letter-spacing:0.1em; display:flex; align-items:center; gap:5px; }
    .section-label i { font-size:0.9rem; }
    .stat-label i { font-size:0.8rem; vertical-align:middle; margin-right:2px; }
    .tile-rating i { font-size:0.62rem; vertical-align:middle; }
    .similar-rating i { font-size:0.62rem; vertical-align:middle; }
    .dl-link-row.dragging { opacity: 0.4; background: rgba(58,180,216,0.08); }
.dl-link-row.drag-over { border: 2px dashed var(--blue) !important; transform: scale(1.01); }
.dl-drag-handle {
  width: 28px; height: 28px; border-radius: 8px; border: none;
  background: rgba(0,0,0,0.06); color: var(--tx-light);
  display: flex; align-items: center; justify-content: center;
  cursor: grab; font-size: 1rem; flex-shrink: 0;
  transition: all 0.15s;
}
.dl-drag-handle:active { cursor: grabbing; background: var(--blue); color: #fff; }
.dl-drag-handle:hover { background: rgba(58,180,216,0.15); color: var(--blue); }
  `;

  document.head.appendChild(style);
})();

/* ══ SETTINGS ══ */
function buildSettingsOverlay() {
  const title = document.querySelector("#settings-overlay .overlay-title");
  if (title) title.innerHTML = `<i class="ph-fill ph-gear"></i> ${t("settingsTitle")}`;
  const labels = document.querySelectorAll("#settings-overlay .overlay-section-label");
  if (labels[0]) labels[0].textContent = t("musicLabel");
  if (labels[1]) labels[1].textContent = t("volumeLabel");
  if (labels[2]) labels[2].textContent = t("sfxLabel");
  const sfxRow = document.querySelector(".settings-toggle-row span");
  if (sfxRow) sfxRow.textContent = t("sfxEffect");

  const list = $("settings-music-list");
  list.innerHTML = MUSIC_TRACKS.map(tr => `
    <div class="music-item ${musicPlayer.currentId === tr.id ? "active" : ""}" data-track="${tr.id}">
      <div class="music-item-icon"><i class="ph-fill ${tr.file ? "ph-music-note" : "ph-speaker-slash"}"></i></div>
      <div class="music-item-info">
        <div class="music-item-name">${tr.id === "off" ? t("turnOff") : tr.name}</div>
        ${tr.sub && tr.id !== "off" ? `<div class="music-item-sub">${tr.sub}</div>` : ""}
      </div>
      <i class="ph-fill ph-${musicPlayer.currentId === tr.id ? "equalizer" : "play-circle"} music-item-play"></i>
    </div>`).join("");

  list.querySelectorAll(".music-item").forEach(item => {
    item.addEventListener("click", () => {
      playSound("tick");
      musicPlayer.play(item.dataset.track);
      list.querySelectorAll(".music-item").forEach(i => i.classList.toggle("active", i.dataset.track === item.dataset.track));
    });
  });

  const volSlider = $("music-volume");
  volSlider.value = Math.round(musicPlayer.volume * 100);
  $("volume-label").textContent = `${volSlider.value}%`;
  volSlider.addEventListener("input", () => {
    musicPlayer.setVolume(volSlider.value / 100);
    $("volume-label").textContent = `${volSlider.value}%`;
  });

  const sfxBtn = $("sfx-toggle");
  sfxBtn.textContent = musicPlayer.sfxEnabled ? t("sfxOn") : t("sfxOff");
  sfxBtn.classList.toggle("off", !musicPlayer.sfxEnabled);
  sfxBtn.addEventListener("click", () => {
    musicPlayer.sfxEnabled = !musicPlayer.sfxEnabled;
    localStorage.setItem("sv_sfx", musicPlayer.sfxEnabled);
    sfxBtn.textContent = musicPlayer.sfxEnabled ? t("sfxOn") : t("sfxOff");
    sfxBtn.classList.toggle("off", !musicPlayer.sfxEnabled);
    playSound("tick");
  });

  const settingsClose = $("settings-close");
  if (settingsClose) settingsClose.innerHTML = `<i class="ph-bold ph-check"></i> ${t("doneBtn")}`;
}

/* ══ ADMIN AUTH ══ */
const ADMIN_HASH = {
  user: "8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918",
  pass: "73380c48b6030e02ed29a32375811126de74c138fc00d997279c6d5e320f1062"
};
let isAdmin = false;

async function hashStr(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

function initLogin() {
  // Update login overlay text
  const lu = document.querySelector("#login-overlay .login-title");
  if (lu) lu.innerHTML = `<i class="ph-fill ph-shield-check" style="color:var(--blue)"></i> ${t("loginTitle")}`;
  const fields = document.querySelectorAll("#login-overlay .login-field label");
  if (fields[0]) fields[0].textContent = t("loginUser");
  if (fields[1]) fields[1].textContent = t("loginPass");
  const lerr = $("login-error");
  if (lerr) lerr.textContent = t("loginError");
  const lsub = $("login-submit");
  if (lsub) lsub.textContent = t("loginBtn");
  const lcan = $("login-cancel");
  if (lcan) lcan.textContent = t("cancel");

  $("hud-login").addEventListener("click", () => {
    if (isAdmin) {
      isAdmin = false;
      document.body.style.userSelect = "none";
      $("hud-login").classList.remove("is-admin");
      $("hud-login").innerHTML = `<i class="ph-fill ph-user"></i>`;
      playSound("back");
      // Refresh để ẩn nút thêm game
        if ($("view-home").classList.contains("active")) {
        showHome(S.games.length > 0);
        }
      return;
    }
    playSound("open");
    $("login-overlay").classList.remove("hidden");
    setTimeout(() => $("login-user").focus(), 100);
  });

  $("login-cancel").addEventListener("click", closeLogin);
  $("login-overlay").addEventListener("click", e => { if (e.target === $("login-overlay")) closeLogin(); });
  $("login-submit").addEventListener("click", doLogin);
  [$("login-user"), $("login-pass")].forEach(el => {
    el.addEventListener("keydown", e => { if (e.key === "Enter") doLogin(); });
  });
}

async function doLogin() {
  const u = await hashStr($("login-user").value.trim());
  const p = await hashStr($("login-pass").value);
  if (u === ADMIN_HASH.user && p === ADMIN_HASH.pass) {
    isAdmin = true;
    document.body.style.userSelect = "text";
    $("hud-login").classList.add("is-admin");
    $("hud-login").innerHTML = `<img src="https://i.ibb.co/sdvq23cb/90661e30d4360961d07d6c05893a5369.jpg" alt="Admin" />`;
    closeLogin();
    playSound("select");
    // Refresh để hiện nút thêm game
    if ($("view-home").classList.contains("active")) {
      showHome(S.games.length > 0);
    }
  } else {
    $("login-error").classList.add("show");
    $("login-pass").value = "";
    $("login-pass").focus();
    playSound("back");
  }
}

function closeLogin() {
  $("login-overlay").classList.add("hidden");
  $("login-error").classList.remove("show");
  $("login-user").value = "";
  $("login-pass").value = "";
}

/* ══ JSONBIN STORAGE ══ */
const JSONBIN_KEY = "$2a$10$5BMcpkNoXVkUfpQhg5UFAuPHh.WAUyPTcpKsTx4OjM3Q.Zb6BRCIu";
const JSONBIN_BIN = "69b89854c3097a1dd52fa8b8";
const JSONBIN_URL     = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN}/latest`; // dùng để GET
const JSONBIN_PUT_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN}`;
let linksCache = null;

async function fetchAllLinks() {
  if (linksCache) return linksCache;
  try {
    const res  = await fetch(JSONBIN_URL + `?t=${Date.now()}`, {
      headers: { "X-Master-Key": JSONBIN_KEY, "Cache-Control": "no-cache" }
    });
    const data = await res.json();
    linksCache = data.record.links || {};
  } catch { linksCache = {}; }
  return linksCache;
}

async function getLinks(gameId) {
  const all = await fetchAllLinks();
  return all[gameId] || [];
}

async function saveLinks(gameId, links) {
  linksCache = null;
  const all = await fetchAllLinks();
  all[gameId] = links;
  linksCache  = all;
  await fetch(JSONBIN_PUT_URL, {
      method: "PUT",
    headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_KEY },
    body: JSON.stringify({ links: all })
  });
}

async function getTrailers(gameId) {
  const all = await fetchAllLinks();
  return all[`trailers_${gameId}`] || [];
}

async function saveTrailers(gameId, trailers) {
  linksCache = null;
  const all = await fetchAllLinks();
  all[`trailers_${gameId}`] = trailers;
  linksCache = all;
  await fetch(JSONBIN_PUT_URL, {
      method: "PUT",
    headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_KEY },
    body: JSON.stringify({ links: all })
  });
}

async function getViethoaList() {
  const all = await fetchAllLinks();
  return all["viethoa_games"] || [];
}
async function saveViethoaList(list) {
  linksCache = null;
  const all = await fetchAllLinks();
  all["viethoa_games"] = list;
  linksCache = all;
  await fetch(JSONBIN_PUT_URL, {
      method: "PUT",
    headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_KEY },
    body: JSON.stringify({ links: all })
  });
}
async function toggleViethoa(gameId) {
  const list = await getViethoaList();
  const id   = String(gameId);
  const idx  = list.indexOf(id);
  if (idx === -1) list.push(id); else list.splice(idx, 1);
  await saveViethoaList(list);
  return idx === -1;
}
async function isViethoa(gameId) {
  const list = await getViethoaList();
  return list.includes(String(gameId));
}

/* ══ DOWNLOAD LINKS ══ */
async function renderDownloadLinks(game) {
  const links = await getLinks(game.id);
  const isAdminView = isAdmin;

  let html = `<div class="dl-section" id="dl-section">
    <div class="section-label"><i class="ph-fill ph-download-simple"></i> ${t("downloadLabel")}</div>`;

  if (links.length) {
    html += `<div class="dl-links-list" id="dl-links-list" style="margin-top:10px;display:flex;flex-direction:column;gap:10px;">`;
    links.forEach((l, i) => {
      html += `
        <div class="dl-link-row" data-idx="${i}">
          ${isAdminView ? `<button class="dl-drag-handle" title="Kéo để sắp xếp"><i class="ph-fill ph-dots-six-vertical"></i></button>` : ""}
          <div class="dl-link-name">${l.name}</div>
          <div class="dl-link-urls">
  ${(l.urls || []).map(u => {
    const parts = u.parts || (u.url ? [{label: u.label, url: u.url}] : []);
    if (parts.length <= 1) {
      return `<a href="${parts[0]?.url||'#'}" target="_blank" rel="noopener" class="dl-link-btn">
        ${getLinkIcon(u.label||"")} ${u.label||"Tải"}
      </a>`;
    }
    return `<div class="dl-expand-wrap">
      <button class="dl-expand-btn" onclick="this.closest('.dl-expand-wrap').classList.toggle('open')">
        ${getLinkIcon(u.label||"")} ${u.label}
        <i class="ph-fill ph-caret-down"></i>
      </button>
      <div class="dl-expand-list">
        ${parts.map(p => `
          <a href="${p.url}" target="_blank" rel="noopener" class="dl-expand-item">
            ${getLinkIcon(p.label||"")} ${p.label||"Part"}
          </a>`).join("")}
      </div>
    </div>`;
  }).join("")}
</div>
          ${isAdminView ? `
            <div class="dl-admin-btns">
              <button class="dl-edit-btn" data-idx="${i}"><i class="ph-fill ph-pencil-simple"></i></button>
              <button class="dl-del-btn" data-idx="${i}"><i class="ph-fill ph-trash"></i></button>
            </div>` : ""}
        </div>`;
    });
    html += `</div>`;
  } else if (!isAdminView) {
    html += `<div style="font-size:0.82rem;color:var(--tx-light);margin-top:8px;">${t("noLinks")}</div>`;
  }

  if (isAdminView) {
    html += `<button class="dl-add-btn" id="dl-add-btn" style="margin-top:10px;">
      <i class="ph-fill ph-plus-circle"></i> ${t("addLink")}
    </button>`;
  }
  html += `</div>`;

  const actions = $("detail-right")?.querySelector(".detail-actions");
  const target  = $("detail-right");
  if (target) {
    const div = document.createElement("div");
    div.innerHTML = html;
    const section = div.firstElementChild;
    if (actions) target.insertBefore(section, actions);
    else target.appendChild(section);
  }

  bindLinkEvents(game);

  // Drag-to-reorder (chỉ admin)
  if (isAdminView) {
    const listEl = document.getElementById("dl-links-list");
    if (!listEl) return;
    let dragSrc = null;

    listEl.querySelectorAll(".dl-link-row").forEach(row => {
      row.setAttribute("draggable", "true");

      row.addEventListener("dragstart", e => {
        dragSrc = row;
        row.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      row.addEventListener("dragend", () => {
        row.classList.remove("dragging");
        listEl.querySelectorAll(".dl-link-row").forEach(r => r.classList.remove("drag-over"));
      });
      row.addEventListener("dragover", e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        listEl.querySelectorAll(".dl-link-row").forEach(r => r.classList.remove("drag-over"));
        if (row !== dragSrc) row.classList.add("drag-over");
      });
      row.addEventListener("drop", async e => {
        e.preventDefault();
        if (!dragSrc || dragSrc === row) return;
        row.classList.remove("drag-over");

        // Lấy vị trí cũ và mới
        const rows = [...listEl.querySelectorAll(".dl-link-row")];
        const fromIdx = parseInt(dragSrc.dataset.idx);
        const toIdx   = parseInt(row.dataset.idx);

        // Reorder links array
        const currentLinks = await getLinks(game.id);
        const [moved] = currentLinks.splice(fromIdx, 1);
        currentLinks.splice(toIdx, 0, moved);
        await saveLinks(game.id, currentLinks);
        playSound("select");
        await refreshDlSection(game);
      });
    });
  }
}

function bindLinkEvents(game) {
  const section = document.getElementById("dl-section");
  if (!section) return;
  section.querySelector("#dl-add-btn")?.addEventListener("click", () => openLinkModal(game, null, null));
  section.querySelectorAll(".dl-link-btn").forEach(btn => btn.addEventListener("mouseenter", () => playSound("tick")));
  section.querySelectorAll(".dl-edit-btn").forEach(btn => {
    btn.addEventListener("mouseenter", () => playSound("tick"));
    btn.addEventListener("click", async () => {
      const idx   = parseInt(btn.dataset.idx);
      const links = await getLinks(game.id);
      openLinkModal(game, links[idx], idx);
    });
  });
  section.querySelectorAll(".dl-del-btn").forEach(btn => {
    btn.addEventListener("mouseenter", () => playSound("tick"));
    btn.addEventListener("click", async () => {
      const idx   = parseInt(btn.dataset.idx);
      const links = await getLinks(game.id);
      links.splice(idx, 1);
      await saveLinks(game.id, links);
      playSound("back");
      refreshDlSection(game);
    });
  });
}

async function refreshDlSection(game) {
  const old = document.getElementById("dl-section");
  if (old) old.remove();
  await renderDownloadLinks(game);
}

function openLinkModal(game, existing, idx) {
  playSound("open");
  const entries = existing
  ? (existing.urls || []).map(u => ({
      label: u.label || "",
      parts: u.parts || (u.url ? [{ label: "", url: u.url }] : [{ label: "", url: "" }])
    }))
  : [{ label: "", parts: [{ label: "", url: "" }] }];
  const modal = document.createElement("div");
  modal.className = "login-overlay";
  modal.id = "dl-modal";
  const rowsHtml = entries.map((e, i) => `
  <div class="dl-url-row" style="margin-bottom:8px;">
    <div class="dl-url-row-header">
      <input type="text" class="dl-url-label dl-url-label-host"
        placeholder="Tên host (GG Drive, Mega...)" value="${e.label||""}" />
      ${i > 0 ? `<button class="dl-del-btn dl-url-del" style="flex-shrink:0">
        <i class="ph-fill ph-minus-circle"></i></button>` : ""}
    </div>
    <div class="dl-parts-wrap">
      ${(e.parts || [{label:"",url:""}]).map((p, pi) => `
        <div class="dl-part-row">
          <input type="text" class="dl-part-label" placeholder="Part ${pi+1}" value="${p.label||""}" />
          <div class="dl-part-divider"></div>
          <input type="text" class="dl-part-url" placeholder="https://..." value="${p.url||""}" />
          ${pi > 0 ? `<button class="dl-del-btn dl-part-del" style="flex-shrink:0;width:24px;height:24px;">
            <i class="ph-fill ph-x"></i></button>` : ""}
        </div>`).join("")}
    </div>
    <button class="dl-add-part-btn">
      <i class="ph-fill ph-plus-circle"></i> Thêm part
    </button>
  </div>`).join("");
  modal.innerHTML = `
    <div class="login-box" style="width:520px;max-height:85vh;overflow-y:auto;">
      <div class="login-title">
        <i class="ph-fill ph-download-simple" style="color:var(--blue)"></i>
        ${existing ? t("editLink") : t("addLinkTitle")}
      </div>
      <div class="login-field">
        <label>${t("sourceName")}</label>
        <input type="text" id="dl-name" placeholder="${t("linkPlaceholder")}" value="${existing ? existing.name : ""}" />
      </div>
      <div class="login-field">
        <label>${t("linkLabel")}</label>
        <div id="dl-urls-wrap" style="display:flex;flex-direction:column;gap:8px;max-height:50vh;overflow-y:auto;padding-right:4px;">${rowsHtml}</div>
        <button id="dl-add-url" style="margin-top:8px;background:transparent;border:none;font-family:var(--font);font-size:0.82rem;font-weight:800;color:var(--blue);cursor:pointer;padding:4px 0;">
          <i class="ph-fill ph-plus-circle"></i> ${t("addUrlBtn")}
        </button>
      </div>
      <button class="login-submit" id="dl-save"><i class="ph-fill ph-floppy-disk"></i> ${t("save")}</button>
      <button class="login-cancel" id="dl-cancel">${t("cancel")}</button>
    </div>`;
  $("console-ui").appendChild(modal);
  setTimeout(() => $("dl-name").focus(), 100);

  function addRow() {
  const wrap = $("dl-urls-wrap");
  const row = document.createElement("div");
  row.className = "dl-url-row";
  row.style.cssText = "background:#f8f8fc;border-radius:12px;padding:10px;margin-bottom:6px;";
  row.innerHTML = `
    <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
      <input type="text" class="dl-url-label" placeholder="Tên host (GG Drive, Mega...)" style="width:130px;flex-shrink:0" />
      <button class="dl-del-btn dl-url-del" style="flex-shrink:0;margin-left:auto"><i class="ph-fill ph-minus-circle"></i></button>
    </div>
    <div class="dl-parts-wrap" style="display:flex;flex-direction:column;gap:6px;">
      <div class="dl-part-row" style="display:flex;gap:6px;align-items:center;">
        <input type="text" class="dl-part-label" placeholder="Part 1..." style="width:90px;flex-shrink:0" />
        <input type="text" class="dl-part-url" placeholder="https://..." style="flex:1" />
      </div>
    </div>
    <button class="dl-add-part-btn" style="margin-top:6px;background:transparent;border:none;font-family:var(--font);font-size:0.75rem;font-weight:800;color:var(--purple);cursor:pointer;padding:2px 0;">
      <i class="ph-fill ph-plus-circle"></i> Thêm part
    </button>`;
  wrap.appendChild(row);
  bindPartEvents(wrap);
  row.querySelector(".dl-part-url").focus();
}

  $("dl-add-url").addEventListener("click", addRow);
  function bindPartEvents(wrap) {
  wrap.querySelectorAll(".dl-add-part-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const partsWrap = btn.previousElementSibling;
      const row = document.createElement("div");
      row.className = "dl-part-row";
      row.style.cssText = "display:flex;gap:6px;align-items:center;";
      row.innerHTML = `
        <input type="text" class="dl-part-label" placeholder="Part 1, Part 2..." style="width:90px;flex-shrink:0" />
        <input type="text" class="dl-part-url" placeholder="https://..." style="flex:1" />
        <button class="dl-del-btn dl-part-del" style="flex-shrink:0"><i class="ph-fill ph-minus"></i></button>`;
      row.querySelector(".dl-part-del").addEventListener("click", () => row.remove());
      partsWrap.appendChild(row);
    });
  });
  wrap.querySelectorAll(".dl-part-del").forEach(btn => btn.addEventListener("click", () => btn.closest(".dl-part-row").remove()));
  wrap.querySelectorAll(".dl-url-del").forEach(btn => btn.addEventListener("click", () => btn.closest(".dl-url-row").remove()));
}

const wrap = $("dl-urls-wrap");
bindPartEvents(wrap);
  modal.querySelectorAll(".dl-url-del").forEach(btn => btn.addEventListener("click", () => btn.closest(".dl-url-row").remove()));
  $("dl-cancel").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
  $("dl-save").addEventListener("click", async () => {
    const name = $("dl-name").value.trim();
    const urls = [...modal.querySelectorAll(".dl-url-row")].map(row => {
  const label = row.querySelector(".dl-url-label").value.trim();
  const parts = [...row.querySelectorAll(".dl-part-row")].map(pr => ({
    label: pr.querySelector(".dl-part-label").value.trim(),
    url:   pr.querySelector(".dl-part-url").value.trim(),
  })).filter(p => p.url);
  return { label, parts };
}).filter(e => e.parts.length);
    if (!name || !urls.length) return;
    const links = await getLinks(game.id);
    const entry = { name, urls };
    if (idx !== null) links[idx] = entry;
    else links.push(entry);
    await saveLinks(game.id, links);
    modal.remove();
    playSound("select");
    await refreshDlSection(game);
  });
}

function getLinkIcon(label) {
  const l = label.toLowerCase();
  if (l.includes("google") || l.includes("gg") || l.includes("drive"))
    return `<img src="https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png" style="width:14px;height:14px;object-fit:contain;" />`;
  if (l.includes("mega"))
    return `<img src="https://mega.nz/favicon.ico" style="width:14px;height:14px;object-fit:contain;" />`;
  if (l.includes("fshare"))
    return `<img src="https://www.fshare.vn/favicon.ico" style="width:14px;height:14px;object-fit:contain;" />`;
  if (l.includes("mediafire"))
    return `<img src="https://www.mediafire.com/favicon.ico" style="width:14px;height:14px;object-fit:contain;" />`;
  if (l.includes("onedrive") || l.includes("microsoft"))
    return `<img src="https://onedrive.live.com/favicon.ico" style="width:14px;height:14px;object-fit:contain;" />`;
  if (l.includes("dropbox"))
    return `<img src="https://www.dropbox.com/favicon.ico" style="width:14px;height:14px;object-fit:contain;" />`;
  if (l.includes("1fichier"))
    return `<img src="https://1fichier.com/favicon.ico" style="width:14px;height:14px;object-fit:contain;" />`;
  if (l.includes("pixeldrain"))
    return `<img src="https://pixeldrain.com/favicon.ico" style="width:14px;height:14px;object-fit:contain;" />`;
  if (l.includes("gofile"))
    return `<img src="https://gofile.io/favicon.ico" style="width:14px;height:14px;object-fit:contain;" />`;
  return `<i class="ph-fill ph-download-simple"></i>`;
}

/* ══ TRAILER ══ */
function openTrailerModal(game) {
  playSound("open");
  const modal = document.createElement("div");
  modal.className = "login-overlay";
  modal.id = "trailer-modal";
  modal.innerHTML = `
    <div class="login-box" style="width:400px">
      <div class="login-title">
        <i class="ph-fill ph-youtube-logo" style="color:#ff0000"></i>
        ${t("ytTrailer")}
      </div>
      <div class="login-field">
        <label>Link YouTube</label>
        <input type="text" id="trailer-url" placeholder="${t("ytPlaceholder")}" />
      </div>
      <div id="trailer-preview" style="margin-top:8px;display:none;">
        <img id="trailer-thumb" style="width:100%;border-radius:10px;" />
      </div>
      <button class="login-submit" id="trailer-save"><i class="ph-fill ph-floppy-disk"></i> ${t("save")}</button>
      <button class="login-cancel" id="trailer-cancel">${t("cancel")}</button>
    </div>`;
  $("console-ui").appendChild(modal);
  setTimeout(() => $("trailer-url").focus(), 100);

  $("trailer-url").addEventListener("input", () => {
    const vid = extractYoutubeId($("trailer-url").value.trim());
    if (vid) {
      $("trailer-thumb").src = `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;
      $("trailer-preview").style.display = "block";
    } else {
      $("trailer-preview").style.display = "none";
    }
  });

  $("trailer-cancel").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });
  $("trailer-save").addEventListener("click", async () => {
    const vid = extractYoutubeId($("trailer-url").value.trim());
    if (!vid) return;
    const list = await getTrailers(game.id);
    if (!list.includes(vid)) list.push(vid);
    await saveTrailers(game.id, list);
    game.trailers = list;
    modal.remove();
    playSound("select");
    renderDetailContent(game);
  });
  $("trailer-url").addEventListener("keydown", e => { if (e.key === "Enter") $("trailer-save").click(); });
}

function extractYoutubeId(input) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

/* ══ BOOT ══ */
function boot() {
  buildBubbles(); startClock(); setupInfiniteScroll(); initLogin();

  // Lang button
  const langBtn = $("hud-lang");
  if (langBtn) {
    const flag = $("lang-flag");
    if (flag) flag.src = currentLang === "vi" 
    ? "https://flagcdn.com/w40/vn.png" 
    : "https://flagcdn.com/w40/gb.png";
    langBtn.addEventListener("click", () => {
      playSound("tick");
      setLang(currentLang === "vi" ? "en" : "vi");
      if ($("view-home").classList.contains("active")) {
        showHome(S.games.length > 0);
      } else if (S.gameDetail) {
        renderDetailContent(S.gameDetail);
      }
    });
  }

  $("game-shelf").addEventListener("mouseleave", () => {
    [...document.querySelectorAll(".game-tile")].forEach(t => {
      t.style.transform = ""; t.style.zIndex = ""; t.style.filter = "";
    });
  });

  document.addEventListener("input", deb(e => {
    if (e.target.id !== "search-input") return;
    S.searchQ = e.target.value.trim(); S.page = 1; fetchGames();
  }, 400));

  $("hud-back").addEventListener("click", goHome);

  $("overlay-close").addEventListener("click", () => {
    playSound("back");
    $("filter-overlay").classList.add("hidden"); S.page=1; fetchGames(); buildGenrePills();
  });
  $("filter-overlay").addEventListener("click", e => {
    if (e.target===$("filter-overlay")) {
      $("filter-overlay").classList.add("hidden"); S.page=1; fetchGames(); buildGenrePills();
    }
  });

  $("sc-close").addEventListener("click", () => $("showcase-overlay").classList.add("hidden"));
  $("sc-prev").addEventListener("click", () => { S.scIdx=(S.scIdx-1+S.scImgs.length)%S.scImgs.length; updateShowcase(); });
  $("sc-next").addEventListener("click", () => { S.scIdx=(S.scIdx+1)%S.scImgs.length; updateShowcase(); });
  $("showcase-overlay").addEventListener("click", e => {
    if (e.target===$("showcase-overlay")) $("showcase-overlay").classList.add("hidden");
  });

  document.addEventListener("keydown", e => {
    if (!$("showcase-overlay").classList.contains("hidden")) {
      if (e.key==="ArrowLeft")  { S.scIdx=(S.scIdx-1+S.scImgs.length)%S.scImgs.length; updateShowcase(); }
      if (e.key==="ArrowRight") { S.scIdx=(S.scIdx+1)%S.scImgs.length; updateShowcase(); }
      if (e.key==="Escape") $("showcase-overlay").classList.add("hidden");
      return;
    }
    if (e.key==="Escape") goHome();
  });

  window.addEventListener("hashchange", handleHash);
  handleHash();

  setTimeout(() => {
    $("loading").style.opacity = "0"; $("loading").style.transition = "opacity 0.5s";
    setTimeout(() => { $("loading").style.display="none"; }, 500);
    $("console-ui").classList.remove("hidden");
  }, 1000);
}

function goHome() {
  playSound("back");
  stopGameMusic();
  document.querySelector(".detail-media-preview")?.remove();
  const savedScroll = S.scrollY;
  const detail = $("view-detail");
  detail.classList.add("scrunch-out");
  setTimeout(() => {
    detail.classList.remove("scrunch-out");
    S.scrollY = savedScroll;
    showHome(S.games.length > 0);
    const home = $("view-home");
    home.classList.add("home-enter");
    home.addEventListener("animationend", () => home.classList.remove("home-enter"), { once: true });
  }, 380);
}

function handleHash() {
  const hash = window.location.hash || "#/home";
  if (hash.startsWith("#/game/")) { showDetail(null, hash.replace("#/game/","")); return; }
  showHome(S.games.length > 0);
}

// ══ CUSTOM GAMES STORAGE ══
async function getCustomGames() {
  const all = await fetchAllLinks();
  return all["custom_games"] || [];
}

async function saveCustomGames(games) {
  linksCache = null;
  const all = await fetchAllLinks();
  all["custom_games"] = games;
  linksCache = all;
  await fetch(JSONBIN_PUT_URL, {
      method: "PUT",
    headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_KEY },
    body: JSON.stringify({ links: all })
  });
}

function normalizeCustomGame(raw) {
  return {
    id:            `custom_${raw.id}`,
    slug:          `custom-${raw.id}`,
    name:          raw.name,
    img:           raw.img || `https://placehold.co/400x400/dff1fa/009AC7?text=${encodeURIComponent(raw.name.slice(0,12))}`,
    released:      raw.released || null,
    rating:        raw.rating || 0,
    ratings_count: 0,
    metacritic:    raw.metacritic || null,
    playtime:      raw.playtime || null,
    genres:        raw.genres || [],
    tags:          [],
    dev:           raw.dev || "N/A",
    publishers:    raw.publishers || null,
    description:   raw.description || "",
    website:       raw.website || null,
    esrb:          null,
    stores:        [],
    tags_top:      [],
    screenshots:   raw.screenshots || [],
    trailers:      raw.trailers || [],
    similar:       [],
    isCustom:      true,
  };
}

function openAddGameModal(existing = null) {
  playSound("open");
  const isEdit = !!existing;
  const modal = document.createElement("div");
  modal.className = "login-overlay";
  modal.id = "add-game-modal";
  modal.innerHTML = `
    <div class="login-box" style="width:520px;max-height:85vh;overflow-y:auto;">
      <div class="login-title">
        <i class="ph-fill ph-game-controller" style="color:var(--blue)"></i>
        ${isEdit ? (currentLang==="vi"?"Sửa game":"Edit game") : (currentLang==="vi"?"Thêm game mới":"Add new game")}
      </div>

      <div class="login-field">
        <label>${currentLang==="vi"?"Tên game":"Game name"} *</label>
        <input type="text" id="ag-name" placeholder="The Legend of Zelda..." value="${existing?.name||""}" />
      </div>

      <div class="login-field">
        <label>${currentLang==="vi"?"Ảnh bìa (URL)":"Cover image (URL)"}</label>
        <input type="text" id="ag-img" placeholder="https://..." value="${existing?.img||""}" />
        <div style="margin-top:6px;display:flex;gap:6px;">
          <button type="button" id="ag-img-paste" style="background:rgba(58,180,216,0.1);border:1.5px dashed var(--blue);border-radius:8px;padding:5px 12px;font-family:var(--font);font-size:0.78rem;font-weight:800;color:var(--blue);cursor:pointer;">
            <i class="ph-fill ph-clipboard"></i> Paste URL
          </button>
        </div>
        <div id="ag-img-preview" style="margin-top:6px;${existing?.img?'':'display:none'}">
          <img id="ag-img-thumb" src="${existing?.img||''}" style="width:80px;height:80px;object-fit:cover;border-radius:10px;" />
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div class="login-field">
          <label>${currentLang==="vi"?"Ngày phát hành":"Release date"}</label>
          <input type="date" id="ag-released" value="${existing?.released||""}" />
        </div>
        <div class="login-field">
          <label>Rating (0-5)</label>
          <input type="number" id="ag-rating" min="0" max="5" step="0.1" placeholder="4.5" value="${existing?.rating||""}" />
        </div>
        <div class="login-field">
          <label>Metacritic (0-100)</label>
          <input type="number" id="ag-metacritic" min="0" max="100" placeholder="85" value="${existing?.metacritic||""}" />
        </div>
        <div class="login-field">
          <label>${currentLang==="vi"?"Thời gian (giờ)":"Playtime (hrs)"}</label>
          <input type="number" id="ag-playtime" min="0" placeholder="20" value="${existing?.playtime||""}" />
        </div>
      </div>

      <div class="login-field">
        <label>Developer</label>
        <input type="text" id="ag-dev" placeholder="Nintendo..." value="${existing?.dev||""}" />
      </div>

      <div class="login-field">
        <label>${currentLang==="vi"?"Thể loại (phân cách bằng dấu phẩy)":"Genres (comma separated)"}</label>
        <input type="text" id="ag-genres" placeholder="Action, Adventure, RPG" value="${(existing?.genres||[]).join(", ")}" />
      </div>

      <div class="login-field">
        <label>${currentLang==="vi"?"Mô tả":"Description"}</label>
        <textarea id="ag-desc" rows="4" style="width:100%;background:#f0f0f4;border:2px solid transparent;border-radius:12px;padding:10px 14px;font-family:var(--font);font-size:0.88rem;font-weight:500;color:var(--tx);outline:none;resize:vertical;transition:border-color 0.18s;"
          placeholder="${currentLang==="vi"?"Mô tả game...":"Game description..."}">${existing?.description||""}</textarea>
      </div>

      <div class="login-field">
        <label>Website</label>
        <input type="text" id="ag-website" placeholder="https://..." value="${existing?.website||""}" />
      </div>

      <div class="login-field">
        <label>${currentLang==="vi"?"Screenshots (mỗi URL 1 dòng)":"Screenshots (one URL per line)"}</label>
        <textarea id="ag-screenshots" rows="3" style="width:100%;background:#f0f0f4;border:2px solid transparent;border-radius:12px;padding:10px 14px;font-family:var(--font);font-size:0.82rem;font-weight:500;color:var(--tx);outline:none;resize:vertical;transition:border-color 0.18s;"
          placeholder="https://img1.jpg&#10;https://img2.jpg">${(existing?.screenshots||[]).join("\n")}</textarea>
      </div>

      <button class="login-submit" id="ag-save">
        <i class="ph-fill ph-floppy-disk"></i> ${currentLang==="vi"?"Lưu":"Save"}
      </button>
      <button class="login-cancel" id="ag-cancel">${currentLang==="vi"?"Hủy":"Cancel"}</button>
    </div>`;
  $("console-ui").appendChild(modal);
  setTimeout(() => $("ag-name").focus(), 100);

  // Preview ảnh bìa
  $("ag-img").addEventListener("input", () => {
    const url = $("ag-img").value.trim();
    if (url) {
      $("ag-img-thumb").src = url;
      $("ag-img-preview").style.display = "block";
    } else {
      $("ag-img-preview").style.display = "none";
    }
  });

  document.getElementById("ag-img-paste")?.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.startsWith("http")) {
        $("ag-img").value = text;
        $("ag-img-thumb").src = text;
        $("ag-img-preview").style.display = "block";
      }
    } catch {}
  });

  $("ag-cancel").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });

  $("ag-save").addEventListener("click", async () => {
    const name = $("ag-name").value.trim();
    if (!name) return;

    const gameData = {
      id:          existing?.id || Date.now(),
      name,
      img:         $("ag-img").value.trim(),
      released:    $("ag-released").value || null,
      rating:      parseFloat($("ag-rating").value) || 0,
      metacritic:  parseInt($("ag-metacritic").value) || null,
      playtime:    parseInt($("ag-playtime").value) || null,
      dev:         $("ag-dev").value.trim(),
      genres:      $("ag-genres").value.split(",").map(s => s.trim()).filter(Boolean),
      description: $("ag-desc").value.trim(),
      website:     $("ag-website").value.trim(),
      screenshots: $("ag-screenshots").value.split("\n").map(s => s.trim()).filter(Boolean),
    };

    const customs = await getCustomGames();
    if (isEdit) {
      const idx = customs.findIndex(g => g.id === existing.id);
      if (idx !== -1) customs[idx] = gameData;
    } else {
      customs.unshift(gameData);
    }
    await saveCustomGames(customs);
    modal.remove();
    playSound("select");
    S.page = 1;
    fetchGames();
  });
}


function updateSEO({ title, description, image, url }) {
  document.title = title ? `${title} – NSwitch Vault` : "NSwitch Vault – Kho tàng game Nintendo Switch";

  const setMeta = (id, val) => { const el = document.getElementById(id); if (el) el.setAttribute("content", val || ""); };

  const desc = description
    ? description.replace(/\n/g, " ").slice(0, 160)
    : "Khám phá hàng nghìn game Nintendo Switch với đánh giá, trailer và link tải.";

  const img  = image || "https://i.ibb.co/sdvq23cb/90661e30d4360961d07d6c05893a5369.jpg";
  const link = url || window.location.href;

  setMeta("og-title",   document.title);
  setMeta("og-desc",    desc);
  setMeta("og-image",   img);
  setMeta("og-url",     link);
  setMeta("tw-title",   document.title);
  setMeta("tw-desc",    desc);
  setMeta("tw-image",   img);
  setMeta("meta-desc",  desc);
}

/* ══ FAVORITES & RECENT ══ */
function getFavorites() { return JSON.parse(localStorage.getItem("sv_favorites") || "[]"); }
function saveFavorites(list) { localStorage.setItem("sv_favorites", JSON.stringify(list)); }
function toggleFavorite(game) {
  let favs = getFavorites();
  const idx = favs.findIndex(f => f.id == game.id);
  if (idx === -1) favs.unshift({ id: game.id, slug: game.slug, name: game.name, img: game.img, rating: game.rating });
  else favs.splice(idx, 1);
  saveFavorites(favs);
  return idx === -1;
}
function isFavorite(gameId) { return getFavorites().some(f => f.id == gameId); }

function getRecent() { return JSON.parse(localStorage.getItem("sv_recent") || "[]"); }
function addRecent(game) {
  let recent = getRecent().filter(r => r.id != game.id);
  recent.unshift({ id: game.id, slug: game.slug, name: game.name, img: game.img, rating: game.rating });
  if (recent.length > 20) recent = recent.slice(0, 20);
  localStorage.setItem("sv_recent", JSON.stringify(recent));
}

function openMenuOverlay() {
  playSound("open");
  const favs   = getFavorites();
  const recent = getRecent();

  const existing = document.getElementById("menu-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "menu-overlay";
  overlay.className = "overlay-panel";
  overlay.innerHTML = `
    <div class="overlay-panel-inner" style="max-width:900px;">
      <div class="overlay-title"><i class="ph-fill ph-squares-four"></i> Menu</div>

      <!-- YÊU THÍCH -->
      <div class="overlay-section">
        <div class="overlay-section-label" style="display:flex;align-items:center;justify-content:space-between;">
          <span><i class="ph-fill ph-heart" style="color:#e4001b"></i> ${currentLang==="vi"?"Yêu thích":"Favorites"} (${favs.length})</span>
          ${favs.length ? `<button id="clear-favs" style="background:none;border:none;font-family:var(--font);font-size:0.72rem;font-weight:700;color:var(--tx-light);cursor:pointer;">${currentLang==="vi"?"Xóa tất cả":"Clear all"}</button>` : ""}
        </div>
        ${favs.length ? `
          <div class="menu-game-grid" id="favs-grid">
            ${favs.map(g => `
              <div class="menu-game-card" data-id="${g.id}" data-slug="${g.slug}">
                <div class="menu-game-img"><img src="${g.img}" onerror="this.src='https://placehold.co/200x200/dff1fa/009AC7?text=Game'" /></div>
                <div class="menu-game-name">${g.name}</div>
                <div class="menu-game-rating"><i class="ph-fill ph-star"></i> ${(g.rating||0).toFixed(1)}</div>
                <button class="menu-fav-del" data-id="${g.id}" title="Bỏ yêu thích"><i class="ph-fill ph-heart-break"></i></button>
              </div>`).join("")}
          </div>` 
        : `<div class="menu-empty"><i class="ph-fill ph-heart"></i> ${currentLang==="vi"?"Chưa có game yêu thích":"No favorites yet"}</div>`}
      </div>

      <!-- GẦN ĐÂY -->
      <div class="overlay-section">
        <div class="overlay-section-label" style="display:flex;align-items:center;justify-content:space-between;">
          <span><i class="ph-fill ph-clock-clockwise" style="color:var(--blue)"></i> ${currentLang==="vi"?"Xem gần đây":"Recently viewed"} (${recent.length})</span>
          ${recent.length ? `<button id="clear-recent" style="background:none;border:none;font-family:var(--font);font-size:0.72rem;font-weight:700;color:var(--tx-light);cursor:pointer;">${currentLang==="vi"?"Xóa tất cả":"Clear all"}</button>` : ""}
        </div>
        ${recent.length ? `
          <div class="menu-game-grid" id="recent-grid">
            ${recent.map(g => `
              <div class="menu-game-card" data-id="${g.id}" data-slug="${g.slug}">
                <div class="menu-game-img"><img src="${g.img}" onerror="this.src='https://placehold.co/200x200/dff1fa/009AC7?text=Game'" /></div>
                <div class="menu-game-name">${g.name}</div>
                <div class="menu-game-rating"><i class="ph-fill ph-star"></i> ${(g.rating||0).toFixed(1)}</div>
                ${isFavorite(g.id) ? `<div class="menu-fav-badge"><i class="ph-fill ph-heart"></i></div>` : ""}
              </div>`).join("")}
          </div>`
        : `<div class="menu-empty"><i class="ph-fill ph-clock"></i> ${currentLang==="vi"?"Chưa xem game nào":"No recently viewed games"}</div>`}
      </div>

      <button class="overlay-close" id="menu-close"><i class="ph-bold ph-check"></i> ${t("doneBtn")}</button>
    </div>`;

  document.getElementById("console-ui").appendChild(overlay);

  // Events
  overlay.querySelector("#menu-close")?.addEventListener("click", () => { playSound("back"); overlay.remove(); });
  overlay.addEventListener("click", e => { if (e.target === overlay) { playSound("back"); overlay.remove(); } });

  overlay.querySelectorAll(".menu-game-card").forEach(card => {
    card.addEventListener("mouseenter", () => playSound("tick"));
    card.addEventListener("click", e => {
      if (e.target.closest(".menu-fav-del")) return;
      overlay.remove();
      showDetail(parseInt(card.dataset.id) || null, card.dataset.slug);
    });
  });

  overlay.querySelectorAll(".menu-fav-del").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      playSound("back");
      let favs = getFavorites().filter(f => f.id != btn.dataset.id);
      saveFavorites(favs);
      openMenuOverlay(); // re-render
    });
  });

  overlay.querySelector("#clear-favs")?.addEventListener("click", () => {
    saveFavorites([]); playSound("back"); openMenuOverlay();
  });
  overlay.querySelector("#clear-recent")?.addEventListener("click", () => {
    localStorage.removeItem("sv_recent"); playSound("back"); openMenuOverlay();
  });
}

/* ══ PLATFORM SELECTOR ══ */
const PLATFORMS = [
  { id: "switch", name: "Switch",      rawgId: 7,  logo: "/image/ns.png" },
  { id: "pc",     name: "PC",          rawgId: 4,  logo: "/image/steam.jpg" },
  { id: "wiiu",   name: "Wii U",       rawgId: 10, logo: "/image/wiiu.png" },
  { id: "3ds",    name: "3DS",         rawgId: 8,  logo: "/image/3ds.png" },
  { id: "nds",    name: "NDS",         rawgId: 9,  logo: "/image/nds.png" },
  { id: "gba",    name: "GBA",         rawgId: 24, logo: "/image/gba.png" },
  { id: "gbc",    name: "GBC",         rawgId: 43, logo: "/image/gbc.png" },
  { id: "n64",    name: "N64",         rawgId: 83, logo: "/image/n64.png" },
  { id: "snes",   name: "SNES",        rawgId: 79, logo: "/image/snes.png" },
  { id: "nes",    name: "NES",         rawgId: 49, logo: "/image/nes.png" },
];

let currentPlatform = "switch";

function buildPlatformOverlay() {
  const list = $("platform-list");
  list.innerHTML = PLATFORMS.map((p, i) => `
  <div class="platform-card ${p.id === currentPlatform ? "active" : ""}"
       data-pid="${p.id}"
       title="${p.name}"
       style="animation-delay:${i * 40}ms">
    <div class="platform-logo">
      <img src="${p.logo}" alt="${p.name}"
           onerror="this.parentElement.innerHTML='<span style=font-size:1.4rem;font-weight:900;color:var(--tx-mid)>${p.name.slice(0,2)}</span>'" />
    </div>
  </div>`).join("");

  list.querySelectorAll(".platform-card").forEach(card => {
    card.addEventListener("mouseenter", () => playSound("tick"));
    card.addEventListener("click", () => {
  playSound("select");
  currentPlatform = card.dataset.pid;
  const platform = PLATFORMS.find(p => p.id === currentPlatform);
  window._activePlatformId = platform.rawgId;

  // Reset toàn bộ filter + search khi đổi nền tảng
  S.genre = ""; S.tag = ""; S.order = "-rating";
  S.searchQ = ""; S.page = 1; S.games = []; S.hasMore = true; S.scrollY = 0;
  const si = $("search-input");
  if (si) si.value = "";

  $("platform-overlay").classList.add("hidden");
  $("hud-title").innerHTML = `<i class="ph-fill ph-lightning"></i> ${platform.name} Vault`;

  // Rebuild genre pills để xóa active cũ
  buildGenrePills();

  // Ẩn nút thêm game khi không phải Switch
  $("btn-add-game")?.remove();
  if (isAdmin && currentPlatform === "switch") {
    const addBtn = document.createElement("button");
    addBtn.id = "btn-add-game";
    addBtn.className = "dl-add-btn";
    addBtn.style.cssText = "margin:0 28px 12px;width:calc(100% - 56px);";
    addBtn.innerHTML = `<i class="ph-fill ph-plus-circle"></i> ${currentLang === "vi" ? "Thêm game mới" : "Add new game"}`;
    addBtn.addEventListener("click", () => openAddGameModal());
    const shelf = $("game-shelf");
    shelf.parentElement.insertBefore(addBtn, shelf);
  }

  fetchGames();
});
  });
  // Drag-to-scroll
const wrap = document.querySelector("#platform-overlay .platform-scroll-wrap");
if (wrap) {
  let down = false, sx, sl;
  wrap.addEventListener("mousedown", e => { down = true; sx = e.pageX - wrap.offsetLeft; sl = wrap.scrollLeft; });
  wrap.addEventListener("mouseleave", () => down = false);
  wrap.addEventListener("mouseup",   () => down = false);
  wrap.addEventListener("mousemove", e => { if (!down) return; e.preventDefault(); wrap.scrollLeft = sl - (e.pageX - wrap.offsetLeft - sx); });
}
}

$("hud-title").addEventListener("click", () => {
  if (!$("view-home").classList.contains("active")) return;
  playSound("open");
  buildPlatformOverlay();
  $("platform-overlay").classList.remove("hidden");
});
$("platform-overlay").addEventListener("click", e => {
  if (e.target === $("platform-overlay")) { playSound("back"); $("platform-overlay").classList.add("hidden"); }
});



async function openEditImagesModal(game) {
  playSound("open");
  const modal = document.createElement("div");
  modal.className = "login-overlay";
  modal.id = "edit-images-modal";
  modal.innerHTML = `
    <div class="login-box" style="width:500px;max-height:85vh;overflow-y:auto;">
      <div class="login-title">
        <i class="ph-fill ph-image" style="color:var(--purple)"></i>
        ${currentLang === "vi" ? "Sửa ảnh & Screenshots" : "Edit images"}
      </div>
      <div class="login-field">
        <label>${currentLang === "vi" ? "Ảnh bìa (URL)" : "Cover image (URL)"}</label>
        <input type="text" id="ei-cover" placeholder="https://..." value="${game.img || ""}" />
        <div id="ei-cover-preview" style="margin-top:6px;">
          <img id="ei-cover-thumb" src="${game.img || ""}"
            style="width:80px;height:80px;object-fit:cover;border-radius:10px;${game.img ? "" : "display:none"}" />
        </div>
      </div>
      <div class="login-field">
        <label>${currentLang === "vi" ? "Screenshots (mỗi URL 1 dòng)" : "Screenshots (one URL per line)"}</label>
        <textarea id="ei-screenshots" rows="5"
          style="width:100%;background:#f0f0f4;border:2px solid transparent;border-radius:12px;
                 padding:10px 14px;font-family:var(--font);font-size:0.82rem;font-weight:500;
                 color:var(--tx);outline:none;resize:vertical;"
          placeholder="https://img1.jpg&#10;https://img2.jpg">${(game.screenshots || []).join("\n")}</textarea>
      </div>
      <div class="login-field">
        <label>🎵 Nhạc game (URL mp3 hoặc YouTube)</label>
        <input type="text" id="ei-music" placeholder="https://...mp3 hoặc youtube.com/watch?v=..." 
          value="${(await fetchAllLinks())[`game_music_${game.id}`] || ""}" />
      </div>
      <button class="login-submit" id="ei-save">
        <i class="ph-fill ph-floppy-disk"></i> ${currentLang === "vi" ? "Lưu" : "Save"}
      </button>
      <button class="login-cancel" id="ei-cancel">${currentLang === "vi" ? "Hủy" : "Cancel"}</button>
    </div>`;
  $("console-ui").appendChild(modal);

  $("ei-cover").addEventListener("input", () => {
    const url = $("ei-cover").value.trim();
    const thumb = $("ei-cover-thumb");
    thumb.src = url;
    thumb.style.display = url ? "block" : "none";
  });

  $("ei-cancel").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", e => { if (e.target === modal) modal.remove(); });

  $("ei-save").addEventListener("click", async () => {
    linksCache = null;
    const newCover = $("ei-cover").value.trim();
    const newShots = $("ei-screenshots").value.split("\n").map(s => s.trim()).filter(Boolean);

    // Lưu vào JSONBin dưới key riêng
    const all = await fetchAllLinks();
    all[`custom_img_${game.id}`] = { cover: newCover, screenshots: newShots };
    const musicUrl = $("ei-music").value.trim();
    if (musicUrl) all[`game_music_${game.id}`] = musicUrl;
    else delete all[`game_music_${game.id}`];
    linksCache = all;
    await fetch(JSONBIN_PUT_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": JSONBIN_KEY },
      body: JSON.stringify({ links: all })
    });

    // Cập nhật game object ngay
    if (newCover) game.img = newCover;
    if (newShots.length) game.screenshots = newShots;

    modal.remove();
    playSound("select");
    renderDetailContent(game);
  });
}


function playGameMusic(url) {
  if (!url) return;
  // Lưu thời gian hiện tại của nhạc nền
  if (musicPlayer.audio) {
    musicPlayer._savedTime = musicPlayer.audio.currentTime;
    musicPlayer._savedAudio = musicPlayer.audio;
    musicPlayer.audio.pause();
  }
  // Dừng nhạc nền hiện tại

  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    // YouTube → dùng iframe ẩn
    let iframe = document.getElementById("game-music-iframe");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "game-music-iframe";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }
    iframe.src = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&loop=1&playlist=${ytMatch[1]}`;
  } else {
    // Direct mp3
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = musicPlayer.volume;
    audio.play().catch(() => {});
    musicPlayer._gameAudio = audio;
  }
}

function stopGameMusic() {
  const iframe = document.getElementById("game-music-iframe");
  const hadGameMusic = iframe || musicPlayer._gameAudio;

  if (iframe) { iframe.src = ""; iframe.remove(); }
  if (musicPlayer._gameAudio) {
    musicPlayer._gameAudio.pause();
    musicPlayer._gameAudio = null;
  }

  // Dùng audio đã lưu — KHÔNG tạo Audio mới để tránh IDM
  const audioToResume = musicPlayer._savedAudio || musicPlayer.audio;
  if (audioToResume) {
    musicPlayer.audio = audioToResume;
    if (musicPlayer._savedTime) {
      audioToResume.currentTime = musicPlayer._savedTime;
      musicPlayer._savedTime = 0;
    }
    audioToResume.play().catch(() => {});
    musicPlayer._savedAudio = null;
  }
}


window.openShowcase = openShowcase;
boot();