/* Click-through: Draw to Add (right, wrong, erase, OK), then kittens, rewards, daily food, streak treats, water, the Litter and Progress.
   Run: NODE_PATH=<folder with jsdom>/node_modules node tests/click-through.js */
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path');
const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(path.resolve(__dirname, '../build/_test.html'), 'utf8').replace(/<link[^>]*>/g, '') + '</body></html>';
const errs = [];
const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.test/', beforeParse(w){ w.__DAY__ = '2026-11-14'; w.scrollTo = () => {}; w.addEventListener('error', e => errs.push('ERR ' + e.message)); }});
const w = dom.window, d = w.document, T = w.__T;
const ok = (c, m) => { if (!c) errs.push('ASSERT ' + m); };
const click = el => { if (!el) throw new Error('missing element'); el.dispatchEvent(new w.MouseEvent('click', {bubbles:true})); };
const q$ = (s, r = d) => [...r.querySelectorAll(s)];
const btn = t => q$('button').find(b => b.textContent.trim().startsWith(t));
const nav = i => q$('#nav button')[i];
const cells = () => q$('.cell').slice(0, 6), lines = c => q$('line:not([data-m="cross"])', c).length, adds = c => q$('[data-m="add"]', c).length, crosses = c => q$('[data-m="cross"]', c).length;
const eq = () => d.querySelector('.eq').textContent.replace(/\s+/g, ' ').trim();
const tap = (r, k, n) => { for (let i = 0; i < n; i++) click(cells()[r * 3 + k]); };
const draw = (a, b) => [a, b].forEach((n, r) => T.digits(n).forEach((x, k) => tap(r, k, x)));

ok(q$('#nav button').length === 5, 'five tabs'); let textOK; ok(d.querySelector('#nav button.on').textContent === 'Learn', 'starts on Learn');
ok(q$('.skill').length === 5, 'five skills: ' + q$('.skill b').map(b => b.textContent).join(', '));
click(q$('.skill')[0]);
ok(eq() === '39 + 136', 'first problem is worksheet #1: ' + eq());
ok(q$('.pv .hd').map(x => x.textContent).join(',') === '100s,10s,1s', 'chart columns');
ok(q$('.pv .num').map(x => x.textContent).join(',') === '39,136,=', 'row labels');
/* draw 39 and 136 right: 0|3|9 and 1|3|6 */
draw(39, 136);
ok(cells().map(lines).join('') === '039136', 'marks drawn ' + cells().map(lines).join(''));
click(btn('Check'));
ok(/You got it/.test(d.querySelector('.banner').textContent), 'right answer banner');
ok(q$('.cell.right').length === 6, 'all six boxes right'); ok(T.S().stars === 1, 'one star'); ok(d.querySelector('#starN').textContent === '0' && q$('.star-fly').filter(e => e.textContent === '⭐').length === 1, 'star in flight, count holds until it lands');
tap(0, 2, 1); ok(cells().map(lines).join('') === '039136', 'no drawing after check');
click(btn('OK'));
ok(eq() === '126 + 66', 'second problem is worksheet #2: ' + eq());
/* draw it wrong: 126 as 1|2|8 (2 extra ones), 66 as 0|4|6 (2 missing tens) */
tap(0, 0, 1); tap(0, 1, 2); tap(0, 2, 8); tap(1, 1, 4); tap(1, 2, 6);
/* the eraser clears only its row */
click(q$('.erase')[1]); ok(cells().map(lines).join('') === '128000', 'eraser clears row 2 only ' + cells().map(lines).join(''));
tap(1, 1, 4); tap(1, 2, 6);
click(btn('Check'));
ok(/Almost/.test(d.querySelector('.banner').textContent), 'wrong answer banner');
ok(crosses(cells()[2]) === 2 && adds(cells()[2]) === 0, 'two red crosses on extra ones');
ok(adds(cells()[4]) === 2 && crosses(cells()[4]) === 0, 'two green tens added');
ok(q$('.cell.fix').length === 2 && q$('.cell.right').length === 4, 'two boxes to fix');
ok(cells().map(lines).join('') === '128066', 'shown marks = max(have, want) ' + cells().map(lines).join(''));
ok(T.S().stars === 1, 'no star for a miss');
click(btn('OK')); const third = eq(); ok(/^\d+ \+ \d+$/.test(third) && third !== '126 + 66', 'new problem ' + third);
/* 9 is the most in a box */
tap(0, 2, 12); ok(lines(cells()[2]) === 9, 'max 9 marks'); ok(/9 is the most/.test(d.querySelector('#toast').textContent), 'max toast');
/* progress survives a reload */
const saved = JSON.parse(w.localStorage.getItem('kitty-math-g2-v1')); ok(saved.stars === 1 && saved.pv.i === 3 && saved.area['pv-add'] === 1, 'saved ' + JSON.stringify(saved).slice(0, 120));
/* header and tabs */
ok(d.querySelector('.top h1').textContent === 'Meow Math' && d.title === 'Meow Math', 'named Meow Math');
ok(q$('#nav button').map(b => b.textContent).join(',') === 'Learn,Litter,Shop,Progress,Club', 'tab names ' + q$('#nav button').map(b => b.textContent).join(','));
click(q$('#nav button').find(b => b.textContent === 'Shop')); ok(/Fish shop/.test(d.querySelector('#view').textContent) && /Star gifts/.test(d.querySelector('#view').textContent), 'shop tab');
/* before any kitten: the Litter shows how close she is */
click(d.querySelector('#petSlot')); ok(d.querySelector('#nav button.on').textContent === 'Litter', 'cat spot opens the Litter');
ok(/Get 10 problems right to adopt a kitten! You have 1\./.test(d.querySelector('#view').textContent), 'first-kitten progress ' + d.querySelector('#view').textContent.slice(0, 120));
ok(!q$('.cat').length && !q$('.dock').length, 'no kittens or care buttons yet');
/* 9 more right answers: a kitten to name */
const sheetOpen = () => !d.querySelector('#sheet').hidden, sheetText = () => d.querySelector('#sheet').textContent;
for (let k = 0; k < 9; k++) T.award('pv-add');
ok(T.S().stars === 10 && sheetOpen() && /You adopted a kitten/.test(sheetText()), 'adopt at 10 stars');
const inp = d.querySelector('#sheet input'); inp.value = 'Luna<3'; click(q$('#sheet button').find(b => b.textContent === 'Done'));
ok(T.S().cats.length === 1 && T.S().cats[0].name === 'Luna3', 'named ' + JSON.stringify(T.S().cats[0]));
ok(d.querySelector('#petSlot').classList.contains('has') && d.querySelector('#petSlot svg .eyes'), 'header shows her kitten');
ok(q$('.cat').length === 1 && /Luna3/.test(q$('.cat')[0].textContent), 'kitten in the Litter with a name tag');
ok(T.S().water === 100, 'water full after 10 right answers: ' + T.S().water);
/* rewards every 15 stars: bed at 25, yarn at 40, bow at 55 */
for (let k = 0; k < 14; k++) T.award('pv-add'); ok(!sheetOpen() && T.S().got === 0, 'no reward at 24');
T.award('pv-add'); ok(T.S().got === 1 && /Cozy bed/.test(sheetText()), 'bed at 25'); click(btn('Yay'));
for (let k = 0; k < 30; k++) T.award('pv-add'); ok(T.S().stars === 55 && T.S().got === 3, 'yarn at 40, bow at 55 · got ' + T.S().got);
ok(/Ball of yarn/.test(sheetText()), 'yarn sheet first'); click(btn('Yay')); ok(/Pink bow/.test(sheetText()) && /try it on/.test(sheetText()), 'bow sheet next'); click(btn('Yay')); ok(!sheetOpen(), 'sheets done');
ok(T.REWARDS.map((r, i) => T.cost(i)).join(',') === '25,40,55,70,85,100,115,130,145,160,175,190', 'reward costs');
/* the Litter: room items, feeding, treats, dressing up */
click(q$('#nav button').find(b => b.textContent === 'Litter'));
const room = d.querySelector('.room'); ok(room.querySelectorAll('.it').length === 4, 'room items: bed, yarn, food and water bowls · ' + room.querySelectorAll('.it').length);
ok(/🧶/.test(room.textContent), 'yarn in the room');
const feedB = () => btn('🍽️'), treatB = () => btn('🍬');
ok(T.S().food === 1 && !feedB().disabled, 'free food today'); click(feedB()); ok(T.S().food === 0 && /Fed today/.test(feedB().textContent) && feedB().disabled, 'fed');
ok(treatB().disabled && /× 0/.test(treatB().textContent), 'no treats yet');
click(q$('.cat')[0]); ok(/Dress up Luna3/.test(d.querySelector('#view').textContent), 'dress-up row for the selected kitten');
click(btn('🎀')); ok(T.S().cats[0].wear.includes('bow') && /C9578E/.test(q$('.cat')[0].innerHTML), 'bow on'); click(btn('🎀')); ok(!T.S().cats[0].wear.includes('bow'), 'bow off'); click(btn('🎀'));
/* new days: free food each day, +2 treats every 3 days in a row, water drops 20 a day, a skipped day resets the streak */
const day = t => { w.__DAY__ = t; T.dayTick(); };
ok(T.S().streak === 1, 'day 1 streak');
day('2026-11-15'); ok(T.S().streak === 2 && T.S().food === 1 && T.S().water === 80, 'day 2: food back, water 80 · ' + JSON.stringify({s:T.S().streak, f:T.S().food, w:T.S().water}));
day('2026-11-16'); ok(T.S().streak === 3 && T.S().treats === 2 && /3 days in a row/.test(sheetText()), 'day 3: +2 treats'); click(btn('Yay'));
day('2026-11-16'); ok(T.S().streak === 3 && T.S().treats === 2, 'same day twice changes nothing');
day('2026-11-17'); day('2026-11-18'); ok(T.S().streak === 5 && T.S().treats === 2, 'day 5');
day('2026-11-19'); ok(T.S().streak === 6 && T.S().treats === 4, 'day 6: +2 more'); click(btn('Yay'));
day('2026-11-21'); ok(T.S().streak === 1 && T.S().food === 1, 'skipped a day: streak back to 1');
T.award('pv-add'); ok(T.S().water === Math.min(100, 0 + 10) || T.S().water > 0, 'a right answer adds water: ' + T.S().water);
click(q$('#nav button').find(b => b.textContent === 'Litter')); ok(!treatB().disabled && /× 4/.test(treatB().textContent), '4 treats'); click(treatB()); ok(T.S().treats === 3, 'gave a treat');
/* a new skill area with 10 points brings a new kitten */
T.S().area['next-skill'] = 10; T.grant(); ok(T.S().cats.length === 2 && /A new kitten/.test(sheetText()), 'second kitten for a new area');
d.querySelector('#sheet input').value = ''; click(q$('#sheet button').find(b => b.textContent === 'Done')); ok(T.S().cats[1].name.length > 0, 'blank name gets a default: ' + T.S().cats[1].name);
T.S().area['next-skill'] = 25; T.grant(); ok(T.S().cats.length === 2, 'only one kitten per area');
click(q$('#nav button').find(b => b.textContent === 'Litter')); ok(q$('.cat').length === 2, 'two kittens in the Litter');
/* Progress */
click(q$('#nav button').find(b => b.textContent === 'Progress')); const pv = d.querySelector('#view').textContent;
ok(q$('.rw div').length === 12 && q$('.rw div.got').length === 3, 'rewards grid'); ok(/Luna3/.test(pv) && /day streak/.test(pv), 'progress shows kittens and streak');
ok(!/undefined|NaN|null/.test(pv), 'progress text clean');
/* an older save with stars but no areas gets its kitten */
/* the problem maker: like the worksheet (a 3-digit 1xx and a 2-digit number, sum under 200, no zero ones) */
let carry = 0; const N = 5000;
for (let t = 0; t < N; t++){ const [a, b] = T.makeProblem(), big = Math.max(a, b), small = Math.min(a, b);
  if (!(big > 100 && big < 190 && small >= 11 && small <= 89 && a + b <= 199 && a % 10 && b % 10)) errs.push('bad problem ' + a + ' + ' + b);
  if (a % 10 + b % 10 >= 10) carry++; }
ok(carry / N > .7 && carry / N < .9, 'about 80% make a new ten: ' + (carry / N).toFixed(2));
/* the mark drawer: shows max(have, want), crosses the extras, adds the missing */
for (let have = 0; have <= 9; have++) for (let want = 0; want <= 9; want++){ const s = T.marks(have, want, true), L = (s.match(/<line/g) || []).length - (s.match(/data-m="cross"/g) || []).length, X = (s.match(/data-m="cross"/g) || []).length, A = (s.match(/data-m="add"/g) || []).length;
  if (L !== Math.max(have, want) || X !== Math.max(0, have - want) || A !== Math.max(0, want - have)) errs.push(`marks ${have}/${want}: ${L} ${X} ${A}`); }
const m2 = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.test/', beforeParse(x){ x.scrollTo = () => {}; x.localStorage.setItem('kitty-math-g2-v1', JSON.stringify({stars:12, solved:12, pv:{i:5, cur:[39,136]}})); x.addEventListener('error', e => errs.push('ERR2 ' + e.message)); }});
ok(m2.window.__T.S().cats.length === 1 && !m2.window.document.querySelector('#sheet').hidden, 'old save: kitten waiting to be named');
setTimeout(() => {
  ok(d.querySelector('#starN').textContent === String(T.S().stars) && !q$('.star-fly').length, 'star count catches up after the stars land: ' + d.querySelector('#starN').textContent + ' vs ' + T.S().stars);
  ok(d.querySelector('.stars').classList.contains('bump'), 'star count bumps');
  console.log(errs.length ? errs.join('\n') : 'NO ERRORS · drawing, check, OK, saving, tabs, kittens at 10 per area, rewards every 15, daily food, streak treats, water, feeding, treats, dressing up, star flight, ' + N + ' new problems');
  process.exit(errs.length ? 1 : 0);
}, 2800);
