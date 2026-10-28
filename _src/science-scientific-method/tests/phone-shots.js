const {chromium} = require(process.env.PW || 'playwright');
const OUT = process.argv[2] || 'shots'; require('fs').mkdirSync(OUT, {recursive:true});
(async () => {
  const b = await chromium.launch();
  for (const [W,H,dark] of [[375,667,false],[390,844,true]]){
    const ctx = await b.newContext({viewport:{width:W,height:H}, deviceScaleFactor:2, isMobile:true, hasTouch:true, colorScheme: dark ? 'dark' : 'light'});
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push('console ' + m.text()); });
    await p.goto('file://' + require('path').resolve(__dirname, '../build/_page.html')); await p.waitForTimeout(300);
    const tag = `${W}${dark ? 'd' : ''}`;
    const over = async label => { const r = await p.evaluate(() => { const vw = document.documentElement.clientWidth, bad = []; document.querySelectorAll('#view *, header *, nav *').forEach(e => { const bb = e.getBoundingClientRect(); if (bb.width && (bb.right > vw + 1 || bb.left < -1)){ let par = e.parentElement, clip = false; while (par && par.id !== 'view'){ const o = getComputedStyle(par).overflowX; if (o !== 'visible'){ clip = true; break; } par = par.parentElement; } if (!clip) bad.push(e.tagName + '.' + e.className + ' ' + Math.round(bb.left) + '-' + Math.round(bb.right)); } }); return {sw:document.documentElement.scrollWidth, vw, bad:bad.slice(0,4)}; }); if (r.sw > r.vw || r.bad.length) errs.push(`OVERFLOW ${label}: ${r.sw}/${r.vw} ${r.bad.join(' ; ')}`); };
    const tab = async n => { await p.click(`#nav button:nth-child(${n})`); await p.waitForTimeout(120); };
    const vp = async name => p.screenshot({path:`${OUT}/${tag}_${name}.png`});
    await tab(1); await vp('learn'); await over('learn');
    const heads = await p.locator('.tp > button').all();
    for (let i = 0; i < heads.length; i++){ await heads[i].click(); await p.waitForTimeout(250); await over('lab' + (i+1)); await p.locator('.tp').nth(i).screenshot({path:`${OUT}/${tag}_lab${i+1}.png`}); }
    // practice 5 inside lab 8
    await p.locator('.btn', {hasText:'Practice 5'}).click(); await p.waitForTimeout(400); await over('practice'); await vp('practice8');
    // guide
    await tab(2); await vp('guide'); await over('guide');
    const part = async L0 => { await tab(2); await p.locator('#view .mrow').filter({hasText:new RegExp('^' + L0)}).click(); await p.waitForTimeout(150); };
    await part('A'); await vp('gA'); await over('gA'); await p.locator('.opt').nth(2).click(); await p.waitForTimeout(150); await vp('gA_fb');
    await part('C'); await p.locator('.opt').first().click(); await p.locator('.btn', {hasText:/^Next$/}).click(); await p.waitForTimeout(120); await vp('gC15'); await over('g15');
    await part('D'); await vp('gD'); await over('gD');
    await part('E'); await vp('gE'); await over('gE');
    await part('F'); await p.locator('.opt').first().click(); await p.locator('.btn', {hasText:/^Next$/}).click(); for (let k = 0; k < 3; k++) await p.locator('.pick button').nth(k).click(); await p.locator('.btn', {hasText:'Check'}).click(); await p.locator('.btn', {hasText:/^Next$/}).click(); await p.waitForTimeout(120); await vp('gF22'); await over('gF22');
    await part('G'); for (let k = 0; k < 2; k++){ await p.locator('.opt').nth(1).click(); await p.locator('.btn', {hasText:/^Next$/}).click(); } await p.waitForTimeout(120); await vp('gG26'); await over('g26');
    // boss
    await tab(3); await vp('boss'); await over('boss'); await p.locator('.btn', {hasText:'Fight the Beast'}).click(); await p.waitForTimeout(150); await vp('boss_q1');
    // games
    await tab(4); await vp('games'); await over('games');
    for (const n of ['Observe or Infer','Word Match','Step Sorter','Cause & Effect','Mean Machine','Flash Cards']){
      await tab(4); await p.locator('#view .tile', {hasText:n}).click(); await p.waitForTimeout(150);
      if (await p.locator('.btn', {hasText:/^Start$/}).count()) { await p.locator('.btn', {hasText:/^Start$/}).click(); await p.waitForTimeout(200); }
      await over('game ' + n); await vp('game_' + n.split(' ')[0]);
    }
    await tab(5); await p.screenshot({path:`${OUT}/${tag}_progress.png`, fullPage:true}); await over('progress');
    console.log(tag, errs.length ? errs.join('\n') : 'no overflow / errors');
    await ctx.close();
  }
  await b.close();
})();
