/* Topic D content check: generators re-solved from what is shown; study guide dumped for reading.
   Run: node tests/gen-d.js [dump] */
const fs = require('fs'), vm = require('vm'), path = require('path'); const dir = path.resolve(__dirname, '..') + '/';
const src = ['s-core.js','s-data.js','s-mdata.js','s-ddata.js','s-gen.js','s-mgen.js','s-dgen.js','s-engine.js','s-learn.js','s-mlearn.js','s-dlearn.js','s-games.js','s-mgames.js','s-dgames.js'].map(f => fs.readFileSync(dir + f, 'utf8')).join('\n') + '\n;this.T={GENS,GUIDE_D,PARTS_D,buildBossD,isRight,answerText,grade,partMax,GAMES_D,CARDS_D,SK,gmStop,gmFactor,gmDec,expand,stops};';
const ctx = {console, Math, Object, Array, JSON, Set, Number, String, isFinite, Date, document:{querySelector(){ return null; }, querySelectorAll(){ return []; }}}; vm.createContext(ctx); vm.runInContext(src, ctx);
const T = ctx.T; let bad = 0; const fail = m => { if (bad++ < 40) console.log('FAIL', m); };
const plain = html => String(html).replace(/<span class="ol">(\d+)<\/span>/g, '[$1]').replace(/(\d)<span class="fr"><i>(\d+)<\/i><i>(\d+)<\/i><\/span>/g, '$1 $2/$3').replace(/<span class="fr"><i>(−?\d+)<\/i><i>(−?\d+)<\/i><\/span>/g, '$1/$2').replace(/<[^>]+>/g, '').replace(/−/g, '-').replace(/\s+/g, ' ').trim();
const frOf = html => { const m = String(html).match(/(−?)<span class="fr"><i>(\d+)<\/i><i>(\d+)<\/i><\/span>/); return m ? {neg:!!m[1], p:+m[2], q:+m[3]} : null; };
const stopsI = q => { const g = (a, b) => b ? g(b, a % b) : a; return q > 0 && (() => { let r = q; while (r % 2 === 0) r /= 2; while (r % 5 === 0) r /= 5; return r === 1; })(); };
const gcd = (a, b) => b ? gcd(b, a % b) : a;
/* long division digits, independent: first 14 digits after the point */
const digits = (p, q) => { let r = p % q, s = ''; for (let i = 0; i < 14; i++){ r *= 10; s += Math.floor(r / q); r %= q; } return Math.floor(p / q) + '.' + s; };
const decodeBar = txt => { const m = txt.match(/^(−?)(\d+)(?:\.(\d*)(?:<span class="ol">(\d+)<\/span>)?)?$/); if (!m) return null; let d = (m[3] || ''); const rep = m[4] || ''; if (rep) while (d.length < 14) d += rep; else d = d.padEnd(14, '0'); return m[2] + '.' + d.slice(0, 14); };

function generic(q, tag){
  const s = JSON.stringify(q).replace(/is <b>undefined<\/b>|is undefined|Undefined|undefined/g, ''); if (/NaN|Infinity|\[object|\bnull\b/.test(s)) fail(tag + ' bad text ' + s.slice(0, 100));
  if (!q.why || !q.prompt || !q.skill || !q.title) fail(tag + ' missing fields');
  if (q.type === 'mc'){ if (!(q.answer >= 0 && q.answer < q.choices.length)) fail(tag + ' mc idx'); if (new Set(q.choices.map(plain)).size !== q.choices.length) fail(tag + ' dup choices ' + q.choices.map(plain).join(' | ')); }
  else if (q.type === 'num'){ q.blanks.forEach(b => { if (!isFinite(b.answer)) fail(tag + ' num'); }); }
  else if (q.type === 'multi'){ if (!q.correct.length) fail(tag + ' no correct'); if (new Set(q.choices.map(plain)).size !== q.choices.length) fail(tag + ' multi dup'); }
  else if (q.type === 'rows'){ q.rows.forEach(r => { if (!(r.a >= 0 && r.a < r.opts.length)) fail(tag + ' rows'); }); }
}
const near = (a, b) => Math.abs(a - b) < 1e-9;
const seen = {};
for (const id of [21, 22, 23]) for (let i = 0; i < 4000; i++){
  const q = ctx.T.GENS[id](); generic(q, 'gen' + id); seen[q.title] = (seen[q.title] || 0) + 1;
  const tag = id + '/' + q.title + ' ' + plain(q.prompt).slice(0, 50);
  if (q.title === 'Fraction → decimal' || q.title === 'Long division'){ const f = frOf(q.prompt); const v = (f.neg ? -1 : 1) * f.p / f.q; if (!near(q.blanks[0].answer, v)) fail(tag + ' answer ' + q.blanks[0].answer + ' vs ' + v); if (!stopsI(f.q / gcd(f.p, f.q))) fail(tag + ' should stop'); }
  if (q.title === 'Stops: write it'){ const f = frOf(q.prompt); const v = (f.neg ? -1 : 1) * f.p / f.q; if (!near(q.blanks[0].answer, v)) fail(tag + ' answer'); }
  if (q.title === 'Decimal → fraction'){ const m = q.prompt.match(/<b>(−?)(\d+)\.(\d\d)<\/b>/); const v = (m[1] ? -1 : 1) * (+m[2] + +m[3] / 100); if (!near(q.blanks[0].answer, v)) fail(tag + ' answer ' + q.blanks[0].answer + ' vs ' + v); }
  if (q.title === 'Stops or loops?') q.rows.forEach(r => { const f = frOf(r.h); const s = stopsI(f.q / gcd(f.p, f.q)); if ((r.a === 0) !== s) fail(tag + ' row ' + r.h); });
  if (q.title === 'Explain it'){ const f = frOf(q.prompt), s = stopsI(f.q / gcd(f.p, f.q)); if (!plain(q.choices[q.answer]).startsWith(s ? 'Stops' : 'Loops')) fail(tag + ' explain'); }
  if (q.title === 'Bar notation'){ const f = frOf(q.prompt), want = digits(f.p, f.q), got = q.choices.map(c => decodeBar(c.replace(/<span class="fr">.*?<\/span>/g, '').replace(/^−/, '')) ); const r = decodeBar(q.choices[q.answer].replace(/^−/, ''));
    if (r !== want) fail(tag + ' right choice ' + r + ' vs ' + want); q.choices.forEach((c, k) => { const v = decodeBar(c.replace(/^−/, '')); if (k !== q.answer && v === want) fail(tag + ' wrong choice equals answer ' + c); }); }
  if (q.title === 'Divide'){ const t = plain(q.prompt.split('?')[0]).replace(/\s+/g, ''); const m = q.prompt.match(/<b>/); }
  if (q.title === 'Zero'){ const t = plain(q.prompt); const m = t.match(/^(-?\d+) ÷ (\(?-?\d+\)?)/); }
}
console.log('generators exercised:', JSON.stringify(seen));
/* games */
for (let i = 0; i < 3000; i++){
  const a = T.gmStop(), f = frOf(a.prompt); if (!f) fail('gmStop prompt'); else if ((a.answer === 0) !== stopsI(f.q / gcd(f.p, f.q))) fail('gmStop wrong ' + plain(a.prompt));
  const b = T.gmFactor(); if (new Set(b.choices).size !== b.choices.length) fail('gmFactor dup ' + b.choices);
  const m = plain(b.prompt).match(/(-?\d+|\(-?\d+\)) · □ = (-?\d+)/); if (m){ const bb = +m[1].replace(/[()]/g, ''), aa = +m[2]; if (bb * +b.choices[b.answer].replace('−','-') !== aa) fail('gmFactor wrong ' + plain(b.prompt) + ' ' + b.choices[b.answer]); }
  const c = T.gmDec(), fc = frOf(c.prompt); if (new Set(c.choices).size !== c.choices.length) fail('gmDec dup ' + c.choices); const want = (fc.neg ? -1 : 1) * fc.p / fc.q; if (!near(+c.choices[c.answer].replace('−', '-'), want)) fail('gmDec wrong ' + plain(c.prompt) + ' → ' + c.choices[c.answer]);
}
/* boss shape */
for (let i = 0; i < 300; i++){ const b = T.buildBossD(); if (b.length !== 15) fail('boss len'); b.forEach(q => generic(q, 'boss')); }
/* guide */
const G = T.GUIDE_D; if (process.argv[2] === 'dump') G.forEach(q => console.log('#' + q.no + (q.part || '') + ' [' + q.type + '] ' + plain(q.ctx || '').slice(0, 80) + ' | ' + plain(q.prompt).slice(0, 120) + '\n     => ' + plain(T.answerText(q))));
let pts = 0; G.forEach(q => { generic(q, 'guide' + q.no); pts += T.partMax(q); }); console.log('guide items', G.length, 'points', pts);
console.log(bad ? bad + ' FAILURES' : 'ALL CONTENT CHECKS PASSED');
