/* 
  ACN INTERN FAREWELL
  - Vanilla JS
  - NO button has randomized troll effects
  - YES triggers celebration screen with fireworks canvas + falling hearts
  - Optional music with fade-in + mute/unmute
*/

(() => {
  // ===== DOM =====
  const farewellCard = document.getElementById("farewellCard");
  const mainScreen = document.getElementById("mainScreen");
  const yesScreen = document.getElementById("yesScreen");
  const yesBtn = document.getElementById("yesBtn");
  const noBtn = document.getElementById("noBtn");
  const againBtn = document.getElementById("againBtn");
  const claimBtn = document.getElementById("claimBtn");

  const bgMusic = document.getElementById("bgMusic");
  const muteBtn = document.getElementById("muteBtn");

  const btnArea = document.getElementById("btnArea");
  const bubbleLayer = document.getElementById("bubbleLayer");
  const floatLayer = document.getElementById("floatLayer");

  const noCountEl = document.getElementById("noCount");
  const fxCanvas = document.getElementById("fxCanvas");

  // If core elements are missing, don't crash
  if (!mainScreen || !yesScreen || !yesBtn || !noBtn || !btnArea || !bubbleLayer || !floatLayer || !noCountEl || !fxCanvas) {
    console.warn("Some required elements are missing in index.html. Script halted to prevent errors.");
    return;
  }

  // ===== State =====
  let noAttempts = 0;
  let lastNoRect = null;
  let isCelebrating = false;

  // ===== Helpers =====
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function getAreaRect() {
    return btnArea.getBoundingClientRect();
  }

  function getYesRect() {
    return yesBtn.getBoundingClientRect();
  }

  function setNoPositionWithinArea(xPx, yPx) {
    const area = getAreaRect();
    const localX = xPx - area.left;
    const localY = yPx - area.top;
    noBtn.style.left = `${localX}px`;
    noBtn.style.top = `${localY}px`;
  }

  function randomSafePosition() {
    const area = getAreaRect();
    const yesRect = getYesRect();

    const nbRect = noBtn.getBoundingClientRect();
    const bw = nbRect.width;
    const bh = nbRect.height;

    const pad = 16;

    for (let i = 0; i < 12; i++) {
      const x = area.left + pad + (Math.random() * (area.width - pad * 2));
      const y = area.top + pad + (Math.random() * (area.height - pad * 2));

      const proposed = {
        left: x - bw / 2,
        right: x + bw / 2,
        top: y - bh / 2,
        bottom: y + bh / 2
      };

      if (
        proposed.left < area.left + pad ||
        proposed.right > area.right - pad ||
        proposed.top < area.top + pad ||
        proposed.bottom > area.bottom - pad
      ) continue;

      const buffer = 18;
      const overlap =
        !(proposed.right + buffer < yesRect.left ||
          proposed.left - buffer > yesRect.right ||
          proposed.bottom + buffer < yesRect.top ||
          proposed.top - buffer > yesRect.bottom);

      if (!overlap) return { x, y };
    }

    return {
      x: area.left + area.width * 0.75,
      y: area.top + area.height * 0.55
    };
  }

  function showBubbleNearNo(text) {
    const nb = noBtn.getBoundingClientRect();
    const area = btnArea.getBoundingClientRect();

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.textContent = text;

    const x = nb.left + nb.width / 2;
    const y = nb.top;

    const localX = x - area.left;
    const localY = y - area.top;

    bubble.style.left = `${localX}px`;
    bubble.style.top = `${localY}px`;

    bubbleLayer.appendChild(bubble);
    setTimeout(() => bubble.remove(), 1600);
  }

  function spawnGhost() {
    const nb = noBtn.getBoundingClientRect();
    const area = btnArea.getBoundingClientRect();

    const ghost = document.createElement("div");
    ghost.className = "ghost";
    ghost.textContent = "👻";

    const x = nb.left + nb.width / 2;
    const y = nb.top + nb.height / 2;

    ghost.style.left = `${x - area.left}px`;
    ghost.style.top = `${y - area.top}px`;

    floatLayer.appendChild(ghost);
    setTimeout(() => ghost.remove(), 950);
  }

  function tempSwapNoLabel() {
    const labels = ["NO?", "Seriusan?", "WOY klik YES", "Ga Cair Ya Gaji", "u sure?"];
    const original = noBtn.textContent;
    noBtn.textContent = labels[Math.floor(Math.random() * labels.length)];
    setTimeout(() => { noBtn.textContent = original; }, 1600);
  }

  function tempFadeGray() {
    noBtn.classList.add("fade-gray");
    setTimeout(() => noBtn.classList.remove("fade-gray"), 850);
  }

  function tempShrink() {
    noBtn.classList.add("shrink");
    setTimeout(() => noBtn.classList.remove("shrink"), 820);
  }

  function wiggleNo() {
    noBtn.classList.add("wiggle");
    setTimeout(() => noBtn.classList.remove("wiggle"), 320);
  }

  function screenShake() {
    mainScreen.classList.add("screen-shake");
    setTimeout(() => mainScreen.classList.remove("screen-shake"), 340);
  }

  function teleportTopThenBack() {
    const area = getAreaRect();
    const current = noBtn.getBoundingClientRect();
    lastNoRect = { x: current.left + current.width / 2, y: current.top + current.height / 2 };

    const topSpot = {
      x: area.left + area.width * (0.25 + Math.random() * 0.5),
      y: area.top + 28
    };

    setNoPositionWithinArea(topSpot.x, topSpot.y);
    setTimeout(() => {
      if (lastNoRect) setNoPositionWithinArea(lastNoRect.x, lastNoRect.y);
    }, 520);
  }

  function moveRandomWithinViewportSafe() {
    const pos = randomSafePosition();
    setNoPositionWithinArea(pos.x, pos.y);
  }

  function getPointer(evt) {
    if (evt && evt.touches && evt.touches[0]) {
      return { x: evt.touches[0].clientX, y: evt.touches[0].clientY };
    }
    return {
      x: evt?.clientX ?? window.innerWidth / 2,
      y: evt?.clientY ?? window.innerHeight / 2
    };
  }

  function slipAwayFromPointer(clientX, clientY) {
    const area = getAreaRect();
    const nb = noBtn.getBoundingClientRect();

    const cx = nb.left + nb.width / 2;
    const cy = nb.top + nb.height / 2;

    let dx = cx - clientX;
    let dy = cy - clientY;

    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;

    const step = 90 + Math.random() * 70;

    const targetX = clamp(cx + dx * step, area.left + 26, area.right - 26);
    const targetY = clamp(cy + dy * step, area.top + 26, area.bottom - 26);

    setNoPositionWithinArea(targetX, targetY);
  }

  function jumpToTopEdge() {
    const area = getAreaRect();
    const x = area.left + area.width * (0.15 + Math.random() * 0.7);
    const y = area.top + 18;
    setNoPositionWithinArea(x, y);
    setTimeout(() => {
      moveRandomWithinViewportSafe();
    }, 520);
  }

  function nudgeAway() {
    const area = getAreaRect();
    const nb = noBtn.getBoundingClientRect();

    const cx = nb.left + nb.width / 2;
    const cy = nb.top + nb.height / 2;

    const nx = clamp(
      cx + (Math.random() > 0.5 ? 1 : -1) * (60 + Math.random() * 60),
      area.left + 26,
      area.right - 26
    );
    const ny = clamp(
      cy + (Math.random() > 0.5 ? 1 : -1) * (26 + Math.random() * 40),
      area.top + 26,
      area.bottom - 26
    );

    setNoPositionWithinArea(nx, ny);
  }

  const bubbleMessages = [
    "Kenapa Pilih No, BJIR 😭",
    "Are you sure? YTTA?",
    "Trauma sama Master Data? 😤",
    "That hurts…",
    "Parah sih 😵‍💫",
    "Ga Cair ya? 😇",
    "SECE was kinda fun tho 👀",
  ];

  // ===== NO Troll Effects Pool (10+) =====
  const effects = [
    () => moveRandomWithinViewportSafe(),
    () => teleportTopThenBack(),
    () => tempShrink(),
    () => tempFadeGray(),
    () => wiggleNo(),
    () => screenShake(),
    () => spawnGhost(),
    () => showBubbleNearNo(bubbleMessages[Math.floor(Math.random() * bubbleMessages.length)]),
    () => tempSwapNoLabel(),
    (evt) => {
      const p = getPointer(evt);
      slipAwayFromPointer(p.x, p.y);
    },
    () => nudgeAway(),
    () => jumpToTopEdge(),
  ];

  function runRandomNoEffect(evt) {
    if (isCelebrating) return;

    noAttempts += 1;
    noCountEl.textContent = String(noAttempts);

    const biasMove = (noAttempts % 3 === 0);
    if (biasMove && Math.random() < 0.65) {
      const movers = [0, 1, 9, 10, 11];
      const mi = movers[Math.floor(Math.random() * movers.length)];
      effects[mi](evt);
      return;
    }

    const idx = Math.floor(Math.random() * effects.length);
    effects[idx](evt);
  }

  function onNoInteract(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    runRandomNoEffect(evt);
  }

  // Attach NO handlers
  noBtn.addEventListener("mouseenter", onNoInteract, { passive: false });
  noBtn.addEventListener("click", onNoInteract, { passive: false });
  noBtn.addEventListener("touchstart", onNoInteract, { passive: false });

  // Initial NO placement
  function initialNoPlacement() {
    const area = getAreaRect();
    const start = { x: area.left + area.width * 0.72, y: area.top + area.height * 0.56 };
    setNoPositionWithinArea(start.x, start.y);
  }

  // ===== Music: Fade-in + Mute =====
  let fadeTimer = null;

  function fadeInAudio(audioEl, targetVolume = 0.6, durationMs = 1800) {
    if (!audioEl) return;

    if (fadeTimer) {
      clearInterval(fadeTimer);
      fadeTimer = null;
    }

    audioEl.volume = 0;
    const steps = 30;
    const stepTime = Math.max(30, Math.floor(durationMs / steps));
    const delta = targetVolume / steps;
    let v = 0;

    fadeTimer = setInterval(() => {
      v = Math.min(targetVolume, v + delta);
      audioEl.volume = v;

      if (v >= targetVolume) {
        clearInterval(fadeTimer);
        fadeTimer = null;
      }
    }, stepTime);
  }

  function updateMuteUI() {
    if (!muteBtn || !bgMusic) return;
    const isMuted = bgMusic.muted;
    muteBtn.setAttribute("aria-pressed", String(isMuted));
    muteBtn.textContent = isMuted ? "🔇 Sound: OFF" : "🔊 Sound: ON";
  }

  if (muteBtn && bgMusic) {
    muteBtn.addEventListener("click", () => {
      bgMusic.muted = !bgMusic.muted;

      // If turning ON, ensure it's playing and bring volume back nicely
      if (!bgMusic.muted) {
        bgMusic.play()
          .then(() => {
            if (bgMusic.volume === 0) fadeInAudio(bgMusic, 0.6, 1200);
          })
          .catch(() => {});
      }

      updateMuteUI();
    });

    updateMuteUI();
  }

  // ===== YES Behavior =====
  yesBtn.addEventListener("click", () => {
    if (isCelebrating) return;
    isCelebrating = true;

    mainScreen.classList.add("hidden");
    yesScreen.classList.remove("hidden");

    // Start music on user interaction (YES click) + fade-in
    if (bgMusic) {
      bgMusic.muted = false;
      bgMusic.currentTime = 0;
      bgMusic.volume = 0;

      bgMusic.play()
        .then(() => fadeInAudio(bgMusic, 0.6, 1800))
        .catch(() => console.log("Audio play blocked"));
    }
    updateMuteUI();

    applyImageFallbacks();
    startFireworks();
    spawnHeartsFor(4500);
  });

  // ===== Buttons on YES screen =====
  if (againBtn) {
    againBtn.addEventListener("click", () => resetAll());
  }

  if (claimBtn) {
    claimBtn.addEventListener("click", () => {
      const msg = "Screenshot time 📸 (and DM your manager (Bowo) for the Corkcicle 😄)";
      quickCenterToast(msg);
    });
  }

  function resetAll() {
    stopFireworks();
    clearHearts();

    isCelebrating = false;
    noAttempts = 0;
    noCountEl.textContent = "0";

    yesScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");

    noBtn.textContent = "NO ❌";
    noBtn.classList.remove("fade-gray", "shrink", "wiggle");

    // stop music on reset
    if (bgMusic) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      bgMusic.volume = 0;
      bgMusic.muted = false;
    }
    if (fadeTimer) {
      clearInterval(fadeTimer);
      fadeTimer = null;
    }
    updateMuteUI();

    initialNoPlacement();
  }

  // ===== Image fallbacks =====
  function applyImageFallbacks() {
    const imgs = yesScreen.querySelectorAll("img[data-fallback]");
    imgs.forEach(img => {
      img.onerror = () => {
        const name = img.getAttribute("data-fallback") || "Friend";
        const wrap = img.closest(".person");
        if (!wrap) return;

        img.remove();

        const fallback = document.createElement("div");
        fallback.className = "fallback-card";
        fallback.textContent = name;

        wrap.insertBefore(fallback, wrap.firstChild);
      };
    });
  }

  // ===== Small toast =====
  function quickCenterToast(text) {
  const toast = document.createElement("div");
  toast.className = "bubble";
  toast.textContent = text;

  // Make it visible on ANY screen (main/yes)
  toast.style.position = "fixed";
  toast.style.left = "50%";
  toast.style.top = "62%";
  toast.style.transform = "translate(-50%, -50%)";
  toast.style.maxWidth = "min(360px, 88vw)";
  toast.style.textAlign = "center";
  toast.style.zIndex = "9999";

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 950);
}


  // ===== Falling hearts =====
  let heartTimers = [];
  function spawnHeartsFor(durationMs = 4000) {
    const emojis = ["❤️", "💖", "💘"];
    const start = Date.now();

    function spawn() {
      if (!isCelebrating) return;
      const now = Date.now();
      if (now - start > durationMs) return;

      const heart = document.createElement("div");
      heart.className = "heart";
      heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];

      const x = Math.random() * window.innerWidth;
      heart.style.left = `${x}px`;

      const fallTime = 2.6 + Math.random() * 1.8;
      heart.style.animationDuration = `${fallTime}s`;

      const size = 16 + Math.random() * 14;
      heart.style.fontSize = `${size}px`;

      document.body.appendChild(heart);
      const rm = setTimeout(() => heart.remove(), (fallTime + 0.2) * 1000);
      heartTimers.push(rm);

      const next = 90 + Math.random() * 120;
      const t = setTimeout(spawn, next);
      heartTimers.push(t);
    }

    spawn();
  }

  function clearHearts() {
    heartTimers.forEach(t => clearTimeout(t));
    heartTimers = [];
    document.querySelectorAll(".heart").forEach(h => h.remove());
  }

  // ===== Fireworks (canvas) =====
  const ctx = fxCanvas.getContext("2d");
  let rafId = null;
  let particles = [];
  let lastBurst = 0;

  function resizeCanvas() {
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    fxCanvas.width = Math.floor(window.innerWidth * dpr);
    fxCanvas.height = Math.floor(window.innerHeight * dpr);
    fxCanvas.style.width = "100%";
    fxCanvas.style.height = "100%";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function startFireworks() {
    fxCanvas.style.display = "block";
    resizeCanvas();
    particles = [];
    lastBurst = 0;
    tick();
  }

  function stopFireworks() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    particles = [];
    ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    fxCanvas.style.display = "none";
  }

  function burst(x, y) {
    const count = 46 + Math.floor(Math.random() * 22);
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 1.4 + Math.random() * 3.2;
      particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 60 + Math.random() * 30,
        age: 0,
        size: 1.2 + Math.random() * 1.8,
        hue: Math.floor(Math.random() * 360),
      });
    }
  }

  function tick() {
    rafId = requestAnimationFrame(tick);

    ctx.fillStyle = "rgba(255,255,255,0.14)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

    const now = performance.now();
    if (now - lastBurst > 420) {
      lastBurst = now;
      const x = window.innerWidth * (0.2 + Math.random() * 0.6);
      const y = window.innerHeight * (0.18 + Math.random() * 0.35);
      burst(x, y);
    }

    const gravity = 0.035;
    particles = particles.filter(p => p.age < p.life);

    for (const p of particles) {
      p.age += 1;
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.985;

      const t = 1 - p.age / p.life;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 92%, 60%, ${Math.max(0, t)})`;
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ===== Init =====
  initialNoPlacement();
  resizeCanvas();

  window.addEventListener("resize", () => {
    if (!isCelebrating) initialNoPlacement();
    resizeCanvas();
  });
  if (farewellCard) {
  farewellCard.addEventListener("click", () => {
    farewellCard.classList.toggle("flipped");
  });
}
})();
