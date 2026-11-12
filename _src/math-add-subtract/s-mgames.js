/* ---------- MULT · DIV CARDS AND GAMES ---------- */
const CARDS_M = [
  [11,'3(−7)','3 groups of −7: −7 + (−7) + (−7) = <b>−21</b>'],
  [11,'−3(6)','The <b>opposite</b> of 3 groups of 6: −(6 + 6 + 6) = <b>−18</b>'],
  [11,'0 − 7 − 7 − 7 as multiplication','<b>3(−7)</b>'],
  [12,'Zero product property','If a product is 0, at least one factor is <b>0</b>.'],
  [12,'1(−3), 0(−3), −1(−3)…','−3, 0, <b>3</b>, 6… it goes up by 3 each step.'],
  [12,'(−2)(3) vs (2)(−3)','Same value: both are <b>−6</b>.'],
  [13,'Positive × negative','<b>Negative</b>'],
  [13,'Negative × negative','<b>Positive</b>'],
  [13,'(−4)(−6)','<b>24</b>'],
  [14,'Even number of negatives','The product is <b>positive</b>.'],
  [14,'Odd number of negatives','The product is <b>negative</b>.'],
  [14,'−(−4(−2)(3)(5)(−1))','3 negatives inside → negative. The opposite → <b>positive</b>.'],
  [14,'−1(7) vs −(7)','Both equal <b>−7</b>.'],
  [15,'Drops 2° each hour for 3 hours','3(−2) = <b>−6</b> degrees'],
  [15,'Water drops 3 cm per hour. 2 hours ago?','(−2)(−3) = <b>+6</b>: 6 cm higher'],
  [16,`−${fr(3,4)} · ${fr(1,6)}`,`<b>−${fr(1,8)}</b> (same as −${fr(3,24)})`],
  [16,'−0.4(−3.1)','<b>1.24</b>'],
  [16,'Break it apart',`(−5${fr(1,4)})(−20) = (−5)(−20) + (−${fr(1,4)})(−20) = 100 + 5 = <b>105</b>`],
  [17,'Negative ÷ negative','<b>Positive.</b> Same rule as multiplying.'],
  [17,'−24 ÷ 6','<b>−4</b>, because 6 × (−4) = −24'],
  [17,'7 ÷ 0','<b>Undefined.</b> No number times 0 makes 7.'],
  [18,'Fell 18° in 6 hours','−18 ÷ 6 = <b>−3</b> degrees per hour']
];

function gmMSign(){
  if (Math.random() < .25){ const y = rnd(2, 9) * sgn(), x = rnd(1, 9) * sgn(); return {prompt:DVex(I(x * y), I(y)), choices:PN, answer:x < 0 ? 1 : 0, cols:2, big:true, why:`It equals ${N(x)}.`, val:x}; }
  let xs; do { xs = Array.from({length:rnd(2, 5)}, () => I(rnd(1, 6) * sgn())); } while (!negs(xs));
  const opp = Math.random() < .2, v = (opp ? -1 : 1) * qv(times(...xs).q);
  return {prompt:MXex(xs, pick(['p','pp','dot']), opp), choices:PN, answer:v < 0 ? 1 : 0, cols:2, big:true, why:signWhy(xs, opp), val:v};
}
function gmJumps(){
  const n = rnd(2, 5), k = rnd(2, 7) * sgn(), right = `${n}(${N(k)})`;
  const wrongs = [`${n}(${N(-k)})`, `${n + 1}(${N(k)})`, `${n > 2 ? n - 1 : n + 2}(${N(k)})`];
  const all = shuffle([right, ...wrongs]);
  return {prompt:'🦘 Which multiplication matches the jumps?', fig:hopsLine(n, k), choices:all, answer:all.indexOf(right), cols:2, why:`${n} jumps of ${N(k)}: ${right} = ${N(n * k)}.`, val:n * k, jumps:[n, k]};
}
function gmMissing(){
  const x = rnd(1, 9) * sgn(), y = rnd(2, 9) * sgn(), p = x * y, P = v => v < 0 ? `(${N(v)})` : N(v), t = rnd(0, 2);
  const prompt = t === 0 ? `□ × ${P(y)} = ${N(p)}` : t === 1 ? `${N(p)} ÷ □ = ${N(x)}` : `${N(p)} ÷ ${P(y)} = □`, ans = t === 1 ? y : x;
  const pool = [ans, -ans]; [ans + 1, ans - 1, p, ans + 2].forEach(v => { if (pool.length < 4 && !pool.includes(v)) pool.push(v); });
  const all = shuffle(pool).map(N);
  return {prompt:`🔍 <span class="exs">${prompt}</span>`, choices:all, answer:all.indexOf(N(ans)), cols:2, why:`□ = ${N(ans)}. Check: ${t === 1 ? `${N(p)} ÷ ${P(y)} = ${N(x)}` : `${P(x)} × ${P(y)} = ${N(p)}`} ✓`, val:ans, miss:[t, x, y]};
}
const GAMES_M = [
  {id:'msign', e:'⚡', name:'Sign Storm', d:'+ or −? 45 seconds', u:'x', skill:14, time:45, par:15, gen:gmMSign, how:'Count the negatives. Even → positive, odd → negative. Divisions too! Go fast.'},
  {id:'mmatch', e:'🧩', name:'Word Match', d:'Match the math words', u:'w', custom:matchGame},
  {id:'msteps', e:'🪜', name:'Step Sorter', d:'Order the multiply steps', u:'d', custom:stepGame},
  {id:'jumps', e:'🦘', name:'Kangaroo Jumps', d:'Jumps → multiplication', u:'w', skill:11, rounds:8, par:8, gen:gmJumps, how:'Count the jumps and how big each one is. Which multiplication matches? 8 rounds.'},
  {id:'missing', e:'🔍', name:'Missing Number', d:'Fill the box', u:'d', skill:17, rounds:8, par:8, gen:gmMissing, how:'Find the number that makes it true. Multiplication and division undo each other. 8 rounds.'},
  {id:'mcards', e:'🃏', name:'Flash Cards', d:'Flip. Swipe. Learn.', u:'x', custom:cardsGame}
];
