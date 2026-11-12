/* Content check for the Plus & Minus Lab.
   - every practice-quiz and Lesson 6 answer against the key (quiz) or hand-worked answers (lesson)
   - every generator, thousands of times, re-solved from what is SHOWN, with a separate evaluator
   Run: node tests/gen-check.js */
const fs = require('fs'), vm = require('vm'), path = require('path'); const dir = path.resolve(__dirname, '..') + '/';
const src = ['s-core.js','s-data.js','s-mdata.js','s-gen.js','s-mgen.js','s-engine.js','s-learn.js','s-mlearn.js','s-games.js','s-mgames.js'].map(f => fs.readFileSync(dir + f, 'utf8')).join('\n') + '\n;this.T={GENS,GUIDE:GUIDE_C,PARTS:PARTS_C,buildBoss:buildBossC,GUIDE_M,PARTS_M,buildBossM,partMax,grade,isRight,parseNum,answerText,GAMES_M,CARDS_M,CARDS_C,SK,MSTEPS};';
const ctx = {console, Math, Object, Array, JSON, Set, Number, String, isFinite, Date, document:{querySelector(){ return null; }, querySelectorAll(){ return []; }}}; vm.createContext(ctx); vm.runInContext(src, ctx);
const T = ctx.T; let bad = 0; const fail = m => { if (bad++ < 40) console.log('FAIL', m); };
const near = (a, b, e = 1e-9) => Math.abs(a - b) < e;

/* independent evaluator for what the student sees */
const plain = html => String(html).replace(/(\d)<span class="fr"><i>(\d+)<\/i><i>(\d+)<\/i><\/span>/g, '$1 $2/$3').replace(/<span class="fr"><i>(\d+)<\/i><i>(\d+)<\/i><\/span>/g, '$1/$2').replace(/<[^>]+>/g, '').replace(/−/g, '-').replace(/\s+/g, ' ').trim();
function evalExpr(s){
  let i = 0; const t = s;
  const ws = () => { while (t[i] === ' ') i++; };
  const num = () => { ws(); const m = t.slice(i).match(/^(\d+) (\d+)\/(\d+)|^(\d+)\/(\d+)|^(\d+(?:\.\d+)?)/); if (!m) throw new Error('bad number at ' + i + ' in ' + s); i += m[0].length; return m[1] ? +m[1] + m[2] / m[3] : m[4] ? m[4] / m[5] : +m[6]; };
  const unary = () => { ws(); if (t[i] === '-'){ i++; return -unary(); } if (t[i] === '('){ i++; const v = expr(); ws(); if (t[i++] !== ')') throw new Error('paren ' + s); return v; } return num(); };
  const term = () => { let v = unary(); for (;;){ ws(); const c = t[i]; if (c === '·' || c === '×'){ i++; v *= unary(); } else if (c === '÷'){ i++; v /= unary(); } else if (c === '('){ v *= unary(); } else return v; } };
  const expr = () => { let v = term(); for (;;){ ws(); if (t[i] === '+'){ i++; v += term(); } else if (t[i] === '-'){ i++; v -= term(); } else return v; } };
  const v = expr(); ws(); if (i !== t.length) throw new Error('leftover in ' + s + ' at ' + i); return v;
};
const exOf = q => { const m = String(q.prompt).match(/<span class="ex">(.*?)<\/span>(?!<\/i>)/); return m ? evalExpr(plain(m[1].replace(/<span class="fr">(<i>\d+<\/i><i>\d+<\/i>)<\/span>/g, '<span class="fr">$1</span>'))) : null; };
const exPlain = q => { const s = String(q.prompt), a = s.indexOf('<span class="ex">'); if (a < 0) return null; let depth = 0, k = a; for (; k < s.length; k++){ if (s.startsWith('<span', k)) depth++; else if (s.startsWith('</span>', k)){ depth--; if (!depth) break; } } return plain(s.slice(a, k + 7)); };
const exVal = q => { const p = exPlain(q); return p == null ? null : evalExpr(p); };
const N0 = v => (v < 0 ? '−' : '') + String(Math.abs(Math.round(v * 1000) / 1000));
const typed = v => { for (let d = 1; d <= 60; d++){ const n = v * d; if (Math.abs(n - Math.round(n)) < 1e-9){ const N0 = Math.round(Math.abs(n)), w = Math.floor(N0 / d), r = N0 % d, sg = v < 0 ? '-' : ''; if (d === 1) return sg + N0; if ([2,4,5,8,10,20,25,50].includes(d) && Math.random() < .5) return sg + String(Math.abs(v)); return sg + (w ? `${w} ${r}/${d}` : `${r}/${d}`); } } return String(v); };

function generic(q, tag){
  const s = JSON.stringify(q).replace(/is <b>undefined<\/b>|is undefined|Undefined/g, ''); if (/NaN|undefined|Infinity|\[object|\bnull\b/.test(s)) fail(tag + ' bad text ' + (s.match(/.{40}(NaN|undefined|Infinity|\[object|null).{20}/) || [s.slice(0,120)])[0]);
  if (!q.why || !q.prompt || !q.skill || !q.title) fail(tag + ' missing fields');
  if (q.type === 'mc'){ if (!(q.answer >= 0 && q.answer < q.choices.length)) fail(tag + ' mc idx'); if (new Set(q.choices.map(plain)).size !== q.choices.length && q.layout !== 'viz') fail(tag + ' dup ' + q.choices.map(plain).join(' | ')); if (q.layout === 'viz' && new Set(q.choices).size !== q.choices.length) fail(tag + ' dup models'); }
  else if (q.type === 'num'){ q.blanks.forEach(b => { if (!isFinite(b.answer)) fail(tag + ' num'); if (!T.isRight(typed(b.answer), b)) fail(tag + ' correct typed not accepted ' + typed(b.answer)); if (T.isRight(String(Math.round(b.answer) + 7), b)) fail(tag + ' wrong accepted'); }); }
  else if (q.type === 'multi'){ if (!q.all) fail(tag + ' expected all-mode'); if (!q.correct.length) fail(tag + ' no correct'); if (new Set(q.choices.map(plain)).size !== q.choices.length) fail(tag + ' multi dup'); }
  else if (q.type === 'rows'){ q.rows.forEach(r => { if (!(r.a >= 0 && r.a < r.opts.length) || new Set(r.opts).size !== r.opts.length) fail(tag + ' rows'); }); }
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

/* ===================== MULT · DIV ===================== */
const GM = T.GUIDE_M; if (GM.length !== 52) fail('mult guide length ' + GM.length);
GM.forEach((q, i) => { if (q.no !== i + 1) fail('mult numbering ' + q.no); generic(q, 'mguide#' + q.no); });
const M = n => GM[n - 1], mans = n => M(n).blanks.map(b => b.answer), letter = c => plain(c).replace(/^[A-J]\. /, '');
const exExpr = q => exPlain(q);
if (!M(1).choices[M(1).answer].includes('data-arr="0>-7,-7>-14,-14>-21"')) fail('M1 model');
[[2,'-7 + (-7) + (-7)',-21],[3,'3(-7)',-21],[5,'-10 + (-10) + (-10)',-30],[6,'3(-10)',-30]].forEach(([n, want, v]) => { const c = plain(M(n).choices[M(n).answer]); if (c !== want) fail(`M${n} ${c}`); if (!near(evalExpr(c), v)) fail('M' + n + ' value'); M(n).choices.forEach((x,k) => { if (k !== M(n).answer && /^[-\d(]/.test(plain(x)) && near(evalExpr(plain(x)), v)) fail(`M${n} distractor equal ${plain(x)}`); }); });
if (!/^Yes/.test(M(4).choices[0]) || M(4).answer !== 0) fail('M4'); if (!/−18$/.test(M(9).choices[M(9).answer])) fail('M9'); if (M(11).choices[M(11).answer] !== 'C. Both') fail('M11'); if (!/^Yes/.test(M(44).choices[M(44).answer])) fail('M44'); if (!/^No\./.test(M(20).choices[M(20).answer])) fail('M20'); if (M(50).answer !== 0) fail('M50');
const want = {7:[-30], 8:[-18], 10:[-6], 12:[-12], 13:[-12], 14:[3,6], 21:[24,-24], 24:[30], 25:[90], 27:[-18], 30:[-1/8], 31:[1.24], 32:[-33/20], 34:[10], 35:[-4.5], 36:[-9], 37:[-26], 38:[-9.45], 39:[-39/8], 40:[-2.58], 41:[105], 42:[161/24], 43:[96/5], 45:[-4], 46:[5], 47:[-7], 49:[-3], 51:[-30], 52:[-9]};
Object.entries(want).forEach(([n, v]) => { const a = mans(+n); if (a.length !== v.length || a.some((x,k) => !near(x, v[k]))) fail(`M${n} answers ${a} vs ${v}`); const e = exExpr(M(+n)); if (e != null && a.length === 1 && !near(evalExpr(e), a[0])) fail(`M${n} shown ${e} = ${evalExpr(e)}`); });
if (!near(evalExpr('3(-3)') , -9) || !near(evalExpr('-1(-3)'), 3) || !near(evalExpr('-(-4(-2)(3)(5)(-1))'), 120) || !near(evalExpr('2/5(-4 1/8)'), -33/20) || !near(evalExpr('-24 ÷ (-6)'), 4) || !near(evalExpr('-3 · 5 · 4'), -60)) fail('evaluator');
[16,17,18,19,26,33].forEach(n => { const e = exExpr(M(n)); const v = evalExpr(e); if ((v < 0 ? 1 : 0) !== M(n).answer) fail(`M${n} sign of ${e}`); });
{ const r = M(15).rows.map(x => x.opts[x.a]); if (r.join('|') !== '0|3|−6|6') fail('M15 ' + r); }
[22, 28].forEach(n => M(n).rows.forEach(r => { const v = evalExpr(r.h.replace(/−/g,'-')); if ((v < 0 ? 1 : 0) !== r.a) fail(`M${n} row ${r.h}`); }));
[[23,'-3(-5)(-4)'],[29,'-2(-3)(-1)']].forEach(([n, tgt]) => { const tv = evalExpr(tgt), w = M(n).choices.map((c,k) => near(evalExpr(letter(c)), tv) ? k : -1).filter(k => k >= 0); if (JSON.stringify(w) !== JSON.stringify(M(n).correct)) fail(`M${n} choose-all ${w} vs ${M(n).correct}`); });
const factTrue = c => { const [l, r] = plain(c).split(' = '); return near(evalExpr(l), evalExpr(r)); };
{ const w = M(48).choices.map((c,k) => factTrue(c) ? k : -1).filter(k => k >= 0); if (JSON.stringify(w) !== JSON.stringify(M(48).correct)) fail('M48 facts'); }
let mtot = 0; GM.forEach(q => mtot += T.partMax(q)); console.log('mult guide points', mtot);
GM.forEach(q => { let r; if (q.type === 'mc') r = q.answer; else if (q.type === 'num') r = q.blanks.map(b => typed(b.answer)); else if (q.type === 'rows') r = q.rows.map(x => x.a); else r = q.correct.slice(); const g = T.grade(q, r); if (g.got !== g.max) fail('mult perfect grade #' + q.no + ' ' + JSON.stringify(r)); });
if (T.PARTS_M.reduce((s, p) => s + (p[3] - p[2] + 1), 0) !== 52) fail('parts cover');

for (let it = 0; it < N; it++){
  for (let s = 11; s <= 18; s++){
    const q = T.GENS[s](); if (q.type !== 'rows') generic(q, 'gen' + s); else { if (!q.why || !q.rows.every(r => r.a >= 0 && new Set(r.opts).size === r.opts.length)) fail('rows ' + s); }
    if (q.skill !== s) fail('mult skill tag ' + s);
    const e = exPlain(q), ev = e != null && !e.includes('□') ? evalExpr(e) : null;
    if (q.type === 'num' && ev != null && q.blanks.length === 1 && !near(q.blanks[0].answer, ev)) fail(`gen${s} ${e} = ${ev} vs ${q.blanks[0].answer}`);
    if (q.type === 'num' && q.blanks.some(b => Math.abs(b.answer) > 400)) fail('gen' + s + ' huge');
    if (q.type === 'mc' && q.choices === undefined) fail('no choices');
    if (q.type === 'mc' && q.layout === 'big' && ev != null && (ev < 0 ? 1 : 0) !== q.answer) fail(`gen${s} sign ${e}`);
    if (s === 11 && q.grp){ const shown = evalExpr(plain(q.ctx)); if (!near(shown, q.grp[1])) fail('grp shown'); const c = plain(q.choices[q.answer]); if (!near(evalExpr(c), shown) || !/^\d\(-\d\)$/.test(c)) fail('grp right ' + c); q.choices.forEach((x,k) => { if (k !== q.answer && near(evalExpr(plain(x)), shown)) fail('grp distractor equal'); }); }
    if (s === 11 && q.mean != null){ if (!near(q.mean, ev)) fail('mean value'); if (!plain(q.choices[q.answer]).endsWith('= ' + ev)) fail('mean right'); q.choices.forEach((x,k) => { if (k !== q.answer && plain(x).endsWith('= ' + ev)) fail('mean distractor'); }); }
    if ((s === 11 || s === 15) && q.type === 'num' && q.tpl){ const b = bolds(q.ctx + ' ' + q.prompt), got = q.blanks[0].answer; let w;
      if (q.tpl === 'start') w = b[0] - b[1] * b[2]; else if (q.tpl === 'back') w = b[0] * b[1]; else w = -b[0] * b[1];
      if (!near(got, w)) fail(`story ${q.tpl} ${plain(q.ctx)} → ${got} vs ${w}`); }
    if (s === 12){
      if (q.pat != null){ const k = q.pat; if (!near(q.blanks[0].answer, -k) || !near(q.blanks[1].answer, -2 * k)) fail('pattern'); const shownK = evalExpr(q.fig.match(/<td>3\((−?\d+)\)<\/td>/)[1].replace('−','-')); if (shownK !== k) fail('pattern k'); }
      if (q.pair){ const v1 = evalExpr(q.pair[0].replace(/−/g,'-')), v2 = evalExpr(q.pair[1].replace(/−/g,'-')), c = q.choices[q.answer]; if (/^Yes/.test(c) !== near(v1, v2)) fail('pair verdict'); if (!c.includes(N0(v1))) fail('pair value ' + c); }
      if (q.zp != null && q.choices[q.answer] !== '0') fail('zero product');
      if (q.prove){ const [a, b] = q.prove, wantR = [0, -b, a * -b, a * b], got = q.rows.map(r => evalExpr(r.opts[r.a].replace(/−/g,'-'))); if (JSON.stringify(got) !== JSON.stringify(wantR)) fail('prove ' + got + ' vs ' + wantR); }
    }
    if (s === 14 && q.type === 'multi'){ const tv = evalExpr(q.target.replace(/−/g,'-')), w = q.choices.map((c,k) => near(evalExpr(plain(c)), tv) ? k : -1).filter(k => k >= 0); if (JSON.stringify(w) !== JSON.stringify(q.correct)) fail('count choose-all'); }
    if (s === 17 && q.facts){ const w = q.choices.map((c,k) => factTrue(c) ? k : -1).filter(k => k >= 0); if (JSON.stringify(w) !== JSON.stringify(q.correct)) fail('facts ' + q.choices.map(plain)); }
    if (s === 17 && q.title === 'Zero rules'){ const want0 = /^0 ÷/.test(plain(q.prompt).replace('What is ', '')) ? '0' : 'Undefined'; if (q.choices[q.answer] !== want0) fail('zero rule'); }
    if (s === 18){ const b = bolds(q.ctx), got = q.blanks[0].answer; let w;
      if (q.tpl === 'rate') w = -b[0] / b[1]; else if (q.tpl === 'share') w = -b[1] / b[0]; else if (q.tpl === 'mean') w = b.slice(1).reduce((x,y) => x + y, 0) / b[0];
      if (!near(got, w) || !Number.isInteger(got)) fail(`divide story ${q.tpl} ${plain(q.ctx)} → ${got} vs ${w}`); }
  }
  const bm = T.buildBossM(); if (bm.length !== 15) fail('mult boss length'); bm.forEach((q,k) => { if (q.type !== 'rows') generic(q, 'mboss' + k); });
  T.GAMES_M.filter(G => G.gen).forEach(G => { const q = G.gen(); if (!(q.answer >= 0 && q.answer < q.choices.length)) fail(G.id + ' idx'); if (new Set(q.choices).size !== q.choices.length) fail(G.id + ' dup ' + q.choices); if (/NaN|undefined|null/.test(JSON.stringify(q))) fail(G.id + ' text');
    const e = exPlain(q); if (G.id === 'msign' && (evalExpr(e) < 0 ? 1 : 0) !== q.answer) fail('msign ' + e);
    if (G.id === 'jumps'){ const [n, k] = q.jumps, c = q.choices[q.answer]; if (c !== `${n}(${N0(k)})`) fail('jumps ' + c); }
    if (G.id === 'missing'){ const m = plain(q.prompt).replace(/^🔍 /, ''), v = evalExpr(q.choices[q.answer].replace(/−/g,'-')); const [l, r] = m.split(' = ').map(x => x.replace('□', '(' + v + ')')); if (!near(evalExpr(l), evalExpr(r))) fail('missing ' + m + ' with ' + v); } });
}

console.log(bad ? bad + ' FAILURES' : `all OK: 23 classic + 52 mult/div lesson items match the keys; ${N * 16} generated questions + ${N * 2} boss quizzes re-solved independently`);
