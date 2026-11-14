/* Click-through: open Draw to Add, draw the worksheet's problems right and wrong, check, erase, OK, tabs.
   Run: NODE_PATH=<folder with jsdom>/node_modules node tests/click-through.js */
const { JSDOM } = require('jsdom'); const fs = require('fs'), path = require('path');
const html = '<!doctype html><html><head><meta charset="utf-8"></head><body>' + fs.readFileSync(path.resolve(__dirname, '../build/_test.html'), 'utf8').replace(/<link[^>]*>/g, '') + '</body></html>';
const errs = [];
const dom = new JSDOM(html, { runScripts:'dangerously', pretendToBeVisual:true, url:'https://example.test/', beforeParse(w){ w.scrollTo = () => {}; w.addEventListener('error', e => errs.push('ERR ' + e.message)); }});
const w = dom.window, d = w.document, T = w.__T;
const ok = (c, m) => { if (!c) errs.push('ASSERT ' + m); };
const click = el => { if (!el) throw new Error('missing element'); el.dispatchEvent(new w.MouseEvent('click', {bubbles:true})); };
const q$ = (s, r = d) => [...r.querySelectorAll(s)];
const btn = t => q$('button').find(b => b.textContent.trim().startsWith(t));
const nav = i => q$('#nav button')[i];
const cells = () => q$('.cell'), lines = c => q$('line:not([data-m="cross"])', c).length, adds = c => q$('[data-m="add"]', c).length, crosses = c => q$('[data-m="cross"]', c).length;
const eq = () => d.querySelector('.eq').textContent.replace(/\s+/g, ' ').trim();
const tap = (r, k, n) => { for (let i = 0; i < n; i++) click(cells()[r * 3 + k]); };
const draw = (a, b) => [a, b].forEach((n, r) => T.digits(n).forEach((x, k) => tap(r, k, x)));

ok(q$('#nav button').length === 5, 'five tabs'); ok(d.querySelector('#nav button.on').textContent === 'Learn', 'starts on Learn');
ok(q$('.skill').length === 1, 'one skill so far');
click(q$('.skill')[0]);
ok(eq() === '39 + 136', 'first problem is worksheet #1: ' + eq());
ok(q$('.pv .hd').map(x => x.textContent).join(',') === '100s,10s,1s', 'chart columns');
ok(q$('.pv .num').map(x => x.textContent).join(',') === '39,136', 'row labels');
/* draw 39 and 136 right: 0|3|9 and 1|3|6 */
draw(39, 136);
ok(cells().map(lines).join('') === '039136', 'marks drawn ' + cells().map(lines).join(''));
click(btn('Check'));
ok(/You got it/.test(d.querySelector('.banner').textContent), 'right answer banner');
ok(q$('.cell.right').length === 6, 'all six boxes right'); ok(T.S().stars === 1, 'one star'); ok(d.querySelector('#starN').textContent === '1', 'star shown');
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
const saved = JSON.parse(w.localStorage.getItem('kitty-math-g2-v1')); ok(saved.stars === 1 && saved.pv.i === 3, 'saved ' + JSON.stringify(saved));
/* other tabs are placeholders; the cat spot opens Progress */
['Study Guide', 'Boss Quiz', 'Games'].forEach((t, i) => { click(nav(i + 1)); ok(/Coming soon/.test(d.querySelector('#view').textContent), t + ' coming soon'); });
click(d.querySelector('#petSlot')); ok(d.querySelector('#nav button.on').textContent === 'Progress', 'cat spot opens Progress'); ok(/1 star(?!s)/.test(d.querySelector('#view').textContent) && d.querySelector('#petSpace'), 'progress shows stars and the cat space');
click(nav(0)); click(q$('.skill')[0]); ok(eq() === third, 'same problem after leaving and coming back');

/* the problem maker: like the worksheet (a 3-digit 1xx and a 2-digit number, sum under 200, no zero ones) */
let carry = 0; const N = 5000;
for (let t = 0; t < N; t++){ const [a, b] = T.makeProblem(), big = Math.max(a, b), small = Math.min(a, b);
  if (!(big > 100 && big < 190 && small >= 11 && small <= 89 && a + b <= 199 && a % 10 && b % 10)) errs.push('bad problem ' + a + ' + ' + b);
  if (a % 10 + b % 10 >= 10) carry++; }
ok(carry / N > .7 && carry / N < .9, 'about 80% make a new ten: ' + (carry / N).toFixed(2));
/* the mark drawer: shows max(have, want), crosses the extras, adds the missing */
for (let have = 0; have <= 9; have++) for (let want = 0; want <= 9; want++){ const s = T.marks(have, want, true), L = (s.match(/<line/g) || []).length - (s.match(/data-m="cross"/g) || []).length, X = (s.match(/data-m="cross"/g) || []).length, A = (s.match(/data-m="add"/g) || []).length;
  if (L !== Math.max(have, want) || X !== Math.max(0, have - want) || A !== Math.max(0, want - have)) errs.push(`marks ${have}/${want}: ${L} ${X} ${A}`); }
console.log(errs.length ? errs.join('\n') : 'NO ERRORS · worksheet problems, right and wrong drawing, eraser, check, OK, max 9, saving, tabs, ' + N + ' new problems');
