/* ---------- EXACT NUMBERS: every value is a fraction, so answers never round wrong ---------- */
const gcd = (a,b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a,b] = [b, a % b]; return a || 1; };
const lcm = (a,b) => a / gcd(a,b) * b;
const Q = (n, d=1) => { if (d < 0){ n = -n; d = -d; } const g = gcd(n, d); return {n:n/g, d:d/g}; };
const qadd = (a,b) => Q(a.n*b.d + b.n*a.d, a.d*b.d), qneg = a => Q(-a.n, a.d), qsub = (a,b) => qadd(a, qneg(b)), qabs = a => Q(Math.abs(a.n), a.d);
const qv = a => a.n / a.d, qcmp = (a,b) => a.n*b.d - b.n*a.d;

/* a shown number: {q, k}. k is how it is written: 'i' whole number, 'd' decimal, 'f' fraction or mixed number */
const mk = (q, k) => ({q, k});
const fr = (n,d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
const mixed = a => { const w = Math.floor(a.n / a.d), r = a.n % a.d; return r ? (w ? w + fr(r, a.d) : fr(r, a.d)) : String(w); };
const mixedTxt = a => { const w = Math.floor(a.n / a.d), r = a.n % a.d; return r ? (w ? `${w} ${r}/${a.d}` : `${r}/${a.d}`) : String(w); };
const decTxt = a => String(Math.round(qv(a) * 10000) / 10000);
const fmt = x => (x.q.n < 0 ? '−' : '') + (x.k === 'f' ? mixed(qabs(x.q)) : decTxt(qabs(x.q)));
const fmtTxt = x => (x.q.n < 0 ? '−' : '') + (x.k === 'f' ? mixedTxt(qabs(x.q)) : decTxt(qabs(x.q)));
const par = x => x.q.n < 0 ? `(${fmt(x)})` : fmt(x);
const kindOf = (...xs) => xs.some(x => x.k === 'f') ? 'f' : xs.some(x => x.k === 'd') ? 'd' : 'i';
const neg = x => mk(qneg(x.q), x.k), size = x => mk(qabs(x.q), x.k);
const plus = (a,b) => mk(qadd(a.q, b.q), kindOf(a,b)), minus = (a,b) => mk(qsub(a.q, b.q), kindOf(a,b));
const isNeg = x => x.q.n < 0;
/* an expression shown big: terms and the operators between them */
const EX = (ts, ops) => `<span class="ex">${ts.map((t,i) => (i ? ` ${ops[i-1]} ` + par(t) : fmt(t))).join('')}</span>`;
/* the decimal too, when a fraction answer has a short one */
const showAns = x => { const t = fmt(x); if (x.k !== 'f' || x.q.d === 1) return t; let d = x.q.d; while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1 ? `${t} (${(x.q.n < 0 ? '−' : '') + decTxt(qabs(x.q))})` : t; };

/* random numbers to practice with */
function rnum(kind, sign, max){
  let q; max = max || 12;
  if (kind === 'i') q = Q(rnd(1, max + 8));
  else if (kind === 'd'){ const m = pick([10,100,100]); let n; do { n = rnd(m * .3, m * max); } while (n % m === 0 || (m === 100 && n % 10 === 0)); q = Q(n, m); }
  else { const d = pick([2,3,4,5,6,8]), w = rnd(0, max), r = rnd(1, d - 1); q = Q(w * d + r, d); }
  return mk(sign < 0 ? qneg(q) : q, kind);
}
/* two numbers with chosen signs; fractions keep a friendly common denominator; sizes never tie */
function pair(kind, sa, sb, max){
  for (let t = 0; t < 400; t++){
    const a = rnum(kind, sa, max), b = rnum(kind, sb, max);
    if (kind === 'f' && lcm(a.q.d, b.q.d) > 24) continue;
    if (qcmp(qabs(a.q), qabs(b.q)) === 0) continue;
    return [a, b];
  }
}
const sgn = () => Math.random() < .5 ? 1 : -1;

/* step-by-step reasons, written like a teacher would say them */
function whyAdd(a, b){
  const k = kindOf(a,b), s = plus(a,b), A = size(a), B = size(b), f = q => fmt(mk(q, k));
  const den = k === 'f' && a.q.d !== b.q.d ? `Common denominator: ${lcm(a.q.d, b.q.d)}. ` : '';
  if (isNeg(a) === isNeg(b)) return `${den}Same signs: add the sizes. ${f(A.q)} + ${f(B.q)} = ${f(qadd(A.q, B.q))}. Both are ${isNeg(a) ? 'negative' : 'positive'}, so the sum is <b>${fmt(s)}</b>.`;
  const big = qcmp(A.q, B.q) > 0 ? a : b, hi = qcmp(A.q, B.q) > 0 ? A : B, lo = qcmp(A.q, B.q) > 0 ? B : A;
  return `${den}Opposite signs: subtract the sizes. ${f(hi.q)} − ${f(lo.q)} = ${f(qsub(hi.q, lo.q))}. ${fmt(big)} has the bigger size, so the sum is <b>${fmt(s)}</b>.`;
}
const whySub = (a, b) => `Keep · change · change: ${fmt(a)} + ${par(neg(b))}. ` + whyAdd(a, neg(b));

/* ---------- LAB SETTINGS (the views read these) ---------- */
const LAB = {
  learn:{title:'8 skills for the quiz', sub:'Open one, play with it, then practice 5.', emoji:'➕'},
  guide:{title:'Your quiz and lesson', sub:'All 23 problems from Practice Quiz B and Lesson 6.', emoji:'📋'},
  boss:{name:'Count Negula', blurb:'15 new problems from every skill. Answers come at the end.', btn:'Fight Count Negula', foot:'90% or better defeats the Count. New problems every try.',
    win:'Count Negula is defeated! 🎉', hurt:'The Count is hurt. Fix the misses.', lose:'The Count wins this round. Review and retry.'},
  matchSkill:6, stepSkill:6,
  keypad:'Negative: − · Fraction: 3/4 · Mixed: 3 ␣ 1/4'
};
const READY = ['I can add on a number line: right for positive, left for negative.','I can find the distance between two points. It is never negative.','Same signs: I add the sizes and keep the sign.','Opposite signs: I subtract the sizes and use the bigger one’s sign.','I estimate first, then check my answer is close.','I can rewrite subtraction as adding the opposite.','I can subtract decimals, fractions, and mixed numbers.','I can solve temperature problems, even backward ones.'];

/* word match: [word, short meaning] */
const SHORT = {
  'Absolute value':'Distance from 0. Never negative', 'Opposite':'Same distance from 0, other side', 'Sum':'The answer to an addition', 'Difference':'The answer to a subtraction',
  'Distance':'Space between two points', 'Integer':'A whole number or its opposite', 'Rational number':'Can be written as a fraction', 'Zero pair':'A number plus its opposite = 0',
  'Same signs':'Add the sizes. Keep the sign', 'Opposite signs':'Subtract the sizes. Bigger one’s sign', 'Keep · change · change':'Turns − into + the opposite', 'Estimate':'A close answer from rounded numbers'
};
/* step sorter: how to work any a − b */
const STEPS = [
  ['Keep the first number','It stays the same.'],
  ['Change − to +','Subtracting becomes adding.'],
  ['Change the second number to its opposite','5 becomes −5. −9 becomes 9.'],
  ['Compare the signs','Same or opposite?'],
  ['Add or subtract the sizes','Same: add. Opposite: subtract.'],
  ['Give the answer its sign','Same: keep it. Opposite: bigger size wins.']
];
