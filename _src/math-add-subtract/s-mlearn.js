/* ---------- MULT · DIV LEARN LABS ---------- */
const stepper = (lab, min, max, val, fn) => { const out = h('b',{style:'min-width:36px;text-align:center;font:700 20px var(--fd)'}); let v = val;
  const set = x => { v = Math.max(min, Math.min(max, x)); out.textContent = N(v); };
  const b = (t, d) => h('button',{class:'chip',style:'min-width:44px',onclick:() => { set(v + d); fn(v); }}, t);
  set(val); return {el:h('div',{class:'row sp'}, h('span',{class:'lbl'}, lab), h('div',{class:'row',style:'gap:6px;flex-wrap:nowrap'}, b('−', -1), out, b('+', 1))), set}; };
const workLines = (st, n) => st.slice(0, n).map(([t, why], i) => h('div',{class:'row sp',style:'flex-wrap:nowrap;gap:6px'}, h('span',{class:i === n - 1 && i ? 'on' : '',html:t}), h('span',{class:'hint',style:'font-family:var(--fb);text-align:right'}, why || '')));

/* 11 · groups of negatives */
L[11] = box => {
  let n = 3, k = -7, opp = false;
  const fig = h('div',{class:'stage',style:'padding:4px'}), lines = h('div',{class:'work card pad'}), oppB = h('button',{class:'chip'});
  const paint = () => {
    const tot = n * k, v = opp ? -tot : tot, arr = [];
    for (let i = 0; i < n; i++) arr.push({a:i * k, b:(i + 1) * k, c:opp ? GRAYC : (k < 0 ? NEGC : POSC)});
    if (opp) arr.push({a:tot, b:-tot, c:'var(--w)', t:'opposite'});
    fig.innerHTML = nline(autoLine([0, tot, -tot], {arr}));
    const rep = repAdd(n, k), ex = opp ? `−${n}(${N(k)})` : `${n}(${N(k)})`;
    lines.replaceChildren(...[[ex, opp ? `the opposite of ${n} groups of ${N(k)}` : `${n} groups of ${N(k)}`], [opp ? `= −(${rep})` : `= ${rep}`, 'repeated addition'], [`= <span class="hl">${N(v)}</span>`, '']].map(([t, w]) => h('div',{class:'row sp',style:'flex-wrap:nowrap'}, h('span',{html:t}), h('span',{class:'hint',style:'font-family:var(--fb);text-align:right'}, w))));
    oppB.textContent = opp ? '✓ Negative number of groups' : 'Make the groups negative'; oppB.classList.toggle('sel', opp);
  };
  const sn = stepper('Groups', 1, 5, n, v => { n = v; paint(); }), sk = slider('Each group is', -10, 10, 1, k, v => { k = v || 1; paint(); });
  oppB.addEventListener('click', () => { opp = !opp; paint(); });
  box.append(rule('n(−k) means n groups of −k. A negative first number means “the opposite of”.'), fig, lines, sn.el, ...sk.el, oppB,
    h('div',{class:'lbl'},'From your lessons'), chips([['Lily: 3(−10)',[3,-10,false]],['0 − 7 − 7 − 7',[3,-7,false]],['−3(6)',[3,6,true]],['2(−4)',[2,-4,false]]], ([a,b,o]) => { n = a; k = b; opp = o; sn.set(a); sk.set(b); paint(); }));
  paint();
};

/* 12 · patterns and the zero product property */
L[12] = box => {
  let k = -3, shown = 4;
  const rowsBox = h('div',{class:'col',style:'gap:4px'}), msg = h('div',{class:'big-out',style:'font-size:17px;min-height:44px'}), go = h('button',{class:'btn hlb'});
  const paint = () => {
    const ms = [3,2,1,0,-1,-2,-3], big = Math.abs(3 * k);
    rowsBox.replaceChildren(...ms.slice(0, shown).map((m, i) => { const v = m * k, w = Math.abs(v) / big * 46;
      return h('div',{style:'display:grid;grid-template-columns:72px 44px 1fr;align-items:center;gap:8px;font-weight:700'}, h('span',{}, `${N(m)}(${N(k)})`), h('span',{class:v > 0 ? 'pos' : v < 0 ? 'neg' : ''}, N(v)),
        h('div',{style:'position:relative;height:16px;background:var(--line);border-radius:8px'}, h('i',{style:`position:absolute;top:0;bottom:0;${v < 0 ? `right:50%;width:${w}%` : `left:50%;width:${w}%`};background:var(--${v < 0 ? 'neg' : 'pos'});border-radius:8px${i === shown - 1 && i > 3 ? ';outline:3px solid var(--hl)' : ''}`}), h('i',{style:'position:absolute;left:50%;top:-3px;bottom:-3px;width:2px;background:var(--ink)'}))); }));
    msg.innerHTML = shown <= 4 ? `Each row adds <b>${N(-k)}</b>. What comes after 0?` : shown === 5 ? `So −1(${N(k)}) = <span class="hl">${N(-k)}</span>. Negative × negative is positive!` : `The pattern keeps going up by ${N(-k)}.`;
    go.textContent = shown < 7 ? 'Next row' : 'Start over';
  };
  go.addEventListener('click', () => { shown = shown < 7 ? shown + 1 : 4; if (shown === 5){ xp(2); bump(12, 4); } paint(); });
  box.append(rule('Multiplying by one less takes away one group. Below 0, that makes the answer go UP.'), seg([['-3','k = −3'],['-10','k = −10'],['-4','k = −4']], '-3', v => { k = +v; shown = 4; paint(); }), rowsBox, msg, go,
    h('div',{class:'card pad col',style:'gap:4px'}, h('b',{},'Zero product property'), h('div',{html:'If a product is 0, at least one factor is <b>0</b>. Example: <span class="hl">−8 × □ = 0</span> → □ = 0.'})));
  paint();
};

/* 13 · the sign machine */
L[13] = box => {
  let a = 4, b = -6;
  const tiles = h('div',{class:'kcc'}), tbl2 = h('div',{class:'grid2'}), why = h('div',{class:'card pad',hidden:true,html:'🏊 A pool drains <b>3 cm every hour</b> (−3). What was the level <b>2 hours ago</b> (−2)? It was higher: <span class="hl">(−2)(−3) = +6</span>. Going back in time undoes the draining.'});
  const paint = () => {
    const t = (v, i) => h('button',{class:'chip',style:`min-width:60px;min-height:58px;padding:0 8px;font:800 24px var(--fd);border-color:var(--${v < 0 ? 'neg' : 'pos'});color:var(--${v < 0 ? 'neg' : 'pos'})`,onclick:() => { if (i) b = -b; else a = -a; paint(); },'aria-label':'Flip the sign of ' + N(v)}, N(v));
    const v = a * b;
    tiles.replaceChildren(t(a, 0), h('span',{style:'border:0;background:none;min-width:12px'},'×'), t(b, 1), h('span',{style:'border:0;background:none;min-width:12px'},'='), h('span',{class:'c',style:`color:var(--${v < 0 ? 'neg' : 'pos'})`}, N(v)));
    const key = (a < 0 ? '−' : '+') + (b < 0 ? '−' : '+');
    tbl2.replaceChildren(...[['++','(+)(+) = +'],['+−','(+)(−) = −'],['−+','(−)(+) = −'],['−−','(−)(−) = +']].map(([kk, t]) => h('div',{class:'tile' + (kk === key ? ' sel' : ''),style:'min-height:44px'}, t)));
  };
  const sa = slider('Size of the first number', 1, 12, 1, 4, v => { a = Math.sign(a) * v; paint(); }), sb = slider('Size of the second number', 1, 12, 1, 6, v => { b = Math.sign(b) * v; paint(); });
  box.append(rule('Same signs → positive. Different signs → negative.'), h('div',{class:'hint c'},'Tap a number to flip its sign.'), h('div',{class:'stage',style:'padding:12px 6px'}, tiles), tbl2, ...sa.el, ...sb.el,
    h('button',{class:'btn ghost',onclick:() => { why.hidden = !why.hidden; if (!why.hidden){ xp(2); bump(13, 3); } }},'Why is − × − positive?'), why);
  paint();
};

/* 14 · count the negatives */
L[14] = box => {
  let xs = [-4, -2, 3, 5, -1], opp = true;
  const chipsBox = h('div',{class:'kcc'}), info = h('div',{class:'work card pad'}), oppB = h('button',{class:'chip'});
  const paint = () => {
    chipsBox.replaceChildren(...xs.map((v, i) => h('button',{class:'chip',style:`min-width:52px;min-height:52px;font:800 22px var(--fd);border-color:var(--${v < 0 ? 'neg' : 'line'});color:var(--${v < 0 ? 'neg' : 'ink'})`,onclick:() => { xs[i] = -xs[i]; paint(); },'aria-label':'Flip ' + N(v)}, N(v))));
    const k = xs.filter(v => v < 0).length, p = xs.reduce((s, v) => s * v, 1), v = opp ? -p : p;
    const ex = (opp ? '−(' : '') + N(xs[0]) + xs.slice(1).map(x => `(${N(x)})`).join('') + (opp ? ')' : '');
    info.replaceChildren(...[[`<span class="exs">${ex}</span>`, ''], [`${k} negative${k === 1 ? '' : 's'} → <b>${eo(k)}</b>`, 'count'], [`inside is <b class="${p < 0 ? 'neg' : 'pos'}">${p < 0 ? 'negative' : 'positive'}</b>`, 'sign rule'], ...(opp ? [[`−( ) flips it → <b class="${v < 0 ? 'neg' : 'pos'}">${v < 0 ? 'negative' : 'positive'}</b>`, 'opposite']] : []), [`= <span class="hl">${N(v)}</span>`, '']].map(([t, w]) => h('div',{class:'row sp',style:'flex-wrap:nowrap'}, h('span',{html:t}), h('span',{class:'hint',style:'font-family:var(--fb)'}, w))));
    oppB.textContent = opp ? '✓ −( ) in front' : 'Add −( ) in front'; oppB.classList.toggle('sel', opp);
  };
  oppB.addEventListener('click', () => { opp = !opp; paint(); });
  box.append(rule('Even number of negatives → positive. Odd → negative.'), h('div',{class:'hint c'},'Tap a factor to flip its sign.'), h('div',{class:'stage',style:'padding:12px 6px'}, chipsBox), info, oppB,
    h('div',{class:'lbl'},'From your lessons'), chips([['Dylan’s problem',[[-4,-2,3,5,-1],true]],['1(−1)(−1)(−1)(−1)(−1)',[[1,-1,-1,-1,-1,-1],false]],['(−4)(−4)(−4)',[[-4,-4,-4],false]]], ([a, o]) => { xs = a.slice(); opp = o; xp(1); bump(14, 2); paint(); }));
  paint();
};

/* 15 · multiply stories */
L[15] = box => {
  let st = 'temp', n = 3, k = 2;
  const S15 = {temp:['🌡️','The temperature drops <b>{K}°</b> each hour for <b>{N}</b> hours.', -1, 'degrees'], dive:['🤿','A diver goes down <b>{K} ft</b>, <b>{N}</b> times.', -1, 'ft'], cash:['💵','Maya spends <b>${K}</b> on lunch, <b>{N}</b> days in a row.', -1, 'dollars'], back:['⏪','A pond drops <b>{K} cm</b> each hour. How did it compare <b>{N}</b> hours ago?', 1, 'cm']};
  const story = h('div',{class:'card pad'}), fig = h('div',{class:'stage',style:'padding:4px'}), eq = out('', 20);
  const paint = () => {
    const [e, t, sign] = S15[st], v = sign < 0 ? -n * k : n * k;
    story.innerHTML = e + ' ' + t.split('{K}').join(k).split('{N}').join(n);
    const arr = []; for (let i = 0; i < n; i++) arr.push({a:i * (v / n), b:(i + 1) * (v / n), c:v < 0 ? NEGC : POSC});
    fig.innerHTML = nline(autoLine([0, v], {arr}));
    eq.innerHTML = sign < 0 ? `${n}(−${k}) = <span class="hl">${N(v)}</span> ${S15[st][3]}` : `(−${n})(−${k}) = <span class="hl">+${v}</span>: ${v} ${S15[st][3]} higher`;
  };
  const sn = slider('How many times (N)', 1, 8, 1, n, v => { n = v; paint(); }), sk = slider('Each time (K)', 1, 12, 1, k, v => { k = v; paint(); });
  box.append(rule('Each repeat is one group. Going back in time is negative, too.'), seg([['temp','🌡️ Cold'],['dive','🤿 Dive'],['cash','💵 Money'],['back','⏪ Rewind']], 'temp', v => { st = v; paint(); if (v === 'back'){ xp(2); bump(15, 3); } }), story, fig, eq, ...sn.el, ...sk.el);
  paint();
};

/* 16 · multiply fractions and decimals, one step at a time */
const MSTEPS = {
  e1:[[MXs([mk(Q(-3,4),'f'), mk(Q(1,6),'f')],'dot'),'the problem'],['One negative → answer is negative','sign first'],['3 × 1 = 3 and 4 × 6 = 24','tops, bottoms'],[`= −${fr(3,24)} = <b>−${fr(1,8)}</b>`,'simplify']],
  e2:[[MXs([D(-4,10), D(-31,10)]),'the problem'],['Two negatives → positive','sign first'],['= −0.4(−3 + (−0.1))','break apart'],['= −0.4(−3) + (−0.4)(−0.1)','distribute'],['= 1.2 + 0.04','multiply'],['= <b>1.24</b>','add']],
  e3:[[MXs([mk(Q(2,5),'f'), Fm(-4,1,8)]),'the problem'],['One negative → negative','sign first'],[`= ${fr(2,5)}(−4 + (−${fr(1,8)}))`,'break apart'],[`= ${fr(2,5)}(−4) + ${fr(2,5)}(−${fr(1,8)})`,'distribute'],[`= −${fr(8,5)} + (−${fr(2,40)})`,'multiply'],[`= −${fr(32,20)} + (−${fr(1,20)})`,'common denominator'],[`= −${fr(33,20)} = <b>−1${fr(13,20)}</b>`,'add']],
  r1:[[MXs([D(-43,100), I(6)],'pp'),'the problem'],['One negative → negative','sign first'],['= (−0.4 + (−0.03))(6)','break apart'],['= (−0.4)(6) + (−0.03)(6)','distribute'],['= −2.4 + (−0.18)','multiply'],['= <b>−2.58</b>','add']],
  r2:[[MXs([Fm(-5,1,4), I(-20)],'pp'),'the problem'],['Two negatives → positive','sign first'],[`= (−5 + (−${fr(1,4)}))(−20)`,'break apart'],[`= (−5)(−20) + (−${fr(1,4)})(−20)`,'distribute'],['= 100 + 5','multiply'],['= <b>105</b>','add']],
  l12:[[MXs([Fm(1,1,2), Fm(-3,1,4)]),'the problem'],['One negative → negative','sign first'],[`= 1${fr(1,2)}(−3 + (−${fr(1,4)}))`,'break apart'],[`= 1${fr(1,2)}(−3) + 1${fr(1,2)}(−${fr(1,4)})`,'distribute'],[`= −4${fr(1,2)} + (−${fr(3,8)})`,'multiply'],[`= <b>−4${fr(7,8)}</b>`,'add']]
};
const randSteps = () => { const q = gRat(), m = q.prompt.match(/<span class="ex">(.*?)<\/span> = \?$/); return [[`<span class="exs">${m ? m[1] : ''}</span>`,'the problem'],[q.why.split(' Sizes:')[0].replace(/→ the product is/,'→'),'sign first'],['Sizes: ' + q.why.split(' Sizes: ')[1].split('. Answer')[0],'multiply'],[`= <b>${q.blanks[0].show}</b>`,'answer']]; };
L[16] = box => {
  let st, n;
  const lines = h('div',{class:'work card pad',style:'min-height:150px'}), go = h('button',{class:'btn hlb'});
  const paint = () => { lines.replaceChildren(...workLines(st, n)); go.textContent = n < st.length ? 'Next step' : 'New one'; go.className = 'btn ' + (n < st.length ? 'hlb' : 'ghost'); };
  const set = s => { st = s; n = 1; paint(); };
  go.addEventListener('click', () => { if (n < st.length){ n++; if (n === st.length){ xp(2); bump(16, 4); } paint(); } else set(randSteps()); });
  box.append(rule('Find the sign first. Then break a mixed number or decimal apart and distribute.'), lines, go,
    h('div',{class:'lbl'},'From Lesson 15'), chips([['Exit #1',MSTEPS.e1],['Exit #2',MSTEPS.e2],['Exit #3',MSTEPS.e3],['Recap #1',MSTEPS.r1],['Recap #2',MSTEPS.r2],['Lesson #12',MSTEPS.l12]], set));
  set(MSTEPS.e3);
};

/* 17 · dividing: the fact family */
L[17] = box => {
  let a = -6, b = 4;
  const fig = h('div',{class:'stage',style:'padding:6px'}), facts = h('div',{class:'work card pad'});
  const paint = () => {
    const p = a * b, c = v => `var(--${v < 0 ? 'neg' : 'pos'})`;
    fig.innerHTML = `<svg class="fx" viewBox="0 0 260 130" role="img" aria-label="Fact triangle"><path d="M130 14L232 116H28z" fill="var(--surf)" stroke="var(--ink)" stroke-width="2" stroke-linejoin="round"/><line x1="70" x2="190" y1="76" y2="76" stroke="var(--mut)"/><text x="130" y="64" font-size="22" font-weight="800" text-anchor="middle" fill="${c(p)}">${N(p)}</text><text x="88" y="104" font-size="20" font-weight="800" text-anchor="middle" fill="${c(a)}">${N(a)}</text><text x="130" y="104" font-size="18" text-anchor="middle" fill="var(--mut)">×</text><text x="172" y="104" font-size="20" font-weight="800" text-anchor="middle" fill="${c(b)}">${N(b)}</text></svg>`;
    const P = v => v < 0 ? `(${N(v)})` : N(v);
    facts.replaceChildren(...[`${P(a)} × ${P(b)} = ${N(p)}`, `${P(b)} × ${P(a)} = ${N(p)}`, `${N(p)} ÷ ${P(b)} = <span class="hl">${N(a)}</span>`, `${N(p)} ÷ ${P(a)} = <span class="hl">${N(b)}</span>`].map(t => h('div',{html:t})));
  };
  const flip = (lab, fn) => h('button',{class:'chip',onclick:() => { fn(); paint(); }}, lab);
  const sa = slider('First factor', -9, 9, 1, a, v => { a = v || 1; paint(); }), sb = slider('Second factor', -9, 9, 1, b, v => { b = v || 1; paint(); });
  box.append(rule('Dividing uses the same sign rules as multiplying.'), fig, facts, ...sa.el, ...sb.el, h('div',{class:'row'}, flip('Flip first sign', () => { a = -a; sa.set(a); }), flip('Flip second sign', () => { b = -b; sb.set(b); })),
    h('div',{class:'card pad col',style:'gap:4px'}, h('b',{},'Zero rules'), h('div',{html:'0 ÷ (−5) = <b>0</b>, because −5 × 0 = 0.'}), h('div',{html:'−5 ÷ 0 is <b>undefined</b>. No number times 0 makes −5.'})));
  paint();
};

/* 18 · divide stories: split a total into equal parts */
L[18] = box => {
  let st = 'temp', n = 6, per = 3, shown = false;
  const S18 = {temp:['🌡️','The temperature fell <b>{T} degrees</b> over <b>{N} hours</b>, steadily.','degrees per hour',1], sub:['🚢','A submarine dove from the surface to <b>{T} m</b> below sea level in <b>{N} minutes</b>.','m per minute',10], debt:['💵','<b>{N} friends</b> share a debt of <b>${T}</b> equally.','dollars each',1]};
  const story = h('div',{class:'card pad'}), fig = h('div',{class:'stage',style:'padding:6px'}), eq = out('', 20), reveal = h('button',{class:'btn hlb'});
  const paint = () => {
    const [e, t, unit, m] = S18[st], P = per * m, T = n * P;
    story.innerHTML = e + ' ' + t.split('{T}').join(T).split('{N}').join(n);
    const w = 300 / n; let s = `<rect width="320" height="70" rx="10" fill="var(--surf)"/>`;
    for (let i = 0; i < n; i++) s += `<rect x="${10 + i * w + 2}" y="18" width="${w - 4}" height="30" rx="6" fill="var(--negt)" stroke="var(--neg)" stroke-width="2"/>` + (shown ? `<text x="${10 + i * w + w / 2}" y="38" font-size="${n > 7 ? 10 : 12}" font-weight="800" text-anchor="middle" fill="var(--neg)">${N(-P)}</text>` : '');
    s += `<text x="160" y="64" font-size="11" text-anchor="middle" fill="var(--mut)">total ${N(-T)} split into ${n} equal parts</text>`;
    fig.innerHTML = `<svg class="fx" viewBox="0 0 320 70" role="img" aria-label="${N(-T)} split into ${n} parts">${s}</svg>`;
    eq.innerHTML = shown ? `${N(-T)} ÷ ${n} = <span class="hl">${N(-P)}</span> ${unit}` : `${N(-T)} ÷ ${n} = ?`;
    reveal.textContent = shown ? 'New numbers' : 'Show the answer';
  };
  reveal.addEventListener('click', () => { if (!shown){ shown = true; xp(2); bump(18, 3); } else { n = rnd(2, 9); per = rnd(2, 12); shown = false; } paint(); });
  const sg = seg([['temp','🌡️ Cold'],['sub','🚢 Sub'],['debt','💵 Debt']], 'temp', v => { st = v; shown = false; paint(); });
  box.append(rule('Total change ÷ number of equal parts = change for each part.'), sg, story, fig, eq, reveal,
    chips([['Bonus #5: 18° in 6 hours',['temp',6,3]],['Bonus #7: 240 m in 8 min',['sub',8,3]],['Bonus #8: $36, 4 friends',['debt',4,9]]], ([s2, a, b]) => { st = s2; n = a; per = b; shown = false; sg.querySelectorAll('button').forEach((x,i) => x.classList.toggle('on', ['temp','sub','debt'][i] === s2)); paint(); }));
  paint();
};
