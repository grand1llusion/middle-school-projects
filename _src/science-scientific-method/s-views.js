/* ---------- STUDY GUIDE / BOSS QUIZ / PROGRESS ---------- */
VIEWS.guide = v => {
  S.gp = S.gp || {};
  const home = () => { if (cleanup){ cleanup(); cleanup = null; } v.replaceChildren(); VIEWS.guide(v); window.scrollTo(0,0); };
  const run = (items, key) => {
    if (cleanup){ cleanup(); cleanup = null; }
    const box = h('div',{class:'col'});
    v.replaceChildren(backBtn('Study guide', home), box);
    runSet(box, items, {mode:'drill', onDone:(g,t) => { S.gp[key] = `${g}/${t}`; save(); }, actions:() => [h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:() => run(items, key)},'Try again'), h('button',{class:'btn ghost',onclick:home},'All parts'))]});
    window.scrollTo(0,0);
  };
  v.append(h('div',{class:'card pad row sp',style:'flex-wrap:nowrap'}, h('div',{}, h('b',{style:'font:600 17px var(--fd)'},'Your class study guide'), h('div',{class:'hint'},'All 26 questions, checked with the answer key.')), h('span',{style:'font-size:30px'},'📋')),
    h('button',{class:'btn hlb',onclick:() => run(GUIDE, 'all')}, 'Do all 26' + (S.gp.all ? ` · last ${S.gp.all}` : '')));
  PARTS.forEach(([L0, name, a, b]) => {
    const items = GUIDE.filter(q => q.no >= a && q.no <= b), u = SK[items[0].skill].u;
    v.append(h('button',{class:'card mrow u-' + u,style:'width:100%;text-align:left',onclick:() => run(items, L0)},
      h('span',{class:'ico',style:'font:600 17px var(--fd)'}, L0), h('div',{}, h('div',{class:'nm'}, name), h('div',{class:'hint'}, a === b ? `#${a}` : `#${a}–${b}`)), h('span',{class:'pct',style:S.gp[L0] ? 'color:var(--ok)' : ''}, S.gp[L0] || '→')));
  });
};

const BEAST = `<svg class="fx" viewBox="0 0 160 140" role="img" aria-label="A cartoon beaker monster"><ellipse cx="80" cy="132" rx="46" ry="5" fill="var(--line)"/>
<path d="M62 14h36M66 14v34L34 108c-5 10 2 20 13 20h66c11 0 18-10 13-20L94 48V14" fill="var(--surf)" stroke="var(--ink)" stroke-width="4" stroke-linejoin="round"/>
<path d="M50 80h60l18 30c4 8-1 14-10 14H42c-9 0-14-6-10-14z" fill="var(--x)"/>
<circle cx="70" cy="60" r="4" fill="var(--x)" opacity=".7"/><circle cx="88" cy="44" r="3" fill="var(--x)" opacity=".6"/><circle cx="80" cy="28" r="2.5" fill="var(--x)" opacity=".5"/>
<circle cx="64" cy="96" r="9" fill="#fff"/><circle cx="96" cy="96" r="9" fill="#fff"/><circle cx="66" cy="98" r="4" fill="#12261D"/><circle cx="94" cy="98" r="4" fill="#12261D"/>
<path d="M52 84l20 6M108 84l-20 6" stroke="#12261D" stroke-width="4" stroke-linecap="round"/><path d="M62 114l6 5 6-5 6 5 6-5 6 5 6-5" fill="none" stroke="#12261D" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
VIEWS.boss = v => {
  const home = () => { if (cleanup){ cleanup(); cleanup = null; } v.replaceChildren(); VIEWS.boss(v); window.scrollTo(0,0); };
  const run = () => {
    if (cleanup){ cleanup(); cleanup = null; }
    const box = h('div',{class:'col'}); v.replaceChildren(box);
    runSet(box, buildBoss(), {mode:'boss', actions:() => [h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:run},'New quiz'), h('button',{class:'btn ghost',onclick:home},'Done'))]});
    window.scrollTo(0,0);
  };
  v.append(h('div',{class:'card pad col c u-x'}, h('div',{style:'max-width:132px;margin-inline:auto;width:100%',html:BEAST}),
    h('div',{class:'hpbar','aria-label':'Boss health full'}, h('i',{style:'width:100%'})),
    h('h2',{style:'font-size:26px'},'The Beaker Beast'),
    h('div',{}, '15 new questions from every part of the test. Answers come at the end.'),
    h('div',{class:'grid2'}, h('div',{class:'card pad'}, h('div',{class:'lbl'},'Best'), h('b',{style:'font:600 26px var(--fd)'}, S.bossRuns ? S.best + '%' : '–')), h('div',{class:'card pad'}, h('div',{class:'lbl'},'Tries'), h('b',{style:'font:600 26px var(--fd)'}, String(S.bossRuns)))),
    h('button',{class:'btn hlb',onclick:run},'Fight the Beast')),
    h('div',{class:'hint c'},'90% or better defeats the Beast. New questions every try.'));
};

const READY = ['I can explain the science vocabulary.','I can tell observations from inferences.','I can identify IV (cause) and DV (effect).','I can explain how to make a fair test.','I can put the scientific process in order.','I can choose a testable question and recognize a model.','I can read graph patterns and find mean, median, and mode.','I can use evidence and report results honestly.'];
VIEWS.me = v => {
  const into = S.xp % 100;
  v.append(h('div',{class:'card pad col'}, h('div',{class:'row sp'}, h('b',{style:'font:600 24px var(--fd)'}, 'Level ' + lvl()), h('span',{class:'hint'}, `${S.xp} XP · ${100 - into} to next`)), h('div',{class:'bar'}, h('i',{style:`width:${into}%`})),
    h('div',{class:'grid2'}, h('div',{class:'card pad c'}, h('div',{class:'lbl'},'Mastery'), h('b',{style:'font:600 26px var(--fd)'}, overall() + '%')), h('div',{class:'card pad c'}, h('div',{class:'lbl'},'Best boss'), h('b',{style:'font:600 26px var(--fd)'}, S.bossRuns ? S.best + '%' : '–')))));
  const weak = SKILLS.slice().sort((a,b) => mast(a.id) - mast(b.id))[0];
  v.append(h('button',{class:'btn hlb',onclick:() => { S.focus = weak.id; go('learn'); }}, `Practice next: ${weak.e} ${weak.n}`));
  const list = h('div',{class:'card'}), n = () => READY.filter((_,i) => S.chk[i]).length, head = h('div',{class:'lbl',style:'padding:10px 12px 0'});
  const paintHead = () => head.textContent = `Before the test · ${n()} of ${READY.length} checked`;
  list.append(head, ...READY.map((t,i) => { const b = h('button',{class:'chk' + (S.chk[i] ? ' on' : ''),onclick:() => { S.chk[i] = !S.chk[i]; b.classList.toggle('on', S.chk[i]); b.firstChild.textContent = S.chk[i] ? '✓' : ''; save(); paintHead(); if (n() === READY.length) toast('Ready for the test! 🎉'); }}, h('i',{}, S.chk[i] ? '✓' : ''), t); return b; }));
  paintHead(); v.append(list);
  Object.entries(UNITS).forEach(([u,name]) => {
    v.append(h('div',{class:'unit u-' + u}, h('h2',{}, name)));
    SKILLS.filter(t => t.u === u).forEach(t => v.append(h('button',{class:'card mrow u-' + t.u,style:'width:100%;text-align:left',onclick:() => { S.focus = t.id; go('learn'); }},
      h('span',{class:'ico'}, t.e), h('div',{}, h('div',{class:'nm'}, t.n), h('div',{class:'bar',style:'margin-top:5px'}, h('i',{style:`width:${mast(t.id)}%`}))), h('span',{class:'pct'}, mast(t.id) + '%'))));
  });
  const rs = h('button',{class:'btn ghost',style:'color:var(--no)'},'Reset my progress'); let armed = false, to;
  rs.addEventListener('click', () => {
    if (!armed){ armed = true; rs.textContent = 'Tap again to erase everything'; clearTimeout(to); to = setTimeout(() => { armed = false; rs.textContent = 'Reset my progress'; }, 3000); return; }
    Object.keys(S).forEach(k => delete S[k]); Object.assign(S, {m:{}, tab:'me', xp:0, best:0, bossRuns:0, hs:{}, chk:{}, gp:{}});
    save(); drawRing(); toast('Progress reset'); v.replaceChildren(); VIEWS.me(v);
  });
  v.append(rs);
};

/* ---------- BOOT ---------- */
buildNav(); drawRing(); go(VIEWS[S.tab] ? S.tab : 'learn');
