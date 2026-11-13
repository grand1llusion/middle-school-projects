/* Click-through as a perfect student and a wrong student, in jsdom with a fake clock.
   Run: NODE_PATH=<folder with jsdom>/node_modules node tests/click-through.js */
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path');
const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(path.resolve(__dirname, '../build/_test.html'), 'utf8').replace(/<link[^>]*>/, '') + '</body></html>';
const errs = []; let now = 0, tid = 1, timers = [];
const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.test/', beforeParse(w){
  w.addEventListener('error', e => errs.push('ERR ' + e.message)); w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {};
  w.console.error = (...a) => errs.push('console.error ' + a.join(' '));
  w.setTimeout = (fn, ms=0) => { const id = tid++; timers.push({id, t:now+ms, fn}); return id; }; w.clearTimeout = id => { timers = timers.filter(x => x.id !== id); };
  w.setInterval = (fn, ms) => { const id = tid++; timers.push({id, t:now+ms, fn, iv:ms}); return id; }; w.clearInterval = w.clearTimeout;
}});
function advance(ms){ const end = now + ms; for(;;){ timers.sort((a,b) => a.t - b.t); const nx = timers[0]; if (!nx || nx.t > end) break; now = nx.t; if (nx.iv) nx.t += nx.iv; else timers = timers.filter(x => x !== nx); nx.fn(); } now = end; }
const w = dom.window, d = w.document, T = w.__T, C = T.cur();
const click = el => { if (!el) throw new Error('click on missing element'); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); };
const q$ = (s, r=d) => [...r.querySelectorAll(s)];
const btn = t => q$('button').find(b => b.textContent.trim() === t);
const btnS = t => q$('button').find(b => b.textContent.trim().startsWith(t));
const nav = i => q$('#nav button')[i];
const ok = (c, m) => { if (!c) errs.push('ASSERT ' + m); };
/* read fractions the way a student sees them: 6 20/21, not "62021" */
const seen = el => el.innerHTML.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/(\d+)<span class="fr"><i>(\d+)<\/i><i>(\d+)<\/i><\/span>/g, '$1 $2/$3').replace(/<span class="fr"><i>([^<]+)<\/i><i>([^<]+)<\/i><\/span>/g, '$1/$2').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const textBad = where => {
  const t = d.querySelector('#view').textContent.replace(/is undefined|Undefined/g, '');
  if (/<\/?(span|i|b|div)\b|class=/.test(t)) errs.push('RAW HTML in ' + where + ': ' + t.match(/.{0,30}(<\/?(span|i|b|div)\b|class=).{0,20}/)?.[0]);
  if (/NaN|undefined|\[object|Infinity|\bnull\b|\{[A-Z]\}/.test(t)) errs.push('BAD TEXT in ' + where + ': ' + t.match(/.{0,25}(NaN|undefined|\[object|Infinity|null|\{[A-Z]\}).{0,25}/)?.[0]);
  const tw = d.createTreeWalker(d.querySelector('#view'), w.NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());){ const m = n.nodeValue.match(/\d[a-z]{2,}\b/); if (m && !/^\d(st|nd|rd|th)$/.test(m[0])) errs.push('GLUED TEXT in ' + where + ': ' + n.nodeValue.slice(0, 60)); }
};
ok(q$('#nav button').length === 5, 'five tabs'); ok(!q$('#modebar button').length, 'no topic switch'); console.log('header:', d.querySelector('#kick').textContent, '|', d.querySelector('#h1').textContent);

/* type a value the way a 5th grader would: 6 20/21, 17/24, 5 */
const typedFor = v => { for (let dd = 1; dd <= 60; dd++){ const n = v * dd; if (Math.abs(n - Math.round(n)) < 1e-9){ const N0 = Math.round(n), wh = Math.floor(N0 / dd), r = N0 % dd; if (dd === 1) return String(N0); return wh ? `${wh} ${r}/${dd}` : `${r}/${dd}`; } } throw new Error('cannot type ' + v); };
const typeStr = s => { for (const ch of s){ const label = ch === ' ' ? '␣' : ch; const k = q$('.pad4 button').find(x => x.textContent === label); if (!k) throw new Error('no key ' + label); click(k); } };
function answer(p, right){
  const v = d.querySelector('#view');
  if (p.type === 'mc'){ const o = q$('.opt', v); click(o[right ? p.answer : (p.answer + 1) % o.length]); }
  else if (p.type === 'num'){ p.blanks.forEach((b,k) => { click(q$('.blank', v)[k]); typeStr(right ? typedFor(b.answer) : String(Math.round(b.answer) + 9)); }); }
  else if (p.type === 'rows'){ const pk = q$('.pick', v); p.rows.forEach((r,k) => click(q$('button', pk[k])[right ? r.a : (r.a + 1) % r.opts.length])); }
  else if (p.type === 'boxes'){ (right ? p.sol : [1,1,1,1]).forEach(n => click(q$('.tiles6 button', v).find(b => b.textContent === String(n)))); }
  else { const pk = q$('.pick button', v); (right ? p.correct : [p.choices.findIndex((_,i) => !p.correct.includes(i))]).forEach(i => click(pk[i])); }
}
function play(items, right, label){
  for (const p of items){
    if (d.querySelector('.score')){ errs.push(label + ' ended early'); break; }
    answer(p, right);
    const c = btn('Check'); if (c){ ok(!c.disabled, label + ' check disabled for ' + p.type + ' ' + (p.lab || p.title)); click(c); }
    const n = btn('Next') || btn('Finish'); if (n){ ok(!n.disabled, label + ' next disabled ' + p.type); click(n); } else errs.push(label + ' no next for ' + p.type);
  }
  textBad(label); return d.querySelector('.score')?.textContent;
}
const tot = items => items.reduce((s,p) => s + T.partMax(p), 0);
const stepToEnd = body => { for (let k = 0; k < 8; k++){ const b = q$('.btn', body).find(x => /Solve it|Next step/.test(x.textContent)); if (b) click(b); } };

/* Learn: every lab, every control, then Practice 5 */
click(nav(0)); const heads = () => q$('.tp > button'); ok(heads().length === 9, 'nine skills');
for (let i = 0; i < 9; i++){
  const hd = heads()[i]; click(hd); const body = hd.nextSibling;
  q$('input[type=range]', body).forEach(r => [r.min, r.max, (+r.min + +r.max) / 2].forEach(v => { r.value = v; r.dispatchEvent(new w.Event('input',{bubbles:true})); }));
  for (let pass = 0; pass < 8; pass++) q$('button', body).forEach(b => { if (!/Practice 5|I know this/.test(b.textContent) && b.isConnected && !b.disabled){ click(b); if (!pass) textBad('lab ' + (i+1) + ' after ' + b.textContent.trim().slice(0, 20)); } });
  advance(2000); textBad('lab ' + (i+1));
  click(btn('I know this'));
  click(btn('Practice 5')); const items = w.__last; ok(items.length === 5, 'practice 5 for ' + (i+1)); const sc = play(items, true, 'practice' + (i+1)); ok(sc === tot(items) + '/' + tot(items), `practice ${i+1} perfect ${sc}`);
  click(btn('5 more')); const sc2 = play(w.__last, false, 'practice wrong' + (i+1)); ok(sc2 && +sc2.split('/')[0] < +sc2.split('/')[1], 'wrong practice ' + sc2);
  click(btn('← Back to lesson'));
}
/* the labs land on the test's answers */
const lab = (i, chip, fn) => { click(nav(0)); click(heads()[i]); const body = heads()[i].nextSibling; if (chip) click(q$('.chip', body).find(c => c.textContent.startsWith(chip))); fn(body); };
lab(0, 'Test #4', b => ok(/8 ÷ 6 = 8\/6 = 4\/3 = 1 1\/3/.test(seen(b)), 'shares: 8 ÷ 6 = 1 1/3 · ' + seen(b).slice(0, 200)));
lab(1, 'Test #6', b => { click(btnS('✨')); ok(/Like units: twentieths/.test(seen(b)), 'like units: twentieths'); });
lab(2, 'Test #1', b => { stepToEnd(b); ok(/23\/40/.test(seen(b)) && btnS('↺'), 'potion: 1/5 + 3/8 = 23/40'); });
lab(3, 'Test #7', b => { stepToEnd(b); ok(/= 1\/6/.test(seen(b)), 'subtract: 1/2 − 1/3 = 1/6'); });
lab(4, 'Test #2', b => { stepToEnd(b); ok(/6 20\/21/.test(seen(b)), 'mixed add: 6 20/21'); });
lab(4, 'Test #10', b => { stepToEnd(b); ok(/5 2\/3/.test(seen(b)), 'cheese: 5 2/3'); });
lab(5, 'Test #2', b => { stepToEnd(b); ok(/= 17\/24/.test(seen(b)), 'rename: 17/24 · ' + seen(b).slice(-160)); });
lab(5, 'Test #8', b => { stepToEnd(b); ok(/5 5\/8/.test(seen(b)), 'rename: 8 − 2 3/8 = 5 5/8'); });
lab(6, null, b => { click(q$('.seg button', b)[1]); click(btnS('Silver')); ok(/Yes!/.test(seen(b)) && /3 3\/8/.test(seen(b)), 'chain race: silver wins, 3 3/8'); });
lab(7, 'Lacy', b => { stepToEnd(b); ok(/5 5\/8/.test(seen(b)), 'Lacy needs 5 5/8'); });
lab(8, 'Adesh', b => { click(q$('.opt', b)[2]); ok(/Found it/.test(seen(b)) && /13\/20/.test(seen(b)), 'detective finds Adesh line 3'); });
lab(8, 'Wrong letter', b => { click(q$('.opt', b)[0]); ok(!/Found it/.test(seen(b)), 'line 1 is fine'); click(q$('.opt', b)[3]); ok(/choice C/.test(seen(b)), 'detective: wrong letter'); });

/* Study guide: everything perfect, then part 1 wrong */
click(nav(1)); ok(q$('#view .mrow').length === C.PARTS.length, 'parts'); click(btnS('Do all ' + C.GUIDE.length));
{ const sc = play(C.GUIDE, true, 'guide all'); ok(sc === '34/34', 'guide perfect ' + sc); console.log('study guide perfect run:', sc); }
click(btn('All parts')); ok(d.querySelector('#view').textContent.includes('34/34'), 'last score shown');
click(q$('#view .mrow')[0]); { const sc = play(w.__last, false, 'guide part1 wrong'); console.log('part 1 all-wrong:', sc); ok(/^0\//.test(sc), 'wrong part scores 0'); }
click(btn('← Study guide'));
click(q$('#view .mrow')[3]); { const it = w.__last; ok(it.length === 13 && it[0].lab === 'Twin of #1', 'twins part'); const sc = play(it, true, 'twins'); ok(sc === '13/13', 'twins perfect ' + sc); }
click(btn('← Study guide'));
/* Boss: perfect then wrong */
click(nav(2)); ok(/Denominator Dragon/.test(d.querySelector('#view').textContent), 'dragon boss'); click(btnS('Battle the Dragon')); { const it = w.__last; ok(it.length === 15, 'boss 15'); const sc = play(it, true, 'boss'); ok(sc === tot(it) + '/' + tot(it), 'boss perfect ' + sc); console.log('boss perfect:', sc, '|', d.querySelector('.card .big-out').textContent); ok(q$('details.card').length === 15, 'review 15'); }
click(btn('New quiz')); { const sc = play(w.__last, false, 'boss wrong'); console.log('boss all-wrong:', sc, '|', d.querySelector('.card .big-out').textContent); }
click(btn('Done')); ok(d.querySelector('#view').textContent.includes('100%'), 'best shown');
/* Games */
click(nav(3)); ok(q$('#view .tile').length === 6, 'six game tiles');
for (const G of C.GAMES){
  click(nav(3)); click(q$('#view .tile').find(t => t.textContent.includes(G.name)));
  if (G.gen){ click(btn('Start')); textBad(G.id);
    if (G.time){ for (let r = 0; r < 18; r++){ click(q$('.opt')[w.__q.answer]); advance(400); } advance(46000); }
    else for (let r = 0; r < G.rounds; r++){ const right = r % 4 !== 3; click(q$('.opt')[right ? w.__q.answer : (w.__q.answer + 1) % w.__q.choices.length]); textBad(G.id + ' round'); if (right) advance(1200); else click(btn('Next') || btn('See results')); }
    console.log(G.id, 'score', d.querySelector('.score')?.textContent); ok(!!d.querySelector('.score'), G.id + ' results'); click(btn('Play again')); click(btn('← Games'));
  } else if (G.custom.name === 'matchGame'){
    const rounds = Math.ceil(Object.keys(C.SHORT).length / 4);
    for (let r = 0; r < rounds; r++){ const grid = d.querySelector('.grid2'); const [Lc, Rc] = q$('.col', grid); q$('.tile', Lc).map(x => x.textContent).forEach(word => { click(q$('.tile', Lc).find(x => x.textContent === word)); click(q$('.tile', Rc).find(x => x.textContent === C.SHORT[word])); }); advance(400); }
    ok(!!d.querySelector('.score'), G.id + ' done'); click(btn('All games'));
  } else if (G.custom.name === 'stepGame'){
    click(q$('.pick button').find(b => b.textContent !== C.STEPS[0][0])); advance(3000); C.STEPS.forEach(s => click(q$('.pick button').find(b => b.textContent === s[0])));
    ok(!!d.querySelector('.score'), G.id + ' done'); click(btn('All games'));
  } else {
    const card = () => d.querySelector('.fc'); const ev = (type, x) => card().dispatchEvent(new w.MouseEvent(type,{bubbles:true,clientX:x,clientY:0}));
    ev('pointerdown',100); ev('pointerup',100); ok(card().classList.contains('flip'), 'card flips'); ev('pointerdown',50); ev('pointerup',220);
    let n = 0; while (btn('Got it') && n++ < 80) click(btn('Got it')); ok(/Deck done/.test(d.querySelector('#view').textContent), 'deck done'); click(btn('← Games'));
  }
}
textBad('games menu'); console.log('bests', JSON.stringify(T.S.hs));
/* Progress */
click(nav(4)); ok(q$('.chk').length === 8, 'checklist 8'); q$('.chk').forEach(click); ok(/8 of 8/.test(d.querySelector('#view').textContent), 'checklist count'); ok(q$('#view .mrow').length === 9, 'skill rows');
click(btnS('Practice next')); advance(50); ok(q$('.tp .body').some(b => !b.hidden), 'practice-next opens lesson');
textBad('progress');
click(nav(4)); const rs = btn('Reset my progress'); click(rs); click(rs); ok(T.S.xp === 0, 'reset');
console.log(errs.length ? errs.join('\n') : 'NO ERRORS');
process.exit(0);
