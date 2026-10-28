/* ---------- FLASH CARDS ---------- */
const CARDS = [
  ...WORDS.map(w => [w[0] === 'Observation' || w[0] === 'Inference' ? 2 : w[0] === 'Model' || w[0] === 'Conclusion' ? 9 : w[0] === 'Controlled experiment' || w[0] === 'Variable' ? 4 : w[0] === 'Hypothesis' ? 6 : 1, w[3] + ' ' + w[0], w[1] + `<div class="hint" style="margin-top:6px">${w[2]}</div>`]),
  [6,'IV','Independent variable: what you <b>change</b>. The cause.'],
  [6,'DV','Dependent variable: what you <b>measure</b>. The effect.'],
  [4,'Fair test','Change <b>one</b> thing. Keep everything else the same.'],
  [3,'Testable question','You can change something and <b>measure</b> the result.'],
  [5,'The 6 steps','Question → Hypothesis → Procedure → Experiment → Analyze → Conclusion'],
  [2,'Which comes first: observation or inference?','<b>Observation.</b> You notice before you explain.'],
  [8,'Mean','Add them up. Divide by how many.'],
  [8,'Median','The <b>middle</b> number, once they are in order.'],
  [8,'Mode','The number that shows up <b>most</b>. No repeats = no mode.'],
  [7,'A good graph has…','Title · labeled x-axis · labeled y-axis · even scale'],
  [9,'Strong conclusion','Says if the results support the hypothesis and <b>uses the numbers</b>.'],
  [9,'Results don’t support the hypothesis?','Report the evidence <b>honestly</b> and explain it.']
];
function cardsGame(box, exit){
  let unit = S.cu || 'all', deck = [], i = 0, flip = false;
  const wrap = h('div',{class:'col'});
  box.replaceChildren(backBtn('Games', exit), wrap);
  const build = () => { deck = shuffle(CARDS.filter(c => unit === 'all' || SK[c[0]].u === unit)); i = 0; flip = false; draw(); };
  function next(good){ const c = deck[i]; if (good){ bump(c[0], 4); xp(1); } else deck.splice(Math.min(deck.length, i + 4), 0, c); i++; flip = false; draw(); }
  function draw(){
    wrap.replaceChildren(h('div',{class:'row',style:'gap:6px'}, [['all','All'],['w','Words'],['x','Experiments'],['d','Data']].map(([k,l]) => h('button',{class:'chip' + (unit === k ? ' sel' : ''),style:'min-height:34px',onclick:() => { unit = k; S.cu = k; save(); build(); }}, l))));
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
function gmOI(){ const s = pick(OI); return {prompt:`“${s[0]}”`, choices:OIC, answer:s[1] === 'O' ? 0 : 1, cols:2, big:true, why:`${s[1] === 'O' ? 'Observation' : 'Inference'}. ${s[2]}`}; }
function gmCause(){
  const f = pick(IFS), iv = Math.random() < .5, ch = shuffle([f[2], f[3], f[4]]);
  return {prompt:`Tap the <span class="hl">${iv ? 'IV (cause)' : 'DV (effect)'}</span>`, fig:`<div class="card pad"><b>If</b> ${f[0]}, <b>then</b> ${f[1]}.</div>`, choices:ch, answer:ch.indexOf(iv ? f[2] : f[3]), why:`IV: ${f[2]}. DV: ${f[3]}.`};
}
function gmMMM(){
  const m = mmmSet(), w = pick(['mean','median','mode']), ans = w === 'mean' ? m.mean : w === 'median' ? m.median : m.mode;
  const pool = shuffle([m.mean, m.median, m.mode, m.mean + 1, m.median + 1, m.median - 1, m.sum, ...m.a]).filter(x => x != null && x > 0);
  const ch = [ans == null ? 'No mode' : String(ans)]; if (w === 'mode' && ans != null) ch.push('No mode');
  pool.forEach(x => { if (ch.length < 4 && !ch.includes(String(x))) ch.push(String(x)); });
  const all = shuffle(ch), wy = mmmWhy(m)[w === 'mean' ? 0 : w === 'median' ? 1 : 2];
  return {prompt:`What is the <span class="hl">${w}</span>?`, fig:numsHTML(m.a), choices:all, answer:all.indexOf(ans == null ? 'No mode' : String(ans)), cols:2, why:wy};
}
const GAMES = [
  {id:'oi', e:'👀', name:'Observe or Infer', d:'45-second rush', u:'w', skill:2, time:45, par:15, gen:gmOI, how:'Read it. Did someone notice it 👀 or explain it 💡? Go fast.'},
  {id:'match', e:'🔤', name:'Word Match', d:'Match words to meanings', u:'w', custom:matchGame},
  {id:'steps', e:'🪜', name:'Step Sorter', d:'Beat the clock', u:'x', custom:stepGame},
  {id:'cause', e:'🎯', name:'Cause & Effect', d:'Find the IV and DV', u:'x', skill:6, rounds:8, par:8, gen:gmCause, how:'IV = what you change. DV = what you measure. 8 rounds.'},
  {id:'mmm', e:'🧮', name:'Mean Machine', d:'Mean, median, mode', u:'d', skill:8, rounds:8, par:8, gen:gmMMM, how:'Mean = average. Median = middle. Mode = most. 8 rounds.'},
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

const SHORT = {Hypothesis:'A testable prediction', Quantitative:'Uses numbers or measurements', Qualitative:'Describes with words: color, shape, texture', Inference:'An explanation of what you observe', Observation:'What you notice with senses or tools', Model:'A representation of something real', Properties:'Traits that help identify materials', Science:'Knowledge from observations and experiments', 'Controlled experiment':'Only one variable changes', Conclusion:'Explains the results using evidence', Variable:'A factor that can affect results'};
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
      if (sel === w){ [lb, b].forEach(x => { x.classList.remove('sel'); x.classList.add('good'); x.disabled = true; }); sel = null; if (--left4 === 0){ r++; if (r * 4 >= rounds.length){ const s = sw.stop(); cleanup = null; bump(1, 10); timeResult(box, 'match', 'Word Match', s, exit, () => matchGame(box, exit), `${miss} miss${miss === 1 ? '' : 'es'}`); } else setTimeout(deal, 350); } }
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
    if (i === nxt){ b.remove(); nxt++; paint(); if (nxt === 6){ const s = sw.stop(); cleanup = null; bump(5, 8); timeResult(box, 'steps', 'Step Sorter', s, exit, () => stepGame(box, exit), `${miss} miss${miss === 1 ? '' : 'es'}`); } }
    else { miss++; sw.add(2); b.classList.add('bad','shake'); setTimeout(() => b.classList.remove('bad','shake'), 450); toast('+2 seconds'); }
  }}, STEPS[i][0]); pk.append(b); });
  box.replaceChildren(backBtn('Games', () => { sw.kill(); cleanup = null; exit(); }), h('div',{class:'row sp'}, h('span',{class:'hint'},'Tap the 6 steps in order. Wrong tap = +2s.'), clock), slots, pk);
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
