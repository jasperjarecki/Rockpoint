import React from "react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mhpjmofctkxxjbjjcvwt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ocGptb2ZjdGt4eGpiampjdnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MDgyNTAsImV4cCI6MjA4ODQ4NDI1MH0.p4eZQcd0lUlE2D0J8-arRDJqOSEV4TNMmg6vTlSwLvU";
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { realtime: { enabled: false }, global: { fetch: fetch.bind(globalThis) } });

const LIBRARY = {
  "Fingerboard / Hangboard": ["Fingerboard Warmup and Rehab","Fingerboard Warmup","Max Hangs (7s on / 3min off)","Max Hangs (7s on/2min off)","Max Hangs (10 reps/2min off)","3 finger drag max hangs (7s on:2min off)","Repeaters (7s on / 3s off × 6)","One-Arm Deadhangs","Open-Hand Hangs","Half-Crimp Hangs","Recruitment Pulls","Density Hangs","Commercial Bouldering","Tension Board Boulders","Explosive Bodyweight Pull-ups"],
  "Limit Bouldering": ["Limit Boulder Problems (4×20min)","Limit Commercial Boulder Problems -- 1.5 hrs","Project Attempts (3–5 moves)","Flash Attempts","Flash Attempts -- Strength/Power","Bouldering Mileage","Crux Isolation Reps"],
  "Board Climbing (Kilter/Tension)": ["Kilter Board — Power Sets","Tension Board — Project","Tension Board — Limit Problems","Board Warm-Up Laps","Steep Board Endurance","Footwork Focus Sets"],
  "ARC / Endurance": ["ARC Laps (20min continuous)","4×4s","4x4","Endurance Laps","Enduro Triples OR Circuits","4×4s (BACKUP FOR CIRCUITS)","Linked Boulder Circuits","Traverse Laps","Capacity Intervals"],
  "System Board": ["Campus Makeups","System Board — Shoulder Press","System Board — Lock-Off Holds","Foot-Hand Matching Drills","Hip Positioning Drills"],
  "Campus Board": ["Campus Ladders (1-3-5)","Campus Ladders (1-2-3-4-5)","Double Dynos","Campus Touches","Offset Ladders"],
  "Strength (pull-ups, rows, etc.)": ["Weighted Pull-Ups","Weighted Pull-Up Negatives","Weighted Negatives + Explosive Pulls","Weighted Scap Pulls","One-Arm Pull-Up Progressions","Archer Pullups","Half Levers","Hanging Lat Pulls","Seated External Rotation","Incline Bench Press","Bench Press","Dips","Face Pulls","Hammer Curls","Reverse Curls","Cable Lat Pullover","Heavy Wrist Curls","Inverted Rows","Barbell Rows","Dumbbell Rows","Rear Delt Flies","Ring Push-Ups","Shoulder Press"],
  "Core / Antagonist": ["Front Lever Progressions","Dead Bug (3×10)","Hollow Body Holds","Copenhagen Planks","Wrist Curls / Extensions","Reverse Wrist Curls","Rotator Cuff Band Work","Plank Variations"],
  "Movement / Drills": ["Slab Practice","Slabapalooza","Comp Boulders","Campus Makeups","Route Climbing","Silent Feet Drills","Hip Drop Exercises","Flagging Practice","Balance Slab","Drop Knee Sequences","Breath & Tension Control"],
  "Recovery / Mobility": ["Forearm Stretching Routine","Thoracic Mobility","Hip Flexor Stretch","Shoulder Circles","Easy Traversing (flush out)","Foam Roll","Ice / Contrast Bath"],
  "Mental Training / Performance": ["Visualization Practice","Breathing / Relaxation Routine","Focus Cues","Pre-climb Ritual","Fear Ladder / Exposure Work","Journaling / Reflection","Video Review"],
  "Other": [],
};
const ALL_CATEGORIES = Object.keys(LIBRARY);

const C = {
  black: "#f5f5f3", white: "#111111", orange: "#3d9e7a", purple: "#5b7fa6",
  gray: "#ffffff", gray2: "#f0efed", gray3: "#d8d8d6", muted: "#888884", border: "#e0e0de",
};

const SEED_ATHLETES = [
  { id: "a1", name: "Maya Torres", type: "Youth Comp", level: "V9" },
  { id: "a2", name: "Derek Sato", type: "Adult Performance", level: "5.13a" },
  { id: "a3", name: "Nadia Price", type: "Adult Recreational", level: "V4" },
  { id: "8ygufmv", name: "Patrick Daly", type: "Adult Performance", level: "V13/14, 14d" },
];

const PATRICK_DAYS = [
  { label: "Day 1 - Strength + Power", exercises: [
    { id: "wc5dbxl", text: "Fingerboard Warmup", category: "Fingerboard / Hangboard", sets: "18 sets", notes: "10s on: 20s rest. (1) 5 sets 3 finger drag (2) 5 sets open hand (3) 2 sets index middle (4) 2 sets middle ring (5) 4 sets half crimp." },
    { id: "osf9o4v", text: "3 finger drag max hangs (7s on:2min off)", category: "Fingerboard / Hangboard", sets: "5 sets per side.", notes: "One arm hangs. Treat first two sets as warmup/weight discovery. Increase weight between sets until you reach max." },
    { id: "fra147y", text: "Tension Board — Project", category: "Board Climbing (Kilter/Tension)", sets: "1 boulder", notes: "Pick a boulder you believe will take you more than 2 sessions." },
    { id: "utpnyn6", text: "Tension Board — Limit Problems", category: "Board Climbing (Kilter/Tension)", sets: "3-5 boulders", notes: "Choose climbs that you believe are attainable in 5-10 attempts." },
    { id: "d1blcjx", text: "Weighted Pull-Ups", category: "Strength (pull-ups, rows, etc.)", sets: "4 sets", notes: "5 reps max." },
    { id: "uw8d6g8", text: "Bench Press", category: "Strength (pull-ups, rows, etc.)", sets: "3 sets", notes: "5 reps per set." },
  ]},
  { label: "Day 2 - Power and Skills", exercises: [
    { id: "ahbeegz", text: "Fingerboard Warmup", category: "Fingerboard / Hangboard", sets: "18 sets", notes: "10s on: 20s rest." },
    { id: "p568n10", text: "Flash Attempts -- Strength/Power", category: "Limit Bouldering", sets: "10 boulders", notes: "Hard flash boulders. 3 good attempts, then move on." },
    { id: "luk1prw", text: "Comp Boulders", category: "Movement / Drills", sets: "3-10 boulders", notes: "4 minute drills when crowds permit." },
    { id: "nyuky5b", text: "Slab Practice", category: "Movement / Drills", sets: "30 mins", notes: "Either hard slabs or makeups at the gym." },
    { id: "n5s5mcy", text: "Weighted Pull-Up Negatives", category: "Strength (pull-ups, rows, etc.)", sets: "3", notes: "NEGATIVES. 80% of max. 3 reps of just negatives." },
    { id: "u0ypke9", text: "Incline Bench Press", category: "Strength (pull-ups, rows, etc.)", sets: "3", notes: "Sets to failure, choose weight so you are in the 6-8 rep range." },
  ]},
  { label: "Day 3 - Fitness", exercises: [
    { id: "fv96y2q", text: "Fingerboard Warmup", category: "Fingerboard / Hangboard", sets: "18 sets", notes: "10s on: 20s rest." },
    { id: "mvu399y", text: "4x4", category: "ARC / Endurance", sets: "4", notes: "Find non-crimpy boulders. 4 laps with no rest. Rest 4 minutes between sets." },
    { id: "0lxq8d8", text: "Endurance Laps", category: "ARC / Endurance", sets: "3 sets", notes: "If partner available, trifectas. If partner unavailable, 30-40 move circuit on spray wall." },
  ]},
  { label: "Day 4 - Power & Shoulders", exercises: [
    { id: "zh83j33", text: "Fingerboard Warmup", category: "Fingerboard / Hangboard", sets: "18 sets", notes: "10s on: 20s rest." },
    { id: "ufs4xje", text: "Campus Makeups", category: "System Board", sets: "20 minutes", notes: "Make ~5 hard flash level campus makeups." },
    { id: "c198tu2", text: "Seated External Rotation", category: "Strength (pull-ups, rows, etc.)", sets: "5", notes: "A la Aidan Roberts. To failure." },
    { id: "i4h95ul", text: "Lat Pulls", category: "Strength (pull-ups, rows, etc.)", sets: "3", notes: "Each set to failure." },
  ]},
];

const SEED_PLANS = {
  a1: {
    weeks: [{ label: "Week 1", days: [
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
        { id: "e8", text: "Limit Boulder Problems (4×20min)", category: "Limit Bouldering", sets: "4×20min", notes: "Real limit." },
        { id: "e9", text: "Campus Ladders (1-3-5)", category: "Campus Board", sets: "5 ladders", notes: "No feet. Full lock-off." },
        { id: "e10", text: "Copenhagen Planks", category: "Core / Antagonist", sets: "3×20s each", notes: "" },
      ]},
    ]}],
    published: [0],
    blockStart: "", blockEnd: "", blockNotes: "",
  },
  "8ygufmv": {
    weeks: [{ label: "Week 1", days: PATRICK_DAYS }],
    published: [0],
    blockStart: "", blockEnd: "", blockNotes: "",
  },
};

const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap";
document.head.appendChild(_fl);
const _gs = document.createElement("style");
_gs.textContent = `*, *::before, *::after{box-sizing:border-box;margin:0;padding:0} body{background:${C.black};color:${C.white};font-family:'DM Sans',sans-serif} ::-webkit-scrollbar{width:3px;height:3px} ::-webkit-scrollbar-thumb{background:${C.gray3};border-radius:2px} input,textarea,select{font-family:'DM Sans',sans-serif} textarea.athlete-note::placeholder{color:#888;font-style:normal;font-size:12px;letter-spacing:0.3px}`;
document.head.appendChild(_gs);

const uid = () => Math.random().toString(36).slice(2, 9);
const TEMPLATE_CREATOR_ID = "__template_creator__";

function parseYouTubeTimestamp(url) {
  if (!url) return 0;
  // ?t=90 or &t=90 (seconds)
  const tSecs = url.match(/[?&]t=(\d+)s?(?:&|$)/);
  if (tSecs) return parseInt(tSecs[1]);
  // ?t=1m30s or &t=1h2m3s
  const tHMS = url.match(/[?&]t=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?(?:&|$)/);
  if (tHMS && (tHMS[1] || tHMS[2] || tHMS[3])) {
    return (parseInt(tHMS[1]||0)*3600) + (parseInt(tHMS[2]||0)*60) + (parseInt(tHMS[3]||0));
  }
  return 0;
}
function parseYouTubeEmbed(url, startSecs) {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (!match) return null;
  const id = match[1];
  // prefer explicit startSecs override, otherwise extract from URL
  const start = parseInt(startSecs) || parseYouTubeTimestamp(url);
  return `https://www.youtube.com/embed/${id}${start > 0 ? `?start=${start}` : ""}`;
}
const mono = { fontFamily: "'DM Mono', monospace" };
const bebas = { fontFamily: "'Bebas Neue', sans-serif" };

// ── MIGRATION: old flat plan → weekly plan ────────────────────────────────────
function migratePlan(plan) {
  if (!plan) return { weeks: [{ label: "Week 1", days: [] }], published: [], blockStart: "", blockEnd: "", blockNotes: "" };
  if (plan.weeks) return plan; // already migrated
  // old format had plan.days
  const days = plan.days || [];
  return {
    weeks: [{ label: "Week 1", days }],
    published: [0],
    blockStart: plan.blockStart || "",
    blockEnd: plan.blockEnd || "",
    blockNotes: plan.blockNotes || "",
  };
}

// ── SUPABASE HELPERS ──────────────────────────────────────────────────────────
async function dbGetAthletes() { const { data } = await sb.from("athletes").select("*"); return data || []; }
async function dbUpsertAthlete(a) { await sb.from("athletes").upsert({ id: a.id, name: a.name, type: a.type, level: a.level, coach_id: a.coach_id || null }); }
async function dbDeleteAthlete(id) { await sb.from("athletes").delete().eq("id", id); }
async function dbGetPlans() {
  const { data } = await sb.from("plans").select("*");
  const result = {};
  (data || []).forEach(row => { result[row.athlete_id] = migratePlan(row.data); });
  return result;
}
async function dbUpsertPlan(athleteId, planData) { await sb.from("plans").upsert({ athlete_id: athleteId, data: planData }); }
async function dbBackupPlan(athleteId, planData) {
  try {
    // keep only last 10 backups per athlete
    const { data: existing } = await sb.from("plan_backups").select("id").eq("athlete_id", athleteId).order("saved_at", { ascending: true });
    if (existing && existing.length >= 10) {
      const toDelete = existing.slice(0, existing.length - 9).map(r => r.id);
      await sb.from("plan_backups").delete().in("id", toDelete);
    }
    await sb.from("plan_backups").insert({ athlete_id: athleteId, data: planData });
  } catch(e) { console.warn("Backup failed:", e); }
}
async function dbGetProgress() {
  const { data } = await sb.from("progress").select("*");
  const result = {};
  (data || []).forEach(row => { result[row.athlete_id] = row.data; });
  return result;
}
async function dbUpsertProgress(athleteId, progressData) { await sb.from("progress").upsert({ athlete_id: athleteId, data: progressData }); }
async function dbGetCredentials() {
  const { data } = await sb.from("credentials").select("*");
  const result = {};
  (data || []).forEach(row => { result[row.athlete_id] = row.password; });
  return result;
}
async function dbUpsertCredential(athleteId, password) {
  if (password) { await sb.from("credentials").upsert({ athlete_id: athleteId, password }); }
  else { await sb.from("credentials").delete().eq("athlete_id", athleteId); }
}
async function dbGetCoachPassword() { const { data } = await sb.from("coach_settings").select("password").eq("id", 1).single(); return data?.password || ""; }
async function dbSetCoachPassword(password) { await sb.from("coach_settings").upsert({ id: 1, password }); }
async function dbGetCoaches() { const { data } = await sb.from("coaches").select("*"); return data || []; }
async function dbUpsertCoach(c) { await sb.from("coaches").upsert({ id: c.id, name: c.name, password: c.password }); }
async function dbDeleteCoach(id) { await sb.from("coaches").delete().eq("id", id); }
async function dbGetTemplates(coachId) {
  const q = coachId ? sb.from("templates").select("*").eq("coach_id", coachId) : sb.from("templates").select("*").is("coach_id", null);
  const { data } = await q.order("created_at", { ascending: false });
  return data || [];
}
async function dbSaveTemplate(t) { await sb.from("templates").upsert({ id: t.id, coach_id: t.coachId || null, name: t.name, type: t.type, data: t.data }); }
async function dbDeleteTemplate(id) { await sb.from("templates").delete().eq("id", id); }
async function dbGetAthletesByCoach(coachId) { const { data } = await sb.from("athletes").select("*").eq("coach_id", coachId); return data || []; }
async function dbUpsertAthleteWithCoach(a) { await sb.from("athletes").upsert({ id: a.id, name: a.name, type: a.type, level: a.level, coach_id: a.coach_id }); }
async function dbUploadBlockImage(athleteId, file) {
  const ext = file.name.split(".").pop();
  const path = `${athleteId}/block-image.${ext}`;
  await sb.storage.from("athlete-images").remove([path]);
  const { error } = await sb.storage.from("athlete-images").upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = sb.storage.from("athlete-images").getPublicUrl(path);
  return data.publicUrl + "?t=" + Date.now();
}
async function dbDeleteBlockImage(url) {
  if (!url) return;
  const idx = url.indexOf('athlete-images/');
  if (idx === -1) return;
  const path = url.slice(idx + 'athlete-images/'.length).split('?')[0];
  await sb.storage.from('athlete-images').remove([decodeURIComponent(path)]);
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function Badge({ type }) {
  const map = { "Youth Comp": { bg: "rgba(91,127,166,0.1)", color: "#4a7aab" }, "Adult Performance": { bg: "rgba(61,158,122,0.15)", color: C.orange }, "Adult Recreational": { bg: "rgba(194,130,50,0.12)", color: "#a06818" } };
  const s = map[type] || map["Adult Recreational"];
  return <span style={{ ...mono, fontSize: 9, letterSpacing: 1, textTransform: "uppercase", padding: "2px 7px", borderRadius: 3, background: s.bg, color: s.color }}>{type}</span>;
}

function WeekBadge({ plan }) {
  if (!plan?.blockStart || !plan?.blockEnd) return null;
  const [sy, sm, sd] = plan.blockStart.split("-").map(Number);
  const [ey, em, ed] = plan.blockEnd.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  if (now > end) return null;
  let label;
  if (now < start) {
    const daysUntil = Math.round((start - now) / (24 * 60 * 60 * 1000));
    const dayName = start.toLocaleDateString("en-US", { weekday: "long" });
    label = daysUntil === 1 ? "Block starts tomorrow" : daysUntil <= 6 ? `Block starts ${dayName}` : daysUntil === 7 ? "Block starts in one week" : `Block starts in ${daysUntil} days`;
  } else {
    const totalWeeks = Math.ceil((end - start) / (7 * 24 * 60 * 60 * 1000));
    const currentWeek = Math.min(Math.ceil((now - start + 1) / (7 * 24 * 60 * 60 * 1000)), totalWeeks);
    label = `Week ${currentWeek} of ${totalWeeks}`;
  }
  return <span style={{ ...mono, fontSize: 10, color: C.muted, background: C.gray2, border: `1px solid ${C.border}`, padding: "4px 10px", borderRadius: 5 }}>{label}</span>;
}

// ── RICH TEXT EDITOR ──────────────────────────────────────────────────────────
function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split('\n');
  const els = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      els.push(<div key={i} style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1, color:"#111", marginBottom: 6, marginTop: i>0?12:0 }}>{line.slice(2)}</div>);
    } else if (line.startsWith('## ')) {
      els.push(<div key={i} style={{ fontFamily:"'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, color:"#111", marginBottom: 4, marginTop: i>0?10:0 }}>{line.slice(3)}</div>);
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('• '))) {
        items.push(<li key={i} style={{ marginBottom: 3 }}>{inlineFormat(lines[i].slice(2))}</li>);
        i++;
      }
      els.push(<ul key={'ul'+i} style={{ paddingLeft: 18, marginBottom: 8, marginTop: 2 }}>{items}</ul>);
      continue;
    } else if (line.trim() === '') {
      els.push(<div key={i} style={{ height: 6 }} />);
    } else {
      els.push(<div key={i} style={{ marginBottom: 4, lineHeight: 1.65 }}>{inlineFormat(line)}</div>);
    }
    i++;
  }
  return els;
}

function inlineFormat(text) {
  const parts = [];
  let rest = text;
  let key = 0;
  while (rest.length > 0) {
    const boldMatch = rest.match(/^\*\*(.+?)\*\*/);
    const italicMatch = rest.match(/^\*(.+?)\*/);
    const boldItalicMatch = rest.match(/^\*\*\*(.+?)\*\*\*/);
    if (boldItalicMatch && rest.startsWith('***')) {
      parts.push(<strong key={key++}><em>{boldItalicMatch[1]}</em></strong>);
      rest = rest.slice(boldItalicMatch[0].length);
    } else if (boldMatch && rest.startsWith('**')) {
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      rest = rest.slice(boldMatch[0].length);
    } else if (italicMatch && rest.startsWith('*')) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      rest = rest.slice(italicMatch[0].length);
    } else {
      const next = rest.search(/\*\*\*|\*\*|\*/);
      if (next === -1) { parts.push(rest); rest = ''; }
      else { parts.push(rest.slice(0, next)); rest = rest.slice(next); }
    }
  }
  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <span>{parts}</span>;
}

function RichTextEditor({ value, onChange, placeholder, rows = 4 }) {
  const [focused, setFocused] = useState(false);
  const ref = React.useRef(null);

  const wrap = (before, after) => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = value.slice(start, end);
    const newVal = value.slice(0, start) + before + sel + after + value.slice(end);
    onChange(newVal);
    setTimeout(() => {
      el.focus();
      el.selectionStart = start + before.length;
      el.selectionEnd = end + before.length;
    }, 0);
  };

  const insertBullet = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const newVal = value.slice(0, lineStart) + '- ' + value.slice(lineStart);
    onChange(newVal);
    setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + 2; }, 0);
  };

  const toolBtn = (label, action) => (
    <button key={label} onMouseDown={e => { e.preventDefault(); action(); }}
      style={{ ...mono, fontSize: 11, padding: "4px 9px", borderRadius: 4, border: `1px solid ${C.border}`, background: C.gray, color: C.white, cursor: "pointer", fontWeight: label==="B"?700:"normal", fontStyle: label==="I"?"italic":"normal" }}>{label}</button>
  );

  return (
    <div style={{ border: `1px solid ${focused ? C.orange : C.border}`, borderRadius: 8, overflow: "hidden", background: "#eceae7" }}>
      <div style={{ display: "flex", gap: 4, padding: "6px 8px", borderBottom: `1px solid ${C.border}`, background: C.gray2, flexWrap: "wrap" }}>
        {toolBtn("B", () => wrap("**", "**"))}
        {toolBtn("I", () => wrap("*", "*"))}
        {toolBtn("H1", () => wrap("# ", ""))}
        {toolBtn("H2", () => wrap("## ", ""))}
        {toolBtn("•", insertBullet)}
      </div>
      <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", background: "transparent", border: "none", color: "#111", fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", padding: "10px 12px", fontFamily: "'DM Mono', monospace" }} />
    </div>
  );
}

// ── EXERCISE CARD ─────────────────────────────────────────────────────────────
function ExerciseCard({ ex, ep = {}, onToggle, onNote, onMoveToOverflow, onRestoreDay, onEdit, isOverflow, isShared, sourceDayLabel, alsoOnLabels }) {
  const checked = !!ep.checked;
  const note = ep.note || "";
  const selectedOption = ep.selectedOption ?? null;
  const deferToOtherDay = !!ep.deferToOtherDay;
  const [editing, setEditing] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [draft, setDraft] = useState({ text: ex.text, sets: ex.sets || "", notes: ex.notes || "", category: ex.category || "", videoUrl: ex.videoUrl || "", videoStart: ex.videoStart || "" });
  const hasOptions = ex.options && ex.options.length > 0;
  const embedUrl = parseYouTubeEmbed(ex.videoUrl, ex.videoStart);
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
              <input value={draft.videoUrl||""} onChange={e => setDraft(d => ({ ...d, videoUrl: e.target.value }))} placeholder="YouTube URL (timestamp auto-detected from URL)..." style={inp} />
              <select value={ALL_CATEGORIES.includes(draft.category) ? draft.category : "Other"} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} style={{ ...inp, color: C.muted }}>
                {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={() => { setDraft({ text: ex.text, sets: ex.sets || "", notes: ex.notes || "", category: ex.category || "", videoUrl: ex.videoUrl || "", videoStart: ex.videoStart || "" }); setEditing(false); }} style={{ ...mono, fontSize: 11, padding: "6px 12px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
                <button onClick={() => { onEdit({ ...ex, ...draft }); setEditing(false); }} style={{ ...mono, fontSize: 11, padding: "6px 14px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Save</button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: checked ? C.muted : C.white, textDecoration: checked ? "line-through" : "none", lineHeight: 1.4 }}>{ex.text}</div>
                {embedUrl && !editing && (
                  <button onClick={() => setShowVideo(true)} style={{ ...mono, fontSize: 9, padding: "3px 8px", borderRadius: 4, border: `1px solid #c0392b`, background: "rgba(192,57,43,0.08)", color: "#c0392b", cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.5 }}>▶ Demo</button>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: ex.notes ? 6 : 0 }}>
                {ex.sets && <span style={{ fontFamily:"'DM Mono',monospace", fontSize: 15, fontWeight: 500, color: C.orange, display: "block", marginBottom: 2 }}>{ex.sets}</span>}
                <span style={{ ...mono, fontSize: 10, color: C.muted }}>{ex.category}</span>
                {isOverflow && ex.fromDay != null && <span style={{ ...mono, fontSize: 9, color: "#4a7aab", background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>skipped from {ex.fromWeek != null ? `W${ex.fromWeek + 1} · ` : ""}Day {ex.fromDay + 1}</span>}
                {sourceDayLabel && <span style={{ ...mono, fontSize: 9, color: C.purple, background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>from {sourceDayLabel}</span>}
                {alsoOnLabels && <span style={{ ...mono, fontSize: 9, color: C.purple, background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>also on {alsoOnLabels}</span>}
              </div>
              {ex.notes && <div style={{ ...mono, fontSize: 12, color: C.muted, lineHeight: 1.5, fontStyle: "italic" }}>{ex.notes}</div>}
              {alsoOnLabels && !checked && (
                <button onClick={(e) => { e.stopPropagation(); onNote(note, selectedOption, true); }}
                  style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, ...mono, fontSize: 11, padding: "7px 12px", borderRadius: 6, border: `1px solid ${deferToOtherDay ? C.purple : "rgba(91,127,166,0.3)"}`, background: deferToOtherDay ? "rgba(91,127,166,0.1)" : "transparent", color: deferToOtherDay ? C.purple : C.muted, cursor: "pointer", textAlign: "left", width: "100%" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${deferToOtherDay ? C.purple : "rgba(91,127,166,0.4)"}`, background: deferToOtherDay ? C.purple : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {deferToOtherDay && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
                  </div>
                  I'll complete this on {alsoOnLabels}
                </button>
              )}
              {/* Options */}
              {hasOptions && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Choose one</div>
                  {ex.options.map((opt, i) => {
                    const isSelected = selectedOption === i;
                    return (
                      <button key={i} onClick={() => onNote(note, isSelected ? null : i)} style={{ textAlign: "left", padding: "10px 12px", borderRadius: 7, border: `1px solid ${isSelected ? C.orange : C.border}`, background: isSelected ? "rgba(61,158,122,0.1)" : C.gray2, cursor: "pointer", transition: "all 0.15s", width: "100%" }}>
                        <div style={{ fontSize: 13, fontWeight: isSelected ? 600 : 400, color: isSelected ? C.orange : C.white, marginBottom: (opt.sets || opt.notes) ? 4 : 0 }}>{opt.label}</div>
                        {opt.sets && <div style={{ ...mono, fontSize: 12, color: isSelected ? C.orange : C.muted, opacity: 0.9 }}>{opt.sets}</div>}
                        {opt.notes && <div style={{ ...mono, fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 2, lineHeight: 1.4 }}>{opt.notes}</div>}
                      </button>
                    );
                  })}
                  {selectedOption !== null && <div style={{ ...mono, fontSize: 10, color: C.orange }}>✓ {ex.options[selectedOption]?.label}</div>}
                </div>
              )}
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
          <textarea value={note} onChange={e => onNote(e.target.value, selectedOption)} placeholder="Add a note..." rows={1} className="athlete-note"
            style={{ width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontSize: 13, resize: "none", outline: "none", padding: "7px 10px", ...mono }}
            onFocus={e => e.target.style.borderColor = C.orange} onBlur={e => e.target.style.borderColor = C.border} />
        </div>
      )}
      {/* Video modal */}
      {showVideo && embedUrl && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 700, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ ...bebas, fontSize: 18, color: "#fff", letterSpacing: 1 }}>{ex.text}</div>
              <button onClick={() => setShowVideo(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 24, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", background: "#000" }}>
              <iframe src={embedUrl} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
            <button onClick={() => setShowVideo(false)} style={{ ...mono, marginTop: 14, width: "100%", padding: "11px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", fontSize: 12 }}>Close</button>
          </div>
        </div>
      )}
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
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Category</label>
                <select value={ALL_CATEGORIES.includes(customCat) ? customCat : "Other"} onChange={e => { if (e.target.value !== "__custom__") setCustomCat(e.target.value); else setCustomCat(""); }} style={{ ...inp, marginBottom: customCat === "" || !ALL_CATEGORIES.includes(customCat) ? 8 : 0 }}>
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">+ Type custom category...</option>
                </select>
                {(customCat === "" || !ALL_CATEGORIES.includes(customCat)) && (
                  <input value={customCat} onChange={e => setCustomCat(e.target.value)} placeholder="Type category name..." style={inp} />
                )}
              </div>
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

// ── DAY EDITOR (used inside week editor) ─────────────────────────────────────
function DayEditor({ days, onDaysChange, clipboard, onCopy, dayClipboard, onCopyDay, templates = [], onSaveTemplate, onInsertDayTemplate }) {
  const [activeDay, setActiveDay] = useState(0);
  const [showPicker, setShowPicker] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [draftLabel, setDraftLabel] = useState("");

  const updateDay = (i, exs) => onDaysChange(days.map((d, j) => j===i ? {...d, exercises: exs} : d));
  const renameDay = (i, l) => onDaysChange(days.map((d, j) => j===i ? {...d, label: l} : d));
  const addDay = () => { const nd = [...days, {label:`Day ${days.length+1}`, exercises:[]}]; onDaysChange(nd); setActiveDay(nd.length-1); };
  const removeDay = (i) => { if(days.length<=1) return; const nd=days.filter((_,j)=>j!==i); onDaysChange(nd); setActiveDay(Math.min(activeDay, nd.length-1)); };
  const moveDay = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= days.length) return;
    const nd = [...days];
    [nd[i], nd[j]] = [nd[j], nd[i]];
    onDaysChange(nd);
    setActiveDay(j);
  };
  const pasteDay = () => { if(!dayClipboard) return; const nd=[...days,{label:dayClipboard.label+" (copy)",exercises:dayClipboard.exercises.map(e=>({...e,id:uid()}))}]; onDaysChange(nd); setActiveDay(nd.length-1); };
  const addExercise = (ex) => updateDay(activeDay, [...(days[activeDay]?.exercises||[]), ex]);
  const removeExercise = (id) => updateDay(activeDay, days[activeDay].exercises.filter(e=>e.id!==id));
  const moveEx = (id, dir) => { const exs=[...days[activeDay].exercises]; const i=exs.findIndex(e=>e.id===id); if(i+dir<0||i+dir>=exs.length) return; [exs[i],exs[i+dir]]=[exs[i+dir],exs[i]]; updateDay(activeDay,exs); };
  const updateEx = (id, f, v) => updateDay(activeDay, days[activeDay].exercises.map(e=>e.id===id?{...e,[f]:v}:e));
  const day = days[activeDay] || { exercises: [] };

  // inject shared exercises from other days, sorted by position
  const sharedInThisDay = days.reduce((acc, d, dIdx) => {
    if (dIdx === activeDay) return acc;
    d.exercises.forEach(ex => {
      if (ex.sharedDays && ex.sharedDays.includes(activeDay)) {
        const pos = ex.sharedDayPositions?.[activeDay] ?? 9999;
        acc.push({ ...ex, _isShared: true, _sourceDay: dIdx, _pos: pos });
      }
    });
    return acc;
  }, []).sort((a, b) => a._pos - b._pos);

  return (
    <div>
      {/* Day tabs */}
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
              <div style={{ display: "flex", justifyContent: "center", gap: 3, marginTop: 3, flexWrap: "wrap" }}>
                <button onClick={() => moveDay(i, -1)} disabled={i===0} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: i===0?"#ccc":C.muted, cursor: i===0?"default":"pointer" }}>←</button>
                <button onClick={() => moveDay(i, 1)} disabled={i===days.length-1} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: i===days.length-1?"#ccc":C.muted, cursor: i===days.length-1?"default":"pointer" }}>→</button>
                <button onClick={() => { setDraftLabel(d.label); setEditingLabel(i); }} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer" }}>✎</button>
                <button onClick={() => onCopyDay(d)} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer" }}>⎘</button>
                {onSaveTemplate && <button onClick={() => onSaveTemplate("day", d, d.label)} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.orange, cursor: "pointer" }} title="Save as template">★</button>}
                {days.length > 1 && <button onClick={() => removeDay(i)} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: "#a05555", cursor: "pointer" }}>✕</button>}
              </div>
            )}
          </div>
        ))}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <button onClick={addDay} style={{ padding: "10px 12px", borderRadius: 7, border: `1px dashed ${C.border}`, background: "none", color: C.muted, cursor: "pointer", ...mono, fontSize: 11, whiteSpace: "nowrap" }}>+ Day</button>
          {dayClipboard && <button onClick={pasteDay} style={{ padding: "5px 10px", borderRadius: 7, border: `1px dashed ${C.purple}`, background: "rgba(91,127,166,0.06)", color: C.purple, cursor: "pointer", ...mono, fontSize: 10 }}>⎘ Paste</button>}
          {onInsertDayTemplate && templates.filter(t => t.type === "day").length > 0 && <button onClick={onInsertDayTemplate} style={{ padding: "5px 10px", borderRadius: 7, border: `1px dashed ${C.orange}`, background: "rgba(61,158,122,0.06)", color: C.orange, cursor: "pointer", ...mono, fontSize: 10, whiteSpace: "nowrap" }}>★ From template</button>}
        </div>
      </div>

      {/* Exercises */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        {day.exercises.length === 0 && sharedInThisDay.length === 0 && <div style={{ textAlign: "center", padding: "32px 0", color: C.muted, ...mono, fontSize: 12 }}>No exercises yet.</div>}
        {day.exercises.map((ex, idx) => {
          const options = ex.options || [];
          const addOption = () => updateEx(ex.id, "options", [...options, { label: "", sets: "", notes: "" }]);
          const updateOption = (oi, updated) => updateEx(ex.id, "options", options.map((o, i) => i===oi ? { ...o, ...updated } : o));
          const removeOption = (oi) => updateEx(ex.id, "options", options.filter((_, i) => i !== oi));
          return (
            <div key={ex.id} style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <input value={ex.text} onChange={e => updateEx(ex.id,"text",e.target.value)} style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, background: "transparent", border: "none", borderBottom: `1px solid transparent`, color: C.white, width: "100%", outline: "none", padding: "1px 0" }} onFocus={e => e.target.style.borderBottomColor=C.gray3} onBlur={e => e.target.style.borderBottomColor="transparent"} />
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                    <select value={ALL_CATEGORIES.includes(ex.category) ? ex.category : "__custom__"}
                      onChange={e => { if (e.target.value !== "__custom__") updateEx(ex.id, "category", e.target.value); else updateEx(ex.id, "category", ""); }}
                      style={{ ...mono, fontSize: 10, color: C.muted, background: "transparent", border: "none", outline: "none", cursor: "pointer", padding: 0, appearance: "none", WebkitAppearance: "none" }}>
                      {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      {!ALL_CATEGORIES.includes(ex.category) && ex.category && <option value="__custom__">{ex.category}</option>}
                      <option value="__custom__">+ Custom...</option>
                    </select>
                    <span style={{ ...mono, fontSize: 9, color: C.muted, opacity: 0.5 }}>▾</span>
                    {!ALL_CATEGORIES.includes(ex.category) && (
                      <input value={ex.category} onChange={e => updateEx(ex.id, "category", e.target.value)} placeholder="Type category..."
                        style={{ ...mono, fontSize: 10, color: C.muted, background: "transparent", border: "none", borderBottom: `1px solid ${C.border}`, outline: "none", padding: "1px 0", width: 120 }} />
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <input value={ex.sets||""} onChange={e => updateEx(ex.id,"sets",e.target.value)} placeholder="Sets / volume" style={{ flex: 1, minWidth: 80, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: C.orange, fontSize: 11, ...mono, outline: "none" }} />
                    <input value={ex.notes||""} onChange={e => updateEx(ex.id,"notes",e.target.value)} placeholder="Coach notes..." style={{ flex: 2, minWidth: 100, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: "#666", fontSize: 11, outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <input value={ex.videoUrl||""} onChange={e => updateEx(ex.id,"videoUrl",e.target.value)} placeholder="YouTube URL (timestamp auto-detected)..." style={{ flex: 1, minWidth: 160, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: "#666", fontSize: 11, outline: "none" }} />
                  </div>
                  {ex.videoUrl && parseYouTubeEmbed(ex.videoUrl, ex.videoStart) && (() => {
                    const t = parseYouTubeTimestamp(ex.videoUrl);
                    return <div style={{ ...mono, fontSize: 9, color: C.orange, marginTop: 4 }}>✓ Demo video set{t > 0 ? ` · starts at ${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}` : ""}</div>;
                  })()}
                  {/* Options editor */}
                  {options.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Options (athlete picks one)</div>
                      {options.map((opt, oi) => (
                        <div key={oi} style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px" }}>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                            <div style={{ ...mono, fontSize: 10, color: C.muted, minWidth: 16 }}>{oi + 1}.</div>
                            <input value={opt.label} onChange={e => updateOption(oi, { ...opt, label: e.target.value })} placeholder={`Option ${oi + 1} name...`}
                              style={{ flex: 1, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: C.white, fontSize: 12, outline: "none", fontWeight: 500 }} />
                            <button onClick={() => removeOption(oi)} style={{ background: "none", border: "none", color: "#a05555", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>✕</button>
                          </div>
                          <div style={{ display: "flex", gap: 6, marginLeft: 22 }}>
                            <input value={opt.sets||""} onChange={e => updateOption(oi, { ...opt, sets: e.target.value })} placeholder="Sets / volume..."
                              style={{ flex: 1, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 8px", color: C.orange, fontSize: 11, ...mono, outline: "none" }} />
                            <input value={opt.notes||""} onChange={e => updateOption(oi, { ...opt, notes: e.target.value })} placeholder="Notes..."
                              style={{ flex: 2, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 8px", color: "#666", fontSize: 11, outline: "none" }} />
                          </div>
                        </div>
                      ))}
                      <button onClick={addOption} style={{ alignSelf: "flex-start", ...mono, fontSize: 10, padding: "4px 10px", background: "none", border: `1px dashed ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer" }}>+ Option</button>
                    </div>
                  )}
                  {options.length === 0 && (
                    <button onClick={addOption} style={{ marginTop: 8, ...mono, fontSize: 10, padding: "4px 10px", background: "none", border: `1px dashed ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer" }}>+ Add options</button>
                  )}
                  {/* Shared days picker */}
                  <div style={{ marginTop: 10 }}>
                    <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Also appears on</div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {days.map((d, di) => {
                        if (di === activeDay) return null;
                        const shared = ex.sharedDays || [];
                        const isOn = shared.includes(di);
                        return (
                          <button key={di} onClick={(e) => {
                            e.stopPropagation();
                            const fresh = days[activeDay]?.exercises?.find(x => x.id === ex.id);
                            const cur = (fresh || ex).sharedDays || [];
                            const nowOn = cur.includes(di);
                            updateEx(ex.id, "sharedDays", nowOn ? cur.filter(x => x !== di) : [...cur, di]);
                          }} style={{ ...mono, fontSize: 9, padding: "3px 8px", borderRadius: 4, border: `1px solid ${isOn ? C.purple : C.border}`, background: isOn ? "rgba(91,127,166,0.12)" : "transparent", color: isOn ? C.purple : C.muted, cursor: "pointer" }}>
                            {d.label}
                          </button>
                        );
                      })}
                      {days.length <= 1 && <span style={{ ...mono, fontSize: 9, color: C.muted }}>Add more days first</span>}
                    </div>
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
          );
        })}
        {/* Shared exercises from other days — positionable in coach view */}
        {sharedInThisDay.map((ex, si) => {
          const moveShared = (dir) => {
            const srcEx = days[ex._sourceDay]?.exercises?.find(e => e.id === ex.id);
            if (!srcEx) return;
            const cur = srcEx.sharedDayPositions || {};
            const pos = cur[activeDay] ?? (day.exercises.length + si);
            const newPos = pos + dir;
            const updatedPositions = { ...cur, [activeDay]: newPos };
            // update the source day exercise
            const newDays = days.map((d, di) => di === ex._sourceDay
              ? { ...d, exercises: d.exercises.map(e => e.id === ex.id ? { ...e, sharedDayPositions: updatedPositions } : e) }
              : d
            );
            onDaysChange(newDays);
          };
          return (
            <div key={ex.id} style={{ background: "rgba(91,127,166,0.06)", border: `1px solid rgba(91,127,166,0.3)`, borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ ...mono, fontSize: 9, color: C.purple, background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>from {days[ex._sourceDay]?.label}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 3 }}>{ex.text}</div>
                  {ex.sets && <div style={{ ...mono, fontSize: 11, color: C.orange }}>{ex.sets}</div>}
                  <div style={{ ...mono, fontSize: 10, color: C.muted }}>{ex.category}</div>
                  {ex.notes && <div style={{ ...mono, fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 3 }}>{ex.notes}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
                  <button onClick={() => moveShared(-1)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer", padding: "3px 7px", fontSize: 11 }}>↑</button>
                  <button onClick={() => moveShared(1)} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer", padding: "3px 7px", fontSize: 11 }}>↓</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setShowPicker(true)} style={{ flex: 1, padding: "12px", borderRadius: 8, border: `1px dashed ${C.orange}`, background: "rgba(61,158,122,0.06)", color: C.orange, cursor: "pointer", ...mono, fontSize: 12 }}>+ Add Exercise</button>
        {clipboard && <button onClick={() => addExercise({...clipboard,id:uid()})} style={{ padding: "12px 14px", borderRadius: 8, border: `1px dashed ${C.purple}`, background: "rgba(91,127,166,0.06)", color: C.purple, cursor: "pointer", ...mono, fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>⎘ {clipboard.text.length>18?clipboard.text.slice(0,18)+"…":clipboard.text}</button>}
      </div>
      {showPicker && <ExercisePicker onAdd={addExercise} onClose={() => setShowPicker(false)} />}
    </div>
  );
}

// ── COACH PLAN EDITOR ─────────────────────────────────────────────────────────
function CoachPlanEditor({ athlete, plan, onPlanChange, onPublish, templates = [], onSaveTemplate }) {
  const [activeWeek, setActiveWeek] = useState(0);
  const [clipboard, setClipboard] = useState(null);
  const [dayClipboard, setDayClipboard] = useState(null);
  const [editingWeekLabel, setEditingWeekLabel] = useState(null);
  const [draftWeekLabel, setDraftWeekLabel] = useState("");
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishDraft, setPublishDraft] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showBlockOverview, setShowBlockOverview] = useState(false);
  const [overviewExpanded, setOverviewExpanded] = useState({});
  const [savingTemplate, setSavingTemplate] = useState(null); // {type, data} prompt for name
  const [templateName, setTemplateName] = useState("");
  const [showWeekTemplates, setShowWeekTemplates] = useState(false);
  const [showDayTemplates, setShowDayTemplates] = useState(false);

  const weeks = plan?.weeks || [];
  const published = plan?.published || [];

  // figure out current week number for coach context
  const currentWeekIdx = (() => {
    if (!plan?.blockStart) return null;
    const [sy, sm, sd] = plan.blockStart.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const now = new Date(); now.setHours(0,0,0,0);
    if (now < start) return null;
    return Math.min(Math.floor((now - start) / (7*24*60*60*1000)), weeks.length - 1);
  })();

  const updateWeek = (i, days) => {
    const w = weeks.map((wk, j) => j===i ? {...wk, days} : wk);
    onPlanChange({...plan, weeks: w});
  };
  const addWeek = () => {
    const newWeek = { label: `Week ${weeks.length+1}`, days: [{ label: "Day 1", exercises: [] }] };
    const w = [...weeks, newWeek];
    onPlanChange({...plan, weeks: w});
    setActiveWeek(w.length - 1);
  };
  const copyWeekForward = () => {
    const src = weeks[activeWeek];
    const newWeek = {
      label: `Week ${weeks.length+1}`,
      days: src.days.map(d => ({ ...d, exercises: d.exercises.map(e => ({...e, id: uid()})) }))
    };
    const w = [...weeks, newWeek];
    onPlanChange({...plan, weeks: w});
    setActiveWeek(w.length - 1);
  };
  const removeWeek = (i) => {
    if (weeks.length <= 1) return;
    const w = weeks.filter((_, j) => j !== i);
    const newPublished = published.filter(p => p !== i).map(p => p > i ? p - 1 : p);
    onPlanChange({...plan, weeks: w, published: newPublished});
    setActiveWeek(Math.min(activeWeek, w.length - 1));
  };
  const renameWeek = (i, l) => {
    const w = weeks.map((wk, j) => j===i ? {...wk, label: l} : wk);
    onPlanChange({...plan, weeks: w});
  };
  const moveWeek = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= weeks.length) return;
    const w = [...weeks];
    [w[i], w[j]] = [w[j], w[i]];
    // fix published indices
    const newPublished = published.map(p => p === i ? j : p === j ? i : p);
    onPlanChange({...plan, weeks: w, published: newPublished});
    setActiveWeek(j);
  };
  const setWeekVolume = (i, v) => {
    const w = weeks.map((wk, j) => j===i ? {...wk, volume: v} : wk);
    onPlanChange({...plan, weeks: w});
  };
  const toggleVolumePublished = () => {
    onPlanChange({...plan, volumePublished: !plan.volumePublished});
  };

  // load templates when editor mounts or athlete changes
  const [localTemplates, setLocalTemplates] = React.useState(templates);
  React.useEffect(() => { setLocalTemplates(templates); }, [templates]);

  const handleSaveTemplate = async (name, type, data) => {
    if (onSaveTemplate) await onSaveTemplate(name, type, data);
  };

  const openPublish = () => {
    setPublishDraft([...published]);
    setShowPublishModal(true);
  };
  const togglePublishWeek = (i) => {
    setPublishDraft(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };
  const confirmPublish = () => {
    onPublish(publishDraft);
    setShowPublishModal(false);
  };

  const week = weeks[activeWeek];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 16px" }}>
      {/* Athlete header */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <div style={{ ...bebas, fontSize: 26, letterSpacing: 1 }}>{athlete.name}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 2 }}><Badge type={athlete.type} /><span style={{ ...mono, fontSize: 10, color: C.muted }}>{athlete.level}</span></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowBlockOverview(v => !v)} style={{ ...mono, fontSize: 11, padding: "9px 14px", borderRadius: 7, border: `1px solid ${showBlockOverview ? C.orange : C.border}`, background: showBlockOverview ? "rgba(61,158,122,0.08)" : "none", color: showBlockOverview ? C.orange : C.muted, cursor: "pointer" }}>
            {showBlockOverview ? "▲ Collapse" : "▼ View All"}
          </button>
          <button onClick={openPublish} style={{ ...mono, fontSize: 11, padding: "9px 18px", borderRadius: 7, border: "none", background: C.orange, color: "#fff", cursor: "pointer", letterSpacing: 0.5, fontWeight: 500 }}>
            Publish to Athlete ↗
          </button>
        </div>
      </div>

      {/* Full block view */}
      {showBlockOverview && (
        <div style={{ marginBottom: 20, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: C.gray }}>
            <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Full Block — {weeks.length} Week{weeks.length !== 1 ? "s" : ""}</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "flex", gap: 0, minWidth: weeks.length * 160 }}>
              {weeks.map((wk, wi) => (
                <div key={wi} style={{ flex: 1, minWidth: 160, borderRight: wi < weeks.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ padding: "8px 12px", background: activeWeek === wi ? "rgba(61,158,122,0.08)" : C.gray, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                    onClick={() => { setActiveWeek(wi); setShowBlockOverview(false); }}>
                    <div style={{ ...bebas, fontSize: 13, color: activeWeek === wi ? C.orange : C.white }}>{wk.label}</div>
                    {published.includes(wi) && <span style={{ ...mono, fontSize: 8, color: "#2aaa5e" }}>● live</span>}
                  </div>
                  {wk.days.map((day, di) => {
                    const key = `${wi}-${di}`;
                    const expanded = overviewExpanded[key];
                    return (
                      <div key={di} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ padding: "6px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: C.gray }}
                          onClick={() => setOverviewExpanded(prev => ({ ...prev, [key]: !prev[key] }))}>
                          <div style={{ ...mono, fontSize: 10, color: C.muted, fontWeight: 500 }}>{day.label}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ ...mono, fontSize: 9, color: C.muted }}>{day.exercises.length} ex</span>
                            <span style={{ ...mono, fontSize: 9, color: C.muted }}>{expanded ? "▲" : "▼"}</span>
                          </div>
                        </div>
                        <div style={{ padding: expanded ? "4px 0 6px" : 0, overflow: "hidden", maxHeight: expanded ? 999 : 0, transition: "max-height 0.2s" }}>
                          {day.exercises.map((ex, ei) => (
                            <div key={ei} style={{ padding: "4px 12px", borderTop: ei > 0 ? `1px solid ${C.border}` : "none" }}>
                              <div style={{ fontSize: 12, color: C.white, lineHeight: 1.3, marginBottom: 1 }}>{ex.text}</div>
                              {ex.sets && <div style={{ ...mono, fontSize: 10, color: C.orange }}>{ex.sets}</div>}
                              {ex.notes && expanded && <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 2, lineHeight: 1.4, fontStyle: "italic" }}>{ex.notes}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Block overview */}
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
        <RichTextEditor value={plan?.blockNotes || ""} onChange={v => onPlanChange({ ...plan, blockNotes: v })}
          placeholder="Write notes about the goals, purpose, and context of this training block. Use **bold**, *italic*, - bullets. Athletes will see this when they tap 'Overview'."
          rows={4} />
        {/* Block image */}
        <div style={{ marginTop: 14 }}>
          <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Block Image</div>
          {plan?.blockImageUrl ? (
            <div>
              <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                <img src={plan.blockImageUrl} alt="block" style={{ width: "100%", maxHeight: 180, objectFit: "cover", objectPosition: `center ${plan.blockImageFocus || "center"}`, display: "block", borderRadius: 8 }} />
                <button onClick={async () => { await dbDeleteBlockImage(plan.blockImageUrl); onPlanChange({ ...plan, blockImageUrl: null, blockImageFocus: null }); }}
                  style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: 4, cursor: "pointer", padding: "4px 8px", ...mono, fontSize: 10 }}>✕ Remove</button>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ ...mono, fontSize: 9, color: C.muted, marginRight: 4 }}>FOCUS</span>
                {["top", "center", "bottom"].map(pos => (
                  <button key={pos} onClick={() => onPlanChange({ ...plan, blockImageFocus: pos })}
                    style={{ ...mono, fontSize: 10, padding: "4px 10px", borderRadius: 4, border: `1px solid ${(plan.blockImageFocus || "center") === pos ? C.orange : C.border}`, background: (plan.blockImageFocus || "center") === pos ? "rgba(61,158,122,0.1)" : "none", color: (plan.blockImageFocus || "center") === pos ? C.orange : C.muted, cursor: "pointer" }}>{pos}</button>
                ))}
              </div>
            </div>
          ) : (
            <label style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: `1px dashed ${C.border}`, borderRadius: 8, cursor: "pointer", color: C.muted, ...mono, fontSize: 11 }}>
              {uploadingImage ? "Uploading..." : "↑ Upload image"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                const file = e.target.files[0]; if (!file) return;
                setUploadingImage(true);
                try { const url = await dbUploadBlockImage(athlete.id, file); onPlanChange({ ...plan, blockImageUrl: url, blockImageFocus: "center" }); }
                catch(err) { alert("Upload failed: " + err.message); }
                setUploadingImage(false);
              }} />
            </label>
          )}
        </div>
      </div>

      {/* Week tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
        {weeks.map((wk, i) => {
          const isPub = published.includes(i);
          const isCurrent = currentWeekIdx === i;
          const isActive = activeWeek === i;
          return (
            <div key={i} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              {editingWeekLabel === i ? (
                <input autoFocus value={draftWeekLabel} onChange={e => setDraftWeekLabel(e.target.value)}
                  onBlur={() => { if(draftWeekLabel.trim()) renameWeek(i, draftWeekLabel.trim()); setEditingWeekLabel(null); }}
                  onKeyDown={e => { if(e.key==="Enter"){if(draftWeekLabel.trim())renameWeek(i,draftWeekLabel.trim());setEditingWeekLabel(null);}if(e.key==="Escape")setEditingWeekLabel(null); }}
                  style={{ ...bebas, fontSize: 14, padding: "10px 10px 6px", borderRadius: 8, border: `1px solid ${C.orange}`, background: "rgba(61,158,122,0.1)", color: C.orange, outline: "none", textAlign: "center", width: 90 }} />
              ) : (
                <button onClick={() => setActiveWeek(i)} style={{ minWidth: 84, padding: "10px 10px 6px", borderRadius: 8, border: `2px solid ${isActive ? C.orange : isCurrent ? C.purple : C.border}`, background: isActive ? "rgba(61,158,122,0.1)" : C.gray, color: isActive ? C.orange : C.white, cursor: "pointer", textAlign: "center", position: "relative" }}>
                  {isCurrent && <div style={{ position: "absolute", top: -6, right: -4, background: C.purple, color: "#fff", ...mono, fontSize: 8, padding: "1px 5px", borderRadius: 3 }}>NOW</div>}
                  <div style={{ ...bebas, fontSize: 14 }}>{wk.label}</div>
                  <div style={{ ...mono, fontSize: 9, color: isPub ? "#2aaa5e" : C.muted, marginTop: 2 }}>{isPub ? "● live" : "○ draft"}</div>
                </button>
              )}
              {isActive && editingWeekLabel !== i && (
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
                  <button onClick={() => moveWeek(i, -1)} disabled={i===0} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: i===0?"#ccc":C.muted, cursor: i===0?"default":"pointer" }}>←</button>
                  <button onClick={() => moveWeek(i, 1)} disabled={i===weeks.length-1} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: i===weeks.length-1?"#ccc":C.muted, cursor: i===weeks.length-1?"default":"pointer" }}>→</button>
                  <button onClick={() => { setDraftWeekLabel(wk.label); setEditingWeekLabel(i); }} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer" }}>✎</button>
                  <button onClick={() => { setSavingTemplate({ type: "week", data: wk }); setTemplateName(wk.label); }} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.orange, cursor: "pointer" }} title="Save as template">★</button>
                  {weeks.length > 1 && <button onClick={() => removeWeek(i)} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: "#a05555", cursor: "pointer" }}>✕</button>}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", gap: 4, justifyContent: "flex-start", paddingTop: 0 }}>
          <button onClick={addWeek} style={{ padding: "10px 12px", borderRadius: 8, border: `1px dashed ${C.border}`, background: "none", color: C.muted, cursor: "pointer", ...mono, fontSize: 11, whiteSpace: "nowrap" }}>+ Week</button>
          {weeks.length > 0 && <button onClick={copyWeekForward} style={{ padding: "6px 10px", borderRadius: 8, border: `1px dashed ${C.purple}`, background: "rgba(91,127,166,0.06)", color: C.purple, cursor: "pointer", ...mono, fontSize: 10, whiteSpace: "nowrap" }}>⎘ Copy week</button>}
          {localTemplates.filter(t => t.type === "week").length > 0 && <button onClick={() => setShowWeekTemplates(true)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px dashed ${C.orange}`, background: "rgba(61,158,122,0.06)", color: C.orange, cursor: "pointer", ...mono, fontSize: 10, whiteSpace: "nowrap" }}>★ From template</button>}
        </div>
      </div>

      {/* Volume input for active week */}
      {week && (
        <div style={{ marginBottom: 16, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Volume — {week.label}</div>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4,5].map(v => (
                  <button key={v} onClick={() => setWeekVolume(activeWeek, week.volume === v ? null : v)}
                    style={{ width: 32, height: 32, borderRadius: 6, border: `1px solid ${week.volume >= v ? C.orange : C.border}`, background: week.volume >= v ? C.orange : "transparent", color: week.volume >= v ? "#fff" : C.muted, cursor: "pointer", ...mono, fontSize: 12, fontWeight: 600, transition: "all 0.1s" }}>{v}</button>
                ))}
              </div>
              {week.volume && <span style={{ ...mono, fontSize: 10, color: C.muted }}>{["","Easy","Moderate","Hard","Very Hard","Peak"][week.volume]}</span>}
            </div>
            <button onClick={toggleVolumePublished}
              style={{ ...mono, fontSize: 10, padding: "5px 12px", borderRadius: 5, border: `1px solid ${plan.volumePublished ? C.orange : C.border}`, background: plan.volumePublished ? "rgba(61,158,122,0.08)" : "none", color: plan.volumePublished ? C.orange : C.muted, cursor: "pointer" }}>
              {plan.volumePublished ? "● Shared with athlete" : "○ Share graph with athlete"}
            </button>
          </div>
        </div>
      )}

      {/* Day editor for active week */}
      {week && (
        <DayEditor
          days={week.days}
          onDaysChange={(days) => updateWeek(activeWeek, days)}
          clipboard={clipboard}
          onCopy={setClipboard}
          dayClipboard={dayClipboard}
          onCopyDay={setDayClipboard}
          templates={templates}
          onSaveTemplate={(type, data, defaultName) => { setSavingTemplate({ type, data }); setTemplateName(defaultName || ""); }}
          onInsertDayTemplate={() => setShowDayTemplates(true)}
        />
      )}

      {/* Save template name prompt */}
      {savingTemplate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 10, width: 380, maxWidth: "100%", padding: 24 }}>
            <div style={{ ...bebas, fontSize: 20, marginBottom: 4 }}>Save as Template</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 16 }}>Give this {savingTemplate.type} a name so you can reuse it later.</p>
            <input autoFocus value={templateName} onChange={e => setTemplateName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && templateName.trim()) { handleSaveTemplate(templateName.trim(), savingTemplate.type, savingTemplate.data); setSavingTemplate(null); }}}
              placeholder={savingTemplate.type === "week" ? "e.g. Power Week, Deload..." : "e.g. Strength Day, Fitness Day..."}
              style={{ width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none", marginBottom: 16 }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setSavingTemplate(null)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { if (!templateName.trim()) return; handleSaveTemplate(templateName.trim(), savingTemplate.type, savingTemplate.data); setSavingTemplate(null); }}
                disabled={!templateName.trim()}
                style={{ ...mono, fontSize: 11, padding: "8px 16px", background: templateName.trim() ? C.orange : C.gray3, border: "none", borderRadius: 5, color: templateName.trim() ? "#fff" : C.muted, cursor: templateName.trim() ? "pointer" : "default" }}>Save Template</button>
            </div>
          </div>
        </div>
      )}

      {/* Week template picker */}
      {showWeekTemplates && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 460, maxWidth: "100%", maxHeight: "80vh", overflow: "auto", padding: 24 }}>
            <div style={{ ...bebas, fontSize: 20, marginBottom: 4 }}>Insert Week Template</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 16 }}>Select a template to add as a new week.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {localTemplates.filter(t => t.type === "week").map(t => (
                <button key={t.id} onClick={() => {
                  const newWeek = { label: t.name, days: t.data.days.map(d => ({ ...d, exercises: d.exercises.map(e => ({ ...e, id: uid() })) })) };
                  const w = [...weeks, newWeek];
                  onPlanChange({ ...plan, weeks: w });
                  setActiveWeek(w.length - 1);
                  setShowWeekTemplates(false);
                }} style={{ textAlign: "left", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 3 }}>{t.name}</div>
                  <div style={{ ...mono, fontSize: 10, color: C.muted }}>{t.data.days?.length || 0} days · {t.data.days?.reduce((n, d) => n + (d.exercises?.length || 0), 0)} exercises</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setShowWeekTemplates(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Day template picker */}
      {showDayTemplates && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 460, maxWidth: "100%", maxHeight: "80vh", overflow: "auto", padding: 24 }}>
            <div style={{ ...bebas, fontSize: 20, marginBottom: 4 }}>Insert Day Template</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 16 }}>Select a template to add as a new day in this week.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {localTemplates.filter(t => t.type === "day").map(t => (
                <button key={t.id} onClick={() => {
                  const newDay = { label: t.name, exercises: t.data.exercises.map(e => ({ ...e, id: uid() })) };
                  const w = weeks.map((wk, i) => i === activeWeek ? { ...wk, days: [...wk.days, newDay] } : wk);
                  onPlanChange({ ...plan, weeks: w });
                  setShowDayTemplates(false);
                }} style={{ textAlign: "left", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 3 }}>{t.name}</div>
                  <div style={{ ...mono, fontSize: 10, color: C.muted }}>{t.data.exercises?.length || 0} exercises</div>
                </button>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setShowDayTemplates(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Publish modal */}
      {showPublishModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 12, width: "100%", maxWidth: 420, padding: 28 }}>
            <div style={{ ...bebas, fontSize: 24, marginBottom: 4 }}>Publish to Athlete</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 20 }}>Select which weeks {athlete.name} can see. Unpublished weeks stay hidden.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {weeks.map((wk, i) => {
                const isOn = publishDraft.includes(i);
                const isCurrent = currentWeekIdx === i;
                return (
                  <button key={i} onClick={() => togglePublishWeek(i)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, border: `1px solid ${isOn ? C.orange : C.border}`, background: isOn ? "rgba(61,158,122,0.07)" : C.gray2, cursor: "pointer", textAlign: "left" }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${isOn ? C.orange : C.gray3}`, background: isOn ? C.orange : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {isOn && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: C.white }}>{wk.label}</span>
                      {isCurrent && <span style={{ ...mono, fontSize: 9, color: C.purple, marginLeft: 8 }}>current</span>}
                    </div>
                    <span style={{ ...mono, fontSize: 10, color: C.muted }}>{wk.days.length} days</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowPublishModal(false)} style={{ ...mono, fontSize: 11, padding: "9px 16px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={confirmPublish} style={{ ...mono, fontSize: 11, padding: "9px 20px", background: C.orange, border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" }}>Publish ({publishDraft.length} weeks)</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── TIMER MODAL ───────────────────────────────────────────────────────────────
function TimerModal({ onClose }) {
  const [workSecs, setWorkSecs] = useState(30);
  const [restSecs, setRestSecs] = useState(180);
  const [soundOn, setSoundOn] = useState(true);

  // All mutable timer state lives in a single ref — no stale closure issues
  const S = React.useRef({
    phase: "idle", // idle | countdown | work | rest
    remaining: 0,
    round: 0,
    countdown: null,
    workSecs: 30,
    restSecs: 180,
    soundOn: true,
  });
  const intervalRef = React.useRef(null);

  // Keep ref in sync with React state for display values
  const [display, setDisplay] = React.useState({ phase: "idle", remaining: 0, round: 0, countdown: null });
  const sync = () => setDisplay({ phase: S.current.phase, remaining: S.current.remaining, round: S.current.round, countdown: S.current.countdown });

  React.useEffect(() => { S.current.workSecs = workSecs; }, [workSecs]);
  React.useEffect(() => { S.current.restSecs = restSecs; }, [restSecs]);
  React.useEffect(() => { S.current.soundOn = soundOn; }, [soundOn]);

  const clear = () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };

  // ── sound — single shared AudioContext, resumed before each use ──
  const audioCtxRef = React.useRef(null);
  const getAudioCtx = () => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  };

  const beep = (freq, dur = 0.3, vol = 0.4) => {
    if (!S.current.soundOn) return;
    try {
      const ctx = getAudioCtx();
      const play = () => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.start(); osc.stop(ctx.currentTime + dur);
      };
      if (ctx.state === 'suspended') { ctx.resume().then(play); } else { play(); }
    } catch(e) {}
  };

  const beepWorkEnd = () => {
    if (!S.current.soundOn) return;
    try {
      const ctx = getAudioCtx();
      const play = () => {
        [880, 660, 440].forEach((freq, i) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = freq;
          const t = ctx.currentTime + i * 0.18;
          gain.gain.setValueAtTime(0.4, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.start(t); osc.stop(t + 0.25);
        });
      };
      if (ctx.state === 'suspended') { ctx.resume().then(play); } else { play(); }
    } catch(e) {}
  };

  const pip = () => beep(660, 0.12, 0.3);
  const go  = () => beep(1047, 0.5, 0.5);

  // ── single tick function — reads/writes S.current only ──
  const tick = () => {
    const s = S.current;

    if (s.phase === "countdown") {
      s.countdown--;
      if (s.countdown > 0) {
        pip();
      } else {
        // countdown hit 0 — GO sound fires AND work starts simultaneously
        go();
        clear();
        s.phase = "work";
        s.round = 1;
        s.remaining = s.workSecs;
        s.countdown = null;
        sync();
        intervalRef.current = setInterval(tick, 1000);
        return;
      }
      sync();
      return;
    }

    s.remaining--;

    // 3-2-1 pips at end of BOTH work and rest
    if (s.remaining <= 3 && s.remaining > 0) {
      pip();
      s.countdown = s.remaining;
    } else {
      s.countdown = null;
    }

    if (s.remaining <= 0) {
      clear();
      s.countdown = null;
      if (s.phase === "work") {
        // work done — rest begins
        beepWorkEnd();
        s.phase = "rest";
        s.remaining = s.restSecs;
      } else {
        // rest done — GO fires AND work starts simultaneously
        go();
        s.phase = "work";
        s.round++;
        s.remaining = s.workSecs;
      }
      intervalRef.current = setInterval(tick, 1000);
    }
    sync();
  };

  const startCountdown = () => {
    clear();
    S.current.phase = "countdown";
    S.current.countdown = 5;
    S.current.round = 0;
    S.current.remaining = 0;
    pip();
    sync();
    intervalRef.current = setInterval(tick, 1000);
  };

  const stop = () => {
    clear();
    S.current = { ...S.current, phase: "idle", remaining: 0, round: 0, countdown: null };
    sync();
  };

  React.useEffect(() => () => clear(), []);

  const { phase, remaining, round, countdown } = display;

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const isRunning = phase !== "idle";
  const isCountdown = phase === "countdown";
  const phaseBg = phase === "work" ? C.orange : phase === "rest" ? C.purple : isCountdown ? "#333" : C.gray2;
  const phaseColor = (isRunning || isCountdown) ? "#fff" : C.white;
  const total = phase === "work" ? S.current.workSecs : phase === "rest" ? S.current.restSecs : 1;
  const progress = phase === "work" || phase === "rest" ? ((total - remaining) / total) * 100 : 0;

  const adjBtn = (style) => ({ ...mono, fontSize: 12, width: 26, height: 26, borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", ...style });
  const timeDisplay = (label, val, setVal, active) => (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ ...mono, fontSize: 9, color: active ? "#fff" : C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, opacity: active ? 0.8 : 1 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        {!isRunning && !isCountdown && <button style={adjBtn({})} onClick={() => setVal(v => Math.max(5, v - (v > 60 ? 30 : 5)))}>−</button>}
        <div style={{ ...bebas, fontSize: (isRunning || isCountdown) && active ? 40 : 22, color: (isRunning || isCountdown) && active ? "#fff" : (isRunning || isCountdown) ? "rgba(255,255,255,0.4)" : C.white, minWidth: 80, textAlign: "center", lineHeight: 1 }}>
          {(isRunning || isCountdown) && active ? fmt(remaining) : fmt(val)}
        </div>
        {!isRunning && !isCountdown && <button style={adjBtn({})} onClick={() => setVal(v => v + (v >= 60 ? 30 : 5))}>+</button>}
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 480, borderRadius: "16px 16px 0 0", overflow: "hidden", boxShadow: "0 -4px 40px rgba(0,0,0,0.2)" }}>
        {/* Progress bar */}
        <div style={{ height: 4, background: C.gray3 }}>
          <div style={{ height: "100%", width: progress + "%", background: phase === "work" ? C.orange : C.purple, transition: "width 1s linear" }} />
        </div>
        <div style={{ background: phaseBg, padding: "14px 18px calc(20px + env(safe-area-inset-bottom, 12px))", transition: "background 0.4s" }}>
          {/* Header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...bebas, fontSize: 15, letterSpacing: 1, color: phaseColor, opacity: 0.8 }}>
                {isCountdown ? "GET READY" : phase === "idle" ? "INTERVAL TIMER" : phase === "work" ? "WORK" : "REST"}
              </div>
              {/* Big countdown overlay: 5-4-3-2-1 / Round N */}
              {isCountdown && countdown !== null && (
                <div style={{ ...bebas, fontSize: 80, lineHeight: 1, color: "#fff", letterSpacing: 2 }}>
                  {countdown === 0 ? "GO!" : countdown}
                </div>
              )}
              {!isCountdown && round > 0 && countdown !== null && (
                <div style={{ ...bebas, fontSize: 80, lineHeight: 1, color: "#fff", letterSpacing: 2 }}>
                  {countdown === 0 ? "GO!" : countdown}
                </div>
              )}
              {!isCountdown && round > 0 && countdown === null && (
                <div style={{ ...bebas, fontSize: 52, lineHeight: 1, color: phaseColor, letterSpacing: 1 }}>
                  Round {round}
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Sound toggle */}
              <button onClick={() => setSoundOn(s => !s)}
                style={{ background: "none", border: "none", color: soundOn ? phaseColor : "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 18, padding: "2px 4px" }}
                title={soundOn ? "Mute" : "Unmute"}>
                {soundOn ? "🔊" : "🔇"}
              </button>
              <button onClick={() => { stop(); onClose(); }} style={{ background: "none", border: "none", color: isRunning ? "rgba(255,255,255,0.6)" : C.muted, cursor: "pointer", fontSize: 20, paddingTop: 2 }}>✕</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
            {timeDisplay("Work", workSecs, setWorkSecs, phase === "work")}
            <div style={{ color: isRunning ? "rgba(255,255,255,0.3)" : C.gray3, fontSize: 20 }}>|</div>
            {timeDisplay("Rest", restSecs, setRestSecs, phase === "rest")}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {!isRunning && !isCountdown
              ? <button onClick={startCountdown} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: C.orange, color: "#fff", cursor: "pointer", ...bebas, fontSize: 17, letterSpacing: 1 }}>START</button>
              : <>
                  <button onClick={stop} style={{ flex: 1, padding: "11px", borderRadius: 8, border: `1px solid rgba(255,255,255,0.3)`, background: "rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", ...mono, fontSize: 11 }}>Stop</button>
                  {!isCountdown && <button onClick={() => { clear(); S.current.remaining = phase === "work" ? S.current.workSecs : S.current.restSecs; S.current.countdown = null; intervalRef.current = setInterval(tick, 1000); sync(); }} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.2)", color: "#fff", cursor: "pointer", ...mono, fontSize: 11 }}>Reset</button>}
                </>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ATHLETE VIEW ──────────────────────────────────────────────────────────────
function AthleteView({ athlete, plan, progress, onProgressChange, onOverflowChange, onEditExercise, onLogout }) {
  const OVF = "overflow";

  // figure out which week to default to
  const publishedWeeks = (plan?.published || []).map(i => plan.weeks[i]).filter(Boolean);
  const publishedIndices = plan?.published || [];

  const currentWeekIdx = (() => {
    if (!plan?.blockStart || publishedIndices.length === 0) return publishedIndices[0] ?? null;
    const [sy, sm, sd] = plan.blockStart.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const now = new Date(); now.setHours(0,0,0,0);
    if (now < start) return publishedIndices[0];
    const weekNum = Math.floor((now - start) / (7*24*60*60*1000));
    // find the published week closest to current
    const closest = publishedIndices.reduce((best, idx) => Math.abs(idx - weekNum) < Math.abs(best - weekNum) ? idx : best, publishedIndices[0]);
    return closest;
  })();

  const [activeWeekIdx, setActiveWeekIdx] = useState(currentWeekIdx ?? publishedIndices[0] ?? 0);
  const [activeDay, setActiveDay] = useState(0);
  const [showOverview, setShowOverview] = useState(false);
  const [volumeExpanded, setVolumeExpanded] = useState(true);
  const [showTimer, setShowTimer] = useState(false);

  const week = plan?.weeks?.[activeWeekIdx];
  const days = week?.days || [];

  if (!plan || publishedIndices.length === 0) {
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

  const progKey = (wIdx, dIdx) => `w${wIdx}_d${dIdx}`;
  const sharedKey = (exId) => `shared_${exId}`;
  const overflow = progress[OVF] || [];
  const overflowIds = new Set(overflow.map(e => e.id));
  const isOvf = activeDay === OVF;
  const currentDay = !isOvf ? days[activeDay] : null;

  // also inject shared exercises from other days into current day view
  const sharedFromOtherDays = !isOvf ? days.reduce((acc, d, dIdx) => {
    if (dIdx === activeDay) return acc;
    d.exercises.forEach(ex => {
      if (ex.sharedDays && ex.sharedDays.includes(activeDay) && !overflowIds.has(ex.id)) {
        acc.push({ ...ex, _isShared: true, _sourceDay: dIdx });
      }
    });
    return acc;
  }, []) : [];

  const baseExs = currentDay
    ? currentDay.exercises.filter(e => !overflowIds.has(e.id) && !((e.sharedDays?.length) && ((progress[`shared_${e.id}`] || {})[e.id] || {}).deferToOtherDay))
    : overflow;

  // merge shared exercises at their designated positions
  const visibleExs = !isOvf ? (() => {
    const result = [...baseExs];
    sharedFromOtherDays.forEach(ex => {
      const pos = ex.sharedDayPositions?.[activeDay] ?? result.length;
      const clampedPos = Math.min(Math.max(0, pos), result.length);
      result.splice(clampedPos, 0, ex);
    });
    return result;
  })() : overflow;

  const pk = isOvf ? OVF + "_checks" : progKey(activeWeekIdx, activeDay);
  const dayProg = progress[pk] || {};

  // get progress for an exercise — shared ones use their own key
  const getEp = (ex) => {
    if (ex.sharedDays?.length || ex._isShared) return (progress[sharedKey(ex.id)] || {})[ex.id] || {};
    return dayProg[ex.id] || {};
  };

  const doneCount = visibleExs.filter(e => getEp(e).checked).length;
  const totalCount = visibleExs.length;

  const handleToggle = (ex) => {
    if (ex.sharedDays?.length || ex._isShared) {
      const ep = (progress[sharedKey(ex.id)] || {})[ex.id] || {};
      onProgressChange(sharedKey(ex.id), ex.id, { ...ep, checked: !ep.checked });
    } else {
      const ep = dayProg[ex.id] || {};
      onProgressChange(pk, ex.id, { ...ep, checked: !ep.checked });
    }
  };
  const handleNote = (ex, val, selectedOption, defer) => {
    const key = (ex.sharedDays?.length || ex._isShared) ? sharedKey(ex.id) : pk;
    const ep = (ex.sharedDays?.length || ex._isShared) ? ((progress[sharedKey(ex.id)] || {})[ex.id] || {}) : (dayProg[ex.id] || {});
    const update = { ...ep, note: val };
    if (selectedOption !== undefined) update.selectedOption = selectedOption;
    if (defer !== undefined) update.deferToOtherDay = !ep.deferToOtherDay;
    onProgressChange(key, ex.id, update);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.black, display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.gray, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ ...bebas, fontSize: 20, letterSpacing: 2 }}>ROCK POINT <span style={{ color: C.orange }}>COACHING</span></div>
        <button onClick={onLogout} style={{ ...mono, fontSize: 10, padding: "6px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>Log out</button>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.purple}, transparent)`, flexShrink: 0 }} />

      <div style={{ flex: 1, padding: "20px 16px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        {/* Athlete name + badges */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
            <div style={{ ...bebas, fontSize: 30, letterSpacing: 1 }}>{athlete.name}</div>
            {(plan.blockNotes || plan.blockImageUrl) && <button onClick={() => setShowOverview(true)} style={{ ...mono, fontSize: 10, padding: "5px 12px", borderRadius: 5, border: `1px solid ${C.orange}`, background: "rgba(61,158,122,0.08)", color: C.orange, cursor: "pointer" }}>Overview ↗</button>}
            <WeekBadge plan={plan} />
          </div>
          <Badge type={athlete.type} />
        </div>

        {/* Week selector (if multiple published weeks) */}
        {publishedIndices.length > 1 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto", paddingBottom: 2 }}>
            {publishedIndices.map(i => {
              const wk = plan.weeks[i];
              const isActive = activeWeekIdx === i;
              const isCurrent = currentWeekIdx === i;
              return (
                <button key={i} onClick={() => { setActiveWeekIdx(i); setActiveDay(0); }} style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 7, border: `1px solid ${isActive ? C.orange : isCurrent ? C.purple : C.border}`, background: isActive ? "rgba(61,158,122,0.1)" : C.gray, color: isActive ? C.orange : C.white, cursor: "pointer" }}>
                  <div style={{ ...bebas, fontSize: 14 }}>{wk?.label}</div>
                  {isCurrent && <div style={{ ...mono, fontSize: 9, color: C.purple }}>this week</div>}
                </button>
              );
            })}
          </div>
        )}

        {/* Volume graph */}
        {plan.volumePublished && plan.weeks && plan.weeks.some(wk => wk.volume) && (() => {
          const MAX_VOL = 5;
          const graphHeight = 72;
          const allWeeks = plan.weeks;
          const currentWi = currentWeekIdx;
          return (
            <div style={{ marginBottom: 16, background: C.gray, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
              <button onClick={() => setVolumeExpanded(v => !v)}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Training Load</span>
                <span style={{ ...mono, fontSize: 11, color: C.muted }}>{volumeExpanded ? "▲" : "▼"}</span>
              </button>
              {volumeExpanded && (
                <div style={{ padding: "0 16px 14px" }}>
                  <div style={{ ...mono, fontSize: 11, color: C.muted, lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>
                    Here is the volume map for your training block. Use it to better understand your training arc, and to plan plenty of rest.
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: graphHeight + 20 }}>
                    {allWeeks.map((wk, i) => {
                      const vol = wk.volume || 0;
                      const barH = vol ? (vol / MAX_VOL) * graphHeight : 0;
                      const isActive = activeWeekIdx === i && publishedIndices.includes(i);
                      const isCurrent = currentWi === i;
                      const isPublished = publishedIndices.includes(i);
                      const barColor = vol <= 2 ? "rgba(91,127,166,0.7)" : vol === 5 ? "#e07a3a" : C.orange;
                      return (
                        <div key={i} onClick={() => { if(isPublished){ setActiveWeekIdx(i); setActiveDay(0); } }}
                          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end", cursor: isPublished ? "pointer" : "default", opacity: isPublished ? 1 : 0.35 }}>
                          {vol > 0 && <div style={{ ...mono, fontSize: 9, color: isActive ? C.orange : C.muted }}>{vol}</div>}
                          <div style={{ width: "100%", height: barH, background: isActive ? C.orange : barColor, borderRadius: "3px 3px 0 0", transition: "all 0.2s", outline: isCurrent ? `2px solid ${C.purple}` : "none", outlineOffset: 2 }} />
                          <div style={{ ...mono, fontSize: 8, color: isActive ? C.orange : isCurrent ? C.purple : C.muted, textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%" }}>{wk.label.replace("Week ","W")}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
                    {[[C.orange,"Selected"],[C.purple,"This week"],["rgba(91,127,166,0.7)","Low"],["#e07a3a","Peak"]].map(([color, label]) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: 4, ...mono, fontSize: 9, color: C.muted }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />{label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {showOverview && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 12, width: "100%", maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div>
                  <div style={{ ...bebas, fontSize: 22, letterSpacing: 1 }}>Training Block Overview</div>
                  <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 2 }}>{athlete.name}</div>
                </div>
                <button onClick={() => setShowOverview(false)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 20 }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {plan.blockImageUrl && (
                  <div style={{ cursor: "pointer" }} onClick={() => window.open(plan.blockImageUrl, "_blank")}>
                    <img src={plan.blockImageUrl} alt="block" style={{ width: "100%", maxHeight: 260, objectFit: "cover", objectPosition: `center ${plan.blockImageFocus || "center"}`, display: "block" }} />
                  </div>
                )}
                <div style={{ padding: "20px 24px", fontSize: 13, color: C.white }}>
                  {renderMarkdown(plan.blockNotes)}
                </div>
              </div>
              <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
                <button onClick={() => setShowOverview(false)} style={{ ...mono, fontSize: 11, padding: "8px 18px", borderRadius: 6, border: "none", background: C.orange, color: "#fff", cursor: "pointer" }}>Got it</button>
              </div>
            </div>
          </div>
        )}

        {/* Day tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 6, overflowX: "auto", paddingBottom: 4 }}>
          {days.map((d, i) => {
            const pk2 = progKey(activeWeekIdx, i);
            const dp = progress[pk2] || {};
            const vis = d.exercises.filter(e => !overflowIds.has(e.id));
            // also count shared exercises from other days
            const sharedVis = days.reduce((acc, od, odi) => {
              if (odi === i) return acc;
              od.exercises.forEach(ex => { if (ex.sharedDays && ex.sharedDays.includes(i) && !overflowIds.has(ex.id)) acc.push(ex); });
              return acc;
            }, []);
            const allVis = [...vis, ...sharedVis];
            const done = allVis.filter(e => (e.sharedDays ? (progress[`shared_${e.id}`] || {}) : dp)[e.id]?.checked).length;
            const total = allVis.length;
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

        {/* Timer button above exercises */}
        <div style={{ marginBottom: 10 }}>
          <button onClick={() => setShowTimer(true)} style={{ ...mono, fontSize: 11, padding: "8px 16px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.gray, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14 }}>⏱</span> Timer
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleExs.map(ex => {
            const ep = getEp(ex);
            const isShared = !!(ex.sharedDays?.length || ex._isShared);
            // for source day: show which days it also appears on
            const alsoOnLabels = !ex._isShared && ex.sharedDays?.length
              ? ex.sharedDays.map(di => days[di]?.label).filter(Boolean).join(", ")
              : null;
            // for injected day: show which day it comes from
            const sourceDayLabel = ex._isShared ? days[ex._sourceDay]?.label : null;
            return (
              <ExerciseCard key={ex.id + (ex._sourceDay ?? "")} ex={ex} ep={ep} isOverflow={isOvf}
                onToggle={() => handleToggle(ex)}
                onNote={(v, sel, defer) => handleNote(ex, v, sel, defer)}
                onMoveToOverflow={() => onOverflowChange([...overflow, { ...ex, fromDay: activeDay, fromWeek: activeWeekIdx }])}
                onRestoreDay={() => onOverflowChange(overflow.filter(e => e.id !== ex.id))}
                onEdit={(updated) => onEditExercise(isOvf ? "overflow" : `w${activeWeekIdx}_d${activeDay}`, updated)}
                isShared={isShared}
                sourceDayLabel={sourceDayLabel}
                alsoOnLabels={alsoOnLabels}
              />
            );
          })}
        </div>

        {!isOvf && doneCount === totalCount && totalCount > 0 && (
          <div style={{ textAlign: "center", marginTop: 28, padding: "20px", background: "rgba(61,158,122,0.07)", border: "1px solid rgba(61,158,122,0.25)", borderRadius: 10 }}>
            <div style={{ ...bebas, fontSize: 26, color: "#2aaa5e", letterSpacing: 1 }}>Day Complete 🎉</div>
            <div style={{ ...mono, fontSize: 12, color: C.muted, marginTop: 4 }}>Nice work. Rest up.</div>
          </div>
        )}
      </div>
      {showTimer && <TimerModal onClose={() => setShowTimer(false)} />}
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginScreen({ athletes, credentials, coaches, onLoginAthlete, onLoginCoach, onLoginSubCoach }) {
  const [tab, setTab] = useState("athlete");
  const [selectedAthlete, setSelectedAthlete] = useState("");
  const [coachName, setCoachName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAthleteLogin = () => {
    if (!selectedAthlete) { setError("Please select your name."); return; }
    if (!credentials[selectedAthlete]) { setError("No password set. Contact your coach."); return; }
    if (credentials[selectedAthlete] !== password) { setError("Incorrect password."); return; }
    onLoginAthlete(selectedAthlete);
  };
  const handleCoachLogin = async () => {
    // check admin password first
    const actual = await dbGetCoachPassword();
    if (!actual || password === actual) { onLoginCoach(); return; }
    // check sub-coaches
    const match = coaches.find(c => c.name.toLowerCase() === coachName.toLowerCase() && c.password === password);
    if (match) { onLoginSubCoach(match.id); return; }
    setError("Incorrect name or password.");
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
          {[["athlete","Athlete"],["coach","Coach"]].map(([key,label]) => (
            <button key={key} onClick={() => { setTab(key); setPassword(""); setError(""); setSelectedAthlete(""); setCoachName(""); }}
              style={{ flex: 1, padding: "10px", borderRadius: 7, border: "none", cursor: "pointer", background: tab===key?C.gray:"transparent", color: tab===key?C.white:C.muted, ...mono, fontSize: 12 }}>{label}</button>
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
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key==="Enter"&&handleAthleteLogin()} placeholder="Enter your password" style={inputStyle} />
            </>
          ) : (
            <>
              <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Name (leave blank for admin)</div>
              <input value={coachName} onChange={e => { setCoachName(e.target.value); setError(""); }} placeholder="Coach name (optional)" style={inputStyle} />
              <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Password</div>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key==="Enter"&&handleCoachLogin()} placeholder="Enter password" style={inputStyle} />
            </>
          )}
          {error && <div style={{ ...mono, fontSize: 11, color: "#a05555", marginBottom: 14, padding: "8px 12px", background: "rgba(160,85,85,0.08)", borderRadius: 6 }}>{error}</div>}
          <button onClick={tab==="athlete"?handleAthleteLogin:handleCoachLogin}
            style={{ width: "100%", padding: "15px", borderRadius: 8, border: "none", background: C.orange, color: "#fff", cursor: "pointer", ...bebas, fontSize: 22, letterSpacing: 2 }}>
            {tab==="athlete"?"VIEW MY PLAN":"ENTER COACH VIEW"}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, ...mono, fontSize: 10, color: C.muted }}>rockpointcoaching.com</div>
      </div>
    </div>
  );
}

// ── COACH DASHBOARD ───────────────────────────────────────────────────────────
function CoachDashboard({ athletes, allAthletes, plans, progress, credentials, coaches, isAdmin, coachId, templates = [], onSaveTemplate, onDeleteTemplate, onUpdateCredentials, onUpdateCoachPassword, onPlanChange, onPublish, onProgressChange, onOverflowChange, onEditExercise, onAddAthlete, onDeleteAthlete, onAddCoach, onDeleteCoach, onUpdateCoach, onLogout, saved }) {
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("coach");
  const [showAdd, setShowAdd] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newAthlete, setNewAthlete] = useState({ name: "", type: "Youth Comp", level: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [showCoaches, setShowCoaches] = useState(false);
  const [newCoach, setNewCoach] = useState({ name: "", password: "" });
  const [editingCoach, setEditingCoach] = useState(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const openTemplates = () => { setShowTemplates(true); };
  const [draftCoachPw, setDraftCoachPw] = useState("");
  const [draftCreds, setDraftCreds] = useState({});
  const [savingPw, setSavingPw] = useState(false);

  const selected = selectedId === TEMPLATE_CREATOR_ID
    ? { id: TEMPLATE_CREATOR_ID, name: "Template Creator", type: "Adult Recreational", level: "" }
    : athletes.find(a => a.id === selectedId);
  const btnS = (active) => ({ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, padding: "6px 10px", borderRadius: 4, border: `1px solid ${active?C.orange:C.border}`, background: active?"rgba(61,158,122,0.1)":"none", color: active?C.orange:C.muted, cursor: "pointer" });

  const openBackups = async () => {
    if (!selectedId) return;
    setLoadingBackups(true);
    setShowBackups(true);
    const { data } = await sb.from("plan_backups").select("*").eq("athlete_id", selectedId).order("saved_at", { ascending: false }).limit(10);
    setBackups(data || []);
    setLoadingBackups(false);
  };
  const restoreBackup = async (backup) => {
    if (!window.confirm("Restore this backup? Current plan will be overwritten.")) return;
    await dbUpsertPlan(selectedId, backup.data);
    onPlanChange(selectedId, backup.data);
    setShowBackups(false);
  };
  const openPasswords = async () => {
    const cp = await dbGetCoachPassword();
    setDraftCoachPw(cp);
    setDraftCreds({ ...credentials });
    setShowPasswords(true);
  };
  const savePasswords = async () => {
    setSavingPw(true);
    if (isAdmin) await dbSetCoachPassword(draftCoachPw);
    for (const [aId, pw] of Object.entries(draftCreds)) await dbUpsertCredential(aId, pw);
    onUpdateCredentials(draftCreds);
    onUpdateCoachPassword(draftCoachPw);
    setSavingPw(false);
    setShowPasswords(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: C.black }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56, borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: 6 }}>
        <div style={{ ...bebas, fontSize: 18, letterSpacing: 2, flexShrink: 0 }}>Rock Point <span style={{ color: C.orange }}>Coaching</span></div>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
          {saved && <span style={{ ...mono, fontSize: 10, color: "#2aaa5e" }}>✓</span>}
          <button onClick={openPasswords} style={btnS(false)}>🔑</button>
          {selectedId && <button onClick={openBackups} style={btnS(false)} title="Restore backup">↩ Backup</button>}
          {isAdmin && <button onClick={() => setShowCoaches(true)} style={btnS(false)}>Coaches</button>}
          <button onClick={openTemplates} style={btnS(false)}>Templates</button>
          <div style={{ width: 1, height: 20, background: C.border }} />
          <button onClick={() => setMode("coach")} style={btnS(mode==="coach")}>Coach</button>
          <button onClick={() => setMode("athlete")} style={btnS(mode==="athlete")}>Athlete</button>
          <div style={{ width: 1, height: 20, background: C.border }} />
          <button onClick={onLogout} style={{ ...mono, fontSize: 10, padding: "6px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>↩</button>
        </div>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.purple}, transparent)`, flexShrink: 0 }} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: sidebarOpen ? 200 : 36, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, transition: "width 0.2s ease", overflow: "hidden" }}>
          <div style={{ padding: "12px 8px 10px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: sidebarOpen ? 200 : 36 }}>
            {sidebarOpen && <span style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 2, color: C.muted, whiteSpace: "nowrap" }}>Athletes</span>}
            <div style={{ display: "flex", gap: 4, marginLeft: sidebarOpen ? 0 : "auto", marginRight: sidebarOpen ? 0 : "auto" }}>
              {sidebarOpen && <button onClick={() => setShowAdd(true)} style={{ background: C.orange, border: "none", color: "#fff", width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>}
              <button onClick={() => setSidebarOpen(o => !o)} style={{ background: "none", border: `1px solid ${C.border}`, color: C.muted, width: 22, height: 22, borderRadius: 4, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>{sidebarOpen ? "«" : "»"}</button>
            </div>
          </div>
          {sidebarOpen && (
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              {/* Template Creator — fixed entry */}
              <div style={{ marginBottom: 6 }}>
                <button onClick={() => setSelectedId(TEMPLATE_CREATOR_ID)} style={{ width: "100%", textAlign: "left", background: selectedId===TEMPLATE_CREATOR_ID?"rgba(91,127,166,0.12)":"none", border: `1px solid ${selectedId===TEMPLATE_CREATOR_ID?C.purple:"rgba(91,127,166,0.3)"}`, borderRadius: 6, padding: "9px 12px", cursor: "pointer" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.purple, marginBottom: 2 }}>Template Creator</div>
                  <div style={{ ...mono, fontSize: 9, color: C.muted }}>scratch pad → save as ★</div>
                </button>
              </div>
              <div style={{ borderBottom: `1px solid ${C.border}`, marginBottom: 6 }} />
              {athletes.map(a => (
                <div key={a.id} style={{ position: "relative", marginBottom: 2 }}
                  onMouseEnter={e => { const b=e.currentTarget.querySelector(".del"); if(b) b.style.opacity="1"; }}
                  onMouseLeave={e => { const b=e.currentTarget.querySelector(".del"); if(b) b.style.opacity="0"; }}>
                  <button onClick={() => setSelectedId(a.id)} style={{ width: "100%", textAlign: "left", background: selectedId===a.id?C.gray2:"none", border: `1px solid ${selectedId===a.id?C.orange:"transparent"}`, borderRadius: 6, padding: "10px 32px 10px 12px", cursor: "pointer" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 4 }}>{a.name}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}><Badge type={a.type} /><span style={{ ...mono, fontSize: 9, color: C.muted }}>{a.level}</span></div>
                    {plans[a.id]?.published?.length > 0 && <div style={{ ...mono, fontSize: 9, color: C.orange, marginTop: 3 }}>{plans[a.id].published.length} week{plans[a.id].published.length!==1?"s":""} live</div>}
                  </button>
                  <button className="del" onClick={() => setConfirmDelete(a.id)} style={{ position: "absolute", top: 8, right: 4, opacity: 0, background: "none", border: "none", color: "#a05555", cursor: "pointer", fontSize: 13, padding: "2px 5px", transition: "opacity 0.15s" }}>✕</button>
                </div>
              ))}
            </div>
          )}
          {!sidebarOpen && (
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              <button onClick={() => { setSelectedId(TEMPLATE_CREATOR_ID); setSidebarOpen(true); }}
                title="Template Creator"
                style={{ width: "100%", height: 32, background: selectedId===TEMPLATE_CREATOR_ID?"rgba(91,127,166,0.15)":"none", border: "none", borderLeft: `2px solid ${selectedId===TEMPLATE_CREATOR_ID?C.purple:"transparent"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: selectedId===TEMPLATE_CREATOR_ID?C.purple:C.muted, fontSize: 10 }}>
                ★
              </button>
              {athletes.map(a => (
                <button key={a.id} onClick={() => { setSelectedId(a.id); setSidebarOpen(true); }}
                  title={a.name}
                  style={{ width: "100%", height: 32, background: selectedId===a.id?"rgba(61,158,122,0.15)":"none", border: "none", borderLeft: `2px solid ${selectedId===a.id?C.orange:"transparent"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: selectedId===a.id?C.orange:C.muted, fontSize: 10 }}>
                  {a.name.charAt(0)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, color: C.muted }}>
              <div style={{ fontSize: 40, opacity: 0.25 }}>🧗</div>
              <p style={{ ...mono, fontSize: 12 }}>Select an athlete</p>
            </div>
          ) : mode === "coach" ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
              <CoachPlanEditor
                athlete={selected}
                plan={plans[selected.id]}
                onPlanChange={(p) => onPlanChange(selected.id, p)}
                onPublish={(publishedIndices) => onPublish(selected.id, publishedIndices)}
                templates={templates}
                onSaveTemplate={onSaveTemplate}
              />
              {/* Skip day panel */}
              {(() => {
                const overflow = (progress[selected.id] || {}).overflow || [];
                if (overflow.length === 0) return null;
                return (
                  <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 16px 28px", width: "100%" }}>
                    <div style={{ background: "rgba(91,127,166,0.07)", border: `1px solid rgba(91,127,166,0.3)`, borderRadius: 10, padding: "14px 16px" }}>
                      <div style={{ ...mono, fontSize: 9, color: "#4a7aab", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                        Skip Day — {overflow.length} exercise{overflow.length !== 1 ? "s" : ""}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {overflow.map((ex, i) => (
                          <div key={i} style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 3 }}>{ex.text}</div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                                  {ex.sets && <span style={{ ...mono, fontSize: 11, color: C.orange }}>{ex.sets}</span>}
                                  <span style={{ ...mono, fontSize: 10, color: C.muted }}>{ex.category}</span>
                                  {ex.fromWeek != null && <span style={{ ...mono, fontSize: 9, color: "#4a7aab", background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>W{ex.fromWeek + 1} · Day {ex.fromDay + 1}</span>}
                                </div>
                                {ex.notes && <div style={{ ...mono, fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 4 }}>{ex.notes}</div>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <AthleteView athlete={selected} plan={plans[selected.id]} progress={progress[selected.id]||{}}
              onProgressChange={(d,e,ep) => onProgressChange(selected.id,d,e,ep)}
              onOverflowChange={(ov) => onOverflowChange(selected.id,ov)}
              onEditExercise={(d,ex) => onEditExercise(selected.id,d,ex)}
              onLogout={()=>{}} />
          )}
        </div>
      </div>

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
              <button onClick={() => { if(!newAthlete.name.trim()) return; onAddAthlete({id:uid(),...newAthlete, coach_id: coachId || 'admin'}); setShowAdd(false); setNewAthlete({name:"",type:"Youth Comp",level:""}); }} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Add</button>
            </div>
          </div>
        </div>
      )}

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

      {showBackups && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 480, maxWidth: "100%", maxHeight: "80vh", overflow: "auto", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 4 }}>Restore Backup</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 20 }}>
              {athletes.find(a=>a.id===selectedId)?.name} — last 10 saves. Restoring will overwrite the current plan.
            </p>
            {loadingBackups && <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 24 }}>Loading...</div>}
            {!loadingBackups && backups.length === 0 && <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 24 }}>No backups yet. They appear after the first save.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {backups.map(b => {
                const d = new Date(b.saved_at);
                const weekCount = b.data?.weeks?.length || 0;
                const hasNotes = !!b.data?.blockNotes;
                const hasImage = !!b.data?.blockImageUrl;
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 3 }}>
                        {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </div>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, display: "flex", gap: 10 }}>
                        <span>{weekCount} week{weekCount!==1?"s":""}</span>
                        {hasNotes && <span style={{ color: C.orange }}>● notes</span>}
                        {hasImage && <span style={{ color: C.purple }}>● image</span>}
                      </div>
                    </div>
                    <button onClick={() => restoreBackup(b)} style={{ ...mono, fontSize: 11, padding: "7px 14px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Restore</button>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setShowBackups(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showTemplates && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 520, maxWidth: "100%", maxHeight: "85vh", overflow: "auto", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 4 }}>Templates</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 20 }}>Save days and weeks as reusable templates. Apply them to any athlete.</p>
            {templates.length === 0 && (
              <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 24 }}>
                No templates yet. Save a day or week using the ★ button in the plan editor.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["week","day"].map(type => {
                const group = templates.filter(t => t.type === type);
                if (group.length === 0) return null;
                return (
                  <div key={type}>
                    <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 4 }}>{type} templates</div>
                    {group.map(t => (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 5 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: C.white }}>{t.name}</div>
                          <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 2 }}>
                            {t.type === "week"
                              ? `${t.data.days?.length || 0} days · ${t.data.days?.reduce((n,d) => n + (d.exercises?.length||0), 0)} exercises`
                              : `${t.data.exercises?.length || 0} exercises`}
                          </div>
                        </div>
                        <button onClick={() => onDeleteTemplate(t.id)} style={{ ...mono, fontSize: 10, padding: "5px 10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: "#a05555", cursor: "pointer" }}>✕</button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setShowTemplates(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showCoaches && isAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 480, maxWidth: "100%", maxHeight: "85vh", overflow: "auto", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 4 }}>Coaches</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 20 }}>Each coach can only see and manage their own athletes.</p>

            {/* Existing coaches */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {coaches.map(c => (
                <div key={c.id} style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
                  {editingCoach?.id === c.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input value={editingCoach.name} onChange={e => setEditingCoach(ec => ({...ec, name: e.target.value}))}
                        style={{ background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "7px 10px", color: C.white, fontSize: 13, outline: "none" }} />
                      <input value={editingCoach.password} onChange={e => setEditingCoach(ec => ({...ec, password: e.target.value}))}
                        placeholder="Password" style={{ background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "7px 10px", color: C.white, fontSize: 13, outline: "none" }} />
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button onClick={() => setEditingCoach(null)} style={{ ...mono, fontSize: 11, padding: "6px 12px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
                        <button onClick={() => { onUpdateCoach(editingCoach); setEditingCoach(null); }} style={{ ...mono, fontSize: 11, padding: "6px 14px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Save</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: C.white }}>{c.name}</div>
                        <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 2 }}>
                          {(allAthletes || athletes).filter(a => a.coach_id === c.id).length} athlete{(allAthletes || athletes).filter(a => a.coach_id === c.id).length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <button onClick={() => setEditingCoach({...c})} style={{ ...mono, fontSize: 10, padding: "5px 10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>✎ Edit</button>
                      <button onClick={() => { if(window.confirm(`Remove ${c.name}?`)) onDeleteCoach(c.id); }} style={{ ...mono, fontSize: 10, padding: "5px 10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: "#a05555", cursor: "pointer" }}>✕</button>
                    </div>
                  )}
                </div>
              ))}
              {coaches.length === 0 && <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 16 }}>No coaches yet.</div>}
            </div>

            {/* Add new coach */}
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 16 }}>
              <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Add Coach</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input value={newCoach.name} onChange={e => setNewCoach(c => ({...c, name: e.target.value}))}
                  placeholder="Name" style={{ flex: 1, minWidth: 120, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "8px 10px", color: C.white, fontSize: 13, outline: "none" }} />
                <input value={newCoach.password} onChange={e => setNewCoach(c => ({...c, password: e.target.value}))}
                  placeholder="Password" style={{ flex: 1, minWidth: 120, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "8px 10px", color: C.white, fontSize: 13, outline: "none" }} />
                <button onClick={() => {
                  if (!newCoach.name.trim() || !newCoach.password.trim()) return;
                  onAddCoach({ id: uid(), name: newCoach.name.trim(), password: newCoach.password.trim() });
                  setNewCoach({ name: "", password: "" });
                }} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Add</button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowCoaches(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showPasswords && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 440, maxWidth: "100%", maxHeight: "85vh", overflow: "auto", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 6 }}>Passwords</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 20 }}>Set passwords for athletes and coach access.</p>
            {isAdmin && (
              <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
                <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Admin Password</div>
                <input type="text" value={draftCoachPw} onChange={e => setDraftCoachPw(e.target.value)} placeholder="Set admin password..." style={{ width: "100%", background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }} />
              </div>
            )}
            <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Athlete Passwords</div>
            {athletes.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.white, minWidth: 100 }}>{a.name}</div>
                <input type="text" value={draftCreds[a.id]||""} onChange={e => setDraftCreds(d=>({...d,[a.id]:e.target.value}))} placeholder="Set password..." style={{ flex: 1, background: "#eceae7", border: `1px solid ${C.border}`, borderRadius: 5, padding: "7px 10px", color: C.white, fontSize: 12, outline: "none", ...mono }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setShowPasswords(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={savePasswords} disabled={savingPw} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>{savingPw ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState([]);
  const [plans, setPlans] = useState({});
  const [progress, setProgress] = useState({});
  const [credentials, setCredentials] = useState({});
  const [coaches, setCoaches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [session, setSession] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      let [ath, pln, prg, creds, coachs] = await Promise.all([dbGetAthletes(), dbGetPlans(), dbGetProgress(), dbGetCredentials(), dbGetCoaches()]);
      if (ath.length === 0) {
        for (const a of SEED_ATHLETES) await dbUpsertAthlete(a);
        for (const [id, plan] of Object.entries(SEED_PLANS)) await dbUpsertPlan(id, plan);
        ath = SEED_ATHLETES; pln = SEED_PLANS;
      }
      setAthletes(ath); setPlans(pln); setProgress(prg); setCredentials(creds); setCoaches(coachs);
      // ensure template creator has a plan
      if (!pln[TEMPLATE_CREATOR_ID]) {
        const blankPlan = { weeks: [{ label: "Week 1", days: [{ label: "Day 1", exercises: [] }] }], published: [], blockStart: "", blockEnd: "", blockNotes: "" };
        await dbUpsertPlan(TEMPLATE_CREATOR_ID, blankPlan);
        pln[TEMPLATE_CREATOR_ID] = blankPlan;
      }
      setLoading(false);
    })();
  }, []);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };

  const lastBackup = React.useRef({});
  const updatePlan = useCallback(async (id, plan) => {
    setPlans(prev => {
      const merged = { ...prev[id], ...plan };
      dbUpsertPlan(id, merged);
      // backup at most once per 60s per athlete
      const now = Date.now();
      if (!lastBackup.current[id] || now - lastBackup.current[id] > 60000) {
        lastBackup.current[id] = now;
        dbBackupPlan(id, merged);
      }
      return { ...prev, [id]: merged };
    });
    flash();
  }, []);

  const publishWeeks = useCallback(async (id, publishedIndices) => {
    setPlans(prev => {
      const p = prev[id];
      const np = { ...prev, [id]: { ...p, published: publishedIndices } };
      dbUpsertPlan(id, np[id]);
      return np;
    });
    flash();
  }, []);

  const updateProgress = useCallback(async (id, dayKey, exId, ep) => {
    setProgress(prev => {
      const ap = prev[id] || {};
      const dp = ap[dayKey] || {};
      const np = { ...prev, [id]: { ...ap, [dayKey]: { ...dp, [exId]: ep } } };
      dbUpsertProgress(id, np[id]);
      return np;
    });
  }, []);

  const updateOverflow = useCallback(async (id, ov) => {
    setProgress(prev => {
      const ap = prev[id] || {};
      const np = { ...prev, [id]: { ...ap, overflow: ov } };
      dbUpsertProgress(id, np[id]);
      return np;
    });
  }, []);

  const editExercise = useCallback(async (id, dayKey, updatedEx) => {
    if (dayKey === "overflow") {
      setProgress(prev => {
        const ap = prev[id] || {};
        const ov = (ap.overflow || []).map(e => e.id === updatedEx.id ? { ...e, ...updatedEx } : e);
        const np = { ...prev, [id]: { ...ap, overflow: ov } };
        dbUpsertProgress(id, np[id]);
        return np;
      });
    } else {
      // dayKey is like "w0_d2" for week 0, day 2
      const match = dayKey.match(/w(\d+)_d(\d+)/);
      if (match) {
        const wi = parseInt(match[1]), di = parseInt(match[2]);
        setPlans(prev => {
          const p = prev[id]; if (!p) return prev;
          const nw = p.weeks.map((wk, i) => i === wi ? { ...wk, days: wk.days.map((d, j) => j === di ? { ...d, exercises: d.exercises.map(e => e.id === updatedEx.id ? updatedEx : e) } : d) } : wk);
          const np = { ...prev, [id]: { ...p, weeks: nw } };
          dbUpsertPlan(id, np[id]);
          return np;
        });
      }
    }
    flash();
  }, []);

  const addAthlete = useCallback(async (a) => {
    const newPlan = { weeks: [{ label: "Week 1", days: [{ label: "Day 1", exercises: [] }] }], published: [], blockStart: "", blockEnd: "", blockNotes: "" };
    if (!a.coach_id) a = { ...a, coach_id: session?.isAdmin ? 'admin' : session?.coachId || null };
    await dbUpsertAthlete(a);
    await dbUpsertPlan(a.id, newPlan);
    setAthletes(prev => [...prev, a]);
    setPlans(prev => ({ ...prev, [a.id]: newPlan }));
  }, []);

  const saveTemplate = useCallback(async (name, type, data) => {
    const coachId = session?.coachId || null;
    const t = { id: uid(), coachId, name, type, data };
    await dbSaveTemplate(t);
    setTemplates(prev => [{ ...t, created_at: new Date().toISOString() }, ...prev]);
  }, [session]);

  const deleteTemplate = useCallback(async (id) => {
    await dbDeleteTemplate(id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  const addCoach = useCallback(async (c) => {
    await dbUpsertCoach(c);
    setCoaches(prev => [...prev, c]);
  }, []);

  const deleteCoach = useCallback(async (id) => {
    await dbDeleteCoach(id);
    setCoaches(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateCoach = useCallback(async (c) => {
    await dbUpsertCoach(c);
    setCoaches(prev => prev.map(x => x.id === c.id ? c : x));
  }, []);

  const deleteAthlete = useCallback(async (id) => {
    await dbDeleteAthlete(id);
    setAthletes(prev => prev.filter(a => a.id !== id));
  }, []);

  // load templates once session is known
  React.useEffect(() => {
    if (!session || session.role !== "coach") return;
    const coachId = session.isAdmin ? null : session.coachId;
    dbGetTemplates(coachId).then(setTemplates);
  }, [session?.coachId, session?.isAdmin]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", ...mono, fontSize: 12, color: C.muted, background: C.black, flexDirection: "column", gap: 12 }}>
      <div style={{ ...bebas, fontSize: 28, letterSpacing: 2, color: C.white }}>ROCK POINT <span style={{ color: C.orange }}>COACHING</span></div>
      <div>Loading...</div>
    </div>
  );

  if (!session) return (
    <LoginScreen athletes={athletes} credentials={credentials} coaches={coaches}
      onLoginAthlete={(id) => setSession({ role: "athlete", athleteId: id })}
      onLoginCoach={() => setSession({ role: "coach", isAdmin: true })}
      onLoginSubCoach={(coachId) => setSession({ role: "coach", isAdmin: false, coachId })} />
  );

  if (session.role === "athlete") {
    const athlete = athletes.find(a => a.id === session.athleteId);
    return <AthleteView athlete={athlete} plan={plans[session.athleteId]} progress={progress[session.athleteId] || {}}
      onProgressChange={(d, e, ep) => updateProgress(session.athleteId, d, e, ep)}
      onOverflowChange={(ov) => updateOverflow(session.athleteId, ov)}
      onEditExercise={(d, ex) => editExercise(session.athleteId, d, ex)}
      onLogout={() => setSession(null)} />;
  }

  // filter athletes by coach if sub-coach
  const visibleAthletes = session.isAdmin ? athletes : athletes.filter(a => a.coach_id === session.coachId);

  return <CoachDashboard
    athletes={visibleAthletes} allAthletes={athletes} plans={plans} progress={progress} credentials={credentials}
    coaches={coaches} isAdmin={session.isAdmin} coachId={session.coachId || null}
    templates={templates}
    onSaveTemplate={saveTemplate}
    onDeleteTemplate={deleteTemplate}
    onUpdateCredentials={setCredentials}
    onUpdateCoachPassword={() => {}}
    onPlanChange={updatePlan}
    onPublish={publishWeeks}
    onProgressChange={updateProgress}
    onOverflowChange={updateOverflow}
    onEditExercise={editExercise}
    onAddAthlete={addAthlete}
    onDeleteAthlete={deleteAthlete}
    onAddCoach={addCoach}
    onDeleteCoach={deleteCoach}
    onUpdateCoach={updateCoach}
    onLogout={() => setSession(null)}
    saved={saved}
  />;
}
