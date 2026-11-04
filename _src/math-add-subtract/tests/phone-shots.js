/* Phone screenshots at 375x667 (light) and 390x844 (dark) plus a horizontal-overflow check.
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
    const tag = `${W}${dark ? 'd' : ''}`;
    const over = async label => { const r = await p.evaluate(() => { const vw = document.documentElement.clientWidth, bad = []; document.querySelectorAll('#view *, header *, nav *').forEach(e => { const bb = e.getBoundingClientRect(); if (bb.width && (bb.right > vw + 1 || bb.left < -1)){ let par = e.parentElement, clip = false; while (par && par.id !== 'view'){ const o = getComputedStyle(par).overflowX; if (o !== 'visible'){ clip = true; break; } par = par.parentElement; } if (!clip) bad.push(e.tagName + '.' + e.className + ' ' + Math.round(bb.left) + '-' + Math.round(bb.right)); } }); return {sw:document.documentElement.scrollWidth, vw, bad:bad.slice(0,4)}; }); if (r.sw > r.vw || r.bad.length) errs.push(`OVERFLOW ${label}: ${r.sw}/${r.vw} ${r.bad.join(' ; ')}`); };
    const tab = async n => { await p.click(`#nav button:nth-child(${n})`); await p.waitForTimeout(120); };
    const vp = async name => p.screenshot({path:`${OUT}/${tag}_${name}.png`});
    const full = async name => p.screenshot({path:`${OUT}/${tag}_${name}.png`, fullPage:true});
    await tab(1); await vp('learn'); await over('learn');
    const heads = await p.locator('.tp > button').all();
    for (let i = 0; i < heads.length; i++){ await heads[i].click(); await p.waitForTimeout(250); await over('lab' + (i+1)); await p.locator('.tp').nth(i).screenshot({path:`${OUT}/${tag}_lab${i+1}.png`}); }
    await p.locator('.btn', {hasText:'Practice 5'}).click(); await p.waitForTimeout(300); await over('practice'); await vp('practice8');
    await tab(2); await vp('guide'); await over('guide');
    const part = async L0 => { await tab(2); await p.locator('#view .mrow').filter({hasText:new RegExp('^' + L0)}).click(); await p.waitForTimeout(150); };
    const nextQ = async () => { const c = p.locator('.btn', {hasText:/^Check$/}); if (await c.count() && await c.isEnabled()) await c.click(); await p.locator('.btn', {hasText:/^Next$/}).click(); await p.waitForTimeout(80); };
    await part('Q'); await vp('q1'); await over('q1'); await p.locator('.opt').nth(0).click(); await p.waitForTimeout(120); await vp('q1_fb');
    await p.locator('.btn', {hasText:/^Next$/}).click(); await vp('q2a'); await over('q2a');
    await p.locator('.pick button').nth(2).click(); await p.locator('.pick button').nth(4).click(); await nextQ(); await vp('q2b');
    for (const k of ['5']) await p.locator('.pad4 button', {hasText:new RegExp('^' + k + '$')}).click(); await nextQ(); await vp('q3'); await over('q3');
    await p.locator('.pad4 button', {hasText:/^3$/}).click(); await nextQ(); await vp('q4a'); await over('q4a');
    for (const k of ['−','3','␣','1','/','3']) await p.locator('.pad4 button').filter({hasText:new RegExp('^' + k.replace('/', '\\/') + '$')}).click(); await p.waitForTimeout(80); await vp('q4a_typed');
    await nextQ(); await vp('q4b'); await over('q4b'); await p.locator('.pad4 button', {hasText:/^1$/}).click(); await nextQ(); await vp('q5'); await over('q5');
    await part('L'); await vp('l1'); await over('l1'); await p.locator('.pad4 button', {hasText:/^4$/}).click(); await nextQ(); await nextQ().catch(()=>{});
    await part('L'); for (let k = 0; k < 2; k++){ await p.locator('.pad4 button', {hasText:/^1$/}).click(); await nextQ(); } await vp('l3'); await over('l3');
    await part('E'); await vp('e6'); await over('e6');
    await tab(3); await vp('boss'); await over('boss'); await p.locator('.btn', {hasText:'Fight'}).click(); await p.waitForTimeout(150); await vp('boss_q1');
    await tab(4); await vp('games'); await over('games');
    for (const n of ['Sign Rush','Word Match','Step Sorter','Frog Hops','Temp Drop','Flash Cards']){
      await tab(4); await p.locator('#view .tile', {hasText:n}).click(); await p.waitForTimeout(150);
      if (await p.locator('.btn', {hasText:/^Start$/}).count()) { await p.locator('.btn', {hasText:/^Start$/}).click(); await p.waitForTimeout(200); }
      await over('game ' + n); await vp('game_' + n.split(' ')[0]);
    }
    await tab(5); await full('progress'); await over('progress');
    console.log(tag, errs.length ? errs.join('\n') : 'no overflow / errors');
    await ctx.close();
  }
  await b.close();
})();
