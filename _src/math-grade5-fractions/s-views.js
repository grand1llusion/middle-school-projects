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

const BOSSART = `<svg class="fx" viewBox="0 0 160 150" role="img" aria-label="A cartoon purple dragon called the Denominator Dragon"><ellipse cx="80" cy="144" rx="54" ry="5" fill="var(--line)"/>
<path d="M110 122c20 6 34-2 38-18l9 5-5-14-10 5c-2 12-12 18-30 12z" fill="#6D49B6"/>
<path d="M48 80L10 50l8 30-14 2 34 18z" fill="#C3A6F0" stroke="#5A3A9C" stroke-width="2" stroke-linejoin="round"/><path d="M112 80l38-30-8 30 14 2-34 18z" fill="#C3A6F0" stroke="#5A3A9C" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="80" cy="110" rx="38" ry="33" fill="#8159CC"/><ellipse cx="80" cy="116" rx="23" ry="23" fill="#F6DCA8"/><path d="M64 106h32M62 116h36M66 126h28" stroke="#D8B36E" stroke-width="2"/>
<ellipse cx="60" cy="141" rx="12" ry="6" fill="#6D49B6"/><ellipse cx="100" cy="141" rx="12" ry="6" fill="#6D49B6"/>
<path d="M57 30l-8-22 18 14zM103 30l8-22-18 14z" fill="#F6DCA8" stroke="#C69A4E" stroke-width="1.5"/><path d="M74 20l6-10 6 10z" fill="#E58BB8"/>
<ellipse cx="80" cy="50" rx="35" ry="28" fill="#9068DA"/><ellipse cx="80" cy="66" rx="21" ry="12" fill="#AE8CEA"/><circle cx="72" cy="64" r="2.6" fill="#36205F"/><circle cx="88" cy="64" r="2.6" fill="#36205F"/>
<circle cx="66" cy="44" r="8.5" fill="#fff"/><circle cx="94" cy="44" r="8.5" fill="#fff"/><circle cx="67" cy="46" r="4.2" fill="#21183A"/><circle cx="93" cy="46" r="4.2" fill="#21183A"/>
<path d="M55 33l17 6M105 33l-17 6" stroke="#21183A" stroke-width="3.6" stroke-linecap="round"/><path d="M69 74q11 7 22 0" fill="none" stroke="#21183A" stroke-width="2.6" stroke-linecap="round"/><path d="M73 75l2.5 5 2.5-4M83 76l2.5 4 2.5-5" fill="#fff" stroke="#21183A" stroke-width="1"/>
<circle cx="40" cy="58" r="6" fill="#E6DCF5" opacity=".9"/><circle cx="30" cy="50" r="4" fill="#E6DCF5" opacity=".8"/><text x="13" y="40" font-size="13" font-weight="800" fill="#B4528F">?/?</text></svg>`;
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
  list.append(head, ...READY.map((t,i) => { const b = h('button',{class:'chk' + (C[i] ? ' on' : ''),onclick:() => { C[i] = !C[i]; b.classList.toggle('on', C[i]); b.firstChild.textContent = C[i] ? '✓' : ''; save(); paintHead(); if (n() === READY.length) toast('Ready for the test! 🎉'); }}, h('i',{}, C[i] ? '✓' : ''), h('span',{html:t})); return b; }));
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
buildNav(); buildModebar(); setMode(S.mode); drawRing(); go(VIEWS[S.tab] ? S.tab : 'learn');
