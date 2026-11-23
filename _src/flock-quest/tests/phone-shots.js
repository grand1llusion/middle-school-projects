/* Phone screenshots at 375x667 (light) and 390x844 (dark): new views, plus a horizontal-overflow check.
   Run: PW=/opt/npm-tools/node_modules/playwright node tests/phone-shots.js <outdir> */
const {chromium} = require(process.env.PW || 'playwright');
const OUT = process.argv[2] || 'shots'; require('fs').mkdirSync(OUT, {recursive:true});
const WOOLS = ['cream','lav','mint','butter','sky','silver','sage','violet','midnight','gold','glow'], FACES = ['char','brown','tan','plum'], NM = ['Clover','Fern','Willow','Juniper','Lavender','Sage','Basil','Thistle','Poppy','Maple','Olive','Pebble'];
const seed = {m:{1:60,2:30,3:90,4:5,21:40,22:15}, tab:'learn', xp:620, best:0, bossRuns:0, hs:{}, chk:{}, subject:'math', mode:'c',
  fl:{sheep:NM.map((n, i) => ({id:'s' + i, name:n, wool:WOOLS[i % 11], face:FACES[i % 4], trait:['Brave','Sleepy','Bouncy','Curious','Hungry','Shy','Silly','Snuggly','Chatty','Thirsty'][i % 10], acc:['none','leaf','flower','bandana','shades','party','scarf','cape','wizard'][i % 9], from:i ? (i % 8) + 1 : 'start', born:0})),
    rescued:{1:1,3:1}, rescued2:{}, hay:7, fed:60, water:40, day:new Date().toISOString().slice(0,10), streak:2, lastPrac:'', xpAcc:0, bossWon:{c:1}, seq:13, sel:'s1', wearSeen:5}};
(async () => {
  const b = await chromium.launch();
  for (const [W,H,dark] of [[375,667,false],[390,844,true]]){
    const ctx = await b.newContext({viewport:{width:W,height:H}, deviceScaleFactor:2, isMobile:true, hasTouch:true, colorScheme: dark ? 'dark' : 'light'});
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await ctx.addInitScript(s => { try { if (!localStorage.getItem('flock-quest-v1')) localStorage.setItem('flock-quest-v1', JSON.stringify(s)); } catch(e){} }, seed);
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push('console ' + m.text()); });
    await p.goto('file://' + require('path').resolve(__dirname, '../build/_page.html')); await p.waitForTimeout(600);
    const tag = `${W}${dark ? 'd' : ''}`, vp = async name => p.screenshot({path:`${OUT}/${tag}_${name}.png`}), full = async name => p.screenshot({path:`${OUT}/${tag}_${name}.png`, fullPage:true});
    const over = async label => { const r = await p.evaluate(() => { const vw = document.documentElement.clientWidth, bad = []; document.querySelectorAll('#view *, header *, nav *, #sheet *').forEach(e => { const bb = e.getBoundingClientRect(); if (bb.width && (bb.right > vw + 1 || bb.left < -1)){ let par = e.parentElement, clip = false; while (par && par.id !== 'view' && par.id !== 'sheet'){ const o = getComputedStyle(par).overflowX; if (o !== 'visible'){ clip = true; break; } par = par.parentElement; } if (!clip) bad.push(e.tagName + '.' + e.className + ' ' + Math.round(bb.left) + '-' + Math.round(bb.right)); } }); return {sw:document.documentElement.scrollWidth, vw, bad:bad.slice(0,4)}; }); if (r.sw > r.vw || r.bad.length) errs.push(`OVERFLOW ${label}: ${r.sw}/${r.vw} ${r.bad.join(' ; ')}`); };
    const tab = async n => { await p.click(`#nav button:nth-child(${n})`); await p.waitForTimeout(250); };
    await vp('home'); await over('home');
    for (const m of ['c','m','d']){ await p.click(`#modebar button[data-m="${m}"]`); await p.waitForTimeout(200); await tab(1); await vp('learn_' + m); await over('learn ' + m);
      const heads = await p.locator('.tp > button').all(); const i = m === 'd' ? 2 : 0; await heads[i].click(); await p.waitForTimeout(300); await over(m + ' lab'); await p.locator('.tp').nth(i).screenshot({path:`${OUT}/${tag}_lab_${m}.png`}); }
    await p.click('#modebar button[data-m="d"]'); await tab(1);
    await p.locator('.tp > button').nth(0).click(); await p.waitForTimeout(250); await p.locator('.tp').nth(0).screenshot({path:`${OUT}/${tag}_lab_d1.png`});
    await p.locator('.tp > button').nth(1).click(); await p.waitForTimeout(250); await p.locator('.tp').nth(1).screenshot({path:`${OUT}/${tag}_lab_d2.png`});
    await tab(3); await vp('bosslist'); await over('boss list'); await full('bosslist_full');
    for (const nme of ['Neon Wizard','Sheepdog Sarge','Billy']){ await tab(3); await p.locator('#view .bosscard', {hasText:nme}).click(); await p.waitForTimeout(200); await vp('boss_' + nme.split(' ')[0]); await over('boss ' + nme); }
    await tab(4); await p.waitForTimeout(2500); await vp('meadow'); await over('meadow'); await full('meadow_full');
    await p.locator('.meadow').evaluate(e => e.scrollLeft = 700); await p.waitForTimeout(600); await vp('meadow_scrolled');
    await tab(1); await p.click('#modebar button[data-m="c"]'); await p.waitForTimeout(200); await p.locator('.pin').first().click(); await p.waitForTimeout(300); await vp('mission'); await over('mission'); await full('mission_full');
    await p.locator('.btn', {hasText:'Start the rescue'}).click(); await p.waitForTimeout(200); await vp('mission_q'); await over('mission q');
    await p.click('#subj'); await p.waitForTimeout(200); await vp('subjects'); await over('subjects'); await p.locator('#sheet button', {hasText:'Language Arts'}).click(); await p.waitForTimeout(200); await tab(1); await vp('shell'); await over('shell'); await full('shell_full');
    await p.click('#subj'); await p.locator('#sheet button', {hasText:'Adv Math'}).click(); await p.waitForTimeout(200);
    await tab(6); await full('progress'); await over('progress');
    console.log(tag, errs.length ? errs.join('\n') : 'no overflow / errors');
    await ctx.close();
  }
  await b.close();
})();
