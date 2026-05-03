/* engine.js — Dark Universe Game Engine
   State management, localStorage, chapter system
   ================================================ */

const Engine = (() => {

  // ── SAVE SYSTEM ──
  const SAVE_KEY = 'dark_universe_save';

  const DEFAULT_STATE = {
    hp: 100, maxHp: 100,
    sanity: 100, maxSanity: 100,
    fear: 30, maxFear: 100,       // Fear: high = weaker you, stronger It
    memoryTokens: 3, maxTokens: 3,
    inventory: [],
    visitedNodes: ['derry_street'],
    currentNode: 'derry_street',
    flags: {},                     // persistent choice memory
    currentChapter: 'it',
    chaptersUnlocked: ['it'],
    chaptersComplete: [],
    playtime: 0,
    lastSaved: null
  };

  let state = null;
  let currentNode = 'derry_street';
  let saveTimer = null;

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        state = { ...DEFAULT_STATE, ...saved };
        state.visitedNodes = new Set(state.visitedNodes);
        console.log('[Engine] Save loaded');
        return true;
      }
    } catch(e) { console.warn('[Engine] Load failed', e); }
    state = { ...DEFAULT_STATE };
    state.visitedNodes = new Set(['derry_street']);
    return false;
  }

  function save() {
    if (!state) return;
    try {
      const toSave = {
        ...state,
        visitedNodes: Array.from(state.visitedNodes),
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch(e) { console.warn('[Engine] Save failed', e); }
  }

  function debouncedSave() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(save, 1500);
  }

  function reset() {
    localStorage.removeItem(SAVE_KEY);
    state = { ...DEFAULT_STATE };
    state.visitedNodes = new Set(['derry_street']);
    currentNode = 'derry_street';
  }

  function resetChapter() {
    // Keep unlocks and flags, reset combat/exploration state
    const unlocked = state.chaptersUnlocked.slice();
    const complete  = state.chaptersComplete.slice();
    const flags     = { ...state.flags };
    state = { ...DEFAULT_STATE };
    state.visitedNodes = new Set(['derry_street']);
    state.chaptersUnlocked = unlocked;
    state.chaptersComplete = complete;
    state.flags = flags;
    currentNode = 'derry_street';
  }

  // ── STAT HELPERS ──
  function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

  function modStat(stat, delta) {
    if (stat === 'fear') {
      // Fear is special — clamp 0-100
      state.fear = clamp(state.fear + delta, 0, 100);
    } else {
      state[stat] = clamp(state[stat] + delta, 0, state['max' + stat.charAt(0).toUpperCase() + stat.slice(1)] || 100);
    }
    debouncedSave();
    return state[stat];
  }

  function spendMemoryToken() {
    if (state.memoryTokens <= 0) return false;
    state.memoryTokens--;
    debouncedSave();
    return true;
  }

  function gainMemoryToken(n = 1) {
    state.memoryTokens = clamp(state.memoryTokens + n, 0, state.maxTokens);
    debouncedSave();
  }

  // Fear mechanics — It grows stronger as fear rises
  function getFearMultiplier() {
    // 0.7 at fear=0, 1.0 at fear=50, 1.5 at fear=100
    return 0.7 + (state.fear / 100) * 0.8;
  }

  function getBeliefMultiplier() {
    // Inverse of fear + memory bonus
    const base = 1.3 - (state.fear / 100) * 0.5;
    return base + (state.memoryTokens * 0.1);
  }

  // ── INVENTORY ──
  function hasItem(name) {
    return state.inventory.some(i => i.name === name);
  }

  function addItem(item) {
    if (!hasItem(item.name)) {
      state.inventory.push(item);
      debouncedSave();
      return true;
    }
    return false;
  }

  function removeItem(name) {
    const idx = state.inventory.findIndex(i => i.name === name);
    if (idx >= 0) { state.inventory.splice(idx, 1); debouncedSave(); return true; }
    return false;
  }

  // ── FLAGS ──
  function setFlag(key, val = true) {
    state.flags[key] = val;
    debouncedSave();
  }

  function getFlag(key) { return state.flags[key]; }

  // ── CHAPTER SYSTEM ──
  const CHAPTER_DEFS = [
    {
      id: 'it',
      title: "IT",
      subtitle: "Derry, Maine — 1989",
      emoji: '🎈',
      unlockNote: 'Chapter 1 — Always available',
      startNode: 'derry_street',
      theme: 'derry',
      description: 'The Losers return to Derry. Pennywise is waiting.'
    },
    {
      id: 'shining',
      title: "The Shining",
      subtitle: "The Overlook Hotel — 1977",
      emoji: '🪓',
      unlockNote: 'Complete IT to unlock',
      startNode: 'overlook_lobby',
      theme: 'overlook',
      description: 'Room 237. The hedge maze. Jack Torrance and the thing that wears him.'
    },
    {
      id: 'carrie',
      title: "Carrie",
      subtitle: "Chamberlain, Maine — 1979",
      emoji: '🩸',
      unlockNote: 'Complete The Shining to unlock',
      startNode: 'chamberlain_school',
      theme: 'derry',
      description: 'The prom. The blood. The power no one believed in until it was too late.'
    },
    {
      id: 'darktower',
      title: "The Dark Tower",
      subtitle: "Mid-World — The Beam",
      emoji: '🗼',
      unlockNote: 'Complete Carrie to unlock',
      startNode: 'midworld_start',
      theme: 'darktower',
      description: "The Gunslinger. The Man in Black. Ka is a wheel and it's turning now."
    }
  ];

  function isChapterUnlocked(id) {
    return state.chaptersUnlocked.includes(id);
  }

  function completeChapter(id) {
    if (!state.chaptersComplete.includes(id)) {
      state.chaptersComplete.push(id);
    }
    // Unlock next
    const idx = CHAPTER_DEFS.findIndex(c => c.id === id);
    if (idx >= 0 && idx + 1 < CHAPTER_DEFS.length) {
      const next = CHAPTER_DEFS[idx + 1].id;
      if (!state.chaptersUnlocked.includes(next)) {
        state.chaptersUnlocked.push(next);
      }
    }
    debouncedSave();
  }

  function setChapter(id) {
    if (!isChapterUnlocked(id)) return false;
    state.currentChapter = id;
    const def = CHAPTER_DEFS.find(c => c.id === id);
    if (def) currentNode = def.startNode;
    debouncedSave();
    return true;
  }

  function getCurrentChapterDef() {
    return CHAPTER_DEFS.find(c => c.id === state.currentChapter) || CHAPTER_DEFS[0];
  }

  // ── VISIT TRACKING ──
  function visit(nodeId) {
    state.visitedNodes.add(nodeId);
    currentNode = nodeId;
    debouncedSave();
  }

  function hasVisited(nodeId) {
    return state.visitedNodes.has(nodeId);
  }

  return {
    load, save, reset, resetChapter,
    get state() { return state; },
    get currentNode() { return currentNode; },
    set currentNode(v) { currentNode = v; },
    modStat, spendMemoryToken, gainMemoryToken,
    getFearMultiplier, getBeliefMultiplier,
    hasItem, addItem, removeItem,
    setFlag, getFlag,
    CHAPTER_DEFS,
    isChapterUnlocked, completeChapter, setChapter, getCurrentChapterDef,
    visit, hasVisited
  };

})();
