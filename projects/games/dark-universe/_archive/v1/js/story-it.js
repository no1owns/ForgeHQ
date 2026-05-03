/* story-it.js — IT Chapter Story Data
   All narrative nodes for the IT chapter.
   Structured for flag-aware branching, memory rewards,
   and authentic SK voice.
   ================================================= */

const StoryIT = {

  derry_street: {
    location: '📍 DERRY, MAINE — 1989',
    theme: 'derry',
    text: [
      { type: 'normal', text: 'Rain hammers the cracked pavement of Main Street. The kind of rain that feels personal — like it followed you here from the moment you crossed the town line.' },
      { type: 'normal', text: 'Above the five-and-dime, a hand-painted banner: <em>DERRY DAYS FESTIVAL — FUN FOR THE WHOLE FAMILY!</em> Someone has spray-painted below it: <em>NO ONE LEAVES.</em>' },
      { type: 'horror', text: 'Somewhere beneath your feet — far beneath the sewers, beneath the pipes and the limestone — something old and patient shifts in its sleep.' },
      { type: 'whisper', text: 'Down the gutter, a red balloon bobs against the current. It wasn\'t there a moment ago.' }
    ],
    choices: [
      {
        text: 'Pick up the balloon',
        type: 'danger',
        hint: 'Something about this is wrong',
        next: 'balloon_encounter'
      },
      {
        text: 'Head to the Derry Library — find Mike',
        type: 'safe',
        hint: 'Mike has been tracking the cycles',
        next: 'derry_library'
      },
      {
        text: 'Go to the Barrens — check the old treehouse',
        type: 'normal',
        next: 'barrens'
      },
      {
        text: '29 Neibolt Street. Finish this.',
        type: 'danger',
        hint: 'You know where It lives',
        next: 'neibolt'
      }
    ]
  },

  balloon_encounter: {
    location: '📍 DERRY MAIN STREET — THE DRAIN',
    text: [
      { type: 'horror', text: 'Your fingers close around the string before your brain can stop them. The balloon is cold. <em>Impossibly</em> cold for a summer evening.' },
      { type: 'normal', text: 'You look down into the drain.' },
      { type: 'horror', text: '"<em>They all float down here. All of them. And when you\'re down here with me — YOU\'LL FLOAT TOO.</em>"' },
      { type: 'system', text: '[SANITY -15 | FEAR +20]' }
    ],
    gainStat: { sanity: -15, fear: -20 },
    choices: [
      { text: 'Run — toward the Barrens', type: 'safe', next: 'barrens' },
      {
        text: '"WE AREN\'T AFRAID OF YOU."',
        type: 'danger',
        hint: 'Defiance costs something — but so does silence',
        next: 'defiance_drain',
        memoryReward: true
      },
      { text: 'Drop the balloon and back away slowly', type: 'normal', next: 'derry_street' }
    ]
  },

  defiance_drain: {
    location: '📍 DERRY — STORM DRAIN',
    text: [
      { type: 'normal', text: 'Your voice comes out steadier than you feel. The laughter from the drain stops.' },
      { type: 'normal', text: 'Three seconds of silence. The only silence you have heard in Derry since you crossed the town line.' },
      { type: 'horror', text: 'Then a hand erupts from the grating. White. Too many fingers. Nails like pitted bone.' },
      { type: 'normal', text: 'You wrench free and run. Your palm bleeds where the iron caught you. Behind you, the laughter resumes — <em>delighted</em> now.' },
      { type: 'system', text: '[HP -12 | FEAR -15 — It can be defied]' },
      { type: 'memory', text: '★ You remember: you\'ve seen something like that before. You didn\'t run then either. Memory Token gained.' }
    ],
    gainStat: { hp: -12, fear: 15 },
    gainMemory: 1,
    gainItem: { emoji: '🩸', name: 'Scar of Defiance', desc: 'A torn palm. A small refusal.', effect: 'COURAGE +10 vs Pennywise', activeEffect: 'courage' },
    setFlag: 'defied_pennywise',
    choices: [
      { text: 'Go to the Barrens — regroup', type: 'safe', next: 'barrens' },
      { text: 'Head to Neibolt — you\'re angry enough', type: 'danger', next: 'neibolt' }
    ]
  },

  derry_library: {
    location: '📍 DERRY PUBLIC LIBRARY',
    text: [
      { type: 'normal', text: 'The library smells of mildew and old coffee. Mike Hanlon stands behind the reference desk, surrounded by stacks of newspapers dating back three centuries.' },
      { type: 'normal', text: 'He looks up, dark eyes steady. "You came." He sets a folder on the counter. "I\'ve been tracking the cycles. Every 27 years, like clockwork."' },
      { type: 'normal', text: 'He slides a photograph across the desk: children\'s clothes arranged in a circle around a storm drain, and something that looks like teeth marks in the rusted iron — bent <em>outward</em> from below.' },
      { type: 'whisper', text: '"It eats the fear first," Mike says. "Then it eats us. The fear makes us taste better."' }
    ],
    gainItem: {
      emoji: '📁',
      name: "Mike's Case File",
      desc: 'Three centuries of Derry\'s worst moments, mapped and dated.',
      effect: 'SAN +10 in combat (you know what you face)',
      activeEffect: 'sanity_combat'
    },
    choices: [
      {
        text: 'Study the newspaper records',
        type: 'safe',
        hint: 'Knowledge costs nothing but comfort',
        next: 'library_lore'
      },
      {
        text: 'Ask about the Ritual of Chüd',
        type: 'normal',
        next: 'library_ritual'
      },
      { text: 'Return to Main Street', type: 'normal', next: 'derry_street' }
    ]
  },

  library_lore: {
    location: '📍 DERRY PUBLIC LIBRARY — ARCHIVES',
    text: [
      { type: 'normal', text: 'The records are damning. 1740: half the colony vanished in one night. 1850: the Iron Works explosion — 102 dead, no cause established. 1906: the Black Spot fire. Each time the violence clusters, spikes, and stops.' },
      { type: 'horror', text: 'And each time: <em>Derry forgets</em>. The town itself seems to <em>want</em> to forget. You can feel it working on you already — the comfortable pull of not-knowing.' },
      { type: 'normal', text: '"The forgetting is part of It," Mike says. "It feeds, then covers its tracks. The whole town helps without knowing it."' },
      { type: 'system', text: '[FEAR -10 — You know what you\'re fighting | Memory Token gained]' },
      { type: 'memory', text: '★ Knowing the truth is its own kind of armor. Memory Token gained.' }
    ],
    gainStat: { fear: 10 },
    gainMemory: 1,
    setFlag: 'library_trained',
    choices: [
      { text: 'Return to Mike at the desk', type: 'normal', next: 'derry_library' },
      { text: 'You\'ve seen enough. Go to Neibolt.', type: 'danger', next: 'neibolt' }
    ]
  },

  library_ritual: {
    location: '📍 DERRY PUBLIC LIBRARY',
    text: [
      { type: 'normal', text: '"The Ritual of Chüd," Mike says, flipping through a leather-bound journal with no title on its spine. "A battle of wills. You bite its tongue, it bites yours. The first one to laugh — loses."' },
      { type: 'whisper', text: '"Maturin the Turtle taught it to the Losers in 1958. It\'s not a physical thing. It\'s the refusal to be afraid. The refusal to forget who you are."' },
      { type: 'normal', text: '"You\'ll need to be laughing," Mike adds, and there is nothing funny in the way he says it.' },
      { type: 'system', text: '[RITUAL KNOWLEDGE UNLOCKED]' }
    ],
    gainItem: {
      emoji: '🧠',
      name: 'Ritual Knowledge',
      desc: 'The Ritual of Chüd. A battle of wills, tongue to tongue, laugh for laugh.',
      effect: 'Unlocks Ritual of Chüd in combat — timing-based, powerful',
      activeEffect: 'ritual'
    },
    choices: [
      { text: 'Head to the Barrens', type: 'normal', next: 'barrens' },
      { text: 'Go directly to Neibolt Street', type: 'danger', next: 'neibolt' }
    ]
  },

  barrens: {
    location: '📍 THE BARRENS — DOWNSTREAM',
    text: [
      { type: 'normal', text: 'The Barrens haven\'t changed. Kudzu over the rusted pipes, the Kenduskeag sluggish and brown. The treehouse the Losers built in 1958 is still there — impossibly intact, thirty years on.' },
      { type: 'normal', text: 'Beverly Marsh sits on a log, red hair dark in the rain. She holds out something wrapped in cloth: a slingshot, silver band, handmade. <em>Somehow, the same one.</em>' },
      { type: 'whisper', text: '"We have to go all the way down," she says. Not a question.' }
    ],
    gainItem: {
      emoji: '🪃',
      name: "Beverly's Slingshot",
      desc: "Bill's father's letter opener melted down to silver slugs. Pure things hurt It.",
      effect: 'Heavy damage in combat. Silver burns what claws can\'t.',
      activeEffect: 'silver_dmg'
    },
    choices: [
      {
        text: '"Tell me about the silver. Why it works."',
        type: 'safe',
        next: 'barrens_silver'
      },
      { text: 'Head to the sewer drain', type: 'danger', next: 'sewer_entrance' },
      { text: 'Return to Derry first', type: 'normal', next: 'derry_street' }
    ]
  },

  barrens_silver: {
    location: '📍 THE BARRENS',
    text: [
      { type: 'normal', text: '"Silver\'s pure," Beverly says. "It doesn\'t understand purity. It understands fear and rot and hunger — but not purity. Same reason children\'s belief burns it. We were pure once."' },
      { type: 'whisper', text: '"The problem," she adds, not looking at you, "is we\'re not children anymore. But we remember what it felt like to believe absolutely in something." She pauses. "That has to be enough."' },
      { type: 'system', text: '[FEAR -8 | Memory Token gained — Belief is a weapon]' },
      { type: 'memory', text: '★ You remember what it meant to believe without irony. Memory Token gained.' }
    ],
    gainStat: { fear: 8 },
    gainMemory: 1,
    choices: [
      { text: 'Descend to the sewer drain', type: 'danger', next: 'sewer_entrance' },
      { text: 'Check Neibolt Street first', type: 'danger', next: 'neibolt' }
    ]
  },

  neibolt: {
    location: '📍 29 NEIBOLT STREET',
    text: [
      { type: 'normal', text: 'The house at 29 Neibolt Street leans like a drunk. Every window a void. The front door hangs open — as if waiting, as if this house has been waiting since before you were born.' },
      { type: 'horror', text: 'A smell rolls out: copper and rot and something ancient, like a cave that hasn\'t seen light in ten thousand years.' },
      { type: 'horror', text: 'Written in what might be mud on the doorframe: <em>COME IN. THEY\'RE ALL HERE. THEY ALL FLOAT.</em>' }
    ],
    choices: [
      { text: 'Enter the house', type: 'danger', next: 'neibolt_inside' },
      { text: 'Search the perimeter for another way in', type: 'normal', next: 'neibolt_outside' },
      { text: 'This is a trap — fall back to the Barrens', type: 'safe', next: 'barrens' }
    ]
  },

  neibolt_outside: {
    location: '📍 29 NEIBOLT — PERIMETER',
    text: [
      { type: 'normal', text: 'Around the back, half-buried in dirt: a storm grate. Scratched into the concrete beside it, in a child\'s hand: <em>DERRY LIES. IT IS REAL. WE SAW IT. GEORGIE DENBROUGH DERRY 1957.</em>' },
      { type: 'system', text: '[SECRET FOUND: The Back Way In]' }
    ],
    gainStat: { sanity: 5 },
    setFlag: 'found_back_way',
    choices: [
      { text: 'Use the grate — descend directly to the sewers', type: 'danger', next: 'sewer_entrance' },
      { text: 'Go around to the front door', type: 'danger', next: 'neibolt_inside' }
    ]
  },

  neibolt_inside: {
    location: '📍 29 NEIBOLT — GROUND FLOOR',
    text: [
      { type: 'horror', text: 'The floorboards flex underfoot like something alive. At the end of the hall: a door. Light around its edges. The wrong color for natural light.' },
      { type: 'horror', text: 'A voice from behind the door — your mother\'s voice, perfectly rendered: <em>"Honey? Is that you? I\'ve been waiting so long."</em>' },
      { type: 'system', text: '[SANITY -12 | FEAR +15 — The glamour is strong here]' }
    ],
    gainStat: { sanity: -12, fear: -15 },
    choices: [
      { text: 'Open the door', type: 'danger', next: 'neibolt_door' },
      {
        text: '"That is NOT my mother. Show yourself."',
        type: 'danger',
        hint: 'Naming the lie is the first step to defeating it',
        next: 'neibolt_confrontation',
        requireFlag: null
      },
      { text: 'Flee — back to the street', type: 'safe', next: 'derry_street' }
    ]
  },

  neibolt_confrontation: {
    location: '📍 29 NEIBOLT — THE HALLWAY',
    text: [
      { type: 'normal', text: 'The voice stops. A pause — and then, wrong and vast and somehow <em>pleased</em>, laughter from everywhere and nowhere.' },
      { type: 'horror', text: 'The door at the end of the hall swings open. The light bleeds through in that orange color — not a color you have a name for, exactly — and you understand this is as far as the house goes.' },
      { type: 'system', text: '[MEMORY TOKEN GAINED — You named the lie]' },
      { type: 'memory', text: '★ Seeing through the glamour is a kind of victory. Memory Token gained.' }
    ],
    gainMemory: 1,
    setFlag: 'saw_through_glamour',
    choices: [
      { text: 'Step through the door', type: 'danger', next: 'neibolt_door' }
    ]
  },

  neibolt_door: {
    location: '📍 29 NEIBOLT — THE DOOR',
    text: [
      { type: 'horror', text: 'The room is wrong. Bigger inside than the house allows. Full of something you can\'t look at directly — your peripheral vision keeps filling in shapes that aren\'t there when you turn.' },
      { type: 'horror', text: 'Then the glamour drops. The room empties. There is only the smell, and the teeth, and the eyes — orange, not eyes at all — and It.' },
      { type: 'system', text: '[ENCOUNTER: PENNYWISE — Phase 1]' }
    ],
    gainStat: { sanity: -8, fear: -10 },
    combat: 'pennywise_p1',
    combatFleeNode: 'derry_street',
    combatVictoryNode: 'neibolt_victory'
  },

  neibolt_victory: {
    location: '📍 29 NEIBOLT — AFTERMATH',
    text: [
      { type: 'normal', text: 'It retreats — not dead, not yet, but wounded in some way that matters. The orange light goes out.' },
      { type: 'normal', text: 'You stand in a room that is just a room again. Cracked plaster. A rusted radiator. Something that was once a child\'s drawing on the wall, unrecognizable now.' },
      { type: 'system', text: '[It retreats to the sewers. This isn\'t over.]' },
      { type: 'memory', text: '★ You hurt It. You remember now: you hurt It before. Memory Token gained.' }
    ],
    gainMemory: 1,
    gainStat: { fear: 20 },
    choices: [
      { text: 'Follow It into the sewers', type: 'danger', next: 'sewer_entrance' },
      { text: 'Regroup at the Barrens first', type: 'safe', next: 'barrens' }
    ]
  },

  sewer_entrance: {
    location: '📍 DERRY SEWERS — THE ENTRANCE',
    text: [
      { type: 'normal', text: 'The tunnel swallows you. Water to your ankles, then your knees. Warm in a way standing water shouldn\'t be warm.' },
      { type: 'normal', text: 'The walls are covered in children\'s drawings — crayon, finger-paint, charcoal. Hundreds of them. All the way back to 1740, if you knew what you were reading.' },
      { type: 'horror', text: 'Ahead: a massive chamber. At its center — a house. Black. Rotting. The windows are eyes. And it sees you.' }
    ],
    choices: [
      { text: 'Approach the center — this ends now', type: 'danger', next: 'sewer_center' },
      {
        text: 'Circle the chamber — look for a weakness first',
        type: 'normal',
        hint: 'The deadlight might be vulnerable from outside',
        next: 'sewer_recon'
      }
    ]
  },

  sewer_recon: {
    location: '📍 DERRY SEWERS — THE CHAMBER EDGE',
    text: [
      { type: 'normal', text: 'At the base of the house, half-submerged: a glowing object. Not electrical. It radiates <em>wrongness</em> and, somehow, undeniably, <em>light</em>.' },
      { type: 'whisper', text: 'The Deadlight Fragment. A piece of what It truly is — and like most truly wrong things, it can be turned.' },
      { type: 'system', text: '[ITEM: Deadlight Fragment found]' }
    ],
    gainItem: {
      emoji: '💡',
      name: 'Deadlight Fragment',
      desc: "A piece of It. Orange light that shouldn't exist.",
      effect: 'FEAR -25 on use in combat. Its own light unnerves It.',
      activeEffect: 'fear_drain'
    },
    gainStat: { fear: 8 },
    choices: [
      { text: 'Face Pennywise — armed and ready', type: 'danger', next: 'sewer_center' }
    ]
  },

  sewer_center: {
    location: '📍 THE DEADLIGHTS — ITS LAIR',
    text: [
      { type: 'normal', text: 'The Pennywise shape barely contains what\'s inside it — the clown suit straining, the face stretching into something that has never been human and has been pretending for so long it almost forgot.' },
      {
        type: 'horror',
        text: '"OH, I\'VE MISSED YOU," It says, and every light in the chamber explodes at once. "I\'VE MISSED YOU <em>ALL</em>."'
      },
      { type: 'system', text: '[FINAL ENCOUNTER — PENNYWISE THE DANCING CLOWN]' }
    ],
    combat: 'pennywise_p1',
    combatFleeNode: 'barrens',
    combatVictoryNode: 'victory'
  },

  victory: {
    location: '📍 DERRY, MAINE — DAWN',
    text: [
      { type: 'normal', text: 'The dawn is orange-gold, the best kind of light — the kind that only comes in moments you don\'t feel you deserve.' },
      { type: 'normal', text: 'The streets of Derry are wet and clean. The Losers are there. Beverly. Mike. Ben. They look the way you feel: older, hollowed out, and refilled with something that wasn\'t there before.' },
      { type: 'whisper', text: '"It\'s over," Beverly says. You know it isn\'t, not really — Derry will forget, the cycles will turn again in another 27 years. But right now, in this morning, it is.' },
      { type: 'horror', text: 'Somewhere, impossibly far away, you feel the beam holding. The Dark Tower stands at the center of all worlds, and ka is a wheel.' },
      { type: 'memory', text: '★ CHAPTER COMPLETE. The Shining now unlocked.' }
    ],
    win: true,
    completeChapter: 'it',
    choices: [
      { text: '▸ Chapter Select', type: 'safe', next: '__chapter_select__' },
      { text: '▸ Play Again', type: 'normal', next: '__restart__' }
    ]
  }

};
