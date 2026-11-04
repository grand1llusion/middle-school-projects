/* ---------- QUESTIONS ---------- */
const MC = o => Object.assign({type:'mc'}, o);
const shufMC = (o, correct, wrongs) => { const all = shuffle([correct, ...wrongs]); return MC(Object.assign(o, {choices:all, answer:all.indexOf(correct)})); };
const NUM = (o, x, extra) => Object.assign({type:'num', blanks:[Object.assign({answer:qv(x.q), show:showAns(x)}, extra || {})]}, o);
const K3 = () => pick(['i','d','d','f','f']);
const POSC = 'var(--pos)', NEGC = 'var(--neg)', GRAYC = 'var(--mut)';
const hopColor = x => isNeg(x) ? NEGC : POSC;
/* a number-line model of a op b, drawn as two hops */
const model = (a, b, op, range) => nline(Object.assign({min:-10, max:10, tick:1, lab:2}, range || {}, {arr:[{a:0, b:qv(a.q), c:GRAYC}, {a:qv(a.q), b:qv(a.q) + (op === '+' ? 1 : -1) * qv(b.q), c:op === '+' ? hopColor(b) : hopColor(neg(b))}]}));

/* 1 · number line hops */
function gLine(){
  const half = Math.random() < .3, kind = half ? 'f' : 'i', unit = half ? 2 : 1, op = Math.random() < .7 ? '+' : '−';
  let a, b, e;
  do { a = mk(Q(rnd(-8*unit, 8*unit), unit), kind); b = mk(Q(rnd(-8*unit, 8*unit), unit), kind); e = op === '+' ? plus(a,b) : minus(a,b); }
  while (!a.q.n || !b.q.n || Math.abs(qv(e.q)) > 10 || !e.q.n);
  if (half){ a.k = b.k = e.k = 'd'; }
  if (Math.random() < .4 && !half && Math.abs(qv(a.q)) <= 5 && Math.abs(qv(b.q)) <= 5){
    const s = op === '+' ? 1 : -1, av = qv(a.q), bv = qv(b.q), ev = qv(e.q);
    const right = nline({min:-10,max:10,tick:1,lab:2,arr:[{a:0,b:av,c:GRAYC},{a:av,b:ev,c:ev > av ? POSC : NEGC}]});
    const wrong = [[{a:0,b:av,c:GRAYC},{a:av,b:av - s*bv,c:-s*bv > 0 ? POSC : NEGC}], [{a:0,b:-av,c:GRAYC},{a:-av,b:-av + s*bv,c:s*bv > 0 ? POSC : NEGC}], [{a:0,b:av,c:GRAYC},{a:0,b:s*bv,c:s*bv > 0 ? POSC : NEGC}]].map(arr => nline({min:-10,max:10,tick:1,lab:2,arr}));
    return Object.assign(shufMC({skill:1, title:'Number line', prompt:`Which model shows ${EX([a,b],[op])}?`, layout:'viz', why:`Start at ${fmt(a)} (gray hop from 0). ${op === '+' ? 'Adding' : 'Subtracting'} ${par(b)} moves ${ev > av ? 'right' : 'left'} ${fmt(size(b))}. You land on <b>${fmt(e)}</b>.`}, right, wrong), {val:qv(e.q)});
  }
  return NUM({skill:1, title:'Number line', prompt:`${EX([a,b],[op])} = ?`, fig:nline({min:-10,max:10,tick:1,lab:2,pts:[{x:qv(a.q), t:'start', c:'var(--x)'}]}), why:`Start at ${fmt(a)}. ${op === '+' ? (isNeg(b) ? 'Adding a negative' : 'Adding a positive') : (isNeg(b) ? 'Subtracting a negative' : 'Subtracting a positive')} moves ${qv(e.q) > qv(a.q) ? 'right ➡️' : 'left ⬅️'} ${fmt(size(b))}. You land on <b>${fmt(e)}</b>.` + model(a, b, op)}, e);
}

/* 2 · distance between two points */
function gDist(){
  if (Math.random() < .65){
    const quarter = Math.random() < .6; let A, B;
    do { A = quarter ? rnd(-11, 11) / 4 : rnd(-9, 9); B = quarter ? rnd(-11, 11) / 4 : rnd(-9, 9); } while (Math.abs(A - B) < (quarter ? .5 : 2) || A === 0 || B === 0);
    if (A > B) [A, B] = [B, A];
    const d = mk(Q(Math.round((B - A) * 4), 4), quarter ? 'd' : 'i'), side = A < 0 && B > 0;
    const fig = quarter ? nline({min:-3, max:3, tick:.25, lab:.5, fs:9.5, pts:[{x:A, t:'A', c:POSC},{x:B, t:'B', c:NEGC}]}) : nline({min:-10, max:10, tick:1, lab:2, pts:[{x:A, t:'A', c:POSC},{x:B, t:'B', c:NEGC}]});
    return NUM({skill:2, title:'Distance', prompt:'What is the distance between point A and point B?', fig, why:`A is at ${N(A)} and B is at ${N(B)}. ${side ? `They are on opposite sides of 0, so add their distances from 0: ${N(-A)} + ${N(B)}` : `Subtract: ${N(B)} − ${A < 0 ? '(' + N(A) + ')' : N(A)}`} = <b>${fmt(d)}</b>. Distance is never negative.`}, d, {post:'units'});
  }
  const kind = pick(['d','f']); let a, b;
  [a, b] = pair(kind, sgn(), sgn(), 9);
  const d = size(minus(b, a));
  return NUM({skill:2, title:'Distance', ctx:`Point A is at <b>${fmt(a)}</b>. Point B is at <b>${fmt(b)}</b>.`, prompt:'How far apart are A and B?', why:`Distance = the size of B − A: ${fmt(b)} − ${par(a)} = ${fmt(minus(b,a))}. Distance is never negative: <b>${fmt(d)}</b>.`}, d, {post:'units'});
}

/* 3 · same signs */
function gSame(){
  const k = K3(), s = Math.random() < .75 ? -1 : 1, [a, b] = pair(k, s, s), e = plus(a,b);
  return NUM({skill:3, title:'Same signs', prompt:`${EX([a,b],['+'])} = ?`, why:whyAdd(a,b)}, e);
}

/* 4 · opposite signs */
function gOpp(){
  const k = K3(), s = sgn(), [a, b] = pair(k, s, -s), e = plus(a,b);
  if (Math.random() < .25) return MC({skill:4, title:'Which sign?', prompt:`Is ${EX([a,b],['+'])} positive or negative?`, choices:['➕ Positive','➖ Negative'], answer:isNeg(e) ? 1 : 0, layout:'g2', why:`${fmt(qcmp(qabs(a.q), qabs(b.q)) > 0 ? a : b)} has the bigger size, so the sum is ${isNeg(e) ? 'negative' : 'positive'}: <b>${fmt(e)}</b>.`, val:qv(e.q)});
  return NUM({skill:4, title:'Opposite signs', prompt:`${EX([a,b],['+'])} = ?`, why:whyAdd(a,b)}, e);
}

/* 5 · estimate first */
const near = x => { const v = qv(x.q); return v < 0 ? -Math.round(-v) : Math.round(v); };
function gEst(){
  for (;;){
    const k = pick(['d','f']), op = Math.random() < .65 ? '+' : '−', [a, b] = pair(k, sgn(), sgn(), 14);
    const fa = Math.abs(qv(a.q)) % 1, fb = Math.abs(qv(b.q)) % 1;
    if (fa === 0 || fb === 0 || Math.abs(fa - .5) < .01 || Math.abs(fb - .5) < .01) continue;
    const ra = near(a), rb = near(b), est = op === '+' ? ra + rb : ra - rb, e = op === '+' ? plus(a,b) : minus(a,b);
    const cands = [-est, op === '+' ? ra - rb : ra + rb, Math.abs(ra) + Math.abs(rb), est + 3, est - 3, -(Math.abs(ra) + Math.abs(rb))];
    const wr = []; cands.forEach(c => { if (wr.length < 3 && c !== est && !wr.includes(c)) wr.push(c); });
    if (wr.length < 3) continue;
    const lab = v => 'about ' + N(v);
    return Object.assign(shufMC({skill:5, title:'Estimate', prompt:`Best estimate for ${EX([a,b],[op])}?`, layout:'g2', why:`Round each number: ${fmt(a)} ≈ ${N(ra)} and ${fmt(b)} ≈ ${N(rb)}. ${N(ra)} ${op} ${rb < 0 ? '(' + N(rb) + ')' : N(rb)} = <b>${N(est)}</b>. The exact answer, ${fmt(e)}, is close.`}, lab(est), wr.map(lab)), {est, val:qv(e.q)});
  }
}

/* 6 · keep · change · change */
function gKCC(){
  const r = Math.random(), k = r < .4 ? 'i' : pick(['i','d']), [a, b] = pair(k, sgn(), sgn());
  if (r < .4){
    const v = minus(a,b), w = [mk(qsub(b.q, a.q), k), plus(a,b), neg(plus(a,b))];
    if (new Set([v, ...w].map(x => qv(x.q))).size < 4) return gKCC();
    return Object.assign(shufMC({skill:6, title:'Subtract', prompt:`Evaluate ${EX([a,b],['−'])}`, layout:'g2', why:whySub(a,b)}, fmt(v), w.map(fmt)), {val:qv(v.q)});
  }
  if (r < .7){
    const ch = [`${fmt(a)} + ${par(neg(b))}`, `${fmt(neg(a))} + ${par(b)}`, `${fmt(a)} + ${par(b)}`, `${fmt(neg(a))} + ${par(neg(b))}`];
    return Object.assign(shufMC({skill:6, title:'Add the opposite', prompt:`Which addition expression equals ${EX([a,b],['−'])}?`, why:`Keep ${fmt(a)}, change − to +, change ${par(b)} to its opposite ${par(neg(b))}: <b>${ch[0]}</b>.`}, ch[0], ch.slice(1)), {kcc:[qv(a.q), qv(b.q)]});
  }
  const ch = [`${fmt(a)} + ${par(neg(b))}`, `${fmt(neg(b))} + ${par(a)}`, `${fmt(b)} − ${par(a)}`, `${fmt(a)} + ${par(b)}`, `${fmt(neg(a))} − ${par(b)}`];
  const vals = [qv(minus(a,b).q), qv(plus(neg(b),a).q), qv(minus(b,a).q), qv(plus(a,b).q), qv(minus(neg(a),b).q)];
  if (vals.slice(2).some(x => Math.abs(x - vals[0]) < 1e-9)) return gKCC();
  const order = shuffle([0,1,2,3,4]);
  return {type:'multi', all:true, skill:6, title:'Choose all', prompt:`Which expressions equal ${EX([a,b],['−'])}? Choose <b>all</b> that apply.`, choices:order.map(i => ch[i]), correct:order.map((i,j) => i < 2 ? j : -1).filter(j => j >= 0), pick:1, why:`${fmt(a)} − ${par(b)} = ${fmt(a)} + ${par(neg(b))}. You can also add in the other order: ${ch[1]}. Both equal <b>${fmt(minus(a,b))}</b>.`, vals:order.map(i => vals[i])};
}

/* 7 · subtract decimals, fractions, mixed numbers */
function gSub(){
  if (Math.random() < .25){
    const k = pick(['d','f']); let a, b, c;
    for (;;){ [a, b] = pair(k, sgn(), 1, 8); c = rnum(k, -1, 10); if (k === 'f' && lcm(lcm(a.q.d, b.q.d), c.q.d) > 24) continue; break; }
    const e = minus(minus(a,b),c), s1 = plus(a, neg(b));
    return NUM({skill:7, title:'Three numbers', prompt:`${EX([a,b,c],['−','−'])} = ?`, why:`Keep · change · change twice: ${fmt(a)} + ${par(neg(b))} + ${par(neg(c))}. ${fmt(a)} + ${par(neg(b))} = ${fmt(s1)}. Then ${fmt(s1)} + ${par(neg(c))} = <b>${fmt(e)}</b>.`}, e);
  }
  const k = pick(['d','d','f','f','i']), [a, b] = pair(k, sgn(), sgn()), e = minus(a,b);
  return NUM({skill:7, title:'Subtract', prompt:`${EX([a,b],['−'])} = ?`, why:whySub(a,b)}, e);
}

/* 8 · temperature and other stories */
const TIMES = [['6:00 a.m.','noon'],['1:00 p.m.','11:00 p.m.'],['sunset','midnight'],['9:00 a.m.','3:00 p.m.']];
function gWord(){
  const r = Math.random(), k = pick(['i','i','d']);
  if (r < .35){
    const [t1, t2] = pick(TIMES), T = rnum(k, sgn(), 15), C = rnum(k, 1, 20), up = Math.random() < .35, E = up ? plus(T, C) : minus(T, C);
    return NUM({skill:8, title:'Temperature', tpl:'fwd', ctx:`At ${t1}, the temperature was <b>${fmt(T)}°F</b>. By ${t2}, it ${up ? 'rose' : 'dropped'} <b>${fmt(C)}°F</b>.`, prompt:`What was the temperature at ${t2}?`, why:`${up ? 'A rise adds a positive' : 'A drop adds a negative'}: ${fmt(T)} + ${par(up ? C : neg(C))}. ` + whyAdd(T, up ? C : neg(C))}, E, {post:'°F'});
  }
  if (r < .6){
    const C = rnum('i', 1, 18), E = rnum('i', sgn(), 12), up = Math.random() < .3, S0 = up ? minus(E, C) : plus(E, C);
    if (!S0.q.n) return gWord();
    return NUM({skill:8, title:'Work backward', tpl:'back', ctx:`After the temperature ${up ? 'rose' : 'dropped'} <b>${fmt(C)} degrees</b> overnight, it is <b>${fmt(E)}°C</b>.`, prompt:'What was the starting temperature?', why:`Undo the ${up ? 'rise: subtract' : 'drop: add'} ${fmt(C)} back. ${fmt(E)} ${up ? '−' : '+'} ${fmt(C)} = <b>${fmt(S0)}°C</b>. Check: ${fmt(S0)} ${up ? '+' : '−'} ${fmt(C)} = ${fmt(E)} ✓`}, S0, {post:'°C'});
  }
  if (r < .75){
    let C, E; do { C = rnd(5, 18); E = rnd(-12, 12); } while (!E || E + C === 0 || E === -C || Math.abs(E) === C);
    const c = mk(Q(C),'i'), e = mk(Q(E),'i'), ch = [`${fmt(e)} + ${C}`, `${fmt(e)} − (−${C})`, `${fmt(neg(e))} + ${C}`, `${fmt(e)} − ${C}`, `${fmt(neg(e))} − ${C}`];
    const vals = [E + C, E + C, -E + C, E - C, -E - C];
    if (vals.slice(2).some(v => v === E + C)) return gWord();
    const order = shuffle([0,1,2,3,4]);
    return {type:'multi', all:true, skill:8, title:'Choose all', ctx:`After the temperature decreased <b>${C} degrees</b> overnight, it is <b>${fmt(e)}°C</b>.`, prompt:'Which expressions show the starting temperature? Choose <b>all</b> that apply.', choices:order.map(i => ch[i]), correct:order.map((i,j) => i < 2 ? j : -1).filter(j => j >= 0), pick:1, why:`Start − ${C} = ${fmt(e)}, so start = ${fmt(e)} + ${C}. Subtracting −${C} is the same as adding ${C}. Both give <b>${N(E + C)}°C</b>.`, vals:order.map(i => vals[i])};
  }
  if (r < .88){
    const D = rnum(k, -1, 30), U = rnum(k, 1, 20), e = plus(D, U);
    return NUM({skill:8, title:'Diver', tpl:'dive', ctx:`A diver is at <b>${fmt(D)} m</b> (below sea level). She swims up <b>${fmt(U)} m</b>.`, prompt:'Where is she now?', why:`Up is positive: ${fmt(D)} + ${fmt(U)}. ` + whyAdd(D, U)}, e, {post:'m'});
  }
  let B, P; do { B = mk(Q(rnd(500, 6000), 100), 'd'); P = mk(Q(rnd(500, 6000), 100), 'd'); } while (B.q.n === P.q.n);
  const e = plus(neg(B), P), m2 = x => (isNeg(x) ? '−$' : '$') + qv(qabs(x.q)).toFixed(2);
  return NUM({skill:8, title:'Money', tpl:'bank', ctx:`Ava’s lunch account is at <b>${m2(neg(B))}</b> (she owes money). She deposits <b>${m2(P)}</b>.`, prompt:'What is her balance now, in dollars?', why:`${m2(neg(B))} + ${m2(P)}. ` + whyAdd(neg(B), P)}, e, {show:m2(e)});
}

const GENS = [null, gLine, gDist, gSame, gOpp, gEst, gKCC, gSub, gWord];
const buildBoss = () => [gLine(), gDist(), gSame(), gSame(), gOpp(), gOpp(), gOpp(), gEst(), gKCC(), gKCC(), gSub(), gSub(), gSub(), gWord(), gWord()];

/* ---------- THE PRACTICE QUIZ AND LESSON 6, problem by problem ---------- */
const I = n => mk(Q(n), 'i'), D = (n, m) => mk(Q(n, m), 'd'), Fm = (w, n, d) => mk(Q(Math.sign(w || 1) * (Math.abs(w) * d + n), d), 'f');
const tempCtx = 'After the temperature decreased <b>12 degrees</b> overnight, it is <b>−7°C</b>.';
const q5 = (op) => { const a = I(8), b = op === '+' ? I(-3) : I(3), R = {min:0, max:15, tick:1, lab:1, fs:9.5};
  const right = nline(Object.assign({}, R, {arr:[{a:0,b:8,c:GRAYC},{a:8,b:5,c:NEGC}]}));
  const wrong = [[{a:0,b:8,c:GRAYC},{a:8,b:11,c:POSC}], [{a:0,b:3,c:GRAYC},{a:3,b:11,c:POSC}], [{a:0,b:8,c:GRAYC},{a:0,b:3,c:POSC}]].map(arr => nline(Object.assign({}, R, {arr})));
  return shufMC({skill:1, title:'Model it', prompt:`Which number line models ${EX([a,b],[op])}?`, layout:'viz', why: op === '−' ? 'Start at 8 (gray hop from 0). Subtracting 3 moves <b>3 to the left</b>. You land on 5.' : 'Adding −3 also moves <b>3 to the left</b>, so 8 + (−3) = 8 − 3 = 5. Same model!'}, right, wrong); };
const estNum = (no, a, b) => { const e = plus(a,b); return {type:'num', no, lab:`Lesson #${no - 10}`, skill:isNeg(a) === isNeg(b) ? 3 : 4, title:'Estimate, then add', prompt:`Estimate, then find the sum. ${EX([a,b],['+'])}`,
  blanks:[{label:'Estimate', answer:qv(e.q), tol:1.5, show:`about ${N(near(a) + near(b))}`}, {label:'Sum', answer:qv(e.q), show:showAns(e)}], why:`Estimate: ${N(near(a))} + ${near(b) < 0 ? '(' + N(near(b)) + ')' : N(near(b))} = ${N(near(a) + near(b))}. Any estimate within 1½ counts. ` + whyAdd(a,b)}; };
const SHAWN = `<div class="work" style="font-size:15px"><div><b>Shawn’s way:</b> ${EX([D(109,10), D(-685,100)],['+']).replace('class="ex"','class="exs"')}</div><div>The addends have opposite signs.</div><div>10.9 − 6.85 = 10 + 0.9 − 6 − 0.85</div><div style="padding-left:58px">= 10 − 6 + 0.9 − 0.85</div><div style="padding-left:58px">= 4 + 0.05 = 4.05</div><div>The positive addend has the greater absolute value, so the sum is 4.05.</div></div>`;
const GUIDE = [
  MC({no:1, lab:'Quiz #1', skill:6, title:'Subtract', prompt:`Evaluate the expression ${EX([I(3),I(11)],['−'])}`, choices:['A. −14','B. −8','C. 8','D. 14'], answer:1, layout:'g2', why:'3 − 11 = 3 + (−11). Opposite signs: 11 − 3 = 8. −11 has the bigger size, so the answer is <b>−8</b>.'}),
  {type:'multi', all:true, no:2, lab:'Quiz #2 · Part A', skill:8, title:'Choose all', ctx:tempCtx, prompt:'Which expressions represent the <b>initial</b> temperature? Choose <b>all</b> that apply.', choices:['A. 7 + 12','B. 7 − 12','C. −7 + 12','D. −7 − 12','E. −7 − (−12)'], correct:[2,4], pick:1, why:'Some number minus 12 equals −7, so the start is −7 + 12. <b>C</b> is that. <b>E</b> is too: subtracting −12 is the same as adding 12.'},
  {type:'num', no:3, lab:'Quiz #2 · Part B', skill:8, title:'Work backward', ctx:tempCtx, prompt:'What was the initial temperature?', blanks:[{answer:5, show:'5', post:'°C'}], why:'−7 + 12 = <b>5°C</b>. Check: 5 − 12 = −7 ✓'},
  {type:'num', no:4, lab:'Quiz #3', skill:2, title:'Distance', prompt:'What is the distance between point A and point B?', fig:nline({min:-2.5, max:2.5, tick:.25, lab:.5, fs:9.5, pts:[{x:-2.25, t:'A', c:POSC},{x:1.5, t:'B', c:NEGC}]}), blanks:[{answer:3.75, show:'3.75', post:'units'}], why:'A is at −2.25 and B is at 1.5. They are on opposite sides of 0, so add their distances from 0: 2.25 + 1.5 = <b>3.75</b>. Distance is always positive.'},
  {type:'num', no:5, lab:'Quiz #4', skill:7, title:'Subtract', prompt:`Evaluate ${EX([I(4), Fm(7,1,3)],['−'])}`, blanks:[{answer:qv(minus(I(4), Fm(7,1,3)).q), show:`−3${fr(1,3)}`}], why:`4 + (−7${fr(1,3)}). Opposite signs: 7${fr(1,3)} − 4 = 3${fr(1,3)}. The negative has the bigger size, so <b>−3${fr(1,3)}</b>.`},
  {type:'num', no:6, lab:'Quiz #4', skill:7, title:'Three numbers', prompt:`Evaluate ${EX([Fm(-2,3,8), Fm(5,1,2), Fm(-9,1,4)],['−','−'])}`, blanks:[{answer:qv(minus(minus(Fm(-2,3,8), Fm(5,1,2)), Fm(-9,1,4)).q), show:`1${fr(3,8)} (1.375)`}], why:`Keep · change · change: −2${fr(3,8)} + (−5${fr(1,2)}) + 9${fr(1,4)}. Rename to eighths: −2${fr(3,8)} + (−5${fr(4,8)}) + 9${fr(2,8)}. The negatives make −7${fr(7,8)}. Then 9${fr(2,8)} − 7${fr(7,8)} = 8${fr(10,8)} − 7${fr(7,8)} = <b>1${fr(3,8)}</b>.`},
  Object.assign(q5('−'), {no:7, lab:'Quiz #5'}),
  Object.assign(q5('+'), {no:8, lab:'Quiz #5'}),
  MC({no:9, lab:'Quiz #6 · Part A', skill:6, title:'Add the opposite', prompt:`Write ${EX([D(-52,10), I(-9)],['−'])} as an equivalent addition expression.`, choices:['−5.2 + 9','−5.2 + (−9)','5.2 + 9','5.2 + (−9)'], answer:0, layout:'g2', why:'Keep −5.2, change − to +, change −9 to its opposite 9: <b>−5.2 + 9</b>.'}),
  {type:'num', no:10, lab:'Quiz #6 · Part B', skill:7, title:'Subtract', prompt:`Evaluate ${EX([D(-52,10), I(-9)],['−'])}`, blanks:[{answer:3.8, show:'3.8'}], why:'−5.2 + 9. Opposite signs: 9 − 5.2 = 3.8. 9 has the bigger size, so <b>3.8</b>.'},
  {type:'num', no:11, lab:'Lesson #1', skill:1, title:'Number line', prompt:`Use the number line. ${EX([D(25,10), D(-65,10)],['+'])} = ?`, fig:nline({min:-8, max:4, tick:.5, lab:1, pts:[{x:2.5, t:'start', c:'var(--x)'}]}), blanks:[{answer:-4, show:'−4'}], why:'Start at 2.5. Adding −6.5 moves 6.5 to the left. You land on <b>−4</b>.' + nline({min:-8, max:4, tick:.5, lab:1, arr:[{a:0,b:2.5,c:GRAYC},{a:2.5,b:-4,c:NEGC}]})},
  {type:'num', no:12, lab:'Lesson #2', skill:3, title:'Same signs', prompt:`Evaluate ${EX([D(-345,100), D(-152,100)],['+'])}`, blanks:[{answer:-4.97, show:'−4.97'}], why:whyAdd(D(-345,100), D(-152,100))},
  MC({no:13, lab:'Lesson #3', skill:4, title:'Shawn’s way', ctx:SHAWN, prompt:'Did Shawn get the right answer? Why?', choices:['Yes. The signs are opposite, so he subtracted the sizes: 10.9 − 6.85 = 4.05. The positive number is bigger, so the sum is positive.','No. He should add the sizes: 10.9 + 6.85 = 17.75.','No. The sum is −4.05 because the problem has a negative number in it.','Yes, but only because he split the numbers into whole numbers and decimals.'], answer:0, why:'Shawn is right. Opposite signs: subtract the sizes. 10.9 has the greater absolute value and it is positive, so the sum is <b>4.05</b>. Splitting into 10 − 6 and 0.9 − 0.85 just made the subtraction easier.'}),
  MC({no:14, lab:'Lesson #4', skill:3, title:'Shawn’s way', ctx:`Now Shawn needs ${EX([D(-685,100), D(-109,10)],['+']).replace('class="ex"','class="exs"')}`, prompt:'How might Shawn find the sum?', choices:['Same signs: add the sizes, 6.85 + 10.9 = 17.75, and keep the negative sign: −17.75.','Opposite signs: subtract, 10.9 − 6.85 = 4.05, so −4.05.','Add to get 17.75. Two negatives make a positive.','Subtract to get 10.9 − 6.85 = 4.05.'], answer:0, why:'Both numbers are negative, so add the sizes: 6.85 + 10.9 = 17.75. Keep the sign: <b>−17.75</b>.'}),
  {type:'num', no:15, lab:'Lesson #5', skill:8, title:'Temperature', ctx:'At 1:00 p.m., the temperature was <b>−12.83°F</b>. Over the next 10 hours, the temperature dropped <b>17.65°F</b>.', prompt:'What was the temperature at 11:00 p.m.?', blanks:[{answer:-30.48, show:'−30.48', post:'°F'}], why:'A drop adds a negative: −12.83 + (−17.65). Same signs: 12.83 + 17.65 = 30.48. Keep the negative: <b>−30.48°F</b>.'},
  estNum(16, Fm(6,1,4), Fm(-3,1,2)),
  estNum(17, D(-415,100), D(-387,100)),
  estNum(18, Fm(-13,1,4), Fm(8,5,8)),
  estNum(19, Fm(-6,1,2), Fm(-1,1,3)),
  estNum(20, D(-935,100), D(975,100)),
  estNum(21, D(763,100), D(-1042,100)),
  estNum(22, Fm(-8,2,5), Fm(8,2,3)),
  estNum(23, D(721,100), D(-352,100))
];
const PARTS = [['Q','Practice Quiz B',1,10,'Quiz #1–6'],['L','Lesson 6 · #1–5',11,15,'Number line, Shawn’s way, temperature'],['E','Lesson 6 · #6–13',16,23,'Estimate, then add']];
