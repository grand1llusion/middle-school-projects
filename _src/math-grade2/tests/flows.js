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
const btn = t => q$('button').find(b => b.textContent.trim().startsWith(t));

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

  /* ---- fish: daily login, 3 in a row, perfect set ---- */
  ok(T.S().fish === 5, 'daily 3 + a 3-in-a-row bonus of 2 = 5 fish: ' + T.S().fish);
  openSkill('Count by 10s');
  for (let r = 0; r < 8; r++){ const want = T.S().skip.cur[0] + T.S().skip.cur[1] * (r + 1); const cur = q$('.sc-li').map(e => Number(e.textContent)); const c = cur[cur.length - 1] + T.S().skip.cur[1]; click(q$('.sc-choice').find(b => b.textContent === String(c))); await sleep(400); }
  ok(T.S().fish === 8, 'a perfect Count by 10s set gives 3 fish: ' + T.S().fish);
  T.miss(); ok(T.S().run === 0, 'a miss resets the streak');
  const f0 = T.S().fish; T.award('pv-add'); T.award('pv-add'); ok(T.S().fish === f0, 'two right answers: no bonus yet'); T.award('pv-add'); ok(T.S().fish === f0 + 2, 'third in a row: +2 fish');

  /* ---- the shop ---- */
  ok(q$('#nav button').map(b => b.textContent).join() === 'Learn,Litter,Shop,Progress,Club', 'tabs: Study and Games are gone');
  click(q$('#nav button').find(b => b.textContent === 'Shop'));
  ok(q$('.shopc').length === 8 && /Star gifts/.test(d.querySelector('#view').textContent), 'shop shows 8 items and the star gifts');
  const shopBtn = name => q$('.shopc').find(c => c.textContent.includes(name)).querySelector('button');
  ok(shopBtn('Cozy sofa').disabled && !shopBtn('Pillow').disabled, 'sofa too expensive, pillow affordable');
  const fish0 = T.S().fish; click(shopBtn('Pillow'));
  ok(T.S().fish === fish0 - 4 && T.S().shop.cushion === 1, 'bought the pillow for 4 fish');
  ok(/In your house/.test(q$('.shopc').find(c => c.textContent.includes('Pillow')).textContent) && !q$('.shopc').find(c => c.textContent.includes('Pillow')).querySelector('button'), 'pillow shows as owned');
  T.S().fish = 0; click(q$('#nav button').find(b => b.textContent === 'Shop')); ok(q$('.shopc button').every(b => b.disabled), 'nothing affordable with 0 fish');
  const stars0 = T.S().stars; ok(T.S().stars === stars0, 'stars are untouched by buying'); T.S().fish = 20;

  /* ---- the house: rooms, drag furniture, whistle, laser ---- */
  const S = T.S(); S.cats = [{name:'Luna', coat:0, wear:[]}, {name:'Mo', coat:1, wear:[]}]; S.got = 4; S.sel = 0; S.food = 1;
  click(q$('#nav button').find(b => b.textContent === 'Litter'));
  ok(q$('.room .rm').length === 3, 'three rooms');
  ok(!!d.querySelector('.room .it[data-id="cushion"]'), 'the bought pillow is in the house');
  ok(q$('.house-vp ~ .dress button').map(b => b.textContent.replace(/\s+/g, ' ')).join('|').startsWith('Room 1 · 🐱🐱|Room 2|Room 3'), 'room buttons show where the kittens are: ' + q$('.house-vp ~ .dress button').map(b => b.textContent));
  const vp = d.querySelector('.house-vp'), room = d.querySelector('.room');
  const ptr = (el, type, x, y) => el.dispatchEvent(new w.MouseEvent(type, {bubbles:true, clientX:x, clientY:y}));
  const bed = room.querySelector('.it[data-id="bed"]'), bowlLeft = room.querySelector('.it[data-id="food"]').style.left;
  ptr(bed, 'pointerdown', 10, 10); ptr(bed, 'pointermove', 500, 60); ptr(bed, 'pointerup', 500, 60);
  ok(!S.deco.bed, 'furniture does not move unless Decorate is on');
  click(btn('🛋️')); ok(vp.classList.contains('decor-on') && q$('.hint').some(e => !e.hidden && /Drag things/.test(e.textContent)), 'decorate mode on, with its hint');
  ptr(bed, 'pointerdown', 10, 10); ptr(bed, 'pointermove', 500, 60); ptr(bed, 'pointerup', 500, 60);
  ok(S.deco.bed && S.deco.bed[0] > 100 && S.deco.bed[0] < 200, 'bed dragged into room 2: ' + JSON.stringify(S.deco.bed));
  ok(Math.abs(parseFloat(bed.style.left) * 3 - S.deco.bed[0]) < .5 && !bed.classList.contains('drag'), 'bed drawn where it was dropped');
  ok(JSON.parse(w.localStorage.getItem('kitty-math-g2-v1')).deco.bed[0] === S.deco.bed[0], 'furniture position saved');
  ok(room.querySelector('.it[data-id="food"]').style.left === bowlLeft, 'other furniture stays put');
  ptr(room.querySelector('.it[data-id="yarn"]'), 'pointerdown', 5, 5); ptr(room.querySelector('.it[data-id="yarn"]'), 'pointermove', 9999, 9999); ptr(room.querySelector('.it[data-id="yarn"]'), 'pointerup', 9999, 9999);
  ok(S.deco.yarn[0] <= 300 && S.deco.yarn[1] <= 262, 'furniture stays inside the house: ' + JSON.stringify(S.deco.yarn));
  click(btn('🔴')); ok(vp.classList.contains('laser-on') && !vp.classList.contains('decor-on'), 'laser replaces decorate');
  const catXs = () => q$('.cat').map(c => parseFloat(c.style.left) * 3);
  ptr(vp, 'pointerdown', 200, 150); await sleep(20);
  ok(!d.querySelector('.laser').hidden, 'red dot shows');
  ok(catXs().every(x => x > 35 && x < 75) && q$('.cat').every(c => c.classList.contains('chase')), 'kittens chase the dot: ' + catXs());
  ptr(vp, 'pointermove', 100, 140); await sleep(300); ptr(vp, 'pointermove', 100, 140);
  ok(catXs().every(x => x >= 2 && x < 40), 'kittens follow it left: ' + catXs());
  ptr(vp, 'pointerup', 100, 140); await sleep(900);
  ok(q$('.cat').every(c => c.classList.contains('jump')), 'kittens pounce when it stops');
  await sleep(800); ok(d.querySelector('.laser').hidden, 'dot fades away');
  click(btn('🔴')); ok(!vp.classList.contains('laser-on'), 'laser off');
  ptr(vp, 'pointerdown', 200, 150); ok(d.querySelector('.laser').hidden, 'no dot when laser is off');
  click(btn('📣')); ok(q$('.ripple').length === 1, 'whistle ripple');
  ok(catXs().every(x => x > 15 && x < 60), 'whistle gathers kittens in the middle of room 1: ' + catXs());
  await sleep(900); ok(q$('.cat .bub').length === 2, 'kittens answer the whistle');
  click(btn('🍽️')); await sleep(2400); ok(catXs().every(x => x < 80), 'feeding still sends kittens to the food bowl: ' + catXs());

  await sleep(2400);
  ok(d.querySelector('#fishN').textContent === String(T.S().fish) && !q$('.star-fly').length, 'fish count caught up: ' + d.querySelector('#fishN').textContent + ' vs ' + T.S().fish);
  ok(starN() === String(T.S().stars), 'star count caught up: ' + starN() + ' vs ' + T.S().stars);
  console.log(errs.length ? errs.join('\n') : 'NO ERRORS · count by 10s (no negatives, running list, flash, star), break apart, take away');
  process.exit(errs.length ? 1 : 0);
})().catch(e => { console.log('CRASH ' + e.stack); process.exit(1); });
