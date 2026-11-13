/* ---------- EXACT FRACTIONS: every value is a fraction {n, d}, so answers never round wrong ---------- */
const gcd = (a,b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a,b] = [b, a % b]; return a || 1; };
const lcm = (a,b) => a / gcd(a,b) * b;
const Q = (n, d=1) => { if (d < 0){ n = -n; d = -d; } const g = gcd(n, d); return {n:n/g, d:d/g}; };
const qadd = (a,b) => Q(a.n*b.d + b.n*a.d, a.d*b.d), qsub = (a,b) => Q(a.n*b.d - b.n*a.d, a.d*b.d);
const qv = a => a.n / a.d, qcmp = (a,b) => a.n*b.d - b.n*a.d, qeq = (a,b) => qcmp(a,b) === 0;
const M = (w, n, d) => Q(w * d + n, d);              /* the mixed number w n/d */
const whole = q => Math.floor(q.n / q.d);
const part = q => Q(q.n - whole(q) * q.d, q.d);     /* the fraction part of a mixed number */
const up = (q, L) => q.n * L / q.d;                  /* numerator after renaming q in L-ths */

/* how numbers look */
const fr = (n,d) => `<span class="fr"><i>${n}</i><i>${d}</i></span>`;
const MX = q => { const w = whole(q), r = q.n - w * q.d; return r ? (w ? w + fr(r, q.d) : fr(r, q.d)) : String(w); };
const MXt = q => { const w = whole(q), r = q.n - w * q.d; return r ? (w ? `${w} ${r}/${q.d}` : `${r}/${q.d}`) : String(w); };
const FR = q => q.d === 1 ? String(q.n) : fr(q.n, q.d);           /* simplest fraction, improper allowed */
const MXL = (w, p, L) => (w ? String(w) : '') + (p ? fr(p, L) : (w ? '' : '0'));   /* w and p/L, not simplified */
const EX = (...p) => `<span class="ex">${p.join(' ')}</span>`;
const EXs = (...p) => `<span class="exs">${p.join(' ')}</span>`;
const half = d => d % 2 ? `${(d - 1) / 2}½` : String(d / 2);

/* unit names: thirds, twenty-fourths… */
const ORD = ['','whole','half','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth','twentieth'];
const TENS = {2:'twenty',3:'thirty',4:'forty',5:'fifty',6:'sixty',7:'seventy',8:'eighty',9:'ninety'};
const ordinal = n => n <= 20 ? ORD[n] : n > 99 ? n + 'th' : n % 10 ? TENS[Math.floor(n / 10)] + '-' + ORD[n % 10] : TENS[n / 10].slice(0, -1) + 'ieth';
const unitName = d => d === 2 ? 'halves' : d === 1 ? 'wholes' : ordinal(d) + 's';

/* random fractions */
const DEN = [2,3,4,5,6,8,10,12];
function rfrac(dens){ for (;;){ const d = pick(dens), n = rnd(1, d - 1); if (gcd(n, d) === 1) return Q(n, d); } }
function unlike(dens, maxL){ for (let t = 0; t < 900; t++){ const a = rfrac(dens), b = rfrac(dens); if (a.d !== b.d && lcm(a.d, b.d) <= (maxL || 24)) return [a, b]; } return [Q(1,2), Q(1,3)]; }
const rmixed = (dens, w0, w1) => qadd(Q(rnd(w0, w1)), rfrac(dens));

/* teacher-style reasons */
function whyAdd(a, b){
  const L = lcm(a.d, b.d), A = up(a, L), B = up(b, L), s = qadd(a, b);
  return `Make like units (${unitName(L)}): ${FR(a)} = ${fr(A, L)} and ${FR(b)} = ${fr(B, L)}. Add the tops, keep the bottom: ${fr(A, L)} + ${fr(B, L)} = ${fr(A + B, L)}` + (A + B === s.n && L === s.d && s.n < s.d ? '.' : ` = <b>${MX(s)}</b>.`);
}
function whySub(a, b){
  const L = lcm(a.d, b.d), A = up(a, L), B = up(b, L), s = qsub(a, b);
  return `Make like units (${unitName(L)}): ${fr(A, L)} − ${fr(B, L)} = ${fr(A - B, L)}` + (A - B === s.n && L === s.d ? '.' : ` = <b>${MX(s)}</b>.`);
}
function whyAddMixed(xs){
  const L = xs.reduce((l, x) => lcm(l, x.d), 1), ws = xs.map(whole), W = ws.reduce((s, w) => s + w, 0);
  const ps = xs.map(x => up(part(x), L)).filter(p => p), P = ps.reduce((s, p) => s + p, 0), tot = xs.reduce(qadd, Q(0));
  let s = `Wholes: ${ws.filter(w => w).join(' + ') || 0} = ${W}. Fractions in ${unitName(L)}: ${ps.map(p => fr(p, L)).join(' + ')} = ${fr(P, L)}. `;
  if (P >= L) s += `That is more than 1 whole: ${fr(P, L)} = ${MX(Q(P, L))}, so regroup. `;
  return s + `Together: <b>${MX(tot)}</b>.`;
}
function whySubMixed(a, b){
  const L = lcm(a.d, b.d), wa = whole(a), wb = whole(b), pa = up(part(a), L), pb = up(part(b), L), r = qsub(a, b);
  let s = `Like units: ${MXL(wa, pa, L)} − ${MXL(wb, pb, L)}. `;
  if (pa < pb){
    s += (pa ? `${fr(pa, L)} is less than ${fr(pb, L)}` : `${wa} has no fraction part`) + `, so rename 1 whole as ${fr(L, L)}: ${MXL(wa, pa, L)} = ${MXL(wa - 1, pa + L, L)}. `;
    s += `Fractions: ${fr(pa + L, L)} − ${fr(pb, L)} = ${fr(pa + L - pb, L)}. Wholes: ${wa - 1} − ${wb} = ${wa - 1 - wb}. `;
  } else s += `Fractions: ${fr(pa, L)} − ${fr(pb, L)} = ${fr(pa - pb, L)}. Wholes: ${wa} − ${wb} = ${wa - wb}. `;
  return s + `Answer: <b>${MX(r)}</b>.`;
}
const whyShare = (a, b) => { const q = Q(a, b); let s = `${a} ÷ ${b} = ${fr(a, b)}`; if (q.d !== b) s += ` = ${FR(q)}`; if (a > b) s += ` = <b>${MX(q)}</b>`; return s + (a > b ? '. More to share than sharers, so each gets more than 1 whole.' : '. Less to share than sharers, so each gets less than 1 whole.'); };

/* ---------- LAB SETTINGS (the views read these) ---------- */
const LAB_C = {
  h1:'Fraction Lab', kick:'<b>Grade 5</b> · Module 2',
  learn:{title:'9 fraction skills', sub:'Open one, play with it, then practice 5.', emoji:'🧪'},
  guide:{title:'Your practice test', sub:'All 10 test questions, then a twin problem for each one.', emoji:'📋'},
  boss:{name:'The Denominator Dragon', blurb:'15 new problems from every skill. Answers come at the end.', btn:'Battle the Dragon', foot:'90% or better tames the Dragon. New problems every try.',
    win:'The Dragon is tamed! 🎉', hurt:'The Dragon is wobbling. Fix the misses.', lose:'The Dragon wins this round. Review and retry.'},
  matchSkill:2, stepSkill:6,
  keypad:'Fraction: 3 / 4 · Mixed number: 6 ␣ 20 / 21'
};
const READY_C = [
  `I can write 8 ÷ 6 as ${fr(8,6)}, ${fr(4,3)}, or 1${fr(1,3)}.`,
  'I make like units (the same denominator) before I add or subtract.',
  'I never add the denominators.',
  'I keep the whole numbers when I add mixed numbers.',
  'If the top fraction is too small, I rename a whole before I subtract.',
  'I can compare with ½ and 1 without adding.',
  'In story problems, I find every step, not just the last one.',
  'I check that the letter I circle matches my work.'
];

/* word match: [word, short meaning] */
const SHORT_C = {
  'Numerator':'Top number: how many parts', 'Denominator':'Bottom number: the size of the parts', 'Like units':'Parts that are the same size', 'Equivalent fractions':'Same amount, different names',
  'Mixed number':'A whole number and a fraction', 'Improper fraction':'Top number is bigger than the bottom', 'Benchmark':'An easy number to compare to, like ½', 'Fraction bar':'The line that means divide',
  'Sum':'The answer to an addition', 'Difference':'The answer to a subtraction', 'Rename':'Trade 1 whole for same-size parts', 'Quotient':'The answer to a division'
};
/* step sorter: subtracting mixed numbers */
const STEPS_C = [
  ['Make like units','Same denominator for both fractions.'],
  ['Check the top fraction','Is it big enough to take away from?'],
  ['Rename 1 whole if needed','7 9/24 → 6 33/24'],
  ['Subtract the fractions','33/24 − 16/24 = 17/24'],
  ['Subtract the whole numbers','6 − 6 = 0'],
  ['Check: does it make sense?','About 7 − 7 = 0, so 17/24 is close.']
];
