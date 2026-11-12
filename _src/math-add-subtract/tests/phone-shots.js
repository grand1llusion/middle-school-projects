/* Phone screenshots at 375x667 (light) and 390x844 (dark) for both topics, plus a horizontal-overflow check.
   Run: PW=/opt/npm-tools/node_modules/playwright node tests/phone-shots.js <outdir> */
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
    const over = async label => { const r = await p.evaluate(() => { const vw = document.documentElement.clientWidth, bad = []; document.querySelectorAll('#view *, header *, nav *').forEach(e => { const bb = e.getBoundingClientRect(); if (bb.width && (bb.right > vw + 1 || bb.left < -1)){ let par = e.parentElement, clip = false; while (par && par.id !== 'view'){ const o = getComputedStyle(par).overflowX; if (o !== 'visible'){ clip = true; break; } par = par.parentElement; } if (!clip) bad.push(e.tagName + '.' + e.className + ' ' + Math.round(bb.left) + '-' + Math.round(bb.right)); } }); return {sw:document.documentElement.scrollWidth, vw, bad:bad.slice(0,4)}; }); if (r.sw > r.vw || r.bad.length) errs.push(`OVERFLOW ${label}: ${r.sw}/${r.vw} ${r.bad.join(' ; ')}`); };
    const tab = async n => { await p.click(`#nav button:nth-child(${n})`); await p.waitForTimeout(120); };
    for (const m of ['c','m']){
      const tag = `${W}${dark ? 'd' : ''}${m}`, vp = async name => p.screenshot({path:`${OUT}/${tag}_${name}.png`});
      await p.click(`#modebar button[data-m="${m}"]`); await p.waitForTimeout(150);
      await tab(1); await vp('learn'); await over(m + ' learn');
      const heads = await p.locator('.tp > button').all();
      for (let i = 0; i < heads.length; i++){ await heads[i].click(); await p.waitForTimeout(250); await over(m + ' lab' + (i+1)); await p.locator('.tp').nth(i).screenshot({path:`${OUT}/${tag}_lab${i+1}.png`}); }
      await p.locator('.btn', {hasText:'Practice 5'}).click(); await p.waitForTimeout(300); await over(m + ' practice'); await vp('practice');
      await tab(2); await vp('guide'); await over(m + ' guide');
      const parts = await p.locator('#view .mrow').count();
      for (let k = 0; k < parts; k++){ await tab(2); await p.locator('#view .mrow').nth(k).click(); await p.waitForTimeout(150); await over(m + ' part' + k); await vp('part' + k);
        const nx = async () => { const c = p.locator('.btn', {hasText:/^Check$/}); if (await c.count() && await c.isEnabled()) await c.click(); const n = p.locator('.btn', {hasText:/^Next$/}); if (await n.count()) await n.click(); await p.waitForTimeout(60); };
        if (m === 'm' && k === 1){ for (const s of [0]) { const o = p.locator('.pad4 button', {hasText:/^3$/}); await o.click(); const nb = p.locator('.pad4 button', {hasText:/^Next/}); await nb.click(); await p.locator('.pad4 button', {hasText:/^6$/}).click(); await nx(); } await vp('part1b'); await over('m part1b'); for (let j = 0; j < 7; j++){ const opts = p.locator('.pick button, .opt'); if (await opts.count()) await opts.first().click(); await nx(); } await vp('part1c'); await over('m part1c'); }
      }
      await tab(3); await vp('boss'); await over(m + ' boss'); await p.locator('#view .btn.hlb').click(); await p.waitForTimeout(150); await vp('boss_q1');
      await tab(4); await vp('games'); await over(m + ' games');
      const names = await p.locator('#view .tile b').allTextContents();
      for (const n of names){ await tab(4); await p.locator('#view .tile', {hasText:n}).click(); await p.waitForTimeout(150);
        if (await p.locator('.btn', {hasText:/^Start$/}).count()){ await p.locator('.btn', {hasText:/^Start$/}).click(); await p.waitForTimeout(200); }
        await over(m + ' game ' + n); await vp('game_' + n.split(' ')[0]); }
      await tab(5); await p.screenshot({path:`${OUT}/${tag}_progress.png`, fullPage:true}); await over(m + ' progress');
    }
    console.log(W + (dark ? 'd' : ''), errs.length ? errs.join('\n') : 'no overflow / errors');
    await ctx.close();
  }
  await b.close();
})();
