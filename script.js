/* =========================================================
   KHAI NGUYEN — PORTFOLIO SCRIPT
   Sections:
   1. Navigation (mobile toggle, active link, sticky shrink)
   2. Scroll-reveal animations
   3. Canvas demos (hero dungeon + project previews)
   ========================================================= */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -----------------------------------------------------------
   1. Navigation
----------------------------------------------------------- */
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  links.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Highlight the active section link on scroll
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const navLinkFor = (id) => document.querySelector(`.nav-link[href="#${id}"]`);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = navLinkFor(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          document.querySelectorAll('.nav-link').forEach((l) => l.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
  );
  sections.forEach((s) => observer.observe(s));
})();

/* -----------------------------------------------------------
   2. Scroll reveal
----------------------------------------------------------- */
(function initReveal() {
  const targets = document.querySelectorAll(
    '.project, .skill-group, .edu-card, .coursework, .about-text, .contact-links'
  );
  targets.forEach((el) => el.classList.add('reveal'));

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  targets.forEach((el) => io.observe(el));
})();

/* -----------------------------------------------------------
   3. Canvas demos
----------------------------------------------------------- */

/* ---- 3a. Hero: procedural dungeon + BFS solve --------------
   A lightweight re-creation of Emberdeep's core loop: carve a
   maze on a grid, then visually run a breadth-first search
   from entrance to exit, exactly like the level validator does
   before a real level is ever shown to a player.                */
(function heroDungeon() {
  const canvas = document.getElementById('dungeonCanvas');
  const statusEl = document.getElementById('dungeonStatus');
  const seedEl = document.getElementById('dungeonSeed');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLS = 18;
  const ROWS = 18;
  let cell = canvas.width / COLS;

  function resize() {
    const size = canvas.clientWidth || canvas.width;
    canvas.width = size;
    canvas.height = size;
    cell = canvas.width / COLS;
  }

  function makeGrid() {
    const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1)); // 1 = wall
    function carve(x, y) {
      grid[y][x] = 0;
      const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);
      for (const [dx, dy] of dirs) {
        const nx = x + dx, ny = y + dy;
        if (ny > 0 && ny < ROWS - 1 && nx > 0 && nx < COLS - 1 && grid[ny][nx] === 1) {
          grid[y + dy / 2][x + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    }
    carve(1, 1);
    return grid;
  }

  function bfsPath(grid, start, end) {
    const key = (p) => `${p[0]},${p[1]}`;
    const queue = [start];
    const visitedOrder = [start];
    const cameFrom = new Map();
    const seen = new Set([key(start)]);
    while (queue.length) {
      const [x, y] = queue.shift();
      if (x === end[0] && y === end[1]) break;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
        if (grid[ny][nx] === 1) continue;
        const k = key([nx, ny]);
        if (seen.has(k)) continue;
        seen.add(k);
        cameFrom.set(k, [x, y]);
        visitedOrder.push([nx, ny]);
        queue.push([nx, ny]);
      }
    }
    const path = [];
    let cur = end;
    while (cameFrom.has(key(cur))) {
      path.push(cur);
      cur = cameFrom.get(key(cur));
    }
    path.push(start);
    path.reverse();
    return { visitedOrder, path };
  }

  const colors = {
    wall: getCss('--line-soft'),
    floor: getCss('--bg-1'),
    visited: 'rgba(98, 195, 214, 0.14)',
    path: getCss('--amber'),
    start: getCss('--ink'),
    end: getCss('--amber'),
  };

  function getCss(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }

  function drawStatic(grid, visitedCount, pathSet, start, end) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        ctx.fillStyle = grid[y][x] === 1 ? colors.wall : colors.floor;
        ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
      }
    }
  }

  let frame = 0;
  let anim;
  function run() {
    resize();
    const grid = makeGrid();
    const start = [1, 1];
    const end = [COLS - 2, ROWS - 2];
    grid[end[1]][end[0]] = 0;
    const { visitedOrder, path } = bfsPath(grid, start, end);
    const pathSet = new Set(path.map((p) => `${p[0]},${p[1]}`));

    if (seedEl) seedEl.textContent = `seed ${Math.floor(Math.random() * 9000 + 1000)}`;
    if (statusEl) statusEl.textContent = 'generating\u2026';

    cancelAnimationFrame(anim);
    let i = 0;
    const step = prefersReducedMotion ? visitedOrder.length : 3;

    function tick() {
      drawStatic(grid);
      const shown = Math.min(i, visitedOrder.length);
      for (let j = 0; j < shown; j++) {
        const [x, y] = visitedOrder[j];
        ctx.fillStyle = colors.visited;
        ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
      }
      if (shown >= visitedOrder.length) {
        path.forEach(([x, y]) => {
          ctx.fillStyle = colors.path;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
          ctx.globalAlpha = 1;
        });
        ctx.fillStyle = colors.start;
        ctx.fillRect(start[0] * cell, start[1] * cell, cell - 1, cell - 1);
        ctx.fillStyle = colors.end;
        ctx.fillRect(end[0] * cell, end[1] * cell, cell - 1, cell - 1);
        if (statusEl) statusEl.textContent = `solved \u2014 ${path.length} steps`;
        if (!prefersReducedMotion) {
          anim = setTimeout(run, 3200);
        }
        return;
      }
      i += step;
      anim = requestAnimationFrame(tick);
    }
    tick();
  }

  run();
  window.addEventListener('resize', () => {
    clearTimeout(window.__dungeonResizeT);
    window.__dungeonResizeT = setTimeout(run, 250);
  });
})();

/* ---- 3b. Emberdeep large preview: ambient torch-lit tiles ---- */
(function emberdeepPreview() {
  const canvas = document.getElementById('emberdeepCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const cell = 34;
  let cols, rows, grid;

  function buildGrid() {
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    cols = Math.ceil(w / cell) + 1;
    rows = Math.ceil(h / cell) + 1;
    grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.random() > 0.74 ? 1 : 0));
  }
  buildGrid();

  const torches = Array.from({ length: 4 }, () => ({
    x: Math.random(),
    y: Math.random(),
    phase: Math.random() * Math.PI * 2,
  }));

  let t = 0;
  function draw() {
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#0a0e13';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (grid[y][x] === 1) {
          ctx.fillStyle = 'rgba(37, 49, 64, 0.55)';
          ctx.fillRect(x * cell, y * cell, cell - 2, cell - 2);
        }
      }
    }

    if (!prefersReducedMotion) t += 0.015;
    torches.forEach((torch, idx) => {
      const flicker = 0.5 + 0.5 * Math.sin(t * 2 + torch.phase) * 0.4 + 0.3;
      const cx = torch.x * w;
      const cy = torch.y * h;
      const r = 130 + 20 * Math.sin(t * 1.3 + idx);
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(229, 164, 69, ${0.16 * flicker})`);
      grad.addColorStop(0.5, `rgba(98, 195, 214, ${0.07 * flicker})`);
      grad.addColorStop(1, 'rgba(10,14,19,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });

    // subtle grid lines
    ctx.strokeStyle = 'rgba(98,195,214,0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= cols; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cell, 0);
      ctx.lineTo(x * cell, h);
      ctx.stroke();
    }
    for (let y = 0; y <= rows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cell);
      ctx.lineTo(w, y * cell);
      ctx.stroke();
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---- 3c. Cube timer preview: ticking millisecond readout ---- */
(function timerPreview() {
  const canvas = document.getElementById('timerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let elapsed = 8.42;
  const bars = Array.from({ length: 5 }, (_, i) => 6 + Math.sin(i) * 3 + i);

  function draw() {
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0e13';
    ctx.fillRect(0, 0, w, h);

    if (!prefersReducedMotion) elapsed += 0.031;
    if (elapsed > 12) elapsed = 0.1;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#62c3d6';
    ctx.font = '600 34px "JetBrains Mono", monospace';
    ctx.fillText(elapsed.toFixed(2), w / 2, h / 2 - 6);

    ctx.fillStyle = '#6c7a88';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.fillText('ao5  9.87   ao12  10.42', w / 2, h / 2 + 26);

    // mini bar chart of recent solves
    const baseY = h - 22;
    const barW = 10;
    const gap = 6;
    const totalW = bars.length * barW + (bars.length - 1) * gap;
    let x = w / 2 - totalW / 2;
    bars.forEach((b, i) => {
      const height = 10 + (Math.sin(elapsed + i) * 0.5 + 0.5) * 14;
      ctx.fillStyle = i === bars.length - 1 ? '#e5a445' : 'rgba(98,195,214,0.35)';
      ctx.fillRect(x, baseY - height, barW, height);
      x += barW + gap;
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ---- 3d. Reaction game preview: pulsing target + go/wait state --- */
(function reactionPreview() {
  const canvas = document.getElementById('reactionCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  let state = 'wait'; // 'wait' -> 'go'
  let timer = 0;
  let switchAt = 90;

  function draw() {
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0e13';
    ctx.fillRect(0, 0, w, h);

    if (!prefersReducedMotion) timer++;
    if (timer > switchAt) {
      state = state === 'wait' ? 'go' : 'wait';
      timer = 0;
      switchAt = state === 'go' ? 40 : 70 + Math.random() * 50;
    }

    const cx = w / 2, cy = h / 2 - 6;
    const pulse = state === 'go' ? 1 + Math.sin(timer * 0.35) * 0.08 : 1;
    const radius = 26 * pulse;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 2.2);
    const color = state === 'go' ? '229, 164, 69' : '98, 195, 214';
    grad.addColorStop(0, `rgba(${color}, 0.5)`);
    grad.addColorStop(1, `rgba(${color}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = state === 'go' ? '#e5a445' : '#62c3d6';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#6c7a88';
    ctx.font = '500 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state === 'go' ? 'CLICK NOW' : 'wait for it\u2026', cx, h - 18);

    requestAnimationFrame(draw);
  }
  draw();
})();
