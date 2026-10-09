const STORAGE_KEY = "ui-plan-photo-album-demo";

const defaultData = () => ({
  albums: [
    { id: "2024-03-15", title: "2024年3月15日", count: 4, kind: "date" },
    { id: "2024-02-02", title: "2024年2月2日", count: 3, kind: "date" },
    { id: "unknown", title: "日期未知", count: 1, kind: "unknown" },
  ],
  photos: {
    "2024-03-15": [
      { id: "p1", label: "晨霧", hue: 25 },
      { id: "p2", label: "街道", hue: 190 },
      { id: "p3", label: "窗邊", hue: 310 },
      { id: "p4", label: "海邊", hue: 210 },
    ],
    "2024-02-02": [
      { id: "p5", label: "市集", hue: 45 },
      { id: "p6", label: "樹影", hue: 140 },
      { id: "p7", label: "夜灯", hue: 260 },
    ],
    unknown: [{ id: "p8", label: "未標日期", hue: 0 }],
  },
});

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {
    /* ignore */
  }
  return defaultData();
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function svgPlaceholder(hue, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="hsl(${hue},70%,55%)"/><stop offset="100%" stop-color="hsl(${(hue + 40) % 360},65%,42%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="52%" text-anchor="middle" fill="white" font-family="Segoe UI,sans-serif" font-size="28" font-weight="600">${label}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function toast(message, type = "default") {
  const stack = document.getElementById("toast-stack");
  if (!stack) return;
  const el = document.createElement("div");
  el.className = `toast${type !== "default" ? ` ${type}` : ""}`;
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

function bindImportButtons(state, onUpdate) {
  document.querySelectorAll("[data-import]").forEach((btn) => {
    const input = btn.querySelector('input[type="file"]');
    btn.addEventListener("click", () => input?.click());
    input?.addEventListener("change", () => {
      const files = [...(input.files || [])];
      if (!files.length) return;
      files.forEach((file, i) => {
        setTimeout(() => {
          if (file.size > 8_000_000) {
            toast(`${file.name} 過大，已略過`, "error");
            return;
          }
          const albumId = i % 2 === 0 ? "2024-03-15" : "unknown";
          const id = `new-${Date.now()}-${i}`;
          state.photos[albumId].push({
            id,
            label: file.name.replace(/\.[^.]+$/, "").slice(0, 8) || "新照片",
            hue: (id.length * 40) % 360,
          });
          const album = state.albums.find((a) => a.id === albumId);
          if (album) album.count = state.photos[albumId].length;
          saveState(state);
          toast(`${file.name} 已加入相簿`, "success");
          onUpdate?.();
        }, 400 * (i + 1));
      });
      input.value = "";
    });
  });
}

function renderAlbumList() {
  const state = loadState();
  const grid = document.getElementById("album-grid");
  if (!grid) return;

  grid.innerHTML = state.albums
    .map((album) => {
      const coverClass = album.kind === "unknown" ? "album-cover unknown" : "album-cover";
      const initial = album.kind === "unknown" ? "?" : album.title.slice(5, 7);
      return `<a class="album-card" href="album.html?id=${encodeURIComponent(album.id)}">
        <div class="${coverClass}">${initial}</div>
        <div class="album-meta">
          <h2>${album.title}</h2>
          <span>${album.count} 張照片</span>
        </div>
      </a>`;
    })
    .join("");

  bindImportButtons(state, () => renderAlbumList());
}

function renderAlbumDetail() {
  const params = new URLSearchParams(location.search);
  const albumId = params.get("id") || "2024-03-15";
  const state = loadState();
  const album = state.albums.find((a) => a.id === albumId);
  const photos = state.photos[albumId] || [];

  const titleEl = document.getElementById("album-title");
  const subEl = document.getElementById("album-subtitle");
  const grid = document.getElementById("photo-grid");
  const empty = document.getElementById("empty-state");

  if (titleEl) titleEl.textContent = album?.title || "相簿";
  if (subEl) subEl.textContent = `${photos.length} 張 · 點兩張交換順序`;

  if (!grid) return;

  if (!photos.length) {
    grid.classList.add("hidden");
    empty?.classList.remove("hidden");
  } else {
    grid.classList.remove("hidden");
    empty?.classList.add("hidden");
    grid.innerHTML = photos
      .map(
        (p, idx) => `<div class="photo-tile" data-id="${p.id}" data-idx="${idx}">
        <span class="badge">#${idx + 1}</span>
        <img src="${svgPlaceholder(p.hue, p.label)}" alt="${p.label}" />
      </div>`
      )
      .join("");
  }

  let selectedIdx = null;
  grid?.querySelectorAll(".photo-tile").forEach((tile) => {
    tile.addEventListener("click", () => {
      const idx = Number(tile.dataset.idx);
      if (selectedIdx === null) {
        selectedIdx = idx;
        tile.classList.add("selected");
        toast("再點另一張以交換順序");
        return;
      }
      if (selectedIdx === idx) {
        tile.classList.remove("selected");
        selectedIdx = null;
        return;
      }
      const list = state.photos[albumId];
      const tmp = list[selectedIdx];
      list[selectedIdx] = list[idx];
      list[idx] = tmp;
      saveState(state);
      toast("順序已更新", "success");
      renderAlbumDetail();
    });
  });

  bindImportButtons(state, () => renderAlbumDetail());

  document.getElementById("demo-fail")?.addEventListener("click", () => {
    toast("無法儲存順序，請重試", "error");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.dataset.page === "list") renderAlbumList();
  if (document.body.dataset.page === "album") renderAlbumDetail();
});
