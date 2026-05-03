/* ui.js — Dark Universe UI Layer
   All DOM manipulation, combat screen rendering,
   Ritual of Chüd mini-game, stat updates
   ============================================== */

const UI = (() => {

  // ── STAT UPDATES ──
  function updateStats() {
    const s = Engine.state;
    const safe = (id, val) => { const el = document.getElementById(id); if (el) el.style.width = val; };
    const txt  = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    // Main topbar
    safe('hp-fill',   (s.hp   / s.maxHp)   * 100 + '%');
    safe('san-fill',  (s.sanity / s.maxSanity) * 100 + '%');
    safe('fear-fill', (s.fear / s.maxFear) * 100 + '%');
    txt('hp-val',    s.hp + '/' + s.maxHp);
    txt('san-val',   s.sanity + '/' + s.maxSanity);
    txt('fear-val',  s.fear + '/100');

    // Pulse on danger
    const hpBar  = document.getElementById('hp-bar');
    const sanBar = document.getElementById('san-bar');
    if (hpBar)  hpBar.classList.toggle('pulse-low', s.hp <= 25);
    if (sanBar) sanBar.classList.toggle('pulse-low', s.sanity <= 20);

    // Combat status panel
    const ph = document.getElementById('p-hp-fill');
    const ps = document.getElementById('p-san-fill');
    const pf = document.getElementById('p-fear-fill');
    if (ph) ph.style.width = (s.hp / s.maxHp * 100) + '%';
    if (ps) ps.style.width = (s.sanity / s.maxSanity * 100) + '%';
    if (pf) pf.style.width = (s.fear / s.maxFear * 100) + '%';

    const phRow = document.getElementById('p-hp-row');
    const pfRow = document.getElementById('p-fear-row');
    if (phRow)  phRow.classList.toggle('pulse-danger', s.hp <= 25);
    if (pfRow)  pfRow.classList.toggle('fear-high', s.fear >= 70);

    txt('p-hp-val',   s.hp + '/' + s.maxHp);
    txt('p-san-val',  s.sanity + '/' + s.maxSanity);
    txt('p-fear-val', s.fear);
  }

  function updateMemoryTokens() {
    const s = Engine.state;
    // Topbar tokens
    const wrap = document.getElementById('topbar-memory');
    if (wrap) {
      wrap.innerHTML = '';
      for (let i = 0; i < s.maxTokens; i++) {
        const dot = document.createElement('div');
        dot.className = 'topbar-token' + (i >= s.memoryTokens ? ' spent' : '');
        wrap.appendChild(dot);
      }
    }
    // Combat tokens
    const ct = document.getElementById('memory-tokens');
    if (ct) {
      ct.innerHTML = '';
      for (let i = 0; i < s.maxTokens; i++) {
        const dot = document.createElement('div');
        dot.className = 'mem-token' + (i >= s.memoryTokens ? ' spent' : '');
        wrap.appendChild(dot);
        ct.appendChild(dot.cloneNode());
      }
    }
  }

  function updateInventory() {
    const list = document.getElementById('inventory-list');
    if (!list) return;
    const inv = Engine.state.inventory;
    if (!inv.length) { list.innerHTML = '<div class="inv-empty">Empty pockets...</div>'; return; }
    const slingshotSVG = `<svg viewBox="0 0 90 65" width="28" height="20" style="display:inline-block;vertical-align:middle">
      <rect x="41" y="44" width="9" height="18" rx="4" fill="#5a3a18" stroke="#3a2008" stroke-width="1"/>
      <line x1="40" y1="49" x2="51" y2="49" stroke="#3a2008" stroke-width="1.2" opacity="0.5"/>
      <line x1="40" y1="54" x2="51" y2="54" stroke="#3a2008" stroke-width="1.2" opacity="0.5"/>
      <circle cx="45" cy="42" r="5" fill="#7a5a28" stroke="#4a3010" stroke-width="1.2"/>
      <path d="M45 42 Q30 32 14 10" stroke="#6a4a20" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M45 42 Q60 32 76 10" stroke="#6a4a20" stroke-width="5" fill="none" stroke-linecap="round"/>
      <circle cx="14" cy="10" r="3.5" fill="#7a5a28"/>
      <circle cx="76" cy="10" r="3.5" fill="#7a5a28"/>
      <path d="M14 10 Q24 30 38 37" stroke="#c8c0a0" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M76 10 Q66 30 52 37" stroke="#c8c0a0" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M36 37 Q45 42 54 37 Q50 44 45 45 Q40 44 36 37Z" fill="#8a6840"/>
      <circle cx="45" cy="39" r="4" fill="#d8d4c0" stroke="#a8a490" stroke-width="0.8"/>
    </svg>`;

    list.innerHTML = inv.map(i => {
      const icon = i.name === "Beverly's Slingshot"
        ? slingshotSVG
        : `<span class="inv-icon">${i.emoji}</span>`;
      return `
      <div class="inv-item" title="${i.desc || ''}">
        ${icon}
        <div>
          <span class="inv-name">${i.name}</span>
          <span class="inv-effect">${i.effect || ''}</span>
        </div>
      </div>`;
    }).join('');
    // Refresh weapon panel if combat is active
    if (document.getElementById('fps-weapon-panel')) refreshWeaponPanel();
  }

  function updateInventoryScreen() {
    const grid = document.getElementById('inv-grid');
    if (!grid) return;
    const inv = Engine.state.inventory;
    if (!inv.length) { grid.innerHTML = '<div class="inv-empty-full">Your pockets are empty.</div>'; return; }
    grid.innerHTML = inv.map(i => `
      <div class="inv-card">
        <span class="inv-card-icon">${i.emoji}</span>
        <div class="inv-card-name">${i.name}</div>
        <div class="inv-card-desc">${i.desc || ''}</div>
        <div class="inv-card-effect">${i.effect || ''}</div>
      </div>`).join('');
  }

  function updateMap() {
    const mapLayout = window.mapLayout || [];
    const grid = document.getElementById('map-grid');
    if (!grid) return;
    grid.innerHTML = '';
    mapLayout.forEach(node => {
      const cell = document.createElement('div');
      cell.className = 'map-cell';
      cell.innerHTML = node.emoji + `<span class="map-label">${node.label}</span>`;
      if (node.id === Engine.currentNode) cell.classList.add('current');
      if (Engine.hasVisited(node.id)) cell.classList.add('visited');
      if (node.unlock && !Engine.hasVisited(node.unlock)) cell.classList.add('locked');
      if (node.chapter && !Engine.isChapterUnlocked(node.chapter)) cell.classList.add('chapter-locked');
      grid.appendChild(cell);
    });
  }

  // ── STORY ──
  function addStoryBlock(type, text) {
    if (window.innerWidth < 700) {
      const t = document.getElementById('tab-story');
      if (t && !t.classList.contains('active')) mobileTab('story');
    }
    const scroll = document.getElementById('story-scroll');
    if (!scroll) return;
    const div = document.createElement('div');
    div.className = 'story-block ' + (type || 'normal');
    div.innerHTML = text;
    scroll.appendChild(div);
    const atBottom = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 80;
    if (atBottom) scroll.scrollTop = scroll.scrollHeight;
  }

  function addLocationHeader(location) {
    const scroll = document.getElementById('story-scroll');
    if (!scroll) return;
    scroll.innerHTML = '';
    const header = document.createElement('div');
    header.style.cssText = [
      'font-family:var(--font-display)',
      'font-size:9px',
      'letter-spacing:5px',
      'text-transform:uppercase',
      'color:var(--rust)',
      'opacity:0.65',
      'padding:4px 0 10px',
      'border-bottom:1px solid rgba(80,20,10,0.3)',
      'margin-bottom:10px'
    ].join(';');
    header.textContent = location || '';
    scroll.appendChild(header);
  }

  function addSeparator() {
    const scroll = document.getElementById('story-scroll');
    if (!scroll) return;
    const sep = document.createElement('div');
    sep.style.cssText = 'height:1px;background:linear-gradient(90deg,transparent,rgba(80,20,10,0.4),transparent);margin:8px 0;';
    scroll.appendChild(sep);
  }

  function showChoices(choices = []) {
    const pane = document.getElementById('choices-pane') || document.getElementById('choices');
    if (!pane) return;
    pane.innerHTML = '';
    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice.label || choice.text || 'Continue';
      btn.onclick = () => {
        if (typeof choice.onClick === 'function') {
          choice.onClick();
          return;
        }
        if (typeof choice.action === 'function') {
          choice.action();
          return;
        }
        if (typeof window.Game !== 'undefined' && typeof window.Game.handleChoice === 'function') {
          window.Game.handleChoice(choice);
          return;
        }
        if (choice.next && typeof window.goToNode === 'function') {
          window.goToNode(choice.next);
          return;
        }
        console.warn('[UI] Choice clicked but no handler was available', choice);
      };
      pane.appendChild(btn);
    });
  }

  function clearChoices() {
    const pane = document.getElementById('choices-pane') || document.getElementById('choices');
    if (pane) pane.innerHTML = '';
  }


  function addJournal(text) {
    const j = document.getElementById('journal-entries');
    if (j) { j.innerHTML += '— ' + text + '<br>'; j.scrollTop = j.scrollHeight; }
  }

  // ── COMBAT SCREEN ──
  function showCombatScreen(enemy) {
    const screen = document.getElementById('combat-screen');
    if (!screen) return;
    screen.classList.add('active');

    const bg = document.getElementById('scene-bg');
    if (bg) { bg.className = ''; bg.classList.add(enemy.bg || 'sewer'); }

    buildEnemyPortrait(enemy.portrait);
    buildFPSWeaponPanel(enemy);
    spawnSceneParticles(enemy.bg || 'sewer');
    updateEnemyName(enemy.name, enemy.subname, enemy.phaseLabel || '');
    updateEnemyHp(enemy.hp, enemy.maxHp);
    updateStats();
    updateMemoryTokens();

    const log = document.getElementById('combat-log');
    if (log) log.innerHTML = '';
  }

  function hideCombatScreen() {
    const screen = document.getElementById('combat-screen');
    if (screen) screen.classList.remove('active');
    const dial = document.getElementById('combat-dialogue');
    if (dial) dial.classList.remove('active');
    stopPortraitAnimation();
  }

  // ── CANVAS PORTRAIT SYSTEM ──
  let portraitAnimId = null;
  let portraitTime   = 0;
  let currentPortraitType = null;

  function stopPortraitAnimation() {
    if (portraitAnimId) { cancelAnimationFrame(portraitAnimId); portraitAnimId = null; }
  }

  function buildEnemyPortrait(type) {
    stopPortraitAnimation();
    currentPortraitType = type;
    const wrap = document.getElementById('enemy-portrait-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    if (type === 'pennywise' || type === 'spider') {
      buildPennywiseSVG(wrap, type);
    } else {
      // Canvas fallback for other enemies
      const canvas = document.createElement('canvas');
      canvas.id = 'enemy-canvas-el';
      const dpr = window.devicePixelRatio || 1;
      const W = wrap.clientWidth  || 300;
      const H = wrap.clientHeight || 400;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;';
      wrap.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      portraitTime = 0;
      function frame(ts) {
        portraitTime = ts * 0.001;
        ctx.clearRect(0, 0, W, H);
        if (type === 'jack') drawJack(ctx, W, H, portraitTime);
        portraitAnimId = requestAnimationFrame(frame);
      }
      portraitAnimId = requestAnimationFrame(frame);
    }
  }

  // ═══════════════════════════════════════════════════════
  // PENNYWISE PORTRAIT — PNG image + Canvas FX overlay
  // The PNG is the actual illustration; Canvas paints effects
  // on top: deadlight glow, blood drips, hit flash, atmosphere
  // ═══════════════════════════════════════════════════════

  let _pwImg = null;
  let _pwReady = false;




  function loadPennywiseImage() {
    if (_pwImg) return;
    _pwImg = new Image();
    _pwImg.onload  = () => { _pwReady = true; };
    _pwImg.onerror = () => { _pwReady = false; };
    _pwImg.src = 'assets/pennywise.jpg';
  }

  function buildPennywiseSVG(wrap, phase) {
    // ── SPRITE CANVAS (bottom layer — animated character) ──
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.id = 'pw-sprite-canvas';
    spriteCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
    wrap.appendChild(spriteCanvas);


    // ── FX CANVAS (top layer — blood drips, atmosphere, glow) ──
    const fxCanvas = document.createElement('canvas');
    fxCanvas.id = 'pw-fx-canvas';
    fxCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;';
    wrap.appendChild(fxCanvas);

    // Init sprite engine — drives the character animation
    if (typeof Sprite !== 'undefined' && Sprite && typeof Sprite.init === 'function') {
      Sprite.init(spriteCanvas);
      if (typeof Sprite.play === 'function') Sprite.play('idle');
    } else {
      loadPennywiseImage();
    }

    startPennywiseLoop(phase);
  }

  function startPennywiseLoop(phase) {
    const fxCanvas = document.getElementById('pw-fx-canvas');
    if (!fxCanvas) return;

    function frame(ts) {
      const t = ts * 0.001;
      portraitTime = t;
      const dpr = window.devicePixelRatio || 1;
      const W   = fxCanvas.offsetWidth;
      const H   = fxCanvas.offsetHeight;
      if (W < 1 || H < 1) { portraitAnimId = requestAnimationFrame(frame); return; }
      fxCanvas.width  = W * dpr;
      fxCanvas.height = H * dpr;
      const ctx = fxCanvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      // FX only — sprite engine handles character drawing
      drawPennywiseFX(ctx, W, H, t, phase);
      portraitAnimId = requestAnimationFrame(frame);
    }
    portraitAnimId = requestAnimationFrame(frame);
  }

  function drawPennywiseFX(ctx, W, H, t, phase) {
    // Fallback to painted portrait if sprite engine is unavailable
    if (!(typeof Sprite !== 'undefined' && Sprite && typeof Sprite.init === 'function')) {
      drawPennywisePortrait(ctx, W, H, t, phase);
      return;
    }

    const pulse = 0.12 + Math.abs(Math.sin(t * 1.35)) * 0.18;
    const glow = ctx.createRadialGradient(W * 0.5, H * 0.36, 0, W * 0.5, H * 0.36, Math.max(W, H) * 0.45);
    glow.addColorStop(0, `rgba(120,0,180,${pulse})`);
    glow.addColorStop(0.45, `rgba(200,40,40,${pulse * 0.5})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 8; i++) {
      const x = (W * 0.12 + i * W * 0.1 + Math.sin(t * 0.5 + i) * 18);
      const y = (H * 0.18 + i * H * 0.08 + Math.cos(t * 0.35 + i * 0.7) * 10);
      ctx.fillStyle = `rgba(255,255,255,${0.03 + (i % 3) * 0.01})`;
      ctx.beginPath();
      ctx.ellipse(x, y, 18 + i, 10 + i * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(120,0,0,0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const dx = W * (0.28 + i * 0.1);
      const length = 24 + Math.sin(t * 1.4 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(dx, H * 0.52 + i * 3);
      ctx.quadraticCurveTo(dx + Math.sin(t + i) * 4, H * 0.58 + length * 0.3, dx, H * 0.58 + length);
      ctx.stroke();
    }

    if (phase === 'spider') {
      const spiderGlow = ctx.createRadialGradient(W * 0.5, H * 0.55, 0, W * 0.5, H * 0.55, Math.max(W, H) * 0.35);
      spiderGlow.addColorStop(0, 'rgba(255,90,0,0.16)');
      spiderGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = spiderGlow;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawPennywisePortrait(ctx, W, H, t, phase) {
    const cx = W / 2;

    // ── SEWER BACKGROUND (always visible) ──
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0,   '#010204');
    bgGrad.addColorStop(0.5, '#030408');
    bgGrad.addColorStop(1,   '#020103');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Brick texture
    ctx.strokeStyle = 'rgba(8,5,3,0.5)';
    ctx.lineWidth = 0.8;
    for (let row = 0; row < 14; row++) {
      const y = row * (H / 14);
      const bW = 48 + row * 2;
      const off = (row % 2) * bW * 0.5;
      for (let col = -1; col < W / bW + 1; col++) {
        ctx.strokeRect(col * bW + off, y, bW - 2, H / 14 - 1);
      }
    }

    // Moisture streaks
    for (let s = 0; s < 5; s++) {
      const sx = W * (0.07 + s * 0.2);
      const sg = ctx.createLinearGradient(sx, 0, sx, H * 0.75);
      sg.addColorStop(0, 'rgba(4,10,5,0)');
      sg.addColorStop(0.5, 'rgba(4,10,5,0.1)');
      sg.addColorStop(1, 'rgba(4,10,5,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(sx - 1, 0, 2, H * 0.75);
    }

    // Sewer water
    const waterY = H * 0.86;
    const wg = ctx.createLinearGradient(0, waterY, 0, H);
    wg.addColorStop(0, 'rgba(3,10,4,0.95)');
    wg.addColorStop(1, 'rgba(1,5,2,1)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, waterY, W, H - waterY);
    ctx.strokeStyle = 'rgba(8,28,12,0.45)';
    ctx.lineWidth = 1;
    for (let r = 0; r < 4; r++) {
      const rx = W * (0.12 + r * 0.24) + Math.sin(t * 0.45 + r) * 10;
      ctx.beginPath();
      ctx.ellipse(rx, waterY + 5, 18 + r * 9, 3.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ── PENNYWISE IMAGE — object-fit:cover centered ──
    if (_pwReady && _pwImg) {
      const iW = _pwImg.naturalWidth  || 2000;
      const iH = _pwImg.naturalHeight || 1240;

      // Source crop: center 68% width, full height — cuts side bg, keeps face+hair
      const cropX = iW * 0.16;
      const cropY = 0;
      const cropW = iW * 0.68;
      const cropH = iH;

      // Cover-fit: scale so image fills canvas, centered
      const scaleX = W / cropW;
      const scaleY = H / cropH;
      const scale  = Math.max(scaleX, scaleY);   // cover — never letterbox
      const destW  = cropW * scale;
      const destH  = cropH * scale;
      // Center horizontally, anchor slightly toward top (face is upper 70%)
      const destX  = (W - destW) / 2;
      const destY  = (H - destH) * 0.25;  // 25% down from top = slight upward bias

      ctx.save();
      ctx.drawImage(_pwImg, cropX, cropY, cropW, cropH, destX, destY, destW, destH);

      // Edge vignettes — blend into sewer walls
      const lvig = ctx.createLinearGradient(0, 0, W * 0.18, 0);
      lvig.addColorStop(0, 'rgba(1,0,3,0.8)');
      lvig.addColorStop(1, 'transparent');
      ctx.fillStyle = lvig; ctx.fillRect(0, 0, W, H);

      const rvig = ctx.createLinearGradient(W * 0.82, 0, W, 0);
      rvig.addColorStop(0, 'transparent');
      rvig.addColorStop(1, 'rgba(1,0,3,0.8)');
      ctx.fillStyle = rvig; ctx.fillRect(0, 0, W, H);

      // Bottom fade — dissolves feet into sewer floor
      const bfade = ctx.createLinearGradient(0, H * 0.7, 0, H);
      bfade.addColorStop(0, 'transparent');
      bfade.addColorStop(1, 'rgba(1,0,3,0.98)');
      ctx.fillStyle = bfade; ctx.fillRect(0, 0, W, H);

      // Top fade — hair bleeds into top darkness
      const tfade = ctx.createLinearGradient(0, 0, 0, H * 0.06);
      tfade.addColorStop(0, 'rgba(1,0,3,0.7)');
      tfade.addColorStop(1, 'transparent');
      ctx.fillStyle = tfade; ctx.fillRect(0, 0, W, H);

      // Atmosphere overlay
      ctx.fillStyle = 'rgba(2,3,4,0.12)';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    } else {
      // Loading placeholder
      const fbG = ctx.createRadialGradient(cx, H * 0.38, 0, cx, H * 0.38, W * 0.5);
      fbG.addColorStop(0, `rgba(60,0,0,${0.3 + Math.abs(Math.sin(t)) * 0.2})`);
      fbG.addColorStop(1, 'transparent');
      ctx.fillStyle = fbG;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(139,0,0,0.5)';
      ctx.font = `${Math.floor(H * 0.04)}px "Special Elite",serif`;
      ctx.textAlign = 'center';
      ctx.fillText('IT IS COMING...', cx, H * 0.45);
    }

    // ── DEADLIGHT EYE GLOW ──
    // Eye positions in the cropped+scaled image
    // In the 2000x1240 source: eyes are at approx x=780,880 (left/right) y=430
    // After crop (startX=360, cropW=1280): eyeL_x=(780-360)/1280=0.328, eyeR_x=(880-360)/1280=0.406
    // After our new crop (cropX=iW*0.18=360, cropW=iW*0.64=1280)
    const eyeLX = W * 0.34;
    const eyeRX = W * 0.52;
    const eyeY  = H * 0.30;

    const glowPulse = 0.5 + Math.abs(Math.sin(t * 1.8)) * 0.5;
    [eyeLX, eyeRX].forEach(ex => {
      const g = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, W * 0.22);
      g.addColorStop(0,   `rgba(255,200,20,${glowPulse * 0.55})`);
      g.addColorStop(0.2, `rgba(255,120,0,${glowPulse * 0.28})`);
      g.addColorStop(0.5, `rgba(180,50,0,${glowPulse * 0.08})`);
      g.addColorStop(1,   'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });

    // Deadlight flare
    const flare = Math.sin(t * 0.5);
    if (flare > 0.65) {
      const fa = (flare - 0.65) * 2.8;
      [eyeLX, eyeRX].forEach(ex => {
        const fg = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, W * 0.55);
        fg.addColorStop(0,   `rgba(255,220,80,${fa * 0.42})`);
        fg.addColorStop(0.3, `rgba(255,130,0,${fa * 0.16})`);
        fg.addColorStop(1,   'transparent');
        ctx.fillStyle = fg;
        ctx.fillRect(0, 0, W, H);
      });
      if (fa > 0.65) {
        ctx.fillStyle = `rgba(70,20,0,${(fa - 0.65) * 0.22})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    // ── BLOOD DRIPS from top ──
    [
      {x:0.04,s:0.27,p:0.0,w:2.2},
      {x:0.19,s:0.21,p:1.7,w:1.6},
      {x:0.54,s:0.30,p:1.0,w:2.6},
      {x:0.76,s:0.24,p:2.4,w:1.4},
      {x:0.93,s:0.34,p:1.3,w:2.0},
    ].forEach(({x,s,p,w}) => {
      const dx = W * x;
      const dh = 8 + Math.abs(Math.sin(t * s + p)) * 34;
      ctx.fillStyle = 'rgba(110,0,0,0.68)';
      ctx.fillRect(dx - w/2, 0, w, dh);
      ctx.beginPath();
      ctx.ellipse(dx, dh + 4, w * 1.9, w * 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // ── FLOATING BALLOON (outside image, canvas-drawn) ──
    const bx = W * 0.88 + Math.sin(t * 0.55) * 5;
    const by = H * 0.07  + Math.sin(t * 0.7)  * 10;
    ctx.strokeStyle = 'rgba(120,10,10,0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx, by + 38);
    ctx.quadraticCurveTo(bx + Math.sin(t * 0.8) * 10, by + 65, bx + 8, by + 95);
    ctx.stroke();
    const bGrad = ctx.createRadialGradient(bx - 7, by - 8, 2, bx, by, 22);
    bGrad.addColorStop(0,   '#ff4040');
    bGrad.addColorStop(0.5, '#cc0000');
    bGrad.addColorStop(1,   '#3a0000');
    ctx.fillStyle = bGrad;
    ctx.beginPath();
    ctx.ellipse(bx, by, 18, 24, -0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,130,130,0.2)';
    ctx.beginPath();
    ctx.ellipse(bx - 6, by - 8, 6, 9, -0.25, 0, Math.PI * 2);
    ctx.fill();

    // Final vignette
    const vig = ctx.createRadialGradient(cx, H * 0.42, W * 0.1, cx, H * 0.5, W * 0.82);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(0.65, 'rgba(1,0,3,0.06)');
    vig.addColorStop(1, 'rgba(0,0,2,0.52)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  // Hit flash — white out then back
  function enemyHitSVG() {
    if (typeof Sprite !== 'undefined' && Sprite.getState().ready) {
      Sprite.triggerHit();
    } else {
      const c = document.getElementById('pw-sprite-canvas') || document.getElementById('pw-fx-canvas');
      if (c) { c.style.filter='brightness(4) saturate(0)'; setTimeout(()=>{ c.style.filter=''; },300); }
    }
  }

  function animatePennywiseSVG() {}  // no-op — animation is all canvas now

  function buildSpiderSVGInline() {
    return `
    <defs>
      <radialGradient id="spiderBodyGrad" cx="40%" cy="35%" r="60%">
        <stop offset="0%"   stop-color="#3a1808"/>
        <stop offset="60%"  stop-color="#150808"/>
        <stop offset="100%" stop-color="#050202"/>
      </radialGradient>
    </defs>
    <g id="pw-body-group">
      <!-- Spider legs -->
      ${[-1,1].map(side=>
        [0,1,2,3].map(i=>`
          <path d="M200,340 Q${200+side*(55+i*20)},${310+i*18}
            ${200+side*(120+i*25)},${300+i*40}"
            stroke="#140a05" stroke-width="${7-i}" fill="none" stroke-linecap="round"/>
        `).join('')
      ).join('')}
      <!-- Body -->
      <ellipse cx="200" cy="360" rx="75" ry="62" fill="url(#spiderBodyGrad)"/>
      <!-- Clown face on body -->
      <ellipse id="pw-head-group" cx="200" cy="340" rx="35" ry="32" fill="#d0c8b8"/>
      <circle id="pw-eye-glow-l" cx="188" cy="332" r="12" fill="#ffaa00" opacity="0.7"/>
      <circle id="pw-eye-glow-r" cx="212" cy="332" r="12" fill="#ffaa00" opacity="0.7"/>
      <circle id="pw-iris-l" cx="188" cy="332" r="7" fill="#dd6600"/>
      <circle id="pw-iris-r" cx="212" cy="332" r="7" fill="#dd6600"/>
      <circle id="pw-pupil-l" cx="188" cy="332" r="3" fill="#080308"/>
      <circle id="pw-pupil-r" cx="212" cy="332" r="3" fill="#080308"/>
      <ellipse cx="188" cy="332" r="2" fill="#100810" opacity="0"/>
      <ellipse cx="212" cy="332" r="2" fill="#100810" opacity="0"/>
      <ellipse id="pw-lid-l" cx="188" cy="331" rx="8" ry="7" fill="#b8a898" opacity="0"/>
      <ellipse id="pw-lid-r" cx="212" cy="331" rx="8" ry="7" fill="#b8a898" opacity="0"/>
      <!-- Spider mouth -->
      <path id="pw-mouth-open" d="M185,350 Q200,362 215,350 Q200,345 185,350Z" fill="#080003"/>
      <g id="pw-jaw"></g>
      <!-- Deadlight glow halos for spider -->
      <ellipse id="pw-eye-glow-l" cx="188" cy="332" rx="22" ry="18" fill="#ffaa00" opacity="0.5"/>
      <ellipse id="pw-eye-glow-r" cx="212" cy="332" rx="22" ry="18" fill="#ffaa00" opacity="0.5"/>
    </g>
    <g id="pw-hair-l"/><g id="pw-hair-r"/>
    <g id="pw-arm-l"/><g id="pw-arm-r"/>
    <g id="pw-balloon-group"/>
    `;
  }
  function drawSpider(ctx, W, H, t) {
    const cx = W / 2;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#020305');
    bg.addColorStop(1, '#040208');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Web strands from corners
    ctx.strokeStyle = 'rgba(60,40,80,0.35)';
    ctx.lineWidth = 0.8;
    [[0,0],[W,0],[0,H],[W,H]].forEach(([ox,oy]) => {
      for (let a = 0; a < 5; a++) {
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(cx + Math.cos(a) * 80, H/2 + Math.sin(a) * 60);
        ctx.stroke();
      }
    });

    const bodyY = H * 0.55 + Math.sin(t * 0.8) * 8;

    // ── LEGS — 8 of them, chittering ──
    ctx.strokeStyle = '#150a08';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) {
      const side = i < 2 ? -1 : 1;
      const legIdx = i % 2;
      const angle1 = (0.3 + legIdx * 0.35) * side;
      const angle2 = (0.8 + legIdx * 0.2) * side;
      const legWave = Math.sin(t * 2.5 + i * 0.7) * 0.12;
      const lx1 = cx + Math.cos(angle1 + legWave) * 55;
      const ly1 = bodyY + Math.sin(angle1 + legWave) * 20;
      const lx2 = cx + Math.cos(angle2 + legWave) * 130;
      const ly2 = bodyY + Math.sin(angle2 + legWave) * 60 + 20;
      ctx.beginPath();
      ctx.moveTo(cx + side * 40, bodyY);
      ctx.quadraticCurveTo(lx1, ly1, lx2, ly2);
      ctx.stroke();
      // Claw tips
      ctx.strokeStyle = '#2a1508';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lx2, ly2);
      ctx.lineTo(lx2 + side * 10, ly2 + 8);
      ctx.stroke();
      ctx.strokeStyle = '#150a08';
      ctx.lineWidth = 6;
    }

    // Body
    const bodyGrad = ctx.createRadialGradient(cx - 10, bodyY - 15, 5, cx, bodyY, 55);
    bodyGrad.addColorStop(0, '#3a1808');
    bodyGrad.addColorStop(0.7, '#150808');
    bodyGrad.addColorStop(1, '#050202');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(cx, bodyY, 60, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clown face — small, wrong, in center of spider body
    const fx = cx, fy = bodyY - 5 + Math.sin(t * 1.1) * 4;
    ctx.fillStyle = '#d0c8b8';
    ctx.beginPath(); ctx.ellipse(fx, fy, 28, 26, 0, 0, Math.PI * 2); ctx.fill();
    // Orange eyes
    [[-10, -6],[10,-6]].forEach(([ex,ey]) => {
      ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.ellipse(fx+ex, fy+ey, 7, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(fx+ex, fy+ey, 3, 5, 0, 0, Math.PI * 2); ctx.fill();
    });
    // Mouth
    ctx.fillStyle = '#300';
    ctx.beginPath(); ctx.ellipse(fx, fy+12, 16, 8, 0, 0, Math.PI); ctx.fill();
    // Deadlight glow pulsing
    const glowPulse = 0.15 + Math.abs(Math.sin(t * 1.3)) * 0.25;
    const spiderGlow = ctx.createRadialGradient(cx, bodyY, 0, cx, bodyY, 120);
    spiderGlow.addColorStop(0, `rgba(120,0,180,${glowPulse})`);
    spiderGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = spiderGlow;
    ctx.fillRect(0, 0, W, H);
  }

  // ── JACK TORRANCE ──
  function drawJack(ctx, W, H, t) {
    const cx = W / 2;
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#040408');
    bg.addColorStop(1, '#08040a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Overlook wallpaper suggestion — geometric
    ctx.strokeStyle = 'rgba(30,20,10,0.5)';
    ctx.lineWidth = 0.5;
    for (let y = 0; y < H; y += 24) {
      for (let x = 0; x < W; x += 24) {
        ctx.strokeRect(x + 2, y + 2, 20, 20);
      }
    }

    const bodyY = H - 40 + Math.sin(t * 0.4) * 3;
    const headTilt = Math.sin(t * 0.5) * 0.12;

    // Body — flannel
    const bodyGrad = ctx.createLinearGradient(cx - 55, 0, cx + 55, 0);
    bodyGrad.addColorStop(0, '#1a0a04');
    bodyGrad.addColorStop(0.3, '#3a1808');
    bodyGrad.addColorStop(0.7, '#301408');
    bodyGrad.addColorStop(1, '#1a0a04');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 55, bodyY);
    ctx.lineTo(cx - 45, H);
    ctx.lineTo(cx + 45, H);
    ctx.lineTo(cx + 55, bodyY);
    ctx.quadraticCurveTo(cx, bodyY - 10, cx - 55, bodyY);
    ctx.fill();

    // Arms — left raises with axe
    const axeAngle = -0.5 + Math.sin(t * 0.6) * 0.25;
    // Right arm (down)
    ctx.strokeStyle = '#2a1208';
    ctx.lineWidth = 22; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx + 52, bodyY + 10);
    ctx.quadraticCurveTo(cx + 80, bodyY + 50, cx + 70, bodyY + 100);
    ctx.stroke();
    // Left arm (raised with axe)
    ctx.beginPath();
    ctx.moveTo(cx - 52, bodyY + 10);
    ctx.quadraticCurveTo(cx - 90 + Math.cos(axeAngle) * 20, bodyY - 30 + Math.sin(axeAngle) * 30,
                         cx - 70 + Math.cos(axeAngle) * 50, bodyY - 80 + Math.sin(axeAngle) * 40);
    ctx.stroke();

    // ── AXE ──
    const ax = cx - 70 + Math.cos(axeAngle) * 50;
    const ay = bodyY - 100 + Math.sin(axeAngle) * 40;
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(axeAngle - 0.8);
    // Handle
    ctx.fillStyle = '#4a2808';
    ctx.fillRect(-5, -70, 10, 90);
    // Head
    const axeHeadGrad = ctx.createLinearGradient(-30, -80, 10, -60);
    axeHeadGrad.addColorStop(0, '#888880');
    axeHeadGrad.addColorStop(0.5, '#c8c8c0');
    axeHeadGrad.addColorStop(1, '#606058');
    ctx.fillStyle = axeHeadGrad;
    ctx.beginPath();
    ctx.moveTo(-5, -80);
    ctx.lineTo(-35, -90);
    ctx.lineTo(-40, -60);
    ctx.lineTo(-5, -55);
    ctx.closePath();
    ctx.fill();
    // Blood on blade
    ctx.fillStyle = 'rgba(120,0,0,0.6)';
    ctx.beginPath();
    ctx.moveTo(-5, -72);
    ctx.lineTo(-20, -78);
    ctx.lineTo(-22, -65);
    ctx.lineTo(-5, -62);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ── HEAD ──
    const headY = bodyY - 110 + Math.sin(t * 0.4) * 4;
    ctx.save(); ctx.translate(cx, headY); ctx.rotate(headTilt);
    // Head shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath(); ctx.ellipse(3, 4, 48, 52, 0, 0, Math.PI * 2); ctx.fill();
    // Face
    const faceGrad = ctx.createRadialGradient(-12, -15, 4, 0, 0, 50);
    faceGrad.addColorStop(0, '#c8a870');
    faceGrad.addColorStop(0.6, '#a08050');
    faceGrad.addColorStop(1, '#604020');
    ctx.fillStyle = faceGrad;
    ctx.beginPath(); ctx.ellipse(0, 0, 46, 52, 0, 0, Math.PI * 2); ctx.fill();
    // 5 o'clock shadow
    ctx.fillStyle = 'rgba(50,30,10,0.2)';
    ctx.beginPath(); ctx.ellipse(0, 15, 30, 22, 0, 0, Math.PI * 2); ctx.fill();

    // Eyes — one slightly wrong, manic
    const blink = Math.sin(t * 0.7) > 0.96 ? 0.1 : 1;
    [[-16, -8], [16, -8]].forEach(([ex, ey], i) => {
      ctx.fillStyle = '#1a0e06';
      ctx.beginPath(); ctx.ellipse(ex, ey, 11, 11 * blink, 0, 0, Math.PI * 2); ctx.fill();
      // Manic shine — both eyes
      ctx.fillStyle = i === 0 ? '#ff8020' : '#ffaa40';
      ctx.beginPath(); ctx.ellipse(ex, ey, 7, 7 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.ellipse(ex + 1, ey, 4, 4 * blink, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,200,0.8)';
      ctx.beginPath(); ctx.ellipse(ex - 3, ey - 3, 2.5, 2, 0, 0, Math.PI * 2); ctx.fill();
    });

    // Grin — too wide
    ctx.fillStyle = '#0a0402';
    ctx.beginPath();
    ctx.moveTo(-34, 20);
    ctx.quadraticCurveTo(0, 40, 34, 20);
    ctx.quadraticCurveTo(0, 28, -34, 20);
    ctx.fill();
    // Teeth
    for (let ti = -3; ti <= 3; ti++) {
      ctx.fillStyle = ti === 0 ? '#d8c898' : '#e8e0cc';
      ctx.beginPath(); ctx.roundRect(ti * 9 - 4, 20, 8, 14, [0,0,3,3]); ctx.fill();
    }

    // "HEEERE'S JOHNNY" — slight text glow near head when near
    const textAlpha = 0.15 + Math.abs(Math.sin(t * 0.4)) * 0.2;
    ctx.fillStyle = `rgba(255,80,0,${textAlpha})`;
    ctx.font = '10px "Special Elite", serif';
    ctx.textAlign = 'center';
    ctx.fillText('"HEEERE\'S...', 0, -65);
    ctx.restore();
  }

  function updateEnemyPortrait(type) {
    const canvas = document.getElementById('enemy-canvas-el');
    if (canvas) canvas.classList.add('phase-transition');
    setTimeout(() => {
      buildEnemyPortrait(type);
    }, 700);
  }

  function enemyHit() {
    // Try SVG version first
    const svg = document.getElementById('pennywise-svg');
    if (svg) { enemyHitSVG(); return; }
    // Fallback canvas
    const canvas = document.getElementById('enemy-canvas-el');
    if (!canvas) return;
    canvas.classList.remove('hit');
    void canvas.offsetWidth;
    canvas.classList.add('hit');
    setTimeout(() => canvas.classList.remove('hit'), 350);
  }

  // ── FPS WEAPON PANEL ──
  function buildFPSWeaponPanel(enemy) {
    let panel = document.getElementById('fps-weapon-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'fps-weapon-panel';
      document.getElementById('combat-scene').appendChild(panel);
    }
    refreshWeaponPanel();
  }

  function refreshWeaponPanel() {
    const panel = document.getElementById('fps-weapon-panel');
    if (!panel) return;
    const weapon = getActiveWeapon();
    // Preserve damage popup element if it exists
    const existingDmg = document.getElementById('weapon-last-dmg');
    const dmgHtml = existingDmg ? existingDmg.outerHTML : '<div id="weapon-last-dmg"></div>';
    panel.innerHTML = `
      <div id="weapon-left">
        <div id="weapon-name-txt">${weapon.name}</div>
        <div id="weapon-ammo">${weapon.ammo}</div>
      </div>
      <div style="position:relative;">
        ${dmgHtml}
        <svg id="weapon-silhouette" viewBox="0 0 90 65" fill="none" xmlns="http://www.w3.org/2000/svg">
          ${weapon.svg}
        </svg>
      </div>`;
  }

  function getActiveWeapon() {
    if (Engine.hasItem("Beverly's Slingshot")) {
      // Warm Pennywise poster sheet early so the first combat frame can appear immediately

  return {
        name: "SILVER SLINGSHOT",
        ammo: "SILVER SLUGS  ◆◆◆◆◆",
        svg: `
          <!-- viewBox 0 0 90 65 -->
          <!-- Handle — vertical grip, bottom center, held by player -->
          <rect x="41" y="44" width="9" height="22" rx="4"
            fill="#5a3a18" stroke="#3a2008" stroke-width="1"/>
          <!-- Grip wrap rings -->
          <line x1="40" y1="49" x2="51" y2="49" stroke="#3a2008" stroke-width="1.2" opacity="0.5"/>
          <line x1="40" y1="54" x2="51" y2="54" stroke="#3a2008" stroke-width="1.2" opacity="0.5"/>
          <line x1="40" y1="59" x2="51" y2="59" stroke="#3a2008" stroke-width="1.2" opacity="0.5"/>
          <!-- Y-fork base knot where handle meets prongs -->
          <circle cx="45" cy="42" r="6" fill="#7a5a28" stroke="#4a3010" stroke-width="1.2"/>
          <!-- LEFT prong — splays hard to the left -->
          <path d="M45 42 Q30 32 14 10" stroke="#6a4a20" stroke-width="5"
            fill="none" stroke-linecap="round"/>
          <!-- RIGHT prong — splays hard to the right -->
          <path d="M45 42 Q60 32 76 10" stroke="#6a4a20" stroke-width="5"
            fill="none" stroke-linecap="round"/>
          <!-- Prong tips — small caps -->
          <circle cx="14" cy="10" r="4" fill="#7a5a28" stroke="#4a3010" stroke-width="1"/>
          <circle cx="76" cy="10" r="4" fill="#7a5a28" stroke="#4a3010" stroke-width="1"/>
          <!-- Elastic band — left string from tip down to pouch -->
          <path d="M14 10 Q24 30 38 37" stroke="#c8c0a0" stroke-width="2.2"
            fill="none" stroke-linecap="round"/>
          <!-- Elastic band — right string from tip down to pouch -->
          <path d="M76 10 Q66 30 52 37" stroke="#c8c0a0" stroke-width="2.2"
            fill="none" stroke-linecap="round"/>
          <!-- Pouch — leather cradle holding slug -->
          <path d="M36 37 Q45 42 54 37 Q50 44 45 45 Q40 44 36 37Z"
            fill="#8a6840" stroke="#6a5030" stroke-width="0.8"/>
          <!-- Silver slug in pouch -->
          <circle cx="45" cy="39" r="4.5" fill="#d8d4c0" stroke="#a8a490" stroke-width="0.8"/>
          <!-- Slug highlight -->
          <ellipse cx="43" cy="37" rx="2" ry="1.5" fill="rgba(255,255,220,0.55)" transform="rotate(-20,43,37)"/>
          <!-- Silver glint line -->
          <line x1="41" y1="35" x2="38" y2="32" stroke="#e8e4d0" stroke-width="1.2" opacity="0.7"/>
        `
      };
    }
    if (Engine.hasItem('Ritual Knowledge')) {
      return {
        name: "RITUAL OF CHÜD",
        ammo: "WILL POWER  ■■■■■",
        svg: `
          <circle cx="45" cy="30" r="22" stroke="#6a3a8a" stroke-width="2" fill="rgba(60,20,80,0.3)"/>
          <circle cx="45" cy="30" r="14" stroke="#9a60c0" stroke-width="1.5" fill="none" stroke-dasharray="4,2"/>
          <circle cx="45" cy="30" r="6" fill="#c080e0" opacity="0.8"/>
          <line x1="45" y1="8" x2="45" y2="2" stroke="#6a3a8a" stroke-width="1.5"/>
          <line x1="67" y1="30" x2="73" y2="30" stroke="#6a3a8a" stroke-width="1.5"/>
          <line x1="23" y1="30" x2="17" y2="30" stroke="#6a3a8a" stroke-width="1.5"/>
          <line x1="45" y1="52" x2="45" y2="58" stroke="#6a3a8a" stroke-width="1.5"/>
          <text x="45" y="65" text-anchor="middle" fill="#9a60c0" font-size="7" font-family="serif">CHÜD</text>`
      };
    }
    // Default — fists/desperation
    return {
      name: "BARE HANDS",
      ammo: "DESPERATION  ◆◆◆◆◆",
      svg: `
        <path d="M30 60 Q28 40 32 25 Q34 18 38 20 Q42 22 40 30 L42 20 Q44 14 48 16 Q52 18 50 28 L52 22 Q54 16 58 18 Q62 20 60 30 L62 26 Q64 20 68 22 Q72 24 70 35 L68 55 Q65 62 55 63 Q40 64 30 60Z" fill="#c8a870" stroke="#a08050" stroke-width="1.5"/>
        <line x1="40" y1="30" x2="40" y2="55" stroke="#a08050" stroke-width="0.8" opacity="0.5"/>
        <line x1="50" y1="28" x2="50" y2="55" stroke="#a08050" stroke-width="0.8" opacity="0.5"/>
        <line x1="60" y1="30" x2="60" y2="52" stroke="#a08050" stroke-width="0.8" opacity="0.5"/>`
    };
  }

  function showWeaponDamage(dmg, type = 'normal') {
    const el = document.getElementById('weapon-last-dmg');
    if (!el) return;
    const colors = { normal: '#ff4444', silver: '#e8d860', memory: '#f0c840', miss: '#444' };
    el.style.color = colors[type] || colors.normal;
    el.textContent = (dmg > 0 ? '-' + dmg : 'MISS');
    el.classList.remove('pop');
    void el.offsetWidth;
    el.classList.add('pop');
    // Also update weapon name to show what was just used
    const wn = document.getElementById('weapon-name-txt');
    if (wn) {
      const orig = wn.textContent;
      wn.textContent = type === 'silver' ? 'SILVER SHOT' : type === 'memory' ? 'MEMORY SURGE' : type === 'miss' ? '— MISSED —' : orig;
      setTimeout(() => { if (wn) wn.textContent = orig; }, 1200);
    }
  }

  // Spawn scene particles based on location
  function spawnSceneParticles(location) {
    let container = document.getElementById('scene-particles');
    if (!container) {
      container = document.createElement('div');
      container.id = 'scene-particles';
      document.getElementById('combat-scene').appendChild(container);
    }
    container.innerHTML = '';
    const count = location === 'sewer' ? 12 : location === 'overlook' ? 8 : 6;
    const colors = {
      sewer:     ['rgba(20,60,20,0.5)', 'rgba(100,0,0,0.3)', 'rgba(40,80,40,0.4)'],
      derry:     ['rgba(100,0,0,0.3)', 'rgba(60,40,20,0.3)', 'rgba(80,60,40,0.2)'],
      overlook:  ['rgba(20,20,60,0.4)', 'rgba(60,40,80,0.3)', 'rgba(100,80,40,0.2)'],
      darktower: ['rgba(80,0,60,0.4)', 'rgba(40,0,80,0.3)', 'rgba(120,40,0,0.2)']
    };
    const palette = colors[location] || colors.derry;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'scene-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = palette[Math.floor(Math.random() * palette.length)];
      p.style.width  = (1 + Math.random() * 3) + 'px';
      p.style.height = p.style.width;
      p.style.animationDuration = (4 + Math.random() * 8) + 's';
      p.style.animationDelay    = (-Math.random() * 8) + 's';
      container.appendChild(p);
    }
  }

  function updateEnemyHp(hp, maxHp) {
    const fill = document.getElementById('enemy-hp-fill');
    const nums = document.getElementById('enemy-hp-nums');
    if (fill) fill.style.width = Math.max(0, hp / maxHp * 100) + '%';
    if (nums) nums.textContent = Math.max(0, hp) + ' / ' + maxHp;
  }

  function updateEnemyName(name, subname, phase) {
    const n = document.getElementById('enemy-name-txt');
    const p = document.getElementById('enemy-phase-badge');
    if (n) n.textContent = name + (subname ? ' — ' + subname : '');
    if (p) { p.textContent = phase || ''; p.classList.toggle('show', !!phase); }
  }

  // ── DIALOGUE SYSTEM ──
  function showDialogue(speaker, text, delay = 0) {
    return new Promise(resolve => {
      setTimeout(() => {
        const dial = document.getElementById('combat-dialogue');
        const spk  = document.getElementById('dialogue-speaker');
        const txt  = document.getElementById('dialogue-text');
        if (!dial) { resolve(); return; }

        dial.classList.add('active');
        if (spk) spk.textContent = speaker || '';
        if (txt) txt.innerHTML = '';

        // Typewriter effect
        let i = 0;
        const plain = text.replace(/<[^>]+>/g, '');  // strip tags for typing
        const cursor = document.createElement('span');
        cursor.className = 'dial-cursor';

        const interval = setInterval(() => {
          if (txt) txt.innerHTML = plain.slice(0, i) + (i < plain.length ? '' : '');
          i++;
          if (i > plain.length) {
            clearInterval(interval);
            if (txt) txt.innerHTML = text; // restore full HTML
            setTimeout(resolve, 1800);
          }
        }, 28);
      }, delay);
    });
  }

  // ── COMBAT LOG ──
  function combatLog(type, text) {
    const log = document.getElementById('combat-log');
    if (!log) return;
    const line = document.createElement('div');
    line.className = 'log-line ' + (type || '');
    line.textContent = text;
    log.appendChild(line);
    log.scrollTop = log.scrollHeight;
  }

  // ── COMMAND MENU ──
  function renderCommandMenu(actions) {
    const grid = document.getElementById('command-grid');
    if (!grid) return;
    grid.innerHTML = '';
    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.className = 'cmd-btn';
      if (action.id === 'flee')   btn.classList.add('flee-cmd');
      if (action.id === 'memory') btn.classList.add('memory-cmd');
      if (action.id === 'ritual') btn.classList.add('danger-cmd');
      btn.innerHTML = `
        <span class="cmd-icon">${action.icon}</span>
        <span class="cmd-label">
          ${action.label}
          <span class="cmd-sublabel">${action.sublabel || ''}</span>
        </span>
        ${action.cost === 'token' ? '<span class="cmd-cost">🌟×1</span>' : ''}`;
      btn.onclick = () => Combat.playerAction(action.id);
      grid.appendChild(btn);
    });
  }

  function disableCommands() {
    document.querySelectorAll('.cmd-btn').forEach(b => b.disabled = true);
  }

  function setCombatTurn(isPlayer, isEnemy = false) {
    const txt = document.getElementById('turn-txt');
    const ind = document.getElementById('turn-indicator');
    if (txt) txt.textContent = isPlayer ? 'YOUR TURN' : (isEnemy ? "ITS TURN..." : 'WAIT...');
    if (ind) {
      ind.className = 'turn-indicator';
      if (isEnemy) ind.classList.add('enemy');
    }
  }

  // ── PHASE TRANSITION ──
  function showPhaseTransition(title, sub) {
    return new Promise(resolve => {
      const ov = document.getElementById('phase-overlay');
      const t  = document.getElementById('phase-title');
      const s  = document.getElementById('phase-sub');
      if (!ov) { resolve(); return; }
      if (t) t.textContent = title;
      if (s) s.textContent = sub;
      ov.classList.add('active');
      setTimeout(() => {
        ov.classList.remove('active');
        resolve();
      }, 2500);
    });
  }

  // ── RITUAL OF CHÜD MINI-GAME ──
  function showRitualMinigame(callback) {
    // Build the ritual overlay
    let overlay = document.getElementById('ritual-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ritual-overlay';
      overlay.style.cssText = `
        position:fixed;inset:0;z-index:800;
        background:rgba(10,0,20,0.97);
        display:flex;flex-direction:column;align-items:center;justify-content:center;
        gap:20px;padding:30px;
      `;
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div style="font-family:'Special Elite',serif;font-size:10px;letter-spacing:5px;color:#6a3a8a;text-transform:uppercase;margin-bottom:10px;">◈ THE RITUAL OF CHÜD</div>
      <div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:16px;color:#c8b0d0;text-align:center;max-width:420px;line-height:1.7;margin-bottom:10px;">
        Bite Its tongue. Hold the clinch. When the bar hits the center — press.<br>
        <span style="font-size:13px;color:#7a5a8a;">The first one to laugh loses everything.</span>
      </div>
      <div id="ritual-track" style="width:min(320px,80vw);height:20px;background:#0a0514;border:1px solid #3a1a5a;border-radius:10px;overflow:hidden;position:relative;">
        <div id="ritual-zone" style="position:absolute;left:40%;width:20%;height:100%;background:rgba(150,80,220,0.3);border-radius:inherit;"></div>
        <div id="ritual-bar" style="width:8px;height:100%;background:linear-gradient(90deg,#8a40cc,#c080ff);border-radius:5px;position:absolute;left:0;transition:none;box-shadow:0 0 10px rgba(180,100,255,0.6);"></div>
      </div>
      <div id="ritual-feedback" style="font-family:'Share Tech Mono',monospace;font-size:11px;color:#4a2a6a;letter-spacing:2px;min-height:20px;"></div>
      <button id="ritual-bite" style="background:transparent;border:2px solid #6a3a8a;color:#9a60c0;padding:14px 40px;font-family:'Special Elite',serif;font-size:1rem;letter-spacing:4px;cursor:pointer;transition:all 0.2s;border-radius:2px;">
        BITE
      </button>
      <div id="ritual-result" style="font-family:'Crimson Pro',serif;font-size:14px;color:#c8b0d0;text-align:center;min-height:20px;display:none;max-width:380px;line-height:1.6;"></div>
    `;
    overlay.style.display = 'flex';

    const bar    = overlay.querySelector('#ritual-bar');
    const btn    = overlay.querySelector('#ritual-bite');
    const fb     = overlay.querySelector('#ritual-feedback');
    const result = overlay.querySelector('#ritual-result');

    let pos = 0;
    let dir = 1;
    let speed = 0.8;
    let animId;
    let done = false;

    function animate() {
      if (done) return;
      pos += dir * speed;
      if (pos >= 92) dir = -1;
      if (pos <= 0)  dir = 1;
      speed = 0.6 + Math.random() * 0.5; // Irregular speed — hard to predict
      bar.style.left = pos + '%';
      animId = requestAnimationFrame(animate);
    }
    animId = requestAnimationFrame(animate);

    btn.onclick = () => {
      if (done) return;
      done = true;
      cancelAnimationFrame(animId);

      // Check timing
      const inZone = pos >= 40 && pos <= 60;
      const nearZone = pos >= 32 && pos <= 68;
      let timing, success;

      if (inZone) {
        timing = 'perfect'; success = true;
        fb.textContent = '★ PERFECT — RIGHT IN THE CENTER';
        fb.style.color = '#f0c040';
        result.textContent = 'You locked It. The laugh-battle goes deep, deeper than the sewers, and you hold.';
      } else if (nearZone) {
        timing = 'good'; success = true;
        fb.textContent = '▸ GOOD — HELD THE CLINCH';
        fb.style.color = '#80c080';
        result.textContent = 'You hold your ground. Not perfectly, but you hold.';
      } else {
        timing = 'poor'; success = Math.random() < 0.35;
        if (success) {
          fb.textContent = '◦ BARELY — Lucky';
          fb.style.color = '#c08040';
          result.textContent = 'By the skin of your teeth. It laughed first — but only just.';
        } else {
          fb.textContent = '✗ TOO SLOW — It laughed first';
          fb.style.color = '#ff4040';
          result.textContent = 'The clinch breaks. The laugh rattles your bones. You lost that round.';
        }
      }

      result.style.display = 'block';
      btn.textContent = 'CONTINUE';
      btn.onclick = () => {
        overlay.style.display = 'none';
        callback(success, timing);
      };
    };
  }

  // ── FX ──
  function showDmgPopup(txt) {
    const p = document.getElementById('dmg-popup');
    if (!p) return;
    p.textContent = txt;
    p.classList.remove('show');
    void p.offsetWidth;
    p.classList.add('show');
  }

  function flashScreen(white = false) {
    const f = document.getElementById('flash-overlay');
    if (!f) return;
    f.className = white ? 'white-flash' : '';
    void f.offsetWidth;
    f.classList.add(white ? 'white-flash' : 'flash');
  }

  function shakeGame() {
    const g = document.getElementById('game-wrap');
    if (!g) return;
    g.classList.add('shake');
    setTimeout(() => g.classList.remove('shake'), 400);
  }

  function fearEffect() {
    const fo = document.getElementById('fear-overlay');
    if (!fo) return;
    fo.classList.remove('active');
    void fo.offsetWidth;
    fo.classList.add('active');
  }

  // ── CHAPTER OVERLAY ──
  function showChapterOverlay() {
    const ov = document.getElementById('chapter-overlay');
    if (!ov) return;
    const grid = document.getElementById('chapter-grid');
    if (!grid) return;
    grid.innerHTML = '';
    Engine.CHAPTER_DEFS.forEach(ch => {
      const unlocked = Engine.isChapterUnlocked(ch.id);
      const complete  = Engine.state.chaptersComplete.includes(ch.id);
      const isCurrent = Engine.state.currentChapter === ch.id;
      const card = document.createElement('div');
      card.className = 'chapter-card' + (!unlocked ? ' locked' : '') + (isCurrent ? ' active-chapter' : '');
      card.innerHTML = `
        <span class="ch-emoji">${ch.emoji}</span>
        <div class="ch-title">${ch.title}</div>
        <div class="ch-sub">${ch.subtitle}<br><span style="font-size:10px;color:#5a4a3a;">${ch.description}</span></div>
        <div class="ch-status ${complete ? 'complete' : ''}">${complete ? '✓ COMPLETE' : (isCurrent ? '▸ CURRENT' : (unlocked ? 'UNLOCKED' : ch.unlockNote))}</div>`;
      if (unlocked) {
        card.onclick = () => {
          Engine.setChapter(ch.id);
          ov.classList.remove('active');
          Game.resetAndStartChapter(ch.id);
        };
      }
      grid.appendChild(card);
    });
    ov.classList.add('active');
  }

  // ── MOBILE TABS ──
  const MOB_PANEL = { map: 0, inv: 1, journal: 2 };

  function mobileTab(tab) {
    ['story','map','inv','journal'].forEach(t => {
      const el = document.getElementById('tab-' + t);
      if (el) el.classList.toggle('active', t === tab);
    });
    if (window.innerWidth >= 700) return;
    const sidePanel   = document.getElementById('side-panel');
    const storyPane   = document.getElementById('story-pane');
    const choicesPane = document.getElementById('choices-pane');
    if (tab === 'story') {
      if (storyPane)   storyPane.style.display  = 'flex';
      if (sidePanel)   sidePanel.style.display  = 'none';
      if (choicesPane) choicesPane.style.display = '';
    } else {
      if (storyPane)   storyPane.style.display   = 'none';
      if (sidePanel)   sidePanel.style.display   = 'flex';
      if (choicesPane) choicesPane.style.display  = 'none';
      const boxes = document.querySelectorAll('#side-panel .panel-box');
      const idx   = MOB_PANEL[tab];
      boxes.forEach((b, i) => b.classList.toggle('mob-active', i === idx));
    }
  }

  window.mobileTab = mobileTab;

  return {
    updateStats, updateMemoryTokens, updateInventory, updateInventoryScreen, updateMap,
    addStoryBlock, addLocationHeader, addSeparator, showChoices, clearChoices, addJournal,
    showCombatScreen, hideCombatScreen,
    buildEnemyPortrait, updateEnemyPortrait, enemyHit,
    updateEnemyHp, updateEnemyName,
    showDialogue, combatLog,
    renderCommandMenu, disableCommands, setCombatTurn,
    showPhaseTransition, showRitualMinigame,
    showDmgPopup, flashScreen, shakeGame, fearEffect,
    showWeaponDamage, buildFPSWeaponPanel, getActiveWeapon,
    showChapterOverlay, mobileTab
  };

})();
