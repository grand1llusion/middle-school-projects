/* Content check: the practice-test key item by item, then thousands of generated questions re-solved
   with an independent fraction calculator that reads the numbers back out of what the student sees.
   Run: NODE_PATH=<folder with jsdom>/node_modules node tests/gen-check.js */
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path');
const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(path.resolve(__dirname, '../build/_test.html'), 'utf8').replace(/<link[^>]*>/, '') + '</body></html>';
const errs = [];
const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.test/', beforeParse(w){ w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {}; w.setTimeout = () => 0; w.setInterval = () => 0; w.addEventListener('error', e => errs.push('ERR ' + e.message)); }});
const T = dom.window.__T, C = T.cur();
const bad = (m) => { if (errs.length < 60) errs.push(m); };

/* ---- an independent fraction calculator ---- */
const g = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const F = (n, d = 1) => { if (!d) throw new Error('divide by 0'); if (d < 0){ n = -n; d = -d; } const k = g(n, d); return [n / k, d / k]; };
const add = (x, y) => F(x[0] * y[1] + y[0] * x[1], x[1] * y[1]), sub = (x, y) => F(x[0] * y[1] - y[0] * x[1], x[1] * y[1]), mul = (x, y) => F(x[0] * y[0], x[1] * y[1]), div = (x, y) => F(x[0] * y[1], x[1] * y[0]);
const eq = (x, y) => x[0] * y[1] === y[0] * x[1], val = x => x[0] / x[1];
function calc(str){
  const toks = []; const re = /(\d+) (\d+)\/(\d+)|(\d+)\/(\d+)|(\d+)|([+\-×÷()])/g; let m; const s = str.replace(/−/g, '-');
  const rest = s.replace(re, '').replace(/\s+/g, ''); if (rest) throw new Error('cannot read "' + str + '" (left: ' + rest + ')');
  while ((m = re.exec(s))){ if (m[1]) toks.push(F(+m[1] * +m[3] + +m[2], +m[3])); else if (m[4]) toks.push(F(+m[4], +m[5])); else if (m[6]) toks.push(F(+m[6])); else toks.push(m[7]); }
  let i = 0;
  const atom = () => { const t = toks[i++]; if (t === '('){ const v = sum(); if (toks[i++] !== ')') throw new Error('paren'); return v; } if (Array.isArray(t)) return t; throw new Error('bad token ' + t); };
  const prod = () => { let v = atom(); while (toks[i] === '×' || toks[i] === '÷'){ const op = toks[i++], r = atom(); v = op === '×' ? mul(v, r) : div(v, r); } return v; };
  const sum = () => { let v = prod(); while (toks[i] === '+' || toks[i] === '-'){ const op = toks[i++], r = prod(); v = op === '+' ? add(v, r) : sub(v, r); } return v; };
  const v = sum(); if (i !== toks.length) throw new Error('extra tokens in ' + str); return v;
}
/* what the student sees, as plain text: stacked fractions become 3/4 and 6 20/21 */
const txt = h => String(h || '').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/(\d+)<span class="fr"><i>(\d+)<\/i><i>(\d+)<\/i><\/span>/g, '$1 $2/$3').replace(/<span class="fr"><i>([^<]+)<\/i><i>([^<]+)<\/i><\/span>/g, '$1/$2').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const choiceVal = c => calc(txt(c).replace(/^[A-F]\. /, '').replace(/^about /, ''));
const literals = e => (e.replace(/−/g, '-').match(/\d+ \d+\/\d+|\d+\/\d+|\d+/g) || []);
const toks = t => { const out = []; (t.match(/\d+ \d+\/\d+|\d+\/\d+|\d+/g) || []).forEach(x => { out.push(x); if (/\D/.test(x)) x.split(/[ /]/).forEach(y => out.push('part:' + y)); }); return out; };
/* every number in the expression must be on screen: fractions and mixed numbers exactly, whole numbers on their own or inside a fraction */
const hasAll = (e, shown, where) => { const sh = toks(shown); literals(e).forEach(l => { if (!sh.includes(l) && !(/^\d+$/.test(l) && sh.includes('part:' + l))) bad(`${where}: "${l}" from ${e} is not shown in: ${shown.slice(0, 140)}`); }); };
const BADTXT = /NaN|undefined|\[object|Infinity|\bnull\b/;

/* ---- 1 · the practice test and twins, against the key ---- */
const G = C.GUIDE, KEY = {
  1:{mc:2}, 2:{v:[11,9]}, 3:{v:[146,21]}, 4:{v:[17,24]}, 5:{v:[341,30]}, 6:{v:[79,12]}, 7:{all:[2,3,5]}, 8:{mc:1}, 9:{mc:2}, 10:{mc:1}, 11:{mc:0}, 12:{mc:2}, 13:{v:[1,6]}, 14:{v:[45,8]}, 15:{box:[11,12]}, 16:{v:[17,3]}, 17:{rows:[0,0,1,2,2]},
  18:{mc:1}, 19:{v:[11,8]}, 20:{v:[71,10]}, 21:{v:[29,12]}, 22:{v:[61,12]}, 23:{v:[25,6]}, 24:{all:[1,2,4,5]}, 25:{mc:3}, 26:{mc:0}, 27:{v:[5,12]}, 28:{v:[15,8]}, 29:{box:[7,12]}, 30:{v:[11,2]}
};
if (G.length !== 30) bad('guide has ' + G.length + ' items');
/* the key itself, worked out here from the test's own numbers */
const SOLVE = {2:'5/9 + 2/3', 3:'1 2/3 + 5 2/7', 4:'7 3/8 − 6 2/3', 5:'(6 2/3 − 8/5) + 6 3/10', 6:'16 ÷ 3 + 1 1/4', 13:'1/2 − 1/3', 14:'3 5/8 + 3 5/8 + 3/4 − 2 3/8', 16:'1 5/6 + 1 1/3 + 2 1/2',
  19:'3/4 + 5/8', 20:'2 3/5 + 4 1/2', 21:'5 1/4 − 2 5/6', 22:'(4 1/2 − 7/4) + 2 1/3', 23:'14 ÷ 4 + 2/3', 27:'3/4 − 1/3', 28:'2 3/4 + 2 3/4 + 1/2 − 4 1/8', 30:'1 1/2 + 2 1/4 + 1 3/4'};
G.forEach((p, i) => {
  const k = KEY[p.no], where = `guide #${p.no}`; if (p.no !== i + 1) bad(where + ' out of order');
  [p.prompt, p.ctx, p.why, ...(p.choices || [])].forEach(t => { if (BADTXT.test(txt(t))) bad(where + ' bad text'); });
  if (k.mc != null){ if (p.answer !== k.mc) bad(where + ' answer ' + p.answer); }
  if (k.v){ const b = p.blanks[0]; if (Math.abs(b.answer - val(k.v)) > 1e-9) bad(where + ' blank ' + b.answer); if (SOLVE[p.no] && !eq(calc(SOLVE[p.no]), k.v)) bad(where + ' key disagrees with the test: ' + SOLVE[p.no]); if (!eq(calc(txt(b.show).replace(/ \(.*\)$/, '')), k.v)) bad(where + ' shown answer ' + txt(b.show)); if (SOLVE[p.no] && p.no !== 6 && p.no !== 14 && p.no !== 16 && p.no !== 23 && p.no !== 28 && p.no !== 30) hasAll(SOLVE[p.no], txt(p.prompt), where); }
  if (k.all){ if (JSON.stringify(p.correct) !== JSON.stringify(k.all)) bad(where + ' correct ' + p.correct); const want = p.no === 7 ? calc('8 ÷ 6') : calc('9 ÷ 4'); p.choices.forEach((c, j) => { if (eq(choiceVal(c), want) !== k.all.includes(j)) bad(where + ' choice ' + j + ' value'); }); }
  if (k.rows){ if (JSON.stringify(p.rows.map(r => r.a)) !== JSON.stringify(k.rows)) bad(where + ' rows ' + p.rows.map(r => r.a)); }
  if (k.box){ if (p.target.n !== k.box[0] || p.target.d !== k.box[1]) bad(where + ' target'); if (!T.boxesRight(p, p.sol)) bad(where + ' sol does not work'); if (T.boxesRight(p, [1,1,1,1])) bad(where + ' 1/1 + 1/1 should not work');
    const sols = []; for (const a of p.tiles) for (const b of p.tiles) for (const c of p.tiles) for (const d of p.tiles) if (T.boxesRight(p, [a, b, c, d])) sols.push([a, b, c, d]);
    sols.forEach(s => { if (!eq(add(F(s[0], s[1]), F(s[2], s[3])), k.box)) bad(where + ' accepts a wrong pair ' + s); }); console.log(`${where}: ${sols.length} ways accepted, e.g. ${sols.slice(0, 4).map(s => s[0] + '/' + s[1] + ' + ' + s[2] + '/' + s[3]).join(', ')}`); }
  /* a perfect response grades full marks */
  const r = p.type === 'mc' ? p.answer : p.type === 'num' ? p.blanks.map(b => { const v = b.answer; for (let dd = 1; dd < 50; dd++) if (Math.abs(v * dd - Math.round(v * dd)) < 1e-9) return `${Math.round(v * dd)}/${dd}`; }) : p.type === 'rows' ? p.rows.map(x => x.a) : p.type === 'boxes' ? p.sol : p.correct;
  const gr = T.grade(p, r); if (gr.got !== gr.max) bad(where + ' perfect response scores ' + gr.got + '/' + gr.max);
});
/* the Q1 choices: only C is 23/40, and the twin's only B is 11/12 */
[[0, '(1 ÷ 5) + (3 ÷ 8)'], [17, '(2 ÷ 3) + (1 ÷ 4)']].forEach(([i, e]) => G[i].choices.forEach((c, j) => { if (eq(choiceVal(c), calc(e)) !== (j === G[i].answer)) bad('guide #' + (i + 1) + ' choice ' + j); }));
const total = G.reduce((s, p) => s + T.partMax(p), 0);

/* ---- 2 · generators, re-solved ---- */
const N_EACH = 3000, kinds = {};
const DETK = T.DETK;
for (const id of Object.keys(T.GENS)){
  for (let t = 0; t < N_EACH; t++){
    const p = T.GENS[id](), where = `gen ${id} ${p.kind} ${p.title}`, shown = txt((p.ctx || '') + ' ' + p.prompt);
    kinds[id + ':' + p.kind] = (kinds[id + ':' + p.kind] || 0) + 1;
    try {
      if (p.skill !== +id) bad(where + ' wrong skill ' + p.skill);
      [p.prompt, p.ctx, p.why, ...(p.choices || []), ...(p.blanks || []).map(b => b.show)].forEach(s => { if (BADTXT.test(txt(s)) || /undefined|NaN/.test(String(s || '').replace(/<svg[\s\S]*?<\/svg>/g, ''))) bad(where + ' bad text: ' + txt(s).slice(0, 80)); });
      if (p.choices){ if (new Set(p.choices).size !== p.choices.length) bad(where + ' duplicate choices'); if (p.type === 'mc' && !(p.answer >= 0 && p.answer < p.choices.length)) bad(where + ' answer out of range'); }
      const e = p.chk && p.chk.e, want = e ? calc(e) : null;
      if (want && val(want) <= 0) bad(where + ' answer not positive: ' + e);
      if (p.kind === 'num' || p.kind === 'story'){
        if (Math.abs(p.blanks[0].answer - val(want)) > 1e-9) bad(where + ' answer ' + p.blanks[0].answer + ' vs ' + e);
        if (!eq(calc(txt(p.blanks[0].show)), want)) bad(where + ' shown answer ' + txt(p.blanks[0].show));
        hasAll(e, shown, where);
      } else if (p.kind === 'mcval'){
        p.choices.forEach((c, j) => { if (eq(choiceVal(c), want) !== (j === p.answer)) bad(where + ' choice ' + j + ' (' + txt(c) + ') vs ' + e); }); hasAll(e, shown, where);
      } else if (p.kind === 'all'){
        p.choices.forEach((c, j) => { if (eq(choiceVal(c), want) !== p.correct.includes(j)) bad(where + ' choose-all ' + txt(c)); });
        if (p.correct.length < 2 || p.correct.length === p.choices.length) bad(where + ' choose-all count'); hasAll(e, shown, where);
      } else if (p.kind === 'eqv'){
        const { n, d, D } = p.chk; if (p.blanks[0].answer !== n * D / d || (n * D) % d) bad(where + ' eqv'); if (!shown.includes(`${n}/${d}`) || !shown.includes(`?/${D}`)) bad(where + ' eqv prompt ' + shown);
      } else if (p.kind === 'pairs'){
        const a = p.chk.a, b = p.chk.b; let n = 0;
        p.choices.forEach((c, j) => { const m = txt(c).match(/^(\d+)\/(\d+) and (\d+)\/(\d+)$/); const ok = m && eq(F(+m[1], +m[2]), a) && eq(F(+m[3], +m[4]), b) && m[2] === m[4]; if (ok){ n++; if (j !== p.answer) bad(where + ' right pair not marked'); } });
        if (n !== 1) bad(where + ' right pairs ' + n);
      } else if (p.kind === 'bars'){
        let n = 0;
        p.choices.forEach((c, j) => { const [[p1, o1], [p2, o2]] = c.match(/data-bars="([^"]+)"/)[1].split(',').map(x => x.split(':').map(Number)); const ok = p1 === p2 && eq(F(o1, p1), p.chk.a) && eq(F(o2, p2), p.chk.b); if (ok){ n++; if (j !== p.answer) bad(where + ' model not marked'); } });
        if (n !== 1) bad(where + ' right models ' + n);
      } else if (p.kind === 'unit'){
        const { d1, d2, vals } = p.chk; vals.forEach((v, j) => { if ((v % d1 === 0 && v % d2 === 0) !== (j === p.answer)) bad(where + ' unit ' + v); if (!/s$/.test(p.choices[j])) bad(where + ' unit name ' + p.choices[j]); });
      } else if (p.kind === 'boxes'){
        const tg = [p.target.n, p.target.d]; if (!eq(add(F(p.sol[0], p.sol[1]), F(p.sol[2], p.sol[3])), tg) || !T.boxesRight(p, p.sol)) bad(where + ' boxes sol'); if (!p.sol.every(v => p.tiles.includes(v))) bad(where + ' tiles');
        if (T.boxesRight(p, [1, 1, 1, 1]) || T.boxesRight(p, [p.sol[0], p.sol[1] + p.sol[3], p.sol[2], p.sol[1] + p.sol[3]])) bad(where + ' accepts a wrong build');
      } else if (p.kind === 'rename'){
        const a = p.chk.a; p.chk.vals.forEach((v, j) => { if (eq(v, a) !== (j === p.answer)) bad(where + ' rename choice ' + j); if (!eq(choiceVal(p.choices[j]), v)) bad(where + ' rename shows ' + txt(p.choices[j])); });
      } else if (p.kind === 'bench'){
        const f = p.chk.f, v = val(f), ds = [v, Math.abs(v - .5), 1 - v], near = ds.indexOf(Math.min(...ds)), s = ds.slice().sort((x, y) => x - y);
        if (near !== p.answer || s[1] - s[0] < 1 / 12 - 1e-9) bad(where + ' benchmark ' + f); if (!shown.includes(`${f[0]}/${f[1]}`)) bad(where + ' bench prompt');
      } else if (p.kind === 'cmp'){
        const tots = p.chk.sets.map(s => s.reduce((acc, x) => add(acc, x), F(0))), win = val(tots[0]) > val(tots[1]) ? 0 : 1, nm = p.chk.names[win];
        if (val(tots[0]) === val(tots[1])) bad(where + ' tie'); if (!txt(p.choices[p.answer]).startsWith(nm[0].toUpperCase() + nm.slice(1))) bad(where + ' winner ' + txt(p.choices[p.answer]));
        p.chk.sets.flat().forEach(x => { const lit = x[0] % x[1] ? (Math.floor(x[0] / x[1]) ? `${Math.floor(x[0] / x[1])} ${x[0] % x[1]}/${x[1]}` : `${x[0]}/${x[1]}`) : String(x[0] / x[1]); if (!shown.includes(lit)) bad(where + ' length not shown ' + lit); });
        const W = p.chk.sets.map(s => s.reduce((acc, x) => acc + Math.floor(x[0] / x[1]), 0)); if (W[0] !== W[1]) bad(where + ' wholes differ');
      } else if (p.kind === 'vs1'){
        const s = add(p.chk.a, p.chk.b); if ((val(s) < 1 ? 0 : 1) !== p.answer || val(s) === 1) bad(where + ' vs1'); const sides = [p.chk.a, p.chk.b].map(x => val(x) < .5); if (sides[0] !== sides[1]) bad(where + ' vs1 not decidable by ½');
      } else if (p.kind === 'est'){
        const s = val(add(p.chk.a, p.chk.b)), d = p.chk.vals.map(v => Math.abs(s - v)), best = d.indexOf(Math.min(...d)); if (best !== p.answer || d.filter(x => x === d[best]).length > 1) bad(where + ' estimate'); if (p.chk.vals.some(v => v <= 0)) bad(where + ' estimate ≤ 0');
      } else if (p.kind === 'det'){
        const fin = p.chk.fin, right = calc(p.chk.e); if ((p.chk.type === 'ok') !== eq(fin, right)) bad(where + ' detective ' + p.chk.type); if (p.answer !== DETK.indexOf(p.chk.type)) bad(where + ' detective answer');
        const lines = txt(p.ctx).match(/Line \d+: [^L]+/g) || []; const last = lines[lines.length - 1].replace(/^Line \d+: = ?/, '').replace(/ cup.*$/, '').trim(); if (!eq(calc(last.split(' = ').pop()), fin)) bad(where + ' last line ' + last);
      } else bad(where + ' unknown kind ' + p.kind);
    } catch (ex){ bad(where + ' THREW ' + ex.message); }
  }
}
for (let t = 0; t < 2000; t++){ const B = C.buildBoss(); if (B.length !== 15) bad('boss size'); const sk = new Set(B.map(p => p.skill)); if (sk.size !== 9) bad('boss misses a skill'); }

/* ---- 3 · round games ---- */
for (const Gm of C.GAMES.filter(x => x.gen)) for (let t = 0; t < 3000; t++){
  const q = Gm.gen(), where = 'game ' + Gm.id;
  if (new Set(q.choices).size !== q.choices.length) bad(where + ' dup choices'); if (!(q.answer >= 0)) bad(where + ' no answer');
  if (Gm.id === 'half'){ const v = q.val; const right = v[2] === 'h' ? (v[0] / v[1] > .5 ? 1 : 0) : (val(add(F(v[0], v[1]), F(v[2], v[3]))) < 1 ? 0 : 1); if (right !== q.answer) bad(where + ' ' + v); }
  if (Gm.id === 'pizza'){ if (!eq(choiceVal(q.choices[q.answer]), F(q.val[0], q.val[1]))) bad(where); q.choices.forEach((c, j) => { if (j !== q.answer && eq(choiceVal(c), F(q.val[0], q.val[1]))) bad(where + ' two right'); }); }
  if (Gm.id === 'potion'){ const [an, ad, tn, td] = q.val, need = sub(F(tn, td), F(an, ad)); q.choices.forEach((c, j) => { if (eq(choiceVal(c), need) !== (j === q.answer)) bad(where + ' choice ' + txt(c)); }); }
}
/* every word in the match game and every card has text */
Object.entries(C.SHORT).forEach(([k, v]) => { if (!k || !v) bad('short'); }); C.CARDS.forEach(c => { if (!T.SK[c[0]] || BADTXT.test(txt(c[1] + c[2]))) bad('card ' + c[1]); });

console.log('generated kinds:', Object.entries(kinds).map(([k, v]) => k + '=' + v).join(' '));
console.log(errs.length ? errs.join('\n') : `all OK: ${G.length} study-guide items (${total} points) match the key; ${Object.keys(T.GENS).length * N_EACH} generated questions + 2000 boss quizzes + 9000 game rounds re-solved independently`);
