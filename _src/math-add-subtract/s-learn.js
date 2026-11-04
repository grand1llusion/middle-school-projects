/* ---------- LEARN LABS ---------- */
const L = {};
const out = (t, sz) => h('div',{class:'big-out',style:'font-size:' + (sz || 19) + 'px',html:t || ''});
const rule = t => h('div',{class:'rule',html:t});
const chips = (list, fn) => h('div',{class:'row',style:'gap:6px'}, list.map(([lab, v]) => h('button',{class:'chip',style:'min-height:34px;font-size:14px',html:lab,onclick:() => fn(v)})));
const slider = (lab, min, max, step, val, fn) => { const out = h('b',{}), i = h('input',{type:'range',min,max,step,value:val,'aria-label':lab}); const set = v => { i.value = v; out.textContent = N(+v); }; i.addEventListener('input', () => { out.textContent = N(+i.value); fn(+i.value); }); set(val); return {el:[h('div',{class:'row sp'}, h('span',{class:'lbl'}, lab), out), i], set}; };
const pn = v => v < 0 ? `(${N(v)})` : N(v);

/* 1 · hop on the number line */
L[1] = box => {
  let a = 2.5, b = -6.5, op = '+';
  const fig = h('div',{class:'stage',style:'padding:4px'}), eq = out('', 24), note = h('div',{class:'c',style:'font-weight:700'});
  const paint = () => {
    const e = op === '+' ? a + b : a - b, mv = e - a;
    fig.innerHTML = nline({min:-16, max:16, tick:1, lab:4, arr:[{a:0, b:a, c:GRAYC, t:'start ' + N(a)}, {a, b:e, c:mv >= 0 ? POSC : NEGC, t:(mv >= 0 ? 'right ' : 'left ') + N(Math.abs(mv))}], pts:[{x:e, c:'var(--ink)'}]});
    eq.innerHTML = `${N(a)} ${op} ${pn(b)} = <span class="hl">${N(e)}</span>`;
    note.innerHTML = !mv ? 'No hop at all.' : `${op === '+' ? 'Adding' : 'Subtracting'} a ${b < 0 ? 'negative' : 'positive'} → hop <span class="${mv > 0 ? 'pos' : 'neg'}">${mv > 0 ? 'right ➡️' : 'left ⬅️'}</span>`;
  };
  const sa = slider('Start', -8, 8, .5, a, v => { a = v; paint(); }), sb = slider('Number', -8, 8, .5, b, v => { b = v; paint(); });
  const sg = seg([['+','Add +'],['−','Subtract −']], '+', k => { op = k; paint(); });
  const set = ([x, o, y]) => { a = x; b = y; op = o; sa.set(x); sb.set(y); sg.querySelectorAll('button').forEach((bt,i) => bt.classList.toggle('on', (i === 0) === (o === '+'))); paint(); };
  box.append(rule('Add a positive ➡️ hop right. Add a negative ⬅️ hop left.'), fig, eq, note, sg, ...sa.el, ...sb.el,
    h('div',{class:'lbl'},'From your worksheets'), chips([['2.5 + (−6.5)',[2.5,'+',-6.5]],['8 − 3',[8,'−',3]],['8 + (−3)',[8,'+',-3]],['−4 − (−6)',[-4,'−',-6]]], set),
    h('div',{class:'hint c'},'Subtracting a negative hops right. Try −4 − (−6).'));
  paint();
};

/* 2 · distance between two points */
L[2] = box => {
  let A = -2.25, B = 1.5;
  const fig = h('div',{class:'stage',style:'padding:4px'}), eq = out('', 21), note = h('div',{class:'hint c',style:'color:var(--ink)'});
  const paint = () => {
    const lo = Math.min(A, B), hi = Math.max(A, B), d = hi - lo;
    fig.innerHTML = nline({min:-3, max:3, tick:.25, lab:.5, fs:9.5, arr:d ? [{a:lo, b:hi, c:'var(--w)', t:N(d) + ' units'}] : [], pts:[{x:A, t:'A', c:POSC},{x:B, t:'B', c:NEGC}]});
    eq.innerHTML = d ? `${N(hi)} − ${pn(lo)} = <span class="hl">${N(d)}</span>` : 'Same spot: distance 0';
    note.innerHTML = lo < 0 && hi > 0 ? `Opposite sides of 0? Add the distances from 0: ${N(-lo)} + ${N(hi)} = ${N(d)}.` : d ? 'Same side of 0? Subtract the distances from 0.' : '';
  };
  const sa = slider('Point A', -3, 3, .25, A, v => { A = v; paint(); }), sb = slider('Point B', -3, 3, .25, B, v => { B = v; paint(); });
  box.append(rule('Distance = bigger − smaller. It is never negative.'), fig, eq, note, ...sa.el, ...sb.el,
    chips([['Quiz #3: A = −2.25, B = 1.5',[-2.25, 1.5]],['Both negative',[-2.5,-0.75]]], ([x,y]) => { A = x; B = y; sa.set(x); sb.set(y); paint(); }));
  paint();
};

/* 3 · same signs: team up */
L[3] = box => {
  let a, b, step;
  const fig = h('div',{class:'stage',style:'padding:4px'}), eqn = h('div',{class:'c'}), lines = h('div',{class:'work'}), go = h('button',{class:'btn hlb'});
  const S3 = () => { const k = kindOf(a,b), A = size(a), B = size(b), e = plus(a,b), f = x => fmt(x);
    return [`Both are <b class="${isNeg(a) ? 'neg' : 'pos'}">${isNeg(a) ? 'negative' : 'positive'}</b>. Same signs! 🤝`, `Add the sizes: ${f(A)} + ${f(B)} = ${f(mk(qadd(A.q, B.q), k))}`, `Keep the sign: <span class="hl">${fmt(e)}</span>`]; };
  const paint = () => {
    const av = qv(a.q), ev = qv(plus(a,b).q);
    fig.innerHTML = nline(autoLine([av, ev], {arr:[{a:0, b:av, c:hopColor(a)}, {a:av, b:ev, c:hopColor(b)}]}));
    eqn.innerHTML = EX([a,b],['+']); const st = S3();
    lines.replaceChildren(...st.slice(0, step).map((t,i) => h('div',{class:i === step - 1 ? 'on' : '',html:t})));
    go.textContent = step < 3 ? 'Next step' : 'New one'; go.className = 'btn ' + (step < 3 ? 'hlb' : 'ghost');
  };
  const set = ([x, y]) => { a = x; b = y; step = 0; paint(); };
  go.addEventListener('click', () => { if (step < 3){ step++; if (step === 3){ xp(2); bump(3, 3); } paint(); } else { const s = Math.random() < .75 ? -1 : 1; set(pair(K3(), s, s)); } });
  box.append(rule('Same signs: add the sizes, keep the sign.'), fig, eqn, lines, go,
    h('div',{class:'lbl'},'From Lesson 6'), chips([['−3.45 + (−1.52)',[D(-345,100), D(-152,100)]],['−6.85 + (−10.9)',[D(-685,100), D(-109,10)]],[`−6${fr(1,2)} + (−1${fr(1,3)})`,[Fm(-6,1,2), Fm(-1,1,3)]]], set),
    h('div',{class:'hint c'},'Adding two negatives never makes a positive. It goes further left.'));
  set([D(-345,100), D(-152,100)]);
};

/* 4 · opposite signs: tug of war */
L[4] = box => {
  let a, b, step = 0;
  const fig = h('div',{class:'stage'}), eqn = h('div',{class:'c'}), lines = h('div',{class:'work'}), go = h('button',{class:'btn hlb'});
  const draw = () => {
    const p = isNeg(a) ? b : a, n = isNeg(a) ? a : b, P = qv(p.q), Nn = -qv(n.q), mx = Math.max(P, Nn, 1), diff = P - Nn;
    const wN = 18 + Nn / mx * 92, wP = 18 + P / mx * 92, knot = 160 + Math.max(-110, Math.min(110, diff / mx * 90));
    const winL = Nn > P, winR = P > Nn;
    fig.innerHTML = `<svg class="fx" viewBox="0 0 320 120" role="img" aria-label="Tug of war between ${fmtTxt(n)} and ${fmtTxt(p)}"><rect width="320" height="120" fill="var(--at)"/>
      <line x1="160" x2="160" y1="18" y2="104" stroke="var(--mut)" stroke-dasharray="4 4"/><text x="160" y="114" font-size="10" text-anchor="middle" fill="var(--mut)">0</text>
      <line x1="${10 + wN}" x2="${310 - wP}" y1="66" y2="66" stroke="#8B6B3E" stroke-width="5" stroke-linecap="round"/>
      <rect x="${knot - 6}" y="58" width="12" height="16" rx="3" fill="var(--hl)" stroke="var(--hlk)"/>
      <rect x="10" y="44" width="${wN}" height="44" rx="10" fill="var(--neg)"/><text x="${10 + wN / 2}" y="71" font-size="14" font-weight="800" text-anchor="middle" fill="var(--on)">${fmtTxt(n)}</text>
      <rect x="${310 - wP}" y="44" width="${wP}" height="44" rx="10" fill="var(--pos)"/><text x="${310 - wP / 2}" y="71" font-size="14" font-weight="800" text-anchor="middle" fill="var(--on)">+${fmtTxt(p)}</text>
      ${winL ? `<text x="${10 + wN / 2}" y="34" font-size="20" text-anchor="middle">🏆</text>` : ''}${winR ? `<text x="${310 - wP / 2}" y="34" font-size="20" text-anchor="middle">🏆</text>` : ''}</svg>`;
  };
  const S4 = () => { const k = kindOf(a,b), A = size(a), B = size(b), big = qcmp(A.q, B.q) > 0 ? a : b, hi = size(big), lo = big === a ? B : A, e = plus(a,b);
    return ['One is positive, one is negative. Opposite signs! 🪢', `Subtract the sizes: ${fmt(hi)} − ${fmt(lo)} = ${fmt(mk(qsub(hi.q, lo.q), k))}`, `${fmt(big)} pulls harder, so the answer is <span class="hl">${fmt(e)}</span>`]; };
  const paint = () => { draw(); eqn.innerHTML = EX([a,b],['+']); const st = S4(); lines.replaceChildren(...st.slice(0, step).map((t,i) => h('div',{class:i === step - 1 ? 'on' : '',html:t}))); go.textContent = step < 3 ? 'Next step' : 'New one'; go.className = 'btn ' + (step < 3 ? 'hlb' : 'ghost'); };
  const set = ([x, y]) => { a = x; b = y; step = 0; paint(); };
  go.addEventListener('click', () => { if (step < 3){ step++; if (step === 3){ xp(2); bump(4, 3); } paint(); } else { const s = sgn(); set(pair(K3(), s, -s)); } });
  box.append(rule('Opposite signs: subtract the sizes. The bigger size wins the sign.'), fig, eqn, lines, go,
    h('div',{class:'lbl'},'From your worksheets'), chips([['Shawn: 10.9 + (−6.85)',[D(109,10), D(-685,100)]],[`−13${fr(1,4)} + 8${fr(5,8)}`,[Fm(-13,1,4), Fm(8,5,8)]],['7.63 + (−10.42)',[D(763,100), D(-1042,100)]],[`−8${fr(2,5)} + 8${fr(2,3)}`,[Fm(-8,2,5), Fm(8,2,3)]]], set));
  set([D(109,10), D(-685,100)]);
};

/* 5 · estimate first */
L[5] = box => {
  const area = h('div',{class:'col'});
  const deal = () => {
    const q = gEst(), msg = h('div',{class:'fb',hidden:true}), list = h('div',{class:'opts g2'});
    q.choices.forEach((c,k) => { const b = h('button',{class:'opt',html:c,onclick:() => {
      list.querySelectorAll('.opt').forEach(x => x.disabled = true); b.classList.add(k === q.answer ? 'good' : 'bad'); list.children[q.answer].classList.add('good');
      msg.className = 'fb ' + (k === q.answer ? 'good' : 'bad'); msg.innerHTML = (k === q.answer ? '✓ ' : '✗ ') + q.why; msg.hidden = false; if (k === q.answer){ xp(2); bump(5, 4); }
    }}); list.append(b); });
    area.replaceChildren(h('div',{class:'pq',html:q.prompt}), list, msg, h('button',{class:'btn ghost',onclick:deal},'New problem'));
  };
  box.append(rule('Round each number to a whole number first. Your real answer should land close.'),
    h('div',{class:'card pad work',style:'font-size:15px'}, h('div',{html:`6${fr(1,4)} + (−3${fr(1,2)})`}), h('div',{html:'≈ 6 + (−4) = <b>about 2</b>'}), h('div',{class:'hint',html:`Exact: 2${fr(3,4)}. Close! ✓`})), area);
  deal();
};

/* 6 · keep · change · change */
L[6] = box => {
  let a, b, step;
  const tiles = h('div',{class:'kcc'}), go = h('button',{class:'btn hlb'}), msg = out('', 18);
  const paint = () => {
    const t1 = h('span',{class:step >= 1 ? 'k' : '',html:fmt(a)}), t2 = h('span',{class:step >= 2 ? 'c' : ''}, step >= 2 ? '+' : '−'), t3 = h('span',{class:step >= 3 ? 'c' : '',html:step >= 3 ? fmt(neg(b)) : fmt(b)});
    if (step) [t1, t2, t3][Math.min(step, 3) - 1].classList.add('pop');
    tiles.replaceChildren(t1, t2, t3);
    msg.innerHTML = ['Subtracting is tricky. Let’s turn it into adding.', '<b>Keep</b> the first number.', '<b>Change</b> − to +.', `<b>Change</b> ${fmt(b)} to its opposite, ${fmt(neg(b))}.`, `${fmt(a)} + ${par(neg(b))} = <span class="hl">${fmt(minus(a,b))}</span>`][step];
    go.textContent = ['Keep','Change','Change','Solve it','New one'][step]; go.className = 'btn ' + (step < 4 ? 'hlb' : 'ghost');
  };
  const set = ([x, y]) => { a = x; b = y; step = 0; paint(); };
  go.addEventListener('click', () => { if (step < 4){ step++; if (step === 4){ xp(2); bump(6, 4); } paint(); } else set(pair(pick(['i','i','d']), sgn(), sgn())); });
  box.append(rule('Keep · Change · Change: subtracting = adding the opposite.'), h('div',{class:'stage',style:'padding:14px 8px'}, tiles), msg, go,
    h('div',{class:'lbl'},'From the practice quiz'), chips([['3 − 11',[I(3), I(11)]],['−5.2 − (−9)',[D(-52,10), I(-9)]],['−7 − (−12)',[I(-7), I(-12)]],[`4 − 7${fr(1,3)}`,[I(4), Fm(7,1,3)]]], set));
  set([I(3), I(11)]);
};

/* 7 · subtract fractions and decimals, one step at a time */
const renameTo = (x, L0) => { const a = qabs(x.q), w = Math.floor(a.n / a.d), r = (a.n % a.d) * (L0 / a.d); return (isNeg(x) ? '−' : '') + (r ? (w ? w : '') + fr(r, L0) : String(w)); };
function subSteps(a, b){
  const nb = neg(b), e = minus(a,b), st = [[EX([a,b],['−']).replace('class="ex"','class="exs"'), 'the problem'], [`= ${fmt(a)} + ${par(nb)}`, 'keep · change · change']];
  if (a.k === 'f' || b.k === 'f'){ const L0 = lcm(a.q.d, b.q.d); if (a.q.d !== b.q.d && L0 > 1) st.push([`= ${renameTo(a, L0)} + ${isNeg(nb) ? '(' + renameTo(nb, L0) + ')' : renameTo(nb, L0)}`, `rename to ${L0}ths`]); }
  const A = size(a), B = size(nb), k = kindOf(a,b);
  if (isNeg(a) === isNeg(nb)) st.push([`${fmt(A)} + ${fmt(B)} = ${fmt(mk(qadd(A.q,B.q),k))}`, 'same signs: add']);
  else { const hi = qcmp(A.q, B.q) > 0 ? A : B, lo = hi === A ? B : A; st.push([`${fmt(hi)} − ${fmt(lo)} = ${fmt(mk(qsub(hi.q, lo.q), k))}`, 'opposite signs: subtract']); }
  st.push([`= <b>${fmt(e)}</b>`, isNeg(e) ? 'negative wins' : 'positive wins']);
  return st;
}
const QUIZ4B = [[EX([Fm(-2,3,8), Fm(5,1,2), Fm(-9,1,4)],['−','−']).replace('class="ex"','class="exs"'),'the problem'],[`= −2${fr(3,8)} + (−5${fr(1,2)}) + 9${fr(1,4)}`,'keep · change · change'],[`= −2${fr(3,8)} + (−5${fr(4,8)}) + 9${fr(2,8)}`,'rename to 8ths'],[`= −7${fr(7,8)} + 9${fr(2,8)}`,'negatives together'],[`9${fr(2,8)} = 8${fr(10,8)} → 8${fr(10,8)} − 7${fr(7,8)} = 1${fr(3,8)}`,'borrow 1, subtract'],[`= <b>1${fr(3,8)}</b>`,'positive wins']];
L[7] = box => {
  let st, n;
  const lines = h('div',{class:'work card pad',style:'min-height:150px'}), go = h('button',{class:'btn hlb'});
  const paint = () => {
    lines.replaceChildren(...st.slice(0, n).map(([t, why], i) => h('div',{class:'row sp',style:'flex-wrap:nowrap;gap:6px'}, h('span',{class:i === n - 1 && i ? 'on' : '',html:t}), h('span',{class:'hint',style:'font-family:var(--fb);text-align:right'}, why))));
    go.textContent = n < st.length ? 'Next step' : 'New one'; go.className = 'btn ' + (n < st.length ? 'hlb' : 'ghost');
  };
  const set = s => { st = s; n = 1; paint(); };
  go.addEventListener('click', () => { if (n < st.length){ n++; if (n === st.length){ xp(2); bump(7, 4); } paint(); } else { const k = pick(['d','f']), [a, b] = pair(k, sgn(), sgn(), 9); set(subSteps(a, b)); } });
  box.append(rule('Subtracting fractions? Rename to a common denominator first.'), lines, go,
    h('div',{class:'lbl'},'From the practice quiz'), chips([[`4 − 7${fr(1,3)}`, () => subSteps(I(4), Fm(7,1,3))],['Quiz #4 part 2', () => QUIZ4B],['−5.2 − (−9)', () => subSteps(D(-52,10), I(-9))]], f => set(f())));
  set(QUIZ4B);
};

/* 8 · temperature: forward and backward */
L[8] = box => {
  let mode = 'f', t0 = -12.83, ch = -17.65, end = -7, drop = 12;
  const fig = h('div',{class:'stage',style:'display:grid;grid-template-columns:120px 1fr;align-items:center;gap:6px;padding:6px'}), eqBox = h('div',{class:'col'}), fwd = h('div',{class:'col'}), bwd = h('div',{class:'col'});
  const thermo = (from, to) => {
    const Y = t => 196 - (t + 40) / 70 * 176, c = to >= from ? 'var(--pos)' : 'var(--neg)';
    let s = '<rect width="120" height="240" fill="var(--at)"/>';
    for (let t = -40; t <= 30; t += 10) s += `<line x1="44" x2="52" y1="${Y(t)}" y2="${Y(t)}" stroke="var(--ink)" stroke-width="1.4"/><text x="40" y="${Y(t) + 4}" font-size="10" text-anchor="end" fill="var(--ink)" font-weight="${t ? 400 : 700}">${fmtTick(t)}°</text>`;
    s += `<rect x="54" y="14" width="16" height="190" rx="8" fill="var(--surf)" stroke="var(--ink)" stroke-width="2"/><circle cx="62" cy="214" r="15" fill="#E0335A" stroke="var(--ink)" stroke-width="2"/><rect x="58" y="${Y(to)}" width="8" height="${212 - Y(to)}" fill="#E0335A"/>`;
    s += `<path d="M76 ${Y(from)}h10" stroke="var(--mut)" stroke-width="2"/><text x="88" y="${Y(from) + 4}" font-size="10" fill="var(--mut)">start</text>`;
    if (Math.abs(Y(to) - Y(from)) > 8) s += `<line x1="80" x2="80" y1="${Y(from)}" y2="${Y(to) + (to > from ? 7 : -7)}" stroke="${c}" stroke-width="3"/><path d="M80 ${Y(to)}l-5 ${to > from ? 9 : -9}h10z" fill="${c}"/>`;
    s += `<text x="88" y="${Y(to) + 4}" font-size="11" font-weight="700" fill="${c}">now</text>`;
    return `<svg class="fx" viewBox="0 0 120 240" role="img" aria-label="Thermometer from ${N(from)} to ${N(to)} degrees">${s}</svg>`;
  };
  const paint = () => {
    fwd.hidden = mode !== 'f'; bwd.hidden = mode === 'f';
    if (mode === 'f'){ const e = Math.round((t0 + ch) * 100) / 100;
      fig.innerHTML = thermo(t0, e) + `<div class="col" style="gap:4px"><div class="lbl">Start</div><b>${N(t0)}°</b><div class="lbl">${ch < 0 ? 'Drop' : 'Rise'}</div><b class="${ch < 0 ? 'neg' : 'pos'}">${ch < 0 ? '' : '+'}${N(ch)}°</b><div class="lbl">Now</div><span class="hl" style="font:800 22px var(--fd)">${N(e)}°</span></div>`;
      eqBox.replaceChildren(out(`${N(t0)} + ${pn(ch)} = ${N(e)}`, 18), h('div',{class:'hint c'}, ch < 0 ? 'A drop adds a negative.' : 'A rise adds a positive.'));
    } else { const st = end + drop;
      fig.innerHTML = thermo(st, end) + `<div class="col" style="gap:4px"><div class="lbl">Dropped</div><b class="neg">−${N(drop)}°</b><div class="lbl">Now</div><b>${N(end)}°</b><div class="lbl">Start</div><span class="hl" style="font:800 22px var(--fd)">${N(st)}°</span></div>`;
      eqBox.replaceChildren(out(`start − ${N(drop)} = ${N(end)}`, 18), out(`start = ${N(end)} + ${N(drop)} = <span class="hl">${N(st)}</span>`, 18), h('div',{class:'hint c'},'Undo the drop: add it back.'));
    }
  };
  const fs = slider('Start temperature', -20, 20, 1, t0, v => { t0 = v; paint(); }), fc = slider('Change (drop is negative)', -20, 20, 1, ch, v => { ch = v; paint(); });
  const be = slider('Temperature now', -20, 10, 1, end, v => { end = v; paint(); }), bd = slider('How much it dropped', 1, 20, 1, drop, v => { drop = v; paint(); });
  const sg = seg([['f','Forward'],['b','Work backward']], 'f', k => { mode = k; paint(); });
  fwd.append(...fs.el, ...fc.el); bwd.append(...be.el, ...bd.el);
  box.append(rule('Drop = add a negative. Rise = add a positive.'), sg, fig, eqBox, fwd, bwd,
    chips([['Lesson #5: −12.83, drops 17.65',() => { mode = 'f'; t0 = -12.83; ch = -17.65; fs.set(t0); fc.set(ch); sg.children[0].click(); }],['Quiz #2: dropped 12, now −7',() => { end = -7; drop = 12; be.set(end); bd.set(drop); sg.children[1].click(); bump(8, 3); }]], f => f()));
  paint();
};

/* the Learn tab */
function practiceSet(id, n){
  const out = [], seen = new Set();
  for (let t = 0; t < 60 && out.length < n; t++){ const q = GENS[id](), key = JSON.stringify([q.prompt, q.ctx, q.fig, q.choices && q.choices.slice().sort(), q.rows && q.rows.map(r => r.opts.slice().sort()), q.blanks && q.blanks.map(b => b.answer), q.type]); if (!seen.has(key)){ seen.add(key); out.push(q); } }
  return out;
}
VIEWS.learn = v => {
  let open = null; const heads = {};
  v.append(h('div',{class:'card pad row sp',style:'flex-wrap:nowrap'}, h('div',{}, h('b',{style:'font:600 17px var(--fd)'}, LAB.learn.title), h('div',{class:'hint'}, LAB.learn.sub)), h('span',{style:'font-size:30px'}, LAB.learn.emoji)));
  Object.entries(UNITS).forEach(([u,name]) => {
    v.append(h('div',{class:'unit u-' + u}, h('h2',{}, name)));
    SKILLS.filter(t => t.u === u).forEach(t => {
      const m = mast(t.id), dot = h('i',{class:'dot ' + (m >= 80 ? 'm' : m >= 30 ? 'h' : '')}), body = h('div',{class:'body',hidden:true});
      const head = h('button',{'aria-expanded':'false'}, h('span',{class:'ico'}, t.e), t.n, dot), card = h('div',{class:'card tp u-' + t.u}, head, body); heads[t.id] = head;
      const lesson = () => {
        if (cleanup){ cleanup(); cleanup = null; }
        body.replaceChildren(); L[t.id](body);
        body.append(h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:() => practice()},'Practice 5'), h('button',{class:'btn ghost',onclick:() => { bump(t.id, 15); dot.className = 'dot ' + (mast(t.id) >= 80 ? 'm' : 'h'); xp(5); toast('Nice! +15 mastery'); }},'I know this')));
      };
      const practice = () => {
        const box = h('div',{class:'col'});
        body.replaceChildren(backBtn('Back to lesson', lesson), box);
        const run = () => runSet(box, practiceSet(t.id, 5), {mode:'drill', actions:() => [h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:run},'5 more'), h('button',{class:'btn ghost',onclick:lesson},'Back to lesson'))]});
        run(); card.scrollIntoView({block:'start'});
      };
      head.addEventListener('click', () => {
        const was = !body.hidden;
        if (open){ open.b.hidden = true; open.b.replaceChildren(); open.h.setAttribute('aria-expanded','false'); open = null; if (cleanup){ cleanup(); cleanup = null; } }
        if (!was){ lesson(); body.hidden = false; head.setAttribute('aria-expanded','true'); open = {b:body, h:head}; setTimeout(() => card.scrollIntoView({behavior:'smooth',block:'start'}), 50); }
      });
      v.append(card);
    });
  });
  if (S.focus){ const f = heads[S.focus]; S.focus = null; if (f) setTimeout(() => f.click(), 0); }
};
