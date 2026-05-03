/* audio.js — Dark Universe Web Audio Engine
   Procedural music themes per location + all SFX
   ============================================= */

const Audio = (() => {
  let ctx = null;
  let enabled = true;
  let heartbeatInt = null;
  let currentTrack = null;
  let currentTheme = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function tone(freq, type, dur, vol, delay = 0, dest = null) {
    try {
      const c = getCtx();
      const o = c.createOscillator();
      const g = c.createGain();
      const target = dest || c.destination;
      o.connect(g); g.connect(target);
      o.type = type;
      o.frequency.setValueAtTime(freq, c.currentTime + delay);
      g.gain.setValueAtTime(0, c.currentTime + delay);
      g.gain.linearRampToValueAtTime(vol, c.currentTime + delay + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + dur);
      o.start(c.currentTime + delay);
      o.stop(c.currentTime + delay + dur + 0.05);
    } catch(e) {}
  }

  // ── SFX ──
  function hit() {
    if (!enabled) return;
    tone(100, 'sawtooth', 0.18, 0.45);
    tone(65,  'square',   0.22, 0.3, 0.06);
    tone(45,  'sine',     0.3,  0.2, 0.1);
  }
  function miss() {
    if (!enabled) return;
    tone(320, 'sine', 0.08, 0.12);
    tone(280, 'sine', 0.1,  0.1, 0.05);
  }
  function pickup() {
    if (!enabled) return;
    tone(440, 'sine', 0.1, 0.2);
    tone(660, 'sine', 0.1, 0.18, 0.1);
    tone(880, 'sine', 0.1, 0.12, 0.2);
  }
  function horror() {
    if (!enabled) return;
    tone(50,  'sawtooth', 0.7, 0.35);
    tone(53,  'sawtooth', 0.7, 0.28, 0.08);
    tone(38,  'square',   0.9, 0.22, 0.18);
    tone(100, 'sine',     0.5, 0.15, 0.3);
  }
  function victory() {
    if (!enabled) return;
    [440,554,659,880,1108].forEach((f,i) => tone(f, 'sine', 0.4, 0.3, i * 0.11));
  }
  function death() {
    if (!enabled) return;
    [220,185,155,120,90].forEach((f,i) => tone(f, 'sawtooth', 0.45, 0.3, i * 0.16));
  }
  function limitBreak() {
    if (!enabled) return;
    [220,330,440,660,880,1100].forEach((f,i) => tone(f, 'sine', 0.4, 0.5, i * 0.07));
  }
  function memoryToken() {
    if (!enabled) return;
    tone(540, 'sine', 0.12, 0.25);
    tone(720, 'sine', 0.12, 0.2, 0.1);
    tone(900, 'sine', 0.15, 0.15, 0.2);
  }
  function fearRise() {
    if (!enabled) return;
    [80, 78, 75, 70].forEach((f,i) => tone(f, 'sawtooth', 0.3, 0.2, i * 0.1));
  }
  function phaseTransition() {
    if (!enabled) return;
    // Descending horror chord
    [440,415,392,370,330].forEach((f,i) => tone(f, 'sawtooth', 0.5, 0.35, i * 0.12));
    tone(55, 'square', 1.2, 0.4, 0.3);
  }

  // ── HEARTBEAT ──
  function startHeartbeat(fast = false) {
    stopHeartbeat();
    if (!enabled) return;
    const bpm = fast ? 145 : 68;
    heartbeatInt = setInterval(() => {
      if (!enabled) return;
      tone(55, 'sine', 0.09, 0.45);
      setTimeout(() => tone(45, 'sine', 0.08, 0.38), 160);
    }, 60000 / bpm);
  }
  function stopHeartbeat() {
    if (heartbeatInt) clearInterval(heartbeatInt);
    heartbeatInt = null;
  }

  // ── LOCATION MUSIC THEMES ──
  // Each theme is a procedural ambient loop

  const THEMES = {
    // IT Chapter — Derry, rainy streets, creeping dread
    derry: {
      notes: [55, 58, 55, 52, 55, 58, 62, 58],
      tempo: 2400,
      base: 55, type: 'sawtooth', vol: 0.04,
      pad: { freq: 110, vol: 0.03 },
      color: '#8b0000'
    },
    // Sewers — deep drone, dripping
    sewer: {
      notes: [42, 42, 44, 42, 40, 42, 40, 38],
      tempo: 3000,
      base: 42, type: 'square', vol: 0.05,
      pad: { freq: 84, vol: 0.035 },
      color: '#1a3a1a'
    },
    // Overlook Hotel — unsettling waltz, off-key piano
    overlook: {
      notes: [220, 247, 262, 247, 233, 220, 208, 220],
      tempo: 1800,
      base: 110, type: 'triangle', vol: 0.035,
      pad: { freq: 110, vol: 0.02 },
      color: '#1a1a3a'
    },
    // The Dark Tower — vast, lonely, ka
    darktower: {
      notes: [73, 82, 92, 82, 73, 65, 73, 82],
      tempo: 2800,
      base: 73, type: 'sine', vol: 0.04,
      pad: { freq: 146, vol: 0.025 },
      color: '#3a1a3a'
    },
    // Combat — tense, percussive pulse
    combat: {
      notes: [80, 80, 85, 80, 76, 80, 85, 90],
      tempo: 900,
      base: 80, type: 'sawtooth', vol: 0.06,
      pad: { freq: 80, vol: 0.04 },
      color: '#8b0000'
    }
  };

  let themeTimeout = null;
  let themeStep = 0;
  let padNode = null;

  function stopTheme() {
    if (themeTimeout) clearTimeout(themeTimeout);
    themeTimeout = null;
    try { if (padNode) { padNode.stop(); padNode = null; } } catch(e) {}
    currentTheme = null;
  }

  function startTheme(name) {
    if (!enabled) return;
    if (currentTheme === name) return;
    stopTheme();
    currentTheme = name;
    const t = THEMES[name];
    if (!t) return;
    themeStep = 0;

    // Start pad drone
    try {
      const c = getCtx();
      const osc = c.createOscillator();
      const gain = c.createGain();
      const filt = c.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.value = 300;
      osc.type = 'sine';
      osc.frequency.value = t.pad.freq;
      gain.gain.value = t.pad.vol;
      osc.connect(filt); filt.connect(gain); gain.connect(c.destination);
      osc.start();
      padNode = osc;
    } catch(e) {}

    // Melody loop
    function step() {
      if (!enabled || currentTheme !== name) return;
      const freq = t.notes[themeStep % t.notes.length];
      tone(freq, t.type, t.tempo / 1000 * 0.6, t.vol);
      themeStep++;
      themeTimeout = setTimeout(step, t.tempo);
    }
    themeTimeout = setTimeout(step, 200);
  }

  // ── AMBIENCE (white noise base) ──
  let ambienceNode = null;
  function startAmbience() {
    if (!enabled) return;
    try {
      const c = getCtx();
      const buf = c.createBuffer(1, c.sampleRate * 4, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.012;
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
      const filt = c.createBiquadFilter(); filt.type = 'lowpass'; filt.frequency.value = 350;
      const gain = c.createGain(); gain.gain.value = 0.4;
      src.connect(filt); filt.connect(gain); gain.connect(c.destination);
      src.start(); ambienceNode = src;
    } catch(e) {}
  }
  function stopAmbience() {
    try { if (ambienceNode) { ambienceNode.stop(); ambienceNode = null; } } catch(e) {}
  }

  function toggle() {
    enabled = !enabled;
    if (!enabled) { stopHeartbeat(); stopTheme(); stopAmbience(); }
    else { startAmbience(); }
    return enabled;
  }

  return {
    hit, miss, pickup, horror, victory, death, limitBreak, memoryToken, fearRise, phaseTransition,
    startHeartbeat, stopHeartbeat,
    startTheme, stopTheme,
    startAmbience, stopAmbience,
    toggle,
    isEnabled: () => enabled
  };
})();
