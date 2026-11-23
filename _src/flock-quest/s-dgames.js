/* ---------- TOPIC D · GAMES ---------- */
function gmStop(){
  const s = Math.random() < .5, [p, q] = frac(s), neg = Math.random() < .35;
  return {prompt:`<span class="exs">${sfr(p, q, neg)}</span>`, choices:['🛑 Stops', '🔁 Loops'], answer:s ? 0 : 1, cols:2, big:true, why:`${q} = ${factorTxt(q)}: ${s ? 'only 2s and 5s, so it stops.' : 'another factor, so it loops.'}`, val:s ? 0 : 1};
}
function gmFactor(){
  const zero = Math.random() < .15;
  if (zero){ const n = nz(2, 9), top = Math.random() < .5, ans = top ? 'Undefined' : '0', all = shuffle(['0', 'Undefined', '1', N(n)]);
    return {prompt:`🔍 <span class="exs">${top ? `${N(n)} ÷ 0` : `0 ÷ ${P(n)}`} = □</span>`, choices:all, answer:all.indexOf(ans), cols:2, why:top ? 'Nothing times 0 makes a nonzero number: undefined.' : 'Zero divided by a nonzero number is 0.', val:ans}; }
  const x = nz(1, 9), b = nz(2, 9), a = x * b, pool = [x, -x]; [x + 1, x - 1, a, x + 2].forEach(v => { if (pool.length < 4 && !pool.includes(v) && v !== 0) pool.push(v); });
  const all = shuffle(pool).map(N);
  return {prompt:`🔍 <span class="exs">${P(b)} · □ = ${N(a)}</span>`, choices:all, answer:all.indexOf(N(x)), cols:2, why:`${N(a)} ÷ ${P(b)} = ${N(x)}. Check: ${P(b)} · ${P(x)} = ${N(a)} ✓`, val:x};
}
function gmDec(){
  let p, q; do { q = pick(DENS); p = rnd(1, q - 1); } while (!stops(q / gcd(p, q)));
  const neg = Math.random() < .35, v = p / q, ans = (neg ? -1 : 1) * v, pool = [ans, ans * 10, ans / 10, -ans];
  const alt = (neg ? -1 : 1) * Math.round(q / p * 100) / 100; if (Math.abs(alt - ans) > 1e-9) pool.push(alt);
  const uniq = []; pool.forEach(x => { const s = N(Math.round(x * 10000) / 10000); if (!uniq.includes(s)) uniq.push(s); });
  const right = N(Math.round(ans * 10000) / 10000), wrongs = uniq.filter(s => s !== right).slice(0, 3);
  let k = 1; while (wrongs.length < 3){ const s = N(Math.round((ans + k * .05) * 10000) / 10000); if (s !== right && !wrongs.includes(s)) wrongs.push(s); k++; }
  const all = shuffle([right, ...wrongs]), d = decFrac(p, q);
  return {prompt:`🎯 <span class="exs">${sfr(p, q, neg)} = ?</span>`, choices:all, answer:all.indexOf(right), cols:2, why:`${fr(p, q)} → ${fr(d.pp * d.k, d.pow)} = ${N(v)}${neg ? ', and it is negative' : ''}.`, val:ans};
}
const GAMES_D = [
  {id:'dstop', e:'🛑', name:'Stop or Loop', d:'Stops or loops? 45 seconds', u:'d', skill:23, time:45, par:14, gen:gmStop, how:'Factor the bottom. Only 2s and 5s stops. Anything else loops. Go fast!'},
  {id:'dmatch', e:'🧩', name:'Word Match', d:'Match the math words', u:'w', custom:matchGame},
  {id:'dsteps', e:'🪜', name:'Step Sorter', d:'Order the loop steps', u:'x', custom:stepGame},
  {id:'dfactor', e:'🔍', name:'Missing Factor', d:'Fill the box', u:'w', skill:21, rounds:8, par:8, gen:gmFactor, how:'Find the number that makes it true. Division and multiplication undo each other. 8 rounds.'},
  {id:'ddec', e:'🎯', name:'Decimal Match', d:'Fraction → decimal', u:'x', skill:22, rounds:8, par:8, gen:gmDec, how:'Pick the decimal that matches the fraction. 8 rounds.'},
  {id:'dcards', e:'🃏', name:'Flash Cards', d:'Flip. Swipe. Learn.', u:'x', custom:cardsGame}
];
