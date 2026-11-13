/* ---------- LEARN LABS ---------- */
const L = {};
const out = (t, sz) => h('div',{class:'big-out',style:'font-size:' + (sz || 19) + 'px',html:t || ''});
const rule = t => h('div',{class:'rule',html:t});
const chips = (list, fn) => h('div',{class:'row',style:'gap:6px'}, list.map(([lab, v]) => h('button',{class:'chip',style:'min-height:34px;font-size:14px',html:`<span>${lab}</span>`,onclick:() => fn(v)})));
const slider = (lab, min, max, step, val, fn) => { const o = h('b',{}), i = h('input',{type:'range',min,max,step,value:val,'aria-label':lab}); const set = v => { i.value = v; o.textContent = N(+v); }; i.addEventListener('input', () => { o.textContent = N(+i.value); fn(+i.value); }); set(val); return {el:[h('div',{class:'row sp'}, h('span',{class:'lbl'}, lab), o), i], set}; };
const stepper = (lab, min, max, val, fn) => { const o = h('b',{style:'min-width:30px;text-align:center;font:700 20px var(--fd)'}); let v = val;
  const set = x => { v = Math.max(min, Math.min(max, x)); o.textContent = v; };
  const b = (t, d) => h('button',{class:'chip',style:'min-width:44px','aria-label':(d > 0 ? 'More: ' : 'Fewer: ') + lab,onclick:() => { set(v + d); fn(v); }}, t);
  set(val); return {el:h('div',{class:'row sp',style:'flex-wrap:nowrap'}, h('span',{class:'lbl',style:'line-height:1.25'}, lab), h('div',{class:'row',style:'gap:6px;flex-wrap:nowrap'}, b('−', -1), o, b('+', 1))), set}; };
/* worked lines: [math, note]; the newest line is highlighted */
const workLines = (el, st, n) => el.replaceChildren(...st.slice(0, n).map(([t, why], i) => h('div',{class:'wl'}, h('span',{class:i === n - 1 && i ? 'on' : '',html:t}), h('span',{class:'hint'}, why || ''))));
/* a "Next step" button that walks a lab through its steps */
const stepBtn = (getMax, get, set) => { const b = h('button',{class:'btn',onclick:() => { set(get() >= getMax() ? 0 : get() + 1); }}); const label = () => b.textContent = get() >= getMax() ? '↺ Start over' : get() === 0 ? 'Solve it ▶' : 'Next step ▶'; return {el:b, label}; };

/* 1 · fair shares */
L[1] = box => {
  let n = 3, k = 4, sq = false;
  const fig = h('div',{class:'stage',style:'padding:6px'}), eq = out('', 22), note = h('div',{class:'c',style:'font-size:14px'});
  const paint = () => {
    fig.innerHTML = pies(n, k, sq);
    const q = Q(n, k); let t = `${n} ÷ ${k} = <span class="hl">${fr(n, k)}</span>`; if (q.d !== k) t += ` = ${FR(q)}`; if (n > k && q.d !== 1) t += ` = ${MX(q)}`;
    eq.innerHTML = t;
    note.innerHTML = `Friend 1 gets the <b style="color:var(--x)">pink piece</b> of every ${sq ? 'brownie' : 'pizza'}: ${n} piece${n > 1 ? 's' : ''} of ${fr(1, k)} = ${fr(n, k)}. ` + (n > k ? '<b>More</b> than 1 whole each!' : n === k ? 'Exactly 1 whole each.' : '<b>Less</b> than 1 whole each.');
  };
  const sa = slider('Things to share', 1, 10, 1, n, v => { n = v; paint(); }), sb = slider('Friends sharing', 2, 8, 1, k, v => { k = v; paint(); });
  const sg = seg([['pie','🍕 Pizzas'],['sq','🍫 Brownies']], 'pie', v => { sq = v === 'sq'; paint(); });
  const set = ([a, b, s]) => { n = a; k = b; sq = s; sa.set(a); sb.set(b); sg.querySelectorAll('button').forEach((x, i) => x.classList.toggle('on', i === (s ? 1 : 0))); paint(); };
  box.append(rule(`The fraction bar <b>means divide</b>: <span style="white-space:nowrap">${fr('a', 'b')} = a ÷ b</span>`), chips([['Test #4: 8 cups, 6 glasses', [8, 6, true]], ['3 pizzas, 4 friends', [3, 4, false]], ['1 ÷ 5', [1, 5, false]], ['3 ÷ 8', [3, 8, true]]], set), sg, fig, eq, note, ...sa.el, ...sb.el);
  paint();
};

/* 2 · like units */
L[2] = box => {
  let a = Q(1, 2), b = Q(1, 3), m1 = 1, m2 = 1;
  const fig = h('div',{class:'stage',style:'padding:6px'}), msg = out('', 18), eqs = h('div',{class:'c',style:'font:700 21px var(--fd)'});
  const s1 = stepper('Cut each top piece into', 1, 8, 1, v => { m1 = v; paint(); }), s2 = stepper('Cut each bottom piece into', 1, 8, 1, v => { m2 = v; paint(); });
  const paint = () => {
    const P1 = a.d * m1, P2 = b.d * m2, like = P1 === P2;
    fig.innerHTML = bars([{parts:P1, on:a.n * m1, col:PA, cut:m1, lab:a}, {parts:P2, on:b.n * m2, col:PB, cut:m2, lab:b}]);
    eqs.innerHTML = `${FR(a)} = ${fr(a.n * m1, P1)} &nbsp; ${FR(b)} = ${fr(b.n * m2, P2)}`;
    msg.innerHTML = like ? `✨ Like units: ${unitName(P1)}!` : `Not the same size yet: ${unitName(P1)} and ${unitName(P2)}`;
    msg.style.color = like ? 'var(--ok)' : 'var(--mut)';
  };
  const set = (x, y) => { a = x; b = y; m1 = m2 = 1; s1.set(1); s2.set(1); paint(); };
  const magic = h('button',{class:'btn ghost',onclick:() => { const L0 = lcm(a.d, b.d); m1 = L0 / a.d; m2 = L0 / b.d; s1.set(m1); s2.set(m2); paint(); }}, '✨ Find like units for me');
  box.append(rule('Like units = <b>same-size pieces</b>. Cut both bars until the pieces match.'),
    chips([[`Test #7: ${fr(1,2)} and ${fr(1,3)}`, [Q(1,2), Q(1,3)]], [`Test #6: ${fr(1,4)} and ${fr(2,5)}`, [Q(1,4), Q(2,5)]], [`Test #1: ${fr(1,5)} and ${fr(3,8)}`, [Q(1,5), Q(3,8)]], [`Test #2: ${fr(5,9)} and ${fr(2,3)}`, [Q(5,9), Q(2,3)]], ['🎲 New pair', null]], v => v ? set(...v) : set(...unlike(DEN, 24))),
    fig, s1.el, s2.el, msg, eqs, magic);
  paint();
};

/* 3 · add fractions: the potion mixer */
L[3] = box => {
  let a = Q(1, 4), b = Q(2, 5), st = 0;
  const fig = h('div',{class:'stage',style:'padding:6px'}), lines = h('div',{class:'work card pad'}), oops = h('div',{class:'col',hidden:true});
  const info = () => { const L0 = lcm(a.d, b.d), A = up(a, L0), B = up(b, L0), T = A + B, s = qadd(a, b); return {L0, A, B, T, s, last:T === s.n && L0 === s.d && T < L0 ? 2 : 3}; };
  const sb = stepBtn(() => info().last, () => st, v => { st = v; paint(); });
  const paint = () => {
    const {L0, A, B, T, s, last} = info();
    const fill = from => Array.from({length:L0}, (_, k) => from + k < A ? PA : from + k < T ? PB : 'var(--surf)');
    const rows = st === 0 ? [{parts:a.d, on:a.n, col:PA, lab:a}, {parts:b.d, on:b.n, col:PB, lab:b}]
      : st === 1 ? [{parts:L0, on:A, col:PA, lab:a, cut:L0 / a.d}, {parts:L0, on:B, col:PB, lab:b, cut:L0 / b.d}]
      : [{parts:L0, fills:fill(0), lab:st === last ? (T > L0 ? Q(1) : s) : null}].concat(T > L0 ? [{parts:L0, fills:fill(L0), lab:st === last ? part(s) : null}] : []);
    fig.innerHTML = (st >= 2 ? '<div class="c" style="font-size:26px;line-height:1">🧪</div>' : '') + bars(rows);
    const steps = [[`${FR(a)} + ${FR(b)}`, 'different-size pieces'], [`= ${fr(A, L0)} + ${fr(B, L0)}`, 'like units: ' + unitName(L0)], [`= ${fr(T, L0)}`, 'add the tops, keep the bottom']];
    if (last === 3) steps.push([`= <span class="hl">${MX(s)}</span>`, T > L0 ? 'more than 1 whole' : 'simplify']); else steps[2][0] = `= <span class="hl">${fr(T, L0)}</span>`;
    workLines(lines, steps, st + 1); sb.label();
  };
  const set = (x, y) => { a = x; b = y; st = 0; oops.hidden = true; paint(); };
  const trap = h('button',{class:'btn ghost',onclick:() => {
    const m = Q(a.n + b.n, a.d + b.d), big = qcmp(a, b) > 0 ? a : b;
    oops.replaceChildren(h('div',{class:'fb bad',html:`🙈 ${fr(a.n, a.d)} + ${fr(b.n, b.d)} is <b>not</b> ${fr(a.n + b.n, a.d + b.d)}. That is even less than ${FR(big)} by itself! A sum can’t be smaller than one of its parts.`}),
      h('div',{class:'stage',style:'padding:6px',html:bars([{parts:a.d + b.d, on:a.n + b.n, col:'var(--no)', lab:{n:a.n + b.n, d:a.d + b.d}}, {parts:big.d, on:big.n, col:big === a ? PA : PB, lab:big}])}));
    oops.hidden = false; }}, '🙈 What if I add the bottoms?');
  box.append(rule('Make <b>like units</b>, add the tops, <b>keep the bottom</b>.'),
    chips([[`Test #6: ${fr(1,4)} + ${fr(2,5)}`, [Q(1,4), Q(2,5)]], [`Test #1: ${fr(1,5)} + ${fr(3,8)}`, [Q(1,5), Q(3,8)]], [`Test #2: ${fr(5,9)} + ${fr(2,3)}`, [Q(5,9), Q(2,3)]], [`${fr(3,4)} + ${fr(5,8)}`, [Q(3,4), Q(5,8)]], ['🎲 New', null]], v => v ? set(...v) : set(...unlike(DEN, 24))),
    fig, lines, sb.el, trap, oops);
  paint();
};

/* 4 · subtract fractions: cross out pieces */
L[4] = box => {
  let a = Q(1, 2), b = Q(1, 3), st = 0;
  const fig = h('div',{class:'stage',style:'padding:6px'}), lines = h('div',{class:'work card pad'});
  const info = () => { const L0 = lcm(a.d, b.d), A = up(a, L0), B = up(b, L0), s = qsub(a, b); return {L0, A, B, s, last:A - B === s.n && L0 === s.d ? 2 : 3}; };
  const sb = stepBtn(() => info().last, () => st, v => { st = v; paint(); });
  const paint = () => {
    const {L0, A, B, s, last} = info();
    const rows = st === 0 ? [{parts:a.d, on:a.n, col:PA, lab:a}, {parts:b.d, on:b.n, col:PB, lab:b}]
      : st === 1 ? [{parts:L0, on:A, col:PA, lab:a, cut:L0 / a.d}, {parts:L0, on:B, col:PB, lab:b, cut:L0 / b.d}]
      : [{parts:L0, on:A, col:PA, lab:st === last ? s : a, cross:[A - B, A]}];
    fig.innerHTML = bars(rows);
    const steps = [[`${FR(a)} − ${FR(b)}`, 'different-size pieces'], [`= ${fr(A, L0)} − ${fr(B, L0)}`, 'like units: ' + unitName(L0)], [`= ${fr(A - B, L0)}`, `cross out ${B} piece${B > 1 ? 's' : ''}`]];
    if (last === 3) steps.push([`= <span class="hl">${MX(s)}</span>`, 'simplify']); else steps[2][0] = `= <span class="hl">${fr(A - B, L0)}</span>`;
    workLines(lines, steps, st + 1); sb.label();
  };
  const set = (x, y) => { a = x; b = y; st = 0; paint(); };
  box.append(rule('Like units first. Then <b>take away</b> the pieces.'),
    chips([[`Test #7: ${fr(1,2)} − ${fr(1,3)}`, [Q(1,2), Q(1,3)]], [`${fr(3,4)} − ${fr(1,3)}`, [Q(3,4), Q(1,3)]], [`${fr(5,6)} − ${fr(1,4)}`, [Q(5,6), Q(1,4)]], [`${fr(7,8)} − ${fr(1,2)}`, [Q(7,8), Q(1,2)]], ['🎲 New', null]],
      v => { if (v) return set(...v); let x, y; do { [x, y] = unlike(DEN, 24); } while (!qcmp(x, y)); set(...(qcmp(x, y) > 0 ? [x, y] : [y, x])); }),
    fig, lines, sb.el);
  paint();
};

/* 5 · add mixed numbers: wholes + fractions, and jumps on a number line */
L[5] = box => {
  let xs = [M(1,5,6), M(1,1,3), M(2,1,2)], st = 0;
  const fig = h('div',{class:'stage',style:'padding:6px'}), lines = h('div',{class:'work card pad'});
  const info = () => { const L0 = xs.reduce((l, x) => lcm(l, x.d), 1), ws = xs.map(whole), W = ws.reduce((s, w) => s + w, 0), ps = xs.map(x => up(part(x), L0)), P = ps.reduce((s, p) => s + p, 0), tot = xs.reduce(qadd, Q(0)); return {L0, ws, W, ps, P, tot, last:P >= L0 ? 4 : 3}; };
  const sb = stepBtn(() => info().last, () => st, v => { st = v; paint(); });
  const paint = () => {
    const {L0, ws, W, ps, P, tot, last} = info(), arr = []; let at = xs[0];
    xs.slice(1).forEach(x => { const to = qadd(at, x); arr.push({a:at, b:to, t:x}); at = to; });
    const max = Math.max(1, Math.ceil(qv(tot) - 1e-9)), den = max * L0 <= 48 ? L0 : 1;
    fig.innerHTML = nlF({min:0, max, den, arr, pts:[{x:xs[0], t:'start', c:'var(--w)'}].concat(st === last ? [{x:tot, t:'🐸', c:'var(--x)'}] : [])}) + (den === 1 ? `<div class="hint c">Too many tiny ${unitName(L0)} to draw, so ticks show wholes.</div>` : '');
    const steps = [[xs.map(MX).join(' + '), ''], [`🧱 ${ws.join(' + ')} = ${W}`, 'add the wholes'], [`🍰 ${ps.map(p => fr(p, L0)).join(' + ')} = ${fr(P, L0)}`, 'add the fractions (' + unitName(L0) + ')']];
    if (last === 4) steps.push([`${fr(P, L0)} = ${MX(Q(P, L0))}`, 'more than 1: regroup']);
    steps.push([`= <span class="hl">${MX(tot)}</span>`, last === 4 ? `${W} + ${MX(Q(P, L0))}` : 'put them together']);
    workLines(lines, steps, st + 1); sb.label();
  };
  const set = v => { xs = v; st = 0; paint(); };
  box.append(rule('Add the <b>wholes</b>. Add the <b>fractions</b>. Don’t drop the wholes!'),
    chips([['Test #10 🧀', [M(1,5,6), M(1,1,3), M(2,1,2)]], ['Test #2', [M(1,2,3), M(5,2,7)]], ['Test #3 🪵', [M(5,1,3), M(1,1,4)]], ['Twin', [M(2,3,5), M(4,1,2)]], ['🎲 New', null]],
      v => { if (v) return set(v); const [f1, f2b] = unlike(DEN, 24); set([qadd(Q(rnd(1, 4)), f1), qadd(Q(rnd(1, 4)), f2b)]); }),
    fig, lines, sb.el);
  paint();
};

/* 6 · subtract mixed numbers: rename a whole */
function wholesSVG(n, crossN, newCol){
  const S = 24, G = 6, W = 320, H = S + 8; let s = '';
  for (let i = 0; i < n; i++){ const x = 4 + i * (S + G); s += `<rect x="${x}" y="4" width="${S}" height="${S}" rx="5" fill="${PA}" stroke="var(--ink)" stroke-width="1.6"/>`; if (i >= n - crossN) s += `<path d="M${x + 5} 9L${x + S - 5} ${S - 1}M${x + S - 5} 9L${x + 5} ${S - 1}" stroke="var(--no)" stroke-width="2.4" stroke-linecap="round"/>`; }
  if (!n) s += `<text x="6" y="22" font-size="13" font-weight="700" fill="var(--mut)">no wholes left</text>`;
  return `<svg class="fx" viewBox="0 0 ${W} ${H}" role="img" aria-label="${n} whole${n === 1 ? '' : 's'}">${s}</svg>`;
}
L[6] = box => {
  let a = M(7,3,8), b = M(6,2,3), st = 0;
  const fig = h('div',{class:'stage col',style:'padding:8px;gap:4px'}), lines = h('div',{class:'work card pad'});
  const info = () => { const L0 = lcm(a.d, b.d), wa = whole(a), wb = whole(b), pa = up(part(a), L0), pb = up(part(b), L0), ren = pa < pb; return {L0, wa, wb, pa, pb, ren, last:ren ? 4 : 2}; };
  const sb = stepBtn(() => info().last, () => st, v => { st = v; paint(); });
  const paint = () => {
    const {L0, wa, wb, pa, pb, ren, last} = info(), r = qsub(a, b);
    const renamed = ren && st >= 2, take = st >= (ren ? 3 : 1), W = renamed ? wa - 1 : wa;
    let rows;
    if (renamed){
      const inLast = Math.min(pb, pa), rest = pb - inLast;
      rows = [{parts:L0, on:L0, col:PC, cross:take && rest ? [L0 - rest, L0] : null, tag:'new'}].concat(pa ? [{parts:L0, on:pa, col:PA, cross:take ? [pa - inLast, pa] : null}] : []);
    } else rows = [{parts:L0, on:pa, col:PA, cross:take ? [pa - pb, pa] : null}];
    fig.replaceChildren(h('div',{class:'lbl'}, `Wholes: ${W}`), h('div',{html:wholesSVG(W, take ? wb : 0)}), h('div',{class:'lbl'}, `${cap(unitName(L0))}: ${renamed ? pa + L0 : pa}`), h('div',{html:bars(rows, {lw:4, rw:renamed ? 34 : 0})}));
    const steps = [[`${MXL(wa, pa, L0)} − ${MXL(wb, pb, L0)}`, 'like units: ' + unitName(L0)]];
    if (ren) steps.push([`${pa} < ${pb} 😬`, `not enough ${unitName(L0)}!`], [`= ${MXL(wa - 1, pa + L0, L0)} − ${MXL(wb, pb, L0)}`, `rename 1 whole = ${fr(L0, L0)}`]);
    steps.push([`${fr(ren ? pa + L0 : pa, L0)} − ${fr(pb, L0)} = ${fr((ren ? pa + L0 : pa) - pb, L0)}, &nbsp;${ren ? wa - 1 : wa} − ${wb} = ${(ren ? wa - 1 : wa) - wb}`, 'take away'], [`= <span class="hl">${MX(r)}</span>`, '']);
    workLines(lines, steps, st + 1); sb.label();
  };
  const set = (x, y) => { a = x; b = y; st = 0; paint(); };
  box.append(rule('Top fraction too small? <b>Rename 1 whole</b> as more pieces.'),
    chips([['Test #2', [M(7,3,8), M(6,2,3)]], ['Twin', [M(5,1,4), M(2,5,6)]], [`Test #8: 8 − 2${fr(3,8)}`, [Q(8), M(2,3,8)]], [`6${fr(2,3)} − 1${fr(3,5)}`, [M(6,2,3), M(1,3,5)]], ['🎲 New', null]],
      v => { if (v) return set(...v); let x, y; for (;;){ const [f1, f2b] = unlike(DEN, 24), L0 = lcm(f1.d, f2b.d); x = qadd(Q(rnd(3, 8)), f1); y = qadd(Q(rnd(1, whole(x) - 1)), f2b); if (up(f1, L0) < up(f2b, L0)) break; } set(x, y); }),
    fig, lines, sb.el);
  paint();
};

/* 7 · estimate and compare with benchmarks */
L[7] = box => {
  const area = h('div',{class:'col'});
  const bench = () => {
    let f, streak = 0;
    const show = h('div',{class:'c',style:'font:700 44px var(--fd);min-height:64px'}), fb = h('div',{}), btns = h('div',{class:'grid3'}), nx = h('button',{class:'btn hlb',hidden:true,onclick:() => deal()},'Next fraction ▶');
    const deal = () => { for (;;){ f = rfrac([3,4,5,6,7,8,9,10,12]); const v = qv(f), s = [v, Math.abs(v - .5), 1 - v].sort((x, y) => x - y); if (s[1] - s[0] >= 1 / 12 - 1e-9) break; } show.innerHTML = FR(f); fb.replaceChildren(); nx.hidden = true; btns.querySelectorAll('button').forEach(b => { b.disabled = false; b.className = 'tile'; }); };
    ['0','½','1'].forEach((t, i) => btns.append(h('button',{class:'tile',style:'font:700 24px var(--fd)',onclick:ev => {
      const v = qv(f), ds = [v, Math.abs(v - .5), 1 - v], near = ds.indexOf(Math.min(...ds)), ok = i === near;
      streak = ok ? streak + 1 : 0; btns.querySelectorAll('button').forEach((b, j) => { b.disabled = true; if (j === near) b.classList.add('good'); else if (j === i) b.classList.add('bad'); });
      fb.replaceChildren(h('div',{class:'fb ' + (ok ? 'good' : 'bad'),html:(ok ? (streak > 2 ? `🔥 ${streak} in a row! ` : '✓ ') : '✗ ') + `${FR(f)} is closest to ${['0','½','1'][near]}. Half of ${f.d} is ${half(f.d)}.`}), h('div',{html:nlF({min:0, max:1, den:f.d, pts:[{x:f, t:'', c:'var(--x)'}]})}));
      nx.hidden = false; if (ok) xp(1); }}, t)));
    area.replaceChildren(h('div',{class:'hint c'},'Is it closest to 0, ½, or 1? Tip: compare the top to half of the bottom.'), show, btns, fb, nx); deal();
  };
  const chains = () => {
    let sets, names, unit;
    const card = h('div',{class:'ctx blk'}), btns = h('div',{class:'grid2'}), res = h('div',{class:'col'});
    const deal = (preset) => {
      if (preset){ sets = [[M(2,1,4), Q(3,8)], [M(1,5,8), M(1,3,4)]]; names = ['gold chain','silver chain']; unit = 'in.'; }
      else { const q = g7c(); sets = q.sets; names = q.names; unit = q.unit; }
      card.innerHTML = sets.map((s, i) => `⛓️ <b>${cap(names[i])}</b>: ${s.map(x => MX(x) + ' ' + unit).join(' and ')}`).join('<br>');
      res.replaceChildren(); btns.replaceChildren(...names.map((nm, i) => h('button',{class:'btn ghost',onclick:() => reveal(i)}, cap(nm.replace(/^the /, '')) + ' is longer')));
    };
    const reveal = pickI => {
      const tot = sets.map(s => s.reduce(qadd, Q(0))), win = qcmp(tot[0], tot[1]) > 0 ? 0 : 1, ok = pickI === win, mx = Math.max(...tot.map(qv));
      const bench = x => { const p = part(x); return p.n ? `${FR(p)} ${qcmp(p, HALF) < 0 ? '< ½' : '> ½'}` : 'no fraction'; };
      res.replaceChildren(h('div',{class:'fb ' + (ok ? 'good' : 'bad'),html:(ok ? '✓ Yes! ' : '✗ Not this time. ') + `Both have ${tot.map((_, i) => sets[i].map(whole).reduce((s, w) => s + w, 0))[0]} wholes. Look at the fractions:`}),
        h('div',{class:'work card pad',html:sets.map((s, i) => `<div>${cap(names[i].replace(/^the /, ''))}: ${s.map(bench).join(', ')}</div>`).join('')}),
        h('div',{class:'stage',style:'padding:6px',html:tape(sets.map((s, i) => ({lab:cap(names[i].replace(/^the /, '').split(' ')[0]), segs:s.map((x, j) => ({v:x, t:MXt(x), c:j ? PB : PA}))})), {max:Math.ceil(mx)})}),
        h('div',{class:'hint c',html:`Exact: ${MX(tot[0])} vs ${MX(tot[1])}. You didn’t need to add!`}));
      if (ok) xp(2);
    };
    area.replaceChildren(h('div',{class:'hint c'},'Without adding: which is longer in all?'), card, btns, res, chips([['Test #5 (Kayla)', true], ['🎲 New chains', false]], deal)); deal(true);
  };
  box.append(rule('Benchmarks: <b>0, ½, 1</b>. Compare without adding!'), seg([['b','🎯 0, ½, or 1?'],['c','⛓️ Chain race']], 'b', k => k === 'b' ? bench() : chains()), area);
  bench();
};
/* two chain sets for the race: same wholes, one set's fractions all below ½, the other's above */
function g7c(){ const [n1, n2, unit] = pick(ITEMS), W = rnd(2, 5), mk = fn => { const wa = rnd(0, W); return [qadd(Q(wa), fn()), qadd(Q(W - wa), fn())]; }, lowFirst = Math.random() < .5, lo = mk(lessHalf), hi = mk(moreHalf); return {sets:lowFirst ? [lo, hi] : [hi, lo], names:[n1, n2], unit}; }

/* 8 · story problems, step by step */
const STORIES = [
  {k:'Lacy (Test #8)', ctx:LACY, q:'How many more pounds of beans does Lacy need?', ans:`5${fr(5,8)} pounds`,
    steps:[['🔎 What do we need?','Beans for <b>both</b> kinds, minus what she has.'], ['Step 1 · second kind', `3${fr(5,8)} + ${fr(3,4)} = 3${fr(5,8)} + ${fr(6,8)} = 4${fr(3,8)}`], ['Step 2 · both kinds', `3${fr(5,8)} + 4${fr(3,8)} = 8`], ['Step 3 · what she still needs', `8 − 2${fr(3,8)} = <span class="hl">5${fr(5,8)}</span>`]],
    fig:st => tape([{lab:'1st kind', segs:[{v:M(3,5,8), t:'3 5/8', c:PA}]}].concat(st >= 1 ? [{lab:'2nd kind', segs:[{v:M(3,5,8), t:'3 5/8', c:PA}, {v:Q(3,4), t:'3/4', c:PB}]}] : []).concat(st >= 3 ? [{lab:'Needs 8', segs:[{v:M(2,3,8), t:'has 2 3/8', c:PC}, {v:M(5,5,8), t:'5 5/8', dash:true}]}] : []), {max:8})},
  {k:'Miss Song (Test #3)', ctx:`Miss Song cuts a board that is <b>16 feet</b> long into <b>3</b> equal pieces. Then she realizes that the pieces each need to be <b>1${fr(1,4)} feet</b> longer.`, q:'How long does each piece need to be?', ans:`6${fr(7,12)} feet`,
    steps:[['🔎 What do we need?','The new length of <b>one</b> piece.'], ['Step 1 · share the board', `16 ÷ 3 = ${fr(16,3)} = 5${fr(1,3)} feet`], ['Step 2 · make it longer', `5${fr(1,3)} + 1${fr(1,4)} = 5${fr(4,12)} + 1${fr(3,12)} = <span class="hl">6${fr(7,12)}</span>`]],
    fig:st => tape([{lab:'Board', segs:[0,1,2].map(() => ({v:Q(16,3), t:st >= 1 ? '5 1/3' : '?', c:PA}))}].concat(st >= 2 ? [{lab:'New piece', segs:[{v:Q(16,3), t:'5 1/3', c:PA}, {v:M(1,1,4), t:'1 1/4', c:PB}]}] : []), {max:16})},
  {k:'Cheese (Test #10)', ctx:CHEESE, q:'How many pounds of cheese do they bring altogether?', ans:`5${fr(2,3)} pounds`,
    steps:[['🔎 What do we need?','The <b>total</b>: add all three.'], ['Step 1 · wholes', '1 + 1 + 2 = 4'], ['Step 2 · fractions in sixths', `${fr(5,6)} + ${fr(2,6)} + ${fr(3,6)} = ${fr(10,6)} = 1${fr(4,6)}`], ['Step 3 · together', `4 + 1${fr(4,6)} = <span class="hl">5${fr(2,3)}</span>`]],
    fig:() => CHEESE_LINE}
];
L[8] = box => {
  let cur = STORIES[0], st = 0;
  const card = h('div',{class:'ctx blk'}), fig = h('div',{class:'stage',style:'padding:6px'}), lines = h('div',{class:'work card pad'});
  const sb = stepBtn(() => cur.steps.length - 1, () => st, v => { st = v; paint(); });
  const paint = () => {
    card.innerHTML = cur.ctx + `<div style="font-weight:800;margin-top:4px">${cur.q}</div>`;
    const f = cur.fig ? cur.fig(st) : null; fig.innerHTML = f || ''; fig.hidden = !f;
    lines.replaceChildren(...cur.steps.slice(0, st + 1).map(([t, m], i) => h('div',{class:'col',style:'gap:0'}, h('b',{class:i === st && i ? 'on' : '',style:'font-size:14px'}, t), h('span',{html:m}))));
    sb.label();
  };
  const fromGen = () => { const q = g8(), parts = q.why.split(/(?=Step \d)/); return {k:'new', ctx:q.ctx, q:q.prompt, fig:q.fig ? () => q.fig : null, steps:[['🔎 Read it twice','What do they ask for? What do you know?']].concat(parts.map((p, i) => [parts.length > 1 ? 'Step ' + (i + 1) : 'Solve', p.replace(/^Step \d: /, '')])).concat([['Answer', `<span class="hl">${q.blanks[0].show}</span> ${q.blanks[0].post || ''}`]])}; };
  box.append(rule('Find <b>every</b> step: what you need, what you have, then the last step.'), chips(STORIES.map(s => [s.k, s]).concat([['🎲 New story', null]]), v => { cur = v || fromGen(); st = 0; paint(); }), card, fig, lines, sb.el);
  paint();
};

/* 9 · mistake detective */
const CASES = [
  {k:'Adesh (Test #6)', prob:`Adesh adds ${EXs(fr(1,4), '+', fr(2,5))}`, lines:[`${fr(1,4)} + ${fr(2,5)}`, `= ${fr(5,20)} + ${fr(8,20)}`, `= ${fr(13,40)}`], bad:2, why:`He added the denominators. Twentieths + twentieths are still twentieths: <b>${fr(13,20)}</b>.`},
  {k:'Lost wholes', prob:`Jade adds ${EXs(`1${fr(2,3)}`, '+', `5${fr(2,7)}`)}`, lines:[`1${fr(2,3)} + 5${fr(2,7)}`, `= 1${fr(14,21)} + 5${fr(6,21)}`, `= ${fr(20,21)}`], bad:2, why:`The 1 and the 5 disappeared! 1 + 5 = 6, so the answer is <b>6${fr(20,21)}</b>.`},
  {k:'No rename', prob:`Max subtracts ${EXs(`7${fr(3,8)}`, '−', `6${fr(2,3)}`)}`, lines:[`7${fr(3,8)} − 6${fr(2,3)}`, `= 7${fr(9,24)} − 6${fr(16,24)}`, `= 1${fr(7,24)}`], bad:2, why:`9 is less than 16, so he did 16 − 9 instead. Rename first: 6${fr(33,24)} − 6${fr(16,24)} = <b>${fr(17,24)}</b>.`},
  {k:'Flipped', prob:'8 cups of water are poured equally into 6 glasses. Rosa finds how much is in each glass.', lines:['6 ÷ 8', `= ${fr(6,8)} = ${fr(3,4)} cup`], bad:0, why:`It is cups ÷ glasses: 8 ÷ 6 = <b>1${fr(1,3)}</b> cups. More cups than glasses, so each glass gets more than 1.`},
  {k:'Missed a step', prob:LACY, lines:[`Second kind: 3${fr(5,8)} + ${fr(3,4)} = 4${fr(3,8)}`, `Needs: 4${fr(3,8)} − 2${fr(3,8)} = 2`], bad:1, why:`She needs beans for <b>both</b> kinds: 3${fr(5,8)} + 4${fr(3,8)} = 8. Then 8 − 2${fr(3,8)} = <b>5${fr(5,8)}</b>.`},
  {k:'Wrong letter', prob:`Evaluate ${EXs('(1 ÷ 5)', '+', '(3 ÷ 8)')}. Choices: A. ${fr(23,3)} B. ${fr(13,4)} C. ${fr(23,40)} D. ${fr(4,13)}`, lines:['(1 ÷ 5) + (3 ÷ 8)', `= ${fr(8,40)} + ${fr(15,40)}`, `= ${fr(23,40)}`, `Circled: A. ${fr(23,3)}`], bad:3, why:`The math is right, but ${fr(23,40)} is choice <b>C</b>! Always check the letter matches your work.`}
];
L[9] = box => {
  let cur = CASES[0];
  const card = h('div',{class:'ctx blk'}), list = h('div',{class:'col',style:'gap:6px'}), res = h('div',{});
  const paint = () => {
    card.innerHTML = cur.prob; res.replaceChildren(); let found = false;
    const pickLine = (i, b) => {
      if (found) return;
      if (i === cur.bad){ found = true; b.classList.add('bad'); res.replaceChildren(h('div',{class:'fb good',html:'🕵️ Found it! ' + cur.why})); xp(2); }
      else if (i < 0 && cur.bad < 0){ found = true; b.classList.add('good'); res.replaceChildren(h('div',{class:'fb good',html:'✅ Right, no mistake! ' + cur.why})); xp(2); }
      else if (i < 0){ b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); toast('There is a mistake. Keep looking!'); }
      else { b.classList.add('good'); toast('That line is fine ✓'); }
    };
    list.replaceChildren(...cur.lines.map((l, i) => { const b = h('button',{class:'opt',html:`<span class="hint">Line ${i + 1}</span> &nbsp;${l}`,onclick:() => pickLine(i, b)}); return b; }), (() => { const b = h('button',{class:'opt',onclick:() => pickLine(-1, b)}, '✅ No mistake'); return b; })());
  };
  const fromGen = () => { const type = pick(['den','whole','rename','flip','ok']), c = detCase(type), badI = {den:2, whole:2, rename:2, flip:0, ok:-1}[type]; return {prob:(c.ctx ? c.ctx + '<br>' : '') + `🕵️ ${c.who}’s work:`, lines:c.lines, bad:badI, why:c.why}; };
  box.append(rule('One line has a mistake. <b>Tap it!</b> 🕵️'), chips(CASES.map(c => [c.k, c]).concat([['🎲 New case', null]]), v => { cur = v || fromGen(); paint(); }), card, list, res);
  paint();
};

function practiceSet(id, n){
  const out = [], seen = new Set();
  for (let t = 0; t < 60 && out.length < n; t++){ const q = GENS[id](), key = JSON.stringify([q.prompt, q.ctx, q.fig, q.choices && q.choices.slice().sort(), q.rows && q.rows.map(r => r.opts.slice().sort()), q.blanks && q.blanks.map(b => b.answer), q.target, q.type]); if (!seen.has(key)){ seen.add(key); out.push(q); } }
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
