/* combat.js — Dark Universe Combat System
   Persona-style UI with SK-native mechanics:
   - Fear gauge (powers Pennywise, weakens you)
   - Memory Tokens (your weapon)
   - Named enemy attacks with dialogue
   - Phase transitions with cinematics
   - Ritual of Chüd timing mini-game
   ============================================== */

const Combat = (() => {

  let active = false;
  let enemy = null;
  let playerTurn = true;
  let turnCount = 0;
  let fleeNode = 'derry_street';
  let onVictory = null;
  let enemyStunnedTurns = 0;

  // ── ENEMY DEFINITIONS ──
  const ENEMIES = {
    pennywise_p1: {
      id: 'pennywise_p1',
      name: 'PENNYWISE',
      subname: 'The Dancing Clown',
      hp: 90, maxHp: 90,
      phase: 1, phaseLabel: '',
      portrait: 'pennywise',
      theme: 'combat',
      bg: 'sewer',
      drawableSpells: null,
      // Named attacks
      attacks: [
        {
          name: "Georgie's Voice",
          weight: 3,
          fn(state) {
            const fearGain = 12 + Math.floor(Math.random() * 8);
            const baseDmg  = Math.floor((8 + Math.random() * 10) * Engine.getFearMultiplier());
            return {
              hpDmg: baseDmg, sanDmg: 8, fearDmg: -fearGain,
              dialogue: `"Bill... Bill... I found your boat, Bill. Come down here with me."`,
              speaker: 'PENNYWISE',
              logText: `Georgie's Voice — HP -${baseDmg} | SAN -8 | FEAR +${fearGain}`
            };
          }
        },
        {
          name: "The Deadlights",
          weight: 2,
          fearThreshold: 50,  // Only above this fear level
          fn(state) {
            const dmg = Math.floor((5 + Math.random() * 8) * Engine.getFearMultiplier());
            return {
              hpDmg: dmg, sanDmg: 20, fearDmg: -15,
              dialogue: `The orange glow fills everything. You can't look away. You can't remember your name.`,
              speaker: null,
              logText: `Deadlights — SAN -20 | FEAR +15`
            };
          }
        },
        {
          name: "Glamour — Your Worst Fear",
          weight: 2,
          fn(state) {
            const fears = [
              "Your mother's face, wrong around the edges.",
              "The sound of your own funeral being planned in the next room.",
              "Every cruel thing anyone has ever said about you, in your own voice.",
              "Your childhood bedroom, but the door won't open from inside."
            ];
            const fear = fears[Math.floor(Math.random() * fears.length)];
            const dmg = Math.floor((6 + Math.random() * 12) * Engine.getFearMultiplier());
            return {
              hpDmg: dmg, sanDmg: 12, fearDmg: -10,
              dialogue: fear,
              speaker: 'THE GLAMOUR',
              logText: `Glamour — HP -${dmg} | SAN -12 | FEAR +10`
            };
          }
        },
        {
          name: "Claw Strike",
          weight: 4,
          fn(state) {
            const dmg = Math.floor((10 + Math.random() * 14) * Engine.getFearMultiplier());
            return {
              hpDmg: dmg, sanDmg: 5, fearDmg: -5,
              dialogue: `The white glove comes apart. What's inside isn't a hand.`,
              speaker: null,
              logText: `Claw Strike — HP -${dmg} | SAN -5`
            };
          }
        }
      ]
    },

    pennywise_p2: {
      id: 'pennywise_p2',
      name: 'PENNYWISE',
      subname: 'True Form — The Spider',
      hp: 130, maxHp: 130,
      phase: 2, phaseLabel: 'PHASE II',
      portrait: 'spider',
      theme: 'combat',
      bg: 'sewer',
      attacks: [
        {
          name: "IT — THE TRUE FACE",
          weight: 2,
          fn(state) {
            const dmg = Math.floor((15 + Math.random() * 18) * Engine.getFearMultiplier());
            return {
              hpDmg: dmg, sanDmg: 25, fearDmg: -20,
              dialogue: `"I AM THE EATER OF WORLDS AND OF CHILDREN. AND YOU ARE NEXT."`,
              speaker: 'IT',
              logText: `True Face — HP -${dmg} | SAN -25 | FEAR +20`
            };
          }
        },
        {
          name: "Web of Deadlights",
          weight: 2,
          fn(state) {
            const dmg = Math.floor((12 + Math.random() * 15) * Engine.getFearMultiplier());
            return {
              hpDmg: dmg, sanDmg: 15, fearDmg: -15,
              dialogue: `Threads of orange light wrap around you. You see the Macroverse. You almost understand it.`,
              speaker: null,
              logText: `Web — HP -${dmg} | SAN -15 | FEAR +15`
            };
          }
        },
        {
          name: "Memory Shred",
          weight: 3,
          fn(state) {
            const tokenLoss = Math.min(1, state.memoryTokens);
            return {
              hpDmg: 8, sanDmg: 10, fearDmg: -8,
              tokenDmg: tokenLoss,
              dialogue: `It reaches into your past and takes something. A face you needed to remember.`,
              speaker: null,
              logText: `Memory Shred — HP -8 | SAN -10 | Memory Token lost`
            };
          }
        },
        {
          name: "Crushing Legs",
          weight: 4,
          fn(state) {
            const dmg = Math.floor((18 + Math.random() * 22) * Engine.getFearMultiplier());
            return {
              hpDmg: dmg, sanDmg: 8, fearDmg: 0,
              dialogue: `The legs come down. All eight. The chittering is louder than thought.`,
              speaker: null,
              logText: `Crushing Legs — HP -${dmg} | SAN -8`
            };
          }
        }
      ]
    },

    jack_torrance: {
      id: 'jack_torrance',
      name: 'JACK TORRANCE',
      subname: 'The Hotel Has Him',
      hp: 80, maxHp: 80,
      phase: 1, phaseLabel: '',
      portrait: 'jack',
      theme: 'combat',
      bg: 'overlook',
      // Jack has persuasion health too — reaching him matters
      persuasionHp: 40, persuasionMaxHp: 40,
      attacks: [
        {
          name: "Axe Swing",
          weight: 4,
          fn(state) {
            const dmg = 12 + Math.floor(Math.random() * 18);
            return {
              hpDmg: dmg, sanDmg: 10, fearDmg: -5,
              dialogue: `"HEEEERE'S JOHNNY!"`,
              speaker: 'JACK',
              logText: `Axe Swing — HP -${dmg} | SAN -10`
            };
          }
        },
        {
          name: "The Hotel Speaks",
          weight: 2,
          fn(state) {
            return {
              hpDmg: 5, sanDmg: 18, fearDmg: -12,
              dialogue: `"Mr. Ullman wants you out of here. The hotel wants you out. YOU DON'T BELONG HERE."`,
              speaker: 'THE OVERLOOK',
              logText: `Hotel Speaks — SAN -18 | FEAR +12`
            };
          }
        },
        {
          name: "Lucid Moment",
          weight: 1,
          fn(state) {
            // Jack briefly resurfaces — no damage, sets up persuasion opening
            return {
              hpDmg: 0, sanDmg: 0, fearDmg: 5,
              dialogue: `Something crosses his face. For one second — Jack. Not the hotel. Jack.`,
              speaker: null,
              setFlag: 'jack_lucid',
              logText: `Lucid Moment — Jack surfaces briefly`
            };
          }
        }
      ]
    }
  };

  // ── PLAYER ACTIONS ──
  const ACTIONS = [
    {
      id: 'attack',
      label: 'Fight',
      sublabel: 'Bare-handed desperation',
      icon: '⚔',
      cost: null,
      available: () => true,
      execute: async () => {
        const belief = Engine.getBeliefMultiplier();
        const base = 8 + Math.floor(Math.random() * 14);
        const dmg = Math.floor(base * belief);
        const hit = Math.random() < 0.72;
        if (hit) {
          dealEnemyDamage(dmg);
          UI.combatLog('hit', `Strike — ${dmg} damage`);
          Audio.hit();
          UI.showDmgPopup('-' + dmg);
          UI.showWeaponDamage(dmg, 'normal');
          UI.enemyHit();
          Engine.modStat('fear', 5);
          return true;
        } else {
          UI.combatLog('miss', `Strike — missed. It sidesteps, delighted.`);
          Audio.miss();
          UI.showWeaponDamage(0, 'miss');
          return false;
        }
      }
    },
    {
      id: 'silver',
      label: 'Silver Shot',
      sublabel: "Beverly's slingshot",
      icon: '🪃',
      cost: null,
      available: () => Engine.hasItem("Beverly's Slingshot"),
      execute: async () => {
        const belief = Engine.getBeliefMultiplier();
        const dmg = Math.floor((20 + Math.random() * 26) * belief);
        const hit = Math.random() < 0.85;
        if (hit) {
          dealEnemyDamage(dmg);
          UI.combatLog('hit', `Silver Shot — ${dmg} damage. It recoils from the purity.`);
          Audio.hit(); Audio.pickup();
          UI.showDmgPopup('-' + dmg);
          UI.showWeaponDamage(dmg, 'silver');
          UI.enemyHit();
          Engine.modStat('fear', 10);
          return true;
        } else {
          UI.combatLog('miss', 'Silver Shot — wide. The clown laughs.');
          Audio.miss();
          UI.showWeaponDamage(0, 'miss');
          return false;
        }
      }
    },
    {
      id: 'memory',
      label: 'Memory',
      sublabel: `Spend a token — belief as weapon`,
      icon: '🌟',
      cost: 'token',
      available: () => Engine.state.memoryTokens > 0,
      execute: async () => {
        if (!Engine.spendMemoryToken()) return false;
        Audio.memoryToken();
        // Memory attack: scales with fear reduction
        const fearBonus = Engine.state.fear / 100;
        const dmg = Math.floor((25 + Math.random() * 30) + fearBonus * 20);
        dealEnemyDamage(dmg);
        UI.updateMemoryTokens();
        // Show memory dialogue
        const memories = [
          "You remember the summer of 1958. The dam in the Barrens. The way the sun felt.",
          "You remember Beverly's laugh. Ben's poems. Stan's birds. Mike's farm. Eddie's aspirins. Bill's stutter.",
          "You remember that you were brave once. That It could be hurt. That you hurt It before.",
          "You remember your own name. Simple. Impossible. Everything."
        ];
        await UI.showDialogue(null, memories[Math.floor(Math.random() * memories.length)]);
        UI.combatLog('heal', `Memory — ${dmg} damage. Fear reduced.`);
        Engine.modStat('fear', 15);  // Memory reduces fear
        UI.enemyHit();
        UI.showDmgPopup('-' + dmg);
        UI.showWeaponDamage(dmg, 'memory');
        return true;
      }
    },
    {
      id: 'ritual',
      label: 'Ritual of Chüd',
      sublabel: 'Battle of wills — timing matters',
      icon: '🧠',
      cost: null,
      available: () => Engine.hasItem('Ritual Knowledge'),
      execute: async () => {
        // Timing mini-game: a pulsing bar, click at the right moment
        return new Promise(resolve => {
          UI.showRitualMinigame(async (success, timing) => {
            if (success) {
              const quality = timing === 'perfect' ? 2.0 : timing === 'good' ? 1.4 : 1.0;
              const dmg = Math.floor((35 + Math.random() * 35) * quality * Engine.getBeliefMultiplier());
              dealEnemyDamage(dmg);
              const msg = timing === 'perfect'
                ? `PERFECT CHÜD — ${dmg} damage! The laugh contest goes deep.`
                : timing === 'good'
                ? `Ritual of Chüd — ${dmg} damage. Your will holds.`
                : `Ritual of Chüd — ${dmg} damage. It almost had you.`;
              UI.combatLog('hit', msg);
              Audio.limitBreak();
              UI.showDmgPopup('-' + dmg);
              UI.enemyHit();
              Engine.modStat('fear', 20);
            } else {
              UI.combatLog('miss', 'Ritual of Chüd — It bit first. You broke the clinch.');
              Engine.modStat('sanity', -15);
              Engine.modStat('fear', -15);
              UI.combatLog('fear', 'Sanity -15 | Fear +15');
            }
            resolve(success);
          });
        });
      }
    },
    {
      id: 'flee',
      label: 'Flee',
      sublabel: 'Run — courage costs',
      icon: '🏃',
      cost: null,
      available: () => true,
      execute: async () => {
        Engine.modStat('sanity', -12);
        Engine.modStat('fear', -15);
        return 'flee';
      }
    }
  ];

  // ── CORE COMBAT LOOP ──
  function getAvailableActions() {
    return ACTIONS.filter(a => a.available());
  }

  function pickEnemyAttack() {
    const pool = [];
    enemy.attacks.forEach(atk => {
      if (atk.fearThreshold && Engine.state.fear < atk.fearThreshold) return;
      for (let i = 0; i < (atk.weight || 1); i++) pool.push(atk);
    });
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function dealEnemyDamage(amount) {
    enemy.hp = Math.max(0, enemy.hp - amount);
    UI.updateEnemyHp(enemy.hp, enemy.maxHp);
  }

  async function start(enemyId, opts = {}) {
    const def = ENEMIES[enemyId];
    if (!def) return;
    active = true;
    enemy = { ...def };
    playerTurn = true;
    turnCount = 0;
    enemyStunnedTurns = 0;
    fleeNode = opts.fleeNode || 'derry_street';
    onVictory = opts.onVictory || null;

    Audio.stopTheme();
    Audio.startTheme('combat');
    Audio.startHeartbeat(true);
    Audio.horror();

    UI.showCombatScreen(enemy);

    requestAnimationFrame(() => {
      if (typeof Sprite !== 'undefined') {
        if (typeof Sprite.resizeCanvas === 'function') Sprite.resizeCanvas();
        if (typeof Sprite.draw === 'function') Sprite.draw();
        if (typeof Sprite.play === 'function') Sprite.play('idle');
      }
    });

    await UI.showDialogue(
      enemy.name,
      getOpeningLine(enemyId),
      600
    );

    requestAnimationFrame(() => {
      if (typeof Sprite !== 'undefined') {
        if (typeof Sprite.resizeCanvas === 'function') Sprite.resizeCanvas();
        if (typeof Sprite.draw === 'function') Sprite.draw();
        if (typeof Sprite.play === 'function') Sprite.play('idle');
      }
    });

    UI.renderCommandMenu(getAvailableActions());
    UI.setCombatTurn(true);
  }

  function getOpeningLine(id) {
    const lines = {
      pennywise_p1: '"OH, I\'VE MISSED YOU. I\'VE MISSED ALL OF YOU SO MUCH."',
      pennywise_p2: '"YOU\'LL FLOAT TOO. YOU\'LL FLOAT TOO. YOU\'LL — FLOAT — TOO."',
      jack_torrance: '"I\'m not gonna hurt ya. I\'m just gonna bash your brains in."',
    };
    return lines[id] || 'It sees you.';
  }

  async function playerAction(actionId) {
    if (!active || !playerTurn) return;
    const action = ACTIONS.find(a => a.id === actionId);
    if (!action || !action.available()) return;

    playerTurn = false;
    UI.setCombatTurn(false);
    UI.disableCommands();

    const result = await action.execute();

    if (result === 'flee') {
      UI.combatLog('miss', '▸ You run. Cowardice tastes like copper.');
      UI.combatLog('system', 'FLED — Sanity -12 | Fear +15');
      end(false);
      await delay(600);
      Game.goToNode(fleeNode);
      return;
    }

    UI.updateStats();

    // Check enemy death
    if (enemy.hp <= 0) {
      await victory();
      return;
    }

    // Check phase transition
    if (enemy.phase === 1 && enemy.hp <= enemy.maxHp * 0.35) {
      await phaseTransition();
      return;
    }

    await delay(800);
    await enemyTurn();
  }

  async function enemyTurn() {
    turnCount++;

    if (enemyStunnedTurns > 0) {
      enemyStunnedTurns--;
      UI.combatLog('system', `${enemy.name} writhes — cannot act. (${enemyStunnedTurns} turns)`);
      await delay(700);
      playerTurn = true;
      UI.setCombatTurn(true);
      UI.renderCommandMenu(getAvailableActions());
      return;
    }

    UI.setCombatTurn(false, true); // enemy turn indicator

    const atk = pickEnemyAttack();
    const result = atk.fn(Engine.state);

    // Show dialogue
    if (result.dialogue) {
      await UI.showDialogue(result.speaker, result.dialogue);
    }

    // Apply damage
    if (result.hpDmg)    Engine.modStat('hp',     -result.hpDmg);
    if (result.sanDmg)   Engine.modStat('sanity', -result.sanDmg);
    if (result.fearDmg)  Engine.modStat('fear',    result.fearDmg);
    if (result.tokenDmg) {
      for (let i = 0; i < result.tokenDmg; i++) Engine.spendMemoryToken();
      UI.updateMemoryTokens();
    }
    if (result.setFlag)  Engine.setFlag(result.setFlag);

    // Trigger sprite attack animation
    if (typeof Sprite !== 'undefined') Sprite.triggerAttack();
    Audio.hit();
    UI.flashScreen();
    UI.shakeGame();
    if (result.hpDmg > 15) UI.showDmgPopup('-' + result.hpDmg);
    UI.combatLog('enemy', result.logText);
    UI.updateStats();

    // Fear effects
      if (typeof Sprite !== 'undefined') Sprite.triggerDeadlight();
    if (Engine.state.fear > 75) {
      UI.fearEffect();
      Audio.fearRise();
      }

    // Death check
    if (Engine.state.hp <= 0 || Engine.state.sanity <= 0) {
      await Game.triggerDeath();
      return;
    }

    await delay(700);
    playerTurn = true;
    UI.setCombatTurn(true);
    UI.renderCommandMenu(getAvailableActions());
  }

  async function phaseTransition() {
    UI.combatLog('system', `${enemy.name} — PHASE TRANSITION`);
    if (typeof Sprite !== 'undefined') Sprite.triggerPhaseShift();
    Audio.phaseTransition();
    // Sprite phase shift animation
    await UI.showPhaseTransition('PHASE II', `"THIS IS MY TRUE FACE. AND THERE ARE WORSE THINGS THAN DEATH."`);
    // Switch to phase 2
    const p2 = ENEMIES['pennywise_p2'];
    enemy = { ...p2, hp: p2.maxHp };
    UI.updateEnemyPortrait('spider');
    UI.updateEnemyHp(enemy.hp, enemy.maxHp);
    UI.updateEnemyName(enemy.name, enemy.subname, 'PHASE II');
    // Gain a memory token as reward for surviving
    Engine.gainMemoryToken(1);
    UI.updateMemoryTokens();
    UI.combatLog('heal', 'A memory resurfaces — Memory Token gained.');
    await delay(800);
    playerTurn = true;
    UI.setCombatTurn(true);
    UI.renderCommandMenu(getAvailableActions());
  }

  async function victory() {
    active = false;
    if (typeof Sprite !== 'undefined') Sprite.triggerDeath();
    Audio.stopHeartbeat();
    Audio.startHeartbeat(false);
    Audio.victory();
    UI.combatLog('system', `VICTORY — ${enemy.name} DEFEATED`);
    await UI.showDialogue(null, "Its screams shake the sewer walls. Then — silence. Then the sound of Derry waking up.", 600);
    // Reward
    Engine.gainMemoryToken(1);
    Engine.modStat('fear', 30);  // Fear drops on victory
    UI.updateStats();
    UI.updateMemoryTokens();
    Audio.startTheme('derry');
    UI.hideCombatScreen();
    if (onVictory) onVictory();
  }

  function end(won) {
    active = false;
    Audio.stopHeartbeat();
    Audio.startHeartbeat(false);
    UI.hideCombatScreen();
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  return {
    start, playerAction, end,
    get active() { return active; },
    get enemy() { return enemy; },
    ENEMIES
  };

})();
