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
const w = dom.window, d = w.document, T = w.__T;
const click = el => { if (!el) throw new Error('click on missing element'); el.dispatchEvent(new w.MouseEvent('click',{bubbles:true})); };
const q$ = (s, r=d) => [...r.querySelectorAll(s)];
const btn = t => q$('button').find(b => b.textContent.trim() === t);
const btnS = t => q$('button').find(b => b.textContent.trim().startsWith(t));
const nav = i => q$('#nav button')[i];
const ok = (c, m) => { if (!c) errs.push('ASSERT ' + m); };
const textBad = where => {
  const t = d.querySelector('#view').textContent.replace(/is undefined|Undefined/g, '');
  if (/NaN|undefined|\[object|Infinity|\bnull\b|\{[A-Z]\}/.test(t)) errs.push('BAD TEXT in ' + where + ': ' + t.match(/.{0,25}(NaN|undefined|\[object|Infinity|null|\{[A-Z]\}).{0,25}/)?.[0]);
  /* a number glued onto a word inside one text node, like "18he temperature" */
  const tw = d.createTreeWalker(d.querySelector('#view'), w.NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());){ const m = n.nodeValue.match(/\d[a-z]{2,}\b/); if (m && !/^\d(st|nd|rd|th)$/.test(m[0])) errs.push('GLUED TEXT in ' + where + ': ' + n.nodeValue.slice(0, 60)); }
};
ok(q$('#nav button').length === 5, 'five tabs'); console.log('kicker:', d.querySelector('#kick').textContent);

const typedFor = (v, est) => { if (est) return String(Math.round(v)); for (let dd = 1; dd <= 60; dd++){ const n = v * dd; if (Math.abs(n - Math.round(n)) < 1e-9){ const N0 = Math.round(Math.abs(n)), wh = Math.floor(N0 / dd), r = N0 % dd, sg = v < 0 ? '-' : ''; if (dd === 1) return sg + N0; if ([2,4,5,8,10,20,25,50,100].includes(dd)) return sg + String(Math.abs(v)); return sg + (wh ? `${wh} ${r}/${dd}` : `${r}/${dd}`); } } return String(v); };
const typeStr = s => { for (const ch of s){ const label = ch === '-' ? '−' : ch === ' ' ? '␣' : ch; const k = q$('.pad4 button').find(x => x.textContent === label); if (!k) throw new Error('no key ' + label); click(k); } };
function answer(p, right){
  const v = d.querySelector('#view');
  if (p.type === 'mc'){ const o = q$('.opt', v); click(o[right ? p.answer : (p.answer + 1) % o.length]); }
  else if (p.type === 'num'){ p.blanks.forEach((b,k) => { click(q$('.blank', v)[k]); typeStr(right ? typedFor(b.answer, !!b.tol) : String(Math.round(b.answer) + 9)); }); }
  else if (p.type === 'rows'){ const pk = q$('.pick', v); p.rows.forEach((r,k) => click(q$('button', pk[k])[right ? r.a : (r.a + 1) % r.opts.length])); }
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


const modeBtn = m => q$('#modebar button').find(b => b.dataset.m === m);
function runMode(m, cfg){
  click(modeBtn(m)); const C = T.cur(); ok(C.MODE === m && T.S.mode === m, 'mode switched to ' + m); ok(d.querySelector('#h1').textContent === cfg.h1, 'h1 ' + d.querySelector('#h1').textContent);
  console.log(`--- mode ${m}: ${d.querySelector('#h1').textContent} | ${d.querySelector('#kick').textContent}`);
  /* Learn: every lab, every control, then Practice 5 */
  click(nav(0)); const heads = () => q$('.tp > button'); ok(heads().length === 8, m + ' eight skills');
  for (let i = 0; i < 8; i++){
    const hd = heads()[i]; click(hd); const body = hd.nextSibling;
    q$('input[type=range]', body).forEach(r => [r.min, r.max, (+r.min + +r.max) / 2].forEach(v => { r.value = v; r.dispatchEvent(new w.Event('input',{bubbles:true})); }));
    for (let pass = 0; pass < 8; pass++) q$('button', body).forEach(b => { if (!/Practice 5|I know this/.test(b.textContent) && b.isConnected && !b.disabled){ click(b); if (!pass) textBad(m + ' lab ' + (i+1) + ' after ' + b.textContent.trim().slice(0, 20)); } });
    advance(2000); textBad(m + ' lab ' + (i+1));
    click(btn('I know this'));
    click(btn('Practice 5')); const items = w.__last; ok(items.length === 5, m + ' practice 5 for ' + (i+1)); const sc = play(items, true, m + ' practice' + (i+1)); ok(sc === tot(items) + '/' + tot(items), `${m} practice ${i+1} perfect ${sc}`);
    click(btn('5 more')); const sc2 = play(w.__last, false, m + ' practice wrong' + (i+1)); ok(sc2 && +sc2.split('/')[0] < +sc2.split('/')[1], m + ' wrong practice ' + sc2);
    click(btn('← Back to lesson'));
  }
  cfg.labChecks(heads);
  /* Study guide: everything perfect, then part 1 wrong */
  click(nav(1)); ok(q$('#view .mrow').length === C.PARTS.length, m + ' parts'); click(btnS('Do all ' + C.GUIDE.length));
  { const sc = play(C.GUIDE, true, m + ' guide all'); ok(sc === cfg.guide, m + ' guide perfect ' + sc); console.log('study guide perfect run:', sc); }
  click(btn('All parts')); ok(d.querySelector('#view').textContent.includes(cfg.guide), m + ' last score shown');
  click(q$('#view .mrow')[0]); { const sc = play(w.__last, false, m + ' guide part1 wrong'); console.log('part 1 all-wrong:', sc); ok(/^0\//.test(sc), m + ' wrong part scores 0'); }
  click(btn('← Study guide'));
  /* Boss: perfect then wrong */
  click(nav(2)); click(btnS(cfg.boss)); { const it = w.__last; ok(it.length === 15, m + ' boss 15'); const sc = play(it, true, m + ' boss'); ok(sc === tot(it) + '/' + tot(it), m + ' boss perfect ' + sc); console.log('boss perfect:', sc, '|', d.querySelector('.card .big-out').textContent); ok(q$('details.card').length === 15, 'review 15'); }
  click(btn('New quiz')); { const sc = play(w.__last, false, m + ' boss wrong'); console.log('boss all-wrong:', sc, '|', d.querySelector('.card .big-out').textContent); }
  click(btn('Done')); ok(d.querySelector('#view').textContent.includes('100%'), m + ' best shown');
  /* Games */
  click(nav(3)); ok(q$('#view .tile').length === 6, m + ' six game tiles');
  for (const G of C.GAMES){
    click(nav(3)); click(q$('#view .tile').find(t => t.textContent.includes(G.name)));
    if (G.gen){ click(btn('Start')); textBad(G.id);
      if (G.time){ for (let r = 0; r < 18; r++){ click(q$('.opt')[w.__q.answer]); advance(400); } advance(46000); }
      else for (let r = 0; r < G.rounds; r++){ const right = r % 4 !== 3; click(q$('.opt')[right ? w.__q.answer : (w.__q.answer + 1) % w.__q.choices.length]); if (right) advance(1200); else click(btn('Next') || btn('See results')); }
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
      let n = 0; while (btn('Got it') && n++ < 80) click(btn('Got it')); ok(/Deck done/.test(d.querySelector('#view').textContent), m + ' deck done'); click(btn('← Games'));
    }
  }
  textBad(m + ' games menu'); console.log('bests', JSON.stringify(T.S.hs));
  /* Progress */
  click(nav(4)); ok(q$('.chk').length === 8, 'checklist 8'); q$('.chk').forEach(click); ok(/8 of 8/.test(d.querySelector('#view').textContent), 'checklist count'); ok(q$('#view .mrow').length === 8, m + ' skill rows');
  click(btnS('Practice next')); advance(50); ok(q$('.tp .body').some(b => !b.hidden), 'practice-next opens lesson');
  textBad(m + ' progress');
}

runMode('c', {h1:'Plus & Minus Lab', guide:'31/31', boss:'Fight Count Negula', labChecks: heads => {
  click(nav(0)); click(heads()[5]); { const body = heads()[5].nextSibling; click(q$('.chip', body).find(c => c.textContent === '3 − 11')); ['Keep','Change','Change','Solve it'].forEach(t => click(q$('.btn', body).find(b => b.textContent === t))); ok(/= −8/.test(body.textContent), 'KCC lab solves 3 − 11'); }
  click(heads()[7]); { const body = heads()[7].nextSibling; click(q$('.chip', body).find(c => c.textContent.startsWith('Quiz #2'))); ok(/start = −7 \+ 12 = 5/.test(body.textContent), 'thermometer works backward to 5'); }
}});
const classicChk = JSON.stringify(T.S.chk);
runMode('m', {h1:'Times & Divide Lab', guide:'64/64', boss:'Face the Sign Sorcerer', labChecks: heads => {
  click(nav(0)); click(heads()[0]); { const body = heads()[0].nextSibling; click(q$('.chip', body).find(c => c.textContent === '−3(6)')); ok(/= −18/.test(body.textContent), 'groups lab −3(6) = −18'); }
  click(heads()[3]); { const body = heads()[3].nextSibling; click(q$('.chip', body).find(c => c.textContent === 'Dylan’s problem')); ok(/= 120/.test(body.textContent), 'count lab Dylan = 120: ' + body.querySelector('.work').textContent.slice(-30)); }
  click(heads()[5]); { const body = heads()[5].nextSibling; click(q$('.chip', body).find(c => c.textContent === 'Exit #3')); for (let k = 0; k < 9; k++){ const b = q$('.btn', body).find(x => x.textContent === 'Next step'); if (b) click(b); } ok(body.textContent.includes('−11320'), 'L16 exit #3 ends at −1 13/20'); }
  click(heads()[1]); { const body = heads()[1].nextSibling; const nb = () => q$('.btn', body).find(x => x.textContent === 'Next row'); click(nb()); ok(/−1\(−3\) = 3/.test(body.textContent), 'pattern lab reaches −1(−3) = 3'); }
}});
/* modes keep separate progress */
ok(JSON.stringify(T.S.chk) === classicChk && Object.keys(T.S.chkM || {}).length === 8, 'checklists kept apart');
ok(T.S.boss && T.S.boss.c.runs === 2 && T.S.boss.m.runs === 2, 'boss stats kept apart ' + JSON.stringify(T.S.boss));
click(modeBtn('c')); click(nav(2)); ok(d.querySelector('#view').textContent.includes('Count Negula'), 'switching back shows classic boss');
click(nav(4)); const rs = btn('Reset my progress'); click(rs); click(rs); ok(T.S.xp === 0 && T.S.mode === 'c', 'reset keeps mode');
console.log(errs.length ? errs.join('\n') : 'NO ERRORS');
process.exit(0);
