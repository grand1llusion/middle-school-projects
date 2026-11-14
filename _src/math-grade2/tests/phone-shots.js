/* Phone screenshots (375x667 light, 390x844 dark) of the chart blank, drawn, checked right and checked wrong.
   Run: PW=/opt/npm-tools/node_modules/playwright node tests/phone-shots.js <outdir> */
const { chromium } = require(process.env.PW || 'playwright'); const path = require('path'), fs = require('fs');
const out = process.argv[2]; fs.mkdirSync(out, {recursive:true});
const page = 'file://' + path.resolve(__dirname, '../build/_page.html');
(async () => {
  const b = await chromium.launch();
  for (const [tag, vp, dark] of [['375', {width:375, height:667}, false], ['390d', {width:390, height:844}, true]]){
    const ctx = await b.newContext({viewport:vp, deviceScaleFactor:2, colorScheme:dark ? 'dark' : 'light'}), p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto(page); await p.waitForTimeout(500);
    const shot = n => p.screenshot({path:path.join(out, `${tag}_${n}.png`)});
    const over = async n => { const o = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (o > 0) errs.push(n + ' overflows by ' + o); };
    await shot('learn'); await p.click('.skill'); await p.waitForTimeout(200); await shot('blank'); await over('blank');
    const cell = (r, k) => p.locator('.cell').nth(r * 3 + k);
    for (const [r, k, n] of [[0,1,3],[0,2,9],[1,0,1],[1,1,3],[1,2,6]]) for (let i = 0; i < n; i++) await cell(r, k).click();
    await shot('drawn'); await p.click('text=Check'); await p.waitForTimeout(400); await shot('right'); await over('right');
    await p.click('text=OK'); await p.waitForTimeout(200);
    for (const [r, k, n] of [[0,0,1],[0,1,2],[0,2,8],[1,1,4],[1,2,6]]) for (let i = 0; i < n; i++) await cell(r, k).click();
    await p.click('text=Check'); await p.waitForTimeout(400); await shot('wrong'); await over('wrong');
    await p.click('#petSlot'); await p.waitForTimeout(200); await shot('progress'); await p.click('#nav button >> nth=3'); await shot('games');
    console.log(tag, errs.length ? errs.join('; ') : 'no overflow / errors'); await ctx.close();
  }
  await b.close();
})();
