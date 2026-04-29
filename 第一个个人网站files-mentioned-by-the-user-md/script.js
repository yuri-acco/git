const playground = document.querySelector("#playground");
const car = document.querySelector("#car");
const tiles = [...document.querySelectorAll(".world-tile")];
const infoPanel = document.querySelector("#infoPanel");
const copyWechat = document.querySelector("#copyWechat");
const heroVideo = document.querySelector("#heroVideo");
const videoTabs = [...document.querySelectorAll(".video-tab")];
const visualFlowLink = document.querySelector(".tile-gallery");

let position = { x: 0.5, y: 0.5 };
let dragging = false;
let activeTile = null;

function setCarPosition(x, y) {
  position.x = Math.min(0.92, Math.max(0.08, x));
  position.y = Math.min(0.9, Math.max(0.1, y));
  const rect = playground.getBoundingClientRect();
  car.style.left = `${position.x * rect.width}px`;
  car.style.top = `${position.y * rect.height}px`;
  car.style.transform = `translate(-50%, -50%) rotate(${(position.x - 0.5) * 38 - 8}deg)`;
  detectTile();
}

function panelFor(tile) {
  infoPanel.querySelector("h3").textContent = tile.dataset.title;
  infoPanel.querySelector("p:last-child").textContent = tile.dataset.note;
}

function detectTile() {
  const carBox = car.getBoundingClientRect();
  let currentHit = null;

  tiles.forEach((tile) => {
    const box = tile.getBoundingClientRect();
    const hit = !(
      carBox.right < box.left ||
      carBox.left > box.right ||
      carBox.bottom < box.top ||
      carBox.top > box.bottom
    );

    if (!hit) return;

    currentHit = tile;
    if (activeTile === tile) return;

    tile.classList.add("bump");
    window.setTimeout(() => tile.classList.remove("bump"), 260);

    if (tile.dataset.target) {
      jumpToSection(tile.dataset.target);
    } else {
      panelFor(tile);
    }
  });

  if (!currentHit) activeTile = null;
  if (currentHit) activeTile = currentHit;
  playground.classList.toggle("show-intro", currentHit?.classList.contains("tile-hero") ?? false);
}

function jumpToSection(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", selector);
  if (selector === "#video-flow") window.setTimeout(playHeroVideo, 450);
}

function moveFromPointer(event) {
  const rect = playground.getBoundingClientRect();
  setCarPosition((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
}

car.addEventListener("pointerdown", (event) => {
  dragging = true;
  car.setPointerCapture(event.pointerId);
  moveFromPointer(event);
});

car.addEventListener("pointermove", (event) => {
  if (dragging) moveFromPointer(event);
});

car.addEventListener("pointerup", () => {
  dragging = false;
});

playground.addEventListener("keydown", (event) => {
  const step = event.shiftKey ? 0.07 : 0.035;
  const keys = {
    ArrowLeft: [-step, 0],
    ArrowRight: [step, 0],
    ArrowUp: [0, -step],
    ArrowDown: [0, step],
    a: [-step, 0],
    d: [step, 0],
    w: [0, -step],
    s: [0, step],
  };

  if (!keys[event.key]) return;
  event.preventDefault();
  const [dx, dy] = keys[event.key];
  setCarPosition(position.x + dx, position.y + dy);
});

copyWechat.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("_yurii07");
    copyWechat.textContent = "已复制 _yurii07";
    window.setTimeout(() => {
      copyWechat.textContent = "_yurii07";
    }, 1500);
  } catch {
    copyWechat.textContent = "_yurii07";
  }
});

function playHeroVideo() {
  if (!heroVideo) return;
  heroVideo.muted = false;
  heroVideo.volume = 1;
  const playback = heroVideo.play();
  if (playback) playback.catch(() => {});
}

visualFlowLink?.addEventListener("click", () => {
  playHeroVideo();
  window.setTimeout(playHeroVideo, 450);
});

videoTabs.forEach((button) => {
  button.addEventListener("click", () => {
    const src = button.dataset.video;
    if (src && !heroVideo.src.endsWith(src)) {
      heroVideo.src = src;
      heroVideo.load();
    }
    videoTabs.forEach((tab) => tab.classList.toggle("active", tab === button));
    playHeroVideo();
  });
});

window.addEventListener("resize", () => setCarPosition(position.x, position.y));
setCarPosition(position.x, position.y);
