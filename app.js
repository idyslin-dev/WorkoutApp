'use strict';

// ======================================================================
// State
// ======================================================================

const STORE_KEY = 'calisthenics.v1';
const WEEK_GOAL = 3;

const PLAN = PHASES.flatMap((p, pi) => {
  const before = PHASES.slice(0, pi).reduce((n, x) => n + x.weeks, 0);
  return Array.from({ length: p.weeks }, (_, w) =>
    p.days.map((wid, d) => ({ wid, boost: p.boost, phase: pi, week: before + w + 1, day: d + 1 }))).flat();
});

function defaultState() {
  return {
    settings: { voice: true, beeps: true, location: 'home', locations: structuredClone(DEFAULT_LOCATIONS) },
    levels: { ...START_LEVELS },
    streaks: {},
    plan: { idx: 0, cycle: 1 },
    history: [],
    lastPain: { back: 3, knee: 3 },
    onboarded: false,
  };
}

function load() {
  const base = defaultState();
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY));
    if (s) {
      return {
        ...base, ...s,
        settings: { ...base.settings, ...s.settings, locations: { ...base.settings.locations, ...(s.settings || {}).locations } },
        levels: { ...base.levels, ...s.levels },
      };
    }
  } catch { /* fall through */ }
  return base;
}

function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* storage unavailable */ }
}

let state = load();

// ======================================================================
// Helpers
// ======================================================================

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ex = id => EX[id];
const workout = id => WORKOUTS.find(w => w.id === id);
const fmtMin = sec => `${Math.max(1, Math.round(sec / 60))} min`;
const fmtClock = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const dayKey = d => new Date(d).toDateString();

function weekStart(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x.getTime();
}

const ICON = {
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>',
  plan: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M8 14l2 2 4-4"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-7"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  play: '<path d="M7 4l13 8-13 8z" fill="currentColor"/>',
  pause: '<path d="M7 4h3v16H7zM14 4h3v16h-3z" fill="currentColor"/>',
  next: '<path d="M5 4l10 8-10 8zM19 5v14"/>',
  prev: '<path d="M19 20L9 12l10-8zM5 19V5"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
  chev: '<path d="M9 18l6-6-6-6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  voice: '<path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  mute: '<path d="M11 5L6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6"/>',
  down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  video: '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="M17 10l4-2v8l-4-2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15l-5-5L5 21"/>',
  check: '<path d="M5 12l5 5L20 7"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
};
const icon = (name, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[name]}</svg>`;

// ======================================================================
// Workout engine: resolves slots to exercises for the current place, level and pain
// ======================================================================

const capFor = p => (p >= 7 ? 0 : p >= 4 ? 1 : 2);
const scaleFor = p => (p >= 7 ? 0.6 : p >= 4 ? 0.8 : 1);
const painMode = p => (p >= 7 ? { label: 'Protective mode', cls: 'red', text: 'Only the gentlest versions, with lower volume.' }
  : p >= 4 ? { label: 'Gentler versions', cls: 'amber', text: 'Demanding moves are swapped and volume is trimmed.' }
  : { label: 'Train normally', cls: 'green', text: 'Mild discomfort is OK. Strengthening is the goal.' });

function makeCtx(pain = state.lastPain, location = state.settings.location) {
  return {
    equip: new Set(state.settings.locations[location].equip),
    cap: { k: capFor(pain.knee), b: capFor(pain.back) },
    pain,
  };
}

function allowed(id, ctx, ignorePain = false) {
  const e = ex(id);
  if ((e.e || []).some(q => !ctx.equip.has(q))) return false;
  return ignorePain || ((e.k || 0) <= ctx.cap.k && (e.b || 0) <= ctx.cap.b);
}

function resolveSlot(slot, ctx, levelOverride) {
  if (slot.x) {
    let id = slot.x;
    while (id && !allowed(id, ctx)) id = ex(id).alt;
    return id ? { id, fam: null } : null;
  }
  const ladder = FAMILIES[slot.f].ex;
  const level = levelOverride ?? state.levels[slot.f];
  const ok = ladder.map((id, i) => ({ id, i })).filter(o => allowed(o.id, ctx));
  if (!ok.length) return FAMILIES[slot.f].fb ? resolveSlot({ ...slot, f: FAMILIES[slot.f].fb }, ctx) : null;
  const below = ok.filter(o => o.i <= level);
  const pick = below.length ? below[below.length - 1] : ok[0];
  return { id: pick.id, fam: slot.f, idx: pick.i, atLevel: pick.i === level };
}

function doseFor(id, slot, ctx) {
  const e = ex(id);
  const type = slot.timed ? 's' : e.t;
  const base = slot.timed || (slot.x === id && slot.d) || (slot.f && e.t === 's' && slot.d) || e.d;
  let scale = slot.scale || 1;
  if (e.k) scale = Math.min(scale, (slot.scale || 1) * scaleFor(ctx.pain.knee));
  if (e.b) scale = Math.min(scale, (slot.scale || 1) * scaleFor(ctx.pain.back));
  const v = base * scale;
  return { type, dose: type === 's' ? Math.max(10, Math.round(v / 5) * 5) : Math.max(3, Math.round(v)) };
}

function resolveWorkout(w, boost, ctx) {
  return w.blocks.map((b, bi) => {
    const rounds = (b.rounds || 1) + (b.kind ? 0 : boost);
    const items = b.items.map((slot, ii) => {
      const res = resolveSlot(slot, ctx);
      if (!res) return null;
      return { key: `${bi}.${ii}`, slot, ...res, ...doseFor(res.id, slot, ctx), amrap: !!slot.timed };
    }).filter(Boolean);
    return { ...b, rounds, items };
  }).filter(b => b.items.length);
}

function buildSteps(blocks) {
  const steps = [];
  blocks.forEach((b, bi) => {
    for (let r = 1; r <= b.rounds; r++) {
      b.items.forEach((it, ii) => {
        steps.push({ kind: 'ex', ...it, block: b.n, round: r, rounds: b.rounds });
        const last = ii === b.items.length - 1;
        if (!last && b.rest) steps.push({ kind: 'rest', dur: b.rest });
        if (last && r < b.rounds && b.roundRest) steps.push({ kind: 'rest', dur: b.roundRest, label: `Round ${r} of ${b.rounds} done` });
      });
    }
    if (bi < blocks.length - 1) steps.push({ kind: 'rest', dur: 15, label: `${b.n} complete` });
  });
  return steps;
}

function stepSeconds(s) {
  if (s.kind === 'rest') return s.dur;
  const e = ex(s.id);
  const sides = e.s ? 2 : 1;
  return s.type === 's' ? s.dose * sides + 4 : s.dose * (e.tempo || 3) * sides + 6;
}

const estimate = blocks => buildSteps(blocks).reduce((t, s) => t + stepSeconds(s), 0);

function doseLabel(s) {
  const e = ex(s.id);
  const side = e.s ? ' each side' : '';
  if (s.amrap) return `${s.dose}s · max good reps`;
  return s.type === 's' ? `${s.dose}s${side}` : `${s.dose} reps${side}`;
}

// ======================================================================
// Stats
// ======================================================================

function stats() {
  const h = state.history;
  const thisWeek = h.filter(x => weekStart(x.date) === weekStart(Date.now())).length;
  const counts = {};
  h.forEach(x => { const k = weekStart(x.date); counts[k] = (counts[k] || 0) + 1; });
  let streak = 0;
  let wk = weekStart(Date.now());
  if ((counts[wk] || 0) < WEEK_GOAL) wk -= 7 * 864e5;
  while ((counts[wk] || 0) >= WEEK_GOAL) { streak++; wk = weekStart(wk - 3 * 864e5); }
  const minutes = Math.round(h.reduce((t, x) => t + x.dur, 0) / 60);
  return { thisWeek, streak, total: h.length, minutes };
}

function personalBests() {
  const best = {};
  state.history.forEach(x => x.sets.forEach(s => {
    if (s.amrap || !s.actual) return;
    if (!best[s.id] || s.actual > best[s.id].v) best[s.id] = { v: s.actual, type: s.type, date: x.date };
  }));
  return Object.entries(best).filter(([id]) => FAMILIES[Object.keys(FAMILIES).find(f => FAMILIES[f].ex.includes(id))])
    .sort((a, b) => b[1].date.localeCompare(a[1].date)).slice(0, 10);
}

// ======================================================================
// Navigation
// ======================================================================

const ui = { tab: 'today', stack: [], wfilter: 'quick', checkin: null, summary: null };

function go(name, params = {}) { ui.stack.push({ name, params }); render(true); }
function back() { ui.stack.pop(); render(true); }
function tab(name) { ui.tab = name; ui.stack = []; render(true); }
const current = () => ui.stack[ui.stack.length - 1] || { name: ui.tab, params: {} };

function render(scrollTop = false) {
  const v = current();
  document.body.classList.toggle('playing', v.name === 'player');
  $('#view').innerHTML = VIEWS[v.name](v.params);
  document.querySelectorAll('.tabbar [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === ui.tab));
  if (scrollTop) window.scrollTo(0, 0);
}

function openSheet(html) {
  $('#sheet').innerHTML = `<div class="sheet-backdrop" data-act="closeSheet"></div><div class="sheet" role="dialog"><div class="grab"></div>${html}</div>`;
  $('#sheet').classList.add('open');
}
function closeSheet() { $('#sheet').classList.remove('open'); $('#sheet').innerHTML = ''; }

// ======================================================================
// Views
// ======================================================================

const locSwitch = () => `<div class="seg" role="tablist">${Object.entries(state.settings.locations).map(([k, l]) =>
  `<button class="${state.settings.location === k ? 'on' : ''}" data-act="loc" data-k="${k}">${esc(l.n)}</button>`).join('')}</div>`;

function ring(frac, label, sub) {
  const C = 2 * Math.PI * 26;
  return `<div class="ring"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" class="track"/><circle cx="32" cy="32" r="26" class="fill" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - Math.min(1, frac))}"/></svg><div><b>${label}</b><small>${sub}</small></div></div>`;
}

function workoutCard(w, boost = 0, extra = '') {
  const mins = fmtMin(estimate(resolveWorkout(w, boost, makeCtx())));
  return `<button class="wcard" data-act="detail" data-id="${w.id}" data-boost="${boost}" ${extra}>
    <div class="wcard-top"><span class="pill ${w.len}">${w.len}</span><span class="muted">${mins}</span></div>
    <h3>${esc(w.n)}</h3><div class="muted small">${esc(w.tag)}</div></button>`;
}

const VIEWS = {
  today() {
    const s = stats();
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    const doneToday = state.history.some(x => dayKey(x.date) === dayKey(Date.now()));
    const p = PLAN[state.plan.idx];
    const phase = p && PHASES[p.phase];
    const w = p && workout(p.wid);
    const sore = Math.max(state.lastPain.back, state.lastPain.knee) >= 7;
    const planCard = p ? `
      <section class="hero">
        <div class="eyebrow">${doneToday ? 'Up next' : 'Today'} · Week ${p.week} · Day ${p.day} · ${esc(phase.n)}</div>
        <h2>${esc(w.n)}</h2>
        <p class="muted">${esc(w.tag)} · ${fmtMin(estimate(resolveWorkout(w, p.boost, makeCtx())))}${p.boost ? ' · +1 round' : ''}</p>
        <div class="row">
          <button class="btn primary" data-act="start" data-id="${w.id}" data-plan="${state.plan.idx}">${icon('play')} Start</button>
          <button class="btn ghost" data-act="detail" data-id="${w.id}" data-boost="${p.boost}" data-plan="${state.plan.idx}">Preview</button>
        </div>
        ${doneToday ? `<p class="note">${icon('check')} You trained today. Rest up, or add a quick session below.</p>` : ''}
      </section>` : `
      <section class="hero"><div class="eyebrow">Program complete</div><h2>Rebuild 8, done.</h2>
        <p class="muted">You finished all 8 weeks. Your levels carry over, so the next cycle will be harder.</p>
        <button class="btn primary" data-act="restartPlan">Start cycle ${state.plan.cycle + 1}</button></section>`;

    return `
      <header class="top">
        <div><div class="eyebrow">${date}</div><h1>${greet}</h1></div>
        <button class="iconbtn" data-act="settings" aria-label="Settings">${icon('gear')}</button>
      </header>
      ${locSwitch()}
      <section class="statsrow">
        ${ring(s.thisWeek / WEEK_GOAL, `${s.thisWeek}/${WEEK_GOAL}`, 'this week')}
        <div class="stat"><b>${s.streak}</b><small>week streak</small></div>
        <div class="stat"><b>${s.total}</b><small>workouts</small></div>
      </section>
      ${sore ? `<section class="callout">${icon('shield')}<div><b>Sore last time?</b><span>Try a gentle session today. Movement helps more than rest.</span>
        <div class="row"><button class="btn small" data-act="detail" data-id="q-backarmor">Back Armor</button><button class="btn small" data-act="detail" data-id="q-mobility">Mobility Reset</button></div></div></section>` : ''}
      ${planCard}
      <h2 class="section">Quick hits <span class="muted">5–10 min</span></h2>
      <div class="hscroll">${WORKOUTS.filter(x => x.len === 'quick').map(x => workoutCard(x)).join('')}</div>
      <h2 class="section">Pick by time</h2>
      <div class="tiles">
        ${[['quick', 'Quick', '5–10'], ['medium', 'Medium', '20–30'], ['long', 'Long', '35–45']].map(([k, n, m]) =>
          `<button class="tile ${k}" data-act="wfilter" data-k="${k}"><b>${n}</b><small>${m} min</small></button>`).join('')}
      </div>`;
  },

  workouts() {
    const list = WORKOUTS.filter(w => w.len === ui.wfilter);
    return `
      <header class="top"><div><div class="eyebrow">Library</div><h1>Workouts</h1></div></header>
      <div class="seg">${['quick', 'medium', 'long'].map(k => `<button class="${ui.wfilter === k ? 'on' : ''}" data-act="wfilter" data-k="${k}">${k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div>
      <div class="list">${list.map(w => {
        const mins = fmtMin(estimate(resolveWorkout(w, 0, makeCtx())));
        return `<button class="lrow" data-act="detail" data-id="${w.id}">
          <div><h3>${esc(w.n)}</h3><p class="muted small">${esc(w.desc)}</p><span class="pill ${w.len}">${esc(w.tag)}</span></div>
          <div class="lrow-end"><b>${mins}</b>${icon('chev')}</div></button>`;
      }).join('')}</div>`;
  },

  detail({ id, boost = 0, plan }) {
    const w = workout(id);
    const ctx = makeCtx();
    const blocks = resolveWorkout(w, +boost, ctx);
    const loc = state.settings.locations[state.settings.location].n;
    return `
      <header class="top"><button class="iconbtn" data-act="back" aria-label="Back">${icon('back')}</button></header>
      <div class="eyebrow">${esc(w.tag)}</div>
      <h1>${esc(w.n)}</h1>
      <p class="muted">${esc(w.desc)}</p>
      <div class="chips"><span class="chip">${icon('bolt')} ${fmtMin(estimate(blocks))}</span><span class="chip">${esc(loc)}</span>
        <span class="chip">Back ${state.lastPain.back} · Knee ${state.lastPain.knee}</span></div>
      ${locSwitch()}
      ${blocks.map(b => `
        <h2 class="section">${esc(b.n)} <span class="muted">${b.rounds > 1 ? `${b.rounds} rounds` : ''}</span></h2>
        <div class="exlist">${b.items.map(it => {
          const ladder = it.fam && FAMILIES[it.fam].ex;
          return `<button class="exrow" data-act="info" data-id="${it.id}" data-fam="${it.fam || ''}">
            <div><b>${esc(ex(it.id).n)}</b><small>${doseLabel(it)}</small></div>
            ${ladder ? `<span class="lvl ${it.atLevel ? '' : 'adj'}" title="${it.atLevel ? 'Your level' : 'Adjusted for equipment or soreness'}">${it.idx + 1}/${ladder.length}</span>` : ''}
            ${icon('info', 'dim')}</button>`;
        }).join('')}</div>`).join('')}
      <div class="sticky"><button class="btn primary wide" data-act="start" data-id="${id}" data-boost="${boost}" data-plan="${plan ?? ''}">${icon('play')} Start workout</button></div>`;
  },

  plan() {
    let i = 0;
    return `
      <header class="top"><div><div class="eyebrow">Cycle ${state.plan.cycle}</div><h1>Rebuild 8</h1></div></header>
      <p class="muted">Eight weeks, three sessions a week. Do the next session whenever you're ready. Fill other days with quick hits.</p>
      ${PHASES.map(ph => {
        const weeks = Array.from({ length: ph.weeks }, () => {
          const days = ph.days.map(() => i++);
          const wk = PLAN[days[0]].week;
          return `<div class="week"><span class="wk">W${wk}</span>${days.map(idx => {
            const p = PLAN[idx];
            const st = idx < state.plan.idx ? 'done' : idx === state.plan.idx ? 'now' : '';
            return `<button class="day ${st}" data-act="detail" data-id="${p.wid}" data-boost="${p.boost}" data-plan="${idx}">
              ${st === 'done' ? icon('check') : `<b>${p.day}</b>`}<small>${esc(workout(p.wid).n.replace('Foundation ', ''))}</small></button>`;
          }).join('')}</div>`;
        }).join('');
        return `<section class="phase"><h2>${esc(ph.n)}</h2><p class="muted small">${esc(ph.desc)}</p>${weeks}</section>`;
      }).join('')}
      <button class="btn ghost wide" data-act="resetPlan">Restart from week 1</button>`;
  },

  progress() {
    const s = stats();
    const recent = state.history.slice(-24);
    const pbs = personalBests();
    return `
      <header class="top"><div><div class="eyebrow">Your record</div><h1>Progress</h1></div></header>
      <section class="stats3">
        <div class="stat"><b>${s.total}</b><small>workouts</small></div>
        <div class="stat"><b>${s.minutes}</b><small>minutes</small></div>
        <div class="stat"><b>${s.streak}</b><small>week streak</small></div>
      </section>
      <h2 class="section">Back &amp; knee trend</h2>
      ${recent.length >= 2 ? painChart(recent) : '<p class="muted card">Your soreness check-ins will chart here. The goal is to see these lines trend down as you get stronger.</p>'}
      <h2 class="section">Current levels</h2>
      <div class="levels">${Object.entries(FAMILIES).filter(([f]) => f !== 'cardio').map(([f, fam]) =>
        `<button class="lvlrow" data-act="tab" data-k="library"><span>${esc(fam.n)}</span><span class="bar"><i style="width:${(state.levels[f] + 1) / fam.ex.length * 100}%"></i></span><small>${esc(ex(fam.ex[state.levels[f]]).n)}</small></button>`).join('')}</div>
      ${pbs.length ? `<h2 class="section">Personal bests</h2><div class="exlist">${pbs.map(([id, b]) =>
        `<div class="exrow"><div><b>${esc(ex(id).n)}</b><small>${new Date(b.date).toLocaleDateString()}</small></div><span class="pb">${b.v}${b.type === 's' ? 's' : ' reps'}</span></div>`).join('')}</div>` : ''}
      <h2 class="section">History</h2>
      ${state.history.length ? `<div class="exlist">${state.history.slice().reverse().slice(0, 40).map(x =>
        `<div class="exrow"><div><b>${esc(x.name)}</b><small>${new Date(x.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${fmtMin(x.dur)} · ${esc(state.settings.locations[x.loc]?.n || '')}</small></div>
          <span class="painpair"><i class="b">${x.pain.back}</i><i class="k">${x.pain.knee}</i></span></div>`).join('')}</div>`
        : '<p class="muted card">No workouts yet. Your first one is waiting on the Today tab.</p>'}`;
  },

  library() {
    return `
      <header class="top"><div><div class="eyebrow">How-to</div><h1>Exercises</h1></div></header>
      <p class="muted">Each ladder goes from easiest to hardest. The highlighted step is your level. Tap any exercise for form cues, videos and pictures.</p>
      ${Object.entries(FAMILIES).map(([f, fam]) => `
        <h2 class="section">${esc(fam.n)}</h2>
        <div class="ladder">${fam.ex.map((id, i) => {
          const e = ex(id);
          return `<button class="rung ${i === state.levels[f] ? 'me' : i < state.levels[f] ? 'past' : ''}" data-act="info" data-id="${id}" data-fam="${f}">
            <span class="n">${i + 1}</span><div><b>${esc(e.n)}</b><small>${(e.e || []).map(q => esc(EQUIP[q])).join(' + ') || 'No equipment'}</small></div>
            ${i === state.levels[f] ? '<span class="tag">You</span>' : ''}</button>`;
        }).join('')}</div>`).join('')}
      <h2 class="section">Drills &amp; stretches</h2>
      <div class="exlist">${Object.keys(EX).filter(id => !Object.values(FAMILIES).some(f => f.ex.includes(id))).map(id =>
        `<button class="exrow" data-act="info" data-id="${id}"><div><b>${esc(ex(id).n)}</b></div>${icon('info', 'dim')}</button>`).join('')}</div>`;
  },

  settings() {
    const st = state.settings;
    return `
      <header class="top"><button class="iconbtn" data-act="back" aria-label="Back">${icon('back')}</button></header>
      <h1>Settings</h1>
      <h2 class="section">Coaching</h2>
      <div class="card">
        <label class="toggle"><span><b>Voice cues</b><small>Announces exercises, countdowns and side switches</small></span><input type="checkbox" data-act="setting" data-k="voice" ${st.voice ? 'checked' : ''}></label>
        <label class="toggle"><span><b>Beeps</b><small>3-2-1 countdown tones</small></span><input type="checkbox" data-act="setting" data-k="beeps" ${st.beeps ? 'checked' : ''}></label>
      </div>
      <h2 class="section">Equipment by location</h2>
      <p class="muted small">Workouts automatically pick exercises that fit where you are.</p>
      ${Object.entries(st.locations).map(([k, l]) => `
        <div class="card"><b>${esc(l.n)}</b><div class="checks">${Object.entries(EQUIP).map(([q, n]) =>
          `<label class="check"><input type="checkbox" data-act="equip" data-loc="${k}" data-q="${q}" ${l.equip.includes(q) ? 'checked' : ''}><span>${esc(n)}</span></label>`).join('')}</div></div>`).join('')}
      <h2 class="section">Your data</h2>
      <p class="muted small">Workouts are stored on this device only. Export a backup now and then.</p>
      <div class="card row wrap">
        <button class="btn" data-act="export">Export backup</button>
        <label class="btn">Import backup<input type="file" accept="application/json,.json" data-act="import" hidden></label>
        <button class="btn danger" data-act="reset">Reset everything</button>
      </div>
      <p class="muted small center">Sources: U.S. Army PRT drills (Prep, Conditioning, 4 for the Core, Recovery) and Dr. Stuart McGill's Big 3. Not medical advice. If pain is sharp, shooting or getting worse, see a physical therapist.</p>`;
  },

  player() { return renderPlayer(); },

  summary() {
    const { entry, ups } = ui.summary;
    const reps = entry.sets.filter(s => s.type === 'r').reduce((t, s) => t + (s.actual || 0), 0);
    return `
      <div class="summary">
        <div class="medal">${icon('check')}</div>
        <div class="eyebrow">Mission complete</div>
        <h1>${esc(entry.name)}</h1>
        <section class="stats3">
          <div class="stat"><b>${fmtClock(Math.round(entry.dur))}</b><small>time</small></div>
          <div class="stat"><b>${entry.sets.length}</b><small>sets</small></div>
          <div class="stat"><b>${reps}</b><small>reps</small></div>
        </section>
        ${ups.map(u => `
          <section class="levelup" id="up-${u.fam}">
            <div class="eyebrow">${icon('up')} Ready to level up</div>
            <p><b>${esc(FAMILIES[u.fam].n)}:</b> you've hit every target ${u.streak} sessions in a row.</p>
            <p class="muted">${esc(ex(u.from).n)} → <b>${esc(ex(u.to).n)}</b></p>
            <div class="row"><button class="btn primary small" data-act="levelUp" data-fam="${u.fam}">Level up</button><button class="btn ghost small" data-act="notYet" data-fam="${u.fam}">Not yet</button></div>
          </section>`).join('')}
        <button class="btn primary wide" data-act="tab" data-k="today">Done</button>
      </div>`;
  },
};

function painChart(rows) {
  const W = 320, H = 130, pad = 18;
  const x = i => pad + i * (W - pad * 2) / (rows.length - 1);
  const y = v => pad + (10 - v) * (H - pad * 2) / 10;
  const line = k => rows.map((r, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(r.pain[k]).toFixed(1)}`).join('');
  const grid = [0, 5, 10].map(v => `<line x1="${pad}" x2="${W - pad}" y1="${y(v)}" y2="${y(v)}"/><text x="2" y="${y(v) + 4}">${v}</text>`).join('');
  return `<div class="card chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Back and knee soreness over recent workouts">
      <g class="grid">${grid}</g>
      <path class="ln back" d="${line('back')}"/><path class="ln knee" d="${line('knee')}"/>
    </svg><div class="legend"><span class="b">Lower back</span><span class="k">Knee</span><span class="muted">last ${rows.length} workouts</span></div></div>`;
}

// ======================================================================
// Sheets
// ======================================================================

function openInfo(id, fam) {
  const e = ex(id);
  const q = encodeURIComponent(e.q || `${e.n} exercise proper form`);
  const lvl = fam ? FAMILIES[fam].ex.indexOf(id) : -1;
  const tags = [
    ...(e.e || []).map(x => EQUIP[x]),
    !e.k ? 'Knee-friendly' : e.k === 2 ? 'Demanding on knee' : null,
    !e.b ? 'Back-friendly' : null,
  ].filter(Boolean);
  openSheet(`
    <h2>${esc(e.n)}</h2>
    <div class="chips">${tags.map(t => `<span class="chip">${esc(t)}</span>`).join('')}<span class="chip">${e.t === 's' ? `${e.d}s` : `${e.d} reps`}${e.s ? ' each side' : ''}</span></div>
    ${e.w ? `<p class="why">${icon('shield')} ${esc(e.w)}</p>` : ''}
    <ol class="cues">${e.c.map(c => `<li>${esc(c)}</li>`).join('')}</ol>
    <div class="row">
      <a class="btn" href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener">${icon('video')} Watch video</a>
      <a class="btn" href="https://www.google.com/search?tbm=isch&q=${q}" target="_blank" rel="noopener">${icon('image')} See pictures</a>
    </div>
    ${fam ? `<div class="row">${lvl === state.levels[fam]
      ? `<p class="muted small">This is your current ${esc(FAMILIES[fam].n)} level.</p>`
      : `<button class="btn primary wide" data-act="setLevel" data-fam="${fam}" data-i="${lvl}">Make this my ${esc(FAMILIES[fam].n)} level</button>`}</div>` : ''}`);
}

function openCheckin(id, boost, plan) {
  ui.checkin = { id, boost: +boost || 0, plan: plan === '' || plan == null ? null : +plan, ...state.lastPain };
  renderCheckin();
}

function renderCheckin() {
  const c = ui.checkin;
  const slider = (k, label) => {
    const m = painMode(c[k]);
    return `<div class="pain">
      <div class="pain-head"><b>${label}</b><output class="${m.cls}">${c[k]}</output></div>
      <input type="range" min="0" max="10" step="1" value="${c[k]}" data-act="pain" data-k="${k}" class="${m.cls}">
      <div class="pain-mode ${m.cls}"><b>${m.label}</b> · ${m.text}</div></div>`;
  };
  const rough = Math.max(c.back, c.knee) >= 7 && !['q-backarmor', 'q-mobility', 'q-kneearmor'].includes(c.id);
  openSheet(`
    <h2>Quick check-in</h2>
    <p class="muted">How do they feel right now? 0 is nothing, 10 is the worst. The workout adapts to your answer.</p>
    ${slider('back', 'Lower back')}
    ${slider('knee', 'Left knee')}
    ${locSwitch()}
    ${rough ? `<p class="callout small">${icon('shield')}<span>Rough day. Consider <a href="#" data-act="swapTo" data-id="q-backarmor">Back Armor</a> or <a href="#" data-act="swapTo" data-id="q-mobility">Mobility Reset</a> instead.</span></p>` : ''}
    <button class="btn primary wide" data-act="go">${icon('play')} Let's go</button>`);
}

// ======================================================================
// Audio & wake lock
// ======================================================================

let audio = null;
function unlockAudio() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch { audio = null; }
  if ('speechSynthesis' in window) speechSynthesis.speak(new SpeechSynthesisUtterance(''));
}
function beep(freq = 880, ms = 120) {
  if (!state.settings.beeps || !audio) return;
  const o = audio.createOscillator(), g = audio.createGain();
  o.frequency.value = freq;
  o.connect(g); g.connect(audio.destination);
  const t = audio.currentTime;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.4, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
  o.start(t); o.stop(t + ms / 1000 + 0.02);
}
function say(text) {
  if (!state.settings.voice || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.05;
  speechSynthesis.speak(u);
}

let wakeLock = null;
async function keepAwake(on) {
  try {
    if (on && 'wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
    else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch { /* not supported */ }
}
document.addEventListener('visibilitychange', () => { if (P && document.visibilityState === 'visible') keepAwake(true); });

// ======================================================================
// Player
// ======================================================================

let P = null;
const LEAD = 3;

function startPlayer() {
  const c = ui.checkin;
  const w = workout(c.id);
  const pain = { back: c.back, knee: c.knee };
  state.lastPain = pain;
  save();
  const ctx = makeCtx(pain);
  P = { w, plan: c.plan, ctx, pain, steps: buildSteps(resolveWorkout(w, c.boost, ctx)), i: -1, logs: {}, started: Date.now(), pausedMs: 0, paused: false, timer: null };
  closeSheet();
  unlockAudio();
  keepAwake(true);
  ui.stack.push({ name: 'player', params: {} });
  enter(0);
  P.timer = setInterval(tick, 200);
}

function enter(i) {
  if (i >= P.steps.length) return finish(false);
  P.i = i;
  P.paused = false;
  const s = P.steps[i];
  P.lastSec = null;
  if (s.kind === 'rest') {
    P.phase = 'rest';
    P.len = s.dur;
    P.endAt = Date.now() + s.dur * 1000;
    const n = nextEx(i);
    say(n ? `Rest. Next up: ${ex(n.id).n}` : 'Rest');
  } else if (s.type === 's') {
    P.phase = 'lead';
    P.len = LEAD;
    P.endAt = Date.now() + LEAD * 1000;
    say(`${ex(s.id).n}. ${s.amrap ? `${s.dose} seconds, max good reps` : `${s.dose} seconds${ex(s.id).s ? ' each side' : ''}`}`);
  } else {
    P.phase = 'reps';
    P.count = s.dose;
    say(`${ex(s.id).n}. ${s.dose} reps${ex(s.id).s ? ' each side' : ''}`);
  }
  render(true);
}

function nextEx(i) {
  for (let j = i + 1; j < P.steps.length; j++) if (P.steps[j].kind === 'ex') return P.steps[j];
  return null;
}

function tick() {
  if (!P || P.paused || P.phase === 'reps') return;
  const remMs = P.endAt - Date.now();
  const sec = Math.ceil(remMs / 1000);
  const s = P.steps[P.i];
  if (sec !== P.lastSec) {
    P.lastSec = sec;
    if (sec > 0 && sec <= 3) beep(660, 110);
    if (P.phase === 'run' && ex(s.id).s && sec === s.dose && P.len === s.dose * 2) { beep(990, 250); say('Switch sides'); }
    if (P.phase === 'run' && sec === 10 && P.len >= 30) say('Ten seconds');
  }
  if (remMs <= 0) {
    if (P.phase === 'lead') {
      beep(990, 300);
      P.phase = 'run';
      P.len = s.dose * (ex(s.id).s && !s.amrap ? 2 : 1);
      P.endAt = Date.now() + P.len * 1000;
      P.lastSec = null;
      render();
      return;
    }
    if (P.phase === 'run') { log(P.i, s.dose); beep(990, 300); }
    return enter(P.i + 1);
  }
  updateTimer(remMs);
}

function updateTimer(remMs) {
  const num = $('#pt-num'), arc = $('#pt-arc'), side = $('#pt-side');
  if (!num) return;
  const sec = Math.max(0, Math.ceil(remMs / 1000));
  num.textContent = P.phase === 'lead' ? sec : fmtClock(sec);
  if (arc) arc.style.strokeDashoffset = arc.dataset.c * (1 - remMs / (P.len * 1000));
  if (side) {
    const s = P.steps[P.i];
    side.textContent = sec > s.dose ? 'Left side' : 'Right side';
  }
}

function log(i, actual) {
  const s = P.steps[i];
  P.logs[i] = { id: s.id, fam: s.fam, atLevel: s.atLevel, type: s.type, target: s.dose, actual, amrap: s.amrap };
}

function renderPlayer() {
  const s = P.steps[P.i];
  const exSteps = P.steps.filter(x => x.kind === 'ex').length;
  const doneEx = P.steps.slice(0, P.i).filter(x => x.kind === 'ex').length;
  const top = `
    <div class="ptop">
      <button class="iconbtn" data-act="endAsk" aria-label="End workout">${icon('close')}</button>
      <div class="pprog"><i style="width:${doneEx / exSteps * 100}%"></i></div>
      <button class="iconbtn" data-act="voice" aria-label="Toggle voice">${icon(state.settings.voice ? 'voice' : 'mute')}</button>
    </div>`;
  const C = 2 * Math.PI * 108;
  const dial = (label, sub, cls = '') => `
    <div class="dial ${cls}"><svg viewBox="0 0 240 240"><circle cx="120" cy="120" r="108" class="track"/>
      <circle id="pt-arc" cx="120" cy="120" r="108" class="arc" data-c="${C}" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg>
      <div class="dial-in"><span id="pt-num">${label}</span>${sub}</div></div>`;
  const controls = `
    <div class="pctl">
      <button class="iconbtn big" data-act="prev" aria-label="Previous">${icon('prev')}</button>
      ${P.phase === 'reps' ? '' : `<button class="iconbtn huge" data-act="pause" aria-label="${P.paused ? 'Resume' : 'Pause'}">${icon(P.paused ? 'play' : 'pause')}</button>`}
      <button class="iconbtn big" data-act="skip" aria-label="Skip">${icon('next')}</button>
    </div>`;

  if (s.kind === 'rest') {
    const n = nextEx(P.i);
    return `<div class="player rest">${top}
      <div class="pmain">
        <div class="eyebrow">${esc(s.label || 'Rest')}</div>
        ${dial(fmtClock(s.dur), '<small>breathe</small>')}
        <button class="btn ghost small" data-act="addRest">+15s</button>
        ${n ? `<div class="upnext"><small>Up next</small><b>${esc(ex(n.id).n)}</b><span>${doseLabel(n)}</span></div>` : ''}
      </div>${controls}</div>`;
  }

  const e = ex(s.id);
  const n = nextEx(P.i);
  const fam = s.fam && FAMILIES[s.fam];
  const head = `
    <div class="eyebrow">${esc(s.block)}${s.rounds > 1 ? ` · Round ${s.round}/${s.rounds}` : ''}</div>
    <h1 class="exname">${esc(e.n)}</h1>
    <div class="exmeta">${doseLabel(s)}${fam ? ` · ${esc(fam.n)} ${s.idx + 1}/${fam.ex.length}` : ''}</div>`;
  const tools = `
    <div class="ptools">
      ${fam ? `<button class="btn ghost small" data-act="swap" data-d="-1">${icon('down')} Easier</button>` : ''}
      <button class="btn ghost small" data-act="info" data-id="${s.id}" data-fam="${s.fam || ''}">${icon('info')} How-to</button>
      ${fam ? `<button class="btn ghost small" data-act="swap" data-d="1">${icon('up')} Harder</button>` : ''}
    </div>`;
  const upnext = n ? `<div class="upnext slim"><small>Next</small><b>${esc(ex(n.id).n)}</b></div>` : '';

  if (P.phase === 'reps') {
    return `<div class="player">${top}<div class="pmain">${head}
      <div class="reps">
        <button class="iconbtn round" data-act="count" data-d="-1" aria-label="One less">−</button>
        <div><span class="repnum">${P.count}</span><small>${e.s ? 'reps each side' : 'reps'}</small></div>
        <button class="iconbtn round" data-act="count" data-d="1" aria-label="One more">+</button>
      </div>
      <p class="muted small center">${esc(e.c[0])}</p>
      <button class="btn primary wide done" data-act="done">${icon('check')} Done · ${P.count}</button>
      ${tools}${upnext}</div>${controls}</div>`;
  }

  const lead = P.phase === 'lead';
  const hold = ['front', 'side', 'kneeiso', 'pull'].includes(s.fam) || s.id === 'bridgehold';
  const calm = /Recovery|Mobility|Reset/.test(s.block);
  const sub = lead ? '<small>get ready</small>' : e.s && !s.amrap ? '<small id="pt-side">Left side</small>'
    : `<small>${s.amrap ? 'max good reps' : hold ? 'hold strong' : calm ? 'breathe & relax' : 'keep moving'}</small>`;
  return `<div class="player ${lead ? 'lead' : 'go'}">${top}<div class="pmain">${head}
    ${dial(lead ? LEAD : fmtClock(P.len), sub)}
    <p class="muted small center">${esc(e.c[0])}</p>
    ${tools}${upnext}</div>${controls}</div>`;
}

function finish(early) {
  clearInterval(P.timer);
  keepAwake(false);
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  const sets = Object.values(P.logs);
  const total = P.steps.filter(s => s.kind === 'ex').length;
  if (!sets.length) { P = null; ui.stack = []; return render(true); }
  const entry = {
    id: Date.now().toString(36), date: new Date().toISOString(), wid: P.w.id, name: P.w.n,
    plan: P.plan, dur: (Date.now() - P.started - P.pausedMs) / 1000, pain: P.pain, loc: state.settings.location, sets,
  };
  state.history.push(entry);
  if (P.plan != null && P.plan === state.plan.idx && sets.length >= total / 2) state.plan.idx++;
  const ups = early ? [] : progression(sets);
  save();
  if (!early) say('Workout complete. Outstanding work.');
  P = null;
  ui.summary = { entry, ups };
  ui.stack = [{ name: 'summary', params: {} }];
  render(true);
}

// A family levels up after hitting every target at the current level two sessions running.
function progression(sets) {
  const byFam = {};
  sets.filter(s => s.fam && !s.amrap).forEach(s => (byFam[s.fam] = byFam[s.fam] || []).push(s));
  const ups = [];
  Object.entries(byFam).forEach(([f, list]) => {
    const atLevel = list.filter(s => s.atLevel);
    if (!atLevel.length) return;
    const hit = atLevel.every(s => s.actual >= s.target);
    state.streaks[f] = hit ? (state.streaks[f] || 0) + 1 : 0;
    const lvl = state.levels[f];
    if (state.streaks[f] >= 2 && lvl < FAMILIES[f].ex.length - 1) {
      ups.push({ fam: f, streak: state.streaks[f], from: FAMILIES[f].ex[lvl], to: FAMILIES[f].ex[lvl + 1] });
    }
  });
  return ups;
}

// Swap the current exercise (and its remaining rounds) one step easier or harder.
function swap(dir) {
  const s = P.steps[P.i];
  const ladder = FAMILIES[s.fam].ex;
  let j = s.idx + dir;
  while (j >= 0 && j < ladder.length && !allowed(ladder[j], P.ctx, dir > 0)) j += dir;
  if (j < 0 || j >= ladder.length) return toast(dir < 0 ? 'Already the easiest option here' : 'Already the hardest option here');
  P.steps.forEach((t, k) => {
    if (k < P.i || t.key !== s.key) return;
    const d = doseFor(ladder[j], t.slot, P.ctx);
    Object.assign(t, { id: ladder[j], idx: j, atLevel: j === state.levels[s.fam], ...d });
  });
  toast(`Switched to ${ex(ladder[j]).n}`);
  enter(P.i);
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.h);
  toast.h = setTimeout(() => t.classList.remove('show'), 1800);
}

// ======================================================================
// Actions
// ======================================================================

const ACT = {
  tab: d => tab(d.k),
  back,
  settings: () => go('settings'),
  closeSheet,
  detail: d => go('detail', { id: d.id, boost: d.boost || 0, plan: d.plan }),
  start: d => openCheckin(d.id, d.boost, d.plan),
  wfilter: d => { ui.wfilter = d.k; tab('workouts'); },
  loc: d => {
    state.settings.location = d.k; save();
    if ($('#sheet').classList.contains('open') && ui.checkin) renderCheckin();
    render();
  },
  info: d => openInfo(d.id, d.fam || null),
  setLevel: d => { state.levels[d.fam] = +d.i; state.streaks[d.fam] = 0; save(); closeSheet(); render(); toast('Level updated'); },
  swapTo: (d, el, e) => { e.preventDefault(); ui.checkin.id = d.id; ui.checkin.boost = 0; ui.checkin.plan = null; renderCheckin(); toast(`Switched to ${workout(d.id).n}`); },
  go: startPlayer,
  resetPlan: () => { if (confirm('Restart the 8-week plan from week 1? Your history and levels are kept.')) { state.plan.idx = 0; save(); render(); } },
  restartPlan: () => { state.plan = { idx: 0, cycle: state.plan.cycle + 1 }; save(); render(); },
  // player
  voice: () => { state.settings.voice = !state.settings.voice; save(); if (!state.settings.voice) speechSynthesis.cancel(); render(); },
  pause: () => {
    if (P.paused) { const gap = Date.now() - P.pausedAt; P.endAt += gap; P.pausedMs += gap; P.paused = false; }
    else { P.paused = true; P.pausedAt = Date.now(); }
    render();
    if (!P.paused) updateTimer(P.endAt - Date.now());
    else updateTimer(P.endAt - P.pausedAt);
  },
  skip: () => enter(P.i + 1),
  prev: () => { let j = P.i - 1; while (j > 0 && P.steps[j].kind !== 'ex') j--; enter(Math.max(0, j)); },
  addRest: () => { P.endAt += 15000; P.len += 15; },
  count: d => { P.count = Math.max(0, P.count + +d.d); render(); },
  done: () => { log(P.i, P.count); beep(990, 200); enter(P.i + 1); },
  swap: d => swap(+d.d),
  endAsk: () => openSheet(`<h2>End workout?</h2><p class="muted">Save what you've done so far, or keep going.</p>
    <button class="btn primary wide" data-act="keepGoing">Keep going</button>
    <button class="btn wide" data-act="endSave">End &amp; save</button>
    <button class="btn danger wide" data-act="endDiscard">Discard</button>`),
  keepGoing: closeSheet,
  endSave: () => { closeSheet(); finish(true); },
  endDiscard: () => { closeSheet(); P.logs = {}; finish(true); },
  // summary
  levelUp: d => { state.levels[d.fam]++; state.streaks[d.fam] = 0; save(); $(`#up-${d.fam}`).innerHTML = `<p>${icon('check')} <b>${esc(FAMILIES[d.fam].n)}</b> is now ${esc(ex(FAMILIES[d.fam].ex[state.levels[d.fam]]).n)}.</p>`; },
  notYet: d => { state.streaks[d.fam] = 0; save(); $(`#up-${d.fam}`).remove(); },
  // settings
  export: async () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const name = `calisthenics-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; } catch { return; }
    }
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
    a.click();
  },
  reset: () => { if (confirm('Erase all workouts, levels and settings on this device?')) { state = defaultState(); save(); tab('today'); } },
};

const INPUT = {
  pain: (d, el) => { ui.checkin[d.k] = +el.value; renderCheckin(); },
  setting: (d, el) => { state.settings[d.k] = el.checked; save(); },
  equip: (d, el) => {
    const list = state.settings.locations[d.loc].equip;
    if (el.checked && !list.includes(d.q)) list.push(d.q);
    if (!el.checked) list.splice(list.indexOf(d.q), 1);
    save();
  },
  import: (d, el) => {
    const f = el.files[0];
    if (!f) return;
    f.text().then(t => {
      const s = JSON.parse(t);
      if (!Array.isArray(s.history) || !s.levels) throw new Error('bad');
      if (!confirm(`Replace data on this device with the backup (${s.history.length} workouts)?`)) return;
      localStorage.setItem(STORE_KEY, JSON.stringify(s));
      state = load();
      toast('Backup restored');
      tab('today');
    }).catch(() => toast("That file isn't a valid backup"));
  },
};

document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab]');
  if (t) return tab(t.dataset.tab);
  const el = e.target.closest('[data-act]');
  if (!el || el.tagName === 'INPUT') return;
  ACT[el.dataset.act]?.(el.dataset, el, e);
});
// Range sliders re-render the sheet on change so dragging stays smooth; the number updates live.
document.addEventListener('input', e => {
  const el = e.target;
  if (el.dataset.act === 'pain') el.closest('.pain').querySelector('output').textContent = el.value;
});
document.addEventListener('change', e => {
  const el = e.target.closest('[data-act]');
  if (el && INPUT[el.dataset.act]) INPUT[el.dataset.act](el.dataset, el, e);
});

// ======================================================================
// Boot
// ======================================================================

render();

if (!state.onboarded) {
  openSheet(`
    <div class="eyebrow">Welcome, recruit</div>
    <h2>Rebuild 8</h2>
    <ul class="welcome">
      <li>${icon('plan')}<span><b>An 8-week plan</b>, 3 sessions a week, built from Army PRT drills and Dr. McGill's back program.</span></li>
      <li>${icon('shield')}<span><b>Back and knee armor</b> in every session. A quick check-in adapts each workout to how you feel that day.</span></li>
      <li>${icon('home')}<span><b>Home, travel or park</b>: pick where you are and it uses only what's around you.</span></li>
      <li>${icon('up')}<span><b>Progressions</b> from easy to hard. Hit your targets twice in a row and it'll suggest moving up.</span></li>
    </ul>
    <p class="muted small">Not medical advice. Mild discomfort while strengthening is normal. Sharp, shooting or worsening pain means stop and see a professional.</p>
    <button class="btn primary wide" data-act="onboarded">Let's get after it</button>`);
  ACT.onboarded = () => { state.onboarded = true; save(); closeSheet(); };
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
