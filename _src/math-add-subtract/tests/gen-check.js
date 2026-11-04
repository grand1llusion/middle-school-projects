/* Content check for the Plus & Minus Lab.
   - every practice-quiz and Lesson 6 answer against the key (quiz) or hand-worked answers (lesson)
   - every generator, thousands of times, re-solved from what is SHOWN, with a separate evaluator
   Run: node tests/gen-check.js */
const fs = require('fs'), vm = require('vm'), path = require('path'); const dir = path.resolve(__dirname, '..') + '/';
const src = ['s-core.js','s-data.js','s-gen.js','s-engine.js'].map(f => fs.readFileSync(dir + f, 'utf8')).join('\n') + '\n;this.T={GENS,GUIDE,PARTS,buildBoss,partMax,grade,isRight,parseNum,answerText};';
const ctx = {console, Math, Object, Array, JSON, Set, Number, String, isFinite, Date}; vm.createContext(ctx); vm.runInContext(src, ctx);
const T = ctx.T; let bad = 0; const fail = m => { if (bad++ < 40) console.log('FAIL', m); };
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;

/* independent evaluator for what the student sees */
const plain = html => String(html).replace(/(\d)<span class="fr"><i>(\d+)<\/i><i>(\d+)<\/i><\/span>/g, '$1 $2/$3').replace(/<span class="fr"><i>(\d+)<\/i><i>(\d+)<\/i><\/span>/g, '$1/$2').replace(/<[^>]+>/g, '').replace(/−/g, '-').replace(/\s+/g, ' ').trim();
function evalExpr(s){
  let i = 0; const t = s.replace(/\s+(?=[+\-)])|(?<=[+\-(])\s+/g, ' ');
  const ws = () => { while (t[i] === ' ') i++; };
  const num = () => { ws(); const m = t.slice(i).match(/^(\d+) (\d+)\/(\d+)|^(\d+)\/(\d+)|^(\d+(?:\.\d+)?)/); if (!m) throw new Error('bad number at ' + i + ' in ' + s); i += m[0].length; return m[1] ? +m[1] + m[2] / m[3] : m[4] ? m[4] / m[5] : +m[6]; };
  const term = () => { ws(); if (t[i] === '-'){ i++; return -term(); } if (t[i] === '('){ i++; const v = expr(); ws(); if (t[i++] !== ')') throw new Error('paren ' + s); return v; } return num(); };
  const expr = () => { let v = term(); for (;;){ ws(); if (t[i] === '+'){ i++; v += term(); } else if (t[i] === '-'){ i++; v -= term(); } else return v; } };
  const v = expr(); ws(); if (i !== t.length) throw new Error('leftover in ' + s + ' at ' + i); return v;
};
const exOf = q => { const m = String(q.prompt).match(/<span class="ex">(.*?)<\/span>(?!<\/i>)/); return m ? evalExpr(plain(m[1].replace(/<span class="fr">(<i>\d+<\/i><i>\d+<\/i>)<\/span>/g, '<span class="fr">$1</span>'))) : null; };
const exPlain = q => { const s = String(q.prompt), a = s.indexOf('<span class="ex">'); if (a < 0) return null; let depth = 0, k = a; for (; k < s.length; k++){ if (s.startsWith('<span', k)) depth++; else if (s.startsWith('</span>', k)){ depth--; if (!depth) break; } } return plain(s.slice(a, k + 7)); };
const exVal = q => { const p = exPlain(q); return p == null ? null : evalExpr(p); };
const typed = v => { for (let d = 1; d <= 60; d++){ const n = v * d; if (Math.abs(n - Math.round(n)) < 1e-9){ const N0 = Math.round(Math.abs(n)), w = Math.floor(N0 / d), r = N0 % d, sg = v < 0 ? '-' : ''; if (d === 1) return sg + N0; if ([2,4,5,8,10,20,25,50].includes(d) && Math.random() < .5) return sg + String(Math.abs(v)); return sg + (w ? `${w} ${r}/${d}` : `${r}/${d}`); } } return String(v); };

function generic(q, tag){
  const s = JSON.stringify(q); if (/NaN|undefined|Infinity|\[object|\bnull\b/.test(s)) fail(tag + ' bad text ' + (s.match(/.{40}(NaN|undefined|Infinity|\[object|null).{20}/) || [s.slice(0,120)])[0]);
  if (!q.why || !q.prompt || !q.skill || !q.title) fail(tag + ' missing fields');
  if (q.type === 'mc'){ if (!(q.answer >= 0 && q.answer < q.choices.length)) fail(tag + ' mc idx'); if (new Set(q.choices.map(plain)).size !== q.choices.length && q.layout !== 'viz') fail(tag + ' dup ' + q.choices.map(plain).join(' | ')); if (q.layout === 'viz' && new Set(q.choices).size !== q.choices.length) fail(tag + ' dup models'); }
  else if (q.type === 'num'){ q.blanks.forEach(b => { if (!isFinite(b.answer)) fail(tag + ' num'); if (!T.isRight(typed(b.answer), b)) fail(tag + ' correct typed not accepted ' + typed(b.answer)); if (T.isRight(String(Math.round(b.answer) + 7), b)) fail(tag + ' wrong accepted'); }); }
  else if (q.type === 'multi'){ if (!q.all) fail(tag + ' expected all-mode'); if (!q.correct.length) fail(tag + ' no correct'); if (new Set(q.choices.map(plain)).size !== q.choices.length) fail(tag + ' multi dup'); }
  else fail(tag + ' type ' + q.type);
}
/* 1. the practice quiz and Lesson 6 */
const G = T.GUIDE; if (G.length !== 23) fail('guide length ' + G.length);
G.forEach((q, i) => { if (q.no !== i + 1) fail('numbering ' + q.no); generic(q, 'guide#' + q.no); });
const A = n => G[n - 1], ans = n => A(n).blanks[A(n).blanks.length - 1].answer;
if (plain(A(1).choices[A(1).answer]) !== 'B. -8') fail('Quiz #1');
if (JSON.stringify(A(2).correct) !== '[2,4]') fail('Quiz #2A');
if (ans(3) !== 5) fail('Quiz #2B');
if (!near(ans(4), 3.75)) fail('Quiz #3');
if (!near(ans(5), -10/3)) fail('Quiz #4 first'); if (!near(ans(5), exVal(A(5)))) fail('Quiz #4 first vs shown');
if (!near(ans(6), 11/8)) fail('Quiz #4 second'); if (!near(ans(6), exVal(A(6)))) fail('Quiz #4 second vs shown ' + exPlain(A(6)));
[7,8].forEach(n => { const c = A(n).choices[A(n).answer]; if (!/data-arr="0>8,8>5"/.test(c)) fail('Quiz #5 model ' + n); A(n).choices.forEach((x,k) => { if (k !== A(n).answer && /data-arr="0>8,8>5"/.test(x)) fail('Quiz #5 dup right model'); }); });
if (plain(A(7).prompt).indexOf('8 - 3') < 0 || plain(A(8).prompt).indexOf('8 + (-3)') < 0) fail('Quiz #5 prompts');
if (plain(A(9).choices[A(9).answer]) !== '-5.2 + 9') fail('Quiz #6A');
if (!near(ans(10), 3.8) || !near(ans(10), exVal(A(10)))) fail('Quiz #6B');
const lesson = {11:-4, 12:-4.97, 15:-30.48, 16:2.75, 17:-8.02, 18:-4.625, 19:-47/6, 20:0.4, 21:-2.79, 22:4/15, 23:3.69};
Object.entries(lesson).forEach(([n, v]) => { if (!near(ans(+n), v)) fail(`Lesson item ${n}: ${ans(+n)} vs ${v}`); if (exPlain(A(+n)) != null && !near(exVal(A(+n)), v)) fail(`Lesson item ${n} shown expr ${exPlain(A(+n))}`); });
if (!/^Yes/.test(A(13).choices[A(13).answer])) fail('Lesson #3'); if (!/−17\.75/.test(A(14).choices[A(14).answer])) fail('Lesson #4');
for (let n = 16; n <= 23; n++){ const e = A(n).blanks[0]; if (e.tol !== 1.5 || e.answer !== ans(n)) fail('estimate blank ' + n); }
let tot = 0; G.forEach(q => tot += T.partMax(q)); console.log('guide points', tot);
G.forEach(q => { let r; if (q.type === 'mc') r = q.answer; else if (q.type === 'num') r = q.blanks.map(b => b.tol ? String(Math.round(b.answer)) : typed(b.answer)); else r = q.correct.slice(); const g = T.grade(q, r); if (g.got !== g.max) fail('perfect grade #' + q.no + ' ' + JSON.stringify(r)); });
G.filter(q => q.type === 'multi').forEach(q => { if (T.grade(q, q.correct.slice(0,1)).got !== 0) fail('choose-all gives credit for half'); });
/* parser */
[['-3 1/3', -10/3], ['−3 1/3', -10/3], ['-10/3', -10/3], ['3.8', 3.8], ['-.5', -.5], ['7', 7], ['4/15', 4/15]].forEach(([s, v]) => { if (!near(T.parseNum(s), v)) fail('parse ' + s); });
['', '-', '3 1', '1/0', '3 /4 1'].forEach(s => { if (isFinite(T.parseNum(s))) fail('parse should reject ' + s); });

/* 2. generators */
const nums = html => [...plain(html).matchAll(/-?\d+ \d+\/\d+|-?\d+\/\d+|-?\d+(?:\.\d+)?/g)].map(m => evalExpr(m[0]));
const bolds = html => [...String(html).matchAll(/<b>(.*?)<\/b>/g)].map(m => nums(m[1])[0]).filter(v => v != null);
const N = 3000;
for (let it = 0; it < N; it++){
  for (let s = 1; s <= 8; s++){
    const q = T.GENS[s](); generic(q, 'gen' + s); if (q.skill !== s) fail('skill tag ' + s);
    const ev = exPlain(q) != null ? exVal(q) : null;
    if (q.type === 'num' && ev != null && !near(q.blanks[0].answer, ev)) fail(`gen${s} answer ${q.blanks[0].answer} vs shown ${exPlain(q)} = ${ev}`);
    if (q.type === 'num' && Math.abs(q.blanks[0].answer) > 60) fail('gen' + s + ' huge ' + q.blanks[0].answer);
    if (s === 1 && q.type === 'mc'){
      const m = exPlain(q).match(/^(-?\d+) ([+-]) (\(?-?\d+\)?)$/); const a = +m[1], e = ev;
      if (!q.choices[q.answer].includes(`data-arr="0>${a},${a}>${e}"`)) fail('line model ' + exPlain(q));
      q.choices.forEach((c,k) => { if (k !== q.answer && c.includes(`data-arr="0>${a},${a}>${e}"`)) fail('line model dup'); });
    }
    if (s === 1 && q.type === 'num' && Math.abs(ev) > 10) fail('off the line ' + ev);
    if (s === 2){ let want; const m = (q.fig || '').match(/data-pts="A=(-?[\d.]+),B=(-?[\d.]+)"/); if (m) want = Math.abs(+m[2] - +m[1]); else { const v = bolds(q.ctx); want = Math.abs(v[1] - v[0]); } if (!near(q.blanks[0].answer, want)) fail('distance ' + q.blanks[0].answer + ' vs ' + want); if (q.blanks[0].answer <= 0) fail('distance not positive'); }
    if (s === 4 && q.type === 'mc' && (ev < 0 ? 1 : 0) !== q.answer) fail('sign mc');
    if (s === 3 && q.type === 'num'){ const p = exPlain(q).split(' + '); if ((p[0][0] === '-') !== (p[1].includes('-'))) fail('same signs not same ' + exPlain(q)); }
    if (s === 4 && q.type === 'num'){ const p = exPlain(q).split(' + '); if ((p[0][0] === '-') === (p[1].includes('-'))) fail('opposite signs not opposite ' + exPlain(q)); }
    if (s === 5){ const m = exPlain(q).match(/^(.+) ([+-]) (.+)$/), a = evalExpr(m[1]), b = evalExpr(m[3]); const r = x => x < 0 ? -Math.round(-x) : Math.round(x); const est = m[2] === '+' ? r(a) + r(b) : r(a) - r(b);
      if (plain(q.choices[q.answer]) !== 'about ' + est) fail('estimate ' + exPlain(q) + ' ' + plain(q.choices[q.answer]) + ' vs ' + est); if (Math.abs(ev - est) >= 1.5) fail('estimate far'); }
    if (s === 6 && q.type === 'mc'){ if (q.kcc){ const v = evalExpr(plain(q.choices[q.answer])); if (!near(v, ev)) fail('kcc rewrite value'); q.choices.forEach((c,k) => { if (k !== q.answer && near(evalExpr(plain(c)), ev)) fail('kcc distractor equal ' + plain(c)); }); if (!/ \+ /.test(plain(q.choices[q.answer]))) fail('kcc not addition'); } else if (!near(evalExpr(plain(q.choices[q.answer])), ev)) fail('kcc evaluate'); }
    if (q.type === 'multi'){ let target = ev; if (s === 8){ const v = bolds(q.ctx); target = v[1] + v[0]; if (!/decreased/.test(q.ctx)) fail('choose-all story'); }
      const want = q.choices.map((c,k) => near(evalExpr(plain(c)), target) ? k : -1).filter(k => k >= 0); if (JSON.stringify(want) !== JSON.stringify(q.correct)) fail(`choose-all ${JSON.stringify(q.choices.map(plain))} target ${target} want ${want} got ${q.correct}`); }
    if (s === 8 && q.type === 'num'){ const v = bolds(q.ctx), got = q.blanks[0].answer; let want;
      if (q.tpl === 'fwd') want = /rose/.test(q.ctx) ? v[v.length - 2] + v[v.length - 1] : v[v.length - 2] - v[v.length - 1];
      else if (q.tpl === 'back') want = /rose/.test(q.ctx) ? v[1] - v[0] : v[1] + v[0];
      else if (q.tpl === 'dive') want = v[0] + v[1];
      else if (q.tpl === 'bank') { const d = [...plain(q.ctx).matchAll(/(-?)\$(\d+(?:\.\d+)?)/g)].map(m => (m[1] ? -1 : 1) * +m[2]); want = d[0] + d[1]; }
      if (!near(got, want)) fail(`word ${q.tpl} ${plain(q.ctx)} → ${got} vs ${want}`); }
  }
  const b = T.buildBoss(); if (b.length !== 15) fail('boss length'); b.forEach((q,k) => generic(q, 'boss' + k));
}
console.log(bad ? bad + ' FAILURES' : `all OK: 23 quiz/lesson items match the key; ${N * 8} generated questions + ${N} boss quizzes re-solved independently`);
