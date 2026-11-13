/* ---------- QUESTIONS ---------- */
const MC = o => Object.assign({type:'mc'}, o);
const shufMC = (o, correct, wrongs) => { const all = shuffle([correct, ...wrongs]); return MC(Object.assign(o, {choices:all, answer:all.indexOf(correct)})); };
const NUM = (o, q, extra) => Object.assign({type:'num', blanks:[Object.assign({answer:qv(q), show:MX(q)}, extra || {})]}, o);
/* wrong answers that are real, positive, and all different from the right one and each other */
const uniqVals = (right, list, n) => { const seen = [right], out = []; for (const w of list){ if (w && w.n > 0 && w.d > 0 && !seen.some(s => qeq(s, w))){ seen.push(w); out.push(w); } if (out.length === (n || 3)) break; } return out; };
const cap = s => s[0].toUpperCase() + s.slice(1);
const WHO = [['Miss Song','she'],['Mr. Diaz','he'],['Coach Lee','she'],['Grandpa Joe','he'],['Aunt Rosa','she'],['Mr. Patel','he']];

/* 1 · fair shares: a ÷ b = a/b */
const SHARE = [
  {k:'pizza', t:(a,b) => `🍕 <b>${a}</b> pizza${a > 1 ? 's are' : ' is'} shared equally by <b>${b}</b> friends.`, q:'How much pizza does each friend get?', post:'pizza', fig:true},
  {k:'juice', t:(a,b) => `🥤 A pitcher holds <b>${a}</b> cups of juice. It is poured equally into <b>${b}</b> glasses.`, q:'How many cups are in each glass?', post:'cups'},
  {k:'rope', t:(a,b) => `🪢 A rope <b>${a}</b> feet long is cut into <b>${b}</b> equal pieces.`, q:'How long is each piece?', post:'feet'},
  {k:'clay', t:(a,b) => `🏺 <b>${a}</b> pounds of clay are split equally into <b>${b}</b> lumps.`, q:'How much does each lump weigh?', post:'pounds'}
];
function g1(){
  const r = Math.random(); let a, b; do { a = rnd(1, 12); b = rnd(2, 9); } while (a % b === 0);
  if (r < .28) return NUM({skill:1, title:'Divide → fraction', prompt:`${EX(`${a} ÷ ${b}`)} = ?`, why:whyShare(a, b), kind:'num', chk:{e:`${a} ÷ ${b}`}}, Q(a, b));
  if (r < .55){
    const T = pick(SHARE); if (T.fig){ do { a = rnd(1, 8); b = rnd(2, 6); } while (a % b === 0); }
    return NUM({skill:1, title:'Share it', ctx:T.t(a, b), fig:T.fig ? pies(a, b) : null, prompt:T.q, why:whyShare(a, b), kind:'num', chk:{e:`${a} ÷ ${b}`}}, Q(a, b), {post:T.post});
  }
  if (r < .82){
    const s = Q(a, b), opts = [], add = (h, ok) => { if (!opts.some(o => o.h === h)) opts.push({h, ok}); };
    add(fr(a, b), true); add(`${a} ÷ ${b}`, true); add(fr(b, a), false); add(`${b} ÷ ${a}`, false);
    if (s.d !== b){ add(fr(s.n, s.d), true); add(fr(s.d, s.n), false); } else { add(fr(a * 2, b * 2), true); add(fr(b * 2, a * 2), false); }
    if (a > b) add(MX(s), true);
    const T = pick(SHARE.slice(1)), order = shuffle(opts.map((_, i) => i));
    return {type:'multi', all:true, pick:1, skill:1, title:'Choose all', ctx:T.t(a, b), prompt:`Which show the answer? ${T.q.replace('?', '')}. Choose <b>all</b> that apply.`, choices:order.map(i => opts[i].h), correct:order.map((i, j) => opts[i].ok ? j : -1).filter(j => j >= 0),
      why:whyShare(a, b) + ` Watch out: ${b} ÷ ${a} and ${fr(b, a)} flip it around.`, kind:'all', chk:{e:`${a} ÷ ${b}`}};
  }
  return Object.assign(shufMC({skill:1, title:'Fraction bar', prompt:`The fraction ${EX(fr(a, b))} means…`, layout:'g2', why:`The fraction bar means divide: ${fr(a, b)} = ${a} ÷ ${b}. The top is what you share. The bottom is how many share it.`}, `${a} ÷ ${b}`, [`${b} ÷ ${a}`, `${a} × ${b}`, `${a} + ${b}`]), {kind:'mcval', chk:{e:`${a} ÷ ${b}`}});
}

/* 2 · like units */
function g2(){
  const r = Math.random(), [a, b] = unlike(DEN, 40), L = lcm(a.d, b.d), A = up(a, L), B = up(b, L);
  if (r < .3){
    const k = rnd(2, 5), D = a.d * k;
    return {type:'num', skill:2, title:'Equivalent', prompt:`${EX(FR(a), '=', fr('?', D))}`, blanks:[{answer:a.n * k, show:String(a.n * k)}], why:`${a.d} × ${k} = ${D}, so multiply the top by ${k} too: ${a.n} × ${k} = ${a.n * k}. ${FR(a)} = <b>${fr(a.n * k, D)}</b>.`, kind:'eqv', chk:{n:a.n, d:a.d, D}};
  }
  const why = `${cap(unitName(a.d))} and ${unitName(b.d)} can both be cut into ${unitName(L)}: ${FR(a)} = ${fr(A, L)} and ${FR(b)} = ${fr(B, L)}.`;
  if (r < .55){
    const S = a.d + b.d, right = `${fr(A, L)} and ${fr(B, L)}`;
    const wrongs = [`${fr(a.n, S)} and ${fr(b.n, S)}`, `${fr(a.n, L)} and ${fr(b.n, L)}`, `${fr(a.n * L / b.d, L)} and ${fr(b.n * L / a.d, L)}`].filter((w, i, arr) => w !== right && arr.indexOf(w) === i);
    const pairs = [[A, L, B, L], [a.n, S, b.n, S], [a.n, L, b.n, L], [a.n * L / b.d, L, b.n * L / a.d, L]];
    return Object.assign(shufMC({skill:2, title:'Like units', prompt:`Rename ${EX(FR(a))} and ${EX(FR(b))} with like units. Which pair is right?`, why}, right, wrongs), {kind:'pairs', chk:{a:[a.n, a.d], b:[b.n, b.d], pairs}});
  }
  if (r < .8){
    const mkB = (p1, o1, p2, o2) => bars([{parts:p1, on:o1, col:PA}, {parts:p2, on:o2, col:PB}], {lw:0, bh:20, gap:8, w:300});
    return Object.assign(shufMC({skill:2, title:'Models', prompt:`Which model shows ${EXs(FR(a))} and ${EXs(FR(b))} cut into like units?`, layout:'viz', why: why + bars([{parts:L, on:A, col:PA, lab:a, cut:L / a.d}, {parts:L, on:B, col:PB, lab:b, cut:L / b.d}])},
      mkB(L, A, L, B), [mkB(a.d + b.d, a.n, a.d + b.d, b.n), mkB(a.d, a.n, b.d, b.n), mkB(L, a.n, L, b.n)]), {kind:'bars', chk:{a:[a.n, a.d], b:[b.n, b.d]}});
  }
  const cands = shuffle([a.d + b.d, Math.max(a.d, b.d) + 1, L + 1, 2 * L - 1, a.d * b.d - 1, L + a.d]).filter((x, i, arr) => x > 2 && x < 100 && (x % a.d || x % b.d) && arr.indexOf(x) === i).slice(0, 3);
  const vals = shuffle([L, ...cands]);
  return MC({skill:2, title:'Pick a unit', prompt:`${cap(unitName(a.d))} and ${unitName(b.d)}: which unit can <b>both</b> be cut into?`, choices:vals.map(unitName), answer:vals.indexOf(L), layout:'g2', why:`${L} is a multiple of both: ${a.d} × ${L / a.d} = ${L} and ${b.d} × ${L / b.d} = ${L}. The others are not.`, kind:'unit', chk:{d1:a.d, d2:b.d, vals}});
}

/* 3 · add fractions */
function g3(){
  const r = Math.random();
  if (r < .38){ const [a, b] = unlike(DEN, 24); return NUM({skill:3, title:'Add', prompt:`${EX(FR(a), '+', FR(b))} = ?`, why:whyAdd(a, b), kind:'num', chk:{e:`${MXt(a)} + ${MXt(b)}`}}, qadd(a, b)); }
  if (r < .56){
    const [a, b] = unlike([2,3,4,5,6,7,8,9,10], 60), s = qadd(a, b);
    const wrongs = uniqVals(s, [Q(a.n + b.n, a.d + b.d), Q(s.d, s.n), Q(s.n, a.d + b.d), Q(a.n * b.n, a.d * b.d), Q(s.n + 1, s.d)]).map(FR);
    return Object.assign(shufMC({skill:3, title:'Evaluate', prompt:`Evaluate. ${EX(`(${a.n} ÷ ${a.d})`, '+', `(${b.n} ÷ ${b.d})`)}`, layout:'g2', why:`${a.n} ÷ ${a.d} = ${fr(a.n, a.d)} and ${b.n} ÷ ${b.d} = ${fr(b.n, b.d)}. ` + whyAdd(a, b)}, FR(s), wrongs), {kind:'mcval', chk:{e:`(${a.n} ÷ ${a.d}) + (${b.n} ÷ ${b.d})`}});
  }
  if (r < .8){
    const [a, b] = unlike([2,3,4,5,6], 30), T = qadd(a, b), L = lcm(a.d, b.d);
    return {type:'boxes', skill:3, title:'Build it', prompt:`Put one number in each box to make the sum.`, target:T, tiles:[1,2,3,4,5,6], sol:[a.n, a.d, b.n, b.d], show:`${fr(a.n, a.d)} + ${fr(b.n, b.d)}`,
      why:`One way: ${fr(a.n, a.d)} + ${fr(b.n, b.d)} = ${fr(up(a, L), L)} + ${fr(up(b, L), L)} = ${FR(T)}. Other pairs can work too.`, kind:'boxes', chk:{t:[T.n, T.d]}};
  }
  const [a, b] = unlike(DEN, 24), s = qadd(a, b), L = lcm(a.d, b.d);
  const wrongs = uniqVals(s, [Q(a.n + b.n, a.d + b.d), Q(up(a, L) + up(b, L), 2 * L), qadd(s, Q(1, L)), Q(a.n + b.n, L)]).map(MX);
  return Object.assign(shufMC({skill:3, title:'Add', prompt:`${EX(FR(a), '+', FR(b))} = ?`, layout:'g2', why:whyAdd(a, b) + ` (Adding the bottoms would give ${fr(a.n + b.n, a.d + b.d)}. That is a trap!)`}, MX(s), wrongs), {kind:'mcval', chk:{e:`${MXt(a)} + ${MXt(b)}`}});
}

/* 4 · subtract fractions */
function g4(){
  const r = Math.random(), maxL = r >= .5 && r < .78 ? 12 : 24; let a, b;
  do { [a, b] = unlike(DEN, maxL); if (qcmp(a, b) < 0) [a, b] = [b, a]; } while (!qcmp(a, b));
  const L = lcm(a.d, b.d), A = up(a, L), B = up(b, L), dif = qsub(a, b), chk = {e:`${MXt(a)} − ${MXt(b)}`};
  if (r < .5) return NUM({skill:4, title:'Subtract', prompt:`${EX(FR(a), '−', FR(b))} = ?`, why:whySub(a, b), kind:'num', chk}, dif);
  if (r < .78) return NUM({skill:4, title:'Use the model', prompt:`Use the model to find ${EX(FR(a), '−', FR(b))}`, fig:bars([{parts:L, on:A, col:PA, lab:a, cut:L / a.d}, {parts:L, on:B, col:PB, lab:b, cut:L / b.d}]), why:whySub(a, b) + bars([{parts:L, on:A, col:PA, lab:a, cross:[A - B, A]}]), kind:'num', chk}, dif);
  const wrongs = uniqVals(dif, [Q(Math.abs(a.n - b.n), Math.abs(a.d - b.d)), Q(A + B, L), Q(A - B, 2 * L), qadd(dif, Q(1, L))]).map(MX);
  return Object.assign(shufMC({skill:4, title:'Subtract', prompt:`${EX(FR(a), '−', FR(b))} = ?`, layout:'g2', why:whySub(a, b)}, MX(dif), wrongs), {kind:'mcval', chk});
}

/* 5 · add mixed numbers */
function g5(){
  const r = Math.random();
  if (r < .58){
    const want = Math.random() < .5; let a, b;
    for (let t = 0; t < 300; t++){ const [f1, f2] = unlike(DEN, 24), L = lcm(f1.d, f2.d); a = qadd(Q(rnd(1, 6)), f1); b = qadd(Q(rnd(1, 6)), f2); if ((up(f1, L) + up(f2, L) >= L) === want) break; }
    return NUM({skill:5, title:'Add mixed numbers', prompt:`${EX(MX(a), '+', MX(b))} = ?`, why:whyAddMixed([a, b]), kind:'num', chk:{e:`${MXt(a)} + ${MXt(b)}`}}, qadd(a, b));
  }
  if (r < .85){
    const fam = pick([[2,3,6],[2,4,8],[2,4],[3,6],[2,5,10],[2,3]]), den = fam.reduce(lcm, 1); let xs, tot, fig;
    for (let t = 0; t < 300; t++){ xs = [0,1,2].map(() => rmixed(fam, 0, 2)); tot = xs.reduce(qadd, Q(0)); fig = fitLine([tot], den, {pts:[{x:xs[0], t:'start', c:'var(--w)'}], arr:[{a:xs[0], b:qadd(xs[0], xs[1]), t:xs[1]}, {a:qadd(xs[0], xs[1]), b:tot, t:xs[2]}]}); if (fig) break; }
    return NUM({skill:5, title:'Jump along', prompt:`${EX(MX(xs[0]), '+', MX(xs[1]), '+', MX(xs[2]))} = ?`, fig, why:whyAddMixed(xs), kind:'num', chk:{e:xs.map(MXt).join(' + ')}}, tot);
  }
  const [f1, f2] = unlike(DEN, 24), a = qadd(Q(rnd(1, 5)), f1), b = qadd(Q(rnd(1, 5)), f2), s = qadd(a, b), L = lcm(f1.d, f2.d), P = up(f1, L) + up(f2, L), W = whole(a) + whole(b);
  const wrongs = uniqVals(s, [Q(P, L), P >= L ? Q(W * L + P - L, L) : qadd(Q(W), Q(f1.n + f2.n, f1.d + f2.d)), qadd(s, Q(1)), qsub(s, Q(1, L))]).map(MX);
  return Object.assign(shufMC({skill:5, title:'Add mixed numbers', prompt:`${EX(MX(a), '+', MX(b))} = ?`, layout:'g2', why:whyAddMixed([a, b])}, MX(s), wrongs), {kind:'mcval', chk:{e:`${MXt(a)} + ${MXt(b)}`}});
}

/* 6 · subtract mixed numbers (rename a whole) */
function g6(){
  const r = Math.random();
  const pickSub = want => { let a, b; for (let t = 0; t < 400; t++){ const [f1, f2] = unlike(DEN, 24), L = lcm(f1.d, f2.d); a = qadd(Q(rnd(3, 9)), f1); b = qadd(Q(rnd(1, whole(a) - 1)), f2); if ((up(f1, L) < up(f2, L)) === want) break; } return [a, b]; };
  if (r < .55){ const [a, b] = pickSub(Math.random() < .75); return NUM({skill:6, title:'Subtract mixed numbers', prompt:`${EX(MX(a), '−', MX(b))} = ?`, why:whySubMixed(a, b), kind:'num', chk:{e:`${MXt(a)} − ${MXt(b)}`}}, qsub(a, b)); }
  if (r < .72){ const W = rnd(3, 10), b = rmixed(DEN, 1, W - 1); return NUM({skill:6, title:'Whole minus mixed', prompt:`${EX(W, '−', MX(b))} = ?`, why:whySubMixed(Q(W), b), kind:'num', chk:{e:`${W} − ${MXt(b)}`}}, qsub(Q(W), b)); }
  if (r < .88){
    let a, b, c, L;
    for (let t = 0; t < 400; t++){ a = rmixed([2,3,4,5,6], 3, 8); b = qadd(Q(1), rfrac([2,3,4,5,6,8,10])); c = rmixed([2,3,4,5,6,10], 1, 6); L = [a, b, c].reduce((l, x) => lcm(l, x.d), 1); if (L <= 60 && qcmp(a, b) > 0) break; }
    const v1 = qsub(a, b), tot = qadd(v1, c);
    return NUM({skill:6, title:'Parentheses first', prompt:`${EX(`(${MX(a)} − ${fr(b.n, b.d)})`, '+', MX(c))} = ?`, why:`Parentheses first. ${fr(b.n, b.d)} = ${MX(b)}. ` + whySubMixed(a, b).replace('Answer:', 'That makes') + ` Then add ${MX(c)}: ` + whyAddMixed([v1, c]), kind:'num', chk:{e:`(${MXt(a)} − ${b.n}/${b.d}) + ${MXt(c)}`}}, tot);
  }
  const [a, b] = pickSub(true), L = lcm(a.d, b.d), wa = whole(a), wb = whole(b), pa = up(part(a), L), pb = up(part(b), L);
  const right = Q((wa - 1) * L + pa + L, L), opts = [[wa - 1, pa + L], [wa, pa + L], [wa - 1, pa], [wa - 1, pa + (L === 10 ? 1 : 10)]];
  const choices = opts.map(([w, p]) => MXL(w, p, L)), order = shuffle([0,1,2,3]);
  return MC({skill:6, title:'Rename a whole', ctx:`Like units: ${EXs(MXL(wa, pa, L), '−', MXL(wb, pb, L))}`, prompt:`There are not enough ${unitName(L)} to take away ${pb}. Rename ${EXs(MXL(wa, pa, L))} as…`, choices:order.map(i => choices[i]), answer:order.indexOf(0), layout:'g2',
    why:`Trade 1 whole for ${fr(L, L)}: ${wa} − 1 = ${wa - 1} wholes, and ${pa} + ${L} = ${pa + L} ${unitName(L)}. So ${MXL(wa, pa, L)} = <b>${MXL(wa - 1, pa + L, L)}</b>.`, kind:'rename', chk:{a:[a.n, a.d], vals:order.map(i => [opts[i][0] * L + opts[i][1], L])}});
}

/* 7 · estimate and compare */
const HALF = Q(1, 2), BENCH = ['Close to 0','Close to ½','Close to 1'], DS = [3,4,5,6,8,10,12];
const lessHalf = () => { let f; do f = rfrac(DS); while (qcmp(f, HALF) >= 0); return f; };
const moreHalf = () => { let f; do f = rfrac(DS); while (qcmp(f, HALF) <= 0); return f; };
const ITEMS = [['the gold chain','the silver chain','in.'],['the red ribbon','the blue ribbon','in.'],['Mia’s rope','Leo’s rope','ft'],['the purple yarn','the green yarn','yd']];
function g7(){
  const r = Math.random();
  if (r < .3){
    let f, near; for (;;){ f = rfrac([3,4,5,6,7,8,9,10,12]); const v = qv(f), ds = [v, Math.abs(v - .5), 1 - v]; near = ds.indexOf(Math.min(...ds)); const s = ds.slice().sort((x, y) => x - y); if (s[1] - s[0] >= 1 / 12 - 1e-9) break; }
    const why = near === 0 ? `${f.n} is much less than half of ${f.d} (${half(f.d)}), so ${FR(f)} is close to 0.` : near === 1 ? `${f.n} is close to half of ${f.d} (${half(f.d)}), so ${FR(f)} is close to ½.` : `${f.n} is almost all of ${f.d}, so ${FR(f)} is close to 1.`;
    return MC({skill:7, title:'Benchmark', prompt:`Is ${EX(FR(f))} closest to 0, ½, or 1?`, choices:BENCH, answer:near, why:why + nlF({min:0, max:1, den:f.d, pts:[{x:f, c:'var(--x)'}]}), kind:'bench', chk:{f:[f.n, f.d]}});
  }
  if (r < .56){
    const [n1, n2, unit] = pick(ITEMS), W = rnd(2, 5), lowFirst = Math.random() < .5;
    const mk = (fn) => { const wa = rnd(0, W); return [qadd(Q(wa), fn()), qadd(Q(W - wa), fn())]; };
    const low = mk(lessHalf), high = mk(moreHalf), sets = lowFirst ? [low, high] : [high, low], win = lowFirst ? 1 : 0, names = [n1, n2], wn = names[win], ln = names[1 - win];
    const list = s => s.map(x => `<b>${MX(x)}</b> ${unit}`).join(' and ');
    const right = `${cap(wn)} is longer. Both have ${W} wholes, but the fractions in ${wn} are each more than ½, so together they make more than 1. The fractions in ${ln} are each less than ½.`;
    const wrongs = [`${cap(ln)} is longer. Its fractions have bigger bottom numbers, so they are bigger pieces.`, `They are the same, because both have ${W} wholes.`, `You can’t tell without adding them all.`];
    return Object.assign(shufMC({skill:7, title:'Compare', ctx:`⛓️ ${cap(n1)}: ${list(sets[0])}<br>⛓️ ${cap(n2)}: ${list(sets[1])}`, prompt:'Without finding the actual sums, which is longer in all?', why:right}, right, wrongs), {kind:'cmp', chk:{sets:sets.map(s => s.map(x => [x.n, x.d])), names, win}});
  }
  if (r < .78){
    const less = Math.random() < .5; let a, b; do { a = less ? lessHalf() : moreHalf(); b = less ? lessHalf() : moreHalf(); } while (a.d === b.d);
    return MC({skill:7, title:'More or less than 1?', prompt:`Without adding: is ${EX(FR(a), '+', FR(b))} more or less than 1?`, choices:['Less than 1','More than 1'], answer:less ? 0 : 1, layout:'g2', why:`${FR(a)} and ${FR(b)} are both ${less ? 'less' : 'more'} than ½, so the sum is ${less ? 'less' : 'more'} than ½ + ½ = 1. (It is ${MX(qadd(a, b))}.)`, kind:'vs1', chk:{a:[a.n, a.d], b:[b.n, b.d]}});
  }
  const near = () => { let f; do f = rfrac([4,5,6,8,10,12]); while (qcmp(f, Q(1, 4)) > 0 && qcmp(f, Q(3, 4)) < 0); return f; };
  let a, b, est; for (;;){ a = qadd(Q(rnd(1, 7)), near()); b = qadd(Q(rnd(1, 7)), near()); est = Math.round(qv(a)) + Math.round(qv(b)); if (Math.abs(qv(qadd(a, b)) - est) < .5 - 1e-9) break; }
  const vals = shuffle([est, est + 1, est - 1, est + 2]);
  return MC({skill:7, title:'Estimate', prompt:`${EX(MX(a), '+', MX(b))} is about…`, choices:vals.map(v => 'about ' + v), answer:vals.indexOf(est), layout:'g2', why:`${MX(a)} is close to ${Math.round(qv(a))} and ${MX(b)} is close to ${Math.round(qv(b))}. ${Math.round(qv(a))} + ${Math.round(qv(b))} = <b>${est}</b>. (Exact: ${MX(qadd(a, b))}.)`, kind:'est', chk:{a:[a.n, a.d], b:[b.n, b.d], vals}});
}

/* 8 · story problems */
function g8(){
  const t = pick(['board','chili','cheese','left','share','more']), [who, pr] = pick(WHO);
  if (t === 'board'){
    let L, k; do { L = rnd(7, 20); k = rnd(2, 5); } while (L % k === 0);
    const [item, unit] = pick([['board','feet'],['rope','feet'],['pipe','feet'],['ribbon','yards']]), x = rmixed([2,3,4,6], 0, 1), each = Q(L, k), ans = qadd(each, x);
    return NUM({skill:8, title:'Cut and add', tpl:t, ctx:`${who} cuts a ${item} that is <b>${L} ${unit}</b> long into <b>${k}</b> equal pieces. Then ${pr} realizes each piece needs to be <b>${MX(x)} ${unit}</b> longer.`, prompt:'How long does each piece need to be?',
      why:`Step 1: each piece is ${L} ÷ ${k} = ${fr(L, k)} = ${MX(each)} ${unit}. Step 2: add ${MX(x)}. ` + whyAddMixed([each, x]), kind:'story', chk:{e:`${L} ÷ ${k} + ${MXt(x)}`}}, ans, {post:unit});
  }
  if (t === 'chili'){
    const [n, dish, ing, unit] = pick([['Lacy','chili','beans','pounds'],['Omar','soup','carrots','cups'],['Priya','muffins','flour','cups'],['Ben','trail mix','nuts','cups'],['Ava','salsa','tomatoes','pounds']]);
    let A, x, H, tot; do { A = rmixed([2,4,8], 1, 4); x = rfrac([2,4,8]); tot = qadd(A, qadd(A, x)); H = rmixed([2,4,8], 1, 3); } while (qcmp(H, qsub(tot, HALF)) >= 0);
    const second = qadd(A, x), need = qsub(tot, H);
    return NUM({skill:8, title:'Two steps', tpl:t, ctx:`${n} makes two kinds of ${dish}.<br>• The first kind uses <b>${MX(A)}</b> ${unit} of ${ing}.<br>• The second kind uses <b>${MX(x)}</b> ${unit} more ${ing} than the first kind.<br>• ${n} has <b>${MX(H)}</b> ${unit} of ${ing}.`, prompt:`How many more ${unit} of ${ing} does ${n} need?`,
      why:`Step 1: second kind = ${MX(A)} + ${MX(x)} = ${MX(second)}. Step 2: both kinds = ${MX(A)} + ${MX(second)} = ${MX(tot)}. Step 3: ${MX(tot)} − ${MX(H)} = <b>${MX(need)}</b> ${unit} more.`, kind:'story', chk:{e:`${MXt(A)} + ${MXt(A)} + ${MXt(x)} − ${MXt(H)}`}}, need, {post:unit});
  }
  if (t === 'cheese'){
    const fam = pick([[2,3,6],[2,4,8],[2,4],[3,6],[2,5,10]]), den = fam.reduce(lcm, 1), [p1, p2, p3] = shuffle(['Kelly','Riley','Lisa','Sam','Noor','Eli']), what = pick(['cheese','grapes','apples','popcorn']);
    let xs, tot, fig; for (let k = 0; k < 300; k++){ xs = [0,1,2].map(() => rmixed(fam, 1, 2)); tot = xs.reduce(qadd, Q(0)); fig = fitLine([tot], den, {arcLab:false, pts:[{x:xs[0], c:'var(--w)'}], arr:[{a:xs[0], b:qadd(xs[0], xs[1])}, {a:qadd(xs[0], xs[1]), b:tot}]}); if (fig) break; }
    return NUM({skill:8, title:'Altogether', tpl:t, ctx:`Three friends bring ${what} to a party. ${p1} brings <b>${MX(xs[0])}</b> pounds, ${p2} brings <b>${MX(xs[1])}</b> pounds, and ${p3} brings <b>${MX(xs[2])}</b> pounds.`, fig, prompt:'How many pounds do they bring altogether?', why:whyAddMixed(xs), kind:'story', chk:{e:xs.map(MXt).join(' + ')}}, tot, {post:'pounds'});
  }
  if (t === 'left'){
    let R, u1, u2; do { R = rmixed([2,3,4,6,8], 4, 8); u1 = rmixed([2,3,4,6,8], 1, 2); u2 = rfrac([2,3,4,6,8]); } while (qcmp(qadd(u1, u2), qsub(R, Q(1))) >= 0 || lcm(lcm(R.d, u1.d), u2.d) > 24);
    const left = qsub(qsub(R, u1), u2);
    return NUM({skill:8, title:'How much is left?', tpl:t, ctx:`${who} has <b>${MX(R)}</b> yards of ribbon. ${cap(pr)} uses <b>${MX(u1)}</b> yards for a bow and <b>${MX(u2)}</b> yard for a gift tag.`, prompt:'How much ribbon is left?', why:`Take away both: ${MX(R)} − ${MX(u1)} = ${MX(qsub(R, u1))}. Then ${MX(qsub(R, u1))} − ${MX(u2)} = <b>${MX(left)}</b> yards.`, kind:'story', chk:{e:`${MXt(R)} − ${MXt(u1)} − ${MXt(u2)}`}}, left, {post:'yards'});
  }
  if (t === 'share'){
    let N0, k; do { N0 = rnd(3, 10); k = rnd(2, 6); } while (N0 % k === 0);
    const x = rfrac([2,3,4,6,8]), each = Q(N0, k), ans = qadd(each, x);
    return NUM({skill:8, title:'Share, then add', tpl:t, ctx:`<b>${N0}</b> cups of lemonade are poured equally into <b>${k}</b> glasses. Then ${who} adds <b>${MX(x)}</b> cup of water to each glass.`, prompt:'How many cups are in each glass now?', why:`Step 1: ${whyShare(N0, k)} Step 2: ${MX(each)} + ${MX(x)}. ` + whyAddMixed([each, x]), kind:'story', chk:{e:`${N0} ÷ ${k} + ${MXt(x)}`}}, ans, {post:'cups'});
  }
  let a, b; do { a = rmixed([2,3,4,5,6,8,10], 1, 5); b = rmixed([2,3,4,5,6,8,10], 1, 5); } while (!qcmp(a, b) || a.d === b.d || lcm(a.d, b.d) > 24);
  const big = qcmp(a, b) > 0 ? a : b, small = big === a ? b : a, day = big === a ? 'Monday' : 'Tuesday';
  return NUM({skill:8, title:'How much farther?', tpl:t, ctx:`${who} runs <b>${MX(a)}</b> miles on Monday and <b>${MX(b)}</b> miles on Tuesday.`, prompt:`How much farther does ${pr} run on ${day}?`, why:`Farther means subtract: ${MX(big)} − ${MX(small)}. ` + whySubMixed(big, small), kind:'story', chk:{e:`${MXt(big)} − ${MXt(small)}`}}, qsub(big, small), {post:'miles'});
}

/* 9 · mistake detective */
const DET = ['Added the denominators','Forgot the whole numbers','Didn’t rename a whole first','Flipped the division','Nothing! The work is right'];
const DETK = ['den','whole','rename','flip','ok'];
function detCase(type){
  const [who] = pick(WHO), ok = type === 'ok', base = ok ? pick(['den','whole','rename','flip']) : type;
  if (base === 'den'){
    const [a, b] = unlike(DEN, 24), L = lcm(a.d, b.d), A = up(a, L), B = up(b, L), s = qadd(a, b);
    return {who, lines:[`${FR(a)} + ${FR(b)}`, `= ${fr(A, L)} + ${fr(B, L)}`, ok ? `= ${fr(A + B, L)}` : `= ${fr(A + B, 2 * L)}`], fin:ok ? Q(A + B, L) : Q(A + B, 2 * L), right:s, e:`${MXt(a)} + ${MXt(b)}`,
      why:ok ? `Every line checks out: ${fr(A, L)} + ${fr(B, L)} = ${fr(A + B, L)}.` : `Line 3 added the denominators. ${cap(unitName(L))} plus ${unitName(L)} are still ${unitName(L)}: ${fr(A, L)} + ${fr(B, L)} = <b>${MX(s)}</b>.`};
  }
  if (base === 'whole'){
    let a, b, L, P; do { const [f1, f2] = unlike(DEN, 24); L = lcm(f1.d, f2.d); a = qadd(Q(rnd(1, 6)), f1); b = qadd(Q(rnd(1, 6)), f2); P = up(f1, L) + up(f2, L); } while (P >= L);
    const s = qadd(a, b), W = whole(a) + whole(b);
    return {who, lines:[`${MX(a)} + ${MX(b)}`, `= ${MXL(whole(a), up(part(a), L), L)} + ${MXL(whole(b), up(part(b), L), L)}`, ok ? `= ${MXL(W, P, L)}` : `= ${fr(P, L)}`], fin:ok ? s : Q(P, L), right:s, e:`${MXt(a)} + ${MXt(b)}`,
      why:ok ? `Wholes ${whole(a)} + ${whole(b)} = ${W}, fractions ${fr(P, L)}. Right!` : `The fractions are right, but the wholes ${whole(a)} + ${whole(b)} = ${W} went missing. The answer is <b>${MX(s)}</b>.`};
  }
  if (base === 'rename'){
    let a, b, L, pa, pb; do { const [f1, f2] = unlike(DEN, 24); L = lcm(f1.d, f2.d); a = qadd(Q(rnd(3, 9)), f1); b = qadd(Q(rnd(1, whole(a) - 1)), f2); pa = up(f1, L); pb = up(f2, L); } while (pa >= pb);
    const wa = whole(a), wb = whole(b), s = qsub(a, b);
    return {who, lines:[`${MX(a)} − ${MX(b)}`, `= ${MXL(wa, pa, L)} − ${MXL(wb, pb, L)}`, ok ? `= ${MXL(wa - 1, pa + L, L)} − ${MXL(wb, pb, L)}` : `= ${MXL(wa - wb, pb - pa, L)}`].concat(ok ? [`= ${MXL(wa - 1 - wb, pa + L - pb, L)}`] : []), fin:ok ? s : Q((wa - wb) * L + pb - pa, L), right:s, e:`${MXt(a)} − ${MXt(b)}`,
      why:ok ? `${fr(pa, L)} is too small, so 1 whole was renamed. Every line checks out.` : `${fr(pa, L)} is less than ${fr(pb, L)}, so the last line took ${pa} from ${pb} instead. Rename first: ${MXL(wa, pa, L)} = ${MXL(wa - 1, pa + L, L)}. The answer is <b>${MX(s)}</b>.`};
  }
  let N0, k; do { N0 = rnd(3, 12); k = rnd(2, 8); } while (N0 === k || N0 % k === 0 || k % N0 === 0);
  return {who, ctx:`<b>${N0}</b> cups of water are poured equally into <b>${k}</b> glasses. How much is in each glass?`, lines:ok ? [`${N0} ÷ ${k}`, `= ${fr(N0, k)}`] : [`${k} ÷ ${N0}`, `= ${fr(k, N0)}`], fin:ok ? Q(N0, k) : Q(k, N0), right:Q(N0, k), e:`${N0} ÷ ${k}`,
    why:ok ? `${N0} cups shared by ${k} glasses is ${N0} ÷ ${k} = ${fr(N0, k)}. Right!` : `It should be cups ÷ glasses: ${N0} ÷ ${k} = <b>${MX(Q(N0, k))}</b>. ${N0 > k ? 'More cups than glasses, so each glass gets more than 1 cup.' : 'Fewer cups than glasses, so each glass gets less than 1 cup.'}`};
}
function g9(){
  const type = pick(['den','den','whole','rename','rename','flip','ok']), c = detCase(type);
  const work = `${c.ctx ? `<div>${c.ctx}</div>` : ''}<div class="work" style="font-size:16px"><div class="hint">🕵️ ${c.who}’s work</div>${c.lines.map((l, i) => `<div>Line ${i + 1}: ${l}</div>`).join('')}</div>`;
  if (type !== 'ok' && Math.random() < .3) return NUM({skill:9, title:'Fix it', ctx:work, prompt:'Something is wrong. What is the right answer?', why:c.why, kind:'num', chk:{e:c.e}}, c.right);
  return MC({skill:9, title:'What went wrong?', ctx:work, prompt:'What went wrong?', choices:DET, answer:DETK.indexOf(type), why:c.why, kind:'det', chk:{type, e:c.e, fin:[c.fin.n, c.fin.d]}});
}

const GENS = {1:g1, 2:g2, 3:g3, 4:g4, 5:g5, 6:g6, 7:g7, 8:g8, 9:g9};
const buildBossC = () => [g1(), g1(), g2(), g3(), g3(), g4(), g4(), g5(), g5(), g6(), g6(), g7(), g8(), g8(), g9()];
