/* ---------- TOPIC D · QUESTION GENERATORS AND STUDY GUIDE ---------- */
const nz = (lo, hi) => { let v = 0; while (!v) v = rnd(lo, hi) * sgn(); return v; };
const P = v => v < 0 ? `(${N(v)})` : N(v);
const sfr = (n, d, neg) => (neg ? '−' : '') + fr(n, d);

/* bar-notation answer choices for a repeating decimal p/q. Every wrong choice is a different number. */
const val12 = e => { const d = e.pre.slice(); while (d.length < 12 && e.rep.length) d.push(...e.rep); while (d.length < 12) d.push(0); return e.w + '.' + d.slice(0, 12).join(''); };
function barChoices(p, q, neg){
  const e = expand(p, q), right = barTxt(e, neg), rv = val12(e), all = e.pre.concat(e.rep), cands = [];
  const mkc = (w, pre, rep) => ({txt:barTxt({w, pre, rep}, neg), v:val12({w, pre, rep})});
  cands.push(mkc(e.w, [], all));                                                           /* bar over everything */
  let tail = all.slice(); while (tail.length < 4) tail = tail.concat(e.rep);
  cands.push(mkc(e.w, tail.slice(0, 4), []));                                              /* just cut off */
  cands.push(mkc(e.w, e.pre.concat(e.rep.slice(0, -1)), e.rep.slice(-1)));                 /* bar on the last digit only */
  if (e.pre.length) cands.push(mkc(e.w, e.pre.slice(0, -1), [e.pre[e.pre.length - 1]].concat(e.rep))); /* bar starts too early */
  cands.push(mkc(e.w, e.pre, [e.rep[0]]));                                                 /* bar on the first digit only */
  cands.push(mkc(e.w, e.pre.concat(e.rep), []));                                           /* one loop, no bar */
  const wrongs = [], seen = new Set([right]); cands.forEach(c => { if (c.v !== rv && !seen.has(c.txt) && wrongs.length < 3){ seen.add(c.txt); wrongs.push(c.txt); } });
  for (let k = 1; wrongs.length < 3; k++){ const c = mkc(e.w + k, e.pre, e.rep).txt; if (!seen.has(c)){ seen.add(c); wrongs.push(c); } }
  const choices = shuffle([right, ...wrongs]);
  return {choices, answer:choices.indexOf(right), right, e};
}

/* 21 · unknown factors, zero, and where the minus sign can live */
function gUnk(){
  const t = pick([0, 0, 1, 2, 3, 4]);
  if (t === 0){
    const frac = Math.random() < .4; let a, b;
    if (frac){ do { a = nz(1, 13); b = nz(2, 9); } while (a % b === 0); } else { b = nz(2, 9); a = b * nz(1, 9); }
    const x = mk(Q(a, b), frac ? 'f' : 'i');
    return NUM({skill:21, title:'Divide', prompt:`${DVex(I(a), I(b))} = ?<div class="hint">${frac ? 'Not a whole number? Write a fraction.' : 'Think: what times ' + N(b) + ' makes ' + N(a) + '?'}</div>`,
      why:`Unknown factor: ${P(b)} · □ = ${N(a)}.` + (frac ? ` It is ${(a < 0) !== (b < 0) ? 'negative' : 'positive'}: <b>${showAns(x)}</b>.` : ` □ = <b>${N(a / b)}</b>.`) + ' Same signs → positive. Different signs → negative.'}, x);
  }
  if (t === 1){
    const b = nz(2, 9); let k = 1; while (k === 1) k = nz(1, 9); const a = b * k;
    return shufMC({skill:21, title:'Unknown factor', prompt:`Which unknown factor equation goes with ${DVex(I(a), I(b))}?`, layout:'g2', why:`Dividing by ${P(b)} asks: ${P(b)} times what makes ${N(a)}? So ${P(b)} · □ = ${N(a)}.`},
      `${P(b)} · □ = ${N(a)}`, [`${P(a)} · □ = ${N(b)}`, `□ ÷ ${P(b)} = ${N(a)}`, `${P(b)} + □ = ${N(a)}`]);
  }
  if (t === 2){
    const n = nz(2, 40), top = Math.random() < .5;
    const right = top ? 'Undefined' : '0', all = shuffle(['0', 'Undefined', '1', N(n)].filter((v, i, ar) => ar.indexOf(v) === i));
    return MC({skill:21, title:'Zero', prompt:top ? DVex(I(n), I(0)) + ' = ?' : DVex(I(0), I(n)) + ' = ?', choices:all, answer:all.indexOf(right), layout:'g2',
      why: top ? `What number times 0 makes ${N(n)}? None. Dividing by 0 is <b>undefined</b>.` : `What number times ${P(n)} makes 0? Zero. So 0 ÷ ${P(n)} = <b>0</b>.`});
  }
  if (t === 3){
    let p, q; do { p = rnd(1, 9); q = rnd(2, 9); } while (p === q);
    const right = [sfr('−' + p, q), fr(p, '−' + q), `−(${fr(p, q)})`, `−(${fr('−' + p, '−' + q)})`], wrong = [fr(p, q), fr('−' + p, '−' + q), fr(q, '−' + p), `−${fr(q, p)}`];
    const set = shuffle(right).slice(0, 3).map(c => [c, true]).concat(shuffle(wrong).slice(0, 3).map(c => [c, false])), o = shuffle(set);
    return {type:'multi', all:true, skill:21, title:'Choose all', prompt:`Which are equal to ${fr('−' + p, q)}? Choose <b>all</b> that apply.`, choices:o.map(c => c[0]), correct:o.map((c, i) => c[1] ? i : -1).filter(i => i >= 0), pick:1,
      why:`${fr('−' + p, q)} has one negative sign. It can sit on top, on the bottom, or out front: all mean −${p}/${q}. Two negatives (top and bottom) cancel to a positive.`};
  }
  const a = nz(1, 9), b = nz(2, 9), ans = Q(-a, b), x = mk(ans, 'f');
  return NUM({skill:21, title:'Evaluate', ctx:`a = ${N(a)} and b = ${N(b)}`, prompt:`Evaluate ${fr('−a', 'b')}`, why:`−a means the opposite of a: −(${N(a)}) = ${N(-a)}. Then ${N(-a)} ÷ ${P(b)} = <b>${showAns(x)}</b>.`}, x);
}

/* 22 · fractions and decimals both ways */
const DENS = [2, 4, 5, 8, 10, 16, 20, 25, 40, 50, 60, 80, 100, 125];
function decFrac(p, q){ const g = gcd(p, q), pp = p / g, qq = q / g; let pow = 10; while (pow % qq) pow *= 10; return {pp, qq, k:pow / qq, pow}; }
function gFD(){
  const t = pick([0, 0, 1, 1, 2, 3, 4]), neg = Math.random() < .45;
  if (t === 0){
    const w = Math.random() < .35 ? rnd(1, 9) : 0, n = rnd(1, 99), cent = n % 10 === 0 ? n + 1 : n;
    const x = mk(Q((neg ? -1 : 1) * (w * 100 + cent), 100), 'f'), dec = (neg ? '−' : '') + w + '.' + String(cent).padStart(2, '0');
    return NUM({skill:22, title:'Decimal → fraction', prompt:`Write <b>${dec}</b> as a fraction${w ? ' or mixed number' : ''} in simplest form.`, why:`Say it with place value: ${dec} = ${neg ? '−' : ''}${w ? w : ''}${fr(cent, 100)}. Then cancel shared factors: <b>${showAns(x)}</b>.`}, x);
  }
  if (t === 1 || t === 4){
    let p, q; do { q = pick(DENS); p = rnd(1, q * 2); } while (!stops(q / gcd(p, q)) || p % q === 0);
    const x = mk(Q((neg ? -1 : 1) * p, q), 'd'), d = decFrac(p, q);
    return NUM({skill:22, title:t === 4 ? 'Long division' : 'Fraction → decimal', prompt:`Write ${sfr(p, q, neg)} as a decimal.<div class="hint">${t === 4 ? 'Try long division: ' + p + ' ÷ ' + q + '.' : 'Make the bottom 10, 100 or 1,000.'}</div>`,
      why:(g => `${g > 1 ? fr(p, q) + ' = ' + fr(d.pp, d.qq) + '. ' : ''}${fr(d.pp, d.qq)} = ${fr(d.pp * d.k, d.pow)} (multiply top and bottom by ${d.k}) = <b>${N(qv(x.q))}</b>.`)(gcd(p, q))}, x);
  }
  if (t === 2){
    const qs = [2, 4, 5, 8, 20, 25, 40, 50]; let q = pick(qs), p; do { p = rnd(1, q * 2 - 1); } while (gcd(p, q) !== 1); const d = decFrac(p, q);
    return {type:'num', skill:22, title:'Decimal fraction', prompt:`Write ${fr(p, q)} as a decimal fraction: ${fr(p, q)} = ${fr('□', d.pow)}.`,
      blanks:[{answer:d.k, show:String(d.k), label:'Multiply top and bottom by'}, {answer:p * d.k, show:String(p * d.k), label:'New top number'}],
      why:`${q} × ${d.k} = ${d.pow}. Do the same to the top: ${p} × ${d.k} = ${p * d.k}. So ${fr(p, q)} = ${fr(p * d.k, d.pow)}.`};
  }
  const good = [[1, 2], [3, 4], [7, 8], [9, 20], [11, 25], [3, 16], [7, 40], [13, 50]], bad = [[1, 3], [5, 6], [2, 7], [4, 9], [7, 12], [8, 15], [5, 11], [9, 14], [3, 22]];
  const [gp, gq] = pick(good), ws = shuffle(bad).slice(0, 3), all = shuffle([[gp, gq, true], ...ws.map(([p, q]) => [p, q, false])]);
  return MC({skill:22, title:'Which can be a decimal fraction?', prompt:'Only one of these has a decimal fraction (10, 100, 1,000…) in its family. Which?', choices:all.map(([p, q]) => fr(p, q)), answer:all.findIndex(c => c[2]), layout:'g2',
    why:`Factor the bottoms. ${gq} = ${factorTxt(gq)} has only 2s and 5s, so it can become a power of 10. ${ws.map(([, q]) => q + ' = ' + factorTxt(q)).join(', ')} each have another factor.`});
}

/* 23 · stops or loops, and bar notation */
const LQ = [3, 6, 7, 9, 11, 12, 15, 18, 22, 24, 30, 33, 45, 48, 60, 66, 99], SQ = [2, 4, 5, 8, 10, 16, 20, 25, 40, 50, 80, 125];
function frac(wantStops){
  for (;;){ const q = pick(wantStops ? SQ : LQ), p = rnd(1, q * 2); if (gcd(p, q) === 1 && p !== q && stops(q) === wantStops) return [p, q]; }
}
function gTR(){
  const t = pick([0, 0, 1, 2, 2, 3]);
  if (t === 0){
    const kinds = shuffle([true, true, false, false]), rows = kinds.map(s => { const [p, q] = frac(s), neg = Math.random() < .4; return {h:sfr(p, q, neg), opts:['🛑 Stops', '🔁 Loops'], a:s ? 0 : 1}; });
    return {type:'rows', skill:23, title:'Stops or loops?', prompt:'Does the decimal for each fraction stop (terminate) or loop (repeat)?', rows, why:'Simplify, then factor the bottom. Only 2s and 5s → it <b>stops</b>. Any other prime factor → it <b>loops</b>.'};
  }
  if (t === 1){
    const s = Math.random() < .5, [p, q] = frac(s), f = factorTxt(q), other = f.split(' · ').filter(v => v !== '2' && v !== '5')[0];
    const right = s ? `Stops. ${q} = ${f}, only 2s and 5s.` : `Loops. ${q} = ${f}, and ${other} is not a 2 or a 5.`;
    const wr = s ? ['Loops. Big denominators always loop.', 'Loops. Its denominator is even.', 'Stops. The top is smaller than the bottom.'] : ['Stops. Its denominator is odd.', 'Stops. Every fraction stops eventually.', `Stops. ${q} has a 5 in it.`];
    const all = shuffle([right, ...wr.slice(0, 3)]);
    return MC({skill:23, title:'Explain it', prompt:`Without long division: does ${fr(p, q)} stop or loop?`, choices:all, answer:all.indexOf(right), layout:'big', why:`${q} = ${f}. ${s ? 'Only 2s and 5s, so it stops.' : `${other} is another prime factor, so it loops.`}`});
  }
  if (t === 2){
    let p, q, e; do { [p, q] = frac(false); e = expand(p, q); } while (e.rep.length > 4 || e.pre.length > 2);
    const neg = Math.random() < .4, c = barChoices(p, q, neg);
    return MC({skill:23, title:'Bar notation', prompt:`Write ${sfr(p, q, neg)} as a decimal. Use bar notation.`, choices:c.choices, answer:c.answer, layout:'g2',
      why:`Long division: ${p} ÷ ${q} = ${plainDec({w:e.w, pre:e.pre.concat(e.rep, e.rep), rep:[]}, neg)}… The remainders repeat, so the block <b>${e.rep.join('')}</b> loops: ${c.right}.`});
  }
  const [p, q] = frac(true), neg = Math.random() < .4, x = mk(Q((neg ? -1 : 1) * p, q), 'd');
  return NUM({skill:23, title:'Stops: write it', prompt:`${sfr(p, q, neg)} stops. Write it as a decimal.`, why:`${fr(p, q)}: ${p} ÷ ${q} = <b>${N(qv(x.q))}</b>.`}, x);
}
Object.assign(GENS, {21:gUnk, 22:gFD, 23:gTR});
const buildBossD = () => [gUnk(), gUnk(), gUnk(), gUnk(), gFD(), gFD(), gFD(), gFD(), gFD(), gTR(), gTR(), gTR(), gTR(), gTR(), gTR()];

/* ----- study guide: the exit tickets and practice problems from Lessons 18, 19 and 20 ----- */
const dnum = (no, lab, skill, title, prompt, x, why, post) => g(no, lab, NUM({skill, title, prompt, why}, x, post ? {post} : null));
const dd = (a, b) => DVex(I(a), I(b));
const uf = (no, lab, a, b) => dnum(no, lab, 21, 'Divide', `${dd(a, b)} = ?`, mk(Q(a, b), a % b ? 'f' : 'i'), `Unknown factor: ${P(b)} · □ = ${N(a)}. ${(a < 0) !== (b < 0) && a ? 'Different signs → negative. ' : a ? 'Same signs → positive. ' : ''}The answer is <b>${showAns(mk(Q(a, b), a % b ? 'f' : 'i'))}</b>.`);
const f2d = (no, lab, p, q, neg, w) => { const v = (neg ? -1 : 1) * (w * q + p) / q, e = Math.abs(v); return dnum(no, lab, 22, 'Fraction → decimal', `Write ${neg ? '−' : ''}${w ? w : ''}${fr(p, q)} as a decimal.`, mk(Q(Math.round(v * 100000), 100000), 'd'), `Make the bottom a power of 10, or divide: ${w ? w * q + p : p} ÷ ${q} = <b>${N(e)}</b>${neg ? ' and the number is negative' : ''}.`); };
const d2f = (no, lab, dec, num, den, why) => dnum(no, lab, 22, 'Decimal → fraction', `Write <b>${dec}</b> as a fraction or mixed number in simplest form.`, mk(Q(num, den), 'f'), why);
const barItem = (no, lab, p, q, neg, extra) => { const c = barChoices(p, q, neg); return g(no, lab, MC({skill:23, title:'Bar notation', prompt:`Write ${sfr(p, q, neg)} as a decimal. Use bar notation where appropriate.`, choices:c.choices, answer:c.answer, layout:'g2', why:`Divide ${p} ÷ ${q}. The remainders repeat, so only the looping block gets the bar: <b>${c.right}</b>.`})); };

const GUIDE_D = [
  uf(1, 'Exit Ticket 18 #1a', -12, -3), uf(2, 'Exit Ticket 18 #1b', -10, 5), uf(3, 'Exit Ticket 18 #1c', 10, -4), uf(4, 'Exit Ticket 18 #1d', 3, 5),
  g(5, 'Exit Ticket 18 #2', {type:'multi', all:true, skill:21, title:'Choose all', prompt:`Which are equivalent to ${fr('−3', 4)}? Choose <b>all</b> that apply.`, choices:[fr('−3', 4), fr('−3', '−4'), fr(3, 4), fr(3, '−4'), `−(${fr(3, 4)})`, `−(${fr('−3', '−4')})`], correct:[0, 3, 4, 5], pick:1,
    why:'One negative sign in any spot makes −3/4. Two negatives, like −3/−4, make +3/4. And −(−3/−4) = −(3/4).'}),
  uf(6, 'Practice 18 #1', 20, 5), uf(7, 'Practice 18 #2', -90, 3), uf(8, 'Practice 18 #3', 54, -9), uf(9, 'Practice 18 #4', -77, -11),
  g(10, 'Practice 18 #5', {type:'multi', all:true, skill:21, title:'Choose all', prompt:`Which are equivalent to ${dd(-10, 5)}? Choose <b>all</b> that apply.`, choices:[fr('−10', '−5'), fr('−10', 5), fr(10, '−5'), fr(10, 5), `−(${fr(10, 5)})`], correct:[1, 2, 4], pick:1,
    why:'−10 ÷ 5 = −2. A single negative sign anywhere gives −2. Two negatives make +2, and 10/5 is +2.'}),
  uf(11, 'Practice 18 #6', 220, -22), uf(12, 'Practice 18 #7', -65, 13), uf(13, 'Practice 18 #8', -48, -12), uf(14, 'Practice 18 #9', 0, -30),
  g(15, 'Practice 18 #10', MC({skill:21, title:'Zero divisor', prompt:`${dd(-72, 0)} = ?`, choices:['0', '−72', 'Undefined', '1'], answer:2, layout:'g2', why:'What number times 0 makes −72? None. Dividing by zero is <b>undefined</b>.'})),
  dnum(16, 'Practice 18 #11a', 21, 'Evaluate', `Evaluate ${fr('a', 'b')} when a = −3 and b = 6.`, mk(Q(-3, 6), 'f'), '−3 ÷ 6 = <b>−1/2</b>.'),
  dnum(17, 'Practice 18 #11b', 21, 'Evaluate', `Evaluate ${fr('−a', 'b')} when a = −3 and b = 6.`, mk(Q(3, 6), 'f'), '−a = −(−3) = 3. Then 3 ÷ 6 = <b>1/2</b>.'),
  dnum(18, 'Practice 18 #11c', 21, 'Evaluate', `Evaluate ${fr('a', '−b')} when a = −3 and b = 6.`, mk(Q(3, 6), 'f'), '−b = −6. Then −3 ÷ (−6) = <b>1/2</b>.'),
  f2d(19, 'Practice 18 #12', 1, 4, false, 1), f2d(20, 'Practice 18 #13', 5, 4, false, 0), f2d(21, 'Practice 18 #14', 9, 10, false, 0), f2d(22, 'Practice 18 #15', 9, 100, false, 0),
  /* Lesson 19 */
  f2d(23, 'Exit Ticket 19 #1', 3, 10, false, 0), f2d(24, 'Exit Ticket 19 #2', 27, 1000, true, 0), f2d(25, 'Exit Ticket 19 #3', 4, 25, true, 0), f2d(26, 'Exit Ticket 19 #4', 7, 2, false, 0),
  dnum(27, 'Exit Ticket 19 #5', 22, 'Divide', `${dd(-50, -125)} = ?  Write it as a decimal.`, mk(Q(2, 5), 'd'), '−50 ÷ (−125): two negatives make a positive. 50/125 = 2/5 = <b>0.4</b>.'),
  d2f(28, 'Exit Ticket 19 #6', '0.83', 83, 100, '0.83 is 83 hundredths: <b>83/100</b>. It cannot be simplified.'),
  d2f(29, 'Exit Ticket 19 #7', '−0.8', -4, 5, '−0.8 = −8/10. Cancel a 2: <b>−4/5</b>.'),
  d2f(30, 'Practice 19 #1', '0.58', 29, 50, '58 hundredths = 58/100. Cancel a 2: <b>29/50</b>.'),
  d2f(31, 'Practice 19 #2', '−9.76', -244, 25, '−9 and 76/100. Cancel 4: <b>−9 19/25</b>.'),
  f2d(32, 'Practice 19 #3', 7, 100, false, 0), f2d(33, 'Practice 19 #4', 6420, 1000, false, 0), f2d(34, 'Practice 19 #5', 7, 25, true, 0), f2d(35, 'Practice 19 #6', 5, 8, true, 0),
  f2d(36, 'Practice 19 #7', 31, 20, false, 0), f2d(37, 'Practice 19 #8', 27, 60, true, 0), f2d(38, 'Practice 19 #9', 3, 8, false, 0), f2d(39, 'Practice 19 #10', 21, 40, true, 0),
  f2d(40, 'Practice 19 #11', 9, 16, true, 0), f2d(41, 'Practice 19 #12', 9, 40, false, 3),
  /* Lesson 20 */
  barItem(42, 'Exit Ticket 20 #1a', 1, 3, false), barItem(43, 'Exit Ticket 20 #1b', 2, 9, true),
  g(44, 'Exit Ticket 20 #2', MC({skill:23, title:'Who is right?', prompt:`Jonas says 0.838383… is the decimal for 0.8<span class="ol">3</span>. Maya says 0.8333… is. Who is correct?`, choices:['Maya. The bar is only over the 3, so only the 3 repeats.', 'Jonas. The bar means everything repeats.', 'Both are correct.', 'Neither is correct.'], answer:0, layout:'big', why:'The bar covers only the 3. So 0.8<span class="ol">3</span> = 0.8333…, which is Maya’s.'})),
  g(45, 'Practice 20 #1–6', {type:'rows', skill:23, title:'Stops or loops?', prompt:'Does the decimal form of each number stop or loop?', rows:[[5, 7, false, 1], [8, 3, true, 1], [5, 18, true, 1], [15, 8, false, 0], [40, 75, false, 1], [27, 60, true, 0]].map(([p, q, neg, loops]) => ({h:sfr(p, q, neg), opts:['🛑 Stops', '🔁 Loops'], a:loops})),
    why:'Simplify first: 40/75 = 8/15 and 27/60 = 9/20. Then factor the bottoms. 7, 3, 18 = 2·3·3 and 15 = 3·5 each have a 3 or a 7, so they loop. 8 and 20 have only 2s and 5s, so they stop.'}),
  barItem(46, 'Practice 20 #7', 4, 9, false), barItem(47, 'Practice 20 #8', 19, 15, false), barItem(48, 'Practice 20 #9', 43, 60, false), barItem(49, 'Practice 20 #10', 58, 99, true), barItem(50, 'Practice 20 #11', 7, 12, true), barItem(51, 'Practice 20 #12', 7, 24, true),
  g(52, 'Practice 20 #13', MC({skill:23, title:'Henry’s claim', prompt:'Henry says, “Every fraction with a denominator of 9 repeats, because 9 only has 3s as factors, not 2 or 5.” Do you agree?', choices:['Agree, but only when the fraction is in simplest form, because 3/9 = 1/3 still repeats and 9/9 = 1 does not.', 'Disagree. Some of them stop.', 'Agree. 9/9 repeats forever.', 'Disagree. Only denominators of 10 repeat.'], answer:0, layout:'big', why:'A fraction like 9/9 simplifies to 1, a whole number. In simplest form, any fraction with only 3s in the denominator loops, so Henry is right as long as the fraction does not simplify away the 3s.'})),
  g(53, 'Practice 20 #15', MC({skill:23, title:'Stops or loops?', prompt:`Does the decimal form of ${sfr(9, 6, true)} stop or loop?`, choices:['Stops. −9/6 = −3/2 and 2 is the only factor.', 'Loops. 6 has a factor of 3.', 'Loops. The top is bigger than the bottom.', 'Stops. 6 is even.'], answer:0, layout:'big', why:'Simplify first! −9/6 = −3/2. The bottom is 2, so it stops: −1.5.'}))
];
const PARTS_D = [['18', 'Lesson 18 · Negative divisors', 1, 22, 'Exit ticket and practice'], ['19', 'Lesson 19 · Fractions as decimals', 23, 41, 'Exit ticket and practice'], ['20', 'Lesson 20 · Stops or loops', 42, 53, 'Exit ticket and practice']];
