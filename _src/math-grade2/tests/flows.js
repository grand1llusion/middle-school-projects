/* Flows: Count by 10s, Break Apart, Take Away, and the star flight.
   Run: NODE_PATH=<folder with jsdom>/node_modules node tests/flows.js   (exit 0 = pass) */
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path');
const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(path.resolve(__dirname, '../build/_test.html'), 'utf8').replace(/<link[^>]*>/g, '') + '</body></html>';
const errs = [];
const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.test/', beforeParse(w){ w.__DAY__ = '2026-11-14'; w.scrollTo = () => {}; w.addEventListener('error', e => errs.push('ERR ' + e.message)); }});
const w = dom.window, d = w.document, T = w.__T;
const ok = (c, m) => { if (!c) errs.push('ASSERT ' + m); };
const click = el => { if (!el) throw new Error('missing element'); el.dispatchEvent(new w.MouseEvent('click', {bubbles:true})); };
const q$ = (s, r = d) => [...r.querySelectorAll(s)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const openSkill = name => { click(q$('#nav button')[0]); click(q$('.skill').find(s => s.textContent.includes(name))); };
const starN = () => d.querySelector('#starN').textContent;

(async () => {
  /* ---- Count by 10s ---- */
  for (let t = 0; t < 3000; t++){ const [s, by] = T.makeSkipProblem(); if (s + by * 8 < 0 || s < 0) { errs.push('negative skip problem ' + s + ' ' + by); break; } }
  T.S().skip = {i:5, cur:[74, -10]};                       /* an old save that would reach -6 */
  openSkill('Count by 10s');
  const [s0, by0] = T.S().skip.cur; ok(s0 + by0 * 8 >= 0, 'old negative problem replaced: ' + s0 + ' ' + by0);
  let up = !(by0 < 0);
  ok(q$('.sc-li').length === 1 && q$('.sc-li')[0].textContent === String(s0), 'list starts with only the start number');
  const answers = [];
  for (let r = 0; r < 8; r++){
    const btns = q$('.sc-choice'); const want = (answers.length ? answers[answers.length - 1] : s0) + by0;
    const right = btns.find(b => b.textContent === String(want)), wrong = btns.find(b => b !== right);
    ok(btns.length === 2 && right && Math.abs(Number(wrong.textContent) - want) === 1 && Number(wrong.textContent) >= 0, 'round ' + r + ' choices ' + btns.map(b => b.textContent));
    click(wrong); ok(q$('.sc-li').length === answers.length + 1, 'wrong tap does not add to the list');
    click(right); click(right);                              /* double tap counts once */
    answers.push(want);
    ok(q$('.sc-li').map(e => e.textContent).join(',') === [s0, ...answers].join(','), 'list after round ' + r + ': ' + q$('.sc-li').map(e => e.textContent));
    if (r < 7) await sleep(400);
  }
  ok(q$('.card.sc-flash').length === 1, 'card flashes green on the last round');
  ok(T.S().stars === 1 && starN() === '0' && q$('.star-fly').length === 1, 'one star in flight, count not bumped yet');
  await sleep(1300); ok(starN() === '1' && !q$('.star-fly').length && d.querySelector('.stars').classList.contains('bump'), 'star landed: count 1 and bumped');
  await sleep(700); ok(q$('.sc-li').length === 1 && !q$('.sc-flash').length, 'next set starts fresh');

  /* ---- Break Apart (addition) ---- */
  T.S().ns = {i:0, cur:null}; openSkill('Break Apart');
  let [rA, rB] = q$('.ns2-root'); click(rA); click(rB);
  const [AH, AT, AO, BT, BO] = q$('.ns2-leaf');
  ok(AH.classList.contains('auto') && AH.textContent === '100', 'pink dashed 100s box');
  click(AT); click(BT); click(AO); click(BO);
  const sums = q$('.ns2-sum'); click(sums[0]); click(sums[1]); await sleep(250);
  ok(q$('svg line').filter(l => l.getAttribute('stroke') === '#F48FBF').length === 1, 'pink line from the 100s box');
  const tiles = q$('.ns2-row')[3].querySelectorAll('.ns2-leaf'); ok(tiles.length === 3, 'three tiles');
  tiles.forEach(click); await sleep(1100);
  ok(d.querySelector('.ns2-final').textContent === '189' && /You got it/.test(d.querySelector('.banner').textContent), 'break apart finishes with 189');
  ok(T.S().area['ns-add'] === 1, 'ns-add awarded');

  /* ---- Take Away (subtraction) ---- */
  T.S().nss = {i:0, cur:null}; openSkill('Take Away');
  const tops = q$('.ns2-root'); ok(tops.map(e => e.textContent).join() === '143,56', 'take away shows 143 and 56');
  click(tops[0]); ok(q$('.ns-row2')[0].hidden, 'first number is not tappable');
  click(tops[1]); await sleep(1100);
  ok(!q$('.ns-row2')[0].hidden && q$('.ns-row2 .ns-attacker').map(e => e.textContent).join() === '50,6', 'second number broke into 50 and 6');
  click(q$('.ns-attacker.blink')[0]); ok(q$('.ns-row2 .ns-attacker').map(e => e.textContent).join() === '50,3,3', 'six split into 3 and 3');
  await sleep(1700); ok(/Tap the numbers to attack/.test(d.querySelector('.card').textContent), 'attack message after 1.5s');
  const parts = q$('.ns-row2 .ns-attacker'); click(parts[1]); ok(parts[1].style.visibility !== 'hidden', 'must tap left to right');
  const boss = () => d.querySelector('.ns-boss-num').textContent; const seen = [];
  for (const p of parts){ click(p); await sleep(1300); seen.push(boss()); }
  ok(seen.join() === '93,90,87', 'boss counts down ' + seen);
  await sleep(1000); ok(/You got it/.test(d.querySelector('.banner').textContent) && T.S().area['ns-sub'] === 1, 'take away finishes');

  await sleep(1300);
  ok(starN() === String(T.S().stars), 'star count caught up: ' + starN() + ' vs ' + T.S().stars);
  console.log(errs.length ? errs.join('\n') : 'NO ERRORS · count by 10s (no negatives, running list, flash, star), break apart, take away');
  process.exit(errs.length ? 1 : 0);
})().catch(e => { console.log('CRASH ' + e.stack); process.exit(1); });
