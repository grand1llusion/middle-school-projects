/* ---------- FLASH CARDS ---------- */
const CARDS_C = [
  [1,'8 ÷ 6 as a fraction',`${fr(8,6)} = ${fr(4,3)} = <b>1${fr(1,3)}</b>`],
  [1,`What does ${fr(3,4)} mean?`,'<b>3 ÷ 4</b>. The fraction bar means divide.'],
  [1,'More to share than sharers?','Each one gets <b>more than 1</b> whole.'],
  [1,'3 pizzas, 4 friends',`Each gets 3 ÷ 4 = <b>${fr(3,4)}</b> pizza`],
  [2,'Like units','Pieces that are the <b>same size</b>, like sixths and sixths.'],
  [2,`${fr(1,2)} and ${fr(1,3)}: like units?`,`Cut both into <b>sixths</b>: ${fr(3,6)} and ${fr(2,6)}`],
  [2,`${fr(1,4)} = ${fr('?',20)}`,`<b>${fr(5,20)}</b>. Times 5 on top and bottom.`],
  [2,'Equivalent fractions',`Same amount, different names: ${fr(2,3)} = ${fr(4,6)} = ${fr(8,12)}`],
  [3,'Add the bottoms?','<b>Never!</b> Like units, add the tops, keep the bottom.'],
  [3,`${fr(1,4)} + ${fr(2,5)}`,`${fr(5,20)} + ${fr(8,20)} = <b>${fr(13,20)}</b>`],
  [3,`${fr(1,5)} + ${fr(3,8)}`,`${fr(8,40)} + ${fr(15,40)} = <b>${fr(23,40)}</b>`],
  [4,`${fr(1,2)} − ${fr(1,3)}`,`${fr(3,6)} − ${fr(2,6)} = <b>${fr(1,6)}</b>`],
  [4,'Subtracting fractions','Like units first. Then subtract the tops.'],
  [5,'Adding mixed numbers','Add the wholes. Add the fractions. Put them together.'],
  [5,`1${fr(2,3)} + 5${fr(2,7)}`,`Wholes 6, fractions ${fr(20,21)}: <b>6${fr(20,21)}</b>`],
  [5,'The fractions make more than 1?',`Regroup: ${fr(10,6)} = 1${fr(4,6)}. Add the 1 to the wholes.`],
  [6,'Rename a whole',`7${fr(9,24)} = <b>6${fr(33,24)}</b>. 1 whole = ${fr(24,24)}.`],
  [6,`7${fr(3,8)} − 6${fr(2,3)}`,`6${fr(33,24)} − 6${fr(16,24)} = <b>${fr(17,24)}</b>`],
  [6,`8 − 2${fr(3,8)}`,`7${fr(8,8)} − 2${fr(3,8)} = <b>5${fr(5,8)}</b>`],
  [7,'Benchmarks','<b>0, ½, 1.</b> Which one is the fraction closest to?'],
  [7,'Two fractions, both more than ½','Their sum is <b>more than 1</b>.'],
  [8,'Story problem steps','What do you need? What do you have? Find <b>every</b> step.'],
  [9,`${fr(5,20)} + ${fr(8,20)} = ${fr(13,40)}?`,`<b>Wrong.</b> Twentieths + twentieths = twentieths: ${fr(13,20)}`]
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
function gmHalf(){
  if (Math.random() < .6){
    let f; do f = rfrac([3,4,5,6,7,8,9,10,12]); while (!qcmp(f, HALF));
    const more = qcmp(f, HALF) > 0;
    return {prompt:`${EX(FR(f))}`, sub:'More or less than ½?', choices:['Less than ½','More than ½'], answer:more ? 1 : 0, cols:2, big:true, why:`Half of ${f.d} is ${half(f.d)}. ${f.n} is ${more ? 'more' : 'less'}.`, val:[f.n, f.d, 'h']};
  }
  const less = Math.random() < .5; let a, b; do { a = less ? lessHalf() : moreHalf(); b = less ? lessHalf() : moreHalf(); } while (a.d === b.d);
  return {prompt:`${EX(FR(a), '+', FR(b))}`, sub:'More or less than 1?', choices:['Less than 1','More than 1'], answer:less ? 0 : 1, cols:2, big:true, why:`Both are ${less ? 'less' : 'more'} than ½, so the sum is ${less ? 'less' : 'more'} than 1.`, val:[a.n, a.d, b.n, b.d]};
}
function gmPizza(){
  let n, k; do { n = rnd(1, 8); k = rnd(2, 6); } while (n === k || n % k === 0);
  const pool = [[n, k]]; [[k, n], [n, k + 1], [n + 1, k], [n - 1, k], [n, k - 1], [n + 2, k]].forEach(([a, b]) => { if (pool.length < 4 && a > 0 && b > 1 && a !== b && !pool.some(([x, y]) => x * b === a * y)) pool.push([a, b]); });
  const all = shuffle(pool), lab = all.map(([a, b]) => fr(a, b));
  return {prompt:`🍕 ${n} pizza${n > 1 ? 's' : ''}, ${k} friends. How much does each friend get?`, fig:pies(n, k), choices:lab, answer:all.findIndex(([a, b]) => a === n && b === k), cols:2, why:whyShare(n, k), val:[n, k]};
}
function gmPotion(){
  let a, c, T; for (;;){ const [x, y] = unlike([2,3,4,5,6,8,12], 24); a = x; c = y; T = qadd(a, c); if (qcmp(T, Q(1)) <= 0) break; }
  const L0 = lcm(a.d, c.d), wrongs = uniqVals(c, [Q(T.n - a.n, T.d - a.d), qadd(c, Q(1, L0)), Q(c.n, c.d + 1), qsub(c, Q(1, L0)), Q(c.n + 1, c.d)]).map(FR), all = shuffle([FR(c), ...wrongs]);
  const fig = bars([{parts:L0, on:up(a, L0), col:PA, lab:a}, {parts:L0, fills:Array.from({length:L0}, (_, k) => k < up(T, L0) ? 'var(--hl)' : 'var(--surf)'), lab:T}], {bh:22});
  return {prompt:`🧪 The cauldron has ${EXs(FR(a))}. Fill it to exactly ${EXs(FR(T))}. Which bottle?`, fig, choices:all, answer:all.indexOf(FR(c)), cols:2, why:`${FR(T)} − ${FR(a)}: in ${unitName(L0)}, ${fr(up(T, L0), L0)} − ${fr(up(a, L0), L0)} = ${fr(up(c, L0), L0)} = ${FR(c)}.`, val:[a.n, a.d, T.n, T.d, c.n, c.d]};
}
const GAMES_C = [
  {id:'half', e:'⚡', name:'Half Rush', d:'Bigger or smaller? 45 s', u:'d', skill:7, time:45, par:14, gen:gmHalf, how:'Is it more or less than ½? Is the sum more or less than 1? Use benchmarks. Don’t add! Go fast!'},
  {id:'match', e:'🧩', name:'Word Match', d:'Match fraction words', u:'w', custom:matchGame},
  {id:'steps', e:'🪜', name:'Step Sorter', d:'Order the rename steps', u:'x', custom:stepGame},
  {id:'pizza', e:'🍕', name:'Pizza Party', d:'Share it fairly', u:'w', skill:1, rounds:8, par:8, gen:gmPizza, how:'Look at the pizzas and the friends. Each friend’s share is pizzas ÷ friends. 8 rounds.'},
  {id:'potion', e:'🧪', name:'Potion Pour', d:'Fill it exactly', u:'w', skill:3, rounds:8, par:8, gen:gmPotion, how:'The cauldron needs an exact amount. Which bottle finishes it? Make like units. 8 rounds.'},
  {id:'cards', e:'🃏', name:'Flash Cards', d:'Flip. Swipe. Learn.', u:'d', custom:cardsGame}
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
    area.replaceChildren(...[h('div',{class:'pq' + (q.big ? ' c' : ''),html:q.prompt,style:q.big ? 'font-size:22px;min-height:60px;display:grid;place-items:center' : ''}), q.sub ? h('div',{class:'lbl c'}, q.sub) : null, q.fig ? h('div',{html:q.fig}) : null, list].filter(Boolean));
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
