/* ---------- MULT · DIV TOPIC: settings and helpers ---------- */
const qmul = (a,b) => Q(a.n*b.n, a.d*b.d), qdiv = (a,b) => Q(a.n*b.d, a.d*b.n);
const times = (...xs) => mk(xs.reduce((q,x) => qmul(q, x.q), Q(1)), kindOf(...xs));
const over = (a,b) => mk(qdiv(a.q, b.q), kindOf(a,b));
const pf = x => `(${fmt(x)})`;
/* products written the textbook way: 3(−7), (−2)(3), −3 · 5 · 4 */
const MX = (xs, style) => style === 'dot' ? xs.map((x,i) => i && isNeg(x) ? pf(x) : fmt(x)).join(' · ') : style === 'pp' ? xs.map(pf).join('') : fmt(xs[0]) + xs.slice(1).map(pf).join('');
const MXex = (xs, style, opp) => `<span class="ex">${opp ? '−(' + MX(xs, style) + ')' : MX(xs, style)}</span>`;
const MXs = (xs, style, opp) => MXex(xs, style, opp).replace('class="ex"', 'class="exs"');
const DVex = (a, b) => `<span class="ex">${fmt(a)} ÷ ${par(b)}</span>`;
const negs = xs => xs.filter(isNeg).length;
const eo = n => n % 2 ? 'odd' : 'even';
const signWhy = (xs, opp) => { const k = negs(xs), inside = k % 2 ? 'negative' : 'positive'; return `${k} negative factor${k === 1 ? '' : 's'} (${eo(k)}) → the product is ${inside}.` + (opp ? ` The −( ) in front means “the opposite of”, so the answer is ${inside === 'negative' ? 'positive' : 'negative'}.` : ''); };

const UNITS_M = { w:'Groups & Patterns', x:'Sign Rules', d:'Fractions, Decimals & Dividing' };
const SKILLS_M = [
  [11,'w','Groups of Negatives','🧺'],[12,'w','Patterns & Properties','🔁'],
  [13,'x','Negative × Negative','✖️'],[14,'x','Count the Negatives','🔢'],[15,'x','Multiply Stories','🤿'],
  [16,'d','Multiply Fractions & Decimals','🍕'],[17,'d','Dividing Integers','➗'],[18,'d','Divide Stories','📉']
].map(([id,u,n,e]) => ({id,u,n,e}));
addSkills(SKILLS_M);

const WIZARD = `<svg class="fx" viewBox="0 0 160 150" role="img" aria-label="A cartoon wizard called the Sign Sorcerer"><ellipse cx="80" cy="143" rx="50" ry="5" fill="var(--line)"/>
<path d="M34 142l14-56h64l14 56z" fill="#3F5E4A"/><path d="M80 92v50" stroke="#2C4537" stroke-width="3"/>
<ellipse cx="80" cy="74" rx="30" ry="28" fill="#F1DCC4"/><path d="M54 84c4 30 48 30 52 0-8 10-44 10-52 0z" fill="#EEF2EA"/><path d="M60 92c8 22 32 22 40 0" fill="#E2E8DD"/>
<path d="M40 56h80l-6 8H46z" fill="#2C4537"/><path d="M52 56L84 4l26 52z" fill="#3F5E4A"/>
<text x="74" y="44" font-size="15" font-weight="800" fill="#F3E39B">×</text><text x="86" y="30" font-size="12" font-weight="800" fill="#F3E39B">÷</text><text x="64" y="54" font-size="10" font-weight="800" fill="#F3E39B">±</text>
<circle cx="69" cy="72" r="6.5" fill="#fff"/><circle cx="91" cy="72" r="6.5" fill="#fff"/><circle cx="70" cy="73" r="3.2" fill="#1F2D22"/><circle cx="90" cy="73" r="3.2" fill="#1F2D22"/>
<path d="M60 63l14 4M100 63l-14 4" stroke="#1F2D22" stroke-width="3.5" stroke-linecap="round"/><path d="M72 84q8 5 16 0" fill="none" stroke="#1F2D22" stroke-width="2.5" stroke-linecap="round"/>
<path d="M124 70v66" stroke="#8A6B3E" stroke-width="5" stroke-linecap="round"/><circle cx="124" cy="64" r="9" fill="#B6D7A8" stroke="#3F5E4A" stroke-width="2"/></svg>`;

const LAB_M = {
  h1:'Times &amp; Divide Lab', kick:'<b>Grade 7</b> · Module 2',
  learn:{title:'8 skills for multiplying and dividing', sub:'Open one, play with it, then practice 5.', emoji:'✖️'},
  guide:{title:'Lessons 13, 14 and 15', sub:'Exit tickets, recaps and practice from the three lessons, plus bonus dividing.', emoji:'📋'},
  boss:{name:'The Sign Sorcerer', art:WIZARD, blurb:'15 new problems: groups, sign rules, fractions, decimals and dividing. Answers come at the end.', btn:'Face the Sign Sorcerer', foot:'90% or better breaks the spell. New problems every try.',
    win:'The spell is broken! 🎉', hurt:'The Sorcerer is shaken. Fix the misses.', lose:'The Sorcerer wins this round. Review and retry.'},
  matchSkill:13, stepSkill:16,
  keypad:'Negative: − · Fraction: 3/4 · Mixed: 3 ␣ 1/4'
};
const READY_M = ['I can write −7 + (−7) + (−7) as 3(−7).','I know −3(6) means the opposite of 3 groups of 6.','I can explain why a negative times a negative is positive.','I count the negative factors: even → positive, odd → negative.','I know −( ) means “the opposite of”, so it flips the sign.','I can multiply fractions, decimals and mixed numbers with signs.','I can break a number apart and use the distributive property.','I can divide integers with the same sign rules.'];
const SHORT_M = {
  'Product':'The answer to a multiplication', 'Quotient':'The answer to a division', 'Factor':'A number being multiplied', 'Repeated addition':'−4 + (−4) + (−4) = 3(−4)',
  'Zero product property':'If a product is 0, a factor is 0', 'Commutative property':'Order doesn’t change a product', 'Distributive property':'a(b + c) = ab + ac', 'Opposite of':'−( ) flips the sign',
  'Even negatives':'The product is positive', 'Odd negatives':'The product is negative', 'Undefined':'What dividing by 0 gives', 'Rate':'The change for each 1, like per hour'
};
const STEPS_M = [
  ['Count the negatives','One negative factor → the answer is negative.'],
  ['Break the mixed number apart','−3¼ = −3 + (−¼)'],
  ['Distribute','1½(−3) + 1½(−¼)'],
  ['Multiply each part','−4½ + (−⅜)'],
  ['Add and simplify','−4⅞']
];
