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
// Use var (not let/const) so C is hoisted and never in a temporal dead zone,
// even if the minifier reorders module-level statements.
var _darkMode = false;
try { _darkMode = localStorage.getItem("rp_dark") === "1"; } catch(e) {}
var C = _darkMode ? { ...DARK } : { ...LIGHT };

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
_fl.href = "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
document.head.appendChild(_fl);
const _gs = document.createElement("style");
document.head.appendChild(_gs);
function updateGlobalStyles() {
  _gs.textContent = `*, *::before, *::after{box-sizing:border-box;margin:0;padding:0} body{background:${C.black};color:${C.white};font-family:'Plus Jakarta Sans',sans-serif} ::-webkit-scrollbar{width:3px;height:3px} ::-webkit-scrollbar-thumb{background:${C.gray3};border-radius:2px} input,textarea,select{font-family:'Plus Jakarta Sans',sans-serif} textarea.athlete-note::placeholder{color:#888;font-style:normal;font-size:12px;letter-spacing:0.3px}`;
}
// updateGlobalStyles() called inside App() only — not at module level to avoid TDZ

const uid = () => Math.random().toString(36).slice(2, 9);
const TEMPLATE_CREATOR_ID = "__template_creator__";
const VOLUME_TIERS_PAGE_ID = "__volume_tiers__";
const SIMULATOR_PAGE_ID = "__simulator__";
const ATHLETE_LOGS_PAGE_ID = "__athlete_logs__";

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

const mono = { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, letterSpacing: 0.2 };
const bebas = { fontFamily: "'Fraunces', serif", fontWeight: 700 };

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
// Climbing grade dropdown options. "N/A" means the athlete doesn't use that scale.
const V_GRADES = ["N/A", "V0", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14", "V15", "V16", "V17"];
const YDS_GRADES = ["N/A", "5.5", "5.6", "5.7", "5.8", "5.9", "5.10a", "5.10b", "5.10c", "5.10d", "5.11a", "5.11b", "5.11c", "5.11d", "5.12a", "5.12b", "5.12c", "5.12d", "5.13a", "5.13b", "5.13c", "5.13d", "5.14a", "5.14b", "5.14c", "5.14d", "5.15a", "5.15b", "5.15c", "5.15d"];
const FREQ_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

// Plain-English explanations for each rec path. Keys match the `reasonKey`
// returned by computeRec. Authored copy — keep these in sync with model rules.
const REASON_TEXT = {
  sleptUnder6: "You slept less than 6 hours last night. Your recovery is impaired and you're at higher risk of injury. Skip today to maximize session quality for next time.",
  recentStrongZero: "You felt pretty weak yesterday, so a rest day is in order!",
  overCumLoad: "You've accumulated some fatigue in the last couple days, so rest up.",
  twoAdjacentHard: "Two back to back training days means it's time for rest. If you slept great you could train light today, but otherwise take it easy.",
  twoAdjacentHardSoftened: "You trained back to back days, but your sleep average is high AND you slept great last night. Train light today or rest up and get after it tomorrow.",
  overLoadCap: "You've exceeded your current training load capacity. Rest up, focus on high quality rested sessions. RecoverBuddy will help you ramp into this volume in no time.",
  reds_lowSleep_lowStrong: "Your sleep average is low and you've been feeling weak. Rest today to avoid frustration or injury.",
  reds_lowSleep_fourStrongDays: "You're not getting enough sleep. Sometimes when we feel strong on low sleep, our connective tissue is doing so much lifting that we're more likely to get hurt. If you're this strong on low sleep, think of what you'll accomplish with better rest!",
  reds_lowStrong_fourStrongDays: "You were feeling great recently, but then things dropped off. Seems like you got psyched, climbed a lot, and now are a little fatigued. Rest up and you'll be back at it in no time.",
  reds_all_three: "You're doing a lot on low sleep. Ease up and rest before you get hurt.",
  lowSleep_only: "You're not sleeping much, so train light today.",
  lowStrong_only: "You're sleeping well but you haven't been feeling good on the wall. Take it easier and train light today.",
  fourStrongDays_only: "You've been having consistently strong sessions. As odd as it may sound, sustained good performance stresses connective tissue even when nothing feels wrong. Ease up today before something tweaks so you can keep making gains.",
  fiveStrongDays: "You've been feeling strong at your current volume, so take a rest day and we'll up the volume going forward.",
  none: "You're resting well and you're not overly fatigued. Get after it.",
};

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
async function dbUpsertAthlete(a) {
  // Survey fields (age, grades, frequency) are intentionally NOT included
  // here — they're only ever written via the athlete-side survey submit.
  // Coach edits don't touch them, which prevents accidental overwrites
  // when the coach's local state hasn't yet reflected a recent survey save.
  await sb.from("athletes").upsert({
    id: a.id, name: a.name, type: a.type, level: a.level, coach_id: a.coach_id || null,
    volume_tier: a.volume_tier || DEFAULT_VOLUME_TIER,
    has_plan: a.has_plan ?? true,
    has_recoverbuddy: a.has_recoverbuddy ?? false,
  });
}
async function dbDeleteAthlete(id) { await sb.from("athletes").delete().eq("id", id); }
async function dbGetPlans() {
  const { data } = await sb.from("plans").select("*");
  const result = {};
  (data || []).forEach(row => { result[row.athlete_id] = migratePlan(row.data); });
  return result;
}
async function dbSaveAthleteComment(athleteId, weekIdx, dayIdx, exId, body) {
  try {
    const { data: ex } = await sb.from('exercise_comments').select('id').eq('athlete_id', athleteId).eq('exercise_id', exId).eq('author', 'athlete').limit(1);
    if (ex?.[0]) await sb.from('exercise_comments').update({ body, read_by_coach: false, created_at: new Date().toISOString() }).eq('id', ex[0].id);
    else await sb.from('exercise_comments').insert({ athlete_id: athleteId, plan_week: weekIdx, plan_day: dayIdx, exercise_id: exId, author: 'athlete', body, read_by_coach: false, read_by_athlete: true });
  } catch(e) { console.warn('[comment] athlete save failed:', e); }
}
async function dbSaveCoachReply(athleteId, weekIdx, dayIdx, exId, body) {
  try {
    const { data: ex } = await sb.from('exercise_comments').select('id').eq('athlete_id', athleteId).eq('exercise_id', exId).eq('author', 'coach').limit(1);
    if (ex?.[0]) await sb.from('exercise_comments').update({ body, read_by_athlete: false, created_at: new Date().toISOString() }).eq('id', ex[0].id);
    else await sb.from('exercise_comments').insert({ athlete_id: athleteId, plan_week: weekIdx, plan_day: dayIdx, exercise_id: exId, author: 'coach', body, read_by_athlete: false, read_by_coach: true });
  } catch(e) { console.warn('[comment] coach reply failed:', e); }
}
async function dbGetUnreadComments(ids) {
  try { const { data } = await sb.from('exercise_comments').select('*').in('athlete_id', ids).eq('author', 'athlete').eq('read_by_coach', false); return data || []; } catch(e) { return []; }
}
async function dbGetCommentsForAthlete(athleteId) {
  try { const { data } = await sb.from('exercise_comments').select('*').eq('athlete_id', athleteId).order('created_at', { ascending: false }); return data || []; } catch(e) { return []; }
}
async function dbMarkCommentsReadByCoach(athleteId) {
  try { await sb.from('exercise_comments').update({ read_by_coach: true }).eq('athlete_id', athleteId).eq('author', 'athlete'); } catch(e) {}
}
async function dbMarkCommentsReadByAthlete(athleteId) {
  try { await sb.from('exercise_comments').update({ read_by_athlete: true }).eq('athlete_id', athleteId).eq('author', 'coach'); } catch(e) {}
}

async function dbUpsertPlan(athleteId, planData) { await sb.from("plans").upsert({ athlete_id: athleteId, data: planData }); }
async function dbSaveArchive(athleteId, label, planData, progressData) {
  await sb.from("plan_archives").insert({ athlete_id: athleteId, label, plan_data: planData, progress_data: progressData || null });
}
async function dbGetArchives(athleteId) {
  const { data } = await sb.from("plan_archives").select("*").eq("athlete_id", athleteId).order("archived_at", { ascending: false });
  return data || [];
}
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
async function dbBackupFatigueLogs(athleteId, logsData, backupType = 'edit') {
  try {
    const limit = backupType === 'daily' ? 90 : 50;
    const { data: existing } = await sb.from("fatigue_log_backups").select("id").eq("athlete_id", athleteId).eq("backup_type", backupType).order("saved_at", { ascending: true });
    if (existing && existing.length >= limit) {
      const toDelete = existing.slice(0, existing.length - limit + 1).map(r => r.id);
      await sb.from("fatigue_log_backups").delete().in("id", toDelete);
    }
    await sb.from("fatigue_log_backups").insert({ athlete_id: athleteId, data: logsData, backup_type: backupType });
  } catch(e) { console.warn("Fatigue log backup failed:", e); }
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
async function dbUpsertAthleteWithCoach(a) {
  // Survey fields are intentionally NOT included — see dbUpsertAthlete comment.
  await sb.from("athletes").upsert({
    id: a.id, name: a.name, type: a.type, level: a.level, coach_id: a.coach_id,
    volume_tier: a.volume_tier || DEFAULT_VOLUME_TIER,
    has_plan: a.has_plan ?? true,
    has_recoverbuddy: a.has_recoverbuddy ?? false,
  });
}
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
  return <span style={{ ...mono, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", padding: "2px 7px", borderRadius: 3, background: s.bg, color: s.color }}>{type}</span>;
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
      els.push(<div key={i} style={{ fontFamily:"'Fraunces',serif", fontSize: 22, letterSpacing: 1, color:tc, marginBottom: 6, marginTop: i>0?12:0 }}>{line.slice(2)}</div>);
    } else if (line.startsWith('## ')) {
      els.push(<div key={i} style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 700, color:tc, marginBottom: 4, marginTop: i>0?10:0 }}>{line.slice(3)}</div>);
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
        style={{ width: "100%", background: "transparent", border: "none", color: C.white, fontSize: 13, lineHeight: 1.6, resize: "vertical", outline: "none", padding: "10px 12px", fontFamily: "'Plus Jakarta Sans', sans-serif" }} />
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
                  <button onClick={() => videoMeta.type === 'embed' ? setShowVideo(true) : window.open(videoMeta.url, '_blank')} style={{ ...mono, fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `1px solid #c0392b`, background: "rgba(192,57,43,0.08)", color: "#c0392b", cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.5 }}>▶ Demo</button>
                )}
                {ex.imageUrl && !videoMeta && !editing && (
                  <button onClick={() => setShowVideo(true)} style={{ ...mono, fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer", whiteSpace: "nowrap" }}>📷</button>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: ex.notes ? 6 : 0 }}>
                {ex.sets && <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize: 15, fontWeight: 500, color: C.orange, display: "block", marginBottom: 2 }}>{ex.sets}</span>}
                <span style={{ ...mono, fontSize: 10, color: C.muted }}>{ex.category}</span>
                {isOverflow && ex.fromDay != null && <span style={{ ...mono, fontSize: 10, color: "#4a7aab", background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>skipped from {ex.fromWeek != null ? `W${ex.fromWeek + 1} · ` : ""}Day {ex.fromDay + 1}</span>}
                {sourceDayLabel && <span style={{ ...mono, fontSize: 10, color: C.purple, background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>from {sourceDayLabel}</span>}
                {alsoOnLabels && <span style={{ ...mono, fontSize: 10, color: C.purple, background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>also on {alsoOnLabels}</span>}
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
                  <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Choose one</div>
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
  const lbl = { ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 4 };
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
                <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 1 }}>{d.exercises.length} ex</div>
              </button>
            )}
            {i===activeDay && editingLabel!==i && (
              <div style={{ display: "flex", justifyContent: "center", gap: 3, marginTop: 3, flexWrap: "wrap" }}>
                <button onClick={() => moveDay(i, -1)} disabled={i===0} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: i===0?"#ccc":C.muted, cursor: i===0?"default":"pointer" }}>←</button>
                <button onClick={() => moveDay(i, 1)} disabled={i===days.length-1} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: i===days.length-1?"#ccc":C.muted, cursor: i===days.length-1?"default":"pointer" }}>→</button>
                <button onClick={() => { setDraftLabel(d.label); setEditingLabel(i); }} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer" }}>✎</button>
                <button onClick={() => onCopyDay(d)} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer" }}>⎘</button>
                {onSaveTemplate && <button onClick={() => onSaveTemplate("day", d, d.label)} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.orange, cursor: "pointer" }} title="Save as template">★</button>}
                {days.length > 1 && <button onMouseDown={e => { e.preventDefault(); e.stopPropagation(); removeDay(i); }} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: "#a05555", cursor: "pointer" }}>✕</button>}
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
                      <div style={{ ...mono, fontSize: 10, color: C.purple, background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3, display: "inline-block", marginBottom: 4 }}>from {days[ex._sourceDay]?.label}</div>
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
                    <span style={{ ...mono, fontSize: 10, color: C.muted, opacity: 0.5 }}>▾</span>
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
                    return <div style={{ ...mono, fontSize: 10, color: C.orange, marginTop: 4 }}>✓ Demo video set{t > 0 ? ` · starts at ${Math.floor(t/60)}:${String(t%60).padStart(2,"0")}` : ""}</div>;
                  })()}
                  {/* Options editor */}
                  {options.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Options (athlete picks one)</div>
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
                    <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Athlete can choose a different day to complete this exercise:</div>
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
                          }} style={{ ...mono, fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `1px solid ${isOn ? C.purple : C.border}`, background: isOn ? "rgba(91,127,166,0.12)" : "transparent", color: isOn ? C.purple : C.muted, cursor: "pointer" }}>
                            {d.label}
                          </button>
                        );
                      })}
                      {days.length <= 1 && <span style={{ ...mono, fontSize: 10, color: C.muted }}>Add more days first</span>}
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
                    <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>START</div>
                    <input type="date" value={plan?.blockStart || ""} onChange={e => updateBlock({ blockStart: e.target.value })}
                      style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.white, fontSize: 12, outline: "none", colorScheme: "dark", ...mono }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>END</div>
                    <input type="date" value={plan?.blockEnd || ""} onChange={e => updateBlock({ blockEnd: e.target.value })}
                      style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.white, fontSize: 12, outline: "none", colorScheme: "dark", ...mono }} />
                  </div>
                </div>
                <div>
                  <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>BLOCK NOTES (visible to coach only)</div>
                  <textarea value={plan?.blockNotes || ""} onChange={e => updateBlock({ blockNotes: e.target.value })}
                    placeholder="Coaching notes for this block. Markdown OK." rows={3}
                    style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                </div>
                <div>
                  <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>BLOCK UPDATE (visible to athlete)</div>
                  <textarea value={plan?.blockUpdate || ""} onChange={e => updateBlock({ blockUpdate: e.target.value })}
                    placeholder="Message for the athlete. Markdown OK." rows={3}
                    style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                </div>
                <div>
                  <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>BLOCK IMAGE</div>
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
              <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Day Label</div>
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
                      <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Exercise {ei + 1}</div>
                      <button onClick={() => deleteExerciseWithUndo(weekIdx, dayIdx, ei)}
                        style={{ ...mono, fontSize: 14, padding: "4px 8px", background: "none", border: "none", color: "#a05555", cursor: "pointer", lineHeight: 1 }}>🗑</button>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>EXERCISE</div>
                      <input value={ex.text || ""} onChange={e => updateExercise(weekIdx, dayIdx, ei, { text: e.target.value })}
                        placeholder="Exercise name"
                        style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none" }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>SETS / REPS</div>
                      <input value={ex.sets || ""} onChange={e => updateExercise(weekIdx, dayIdx, ei, { sets: e.target.value })}
                        placeholder="e.g. 3x8 @ 70%"
                        style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.orange, fontSize: 13, outline: "none", ...mono }} />
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>CATEGORY</div>
                      <select value={ALL_CATEGORIES.includes(ex.category) ? ex.category : "Other"} onChange={e => updateExercise(weekIdx, dayIdx, ei, { category: e.target.value })}
                        style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                        {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>NOTES</div>
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
                          <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>VIDEO URL</div>
                          <input value={ex.videoUrl || ""} onChange={e => updateExercise(weekIdx, dayIdx, ei, { videoUrl: e.target.value })}
                            placeholder="YouTube, Google Drive, etc."
                            style={{ width: "100%", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 12, outline: "none", ...mono }} />
                        </div>
                        <div>
                          <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>ALTERNATION (A/B WEEKS)</div>
                          <button onClick={() => updateExercise(weekIdx, dayIdx, ei, { type: ex.type === "alternating" ? undefined : "alternating" })}
                            style={{ width: "100%", ...mono, fontSize: 11, padding: "10px", background: ex.type === "alternating" ? "rgba(91,127,166,0.15)" : "none", border: `1px solid ${ex.type === "alternating" ? "#5b7fa6" : C.border}`, borderRadius: 6, color: ex.type === "alternating" ? "#5b7fa6" : C.muted, cursor: "pointer" }}>
                            {ex.type === "alternating" ? "✓ Alternating" : "Mark as alternating"}
                          </button>
                        </div>
                        <div>
                          <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>IMAGE</div>
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
                <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>EXERCISE</div>
                <input value={draftEx.text} onChange={e => setDraftEx(d => ({ ...d, text: e.target.value }))} autoFocus
                  placeholder="Exercise name"
                  style={{ width: "100%", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none" }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>SETS / REPS</div>
                <input value={draftEx.sets} onChange={e => setDraftEx(d => ({ ...d, sets: e.target.value }))}
                  placeholder="e.g. 3x8 @ 70%"
                  style={{ width: "100%", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.orange, fontSize: 13, outline: "none", ...mono }} />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>CATEGORY</div>
                <select value={ALL_CATEGORIES.includes(draftEx.category) ? draftEx.category : "Other"} onChange={e => setDraftEx(d => ({ ...d, category: e.target.value }))}
                  style={{ width: "100%", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>NOTES</div>
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
  const [showBlockTemplates, setShowBlockTemplates] = useState(false);

  const weeks = plan?.weeks || [];
  const published = plan?.published || [];

  // figure out current week number for coach context
  const currentWeekIdx = (() => {
    const ov = plan?.currentWeekOverride;
    if (ov != null) {
      // New shape: { weekIdx, setOnDate } — self-progresses from anchor.
      if (typeof ov === "object" && typeof ov.weekIdx === "number" && typeof ov.setOnDate === "string") {
        const [ay, am, ad] = ov.setOnDate.split("-").map(Number);
        const anchor = new Date(ay, am - 1, ad);
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const weeksSince = Math.max(0, Math.floor((now - anchor) / (7 * 24 * 60 * 60 * 1000)));
        return Math.min(ov.weekIdx + weeksSince, weeks.length - 1);
      }
      // Legacy shape: plain integer. Treat as static.
      if (typeof ov === "number") return Math.min(ov, weeks.length - 1);
    }
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
            const next = window.prompt(`Set current week (1–${weeks.length}). It will auto-advance from today.`, currentWeekIdx != null ? currentWeekIdx + 1 : "");
            if (next === null) return;
            if (next.trim() === "") { onPlanChange({ ...plan, currentWeekOverride: null }); return; }
            const idx = parseInt(next) - 1;
            if (isNaN(idx) || idx < 0 || idx >= weeks.length) return;
            onPlanChange({ ...plan, currentWeekOverride: { weekIdx: idx, setOnDate: localDateStr() } });
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
            <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Full Block — {weeks.length} Week{weeks.length !== 1 ? "s" : ""}</div>
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
                            <span style={{ ...mono, fontSize: 10, color: C.muted }}>{day.exercises.length} ex</span>
                            <span style={{ ...mono, fontSize: 10, color: C.muted }}>{expanded ? "▲" : "▼"}</span>
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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, gap: 8, flexWrap: "wrap" }}>
          <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.muted }}>Block Overview / Read Me</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => { setSavingTemplate({ type: "block", data: { weeks: plan?.weeks || [], blockNotes: plan?.blockNotes || "" } }); setTemplateName(""); }}
              style={{ ...mono, fontSize: 10, padding: "4px 8px", background: "none", border: `1px solid ${C.border}`, borderRadius: 4, color: C.orange, cursor: "pointer" }}
              title="Save this whole block as a template">★ Save block</button>
            {localTemplates.filter(t => t.type === "block").length > 0 && (
              <button onClick={() => setShowBlockTemplates(true)}
                style={{ ...mono, fontSize: 10, padding: "4px 8px", background: "none", border: `1px dashed ${C.orange}`, borderRadius: 4, color: C.orange, cursor: "pointer" }}
                title="Load a saved block template">★ Load block</button>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>START DATE</div>
            <input type="date" value={plan?.blockStart || ""} onChange={e => onPlanChange({ ...plan, blockStart: e.target.value })}
              style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "6px 8px", color: C.white, fontSize: 12, outline: "none", colorScheme: "light dark", ...mono }} />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>END DATE</div>
            <input type="date" value={plan?.blockEnd || ""} onChange={e => onPlanChange({ ...plan, blockEnd: e.target.value })}
              style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "6px 8px", color: C.white, fontSize: 12, outline: "none", colorScheme: "light dark", ...mono }} />
          </div>
        </div>
        <RichTextEditor value={plan?.blockNotes || ""} onChange={v => onPlanChange({ ...plan, blockNotes: v })}
          placeholder="Write notes about the goals, purpose, and context of this training block. Use **bold**, *italic*, - bullets. Athletes will see this when they tap 'Overview'."
          rows={4} />
        {/* Block image */}
        <div style={{ marginTop: 14 }}>
          <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Block Image</div>
          {plan?.blockImageUrl ? (
            <div>
              <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
                <img src={plan.blockImageUrl} alt="block" style={{ width: "100%", maxHeight: 180, objectFit: "cover", objectPosition: `center ${plan.blockImageFocus || "center"}`, display: "block", borderRadius: 8 }} />
                <button onClick={async () => { await dbDeleteBlockImage(plan.blockImageUrl); onPlanChange({ ...plan, blockImageUrl: null, blockImageFocus: null }); }}
                  style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", borderRadius: 4, cursor: "pointer", padding: "4px 8px", ...mono, fontSize: 10 }}>✕ Remove</button>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ ...mono, fontSize: 10, color: C.muted, marginRight: 4 }}>FOCUS</span>
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
        <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 8 }}>Athlete Update</div>
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
                  <div style={{ ...mono, fontSize: 10, color: isPub ? "#2aaa5e" : C.muted, marginTop: 2 }}>{isPub ? "● live" : "○ draft"}</div>
                </button>
              )}
              {isActive && editingWeekLabel !== i && (
                <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
                  <button onClick={() => moveWeek(i, -1)} disabled={i===0} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: i===0?"#ccc":C.muted, cursor: i===0?"default":"pointer" }}>←</button>
                  <button onClick={() => moveWeek(i, 1)} disabled={i===weeks.length-1} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: i===weeks.length-1?"#ccc":C.muted, cursor: i===weeks.length-1?"default":"pointer" }}>→</button>
                  <button onClick={() => { setDraftWeekLabel(wk.label); setEditingWeekLabel(i); }} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.muted, cursor: "pointer" }}>✎</button>
                  <button onClick={() => { setSavingTemplate({ type: "week", data: wk }); setTemplateName(wk.label); }} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: C.orange, cursor: "pointer" }} title="Save as template">★</button>
                  {weeks.length > 1 && <button onClick={() => removeWeek(i)} style={{ ...mono, fontSize: 10, padding: "2px 5px", background: "none", border: `1px solid ${C.border}`, borderRadius: 3, color: "#a05555", cursor: "pointer" }}>✕</button>}
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
              <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Volume — {week.label}</div>
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
              placeholder={savingTemplate.type === "block" ? "e.g. 8-Week Power Block, Comp Prep..." : savingTemplate.type === "week" ? "e.g. Power Week, Deload..." : "e.g. Strength Day, Fitness Day..."}
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
      {showBlockTemplates && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 460, maxWidth: "100%", maxHeight: "80vh", overflow: "auto", padding: 24 }}>
            <div style={{ ...bebas, fontSize: 20, marginBottom: 4 }}>Load Block Template</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 16 }}>Replaces the current plan's weeks and block notes. Block dates, image, and published weeks stay as they are.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {localTemplates.filter(t => t.type === "block").map(t => {
                const ws = t.data?.weeks || [];
                const totalDays = ws.reduce((n, w) => n + (w.days?.length || 0), 0);
                const totalExs = ws.reduce((n, w) => n + (w.days?.reduce((m, d) => m + (d.exercises?.length || 0), 0) || 0), 0);
                return (
                  <button key={t.id} onClick={() => {
                    const hasContent = (plan?.weeks || []).some(w => (w.days || []).some(d => (d.exercises || []).length > 0));
                    if (hasContent && !window.confirm(`Replace the current plan's weeks with "${t.name}"? Block dates, image, and published weeks will be preserved.`)) return;
                    // Clone with fresh exercise IDs so no two athletes share IDs
                    const newWeeks = ws.map(w => ({
                      label: w.label,
                      days: (w.days || []).map(d => ({
                        label: d.label,
                        exercises: (d.exercises || []).map(e => ({ ...e, id: uid() })),
                      })),
                    }));
                    onPlanChange({
                      ...plan,
                      weeks: newWeeks,
                      blockNotes: t.data?.blockNotes || plan?.blockNotes || "",
                      // Athlete-specific fields are NOT touched:
                      //   blockStart, blockEnd, blockImageUrl, blockImageFocus,
                      //   published, currentWeekOverride
                    });
                    setActiveWeek(0);
                    setShowBlockTemplates(false);
                  }} style={{ textAlign: "left", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.white, marginBottom: 3 }}>{t.name}</div>
                    <div style={{ ...mono, fontSize: 10, color: C.muted }}>{ws.length} weeks · {totalDays} days · {totalExs} exercises</div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setShowBlockTemplates(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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
                      {isCurrent && <span style={{ ...mono, fontSize: 10, color: C.purple, marginLeft: 8 }}>current</span>}
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
      <div style={{ ...mono, fontSize: 10, color: active ? "#fff" : C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, opacity: active ? 0.8 : 1 }}>{label}</div>
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
  const [showLoadHelp, setShowLoadHelp] = useState(false);
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
      // Always fetch the latest row from DB to avoid race conditions
      // where partialDayLog was set before the DB write completed.
      const todayStr = localDateStr();
      sb.from("fatigue_logs").select("*").eq("athlete_id", athlete.id).eq("date", autoOpenLog.date || todayStr)
        .order("created_at", { ascending: false }).limit(1)
        .then(({ data: rows }) => {
          const freshRow = rows?.[0];
          const logToUse = freshRow || autoOpenLog;
          setForm({ date: logToUse.date || todayStr, summary: logToUse.summary || "", sleep: logToUse.sleep ?? "", load: logToUse.load ?? null, ...deriveStrong(logToUse), tweaks: logToUse.tweaks || "" });
          setEditingId(freshRow?.id || autoOpenLog.id || null);
          setShowForm(true);
        });
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

  const savePartial = async () => {
    // Save whatever has been filled in so far, even if incomplete
    const sleepVal = parseFloat(form.sleep);
    if (isNaN(sleepVal) || sleepVal <= 0) { setShowForm(false); return; } // nothing useful to save
    try {
      const payload = {
        athlete_id: athlete.id,
        date: form.date,
        sleep: sleepVal,
        load: form.load != null && form.load !== '' ? parseInt(form.load) : null,
        strong: (form.strong !== '' && form.strong != null) ? parseInt(form.strong) : null,
        strong_na: form.strong_na === true,
        summary: form.summary,
        tweaks: form.tweaks,
      };
      if (editingId) {
        await sb.from("fatigue_logs").update(payload).eq("id", editingId);
      } else {
        await sb.from("fatigue_logs").upsert(payload, { onConflict: "athlete_id,date" });
      }
      if (onSaved) {
        const { data: rows } = await sb.from("fatigue_logs").select("*").eq("athlete_id", athlete.id).eq("date", form.date).order("created_at", { ascending: false }).limit(1);
        if (rows?.[0]) onSaved(rows[0]);
      }
    } catch(e) { console.warn("Partial save failed:", e); }
    setShowForm(false);
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
        const updatedLogs = [result.data, ...logs.filter(l => l.id !== result.data.id)].sort((a, b) => b.date.localeCompare(a.date));
        setLogs(updatedLogs);
        dbBackupFatigueLogs(athlete.id, updatedLogs, 'edit');
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
    // Strong window: last 3 calendar days. 2+ rating minimum.
    const strongLogs = last3.filter(l => l.strong != null);
    const hasEnoughStrong = strongLogs.length >= 2;
    const avgStrong = hasEnoughStrong ? strongLogs.reduce((s, l) => s + l.strong, 0) / strongLogs.length : null;
    const last3Loads = last3.map(l => l.load ?? 0);
    const last2Loads = withMetrics.slice(0, 2).map(l => l.load ?? 0);
    // Adjacent load=2+ days → Rest (hard override)
    const adjacentHardDays = last2Loads.length === 2 && last2Loads[0] >= 2 && last2Loads[1] >= 2;
    // fourStrongDays: 4 most-recent numeric strong ratings all = 2. Rest
    // days don't break the streak. Bounded to within recent7.
    const recentStrongTrainingRatings = recent7.filter(l => l.strong != null && (l.load ?? 0) > 0).slice(0, 5).map(l => l.strong);
    const fourStrongDays = recentStrongTrainingRatings.length === 5 && recentStrongTrainingRatings.every(s => s === 2);
    // Capacity includes volume tier multiplier (fix: previously this
    // version divided by avgSleep alone, ignoring the tier).
    const volumeCoeff = getVolumeMultiplier(athlete);
    const capacity = avgSleep * volumeCoeff;
    const overLoadCap = weekLoad > capacity;
    const lowSleep = avgSleep < 6.5;
    // strong=0 = weak, strong=1 = standard, strong=2 = notably good. So
    // "below normal" means avg < 1.0.
    const lowStrong = avgStrong !== null && avgStrong < 1.0;
    const redCount = [fourStrongDays, lowSleep, lowStrong].filter(Boolean).length;
    const yellowCount = 0;
    const lastNightSleep = withMetrics[0]?.sleep ?? null;
    const sleptUnder6 = lastNightSleep !== null && lastNightSleep < 6;

    let label, color, bg, reasons;
    if (sleptUnder6) {
      label = "Rest"; color = "#c0392b"; bg = "rgba(192,57,43,0.08)";
      reasons = ["Last night's sleep was under 6 hours — no training today."];
    } else if (adjacentHardDays) {
      label = "Rest"; color = "#c0392b"; bg = "rgba(192,57,43,0.08)";
      reasons = ["Two hard sessions back to back — full recovery needed."];
    } else if (overLoadCap) {
      label = "Rest"; color = "#c0392b"; bg = "rgba(192,57,43,0.08)";
      reasons = ["Weekly load (" + weekLoad + ") is at or above your tier allowance (" + capacity.toFixed(1) + "). Rest until it drops."];
    } else if (redCount >= 2) {
      label = "Rest"; color = "#c0392b"; bg = "rgba(192,57,43,0.08)";
      reasons = [
        fourStrongDays && "4 consecutive peak days — connective tissue needs rest",
        lowSleep && ("Sleep avg is low (" + avgSleep.toFixed(1) + "h)"),
        lowStrong && "Consistently feeling below normal",
      ].filter(Boolean);
    } else if (redCount === 1 || yellowCount >= 1) {
      label = "Train Light"; color = C.orange; bg = "rgba(224,122,58,0.08)";
      reasons = [
        lowSleep && ("Sleep avg below ideal (" + avgSleep.toFixed(1) + "h)"),
      ].filter(Boolean);
    } else {
      label = "Train"; color = "#3d9e7a"; bg = "rgba(61,158,122,0.08)";
      reasons = [
        "Sleep avg " + avgSleep.toFixed(1) + "h",
        "Weekly load " + weekLoad,
        avgStrong !== null ? ("Feeling " + (avgStrong >= 1.5 ? "notably good" : "normal")) : null,
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
    const minMonth = "0000-00"; // show all months
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
                  <div key={i} style={{ ...mono, fontSize: 10, color: C.muted, textAlign: "center", paddingBottom: 4 }}>{d}</div>
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
                      <div style={{ ...mono, fontSize: 10, color: isToday ? C.orange : log ? C.white : C.muted }}>{d}</div>
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
          <span style={{ ...mono, fontSize: 10, color: C.purple, textTransform: "uppercase", letterSpacing: 1 }}>Prototype</span>
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
            <span style={{ ...mono, fontSize: 13, color: isToday ? C.orange : "#111111", fontWeight: 600 }}>{dayLabel}</span>
            {isToday && <span style={{ ...mono, fontSize: 8, color: C.orange, background: "rgba(61,158,122,0.12)", padding: "1px 6px", borderRadius: 3 }}>TODAY</span>}
          </div>
          {true && (
            <button onMouseDown={e => { e.preventDefault(); openForm(log); }}
              style={{ ...mono, fontSize: 10, padding: "2px 7px", borderRadius: 4, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>edit</button>
          )}
        </div>
        {log.summary && <div style={{ fontSize: 13, color: C.white, marginBottom: 8 }}>{log.summary}</div>}
        {isToday && log.sleep != null && (log.load == null || log.strong == null) && (
          <div style={{ ...mono, fontSize: 11, color: C.orange, marginBottom: 8 }}>You logged your sleep already — tap edit to log the rest.</div>
        )}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
          {[["SLEEP", (log.sleep ?? "—") + (log.sleep != null ? "h" : ""), sleepColor(log.sleep)], ["LOAD", log.load ?? "—", loadColor(log.load)], ["STRONG", log.strong ?? "—", strongColor(log.strong)]].map(([lbl, val, col]) => (
            <div key={lbl}>
              <div style={{ ...mono, fontSize: 10, color: C.muted }}>{lbl}</div>
              <div style={{ ...mono, fontSize: 18, color: col, lineHeight: 1.2 }}>{val}</div>
            </div>
          ))}
          {log.tweaks && (
            <div style={{ flex: 1, minWidth: 100 }}>
              <div style={{ ...mono, fontSize: 10, color: "#c0392b" }}>TWEAKS</div>
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
      style={{ ...mono, fontSize: 15, width: 52, height: 52, borderRadius: 8, border: `1px solid ${current === val ? color : C.border}`, background: current === val ? color + "22" : "transparent", color: current === val ? color : C.muted, cursor: "pointer", fontWeight: current === val ? 700 : 400, transition: "all 0.1s" }}>
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
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ ...bebas, fontSize: 18, color: C.orange, letterSpacing: 1 }}>TODAY'S CHECK-IN</div>
            <button onMouseDown={e => { e.preventDefault(); savePartial(); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div>
              <Lbl text="Date" />
              <input type="date" value={form.date} max={today}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{ ...inp, width: "auto", boxSizing: "border-box", colorScheme: "dark" }} />
            </div>
            <div>
              <Lbl text="What did you do today?" />
              <input value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="What did you do today?" style={{ ...inp, boxSizing: "border-box" }} />
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
              <button onMouseDown={e => { e.preventDefault(); setShowLoadHelp(v => !v); }}
                style={{ ...mono, fontSize: 11, padding: "5px 12px", borderRadius: 5, border: `1px solid ${showLoadHelp ? C.orange : C.border}`, background: showLoadHelp ? "rgba(61,158,122,0.08)" : "none", color: showLoadHelp ? C.orange : C.muted, cursor: "pointer", marginTop: 4 }}>
                {showLoadHelp ? "Hide" : "How do I choose?"}
              </button>
              {showLoadHelp && (
                <div style={{ marginTop: 10, background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>Use your judgment. Not necessarily just climbing.</div>
                  {[
                    { n: 0, color: "#5b7fa6", text: "Rest. Nothing strenuous." },
                    { n: 1, color: C.orange, text: "Light session. You ended well before you got tired. A super short sesh, long walk, low volume fingerboard. Etc." },
                    { n: 2, color: C.orange, text: "Standard session. You climbed hard but didn't go to the death. A run or mountain bike ride counts, too." },
                    { n: 3, color: "#e07a3a", text: "You pushed past tired. Ex: Enduro after bouldering, a big run or hike. A bit sore. (Note: choose this if your climbing session was particularly fingery)." },
                    { n: 4, color: "#c0392b", text: "Big day out. Mega approach, lots of pitches. Huge day in the gym. A killer hike or marathon-type mission. Beat." },
                  ].map(({ n, color, text }) => (
                    <div key={n} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ ...mono, fontSize: 18, fontWeight: 700, color, minWidth: 20, lineHeight: 1.3 }}>{n}</div>
                      <div style={{ fontSize: 13, color: C.white, lineHeight: 1.6 }}>{text}</div>
                    </div>
                  ))}
                </div>
              )}
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
    // Coach override takes precedence over the date-based computation.
    // New shape: { weekIdx, setOnDate } — anchor that self-progresses by week.
    // Legacy shape: plain integer — treated as static.
    const ov = plan?.currentWeekOverride;
    const weeksLen = plan?.weeks?.length ?? 1;
    let overrideWeek = null;
    if (ov != null) {
      if (typeof ov === "object" && typeof ov.weekIdx === "number" && typeof ov.setOnDate === "string") {
        const [ay, am, ad] = ov.setOnDate.split("-").map(Number);
        const anchor = new Date(ay, am - 1, ad);
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const weeksSince = Math.max(0, Math.floor((now - anchor) / (7 * 24 * 60 * 60 * 1000)));
        overrideWeek = Math.min(ov.weekIdx + weeksSince, weeksLen - 1);
      } else if (typeof ov === "number") {
        overrideWeek = Math.min(ov, weeksLen - 1);
      }
    }
    if (overrideWeek != null) {
      // If the override week is published, use it directly.
      // If not, use the highest published week that doesn't exceed it.
      if (publishedIndices.includes(overrideWeek)) return overrideWeek;
      const below = publishedIndices.filter(i => i <= overrideWeek);
      if (below.length > 0) return Math.max(...below);
      return publishedIndices[0];
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

  // Feature flags — declared before any early returns so they're always in scope
  const hasPlan = athlete?.has_plan !== false;
  const hasRecoverBuddy = !!athlete?.has_recoverbuddy;
  const isRecoverBuddy = hasRecoverBuddy;
  const showRecoverBuddyWordmark = hasRecoverBuddy && !hasPlan;

  if ((!plan || publishedIndices.length === 0) && !hasRecoverBuddy) {
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

  // Feature flags declared above the early return — see above.
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
  // Toggles for the "Why?" explanation links on the banner.
  const [showWhyToday, setShowWhyToday] = useState(false);
  const [showWhyTomorrow, setShowWhyTomorrow] = useState(false);
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [tierUpBanner, setTierUpBanner] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [pyramidLogs, setPyramidLogs] = useState([]);
  const [pyramidCycle, setPyramidCycle] = useState(1);
  const [pyramidLoading, setPyramidLoading] = useState(false);
  const [showPyramidLog, setShowPyramidLog] = useState(null); // { grade, slotIndex, existing }
  const [pyramidForm, setPyramidForm] = useState({ date: localDateStr(), notes: "" });
  const [pyramidSaving, setPyramidSaving] = useState(false);
  const [viewingPyramidSlot, setViewingPyramidSlot] = useState(null);
  const [showLoadTooltip, setShowLoadTooltip] = useState(false);
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
  // Athlete-provided average sleep for the past week. Optional. When set,
  // overrides the 7-hour default on days they commit via Log.
  const [catchupSleep, setCatchupSleep] = useState("");
  // "cold_start" when the athlete has zero fatigue_logs rows ever;
  // "regular" when they have a 3+ day unlogged streak ending near today.
  const [catchupKind, setCatchupKind] = useState(null);

  // Survey state — fires once for RecoverBuddy athletes who haven't yet
  // answered the onboarding questions. Detected by checking if any of the
  // survey fields are missing.
  const needsSurvey = hasRecoverBuddy && !athlete?.age && !athlete?.weekly_frequency;
  const needsIntroFirst = hasRecoverBuddy && athlete?.seen_intro === false;
  // Intro fires first; survey fires after intro is dismissed (if needed)
  const [surveyOpen, setSurveyOpen] = useState(needsSurvey && !needsIntroFirst);
  const [surveyAnswers, setSurveyAnswers] = useState({
    age: "",
    peak_grade_v_ever: "N/A", peak_grade_yds_ever: "N/A",
    peak_grade_v_recent: "N/A", peak_grade_yds_recent: "N/A",
    typical_grade_v: "N/A", typical_grade_yds: "N/A",
    weekly_frequency: "",
  });
  const [surveySaving, setSurveySaving] = useState(false);
  // Intro explainer modal. Auto-shows on first login (when has_recoverbuddy
  // is true, survey is done, seen_intro is false). Also reopenable via the
  // "How does RecoverBuddy work?" button on the Welcome card.
  const INTRO_TEXT_1 = "RecoverBuddy uses your sleep and strength logs to issue you a training allowance. As you train throughout the week, you use up that allowance. As you rest, you earn it back.";
  const INTRO_TEXT_2 = "RecoverBuddy will adapt to how you're feeling, suggesting more or less training based on how things are going. In the short term, this means consistent, good sessions. In the long term, this means you'll be able to ramp up to higher volume without rushing into it. Log every day for the best results.";
  const INTRO_TEXT_3 = "Recover, buddy!!";
  const needsIntro = hasRecoverBuddy && athlete?.seen_intro === false;
  const [introOpen, setIntroOpen] = useState(needsIntro);
  const dismissIntro = async () => {
    setIntroOpen(false);
    if (athlete?.seen_intro === false) {
      const { error } = await sb.from("athletes").update({ seen_intro: true }).eq("id", athlete.id);
      if (error) console.warn("[intro] failed to mark seen:", error);
    }
    // Open survey after intro if still needed
    if (needsSurvey) setSurveyOpen(true);
  };

  // Feedback form state (RecoverBuddy only). Permanent on page, no dismiss.
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSaving, setFeedbackSaving] = useState(false);
  const [feedbackJustSent, setFeedbackJustSent] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const submitFeedback = async () => {
    const msg = feedbackText.trim();
    if (!msg) return;
    setFeedbackSaving(true);
    const { error } = await sb.from("feedback").insert({ athlete_id: athlete.id, message: msg });
    setFeedbackSaving(false);
    if (error) { console.warn("[feedback] error:", error); alert("Sorry, that didn't go through. Try again?"); return; }
    setFeedbackText("");
    setFeedbackJustSent(true);
    setTimeout(() => { setFeedbackJustSent(false); setShowFeedback(false); }, 1800);
  };
  const submitSurvey = async () => {
    if (!surveyAnswers.age || !surveyAnswers.weekly_frequency) {
      alert("Please fill in age and training frequency."); return;
    }
    setSurveySaving(true);
    const payload = {
      age: parseInt(surveyAnswers.age),
      peak_grade_v_ever: surveyAnswers.peak_grade_v_ever,
      peak_grade_yds_ever: surveyAnswers.peak_grade_yds_ever,
      peak_grade_v_recent: surveyAnswers.peak_grade_v_recent,
      peak_grade_yds_recent: surveyAnswers.peak_grade_yds_recent,
      typical_grade_v: surveyAnswers.typical_grade_v,
      typical_grade_yds: surveyAnswers.typical_grade_yds,
      weekly_frequency: parseInt(surveyAnswers.weekly_frequency),
    };
    console.log("[survey] submitting for athlete id:", athlete?.id, "payload:", payload);
    const { data, error, status, statusText } = await sb.from("athletes")
      .update(payload).eq("id", athlete.id).select();
    console.log("[survey] response:", { data, error, status, statusText });
    if (error) {
      console.warn("[survey] save error:", error);
      alert("Save failed: " + (error.message || "unknown error"));
      setSurveySaving(false);
      return;
    }
    if (!data || data.length === 0) {
      console.warn("[survey] update returned no rows — athlete id may not match anything in the table");
      alert("Save returned no matching row. Athlete id: " + athlete?.id);
      setSurveySaving(false);
      return;
    }
    console.log("[survey] saved successfully:", data);
    setSurveySaving(false);
    setSurveyOpen(false);
  };

  // Show sleep prompt if today's sleep not yet logged
  useEffect(() => {
    if (!athlete?.id) return;
    const todayStr = localDateStr();
    // Only show sleep prompt for test users (Jasper + Patrick)
    if (!hasRecoverBuddy) return;
    // Ask the DB directly whether ANY row for today has a non-null sleep value.
    // This is robust to duplicate rows for the same athlete+date — without this
    // filter, the prompt could fire on a different device if the most-recently-
    // created row happened to have sleep=null even though another row for the
    // same day already had sleep logged.
    // Skip sleep prompt on first ever login (no logs yet)
    sb.from("fatigue_logs").select("id", { count: "exact", head: true }).eq("athlete_id", athlete.id)
      .then(({ count }) => {
        if ((count ?? 0) === 0) return; // brand new user — skip sleep prompt
        sb.from("fatigue_logs").select("id").eq("athlete_id", athlete.id).eq("date", todayStr).not("sleep", "is", null).limit(1)
          .then(({ data: rows, error }) => {
            if (error) { console.warn("[sleepPrompt] query error:", error); return; }
            if (!rows || rows.length === 0) setShowSleepPrompt(true);
          });
      });
  }, [athlete?.id]);

  // Catch-up prompt detection. Fires once per session (until dismissed or
  // submitted) if the athlete has 3+ consecutive recent unlogged days.
  // Currently gated to the same test users as the sleep prompt.
  useEffect(() => {
    if (!athlete?.id) return;
    if (catchupDismissed) return;
    if (catchupDays) return; // already shown
    if (surveyOpen) return; // wait until survey is dismissed first
    if (introOpen) return;  // wait until intro is dismissed first
    // RecoverBuddy users always see the catch-up prompt. Other athletes
    // are gated to the test allowlist for now.
    if (!hasRecoverBuddy) return;
    const todayStr = localDateStr();
    // First: check if athlete has ANY fatigue_logs rows ever. If not, this is
    // a cold-start athlete and the prompt fires with first-time copy.
    sb.from("fatigue_logs").select("id", { count: "exact", head: true }).eq("athlete_id", athlete.id)
      .then(({ count, error }) => {
        if (error) { console.warn("[catchup] count error:", error); return; }
        const isColdStart = (count ?? 0) === 0;
        if (isColdStart) {
          console.log("[catchup] cold-start athlete: building first-time prompt");
          // Build the 7-day calendar with all days tappable, none logged.
          const [ty, tm, td] = todayStr.split("-").map(Number);
          const dt = new Date(ty, tm - 1, td);
          dt.setDate(dt.getDate() - 1);
          const cal = [];
          for (let i = 0; i < 7; i++) {
            const ds = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
            cal.push({ date: ds, logged: false, load: 0, editable: true, existing: null });
            dt.setDate(dt.getDate() - 1);
          }
          setCatchupKind("cold_start");
          setCatchupDays(cal);
          return;
        }
        // Otherwise: regular catch-up flow. Fetch recent rows to detect streak.
        sb.from("fatigue_logs").select("date,load,sleep,strong,strong_na").eq("athlete_id", athlete.id)
          .gte("date", (() => {
            const [y, m, d] = todayStr.split("-").map(Number);
            const dt2 = new Date(y, m - 1, d); dt2.setDate(dt2.getDate() - 14);
            return `${dt2.getFullYear()}-${String(dt2.getMonth() + 1).padStart(2, "0")}-${String(dt2.getDate()).padStart(2, "0")}`;
          })())
          .then(({ data, error: e2 }) => {
            if (e2) { console.warn("[catchup] query error:", e2); return; }
            const logged = new Set((data || []).map(r => r.date));
            const byDate = {};
            (data || []).forEach(r => { byDate[r.date] = r; });
            const [ty, tm, td] = todayStr.split("-").map(Number);
            // Count ANY unlogged days in the last 7 days (not just a consecutive streak
            // ending at yesterday — this catches gaps buried behind a logged day)
            let anyUnlogged = 0;
            const dt = new Date(ty, tm - 1, td);
            dt.setDate(dt.getDate() - 1); // start at yesterday
            for (let i = 0; i < 7; i++) {
              const ds = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
              if (!logged.has(ds)) anyUnlogged++;
              dt.setDate(dt.getDate() - 1);
            }
            console.log("[catchup] unlogged days in last 7:", anyUnlogged);
            if (anyUnlogged < 1) return;
            const cal = [];
            const dt2 = new Date(ty, tm - 1, td);
            dt2.setDate(dt2.getDate() - 1);
            for (let i = 0; i < 7; i++) {
              const ds = `${dt2.getFullYear()}-${String(dt2.getMonth() + 1).padStart(2, "0")}-${String(dt2.getDate()).padStart(2, "0")}`;
              const existing = byDate[ds] || null;
              cal.push({
                date: ds,
                logged: !!existing,
                load: existing ? (existing.load ?? 0) : 0,
                editable: !existing,
                existing,
              });
              dt2.setDate(dt2.getDate() - 1);
            }
            setCatchupKind("regular");
            setCatchupDays(cal);
          });
      });
  }, [athlete?.id, catchupDismissed, catchupDays, surveyOpen, introOpen]);

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
    const sleepVal = parseFloat(catchupSleep);
    // For regular catch-up, default to athlete's real 7-day avg sleep
    // rather than asking — they've already been logging
    const realAvgSleep = (() => {
      const real = fatigueLogs.filter(l => l.sleep != null && l.sleep > 0).slice(0, 7);
      return real.length > 0 ? real.reduce((s, l) => s + l.sleep, 0) / real.length : 7;
    })();
    const sleepHours = catchupKind === "regular"
      ? Math.round(realAvgSleep * 2) / 2  // round to nearest 0.5
      : (!isNaN(sleepVal) && sleepVal > 0 && sleepVal <= 14) ? sleepVal : 7;
    // Commit ALL editable days — including Rest (load=0). Untapped means
    // "confirmed rest day," not "skip writing a row." Cleaner data model
    // and prevents the catch-up prompt from re-firing for the same days.
    const rows = catchupDays
      .filter(d => d.editable)
      .map(d => ({ athlete_id: athlete.id, date: d.date, sleep: sleepHours, load: d.load, strong: null, strong_na: true }));
    if (rows.length > 0) {
      const { error } = await sb.from("fatigue_logs").upsert(rows, { onConflict: "athlete_id,date" });
      if (error) console.warn("[catchup] upsert error:", error);
    }
    // Save self-reported avg sleep to athlete profile
    if (!isNaN(sleepVal) && sleepVal > 0 && sleepVal <= 14) {
      await sb.from("athletes").update({ avg_sleep_reported: sleepVal }).eq("id", athlete.id);
    }
    setCatchupSaving(false);
    setCatchupDays(null);
    setCatchupKind(null);
    setCatchupDismissed(true);
    await recomputeFatigue();
  };

  const dismissCatchup = () => {
    setCatchupDays(null);
    setCatchupKind(null);
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
    // Pre-populate partialDayLog with the saved sleep value.
    // Run recomputeFatigue first, then set partialDayLog so it isn't cleared.
    const todayStrAfter = localDateStr();
    await recomputeFatigue();
    const { data: savedRow } = await sb.from("fatigue_logs").select("*").eq("athlete_id", athlete.id).eq("date", todayStrAfter).order("created_at", { ascending: false }).limit(1);
    if (savedRow?.[0]) {
      setPartialDayLog({ ...savedRow[0], sleep: val });
    } else {
      setPartialDayLog({ date: todayStrAfter, sleep: val });
    }
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
    // allLogs14: real logs only (no synthetic) from last 14 days, for fiveStrongDays.
    const allLogs14 = logs.filter(l => {
      const [ly, lm, ld] = l.date.split("-").map(Number);
      const [ty2, tm2, td2] = todayStr.split("-").map(Number);
      const logDate = new Date(ly, lm - 1, ld);
      const todayDate = new Date(ty2, tm2 - 1, td2);
      const diff = (todayDate - logDate) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff < 14;
    });
    const computeRec = (windowLogs) => {
      if (windowLogs.length < 3) return null;
      const REST = { label: "Rest", color: "#c0392b", bg: "rgba(192,57,43,0.08)" };
      const LIGHT = { label: "Train Light", color: C.orange, bg: "rgba(224,122,58,0.08)" };
      const LIGHT_OR_REST = { label: "Train Light or Rest", color: C.orange, bg: "rgba(224,122,58,0.08)" };
      const TRAIN = { label: "Train", color: "#3d9e7a", bg: "rgba(61,158,122,0.08)" };

      // windowLogs[0] is TODAY (synthetic rest until logged) — it contributes
      // nothing to load while unlogged. "Prior" days (yesterday onward) start
      // at index 1. Override checks that used to read index 0 now read index 1.
      const prior = windowLogs.slice(1);   // yesterday, day-before, ...

      // Load >= 3 yesterday → hard Rest.
      if ((prior[0]?.load ?? 0) >= 3) return REST;

      // Cumulative load >= 4 across consecutive non-rest days walking back
      // from yesterday → hard Rest. A rest day (load 0) breaks the streak.
      // Replaces the old "three consecutive load=1" rule. Examples:
      //   [2,2,...]   -> 4 -> Rest
      //   [1,1,2,...] -> 4 -> Rest
      //   [1,1,1,...] -> 3 -> no fire (from this rule)
      //   [2,0,2,...] -> hits rest at day 2, sum 2 -> no fire
      let cumLoad = 0;
      for (let i = 0; i < prior.length; i++) {
        const ld = prior[i]?.load ?? 0;
        if (ld === 0) break;          // rest day interrupts the streak
        cumLoad += ld;
        if (cumLoad >= 4) break;
      }
      const overCumLoad = cumLoad >= 4;

      const recent7 = windowLogs.slice(0, 7);
      const last3 = windowLogs.slice(0, 3);
      const avgSleep = recent7.reduce((s,l) => s+(l.sleep||0),0)/recent7.length;
      const weekLoad = recent7.reduce((s,l) => s+(l.load||0),0);

      const strongLogs = last3.filter(l => l.strong != null);
      const hasEnoughStrong = strongLogs.length >= 2;
      const avgStrong = hasEnoughStrong ? strongLogs.reduce((s,l)=>s+l.strong,0)/strongLogs.length : null;

      // Most-recent numeric strong rating (on a training day). If it's 0:
      //   - last night sleep < 8h → Rest
      //   - last night sleep >= 8h → Train Light
      // Two consecutive training-day strong=0 → Rest regardless of sleep.
      // Recency guard: strong=0 only fires if the most recent training day
      // is within 2 positions of yesterday (at most 1 rest day since last session).
      const recentEnoughTraining = (() => {
        for (let i = 0; i < Math.min(2, prior.length); i++) {
          if ((prior[i]?.load ?? 0) > 0 && prior[i]?.strong != null) return prior[i];
        }
        return null;
      })();
      const mostRecentStrong = recentEnoughTraining ? recentEnoughTraining.strong : null;
      const recentStrongZero = mostRecentStrong === 0;
      const priorTraining = prior.filter(l => (l.load ?? 0) > 0 && l.strong != null);
      const twoConsecStrongZero = priorTraining.length >= 2 && priorTraining[0].strong === 0 && priorTraining[1].strong === 0;

      // fiveStrongDays: 5 most-recent TRAINING day (load>0) strong ratings all = 2,
      // within last 14 calendar days. Rest days are skipped when counting.
      const allLogs14Training = allLogs14.filter(l => (l.load ?? 0) > 0 && l.strong != null);
      const fiveStrongTrainingRatings = allLogs14Training.slice(0, 5).map(l => l.strong);
      const fiveStrongDays = fiveStrongTrainingRatings.length === 5 && fiveStrongTrainingRatings.every(s => s === 2);
      // Legacy alias used by redCount and combo keys below
      const fourStrongDays = fiveStrongDays;

      // Two most-recent numeric ratings both = 2 (for the sleep-softened path).
      const recentStrongRatings = recent7.filter(l => l.strong != null).slice(0, 5).map(l => l.strong);
      const twoStrongTwos = recentStrongRatings.length >= 2 && recentStrongRatings[0] === 2 && recentStrongRatings[1] === 2;

      const capacity = avgSleep * volumeCoeff;
      const overLoadCap = weekLoad > capacity;
      const lowSleep = avgSleep < 6.5;
      const lowStrong = avgStrong !== null && avgStrong < 1.0;
      const redCount = [fourStrongDays, lowSleep, lowStrong].filter(Boolean).length;

      // lastNightSleep: sleep logged TODAY (this morning) takes priority over
      // yesterday's row, since the sleep prompt saves to today's date.
      const lastNightSleep = (windowLogs[0]?.sleep != null && !windowLogs[0]?._synthetic)
        ? windowLogs[0].sleep
        : prior[0]?.sleep ?? null;
      const sleptUnder6 = lastNightSleep !== null && lastNightSleep < 6;

      // Two adjacent load>=2 days (yesterday + day-before). Normally Rest, but
      // softened to "Train Light or Rest" when the athlete is well-slept and
      // has been feeling strong: 7-day avg sleep > 8h AND last night >= 8h AND
      // the two most-recent strong ratings are both 2.
      const priorLoads = prior.slice(0, 2).map(l => l.load ?? 0);
      const twoAdjacentHard = priorLoads.length === 2 && priorLoads[0] >= 2 && priorLoads[1] >= 2;
      const wellSlept = avgSleep > 8 && (lastNightSleep !== null && lastNightSleep >= 8);

      // Determine reasonKey for plain-English explanation lookup.
      const tag = (rec, key) => ({ ...rec, reasonKey: key });
      // ── Decision order ──────────────────────────────────────────────────
      if (sleptUnder6) return tag(REST, "sleptUnder6");
      // fiveStrongDays: force Rest + flag for tier-up
      if (fiveStrongDays) return tag({ ...REST, tierUp: true }, "fiveStrongDays");
      // strong=0: Rest if sleep < 8h, Train Light if sleep >= 8h, unless two in a row
      if (twoConsecStrongZero) return tag(REST, "recentStrongZero");
      if (recentStrongZero) {
        if (lastNightSleep !== null && lastNightSleep >= 8) return tag(LIGHT, "recentStrongZero");
        return tag(REST, "recentStrongZero");
      }
      if (overCumLoad) return tag(REST, "overCumLoad");
      if (twoAdjacentHard) {
        if (wellSlept && twoStrongTwos) return tag(LIGHT_OR_REST, "twoAdjacentHardSoftened");
        return tag(REST, "twoAdjacentHard");
      }
      if (overLoadCap) return tag(REST, "overLoadCap");
      if (redCount >= 2) {
        // Two or three reds — pick the specific combo key.
        if (lowSleep && lowStrong && fourStrongDays) return tag(REST, "reds_all_three");
        if (lowSleep && lowStrong) return tag(REST, "reds_lowSleep_lowStrong");
        if (lowSleep && fourStrongDays) return tag(REST, "reds_lowSleep_fourStrongDays");
        if (lowStrong && fourStrongDays) return tag(REST, "reds_lowStrong_fourStrongDays");
        return tag(REST, "reds_lowSleep_lowStrong"); // fallback
      }
      if (redCount >= 1) {
        if (lowSleep) return tag(LIGHT, "lowSleep_only");
        if (lowStrong) return tag(LIGHT, "lowStrong_only");
        if (fourStrongDays) return tag(LIGHT, "fourStrongDays_only");
        return tag(LIGHT, "lowSleep_only"); // fallback
      }
      return tag(TRAIN, "none");
    };

    // Today's rec is computed against the 7 calendar days ENDING YESTERDAY.
    // (Today is excluded so logging today doesn't shift today's rec.)
    const yesterday = (() => {
      const [y, m, d] = todayStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      dt.setDate(dt.getDate() - 1);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    })();
    // Window anchors on TODAY (today at index 0, synthetic-rest until logged).
    // This rolls the same weekday from a week ago off the back of the window.
    const todayWindow = buildCalendarWindow(logs, todayStr, 7);
    const todayRec = computeRec(todayWindow);
    if (!todayRec) { setFatigueRec(null); return; }

    // ── Auto tier-up on fiveStrongDays ─────────────────────────────────────
    if (todayRec.tierUp && athlete?.id) {
      const currentTierId = athlete.volume_tier || DEFAULT_VOLUME_TIER;
      const currentIdx = VOLUME_TIERS.findIndex(t => t.id === currentTierId);
      if (currentIdx >= 0 && currentIdx < VOLUME_TIERS.length - 1) {
        const newTierId = VOLUME_TIERS[currentIdx + 1].id;
        // Only fire once: check if we already bumped for this exact streak.
        // Guard: the most recent 5 training logs must still all be strong=2
        // and the athlete's stored tier must still be the old tier.
        // Guard: only bump if the athlete is still at the current tier
        const alreadyBumped = athlete.volume_tier !== currentTierId;
        if (!alreadyBumped) {
          console.log("[autoTierUp] bumping from", currentTierId, "to", newTierId);
          await sb.from("athletes").update({ volume_tier: newTierId }).eq("id", athlete.id);
          setTierUpBanner(true);
        }
      }
    }

    // Tomorrow's rec is computed against 7 calendar days ENDING TODAY.
    // Normally only meaningful once today is fully logged — but the forecast
    // intervention below can override this to show "Rest" even when today
    // isn't logged yet.
    const todayLogged = logs.some(l => l.date === todayStr && l.load != null && l.sleep != null && (l.strong != null || l.strong_na === true));
    const tomorrowStr = (() => {
      const [yy, mm, dd] = todayStr.split("-").map(Number);
      const dt = new Date(yy, mm - 1, dd); dt.setDate(dt.getDate() + 1);
      return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    })();
    const tomorrowWindow = buildCalendarWindow(logs, tomorrowStr, 7);
    const tomorrowRec = todayLogged ? computeRec(tomorrowWindow) : null;
    let tomorrow = tomorrowRec ? { label: tomorrowRec.label, color: tomorrowRec.color, reasonKey: tomorrowRec.reasonKey } : null;

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
          // Three Train Light recs forecast: today's rec stays Train Light
          // but is relabeled to "Train Light or Rest" so the athlete knows
          // taking rest today is a valid alternative. Tomorrow is overridden
          // to Rest to plan the recovery.
          todayRec.label = "Train Light or Rest";
          tomorrow = { label: "Rest", color: "#c0392b" };
          console.log("[recomputeFatigue] forecast intervention: relabeling today → Train Light or Rest, tomorrow → Rest");
        }
      }
    }

    // If today is fully logged, swap today's banner from a recommendation
    // to a past-tense status reflecting what the athlete actually did.
    // Neutral white color — informational, not prescriptive.
    let displayLabel = todayRec.label;
    let displayColor = todayRec.color;
    let displayBg = todayRec.bg;
    if (todayLogged) {
      const todayLog = logs.find(l => l.date === todayStr);
      const l = todayLog?.load ?? 0;
      const pastTense = l === 0 ? "Rested" : l === 1 ? "Trained Light" : "Trained";
      displayLabel = pastTense;
      displayColor = C.white;
      displayBg = C.gray;
    }

    // Dashboard stats — rolling 7-day window ending today (so today's data
    // is included once it's logged). Uses the same calendar-window logic as
    // the rec computation so synthetic rest fills unlogged gaps.
    const dashWindow = buildCalendarWindow(logs, todayStr, 7);
    const dashSleep = dashWindow.reduce((s, l) => s + (l.sleep || 0), 0) / dashWindow.length;
    const dashLoad = dashWindow.reduce((s, l) => s + (l.load || 0), 0);
    const dashStrongRatings = dashWindow.filter(l => l.strong != null).map(l => l.strong);
    let dashStrongLabel = "—";
    if (dashStrongRatings.length > 0) {
      const avg = dashStrongRatings.reduce((s, v) => s + v, 0) / dashStrongRatings.length;
      if (avg < 1) dashStrongLabel = "Fatigued";
      else if (avg === 1) dashStrongLabel = "Normal";
      else if (avg < 2) dashStrongLabel = "Pretty Good";
      else dashStrongLabel = "Great";
    }
    const dashCapacity = dashSleep * volumeCoeff;
    const dashLoadPct = dashCapacity > 0 ? Math.round((dashLoad / dashCapacity) * 100) : 0;
    const dashboard = {
      sleep: dashSleep,
      load: dashLoad,
      loadPct: dashLoadPct,
      strongLabel: dashStrongLabel,
    };

    console.log("[recomputeFatigue] today:", todayRec.label, "display:", displayLabel, "tomorrow:", tomorrow?.label, "todayLogged:", todayLogged, "coeff:", volumeCoeff);
    setFatigueRec({ label: displayLabel, color: displayColor, bg: displayBg, tomorrow, todayLogged, dashboard, reasonKey: todayRec.reasonKey, tomorrowReasonKey: tomorrowRec?.reasonKey });
  }, [athlete?.id, athlete?.volume_tier, athlete?.typical_grade_v]);

  useEffect(() => {
    if (hasRecoverBuddy) recomputeFatigue();
  }, [recomputeFatigue, hasRecoverBuddy]);

  // Fetch pyramid logs
  useEffect(() => {
    if (!athlete?.is_dev || !athlete?.id) return;
    setPyramidLoading(true);
    sb.from("pyramid_logs").select("*").eq("athlete_id", athlete.id)
      .order("pyramid_cycle", { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.warn("[pyramid] fetch error:", error); setPyramidLoading(false); return; }
        const allLogs = data || [];
        // Find current cycle (highest)
        const maxCycle = allLogs.length > 0 ? Math.max(...allLogs.map(l => l.pyramid_cycle)) : 1;
        const cycleLogs = allLogs.filter(l => l.pyramid_cycle === maxCycle);
        setPyramidCycle(maxCycle);
        setPyramidLogs(cycleLogs);
        setPyramidLoading(false);
      });
  }, [athlete?.id, athlete?.is_dev]);


  return (
    <div style={{ minHeight: "100vh", background: C.black, display: "flex", flexDirection: "column" }}>
      <div style={{ background: C.gray, borderBottom: `1px solid ${C.border}`, padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ ...bebas, fontSize: 20, letterSpacing: 2 }}>
          {showRecoverBuddyWordmark
            ? <>🌙 RECOVER<span style={{ color: C.orange }}>BUDDY</span></>
            : <>ROCK POINT <span style={{ color: C.orange }}>COACHING</span></>}
        </div>
        <button onClick={onLogout} style={{ ...mono, fontSize: 10, padding: "6px 12px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>Log out</button>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${C.orange}, ${C.purple}, transparent)`, flexShrink: 0 }} />

      {/* Volume Element modal */}
      {hasRecoverBuddy && showVolumeModal && ReactDOM.createPortal(
        <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex", flexDirection: "column", justifyContent: "flex-end" }} onClick={() => setShowVolumeModal(false)}>
          <div style={{ background: C.black, borderRadius: "16px 16px 0 0", maxHeight: "92vh", display: "flex", flexDirection: "column", border: `1px solid ${C.border}`, maxWidth: 680, width: "100%", margin: "0 auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "4px 20px 12px" }}>
              <button onClick={() => setShowVolumeModal(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", WebkitOverflowScrolling: "touch" }}>
              <FatigueLog athlete={athlete} isCoach={false} forcedView={volumeModalTab} autoOpenLog={partialDayLog} onSaved={(savedRow) => { setPartialDayLog(null); recomputeFatigue(savedRow); }} />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sleep prompt modal */}
      {introOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 860, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, width: "100%", maxWidth: 460 }}>
            <div style={{ ...bebas, fontSize: 32, letterSpacing: 1, marginBottom: 14 }}>Welcome to <span style={{ color: C.orange }}>RecoverBuddy</span></div>
            <div style={{ fontSize: 14, color: C.white, lineHeight: 1.65, marginBottom: 22 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.white, lineHeight: 1.6, marginBottom: 20 }}>
                RecoverBuddy is a climbing log that tells you whether to train or rest today. It also makes a recommendation for tomorrow, and for the next 7 days to get your training load just right.
              </div>
              <div style={{ marginBottom: 20 }}>{INTRO_TEXT_1}</div>
              <div style={{ marginBottom: 20 }}>{INTRO_TEXT_2}</div>
              <div style={{ fontStyle: "italic" }}>{INTRO_TEXT_3}</div>
            </div>
            <button onClick={dismissIntro}
              style={{ width: "100%", ...mono, fontSize: 12, padding: "14px", borderRadius: 8, border: "none", background: C.orange, color: "#fff", cursor: "pointer", fontWeight: 600 }}>
              Got it
            </button>
          </div>
        </div>
      )}

      {surveyOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 850, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, overflowY: "auto" }}>
          <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, width: "100%", maxWidth: 460, marginTop: 40, marginBottom: 40 }}>
            <div style={{ ...bebas, fontSize: 32, letterSpacing: 1, marginBottom: 8 }}>A few quick questions</div>
            <div style={{ fontSize: 16, color: C.muted, marginBottom: 24, lineHeight: 1.5 }}>
              So we can start making good recommendations.
            </div>
            {/* Age */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...mono, fontSize: 16, color: C.white, fontWeight: 500, marginBottom: 6 }}>AGE</div>
              <input type="number" min="10" max="90" value={surveyAnswers.age} onChange={e => setSurveyAnswers(p => ({ ...p, age: e.target.value }))}
                placeholder="34"
                style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none" }} />
            </div>
            {/* All-time hardest send — V scale only */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...mono, fontSize: 16, color: C.white, fontWeight: 500, marginBottom: 6 }}>ALL-TIME HARDEST SEND</div>
              <select value={surveyAnswers.peak_grade_v_ever} onChange={e => setSurveyAnswers(p => ({ ...p, peak_grade_v_ever: e.target.value }))}
                style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                {V_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            {/* Typical day — V scale only */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...mono, fontSize: 16, color: C.white, fontWeight: 500, marginBottom: 3 }}>ON AN AVERAGE DAY, YOU CAN SEND</div>
              <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic", marginBottom: 6, lineHeight: 1.5 }}>Be realistic, there's no one to impress here :)</div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 3 }}>Boulder (V scale)</div>
                  <select value={surveyAnswers.typical_grade_v} onChange={e => setSurveyAnswers(p => ({ ...p, typical_grade_v: e.target.value }))}
                    style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                    {V_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

              </div>
            </div>
            {/* Frequency */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ ...mono, fontSize: 16, color: C.white, fontWeight: 500, marginBottom: 6 }}>HOW MANY TIMES PER WEEK DO YOU TRAIN?</div>
              <select value={surveyAnswers.weekly_frequency} onChange={e => setSurveyAnswers(p => ({ ...p, weekly_frequency: e.target.value }))}
                style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none" }}>
                <option value="">Choose...</option>
                {FREQ_OPTIONS.map(n => <option key={n} value={n}>{n}x per week</option>)}
              </select>
            </div>
            <button onClick={submitSurvey} disabled={surveySaving}
              style={{ width: "100%", ...mono, fontSize: 12, padding: "14px", borderRadius: 8, border: "none", background: C.orange, color: "#fff", cursor: surveySaving ? "default" : "pointer", fontWeight: 600 }}>
              {surveySaving ? "Saving..." : "Continue"}
            </button>
          </div>
        </div>
      )}

      {catchupDays && !showSleepPrompt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, width: "100%", maxWidth: 420 }}>
            <div style={{ ...bebas, fontSize: 22, letterSpacing: 1, marginBottom: 6 }}>
              {catchupKind === "regular" ? "We noticed you missed a couple days recently." : "Welcome!"}
            </div>
            <div style={{ fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>
              {catchupKind === "regular"
                ? "Tap those days below to log so we can make the right recommendation."
                : "Help us log (approximately) what you did the last 7 days. Doesn't have to be perfect, just do your best."}
            </div>
            <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Last 7 days</div>
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
            <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
              Tap to cycle: 🛌 Rest → 🚂 Train → 🚂 Light. Grayed-out days are already logged.
            </div>
            {catchupKind !== "regular" && (
              <div style={{ marginBottom: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, color: C.white, fontWeight: 500, marginBottom: 4, lineHeight: 1.4 }}>On average, how many hours of sleep do you get a night?</div>
                <div style={{ fontSize: 11, color: C.muted, fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>Be realistic, no judgment here.</div>
                <input type="number" step="0.5" min="0" max="14" value={catchupSleep}
                  onChange={e => setCatchupSleep(e.target.value)}
                  placeholder="e.g. 7.5"
                  style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={dismissCatchup}
                style={{ flex: 1, ...mono, fontSize: 11, padding: "12px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>
                Skip for now
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
              style={{ width: "100%", ...mono, fontSize: 12, padding: "14px", borderRadius: 8, border: "none", background: sleepPromptValue ? C.orange : C.border, color: "#fff", cursor: sleepPromptValue ? "pointer" : "default", marginBottom: 10 }}>
              {sleepPromptSaving ? "Saving..." : "Log Sleep"}
            </button>
            <button onClick={() => setShowSleepPrompt(false)}
              style={{ width: "100%", ...mono, fontSize: 11, padding: "10px", borderRadius: 8, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>
              Skip for now
            </button>
          </div>
        </div>
      )}

      <>
      <div style={{ flex: 1, padding: "20px 16px", maxWidth: 640, margin: "0 auto", width: "100%" }}>
        {/* All RecoverBuddy UI — gated on hasRecoverBuddy */}
        {hasRecoverBuddy && <>
        {/* Tier-up dismissable banner */}
        {tierUpBanner && (
          <div style={{ background: "rgba(61,158,122,0.1)", border: `1px solid ${C.orange}`, borderRadius: 10, padding: "14px 16px", marginBottom: 16, display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{ flex: 1, fontSize: 13, color: C.white, lineHeight: 1.55 }}>
              Heads up, you've been having consistently strong sessions at your current volume, so we'll start recommending more training sessions.
            </div>
            <button onClick={() => setTierUpBanner(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", lineHeight: 1, flexShrink: 0 }}>✕</button>
          </div>
        )}

        {/* Date + recommendation banner */}
        {(() => {
          const now = new Date();
          const dateLabel = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
          // Compute recommendation from progress/fatigue data if available
          const fLogs = fatigueRec;
          if (!fLogs) return (
            <div onClick={() => setShowVolumeModal(true)} style={{ marginBottom: 16, background: C.gray, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", cursor: "pointer" }}>
              <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 6 }}>{dateLabel}</div>
            </div>
          );
          const { label, color, bg } = fLogs;
          const isLightLabel = label === "Train Light" || label === "Train Light or Rest";
          const subtitle = isLightLabel ? "Pick just 2 exercises to complete, not a full day." : null;
          const todayReason = fLogs.reasonKey && !fLogs.todayLogged ? REASON_TEXT[fLogs.reasonKey] : null;
          const tomorrowReason = fLogs.tomorrow?.reasonKey ? REASON_TEXT[fLogs.tomorrow.reasonKey] : null;
          const recIcon = (lbl) => (lbl === "Rest" || lbl === "Rested") ? "🛌" : "🚂";
          return (
            <div onClick={() => setShowVolumeModal(true)} style={{ background: bg, border: `1px solid ${color}`, borderRadius: 10, padding: "14px 16px", marginBottom: 16, cursor: "pointer" }}>
              {/* Title row: date + recommendation */}
              <div style={{ ...bebas, fontSize: 22, color, letterSpacing: 1, marginBottom: 4 }}>
                {dateLabel}: {recIcon(label)} {label}
              </div>
              {/* Subtitle for Train Light variants */}
              {isLightLabel && (
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>
                  "Train Light" means pick two exercises to complete, rather than a whole day of training. You can finish the day another time.
                </div>
              )}
              {/* Why? toggle for today's rec */}
              {todayReason && (
                <div style={{ marginBottom: 10 }}>
                  <button onClick={e => { e.stopPropagation(); setShowWhyToday(v => !v); }}
                    style={{ ...mono, fontSize: 11, padding: "4px 10px", background: "none", border: `1px solid ${color}55`, borderRadius: 4, color, cursor: "pointer" }}>
                    {showWhyToday ? "Hide" : "Why?"}
                  </button>
                  {showWhyToday && (
                    <div style={{ marginTop: 8, fontSize: 13, color: C.white, lineHeight: 1.55, padding: "10px 12px", background: `${color}10`, borderRadius: 6, borderLeft: `2px solid ${color}` }}>
                      {todayReason}
                    </div>
                  )}
                </div>
              )}
              {/* Divider */}
              <div style={{ borderTop: `1px solid ${color}22`, paddingTop: 10, marginTop: isLightLabel ? 0 : 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <div style={{ ...mono, fontSize: 12, color: C.muted, fontWeight: 600 }}>Tomorrow:</div>
                  {fLogs.tomorrow
                    ? <>
                        <div style={{ fontSize: 15, color: fLogs.tomorrow.color, fontWeight: 700 }}>{recIcon(fLogs.tomorrow.label)} {fLogs.tomorrow.label}</div>
                        {tomorrowReason && (
                          <button onClick={e => { e.stopPropagation(); setShowWhyTomorrow(v => !v); }}
                            style={{ ...mono, fontSize: 11, padding: "4px 12px", background: "none", border: `1px solid ${fLogs.tomorrow.color}55`, borderRadius: 4, color: fLogs.tomorrow.color, cursor: "pointer" }}>
                            {showWhyTomorrow ? "Hide" : "Why?"}
                          </button>
                        )}
                        <div style={{ ...mono, fontSize: 10, color: C.muted, width: "100%" }}>May change based on tonight's sleep</div>
                      </>
                    : <div style={{ fontSize: 13, color: C.muted }}>TBD — log today first</div>
                  }
                </div>
                {tomorrowReason && showWhyTomorrow && (
                  <div style={{ marginBottom: 10, fontSize: 13, color: C.white, lineHeight: 1.55, padding: "10px 12px", background: `${fLogs.tomorrow.color}10`, borderRadius: 6, borderLeft: `2px solid ${fLogs.tomorrow.color}` }}>
                    {tomorrowReason}
                  </div>
                )}

                {/* 7-day stat dashboard */}
                {fLogs.dashboard && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, paddingTop: 10, borderTop: `1px solid ${color}22` }}>
                    <div>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Sleep</div>
                      <div style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{fLogs.dashboard.sleep.toFixed(1)}h</div>
                    </div>
                    <div style={{ position: "relative", gridColumn: "1 / -1" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Training Load</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <div style={{ ...mono, fontSize: 11, color: C.white, fontWeight: 600 }}>{fLogs.dashboard.loadPct}%</div>
                          <button onClick={e => { e.stopPropagation(); setShowLoadTooltip(v => !v); }}
                            style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 11, lineHeight: 1, padding: 0 }}>ⓘ</button>
                        </div>
                      </div>
                      {/* Segmented bar */}
                      {(() => {
                        const pct = fLogs.dashboard.loadPct;
                        // Bar is 120 units wide: 0-60 = blue (50%), 60-100 = green (33%), 100-120 = red (17%)
                        // Marker position maps pct → bar position
                        const markerPos = pct <= 60
                          ? (pct / 60) * 50        // 0-60% → 0-50% of bar
                          : pct <= 100
                          ? 50 + ((pct - 60) / 40) * 33   // 60-100% → 50-83% of bar
                          : Math.min(50 + 33 + ((pct - 100) / 40) * 17, 99); // 100%+ → 83-100%
                        return (
                          <div>
                            <div style={{ position: "relative", height: 10, borderRadius: 5, overflow: "hidden", display: "flex" }}>
                              <div style={{ width: "50%", background: "#3b6cb7" }} />
                              <div style={{ width: "33%", background: "#2aaa5e" }} />
                              <div style={{ width: "17%", background: "#c0392b" }} />
                              {/* Marker */}
                              <div style={{ position: "absolute", left: `${markerPos}%`, top: -2, width: 3, height: 14, background: C.white, borderRadius: 2, transform: "translateX(-50%)", boxShadow: "0 0 4px rgba(0,0,0,0.5)" }} />
                              <div style={{ position: "absolute", left: `${markerPos}%`, top: 14, transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderBottom: `6px solid ${C.white}` }} />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                              <div style={{ ...mono, fontSize: 8, color: "#3b6cb7", width: "50%" }}>Undertrained</div>
                              <div style={{ ...mono, fontSize: 8, color: "#2aaa5e", width: "33%", textAlign: "center" }}>Optimal</div>
                              <div style={{ ...mono, fontSize: 8, color: "#c0392b", width: "17%", textAlign: "right" }}>Overtrained</div>
                            </div>
                          </div>
                        );
                      })()}
                      {showLoadTooltip && (
                        <div onClick={e => e.stopPropagation()} style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, width: 260, background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 12px", zIndex: 100, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
                          <div style={{ fontSize: 12, color: C.white, lineHeight: 1.6 }}>Your weekly training load over the last 7 days. Aim for the green zone. Training and/or poor sleep increase it, resting and good sleep decrease it.</div>
                          <button onClick={() => setShowLoadTooltip(false)} style={{ ...mono, fontSize: 10, color: C.muted, background: "none", border: "none", cursor: "pointer", marginTop: 6, padding: 0 }}>Dismiss</button>
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>Strength</div>
                      <div style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{fLogs.dashboard.strongLabel}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* 7-day forecast — only render once fatigueRec is available so today's assumed load is correct */}
        {fatigueLogs.length > 0 && fatigueRec && (() => {
          // All-time avg sleep from real logs
          const realLogs = fatigueLogs.filter(l => l.sleep != null && l.sleep > 0);
          const allTimeAvgSleep = realLogs.length > 0
            ? realLogs.reduce((s, l) => s + l.sleep, 0) / realLogs.length
            : 7;
          const volCoeff = getVolumeMultiplier(athlete);
          const cap = allTimeAvgSleep * volCoeff;

          // Seed window: last 6 real days (today at index 0 as synthetic-rest,
          // prior 6 days from actual logs via buildCalendarWindow).
          // We re-implement a lightweight version here since buildCalendarWindow
          // is only available inside recomputeFatigue's closure.
          const todayStr2 = localDateStr();
          const buildWindow = (allLogs, anchorDate, nDays) => {
            const byDate = {};
            allLogs.forEach(l => { byDate[l.date] = l; });
            const out = [];
            const [ay, am, ad] = anchorDate.split("-").map(Number);
            const anchor = new Date(ay, am - 1, ad);
            for (let i = 0; i < nDays; i++) {
              const d = new Date(anchor); d.setDate(d.getDate() - i);
              const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
              out.push(byDate[ds] || { date: ds, sleep: allTimeAvgSleep, load: 0, strong: null, strong_na: true, _synthetic: true });
            }
            return out;
          };

          // Lightweight overLoadCap check using strict >
          const forecastOverCap = (window7) => {
            const wl = window7.reduce((s, l) => s + (l.load || 0), 0);
            return wl > cap;
          };
          const forecastCumLoad = (prior) => {
            let cl = 0;
            for (let i = 0; i < prior.length; i++) {
              const ld = prior[i]?.load ?? 0;
              if (ld === 0) break;
              cl += ld;
              if (cl >= 4) break;
            }
            return cl;
          };

          // Simulate 7 days starting today
          // historicalLogs: real past logs feeding the initial window
          const simHistory = [...fatigueLogs]; // real logs, newest-first
          const forecastDays = [];

          for (let offset = 0; offset < 7; offset++) {
            const [ty2, tm2, td2] = todayStr2.split("-").map(Number);
            const dt = new Date(ty2, tm2 - 1, td2); dt.setDate(dt.getDate() + offset);
            const dateStr = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
            const dayOfWeek = dt.toLocaleDateString("en-US", { weekday: "short" });

            // Build a combined log array: simulated days so far + real history
            // For offset > 0, forecastDays already has today's actual/assumed load
            // so prior days correctly see today's training when computing tomorrow's window.
            const combinedLogs = [...forecastDays.map(fd => ({
              date: fd.date, sleep: allTimeAvgSleep, load: fd.load, strong: fd.load > 0 ? 1 : null, strong_na: fd.load === 0
            })).reverse(), ...simHistory];

            // Window for this day: today=index0, prior days from combined
            const window7 = buildWindow(combinedLogs, dateStr, 7);
            // For rec purposes: if offset=0, treat as synthetic-rest (we haven't logged yet).
            // For offset>0, use the actual simulated load from forecastDays (which includes
            // today's assumed load), so tomorrow correctly sees today's training.
            const recWindow = offset === 0
              ? [{ ...window7[0], load: 0, strong: null, strong_na: true }, ...window7.slice(1)]
              : window7;
            const prior7 = recWindow.slice(1);

            // For today (offset=0):
            //   - Already logged → use actual load
            //   - Not logged → assume the athlete follows today's rec
            const actualTodayLog = offset === 0 ? simHistory.find(l => l.date === dateStr && l.load != null) : null;

            // Infer assumed load from fatigueRec when not yet logged
            const todayRecLabel = fatigueRec?.label;
            const assumedTodayLoad = offset === 0 && !actualTodayLog
              ? (todayRecLabel === "Train" ? 2 : todayRecLabel === "Train Light" || todayRecLabel === "Train Light or Rest" ? 1 : 0)
              : null;

            // Try load=2 (Train), then load=1 (Light), then load=0 (Rest)
            let chosenLoad = 0;
            let chosenLabel = "Rest";
            if (actualTodayLog) {
              chosenLoad = actualTodayLog.load;
              chosenLabel = chosenLoad === 0 ? "Rest" : chosenLoad === 1 ? "Train Light" : "Train";
            } else if (assumedTodayLoad !== null) {
              chosenLoad = assumedTodayLoad;
              chosenLabel = chosenLoad === 0 ? "Rest" : chosenLoad === 1 ? "Train Light" : "Train";
            } else for (const tryLoad of [2, 1, 0]) {
              if (tryLoad === 0) { chosenLoad = 0; chosenLabel = "Rest"; break; }
              // Simulate window with this load at index 0
              const simWindow = [{ date: dateStr, sleep: allTimeAvgSleep, load: tryLoad, strong: 1, strong_na: false }, ...recWindow.slice(1)];
              const simWeekLoad = simWindow.reduce((s, l) => s + (l.load || 0), 0);
              // Check: would adding this load exceed capacity?
              if (simWeekLoad > cap) continue;
              // Check cumulative load (using prior, not including today)
              const cl = forecastCumLoad(prior7);
              if (cl >= 4) continue;
              // Check two adjacent load>=2
              const p0 = prior7[0]?.load ?? 0;
              const p1 = prior7[1]?.load ?? 0;
              if (tryLoad >= 2 && p0 >= 2 && p1 >= 2) continue;
              if (tryLoad >= 2 && p0 >= 3) continue;
              chosenLoad = tryLoad;
              chosenLabel = tryLoad === 2 ? "Train" : "Train Light";
              break;
            }

            forecastDays.push({ date: dateStr, dayOfWeek, load: chosenLoad, label: chosenLabel });
          }

          return (
            <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px", marginBottom: 16 }}>
              <div style={{ ...bebas, fontSize: 16, letterSpacing: 1, marginBottom: 12, color: C.white }}>7-Day Forecast</div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 10, WebkitOverflowScrolling: "touch" }}>
                {forecastDays.map((fd, i) => {
                  const isToday = i === 0;
                  const isTomorrow = i === 1;
                  const icon = fd.load === 0 ? "🛌" : "🚂";
                  const isLight = fd.label === "Train Light";
                  const topLabel = isToday ? "Today" : isTomorrow ? "Tomorrow" : null;
                  return (
                    <div key={i} style={{
                      flexShrink: 0,
                      width: 72,
                      height: 80,
                      borderRadius: 8,
                      background: fd.load === 0 ? "rgba(255,255,255,0.04)" : "rgba(61,158,122,0.15)",
                      border: `1px solid ${isToday ? C.orange : fd.load === 0 ? C.border : "rgba(61,158,122,0.4)"}`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, padding: 4
                    }}>
                      {topLabel && <div style={{ ...mono, fontSize: 8, color: isToday ? C.orange : C.muted, lineHeight: 1 }}>{topLabel}</div>}
                      <div style={{ ...mono, fontSize: 9, color: isToday ? C.orange : C.muted }}>{fd.dayOfWeek}</div>
                      <div style={{ fontSize: 20, lineHeight: 1 }}>{icon}</div>
                      {isLight && <div style={{ ...mono, fontSize: 8, color: C.black, lineHeight: 1 }}>Light</div>}
                    </div>
                  );
                })}
              </div>
              <div style={{ ...mono, fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
                Based on your sleep, strength, and cumulative training load. Subject to change based on your actual logs.
              </div>
            </div>
          );
        })()}

        {/* Big action button */}
        {(() => {
          const isLogged = !!fatigueRec?.todayLogged;
          return (
            <button onClick={() => {
                if (isLogged) { setPartialDayLog(null); }
                else { const todayStr = localDateStr(); setPartialDayLog({ date: todayStr }); }
                setShowVolumeModal(true);
              }}
              style={{ width: "100%", ...mono, fontSize: 14, padding: "16px", borderRadius: 10, border: "none", background: C.orange, color: "#fff", cursor: "pointer", marginBottom: 8, letterSpacing: 0.5, fontWeight: 500 }}>
              {isLogged ? "View/Edit Logs" : "+ Log Today"}
            </button>
          );
        })()}

        {/* Log every day message */}
        {hasRecoverBuddy && (
          <div style={{ fontSize: 14, color: "#111111", lineHeight: 1.6, marginBottom: 16, fontWeight: 500 }}>Log every day so RecoverBuddy can work its magic. 🪄</div>
        )}

        {/* Feedback modal */}
        {showFeedback && ReactDOM.createPortal(
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9999, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowFeedback(false)}>
            <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: "12px 12px 0 0", padding: "24px 20px calc(24px + env(safe-area-inset-bottom, 0px))", width: "100%", maxWidth: 480 }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ ...bebas, fontSize: 20, letterSpacing: 1 }}>Feedback</div>
                <button onClick={() => setShowFeedback(false)} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 12, lineHeight: 1.5 }}>Thoughts, bugs, feature requests — I'll implement it ASAP.</div>
              <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)}
                placeholder="What's on your mind?"
                rows={4} autoFocus
                style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12 }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                {feedbackJustSent
                  ? <div style={{ ...mono, fontSize: 11, color: "#3d9e7a" }}>✓ Sent — thank you!</div>
                  : <div />}
                <button onClick={() => { submitFeedback(); }} disabled={feedbackSaving || !feedbackText.trim()}
                  style={{ ...mono, fontSize: 12, padding: "10px 22px", borderRadius: 6, border: "none", background: feedbackText.trim() ? C.orange : C.gray3, color: "#fff", cursor: (feedbackSaving || !feedbackText.trim()) ? "default" : "pointer", fontWeight: 500 }}>
                  {feedbackSaving ? "Sending..." : "Send"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
        {/* Bottom row of utility buttons */}
        {hasRecoverBuddy && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {fatigueLogs.length > 0 && (
              <button onClick={() => setShowCalendar(true)}
                style={{ ...mono, fontSize: 10, padding: "6px 14px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>
                📅 View Train/Rest History
              </button>
            )}
            <button onClick={() => setIntroOpen(true)}
              style={{ ...mono, fontSize: 10, padding: "6px 14px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>
              How does RecoverBuddy work?
            </button>
            <button onClick={() => setShowFeedback(true)}
              style={{ ...mono, fontSize: 10, padding: "6px 14px", borderRadius: 5, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer" }}>
              💬 Feedback
            </button>
          </div>
        )}

        {showCalendar && fatigueLogs.length > 0 && ReactDOM.createPortal(
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999, display: "flex", flexDirection: "column", WebkitOverflowScrolling: "touch" }} onClick={() => setShowCalendar(false)}>
            <div style={{ background: C.black, flex: 1, overflowY: "auto", padding: "20px 16px", maxWidth: 480, margin: "0 auto", width: "100%", WebkitOverflowScrolling: "touch" }} onClick={e => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ ...bebas, fontSize: 20, letterSpacing: 1 }}>CALENDAR VIEW</div>
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
          const minMonth = "0000-00"; // show all months
          const months = Object.keys(byMonth).filter(m => m >= minMonth).sort();
          return (
            <div style={{ marginBottom: 20 }}>
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
                          <div key={i} style={{ ...mono, fontSize: 10, color: C.muted, textAlign: "center", paddingBottom: 4 }}>{d}</div>
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
                        <div style={{ ...mono, fontSize: 10, color: C.muted }}>{trainPct}% train · last 30 days</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>🛌</span>
                      <div>
                        <div style={{ ...mono, fontSize: 14, color: C.muted }}>{restCount}</div>
                        <div style={{ ...mono, fontSize: 10, color: C.muted }}>{restPct}% rest</div>
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


        {/* Bouldering Pyramid — dev only */}
        {athlete?.is_dev && (() => {
          // Compute pyramid structure from typical_grade_v
          const typicalGrade = athlete?.typical_grade_v;
          const gradeIdx = V_GRADES.indexOf(typicalGrade);
          if (!typicalGrade || typicalGrade === 'N/A' || gradeIdx < 1) return null;

          // Top grade = typical + 1, then 3 rows below
          // Row 0 (top): 1 slot at gradeIdx+1
          // Row 1: 2 slots at gradeIdx
          // Row 2: 4 slots at gradeIdx-1
          // Row 3: 8 slots at gradeIdx-2
          const rows = [];
          for (let r = 0; r < 4; r++) {
            const gIdx = gradeIdx + 1 - r;
            if (gIdx < 1) break;
            rows.push({ grade: V_GRADES[gIdx], count: Math.pow(2, r) });
          }
          const totalSlots = rows.reduce((s, r) => s + r.count, 0);

          // Map logs to slots — each row gets its count filled in order
          const logsByGrade = {};
          pyramidLogs.forEach(l => { (logsByGrade[l.grade] = logsByGrade[l.grade] || []).push(l); });

          const isComplete = rows.every(row => (logsByGrade[row.grade] || []).length >= row.count);

          const logSlot = async () => {
            if (!showPyramidLog) return;
            setPyramidSaving(true);
            await sb.from("pyramid_logs").insert({
              athlete_id: athlete.id,
              grade: showPyramidLog.grade,
              logged_at: pyramidForm.date,
              notes: pyramidForm.notes || null,
              pyramid_cycle: pyramidCycle,
            });
            // Refetch
            const { data } = await sb.from("pyramid_logs").select("*").eq("athlete_id", athlete.id)
              .eq("pyramid_cycle", pyramidCycle);
            const newLogs = data || [];
            setPyramidLogs(newLogs);
            // Check if now complete — if so bump cycle
            const newLogsByGrade = {};
            newLogs.forEach(l => { (newLogsByGrade[l.grade] = newLogsByGrade[l.grade] || []).push(l); });
            const nowComplete = rows.every(row => (newLogsByGrade[row.grade] || []).length >= row.count);
            if (nowComplete) {
              const newCycle = pyramidCycle + 1;
              setPyramidCycle(newCycle);
              setPyramidLogs([]);
            }
            setPyramidSaving(false);
            setShowPyramidLog(null);
            setPyramidForm({ date: localDateStr(), notes: "" });
          };

          return (
            <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 16px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ ...bebas, fontSize: 20, color: C.white, letterSpacing: 1 }}>Bouldering Pyramid</div>
                {pyramidCycle > 1 && <div style={{ ...mono, fontSize: 10, color: C.muted }}>Cycle {pyramidCycle}</div>}
              </div>
              <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 16, lineHeight: 1.5 }}>
                Fill every slot to complete the pyramid. Tap a slot to log a boulder.
              </div>
              {pyramidLoading ? (
                <div style={{ ...mono, fontSize: 11, color: C.muted, textAlign: "center", padding: 16 }}>Loading...</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
                  {rows.map((row, ri) => {
                    const filled = (logsByGrade[row.grade] || []);
                    return (
                      <div key={ri} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: "100%" }}>
                        <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>{row.grade}</div>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                          {Array.from({ length: row.count }).map((_, si) => {
                            const log = filled[si];
                            const isFilled = !!log;
                            return (
                              <button key={si}
                                onClick={() => isFilled
                                  ? setViewingPyramidSlot(log)
                                  : (setShowPyramidLog({ grade: row.grade, slotIndex: si }), setPyramidForm({ date: localDateStr(), notes: "" }))
                                }
                                style={{
                                  width: Math.min(64, Math.floor(320 / row.count) - 6),
                                  height: 44,
                                  borderRadius: 8,
                                  border: `2px solid ${isFilled ? '#2aaa5e' : C.border}`,
                                  background: isFilled ? 'rgba(61,158,122,0.15)' : C.gray2,
                                  cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.15s',
                                }}>
                                {isFilled
                                  ? <span style={{ color: '#2aaa5e', fontSize: 18 }}>✓</span>
                                  : <span style={{ color: C.gray3, fontSize: 18 }}>+</span>
                                }
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {isComplete && (
                <div style={{ marginTop: 14, textAlign: "center", padding: "12px", background: "rgba(61,158,122,0.1)", borderRadius: 8, border: "1px solid rgba(61,158,122,0.3)" }}>
                  <div style={{ ...bebas, fontSize: 20, color: '#2aaa5e' }}>Pyramid Complete! 🎉</div>
                  <div style={{ ...mono, fontSize: 11, color: C.muted, marginTop: 4 }}>Starting cycle {pyramidCycle + 1}...</div>
                </div>
              )}

              {/* Log slot modal */}
              {showPyramidLog && ReactDOM.createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                  onClick={() => setShowPyramidLog(null)}>
                  <div style={{ background: C.gray, borderRadius: '12px 12px 0 0', width: '100%', maxWidth: 480, padding: '24px 20px calc(24px + env(safe-area-inset-bottom, 0px))' }}
                    onClick={e => e.stopPropagation()}>
                    <div style={{ ...bebas, fontSize: 22, marginBottom: 4, color: C.white }}>Log {showPyramidLog.grade}</div>
                    <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 16 }}>Must be a {showPyramidLog.grade} boulder.</div>
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>DATE</div>
                      <input type="date" value={pyramidForm.date} max={localDateStr()}
                        onChange={e => setPyramidForm(f => ({ ...f, date: e.target.value }))}
                        style={{ width: '100%', background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: '10px 12px', color: C.white, fontSize: 14, outline: 'none', colorScheme: 'dark', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>NOTES (optional)</div>
                      <textarea value={pyramidForm.notes} onChange={e => setPyramidForm(f => ({ ...f, notes: e.target.value }))}
                        placeholder="Boulder name, gym, style..."
                        rows={3}
                        style={{ width: '100%', background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: '10px 12px', color: C.white, fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setShowPyramidLog(null)}
                        style={{ flex: 1, ...mono, fontSize: 12, padding: '12px', borderRadius: 8, border: `1px solid ${C.border}`, background: 'none', color: C.muted, cursor: 'pointer' }}>Cancel</button>
                      <button onClick={logSlot} disabled={pyramidSaving}
                        style={{ flex: 2, ...mono, fontSize: 12, padding: '12px', borderRadius: 8, border: 'none', background: C.orange, color: '#fff', cursor: pyramidSaving ? 'default' : 'pointer' }}>
                        {pyramidSaving ? 'Saving...' : 'Log Boulder'}
                      </button>
                    </div>
                  </div>
                </div>,
                document.body
              )}

              {/* View filled slot */}
              {viewingPyramidSlot && ReactDOM.createPortal(
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
                  onClick={() => setViewingPyramidSlot(null)}>
                  <div style={{ background: C.gray, borderRadius: 12, width: '100%', maxWidth: 360, padding: 24 }}
                    onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ ...bebas, fontSize: 22, color: '#2aaa5e' }}>✓ {viewingPyramidSlot.grade}</div>
                      <button onClick={() => setViewingPyramidSlot(null)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
                    </div>
                    <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 8 }}>
                      {new Date(viewingPyramidSlot.logged_at + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    {viewingPyramidSlot.notes && (
                      <div style={{ fontSize: 13, color: C.white, lineHeight: 1.6, marginTop: 8 }}>{viewingPyramidSlot.notes}</div>
                    )}
                  </div>
                </div>,
                document.body
              )}
            </div>
          );
        })()}

        </>}

        {hasPlan && plan && publishedIndices.length > 0 && <>
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
                              {vol > 0 && <div style={{ ...mono, fontSize: 10, color: isCurrent ? C.purple : C.muted }}>{vol}</div>}
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
                  {isCurrent && <div style={{ ...mono, fontSize: 10, color: C.purple }}>this week</div>}
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
                <div style={{ ...mono, fontSize: 10, color: allDone ? "#2aaa5e" : C.muted, marginTop: 2 }}>{allDone ? "✓ done" : `${done}/${total}`}</div>
              </button>
            );
          })}
          <button onClick={() => setActiveDay(OVF)} style={{ flexShrink: 0, minWidth: 80, padding: "10px 12px", borderRadius: 8, border: `1px solid ${isOvf ? "#4a7aab" : overflow.length > 0 ? "rgba(91,127,166,0.5)" : C.border}`, background: isOvf ? "rgba(91,127,166,0.1)" : overflow.length > 0 ? "rgba(91,127,166,0.05)" : C.gray, color: isOvf ? "#4a7aab" : overflow.length > 0 ? "#4a7aab" : C.muted, cursor: "pointer", textAlign: "center" }}>
            <div style={{ ...bebas, fontSize: 15 }}>Skip</div>
            <div style={{ ...mono, fontSize: 10, color: "inherit", marginTop: 2 }}>{overflow.length > 0 ? overflow.length : "empty"}</div>
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
            <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Deferred to another day</div>
            {deferredExs.map(ex => {
              const ep = getEp(ex);
              const alsoOnLabels = ex.sharedDays?.map(di => days[di]?.label).filter(Boolean).join(", ");
              return (
                <div key={ex.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "rgba(91,127,166,0.06)", border: `1px solid rgba(91,127,166,0.2)`, borderRadius: 8, marginBottom: 4 }}>
                  <div style={{ flex: 1, fontSize: 13, color: C.muted, textDecoration: "line-through" }}>{ex.text}</div>
                  <span style={{ ...mono, fontSize: 10, color: C.purple }}>→ {alsoOnLabels}</span>
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
        </>}
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
    if (!selectedAthlete.trim()) { setError("Please enter your name."); return; }
    const match = athletes.find(a => a.name.toLowerCase() === selectedAthlete.trim().toLowerCase());
    if (!match) { setError("Name not found. Check your spelling."); return; }
    if (!credentials[match.id]) { setError("No password set. Contact your coach."); return; }
    if (credentials[match.id] !== password) { setError("Incorrect password."); return; }
    onLoginAthlete(match.id);
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
              <input autoFocus value={selectedAthlete} onChange={e => { setSelectedAthlete(e.target.value); setError(""); }} onKeyDown={e => e.key==="Enter"&&handleAthleteLogin()} placeholder="Enter your full name..." style={{ ...inputStyle, boxSizing: "border-box" }} />
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
            {tab==="athlete"?"LOG IN":"ENTER COACH VIEW"}
          </button>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, ...mono, fontSize: 10, color: C.muted }}>rockpointcoaching.com</div>
      </div>
    </div>
  );
}

// ── SIMULATOR ────────────────────────────────────────────────────────────────
// Coach-only sandbox that runs the same fatigue model logic against editable
// hypothetical day data. Local-only — no DB writes. Mirrors the athlete banner
// + dashboard visual style so what the coach sees here matches what the
// athlete would see in real life.
function SimulatorPage() {
  const todayStr = localDateStr();
  // Build 7-day window: today + 6 prior. Matches the live model exactly.
  // index 0 = today, index 1 = yesterday, ..., index 6 = 6 days ago.
  const makeBlankDays = () => {
    const days = [];
    for (let i = 0; i <= 6; i++) {
      const [y, m, d] = todayStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d); dt.setDate(dt.getDate() - i);
      const ds = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      // Today defaults to synthetic-rest (load 0, sleep 0, strong N/A) just
      // like the live model's pre-logging state. Athletes can edit it.
      days.push({ date: ds, sleep: i === 0 ? 0 : 8, load: 0, strong: null, strong_na: true });
    }
    return days;
  };
  // Persist between sessions. Bumped key suffix because the shape changed
  // (today row added, oldest day removed).
  const STORAGE_KEY = "rp_simulator_v2";
  const [tier, setTier] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.tier || DEFAULT_VOLUME_TIER; } catch { return DEFAULT_VOLUME_TIER; }
  });
  const [days, setDays] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.days || makeBlankDays(); } catch { return makeBlankDays(); }
  });
  React.useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ tier, days })); } catch {}
  }, [tier, days]);
  const reset = () => { setDays(makeBlankDays()); setTier(DEFAULT_VOLUME_TIER); };
  const updateDay = (idx, patch) => setDays(prev => prev.map((d, i) => i === idx ? { ...d, ...patch } : d));

  // ── Replicates computeRec exactly. Keep in sync. ─────────────────────────
  const volumeCoeff = (() => {
    const t = VOLUME_TIERS.find(x => x.id === tier);
    return t ? t.multiplier : 1.0;
  })();
  const computeRec = (windowLogs) => {
    if (windowLogs.length < 3) return null;
    const signals = [];
    const REST = (s, meta) => ({ label: "Rest", color: "#c0392b", bg: "rgba(192,57,43,0.08)", signals: s, meta });
    const LIGHT = (s, meta) => ({ label: "Train Light", color: C.orange, bg: "rgba(224,122,58,0.08)", signals: s, meta });
    const LIGHT_OR_REST = (s, meta) => ({ label: "Train Light or Rest", color: C.orange, bg: "rgba(224,122,58,0.08)", signals: s, meta });
    const TRAIN = (s, meta) => ({ label: "Train", color: "#3d9e7a", bg: "rgba(61,158,122,0.08)", signals: s, meta });

    // Matches the live model. windowLogs[0] = today (synthetic-rest if unlogged).
    // Prior days (yesterday onward) start at index 1.
    const prior = windowLogs.slice(1);
    const recent7 = windowLogs.slice(0, 7);
    const avgSleep = recent7.reduce((s, l) => s + (l.sleep || 0), 0) / recent7.length;
    const weekLoad = recent7.reduce((s, l) => s + (l.load || 0), 0);
    const last3 = windowLogs.slice(0, 3);
    const strongLogs = last3.filter(l => l.strong != null);
    const avgStrong = strongLogs.length >= 2 ? strongLogs.reduce((s, l) => s + l.strong, 0) / strongLogs.length : null;
    const ratedAll = recent7.filter(l => l.strong != null);
    // Recency guard: strong=0 only fires if the most recent training day
    // is within 2 positions of yesterday (at most 1 rest day since last session).
    const recentEnoughTraining = (() => {
      for (let i = 0; i < Math.min(2, prior.length); i++) {
        if ((prior[i]?.load ?? 0) > 0 && prior[i]?.strong != null) return prior[i];
      }
      return null;
    })();
    const mostRecentStrong = recentEnoughTraining ? recentEnoughTraining.strong : null;
    const recentStrongZero = mostRecentStrong === 0;
    const priorTraining = prior.filter(l => (l.load ?? 0) > 0 && l.strong != null);
    const twoConsecStrongZero = priorTraining.length >= 2 && priorTraining[0].strong === 0 && priorTraining[1].strong === 0;
    // fiveStrongDays: 5 most-recent training-day strong=2 within all simulator days
    const simTrainingLogs = days.filter(l => (l.load ?? 0) > 0 && l.strong != null);
    const fiveStrongTrainingRatings = simTrainingLogs.slice(0, 5).map(l => l.strong);
    const fiveStrongDays = fiveStrongTrainingRatings.length === 5 && fiveStrongTrainingRatings.every(s => s === 2);
    const fourStrongDays = fiveStrongDays; // alias
    const recentStrongRatings = ratedAll.slice(0, 5).map(l => l.strong);
    const twoStrongTwos = recentStrongRatings.length >= 2 && recentStrongRatings[0] === 2 && recentStrongRatings[1] === 2;
    const capacity = avgSleep * volumeCoeff;
    const overLoadCap = weekLoad > capacity;
    const lowSleep = avgSleep < 6.5;
    const lowStrong = avgStrong !== null && avgStrong < 1.0;
    const redCount = [fourStrongDays, lowSleep, lowStrong].filter(Boolean).length;
    const lastNightSleep = (windowLogs[0]?.sleep != null && !windowLogs[0]?._synthetic)
      ? windowLogs[0].sleep
      : prior[0]?.sleep ?? null;
    const sleptUnder6 = lastNightSleep !== null && lastNightSleep < 6;

    // cumulative load walking back from yesterday, broken by a rest day
    let cumLoad = 0;
    for (let i = 0; i < prior.length; i++) {
      const ld = prior[i]?.load ?? 0;
      if (ld === 0) break;
      cumLoad += ld;
      if (cumLoad >= 4) break;
    }
    const overCumLoad = cumLoad >= 4;

    const priorLoads = prior.slice(0, 2).map(l => l.load ?? 0);
    const twoAdjacentHard = priorLoads.length === 2 && priorLoads[0] >= 2 && priorLoads[1] >= 2;
    const wellSlept = avgSleep > 8 && (lastNightSleep !== null && lastNightSleep >= 8);

    const meta = { avgSleep, weekLoad, capacity, avgStrong, fourStrongDays, fiveStrongDays, lowSleep, lowStrong, overLoadCap, sleptUnder6, cumLoad, recentStrongZero };

    const tag = (recFn, key) => ({ ...recFn(signals, meta), reasonKey: key });
    if (sleptUnder6) { signals.push("Last night sleep < 6h (hard override)"); return tag(REST, "sleptUnder6"); }
    if (fiveStrongDays) { signals.push("5 consecutive strong=2 training days → Rest + tier-up"); return tag(REST, "fiveStrongDays"); }
    if (twoConsecStrongZero) { signals.push("Two consecutive strong=0 training days → Rest"); return tag(REST, "recentStrongZero"); }
    if (recentStrongZero) {
      if (lastNightSleep !== null && lastNightSleep >= 8) { signals.push("strong=0 but slept >= 8h → Train Light"); return tag(LIGHT, "recentStrongZero"); }
      signals.push("Most recent strong rating = 0 (felt weak) → Rest"); return tag(REST, "recentStrongZero");
    }
    if (overCumLoad) { signals.push(`Cumulative load ${cumLoad} >= 4 uninterrupted by rest → Rest`); return tag(REST, "overCumLoad"); }
    if (twoAdjacentHard) {
      if (wellSlept && twoStrongTwos) { signals.push("Two adjacent load>=2 BUT well-slept + two strong=2 → Train Light or Rest"); return tag(LIGHT_OR_REST, "twoAdjacentHardSoftened"); }
      signals.push("Two adjacent days load >= 2 → Rest");
      return tag(REST, "twoAdjacentHard");
    }
    if (overLoadCap) { signals.push(`overLoadCap: weekLoad ${weekLoad} >= capacity ${capacity.toFixed(2)}`); return tag(REST, "overLoadCap"); }
    if (lowStrong) signals.push(`lowStrong: avgStrong ${avgStrong?.toFixed(2)} < 1.0 (red)`);
    if (fourStrongDays) signals.push("fourStrongDays: 4 most-recent ratings all = 2 (red)");
    if (lowSleep) signals.push(`lowSleep: avgSleep ${avgSleep.toFixed(2)} < 6.5 (red)`);
    if (redCount >= 2) {
      signals.push(`${redCount} red signals → Rest`);
      if (lowSleep && lowStrong && fourStrongDays) return tag(REST, "reds_all_three");
      if (lowSleep && lowStrong) return tag(REST, "reds_lowSleep_lowStrong");
      if (lowSleep && fourStrongDays) return tag(REST, "reds_lowSleep_fourStrongDays");
      if (lowStrong && fourStrongDays) return tag(REST, "reds_lowStrong_fourStrongDays");
      return tag(REST, "reds_lowSleep_lowStrong");
    }
    if (redCount >= 1) {
      signals.push(`${redCount} red signal → Train Light`);
      if (lowSleep) return tag(LIGHT, "lowSleep_only");
      if (lowStrong) return tag(LIGHT, "lowStrong_only");
      if (fourStrongDays) return tag(LIGHT, "fourStrongDays_only");
      return tag(LIGHT, "lowSleep_only");
    }
    signals.push("No signals fired → Train");
    return tag(TRAIN, "none");
  };

  // For the rec, today (index 0) is treated as synthetic-rest so logging
  // a session today doesn't retroactively change today's recommendation.
  const daysForRec = [{ ...days[0], load: 0, strong: null, strong_na: true }, ...days.slice(1)];
  const rec = computeRec(daysForRec);
  // Tomorrow's rec: shift the window forward by one day. Tomorrow becomes
  // index 0 (synthetic-rest), today shifts to index 1, etc. Last (6 days ago)
  // rolls off the back.
  const tomorrowWindow = [{ sleep: 0, load: 0, strong: null, strong_na: true }, ...days.slice(0, 6)];
  const tomorrowRec = computeRec(tomorrowWindow);

  const dashSleep = days.reduce((s, l) => s + (l.sleep || 0), 0) / days.length;
  const dashLoad = days.reduce((s, l) => s + (l.load || 0), 0);
  const simCapacity = dashSleep * volumeCoeff;
  const dashLoadPct = simCapacity > 0 ? Math.round((dashLoad / simCapacity) * 100) : 0;
  const dashStrongRatings = days.filter(l => l.strong != null).map(l => l.strong);
  let dashStrongLabel = "—";
  if (dashStrongRatings.length > 0) {
    const avg = dashStrongRatings.reduce((s, v) => s + v, 0) / dashStrongRatings.length;
    if (avg < 1) dashStrongLabel = "Fatigued";
    else if (avg === 1) dashStrongLabel = "Normal";
    else if (avg < 2) dashStrongLabel = "Pretty Good";
    else dashStrongLabel = "Great";
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 20px", width: "100%" }}>
      <div style={{ ...bebas, fontSize: 32, letterSpacing: 1, marginBottom: 6 }}>Simulator</div>
      <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
        Test the fatigue model with hypothetical day data. Local-only — nothing here is saved to the database. Edit any day below; the banner above mirrors what the athlete sees.
      </div>

      {/* Volume tier + Reset */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4 }}>Volume Tier</div>
          <select value={tier} onChange={e => setTier(e.target.value)}
            style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.white, fontSize: 13, outline: "none" }}>
            {VOLUME_TIERS.map(t => <option key={t.id} value={t.id}>{t.label} ({t.multiplier}×)</option>)}
          </select>
        </div>
        <button onClick={reset} style={{ ...mono, fontSize: 10, padding: "8px 14px", borderRadius: 6, border: `1px solid ${C.border}`, background: "none", color: C.muted, cursor: "pointer", marginTop: 16 }}>Reset</button>
      </div>

      {/* Banner at top — today's rec + dashboard */}
      {rec && (
        <div style={{ background: rec.bg, border: `1px solid ${rec.color}55`, borderRadius: 12, padding: "20px 22px", marginBottom: 12 }}>
          <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 4, letterSpacing: 1 }}>TODAY · RECOMMENDED</div>
          <div style={{ ...bebas, fontSize: 38, letterSpacing: 1, color: rec.color, marginBottom: 8 }}>{rec.label}</div>
          {rec.reasonKey && REASON_TEXT[rec.reasonKey] && (
            <div style={{ fontSize: 13, color: C.white, lineHeight: 1.55, padding: "10px 12px", background: `${rec.color}10`, borderRadius: 6, borderLeft: `2px solid ${rec.color}`, marginBottom: 12 }}>
              {REASON_TEXT[rec.reasonKey]}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, paddingTop: 10, borderTop: `1px solid ${rec.color}22` }}>
            <div>
              <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 2 }}>SLEEP</div>
              <div style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{dashSleep.toFixed(1)}h</div>
            </div>
            <div>
              <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 2 }}>LOAD</div>
              <div style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{dashLoadPct}%</div>
            </div>
            <div>
              <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 2 }}>STRENGTH</div>
              <div style={{ fontSize: 14, color: C.white, fontWeight: 500 }}>{dashStrongLabel}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tomorrow rec */}
      {tomorrowRec && (
        <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: 1 }}>TOMORROW</div>
          <div style={{ ...mono, fontSize: 12, color: tomorrowRec.color, fontWeight: 600 }}>
            {tomorrowRec.label} (May change based on tonight's sleep)
          </div>
        </div>
      )}

      {/* Day inputs — index 0 = today */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ ...mono, fontSize: 10, color: C.muted, marginBottom: 8, letterSpacing: 1 }}>WINDOW (today + 6 prior, newest first)</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {days.map((d, i) => {
            const label = i === 0 ? "Today" : i === 1 ? "Yesterday" : `${i} days ago`;
            const isToday = i === 0;
            return (
              <div key={i} style={{ background: isToday ? "rgba(224,122,58,0.05)" : C.gray, border: `1px solid ${isToday ? C.orange : C.border}55`, borderRadius: 8, padding: "10px 14px", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ ...mono, fontSize: 10, color: isToday ? C.orange : C.muted, minWidth: 90, fontWeight: isToday ? 600 : 400 }}>{label}</div>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ ...mono, fontSize: 10, color: C.muted }}>SLEEP</span>
                  <select value={d.sleep} onChange={e => updateDay(i, { sleep: parseFloat(e.target.value) })}
                    style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: C.white, fontSize: 13, outline: "none" }}>
                    {[0,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10].map(v => <option key={v} value={v}>{v}h</option>)}
                  </select>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ ...mono, fontSize: 10, color: C.muted }}>LOAD</span>
                  <select value={d.load} onChange={e => updateDay(i, { load: parseInt(e.target.value) })}
                    style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: C.white, fontSize: 13, outline: "none" }}>
                    {[0, 1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ ...mono, fontSize: 10, color: C.muted }}>STRONG</span>
                  <select value={d.strong_na ? "na" : String(d.strong)} onChange={e => {
                      const v = e.target.value;
                      if (v === "na") updateDay(i, { strong: null, strong_na: true });
                      else updateDay(i, { strong: parseInt(v), strong_na: false });
                    }}
                    style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 4, padding: "5px 8px", color: C.white, fontSize: 13, outline: "none" }}>
                    <option value="na">N/A</option>
                    <option value="0">0 (weak)</option>
                    <option value="1">1 (normal)</option>
                    <option value="2">2 (great)</option>
                  </select>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diagnostic readout */}
      {rec && (
        <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px" }}>
          <div style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>SIGNALS (TODAY)</div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
            {rec.signals.length === 0 && <div>(no signal trace)</div>}
            {rec.signals.map((s, i) => <div key={i}>· {s}</div>)}
          </div>
          {rec.meta && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
              <div style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 8 }}>MATH</div>
              <div style={{ ...mono, fontSize: 11, color: C.white, lineHeight: 1.7 }}>
                <div>avgSleep = {rec.meta.avgSleep.toFixed(2)}h</div>
                <div>weekLoad = {rec.meta.weekLoad}</div>
                <div>capacity = avgSleep × {volumeCoeff.toFixed(3)} = {rec.meta.capacity.toFixed(2)}</div>
                <div>weekLoad / capacity = {(rec.meta.weekLoad / rec.meta.capacity).toFixed(3)}</div>
                <div>avgStrong (last 3 days) = {rec.meta.avgStrong !== null ? rec.meta.avgStrong.toFixed(2) : "n/a (need 2+ ratings)"}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── ATHLETE LOGS PAGE ─────────────────────────────────────────────────────────
function AthleteLogsPage({ athletes, getVolumeMultiplier }) {
  const [logs, setLogs] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [selectedLog, setSelectedLog] = React.useState(null);

  const rbAthletes = athletes.filter(a => !!a.has_recoverbuddy);

  React.useEffect(() => {
    if (rbAthletes.length === 0) { setLoading(false); return; }
    const ids = rbAthletes.map(a => a.id);
    const todayStr = localDateStr();
    const [ty, tm, td] = todayStr.split("-").map(Number);
    const dt = new Date(ty, tm - 1, td); dt.setDate(dt.getDate() - 30);
    const since = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
    sb.from("fatigue_logs").select("*").in("athlete_id", ids).gte("date", since)
      .order("date", { ascending: false })
      .then(({ data }) => {
        const byAthlete = {};
        (data || []).forEach(r => { (byAthlete[r.athlete_id] = byAthlete[r.athlete_id] || []).push(r); });
        setLogs(byAthlete);
        setLoading(false);
      });
  }, [athletes.map(a => a.id).join(",")]);

  const todayStr = localDateStr();

  const getStats = (athlete) => {
    const athleteLogs = logs[athlete.id] || [];
    if (athleteLogs.length === 0) return null;

    const recent7 = athleteLogs.slice(0, 7);
    const avgSleep = recent7.reduce((s, l) => s + (l.sleep || 0), 0) / recent7.length;
    const weekLoad = recent7.reduce((s, l) => s + (l.load || 0), 0);
    const volCoeff = getVolumeMultiplier(athlete);
    const capacity = avgSleep * volCoeff;
    const loadPct = capacity > 0 ? Math.round((weekLoad / capacity) * 100) : 0;

    const strongRatings = recent7.filter(l => l.strong != null).map(l => l.strong);
    let strengthLabel = "—";
    if (strongRatings.length > 0) {
      const avg = strongRatings.reduce((s, v) => s + v, 0) / strongRatings.length;
      if (avg < 1) strengthLabel = "Fatigued";
      else if (avg === 1) strengthLabel = "Normal";
      else if (avg < 2) strengthLabel = "Pretty Good";
      else strengthLabel = "Great";
    }

    const lastLog = athleteLogs[0];
    const [ly, lm, ld] = lastLog.date.split("-").map(Number);
    const lastDate = new Date(ly, lm - 1, ld);
    const [ty2, tm2, td2] = todayStr.split("-").map(Number);
    const today = new Date(ty2, tm2 - 1, td2);
    const daysSince = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

    // Compute rec
    const prior = recent7.slice(1);
    const lowSleep = avgSleep < 6.5;
    const overLoadCap = weekLoad > capacity;
    let cumLoad = 0;
    for (let i = 0; i < prior.length; i++) {
      const ld2 = prior[i]?.load ?? 0;
      if (ld2 === 0) break;
      cumLoad += ld2;
      if (cumLoad >= 4) break;
    }
    const priorLoads = prior.slice(0, 2).map(l => l.load ?? 0);
    const twoAdjacentHard = priorLoads.length === 2 && priorLoads[0] >= 2 && priorLoads[1] >= 2;
    // Match main model: today's row is index 0 of recent7, prior starts at index 1
    const lastNightSleep = (recent7[0]?.sleep != null && !recent7[0]?._synthetic)
      ? recent7[0].sleep
      : prior[0]?.sleep ?? null;
    const sleptUnder6 = lastNightSleep !== null && lastNightSleep < 6;
    const lowStrong = strongRatings.length >= 2 && (strongRatings.reduce((s,v)=>s+v,0)/strongRatings.length) < 1.0;
    const redCount = [lowSleep, lowStrong].filter(Boolean).length;

    let rec = "Train", recColor = "#3d9e7a";
    if (sleptUnder6 || overLoadCap || (twoAdjacentHard) || cumLoad >= 4) { rec = "Rest"; recColor = "#c0392b"; }
    else if (redCount >= 2) { rec = "Rest"; recColor = "#c0392b"; }
    else if (redCount >= 1 || lowSleep) { rec = "Train Light"; recColor = C.orange; }

    return { avgSleep, loadPct, strengthLabel, lastLog, daysSince, rec, recColor };
  };

  // Sort: athletes with no logs last, others by most recently logged
  const sorted = [...rbAthletes].sort((a, b) => {
    const la = logs[a.id]?.[0]?.date || "0000-00-00";
    const lb = logs[b.id]?.[0]?.date || "0000-00-00";
    return lb.localeCompare(la);
  });

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px", width: "100%" }}>
      <div style={{ ...bebas, fontSize: 32, letterSpacing: 1, marginBottom: 6 }}>Athlete Logs</div>
      <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 28, lineHeight: 1.6 }}>
        RecoverBuddy athletes — last 30 days. Sorted by most recently logged.
      </div>

      {loading && <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 40 }}>Loading...</div>}

      {!loading && sorted.length === 0 && (
        <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 40 }}>No RecoverBuddy athletes yet.</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {!loading && sorted.map(athlete => {
          const stats = getStats(athlete);
          const notLogged = !stats;
          const overdue = stats?.daysSince >= 3;

          return (
            <div key={athlete.id} style={{
              background: C.gray,
              border: `1px solid ${overdue ? "#c0392b44" : notLogged ? C.border : C.border}`,
              borderRadius: 10,
              padding: "16px 20px",
            }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: stats ? 14 : 0, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ ...bebas, fontSize: 18, color: C.white }}>{athlete.name}</div>
                  <Badge type={athlete.type} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {notLogged && <span style={{ ...mono, fontSize: 10, color: C.muted }}>No logs yet</span>}
                  {overdue && <span style={{ ...mono, fontSize: 10, color: "#c0392b", background: "rgba(192,57,43,0.1)", padding: "3px 8px", borderRadius: 4 }}>⚠ {stats.daysSince}d ago</span>}
                  {stats && !overdue && <span style={{ ...mono, fontSize: 10, color: C.muted }}>{stats.daysSince === 0 ? "Today" : stats.daysSince === 1 ? "Yesterday" : `${stats.daysSince}d ago`}</span>}
                  {stats && <span style={{ ...mono, fontSize: 11, color: stats.recColor, fontWeight: 600, background: `${stats.recColor}18`, padding: "3px 10px", borderRadius: 4 }}>{stats.rec}</span>}
                </div>
              </div>

              {/* Stats row */}
              {stats && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                  {[
                    { label: "Avg Sleep", value: stats.avgSleep.toFixed(1) + "h" },
                    { label: "Load", value: stats.loadPct + "%" },
                    { label: "Strength", value: stats.strengthLabel },
                    { label: "Last logged", value: (() => {
                      const d = new Date(stats.lastLog.date + "T12:00:00");
                      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    })() },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: C.white }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent log strip — tappable */}
              {stats && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 }}>Last 14 days — tap a bar</div>
                  <div style={{ display: "flex", gap: 3 }}>
                    {(logs[athlete.id] || []).slice(0, 14).reverse().map((log, i) => {
                      const barColor = log.load === 0 ? C.gray3 : log.load === 1 ? "#5b7fa6" : log.load <= 2 ? C.orange : "#c0392b";
                      const d = new Date(log.date + "T12:00:00");
                      return (
                        <div key={i} onClick={() => setSelectedLog({ log, athleteName: athlete.name })}
                          style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", minWidth: 0 }}>
                          <div style={{ width: "100%", height: 12, borderRadius: 3, background: barColor }} />
                          <div style={{ ...mono, fontSize: 7, color: C.muted }}>{d.getDate()}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day detail modal */}
      {selectedLog && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 600, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setSelectedLog(null)}>
          <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 12, width: "100%", maxWidth: 360, padding: 24 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ ...bebas, fontSize: 18, color: C.white }}>{selectedLog.athleteName}</div>
                <div style={{ ...mono, fontSize: 11, color: C.muted }}>{new Date(selectedLog.log.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
              </div>
              <button onClick={() => setSelectedLog(null)} style={{ background: "none", border: "none", color: C.muted, fontSize: 22, cursor: "pointer", lineHeight: 1 }}>✕</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[{ label: "Sleep", value: selectedLog.log.sleep != null ? selectedLog.log.sleep + "h" : "—",
                  color: selectedLog.log.sleep >= 8 ? "#3d9e7a" : selectedLog.log.sleep >= 6 ? C.orange : "#c0392b" },
                { label: "Load", value: selectedLog.log.load != null ? String(selectedLog.log.load) : "—",
                  color: selectedLog.log.load === 0 ? C.muted : selectedLog.log.load <= 2 ? C.orange : "#c0392b" },
                { label: "Strong", value: selectedLog.log.strong_na ? "N/A" : selectedLog.log.strong != null ? String(selectedLog.log.strong) : "—",
                  color: selectedLog.log.strong === 0 ? "#c0392b" : selectedLog.log.strong === 2 ? "#3d9e7a" : C.orange },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: C.gray2, borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
                </div>
              ))}
            </div>
            {selectedLog.log.summary && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>What they did</div>
                <div style={{ fontSize: 13, color: C.white, lineHeight: 1.55 }}>{selectedLog.log.summary}</div>
              </div>
            )}
            {selectedLog.log.tweaks && (
              <div>
                <div style={{ ...mono, fontSize: 9, color: "#c0392b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Tweaks</div>
                <div style={{ fontSize: 13, color: C.white, lineHeight: 1.55 }}>{selectedLog.log.tweaks}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// ── COACH DASHBOARD ───────────────────────────────────────────────────────────

// Compute a tier-change suggestion for an athlete based on the last 14 days
// of strong ratings. Returns null if no suggestion, otherwise:
//   { direction: "up" | "down", reason: "...", suggestedTierId: "high"|... }
function computeTierSuggestion(athlete, logs) {
  const currentTierId = athlete.volume_tier || DEFAULT_VOLUME_TIER;
  const currentIdx = VOLUME_TIERS.findIndex(t => t.id === currentTierId);
  if (currentIdx < 0) return null;

  // Split logs into two 7-day windows: last 7 days and days 8-14.
  const todayStr = localDateStr();
  const [ty, tm, td] = todayStr.split("-").map(Number);
  const today = new Date(ty, tm - 1, td);
  const cutoff7 = new Date(today); cutoff7.setDate(cutoff7.getDate() - 7);
  const cutoff14 = new Date(today); cutoff14.setDate(cutoff14.getDate() - 14);
  const toDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const week1 = logs.filter(l => { const d = toDate(l.date); return d > cutoff7 && d <= today; });
  const week2 = logs.filter(l => { const d = toDate(l.date); return d > cutoff14 && d <= cutoff7; });
  const ratings1 = week1.filter(l => l.strong != null).map(l => l.strong);
  const ratings2 = week2.filter(l => l.strong != null).map(l => l.strong);

  // Tier UP rule: both weeks have 2+ ratings AND all are 2.
  if (currentIdx < VOLUME_TIERS.length - 1
      && ratings1.length >= 2 && ratings1.every(r => r === 2)
      && ratings2.length >= 2 && ratings2.every(r => r === 2)) {
    const count = ratings1.length + ratings2.length;
    const suggestedTierId = VOLUME_TIERS[currentIdx + 1].id;
    return {
      direction: "up",
      reason: `Felt notably good ${count} times across the last 2 weeks — could likely handle more volume.`,
      suggestedTierId,
    };
  }

  // Tier DOWN rule: both weeks have 2+ ratings AND average < 1.
  const avg = (arr) => arr.reduce((s, v) => s + v, 0) / arr.length;
  if (currentIdx > 0
      && ratings1.length >= 2 && avg(ratings1) < 1
      && ratings2.length >= 2 && avg(ratings2) < 1) {
    const suggestedTierId = VOLUME_TIERS[currentIdx - 1].id;
    return {
      direction: "down",
      reason: "Felt below normal across the last 2 weeks — current volume may be too high.",
      suggestedTierId,
    };
  }

  return null;
}

function VolumeTiersPage({ athletes, onUpdateAthlete }) {
  // Sort: by name. Stable, predictable order so coaches can find athletes.
  const sorted = [...athletes].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

  // Per-row "just saved" pulse + optimistic local overrides so the UI
  // updates instantly when a tier is tapped, without waiting for the
  // network round-trip or relying on parent re-render timing.
  const [justSaved, setJustSaved] = useState({});
  const [localTiers, setLocalTiers] = useState({}); // athlete.id -> tierId override
  const pickTier = async (athlete, tierId) => {
    const effectiveCurrent = localTiers[athlete.id] || athlete.volume_tier || DEFAULT_VOLUME_TIER;
    if (effectiveCurrent === tierId) return;
    // Optimistic: flip the UI right now
    setLocalTiers(prev => ({ ...prev, [athlete.id]: tierId }));
    setJustSaved(prev => ({ ...prev, [athlete.id]: Date.now() }));
    setTimeout(() => setJustSaved(prev => {
      const next = { ...prev }; delete next[athlete.id]; return next;
    }), 1400);
    // Fire the save in the background
    await onUpdateAthlete({ ...athlete, volume_tier: tierId });
  };

  // Fetch the last 14 days of fatigue_logs for all athletes shown on the
  // page, in one query. Used to compute per-athlete tier suggestions.
  const [logsByAthlete, setLogsByAthlete] = useState({});
  useEffect(() => {
    if (athletes.length === 0) return;
    const ids = athletes.map(a => a.id);
    const todayStr = localDateStr();
    const [ty, tm, td] = todayStr.split("-").map(Number);
    const dt = new Date(ty, tm - 1, td); dt.setDate(dt.getDate() - 14);
    const since = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    sb.from("fatigue_logs").select("athlete_id,date,sleep,strong,strong_na").in("athlete_id", ids).gte("date", since)
      .then(({ data, error }) => {
        if (error) { console.warn("[VolumeTiers] logs fetch error:", error); return; }
        const byA = {};
        (data || []).forEach(r => { (byA[r.athlete_id] = byA[r.athlete_id] || []).push(r); });
        setLogsByAthlete(byA);
      });
    // Only refetch when the actual set of athletes changes — not on every
    // tier update, which would otherwise re-fire this query for nothing.
  }, [athletes.map(a => a.id).join(",")]);

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
          const currentTier = localTiers[a.id] || a.volume_tier || DEFAULT_VOLUME_TIER;
          const saved = !!justSaved[a.id];
          // Compute suggestion against the optimistic tier so the pill
          // disappears immediately after a tap that fulfills it.
          const suggestion = computeTierSuggestion({ ...a, volume_tier: currentTier }, logsByAthlete[a.id] || []);
          const suggestedColor = suggestion?.direction === "up" ? "#3d9e7a" : "#c08a3a";
          return (
            <div key={a.id} style={{ background: C.gray, border: `1px solid ${saved ? "#3d9e7a" : C.border}`, borderRadius: 8, padding: "14px 16px", transition: "border-color 0.3s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div style={{ minWidth: 160, flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: C.white, marginBottom: 3, display: "flex", alignItems: "center", gap: 8 }}>
                    {a.name}
                    {a.has_recoverbuddy && <span style={{ ...mono, fontSize: 9, padding: "2px 6px", borderRadius: 4, background: "rgba(224,122,58,0.15)", color: C.orange, letterSpacing: 0.5 }}>RECOVERBUDDY</span>}
                  </div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <Badge type={a.type} />
                    {a.level && <span style={{ ...mono, fontSize: 10, color: C.muted }}>{a.level}</span>}
                    {saved && <span style={{ ...mono, fontSize: 10, color: "#3d9e7a" }}>✓ saved</span>}
                  </div>
                  {(a.age || a.weekly_frequency || a.peak_grade_v_ever || a.peak_grade_yds_ever || a.typical_grade_v || a.typical_grade_yds) && (
                    <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>
                      {(() => {
                        const aLogs = (logsByAthlete[a.id] || []).filter(l => l.sleep != null && l.sleep > 0);
                        const last7 = aLogs.slice(0, 7);
                        const avgSlp = last7.length > 0 ? (last7.reduce((s, l) => s + l.sleep, 0) / last7.length).toFixed(1) : null;
                        return (
                          <>
                            {a.age && <span>AGE {a.age}</span>}
                            {(a.peak_grade_v_ever) && <span> · PEAK {a.peak_grade_v_ever}</span>}
                            {(a.typical_grade_v) && <span> · TYPICAL {a.typical_grade_v}</span>}
                            {a.weekly_frequency && <span> · TRAINS {a.weekly_frequency}x/wk</span>}
                            {a.avg_sleep_reported && <span> · AVG SLEEP {a.avg_sleep_reported}h (self-reported)</span>}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {VOLUME_TIERS.map(t => {
                    const isActive = t.id === currentTier;
                    const isSuggested = suggestion?.suggestedTierId === t.id && !isActive;
                    return (
                      <button key={t.id} onClick={() => pickTier(a, t.id)}
                        style={{
                          ...mono, fontSize: 11, padding: "8px 12px", borderRadius: 6,
                          border: `1px solid ${isActive ? C.orange : (isSuggested ? suggestedColor : C.border)}`,
                          background: isActive ? "rgba(224,122,58,0.12)" : (isSuggested ? `${suggestedColor}22` : "transparent"),
                          color: isActive ? C.orange : (isSuggested ? suggestedColor : C.muted),
                          cursor: "pointer",
                          fontWeight: isActive ? 600 : 400,
                          minWidth: 64,
                          boxShadow: isSuggested ? `0 0 0 2px ${suggestedColor}33` : "none",
                        }}>
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              {suggestion && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{
                    ...mono, fontSize: 10, padding: "4px 10px", borderRadius: 12,
                    background: `${suggestedColor}1f`, color: suggestedColor, fontWeight: 600, whiteSpace: "nowrap",
                    border: `1px solid ${suggestedColor}55`,
                  }}>
                    {suggestion.direction === "up" ? "↑ Consider " : "↓ Consider "}
                    {VOLUME_TIERS.find(t => t.id === suggestion.suggestedTierId)?.label}
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, flex: 1 }}>
                    {suggestion.reason}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoachDashboard({ athletes, allAthletes, plans, progress, credentials, coaches, isAdmin, coachId, templates = [], onSaveTemplate, onDeleteTemplate, onUpdateCredentials, onUpdateCoachPassword, onPlanChange, onPublish, onProgressChange, onResetProgress, onOverflowChange, onEditExercise, onAddAthlete, onUpdateAthlete, onDeleteAthlete, onAddCoach, onDeleteCoach, onUpdateCoach, onLogout, saved, darkMode, onToggleDark, unreadComments, onOpenInbox }) {
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
  const [newAthlete, setNewAthlete] = useState({ name: "", type: "Youth Comp", level: "", volume_tier: DEFAULT_VOLUME_TIER, has_plan: true, has_recoverbuddy: false });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingAthlete, setEditingAthlete] = useState(null);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [showBackups, setShowBackups] = useState(false);
  const [backups, setBackups] = useState([]);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [archiveLabel, setArchiveLabel] = useState("");
  const [archiveStep, setArchiveStep] = useState("label"); // label | structure
  const [archiveSaving, setArchiveSaving] = useState(false);
  const [showArchiveList, setShowArchiveList] = useState(false);
  const [archives, setArchives] = useState([]);
  const [loadingArchives, setLoadingArchives] = useState(false);
  const [viewingArchive, setViewingArchive] = useState(null); // { label, plan_data, progress_data, archived_at }
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
      : selectedId === SIMULATOR_PAGE_ID
        ? { id: SIMULATOR_PAGE_ID, name: "Simulator" }
        : selectedId === ATHLETE_LOGS_PAGE_ID
          ? { id: ATHLETE_LOGS_PAGE_ID, name: "Athlete Logs" }
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
  const openArchiveModal = () => {
    setArchiveLabel("");
    setArchiveStep("label");
    setShowArchiveModal(true);
  };
  const saveArchive = async (keepStructure) => {
    if (!selectedId || !archiveLabel.trim()) return;
    setArchiveSaving(true);
    const currentPlan = plans[selectedId];
    const currentProgress = progress[selectedId] || {};
    await dbSaveArchive(selectedId, archiveLabel.trim(), currentPlan, currentProgress);
    // Build new plan
    const newPlan = keepStructure
      ? { weeks: currentPlan.weeks.map(wk => ({ label: wk.label, days: wk.days.map(d => ({ label: d.label, exercises: d.exercises.map(e => ({ ...e, id: uid() })) })) })), published: [], blockStart: "", blockEnd: "", blockNotes: "", blockUpdate: "", blockImageUrl: null }
      : { weeks: [{ label: "Week 1", days: [{ label: "Day 1", exercises: [] }] }], published: [], blockStart: "", blockEnd: "", blockNotes: "", blockUpdate: "", blockImageUrl: null };
    await dbUpsertPlan(selectedId, newPlan);
    // Clear progress in DB
    await sb.from("progress").upsert({ athlete_id: selectedId, data: {} });
    onPlanChange(selectedId, newPlan);
    // Force a fresh progress fetch so parent state reflects the cleared data
    if (onResetProgress) onResetProgress(selectedId);
    setArchiveSaving(false);
    setShowArchiveModal(false);
  };
  const openArchiveList = async () => {
    if (!selectedId) return;
    setLoadingArchives(true);
    setShowArchiveList(true);
    const data = await dbGetArchives(selectedId);
    setArchives(data);
    setLoadingArchives(false);
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
            <div style={{ position: "relative", display: "inline-block" }}>
              <button onClick={() => onOpenInbox(selectedId || null)} style={btnS(false)}>💬 Inbox</button>
              {unreadComments?.length > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#c0392b", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadComments.length}</span>}
            </div>
            {selectedId && <button onClick={openBackups} style={btnS(false)} title="Restore backup">↩ Backup</button>}
            {selectedId && selectedId !== TEMPLATE_CREATOR_ID && selectedId !== VOLUME_TIERS_PAGE_ID && selectedId !== SIMULATOR_PAGE_ID && selectedId !== ATHLETE_LOGS_PAGE_ID && <button onClick={openArchiveModal} style={btnS(false)} title="Archive block">📦 Archive</button>}
            {selectedId && selectedId !== TEMPLATE_CREATOR_ID && selectedId !== VOLUME_TIERS_PAGE_ID && selectedId !== SIMULATOR_PAGE_ID && selectedId !== ATHLETE_LOGS_PAGE_ID && <button onClick={openArchiveList} style={btnS(false)} title="View archives">🗂 Archives</button>}
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
            {sidebarOpen && <span style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: C.muted, whiteSpace: "nowrap" }}>Athletes</span>}
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
                  <div style={{ ...mono, fontSize: 10, color: C.muted }}>scratch pad → save as ★</div>
                </button>
              </div>
              {/* Volume Tiers — fixed entry */}
              <div style={{ marginBottom: 6 }}>
                <button onClick={() => setSelectedId(VOLUME_TIERS_PAGE_ID)} style={{ width: "100%", textAlign: "left", background: selectedId===VOLUME_TIERS_PAGE_ID?"rgba(224,122,58,0.10)":"none", border: `1px solid ${selectedId===VOLUME_TIERS_PAGE_ID?C.orange:"rgba(224,122,58,0.3)"}`, borderRadius: 6, padding: "9px 12px", cursor: "pointer" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.orange, marginBottom: 2 }}>Volume Tiers</div>
                  <div style={{ ...mono, fontSize: 10, color: C.muted }}>set athlete training capacity</div>
                </button>
              </div>
              {/* Simulator — fixed entry */}
              <div style={{ marginBottom: 6 }}>
                <button onClick={() => setSelectedId(SIMULATOR_PAGE_ID)} style={{ width: "100%", textAlign: "left", background: selectedId===SIMULATOR_PAGE_ID?"rgba(224,122,58,0.10)":"none", border: `1px solid ${selectedId===SIMULATOR_PAGE_ID?C.orange:"rgba(224,122,58,0.3)"}`, borderRadius: 6, padding: "9px 12px", cursor: "pointer" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.orange, marginBottom: 2 }}>Simulator</div>
                  <div style={{ ...mono, fontSize: 10, color: C.muted }}>test fatigue model with hypothetical data</div>
                </button>
              </div>
              <div style={{ marginBottom: 6 }}>
                <button onClick={() => setSelectedId(ATHLETE_LOGS_PAGE_ID)} style={{ width: "100%", textAlign: "left", background: selectedId===ATHLETE_LOGS_PAGE_ID?"rgba(61,158,122,0.10)":"none", border: `1px solid ${selectedId===ATHLETE_LOGS_PAGE_ID?C.orange:"rgba(61,158,122,0.3)"}`, borderRadius: 6, padding: "9px 12px", cursor: "pointer" }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.orange, marginBottom: 2 }}>Athlete Logs</div>
                  <div style={{ ...mono, fontSize: 10, color: C.muted }}>RecoverBuddy athletes — sleep, load, strength</div>
                </button>
              </div>
              <div style={{ borderBottom: `1px solid ${C.border}`, marginBottom: 6 }} />
              {athletes.map(a => (
                <div key={a.id} style={{ position: "relative", marginBottom: 2 }}
                  onMouseEnter={e => { const b=e.currentTarget.querySelector(".athlete-actions"); if(b) b.style.opacity="1"; }}
                  onMouseLeave={e => { const b=e.currentTarget.querySelector(".athlete-actions"); if(b) b.style.opacity="0"; }}>
                  <button onClick={() => setSelectedId(a.id)} style={{ width: "100%", textAlign: "left", background: selectedId===a.id?C.gray2:"none", border: `1px solid ${selectedId===a.id?C.orange:"transparent"}`, borderRadius: 6, padding: "10px 52px 10px 12px", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.white }}>{a.name}</div>
                      {unreadComments?.some(c => c.athlete_id === a.id) && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.orange, flexShrink: 0 }} />}
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}><Badge type={a.type} /><span style={{ ...mono, fontSize: 10, color: C.muted }}>{a.level}</span></div>
                    {plans[a.id]?.published?.length > 0 && <div style={{ ...mono, fontSize: 10, color: C.orange, marginTop: 3 }}>{plans[a.id].published.length} week{plans[a.id].published.length!==1?"s":""} live</div>}
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
          ) : selectedId === SIMULATOR_PAGE_ID ? (
            <SimulatorPage />
          ) : selectedId === ATHLETE_LOGS_PAGE_ID ? (
            <AthleteLogsPage athletes={athletes} getVolumeMultiplier={getVolumeMultiplier} />
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
                      <div style={{ ...mono, fontSize: 10, color: "#4a7aab", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
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
                                  {ex.fromWeek != null && <span style={{ ...mono, fontSize: 10, color: "#4a7aab", background: "rgba(91,127,166,0.1)", padding: "2px 6px", borderRadius: 3 }}>W{ex.fromWeek + 1} · Day {ex.fromDay + 1}</span>}
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
                <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>{f.label}</div>
                <input value={editingAthlete[f.key] || ""} onChange={e => setEditingAthlete(p=>({...p,[f.key]:e.target.value}))} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>Type</div>
              <select value={editingAthlete.type || "Youth Comp"} onChange={e => setEditingAthlete(p=>({...p,type:e.target.value}))} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                {["Youth Comp","Adult Performance","Adult Recreational"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>Volume Tier</div>
              <select value={editingAthlete.volume_tier || DEFAULT_VOLUME_TIER} onChange={e => setEditingAthlete(p=>({...p,volume_tier:e.target.value}))} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                {VOLUME_TIERS.map(t => <option key={t.id} value={t.id}>{t.label} ({t.multiplier}×)</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 8 }}>Features</div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={editingAthlete.has_plan !== false} onChange={e => setEditingAthlete(p => ({ ...p, has_plan: e.target.checked }))} />
                <span style={{ fontSize: 13, color: C.white }}>Training plan</span>
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: !isAdmin && !editingAthlete.has_recoverbuddy ? "default" : "pointer", opacity: !isAdmin ? 0.6 : 1 }}>
                <input type="checkbox" checked={!!editingAthlete.has_recoverbuddy} disabled={!isAdmin} onChange={e => setEditingAthlete(p => ({ ...p, has_recoverbuddy: e.target.checked }))} />
                <span style={{ fontSize: 13, color: C.white }}>RecoverBuddy {!isAdmin && <span style={{ ...mono, fontSize: 9, color: C.muted, marginLeft: 6 }}>(admin only)</span>}</span>
              </label>
              <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 6 }}>At least one feature must be enabled.</div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setEditingAthlete(null)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => {
                if (!editingAthlete.name.trim()) return;
                if (editingAthlete.has_plan === false && !editingAthlete.has_recoverbuddy) { alert("Enable at least one feature (Training plan or RecoverBuddy)."); return; }
                onUpdateAthlete({ ...editingAthlete, has_plan: editingAthlete.has_plan !== false, has_recoverbuddy: !!editingAthlete.has_recoverbuddy });
                setEditingAthlete(null);
              }} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Save</button>
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
                <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>{f.label}</div>
                <input value={newAthlete[f.key]} onChange={e => setNewAthlete(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>Type</div>
              <select value={newAthlete.type} onChange={e => setNewAthlete(p=>({...p,type:e.target.value}))} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                {["Youth Comp","Adult Performance","Adult Recreational"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 5 }}>Volume Tier</div>
              <select value={newAthlete.volume_tier || DEFAULT_VOLUME_TIER} onChange={e => setNewAthlete(p=>({...p,volume_tier:e.target.value}))} style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "9px 12px", color: C.white, fontSize: 13, outline: "none" }}>
                {VOLUME_TIERS.map(t => <option key={t.id} value={t.id}>{t.label} ({t.multiplier}×)</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ ...mono, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: C.muted, marginBottom: 8 }}>Features</div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={newAthlete.has_plan !== false} onChange={e => setNewAthlete(p => ({ ...p, has_plan: e.target.checked }))} />
                <span style={{ fontSize: 13, color: C.white }}>Training plan</span>
              </label>
              {isAdmin && (
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <input type="checkbox" checked={!!newAthlete.has_recoverbuddy} onChange={e => setNewAthlete(p => ({ ...p, has_recoverbuddy: e.target.checked }))} />
                  <span style={{ fontSize: 13, color: C.white }}>RecoverBuddy</span>
                </label>
              )}
              <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 6 }}>RecoverBuddy adds the onboarding survey and recovery-only mode. At least one feature must be enabled.</div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowAdd(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => {
                if (!newAthlete.name.trim()) return;
                if (newAthlete.has_plan === false && !newAthlete.has_recoverbuddy) { alert("Enable at least one feature (Training plan or RecoverBuddy)."); return; }
                onAddAthlete({ id: uid(), ...newAthlete, volume_tier: newAthlete.volume_tier || DEFAULT_VOLUME_TIER, has_plan: newAthlete.has_plan !== false, has_recoverbuddy: !!newAthlete.has_recoverbuddy, coach_id: coachId || 'admin' });
                setShowAdd(false);
                setNewAthlete({ name: "", type: "Youth Comp", level: "", volume_tier: DEFAULT_VOLUME_TIER, has_plan: true, has_recoverbuddy: false });
              }} style={{ ...mono, fontSize: 11, padding: "8px 16px", background: C.orange, border: "none", borderRadius: 5, color: "#fff", cursor: "pointer" }}>Add</button>
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

      {/* Archive block modal */}
      {showArchiveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 12, width: "100%", maxWidth: 420, padding: 28 }}>
            {archiveStep === "label" ? (
              <>
                <div style={{ ...bebas, fontSize: 22, marginBottom: 6 }}>Archive This Block</div>
                <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>Give this block a name. All exercises, notes, and athlete progress will be saved.</p>
                <input autoFocus value={archiveLabel} onChange={e => setArchiveLabel(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && archiveLabel.trim() && setArchiveStep("structure")}
                  placeholder="e.g. Spring Block 2026..."
                  style={{ width: "100%", background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.white, fontSize: 14, outline: "none", marginBottom: 16 }} />
                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                  <button onClick={() => setShowArchiveModal(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Cancel</button>
                  <button onClick={() => { if (archiveLabel.trim()) setArchiveStep("structure"); }} disabled={!archiveLabel.trim()}
                    style={{ ...mono, fontSize: 11, padding: "8px 16px", background: archiveLabel.trim() ? C.orange : C.gray3, border: "none", borderRadius: 5, color: "#fff", cursor: archiveLabel.trim() ? "pointer" : "default" }}>Next →</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ ...bebas, fontSize: 22, marginBottom: 6 }}>Start New Block</div>
                <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 20, lineHeight: 1.6 }}>How would you like to start the new block?</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  <button onClick={() => saveArchive(false)} disabled={archiveSaving}
                    style={{ textAlign: "left", padding: "14px 16px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.gray2, cursor: "pointer" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 3 }}>Start fresh</div>
                    <div style={{ ...mono, fontSize: 11, color: C.muted }}>Blank plan — one empty week and day</div>
                  </button>
                  <button onClick={() => saveArchive(true)} disabled={archiveSaving}
                    style={{ textAlign: "left", padding: "14px 16px", borderRadius: 8, border: `1px solid ${C.orange}`, background: "rgba(61,158,122,0.06)", cursor: "pointer" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.orange, marginBottom: 3 }}>Keep structure</div>
                    <div style={{ ...mono, fontSize: 11, color: C.muted }}>Copy weeks, days, and exercises — clear progress and block info</div>
                  </button>
                </div>
                {archiveSaving && <div style={{ ...mono, fontSize: 11, color: C.muted, textAlign: "center" }}>Archiving...</div>}
                <button onClick={() => setArchiveStep("label")} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>← Back</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Archive list modal */}
      {showArchiveList && !viewingArchive && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: C.gray2, border: `1px solid ${C.border}`, borderRadius: 10, width: 500, maxWidth: "100%", maxHeight: "80vh", overflow: "auto", padding: 28 }}>
            <div style={{ ...bebas, fontSize: 22, marginBottom: 4 }}>Archived Blocks</div>
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 20 }}>{athletes.find(a => a.id === selectedId)?.name} — tap a block to view it.</p>
            {loadingArchives && <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 24 }}>Loading...</div>}
            {!loadingArchives && archives.length === 0 && <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 24 }}>No archived blocks yet.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {archives.map(a => {
                const d = new Date(a.archived_at);
                const weekCount = a.plan_data?.weeks?.length || 0;
                const exCount = (a.plan_data?.weeks || []).reduce((n, w) => n + (w.days || []).reduce((m, d2) => m + (d2.exercises || []).length, 0), 0);
                return (
                  <button key={a.id} onClick={() => setViewingArchive(a)}
                    style={{ textAlign: "left", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.white, marginBottom: 3 }}>{a.label}</div>
                      <div style={{ ...mono, fontSize: 10, color: C.muted }}>{weekCount} weeks · {exCount} exercises · {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                    </div>
                    <span style={{ ...mono, fontSize: 18, color: C.muted }}>›</span>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={() => setShowArchiveList(false)} style={{ ...mono, fontSize: 11, padding: "8px 14px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: C.muted, cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* View archived block — read-only */}
      {viewingArchive && (
        <div style={{ position: "fixed", inset: 0, background: C.black, zIndex: 500, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          <div style={{ background: C.gray, borderBottom: `1px solid ${C.border}`, padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <button onClick={() => setViewingArchive(null)} style={{ ...mono, fontSize: 13, padding: "8px 12px", background: "none", border: `1px solid ${C.border}`, borderRadius: 6, color: C.white, cursor: "pointer" }}>‹ Back</button>
            <div>
              <div style={{ ...bebas, fontSize: 20, color: C.white }}>{viewingArchive.label}</div>
              <div style={{ ...mono, fontSize: 10, color: C.muted }}>{athletes.find(a => a.id === selectedId)?.name} · Archived {new Date(viewingArchive.archived_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
            </div>
          </div>
          <div style={{ flex: 1, padding: "24px 20px", maxWidth: 700, margin: "0 auto", width: "100%" }}>
            {viewingArchive.plan_data?.blockNotes && (
              <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
                <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Block Notes</div>
                <div style={{ fontSize: 13, color: C.white, lineHeight: 1.6 }}>{renderMarkdown(viewingArchive.plan_data.blockNotes, C.white)}</div>
              </div>
            )}
            {(viewingArchive.plan_data?.weeks || []).map((wk, wi) => (
              <div key={wi} style={{ marginBottom: 28 }}>
                <div style={{ ...bebas, fontSize: 20, color: C.orange, marginBottom: 12 }}>{wk.label}</div>
                {(wk.days || []).map((day, di) => {
                  const progKey = `w${wi}_d${di}`;
                  const dayProg = (viewingArchive.progress_data || {})[progKey] || {};
                  return (
                    <div key={di} style={{ marginBottom: 16 }}>
                      <div style={{ ...mono, fontSize: 11, color: C.muted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>{day.label}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {(day.exercises || []).map(ex => {
                          const ep = dayProg[ex.id] || {};
                          return (
                            <div key={ex.id} style={{ background: ep.checked ? "rgba(61,158,122,0.06)" : C.gray, border: `1px solid ${ep.checked ? "rgba(61,158,122,0.4)" : C.border}`, borderRadius: 8, padding: "12px 14px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ex.notes || ep.note ? 6 : 0 }}>
                                <div style={{ width: 22, height: 22, borderRadius: 5, border: `2px solid ${ep.checked ? "#2aaa5e" : C.gray3}`, background: ep.checked ? "#2aaa5e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  {ep.checked && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 14, fontWeight: 500, color: ep.checked ? C.muted : C.white, textDecoration: ep.checked ? "line-through" : "none" }}>{ex.text}</div>
                                  {ex.sets && <div style={{ ...mono, fontSize: 12, color: C.orange }}>{ex.sets}</div>}
                                </div>
                              </div>
                              {ex.notes && <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: ep.note ? 4 : 0 }}>{ex.notes}</div>}
                              {ep.note && (
                <div style={{ marginTop: 4 }}>
                  <div style={{ ...mono, fontSize: 11, color: C.purple, fontStyle: "italic", background: "rgba(91,127,166,0.08)", padding: "5px 8px", borderRadius: ep._coachReply ? "5px 5px 0 0" : 5 }}>📝 {ep.note}</div>
                  {ep._coachReply && <div style={{ ...mono, fontSize: 11, color: C.orange, background: "rgba(61,158,122,0.08)", padding: "5px 8px", borderRadius: "0 0 5px 5px", borderTop: `1px solid ${C.border}` }}>💬 Coach: {ep._coachReply}</div>}
                </div>
              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
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
            <p style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 20 }}>Save days, weeks, and full blocks as reusable templates. Apply them to any athlete.</p>
            {templates.length === 0 && (
              <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: "center", padding: 24 }}>
                No templates yet. Save a day, week, or block using the ★ buttons in the plan editor.
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["block","week","day"].map(type => {
                const group = templates.filter(t => t.type === type);
                if (group.length === 0) return null;
                return (
                  <div key={type}>
                    <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6, marginTop: 4 }}>{type} templates</div>
                    {group.map(t => {
                      let summary;
                      if (t.type === "block") {
                        const ws = t.data?.weeks || [];
                        const totalDays = ws.reduce((n, w) => n + (w.days?.length || 0), 0);
                        const totalExs = ws.reduce((n, w) => n + (w.days?.reduce((m, d) => m + (d.exercises?.length || 0), 0) || 0), 0);
                        summary = `${ws.length} weeks · ${totalDays} days · ${totalExs} exercises`;
                      } else if (t.type === "week") {
                        summary = `${t.data.days?.length || 0} days · ${t.data.days?.reduce((n,d) => n + (d.exercises?.length||0), 0)} exercises`;
                      } else {
                        summary = `${t.data.exercises?.length || 0} exercises`;
                      }
                      return (
                        <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: C.gray, border: `1px solid ${C.border}`, borderRadius: 8, marginBottom: 5 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 500, color: C.white }}>{t.name}</div>
                            <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 2 }}>{summary}</div>
                          </div>
                          <button onClick={() => onDeleteTemplate(t.id)} style={{ ...mono, fontSize: 10, padding: "5px 10px", background: "none", border: `1px solid ${C.border}`, borderRadius: 5, color: "#a05555", cursor: "pointer" }}>✕</button>
                        </div>
                      );
                    })}
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
              <div style={{ ...mono, fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Add Coach</div>
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

// ── ERROR BOUNDARY ───────────────────────────────────────────────────────────
class AppErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('[AppErrorBoundary]', err); }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', background: C.black, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 20 }}>
        <div style={{ ...bebas, fontSize: 28, letterSpacing: 2, color: C.white }}>ROCK POINT <span style={{ color: C.orange }}>COACHING</span></div>
        <div style={{ fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 1.6, maxWidth: 300 }}>Something went wrong. Tap below to log out and try again.</div>
        <button onClick={() => {
          try { localStorage.removeItem('rp_session'); } catch(e) {}
          this.setState({ hasError: false });
          window.location.reload();
        }} style={{ ...mono, fontSize: 13, padding: '12px 28px', borderRadius: 8, border: 'none', background: C.orange, color: '#fff', cursor: 'pointer' }}>
          Log Out &amp; Reload
        </button>
      </div>
    );
  }
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
function AppInner() {
  const [darkMode, setDarkMode] = useState(_darkMode);
  C = darkMode ? DARK : LIGHT;
  updateGlobalStyles();
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState([]);
  const [plans, setPlans] = useState({});
  const [progress, setProgress] = useState({});
  const [credentials, setCredentials] = useState({});
  const [coaches, setCoaches] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem("rp_session");
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!parsed?.role) { localStorage.removeItem("rp_session"); return null; }
      if (parsed.role === 'athlete' && !parsed.athleteId) { localStorage.removeItem("rp_session"); return null; }
      return parsed;
    } catch(e) { try { localStorage.removeItem("rp_session"); } catch(_) {} return null; }
  });
  const [saved, setSaved] = useState(false);
  const sessionRoleRef = React.useRef(null);
  // Keep ref in sync so useCallback can read role without depending on session
  sessionRoleRef.current = session?.role || null;
  const [unreadComments, setUnreadComments] = useState([]);
  const [athleteComments, setAthleteComments] = useState({});
  const [showInbox, setShowInbox] = useState(false);
  const [inboxAthleteId, setInboxAthleteId] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [replySaving, setReplySaving] = useState(false);

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
      setAthletes(ath);
      if (ath.length > 0) dbGetUnreadComments(ath.map(a => a.id)).then(setUnreadComments).catch(e => console.warn('[comments] unread fetch failed:', e)); setPlans(pln); setProgress(prg); setCredentials(creds); setCoaches(coachs);
      // Validate sub-coach session — if coachId no longer exists, clear and show login
      setSession(prev => {
        if (!prev || prev.role !== 'coach' || prev.isAdmin) return prev;
        const valid = coachs.some(c => c.id === prev.coachId);
        if (!valid) { try { localStorage.removeItem('rp_session'); } catch(_) {} return null; }
        return prev;
      });
      // Daily backup on app load — runs once per day, uses 'daily' type so edit backups can't overwrite it
      const todayKey = localDateStr();
      if (localStorage.getItem('lastDailyBackup') !== todayKey) {
        Object.entries(pln).forEach(([aid, plan]) => {
          if (plan?.weeks?.length > 0) dbBackupPlan(aid, plan, 'daily');
        });
        Object.entries(prg).forEach(([aid, progress]) => {
          if (Object.keys(progress).length > 0) dbBackupProgress(aid, progress, 'daily');
        });
        // Daily fatigue log backup — fetch all logs per athlete and snapshot
        if (ath.length > 0) {
          sb.from("fatigue_logs").select("*").in("athlete_id", ath.map(a => a.id))
            .order("date", { ascending: false })
            .then(({ data: allFatigueLogs }) => {
              if (!allFatigueLogs) return;
              const byAthlete = {};
              allFatigueLogs.forEach(row => {
                (byAthlete[row.athlete_id] = byAthlete[row.athlete_id] || []).push(row);
              });
              Object.entries(byAthlete).forEach(([aid, logs]) => {
                if (logs.length > 0) dbBackupFatigueLogs(aid, logs, 'daily');
              });
            });
        }
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
    if (ep?.note?.trim() && sessionRoleRef.current === 'athlete') {
      try {
        const m = dayKey.match(/w(\d+)_d(\d+)/);
        if (m) dbSaveAthleteComment(id, parseInt(m[1]), parseInt(m[2]), exId, ep.note.trim());
      } catch(e) { console.warn('[comments] write failed:', e); }
    }
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
      onLoginAthlete={(id) => {
        const s = { role: "athlete", athleteId: id };
        try { localStorage.setItem("rp_session", JSON.stringify(s)); } catch(e) {}
        setSession(s);
      }}
      onLoginCoach={() => {
        const s = { role: "coach", isAdmin: true };
        try { localStorage.setItem("rp_session", JSON.stringify(s)); } catch(e) {}
        setSession(s);
      }}
      onLoginSubCoach={(coachId) => {
        const s = { role: "coach", isAdmin: false, coachId };
        try { localStorage.setItem("rp_session", JSON.stringify(s)); } catch(e) {}
        setSession(s);
      }} />
  );

  React.useEffect(() => {
    if (session?.role !== 'athlete' || !session?.athleteId) return;
    dbGetCommentsForAthlete(session.athleteId).then(comments => {
      const replies = comments.filter(c => c.author === 'coach');
      if (!replies.length) return;
      setProgress(prev => {
        const ap = { ...(prev[session.athleteId] || {}) };
        replies.forEach(r => {
          const dk = `w${r.plan_week}_d${r.plan_day}`;
          const dp = { ...(ap[dk] || {}) };
          dp[r.exercise_id] = { ...(dp[r.exercise_id] || {}), _coachReply: r.body };
          ap[dk] = dp;
        });
        return { ...prev, [session.athleteId]: ap };
      });
      dbMarkCommentsReadByAthlete(session.athleteId);
    }).catch(e => console.warn('[comments] athlete fetch failed silently:', e));
  }, [session?.athleteId, session?.role]);

  if (session.role === "athlete") {
    const athlete = athletes.find(a => a.id === session.athleteId);
    return <AthleteView athlete={athlete} plan={plans[session.athleteId]} progress={progress[session.athleteId] || {}}
      onProgressChange={(d, e, ep) => updateProgress(session.athleteId, d, e, ep)}
      darkMode={darkMode} onToggleDark={() => { const n = !darkMode; setDarkMode(n); localStorage.setItem("rp_dark", n?"1":"0"); }}
      onOverflowChange={(ov) => updateOverflow(session.athleteId, ov)}
      onEditExercise={(d, ex) => editExercise(session.athleteId, d, ex)}
      onLogout={() => { try { localStorage.removeItem("rp_session"); } catch(e) {} setSession(null); }} />;
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
    unreadComments={unreadComments}
    onOpenInbox={async (athleteId) => {
      setInboxAthleteId(athleteId || null);
      setShowInbox(true);
      if (athleteId) {
        const cs = await dbGetCommentsForAthlete(athleteId);
        setAthleteComments(prev => ({ ...prev, [athleteId]: cs }));
        await dbMarkCommentsReadByCoach(athleteId);
        setUnreadComments(prev => prev.filter(c => c.athlete_id !== athleteId));
      } else {
        const grouped = {};
        for (const c of unreadComments) { if (!grouped[c.athlete_id]) grouped[c.athlete_id] = []; grouped[c.athlete_id].push(c); }
        setAthleteComments(grouped);
      }
    }}
    onProgressChange={updateProgress}
    onResetProgress={async (id) => {
      await sb.from("progress").upsert({ athlete_id: id, data: {} });
      setProgress(prev => ({ ...prev, [id]: {} }));
    }}
    darkMode={darkMode} onToggleDark={() => { const n = !darkMode; setDarkMode(n); localStorage.setItem("rp_dark", n?"1":"0"); }}
    onOverflowChange={updateOverflow}
    onEditExercise={editExercise}
    onAddAthlete={addAthlete}
    onUpdateAthlete={updateAthlete}
    onDeleteAthlete={deleteAthlete}
    onAddCoach={addCoach}
    onDeleteCoach={deleteCoach}
    onUpdateCoach={updateCoach}
    onLogout={() => { try { localStorage.removeItem("rp_session"); } catch(e) {} setSession(null); }}
    saved={saved}
  />;

  if (showInbox) return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={() => setShowInbox(false)}>
      <div style={{ background: C.gray, border: `1px solid ${C.border}`, borderRadius: 12, width: '100%', maxWidth: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ ...bebas, fontSize: 22, color: C.white }}>Athlete Notes</div>
            {inboxAthleteId && <div style={{ ...mono, fontSize: 11, color: C.muted, marginTop: 2 }}>{athletes.find(a => a.id === inboxAthleteId)?.name}</div>}
          </div>
          <button onClick={() => setShowInbox(false)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 24px' }}>
          {Object.entries(athleteComments).length === 0 && <div style={{ ...mono, fontSize: 12, color: C.muted, textAlign: 'center', padding: 32 }}>No athlete notes yet.</div>}
          {Object.entries(athleteComments).map(([aid, comments]) => {
            const aName = athletes.find(a => a.id === aid)?.name || aid;
            const plan = plans[aid];
            const notes = comments.filter(c => c.author === 'athlete');
            if (!notes.length) return null;
            return (
              <div key={aid} style={{ marginBottom: 24 }}>
                {!inboxAthleteId && <div style={{ ...bebas, fontSize: 16, color: C.orange, marginBottom: 10 }}>{aName}</div>}
                {notes.map(c => {
                  const wk = plan?.weeks?.[c.plan_week]; const dy = wk?.days?.[c.plan_day];
                  const ex = dy?.exercises?.find(e => e.id === c.exercise_id);
                  const reply = comments.find(r => r.author === 'coach' && r.exercise_id === c.exercise_id);
                  return (
                    <div key={c.id} style={{ background: C.gray2, border: `1px solid ${!c.read_by_coach ? C.orange : C.border}`, borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                      <div style={{ ...mono, fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
                        {wk?.label || `Week ${c.plan_week + 1}`} · {dy?.label || `Day ${c.plan_day + 1}`} · {ex?.text || c.exercise_id}
                      </div>
                      <div style={{ fontSize: 13, color: C.purple, fontStyle: 'italic', marginBottom: reply ? 10 : 8, lineHeight: 1.5 }}>📝 {c.body}</div>
                      {reply ? (
                        <div style={{ fontSize: 12, color: C.orange, lineHeight: 1.5, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>💬 You: {reply.body}</div>
                      ) : (
                        <div>
                          <textarea value={replyDraft} onChange={e => setReplyDraft(e.target.value)} placeholder='Reply to athlete...' rows={2}
                            style={{ width: '100%', background: C.gray, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px', color: C.white, fontSize: 12, outline: 'none', resize: 'none', fontFamily: "'Plus Jakarta Sans',sans-serif", boxSizing: 'border-box', marginBottom: 6 }} />
                          <button disabled={replySaving || !replyDraft.trim()} onClick={async () => {
                            if (!replyDraft.trim()) return;
                            setReplySaving(true);
                            await dbSaveCoachReply(aid, c.plan_week, c.plan_day, c.exercise_id, replyDraft.trim());
                            const updated = await dbGetCommentsForAthlete(aid);
                            setAthleteComments(prev => ({ ...prev, [aid]: updated }));
                            const dk = `w${c.plan_week}_d${c.plan_day}`;
                            const ep = ((progress[aid] || {})[dk] || {})[c.exercise_id] || {};
                            updateProgress(aid, dk, c.exercise_id, { ...ep, _coachReply: replyDraft.trim() });
                            setReplyDraft(''); setReplySaving(false);
                          }} style={{ ...mono, fontSize: 11, padding: '7px 14px', borderRadius: 6, border: 'none', background: replyDraft.trim() ? C.orange : C.gray3, color: '#fff', cursor: replyDraft.trim() ? 'pointer' : 'default' }}>
                            {replySaving ? 'Sending...' : 'Send Reply'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <AppErrorBoundary><AppInner /></AppErrorBoundary>;
}
