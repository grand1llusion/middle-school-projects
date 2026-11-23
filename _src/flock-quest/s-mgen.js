/* ---------- MULT · DIV QUESTIONS ---------- */
const PN = ['➕ Positive','➖ Negative'];
const signMC = (o, xs, opp, val) => MC(Object.assign({choices:PN, answer:val < 0 ? 1 : 0, layout:'big', val}, o));
const hopsLine = (n, k, extra) => { const arr = []; for (let i = 0; i < n; i++) arr.push({a:i * k, b:(i + 1) * k, c:k < 0 ? NEGC : POSC}); return nline(autoLine([0, n * k], Object.assign({arr}, extra || {}))); };
const repAdd = (n, k) => Array.from({length:n}, (_, i) => i && k < 0 ? `(${N(k)})` : N(k)).join(' + ');

/* 11 · groups of negatives */
function gGroups(){
  const r = Math.random(), n = rnd(2, 5), k = rnd(2, 9), v = -n * k;
  if (r < .3){
    const zero = Math.random() < .5, shown = zero ? '0' + ` − ${k}`.repeat(n) : repAdd(n, -k);
    const right = `${n}(−${k})`, wrongs = [`${n}(${k})`, `−${n}(−${k})`, `${n + 1}(−${k})`];
    return Object.assign(shufMC({skill:11, title:'Groups of negatives', ctx:`<span class="exs">${shown.replace(/-/g,'−')}</span>`, prompt:'Write it as a multiplication expression.', layout:'g2', why:`There are ${n} groups of −${k}, so it is <b>${right}</b> = ${N(v)}.`}, right, wrongs), {grp:[shown, v]});
  }
  if (r < .55){
    const T = pick([
      {tpl:'dive', s:`A diver descends <b>${k}</b> feet, rests, and does it again until she has gone down <b>${n}</b> times.`, p:'Where is she now, compared to the surface?', post:'ft'},
      {tpl:'temp', s:`Starting at 0°F, the temperature decreases <b>${k}</b> degrees each hour for <b>${n}</b> hours.`, p:'What is the total change in temperature?', post:'degrees'},
      {tpl:'cash', s:`Jada spends <b>$${k}</b> on a snack <b>${n}</b> times this week.`, p:'What is the total change in her money, in dollars?', post:''}]);
    return NUM({skill:11, title:'Groups story', tpl:T.tpl, ctx:T.s, prompt:T.p, why:`${n} groups of −${k}: ${repAdd(n, -k)} = ${n}(−${k}) = <b>${N(v)}</b>.`}, I(v), T.post ? {post:T.post} : {});
  }
  if (r < .75) return NUM({skill:11, title:'Hops', prompt:`${MXex([I(n), I(-k)])} = ?`, fig:hopsLine(n, -k), why:`${n} hops of −${k}: ${repAdd(n, -k)} = <b>${N(v)}</b>.`}, I(v));
  const ch = [`The opposite of ${n} groups of ${k}: −(${repAdd(n, k)}) = ${N(v)}`, `${n} groups of ${k}: ${repAdd(n, k)} = ${n * k}`, `−${n} + ${k} = ${N(k - n)}`, `The opposite of ${n} groups of ${k}: −(${repAdd(n, k)}) = ${n * k}`];
  return Object.assign(shufMC({skill:11, title:'Negative groups', prompt:`What does ${MXex([I(-n), I(k)])} mean?`, why:`You can’t have −${n} groups, so −${n}(${k}) means the opposite of ${n} groups of ${k}: <b>${N(v)}</b>.`}, ch[0], ch.slice(1)), {mean:v});
}

/* 12 · patterns and properties */
function gPattern(){
  const r = Math.random();
  if (r < .35){
    const k = -pick([2,3,4,5,10]), rows = [3,2,1,0].map(m => [`${N(m)}(${N(k)})`, N(m * k)]);
    return {type:'num', skill:12, title:'Keep the pattern', ctx:'Look at the pattern.', fig:tbl([['Expression', ...rows.map(x => x[0])],['Product', ...rows.map(x => x[1])]]), prompt:'Keep the pattern going.',
      blanks:[{label:`−1(${N(k)})`, answer:-k, show:N(-k)}, {label:`−2(${N(k)})`, answer:-2 * k, show:N(-2 * k)}], why:`Each step down, the product goes <b>up by ${N(-k)}</b>: … 0, ${N(-k)}, ${N(-2 * k)}. So a negative times a negative is positive.`, pat:k};
  }
  if (r < .55){
    const a = rnd(2,9), b = rnd(2,9), kind = pick(['mix','both','diff']);
    const E1 = kind === 'both' ? [I(-a), I(-b)] : [I(-a), I(b)], E2 = kind === 'mix' ? [I(a), I(-b)] : kind === 'both' ? [I(a), I(b)] : [I(-a), I(-b)];
    const v1 = qv(times(...E1).q), v2 = qv(times(...E2).q), s1 = MX(E1,'pp'), s2 = MX(E2,'pp');
    const right = v1 === v2 ? `Yes. Both equal ${N(v1)}.` : `No. ${s1} = ${N(v1)} but ${s2} = ${N(v2)}.`;
    const wrongs = v1 === v2 ? [`No. ${s1} = ${N(v1)} but ${s2} = ${N(-v2)}.`, `Yes. Both equal ${N(-v1)}.`, 'No. Only one of them has a negative factor.'] : [`Yes. Both equal ${N(v1)}.`, `Yes. Both equal ${N(v2)}.`, `No. ${s1} = ${N(v2)} but ${s2} = ${N(v1)}.`];
    return Object.assign(shufMC({skill:12, title:'Same value?', prompt:`Do ${MXs(E1,'pp')} and ${MXs(E2,'pp')} have the same value?`, why:`${s1} = ${N(v1)}. ${s2} = ${N(v2)}. ` + (v1 === v2 ? 'Same value.' : 'Different signs, so different values.')}, right, wrongs), {pair:[s1, s2]});
  }
  if (r < .72){
    if (Math.random() < .5){ const a = rnd(2,15) * sgn(); return Object.assign(shufMC({skill:12, title:'Zero product', prompt:`<span class="ex">${N(a)} × □ = 0</span>. What is □?`, layout:'g2', why:'Zero product property: if a product is 0, one of the factors must be <b>0</b>.'}, '0', [N(a), N(-a), '1']), {zp:a}); }
    return shufMC({skill:12, title:'Zero product', prompt:'Two numbers multiply to make 0. What must be true?', why:'Zero product property: <b>at least one factor is 0</b>.'}, 'At least one of them is 0', ['Both are negative','One of them is 1','They are opposites, like 4 and −4']);
  }
  const a = -rnd(2,6), b = -rnd(2,9), ab = a * b, o = arr => shuffle(arr.map(N));
  const rows = [[`Line 1: (${N(a)})( ? ) = 0`, 0, [0, b, 1]], [`Line 2: ${N(a)}(${N(b)} + ?) = 0`, -b, [-b, b, 0]], [`Line 4: (${N(a)})(${N(b)}) + ( ? ) = 0`, a * -b, [a * -b, -a * -b, 0]], [`So (${N(a)})(${N(b)}) = ?`, ab, [ab, -ab, ab - 1]]];
  return {type:'rows', skill:12, title:'Prove it', ctx:`Show that (${N(a)})(${N(b)}) = ${ab} using properties.`, prompt:'Fill in each line.', rows:rows.map(([t, ans, opts]) => { const os = o(opts); return {h:t, opts:os, a:os.indexOf(N(ans))}; }),
    why:`(${N(a)})(0) = 0. Write 0 as ${N(b)} + ${N(-b)}. Distribute: (${N(a)})(${N(b)}) + (${N(a)})(${N(-b)}) = 0, and (${N(a)})(${N(-b)}) = ${N(a * -b)}. So (${N(a)})(${N(b)}) must be <b>${ab}</b>.`, prove:[a, b]};
}

/* 13 · two factors */
function gTwo(){
  const a = I(rnd(1,12) * sgn()), b = I(rnd(1,12) * sgn()), st = pick(['p','pp','pp','dot']), v = times(a, b);
  if (Math.random() < .25) return signMC({skill:13, title:'Which sign?', prompt:`Is ${MXex([a,b], st)} positive or negative?`, why:signWhy([a,b])}, [a,b], false, qv(v.q));
  return NUM({skill:13, title:'Multiply', prompt:`${MXex([a,b], st)} = ?`, why:`${signWhy([a,b])} ${fmt(size(a))} × ${fmt(size(b))} = ${fmt(size(v))}, so <b>${fmt(v)}</b>.`}, v);
}

/* 14 · count the negatives (and opposites) */
function gCount(){
  const r = Math.random();
  for (;;){
    const n = rnd(3, r < .45 ? 6 : 4), xs = Array.from({length:n}, () => I(pick([1,1,2,2,3,4,5,6]) * sgn())), opp = Math.random() < .3;
    if (!negs(xs)) continue;
    const st = pick(['p','pp','dot']), p = times(...xs), v = opp ? -qv(p.q) : qv(p.q);
    if (r < .45) return signMC({skill:14, title:'Count the negatives', prompt:`Positive or negative? ${MXex(xs, st, opp)}`, why:signWhy(xs, opp)}, xs, opp, v);
    if (r < .75){ if (Math.abs(v) > 300) continue; return NUM({skill:14, title:'Many factors', prompt:`${MXex(xs, st, opp)} = ?`, why:`${signWhy(xs, opp)} The sizes multiply to ${Math.abs(v)}, so <b>${N(v)}</b>.`}, I(v)); }
    if (n !== 3) continue;
    const tv = qv(p.q), sz = xs.map(size), cands = [
      [MX([xs[1], xs[0], xs[2]], 'p'), tv], [N(tv), tv], [tv < 0 ? `−(${-tv})` : `−(−(${tv}))`, tv],
      [MX([neg(xs[0]), xs[1], xs[2]], 'p'), -tv], [N(-tv), -tv], [MX(sz, 'dot'), Math.abs(tv)], [`−(${MX(sz, 'dot')})`, -Math.abs(tv)]];
    const pickd = shuffle(cands).slice(0, 5), strs = pickd.map(c => c[0]);
    if (new Set(strs).size < 5 || !pickd.some(c => c[1] === tv) || pickd.every(c => c[1] === tv)) continue;
    return {type:'multi', all:true, skill:14, title:'Choose all', prompt:`Which have the same value as ${MXex(xs, 'p')}? Choose <b>all</b> that apply.`, choices:strs, correct:pickd.map((c,i) => c[1] === tv ? i : -1).filter(i => i >= 0), pick:1,
      why:`${MX(xs,'p')} = ${N(tv)}. Changing the order doesn’t change a product. Anything else that equals ${N(tv)} counts too.`, target:MX(xs, 'p')};
  }
}

/* 15 · multiply stories */
function gMStory(){
  const n = rnd(2, 8), k = rnd(2, 12), r = Math.random();
  if (r < .25){ const T = rnd(-10, 20); return NUM({skill:15, title:'Temperature', tpl:'start', ctx:`At noon it is <b>${N(T)}°F</b>. The temperature drops <b>${k}</b> degrees each hour for <b>${n}</b> hours.`, prompt:'What is the temperature then?', why:`${N(T)} + ${n}(−${k}) = ${N(T)} + (${N(-n * k)}) = <b>${N(T - n * k)}°F</b>.`}, I(T - n * k), {post:'°F'}); }
  if (r < .5) return NUM({skill:15, title:'Rewind', tpl:'back', ctx:`A pond’s water level drops <b>${k}</b> cm every hour.`, prompt:`Compared to now, what was the level <b>${n}</b> hours ago? Use + for higher, − for lower.`, why:`Going back in time is −${n} hours. (−${n})(−${k}) = <b>+${n * k}</b>: it was ${n * k} cm higher.`}, I(n * k), {post:'cm'});
  const T = pick([{s:`A submarine dives <b>${k}</b> meters each minute for <b>${n}</b> minutes.`, p:'What is its total change in depth?', post:'m'}, {s:`Leo loses <b>${k}</b> points for each wrong answer. He gets <b>${n}</b> wrong.`, p:'What is the change in his score?', post:'points'}, {s:`A phone battery drops <b>${k}</b>% each hour for <b>${n}</b> hours.`, p:'What is the total change in battery?', post:'%'}]);
  return NUM({skill:15, title:'Story', tpl:'tot', ctx:T.s, prompt:T.p, why:`${n} groups of −${k}: ${n}(−${k}) = <b>${N(-n * k)}</b>.`}, I(-n * k), {post:T.post});
}

/* 16 · multiply fractions, decimals and mixed numbers */
function gRat(){
  for (;;){
    const t = pick(['ff','fi','di','dd','mi','mm','three']); let xs, st = 'p';
    if (t === 'ff'){ const b = pick([2,3,4,5,6,8]), d = pick([2,3,4,5,6,8]); xs = [mk(Q(rnd(1,b-1) * sgn(), b),'f'), mk(Q(rnd(1,d-1) * sgn(), d),'f')]; st = pick(['dot','p']); }
    else if (t === 'fi'){ const b = pick([2,3,4,5,6,8]); xs = [mk(Q(rnd(1,b-1) * sgn(), b),'f'), I(pick([b, 2*b, 3*b, rnd(2,12)]) * sgn())]; st = pick(['dot','p']); }
    else if (t === 'di'){ xs = [mk(Q(rnd(2,99) * sgn(), 100),'d'), I(rnd(2,9) * sgn())]; if (xs[0].q.d === 1) continue; }
    else if (t === 'dd'){ xs = [mk(Q(rnd(1,9) * sgn(), 10),'d'), mk(Q(rnd(11,59) * sgn(), 10),'d')]; if (xs[1].q.d === 1) continue; }
    else if (t === 'mi'){ const d = pick([2,3,4,5,8]); xs = [mk(Q((rnd(1,5) * d + rnd(1,d-1)) * sgn(), d),'f'), I(pick([d, 2*d, 4, 6, 8, 12, 20]) * sgn())]; if (Math.random() < .5) xs.reverse(); }
    else if (t === 'mm'){ const b = pick([2,4]), d = pick([2,3,4,5,6]); xs = [mk(Q((rnd(1,3) * b + rnd(1,b-1)) * sgn(), b),'f'), mk(Q((rnd(1,4) * d + rnd(1,d-1)) * sgn(), d),'f')]; }
    else { xs = [I(rnd(2,4) * sgn()), mk(Q(5 * sgn(), 10),'d'), I(rnd(2,6) * sgn())]; st = 'pp'; }
    if (!negs(xs)) continue;
    const v = times(...xs); if ((v.k === 'f' && v.q.d > 60) || Math.abs(qv(v.q)) > 80) continue;
    return NUM({skill:16, title:'Multiply rationals', prompt:`${MXex(xs, st)} = ?`, why:`${signWhy(xs)} Sizes: ${xs.map(x => fmt(size(x))).join(' × ')} = ${fmt(size(v))}. Answer: <b>${showAns(v)}</b>.` + (t === 'mi' || t === 'mm' ? ' Tip: break the mixed number into whole + fraction and distribute.' : '')}, v);
  }
}

/* 17 · dividing integers */
function gDiv(){
  const r = Math.random(), x = rnd(1,12) * sgn(), y = rnd(2,12) * sgn(), p = x * y;
  if (r < .7) return NUM({skill:17, title:'Divide', prompt:`${DVex(I(p), I(y))} = ?`, why:`${p < 0 === y < 0 ? 'Same signs → positive' : 'Different signs → negative'}. ${Math.abs(p)} ÷ ${Math.abs(y)} = ${Math.abs(x)}. Check: ${N(y)} × ${x < 0 ? '(' + N(x) + ')' : N(x)} = ${N(p)} ✓. Answer: <b>${N(x)}</b>.`}, I(x));
  if (r < .85){
    const fx = Math.abs(x) === Math.abs(y) ? x + 1 : x; if (!fx) return gDiv();
    const P = fx * y, st = [[`${N(P)} ÷ ${y < 0 ? '(' + N(y) + ')' : N(y)} = ${N(fx)}`, true], [`${N(P)} ÷ ${fx < 0 ? '(' + N(fx) + ')' : N(fx)} = ${N(y)}`, true], [`${N(P)} ÷ ${-y < 0 ? '(' + N(-y) + ')' : N(-y)} = ${N(fx)}`, false], [`${N(-P)} ÷ ${fx < 0 ? '(' + N(fx) + ')' : N(fx)} = ${N(y)}`, false]];
    const o = shuffle([0,1,2,3]);
    return {type:'multi', all:true, skill:17, title:'Fact family', prompt:`<span class="exs">(${N(fx)})(${N(y)}) = ${N(P)}</span>. Which division facts are true? Choose <b>all</b> that apply.`, choices:o.map(i => st[i][0]), correct:o.map((i,j) => st[i][1] ? j : -1).filter(j => j >= 0), pick:1, why:`Undo the multiplication: ${N(P)} ÷ ${N(y)} = ${N(fx)} and ${N(P)} ÷ ${N(fx)} = ${N(y)}. Dividing uses the same sign rules.`, facts:true};
  }
  const k = rnd(2,12);
  if (Math.random() < .5) return shufMC({skill:17, title:'Zero rules', prompt:`What is <span class="ex">0 ÷ (−${k})</span>?`, layout:'g2', why:`0 split into any number of groups is <b>0</b>, because −${k} × 0 = 0.`}, '0', [`−${k}`, `${k}`, 'Undefined']);
  return shufMC({skill:17, title:'Zero rules', prompt:`What is <span class="ex">−${k} ÷ 0</span>?`, layout:'g2', why:`No number times 0 makes −${k}, so dividing by 0 is <b>undefined</b>.`}, 'Undefined', ['0', `−${k}`, `${k}`]);
}

/* 18 · divide stories */
function gDStory(){
  const n = rnd(2, 9), per = rnd(2, 15), tot = n * per, r = Math.random();
  if (r < .3) return NUM({skill:18, title:'Rate', tpl:'rate', ctx:`The temperature fell <b>${tot}</b> degrees over <b>${n}</b> hours at a steady rate.`, prompt:'What was the change per hour?', why:`−${tot} ÷ ${n} = <b>${N(-per)}</b> degrees per hour.`}, I(-per), {post:'° per hour'});
  if (r < .55) return NUM({skill:18, title:'Rate', tpl:'rate', ctx:`A submarine goes from the surface down to <b>${tot * 10}</b> m below sea level in <b>${n}</b> minutes, steadily.`, prompt:'What is its change in depth per minute?', why:`−${tot * 10} ÷ ${n} = <b>${N(-per * 10)}</b> m per minute.`}, I(-per * 10), {post:'m per min'});
  if (r < .75) return NUM({skill:18, title:'Share', tpl:'share', ctx:`<b>${n}</b> friends share a debt of <b>$${tot}</b> equally.`, prompt:'Write each friend’s share as an integer.', why:`−${tot} ÷ ${n} = <b>${N(-per)}</b>. Each friend owes $${per}.`}, I(-per), {post:'dollars'});
  const m = rnd(3,5); let vals, s;
  do { vals = Array.from({length:m}, () => rnd(-12, 6)); s = vals.reduce((a,b) => a + b, 0); } while (s % m || s >= 0 || vals.every(v => v === vals[0]));
  return NUM({skill:18, title:'Mean', tpl:'mean', ctx:`A football team’s yards on <b>${m}</b> plays: ${vals.map(v => `<b>${N(v)}</b>`).join(', ')}.`, prompt:'What is the mean (average) yards per play?', why:`Add: ${vals.map(v => v < 0 ? '(' + N(v) + ')' : N(v)).join(' + ')} = ${N(s)}. Divide by ${m}: ${N(s)} ÷ ${m} = <b>${N(s / m)}</b>.`}, I(s / m), {post:'yards'});
}
Object.assign(GENS, {11:gGroups, 12:gPattern, 13:gTwo, 14:gCount, 15:gMStory, 16:gRat, 17:gDiv, 18:gDStory});
const buildBossM = () => [gGroups(), gPattern(), gTwo(), gTwo(), gCount(), gCount(), gCount(), gMStory(), gMStory(), gRat(), gRat(), gDiv(), gDiv(), gDStory(), gDStory()];

/* ---------- LESSONS 13–15, problem by problem (answers from the worked solutions) ---------- */
const g = (no, lab, o) => Object.assign(o, {no, lab});
const nl24 = arr => nline({min:-24, max:24, tick:2, lab:8, arr:arr.map(([a,b]) => ({a, b, c:b < a ? NEGC : POSC}))});
const lilyFig = nline({min:-40, max:10, tick:5, lab:10, arr:[{a:0,b:-10,c:NEGC},{a:-10,b:-20,c:NEGC},{a:-20,b:-30,c:NEGC}]});
const lilyCtx = 'Lily is scuba diving. She descends <b>10 feet</b> and rests. Then she descends another 10 feet and rests. Finally, she descends 10 more feet to reach a reef.';
const ET13ctx = 'Use the expression <span class="exs">0 − 7 − 7 − 7</span>.';
const signItem = (no, lab, ex, val, why) => g(no, lab, signMC({skill:14, title:'Positive or negative?', prompt:`Without calculating: ${ex}`, why}, [], false, val));
const L14rows = (rows) => rows.map(([t, pos]) => ({h:t, opts:['Positive','Negative'], a:pos ? 0 : 1}));
const GUIDE_M = [
  /* Lesson 13 */
  g(1, 'Exit Ticket 13 #1a', shufMC({skill:11, title:'Model it', ctx:ET13ctx, prompt:'Which number line shows the expression?', layout:'viz', why:'Start at 0 and move 7 to the left three times. You end at −21.'}, nl24([[0,-7],[-7,-14],[-14,-21]]), [nl24([[0,7],[7,14],[14,21]]), nl24([[0,-7],[-7,-14]]), nl24([[0,-3],[-3,-6],[-6,-9]])])),
  g(2, 'Exit Ticket 13 #1b', MC({skill:11, title:'Repeated addition', ctx:ET13ctx, prompt:'Write it as a repeated addition expression.', choices:['−7 + (−7) + (−7)','7 + 7 + 7','−7 + 7 + (−7)','−7 + (−7)'], answer:0, layout:'g2', why:'Subtracting 7 is adding −7, three times: <b>−7 + (−7) + (−7)</b>.'})),
  g(3, 'Exit Ticket 13 #1c', MC({skill:11, title:'Multiplication', ctx:ET13ctx, prompt:'Write it as a multiplication expression.', choices:['3(−7)','3(7)','−3(−7)','(−7)(−7)(−7)'], answer:0, layout:'g2', why:'Three groups of −7: <b>3(−7)</b> = −21.'})),
  g(4, 'Exit Ticket 13 #2', MC({skill:12, title:'Same value?', prompt:`Do ${MXs([I(-2), I(3)],'pp')} and ${MXs([I(2), I(-3)],'pp')} have the same value?`, choices:['Yes. (−2)(3) = −(3 + 3) = −6 and (2)(−3) = −3 + (−3) = −6.','No. (−2)(3) = 6 and (2)(−3) = −6.','No. Only (2)(−3) has a negative group.','Yes. Both equal 6.'], answer:0, why:'(−2)(3) is the opposite of 2 groups of 3: −6. (2)(−3) is 2 groups of −3: −6. <b>Same value.</b>'})),
  g(5, 'Recap 13 #1a', MC({skill:15, title:'Lily dives', ctx:lilyCtx, prompt:'Write an addition expression for this.', choices:['−10 + (−10) + (−10)','10 + 10 + 10','−10 + 10 + (−10)','0 − 10'], answer:0, layout:'g2', why:'She goes down 10 feet three times. Each addend is −10.'})),
  g(6, 'Recap 13 #1b', MC({skill:15, title:'Lily dives', ctx:lilyCtx, prompt:'Write a multiplication expression for this.', choices:['3(−10)','3(10)','−3(−10)','10 + 3'], answer:0, layout:'g2', why:'3 groups of −10: <b>3(−10)</b>.'})),
  g(7, 'Recap 13 #1d', {type:'num', skill:15, title:'Lily dives', ctx:lilyCtx, fig:lilyFig, prompt:'What integer shows where the reef is?', blanks:[{answer:-30, show:'−30', post:'ft'}], why:'3(−10) = −30. The reef is 30 feet below sea level: <b>−30</b>.'}),
  g(8, 'Recap 13 #3', {type:'num', skill:11, title:'Groups', prompt:`Evaluate ${MXex([I(3), I(-6)])}`, blanks:[{answer:-18, show:'−18'}], why:'3 groups of −6: −6 + (−6) + (−6) = <b>−18</b>.'}),
  g(9, 'Recap 13 #4', MC({skill:11, title:'Negative groups', prompt:`What does ${MXex([I(-3), I(6)])} mean?`, choices:['The opposite of 3 groups of 6: −(6 + 6 + 6) = −18','6 + 6 + 6 = 18','−3 + 6 = 3','The opposite of 3 groups of 6: −(6 + 6 + 6) = 18'], answer:0, why:'You can’t have −3 groups. So −3(6) is the opposite of three groups of six: <b>−18</b>.'})),
  g(10, 'Lesson 13 #3', {type:'num', skill:15, title:'Temperature', ctx:'At 9:00 p.m. it was 0°F. By 10:00 p.m. the temperature decreased <b>2 degrees</b>. By 11:00 p.m. it decreased another 2 degrees, and by midnight another 2 degrees.', prompt:'What is the total change in temperature?', blanks:[{answer:-6, show:'−6', post:'degrees'}], why:'−2 + (−2) + (−2) = 3(−2) = <b>−6</b> degrees.'}),
  g(11, 'Lesson 13 #4', MC({skill:12, title:'Henry or Ethan?', ctx:'Henry says −3(5) is the same as 5(−3) because both have a product of −15. Ethan says they are different because −3(5) is the opposite of 3(5), while 5(−3) is −3 added together 5 times.', prompt:'Which student do you agree with?', choices:['A. Henry','B. Ethan','C. Both','D. Neither'], answer:2, layout:'g2', why:'<b>Both.</b> Henry is right that they have the same value, −15. Ethan is right that they mean different things.'})),
  g(12, 'Practice 13 #1', {type:'num', skill:15, title:'Temperature', ctx:'At 6:00 p.m. the temperature was <b>−4°F</b>. By 7:00 p.m. it dropped 4 degrees. By 8:00 p.m. it dropped another 4 degrees.', prompt:'What is the temperature at 8:00 p.m.?', blanks:[{answer:-12, show:'−12', post:'°F'}], why:'−4 + (−4) + (−4) = 3(−4) = <b>−12°F</b>.'}),
  g(13, 'Practice 13 #9', {type:'num', skill:11, title:'Groups', prompt:`Evaluate ${MXex([I(6), I(-2)])}`, blanks:[{answer:-12, show:'−12'}], why:'6 groups of −2: <b>−12</b>.'}),
  /* Lesson 14 */
  g(14, 'Lesson 14 #3', {type:'num', skill:12, title:'Keep the pattern', fig:tbl([['Expression','3(−3)','2(−3)','1(−3)','0(−3)'],['Product','−9','−6','−3','0']]), prompt:'Complete the pattern.', blanks:[{label:'−1(−3)', answer:3, show:'3'},{label:'−2(−3)', answer:6, show:'6'}], why:'Each step the product goes up by 3: −9, −6, −3, 0, <b>3, 6</b>.'}),
  g(15, 'Lesson 14 #5', {type:'rows', skill:12, title:'Prove it', ctx:'Conjecture: (−2)(−3) = 6. Fill in the blanks to check.', prompt:'Pick the missing number in each line.', rows:[{h:'Line 1: (−2)( ? ) = 0 (zero product property)', opts:['−3','0','3'], a:1},{h:'Line 2: −2(−3 + ?) = 0 (additive inverse)', opts:['3','−3','0'], a:0},{h:'Line 4: (−2)(−3) + ( ? ) = 0', opts:['6','0','−6'], a:2},{h:'Line 5: ? + (−6) = 0, so (−2)(−3) = ?', opts:['−6','6','5'], a:1}], why:'(−2)(0) = 0 and 0 = −3 + 3. Distribute: (−2)(−3) + (−2)(3) = 0, so (−2)(−3) + (−6) = 0. Only <b>6</b> works. The conjecture is true.'}),
  signItem(16, 'Exit Ticket 14 #1', MXex([I(-3), I(10)]), -30, 'One negative factor (odd) → <b>negative</b>.'),
  signItem(17, 'Exit Ticket 14 #2', MXex([I(-4), I(-2)],'pp'), 8, 'Two negative factors (even) → <b>positive</b>.'),
  signItem(18, 'Exit Ticket 14 #3', MXex([I(4), I(-8), I(-1)]), 32, 'Two negative factors (even) → <b>positive</b>.'),
  signItem(19, 'Exit Ticket 14 #4', MXex([I(1), I(-1), I(-1), I(-1), I(-1), I(-1)]), -1, 'Five negative factors (odd) → <b>negative</b>.'),
  g(20, 'Exit Ticket 14 #5', MC({skill:14, title:'Dylan’s claim', ctx:`Dylan says ${MXs([I(-4), I(-2), I(3), I(5), I(-1)],'p',true)} must be negative. “The negative sign in front of the parentheses forces the whole value to be negative.”`, prompt:'Do you agree with Dylan?', choices:['No. Inside there are 3 negative factors, so the product is negative. The opposite of a negative is positive.','Yes. A negative sign in front always makes the answer negative.','No. Inside there are 2 negative factors, so it is positive, and the outside sign makes it negative.','Yes. There are 3 negative factors, so the answer is negative.'], answer:0, why:'−4(−2)(3)(5)(−1) = −120 (3 negatives, odd). The −( ) means “the opposite of”: −(−120) = <b>120</b>, positive.'})),
  g(21, 'Recap 14 #1–2', {type:'num', skill:13, title:'Two factors', prompt:'Evaluate each expression.', blanks:[{label:'(−4)(−6)', answer:24, show:'24'},{label:'4(−6)', answer:-24, show:'−24'}], why:'Two negatives → positive: <b>24</b>. A positive times a negative → negative: <b>−24</b>.'}),
  g(22, 'Recap 14 #3', {type:'rows', skill:14, title:'Positive or negative?', prompt:'Predict the sign of each without calculating.', rows:L14rows([['(−4)(−4)(−4)',0],['5(−3)(−3)',1],['6 · 5(−1)(−1)',1],['4(−2)(−8)(−5)',0]]), why:'Count negatives: 3 → negative, 2 → positive, 2 → positive, 3 → negative.'}),
  g(23, 'Recap 14 #4', {type:'multi', all:true, skill:14, title:'Choose all', prompt:`Which have the same value as ${MXex([I(-3), I(-5), I(-4)])}? Choose <b>all</b> that apply.`, choices:['A. −3 · 5 · 4','B. 3(−5)(−4)','C. −5(−3)(−4)','D. −(−(60))','E. −60'], correct:[0,2,4], pick:1, why:'−3(−5)(−4) = −60 (three negatives). A has one negative: −60 ✓. C is the same factors in a new order ✓. E is −60 ✓. B and D equal 60.'}),
  g(24, 'Lesson 14 #10', {type:'num', skill:14, title:'Many factors', prompt:`Evaluate ${MXex([I(-1), I(-3), I(-5), I(-2)])}`, blanks:[{answer:30, show:'30'}], why:'Four negatives (even) → positive. 1 · 3 · 5 · 2 = <b>30</b>.'}),
  g(25, 'Lesson 14 #11', {type:'num', skill:14, title:'Many factors', prompt:`Evaluate ${MXex([I(-1), I(-3), I(-5), I(-2), I(-3), I(-1)])}`, blanks:[{answer:90, show:'90'}], why:'Six negatives (even) → positive. 1 · 3 · 5 · 2 · 3 · 1 = <b>90</b>.'}),
  signItem(26, 'Lesson 14 #16', MXex([I(3), I(-4), I(2), I(-3), I(-1)], 'p', true), 72, 'Inside: 3 negatives (odd) → negative. The opposite of a negative is <b>positive</b>.'),
  g(27, 'Practice 14 #8', {type:'num', skill:13, title:'Two factors', prompt:`Evaluate ${MXex([I(6), I(-3)])}`, blanks:[{answer:-18, show:'−18'}], why:'One negative factor → negative: <b>−18</b>. (The printed answer key says 18. That is a misprint.)'}),
  g(28, 'Practice 14 #11', {type:'rows', skill:14, title:'Positive or negative?', prompt:'Predict the sign of each without calculating.', rows:L14rows([['5 · 5 · 5',1],['4(−3)(2)',0],['7 · 9(−1)',0],['−2(−6)(−7)(−1)',1],['−7(−5)(−7)',0]]), why:'Count negatives: 0 → positive, 1 → negative, 1 → negative, 4 → positive, 3 → negative.'}),
  g(29, 'Practice 14 #12', {type:'multi', all:true, skill:14, title:'Choose all', prompt:`Which have the same value as ${MXex([I(-2), I(-3), I(-1)])}? Choose <b>all</b> that apply.`, choices:['A. 2 · 3 · 1','B. −2 · 3 · 1','C. 2(−3)(−1)','D. 2 · 3(−1)','E. 6','F. −6','G. −(2 · 3 · 1)','H. −(6)','I. −(−6)','J. −3(−2)(−1)'], correct:[1,3,5,6,7,9], pick:1, why:'−2(−3)(−1) = −6 (three negatives). Every choice worth −6 counts: <b>B, D, F, G, H, J</b>.'}),
  /* Lesson 15 */
  g(30, 'Exit Ticket 15 #1', {type:'num', skill:16, title:'Multiply fractions', prompt:`Multiply ${MXex([mk(Q(-3,4),'f'), mk(Q(1,6),'f')],'dot')}`, blanks:[{answer:-1/8, show:`−${fr(1,8)} (same as −${fr(3,24)})`}], why:`One negative → negative. 3 × 1 = 3 and 4 × 6 = 24, so −${fr(3,24)} = <b>−${fr(1,8)}</b>.`}),
  g(31, 'Exit Ticket 15 #2', {type:'num', skill:16, title:'Multiply decimals', prompt:`Multiply ${MXex([D(-4,10), D(-31,10)])}`, blanks:[{answer:1.24, show:'1.24'}], why:'Two negatives → positive. −0.4(−3 + (−0.1)) = 1.2 + 0.04 = <b>1.24</b>.'}),
  g(32, 'Exit Ticket 15 #3', {type:'num', skill:16, title:'Mixed number', prompt:`Multiply ${MXex([mk(Q(2,5),'f'), Fm(-4,1,8)])}`, blanks:[{answer:-33/20, show:`−1${fr(13,20)} (−1.65)`}], why:`One negative → negative. ${fr(2,5)}(−4) + ${fr(2,5)}(−${fr(1,8)}) = −${fr(8,5)} + (−${fr(2,40)}) = −${fr(32,20)} + (−${fr(1,20)}) = <b>−1${fr(13,20)}</b>.`}),
  g(33, 'Lesson 15 #2', signMC({skill:16, title:'Decimals', prompt:`Is ${MXex([I(4), D(-5,10)])} positive or negative?`, why:'One of the two factors is negative, so the product is <b>negative</b> (−2).'}, [], false, -2)),
  g(34, 'Lesson 15 #3', {type:'num', skill:16, title:'Break it apart', prompt:`Evaluate ${MXex([I(-4), Fm(-2,1,2)])}`, blanks:[{answer:10, show:'10'}], why:`−4(−2 + (−${fr(1,2)})) = −4(−2) + (−4)(−${fr(1,2)}) = 8 + 2 = <b>10</b>.`}),
  g(35, 'Lesson 15 #4', {type:'num', skill:16, title:'Break it apart', prompt:`Evaluate ${MXex([I(-3), D(15,10)])}`, blanks:[{answer:-4.5, show:'−4.5'}], why:'−3(1 + 0.5) = −3 + (−1.5) = <b>−4.5</b>.'}),
  g(36, 'Lesson 15 #6', {type:'num', skill:16, title:'Fraction × integer', prompt:`Evaluate ${MXex([mk(Q(-3,4),'f'), I(12)],'dot')}`, blanks:[{answer:-9, show:'−9'}], why:`−${fr(3,4)} · ${fr(12,1)} = −${fr(36,4)} = <b>−9</b>.`}),
  g(37, 'Lesson 15 #7', {type:'num', skill:16, title:'Break it apart', prompt:`Evaluate ${MXex([I(8), Fm(-3,1,4)])}`, blanks:[{answer:-26, show:'−26'}], why:`8(−3 + (−${fr(1,4)})) = −24 + (−2) = <b>−26</b>.`}),
  g(38, 'Lesson 15 #11', {type:'num', skill:16, title:'Decimals', prompt:`Evaluate ${MXex([D(45,10), D(-21,10)])}`, blanks:[{answer:-9.45, show:'−9.45'}], why:'4.5(−2 + (−0.1)) = −9 + (−0.45) = <b>−9.45</b>.'}),
  g(39, 'Lesson 15 #12', {type:'num', skill:16, title:'Mixed numbers', prompt:`Evaluate ${MXex([Fm(1,1,2), Fm(-3,1,4)])}`, blanks:[{answer:-39/8, show:`−4${fr(7,8)}`}], why:`1${fr(1,2)}(−3) + 1${fr(1,2)}(−${fr(1,4)}) = −4${fr(1,2)} + (−${fr(3,8)}) = <b>−4${fr(7,8)}</b>.`}),
  g(40, 'Recap 15 #1', {type:'num', skill:16, title:'Break it apart', prompt:`Find the product ${MXex([D(-43,100), I(6)],'pp')}`, blanks:[{answer:-2.58, show:'−2.58'}], why:'(−0.4 + (−0.03))(6) = −2.4 + (−0.18) = <b>−2.58</b>.'}),
  g(41, 'Recap 15 #2', {type:'num', skill:16, title:'Break it apart', prompt:`Find the product ${MXex([Fm(-5,1,4), I(-20)],'pp')}`, blanks:[{answer:105, show:'105'}], why:`(−5)(−20) + (−${fr(1,4)})(−20) = 100 + 5 = <b>105</b>.`}),
  g(42, 'Practice 15 #10', {type:'num', skill:16, title:'Mixed numbers', prompt:`Find the product ${MXex([Fm(-1,3,4), Fm(-3,5,6)])}`, blanks:[{answer:161/24, show:`6${fr(17,24)}`}], why:`Two negatives → positive. ${fr(7,4)} × ${fr(23,6)} = ${fr(161,24)} = <b>6${fr(17,24)}</b>.`}),
  g(43, 'Practice 15 #12', {type:'num', skill:16, title:'Three factors', prompt:`Find the product ${MXex([I(4), Fm(-2,2,5), I(-2)],'pp')}`, blanks:[{answer:96/5, show:`19${fr(1,5)} (19.2)`}], why:`Two negatives → positive. 4 × 2${fr(2,5)} × 2 = <b>19${fr(1,5)}</b>.`}),
  g(44, 'Practice 15 #17', MC({skill:13, title:'Same value?', prompt:`Do ${MXs([I(-5), I(3)],'pp')} and ${MXs([I(-3), I(5)],'pp')} have the same value?`, choices:['Yes. Both are −15: a negative times a positive is negative.','No. One is −15 and the other is 15.','Yes. Both are 15.','No. The numbers are in a different order.'], answer:0, why:'Both have one negative factor, and 5 × 3 = 15. Both equal <b>−15</b>.'})),
  /* Bonus: dividing (new problems; the lessons only cover multiplying) */
  g(45, 'Bonus ÷ #1', {type:'num', skill:17, title:'Divide', prompt:`${DVex(I(-24), I(6))} = ?`, blanks:[{answer:-4, show:'−4'}], why:'Different signs → negative. 24 ÷ 6 = 4, so <b>−4</b>. Check: 6 × (−4) = −24 ✓'}),
  g(46, 'Bonus ÷ #2', {type:'num', skill:17, title:'Divide', prompt:`${DVex(I(-45), I(-9))} = ?`, blanks:[{answer:5, show:'5'}], why:'Same signs → positive: <b>5</b>. Check: −9 × 5 = −45 ✓'}),
  g(47, 'Bonus ÷ #3', {type:'num', skill:17, title:'Divide', prompt:`${DVex(I(56), I(-8))} = ?`, blanks:[{answer:-7, show:'−7'}], why:'Different signs → negative: <b>−7</b>. Check: −8 × (−7) = 56 ✓'}),
  g(48, 'Bonus ÷ #4', {type:'multi', all:true, skill:17, title:'Fact family', prompt:'<span class="exs">(−6)(4) = −24</span>. Which division facts are true? Choose <b>all</b> that apply.', choices:['−24 ÷ 4 = −6','−24 ÷ (−6) = 4','−24 ÷ 6 = 4','24 ÷ (−6) = 4'], correct:[0,1], pick:1, why:'Undo the multiplication: −24 ÷ 4 = −6 and −24 ÷ (−6) = 4. The other two have the wrong sign.', facts:true}),
  g(49, 'Bonus ÷ #5', {type:'num', skill:18, title:'Rate', ctx:'The temperature fell <b>18 degrees</b> over <b>6 hours</b> at a steady rate.', prompt:'What was the change per hour?', blanks:[{answer:-3, show:'−3', post:'° per hour'}], why:'−18 ÷ 6 = <b>−3</b> degrees per hour.'}),
  g(50, 'Bonus ÷ #6', MC({skill:17, title:'Zero rules', prompt:'Which is true?', choices:['0 ÷ (−7) = 0, but −7 ÷ 0 is undefined.','0 ÷ (−7) and −7 ÷ 0 both equal 0.','0 ÷ (−7) is undefined, but −7 ÷ 0 = 0.','Both equal −7.'], answer:0, why:'−7 × 0 = 0, so 0 ÷ (−7) = 0. No number times 0 makes −7, so −7 ÷ 0 is <b>undefined</b>.'})),
  g(51, 'Bonus ÷ #7', {type:'num', skill:18, title:'Rate', ctx:'A submarine goes from the surface to <b>240 m</b> below sea level in <b>8 minutes</b>, steadily.', prompt:'What is its change in depth per minute?', blanks:[{answer:-30, show:'−30', post:'m per min'}], why:'−240 ÷ 8 = <b>−30</b> m per minute.'}),
  g(52, 'Bonus ÷ #8', {type:'num', skill:18, title:'Share', ctx:'<b>4</b> friends share a debt of <b>$36</b> equally.', prompt:'Write each friend’s share as an integer.', blanks:[{answer:-9, show:'−9', post:'dollars'}], why:'−36 ÷ 4 = <b>−9</b>. Each friend owes $9.'})
];
const PARTS_M = [['13','Lesson 13 · Groups of negatives',1,13,'Exit ticket, recap, lesson, practice'],['14','Lesson 14 · Negative × negative',14,29,'Patterns, signs, choose-all'],['15','Lesson 15 · Fractions & decimals',30,44,'Exit ticket, break it apart'],['÷','Bonus · Dividing',45,52,'New problems, not from the lessons']];
