import React from "react";
import { useState, useEffect } from "react";

// ── LIBRARY ───────────────────────────────────────────────────────────────────
const LIBRARY = {
  "Fingerboard / Hangboard": ["Max Hangs (7s on / 3min off)","Repeaters (7s on / 3s off × 6)","One-Arm Deadhangs","Open-Hand Hangs","Half-Crimp Hangs","Recruitment Pulls","Density Hangs"],
  "Limit Bouldering": ["Limit Boulder Problems (4×20min)","Project Attempts (3–5 moves)","Flash Attempts","Crux Isolation Reps"],
  "Board Climbing (Kilter/Tension)": ["Kilter Board — Power Sets","Tension Board — Limit Problems","Board Warm-Up Laps","Steep Board Endurance","Footwork Focus Sets"],
  "ARC / Endurance": ["ARC Laps (20min continuous)","4×4s","Linked Boulder Circuits","Traverse Laps","Capacity Intervals"],
  "System Board": ["System Board — Shoulder Press","System Board — Lock-Off Holds","Foot-Hand Matching Drills","Hip Positioning Drills"],
  "Campus Board": ["Campus Ladders (1-3-5)","Campus Ladders (1-2-3-4-5)","Double Dynos","Campus Touches","Offset Ladders"],
  "Strength (pull-ups, rows, etc.)": ["Weighted Pull-Ups","One-Arm Pull-Up Progressions","Inverted Rows","Barbell Rows","Dumbbell Rows","Rear Delt Flies","Ring Push-Ups","Shoulder Press"],
  "Core / Antagonist": ["Front Lever Progressions","Dead Bug (3×10)","Hollow Body Holds","Copenhagen Planks","Wrist Curls / Extensions","Reverse Wrist Curls","Rotator Cuff Band Work","Plank Variations"],
  "Movement / Drills": ["Silent Feet Drills","Hip Drop Exercises","Flagging Practice","Balance Slab","Drop Knee Sequences","Breath & Tension Control"],
  "Recovery / Mobility": ["Forearm Stretching Routine","Thoracic Mobility","Hip Flexor Stretch","Shoulder Circles","Easy Traversing (flush out)","Foam Roll","Ice / Contrast Bath"],
};
const ALL_CATEGORIES = Object.keys(LIBRARY);

const C = {
  black: "#f5f5f3", white: "#111111", orange: "#3d9e7a", purple: "#5b7fa6",
  gray: "#ffffff", gray2: "#f0efed", gray3: "#d8d8d6", muted: "#888884", border: "#e0e0de",
};

async function storageGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
async function storageSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const SEED_ATHLETES = [
  { id: "a1", name: "Maya Torres", type: "Youth Comp", level: "V9" },
  { id: "a2", name: "Derek Sato", type: "Adult Performance", level: "5.13a" },
  { id: "a3", name: "Nadia Price", type: "Adult Recreational", level: "V4" },
  { id: "8ygufmv", name: "Patrick Daly", type: "Adult Performance", level: "V13/14, 14d" },
];
const SEED_PLANS = {
  a1: { days: [
    { label: "Day 1", exercises: [
      { id: "e1", text: "Max Hangs (7s on / 3min off)", category: "Fingerboard / Hangboard", sets: "5 sets", notes: "Half-crimp. Rest 3min between." },
      { id: "e2", text: "Kilter Board — Power Sets", category: "Board Climbing (Kilter/Tension)", sets: "20min", notes: "30° or steeper. 3–5 move problems." },
      { id: "e3", text: "Front Lever Progressions", category: "Core / Antagonist", sets: "3×5s", notes: "" },
      { id: "e4", text: "Wrist Curls / Extensions", category: "Core / Antagonist", sets: "3×15", notes: "" },
    ]},
    { label: "Day 2", exercises: [
      { id: "e5", text: "ARC Laps (20min continuous)", category: "ARC / Endurance", sets: "2×20min", notes: "Stay at 4/10 effort. Breathe." },
      { id: "e6", text: "Hip Drop Exercises", category: "Movement / Drills", sets: "3 problems", notes: "Focus on hip rock, not pulling." },
      { id: "e7", text: "Rotator Cuff Band Work", category: "Core / Antagonist", sets: "3×15 each", notes: "External rotation + press." },
    ]},
    { label: "Day 3", exercises: [
      { id: "e8", text: "Limit Boulder Problems (4×20min)", category: "Limit Bouldering", sets: "4×20min", notes: "Real limit. Stop if you're repeating flashes." },
      { id: "e9", text: "Campus Ladders (1-3-5)", category: "Campus Board", sets: "5 ladders", notes: "No feet. Full lock-off." },
      { id: "e10", text: "Copenhagen Planks", category: "Core / Antagonist", sets: "3×20s each", notes: "" },
    ]},
  ]},
  "8ygufmv": { days: [
    { label: "Day 1 - Strength + Power", exercises: [
      { id: "wc5dbxl", text: "Fingerboard Warmup", category: "Fingerboard / Hangboard", sets: "18 sets", notes: "10s on: 20s rest. (1) 5 sets 3 finger drag (2) 5 sets open hand (3) 2 sets index middle (4) 2 sets middle ring (5) 4 sets half crimp. Proceed to on the wall warmup after." },
      { id: "osf9o4v", text: "3 finger drag max hangs (7s on:2min off)", category: "Fingerboard / Hangboard", sets: "5 sets per side.", notes: "One arm hangs. Treat first two sets as warmup/weight discovery. Increase weight between sets until you reach max." },
      { id: "fra147y", text: "Tension Board — Project", category: "Board Climbing (Kilter/Tension)", sets: "1 boulder", notes: "Pick a boulder you believe will take you more than 2 sessions. Treat each move like its own boulder problem, trying it and refining your method until you've done it twice or you've tried it 10 times. Then proceed to the next move." },
      { id: "utpnyn6", text: "Tension Board — Limit Problems", category: "Board Climbing (Kilter/Tension)", sets: "3-5 boulders", notes: "Choose climbs that you believe are attainable in 5-10 attempts. Make note of the climbs here. Proceed after 5 good attempts on each boulder." },
      { id: "d1blcjx", text: "Weighted Pull-Ups", category: "Strength (pull-ups, rows, etc.)", sets: "4 sets", notes: "5 reps max. Will be dropping reps each week. Then dropping sets after 3 weeks. Note weight and reps here." },
      { id: "uw8d6g8", text: "Bench Press", category: "Strength (pull-ups, rows, etc.)", sets: "3 sets", notes: "5 reps per set. To failure (if you have a spotter), one rep short of failure if you have no spotter. Note weight and reps here." },
    ]},
    { label: "Day 2 - Power and Skills", exercises: [
      { id: "ahbeegz", text: "Fingerboard Warmup", category: "Fingerboard / Hangboard", sets: "18 sets", notes: "10s on: 20s rest. (1) 5 sets 3 finger drag (2) 5 sets open hand (3) 2 sets index middle (4) 2 sets middle ring (5) 4 sets half crimp. Proceed to on the wall warmup after." },
      { id: "p568n10", text: "Flash Attempts -- Strength/Power", category: "Limit Bouldering", sets: "10 boulders", notes: "Hard flash boulders on the commercial set or on the board. 3 good attempts, then move on. Strength problems, not comp problems." },
      { id: "luk1prw", text: "Comp Boulders", category: "Movement / Drills", sets: "3-10 boulders depending on level available at the gym.", notes: "4 minute drills when crowds permit." },
      { id: "nyuky5b", text: "Slab Practice", category: "Movement / Drills", sets: "30 mins", notes: "Either hard slabs or makeups at the gym. A good slab project feels IMPOSSIBLE to start with. That may be hard to find, so use creativity and set aspirational makeup moves. When you're not sure whether a move is possible, treat balance improvements as progress." },
      { id: "n5s5mcy", text: "Weighted Pull-Up Negatives", category: "Strength (pull-ups, rows, etc.)", sets: "3", notes: "NEGATIVES. 80% of max. 3 reps of just negatives. (Stand on box w weight attached, then perform just the lowering of weight, resisting lowering the whole rep)" },
      { id: "u0ypke9", text: "Incline Bench Press", category: "Strength (pull-ups, rows, etc.)", sets: "3", notes: "Sets to failure, choose weight so you are in the 6-8 rep range." },
    ]},
    { label: "Day 3 - Fitness", exercises: [
      { id: "fv96y2q", text: "Fingerboard Warmup", category: "Fingerboard / Hangboard", sets: "18 sets", notes: "10s on: 20s rest. (1) 5 sets 3 finger drag (2) 5 sets open hand (3) 2 sets index middle (4) 2 sets middle ring (5) 4 sets half crimp. Proceed to on the wall warmup after." },
      { id: "mvu399y", text: "4x4", category: "ARC / Endurance", sets: "4", notes: "Find non-crimpy boulders. Look for burly holds and tiring positions. 4 laps with no rest. If you fall, breathe and count to 30 and get back on. Rest 4 minutes between sets." },
      { id: "0lxq8d8", text: "Endurance Laps", category: "ARC / Endurance", sets: "3 sets", notes: "If partner available, trifectas. If partner unavailable, 30-40 move circuit on spray wall. As you get more fatigued, avoid crimps. Prioritize more active hold types (pinches, slopers, etc.)" },
    ]},
    { label: "Day 4 - Power & Shoulders", exercises: [
      { id: "zh83j33", text: "Fingerboard Warmup", category: "Fingerboard / Hangboard", sets: "18 sets", notes: "10s on: 20s rest. (1) 5 sets 3 finger drag (2) 5 sets open hand (3) 2 sets index middle (4) 2 sets middle ring (5) 4 sets half crimp. Proceed to on the wall warmup after." },
      { id: "ufs4xje", text: "Campus Makeups", category: "System Board", sets: "20 minutes", notes: "Challenge your creativity. Make ~5 hard flash level campus makeups. Make each start a jump-start for additional contact strength development. 3 attempts max before moving on. No crimps, at least until further update from climb clinic." },
      { id: "c198tu2", text: "Seated External Rotation", category: "Strength (pull-ups, rows, etc.)", sets: "5", notes: "A la Aidan Roberts. To failure. Heavy enough that you fail at around 10 reps. We'll gradually decrease volume to start pushing the weight on these after ~2 weeks." },
      { id: "i4h95ul", text: "Lat Pulls", category: "Strength (pull-ups, rows, etc.)", sets: "3", notes: "Each set to failure. If elbows hurt, skip this exercise. Pull from dead hang into front lever, then back down to dead hang." },
    ]},
  ]},
};

const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap";
document.head.appendChild(_fl);
const _gs = document.createElement("style");
_gs.textContent = `*, *::before, *::after{box-sizing:border-box;margin:0;padding:0} body{background:${C.black};color:${C.white};font-family:'DM Sans',sans-serif} ::-webkit-scrollbar{width:3px;height:3px} ::-webkit-scrollbar-thumb{background:${C.gray3};border-radius:2px} input,textarea,select{font-family:'DM Sans',sans-serif}`;
document.head.appendChild(_gs);

const uid = () => Math.random().toString(36).slice(2, 9);
const mono = { fontFamily: "'DM Mono', monospace" };
const bebas = { fontFamily: "'Bebas Neue', sans-serif" };

function Badge({ type }) {
  const map = { "Youth Comp": { bg: "rgba(91,127,166,0.1)", color: "#4a7aab" }, "Adult Performance": { bg: "rgba(61,158,122,0.15)", color: C.orange }, "Adult Recreational": { bg: "rgba(194,130,50,0.12)", color: "#a06818" } };
  const s = map[type] || map["Adult Recreational"];
  return <span style={{ ...mono, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", padding: "2px 7px", borderRadius: 3, background: s.bg, color: s.color }}>{type}</span>;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ athletes, credentials, coachPassword, onLoginAthlete, onLoginCoach }) {
  const [tab, setTab] = useState("athlete");
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAthleteLogin = () => {
    if (!selectedAthlete) { setError("Please select your name."); return; }
    if (!credentials[selectedAthlete]) { setError("No password set for this athlete yet. Contact your coach."); return; }
    if (credentials[selectedAthlete] !== password) { setError("Incorrect password."); return; }
    onLoginAthlete(selectedAthlete);
  };

  const handleCoachLogin = () => {
    const stored = localStorage.getItem("rp:coachpw");
    const actual = stored ? JSON.parse(stored) : "";
    if (!actual) { onLoginCoach(); return; }
    if (password !== actual) { setError("Incorrect password."); return; }
    onLoginCoach();
  };

  const inputStyle = { width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", color: C.white, fontSize: 15, outline: "none", marginBottom: 14 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: C.black }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ ...bebas, fontSize: 38, letterSpacing: 3 }}>ROCK POINT <span style={{ color: C.orange }}>COACHING</span></div>
          <div style={{ ...mono, fontSize: 11, color: C.muted, marginTop: 4, letterSpacing: 1 }}>TRAINING PORTAL</div>
        </div>

        <div style={{ display: "flex", background: C.gray2, borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {[["athlete", "Athlete"], ["coach", "Coach"]].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setPassword(""); setError(""); setSelectedAthlete(""); }}
              style={{ flex: 1, padding: "10px", borderRadius: 7, border: "none", cursor: "pointer", background: tab === key ? C.gray : "transparent", color: tab === key ? C.white : C.muted, ...mono, fontSize: 12 }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          {tab === "athlete" ? (
            <>
              <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Your Name</div>
              <select value={selectedAthlete} onChange={e => { setSelectedAthlete(e.target.value); setError(""); }} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Select your name...</option>
                {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Password</div>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleAthleteLogin()} placeholder="Enter your password" style={inputStyle} />
            </>
          ) : (
            <>
              <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Coach Password</div>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key === "Enter" && handleCoachLogin()} placeholder="Enter coach password" style={inputStyle} />
            </>
          )}

          {error && <div style={{ ...mono, fontSize: 11, color: "#a05555", marginBottom: 14, padding: "8px 12px", background: "rgba(160,85,85,0.08)", borderRadius: 6 }}>{error}</div>}

          <button onClick={tab === "athlete" ? handleAthleteLogin : handleCoachLogin}
            style={{ width: "100%", padding: "15px", borderRadius: 8, border: "none", background: C.orange, color: "#fff", cursor: "pointer", ...bebas, fontSize: 22, letterSpacing: 2 }}>
            {tab === "athlete" ? "VIEW MY PLAN" : "ENTER COACH VIEW"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, ...mono, fontSize: 10, color: C.muted }}>rockpointcoaching.com</div>
      </div>
    </div>
  );
}

// ── EXERCISE CARD ─────────────────────────────────────────────────────────────
function ExerciseCard({ ex, ep = {}, onToggle, onNote, onMoveToOverflow, onRestoreDay, onEdit, isOverflow }) {
  const checked = !!ep.checked;
  const note = ep.note || "";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ text: ex.text, sets: ex.sets || "", notes: ex.notes || "" });
  const inp = { width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "8px 10px", color: C.white, fontSize: 13, outline: "none", ...mono };

  return (
    <div style={{ background: checked ? "rgba(61,158,122,0.06)" : isOverflow ? "rgba(91,127,166,0.07)" : C.gray, border: `1px solid ${editing ? C.orange : checked ? "rgba(61,158,122,0.4)" : isOverflow ? "rgba(91,127,166,0.25)" : C.border}`, borderRadius: 10, padding: "16px", transition: "all 0.15s" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <button onClick={onToggle} style={{ width: 26, height: 26, minWidth: 26, borderRadius: 6, border: `2px solid ${checked ? "#2aaa5e" : C.gray3}`, background: checked ? "#2aaa5e" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2, transition: "all 0.15s", flexShrink: 0 }}>
          {checked && <span style={{ color: "#fff", fontSize: 14, fontWeight: 700, lineHeight: 1 }}>✓</span>}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input value={draft.text} onChange={e => setDraft(d => ({ ...d, text: e.target.value }))} autoFocus style={{ ...inp, fontSize: 14, fontWeight: 500 }} />
              <input value={draft.sets} onChange={e => setDraft(d => ({ ...d, sets: e.target.value }))} placeholder="Sets / volume" style={inp} />
              <input value={draft.notes} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))} placeholder="Coach notes..." style={inp} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => { setDraft({ text: ex.text, sets: ex.sets || "", notes: ex.notes || "" }); setEditing(false); }} style={{ ...mono, fontSize: 11, padding: "6px 12px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { onEdit({ ...ex, ...draft }); setEditing(false); }} style={{ ...mono, fontSize: 11, padding: "6px 14px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Save</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 15, fontWeight: 500, color: checked ? C.muted : C.white, textDecoration: checked ? "line-through" : "none", marginBottom: 4, lineHeight: 1.4 }}>{ex.text}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: ex.notes ? 6 : 0 }}>
                {ex.sets && <span style={{ ...mono, fontSize: 11, color: C.orange }}><span style={{ color: C.muted }}>Sets: </span>{ex.sets}</span>}
                <span style={{ ...mono, fontSize: 10, color: C.muted }}>{ex.category}</span>
                {isOverflow && ex.fromDay != null && <span style={{ ...mono, fontSize: 9, color: "#4a7aab", background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>from Day {ex.fromDay + 1}</span>}
              </div>
              {ex.notes && <div style={{ ...mono, fontSize: 12, color: C.muted, lineHeight: 1.5, fontStyle: "italic" }}>{ex.notes}</div>}
            </>
          )}
        </div>

        {!editing && (
          <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 5 }}>
            <button onClick={() => setEditing(true)} style={{ ...mono, fontSize: 10, padding: "5px 8px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer" }}>✎</button>
            {isOverflow
              ? <button onClick={onRestoreDay} style={{ ...mono, fontSize: 10, padding: "5px 8px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", whiteSpace: "nowrap" }}>← back</button>
              : <button onClick={onMoveToOverflow} style={{ ...mono, fontSize: 10, padding: "5px 8px", borderRadius: 5, border: `1px solid ${C.border}`, background: "transparent", color: C.muted, cursor: "pointer", whiteSpace: "nowrap" }}>skip →</button>
            }
          </div>
        )}
      </div>

      {!editing && (
        <div style={{ marginTop: 10, marginLeft: 40 }}>
          <textarea value={note} onChange={e => onNote(e.target.value)} placeholder="Add a note..." rows={1}
            style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${note ? C.gray3 : "transparent"}`, color: "#666", fontSize: 13, resize: "none", outline: "none", padding: "2px 0", ...mono }}
            onFocus={e => e.target.style.borderBottomColor = C.muted}
            onBlur={e => e.target.style.borderBottomColor = note ? C.gray3 : "transparent"} />
        </div>
      )}
    </div>
  );
}

// ── ATHLETE VIEW ──────────────────────────────────────────────────────────────
function AthleteView({ athlete, plan, progress, onProgressChange, onOverflowChange, onEditExercise, onLogout }) {
  const OVF = "overflow";
  const [activeDay, setActiveDay] = useState(0);
  const [showOverview, setShowOverview] = useState(false);

  if (!plan || !plan.days?.length) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.black }}>
        <div style={{ background: C.gray, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ ...bebas, fontSize: 20, letterSpacing: 2 }}>ROCK POINT <span style={{ color: C.orange }}>COACHING</span></div>
          <button onClick={onLogout} style={{ ...mono, fontSize: 10, padding: "6px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>Log out</button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: C.muted, padding: 24 }}>
          <div style={{ fontSize: 48, opacity: 0.3 }}>🧗</div>
          <p style={{ ...mono, fontSize: 13 }}>No plan assigned yet.</p>
          <p style={{ ...mono, fontSize: 11, opacity: 0.6 }}>Check back after your next session.</p>
        </div>
      </div>
    );
  }

  const overflow = progress[OVF] || [];
  const overflowIds = new Set(overflow.map(e => e.id));
  const isOvf = activeDay === OVF;
  const currentDay = !isOvf ? plan.days[activeDay] : null;
  const visibleExs = currentDay ? currentDay.exercises.filter(e => !overflowIds.has(e.id)) : overflow;
  const dayProg = !isOvf ? (progress[activeDay] || {}) : (progress[OVF + "_checks"] || {});
  const doneCount = visibleExs.filter(e => dayProg[e.id]?.checked).length;
  const totalCount = visibleExs.length;

  const handleToggle = (exId) => {
    const key = isOvf ? OVF + "_checks" : activeDay;
    const ep = (progress[key] || {})[exId] || {};
    onProgressChange(key, exId, { ...ep, checked: !ep.checked });
  };
  const handleNote = (exId, val) => {
    const key = isOvf ? OVF + "_checks" : activeDay;
    const ep = (progress[key] || {})[exId] || {};
    onProgressChange(key, exId, { ...ep, note: val });
  };

  return (
    <div style={{ minHeight: "100vh", background: C.black, display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.gray, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ ...bebas, fontSize: 20, letterSpacing: 2 }}>ROCK POINT <span style={{ color: C.orange }}>COACHING</span></div>
        <button onClick={onLogout} style={{ ...mono, fontSize: 10, padding: "6px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>Log out</button>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.purple}, transparent)`, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: "20px 16px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
            <div style={{ ...bebas, fontSize: 30, letterSpacing: 1 }}>{athlete.name}</div>
            {plan.blockNotes && <button onClick={() => setShowOverview(true)} style={{ ...mono, fontSize: 10, padding: "5px 12px", borderRadius: 5, border: `1px solid ${C.orange}`, background: "rgba(61,158,122,0.08)", color: C.orange, cursor: "pointer", letterSpacing: 0.5 }}>Overview ↗</button>}
            {(() => {
              if (!plan.blockStart || !plan.blockEnd) return null;
              const [sy, sm, sd] = plan.blockStart.split("-").map(Number);
              const [ey, em, ed] = plan.blockEnd.split("-").map(Number);
              const start = new Date(sy, sm - 1, sd);
              const end = new Date(ey, em - 1, ed);
              const now = new Date(); now.setHours(0, 0, 0, 0);
              if (now > end) return null;
              if (now < start) {
                const daysUntil = Math.round((start - now) / (24 * 60 * 60 * 1000));
                const dayName = start.toLocaleDateString("en-US", { weekday: "long" });
                const label = daysUntil === 1 ? "tomorrow" : daysUntil <= 6 ? dayName : daysUntil === 7 ? "in one week" : `in ${daysUntil} days`;
                return <span style={{ ...mono, fontSize: 10, color: C.muted, background: C.gray2, border: `1px solid ${C.border}`, padding: "4px 10px", borderRadius: 5 }}>Block starts {label}</span>;
              }
              const totalWeeks = Math.ceil((end - start) / (7 * 24 * 60 * 60 * 1000));
              const currentWeek = Math.min(Math.ceil((now - start + 1) / (7 * 24 * 60 * 60 * 1000)), totalWeeks);
              return <span style={{ ...mono, fontSize: 10, color: C.muted, background: C.gray2, border: `1px solid ${C.border}`, padding: "4px 10px", borderRadius: 5 }}>Week {currentWeek} of {totalWeeks}</span>;
            })()}
          </div>
          <Badge type={athlete.type} />
        </div>

        {showOverview && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 12, width: "100%", maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div>
                  <div style={{ ...bebas, fontSize: 22, letterSpacing: 1 }}>Training Block Overview</div>
                  <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 2 }}>{athlete.name}</div>
                </div>
                <button onClick={() => setShowOverview(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20, lineHeight: 1 }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                <div style={{ ...mono, fontSize: 13, color: C.white, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{plan.blockNotes}</div>
              </div>
              <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
                <button onClick={() => setShowOverview(false)} style={{ ...mono, fontSize: 11, padding: "8px 18px", borderRadius: 6, border: "none", background: C.orange, color: "#fff", cursor: "pointer" }}>Got it</button>
              </div>
            </div>
          </div>
        )}

        {/* Day tabs — scroll on mobile */}
        <div style={{ display: "flex", gap: 6, marginBottom: 6, overflowX: "auto", paddingBottom: 4 }}>
          {plan.days.map((d, i) => {
            const dp = progress[i] || {};
            const vis = d.exercises.filter(e => !overflowIds.has(e.id));
            const done = vis.filter(e => dp[e.id]?.checked).length;
            const total = vis.length;
            const isActive = activeDay === i;
            const allDone = done === total && total > 0;
            return (
              <button key={i} onClick={() => setActiveDay(i)} style={{ flexShrink: 0, minWidth: 80, padding: "10px 12px", borderRadius: 8, border: `1px solid ${isActive ? C.orange : C.border}`, background: isActive ? "rgba(61,158,122,0.1)" : C.gray, color: isActive ? C.orange : C.white, cursor: "pointer", textAlign: "center" }}>
                <div style={{ ...bebas, fontSize: 15 }}>{d.label}</div>
                <div style={{ ...mono, fontSize: 9, color: allDone ? "#2aaa5e" : C.muted, marginTop: 2 }}>{allDone ? "✓ done" : `${done}/${total}`}</div>
              </button>
            );
          })}
          <button onClick={() => setActiveDay(OVF)} style={{ flexShrink: 0, minWidth: 80, padding: "10px 12px", borderRadius: 8, border: `1px solid ${isOvf ? "#4a7aab" : overflow.length > 0 ? "rgba(91,127,166,0.5)" : C.border}`, background: isOvf ? "rgba(91,127,166,0.1)" : overflow.length > 0 ? "rgba(91,127,166,0.05)" : C.gray, color: isOvf ? "#4a7aab" : overflow.length > 0 ? "#4a7aab" : C.muted, cursor: "pointer", textAlign: "center" }}>
            <div style={{ ...bebas, fontSize: 15 }}>Skip</div>
            <div style={{ ...mono, fontSize: 9, color: "inherit", marginTop: 2 }}>{overflow.length > 0 ? overflow.length : "empty"}</div>
          </button>
        </div>

        {totalCount > 0 && (
          <div style={{ background: C.gray3, borderRadius: 4, height: 4, marginBottom: 20, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(doneCount / totalCount) * 100}%`, background: doneCount === totalCount ? "#2aaa5e" : isOvf ? C.purple : C.orange, borderRadius: 4, transition: "width 0.3s" }} />
          </div>
        )}

        {isOvf && overflow.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: C.muted }}>
            <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.3 }}>📭</div>
            <p style={{ ...mono, fontSize: 12 }}>Nothing skipped yet.</p>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleExs.map(ex => (
            <ExerciseCard key={ex.id} ex={ex} ep={dayProg[ex.id] || {}} isOverflow={isOvf}
              onToggle={() => handleToggle(ex.id)}
              onNote={(v) => handleNote(ex.id, v)}
              onMoveToOverflow={() => onOverflowChange([...overflow, { ...ex, fromDay: activeDay }])}
              onRestoreDay={() => onOverflowChange(overflow.filter(e => e.id !== ex.id))}
              onEdit={(updated) => onEditExercise(isOvf ? "overflow" : activeDay, updated)}
            />
          ))}
        </div>

        {!isOvf && doneCount === totalCount && totalCount > 0 && (
          <div style={{ textAlign: "center", marginTop: 28, padding: "20px", background: "rgba(61,158,122,0.07)", border: "1px solid rgba(61,158,122,0.25)", borderRadius: 10 }}>
            <div style={{ ...bebas, fontSize: 26, color: "#2aaa5e", letterSpacing: 1 }}>Day Complete 🎉</div>
            <div style={{ ...mono, fontSize: 12, color: C.muted, marginTop: 4 }}>Nice work. Rest up.</div>
          </div>
        )}
        {isOvf && doneCount === totalCount && totalCount > 0 && (
          <div style={{ textAlign: "center", marginTop: 28, padding: "20px", background: "rgba(91,127,166,0.07)", border: "1px solid rgba(91,127,166,0.25)", borderRadius: 10 }}>
            <div style={{ ...bebas, fontSize: 26, color: "#4a7aab", letterSpacing: 1 }}>All cleared 💪</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── EXERCISE PICKER ───────────────────────────────────────────────────────────
function ExercisePicker({ onAdd, onClose }) {
  const [tab, setTab] = useState("library");
  const [search, setSearch] = useState("");
  const [openCat, setOpenCat] = useState(null);
  const [sets, setSets] = useState(""); const [coachNotes, setCoachNotes] = useState(""); const [selected, setSelected] = useState(null);
  const [customName, setCustomName] = useState(""); const [customCat, setCustomCat] = useState(ALL_CATEGORIES[0]); const [customSets, setCustomSets] = useState(""); const [customNotes, setCustomNotes] = useState("");
  const inp = { width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "8px 10px", color: C.white, fontSize: 13, outline: "none" };
  const lbl = { ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 };
  const filtered = ALL_CATEGORIES.filter(cat => !search || cat.toLowerCase().includes(search.toLowerCase()) || LIBRARY[cat].some(e => e.toLowerCase().includes(search.toLowerCase())));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: C.gray2, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 540, maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", border: `1px solid ${C.border}` }}>
        <div style={{ padding: "20px 20px 0", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ ...bebas, fontSize: 22 }}>Add Exercise</div>
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20 }}>✕</button>
          </div>
          <div style={{ display: "flex" }}>
            {[["library","From Library"],["custom","Custom"]].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: "none", border: "none", cursor: "pointer", borderBottom: `2px solid ${tab===k?C.orange:"transparent"}`, color: tab===k?C.orange:C.muted, marginBottom: -1 }}>{l}</button>
            ))}
          </div>
        </div>

        {tab === "library" ? (
          <>
            <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exercises..." style={{ ...inp, fontSize: 14 }} />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
              {filtered.map(cat => (
                <div key={cat}>
                  <button onClick={() => setOpenCat(openCat === cat ? null : cat)} style={{ width: "100%", background: "none", border: "none", color: C.muted, cursor: "pointer", display: "flex", justifyContent: "space-between", padding: "10px 4px", ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                    <span>{cat}</span><span>{openCat===cat?"▲":"▼"}</span>
                  </button>
                  {(openCat===cat||search) && LIBRARY[cat].filter(e => !search||e.toLowerCase().includes(search.toLowerCase())||cat.toLowerCase().includes(search.toLowerCase())).map(ex => (
                    <button key={ex} onClick={() => setSelected(selected===ex?null:ex)} style={{ width: "100%", textAlign: "left", background: selected===ex?"rgba(61,158,122,0.1)":"transparent", border: `1px solid ${selected===ex?C.orange:"transparent"}`, borderRadius: 6, padding: "10px 12px", color: selected===ex?C.orange:C.white, cursor: "pointer", fontSize: 14, marginBottom: 3 }}>{ex}</button>
                  ))}
                </div>
              ))}
            </div>
            {selected ? (
              <div style={{ padding: "16px 20px", borderTop: `1px solid ${C.border}`, flexShrink: 0, background: C.gray }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: C.orange }}>{selected}</div>
                <div style={{ marginBottom: 10 }}><label style={lbl}>Sets / Volume</label><input value={sets} onChange={e => setSets(e.target.value)} placeholder="e.g. 5 sets, 3×10, 20min" style={inp} /></div>
                <div style={{ marginBottom: 14 }}><label style={lbl}>Coach Notes (optional)</label><input value={coachNotes} onChange={e => setCoachNotes(e.target.value)} placeholder="Cues, intensity..." style={inp} /></div>
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={onClose} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => { onAdd({ id: uid(), text: selected, category: Object.keys(LIBRARY).find(c => LIBRARY[c].includes(selected)), sets, notes: coachNotes }); onClose(); }} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Add</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: "12px 20px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end" }}>
                <button onClick={onClose} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              <div style={{ marginBottom: 14 }}><label style={lbl}>Exercise Name</label><input autoFocus value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Single-leg squat..." style={{ ...inp, fontSize: 14 }} /></div>
              <div style={{ marginBottom: 14 }}><label style={lbl}>Category</label><select value={customCat} onChange={e => setCustomCat(e.target.value)} style={inp}>{ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div style={{ marginBottom: 14 }}><label style={lbl}>Sets / Volume</label><input value={customSets} onChange={e => setCustomSets(e.target.value)} placeholder="e.g. 3×8, 20min" style={inp} /></div>
              <div style={{ marginBottom: 14 }}><label style={lbl}>Coach Notes (optional)</label><input value={customNotes} onChange={e => setCustomNotes(e.target.value)} placeholder="Cues, intensity..." style={inp} /></div>
            </div>
            <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", gap: 8, justifyContent: "flex-end", flexShrink: 0 }}>
              <button onClick={onClose} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { if (!customName.trim()) return; onAdd({ id: uid(), text: customName.trim(), category: customCat, sets: customSets, notes: customNotes }); onClose(); }} disabled={!customName.trim()} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: customName.trim()?C.orange:C.gray3, border: "none", borderRadius: 5, color: customName.trim()?"#fff":C.muted, cursor: customName.trim()?"pointer":"default" }}>Add</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── COACH PLAN EDITOR ─────────────────────────────────────────────────────────
function CoachPlanEditor({ athlete, plan, onPlanChange, clipboard, onCopy, dayClipboard, onCopyDay }) {
  const [activeDay, setActiveDay] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [draftLabel, setDraftLabel] = useState("");

  const days = plan?.days || [{ label: "Day 1", exercises: [] }, { label: "Day 2", exercises: [] }, { label: "Day 3", exercises: [] }];
  const updateDay = (i, exs) => { const d = days.map((dd, j) => j===i?{...dd,exercises:exs}:dd); onPlanChange({...plan,days:d}); };
  const renameDay = (i, l) => { const d = days.map((dd, j) => j===i?{...dd,label:l}:dd); onPlanChange({...plan,days:d}); };
  const addDay = () => { const d=[...days,{label:`Day ${days.length+1}`,exercises:[]}]; onPlanChange({...plan,days:d}); setActiveDay(d.length-1); };
  const removeDay = (i) => { if(days.length<=1) return; const d=days.filter((_,j)=>j!==i); onPlanChange({...plan,days:d}); setActiveDay(Math.min(activeDay,d.length-1)); };
  const pasteDay = () => { if(!dayClipboard) return; const d=[...days,{label:dayClipboard.label+" (copy)",exercises:dayClipboard.exercises.map(e=>({...e,id:uid()}))}]; onPlanChange({...plan,days:d}); setActiveDay(d.length-1); };
  const addExercise = (ex) => updateDay(activeDay, [...(days[activeDay].exercises||[]),ex]);
  const removeExercise = (id) => updateDay(activeDay, days[activeDay].exercises.filter(e=>e.id!==id));
  const moveEx = (id, dir) => { const exs=[...days[activeDay].exercises]; const i=exs.findIndex(e=>e.id===id); if(i+dir<0||i+dir>=exs.length) return; [exs[i],exs[i+dir]]=[exs[i+dir],exs[i]]; updateDay(activeDay,exs); };
  const updateEx = (id, f, v) => updateDay(activeDay, days[activeDay].exercises.map(e=>e.id===id?{...e,[f]:v}:e));
  const day = days[activeDay];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "20px 16px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...bebas, fontSize: 26, letterSpacing: 1, marginBottom: 4 }}>{athlete.name}</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Badge type={athlete.type} /><span style={{ ...mono, fontSize: 10, color: C.muted }}>{athlete.level}</span></div>
      </div>

      <div style={{ marginBottom: 20, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 8 }}>Block Overview / Read Me</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>START DATE</div>
            <input type="date" value={plan?.blockStart || ""} onChange={e => onPlanChange({ ...plan, blockStart: e.target.value })}
              style={{ width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "6px 8px", color: C.white, fontSize: 12, outline: "none", ...mono }} />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>END DATE</div>
            <input type="date" value={plan?.blockEnd || ""} onChange={e => onPlanChange({ ...plan, blockEnd: e.target.value })}
              style={{ width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "6px 8px", color: C.white, fontSize: 12, outline: "none", ...mono }} />
          </div>
        </div>
        <textarea
          value={plan?.blockNotes || ""}
          onChange={e => onPlanChange({ ...plan, blockNotes: e.target.value })}
          placeholder="Write notes about the goals, purpose, and context of this training block. Athletes will see this when they tap 'Overview'."
          rows={4}
          style={{ width: "100%", background: "transparent", border: "none", borderBottom: `1px solid ${C.border}`, color: C.white, fontSize: 13, lineHeight: 1.6, resize: "none", outline: "none", padding: "4px 0", ...mono }}
        />
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 6, overflowX: "auto", paddingBottom: 4, flexWrap: "wrap" }}>
        {days.map((d, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", minWidth: 80 }}>
            {editingLabel === i ? (
              <input autoFocus value={draftLabel} onChange={e => setDraftLabel(e.target.value)}
                onBlur={() => { if(draftLabel.trim()) renameDay(i,draftLabel.trim()); setEditingLabel(null); }}
                onKeyDown={e => { if(e.key==="Enter"){if(draftLabel.trim())renameDay(i,draftLabel.trim());setEditingLabel(null);}if(e.key==="Escape")setEditingLabel(null); }}
                style={{ ...bebas, fontSize: 13, padding: "10px 8px 4px", borderRadius: 7, border: `1px solid ${C.orange}`, background: "rgba(61,158,122,0.1)", color: C.orange, outline: "none", textAlign: "center", width: "100%" }} />
            ) : (
              <button onClick={() => setActiveDay(i)} style={{ padding: "10px 8px 6px", borderRadius: 7, border: `1px solid ${i===activeDay?C.orange:C.border}`, background: i===activeDay?"rgba(61,158,122,0.1)":C.gray, color: i===activeDay?C.orange:C.white, cursor: "pointer", textAlign: "center" }}>
                <div style={{ ...bebas, fontSize: 13 }}>{d.label}</div>
                <div style={{ ...mono, fontSize: 9, color: C.muted, marginTop: 1 }}>{d.exercises.length} ex</div>
              </button>
            )}
            {i===activeDay && editingLabel!==i && (
              <div style={{ display: "flex", justifyContent: "center", gap: 3, marginTop: 3 }}>
                <button onClick={() => { setDraftLabel(d.label); setEditingLabel(i); }} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer" }}>✎</button>
                <button onClick={() => onCopyDay(d)} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer" }}>⎘</button>
                {days.length > 1 && <button onClick={() => removeDay(i)} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: "#a05555", cursor: "pointer" }}>✕</button>}
              </div>
            )}
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <button onClick={addDay} style={{ padding: "10px 12px", borderRadius: 7, border: `1px dashed ${C.border}`, background: "none", color: C.muted, cursor: "pointer", ...mono, fontSize: 11, whiteSpace: "nowrap" }}>+ Day</button>
          {dayClipboard && <button onClick={pasteDay} style={{ padding: "5px 10px", borderRadius: 7, border: `1px dashed ${C.purple}`, background: "rgba(91,127,166,0.06)", color: C.purple, cursor: "pointer", ...mono, fontSize: 10 }}>⎘ Paste</button>}
        </div>
      </div>
      <div style={{ marginBottom: 16 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        {day.exercises.length === 0 && <div style={{ textAlign: "center", padding: "32px 0", color: C.muted, ...mono, fontSize: 12 }}>No exercises yet.</div>}
        {day.exercises.map((ex, idx) => (
          <div key={ex.id} style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <input value={ex.text} onChange={e => updateEx(ex.id,"text",e.target.value)} style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, background: "transparent", border: "none", borderBottom: `1px solid transparent`, color: C.white, width: "100%", outline: "none", padding: "1px 0" }} onFocus={e => e.target.style.borderBottomColor=C.gray3} onBlur={e => e.target.style.borderBottomColor="transparent"} />
                <span style={{ ...mono, fontSize: 10, color: C.muted }}>{ex.category}</span>
                <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <input value={ex.sets} onChange={e => updateEx(ex.id,"sets",e.target.value)} placeholder="Sets / volume" style={{ flex: 1, minWidth: 80, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: C.orange, fontSize: 11, ...mono, outline: "none" }} />
                  <input value={ex.notes} onChange={e => updateEx(ex.id,"notes",e.target.value)} placeholder="Coach notes..." style={{ flex: 2, minWidth: 100, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: "#666", fontSize: 11, outline: "none" }} />
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
                <button onClick={() => moveEx(ex.id,-1)} disabled={idx===0} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer", padding: "3px 7px", fontSize: 11 }}>↑</button>
                <button onClick={() => moveEx(ex.id,1)} disabled={idx===day.exercises.length-1} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer", padding: "3px 7px", fontSize: 11 }}>↓</button>
                <button onClick={() => onCopy(ex)} style={{ background: clipboard?.id===ex.id?"rgba(61,158,122,0.12)":"none", border: `1px solid ${clipboard?.id===ex.id?C.orange:C.border}`, borderRadius: 3, color: clipboard?.id===ex.id?C.orange:C.muted, cursor: "pointer", padding: "3px 7px", fontSize: 11 }}>⎘</button>
                <button onClick={() => removeExercise(ex.id)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: "#a05555", cursor: "pointer", padding: "3px 7px", fontSize: 11 }}>✕</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setShowPicker(true)} style={{ flex: 1, padding: "12px", borderRadius: 8, border: `1px dashed ${C.orange}`, background: "rgba(61,158,122,0.06)", color: C.orange, cursor: "pointer", ...mono, fontSize: 12 }}>+ Add Exercise</button>
        {clipboard && <button onClick={() => addExercise({...clipboard,id:uid()})} style={{ padding: "12px 14px", borderRadius: 8, border: `1px dashed ${C.purple}`, background: "rgba(91,127,166,0.06)", color: C.purple, cursor: "pointer", ...mono, fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>⎘ {clipboard.text.length>18?clipboard.text.slice(0,18)+"…":clipboard.text}</button>}
      </div>

      {showPicker && <ExercisePicker onAdd={addExercise} onClose={() => setShowPicker(false)} />}
    </div>
  );
}

// ── COACH DASHBOARD ───────────────────────────────────────────────────────────
function CoachDashboard({ athletes, plans, progress, credentials, coachPassword, onUpdateCredentials, onUpdateCoachPassword, onPlanChange, onProgressChange, onOverflowChange, onEditExercise, onAddAthlete, onDeleteAthlete, onSave, onSavePasswords, onLogout, onImport, saved }) {
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("coach");
  const [clipboard, setClipboard] = useState(null);
  const [dayClipboard, setDayClipboard] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newAthlete, setNewAthlete] = useState({ name: "", type: "Youth Comp", level: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [exportJson, setExportJson] = useState("");
  const [copied, setCopied] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState(false);
  const [draftCoachPw, setDraftCoachPw] = useState(coachPassword || "");
  const [draftCreds, setDraftCreds] = useState({ ...credentials });

  const selected = athletes.find(a => a.id === selectedId);
  const btnS = (active) => ({ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, padding: "6px 10px", borderRadius: 4, border: `1px solid ${active?C.orange:C.border}`, background: active?"rgba(61,158,122,0.1)":"none", color: active?C.orange:C.muted, cursor: "pointer" });

  const doExport = () => {
    setExportJson(JSON.stringify({ athletes, plans, progress, credentials, coachPassword, exportedAt: new Date().toISOString() }));
    setShowExport(true);
  };
  const copyExport = () => {
    const ta = document.querySelector("#exp-ta");
    if (ta) { ta.select(); document.execCommand("copy"); }
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };
  const applyImport = async (text) => {
    try { await onImport(JSON.parse(text)); setShowImportModal(false); setImportText(""); }
    catch { setImportError(true); setTimeout(() => setImportError(false), 3000); }
  };
  const savePasswords = () => {
    onUpdateCoachPassword(draftCoachPw);
    onUpdateCredentials(draftCreds);
    onSavePasswords(draftCoachPw, draftCreds);
    setShowPasswords(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.black }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56, borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: 6 }}>
        <div style={{ ...bebas, fontSize: 18, letterSpacing: 2, flexShrink: 0 }}>Rock Point <span style={{ color: C.orange }}>Coaching</span></div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          {saved && <span style={{ ...mono, fontSize: 10, color: "#2aaa5e" }}>✓</span>}
          <button onClick={doExport} style={btnS(false)}>↓ Export</button>
          <button onClick={() => { setImportText(""); setShowImportModal(true); }} style={btnS(false)}>↑ Import</button>
          <button onClick={() => { setDraftCoachPw(coachPassword||""); setDraftCreds({...credentials}); setShowPasswords(true); }} style={btnS(false)}>🔑</button>
          <div style={{ width: 1, height: 20, background: C.border }} />
          <button onClick={() => setMode("coach")} style={btnS(mode==="coach")}>Coach</button>
          <button onClick={() => setMode("athlete")} style={btnS(mode==="athlete")}>Athlete</button>
          <div style={{ width: 1, height: 20, background: C.border }} />
          <button onClick={onLogout} style={{ ...mono, fontSize: 10, padding: "6px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>↩</button>
        </div>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.purple}, transparent)`, flexShrink: 0 }} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 200, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: C.muted }}>Athletes</span>
            <button onClick={() => setShowAdd(true)} style={{ background: C.orange, border: "none", color: "#fff", width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {athletes.map(a => (
              <div key={a.id} style={{ position: "relative", marginBottom: 2 }}
                onMouseEnter={e => { const b=e.currentTarget.querySelector(".del"); if(b) b.style.opacity="1"; }}
                onMouseLeave={e => { const b=e.currentTarget.querySelector(".del"); if(b) b.style.opacity="0"; }}>
                <button onClick={() => setSelectedId(a.id)} style={{ width: "100%", textAlign: "left", background: selectedId===a.id?C.gray2:"none", border: `1px solid ${selectedId===a.id?C.orange:"transparent"}`, borderRadius: 6, padding: "10px 32px 10px 12px", cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 4 }}>{a.name}</div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}><Badge type={a.type} /><span style={{ ...mono, fontSize: 9, color: C.muted }}>{a.level}</span></div>
                </button>
                <button className="del" onClick={() => setConfirmDelete(a.id)} style={{ position: "absolute", top: 8, right: 4, opacity: 0, background: "none", border: "none", color: "#a05555", cursor: "pointer", fontSize: 13, padding: "2px 5px", transition: "opacity 0.15s" }}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, color: C.muted }}>
              <div style={{ fontSize: 40, opacity: 0.25 }}>🧗</div>
              <p style={{ ...mono, fontSize: 12 }}>Select an athlete</p>
            </div>
          ) : mode === "coach" ? (
            <CoachPlanEditor athlete={selected} plan={plans[selected.id]} onPlanChange={(p) => onPlanChange(selected.id,p)} clipboard={clipboard} onCopy={setClipboard} dayClipboard={dayClipboard} onCopyDay={setDayClipboard} />
          ) : (
            <AthleteView athlete={selected} plan={plans[selected.id]} progress={progress[selected.id]||{}} onProgressChange={(d,e,ep) => onProgressChange(selected.id,d,e,ep)} onOverflowChange={(ov) => onOverflowChange(selected.id,ov)} onEditExercise={(d,ex) => onEditExercise(selected.id,d,ex)} onLogout={()=>{}} />
          )}
        </div>
      </div>

      {/* ADD ATHLETE */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 380, maxWidth: "100%", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 18 }}>Add Athlete</div>
            {[{label:"Name",key:"name",ph:"Alex Torres"},{label:"Level",key:"level",ph:"V7, 5.12a..."}].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <div style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>{f.label}</div>
                <input value={newAthlete[f.key]} onChange={e => setNewAthlete(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={{ width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }} />
              </div>
            ))}
            <div style={{ marginBottom: 18 }}>
              <div style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>Type</div>
              <select value={newAthlete.type} onChange={e => setNewAthlete(p=>({...p,type:e.target.value}))} style={{ width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                {["Youth Comp","Adult Performance","Adult Recreational"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAdd(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { if(!newAthlete.name.trim()) return; onAddAthlete({id:uid(),...newAthlete}); setShowAdd(false); setNewAthlete({name:"",type:"Youth Comp",level:""}); }} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Add</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 340, maxWidth: "100%", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 8 }}>Remove Athlete?</div>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>This will permanently remove <strong style={{ color: C.white }}>{athletes.find(x=>x.id===confirmDelete)?.name}</strong> and their plan.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { onDeleteAthlete(confirmDelete); if(selectedId===confirmDelete) setSelectedId(null); setConfirmDelete(null); }} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: "#a05555", border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORDS */}
      {showPasswords && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 440, maxWidth: "100%", maxHeight: "85vh", overflow: "auto", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 6 }}>Passwords</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 20 }}>Set passwords for athletes and coach access. Share each password directly with the athlete.</p>
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Coach Password</div>
              <input type="text" value={draftCoachPw} onChange={e => setDraftCoachPw(e.target.value)} placeholder="Set a coach password..." style={{ width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }} />
            </div>
            <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Athlete Passwords</div>
            {athletes.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.white, minWidth: 100 }}>{a.name}</div>
                <input type="text" value={draftCreds[a.id]||""} onChange={e => setDraftCreds(d=>({...d,[a.id]:e.target.value}))} placeholder="Set password..." style={{ flex: 1, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "7px 10px", color: C.white, fontSize: 12, outline: "none", ...mono }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setShowPasswords(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={savePasswords} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT */}
      {showExport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 520, maxWidth: "100%", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 8 }}>Export Backup</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 14 }}>Copy and save somewhere safe. Includes all data and passwords.</p>
            <textarea id="exp-ta" readOnly value={exportJson} rows={6} style={{ width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "10px 12px", color: C.white, fontSize: 11, ...mono, outline: "none", resize: "none", marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowExport(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Close</button>
              <button onClick={copyExport} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>{copied?"✓ Copied!":"Copy to Clipboard"}</button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT */}
      {showImportModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 520, maxWidth: "100%", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 8 }}>Import Backup</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 14 }}>Paste your backup JSON and hit Restore.</p>
            <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="Paste backup JSON here..." rows={6} style={{ width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "10px 12px", color: C.white, fontSize: 11, ...mono, outline: "none", resize: "none", marginBottom: 14 }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowImportModal(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => applyImport(importText)} disabled={!importText.trim()} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: importText.trim()?C.orange:C.gray3, border: "none", borderRadius: 5, color: importText.trim()?"#fff":C.muted, cursor: importText.trim()?"pointer":"default" }}>Restore</button>
            </div>
          </div>
        </div>
      )}

      {importError && <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: "#a05555", color: "#fff", padding: "10px 18px", borderRadius: 6, ...mono, fontSize: 11, zIndex: 500 }}>Could not read backup.</div>}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState(SEED_ATHLETES);
  const [plans, setPlans] = useState({});
  const [progress, setProgress] = useState({});
  const [credentials, setCredentials] = useState({});
  const [coachPassword, setCoachPassword] = useState("");
  const [session, setSession] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const sa = await storageGet("rp:athletes");
      const sp = await storageGet("rp:plans");
      const spr = await storageGet("rp:progress");
      const sc = await storageGet("rp:credentials");
      const scp = await storageGet("rp:coachpw");
      const ra = sa || SEED_ATHLETES;
      const rp = sp || SEED_PLANS;
      setAthletes(ra); setPlans(rp); setProgress(spr||{}); setCredentials(sc||{}); setCoachPassword(scp||"");
      if (!sa) await storageSet("rp:athletes", ra);
      if (!sp) await storageSet("rp:plans", rp);
      setLoading(false);
    })();
  }, []);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const saveAll = async (a, p, pr, c, cp) => {
    const ra = a??athletes, rp = p??plans, rpr = pr??progress, rc = c??credentials, rcp = cp??coachPassword;
    await storageSet("rp:athletes",ra); await storageSet("rp:plans",rp); await storageSet("rp:progress",rpr);
    await storageSet("rp:credentials",rc); await storageSet("rp:coachpw",rcp);
    flash();
  };

  const updatePlan = (id, plan) => { const np={...plans,[id]:plan}; setPlans(np); saveAll(null,np,null,null,null); };
  const updateProgress = (id, dayIdx, exId, ep) => { const ap=progress[id]||{}; const dp=ap[dayIdx]||{}; const np={...progress,[id]:{...ap,[dayIdx]:{...dp,[exId]:ep}}}; setProgress(np); saveAll(null,null,np,null,null); };
  const updateOverflow = (id, ov) => { const ap=progress[id]||{}; const np={...progress,[id]:{...ap,overflow:ov}}; setProgress(np); saveAll(null,null,np,null,null); };
  const editExercise = (id, dayIdx, updatedEx) => {
    const p=plans[id]; if(!p) return;
    if (dayIdx==="overflow") { const ap=progress[id]||{}; const ov=(ap.overflow||[]).map(e=>e.id===updatedEx.id?{...e,...updatedEx}:e); const np={...progress,[id]:{...ap,overflow:ov}}; setProgress(np); saveAll(null,null,np,null,null); }
    else { const nd=p.days.map((d,i)=>i===dayIdx?{...d,exercises:d.exercises.map(e=>e.id===updatedEx.id?updatedEx:e)}:d); const np={...plans,[id]:{...p,days:nd}}; setPlans(np); saveAll(null,np,null,null,null); }
  };
  const addAthlete = (a) => { const na=[...athletes,a]; setAthletes(na); saveAll(na,null,null,null,null); };
  const deleteAthlete = (id) => { const na=athletes.filter(a=>a.id!==id); setAthletes(na); saveAll(na,null,null,null,null); };
  const handleImport = async (data) => {
    if(data.athletes){setAthletes(data.athletes);} if(data.plans){setPlans(data.plans);}
    if(data.progress){setProgress(data.progress);} if(data.credentials){setCredentials(data.credentials);}
    if(data.coachPassword!==undefined){setCoachPassword(data.coachPassword);}
    await saveAll(data.athletes,data.plans,data.progress,data.credentials,data.coachPassword);
  };

  if (loading) return <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",...mono,fontSize:12,color:C.muted,background:C.black }}>Loading...</div>;

  if (!session) return <LoginScreen athletes={athletes} credentials={credentials} coachPassword={coachPassword} onLoginAthlete={(id)=>setSession({role:"athlete",athleteId:id})} onLoginCoach={()=>setSession({role:"coach"})} />;

  if (session.role === "athlete") {
    const athlete = athletes.find(a=>a.id===session.athleteId);
    return <AthleteView athlete={athlete} plan={plans[session.athleteId]} progress={progress[session.athleteId]||{}} onProgressChange={(d,e,ep)=>updateProgress(session.athleteId,d,e,ep)} onOverflowChange={(ov)=>updateOverflow(session.athleteId,ov)} onEditExercise={(d,ex)=>editExercise(session.athleteId,d,ex)} onLogout={()=>setSession(null)} />;
  }

  const savePasswords = async (cp, c) => { setCoachPassword(cp); setCredentials(c); await storageSet("rp:credentials", c); await storageSet("rp:coachpw", cp); flash(); };
  return <CoachDashboard athletes={athletes} plans={plans} progress={progress} credentials={credentials} coachPassword={coachPassword} onUpdateCredentials={(c)=>{setCredentials(c);}} onUpdateCoachPassword={(p)=>{setCoachPassword(p);}} onPlanChange={updatePlan} onProgressChange={updateProgress} onOverflowChange={updateOverflow} onEditExercise={editExercise} onAddAthlete={addAthlete} onDeleteAthlete={deleteAthlete} onSave={()=>saveAll(null,null,null,null,null)} onSavePasswords={savePasswords} onLogout={()=>setSession(null)} onImport={handleImport} saved={saved} />;
}
