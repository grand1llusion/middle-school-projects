/* ---------- TOPIC D · LEARN LABS ---------- */

/* 21 · unknown factors: every division is a multiplication with a missing number */
L[21] = box => {
  let a = -24, b = 6;
  const card = h('div',{class:'card pad col c'}), facts = h('div',{class:'work card pad'});
  const paint = () => {
    const zero = b === 0, q = zero ? null : Q(a, b), whole = q && q.d === 1;
    const box2 = zero ? (a === 0 ? '?' : '✗') : whole ? N(q.n) : fr(N(Math.abs(q.n)), q.d);
    card.innerHTML = `<div class="lbl">The division</div><div class="big-out" style="font-size:26px">${N(a)} ÷ ${pn(b)}</div><div class="lbl">Ask: what times ${pn(b)} makes ${N(a)}?</div><div class="big-out" style="font-size:26px">${pn(b)} · <span class="hl">${box2 === '✗' ? 'no number' : box2}</span> = ${N(a)}</div>`;
    const lines = [];
    if (zero) lines.push(a === 0 ? 'Zero divided by zero has no single answer.' : `Nothing times 0 makes ${N(a)}. So ${N(a)} ÷ 0 is <b>undefined</b>.`);
    else {
      lines.push(`Fraction form: ${fr(N(a), N(b))} = <b>${whole ? N(q.n) : (q.n < 0 ? '−' : '') + fr(Math.abs(q.n), q.d)}</b>`);
      lines.push(a === 0 ? '0 ÷ anything (not 0) is <b>0</b>.' : (a < 0) === (b < 0) ? 'Same signs → the answer is <b>positive</b>.' : 'Different signs → the answer is <b>negative</b>.');
      if (a && Math.abs(q.n) > 0) { const ap = Math.abs(a), bp = Math.abs(b); lines.push(`One negative sign can sit anywhere: ${q.n < 0 ? `−${fr(ap, bp)} = ${fr('−' + ap, bp)} = ${fr(ap, '−' + bp)}` : `${fr(ap, bp)} = ${fr('−' + ap, '−' + bp)}`}`); }
    }
    facts.replaceChildren(...lines.map(t => h('div',{html:t})));
  };
  const sa = slider('Dividend (the top)', -30, 30, 1, a, v => { a = v; paint(); });
  const bs = [-8,-6,-4,-3,-2,2,3,4,6,8,0];
  box.append(rule('Dividing is a multiplication with a missing factor: <b>b · □ = a</b>.'), card, facts, ...sa.el,
    h('div',{class:'lbl'},'Divisor (the bottom)'), chips(bs.map(v => [N(v), v]), v => { b = v; paint(); }),
    h('div',{class:'lbl'},'Try the zero cases'), chips([['0 ÷ (−15)', [0,-15]], ['−90 ÷ 0', [-90,0]], ['10 ÷ (−4)', [10,-4]]], ([x, y]) => { a = x; b = y; sa.set(x); paint(); }));
  paint();
};

/* 22 · fractions and decimals: make the bottom a power of 10 */
L[22] = box => {
  let q = 25, p = 12;
  const fig = h('div',{class:'card pad col'}), steps = h('div',{class:'work card pad'});
  let sl;
  const paint = () => {
    const d = decFrac(p, q), g = gcd(p, q), val = p / q;
    steps.replaceChildren(...[
      g > 1 ? `Simplify first: ${fr(p, q)} = ${fr(d.pp, d.qq)}` : null,
      `Multiply top and bottom by <b>${d.k}</b>: ${fr(d.pp, d.qq)} = ${fr(d.pp * d.k, d.pow)}`,
      `${d.pow === 10 ? 'Tenths' : d.pow === 100 ? 'Hundredths' : 'Thousandths'} place: <span class="hl">${N(Math.round(val * 10000) / 10000)}</span>`,
      `Long division agrees: ${p} ÷ ${q} = ${N(Math.round(val * 10000) / 10000)}`
    ].filter(Boolean).map(t => h('div',{html:t})));
    const cells = Math.round(val * 100);
    fig.replaceChildren(h('div',{class:'big-out',style:'font-size:26px',html:`${fr(p, q)} = ${N(Math.round(val * 10000) / 10000)}`}),
      d.pow <= 100 ? h('div',{class:'grid10','aria-label':`${cells} of 100 squares shaded`}, Array.from({length:100}, (_, i) => h('i',{class:i < cells ? 'on' : ''}))) : h('div',{class:'meter',style:'height:16px'}, h('i',{style:`width:${val * 100}%`})),
      h('div',{class:'hint c'}, d.pow <= 100 ? `${cells} of 100 squares` : 'A whole bar split into 1,000 tiny pieces'));
  };
  const reset = () => { if (sl) sl.set(Math.min(p, q - 1)); };
  const mkSl = () => { sl = slider('Top number', 1, Math.max(1, q - 1), 1, p, v => { p = v; paint(); }); return sl; };
  const slBox = h('div',{class:'col'});
  const buildSl = () => { mkSl(); slBox.replaceChildren(...sl.el); };
  buildSl();
  box.append(rule('Make the bottom 10, 100 or 1,000, and the decimal appears. It only works when the bottom has just <b>2s and 5s</b>.'), fig, steps,
    h('div',{class:'lbl'},'Bottom number'), chips([2,4,5,8,20,25,40,50].map(v => [String(v), v]), v => { q = v; p = Math.min(Math.max(1, p), Math.max(1, q - 1)); if (v === 2) p = 1; buildSl(); paint(); }), slBox);
  paint();
};

/* 23 · stops or loops: watch the remainders */
L[23] = box => {
  let p = 3, q = 11, digs, rems, r, done, loopAt;
  const tape = h('div',{class:'ldiv'}), verdict = h('div',{class:'card pad col c'}), btn = h('button',{class:'btn hlb'},'Next digit ▶');
  const start = () => { digs = []; rems = [p % q]; r = p % q; done = false; loopAt = -1; paint(); };
  const step = () => {
    if (done) return;
    r *= 10; const d = Math.floor(r / q); digs.push(d); const before = r; r = r % q;
    if (r === 0){ done = true; }
    else if (rems.includes(r)){ done = true; loopAt = rems.indexOf(r); }
    else rems.push(r);
    tape.dataset.last = `${before}/${q}=${d}r${r}`; paint(before, d);
  };
  let lines = [];
  const paint = (before, d) => {
    if (before != null) lines.push(`${before} ÷ ${q} = ${d}  remainder ${r}`);
    const e = expand(p, q), shown = digs.length ? `0.${digs.join('')}` : '0.';
    tape.textContent = [`${p} ÷ ${q}  →  ${shown}${done ? '' : '…'}`, ...lines.slice(-5)].join('\n');
    btn.disabled = done;
    if (!digs.length){ verdict.replaceChildren(h('div',{class:'hint'}, `Press the button to divide ${p} by ${q} one digit at a time.`)); return; }
    if (done) verdict.replaceChildren(h('div',{class:'lbl'},'Result'), h('div',{class:'big-out',style:'font-size:26px',html:`${fr(p, q)} = ${e.rep.length ? barTxt(e, false) : plainDec(e, false)}`}),
      h('div',{html:r === 0 ? `The remainder hit <b>0</b>, so the decimal <b>stops</b>.` : `Remainder <b>${r}</b> showed up before, so the digits <b>loop</b>.`}),
      h('div',{class:'hint',html:`${q} = ${factorTxt(q)} → ${stops(q / gcd(p, q)) ? 'only 2s and 5s' : 'has a factor other than 2 and 5'}`}));
    else verdict.replaceChildren(h('div',{class:'hint'}, `Remainders so far: ${rems.join(', ')}. Keep going until one repeats or you reach 0.`));
  };
  const pickF = ([a, b]) => { p = a; q = b; lines = []; start(); };
  btn.addEventListener('click', step);
  box.append(rule('Long division leaves remainders. If one <b>repeats</b>, the digits loop. If you reach <b>0</b>, it stops.'),
    chips([[fr(1,3),[1,3]],[fr(5,6),[5,6]],[fr(3,11),[3,11]],[fr(7,12),[7,12]],[fr(17,15),[17,15]],[fr(3,8),[3,8]],[fr(7,45),[7,45]]], pickF), tape, btn, verdict,
    h('button',{class:'btn ghost',onclick:() => { lines = []; start(); }}, 'Start over'));
  lines = []; start();
};
