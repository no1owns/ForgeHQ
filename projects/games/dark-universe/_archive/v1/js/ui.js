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
    list.innerHTML = inv.map(i => `
      <div class="inv-item" title="${i.desc || ''}">
        <span class="inv-icon">${i.emoji}</span>
        <div>
          <span class="inv-name">${i.name}</span>
          <span class="inv-effect">${i.effect || ''}</span>
        </div>
      </div>`).join('');
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
    // On mobile, auto-switch to story tab
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
    scroll.scrollTop = scroll.scrollHeight;
  }

  function addSeparator() {
    const scroll = document.getElementById('story-scroll');
    if (!scroll) return;
    const sep = document.createElement('div');
    sep.style.cssText = 'height:1px;background:linear-gradient(90deg,transparent,#3a1a10,transparent);margin:14px 0;';
    scroll.appendChild(sep);
  }

  function showChoices(choices) {
    const container = document.getElementById('choices');
    if (!container) return;
    container.innerHTML = '';
    choices.forEach(choice => {
      if (choice.requireItem && !Engine.hasItem(choice.requireItem)) return;
      if (choice.requireFlag && !Engine.getFlag(choice.requireFlag)) return;
      const btn = document.createElement('button');
      btn.className = 'choice-btn ' + (choice.type || 'normal');
      if (choice.memoryReward) btn.classList.add('memory-choice');
      let html = choice.text;
      if (choice.hint) html += `<span class="choice-hint">↳ ${choice.hint}</span>`;
      btn.innerHTML = html;
      btn.onclick = () => Game.handleChoice(choice);
      container.appendChild(btn);
    });
  }

  function clearChoices() {
    const c = document.getElementById('choices');
    if (c) c.innerHTML = '<div style="color:#3a2a20;font-family:\'Share Tech Mono\',monospace;font-size:11px;letter-spacing:2px;">...</div>';
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

    // Set scene bg
    const bg = document.getElementById('scene-bg');
    if (bg) { bg.className = 'scene-bg'; bg.classList.add(enemy.bg || 'sewer'); }

    // Build enemy portrait
    buildEnemyPortrait(enemy.portrait);

    // Enemy name/hp
    updateEnemyName(enemy.name, enemy.subname, enemy.phaseLabel || '');
    updateEnemyHp(enemy.hp, enemy.maxHp);

    // Player status
    updateStats();
    updateMemoryTokens();

    // Clear combat log
    const log = document.getElementById('combat-log');
    if (log) log.innerHTML = '';
  }

  function hideCombatScreen() {
    const screen = document.getElementById('combat-screen');
    if (screen) screen.classList.remove('active');
    const dial = document.getElementById('combat-dialogue');
    if (dial) dial.classList.remove('active');
  }

  function buildEnemyPortrait(type) {
    const canvas = document.getElementById('enemy-canvas');
    if (!canvas) return;
    canvas.className = 'enemy-figure';

    if (type === 'pennywise') {
      canvas.innerHTML = `
        <div class="pennywise-figure">
          <div class="pw-balloon">
            <div class="balloon-body"></div>
            <div class="balloon-string"></div>
          </div>
          <div class="pw-body">
            <div class="pw-collar"></div>
            <div class="pw-arm left"><div class="pw-glove"></div></div>
            <div class="pw-arm right"><div class="pw-glove"></div></div>
          </div>
          <div class="pw-head">
            <div class="pw-hair left"></div>
            <div class="pw-hair right"></div>
            <div class="pw-eye left"></div>
            <div class="pw-eye right"></div>
            <div class="pw-nose"></div>
            <div class="pw-mouth">
              <div class="pw-smile"></div>
              <div class="pw-tooth"></div>
              <div class="pw-tooth"></div>
              <div class="pw-tooth"></div>
              <div class="pw-tooth"></div>
            </div>
          </div>
        </div>`;
    } else if (type === 'spider') {
      canvas.innerHTML = `
        <div class="spider-figure">
          <div class="spider-body">
            <div class="spider-leg"></div>
            <div class="spider-leg"></div>
            <div class="spider-leg"></div>
            <div class="spider-leg"></div>
            <div class="spider-leg"></div>
            <div class="spider-leg"></div>
          </div>
          <div class="spider-face">🤡</div>
        </div>`;
    } else if (type === 'jack') {
      canvas.innerHTML = `
        <div class="jack-figure">
          <div class="jack-body"></div>
          <div class="jack-head">
            <div class="jack-eye left"></div>
            <div class="jack-eye right"></div>
            <div class="jack-mouth"></div>
          </div>
          <div class="jack-axe">
            <div class="axe-handle"></div>
            <div class="axe-head"></div>
          </div>
        </div>`;
    } else {
      canvas.innerHTML = `<div style="font-size:5rem;padding-bottom:20px;">👾</div>`;
    }
  }

  function updateEnemyPortrait(type) {
    const canvas = document.getElementById('enemy-canvas');
    if (!canvas) return;
    canvas.classList.add('phase-transition');
    setTimeout(() => {
      buildEnemyPortrait(type);
      canvas.classList.remove('phase-transition');
    }, 600);
  }

  function enemyHit() {
    const fig = document.querySelector('.enemy-figure');
    if (!fig) return;
    fig.classList.add('hit');
    setTimeout(() => fig.classList.remove('hit'), 350);
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
    addStoryBlock, addSeparator, showChoices, clearChoices, addJournal,
    showCombatScreen, hideCombatScreen,
    buildEnemyPortrait, updateEnemyPortrait, enemyHit,
    updateEnemyHp, updateEnemyName,
    showDialogue, combatLog,
    renderCommandMenu, disableCommands, setCombatTurn,
    showPhaseTransition, showRitualMinigame,
    showDmgPopup, flashScreen, shakeGame, fearEffect,
    showChapterOverlay, mobileTab
  };

})();
