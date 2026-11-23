/* ---------- THE FLOCK: herd, endless meadow, rescue missions, daily care, subjects ---------- */
const SUBJECTS = [
  {id:'math', e:'🧮', n:'Adv Math 7', sub:'Fully built · 23 skills', units:null},
  {id:'ela', e:'📚', n:'Adv Language Arts 6', sub:'Shell ready', units:[['Reading','Main idea · Evidence · Vocabulary in context'],['Writing','Claims · Narrative · Revising'],['Language','Grammar · Punctuation · Word roots']], boss:'The Run-On Ram'},
  {id:'sci', e:'🔬', n:'Adv Science 6', sub:'Shell ready', units:[['Investigate','Questions · Variables · Data'],['Explain','Models · Evidence · Cause and effect'],['Apply','Real-world problems · Vocabulary']], boss:'Professor Billy Bunsen'},
  {id:'hist', e:'🗺️', n:'Adv Western Hemisphere 6', sub:'Shell ready', units:[['Places','Maps · Regions · Geography'],['People','Cultures · Events · Timelines'],['Ideas','Sources · Cause and effect · Debates']], boss:'The Map Marauder'},
  {id:'fr', e:'🧭', n:'Future Ready 6', sub:'Shell ready', units:[['Know yourself','Strengths · Goals · Habits'],['Explore','Careers · Money basics · Tech'],['Plan','Choices · Teamwork · Projects']], boss:'The Procrastinator'},
  {id:'pe', e:'🏃', n:'Physical Education 6', sub:'Shell ready', units:[['Move','Skills · Rules · Safety'],['Train','Fitness · Warm-ups · Tracking'],['Play','Teamwork · Strategy · Sportsmanship']], boss:'Coach Couch Goat'},
  {id:'wl', e:'🌎', n:'World Languages & Cultures', sub:'Shell ready', units:[['Words','Vocabulary · Phrases · Pronunciation'],['Grammar','Patterns · Questions · Tenses'],['Culture','Places · Traditions · Conversation']], boss:'Babble Billy'}
];
const subjOf = id => SUBJECTS.find(s => s.id === id) || SUBJECTS[0];
const SUBJ_SHELL = tab => (S.subject || 'math') !== 'math' && ['learn','guide','boss','games'].includes(tab);
const kickText = () => (S.subject || 'math') === 'math' ? testLine() : `<b>${subjOf(S.subject).n}</b> · shell`;

/* ---- state ---- */
const pad2 = n => String(n).padStart(2, '0');
const dayStr = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const dayGap = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
function initFlock(){
  if (S.fl && S.fl.sheep) return;
  S.fl = {sheep:[], rescued:{}, rescued2:{}, hay:5, fed:80, water:80, day:dayStr(), streak:0, lastPrac:'', xpAcc:0, bossWon:{}, seq:1, sel:null};
  const f = S.fl;
  addSheep({wool:'cream', face:'char', trait:'Curious', from:'start'});
  if (imported){ /* her Plus & Minus work already rescued sheep */
    Object.keys(S.m).filter(id => SK[id] && S.m[id] >= 60).slice(0, 8).forEach(id => { f.rescued[id] = 1; addSheep({wool:WOOLS[(id * 3) % 8], face:FACES[id % 4], trait:TRAITS[id % TRAITS.length][0], from:+id}); });
  }
  save();
}
function addSheep(o){
  const f = S.fl, s = Object.assign({id:'s' + f.seq++, name:null, acc:'none', born:Date.now()}, o); f.sheep.push(s); return s;
}
const herdHero = () => (S.fl && S.fl.sheep[0]) || {wool:'cream', face:'char', name:'Hero', acc:'none'};
function sheepFor(sid, slot){ return {wool:WOOLS[(sid * 3 + slot * 5) % WOOLS.length], face:FACES[(sid + slot) % FACES.length], trait:TRAITS[(sid + slot * 3) % TRAITS.length][0], from:+sid, slot}; }
const wearOpen = xpv => WEAR.filter(w => xpv >= w[2]);
const zonesOpen = () => Math.max(2, 2 + Math.floor(S.fl.sheep.length / 3));
const ZN = ['Clover Corner','Pond Pasture','Windmill Hill','Lavender Field','Brook Bridge','Hay Barn','Apple Orchard'];
const zoneName = k => ZN[k % 7] + (k >= 7 ? ' ' + ['II','III','IV','V','VI','VII','VIII','IX','X'][Math.min(8, Math.floor(k / 7) - 1)] : '');

/* ---- daily care, streaks, hay ---- */
function dailyCheck(){
  const f = S.fl, t = dayStr(); if (f.day === t) return;
  const gap = Math.max(1, dayGap(f.day, t));
  const happy = f.fed >= 50 && f.water >= 50;
  f.fed = clamp(f.fed - 20 * gap, 0, 100); f.water = clamp(f.water - 25 * gap, 0, 100);
  f.hay = Math.min(30, f.hay + 3 + (happy && gap === 1 ? 2 : 0)); f.day = t; save();
  toast(happy && gap === 1 ? 'Happy herd! +5 free hay 🌾' : 'Daily hay delivered: +3 🌾');
}
HOOKS.xp.push(n => {
  const f = S.fl; if (!f) return; const t = dayStr();
  f.xpAcc += n; while (f.xpAcc >= 20){ f.xpAcc -= 20; f.hay = Math.min(30, f.hay + 1); }
  if (f.lastPrac !== t){ f.streak = f.lastPrac && dayGap(f.lastPrac, t) === 1 ? f.streak + 1 : 1; f.lastPrac = t;
    if (f.streak % 3 === 0){ f.hay = Math.min(30, f.hay + 5); setTimeout(() => toast(`${f.streak}-day streak! +5 hay 🔥`), 900); } }
  const prev = f.wearSeen || 0; const now = wearOpen(S.xp).length + DECOR.filter(d => S.xp >= d[0]).length;
  if (now > prev && prev){ setTimeout(() => toast('New reward unlocked! See Progress 🎁'), 1500); } f.wearSeen = now; save();
});

/* ---- popup sheets (naming, rewards, subject picker) ---- */
let sheetOnClose = null;
function openSheet(build, dismissible){
  const w = $('#sheet'), box = w.firstElementChild; box.replaceChildren(); const close = () => { w.hidden = true; box.replaceChildren(); const f = sheetOnClose; sheetOnClose = null; if (f) f(); };
  build(box, close); w.hidden = false; w.onclick = dismissible ? e => { if (e.target === w) close(); } : null;
  const first = box.querySelector('button,input'); if (first) setTimeout(() => first.focus({preventScroll:true}), 30);
  return close;
}
function nameSheet(s, done){
  const used = S.fl.sheep.map(x => x.name), free = NAMES.filter(n => !used.includes(n)), seed = free.length ? pick(free) : 'Woolly';
  openSheet((box, close) => {
    const inp = h('input',{type:'text',maxlength:'14','aria-label':'Sheep name',value:seed}), art = h('div',{class:'art',html:sheepSVG(s)});
    const from = s.from === 'start' ? 'A lost lamb wandered into your meadow.' : s.rare ? s.line : `Rescued with ${SK[s.from] ? SK[s.from].n : 'your skills'}!`;
    box.append(h('h2',{id:'sheetT'}, s.rare ? '🏅 A rare sheep!' : s.from === 'start' ? 'Meet your first sheep' : 'Sheep rescued! 🎉'), art, h('div',{}, from), h('div',{class:'tag',style:'align-self:center'}, `${s.trait} · ${s.wool === 'glow' ? 'glowing' : s.wool} wool`),
      h('div',{class:'lbl'},'Name her'), inp,
      h('div',{class:'grid2'}, h('button',{class:'btn ghost',onclick:() => { inp.value = pick(NAMES.filter(n => n !== inp.value)); }},'🎲 Another name'),
        h('button',{class:'btn hlb',onclick:() => { s.name = (inp.value || '').trim().slice(0, 14) || seed; save(); close(); toast(`${s.name} joined the herd`); }},'Welcome to the herd')));
  }, false);
  sheetOnClose = done || null;
}
function drainNames(){
  if (!S.fl || !$('#sheet').hidden) return; const s = S.fl.sheep.find(x => !x.name); if (!s) return;
  nameSheet(s, () => { drainNames(); if (S.tab === 'meadow') go('meadow'); });
}
function subjectSheet(){
  openSheet((box, close) => {
    box.append(h('h2',{id:'sheetT'},'Choose a class'), h('div',{class:'hint'},'Your herd and level are shared by every class.'),
      h('div',{class:'subjlist'}, SUBJECTS.map(s => h('button',{class:s.id === S.subject ? 'on' : '',onclick:() => { S.subject = s.id; save(); close(); applySubject(); go(S.tab); }}, h('span',{class:'em'}, s.e), h('span',{}, s.n, h('small',{}, s.sub))))),
      h('button',{class:'btn ghost',onclick:close},'Close'));
  }, true);
}
function applySubject(){
  const s = subjOf(S.subject); $('#subj').innerHTML = `${s.e} ${s.n} <i>▾</i>`; $('#modebar').hidden = s.id !== 'math'; drawRing();
}

/* ---- subject shell: same structure, waiting for the class files ---- */
VIEWS.shell = (v, tab) => {
  const s = subjOf(S.subject), T = {learn:['Learn','Hands-on mini-labs, then Practice 5, then a rescue mission for each skill.'], guide:['Study guide','Every quiz and test, in order, graded against the key.'], boss:['Boss battles',`${s.boss}, plus a final boss for the whole class.`], games:['Games','Timed rushes, word match, step sorter and flash cards.']}[tab];
  v.append(h('div',{class:'card pad col c'}, h('div',{style:'font-size:44px'}, s.e), h('h2',{style:'font-size:22px'}, `${s.n} · ${T[0]}`), h('div',{}, T[1]), h('div',{class:'tag',style:'align-self:center'}, 'Coming soon')));
  v.append(h('div',{class:'hint'},'This class has the same structure as Math. Add its class files and each skill gets a lab, practice, a rescue mission and a boss.'));
  s.units.forEach(([name, items], i) => v.append(h('div',{class:'card pad u-' + 'wxd'[i],style:'border-style:dashed'}, h('div',{class:'unit u-' + 'wxd'[i]}, h('h2',{}, `Unit ${i + 1} · ${name}`)), h('div',{class:'hint'}, items))));
  v.append(h('button',{class:'btn hlb',onclick:() => { S.subject = 'math'; save(); applySubject(); go(tab); }}, '🧮 Back to Adv Math 7'), h('button',{class:'btn ghost',onclick:() => go('meadow')}, '🐑 Visit your meadow'));
};

/* ---- rescue missions ---- */
const stateOf = id => S.fl.rescued[id] ? ((mast(id) >= 80 && !S.fl.rescued2[id]) ? 'again' : 'done') : mast(id) >= 10 ? 'ready' : 'lock';
function rescueMap(){
  const wrap = h('div',{class:'col',style:'gap:6px'}, h('div',{class:'row sp'}, h('b',{style:'font:600 16px var(--fd)'}, '🗺️ Rescue map'), h('span',{class:'hint'}, `${S.fl.sheep.length} in the herd`)), h('div',{class:'hint'},'Practice a skill, then use it to rescue a sheep.'));
  const pins = h('div',{class:'pins',role:'list'});
  SKILLS.forEach(t => { const st = stateOf(t.id), lab = {lock:'Practice first', ready:'Rescue!', done:'Rescued ✓', again:'Rescue #2!'}[st];
    pins.append(h('button',{class:'pin ' + (st === 'again' ? 'ready' : st),role:'listitem','aria-label':`${t.n}: ${lab}`,onclick:() => { if (st === 'lock'){ S.focus = t.id; go('learn'); toast('Practice this skill first'); } else openMission(t.id, 'learn'); }},
      h('div',{class:'sh',html:sheepSVG(Object.assign(sheepFor(t.id, 0), {name:t.n}))}), h('span',{}, t.e + ' ' + t.n), h('small',{}, lab))); });
  wrap.append(pins); return wrap;
}
function missionWin(id, v, back){
  const f = S.fl, first = !f.rescued[id], second = !first && mast(id) >= 80 && !f.rescued2[id]; let s = null;
  bump(id, 3); xp(first ? 30 : 15);
  if (first){ f.rescued[id] = 1; s = addSheep(sheepFor(id, 0)); } else if (second){ f.rescued2[id] = 1; s = addSheep(sheepFor(id, 1)); } else f.hay = Math.min(30, f.hay + 2);
  save(); if (s) setTimeout(drainNames, 500); return s;
}
function openMission(id, back){
  const v = $('#view'), t = SK[id], f = S.fl, k = (+id) % SCN.length, first = !f.rescued[id], second = !first && mast(id) >= 80 && !f.rescued2[id];
  const prev = sheepFor(id, second ? 1 : 0); prev.name = 'Lost sheep';
  const exit = () => { if (cleanup){ cleanup(); cleanup = null; } go(back || 'learn'); };
  const intro = () => {
    v.replaceChildren(backBtn(back === 'meadow' ? 'Meadow' : 'Rescue map', exit),
      h('div',{class:'card pad col mission'}, h('div',{class:'scene',html:sceneSVG(prev, k)}), h('div',{class:'tag',style:'align-self:flex-start'}, 'Rescue mission'),
        h('h2',{style:'font-size:22px'}, SCN[k].t), h('div',{}, `A ${prev.trait.toLowerCase()} sheep is in trouble, and a goat is lurking nearby. To ${SCN[k].v}, solve a ${t.n} challenge.`),
        h('div',{class:'hint'}, `${t.e} ${t.n} · 3 problems · get 2 right to rescue her`), h('div',{class:'hint'}, first ? 'Reward: a new sheep for your herd.' : second ? 'Reward: her friend joins the herd (you mastered this skill).' : 'Patrol: extra hay for your herd.'),
        h('button',{class:'btn hlb',onclick:run},'Start the rescue'),
        h('button',{class:'btn ghost',onclick:() => { S.focus = id; go('learn'); }},'Practice this skill first')));
    window.scrollTo(0,0);
  };
  const run = () => {
    if (cleanup){ cleanup(); cleanup = null; }
    const box = h('div',{class:'col'}); v.replaceChildren(box);
    runSet(box, practiceSet(id, 3), {mode:'drill', onDone:(g, tt) => { const ok = g / tt >= .66; box.dataset.ok = ok ? '1' : '0'; if (ok) box._s = missionWin(id, v, back); },
      actions:() => { const ok = box.dataset.ok === '1', s = box._s;
        return ok ? [h('div',{class:'card pad col c',style:'border:2px solid var(--ok)'}, h('div',{style:'font-size:34px'}, '🐑✨'), h('h2',{style:'font-size:21px'}, s ? 'Rescue complete!' : 'Patrol complete!'), h('div',{}, s ? 'A new sheep is joining your herd.' : '+2 hay for the herd.')),
            h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:() => go('meadow')},'See the meadow'), h('button',{class:'btn ghost',onclick:exit},'Rescue map'))]
          : [h('div',{class:'card pad col c',style:'border:2px solid var(--no)'}, h('div',{style:'font-size:34px'}, '🐐'), h('h2',{style:'font-size:21px'}, 'The goat blocked the way'), h('div',{}, 'You need 2 of 3. Review, then try a fresh rescue.')),
            h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:run},'Try again'), h('button',{class:'btn ghost',onclick:() => { S.focus = id; go('learn'); }},'Practice lesson'))]; }});
    window.scrollTo(0,0);
  };
  intro();
}

/* ---- the meadow ---- */
function rng(seed){ let x = seed * 9301 + 49297; return () => { x = (x * 9301 + 49297) % 233280; return x / 233280; }; }
function worldSVG(Z){
  const W = Z * 360, H = 290, hr = new Date().getHours(), night = hr < 6 || hr >= 20, R = rng(7); let s = '', spots = [];
  s += `<defs><linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky1)"/><stop offset="1" style="stop-color:var(--sky2)"/></linearGradient><linearGradient id="fogg" x1="0" x2="1"><stop offset="0" style="stop-color:var(--sky2);stop-opacity:0"/><stop offset="1" style="stop-color:var(--sky2);stop-opacity:.96"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#skyg)"/>`;
  s += night ? `<circle cx="60" cy="38" r="15" fill="#F4F1DD"/><circle cx="68" cy="33" r="13" fill="var(--sky1)"/>` + Array.from({length:Z * 5}, () => `<circle cx="${(R() * W).toFixed(0)}" cy="${(R() * 80 + 6).toFixed(0)}" r="1.4" fill="#F4F1DD"/>`).join('') : `<circle cx="64" cy="40" r="19" fill="#F6E28A"/><circle cx="64" cy="40" r="25" fill="#F6E28A" opacity=".3"/>`;
  for (let k = 0; k < Z; k++) s += `<g fill="#fff" opacity="${night ? .25 : .8}"><ellipse cx="${k * 360 + 120 + R() * 120}" cy="${34 + R() * 28}" rx="30" ry="9"/><ellipse cx="${k * 360 + 138 + R() * 120}" cy="${28 + R() * 28}" rx="20" ry="8"/></g>`;
  s += `<path d="M0 130${Array.from({length:Z * 2}, (_, i) => `Q${i * 180 + 90} ${96 + (i % 2) * 18} ${i * 180 + 180} 130`).join('')}V${H}H0z" fill="var(--hlA)"/><path d="M0 150${Array.from({length:Z * 2}, (_, i) => `Q${i * 180 + 90} ${128 + ((i + 1) % 2) * 14} ${i * 180 + 180} 150`).join('')}V${H}H0z" fill="var(--hlB)"/>`;
  s += `<rect y="162" width="${W}" height="${H - 162}" fill="var(--gr1)"/><rect y="228" width="${W}" height="${H - 228}" fill="var(--gr2)"/>`;
  for (let k = 0; k < Z; k++){
    const x0 = k * 360, lm = k % 7;
    s += `<g aria-hidden="true">`;
    if (lm === 0){ s += `<rect x="${x0 + 238}" y="214" width="56" height="16" rx="4" fill="#8B6B3E"/><rect x="${x0 + 242}" y="218" width="48" height="8" rx="3" fill="#5FA3CC"/><ellipse cx="${x0 + 90}" cy="224" rx="22" ry="12" fill="#D9C06A"/><ellipse cx="${x0 + 90}" cy="222" rx="22" ry="10" fill="#E8D27C"/>`; spots.push({x:x0 + 266, w:1}); }
    else if (lm === 1){ s += `<ellipse cx="${x0 + 190}" cy="240" rx="82" ry="22" fill="#5FA3CC"/><ellipse cx="${x0 + 190}" cy="238" rx="64" ry="14" fill="#8CC3E6"/><path d="M${x0 + 120} 232v-18M${x0 + 126} 234v-22M${x0 + 258} 232v-20" stroke="#4B8A3C" stroke-width="3"/>`; spots.push({x:x0 + 190, w:1}); }
    else if (lm === 2){ s += `<path d="M${x0 + 120} 170h24l-4-70h-16z" fill="#C9BCE6"/><path d="M${x0 + 112} 100l20-20 20 20z" fill="#7656B0"/><g transform="translate(${x0 + 132} 96)"><path d="M0 0l30-6M0 0l-30 6M0 0l6 30M0 0l-6-30" stroke="#E6DFF5" stroke-width="5" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="14s" repeatCount="indefinite"/></path></g>`; }
    else if (lm === 3){ for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) s += `<circle cx="${x0 + 50 + c * 17 + (r % 2) * 8}" cy="${178 + r * 11}" r="3.6" fill="${r % 2 ? '#8F78C9' : '#A692DA'}"/>`; }
    else if (lm === 4){ s += `<path d="M${x0 + 20} 250q70-18 130 0t120-4" fill="none" stroke="#8CC3E6" stroke-width="12"/><path d="M${x0 + 120} 222q30-30 60 0" fill="none" stroke="#A9A4B6" stroke-width="9"/>`; }
    else if (lm === 5){ s += `<path d="M${x0 + 230} 176v-52l34-26 34 26v52z" fill="#A8503B"/><rect x="${x0 + 252}" y="146" width="24" height="30" fill="#7A3B2B"/><path d="M${x0 + 60} 214h100M${x0 + 70} 204v22M${x0 + 110} 204v22M${x0 + 150} 204v22" stroke="#8B6B3E" stroke-width="4"/>`; }
    else { for (let t = 0; t < 3; t++) s += `<rect x="${x0 + 70 + t * 90}" y="158" width="9" height="30" fill="#6B4B2E"/><circle cx="${x0 + 74 + t * 90}" cy="148" r="26" fill="#4B8A3C"/><circle cx="${x0 + 66 + t * 90}" cy="142" r="3" fill="#E8D26A"/><circle cx="${x0 + 84 + t * 90}" cy="150" r="3" fill="#E8D26A"/>`; }
    for (let i = 0; i < 9; i++) s += `<circle cx="${(x0 + R() * 360).toFixed(0)}" cy="${(190 + R() * 90).toFixed(0)}" r="2.4" fill="${['#fff','#E8D26A','#C9BCE6'][i % 3]}"/>`;
    s += `<g transform="translate(${x0 + 14} 172)"><rect x="0" y="0" width="4" height="22" fill="#8B6B3E"/><rect x="-8" y="-2" width="${6 + zoneName(k).length * 5.4}" height="16" rx="4" fill="var(--surf)" stroke="var(--line)"/><text x="-2" y="10" font-size="9" font-weight="700" fill="var(--ink)">${zoneName(k)}</text></g></g>`;
  }
  s += `<rect x="${W - 150}" width="150" height="${H}" fill="url(#fogg)"/><g transform="translate(${W - 120} 176)"><rect x="0" y="0" width="4" height="30" fill="#8B6B3E"/><rect x="-6" y="-8" width="104" height="26" rx="6" fill="var(--surf)" stroke="var(--line)"/><text x="0" y="5" font-size="8.5" font-weight="700" fill="var(--ink)">More meadow ahead…</text><text x="0" y="14" font-size="7.5" fill="var(--mut)">${3 - (S.fl.sheep.length % 3)} more sheep opens it</text></g>`;
  return {svg:`<svg class="bg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="An endless meadow with ${Z} zones">${s}</svg>`, W, spots};
}
const placeDecor = W => DECOR.filter(d => S.xp >= d[0]).map((d, i) => `<span aria-hidden="true" style="position:absolute;left:${(80 + i * 143 + (i % 3) * 29) % (W - 120)}px;top:${176 + (i * 37) % 70}px;font-size:${d[1] === '🌈' ? 56 : 30}px;line-height:1">${d[1]}</span>`).join('');

VIEWS.meadow = v => {
  const f = S.fl, Z = zonesOpen(), world = h('div',{class:'world'}), W = worldSVG(Z), scroller = h('div',{class:'meadow',tabindex:'0','aria-label':'Meadow. Swipe sideways to explore.'}, world);
  world.style.width = W.W + 'px'; world.innerHTML = W.svg + placeDecor(W.W);
  const els = {}, st = {}; let selId = f.sel && f.sheep.find(s => s.id === f.sel) ? f.sel : (f.sheep[0] && f.sheep[0].id);
  const info = h('div',{class:'card pad col'}), roster = h('div',{class:'roster'}), meters = h('div',{class:'card pad col'});
  const R = rng(f.sheep.length + 3);
  const say = (el, txt) => { const b = h('span',{class:'bub'}, txt); el.append(b); setTimeout(() => b.remove(), 1700); };
  const act = (s, a) => {
    const el = els[s.id], S0 = st[s.id]; if (!el) return;
    ['graze','nap','hop','roll'].forEach(c => el.classList.remove(c)); el.querySelectorAll('.zz').forEach(z => z.remove());
    if (a === 'nap'){ el.classList.add('nap'); el.append(h('span',{class:'zz'},'z z')); S0.until = Date.now() + 6000; }
    else if (a === 'graze'){ el.classList.add('graze'); S0.until = Date.now() + 4500; }
    else if (a === 'hop'){ void el.offsetWidth; el.classList.add('hop'); setTimeout(() => el.classList.remove('hop'), 600); }
    else if (a === 'roll'){ void el.offsetWidth; el.classList.add('roll'); setTimeout(() => el.classList.remove('roll'), 1300); }
    else if (a === 'bleat') say(el, pick(['Baa!','Baaa~','Meh!']));
    else if (a === 'wander' || a === 'drink'){
      const tx = a === 'drink' && W.spots.length ? pick(W.spots).x + (R() * 60 - 30) : clamp(S0.x + (R() * 240 - 120), 10, W.W - 170);
      el.classList.toggle('flip', tx < S0.x); S0.x = clamp(tx, 6, W.W - 150); el.style.left = S0.x + 'px';
      if (a === 'drink') setTimeout(() => { el.classList.add('graze'); say(el, 'Slurp'); S0.until = Date.now() + 3000; }, 2500);
    }
  };
  const place = s => {
    const idx = f.sheep.indexOf(s), x = 30 + ((idx * 97 + 41 * (idx % 3)) % (Math.max(2, Z) * 360 - 220)), y = 160 + (idx * 31) % 56;
    st[s.id] = {x, y, until:0};
    const el = h('button',{class:'sheep' + (s.id === selId ? ' sel' : ''),style:`left:${x}px;top:${y}px;z-index:${Math.round(y)}`,'aria-label':`${s.name || 'Sheep'}, ${s.trait}`,html:`<span class="nm">${s.name || ''}</span>${sheepSVG(s)}`});
    el.addEventListener('click', () => select(s.id)); els[s.id] = el; world.append(el);
  };
  const paintMeters = () => {
    meters.replaceChildren(h('div',{class:'row sp'}, h('b',{style:'font:600 18px var(--fd)'}, `${f.sheep.length} ${f.sheep.length === 1 ? 'sheep' : 'sheep'} · ${Z} zones`), h('span',{class:'chip',style:'min-height:28px'}, `🌾 ${f.hay} hay · 🔥 ${f.streak}-day streak`)),
      h('div',{class:'carebar'}, h('div',{}, h('div',{class:'lbl'},'Fed'), h('div',{class:'meter'}, h('i',{style:`width:${f.fed}%`}))), h('div',{}, h('div',{class:'lbl'},'Water'), h('div',{class:'meter wt'}, h('i',{style:`width:${f.water}%`})))),
      h('div',{class:'grid2'}, h('button',{class:'btn hlb',disabled:f.hay < 1,onclick:() => { if (f.hay < 1) return; f.hay--; f.fed = clamp(f.fed + 30, 0, 100); save(); f.sheep.forEach(s => { act(s, 'hop'); }); toast('Yum! The herd is fed'); paintMeters(); }}, 'Feed herd · 1 🌾'),
        h('button',{class:'btn ghost',onclick:() => { f.water = 100; save(); f.sheep.forEach(s => act(s, 'drink')); toast('Trough refilled 💧'); paintMeters(); }}, 'Refill water 💧')));
  };
  const select = id => {
    selId = id; f.sel = id; Object.keys(els).forEach(k => els[k].classList.toggle('sel', k === id)); paintInfo(); paintRoster();
    const s = f.sheep.find(x => x.id === id); if (s && st[s.id]){ const x = Math.max(0, st[s.id].x - 140); if (scroller.scrollTo) scroller.scrollTo({left:x, behavior:'smooth'}); else scroller.scrollLeft = x; }
  };
  const paintInfo = () => {
    const s = f.sheep.find(x => x.id === selId); if (!s){ info.replaceChildren(h('div',{class:'hint'}, 'Rescue sheep from the Learn tab to fill the meadow.')); return; }
    const from = s.from === 'start' ? 'Wandered in from the hills' : s.rare ? s.line : `Rescued with ${SK[s.from] ? SK[s.from].e + ' ' + SK[s.from].n : 'a skill'}`;
    const nm = h('input',{type:'text',maxlength:'14',value:s.name || '','aria-label':'Rename sheep',style:'flex:1;min-width:0'});
    nm.addEventListener('change', () => { s.name = nm.value.trim().slice(0, 14) || s.name; save(); if (els[s.id]) els[s.id].querySelector('.nm').textContent = s.name; paintRoster(); });
    info.replaceChildren(h('div',{class:'row',style:'flex-wrap:nowrap;gap:10px'}, h('div',{style:'width:70px;flex:none',html:sheepSVG(s)}), h('div',{style:'min-width:0;flex:1'}, h('div',{class:'row',style:'flex-wrap:nowrap'}, nm), h('div',{class:'hint'}, `${s.trait} · ${from}`))),
      h('div',{class:'row',style:'gap:6px'}, [['Graze','graze'],['Nap','nap'],['Hop','hop'],['Roll','roll'],['Baa!','bleat']].map(([l, a]) => h('button',{class:'chip',onclick:() => act(s, a)}, l))),
      h('div',{class:'lbl'},'Wardrobe'),
      h('div',{class:'row',style:'gap:6px'}, WEAR.map(([k, l, need]) => { const open = S.xp >= need; return h('button',{class:'chip' + (s.acc === k ? ' on' : ''),disabled:!open,'aria-pressed':String(s.acc === k),onclick:() => { s.acc = k; save(); const e = els[s.id]; e.querySelector('svg').outerHTML = sheepSVG(s); select(s.id); }}, open ? l : `🔒 ${need} XP`); })));
  };
  const paintRoster = () => roster.replaceChildren(...f.sheep.map(s => h('button',{class:s.id === selId ? 'on' : '','aria-label':s.name || 'Sheep',onclick:() => select(s.id)}, h('div',{html:sheepSVG(s),style:'width:100%;max-width:64px'}), h('span',{}, s.name || '…'))));
  f.sheep.forEach(place); paintMeters(); paintInfo(); paintRoster();
  /* the herd lives its life */
  const tick = setInterval(() => { if (document.hidden) return; f.sheep.forEach(s => { const q = st[s.id]; if (!q || Date.now() < q.until || R() < .45) return;
    const fav = (TRAITS.find(t => t[0] === s.trait) || [0, 'graze'])[1], a = R() < .4 ? fav : pick(['graze','graze','wander','nap','hop','roll','bleat','drink']); act(s, a); }); }, 2600);
  f.sheep.forEach((s, i) => setTimeout(() => act(s, i % 2 ? 'graze' : 'wander'), 300 + i * 120));
  cleanup = () => clearInterval(tick);
  const next = 3 - (f.sheep.length % 3);
  v.append(meters, scroller, h('div',{class:'hint c'}, `Swipe sideways. ${next} more ${next === 1 ? 'sheep opens' : 'sheep open'} a new zone.`), info, h('div',{class:'lbl'},'The herd'), roster,
    h('button',{class:'btn hlb',onclick:() => go('learn')}, '🗺️ Rescue more sheep'));
  const sel = f.sheep.find(s => s.id === selId); if (sel) setTimeout(() => { if (st[sel.id]) scroller.scrollLeft = Math.max(0, st[sel.id].x - 120); }, 40);
};

/* ---- first win against a boss gives a rare sheep ---- */
function bossWon(B){
  const f = S.fl; if (!f || f.bossWon[B.key]) return; f.bossWon[B.key] = 1;
  const s = addSheep(Object.assign({}, B.rare, {from:'boss', rare:true, trait:B.rare.trait})); save(); setTimeout(drainNames, 700);
}

/* ---- progress: herd stats, rewards, daily rules ---- */
function flockProgress(v){
  const f = S.fl, rescuedN = Object.keys(f.rescued).length;
  v.append(h('div',{class:'card pad col'}, h('div',{class:'row sp'}, h('b',{style:'font:600 18px var(--fd)'}, '🐑 Your herd'), h('button',{class:'chip',onclick:() => go('meadow')},'Visit')),
    h('div',{class:'grid2'}, h('div',{class:'card pad c'}, h('div',{class:'lbl'},'Sheep'), h('b',{style:'font:600 26px var(--fd)'}, String(f.sheep.length))), h('div',{class:'card pad c'}, h('div',{class:'lbl'},'Rescues'), h('b',{style:'font:600 26px var(--fd)'}, `${rescuedN}/${Object.keys(SK).length}`))),
    h('div',{class:'hint'}, `🔥 ${f.streak}-day streak · 🌾 ${f.hay} hay · 🏅 ${Object.keys(f.bossWon).length}/4 rare sheep from bosses`)));
  const wr = WEAR.slice(1).map(([k, l, need]) => `<div class="${S.xp >= need ? '' : 'lk'}"><span class="e">${{leaf:'🍃',flower:'🌼',bandana:'🟣',shades:'😎',party:'🎉',scarf:'🧣',cape:'🦸',wizard:'🧙'}[k]}</span>${l}<small>${S.xp >= need ? 'Unlocked' : need + ' XP'}</small></div>`);
  const dc = DECOR.map(([need, e, l]) => `<div class="${S.xp >= need ? '' : 'lk'}"><span class="e">${e}</span>${l}<small>${S.xp >= need ? 'In meadow' : need + ' XP'}</small></div>`);
  v.append(h('div',{class:'card pad col'}, h('b',{style:'font:600 17px var(--fd)'}, '🎁 Rewards for your XP'), h('div',{class:'lbl'},'Wardrobe'), h('div',{class:'rgrid',html:wr.join('')}), h('div',{class:'lbl'},'Meadow decorations'), h('div',{class:'rgrid',html:dc.join('')})));
  v.append(h('details',{class:'card pad'}, h('summary',{style:'font-weight:700;min-height:40px;display:flex;align-items:center;cursor:pointer'}, 'How the herd works'),
    h('div',{class:'col hint',style:'color:var(--ink);margin-top:6px'}, h('div',{}, '🗺️ Practice a skill, then rescue a sheep with its mission. 2 of 3 right wins.'), h('div',{}, '⭐ Master a skill (80%) and a second sheep can be rescued from it.'), h('div',{}, '🌾 Every 20 XP earns hay. New day: +3 free hay. A fed, watered herd earns +2 more.'), h('div',{}, '🔥 Practice 3 days in a row for +5 hay.'), h('div',{}, '🐐 Beat a boss with 90% for a rare sheep. More sheep open new zones, and the meadow never ends.'))));
}
