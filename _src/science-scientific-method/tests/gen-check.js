const fs = require('fs'), vm = require('vm'); const dir = require('path').resolve(__dirname, '..') + '/';
const src = ['s-core.js','s-data.js','s-gen.js','s-engine.js'].map(f => fs.readFileSync(dir+f,'utf8')).join('\n') + '\n;this.T={GENS,GUIDE,PARTS,buildBoss,partMax,grade,isRight,answerText,mmmSet,gConc,BANK,STEPS};';
const ctx = {console, Math, Object, Array, JSON, Set, Number, String, isFinite, Date}; vm.createContext(ctx); vm.runInContext(src, ctx);
const T = ctx.T; let bad = 0; const fail = m => { if (bad++ < 30) console.log('FAIL', m); };
const txt = s => String(s).replace(/<[^>]+>/g,'').trim();
function checkQ(q, tag){
  const s = JSON.stringify(q); if (/NaN|undefined|Infinity|\[object/.test(s)) fail(tag + ' bad text ' + s.slice(0,160));
  if (!q.why || !q.prompt || !q.skill || !q.title) fail(tag + ' missing fields');
  if (q.type === 'mc'){ if (!(q.answer >= 0 && q.answer < q.choices.length)) fail(tag + ' mc idx'); if (new Set(q.choices.map(txt)).size !== q.choices.length) fail(tag + ' dup ' + q.choices.join('|')); }
  else if (q.type === 'rows'){ q.rows.forEach(r => { if (!(r.a >= 0 && r.a < r.opts.length)) fail(tag + ' rows a'); if (new Set(r.opts).size !== r.opts.length) fail(tag + ' rows dup'); }); }
  else if (q.type === 'num'){ q.blanks.forEach(b => { if (!(b.answer == null ? b.none : isFinite(b.answer))) fail(tag + ' num'); }); }
  else if (q.type === 'multi'){ if (q.correct.length < q.pick) fail(tag + ' multi too few correct'); if (new Set(q.choices).size !== q.choices.length) fail(tag + ' multi dup'); }
  else if (q.type === 'order'){ if (q.items.length !== 6) fail(tag + ' order'); }
  else fail(tag + ' type ' + q.type);
}
// ---- Study guide vs the answer key ----
const G = T.GUIDE; if (G.length !== 26) fail('guide length ' + G.length);
G.forEach((q,i) => { if (q.no !== i + 1) fail('guide numbering ' + q.no); checkQ(q, 'guide#' + q.no); });
const key = ['hypothesis','quantitative','qualitative','inference','model','properties','science','controlled experiment','conclusion'];
key.forEach((k,i) => { const q = G[i]; if (q.choices[q.answer] !== k) fail(`#${i+1} expected ${k} got ${q.choices[q.answer]}`); if (q.choices.length !== 9) fail('bank size'); });
['O','I','O','I'].forEach((k,i) => { const q = G[9+i]; if ((q.answer === 0 ? 'O' : 'I') !== k) fail(`#${10+i} O/I`); });
{ const q = G[13], c = q.choices[q.answer]; if (!/fertilizer/.test(c) || !/measure/.test(c)) fail('#14'); }
{ const q = G[14], ok = q.correct.map(i => q.choices[i]).sort().join('|'); if (ok !== ['same container size','same amount of light','same seed type','same soil','same temperature'].sort().join('|')) fail('#15 ' + ok); }
{ const q = G[15]; if (q.items.join('|') !== 'Ask a question|Make a hypothesis|Write a procedure|Perform experiment / collect data|Analyze data|Draw a conclusion') fail('#16'); }
{ const q = G[16]; if (q.rows[0].opts[q.rows[0].a] !== 'ramp height' || q.rows[1].opts[q.rows[1].a] !== 'distance the car travels') fail('#17'); }
{ const q = G[17]; if (q.rows[0].opts[q.rows[0].a] !== 'water temperature' || q.rows[1].opts[q.rows[1].a] !== 'how fast the sugar dissolves') fail('#18'); }
{ const q = G[18]; if (q.rows[0].opts[q.rows[0].a] !== 'sunlight hours increase' || q.rows[1].opts[q.rows[1].a] !== 'seedlings will grow taller') fail('#19'); }
{ const q = G[19]; if (!/taller each week/.test(q.choices[q.answer])) fail('#20'); }
{ const q = G[20], ok = q.correct.map(i => q.choices[i]); ['Title','Labeled x-axis','Labeled y-axis'].forEach(x => { if (!ok.includes(x)) fail('#21 missing ' + x); }); if (q.pick !== 3) fail('#21 pick'); }
{ const q = G[21]; const a = q.blanks.map(b => b.answer); if (a.join() !== '5,4,4') fail('#22 ' + a); }
{ const q = G[22]; const a = q.blanks.map(b => b.answer); if (!(a[0] === 7 && a[1] === 7 && a[2] === null)) fail('#23 ' + a); }
{ const q = G[23]; if (q.answer !== 1) fail('#24'); } { const q = G[24]; if (q.answer !== 2) fail('#25'); }
{ const q = G[25], c = q.choices[q.answer]; if (!/support the hypothesis/.test(c) || !/12 cm/.test(c) || !/8 cm/.test(c) || !/4 cm/.test(c) || /do not support/.test(c)) fail('#26'); }
let gtot = 0; G.forEach(q => gtot += T.partMax(q)); console.log('study guide points', gtot);
// grading self-test: perfect answers score full
G.forEach(q => { let r; if (q.type === 'mc') r = q.answer; else if (q.type === 'rows') r = q.rows.map(x => x.a); else if (q.type === 'num') r = q.blanks.map(b => b.answer == null ? 'none' : String(b.answer)); else if (q.type === 'order') r = q.items.map((_,i) => i); else r = q.correct.slice(0, q.pick);
  const g = T.grade(q, r); if (g.got !== g.max) fail('grade perfect #' + q.no); });
// ---- generators ----
const N = 3000;
for (let it = 0; it < N; it++){
  for (let s = 1; s <= 9; s++){ const q = T.GENS[s](); checkQ(q, 'gen' + s); if (q.skill !== s) fail('skill tag ' + s);
    if (s === 8){ const nums = [...q.fig.matchAll(/<span>(\d+)<\/span>/g)].map(m => +m[1]); const sum = nums.reduce((a,b) => a+b, 0), srt = nums.slice().sort((a,b) => a-b), c = {}; nums.forEach(n => c[n] = (c[n]||0)+1); const top = Math.max(...Object.values(c)); const modes = Object.keys(c).filter(k => c[k] === top);
      if (nums.length !== 5) fail('mmm count'); if (q.blanks[0].answer !== sum/5) fail('mean'); if (q.blanks[1].answer !== srt[2]) fail('median'); const wantMode = top === 1 ? null : (modes.length === 1 ? +modes[0] : 'multi'); if (wantMode === 'multi') fail('bimodal set ' + nums); if (q.blanks[2].answer !== wantMode) fail('mode ' + nums + ' ' + q.blanks[2].answer); if (!Number.isInteger(sum/5)) fail('mean not whole'); }
    if (s === 7 && q.type === 'mc'){ const ys = [...q.fig.matchAll(/<td>(\d+)<\/td>/g)].map(m => +m[1]).slice(4); const d = ys.slice(1).map((y,i) => y - ys[i]); const kind = d.every(x => x > 0) ? 'increases' : d.every(x => x < 0) ? 'decreases' : d.every(x => x === 0) ? 'stays' : '?'; if (!q.choices[q.answer].includes(kind)) fail('pattern ' + ys + ' ' + q.choices[q.answer]); if (ys.some(y => y <= 0)) fail('nonpositive ' + ys); }
  }
  const c = T.gConc(); const ans = c.choices[c.answer]; const nums = [...c.ctx.matchAll(/(\d+) (cm|seconds)/g)].map(m => +m[1]);
  const pred = c.ctx; let sup;
  if (/6 hours/.test(pred)) sup = nums[0] > nums[1];
  else if (/faster in cold/.test(pred)) sup = nums[1] < nums[0];
  else if (/faster in hot/.test(pred)) sup = nums[0] < nums[1];
  else if (/higher ramp/.test(pred)) sup = nums[0] > nums[1];
  else if (/more fertilizer/.test(pred)) sup = nums[0] > nums[1];
  if (sup === undefined) fail('conc parse ' + pred);
  if (/do not support/.test(ans) === sup) fail('conclusion claim wrong: ' + pred + ' => ' + ans);
  const b = T.buildBoss(); if (b.length !== 15) fail('boss len'); b.forEach((q,i) => checkQ(q, 'boss' + i));
}
console.log(bad ? bad + ' FAILURES' : `all OK: 26 guide items match the key; ${N*9} generated questions + ${N} boss quizzes valid`);
