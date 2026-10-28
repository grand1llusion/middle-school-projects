const { JSDOM } = require('jsdom'); const fs = require('fs');
const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(require('path').resolve(__dirname, '../build/_test.html'),'utf8').replace(/<link[^>]*>/,'') + '</body></html>';
const errs = []; let now = 0, tid = 1, timers = [];
const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.test/', beforeParse(w){
  w.addEventListener('error', e => errs.push('ERR ' + e.message)); w.scrollTo = () => {}; w.Element.prototype.scrollIntoView = () => {};
  w.console.error = (...a) => errs.push('console.error ' + a.join(' '));
  w.setTimeout = (fn, ms=0) => { const id = tid++; timers.push({id, t:now+ms, fn}); return id; }; w.clearTimeout = id => { timers = timers.filter(x => x.id !== id); };
  w.setInterval = (fn, ms) => { const id = tid++; timers.push({id, t:now+ms, fn, iv:ms}); return id; }; w.clearInterval = w.clearTimeout;
  const D = w.Date; w.Date = class extends D { constructor(...a){ if (a.length) super(...a); else super(D.UTC(2026,9,28,1,30) + now); } static now(){ return D.UTC(2026,9,28,1,30) + now; } };
}});
function advance(ms){ const end = now + ms; for(;;){ timers.sort((a,b) => a.t - b.t); const nx = timers[0]; if (!nx || nx.t > end) break; now = nx.t; if (nx.iv) nx.t += nx.iv; else timers = timers.filter(x => x !== nx); nx.fn(); } now = end; }
const w = dom.window, d = w.document, T = w.__T;
const click = el => { if (!el) throw new Error('click on missing element'); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); };
const q$ = (s, r=d) => [...r.querySelectorAll(s)];
const btn = t => q$('button').find(b => b.textContent.trim() === t);
const btnS = t => q$('button').find(b => b.textContent.trim().startsWith(t));
const nav = i => q$('#nav button')[i];
const ok = (c, m) => { if (!c) errs.push('ASSERT ' + m); };
const textBad = where => { const t = d.querySelector('#view').textContent; if (/NaN|undefined|\[object|Infinity|\bnull\b/.test(t)) errs.push('BAD TEXT in ' + where + ': ' + t.match(/.{20}(NaN|undefined|\[object|Infinity|null).{20}/)?.[0]); };
ok(q$('#nav button').length === 5, 'five tabs'); console.log('kicker:', d.querySelector('#kick').textContent);

function answer(p, right){
  const v = d.querySelector('#view');
  if (p.type === 'mc'){ const o = q$('.opt', v); click(o[right ? p.answer : (p.answer + 1) % o.length]); }
  else if (p.type === 'rows'){ const pk = q$('.pick', v); p.rows.forEach((r,k) => click(q$('button', pk[k])[right ? r.a : (r.a + 1) % r.opts.length])); }
  else if (p.type === 'num'){ p.blanks.forEach((b,k) => { click(q$('.blank', v)[k]); if (!right) { click(q$('.pad4 button').find(x => x.textContent === '9')); click(q$('.pad4 button').find(x => x.textContent === '9')); return; } if (b.answer == null) click(btn('No mode')); else for (const ch of String(b.answer)) click(q$('.pad4 button').find(x => x.textContent === ch)); }); }
  else if (p.type === 'order'){ const seq = right ? p.items : p.items.slice().reverse(); seq.forEach(t => click(q$('.pick button', v).find(x => x.textContent === t))); }
  else { const pk = q$('.pick button', v); const idx = right ? p.correct.slice(0, p.pick) : [...p.choices.map((_,i) => i).filter(i => !p.correct.includes(i)), ...p.correct].slice(0, p.pick); idx.forEach(i => click(pk[i])); }
}
function play(items, right, label){
  for (const p of items){
    if (d.querySelector('.score')){ errs.push(label + ' ended early'); break; }
    answer(p, right);
    const c = btn('Check'); if (c){ ok(!c.disabled, label + ' check disabled for ' + p.type); click(c); }
    const n = btn('Next') || btn('Finish'); if (n){ ok(!n.disabled, label + ' next disabled ' + p.type); click(n); } else errs.push(label + ' no next for ' + p.type);
  }
  textBad(label); return d.querySelector('.score')?.textContent;
}
const tot = items => items.reduce((s,p) => s + T.partMax(p), 0);

/* Learn: every lab, every control, then Practice 5 */
click(nav(0)); const heads = () => q$('.tp > button'); ok(heads().length === 9, 'nine skills');
for (let i = 0; i < 9; i++){
  const hd = heads()[i]; click(hd); const body = hd.nextSibling;
  q$('input[type=range]', body).forEach(r => [r.min, r.max].forEach(v => { r.value = v; r.dispatchEvent(new w.Event('input',{bubbles:true})); }));
  for (let pass = 0; pass < 3; pass++) q$('button', body).forEach(b => { if (!/Practice 5|I know this/.test(b.textContent) && b.isConnected) click(b); });
  advance(2000); textBad('lab ' + (i+1));
  click(btn('I know this'));
  click(btn('Practice 5')); const items = w.__last; ok(items.length === 5, 'practice 5 for ' + (i+1)); const sc = play(items, true, 'practice' + (i+1)); ok(sc === tot(items) + '/' + tot(items), `practice ${i+1} perfect ${sc}`);
  click(btn('5 more')); const sc2 = play(w.__last, false, 'practice wrong' + (i+1)); ok(sc2 && +sc2.split('/')[0] < +sc2.split('/')[1], 'wrong practice ' + sc2);
  click(btn('← Back to lesson'));
}
console.log('learn ok; mastery', JSON.stringify(T.S.m));
/* lab-specific: fair test becomes fair, steps complete */
click(nav(0)); click(heads()[3]); q$('button', heads()[3].nextSibling).filter(b => b.textContent === 'Mess it up again').forEach(click); { const body = heads()[3].nextSibling; while (btn('Make same')) click(btn('Make same')); ok(/Fair test!/.test(body.textContent), 'fair test lab reaches fair'); }
click(heads()[4]); { const body = heads()[4].nextSibling; click(btn('Shuffle again')); T.STEPS.forEach(s => click(q$('.pick button', body).find(b => b.textContent === s[0]))); ok(/Quick Hamsters/.test(body.textContent), 'steps lab completes'); }

/* Study guide: all 26 perfect, then part A wrong */
click(nav(1)); ok(q$('#view .mrow').length === 7, 'seven parts'); click(btnS('Do all 26'));
{ const sc = play(T.GUIDE, true, 'guide all'); ok(sc === '36/36', 'guide perfect ' + sc); console.log('study guide perfect run:', sc); }
click(btn('All parts')); ok(/36\/36/.test(d.querySelector('#view').textContent), 'last score shown');
click(q$('#view .mrow')[0]); { const sc = play(w.__last, false, 'guide A wrong'); console.log('part A all-wrong:', sc); }

/* keyboard on a number question */
click(btn('← Study guide')); click(q$('#view .mrow')[5]); { const items = w.__last; for (let k = 0; k < 2; k++){ answer(items[k], true); if (btn('Check')) click(btn('Check')); click(btn('Next')); } click(q$('.blank')[0]); d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'5',bubbles:true})); ok(q$('.blank')[0].textContent === '5', 'keyboard typing'); }

/* Boss: perfect then wrong */
click(nav(2)); click(btn('Fight the Beast')); { const it = w.__last; ok(it.length === 15, 'boss 15'); const sc = play(it, true, 'boss'); ok(sc === tot(it) + '/' + tot(it), 'boss perfect ' + sc); console.log('boss perfect:', sc, '|', d.querySelector('.card .big-out').textContent, '| best', T.S.best); ok(q$('details.card').length === 15, 'review 15'); }
click(btn('New quiz')); { const sc = play(w.__last, false, 'boss wrong'); console.log('boss all-wrong:', sc, '|', d.querySelector('.card .big-out').textContent); }
click(btn('Done'));

/* Games */
click(nav(3)); ok(q$('#view .tile').length === 6, 'six game tiles');
for (const G of T.GAMES){
  click(nav(3)); click(q$('#view .tile').find(t => t.textContent.includes(G.name)));
  if (G.gen){ click(btn('Start')); textBad(G.id);
    if (G.time){ for (let r = 0; r < 18; r++){ click(q$('.opt')[w.__q.answer]); advance(400); } advance(46000); }
    else for (let r = 0; r < G.rounds; r++){ const right = r % 4 !== 3; click(q$('.opt')[right ? w.__q.answer : (w.__q.answer + 1) % w.__q.choices.length]); if (right) advance(1200); else click(btn('Next') || btn('See results')); }
    console.log(G.id, 'score', d.querySelector('.score')?.textContent); ok(!!d.querySelector('.score'), G.id + ' results'); click(btn('Play again')); click(btn('← Games'));
  } else if (G.id === 'match'){
    for (let r = 0; r < 3; r++){ const grid = d.querySelector('.grid2'); const [L, R] = q$('.col', grid); q$('.tile', L).map(x => x.textContent).forEach(word => { click(q$('.tile', L).find(x => x.textContent === word)); click(q$('.tile', R).find(x => x.textContent === T.SHORT[word])); }); advance(400); }
    ok(!!d.querySelector('.score'), 'match done'); console.log('match time', d.querySelector('.score')?.textContent); click(btn('All games'));
  } else if (G.id === 'steps'){
    click(q$('.pick button').find(b => b.textContent !== T.STEPS[0][0])); advance(3000); T.STEPS.forEach(s => click(q$('.pick button').find(b => b.textContent === s[0])));
    ok(!!d.querySelector('.score'), 'steps done'); console.log('steps time', d.querySelector('.score')?.textContent); click(btn('All games'));
  } else if (G.id === 'cards'){
    const card = () => d.querySelector('.fc'); const ev = (type, x) => card().dispatchEvent(new w.MouseEvent(type,{bubbles:true,clientX:x,clientY:0}));
    ev('pointerdown',100); ev('pointerup',100); ok(card().classList.contains('flip'), 'card flips'); ev('pointerdown',50); ev('pointerup',220);
    let n = 0; while (btn('Got it') && n++ < 60) click(btn('Got it')); ok(/Deck done/.test(d.querySelector('#view').textContent), 'deck done'); click(btn('← Games'));
  }
}
textBad('games menu'); console.log('bests', JSON.stringify(T.S.hs));

/* Progress */
click(nav(4)); ok(q$('.chk').length === 8, 'checklist 8'); q$('.chk').forEach(click); ok(/8 of 8/.test(d.querySelector('#view').textContent), 'checklist count'); ok(q$('#view .mrow').length === 9, 'skill rows');
click(btnS('Practice next')); advance(50); ok(q$('.tp .body').some(b => !b.hidden), 'practice-next opens lesson'); click(nav(4));
const rs = btn('Reset my progress'); click(rs); click(rs); ok(T.S.xp === 0 && !Object.keys(T.S.chk).length, 'reset');
textBad('progress');
console.log(errs.length ? errs.join('\n') : 'NO ERRORS');
process.exit(0);
