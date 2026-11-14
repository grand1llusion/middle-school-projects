/* Screenshots of the Litter, the naming card and Progress with saved kittens and rewards.
   Run: PW=/opt/npm-tools/node_modules/playwright node tests/litter-shots.js <outdir> */
const { chromium } = require(process.env.PW || 'playwright'); const path = require('path'), fs = require('fs');
const out = process.argv[2]; fs.mkdirSync(out, {recursive:true});
const page = 'file://' + path.resolve(__dirname, '../build/_page.html');
const d = new Date(), today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const full = {tab:'litter', stars:200, solved:200, area:{'pv-add':200}, catAreas:['pv-add','a2','a3'], got:12, sel:0, food:1, treats:4, water:70, streak:4, day:today, pv:{i:3, cur:[39,136]},
  cats:[{name:'Luna', coat:0, wear:['bow']}, {name:'Biscuit', coat:1, wear:['crown','bell']}, {name:'Snow', coat:2, wear:[]}, {name:'Pepper', coat:3, wear:['bow']}]};
const some = {tab:'litter', stars:42, solved:42, area:{'pv-add':42}, catAreas:['pv-add'], got:2, sel:0, food:1, treats:0, water:40, streak:1, day:today, pv:{i:3, cur:[39,136]}, cats:[{name:'Luna', coat:5, wear:[]}]};
const naming = {tab:'learn', stars:10, solved:10, area:{'pv-add':10}, catAreas:['pv-add'], got:0, food:1, water:100, streak:1, day:today, pv:{i:3, cur:[39,136]}, cats:[{name:'', coat:0, wear:[]}]};
(async () => {
  const b = await chromium.launch();
  for (const [tag, vp, dark] of [['375', {width:375, height:667}, false], ['390d', {width:390, height:844}, true]]){
    for (const [name, st] of [['full', full], ['some', some], ['naming', naming], ['empty', {tab:'litter', stars:3, solved:3, pv:{i:3, cur:[39,136]}}]]){
      const ctx = await b.newContext({viewport:vp, deviceScaleFactor:2, colorScheme:dark ? 'dark' : 'light'}), p = await ctx.newPage();
      const errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(s => localStorage.setItem('kitty-math-g2-v1', s), JSON.stringify(st));
      await p.goto(page); await p.waitForTimeout(name === 'full' ? 3600 : 700);
      await p.screenshot({path:path.join(out, `${tag}_${name}.png`)});
      if (name === 'full'){ await p.click('#nav button >> nth=4'); await p.waitForTimeout(200); await p.screenshot({path:path.join(out, `${tag}_progress.png`), fullPage:true}); }
      const o = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth); if (o > 0) errs.push(name + ' overflows ' + o);
      console.log(tag, name, errs.length ? errs.join('; ') : 'ok'); await ctx.close();
    }
  }
  await b.close();
})();
