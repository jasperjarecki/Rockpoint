import React from "react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import ReactDOM from "react-dom";

// Local date helper — avoids UTC timezone causing wrong date late at night
function localDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

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

const LIGHT = {
  black: "#f5f5f3", white: "#111111", orange: "#3d9e7a", purple: "#5b7fa6",
  gray: "#ffffff", gray2: "#f0efed", gray3: "#d8d8d6", muted: "#888884", border: "#e0e0de",
};
const DARK = {
  black: "#111111", white: "#f0efed", orange: "#3d9e7a", purple: "#7a9fc2",
  gray: "#1a1a1a", gray2: "#222222", gray3: "#333333", muted: "#888884", border: "#2e2e2e",
};
let C = { ...LIGHT }; // v2 - updated each render

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
};  // Patrick's plan lives in Supabase — removed from seed to prevent overwrite on network errors

const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap";
document.head.appendChild(_fl);
const _gs = document.createElement("style");
document.head.appendChild(_gs);
function updateGlobalStyles() {
  _gs.textContent = `*, *::before, *::after{box-sizing:border-box;margin:0;padding:0} body{background:${C.black};color:${C.white};font-family:'DM Sans',sans-serif} ::-webkit-scrollbar{width:3px;height:3px} ::-webkit-scrollbar-thumb{background:${C.gray3};border-radius:2px} input,textarea,select{font-family:'DM Sans',sans-serif} textarea.athlete-note::placeholder{color:#888;font-style:normal;font-size:12px;letter-spacing:0.3px}`;
}
updateGlobalStyles();

const uid = () => Math.random().toString(36).slice(2, 9);
const TEMPLATE_CREATOR_ID = "__template_creator__";
const VOLUME_TIERS_PAGE_ID = "__volume_tiers__";

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
function getVideoMeta(url) {
  if (!url) return null;
  // YouTube
  const embedUrl = parseYouTubeEmbed(url);
  if (embedUrl) return { type: 'embed', url: embedUrl };
  // Google Drive: convert /view or /edit to /preview for iframe embedding
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) return { type: 'embed', url: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
  // Any other URL — open in new tab
  try { new URL(url); return { type: 'link', url }; } catch(e) { return null; }
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
// Volume tiers scale the weekly load allowance per unit sleep. med_high = 1.0
// preserves the original behavior (load ratio threshold of 1.0 / 1.3). Higher
// tiers raise the ceiling; lower tiers lower it. The tier id is persisted on
// the athlete row as the text column `volume_tier`.
const VOLUME_TIERS = [
  { id: "low",       label: "Low",       multiplier: 0.5   },
  { id: "med_low",   label: "Med-Low",   multiplier: 0.875 },
  { id: "med_high",  label: "Med-High",  multiplier: 1.0   },
  { id: "high",      label: "High",      multiplier: 1.25  },
  { id: "very_high", label: "Very High", multiplier: 1.5   },
];
const DEFAULT_VOLUME_TIER = "med_high";
const getVolumeMultiplier = (athlete) => {
  const tier = VOLUME_TIERS.find(t => t.id === (athlete?.volume_tier || DEFAULT_VOLUME_TIER));
  return tier ? tier.multiplier : 1.0;
};

async function dbGetAthletes() { const { data } = await sb.from("athletes").select("*"); return data || []; }
async function dbUpsertAthlete(a) { await sb.from("athletes").upsert({ id: a.id, name: a.name, type: a.type, level: a.level, coach_id: a.coach_id || null, volume_tier: a.volume_tier || DEFAULT_VOLUME_TIER }); }
async function dbDeleteAthlete(id) { await sb.from("athletes").delete().eq("id", id); }
async function dbGetPlans() {
  const { data } = await sb.from("plans").select("*");
  const result = {};
  (data || []).forEach(row => { result[row.athlete_id] = migratePlan(row.data); });
  return result;
}
async function dbUpsertPlan(athleteId, planData) { await sb.from("plans").upsert({ athlete_id: athleteId, data: planData }); }
async function dbBackupPlan(athleteId, planData, backupType = 'edit') {
  try {
    const limit = backupType === 'daily' ? 90 : 50;
    const { data: existing } = await sb.from("plan_backups").select("id").eq("athlete_id", athleteId).eq("backup_type", backupType).order("saved_at", { ascending: true });
    if (existing && existing.length >= limit) {
      const toDelete = existing.slice(0, existing.length - limit + 1).map(r => r.id);
      await sb.from("plan_backups").delete().in("id", toDelete);
    }
    await sb.from("plan_backups").insert({ athlete_id: athleteId, data: planData, backup_type: backupType });
  } catch(e) { console.warn("Backup failed:", e); }
}
async function uploadExerciseImage(file, exId) {
  const ext = file.name.split('.').pop();
  const path = `${exId}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from('exercise-images').upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = sb.storage.from('exercise-images').getPublicUrl(path);
  return data.publicUrl;
}

async function dbBackupProgress(athleteId, progressData, backupType = 'edit') {
  try {
    const limit = backupType === 'daily' ? 90 : 50;
    const { data: existing } = await sb.from("progress_backups").select("id").eq("athlete_id", athleteId).eq("backup_type", backupType).order("saved_at", { ascending: true });
    if (existing && existing.length >= limit) {
      const toDelete = existing.slice(0, existing.length - limit + 1).map(r => r.id);
      await sb.from("progress_backups").delete().in("id", toDelete);
    }
    await sb.from("progress_backups").insert({ athlete_id: athleteId, data: progressData, backup_type: backupType });
  } catch(e) { console.warn("Progress backup failed:", e); }
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
async function dbUpsertAthleteWithCoach(a) { await sb.from("athletes").upsert({ id: a.id, name: a.name, type: a.type, level: a.level, coach_id: a.coach_id, volume_tier: a.volume_tier || DEFAULT_VOLUME_TIER }); }
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
function renderMarkdown(text, textColor) {
  const tc = textColor || C.white;
  if (!text) return null;
  const lines = text.split('\n');
  const els = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('# ')) {
      els.push(<div key={i} style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 1, color:tc, marginBottom: 6, marginTop: i>0?12:0 }}>{line.slice(2)}</div>);
    } else if (line.startsWith('## ')) {
      els.push(<div key={i} style={{ fontFamily:"'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, color:tc, marginBottom: 4, marginTop: i>0?10:0 }}>{line.slice(3)}</div>);
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      const items = [];
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('• '))) {
        items.push(<li key={i} style={{ marginBottom: 3 }}>{inlineFormat(lines[i].slice(2))}</li>);
        i++;
      }
      els.push(<ul key={'ul'+i} style={{ paddingLeft: 18, marginBottom: 8, marginTop: 2 }}>{items}</ul>);
      continue;
    } else if (/^\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        const content = lines[i].replace(/^\d+\. /, '');
        items.push(<li key={i} style={{ marginBottom: 3 }}>{inlineFormat(content)}</li>);
        i++;
      }
      els.push(<ol key={'ol'+i} style={{ paddingLeft: 20, marginBottom: 8, marginTop: 2 }}>{items}</ol>);
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

  const insertNumbered = () => {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const newVal = value.slice(0, lineStart) + '1. ' + value.slice(lineStart);
    onChange(newVal);
    setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + 3; }, 0);
  };

  const toolBtn = (label, action) => (
    <button key={label} onMouseDown={e => { e.preventDefault(); action(); }}
      style={{ ...mono, fontSize: 11, padding: "4px 9px", borderRadius: 4, border: `1px solid ${C.border}`, background: C.gray, color: C.white, cursor: "pointer", fontWeight: label==="B"?700:"normal", fontStyle: label==="I"?"italic":"normal" }}>{label}</button>
  );

  return (
    <div style={{ border: `1px solid ${focused ? C.orange : C.border}`, borderRadius: 8, overflow: "hidden", background: C.gray2 }}>
      <div style={{ display: "flex", gap: 4, padding: "6px 8px", borderBottom: `1px solid ${C.border}`, background: C.gray2, flexWrap: "wrap" }}>
        {toolBtn("B", () => wrap("**", "**"))}
        {toolBtn("I", () => wrap("*", "*"))}
        {toolBtn("H1", () => wrap("# ", ""))}
        {toolBtn("H2", () => wrap("## ", ""))}
        {toolBtn("•", insertBullet)}
        {toolBtn("1.", insertNumbered)}
      </div>
      <textarea ref={ref} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ width: "100%", background: "transparent", border: "none", color: C.white, fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", padding: "10px 12px", fontFamily: "'DM Mono', monospace" }} />
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
  const videoMeta = getVideoMeta(ex.videoUrl);
  const inp = { width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "8px 10px", color: C.white, fontSize: 13, outline: "none", ...mono };

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
              <RichTextEditor value={draft.notes} onChange={v => setDraft(d => ({ ...d, notes: v }))} placeholder="Coach notes..." rows={3} />
              <input value={draft.videoUrl||""} onChange={e => setDraft(d => ({ ...d, videoUrl: e.target.value }))} placeholder="Video URL (YouTube, Google Drive, etc.)..." style={inp} />
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
                {videoMeta && !editing && (
                  <button onClick={() => videoMeta.type === 'embed' ? setShowVideo(true) : window.open(videoMeta.url, '_blank')} style={{ ...mono, fontSize: 9, padding: "3px 8px", borderRadius: 4, border: `1px solid #c0392b`, background: "rgba(192,57,43,0.08)", color: "#c0392b", cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.5 }}>▶ Demo</button>
                )}
                {ex.imageUrl && !videoMeta && !editing && (
                  <button onClick={() => setShowVideo(true)} style={{ ...mono, fontSize: 9, padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer", whiteSpace: "nowrap" }}>📷</button>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: ex.notes ? 6 : 0 }}>
                {ex.sets && <span style={{ fontFamily:"'DM Mono',monospace", fontSize: 15, fontWeight: 500, color: C.orange, display: "block", marginBottom: 2 }}>{ex.sets}</span>}
                <span style={{ ...mono, fontSize: 10, color: C.muted }}>{ex.category}</span>
                {isOverflow && ex.fromDay != null && <span style={{ ...mono, fontSize: 9, color: "#4a7aab", background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>skipped from {ex.fromWeek != null ? `W${ex.fromWeek + 1} · ` : ""}Day {ex.fromDay + 1}</span>}
                {sourceDayLabel && <span style={{ ...mono, fontSize: 9, color: C.purple, background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>from {sourceDayLabel}</span>}
                {alsoOnLabels && <span style={{ ...mono, fontSize: 9, color: C.purple, background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>also on {alsoOnLabels}</span>}
              </div>
              {ex.notes && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{renderMarkdown(ex.notes, C.muted)}</div>}
              {ex.imageUrl && !editing && (
                <div style={{ marginTop: 8 }}>
                  <img src={ex.imageUrl} alt={ex.text} onClick={() => setShowVideo(true)}
                    style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 7, cursor: "pointer", border: `1px solid ${C.border}` }} />
                </div>
              )}
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
            style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, fontSize: 13, resize: "none", outline: "none", padding: "7px 10px", ...mono }}
            onFocus={e => { e.target.style.borderColor = C.orange; e.target.style.background = C.gray2; }} onBlur={e => { e.target.style.borderColor = C.border; }} />
        </div>
      )}
      {/* Image modal */}
      {showVideo && ex.imageUrl && !videoMeta && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 700, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => setShowVideo(false)}>
          <div style={{ width: "100%", maxWidth: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ ...bebas, fontSize: 18, color: "#fff", letterSpacing: 1 }}>{ex.text}</div>
              <button onClick={() => setShowVideo(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 24, lineHeight: 1 }}>✕</button>
            </div>
            <img src={ex.imageUrl} alt={ex.text} style={{ width: "100%", borderRadius: 10, objectFit: "contain", maxHeight: "70vh" }} onClick={e => e.stopPropagation()} />
          </div>
        </div>
      )}
      {/* Video modal */}
      {showVideo && videoMeta?.type === 'embed' && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 700, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 560 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ ...bebas, fontSize: 18, color: "#fff", letterSpacing: 1 }}>{ex.text}</div>
              <button onClick={() => setShowVideo(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 24, lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 10, overflow: "hidden", background: "#000" }}>
              <iframe src={videoMeta.url} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
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
  const inp = { width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "8px 10px", color: C.white, fontSize: 13, outline: "none" };
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
function DayEditor({ days, onDaysChange, clipboard, onCopy, dayClipboard, onCopyDay, templates = [], onSaveTemplate, onInsertDayTemplate, sharedDay, setSharedDay }) {
  const [_activeDay, _setActiveDay] = useState(0);
  const activeDay = sharedDay !== undefined ? sharedDay : _activeDay;
  const setActiveDay = setSharedDay || _setActiveDay;
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
                {days.length > 1 && <button onMouseDown={e => { e.preventDefault(); e.stopPropagation(); removeDay(i); }} style={{ ...mono, fontSize: 9, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: "#a05555", cursor: "pointer" }}>✕</button>}
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
        {(() => {
          const combined = [];
          day.exercises.forEach((ex, idx) => combined.push({ ex, idx, isShared: false }));
          sharedInThisDay.forEach((ex, si) => {
            const pos = ex.sharedDayPositions?.[activeDay] ?? (day.exercises.length + si);
            combined.splice(Math.min(Math.max(0, pos), combined.length), 0, { ex, isShared: true, si });
          });
          return combined.map(({ ex, idx, isShared, si }, combinedIdx) => {
            if (isShared) {
              const moveShared = (dir) => {
                const newPos = Math.max(0, Math.min(combined.length - 1, combinedIdx + dir));
                const newDays = days.map((d, di) => di === ex._sourceDay
                  ? { ...d, exercises: d.exercises.map(e => e.id === ex.id ? { ...e, sharedDayPositions: { ...(e.sharedDayPositions || {}), [activeDay]: newPos } } : e) }
                  : d
                );
                onDaysChange(newDays);
              };
              return (
                <div key={ex.id + "_shared"} style={{ background: "rgba(91,127,166,0.06)", border: `1px solid rgba(91,127,166,0.3)`, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...mono, fontSize: 9, color: C.purple, background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3, display: "inline-block", marginBottom: 4 }}>from {days[ex._sourceDay]?.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 3 }}>{ex.text}</div>
                      {ex.sets && <div style={{ ...mono, fontSize: 11, color: C.orange }}>{ex.sets}</div>}
                      <div style={{ ...mono, fontSize: 10, color: C.muted }}>{ex.category}</div>
                      {ex.notes && <div style={{ ...mono, fontSize: 11, color: C.muted, fontStyle: "italic", marginTop: 3 }}>{ex.notes}</div>}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
                      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); moveShared(-1); }} disabled={combinedIdx === 0} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: combinedIdx===0?"#ccc":C.muted, cursor: combinedIdx===0?"default":"pointer", padding: "3px 7px", fontSize: 11 }}>↑</button>
                      <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); moveShared(1); }} disabled={combinedIdx === combined.length-1} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: combinedIdx===combined.length-1?"#ccc":C.muted, cursor: combinedIdx===combined.length-1?"default":"pointer", padding: "3px 7px", fontSize: 11 }}>↓</button>
                    </div>
                  </div>
                </div>
              );
            }
          const options = ex.options || [];
          const addOption = () => updateEx(ex.id, "options", options.length === 0 ? [{ label: "", sets: "", notes: "" }, { label: "", sets: "", notes: "" }] : [...options, { label: "", sets: "", notes: "" }]);
          const updateOption = (oi, updated) => updateEx(ex.id, "options", options.map((o, i) => i===oi ? { ...o, ...updated } : o));
          const removeOption = (oi) => updateEx(ex.id, "options", options.filter((_, i) => i !== oi));
          return (
            <div key={ex.id} style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <input value={ex.text} onChange={e => updateEx(ex.id,"text",e.target.value)} style={{ flex: 1, fontSize: 14, fontWeight: 500, background: "transparent", border: "none", borderBottom: `1px solid transparent`, color: C.white, outline: "none", padding: "1px 0" }} onFocus={e => e.target.style.borderBottomColor=C.gray3} onBlur={e => e.target.style.borderBottomColor="transparent"} />
                    <button onMouseDown={e => { e.preventDefault(); updateEx(ex.id,"type", ex.type === "alternating" ? undefined : "alternating"); }} style={{ ...mono, fontSize: 8, padding: "3px 6px", background: ex.type === "alternating" ? "rgba(91,127,166,0.2)" : "none", border: `1px solid ${ex.type === "alternating" ? "#5b7fa6" : C.border}`, borderRadius: 3, color: ex.type === "alternating" ? "#5b7fa6" : C.muted, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>A/B</button>
                    <label style={{ ...mono, fontSize: 8, padding: "3px 6px", background: "none", border: `1px solid ${ex.imageUrl ? C.orange : C.border}`, borderRadius: 3, color: ex.imageUrl ? C.orange : C.muted, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                      {ex.imageUrl ? "📷 ✓" : "📷"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={async e => {
                        const file = e.target.files[0]; if (!file) return;
                        try {
                          const url = await uploadExerciseImage(file, ex.id);
                          updateEx(ex.id, "imageUrl", url);
                        } catch(err) { alert("Upload failed: " + err.message); }
                      }} />
                    </label>
                    {ex.imageUrl && <button onMouseDown={e => { e.preventDefault(); updateEx(ex.id, "imageUrl", ""); }} style={{ ...mono, fontSize: 8, padding: "3px 6px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: "#a05555", cursor: "pointer", flexShrink: 0 }}>✕</button>}
                  </div>
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
                  <div style={{ marginTop: 8 }}>
                    <input value={ex.sets||""} onChange={e => updateEx(ex.id,"sets",e.target.value)} placeholder="Sets / volume" style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: C.orange, fontSize: 11, ...mono, outline: "none", marginBottom: 6 }} />
                    <RichTextEditor value={ex.notes||""} onChange={v => updateEx(ex.id,"notes",v)} placeholder="Coach notes (bold, bullets, numbered lists supported)..." rows={2} />
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                    <input value={ex.videoUrl||""} onChange={e => updateEx(ex.id,"videoUrl",e.target.value)} placeholder="Video URL (YouTube, Google Drive, etc.)..." style={{ flex: 1, minWidth: 160, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: C.muted, fontSize: 11, outline: "none" }} />
                  </div>
                  {ex.videoUrl && getVideoMeta(ex.videoUrl) && (() => {
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
                              style={{ flex: 1, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: C.white, fontSize: 12, outline: "none", fontWeight: 500 }} />
                            <button onClick={() => removeOption(oi)} style={{ background: "none", border: "none", color: "#a05555", cursor: "pointer", fontSize: 13, padding: "2px 4px" }}>✕</button>
                          </div>
                          <div style={{ display: "flex", gap: 6, marginLeft: 22 }}>
                            <input value={opt.sets||""} onChange={e => updateOption(oi, { ...opt, sets: e.target.value })} placeholder="Sets / volume..."
                              style={{ flex: 1, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 8px", color: C.orange, fontSize: 11, ...mono, outline: "none" }} />
                            <input value={opt.notes||""} onChange={e => updateOption(oi, { ...opt, notes: e.target.value })} placeholder="Notes..."
                              style={{ flex: 2, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 4, padding: "4px 8px", color: C.muted, fontSize: 11, outline: "none" }} />
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
                    <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Athlete can choose a different day to complete this exercise:</div>
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
          });
        })()}
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
// Detect mobile viewports. The breakpoint of 640px keeps tablets on the
// desktop editor; only narrow phone-class viewports trigger the mobile UI.
function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return mobile;
}

// Mobile plan editor — drill-down through Weeks -> Days -> Exercises.
// Pass 2: reorder mode, add-exercise sheet, undo toast, block-info card,
// "More" expand on each exercise card.
function MobileCoachPlanEditor({ athlete, plan, onPlanChange, onPublish, sharedWeekIdx, setSharedWeekIdx, sharedDay, setSharedDay }) {
  // view: "weeks" | "days" | "day"
  const [view, setView] = useState("weeks");
  const [weekIdx, setWeekIdx] = useState(0);
  const [dayIdx, setDayIdx] = useState(0);

  // Publish-sheet visibility
  const [showPublish, setShowPublish] = useState(false);
  const [publishDraft, setPublishDraft] = useState([]);

  // Block-info card collapsed/expanded
  const [showBlockInfo, setShowBlockInfo] = useState(false);
  const [uploadingBlockImage, setUploadingBlockImage] = useState(false);

  // Day-view state
  const [reorderMode, setReorderMode] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [draftEx, setDraftEx] = useState({ text: "", sets: "", category: "Strength", notes: "" });
  const [expandedMore, setExpandedMore] = useState(new Set()); // exercise ids whose "More" panel is open
  const [uploadingExImageId, setUploadingExImageId] = useState(null);

  // Undo toast — supports a single pending toast at a time. If a new
  // delete happens before the previous expires, the previous is forfeited
  // (its 5s elapsed deleting is permanent).
  const [undoToast, setUndoToast] = useState(null); // { kind, payload, expiresAt }
  const undoTimerRef = React.useRef(null);
  const queueUndoToast = (toast) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoToast(toast);
    undoTimerRef.current = setTimeout(() => setUndoToast(null), 5000);
  };
  const clearUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoToast(null);
  };
  useEffect(() => () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current); }, []);

  const weeks = plan?.weeks || [];
  const published = plan?.published || [];

  // ── Plan mutations ─────────────────────────────────────────────────────
  const updateWeek = (i, days) => {
    const w = weeks.map((wk, j) => j === i ? { ...wk, days } : wk);
    onPlanChange({ ...plan, weeks: w });
  };
  const addWeek = () => {
    const newWeek = { label: `Week ${weeks.length + 1}`, days: [{ label: "Day 1", exercises: [] }] };
    onPlanChange({ ...plan, weeks: [...weeks, newWeek] });
  };
  const deleteWeek = (i) => {
    if (!window.confirm(`Delete ${weeks[i].label}? All days and exercises in this week will be removed.`)) return;
    onPlanChange({ ...plan, weeks: weeks.filter((_, j) => j !== i), published: published.filter(p => p !== i).map(p => p > i ? p - 1 : p) });
    if (weekIdx >= i && weekIdx > 0) setWeekIdx(weekIdx - 1);
    setView("weeks");
  };
  const addDay = (wi) => {
    const wk = weeks[wi];
    const newDays = [...wk.days, { label: `Day ${wk.days.length + 1}`, exercises: [] }];
    updateWeek(wi, newDays);
  };
  const deleteDay = (wi, di) => {
    if (!window.confirm(`Delete ${weeks[wi].days[di].label}? All exercises in this day will be removed.`)) return;
    const newDays = weeks[wi].days.filter((_, j) => j !== di);
    updateWeek(wi, newDays);
    setView("days");
  };
  const updateDay = (wi, di, day) => {
    const newDays = weeks[wi].days.map((d, j) => j === di ? day : d);
    updateWeek(wi, newDays);
  };
  const addExerciseFromSheet = () => {
    if (!draftEx.text.trim()) return;
    const day = weeks[weekIdx].days[dayIdx];
    const newEx = { id: uid(), text: draftEx.text.trim(), sets: draftEx.sets, category: draftEx.category, notes: draftEx.notes };
    updateDay(weekIdx, dayIdx, { ...day, exercises: [...day.exercises, newEx] });
    setDraftEx({ text: "", sets: "", category: "Strength", notes: "" });
    setShowAddSheet(false);
  };
  const updateExercise = (wi, di, ei, patch) => {
    const day = weeks[wi].days[di];
    const newExs = day.exercises.map((e, j) => j === ei ? { ...e, ...patch } : e);
    updateDay(wi, di, { ...day, exercises: newExs });
  };
  const deleteExerciseWithUndo = (wi, di, ei) => {
    const day = weeks[wi].days[di];
    const removed = day.exercises[ei];
    const newExs = day.exercises.filter((_, j) => j !== ei);
    updateDay(wi, di, { ...day, exercises: newExs });
    queueUndoToast({ kind: "exercise_delete", payload: { wi, di, ei, ex: removed } });
  };
  const undoExerciseDelete = () => {
    if (!undoToast || undoToast.kind !== "exercise_delete") return;
    const { wi, di, ei, ex } = undoToast.payload;
    const day = weeks[wi]?.days[di];
    if (!day) { clearUndo(); return; }
    const newExs = [...day.exercises];
    newExs.splice(ei, 0, ex); // restore to original index
    updateDay(wi, di, { ...day, exercises: newExs });
    clearUndo();
  };
  const moveExercise = (wi, di, ei, dir) => {
    const day = weeks[wi].days[di];
    const newEi = ei + dir;
    if (newEi < 0 || newEi >= day.exercises.length) return;
    const newExs = [...day.exercises];
    [newExs[ei], newExs[newEi]] = [newExs[newEi], newExs[ei]];
    updateDay(wi, di, { ...day, exercises: newExs });
  };

  // ── Block-info handlers ────────────────────────────────────────────────
  const updateBlock = (patch) => onPlanChange({ ...plan, ...patch });
  const onBlockImage = async (file) => {
    if (!file) return;
    setUploadingBlockImage(true);
    try {
      const url = await uploadExerciseImage(file, `block-${athlete.id}`);
      updateBlock({ blockImage: url });
    } catch (err) {
      console.warn("Block image upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploadingBlockImage(false);
    }
  };
  const onExerciseImage = async (file, exId, wi, di, ei) => {
    if (!file) return;
    setUploadingExImageId(exId);
    try {
      const url = await uploadExerciseImage(file, exId);
      updateExercise(wi, di, ei, { imageUrl: url });
    } catch (err) {
      console.warn("Exercise image upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploadingExImageId(null);
    }
  };

  // ── Publish ────────────────────────────────────────────────────────────
  const openPublish = () => { setPublishDraft([...published]); setShowPublish(true); };
  const togglePublishWeek = (i) => {
    setPublishDraft(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i].sort((a, b) => a - b));
  };
  const confirmPublish = () => { onPublish(publishDraft); setShowPublish(false); };

  // ── More-expand toggle helper ──────────────────────────────────────────
  const toggleMore = (exId) => {
    setExpandedMore(prev => {
      const next = new Set(prev);
      if (next.has(exId)) next.delete(exId); else next.add(exId);
      return next;
    });
  };

  // ── Header chrome ──────────────────────────────────────────────────────
  const Header = ({ title, onBack, right = null }) => (
    <div style={{ position: "sticky", top: 0, zIndex: 10, background: C.black, borderBottom: `1px solid ${C.border}`, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
      {onBack ? (
        <button onClick={onBack} style={{ ...mono, fontSize: 14, padding: "8px 10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, cursor: "pointer" }}>‹</button>
      ) : <div style={{ width: 34 }} />}
      <div style={{ flex: 1, ...bebas, fontSize: 18, letterSpacing: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</div>
      {right}
    </div>
  );

  // ── Undo toast (rendered at root so it persists across views) ──────────
  const UndoToast = () => undoToast && (
    <div style={{ position: "fixed", bottom: 16, left: "50%", transform: "translateX(-50%)", zIndex: 600, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 24, padding: "10px 8px 10px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.4)", maxWidth: "90%" }}>
      <span style={{ ...mono, fontSize: 12, color: C.white }}>Deleted</span>
      <button onClick={undoExerciseDelete} style={{ ...mono, fontSize: 12, padding: "6px 14px", background: "rgba(224,122,58,0.15)", border: `1px solid ${C.orange}`, borderRadius: 16, color: C.orange, cursor: "pointer", fontWeight: 600 }}>Undo</button>
    </div>
  );

  // ── Render: weeks ──────────────────────────────────────────────────────
  if (view === "weeks") {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.black, color: C.white }}>
        <Header title={athlete.name} right={athlete.id !== TEMPLATE_CREATOR_ID && (
          <button onClick={openPublish} style={{ ...mono, fontSize: 11, padding: "8px 12px", background: C.orange, border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" }}>Publish ↗</button>
        )} />
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>

          {/* Block Info — collapsible */}
          <div style={{ marginBottom: 14, background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            <button onClick={() => setShowBlockInfo(v => !v)}
              style={{ width: "100%", textAlign: "left", background: "none", border: "none", padding: "12px 14px", color: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Block Info</span>
              <span style={{ ...mono, fontSize: 12, color: C.muted }}>{showBlockInfo ? "▲" : "▼"}</span>
            </button>
            {showBlockInfo && (
              <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>START</div>
                    <input type="date" value={plan?.blockStart || ""} onChange={e => updateBlock({ blockStart: e.target.value })}
                      style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.white, fontSize: 12, outline: "none", colorScheme: "dark", ...mono }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>END</div>
                    <input type="date" value={plan?.blockEnd || ""} onChange={e => updateBlock({ blockEnd: e.target.value })}
                      style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.white, fontSize: 12, outline: "none", colorScheme: "dark", ...mono }} />
                  </div>
                </div>
                <div>
                  <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>BLOCK NOTES (visible to coach only)</div>
                  <textarea value={plan?.blockNotes || ""} onChange={e => updateBlock({ blockNotes: e.target.value })}
                    placeholder="Coaching notes for this block. Markdown OK." rows={3}
                    style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                </div>
                <div>
                  <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>BLOCK UPDATE (visible to athlete)</div>
                  <textarea value={plan?.blockUpdate || ""} onChange={e => updateBlock({ blockUpdate: e.target.value })}
                    placeholder="Message for the athlete. Markdown OK." rows={3}
                    style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                </div>
                <div>
                  <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>BLOCK IMAGE</div>
                  {plan?.blockImage && (
                    <div style={{ marginBottom: 8 }}>
                      <img src={plan.blockImage} alt="Block" style={{ width: "100%", borderRadius: 6, maxHeight: 200, objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <label style={{ ...mono, fontSize: 11, padding: "10px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", flex: 1, textAlign: "center" }}>
                      {uploadingBlockImage ? "Uploading…" : plan?.blockImage ? "Replace image" : "Upload image"}
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => onBlockImage(e.target.files?.[0])} />
                    </label>
                    {plan?.blockImage && (
                      <button onClick={() => updateBlock({ blockImage: "" })}
                        style={{ ...mono, fontSize: 11, padding: "10px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: "#a05555", cursor: "pointer" }}>Clear</button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 10, ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{weeks.length} Week{weeks.length !== 1 ? "s" : ""}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {weeks.map((wk, wi) => (
              <button key={wi} onClick={() => { setWeekIdx(wi); setView("days"); }}
                style={{ width: "100%", textAlign: "left", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: C.white, marginBottom: 4 }}>{wk.label}</div>
                  <div style={{ display: "flex", gap: 10, ...mono, fontSize: 10, color: C.muted }}>
                    <span>{wk.days.length} day{wk.days.length !== 1 ? "s" : ""}</span>
                    {published.includes(wi) && <span style={{ color: "#2aaa5e" }}>● live</span>}
                  </div>
                </div>
                <span style={{ ...mono, fontSize: 18, color: C.muted }}>›</span>
              </button>
            ))}
          </div>
          <button onClick={addWeek} style={{ width: "100%", marginTop: 12, ...mono, fontSize: 12, padding: "14px", background: "none", border: `1px dashed ${C.border}`, borderRadius: 8, color: C.muted, cursor: "pointer" }}>+ Add Week</button>
        </div>

        {showPublish && (
          <div onClick={() => setShowPublish(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: C.gray2, borderTop: `1px solid ${C.border}`, borderRadius: "12px 12px 0 0", padding: "20px 16px", maxHeight: "80vh", overflowY: "auto" }}>
              <div style={{ ...bebas, fontSize: 20, marginBottom: 6 }}>Publish Weeks</div>
              <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 14 }}>Select which weeks the athlete can see.</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                {weeks.map((wk, i) => {
                  const isOn = publishDraft.includes(i);
                  return (
                    <button key={i} onClick={() => togglePublishWeek(i)} style={{ width: "100%", textAlign: "left", background: isOn ? "rgba(61,158,122,0.08)" : C.gray, border: `1px solid ${isOn ? "#3d9e7a" : C.border}`, borderRadius: 6, padding: "12px 14px", color: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 14 }}>{wk.label}</span>
                      <span style={{ ...mono, fontSize: 12, color: isOn ? "#3d9e7a" : C.muted }}>{isOn ? "✓" : "○"}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowPublish(false)} style={{ flex: 1, ...mono, fontSize: 12, padding: "12px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer" }}>Cancel</button>
                <button onClick={confirmPublish} style={{ flex: 2, ...mono, fontSize: 12, padding: "12px", background: C.orange, border: "none", borderRadius: 6, color: "#fff", cursor: "pointer" }}>Publish {publishDraft.length}</button>
              </div>
            </div>
          </div>
        )}
        <UndoToast />
      </div>
    );
  }

  // ── Render: days within selected week ──────────────────────────────────
  if (view === "days") {
    const wk = weeks[weekIdx];
    if (!wk) { setView("weeks"); return null; }
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.black, color: C.white }}>
        <Header title={wk.label} onBack={() => setView("weeks")}
          right={<button onClick={() => deleteWeek(weekIdx)} title="Delete week" style={{ ...mono, fontSize: 14, padding: "8px 10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: "#a05555", cursor: "pointer" }}>✕</button>} />
        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {published.includes(weekIdx) && <div style={{ ...mono, fontSize: 10, color: "#2aaa5e", marginBottom: 12 }}>● live to athlete</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {wk.days.map((day, di) => {
              const preview = day.exercises.slice(0, 2).map(e => e.text).join(", ");
              return (
                <button key={di} onClick={() => { setDayIdx(di); setView("day"); setReorderMode(false); }}
                  style={{ width: "100%", textAlign: "left", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: C.white, marginBottom: 4 }}>{day.label}</div>
                    <div style={{ display: "flex", gap: 10, ...mono, fontSize: 10, color: C.muted, alignItems: "center" }}>
                      <span>{day.exercises.length} ex</span>
                      {preview && <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{preview}</span>}
                    </div>
                  </div>
                  <span style={{ ...mono, fontSize: 18, color: C.muted }}>›</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => addDay(weekIdx)} style={{ width: "100%", marginTop: 12, ...mono, fontSize: 12, padding: "14px", background: "none", border: `1px dashed ${C.border}`, borderRadius: 8, color: C.muted, cursor: "pointer" }}>+ Add Day</button>
        </div>
        <UndoToast />
      </div>
    );
  }

  // ── Render: a single day ────────────────────────────────────────────────
  if (view === "day") {
    const wk = weeks[weekIdx];
    const day = wk?.days[dayIdx];
    if (!day) { setView("days"); return null; }

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.black, color: C.white }}>
        <Header title={`${wk.label} · ${day.label}`} onBack={() => { setReorderMode(false); setView("days"); }}
          right={
            <div style={{ display: "flex", gap: 6 }}>
              {day.exercises.length >= 2 && (
                <button onClick={() => setReorderMode(v => !v)}
                  style={{ ...mono, fontSize: 11, padding: "8px 10px", background: reorderMode ? "rgba(224,122,58,0.15)" : "none", border: `1px solid ${reorderMode ? C.orange : C.border}`, borderRadius: 6, color: reorderMode ? C.orange : C.muted, cursor: "pointer" }}>
                  {reorderMode ? "Done" : "Reorder"}
                </button>
              )}
              {!reorderMode && (
                <button onClick={() => deleteDay(weekIdx, dayIdx)} title="Delete day"
                  style={{ ...mono, fontSize: 14, padding: "8px 10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: "#a05555", cursor: "pointer" }}>✕</button>
              )}
            </div>
          } />
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 80px" }}>
          {/* Day label editable (hidden in reorder mode for focus) */}
          {!reorderMode && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Day Label</div>
              <input value={day.label} onChange={e => updateDay(weekIdx, dayIdx, { ...day, label: e.target.value })}
                style={{ width: "100%", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none" }} />
            </div>
          )}

          {/* Exercise list */}
          {day.exercises.length === 0 ? (
            <div style={{ ...mono, fontSize: 11, color: C.muted, textAlign: "center", padding: "30px 0" }}>
              No exercises yet. Tap + Add Exercise below.
            </div>
          ) : reorderMode ? (
            /* Reorder mode: thin rows with up/down arrows */
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {day.exercises.map((ex, ei) => (
                <div key={ex.id || ei} style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ flex: 1, fontSize: 13, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ex.text || "(untitled)"}</div>
                  <button onClick={() => moveExercise(weekIdx, dayIdx, ei, -1)} disabled={ei === 0}
                    style={{ ...mono, fontSize: 16, padding: "6px 10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: ei === 0 ? C.gray3 : C.white, cursor: ei === 0 ? "default" : "pointer", lineHeight: 1 }}>↑</button>
                  <button onClick={() => moveExercise(weekIdx, dayIdx, ei, 1)} disabled={ei === day.exercises.length - 1}
                    style={{ ...mono, fontSize: 16, padding: "6px 10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: ei === day.exercises.length - 1 ? C.gray3 : C.white, cursor: ei === day.exercises.length - 1 ? "default" : "pointer", lineHeight: 1 }}>↓</button>
                </div>
              ))}
            </div>
          ) : (
            /* Normal mode: full editable cards with More expand */
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {day.exercises.map((ex, ei) => {
                const moreOpen = expandedMore.has(ex.id);
                const isUploadingImg = uploadingExImageId === ex.id;
                return (
                  <div key={ex.id || ei} style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                      <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Exercise {ei + 1}</div>
                      <button onClick={() => deleteExerciseWithUndo(weekIdx, dayIdx, ei)}
                        style={{ ...mono, fontSize: 14, padding: "4px 8px", background: "none", border: "none", color: "#a05555", cursor: "pointer", lineHeight: 1 }}>🗑</button>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>EXERCISE</div>
                      <input value={ex.text || ""} onChange={e => updateExercise(weekIdx, dayIdx, ei, { text: e.target.value })}
                        placeholder="Exercise name"
                        style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none" }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>SETS / REPS</div>
                      <input value={ex.sets || ""} onChange={e => updateExercise(weekIdx, dayIdx, ei, { sets: e.target.value })}
                        placeholder="e.g. 3x8 @ 70%"
                        style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.orange, fontSize: 13, outline: "none", ...mono }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>CATEGORY</div>
                      <select value={ALL_CATEGORIES.includes(ex.category) ? ex.category : "Other"} onChange={e => updateExercise(weekIdx, dayIdx, ei, { category: e.target.value })}
                        style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                        {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>NOTES</div>
                      <textarea value={ex.notes || ""} onChange={e => updateExercise(weekIdx, dayIdx, ei, { notes: e.target.value })}
                        placeholder="Optional. Markdown OK."
                        rows={3}
                        style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                    </div>

                    {/* More expand */}
                    <button onClick={() => toggleMore(ex.id)}
                      style={{ width: "100%", ...mono, fontSize: 10, padding: "8px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1 }}>
                      {moreOpen ? "▲ Less" : "▼ More"}
                    </button>
                    {moreOpen && (
                      <div style={{ marginTop: 10, padding: "12px", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div>
                          <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>VIDEO URL</div>
                          <input value={ex.videoUrl || ""} onChange={e => updateExercise(weekIdx, dayIdx, ei, { videoUrl: e.target.value })}
                            placeholder="YouTube, Google Drive, etc."
                            style={{ width: "100%", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 12, outline: "none", ...mono }} />
                        </div>
                        <div>
                          <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>ALTERNATION (A/B WEEKS)</div>
                          <button onClick={() => updateExercise(weekIdx, dayIdx, ei, { type: ex.type === "alternating" ? undefined : "alternating" })}
                            style={{ width: "100%", ...mono, fontSize: 11, padding: "10px", background: ex.type === "alternating" ? "rgba(91,127,166,0.15)" : "none", border: `1px solid ${ex.type === "alternating" ? "#5b7fa6" : C.border}`, borderRadius: 6, color: ex.type === "alternating" ? "#5b7fa6" : C.muted, cursor: "pointer" }}>
                            {ex.type === "alternating" ? "✓ Alternating" : "Mark as alternating"}
                          </button>
                        </div>
                        <div>
                          <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>IMAGE</div>
                          {ex.imageUrl && (
                            <img src={ex.imageUrl} alt={ex.text} style={{ width: "100%", borderRadius: 6, maxHeight: 200, objectFit: "cover", marginBottom: 8 }} />
                          )}
                          <div style={{ display: "flex", gap: 8 }}>
                            <label style={{ flex: 1, textAlign: "center", ...mono, fontSize: 11, padding: "10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer" }}>
                              {isUploadingImg ? "Uploading…" : ex.imageUrl ? "Replace" : "Upload"}
                              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => onExerciseImage(e.target.files?.[0], ex.id, weekIdx, dayIdx, ei)} />
                            </label>
                            {ex.imageUrl && (
                              <button onClick={() => updateExercise(weekIdx, dayIdx, ei, { imageUrl: "" })}
                                style={{ ...mono, fontSize: 11, padding: "10px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: "#a05555", cursor: "pointer" }}>Clear</button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pinned bottom Add Exercise button (hidden in reorder mode) */}
        {!reorderMode && (
          <div style={{ position: "sticky", bottom: 0, padding: "10px 12px", background: C.black, borderTop: `1px solid ${C.border}` }}>
            <button onClick={() => { setDraftEx({ text: "", sets: "", category: "Strength", notes: "" }); setShowAddSheet(true); }}
              style={{ width: "100%", ...mono, fontSize: 13, padding: "14px", background: C.orange, border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontWeight: 500 }}>
              + Add Exercise
            </button>
          </div>
        )}

        {/* Add-exercise slide-up sheet */}
        {showAddSheet && (
          <div onClick={() => setShowAddSheet(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end" }}>
            <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: C.gray2, borderTop: `1px solid ${C.border}`, borderRadius: "12px 12px 0 0", padding: "20px 16px", maxHeight: "90vh", overflowY: "auto" }}>
              <div style={{ ...bebas, fontSize: 20, marginBottom: 14 }}>Add Exercise</div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>EXERCISE</div>
                <input value={draftEx.text} onChange={e => setDraftEx(d => ({ ...d, text: e.target.value }))} autoFocus
                  placeholder="Exercise name"
                  style={{ width: "100%", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>SETS / REPS</div>
                <input value={draftEx.sets} onChange={e => setDraftEx(d => ({ ...d, sets: e.target.value }))}
                  placeholder="e.g. 3x8 @ 70%"
                  style={{ width: "100%", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.orange, fontSize: 13, outline: "none", ...mono }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>CATEGORY</div>
                <select value={ALL_CATEGORIES.includes(draftEx.category) ? draftEx.category : "Other"} onChange={e => setDraftEx(d => ({ ...d, category: e.target.value }))}
                  style={{ width: "100%", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>NOTES</div>
                <textarea value={draftEx.notes} onChange={e => setDraftEx(d => ({ ...d, notes: e.target.value }))}
                  placeholder="Optional. Markdown OK." rows={3}
                  style={{ width: "100%", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setShowAddSheet(false)} style={{ flex: 1, ...mono, fontSize: 12, padding: "12px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.muted, cursor: "pointer" }}>Cancel</button>
                <button onClick={addExerciseFromSheet} disabled={!draftEx.text.trim()}
                  style={{ flex: 2, ...mono, fontSize: 12, padding: "12px", background: draftEx.text.trim() ? C.orange : C.gray3, border: "none", borderRadius: 6, color: "#fff", cursor: draftEx.text.trim() ? "pointer" : "default" }}>Add</button>
              </div>
            </div>
          </div>
        )}

        <UndoToast />
      </div>
    );
  }

  return null;
}

function CoachPlanEditor({ athlete, plan, onPlanChange, onPublish, templates = [], onSaveTemplate, sharedWeekIdx, setSharedWeekIdx, sharedDay, setSharedDay }) {
  const [_activeWeek, _setActiveWeek] = useState(0);
  const activeWeek = sharedWeekIdx !== undefined ? sharedWeekIdx : _activeWeek;
  const setActiveWeek = setSharedWeekIdx || _setActiveWeek;
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
    if (plan?.currentWeekOverride != null) return plan.currentWeekOverride;
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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setShowBlockOverview(v => !v)} style={{ ...mono, fontSize: 11, padding: "9px 14px", borderRadius: 7, border: `1px solid ${showBlockOverview ? C.orange : C.border}`, background: showBlockOverview ? "rgba(61,158,122,0.08)" : "none", color: showBlockOverview ? C.orange : C.muted, cursor: "pointer" }}>
            {showBlockOverview ? "▲ Collapse" : "▼ View All"}
          </button>
          <button onClick={() => {
            const next = window.prompt(`Set current week (1–${weeks.length}):`, currentWeekIdx != null ? currentWeekIdx + 1 : "");
            if (next === null) return;
            if (next.trim() === "") { onPlanChange({ ...plan, currentWeekOverride: null }); return; }
            const idx = parseInt(next) - 1;
            if (isNaN(idx) || idx < 0 || idx >= weeks.length) return;
            onPlanChange({ ...plan, currentWeekOverride: idx });
          }} style={{ ...mono, fontSize: 11, padding: "9px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>
            {currentWeekIdx != null ? `Current: Week ${currentWeekIdx + 1}` : "Set current week"}
          </button>
          {athlete.id !== TEMPLATE_CREATOR_ID && <button onClick={openPublish} style={{ ...mono, fontSize: 11, padding: "9px 18px", borderRadius: 7, border: "none", background: C.orange, color: "#fff", cursor: "pointer", letterSpacing: 0.5, fontWeight: 500 }}>
            Publish to Athlete ↗
          </button>}
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
              style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "6px 8px", color: C.white, fontSize: 12, outline: "none", colorScheme: "light dark", ...mono }} />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 4 }}>END DATE</div>
            <input type="date" value={plan?.blockEnd || ""} onChange={e => onPlanChange({ ...plan, blockEnd: e.target.value })}
              style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "6px 8px", color: C.white, fontSize: 12, outline: "none", colorScheme: "light dark", ...mono }} />
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

      {/* Update */}
      <div style={{ marginBottom: 20, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px" }}>
        <div style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 8 }}>Athlete Update</div>
        <RichTextEditor value={plan?.blockUpdate || ""} onChange={v => onPlanChange({ ...plan, blockUpdate: v, blockUpdateAt: new Date().toISOString() })}
          placeholder="Write a quick update for your athlete — schedule changes, block adjustments, etc."
          rows={3} />
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
          sharedDay={sharedDay} setSharedDay={setSharedDay}
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
              style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none", marginBottom: 16 }} />
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

// ─── Fatigue Log ─────────────────────────────────────────────────────────────
function FatigueLog({ athlete, isCoach = false, forcedView = null, autoOpenLog = null, onSaved = null }) {
  const today = localDateStr();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeView, setActiveView] = useState('log');
  const effectiveView = forcedView || activeView;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: today, summary: "", sleep: "", load: "", strong: "", strong_na: null, tweaks: "" });
  const [editingId, setEditingId] = useState(null);

  // Derive the form's strong-related fields from a loaded log row.
  // strong_na = true means "user picked N/A explicitly". For legacy rows that
  // predate the strong_na column, a null strong is treated as N/A (backfilled).
  const deriveStrong = (log) => {
    if (log.strong_na === true) return { strong: "", strong_na: true };
    if (log.strong != null) return { strong: log.strong, strong_na: false };
    // Legacy fallback: null strong with no explicit strong_na
    return { strong: "", strong_na: log.strong_na ?? null };
  };


  const todayLog = logs.find(l => l.date === today);

  // Auto-open form pre-filled if there's a partial log (sleep only)
  useEffect(() => {
    if (autoOpenLog && !showForm) {
      setForm({ date: autoOpenLog.date, summary: autoOpenLog.summary || "", sleep: autoOpenLog.sleep ?? "", load: autoOpenLog.load ?? null, ...deriveStrong(autoOpenLog), tweaks: autoOpenLog.tweaks || "" });
      setEditingId(autoOpenLog.id);
      setShowForm(true);
    }
  }, [autoOpenLog]);

  useEffect(() => {
    if (!athlete?.id) return;
    setLoading(true);
    sb.from("fatigue_logs").select("*").eq("athlete_id", athlete.id)
      .order("date", { ascending: false }).limit(90)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, [athlete?.id]);

  const openForm = (log = null) => {
    if (log) {
      setForm({ date: log.date, summary: log.summary || "", sleep: log.sleep ?? "", load: log.load ?? "", ...deriveStrong(log), tweaks: log.tweaks || "" });
      setEditingId(log.id);
    } else {
      setForm({ date: today, summary: "", sleep: "", load: null, strong: "", strong_na: null, tweaks: "" });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const save = async () => {
    console.log('[save] form=', JSON.stringify(form));
    const sleepVal = parseFloat(form.sleep);
    const loadVal = form.load;
    if (isNaN(sleepVal) || sleepVal <= 0) { alert("Please enter a sleep value."); return; }
    if (loadVal === "" || loadVal === null || loadVal === undefined) { alert("Please select a load value."); return; }
    // Require an explicit pick for Strong — either a 0/1/2 value or N/A.
    const hasNumericStrong = form.strong !== "" && form.strong !== null && form.strong !== undefined;
    if (!hasNumericStrong && form.strong_na !== true) { alert("Please pick a Strong value (0, 1, 2) or N/A."); return; }
    setSaving(true);
    try {
      const payload = { athlete_id: athlete.id, date: form.date, summary: form.summary, sleep: parseFloat(form.sleep), load: parseInt(form.load), strong: hasNumericStrong ? parseInt(form.strong) : null, strong_na: form.strong_na === true, tweaks: form.tweaks };
      const result = editingId
        ? await sb.from("fatigue_logs").update(payload).eq("id", editingId).select().single()
        : await sb.from("fatigue_logs").upsert(payload, { onConflict: "athlete_id,date" }).select().single();
      if (result.error) throw result.error;
      if (result.data) {
        setLogs(prev => [result.data, ...prev.filter(l => l.id !== result.data.id)].sort((a, b) => b.date.localeCompare(a.date)));
      }
      setShowForm(false);
      if (onSaved) onSaved(result.data);
    } catch(e) {
      alert("Save failed: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const withMetrics = logs.map((log, i) => {
    const slice = logs.slice(i, i + 7);
    const avgSleep = slice.reduce((s, l) => s + (l.sleep || 0), 0) / slice.length;
    const weekLoad = slice.reduce((s, l) => s + (l.load || 0), 0);
    return { ...log, avgSleep: Math.round(avgSleep * 10) / 10, weekLoad };
  });

  const loadColor = (v) => v <= 1 ? "#5b7fa6" : v === 2 ? C.orange : v === 3 ? "#e07a3a" : "#c0392b";
  const strongColor = (v) => v === 0 ? "#c0392b" : v === 1 ? C.orange : "#3d9e7a";
  const sleepColor = (v) => v >= 7.5 ? "#3d9e7a" : v >= 6 ? C.orange : "#c0392b";

  const getRecommendation = () => {
    if (withMetrics.length < 3) return null;
    const recent7 = withMetrics.slice(0, 7);
    const avgSleep = recent7.reduce((s, l) => s + (l.sleep || 0), 0) / recent7.length;
    const weekLoad = recent7.reduce((s, l) => s + (l.load || 0), 0);
    const last3 = withMetrics.slice(0, 3);
    const strongLogs = last3.filter(l => l.strong != null);
    const avgStrong = strongLogs.length > 0 ? strongLogs.reduce((s, l) => s + l.strong, 0) / strongLogs.length : null;
    const last3Loads = last3.map(l => l.load ?? 0);
    const twoDaysOn = last3Loads.filter(l => l >= 2).length >= 2;
    // 4 consecutive strong=2 days signals connective tissue stress risk
    const last4 = withMetrics.slice(0, 4);
    const fourStrongDays = last4.length === 4 && last4.every(l => l.strong === 2);
    const loadRatio = avgSleep > 0 ? weekLoad / avgSleep : 99;
    const lowSleep = avgSleep < 6.5;
    const lowStrong = avgStrong !== null && avgStrong < 0.75;
    const borderlineStrong = avgStrong !== null && avgStrong >= 0.75 && avgStrong < 1.25;
    const highLoad = loadRatio > 1.3;
    const borderlineLoad = loadRatio > 1.0 && loadRatio <= 1.3;
    const redCount = [twoDaysOn, fourStrongDays, highLoad, lowSleep, lowStrong].filter(Boolean).length;
    const yellowCount = [borderlineLoad, borderlineStrong].filter(Boolean).length;
    const lastNightSleep = withMetrics[0]?.sleep ?? null;
    const sleptUnder6 = lastNightSleep !== null && lastNightSleep < 6;

    let label, color, bg, reasons;
    if (sleptUnder6) {
      label = "Rest"; color = "#c0392b"; bg = "rgba(192,57,43,0.08)";
      reasons = ["Last night's sleep was under 6 hours — no training today."];
    } else if (redCount >= 2 || lowStrong) {
      label = "Rest"; color = "#c0392b"; bg = "rgba(192,57,43,0.08)";
      reasons = [
        twoDaysOn && "Two hard sessions back to back",
        fourStrongDays && "4 consecutive peak days — connective tissue needs rest",
        highLoad && ("Weekly load is high (" + weekLoad + " vs " + avgSleep.toFixed(1) + "h avg sleep)"),
        lowSleep && ("Sleep avg is low (" + avgSleep.toFixed(1) + "h)"),
        lowStrong && "Consistently feeling off",
      ].filter(Boolean);
    } else if (!sleptUnder6 && (redCount === 1 || yellowCount >= 1)) {
      label = "Train Light"; color = C.orange; bg = "rgba(224,122,58,0.08)";
      reasons = [
        twoDaysOn && "Two hard days recently — keep it easy",

        borderlineLoad && ("Load is building (" + weekLoad + " this week)"),
        lowSleep && ("Sleep avg below ideal (" + avgSleep.toFixed(1) + "h)"),
        borderlineStrong && "Feeling a bit flat lately",
      ].filter(Boolean);
    } else {
      label = "Train"; color = "#3d9e7a"; bg = "rgba(61,158,122,0.08)";
      reasons = [
        "Sleep avg " + avgSleep.toFixed(1) + "h",
        "Weekly load " + weekLoad,
        avgStrong !== null ? ("Feeling " + (avgStrong >= 1.5 ? "great" : "good")) : null,
      ].filter(Boolean);
    }
    return { label, color, bg, reasons };
  };

  const renderCalendar = () => {
    if (!logs.length) return <div style={{ ...mono, fontSize: 12, color: C.muted, padding: 24, textAlign: "center" }}>No entries yet.</div>;

    // Group logs by year-month
    const byMonth = {};
    logs.forEach(log => {
      const ym = log.date.slice(0, 7);
      if (!byMonth[ym]) byMonth[ym] = {};
      byMonth[ym][log.date] = log;
    });
    const minMonth = athlete?.id === "bzmmql6" ? "2026-04" : "0000-00";
    const months = Object.keys(byMonth).filter(m => m >= minMonth).sort();

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {months.map(ym => {
          const [y, m] = ym.split("-").map(Number);
          const monthName = new Date(y, m-1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
          const firstDay = new Date(y, m-1, 1).getDay();
          const daysInMonth = new Date(y, m, 0).getDate();
          const cells = [];
          // empty cells before first day
          for (let i = 0; i < firstDay; i++) cells.push(null);
          for (let d = 1; d <= daysInMonth; d++) cells.push(d);

          return (
            <div key={ym}>
              <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{monthName}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {["S","M","T","W","T","F","S"].map((d,i) => (
                  <div key={i} style={{ ...mono, fontSize: 9, color: C.muted, textAlign: "center", paddingBottom: 4 }}>{d}</div>
                ))}
                {cells.map((d, i) => {
                  if (!d) return <div key={i} />;
                  const dateStr = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                  const log = byMonth[ym][dateStr];
                  const isToday = dateStr === today;
                  let icon = null, bg = "transparent", border = "transparent";
                  if (log) {
                    const load = log.load ?? 0;
                    if (load === 0) { icon = "🛌"; bg = "rgba(255,255,255,0.04)"; }
                    else { icon = "🚂"; bg = "rgba(61,158,122,0.12)"; }
                  }
                  if (isToday) border = C.orange;
                  return (
                    <div key={i} style={{ aspectRatio: "1", borderRadius: 6, background: bg, border: `1px solid ${border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                      <div style={{ ...mono, fontSize: 9, color: isToday ? C.orange : log ? C.white : C.muted }}>{d}</div>
                      {icon && <div style={{ fontSize: 18, lineHeight: 1 }}>{icon}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderChart = () => {
    // logs is newest-first; reverse to chronological, take last 30
    const recent = [...withMetrics].reverse().slice(0, 30);
    if (!recent.length) return <div style={{ ...mono, fontSize: 12, color: C.muted, padding: 24, textAlign: "center" }}>No data yet.</div>;
    const chartH = 72;
    const barW = Math.max(6, Math.floor(260 / recent.length) - 2);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ background: "rgba(91,127,166,0.08)", border: `1px solid rgba(91,127,166,0.25)`, borderRadius: 8, padding: "10px 14px" }}>
          <span style={{ ...mono, fontSize: 9, color: C.purple, textTransform: "uppercase", letterSpacing: 1 }}>Prototype</span>
          <p style={{ ...mono, fontSize: 11, color: C.muted, margin: "4px 0 0" }}>This chart is a work in progress. We're actively developing how to best interpret and present this data.</p>
        </div>
        {[{ key: "sleep", label: "Sleep", max: 10, color: "#5b7fa6" }, { key: "load", label: "Load", max: 4, color: C.orange }, { key: "strong", label: "Strong", max: 3, color: "#3d9e7a" }].map(({ key, label, max, color }) => (
          <div key={key}>
            <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{label}</div>
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end", overflowX: "auto", paddingBottom: 4 }}>
              {recent.map((log, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ ...mono, fontSize: 8, color }}>{log[key] ?? 0}</div>
                  <div style={{ width: barW, height: chartH, display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", height: `${Math.max(3, ((log[key] ?? 0) / max) * 100)}%`, background: color, borderRadius: "2px 2px 0 0" }} />
                  </div>
                  <div style={{ ...mono, fontSize: 7, color: C.muted, writingMode: "vertical-rl", transform: "rotate(180deg)", height: 26, overflow: "hidden" }}>{log.date.slice(5)}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const LogRow = ({ log }) => {
    const d = new Date(log.date + "T12:00:00");
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    const isToday = log.date === today;
    return (
      <div style={{ background: C.gray2, border: `1px solid ${isToday ? C.orange : C.border}`, borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ ...mono, fontSize: 10, color: isToday ? C.orange : C.muted }}>{dayLabel}</span>
            {isToday && <span style={{ ...mono, fontSize: 8, color: C.orange, background: "rgba(61,158,122,0.12)", padding: "1px 6px", borderRadius: 3 }}>TODAY</span>}
          </div>
          {true && (
            <button onMouseDown={e => { e.preventDefault(); openForm(log); }}
              style={{ ...mono, fontSize: 9, padding: "2px 7px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>edit</button>
          )}
        </div>
        {log.summary && <div style={{ fontSize: 13, color: C.white, marginBottom: 8 }}>{log.summary}</div>}
        {isToday && log.sleep != null && (log.load == null || log.strong == null) && (
          <div style={{ ...mono, fontSize: 11, color: C.orange, marginBottom: 8 }}>You logged your sleep already — tap edit to log the rest.</div>
        )}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
          {[["SLEEP", (log.sleep ?? "—") + (log.sleep != null ? "h" : ""), sleepColor(log.sleep)], ["LOAD", log.load ?? "—", loadColor(log.load)], ["STRONG", log.strong ?? "—", strongColor(log.strong)]].map(([lbl, val, col]) => (
            <div key={lbl}>
              <div style={{ ...mono, fontSize: 9, color: C.muted }}>{lbl}</div>
              <div style={{ ...mono, fontSize: 18, color: col, lineHeight: 1.2 }}>{val}</div>
            </div>
          ))}
          {log.tweaks && (
            <div style={{ flex: 1, minWidth: 100 }}>
              <div style={{ ...mono, fontSize: 9, color: "#c0392b" }}>TWEAKS</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{log.tweaks}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const inp = { background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.white, fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" };
  const Hint = ({ text }) => <div style={{ fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>{text}</div>;
  const Lbl = ({ text }) => <div style={{ ...bebas, fontSize: 13, color: C.white, letterSpacing: 1, marginBottom: 8 }}>{text}</div>;
  const ScaleBtn = ({ val, current, color, onPick }) => (
    <button onMouseDown={e => { e.preventDefault(); onPick(val); }}
      style={{ ...mono, fontSize: 15, width: 52, height: 52, borderRadius: 8, border: `1px solid ${current == val ? color : C.border}`, background: current == val ? color + "22" : "transparent", color: current == val ? color : C.muted, cursor: "pointer", fontWeight: current == val ? 700 : 400, transition: "all 0.1s" }}>
      {val}
    </button>
  );

  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div />
        <div style={{ display: "flex", gap: 8 }}>
          {!isCoach && !forcedView && (
            <div style={{ display: "flex", background: C.gray2, borderRadius: 6, padding: 2, gap: 2 }}>
              {[["log","Log"],["chart","Chart"],["calendar","Cal"]].map(([v,l]) => (
                <button key={v} onMouseDown={e => { e.preventDefault(); setActiveView(v); }}
                  style={{ ...mono, fontSize: 10, padding: "5px 10px", borderRadius: 4, border: "none", background: activeView===v ? C.gray : "transparent", color: activeView===v ? C.orange : C.muted, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          )}
          {!isCoach && !showForm && (
            <>
              {todayLog && (
                <button onMouseDown={e => { e.preventDefault(); openForm(todayLog); }}
                  style={{ ...mono, fontSize: 10, padding: "6px 12px", borderRadius: 5, border: `1px solid ${C.orange}`, background: "none", color: C.orange, cursor: "pointer" }}>
                  Edit Today
                </button>
              )}
              <button onMouseDown={e => { e.preventDefault(); openForm(null); }}
                style={{ ...mono, fontSize: 10, padding: "6px 14px", borderRadius: 5, border: "none", background: C.orange, color: "#fff", cursor: "pointer" }}>
                {todayLog ? "+ Log Past Day" : "+ Log Today"}
              </button>
            </>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 20px", marginBottom: 20 }}>
          <div style={{ ...bebas, fontSize: 18, marginBottom: 20, color: C.orange, letterSpacing: 1 }}>TODAY'S CHECK-IN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <Lbl text="Date" />
              <div style={{ display: "flex", gap: 8 }}>
                {(() => {
                  const d1 = new Date(); d1.setDate(d1.getDate()-1);
                  const d2 = new Date(); d2.setDate(d2.getDate()-2);
                  const yesterday = `${d1.getFullYear()}-${String(d1.getMonth()+1).padStart(2,'0')}-${String(d1.getDate()).padStart(2,'0')}`;
                  const twoDaysAgo = `${d2.getFullYear()}-${String(d2.getMonth()+1).padStart(2,'0')}-${String(d2.getDate()).padStart(2,'0')}`;
                  return [today, yesterday, twoDaysAgo];
                })().map(dt => {
                  const d1 = new Date(); d1.setDate(d1.getDate()-1);
                  const yesterday = `${d1.getFullYear()}-${String(d1.getMonth()+1).padStart(2,'0')}-${String(d1.getDate()).padStart(2,'0')}`;
                  const label = dt === today ? "Today" : dt === yesterday ? "Yesterday" : "2 days ago";
                  const alreadyLogged = logs.some(l => l.date === dt && l.id !== editingId);
                  // When editing an existing entry, skip the date picker for that date (it's already selected)
                  if (editingId && dt === form.date) return null;
                  return (
                    <button key={dt} onMouseDown={e => { e.preventDefault(); if (!alreadyLogged) setForm(f => ({ ...f, date: dt })); }}
                      style={{ ...mono, fontSize: 10, padding: "7px 12px", borderRadius: 5, border: `1px solid ${form.date === dt ? C.orange : C.border}`, background: form.date === dt ? "rgba(61,158,122,0.1)" : C.gray2, color: form.date === dt ? C.orange : alreadyLogged ? "#555" : C.white, cursor: alreadyLogged ? "not-allowed" : "pointer", opacity: alreadyLogged ? 0.5 : 1 }}>
                      {label}{alreadyLogged ? " ✓" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Lbl text="What did you do today?" />
              <input value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="As few words as possible, just get it on the page" style={{ ...inp, boxSizing: "border-box" }} />
            </div>
            <div>
              <Lbl text="Sleep" />
              <input value={form.sleep} onChange={e => setForm(f => ({ ...f, sleep: e.target.value }))} placeholder="Hours" type="number" step="0.5" min="0" max="14" style={{ ...inp, width: 100, boxSizing: "border-box" }} />
              <Hint text="Take hours asleep, subtract 0.5 for bad sleep, subtract 1 for really bad. Don't overthink it." />
            </div>
            <div>
              <Lbl text="Load" />
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                {[0,1,2,3,4].map(v => <ScaleBtn key={v} val={v} current={form.load} color={loadColor(v)} onPick={v => setForm(f => ({ ...f, load: v }))} />)}
              </div>
              <Hint text="0 = rest  ·  1 = light (walk, fingerboard only)  ·  2 = climbing session, real work  ·  3 = big session, soreness, high volume  ·  4 = huge mission (multipitch + approach)" />
            </div>
            <div>
              <Lbl text="Strong?" />
              <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                {[0,1,2].map(v => <ScaleBtn key={v} val={v} current={form.strong} color={strongColor(v)} onPick={v => setForm(f => ({ ...f, strong: v, strong_na: false }))} />)}
                <button onMouseDown={e => { e.preventDefault(); setForm(f => ({ ...f, strong: "", strong_na: true })); }}
                  style={{ ...mono, fontSize: 12, padding: "0 14px", height: 52, borderRadius: 8, border: `1px solid ${form.strong_na === true ? C.white : C.border}`, background: form.strong_na === true ? "rgba(255,255,255,0.08)" : "transparent", color: form.strong_na === true ? C.white : C.muted, cursor: "pointer" }}>N/A</button>
              </div>
              <Hint text="0 = felt bad  ·  1 = standard day  ·  2 = felt great  ·  N/A = rest day" />
            </div>
            <div>
              <Lbl text="Any tweaks?" />
              <input value={form.tweaks} onChange={e => setForm(f => ({ ...f, tweaks: e.target.value }))} placeholder="Anything bugging you? (optional)" style={{ ...inp, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => save()} disabled={saving}
                style={{ flex: 1, ...mono, fontSize: 13, padding: "14px", borderRadius: 8, border: "none", background: C.orange, color: "#fff", cursor: "pointer", fontWeight: 600 }}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button onMouseDown={e => { e.preventDefault(); setShowForm(false); }}
                style={{ ...mono, fontSize: 13, padding: "14px 20px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 24 }}>Loading...</div>
      ) : effectiveView === 'chart' && !isCoach ? (
        <>{renderChart()}</>
      ) : effectiveView === 'calendar' && !isCoach ? (
        <>{renderCalendar()}</>
      ) : (
        <div>
          {withMetrics.length === 0 && !showForm && (
            <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 32 }}>No entries yet. Tap "+ Log Today" to start.</div>
          )}
          {withMetrics.map(log => <LogRow key={log.id} log={log} />)}
        </div>
      )}
    </div>
  );
}

function AthleteView({ athlete, plan, progress, onProgressChange, onOverflowChange, onEditExercise, onLogout, sharedWeekIdx, setSharedWeekIdx, sharedDay, setSharedDay, darkMode, onToggleDark }) {
  const OVF = "overflow";

  // figure out which week to default to
  const publishedWeeks = (plan?.published || []).map(i => plan.weeks[i]).filter(Boolean);
  const publishedIndices = plan?.published || [];

  const currentWeekIdx = (() => {
    if (publishedIndices.length === 0) return null;
    // Coach override (0-indexed week number integer) takes precedence over
    // date-based computation. Coach UI stores this as an int; we ignore any
    // legacy non-numeric values and fall through to the date logic.
    if (plan?.currentWeekOverride != null && typeof plan.currentWeekOverride === 'number') {
      const ov = plan.currentWeekOverride;
      return publishedIndices.reduce((best, idx) => Math.abs(idx - ov) < Math.abs(best - ov) ? idx : best, publishedIndices[0]);
    }
    if (!plan?.blockStart) return publishedIndices[0];
    const [sy, sm, sd] = plan.blockStart.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const now = new Date(); now.setHours(0,0,0,0);
    if (now < start) return publishedIndices[0];
    const weekNum = Math.floor((now - start) / (7*24*60*60*1000));
    return publishedIndices.reduce((best, idx) => Math.abs(idx - weekNum) < Math.abs(best - weekNum) ? idx : best, publishedIndices[0]);
  })();

  const [_activeWeekIdx, _setActiveWeekIdx] = useState(currentWeekIdx ?? publishedIndices[0] ?? 0);
  const [_activeDay, _setActiveDay] = useState(0);
  const activeWeekIdx = sharedWeekIdx !== undefined ? sharedWeekIdx : _activeWeekIdx;
  const setActiveWeekIdx = setSharedWeekIdx || _setActiveWeekIdx;
  const activeDay = sharedDay !== undefined ? sharedDay : _activeDay;
  const setActiveDay = setSharedDay || _setActiveDay;
  const [showOverview, setShowOverview] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const week = plan?.weeks?.[activeWeekIdx];
  const days = week?.days || [];

  if (!plan || publishedIndices.length === 0) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.black }}>
        <div style={{ background: C.gray, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ ...bebas, fontSize: 20, letterSpacing: 2, color: C.white }}>ROCK POINT <span style={{ color: C.orange }}>COACHING</span></div>
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

  const deferredExs = !isOvf && currentDay
    ? currentDay.exercises.filter(e => !overflowIds.has(e.id) && (e.sharedDays?.length) && ((progress[`shared_${e.id}`] || {})[e.id] || {}).deferToOtherDay)
    : [];

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

  const [athleteTab, setAthleteTab] = useState("plan");
  const [showSleepPrompt, setShowSleepPrompt] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [partialDayLog, setPartialDayLog] = useState(null);
  const [volumeModalTab, setVolumeModalTab] = useState('log');
  const [showVolumeInfo, setShowVolumeInfo] = useState(false);
  const [showAthleteInfo, setShowAthleteInfo] = useState(false);
  const [sleepPromptValue, setSleepPromptValue] = useState("");
  const [sleepPromptSaving, setSleepPromptSaving] = useState(false);
  // Catch-up prompt: appears once per session when 3+ consecutive recent
  // calendar days are unlogged. catchupDays is an array of 7 entries
  // (yesterday going back 7 days), most-recent first, each shaped:
  //   { date, logged: bool, load: 0|1|2|null, editable: bool, existing: row|null }
  const [catchupDays, setCatchupDays] = useState(null);
  const [catchupSaving, setCatchupSaving] = useState(false);
  const [catchupDismissed, setCatchupDismissed] = useState(false);

  // Show sleep prompt if today's sleep not yet logged
  useEffect(() => {
    if (!athlete?.id) return;
    const todayStr = localDateStr();
    // Only show sleep prompt for test users (Jasper + Patrick)
    const sleepPromptAthletes = ["bzmmql6", "8ygufmv"];
    if (!sleepPromptAthletes.includes(athlete.id)) return;
    // Ask the DB directly whether ANY row for today has a non-null sleep value.
    // This is robust to duplicate rows for the same athlete+date — without this
    // filter, the prompt could fire on a different device if the most-recently-
    // created row happened to have sleep=null even though another row for the
    // same day already had sleep logged.
    sb.from("fatigue_logs").select("id").eq("athlete_id", athlete.id).eq("date", todayStr).not("sleep", "is", null).limit(1)
      .then(({ data: rows, error }) => {
        if (error) { console.warn("[sleepPrompt] query error:", error); return; }
        console.log("[sleepPrompt] rows with sleep set today:", rows?.length || 0);
        if (!rows || rows.length === 0) setShowSleepPrompt(true);
      });
  }, [athlete?.id]);

  // Catch-up prompt detection. Fires once per session (until dismissed or
  // submitted) if the athlete has 3+ consecutive recent unlogged days.
  useEffect(() => {
    if (!athlete?.id) return;
    if (catchupDismissed) return;
    if (catchupDays) return; // already shown
    const todayStr = localDateStr();
    sb.from("fatigue_logs").select("date,load,sleep,strong,strong_na").eq("athlete_id", athlete.id)
      .gte("date", (() => {
        const [y, m, d] = todayStr.split("-").map(Number);
        const dt = new Date(y, m - 1, d); dt.setDate(dt.getDate() - 14);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      })())
      .then(({ data, error }) => {
        if (error) { console.warn("[catchup] query error:", error); return; }
        const logged = new Set((data || []).map(r => r.date));
        const byDate = {};
        (data || []).forEach(r => { byDate[r.date] = r; });
        // Walk back from yesterday, looking for a consecutive unlogged streak
        // ending at or near today (within the last 3 days).
        const [ty, tm, td] = todayStr.split("-").map(Number);
        const dt = new Date(ty, tm - 1, td);
        dt.setDate(dt.getDate() - 1); // start at yesterday
        let streak = 0;
        for (let i = 0; i < 7; i++) {
          const ds = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
          if (!logged.has(ds)) streak++;
          else break;
          dt.setDate(dt.getDate() - 1);
        }
        console.log("[catchup] consecutive unlogged streak ending at/near today:", streak);
        if (streak < 3) return;
        // Build the 7-day calendar (yesterday going back 7 days, most-recent first)
        const cal = [];
        const dt2 = new Date(ty, tm - 1, td);
        dt2.setDate(dt2.getDate() - 1);
        for (let i = 0; i < 7; i++) {
          const ds = `${dt2.getFullYear()}-${String(dt2.getMonth() + 1).padStart(2, "0")}-${String(dt2.getDate()).padStart(2, "0")}`;
          const existing = byDate[ds] || null;
          cal.push({
            date: ds,
            logged: !!existing,
            // tappable when unlogged; load starts at 0 (Rest) for unlogged days
            load: existing ? (existing.load ?? 0) : 0,
            editable: !existing,
            existing,
          });
          dt2.setDate(dt2.getDate() - 1);
        }
        setCatchupDays(cal);
      });
  }, [athlete?.id, catchupDismissed, catchupDays]);

  const cycleCatchupDay = (idx) => {
    setCatchupDays(prev => {
      if (!prev) return prev;
      const next = [...prev];
      const cur = next[idx];
      if (!cur.editable) return prev;
      // Cycle Rest (0) → Train (2) → Light (1) → Rest (0)
      const cycle = { 0: 2, 2: 1, 1: 0 };
      next[idx] = { ...cur, load: cycle[cur.load] ?? 0 };
      return next;
    });
  };

  const submitCatchup = async () => {
    if (!catchupDays) return;
    setCatchupSaving(true);
    const rows = catchupDays
      .filter(d => d.editable && d.load !== 0)
      .map(d => ({ athlete_id: athlete.id, date: d.date, sleep: 7, load: d.load, strong: null, strong_na: true }));
    if (rows.length > 0) {
      const { error } = await sb.from("fatigue_logs").upsert(rows, { onConflict: "athlete_id,date" });
      if (error) console.warn("[catchup] upsert error:", error);
    }
    setCatchupSaving(false);
    setCatchupDays(null);
    setCatchupDismissed(true);
    await recomputeFatigue();
  };

  const dismissCatchup = () => {
    setCatchupDays(null);
    setCatchupDismissed(true);
  };

  const submitSleepPrompt = async () => {
    const val = parseFloat(sleepPromptValue);
    if (isNaN(val) || val <= 0) return;
    setSleepPromptSaving(true);
    const todayStr = localDateStr();
    // Use limit(1) instead of maybeSingle() so duplicates don't cause an error
    const { data: rows } = await sb.from("fatigue_logs").select("id").eq("athlete_id", athlete.id).eq("date", todayStr).order("created_at", { ascending: false }).limit(1);
    const existing = rows?.[0];
    if (existing) {
      await sb.from("fatigue_logs").update({ sleep: val }).eq("id", existing.id);
    } else {
      await sb.from("fatigue_logs").insert({ athlete_id: athlete.id, date: todayStr, sleep: val });
    }
    setSleepPromptSaving(false);
    setShowSleepPrompt(false);
    await recomputeFatigue();
  };

  // Compute recommendation for banner using fatigue logs stored in state
  const [fatigueRec, setFatigueRec] = useState(null);
  const [fatigueLogs, setFatigueLogs] = useState([]);

  // Fetch + recompute the banner. Called on mount AND directly from save
  // callbacks — no dep-array indirection, so it doesn't depend on React's
  // re-render cycle to fire. Accepts an optional `seedRow` (the row that was
  // just saved) which is merged into the fetched logs to defend against
  // any read-after-write replica lag from Supabase.
  const recomputeFatigue = useCallback(async (seedRow = null) => {
    if (!athlete?.id) return;
    console.log("[recomputeFatigue] fetching...", seedRow ? "with seed" : "");
    const { data, error } = await sb.from("fatigue_logs").select("*").eq("athlete_id", athlete.id)
      .order("date", { ascending: false }).limit(90);
    if (error) { console.warn("[recomputeFatigue] fetch error:", error); return; }
    let logs = data || [];
    if (seedRow) {
      // Merge the just-saved row in case the fetch came back without it yet.
      logs = [seedRow, ...logs.filter(l => l.id !== seedRow.id)].sort((a, b) => b.date.localeCompare(a.date));
    }
    setFatigueLogs(logs);

    const todayStrCheck = localDateStr();
    const todayEntryCheck = logs.find(l => l.date === todayStrCheck);
    if (todayEntryCheck && todayEntryCheck.sleep != null && (todayEntryCheck.load == null || (todayEntryCheck.strong == null && todayEntryCheck.strong_na !== true))) {
      setPartialDayLog(todayEntryCheck);
    } else {
      // Clear partialDayLog if today's row is now complete (or missing entirely)
      setPartialDayLog(null);
    }
    const todayStr = localDateStr();

    // Per-athlete volume tier multiplier. Higher = bigger weekly load allowance.
    const volumeCoeff = getVolumeMultiplier(athlete);

    // ── buildCalendarWindow ────────────────────────────────────────────────
    // Returns an array of `days` entries ending at `anchorDate` (inclusive),
    // most-recent first. Real logs are used where present; missing days are
    // filled with synthetic rest (sleep=7, load=0, strong=null, strong_na=true).
    // The synthetic flag is _synthetic so downstream code can tell them apart.
    const buildCalendarWindow = (allLogs, anchorDate, days) => {
      const byDate = {};
      allLogs.forEach(l => { byDate[l.date] = l; });
      const out = [];
      const [ay, am, ad] = anchorDate.split("-").map(Number);
      const anchor = new Date(ay, am - 1, ad);
      for (let i = 0; i < days; i++) {
        const d = new Date(anchor);
        d.setDate(d.getDate() - i);
        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (byDate[ds]) out.push(byDate[ds]);
        else out.push({ date: ds, sleep: 7, load: 0, strong: null, strong_na: true, _synthetic: true });
      }
      return out;
    };

    // ── computeRec ─────────────────────────────────────────────────────────
    // Takes a calendar-aligned window (most-recent first). All math runs on
    // this; synthetic rest days fill unlogged gaps so the windowing is always
    // 7 actual calendar days regardless of logging compliance.
    const computeRec = (windowLogs) => {
      if (windowLogs.length < 3) return null;
      // Load=4 the day before this rec applies → hard Rest.
      if ((windowLogs[0]?.load ?? 0) === 4) {
        return { label: "Rest", color: "#c0392b", bg: "rgba(192,57,43,0.08)" };
      }
      // Three consecutive load=1 days → hard Rest. Looks at the most recent
      // 3 calendar days in the window (which now includes synthetic rest).
      const last3Loads = windowLogs.slice(0, 3).map(l => l.load ?? 0);
      if (last3Loads.length === 3 && last3Loads.every(l => l === 1)) {
        return { label: "Rest", color: "#c0392b", bg: "rgba(192,57,43,0.08)" };
      }
      const recent7 = windowLogs.slice(0, 7);
      const last3 = windowLogs.slice(0, 3);
      const last4 = windowLogs.slice(0, 4);
      const avgSleep = recent7.reduce((s,l) => s+(l.sleep||0),0)/recent7.length;
      const weekLoad = recent7.reduce((s,l) => s+(l.load||0),0);
      // Strong sample-size guard: only consider strong signals when there
      // are 2+ numeric ratings in the last 3 calendar days. A single rating
      // isn't statistically meaningful enough to push the rec around.
      const strongLogs = last3.filter(l => l.strong != null);
      const hasEnoughStrong = strongLogs.length >= 2;
      const avgStrong = hasEnoughStrong ? strongLogs.reduce((s,l)=>s+l.strong,0)/strongLogs.length : null;
      const last4Strong = last4.map(l => l.strong);
      const twoDaysOn = last3Loads.filter(l => l >= 2).length >= 2;
      const fourStrongDays = last4.length === 4 && last4Strong.every(s => s === 2);
      const loadRatio = avgSleep > 0 ? weekLoad / (avgSleep * volumeCoeff) : 99;
      const lowSleep = avgSleep < 6.5;
      // lowStrong now fires at avg ≤ 1.0 (was < 0.75). Two 1s in a row → Rest.
      const lowStrong = avgStrong !== null && avgStrong <= 1.0;
      const borderlineStrong = avgStrong !== null && avgStrong > 1.0 && avgStrong < 1.5;
      const highLoad = loadRatio > 1.3;
      const borderlineLoad = loadRatio > 1.0 && loadRatio <= 1.3;
      const redCount = [twoDaysOn, fourStrongDays, highLoad, lowSleep, lowStrong].filter(Boolean).length;
      const yellowCount = [borderlineLoad, borderlineStrong].filter(Boolean).length;
      const lastNightSleep = windowLogs[0]?.sleep ?? null;
      const sleptUnder6 = lastNightSleep !== null && lastNightSleep < 6;
      if (sleptUnder6)                          return { label: "Rest",        color: "#c0392b", bg: "rgba(192,57,43,0.08)" };
      if (redCount >= 2 || lowStrong)           return { label: "Rest",        color: "#c0392b", bg: "rgba(192,57,43,0.08)" };
      if (redCount === 1 || yellowCount >= 1)   return { label: "Train Light", color: C.orange,  bg: "rgba(224,122,58,0.08)" };
      return { label: "Train", color: "#3d9e7a", bg: "rgba(61,158,122,0.08)" };
    };

    // Today's rec is computed against the 7 calendar days ENDING YESTERDAY.
    // (Today is excluded so logging today doesn't shift today's rec.)
    const yesterday = (() => {
      const [y, m, d] = todayStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() - 1);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    })();
    const todayWindow = buildCalendarWindow(logs, yesterday, 7);
    const todayRec = computeRec(todayWindow);
    if (!todayRec) { setFatigueRec(null); return; }

    // Tomorrow's rec is computed against 7 calendar days ENDING TODAY.
    // Normally only meaningful once today is fully logged — but the forecast
    // intervention below can override this to show "Rest" even when today
    // isn't logged yet.
    const todayLogged = logs.some(l => l.date === todayStr && l.load != null && l.sleep != null && (l.strong != null || l.strong_na === true));
    const tomorrowWindow = buildCalendarWindow(logs, todayStr, 7);
    const tomorrowRec = todayLogged ? computeRec(tomorrowWindow) : null;
    let tomorrow = tomorrowRec ? { label: tomorrowRec.label, color: tomorrowRec.color } : null;

    // ── Train Light loop forecast ──────────────────────────────────────────
    // If today's rec is Train Light and the model predicts the next two
    // days would ALSO be Train Light (assuming the athlete trains light on
    // each), force tomorrow's recommendation to Rest. This breaks the loop
    // before the athlete settles into a mediocrity rut.
    if (todayRec.label === "Train Light") {
      // Step 1: simulate tomorrow's rec, assuming today was light (load=1, sleep=7, strong_na).
      const simToday = { date: todayStr, sleep: 7, load: 1, strong: null, strong_na: true, _simulated: true };
      const todayExisting = logs.find(l => l.date === todayStr);
      const logsWithSimToday = todayExisting ? logs : [simToday, ...logs];
      const simTomorrowWindow = buildCalendarWindow(logsWithSimToday, todayStr, 7);
      const simTomorrowRec = computeRec(simTomorrowWindow);

      if (simTomorrowRec && simTomorrowRec.label === "Train Light") {
        // Step 2: simulate the day-after-tomorrow rec, assuming tomorrow is also light.
        const [ty, tm, td] = todayStr.split("-").map(Number);
        const dt = new Date(ty, tm - 1, td); dt.setDate(dt.getDate() + 1);
        const tomorrowStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
        const simTomorrow = { date: tomorrowStr, sleep: 7, load: 1, strong: null, strong_na: true, _simulated: true };
        const logsWithBothSim = [simTomorrow, ...logsWithSimToday];
        const simDayAfterWindow = buildCalendarWindow(logsWithBothSim, tomorrowStr, 7);
        const simDayAfterRec = computeRec(simDayAfterWindow);

        if (simDayAfterRec && simDayAfterRec.label === "Train Light") {
          // Three Train Light recs forecast. Override tomorrow to Rest.
          tomorrow = { label: "Rest", color: "#c0392b", forecast: true };
          console.log("[recomputeFatigue] forecast intervention: overriding tomorrow → Rest to break Train Light loop");
        }
      }
    }

    console.log("[recomputeFatigue] today:", todayRec.label, "tomorrow:", tomorrow?.label, "todayLogged:", todayLogged, "coeff:", volumeCoeff);
    setFatigueRec({ ...todayRec, tomorrow, todayLogged });
  }, [athlete?.id, athlete?.volume_tier]);

  useEffect(() => {
    recomputeFatigue();
  }, [recomputeFatigue]);


  return (
    <div style={{ minHeight: "100vh", background: C.black, display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.gray, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ ...bebas, fontSize: 20, letterSpacing: 2 }}>ROCK POINT <span style={{ color: C.orange }}>COACHING</span></div>
        <button onClick={onLogout} style={{ ...mono, fontSize: 10, padding: "6px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>Log out</button>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.purple}, transparent)`, flexShrink: 0 }} />

      {/* Volume Element modal */}
      {showVolumeModal && ReactDOM.createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setShowVolumeModal(false)}>
          <div style={{ background: C.black, borderRadius: "16px 16px 0 0", maxHeight: "92vh", display: "flex", flexDirection: "column", border: `1px solid ${C.border}`, maxWidth: 680, width: "100%", margin: "0 auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 20px 12px" }}>
              <div>
                <div style={{ ...bebas, fontSize: 20, letterSpacing: 1, marginBottom: 4 }}>VOLUME TRACKING</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, maxWidth: 260 }}>Here is the volume tracker. Once daily, you log a few key stats. In return, I use a simple equation to recommend how much you should train or rest.</div>
              </div>
              <button onClick={() => setShowVolumeModal(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", lineHeight: 1, flexShrink: 0, marginLeft: 12 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", WebkitOverflowScrolling: "touch" }}>
              <FatigueLog athlete={athlete} isCoach={false} forcedView={volumeModalTab} autoOpenLog={partialDayLog} onSaved={(savedRow) => { setPartialDayLog(null); recomputeFatigue(savedRow); }} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sleep prompt modal */}
      {catchupDays && !showSleepPrompt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, width: "100%", maxWidth: 420 }}>
            <div style={{ ...bebas, fontSize: 22, letterSpacing: 1, marginBottom: 6 }}>Welcome back 👋</div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>
              You haven't logged in a few days. We're counting them as rest. If you trained, tap a day to mark it.
            </div>
            <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Last 7 days</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 16 }}>
              {[...catchupDays].reverse().map((d, ri) => {
                // ri is reversed index — we render oldest → newest left to right
                const realIdx = catchupDays.length - 1 - ri;
                const [yy, mm, dd] = d.date.split("-").map(Number);
                const dayOfWeek = new Date(yy, mm - 1, dd).toLocaleDateString("en-US", { weekday: "short" });
                const icon = d.load === 0 ? "🛌" : d.load === 1 ? "🚂" : "🚂";
                const sublabel = d.load === 1 ? "Light" : "";
                const isGrayed = !d.editable;
                return (
                  <button key={d.date}
                    onClick={() => cycleCatchupDay(realIdx)}
                    disabled={isGrayed}
                    style={{
                      aspectRatio: "1",
                      borderRadius: 8,
                      background: isGrayed ? "rgba(255,255,255,0.04)" : d.load === 0 ? C.gray2 : "rgba(61,158,122,0.15)",
                      border: `1px solid ${isGrayed ? C.border : d.load === 0 ? C.border : "#3d9e7a"}`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                      cursor: isGrayed ? "default" : "pointer",
                      opacity: isGrayed ? 0.45 : 1,
                      padding: 2,
                    }}>
                    <div style={{ ...mono, fontSize: 8, color: C.muted }}>{dayOfWeek}</div>
                    <div style={{ fontSize: 16, lineHeight: 1 }}>{icon}</div>
                    {sublabel && <div style={{ ...mono, fontSize: 7, color: C.orange, lineHeight: 1 }}>{sublabel}</div>}
                  </button>
                );
              })}
            </div>
            <div style={{ ...mono, fontSize: 9, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
              Tap to cycle: 🛌 Rest → 🚂 Train → 🚂 Light. Grayed-out days are already logged.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={dismissCatchup}
                style={{ flex: 1, ...mono, fontSize: 11, padding: "12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>
                Skip
              </button>
              <button onClick={submitCatchup} disabled={catchupSaving}
                style={{ flex: 2, ...mono, fontSize: 11, padding: "12px", borderRadius: 8, border: "none", background: C.orange, color: "#fff", cursor: catchupSaving ? "default" : "pointer" }}>
                {catchupSaving ? "Saving..." : "Log"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSleepPrompt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, width: "100%", maxWidth: 340 }}>
            <div style={{ ...bebas, fontSize: 22, letterSpacing: 1, marginBottom: 4 }}>Good morning 👋</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>How did you sleep last night?</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Hours</div>
            <input type="number" step="0.5" min="0" max="14" value={sleepPromptValue}
              onChange={e => setSleepPromptValue(e.target.value)}
              placeholder="e.g. 7.5"
              autoFocus
              style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", color: C.white, fontSize: 16, outline: "none", marginBottom: 6, boxSizing: "border-box" }} />
            <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 20, lineHeight: 1.5 }}>Take the hours you spent asleep, subtract 0.5 if it was bad sleep, subtract 1 if it was really bad. This is pretty subjective, so don't worry too much about nailing it.</div>
            <button onClick={submitSleepPrompt} disabled={!sleepPromptValue || sleepPromptSaving}
              style={{ width: "100%", ...mono, fontSize: 12, padding: "14px", borderRadius: 8, border: "none", background: sleepPromptValue ? C.orange : C.border, color: "#fff", cursor: sleepPromptValue ? "pointer" : "default" }}>
              {sleepPromptSaving ? "Saving..." : "Log Sleep"}
            </button>
          </div>
        </div>
      )}

      <>
      <div style={{ flex: 1, padding: "20px 16px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        {/* Date + recommendation banner */}
        {(() => {
          const now = new Date();
          const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
          // Compute recommendation from progress/fatigue data if available
          const fLogs = fatigueRec;
          if (!fLogs) return (
            <div onClick={() => setShowVolumeModal(true)} style={{ marginBottom: 16, background: C.gray, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer" }}>
              <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 6 }}>{dateLabel}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>Tap here to log daily volume data so we can make good training recommendations.</div>
            </div>
          );
          const { label, color, bg } = fLogs;
          const subtitle = label === "Train Light" ? "Pick just 2 exercises to complete, not a full day." : null;
          return (
            <div onClick={() => setShowVolumeModal(true)} style={{ background: bg, border: `1px solid ${color}`, borderRadius: 10, padding: "14px 16px", marginBottom: 16, cursor: "pointer" }}>
              {/* Title row: date + recommendation */}
              <div style={{ ...bebas, fontSize: 22, color, letterSpacing: 1, marginBottom: 4 }}>
                {dateLabel}: {label}
              </div>
              {/* Subtitle for Train Light */}
              {label === "Train Light" && (
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>
                  "Train Light" means pick two exercises to complete, rather than a whole day of training. You can finish the day another time.
                </div>
              )}
              {/* Divider */}
              <div style={{ borderTop: `1px solid ${color}22`, paddingTop: 10, marginTop: label === "Train Light" ? 0 : 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ ...mono, fontSize: 10, color: C.muted }}>Tomorrow:</div>
                  {fLogs.tomorrow
                    ? <div style={{ ...mono, fontSize: 11, color: fLogs.tomorrow.color, fontWeight: 600 }}>
                        {fLogs.tomorrow.label}
                        {fLogs.tomorrow.forecast && <span style={{ ...mono, fontSize: 9, color: C.muted, marginLeft: 6, fontWeight: 400 }}>(loop break)</span>}
                      </div>
                    : <div style={{ ...mono, fontSize: 11, color: C.muted }}>TBD — log today first</div>
                  }
                </div>

                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>Tap here to log daily volume data so we can make good training recommendations.</div>
              </div>
            </div>
          );
        })()}

        {/* Consistency calendar modal */}
        {fatigueLogs.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <button onClick={() => setShowCalendar(true)}
              style={{ ...mono, fontSize: 10, padding: "6px 14px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>
              📅 Calendar
            </button>
          </div>
        )}
        {showCalendar && fatigueLogs.length > 0 && ReactDOM.createPortal(
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", flexDirection: "column", WebkitOverflowScrolling: "touch" }} onClick={() => setShowCalendar(false)}>
            <div style={{ background: C.black, flex: 1, overflowY: "auto", padding: "20px 16px", maxWidth: 480, margin: "0 auto", width: "100%", WebkitOverflowScrolling: "touch" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ ...bebas, fontSize: 20, letterSpacing: 1 }}>CONSISTENCY</div>
                <button onClick={() => setShowCalendar(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 24, cursor: "pointer", lineHeight: 1 }}>✕</button>
              </div>
              {(() => {
          const todayStr = localDateStr();
          const byMonth = {};
          fatigueLogs.forEach(log => {
            const ym = log.date.slice(0, 7);
            if (!byMonth[ym]) byMonth[ym] = {};
            byMonth[ym][log.date] = log;
          });
          const minMonth = athlete?.id === "bzmmql6" ? "2026-04" : "0000-00";
          const months = Object.keys(byMonth).filter(m => m >= minMonth).sort();
          return (
            <div style={{ marginBottom: 20 }}>
              <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Consistency</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {months.map(ym => {
                  const [y, m] = ym.split("-").map(Number);
                  const monthName = new Date(y, m-1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
                  const firstDay = new Date(y, m-1, 1).getDay();
                  const daysInMonth = new Date(y, m, 0).getDate();
                  const cells = [];
                  for (let i = 0; i < firstDay; i++) cells.push(null);
                  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
                  return (
                    <div key={ym}>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>{monthName}</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                        {["S","M","T","W","T","F","S"].map((d,i) => (
                          <div key={i} style={{ ...mono, fontSize: 9, color: C.muted, textAlign: "center", paddingBottom: 4 }}>{d}</div>
                        ))}
                        {cells.map((d, i) => {
                          if (!d) return <div key={i} />;
                          const dateStr = `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
                          const log = byMonth[ym][dateStr];
                          const isToday = dateStr === todayStr;
                          let icon = null, bg = "transparent", border = "transparent";
                          if (log) {
                            const load = log.load ?? 0;
                            icon = load === 0 ? "🛌" : "🚂";
                            bg = load === 0 ? "rgba(255,255,255,0.04)" : "rgba(61,158,122,0.15)";
                          }
                          if (isToday) border = C.orange;
                          return (
                            <div key={i} style={{ aspectRatio: "1", borderRadius: 6, background: bg, border: `1px solid ${border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1 }}>
                              <div style={{ ...mono, fontSize: 8, color: isToday ? C.orange : log ? C.white : C.muted, lineHeight: 1 }}>{d}</div>
                              {icon && <div style={{ fontSize: 18, lineHeight: 1 }}>{icon}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {(() => {
                const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
                const cutoffStr = cutoff.toISOString().slice(0, 10);
                const last30 = fatigueLogs.filter(l => l.date >= cutoffStr);
                const trainCount = last30.filter(l => (l.load ?? 0) > 0).length;
                const restCount = last30.filter(l => (l.load ?? 0) === 0).length;
                const total = trainCount + restCount;
                const trainPct = total > 0 ? Math.round(trainCount / total * 100) : 0;
                const restPct = total > 0 ? 100 - trainPct : 0;
                return (
                  <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>🚂</span>
                      <div>
                        <div style={{ ...mono, fontSize: 14, color: "#3d9e7a" }}>{trainCount}</div>
                        <div style={{ ...mono, fontSize: 9, color: C.muted }}>{trainPct}% train · last 30 days</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>🛌</span>
                      <div>
                        <div style={{ ...mono, fontSize: 14, color: C.muted }}>{restCount}</div>
                        <div style={{ ...mono, fontSize: 9, color: C.muted }}>{restPct}% rest</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
          })()}
            </div>
          </div>,
          document.body
        )}

        {/* Athlete name — tappable, opens overview/update modal */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div onClick={() => setShowAthleteInfo(true)}
              style={{ ...bebas, fontSize: 30, letterSpacing: 1, cursor: "pointer", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 10px", display: "inline-block" }}>
              {athlete.name}
              {plan.blockUpdate && (() => {
                const isNew = plan.blockUpdateAt && (!(progress._meta || {})._lastViewedUpdate || plan.blockUpdateAt > (progress._meta || {})._lastViewedUpdate);
                return isNew ? <span style={{ background: C.purple, color: "#fff", ...mono, fontSize: 8, padding: "1px 5px", borderRadius: 3, letterSpacing: 0.5, marginLeft: 8, verticalAlign: "middle" }}>NEW</span> : null;
              })()}
            </div>
            <WeekBadge plan={plan} />
          </div>
        </div>

        {/* Athlete info modal */}
        {showAthleteInfo && ReactDOM.createPortal(
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 9997, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setShowAthleteInfo(false)}>
            <div style={{ background: C.black, borderRadius: "16px 16px 0 0", maxHeight: "85vh", display: "flex", flexDirection: "column", border: `1px solid ${C.border}`, maxWidth: 420, width: "100%", margin: "0 auto" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 20px 16px" }}>
                <div style={{ ...bebas, fontSize: 20, letterSpacing: 1 }}>{athlete.name}</div>
                <button onClick={() => setShowAthleteInfo(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 24px" }}>
                {plan.blockUpdate && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ ...mono, fontSize: 10, color: C.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Update from Coach</div>
                    <div style={{ fontSize: 14, color: C.white, lineHeight: 1.6 }}>{renderMarkdown(plan.blockUpdate, C.white)}</div>
                  </div>
                )}
                {plan.blockNotes && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ ...mono, fontSize: 10, color: C.orange, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Block Overview</div>
                    <div style={{ fontSize: 14, color: C.muted, lineHeight: 1.6 }}>{renderMarkdown(plan.blockNotes, C.muted)}</div>
                  </div>
                )}
                {plan.blockImageUrl && <img src={plan.blockImageUrl} alt="Overview" style={{ width: "100%", borderRadius: 8, marginBottom: 24 }} />}
                {plan.volumePublished && plan.weeks && plan.weeks.some(wk => wk.volume) && (() => {
                  const MAX_VOL = 5;
                  const graphHeight = 72;
                  const allWeeks = plan.weeks;
                  return (
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Training Load</div>
                      <div style={{ ...mono, fontSize: 11, color: C.muted, lineHeight: 1.6, marginBottom: 12, fontStyle: "italic" }}>
                        Your training arc for this block. Use it to plan your rest.
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: graphHeight + 20 }}>
                        {allWeeks.map((wk, i) => {
                          const vol = wk.volume || 0;
                          const barH = vol ? (vol / MAX_VOL) * graphHeight : 0;
                          const isCurrent = currentWeekIdx === i;
                          const isPublished = publishedIndices.includes(i);
                          const barColor = vol <= 2 ? "rgba(91,127,166,0.7)" : vol === 5 ? "#e07a3a" : C.orange;
                          return (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, height: "100%", justifyContent: "flex-end", opacity: isPublished ? 1 : 0.3 }}>
                              {vol > 0 && <div style={{ ...mono, fontSize: 9, color: isCurrent ? C.purple : C.muted }}>{vol}</div>}
                              <div style={{ width: "100%", height: barH, background: isCurrent ? C.purple : barColor, borderRadius: "3px 3px 0 0", outline: isCurrent ? `2px solid ${C.purple}` : "none", outlineOffset: 2 }} />
                              <div style={{ ...mono, fontSize: 8, color: isCurrent ? C.purple : C.muted, textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", maxWidth: "100%" }}>{wk.label.replace("Week ","W")}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
                {!plan.blockUpdate && !plan.blockNotes && !plan.blockImageUrl && !(plan.volumePublished && plan.weeks?.some(wk => wk.volume)) && (
                  <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 24 }}>Nothing here yet.</div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

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



        {showOverview && (() => {
          const modalBg = darkMode ? "#1a1a1a" : "#ffffff";
          const modalText = darkMode ? "#f0efed" : "#111111";
          const modalBorder = darkMode ? "#2e2e2e" : "#e0e0de";
          const modalMuted = "#888884";
          return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ background: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 12, width: "100%", maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${modalBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: modalBg }}>
                  <div>
                    <div style={{ ...bebas, fontSize: 22, letterSpacing: 1, color: modalText }}>Training Block Overview</div>
                    <div style={{ ...mono, fontSize: 10, color: modalMuted, marginTop: 2 }}>{athlete.name}</div>
                  </div>
                  <button onClick={() => setShowOverview(false)} style={{ background: "none", border: "none", color: modalMuted, cursor: "pointer", fontSize: 20 }}>✕</button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", background: modalBg }}>
                  {plan.blockImageUrl && (
                    <div style={{ cursor: "pointer" }} onClick={() => window.open(plan.blockImageUrl, "_blank")}>
                      <img src={plan.blockImageUrl} alt="block" style={{ width: "100%", maxHeight: 260, objectFit: "cover", objectPosition: `center ${plan.blockImageFocus || "center"}`, display: "block" }} />
                    </div>
                  )}
                  <div style={{ padding: "20px 24px", fontSize: 13, color: modalText, background: modalBg }}>
                    {renderMarkdown(plan.blockNotes, modalText)}
                  </div>
                </div>
                <div style={{ padding: "14px 24px", borderTop: `1px solid ${modalBorder}`, flexShrink: 0, background: modalBg }}>
                  <button onClick={() => setShowOverview(false)} style={{ ...mono, fontSize: 11, padding: "8px 18px", borderRadius: 6, border: "none", background: C.orange, color: "#fff", cursor: "pointer" }}>Got it</button>
                </div>
              </div>
            </div>
          );
        })()}

        {showUpdate && (() => {
          const modalBg = darkMode ? "#1a1a1a" : "#ffffff";
          const modalText = darkMode ? "#f0efed" : "#111111";
          const modalBorder = darkMode ? "#2e2e2e" : "#e0e0de";
          const modalMuted = "#888884";
          return (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ background: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 12, width: "100%", maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${modalBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: modalBg }}>
                  <div>
                    <div style={{ ...bebas, fontSize: 22, letterSpacing: 1, color: modalText }}>Update</div>
                    <div style={{ ...mono, fontSize: 10, color: modalMuted, marginTop: 2 }}>{athlete.name}</div>
                  </div>
                  <button onClick={() => setShowUpdate(false)} style={{ background: "none", border: "none", color: modalMuted, cursor: "pointer", fontSize: 20 }}>✕</button>
                </div>
                <div style={{ flex: 1, overflowY: "auto", background: modalBg }}>
                  <div style={{ padding: "20px 24px", fontSize: 13, color: modalText, background: modalBg }}>
                    {renderMarkdown(plan.blockUpdate, modalText)}
                  </div>
                </div>
                <div style={{ padding: "14px 24px", borderTop: `1px solid ${modalBorder}`, flexShrink: 0, background: modalBg }}>
                  <button onClick={() => setShowUpdate(false)} style={{ ...mono, fontSize: 11, padding: "8px 18px", borderRadius: 6, border: "none", background: C.orange, color: "#fff", cursor: "pointer" }}>Got it</button>
                </div>
              </div>
            </div>
          );
        })()}

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

        {deferredExs.length > 0 && (
          <div style={{ marginTop: 8 }}>
            <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Deferred to another day</div>
            {deferredExs.map(ex => {
              const ep = getEp(ex);
              const alsoOnLabels = ex.sharedDays?.map(di => days[di]?.label).filter(Boolean).join(", ");
              return (
                <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(91,127,166,0.06)", border: `1px solid rgba(91,127,166,0.2)`, borderRadius: 8, marginBottom: 4 }}>
                  <div style={{ flex: 1, fontSize: 13, color: C.muted, textDecoration: "line-through" }}>{ex.text}</div>
                  <span style={{ ...mono, fontSize: 9, color: C.purple }}>→ {alsoOnLabels}</span>
                  <button onClick={() => handleNote(ex, ep.note || "", ep.selectedOption, true)}
                    style={{ ...mono, fontSize: 10, padding: "4px 10px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer", whiteSpace: "nowrap" }}>Undo</button>
                </div>
              );
            })}
          </div>
        )}

        {!isOvf && doneCount === totalCount && totalCount > 0 && (
          <div style={{ textAlign: "center", marginTop: 28, padding: "20px", background: "rgba(61,158,122,0.07)", border: "1px solid rgba(61,158,122,0.25)", borderRadius: 10 }}>
            <div style={{ ...bebas, fontSize: 26, color: "#2aaa5e", letterSpacing: 1 }}>Day Complete 🎉</div>
            <div style={{ ...mono, fontSize: 12, color: C.muted, marginTop: 4 }}>Nice work. Rest up.</div>
          </div>
        )}
      </div>
      {showTimer && <TimerModal onClose={() => setShowTimer(false)} />}
      </>}
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

        </div>
        <div style={{ display: "flex", background: C.gray2, borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {[["athlete","Athlete"],["coach","Coach"]].map(([key,label]) => (
            <button key={key} onClick={() => { setTab(key); setPassword(""); setError(""); setSelectedAthlete(""); setCoachName(""); }}
              style={{ flex: 1, padding: "10px", borderRadius: 7, border: "none", cursor: "pointer", background: tab===key?C.gray:"transparent", color: tab===key?C.white:C.muted, fontSize: 13, fontWeight: tab===key?500:400 }}>{label}</button>
          ))}
        </div>
        <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
          {tab === "athlete" ? (
            <>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Your Name</div>
              <select value={selectedAthlete} onChange={e => { setSelectedAthlete(e.target.value); setError(""); }} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">Select your name...</option>
                {athletes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Password</div>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} onKeyDown={e => e.key==="Enter"&&handleAthleteLogin()} placeholder="Enter your password" style={{ ...inputStyle, boxSizing: "border-box" }} />
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Name</div>
              <select value={coachName} onChange={e => { setCoachName(e.target.value); setError(""); }} style={{ ...inputStyle, appearance: "none", WebkitAppearance: "none", cursor: "pointer" }}>
                <option value="">— Jasper (Admin) —</option>
                {coaches.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Password</div>
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
function VolumeTiersPage({ athletes, onUpdateAthlete }) {
  // Sort: by name. Stable, predictable order so coaches can find athletes.
  const sorted = [...athletes].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  // Track per-row "just saved" pulse so the coach gets visual confirmation
  // without a toast or modal. Map of athlete id -> timestamp set on save.
  const [justSaved, setJustSaved] = useState({});
  const pickTier = async (athlete, tierId) => {
    if ((athlete.volume_tier || DEFAULT_VOLUME_TIER) === tierId) return;
    await onUpdateAthlete({ ...athlete, volume_tier: tierId });
    setJustSaved(prev => ({ ...prev, [athlete.id]: Date.now() }));
    setTimeout(() => setJustSaved(prev => {
      const next = { ...prev }; delete next[athlete.id]; return next;
    }), 1400);
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", width: "100%" }}>
      <div style={{ ...bebas, fontSize: 32, letterSpacing: 1, marginBottom: 6 }}>Volume Tiers</div>
      <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 28, lineHeight: 1.6 }}>
        Set each athlete's weekly training capacity. The tier scales how much load they can accumulate per unit of sleep before the fatigue model flags rest. Changes save automatically.
      </div>

      {/* Tier legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28, padding: "12px 14px", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8 }}>
        {VOLUME_TIERS.map(t => (
          <div key={t.id} style={{ ...mono, fontSize: 10, color: C.muted }}>
            <span style={{ color: C.white, fontWeight: 600 }}>{t.label}</span> {t.multiplier}×
          </div>
        ))}
      </div>

      {sorted.length === 0 && (
        <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: "40px 0" }}>
          No athletes yet.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map(a => {
          const currentTier = a.volume_tier || DEFAULT_VOLUME_TIER;
          const saved = !!justSaved[a.id];
          return (
            <div key={a.id} style={{ background: C.gray, border: `1px solid ${saved ? "#3d9e7a" : C.border}`, borderRadius: 8, padding: "14px 16px", transition: "border-color 0.3s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: C.white, marginBottom: 3 }}>{a.name}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge type={a.type} />
                    {a.level && <span style={{ ...mono, fontSize: 10, color: C.muted }}>{a.level}</span>}
                    {saved && <span style={{ ...mono, fontSize: 10, color: "#3d9e7a" }}>✓ saved</span>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {VOLUME_TIERS.map(t => {
                    const isActive = t.id === currentTier;
                    return (
                      <button key={t.id} onClick={() => pickTier(a, t.id)}
                        style={{
                          ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 6,
                          border: `1px solid ${isActive ? C.orange : C.border}`,
                          background: isActive ? "rgba(224,122,58,0.12)" : "transparent",
                          color: isActive ? C.orange : C.muted,
                          cursor: "pointer",
                          fontWeight: isActive ? 600 : 400,
                          minWidth: 64,
                        }}>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoachDashboard({ athletes, allAthletes, plans, progress, credentials, coaches, isAdmin, coachId, templates = [], onSaveTemplate, onDeleteTemplate, onUpdateCredentials, onUpdateCoachPassword, onPlanChange, onPublish, onProgressChange, onOverflowChange, onEditExercise, onAddAthlete, onUpdateAthlete, onDeleteAthlete, onAddCoach, onDeleteCoach, onUpdateCoach, onLogout, saved, darkMode, onToggleDark }) {
  const [selectedId, setSelectedId] = useState(null);
  const [mode, setMode] = useState("coach");
  const [sharedWeekIdx, setSharedWeekIdx] = useState(0);
  const [sharedDay, setSharedDay] = useState(0);
  const [planHistory, setPlanHistory] = useState({}); // athleteId -> { past: [], future: [] }

  const pushHistory = (id, oldPlan) => {
    setPlanHistory(h => {
      const entry = h[id] || { past: [], future: [] };
      return { ...h, [id]: { past: [...entry.past.slice(-29), oldPlan], future: [] } };
    });
  };
  const undo = () => {
    if (!selectedId) return;
    const entry = planHistory[selectedId] || { past: [], future: [] };
    if (!entry.past.length) return;
    const prev = entry.past[entry.past.length - 1];
    const current = plans[selectedId];
    setPlanHistory(h => ({ ...h, [selectedId]: { past: entry.past.slice(0, -1), future: [current, ...entry.future.slice(0, 29)] } }));
    onPlanChange(selectedId, prev);
  };
  const redo = () => {
    if (!selectedId) return;
    const entry = planHistory[selectedId] || { past: [], future: [] };
    if (!entry.future.length) return;
    const next = entry.future[0];
    const current = plans[selectedId];
    setPlanHistory(h => ({ ...h, [selectedId]: { past: [...entry.past.slice(-29), current], future: entry.future.slice(1) } }));
    onPlanChange(selectedId, next);
  };
  const canUndo = !!(selectedId && (planHistory[selectedId]?.past?.length));
  const canRedo = !!(selectedId && (planHistory[selectedId]?.future?.length));
  const [showAdd, setShowAdd] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newAthlete, setNewAthlete] = useState({ name: "", type: "Youth Comp", level: "", volume_tier: DEFAULT_VOLUME_TIER });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingAthlete, setEditingAthlete] = useState(null);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    : selectedId === VOLUME_TIERS_PAGE_ID
      ? { id: VOLUME_TIERS_PAGE_ID, name: "Volume Tiers" }
      : athletes.find(a => a.id === selectedId);
  const btnS = (active) => ({ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, padding: "6px 10px", borderRadius: 4, border: `1px solid ${active?C.orange:C.border}`, background: active?"rgba(61,158,122,0.1)":"none", color: active?C.orange:C.muted, cursor: "pointer" });

  const openBackups = async () => {
    if (!selectedId) return;
    setLoadingBackups(true);
    setShowBackups(true);
    const { data } = await sb.from("plan_backups").select("*").eq("athlete_id", selectedId).order("saved_at", { ascending: false }).limit(20);
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
      {/* Header — mobile collapses overflow buttons under a hamburger */}
      {isMobile ? (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px", height: 52, borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              {selectedId && (
                <button onClick={() => setSelectedId(null)} title="Back to athletes"
                  style={{ ...mono, fontSize: 16, padding: "6px 10px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: C.white, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}>‹</button>
              )}
              <div style={{ ...bebas, fontSize: 14, letterSpacing: 1.5, flexShrink: 0, color: C.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>RP <span style={{ color: C.orange }}>COACHING</span></div>
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {saved && <span style={{ ...mono, fontSize: 10, color: "#2aaa5e", marginRight: 4 }}>✓</span>}
              <button onClick={() => setMode("coach")} style={btnS(mode==="coach")}>Coach</button>
              <button onClick={() => setMode("athlete")} style={btnS(mode==="athlete")}>Athlete</button>
              {selectedId === "bzmmql6" && <button onClick={() => setMode("fatigue")} style={btnS(mode==="fatigue")}>Volume</button>}
              <button onClick={() => setMobileMenuOpen(v => !v)} title="Menu"
                style={{ ...mono, fontSize: 16, padding: "6px 10px", borderRadius: 4, border: `1px solid ${mobileMenuOpen ? C.orange : C.border}`, background: mobileMenuOpen ? "rgba(224,122,58,0.08)" : "none", color: mobileMenuOpen ? C.orange : C.muted, cursor: "pointer", lineHeight: 1 }}>≡</button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div style={{ borderBottom: `1px solid ${C.border}`, background: C.gray2, padding: "10px 12px", display: "flex", flexWrap: "wrap", gap: 6, flexShrink: 0 }}>
              <button onClick={() => { undo(); }} disabled={!canUndo} style={{ ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: canUndo ? C.white : C.gray3, cursor: canUndo ? "pointer" : "default" }}>↩ Undo</button>
              <button onClick={() => { redo(); }} disabled={!canRedo} style={{ ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: canRedo ? C.white : C.gray3, cursor: canRedo ? "pointer" : "default" }}>↪ Redo</button>
              <button onClick={() => { openPasswords(); setMobileMenuOpen(false); }} style={{ ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.white, cursor: "pointer" }}>🔑 Passwords</button>
              {selectedId && <button onClick={() => { openBackups(); setMobileMenuOpen(false); }} style={{ ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.white, cursor: "pointer" }}>↩ Backup</button>}
              {isAdmin && <button onClick={() => { setShowCoaches(true); setMobileMenuOpen(false); }} style={{ ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.white, cursor: "pointer" }}>Coaches</button>}
              <button onClick={() => { openTemplates(); setMobileMenuOpen(false); }} style={{ ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.white, cursor: "pointer" }}>Templates</button>
              <button onClick={onToggleDark} style={{ ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.white, cursor: "pointer" }}>{darkMode ? "☀︎ Light" : "☾ Dark"}</button>
              <button onClick={onLogout} style={{ ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: "#a05555", cursor: "pointer" }}>Log out</button>
            </div>
          )}
        </>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", height: 56, borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: 6 }}>
          <div style={{ ...bebas, fontSize: 18, letterSpacing: 2, flexShrink: 0, color: C.white }}>Rock Point <span style={{ color: C.orange }}>Coaching</span></div>
          <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
            {saved && <span style={{ ...mono, fontSize: 10, color: "#2aaa5e" }}>✓</span>}
            <button onClick={undo} disabled={!canUndo} title="Undo" style={{ ...mono, fontSize: 13, padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: canUndo ? C.muted : C.gray3, cursor: canUndo ? "pointer" : "default" }}>↩</button>
            <button onClick={redo} disabled={!canRedo} title="Redo" style={{ ...mono, fontSize: 13, padding: "4px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: canRedo ? C.muted : C.gray3, cursor: canRedo ? "pointer" : "default" }}>↪</button>
            <button onClick={openPasswords} style={btnS(false)}>🔑</button>
            {selectedId && <button onClick={openBackups} style={btnS(false)} title="Restore backup">↩ Backup</button>}
            {isAdmin && <button onClick={() => setShowCoaches(true)} style={btnS(false)}>Coaches</button>}
            <button onClick={openTemplates} style={btnS(false)}>Templates</button>
            <div style={{ width: 1, height: 20, background: C.border }} />
            <button onClick={() => setMode("coach")} style={btnS(mode==="coach")}>Coach</button>
            <button onClick={() => setMode("athlete")} style={btnS(mode==="athlete")}>Athlete</button>
            {selectedId === "bzmmql6" && <button onClick={() => setMode("fatigue")} style={btnS(mode==="fatigue")}>Volume</button>}
            <div style={{ width: 1, height: 20, background: C.border }} />
            <button onClick={onToggleDark} style={{ ...mono, fontSize: 10, padding: "6px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }} title="Toggle dark mode">{darkMode ? "☀︎" : "☾"}</button>
            <button onClick={onLogout} style={{ ...mono, fontSize: 10, padding: "6px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>↩</button>
          </div>
        </div>
      )}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.purple}, transparent)`, flexShrink: 0 }} />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar:
              Desktop: always visible, width toggles between 200 (open) and 36 (collapsed).
              Mobile: visible ONLY when nothing is selected, and takes the full viewport. */}
        {(!isMobile || !selectedId) && (
        <div style={{ width: isMobile ? "100%" : (sidebarOpen ? 200 : 36), borderRight: isMobile ? "none" : `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0, transition: isMobile ? "none" : "width 0.2s ease", overflow: "hidden" }}>
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
              {/* Volume Tiers — fixed entry */}
              <div style={{ marginBottom: 6 }}>
                <button onClick={() => setSelectedId(VOLUME_TIERS_PAGE_ID)} style={{ width: "100%", textAlign: "left", background: selectedId===VOLUME_TIERS_PAGE_ID?"rgba(224,122,58,0.10)":"none", border: `1px solid ${selectedId===VOLUME_TIERS_PAGE_ID?C.orange:"rgba(224,122,58,0.3)"}`, borderRadius: 6, padding: "9px 12px", cursor: "pointer" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.orange, marginBottom: 2 }}>Volume Tiers</div>
                  <div style={{ ...mono, fontSize: 9, color: C.muted }}>set athlete training capacity</div>
                </button>
              </div>
              <div style={{ borderBottom: `1px solid ${C.border}`, marginBottom: 6 }} />
              {athletes.map(a => (
                <div key={a.id} style={{ position: "relative", marginBottom: 2 }}
                  onMouseEnter={e => { const b=e.currentTarget.querySelector(".athlete-actions"); if(b) b.style.opacity="1"; }}
                  onMouseLeave={e => { const b=e.currentTarget.querySelector(".athlete-actions"); if(b) b.style.opacity="0"; }}>
                  <button onClick={() => setSelectedId(a.id)} style={{ width: "100%", textAlign: "left", background: selectedId===a.id?C.gray2:"none", border: `1px solid ${selectedId===a.id?C.orange:"transparent"}`, borderRadius: 6, padding: "10px 52px 10px 12px", cursor: "pointer" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 4 }}>{a.name}</div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}><Badge type={a.type} /><span style={{ ...mono, fontSize: 9, color: C.muted }}>{a.level}</span></div>
                    {plans[a.id]?.published?.length > 0 && <div style={{ ...mono, fontSize: 9, color: C.orange, marginTop: 3 }}>{plans[a.id].published.length} week{plans[a.id].published.length!==1?"s":""} live</div>}
                  </button>
                  <div className="athlete-actions" style={{ position: "absolute", top: 8, right: 4, opacity: 0, display: "flex", gap: 2, transition: "opacity 0.15s" }}>
                    <button title="Edit athlete" onClick={() => setEditingAthlete(a)} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 12, padding: "2px 5px" }}>✎</button>
                    <button title="Remove athlete" onClick={() => setConfirmDelete(a.id)} style={{ background: "none", border: "none", color: "#a05555", cursor: "pointer", fontSize: 13, padding: "2px 5px" }}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!sidebarOpen && !isMobile && (
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
              <button onClick={() => { setSelectedId(TEMPLATE_CREATOR_ID); setSidebarOpen(true); }}
                title="Template Creator"
                style={{ width: "100%", height: 32, background: selectedId===TEMPLATE_CREATOR_ID?"rgba(91,127,166,0.15)":"none", border: "none", borderLeft: `2px solid ${selectedId===TEMPLATE_CREATOR_ID?C.purple:"transparent"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: selectedId===TEMPLATE_CREATOR_ID?C.purple:C.muted, fontSize: 10 }}>
                ★
              </button>
              <button onClick={() => { setSelectedId(VOLUME_TIERS_PAGE_ID); setSidebarOpen(true); }}
                title="Volume Tiers"
                style={{ width: "100%", height: 32, background: selectedId===VOLUME_TIERS_PAGE_ID?"rgba(224,122,58,0.15)":"none", border: "none", borderLeft: `2px solid ${selectedId===VOLUME_TIERS_PAGE_ID?C.orange:"transparent"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: selectedId===VOLUME_TIERS_PAGE_ID?C.orange:C.muted, fontSize: 10 }}>
                ⚖
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
        )}

        {(!isMobile || selectedId) && (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {!selected ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, color: C.muted }}>
              <div style={{ fontSize: 40, opacity: 0.25 }}>🧗</div>
              <p style={{ ...mono, fontSize: 12 }}>Select an athlete</p>
            </div>
          ) : selectedId === VOLUME_TIERS_PAGE_ID ? (
            <VolumeTiersPage athletes={athletes} onUpdateAthlete={onUpdateAthlete} />
          ) : mode === "coach" ? (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
              {isMobile && selected.id !== TEMPLATE_CREATOR_ID ? (
                <MobileCoachPlanEditor
                  athlete={selected}
                  plan={plans[selected.id]}
                  onPlanChange={(p) => { pushHistory(selected.id, plans[selected.id]); onPlanChange(selected.id, p); }}
                  onPublish={(publishedIndices) => onPublish(selected.id, publishedIndices)}
                  sharedWeekIdx={sharedWeekIdx} setSharedWeekIdx={setSharedWeekIdx}
                  sharedDay={sharedDay} setSharedDay={setSharedDay}
                />
              ) : (
                <CoachPlanEditor
                  athlete={selected}
                  plan={plans[selected.id]}
                  onPlanChange={(p) => { pushHistory(selected.id, plans[selected.id]); onPlanChange(selected.id, p); }}
                  onPublish={(publishedIndices) => onPublish(selected.id, publishedIndices)}
                  templates={templates}
                  onSaveTemplate={onSaveTemplate}
                  sharedWeekIdx={sharedWeekIdx} setSharedWeekIdx={setSharedWeekIdx}
                  sharedDay={sharedDay} setSharedDay={setSharedDay}
                />
              )}
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
                              <button onClick={() => onOverflowChange(selected.id, overflow.filter((_, j) => j !== i))}
                                style={{ ...mono, fontSize: 11, padding: "4px 8px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: "#a05555", cursor: "pointer", flexShrink: 0 }}>✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : mode === "fatigue" ? (
            <div style={{ padding: "0 24px 40px", maxWidth: 700, margin: "0 auto", width: "100%" }}>
              <FatigueLog athlete={selected} isCoach={true} />
            </div>
          ) : (
            <AthleteView athlete={selected} plan={plans[selected.id]} progress={progress[selected.id]||{}}
              onProgressChange={(d,e,ep) => onProgressChange(selected.id,d,e,ep)}
              onOverflowChange={(ov) => onOverflowChange(selected.id,ov)}
              onEditExercise={(d,ex) => onEditExercise(selected.id,d,ex)}
              onLogout={()=>{}}
              sharedWeekIdx={sharedWeekIdx} setSharedWeekIdx={setSharedWeekIdx}
              sharedDay={sharedDay} setSharedDay={setSharedDay}
              darkMode={darkMode} onToggleDark={onToggleDark} />
          )}
        </div>
        )}
      </div>

      {editingAthlete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 380, maxWidth: "100%", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 18 }}>Edit Athlete</div>
            {[{label:"Name",key:"name"},{label:"Level",key:"level"}].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <div style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>{f.label}</div>
                <input value={editingAthlete[f.key] || ""} onChange={e => setEditingAthlete(p=>({...p,[f.key]:e.target.value}))} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>Type</div>
              <select value={editingAthlete.type || "Youth Comp"} onChange={e => setEditingAthlete(p=>({...p,type:e.target.value}))} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                {["Youth Comp","Adult Performance","Adult Recreational"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>Volume Tier</div>
              <select value={editingAthlete.volume_tier || DEFAULT_VOLUME_TIER} onChange={e => setEditingAthlete(p=>({...p,volume_tier:e.target.value}))} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                {VOLUME_TIERS.map(t => <option key={t.id} value={t.id}>{t.label} ({t.multiplier}×)</option>)}
              </select>
              <div style={{ ...mono, fontSize: 9, color: C.muted, marginTop: 4 }}>Scales weekly load allowance per unit sleep.</div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setEditingAthlete(null)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { if(!editingAthlete.name.trim()) return; onUpdateAthlete(editingAthlete); setEditingAthlete(null); }} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 380, maxWidth: "100%", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 18 }}>Add Athlete</div>
            {[{label:"Name",key:"name",ph:"Alex Torres"},{label:"Level",key:"level",ph:"V7, 5.12a..."}].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <div style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>{f.label}</div>
                <input value={newAthlete[f.key]} onChange={e => setNewAthlete(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>Type</div>
              <select value={newAthlete.type} onChange={e => setNewAthlete(p=>({...p,type:e.target.value}))} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                {["Youth Comp","Adult Performance","Adult Recreational"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>Volume Tier</div>
              <select value={newAthlete.volume_tier || DEFAULT_VOLUME_TIER} onChange={e => setNewAthlete(p=>({...p,volume_tier:e.target.value}))} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                {VOLUME_TIERS.map(t => <option key={t.id} value={t.id}>{t.label} ({t.multiplier}×)</option>)}
              </select>
              <div style={{ ...mono, fontSize: 9, color: C.muted, marginTop: 4 }}>Scales weekly load allowance per unit sleep. Med-High is the default.</div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAdd(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => { if(!newAthlete.name.trim()) return; onAddAthlete({id:uid(),...newAthlete, volume_tier: newAthlete.volume_tier || DEFAULT_VOLUME_TIER, coach_id: coachId || 'admin'}); setShowAdd(false); setNewAthlete({name:"",type:"Youth Comp",level:"",volume_tier:DEFAULT_VOLUME_TIER}); }} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Add</button>
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
                        style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "7px 10px", color: C.white, fontSize: 13, outline: "none" }} />
                      <input value={editingCoach.password} onChange={e => setEditingCoach(ec => ({...ec, password: e.target.value}))}
                        placeholder="Password" style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "7px 10px", color: C.white, fontSize: 13, outline: "none" }} />
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
                  placeholder="Name" style={{ flex: 1, minWidth: 120, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "8px 10px", color: C.white, fontSize: 13, outline: "none" }} />
                <input value={newCoach.password} onChange={e => setNewCoach(c => ({...c, password: e.target.value}))}
                  placeholder="Password" style={{ flex: 1, minWidth: 120, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "8px 10px", color: C.white, fontSize: 13, outline: "none" }} />
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
                <input type="text" value={draftCoachPw} onChange={e => setDraftCoachPw(e.target.value)} placeholder="Set admin password..." style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }} />
              </div>
            )}
            <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Athlete Passwords</div>
            {athletes.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, fontSize: 13, fontWeight: 500, color: C.white, minWidth: 100 }}>{a.name}</div>
                <input type="text" value={draftCreds[a.id]||""} onChange={e => setDraftCreds(d=>({...d,[a.id]:e.target.value}))} placeholder="Set password..." style={{ flex: 1, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "7px 10px", color: C.white, fontSize: 12, outline: "none", ...mono }} />
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
  const [darkMode, setDarkMode] = useState(() => { try { return localStorage.getItem("rp_dark") === "1"; } catch(e) { return false; } });
  C = darkMode ? DARK : LIGHT;
  updateGlobalStyles();
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
      // Only seed if BOTH athletes and plans are completely empty (true fresh install)
      // Using insert (not upsert) so existing plans are never overwritten
      if (ath.length === 0 && Object.keys(pln).length === 0) {
        for (const a of SEED_ATHLETES) await dbUpsertAthlete(a);
        for (const [id, plan] of Object.entries(SEED_PLANS)) {
          await sb.from("plans").insert({ athlete_id: id, data: plan }).select();
        }
        ath = SEED_ATHLETES; pln = SEED_PLANS;
      }
      setAthletes(ath); setPlans(pln); setProgress(prg); setCredentials(creds); setCoaches(coachs);
      // Daily backup on app load — runs once per day, uses 'daily' type so edit backups can't overwrite it
      const todayKey = localDateStr();
      if (localStorage.getItem('lastDailyBackup') !== todayKey) {
        Object.entries(pln).forEach(([aid, plan]) => {
          if (plan?.weeks?.length > 0) dbBackupPlan(aid, plan, 'daily');
        });
        Object.entries(prg).forEach(([aid, progress]) => {
          if (Object.keys(progress).length > 0) dbBackupProgress(aid, progress, 'daily');
        });
        localStorage.setItem('lastDailyBackup', todayKey);
      }
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
  const lastProgressBackup = React.useRef({});
  const updatePlan = useCallback(async (id, plan) => {
    setPlans(prev => {
      const existing = prev[id];

      const merged = { ...existing, ...plan };
      // Hard guard: never save a plan with no weeks
      if (merged.weeks && merged.weeks.length === 0) {
        console.warn('[updatePlan] Blocked: would save empty plan for', id);
        return prev;
      }
      // Hard guard: never save if weeks drop to less than half of existing
      if (existing?.weeks?.length > 2 && merged?.weeks?.length < Math.floor(existing.weeks.length / 2)) {
        console.warn('[updatePlan] Blocked: suspicious week drop from', existing.weeks.length, 'to', merged.weeks.length);
        return prev;
      }
      dbUpsertPlan(id, merged);
      // backup at most once per 2 min per athlete
      const now = Date.now();
      if (!lastBackup.current[id] || now - lastBackup.current[id] > 120000) {
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
      // Guard: never publish if plan is missing or has no weeks
      if (!p || !p.weeks || p.weeks.length === 0) {
        console.warn('[publishWeeks] Blocked: plan missing or empty for', id);
        return prev;
      }
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
      // Backup progress at most once per 2 min per athlete
      const now = Date.now();
      if (!lastProgressBackup.current[id] || now - lastProgressBackup.current[id] > 120000) {
        lastProgressBackup.current[id] = now;
        dbBackupProgress(id, np[id], 'edit');
      }
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

  const updateAthlete = useCallback(async (a) => {
    await dbUpsertAthlete(a);
    setAthletes(prev => prev.map(x => x.id === a.id ? { ...x, ...a } : x));
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
      darkMode={darkMode} onToggleDark={() => { const n = !darkMode; setDarkMode(n); localStorage.setItem("rp_dark", n?"1":"0"); }}
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
    darkMode={darkMode} onToggleDark={() => { const n = !darkMode; setDarkMode(n); localStorage.setItem("rp_dark", n?"1":"0"); }}
    onOverflowChange={updateOverflow}
    onEditExercise={editExercise}
    onAddAthlete={addAthlete}
    onUpdateAthlete={updateAthlete}
    onDeleteAthlete={deleteAthlete}
    onAddCoach={addCoach}
    onDeleteCoach={deleteCoach}
    onUpdateCoach={updateCoach}
    onLogout={() => setSession(null)}
    saved={saved}
  />;
}
