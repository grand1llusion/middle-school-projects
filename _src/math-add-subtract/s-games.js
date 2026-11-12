/* ---------- FLASH CARDS ---------- */
const CARDS_C = [
  [1,'Add a positive','Hop <b>right</b> ➡️ on the number line.'],
  [1,'Add a negative','Hop <b>left</b> ⬅️ on the number line.'],
  [1,'8 − 3 vs 8 + (−3)','Same hop! Both land on <b>5</b>.'],
  [2,'Distance between two points','Bigger − smaller. <b>Never negative.</b>'],
  [2,'A = −2.25, B = 1.5. Distance?','Opposite sides of 0: 2.25 + 1.5 = <b>3.75</b>'],
  [2,'Absolute value','Distance from 0. |−7| = <b>7</b>'],
  [3,'Same signs','<b>Add</b> the sizes. Keep the sign.'],
  [3,'−3.45 + (−1.52)','Same signs: 3.45 + 1.52. Keep the negative: <b>−4.97</b>'],
  [3,'Do two negatives make a positive when you add?','<b>No!</b> −2 + (−3) = −5. Adding negatives goes further left.'],
  [4,'Opposite signs','<b>Subtract</b> the sizes. The bigger size wins the sign.'],
  [4,'10.9 + (−6.85)','10.9 − 6.85 = <b>4.05</b>. Positive is bigger.'],
  [4,'Zero pair','A number plus its opposite: 7 + (−7) = <b>0</b>'],
  [5,'Estimate first','Round to whole numbers, then add. Your answer should be close.'],
  [5,'Estimate −4.15 + (−3.87)','−4 + (−4) = <b>about −8</b>'],
  [6,'Keep · change · change','Keep the first. − becomes +. Second number → its opposite.'],
  [6,'3 − 11','3 + (−11) = <b>−8</b>'],
  [6,'−5.2 − (−9)','−5.2 + 9 = <b>3.8</b>'],
  [7,`4 − 7${fr(1,3)}`,`4 + (−7${fr(1,3)}) = <b>−3${fr(1,3)}</b>`],
  [7,'Subtracting mixed numbers','Rename to a common denominator. Borrow 1 if the top is too small.'],
  [8,'The temperature drops 12°','Add <b>−12</b>.'],
  [8,'It dropped 12° and now it is −7°C. Start?','Undo the drop: −7 + 12 = <b>5°C</b>']
];
function cardsGame(box, exit){
  let unit = S.cu || 'all', deck = [], i = 0, flip = false;
  const wrap = h('div',{class:'col'});
  box.replaceChildren(backBtn('Games', exit), wrap);
  const build = () => { deck = shuffle(CARDS.filter(c => unit === 'all' || SK[c[0]].u === unit)); i = 0; flip = false; draw(); };
  function next(good){ const c = deck[i]; if (good){ bump(c[0], 4); xp(1); } else deck.splice(Math.min(deck.length, i + 4), 0, c); i++; flip = false; draw(); }
  function draw(){
    wrap.replaceChildren(h('div',{class:'row',style:'gap:6px'}, [['all','All'], ...Object.entries(UNITS)].map(([k,l]) => h('button',{class:'chip' + (unit === k ? ' sel' : ''),style:'min-height:34px',onclick:() => { unit = k; S.cu = k; save(); build(); }}, l))));
    if (i >= deck.length){ wrap.append(h('div',{class:'card pad col c'}, h('h2',{style:'font-size:28px'},'Deck done! 🎉'), h('button',{class:'btn hlb',onclick:build},'Shuffle again'))); return; }
    const c = deck[i], t = SK[c[0]], toggle = () => { flip = !flip; card.classList.toggle('flip', flip); };
    const card = h('div',{class:'fc u-' + t.u + (flip ? ' flip' : ''),role:'button',tabindex:'0','aria-label':'Flashcard. Tap to flip.'},
      h('div',{class:'in'}, h('div',{class:'face'}, h('div',{class:'lbl'}, t.n), h('div',{class:'q',style:c[1].length > 24 ? 'font-size:23px' : '',html:c[1]}), h('div',{class:'tapn'},'tap to flip · swipe right = got it')),
        h('div',{class:'face back'}, h('div',{class:'a',html:c[2]}))));
    let x0 = null, y0 = 0;
    card.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; });
    card.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy)) next(dx > 0); else if (Math.abs(dx) < 12 && Math.abs(dy) < 12) toggle(); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); } });
    wrap.append(h('div',{class:'bar u-' + t.u}, h('i',{style:`width:${Math.round(i / deck.length * 100)}%`})), card,
      h('div',{class:'grid2'}, h('button',{class:'btn ghost',onclick:() => next(false)},'Again'), h('button',{class:'btn',onclick:() => next(true)},'Got it')), h('div',{class:'hint c'}, `${i + 1} / ${deck.length}`));
  }
  build();
}

/* ---------- ROUND GAMES ---------- */
function gmSign(){
  let a, b, e; const op = Math.random() < .5 ? '+' : '−';
  do { [a, b] = pair(K3(), sgn(), sgn()); e = op === '+' ? plus(a,b) : minus(a,b); } while (!e.q.n);
  return {prompt:EX([a,b],[op]), choices:['➕ Positive','➖ Negative'], answer:isNeg(e) ? 1 : 0, cols:2, big:true, why:`It equals ${fmt(e)}.`, val:qv(e.q)};
}
function gmHop(){
  let a, b, e, op;
  do { a = rnd(-9, 9); b = rnd(-9, 9); op = Math.random() < .55 ? '+' : '−'; e = op === '+' ? a + b : a - b; } while (!a || !b || Math.abs(e) > 10);
  const wrongs = [op === '+' ? a - b : a + b, -e, e + 1, e - 1, -a + b].filter((x,i,arr) => x !== e && arr.indexOf(x) === i).slice(0, 3);
  const all = shuffle([e, ...wrongs]).map(N), mv = e - a;
  return {prompt:`🐸 ${EX([mk(Q(a),'i'), mk(Q(b),'i')],[op]).replace('class="ex"','class="exs"')}`, fig:nline({min:-10, max:10, tick:1, lab:2, pts:[{x:a, t:'🐸', c:'var(--x)'}]}), choices:all, answer:all.indexOf(N(e)), cols:2, why:`Start at ${N(a)}. Hop ${mv > 0 ? 'right' : 'left'} ${N(Math.abs(mv))}: you land on ${N(e)}.`, val:e};
}
function gmThermo(){
  const back = Math.random() < .4, C = rnd(3, 18), T = rnd(-15, 15), up = Math.random() < .35;
  const e = back ? (up ? T - C : T + C) : (up ? T + C : T - C);
  if (!e) return gmThermo();
  const wrongs = [back ? (up ? T + C : T - C) : (up ? T - C : T + C), -e, -T - C, e + 2].filter((x,i,arr) => x !== e && arr.indexOf(x) === i).slice(0, 3);
  const all = shuffle([e, ...wrongs]).map(x => N(x) + '°');
  const story = back ? `It ${up ? 'rose' : 'dropped'} ${C}° and now it is <b>${N(T)}°</b>. What was the starting temperature?` : `It is <b>${N(T)}°</b>. Then it ${up ? 'rises' : 'drops'} <b>${C}°</b>. What is the temperature now?`;
  return {prompt:'🌡️ ' + story, choices:all, answer:all.indexOf(N(e) + '°'), cols:2, why:back ? `Undo it: ${N(T)} ${up ? '−' : '+'} ${C} = ${N(e)}°.` : `${N(T)} + ${up ? C : '(−' + C + ')'} = ${N(e)}°.`, val:e};
}
const GAMES_C = [
  {id:'sign', e:'⚡', name:'Sign Rush', d:'+ or −? 45 seconds', u:'x', skill:4, time:45, par:15, gen:gmSign, how:'Is the answer positive or negative? You don’t have to solve it all the way. Go fast!'},
  {id:'match', e:'🧩', name:'Word Match', d:'Match math words', u:'w', custom:matchGame},
  {id:'steps', e:'🪜', name:'Step Sorter', d:'Order the subtract steps', u:'d', custom:stepGame},
  {id:'hop', e:'🐸', name:'Frog Hops', d:'Where does it land?', u:'w', skill:1, rounds:8, par:8, gen:gmHop, how:'Start where the frog is. Add a positive or subtract a negative: hop right. Otherwise hop left. 8 rounds.'},
  {id:'thermo', e:'🌡️', name:'Temp Drop', d:'Hot and cold stories', u:'d', skill:8, rounds:8, par:8, gen:gmThermo, how:'A drop adds a negative. A rise adds a positive. Some go backward! 8 rounds.'},
  {id:'cards', e:'🃏', name:'Flash Cards', d:'Flip. Swipe. Learn.', u:'x', custom:cardsGame}
];

function playGame(box, G, exit){
  const st = {n:0, score:0, streak:0, best:0, tl:G.time || 0, over:false};
  let timer = null, adv = null, locked = false;
  const stop = () => { clearInterval(timer); clearTimeout(adv); timer = adv = null; };
  cleanup = stop;
  const back = backBtn('Games', () => { stop(); cleanup = null; exit(); });
  const hud = h('div',{class:'row sp',style:'font-weight:700'}), area = h('div',{class:'col'}), bar = G.time ? h('div',{class:'bar'}, h('i',{style:'width:100%;transition:width 1s linear'})) : null;
  const paintHud = () => { hud.replaceChildren(h('span',{}, G.rounds ? `Round ${Math.min(st.n, G.rounds)}/${G.rounds}` : `Streak ${st.streak} 🔥`), h('span',{class:'hl'}, `Score ${st.score}`), h('span',{}, G.time ? `${st.tl}s` : '')); if (bar) bar.firstChild.style.width = (st.tl / G.time * 100) + '%'; };
  const isLast = () => G.rounds && st.n >= G.rounds;
  function next(){
    clearTimeout(adv); if (st.over) return; if (isLast()) return end();
    const q = G.gen(); st.n++; locked = false; paintHud();
    const btns = [], list = h('div',{class:'opts' + (q.cols === 2 ? ' g2' : '') + (q.big ? ' big' : '')});
    q.choices.forEach((c,k) => { const b = h('button',{class:'opt',html:c,onclick:() => choose(k)}); btns.push(b); list.append(b); });
    function choose(k){
      if (locked || st.over) return; locked = true;
      const ok = k === q.answer; btns[q.answer].classList.add('good');
      if (ok){ st.score++; st.streak++; st.best = Math.max(st.best, st.streak); btns[k].classList.add('pop'); } else { st.streak = 0; btns[k].classList.add('bad','shake'); }
      paintHud();
      if (!(ok && G.time)) area.append(h('div',{class:'fb ' + (ok ? 'good' : 'bad'),html:(ok ? (st.streak >= 3 ? `🔥 ${st.streak} in a row! ` : '✓ ') : '✗ ') + q.why}));
      if (ok) adv = setTimeout(next, G.time ? 300 : 1100); else if (G.time) adv = setTimeout(next, 1500); else area.append(h('button',{class:'btn',onclick:next}, isLast() ? 'See results' : 'Next'));
    }
    area.replaceChildren(...[h('div',{class:'pq',html:q.prompt,style:q.big ? 'font-size:22px;min-height:84px' : ''}), q.fig ? h('div',{html:q.fig}) : null, list].filter(Boolean));
  }
  function end(){
    st.over = true; stop(); cleanup = null;
    const sc = st.score, prev = S.hs[G.id] || 0, nb = sc > prev; if (nb) S.hs[G.id] = sc;
    xp(sc * 3); bump(G.skill, Math.round(8 * Math.min(1, sc / G.par))); save();
    box.replaceChildren(back, h('div',{class:'card pad col c'}, h('div',{class:'lbl'}, G.name), h('div',{class:'score'}, G.rounds ? `${sc}/${G.rounds}` : String(sc)),
      h('div',{class:'big-out'}, nb && prev > 0 ? 'New best! 🎉' : sc >= G.par ? 'Great run!' : 'Nice try'), h('div',{class:'hint'}, `Best: ${S.hs[G.id]} · longest streak: ${st.best} · +${sc * 3} XP`)),
      h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:() => playGame(box, G, exit)},'Play again'), h('button',{class:'btn ghost',onclick:exit},'All games')));
    window.scrollTo(0,0);
  }
  box.replaceChildren(back, hud, ...(bar ? [bar] : []), area); paintHud();
  if (G.time) timer = setInterval(() => { st.tl--; paintHud(); if (st.tl <= 0) end(); }, 1000);
  next();
}

/* a stopwatch shared by the timed puzzles; lower time is better */
function stopwatch(el){ const t0 = Date.now(); let pen = 0; const iv = setInterval(() => { el.textContent = `⏱ ${((Date.now() - t0) / 1000 + pen).toFixed(0)}s`; }, 250); return {add:s => pen += s, stop:() => { clearInterval(iv); return Math.round(((Date.now() - t0) / 1000 + pen) * 10) / 10; }, kill:() => clearInterval(iv)}; }
function timeResult(box, id, name, secs, exit, again, extra){
  const prev = S.hs[id], nb = !prev || secs < prev; if (nb) S.hs[id] = secs; xp(15); save();
  box.replaceChildren(backBtn('Games', exit), h('div',{class:'card pad col c'}, h('div',{class:'lbl'}, name), h('div',{class:'score'}, secs + 's'), h('div',{class:'big-out'}, nb && prev ? 'New record! 🎉' : nb ? 'First record set!' : 'Done!'), h('div',{class:'hint'}, `Best: ${S.hs[id]}s · ${extra} · +15 XP`)),
    h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:again},'Play again'), h('button',{class:'btn ghost',onclick:exit},'All games')));
}

function matchGame(box, exit){
  const clock = h('b',{}), area = h('div',{class:'col'}), rounds = shuffle(Object.keys(SHORT));
  let r = 0, miss = 0, sel = null; const sw = stopwatch(clock); cleanup = sw.kill;
  box.replaceChildren(backBtn('Games', () => { sw.kill(); cleanup = null; exit(); }), h('div',{class:'row sp'}, h('span',{class:'hint'},'Tap a word, then its meaning.'), clock), area);
  const deal = () => {
    const words = rounds.slice(r*4, r*4 + 4), left = h('div',{class:'col',style:'gap:6px'}), right = h('div',{class:'col',style:'gap:6px'}); let left4 = words.length;
    shuffle(words).forEach(w => { const b = h('button',{class:'tile u-w',style:'min-height:60px',onclick:() => { if (b.disabled) return; left.querySelectorAll('.tile').forEach(x => x.classList.remove('sel')); b.classList.add('sel'); sel = w; }}, w); left.append(b); });
    shuffle(words).forEach(w => { const b = h('button',{class:'tile',style:'min-height:60px;font-size:13px',onclick:() => {
      if (b.disabled || !sel) return;
      const lb = [...left.children].find(x => x.textContent === sel);
      if (sel === w){ [lb, b].forEach(x => { x.classList.remove('sel'); x.classList.add('good'); x.disabled = true; }); sel = null; if (--left4 === 0){ r++; if (r * 4 >= rounds.length){ const s = sw.stop(); cleanup = null; bump(LAB.matchSkill, 10); timeResult(box, GAMES.find(g => g.custom === matchGame).id, 'Word Match', s, exit, () => matchGame(box, exit), `${miss} miss${miss === 1 ? '' : 'es'}`); } else setTimeout(deal, 350); } }
      else { miss++; sw.add(2); [lb, b].forEach(x => x.classList.add('bad','shake')); setTimeout(() => [lb, b].forEach(x => x.classList.remove('bad','shake')), 450); toast('+2 seconds'); }
    }}, SHORT[w]); right.append(b); });
    area.replaceChildren(h('div',{class:'lbl'}, `Round ${r + 1} of ${Math.ceil(rounds.length / 4)}`), h('div',{class:'grid2'}, left, right));
  };
  deal();
}
function stepGame(box, exit){
  const clock = h('b',{}), slots = h('div',{class:'ord'}), pk = h('div',{class:'pick'}); let nxt = 0, miss = 0; const sw = stopwatch(clock); cleanup = sw.kill;
  const paint = () => slots.replaceChildren(...STEPS.map((s,k) => h('div',{class:'slot' + (k < nxt ? ' good' : '')}, h('i',{}, k + 1), k < nxt ? s[0] : '')));
  shuffle(STEPS.map((s,i) => i)).forEach(i => { const b = h('button',{style:'min-height:48px',onclick:() => {
    if (i === nxt){ b.remove(); nxt++; paint(); if (nxt === STEPS.length){ const s = sw.stop(); cleanup = null; bump(LAB.stepSkill, 8); timeResult(box, GAMES.find(g => g.custom === stepGame).id, 'Step Sorter', s, exit, () => stepGame(box, exit), `${miss} miss${miss === 1 ? '' : 'es'}`); } }
    else { miss++; sw.add(2); b.classList.add('bad','shake'); setTimeout(() => b.classList.remove('bad','shake'), 450); toast('+2 seconds'); }
  }}, STEPS[i][0]); pk.append(b); });
  box.replaceChildren(backBtn('Games', () => { sw.kill(); cleanup = null; exit(); }), h('div',{class:'row sp'}, h('span',{class:'hint'},`Tap the ${STEPS.length} steps in order. Wrong tap = +2s.`), clock), slots, pk);
  paint();
}

VIEWS.games = v => {
  const show = () => {
    if (cleanup){ cleanup(); cleanup = null; }
    v.replaceChildren(h('div',{class:'grid2'}, GAMES.map(G => h('button',{class:'tile u-' + G.u,style:'min-height:118px;gap:2px;align-content:center;border-color:var(--ac);padding:8px',onclick:() => open(G)},
      h('span',{style:'font-size:30px;line-height:1.1'}, G.e), h('b',{style:'font:600 17px/1.1 var(--fd)'}, G.name), h('span',{class:'hint'}, G.d),
      S.hs[G.id] != null ? h('span',{class:'hl',style:'font-size:12px;margin-top:2px'}, 'Best ' + S.hs[G.id] + (G.custom && G.id !== 'cards' ? 's' : '')) : null))));
    window.scrollTo(0,0);
  };
  const open = G => {
    const box = h('div',{class:'col u-' + G.u}); v.replaceChildren(box); window.scrollTo(0,0);
    if (G.custom) return G.custom(box, show);
    box.append(backBtn('Games', show), h('div',{class:'card pad col c'}, h('div',{style:'font-size:44px;line-height:1'}, G.e), h('h2',{style:'font-size:26px'}, G.name), h('div',{}, G.how), S.hs[G.id] != null ? h('div',{class:'hint'}, 'Best: ' + S.hs[G.id]) : null, h('button',{class:'btn hlb',onclick:() => playGame(box, G, show)},'Start')));
  };
  show();
};
