/* ---------- TOPIC D · DIVIDING & DECIMALS (Lessons 18, 19, 20) ---------- */
const UNITS_D = { w:'Dividing', x:'Fractions & Decimals', d:'Repeating Decimals' };
const SKILLS_D = [
  [21,'w','Unknown Factors','🔍'],
  [22,'x','Fractions ⇄ Decimals','🔁'],
  [23,'d','Stops or Loops?','♾️']
].map(([id,u,n,e]) => ({id,u,n,e}));
addSkills(SKILLS_D);

/* the decimal expansion of p/q (p ≥ 0, q > 0): whole part, digits before the repeat, and the repeating block */
function expand(p, q){
  const w = Math.floor(p / q); let r = p % q; const seen = {}, digs = []; let i = 0;
  while (r !== 0 && !(r in seen)){ seen[r] = i; r *= 10; digs.push(Math.floor(r / q)); r = r % q; i++; }
  if (r === 0) return {w, pre:digs, rep:[]};
  const s = seen[r]; return {w, pre:digs.slice(0, s), rep:digs.slice(s)};
}
const barTxt = (e, neg) => (neg ? '−' : '') + e.w + (e.pre.length || e.rep.length ? '.' + e.pre.join('') + (e.rep.length ? `<span class="ol">${e.rep.join('')}</span>` : '') : '');
const plainDec = (e, neg) => (neg ? '−' : '') + e.w + (e.pre.length ? '.' + e.pre.join('') : '');
/* a simplified fraction terminates only when its denominator has no prime factors other than 2 and 5 */
const stops = q => { while (q % 2 === 0) q /= 2; while (q % 5 === 0) q /= 5; return q === 1; };
const factorTxt = n => { const f = []; let m = n; for (let d = 2; d * d <= m; d++) while (m % d === 0){ f.push(d); m /= d; } if (m > 1 || !f.length) f.push(m); return f.join(' · '); };

const LAB_D = {
  h1:'Flock Quest', kick:'<b>Grade 7</b> · Module 2 · Topic D',
  learn:{title:'3 skills for dividing and decimals', sub:'Open one, play with it, then practice 5.', emoji:'🔍'},
  guide:{title:'Lessons 18, 19 and 20', sub:'Exit tickets and practice problems from the three lessons.', emoji:'📋'},
  boss:{name:'Billy the Repeater', art:null, blurb:'15 new problems: unknown factors, fractions and decimals, and repeating decimals. Answers come at the end.', btn:'Face Billy the Repeater', foot:'90% or better breaks his loop. New problems every try.',
    win:'Billy stopped repeating himself! 🎉', hurt:'Billy is dizzy. Fix the misses.', lose:'Billy loops on. Review and retry.'},
  matchSkill:23, stepSkill:23,
  keypad:'Negative: − · Fraction: 3/4 · Mixed: 3 ␣ 1/4 · Decimal: .'
};
const READY_D = ['I can turn a division into an unknown factor equation, like 4 · □ = −80.','I know 0 ÷ n = 0, but n ÷ 0 is undefined.','I know −3/4, (−3)/4 and 3/(−4) all have the same value.','I can write a decimal as a fraction using place value, then simplify.','I can write a fraction as a decimal with a decimal fraction or long division.','I know a simplified fraction stops only if its denominator has only 2s and 5s.','I can write a repeating decimal with bar notation.'];
const SHORT_D = {
  'Rational number':'Any number you can write as p/q (q ≠ 0)', 'Decimal fraction':'A fraction with 10, 100, 1,000… on the bottom', 'Terminating decimal':'A decimal that stops',
  'Repeating decimal':'A decimal whose digits loop forever', 'Bar notation':'A bar over the block that repeats', 'Unknown factor':'The missing number in b · □ = a',
  'Undefined':'What dividing by 0 gives', 'Simplified fraction':'Top and bottom share no factor but 1'
};
const STEPS_D = [
  ['Simplify the fraction','Cancel any shared factors first.'],
  ['Factor the denominator','Break it into prime numbers.'],
  ['Check for 2s and 5s only','Only 2s and 5s → it stops.'],
  ['Divide top ÷ bottom','Use long division.'],
  ['Watch the remainders','A remainder shows up again → loop!'],
  ['Put the bar on the block','Bar over the shortest repeating block.']
];
const CARDS_D = [
  [21,'−12 ÷ 4','<b>−3</b>, because 4 · (−3) = −12'],
  [21,'10 ÷ (−4)','<b>−5/2</b> = −2½'],
  [21,'0 ÷ (−15)','<b>0</b>. What times −15 makes 0? Zero.'],
  [21,'−90 ÷ 0','<b>Undefined.</b> Nothing times 0 makes −90.'],
  [21,'Equivalent to −3/4','(−3)/4 and 3/(−4) and −(3/4). One negative sign, anywhere.'],
  [22,'0.58 as a fraction','58/100 = <b>29/50</b>'],
  [22,'−12/25 as a decimal','×4 on top and bottom: −48/100 = <b>−0.48</b>'],
  [22,'5/8 by long division','8 into 5.000 = <b>0.625</b>'],
  [22,'When is it a decimal fraction?','Only when the denominator has just <b>2s and 5s</b>.'],
  [23,'9/16 stops or loops?','16 = 2·2·2·2 → only 2s → <b>stops</b> (0.5625)'],
  [23,'7/45 stops or loops?','45 = 3·3·5 → has a 3 → <b>loops</b>'],
  [23,'3/11 in bar notation',`0.<span class="ol">27</span>`],
  [23,'17/15 in bar notation',`1.1<span class="ol">3</span>`],
  [23,'Every rational number is…','Either a <b>terminating</b> or a <b>repeating</b> decimal.']
];
