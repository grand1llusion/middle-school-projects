/* ---------- STUDY GUIDE / BOSS QUIZ / PROGRESS ---------- */
VIEWS.guide = v => {
  S.gp = S.gp || {};
  const home = () => { if (cleanup){ cleanup(); cleanup = null; } v.replaceChildren(); VIEWS.guide(v); window.scrollTo(0,0); };
  const run = (items, key) => {
    if (cleanup){ cleanup(); cleanup = null; }
    const box = h('div',{class:'col'});
    v.replaceChildren(backBtn('Study guide', home), box);
    runSet(box, items, {mode:'drill', onDone:(g,t) => { S.gp[gpKey(key)] = `${g}/${t}`; save(); }, actions:() => [h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:() => run(items, key)},'Try again'), h('button',{class:'btn ghost',onclick:home},'All parts'))]});
    window.scrollTo(0,0);
  };
  v.append(h('div',{class:'card pad row sp',style:'flex-wrap:nowrap'}, h('div',{}, h('b',{style:'font:600 17px var(--fd)'}, LAB.guide.title), h('div',{class:'hint'}, LAB.guide.sub)), h('span',{style:'font-size:30px'}, LAB.guide.emoji)),
    h('button',{class:'btn hlb',onclick:() => run(GUIDE, 'all')}, `Do all ${GUIDE.length}` + (S.gp[gpKey('all')] ? ` · last ${S.gp[gpKey('all')]}` : '')));
  PARTS.forEach(([L0, name, a, b, note]) => {
    const items = GUIDE.filter(q => q.no >= a && q.no <= b), u = SK[items[0].skill].u;
    v.append(h('button',{class:'card mrow u-' + u,style:'width:100%;text-align:left',onclick:() => run(items, L0)},
      h('span',{class:'ico',style:'font:600 17px var(--fd)'}, L0), h('div',{}, h('div',{class:'nm'}, name), h('div',{class:'hint'}, note || (a === b ? `#${a}` : `#${a}–${b}`))), h('span',{class:'pct',style:S.gp[gpKey(L0)] ? 'color:var(--ok)' : ''}, S.gp[gpKey(L0)] || '→')));
  });
};

const BOSSART = `<svg class="fx" viewBox="0 0 160 150" role="img" aria-label="A cartoon vampire named Count Negula"><ellipse cx="80" cy="142" rx="50" ry="5" fill="var(--line)"/>
<path d="M22 140L42 84h76l20 56z" fill="#3B2A6B"/><path d="M42 84l-26 26 30-6zM118 84l26 26-30-6z" fill="#C42F5A"/>
<path d="M50 88l30 24 30-24" fill="#fff"/><path d="M74 96l6 10 6-10" fill="#C42F5A"/>
<ellipse cx="80" cy="56" rx="36" ry="40" fill="#D9D3F2"/><path d="M44 50c0-30 18-42 36-42s36 12 36 42c-8-10-20-14-26-14l-10 14-10-14c-6 0-18 4-26 14z" fill="#2A1F4F"/>
<rect x="68" y="34" width="24" height="6" rx="3" fill="#C42F5A"/>
<circle cx="66" cy="58" r="8" fill="#fff"/><circle cx="94" cy="58" r="8" fill="#fff"/><circle cx="67" cy="60" r="4" fill="#141B33"/><circle cx="93" cy="60" r="4" fill="#141B33"/>
<path d="M56 46l18 6M104 46l-18 6" stroke="#141B33" stroke-width="4" stroke-linecap="round"/>
<path d="M64 78q16 10 32 0" fill="none" stroke="#141B33" stroke-width="3" stroke-linecap="round"/><path d="M70 80l3 8 3-7M84 81l3 7 3-8" fill="#fff" stroke="#141B33" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
VIEWS.boss = v => {
  const home = () => { if (cleanup){ cleanup(); cleanup = null; } v.replaceChildren(); VIEWS.boss(v); window.scrollTo(0,0); };
  const run = () => {
    if (cleanup){ cleanup(); cleanup = null; }
    const box = h('div',{class:'col'}); v.replaceChildren(box);
    runSet(box, buildBoss(), {mode:'boss', actions:() => [h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:run},'New quiz'), h('button',{class:'btn ghost',onclick:home},'Done'))]});
    window.scrollTo(0,0);
  };
  v.append(h('div',{class:'card pad col c u-x'}, h('div',{style:'max-width:132px;margin-inline:auto;width:100%',html:LAB.boss.art || BOSSART}),
    h('div',{class:'hpbar','aria-label':'Boss health full'}, h('i',{style:'width:100%'})),
    h('h2',{style:'font-size:26px'}, LAB.boss.name),
    h('div',{}, LAB.boss.blurb),
    h('div',{class:'grid2'}, h('div',{class:'card pad'}, h('div',{class:'lbl'},'Best'), h('b',{style:'font:600 26px var(--fd)'}, bossStat().runs ? bossStat().best + '%' : '–')), h('div',{class:'card pad'}, h('div',{class:'lbl'},'Tries'), h('b',{style:'font:600 26px var(--fd)'}, String(bossStat().runs)))),
    h('button',{class:'btn hlb',onclick:run}, LAB.boss.btn)),
    h('div',{class:'hint c'}, LAB.boss.foot));
};

VIEWS.me = v => {
  const into = S.xp % 100;
  v.append(h('div',{class:'card pad col'}, h('div',{class:'row sp'}, h('b',{style:'font:600 24px var(--fd)'}, 'Level ' + lvl()), h('span',{class:'hint'}, `${S.xp} XP · ${100 - into} to next`)), h('div',{class:'bar'}, h('i',{style:`width:${into}%`})),
    h('div',{class:'grid2'}, h('div',{class:'card pad c'}, h('div',{class:'lbl'},'Mastery'), h('b',{style:'font:600 26px var(--fd)'}, overall() + '%')), h('div',{class:'card pad c'}, h('div',{class:'lbl'},'Best boss'), h('b',{style:'font:600 26px var(--fd)'}, bossStat().runs ? bossStat().best + '%' : '–')))));
  const weak = SKILLS.slice().sort((a,b) => mast(a.id) - mast(b.id))[0];
  v.append(h('button',{class:'btn hlb',onclick:() => { S.focus = weak.id; go('learn'); }}, `Practice next: ${weak.e} ${weak.n}`));
  const list = h('div',{class:'card'}), C = chk(), n = () => READY.filter((_,i) => C[i]).length, head = h('div',{class:'lbl',style:'padding:10px 12px 0'});
  const paintHead = () => head.textContent = `Before the test · ${n()} of ${READY.length} checked`;
  list.append(head, ...READY.map((t,i) => { const b = h('button',{class:'chk' + (C[i] ? ' on' : ''),onclick:() => { C[i] = !C[i]; b.classList.toggle('on', C[i]); b.firstChild.textContent = C[i] ? '✓' : ''; save(); paintHead(); if (n() === READY.length) toast('Ready for the test! 🎉'); }}, h('i',{}, C[i] ? '✓' : ''), t); return b; }));
  paintHead(); v.append(list);
  Object.entries(UNITS).forEach(([u,name]) => {
    v.append(h('div',{class:'unit u-' + u}, h('h2',{}, name)));
    SKILLS.filter(t => t.u === u).forEach(t => v.append(h('button',{class:'card mrow u-' + t.u,style:'width:100%;text-align:left',onclick:() => { S.focus = t.id; go('learn'); }},
      h('span',{class:'ico'}, t.e), h('div',{}, h('div',{class:'nm'}, t.n), h('div',{class:'bar',style:'margin-top:5px'}, h('i',{style:`width:${mast(t.id)}%`}))), h('span',{class:'pct'}, mast(t.id) + '%'))));
  });
  const rs = h('button',{class:'btn ghost',style:'color:var(--no)'},'Reset my progress'); let armed = false, to;
  rs.addEventListener('click', () => {
    if (!armed){ armed = true; rs.textContent = 'Tap again to erase everything'; clearTimeout(to); to = setTimeout(() => { armed = false; rs.textContent = 'Reset my progress'; }, 3000); return; }
    const keep = MODE; Object.keys(S).forEach(k => delete S[k]); Object.assign(S, {m:{}, tab:'me', xp:0, best:0, bossRuns:0, hs:{}, chk:{}, chkM:{}, gp:{}, mode:keep});
    save(); drawRing(); toast('Progress reset'); v.replaceChildren(); VIEWS.me(v);
  });
  v.append(rs);
};

/* ---------- BOOT ---------- */
MODES.c = {units:UNITS_C, skills:SKILLS_C, guide:GUIDE_C, parts:PARTS_C, lab:LAB_C, cards:CARDS_C, games:GAMES_C, short:SHORT_C, steps:STEPS_C, ready:READY_C, boss:buildBossC};
MODES.m = {units:UNITS_M, skills:SKILLS_M, guide:GUIDE_M, parts:PARTS_M, lab:LAB_M, cards:CARDS_M, games:GAMES_M, short:SHORT_M, steps:STEPS_M, ready:READY_M, boss:buildBossM};
buildNav(); buildModebar(); setMode(S.mode); drawRing(); go(VIEWS[S.tab] ? S.tab : 'learn');
