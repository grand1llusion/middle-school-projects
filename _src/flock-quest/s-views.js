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

VIEWS.me = v => {
  const into = S.xp % 100;
  v.append(h('div',{class:'card pad col'}, h('div',{class:'row sp'}, h('b',{style:'font:600 24px var(--fd)'}, 'Level ' + lvl()), h('span',{class:'hint'}, `${S.xp} XP · ${100 - into} to next`)), h('div',{class:'bar'}, h('i',{style:`width:${into}%`})),
    h('div',{class:'grid2'}, h('div',{class:'card pad c'}, h('div',{class:'lbl'},'Mastery'), h('b',{style:'font:600 26px var(--fd)'}, overall() + '%')), h('div',{class:'card pad c'}, h('div',{class:'lbl'},'Best boss'), h('b',{style:'font:600 26px var(--fd)'}, bossStat().runs ? bossStat().best + '%' : '–')))));
  flockProgress(v);
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
    if (!armed){ armed = true; rs.textContent = 'Tap again to erase everything, sheep too'; clearTimeout(to); to = setTimeout(() => { armed = false; rs.textContent = 'Reset my progress'; }, 3000); return; }
    const keep = MODE; Object.keys(S).forEach(k => delete S[k]); const subj = S.subject; Object.assign(S, {m:{}, tab:'me', xp:0, best:0, bossRuns:0, hs:{}, chk:{}, chkM:{}, chkD:{}, gp:{}, mode:keep, subject:subj}); imported = false; initFlock(); dailyCheck();
    save(); drawRing(); toast('Progress reset'); v.replaceChildren(); VIEWS.me(v);
  });
  v.append(rs);
};

