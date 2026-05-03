import { useState } from "react";

const phases = [
  {
    id: 1,
    title: "Phase 1: Web Game MVP",
    timeline: "Months 1–3",
    color: "#c0392b",
    icon: "🌐",
    tools: ["Claude Artifacts", "React/HTML5", "Phaser.js", "Claude API"],
    tasks: [
      "Build playable browser prototype in Claude Artifacts",
      "Core loop: explore Derry/Castle Rock locations",
      "Text-adventure + light RPG mechanics",
      "Character roster: Pennywise, Cujo, Carrie, Jack Torrance, The Dark Tower crew",
      "Horror-themed UI/UX with Stephen King aesthetic",
    ],
    deliverable: "Shareable URL game — no install needed",
  },
  {
    id: 2,
    title: "Phase 2: Design & Asset Pipeline",
    timeline: "Months 2–4",
    color: "#8e44ad",
    icon: "🎨",
    tools: ["Figma", "Midjourney / DALL·E", "Blender (3D skins)", "Claude for lore"],
    tasks: [
      "Figma: full game UI kit — menus, HUD, inventory, maps",
      "Character skin sheets: Pennywise, It (spider form), Randall Flagg, Annie Wilkes, The Gunslinger",
      "Fortnite-ready skin spec sheets (UE5 dimensions & rigging notes)",
      "Location art: The Overlook Hotel, Derry Sewers, Castle Rock, The Dark Tower",
      "Style guide: typography, color palettes, horror iconography",
    ],
    deliverable: "Figma design system + exportable skin assets",
  },
  {
    id: 3,
    title: "Phase 3: Full Web Game Launch",
    timeline: "Months 4–7",
    color: "#d35400",
    icon: "⚔️",
    tools: ["Claude Code", "Next.js", "Phaser 3", "Supabase", "Vercel"],
    tasks: [
      "Claude Code: scaffold full Next.js + Phaser 3 project",
      "Multiplayer lobby (websockets via Supabase Realtime)",
      "Full character selection with SK universe roster",
      "Map system: procedurally generated SK locations",
      "Save system, leaderboards, user accounts",
      "Monetization: cosmetic skins, lore packs",
    ],
    deliverable: "Deployed web game at custom domain",
  },
  {
    id: 4,
    title: "Phase 4: Mobile App",
    timeline: "Months 7–12",
    color: "#27ae60",
    icon: "📱",
    tools: ["React Native / Expo", "Claude Code", "App Store Connect", "Google Play Console"],
    tasks: [
      "Port web game core to React Native",
      "Touch-optimized controls & UI",
      "Push notifications for events",
      "In-app purchases (Apple/Google IAP)",
      "iOS + Android simultaneous launch",
    ],
    deliverable: "App Store & Google Play listings",
  },
  {
    id: 5,
    title: "Phase 5: Fortnite Skin Partnership",
    timeline: "Months 6–18",
    color: "#2980b9",
    icon: "🎮",
    tools: ["Unreal Engine 5", "Epic Games Creator Portal", "Blender", "ZBrush"],
    tasks: [
      "Research Epic Games UEFN (Unreal Editor for Fortnite)",
      "Build SK character skin concepts in Blender/ZBrush",
      "Spec sheets: Pennywise, Randall Flagg, Annie Wilkes, Carrie",
      "Explore Epic's IP partnership licensing process",
      "Submit to Fortnite Creator program",
      "Alternatively: launch skins in your own Fortnite Creative island",
    ],
    deliverable: "3D skin assets + partnership pitch deck",
  },
];

const characters = [
  { name: "Pennywise", book: "IT", role: "Boss", color: "#c0392b", emoji: "🤡" },
  { name: "Randall Flagg", book: "The Stand / Dark Tower", role: "Villain", color: "#8e44ad", emoji: "🃏" },
  { name: "Roland Deschain", book: "The Dark Tower", role: "Hero", color: "#d35400", emoji: "🔫" },
  { name: "Carrie White", book: "Carrie", role: "Wildcard", color: "#e74c3c", emoji: "🩸" },
  { name: "Jack Torrance", book: "The Shining", role: "Villain", color: "#2c3e50", emoji: "🪓" },
  { name: "Annie Wilkes", book: "Misery", role: "Villain", color: "#7f8c8d", emoji: "🔨" },
  { name: "Cujo", book: "Cujo", role: "Enemy", color: "#795548", emoji: "🐕" },
  { name: "The Losers Club", book: "IT", role: "Heroes", color: "#27ae60", emoji: "🎈" },
];

const toolWorkflow = [
  {
    step: "1",
    tool: "Claude Artifacts",
    use: "Rapid prototype — build & test game mechanics RIGHT NOW in chat",
    color: "#c0392b",
  },
  {
    step: "2",
    tool: "Figma",
    use: "Design system, UI kits, character skin sheets, location art boards",
    color: "#8e44ad",
  },
  {
    step: "3",
    tool: "Claude Code",
    use: "Scaffold production codebase, write game logic, set up CI/CD pipeline",
    color: "#d35400",
  },
  {
    step: "4",
    tool: "Supabase",
    use: "Backend: auth, database, realtime multiplayer, leaderboards",
    color: "#27ae60",
  },
  {
    step: "5",
    tool: "Vercel / Expo",
    use: "Deploy web game instantly; port to mobile with Expo for app stores",
    color: "#2980b9",
  },
  {
    step: "6",
    tool: "UEFN / Blender",
    use: "3D skin modeling for Fortnite Creative + Epic partnership pipeline",
    color: "#f39c12",
  },
];

export default function SKUniverseRoadmap() {
  const [activePhase, setActivePhase] = useState(null);
  const [activeTab, setActiveTab] = useState("roadmap");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#e8e0d0",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "0",
      overflow: "hidden auto",
    }}>
      {/* Atmospheric background */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at 20% 20%, rgba(120,0,0,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(60,0,80,0.1) 0%, transparent 60%)",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 13, letterSpacing: 6, color: "#c0392b", textTransform: "uppercase", marginBottom: 12 }}>
            ◆ The Dark Universe Project ◆
          </div>
          <h1 style={{
            fontSize: "clamp(2.2rem, 6vw, 4rem)", fontWeight: 900, margin: "0 0 12px",
            background: "linear-gradient(135deg, #e8e0d0 0%, #c0392b 50%, #e8e0d0 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1.1,
            textShadow: "none",
          }}>
            STEPHEN KING<br />UNIVERSE GAME
          </h1>
          <p style={{ color: "#a09080", fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            From web prototype to app store to Fortnite — a complete build & launch roadmap
            for the ultimate Stephen King gaming experience.
          </p>
        </div>

        {/* Tab Nav */}
        <div style={{ display: "flex", gap: 4, marginBottom: 40, borderBottom: "1px solid #2a2020", paddingBottom: 0 }}>
          {[
            { id: "roadmap", label: "📋 Build Roadmap" },
            { id: "characters", label: "👹 Character Roster" },
            { id: "tools", label: "🛠 Tool Workflow" },
            { id: "next", label: "⚡ Start Now" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: activeTab === tab.id ? "#c0392b" : "transparent",
              color: activeTab === tab.id ? "#fff" : "#a09080",
              border: "none", padding: "10px 20px", cursor: "pointer",
              fontSize: 14, borderRadius: "6px 6px 0 0", fontFamily: "inherit",
              transition: "all 0.2s",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ROADMAP TAB */}
        {activeTab === "roadmap" && (
          <div>
            <div style={{ display: "grid", gap: 16 }}>
              {phases.map(phase => (
                <div key={phase.id}
                  onClick={() => setActivePhase(activePhase === phase.id ? null : phase.id)}
                  style={{
                    background: activePhase === phase.id ? "#1a1010" : "#111",
                    border: `1px solid ${activePhase === phase.id ? phase.color : "#2a2020"}`,
                    borderLeft: `4px solid ${phase.color}`,
                    borderRadius: 8, padding: "20px 24px", cursor: "pointer",
                    transition: "all 0.25s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <span style={{ fontSize: 28 }}>{phase.icon}</span>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#e8e0d0" }}>{phase.title}</div>
                        <div style={{ fontSize: 13, color: phase.color, marginTop: 2 }}>{phase.timeline}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {phase.tools.slice(0, 3).map(t => (
                        <span key={t} style={{
                          fontSize: 11, padding: "3px 8px", borderRadius: 20,
                          background: "#1e1e1e", border: `1px solid ${phase.color}40`,
                          color: "#c0b090",
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {activePhase === phase.id && (
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #2a2020" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                        <div>
                          <div style={{ fontSize: 12, letterSpacing: 3, color: phase.color, marginBottom: 10, textTransform: "uppercase" }}>Tasks</div>
                          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                            {phase.tasks.map((task, i) => (
                              <li key={i} style={{ padding: "6px 0", borderBottom: "1px solid #1a1a1a", fontSize: 14, color: "#c0b090", display: "flex", gap: 8 }}>
                                <span style={{ color: phase.color, flexShrink: 0 }}>→</span> {task}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, letterSpacing: 3, color: phase.color, marginBottom: 10, textTransform: "uppercase" }}>All Tools</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                            {phase.tools.map(t => (
                              <span key={t} style={{
                                fontSize: 13, padding: "5px 12px", borderRadius: 4,
                                background: `${phase.color}20`, border: `1px solid ${phase.color}50`,
                                color: "#e8e0d0",
                              }}>{t}</span>
                            ))}
                          </div>
                          <div style={{
                            background: `${phase.color}15`, border: `1px solid ${phase.color}40`,
                            borderRadius: 8, padding: 16,
                          }}>
                            <div style={{ fontSize: 11, color: phase.color, letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>Deliverable</div>
                            <div style={{ fontSize: 14, color: "#e8e0d0" }}>✓ {phase.deliverable}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHARACTERS TAB */}
        {activeTab === "characters" && (
          <div>
            <p style={{ color: "#a09080", marginBottom: 24, fontSize: 15 }}>
              Core roster for game characters AND Fortnite skin candidates. Each needs a Figma skin sheet + 3D model spec.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {characters.map(char => (
                <div key={char.name} style={{
                  background: "#111", border: `1px solid ${char.color}40`,
                  borderTop: `3px solid ${char.color}`, borderRadius: 8, padding: 20,
                  transition: "transform 0.2s, border-color 0.2s",
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>{char.emoji}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#e8e0d0", marginBottom: 4 }}>{char.name}</div>
                  <div style={{ fontSize: 12, color: char.color, marginBottom: 8, letterSpacing: 1 }}>{char.book}</div>
                  <span style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 20,
                    background: `${char.color}25`, color: char.color, border: `1px solid ${char.color}50`,
                  }}>{char.role}</span>
                  <div style={{ marginTop: 12, fontSize: 12, color: "#6a5a5a" }}>
                    🎮 Game character  ·  👗 Fortnite skin candidate
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOOLS TAB */}
        {activeTab === "tools" && (
          <div>
            <p style={{ color: "#a09080", marginBottom: 24, fontSize: 15 }}>
              The exact tool chain, in order, from first prototype to shipping to app stores and Fortnite.
            </p>
            <div style={{ display: "grid", gap: 12 }}>
              {toolWorkflow.map(item => (
                <div key={item.step} style={{
                  display: "flex", gap: 20, alignItems: "center",
                  background: "#111", border: "1px solid #2a2020",
                  borderLeft: `4px solid ${item.color}`, borderRadius: 8, padding: "18px 24px",
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", background: item.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0,
                  }}>{item.step}</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#e8e0d0", marginBottom: 4 }}>{item.tool}</div>
                    <div style={{ fontSize: 14, color: "#a09080" }}>{item.use}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* START NOW TAB */}
        {activeTab === "next" && (
          <div>
            <p style={{ color: "#a09080", marginBottom: 28, fontSize: 15, maxWidth: 680 }}>
              Here's exactly what to do today to begin building the Stephen King Universe game. Each action is concrete and immediately executable.
            </p>
            <div style={{ display: "grid", gap: 16 }}>
              {[
                {
                  emoji: "⚡", color: "#c0392b",
                  action: "Build the first playable prototype RIGHT NOW",
                  detail: "Ask Claude: \"Build me a Stephen King text-adventure web game in a React artifact. Start in Derry, Maine. Include Pennywise as the first encounter.\" This gives you something playable in minutes.",
                },
                {
                  emoji: "🎨", color: "#8e44ad",
                  action: "Start your Figma skin sheet",
                  detail: "Create a new Figma file. Use an 8-panel grid layout for each character: front, back, left, right, action pose, face close-up, icon, and color palette. Start with Pennywise — he's your hero skin.",
                },
                {
                  emoji: "💻", color: "#d35400",
                  action: "Scaffold the production project with Claude Code",
                  detail: "Install Claude Code, then prompt: \"Create a Next.js + Phaser 3 game project called sk-universe with Supabase auth, a main menu, and a character select screen.\"",
                },
                {
                  emoji: "📋", color: "#27ae60",
                  action: "Clarify IP & licensing early",
                  detail: "Stephen King's works are owned by him and various studios. For an indie web game (non-commercial or small indie), fair use / fan game territory may apply. For commercial launches and Fortnite, you'll need to approach his literary agent or Warner Bros / Paramount depending on the property. Start this conversation early.",
                },
                {
                  emoji: "🎮", color: "#2980b9",
                  action: "Research Fortnite Creative / UEFN",
                  detail: "Visit dev.epicgames.com and explore the UEFN (Unreal Editor for Fortnite). You can build a full Fortnite Creative island using SK locations/themes TODAY — even before the skin partnership is secured. Build the audience first.",
                },
              ].map((item, i) => (
                <div key={i} style={{
                  background: "#111", border: `1px solid ${item.color}40`,
                  borderRadius: 8, padding: "20px 24px", display: "flex", gap: 20,
                }}>
                  <span style={{ fontSize: 32, flexShrink: 0 }}>{item.emoji}</span>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#e8e0d0", marginBottom: 6 }}>{item.action}</div>
                    <div style={{ fontSize: 14, color: "#a09080", lineHeight: 1.6 }}>{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 56, paddingTop: 24, borderTop: "1px solid #2a2020",
          textAlign: "center", color: "#4a3a3a", fontSize: 13,
        }}>
          ◆ The Dark Tower stands at the center of all worlds ◆
        </div>
      </div>
    </div>
  );
}
