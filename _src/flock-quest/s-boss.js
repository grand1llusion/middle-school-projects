/* ---------- BOSSES: goats (the sheep's arch-nemesis) and one very strict sheepdog. No pink anywhere. ---------- */
function goatSVG(c){
  const horn = c.spiral
    ? `<path d="M58 34c-18-4-30-18-24-28 6-8 18-2 14 8-3 6-12 4-11-2" fill="none" stroke="${c.horn}" stroke-width="7" stroke-linecap="round"/><path d="M102 34c18-4 30-18 24-28-6-8-18-2-14 8 3 6 12 4 11-2" fill="none" stroke="${c.horn}" stroke-width="7" stroke-linecap="round"/>`
    : `<path d="M58 36C40 30 30 14 38 6c2 12 12 18 24 22z" fill="${c.horn}"/><path d="M102 36c18-6 28-22 20-30-2 12-12 18-24 22z" fill="${c.horn}"/>`;
  const hat = c.hat ? `<path d="M50 38L83 -2l30 40z" fill="${c.hat}"/><ellipse cx="80" cy="38" rx="38" ry="7" fill="${c.hat}"/><path d="M50 36h60v4H50z" fill="${c.band}"/><path d="M83 12l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="${c.glow}"/>` : '';
  const cape = c.cape ? `<path d="M40 142L30 92l50-14 50 14-10 50z" fill="${c.cape}"/>` : '';
  const staff = c.staff ? `<path d="M132 66l8 74" stroke="#6B4B2E" stroke-width="5" stroke-linecap="round"/><circle cx="131" cy="60" r="10" fill="${c.glow}"/><circle cx="131" cy="60" r="5" fill="#fff" opacity=".7"/><path d="M118 34l-8 12h8l-6 12M148 38l6 10h-8l8 12" stroke="${c.glow}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : '';
  const loop = c.loop ? `<g fill="none" stroke="${c.glow}" stroke-width="4" stroke-linecap="round"><path d="M20 70a14 14 0 1 1 6 12"/><path d="M26 82l-9-1 3 -9" stroke-linejoin="round"/></g>` : '';
  return `<svg class="fx" viewBox="0 0 160 150" role="img" aria-label="A cartoon goat called ${c.name}"><ellipse cx="80" cy="144" rx="52" ry="5" fill="var(--line)"/>
${cape}<path d="M44 142L50 90q30-12 60 0l6 52z" fill="${c.coat}"/><path d="M62 92l18 20 18-20" fill="${c.trim}"/>${staff}${loop}
<path d="M70 98l-4 18M90 98l4 18" stroke="${c.trim}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
<ellipse cx="50" cy="54" rx="15" ry="6" transform="rotate(-18 50 54)" fill="${c.fur}"/><ellipse cx="110" cy="54" rx="15" ry="6" transform="rotate(18 110 54)" fill="${c.fur}"/>
${horn}
<ellipse cx="80" cy="54" rx="27" ry="31" fill="${c.fur}"/><ellipse cx="80" cy="78" rx="17" ry="15" fill="${c.snout}"/>
<path d="M80 88l-9 24h18z" fill="${c.beard}"/><ellipse cx="73" cy="76" rx="2.4" ry="3" fill="#2A2038"/><ellipse cx="87" cy="76" rx="2.4" ry="3" fill="#2A2038"/>
<path d="M70 86q10 6 20 0" fill="none" stroke="#2A2038" stroke-width="2.6" stroke-linecap="round"/>
<ellipse cx="68" cy="52" rx="8" ry="7" fill="${c.eye}"/><ellipse cx="92" cy="52" rx="8" ry="7" fill="${c.eye}"/><rect x="62" y="50.5" width="12" height="3.6" rx="1.8" fill="#1B1430"/><rect x="86" y="50.5" width="12" height="3.6" rx="1.8" fill="#1B1430"/>
<path d="M56 42l20 7M104 42l-20 7" stroke="#1B1430" stroke-width="4.5" stroke-linecap="round"/>${hat}</svg>`;
}
function dogSVG(){
  return `<svg class="fx" viewBox="0 0 160 150" role="img" aria-label="A cartoon sheepdog called Sheepdog Sarge"><ellipse cx="80" cy="144" rx="52" ry="5" fill="var(--line)"/>
<path d="M44 142c-2-30 4-56 36-58s38 28 36 58z" fill="#2B2640"/><path d="M62 142c-2-24 4-42 18-42s20 18 18 42z" fill="#F4F1EA"/>
<path d="M40 100q-18 6-16 30M120 100q18 6 16 30" stroke="#2B2640" stroke-width="12" stroke-linecap="round" fill="none"/>
<ellipse cx="80" cy="56" rx="30" ry="32" fill="#2B2640"/><path d="M80 30c-6 10-6 26 0 52 6-26 6-42 0-52z" fill="#F4F1EA"/>
<ellipse cx="80" cy="76" rx="17" ry="14" fill="#F4F1EA"/><ellipse cx="80" cy="68" rx="6" ry="4.5" fill="#1B1430"/>
<path d="M80 72v7M70 82q10 8 20 0" fill="none" stroke="#1B1430" stroke-width="2.4" stroke-linecap="round"/><path d="M76 83q4 11 8 0z" fill="#C8705A"/>
<path d="M50 38q-22 4-20 34 14-6 24-20zM110 38q22 4 20 34-14-6-24-20z" fill="#2B2640"/>
<circle cx="67" cy="50" r="6.5" fill="#fff"/><circle cx="93" cy="50" r="6.5" fill="#fff"/><circle cx="68" cy="51" r="3.4" fill="#1B1430"/><circle cx="92" cy="51" r="3.4" fill="#1B1430"/>
<path d="M58 40l16 6M102 40l-16 6" stroke="#1B1430" stroke-width="4.5" stroke-linecap="round"/>
<path d="M48 32q32-24 64 0l-4 7H52z" fill="#3E7B3A"/><rect x="48" y="31" width="64" height="6" rx="3" fill="#2F5F2D"/><path d="M80 14l4 8 9 1-6 6 2 9-9-5-9 5 2-9-6-6 9-1z" fill="#E6C24A"/>
<path d="M64 98q16 12 32 0" fill="none" stroke="#7656B0" stroke-width="3.5" stroke-linecap="round"/><circle cx="80" cy="112" r="7" fill="#E6C24A"/><circle cx="80" cy="112" r="3" fill="#2B2640"/></svg>`;
}
const BOSSES = [
  {key:'c', mode:'c', tag:'Adding & subtracting', name:'Count Nega-Goat',
   art:goatSVG({name:'Count Nega-Goat', coat:'#3B2A6B', trim:'#C9BCE6', fur:'#D9D3F2', snout:'#EFEAFB', beard:'#8D79C6', horn:'#6B5BA8', eye:'#F6F1E3', cape:'#5B3FA0'}),
   blurb:'The Count steals sheep with negative numbers. 15 problems from every add and subtract skill.', btn:'Face Count Nega-Goat', foot:'90% or better chases him off. New problems every try.', win:'Count Nega-Goat flees the meadow! 🎉', hurt:'The Count is wobbling. Fix the misses.', lose:'The Count laughs. Practice and come back.',
   rare:{name:'Midnight', wool:'midnight', face:'char', trait:'Brave', line:'A starlit lamb who followed the Count out of the dark.'}, build:() => MODES.c.boss()},
  {key:'m', mode:'m', tag:'Multiplying & dividing', name:'Sheepdog Sarge',
   art:dogSVG(),
   blurb:'Sarge runs the toughest drills in the valley. Signs, groups, fractions and decimals.', btn:'Face Sheepdog Sarge', foot:'90% or better earns his salute. New problems every try.', win:'Sarge salutes you. Dismissed! 🎖️', hurt:'Sarge wants ten more push-ups. Fix the misses.', lose:'Sarge says: drop and review.',
   rare:{name:'Sunny', wool:'gold', face:'brown', trait:'Bouncy', line:'Sarge’s favorite recruit, shiny as a medal.'}, build:() => MODES.m.boss()},
  {key:'d', mode:'d', tag:'Dividing & decimals', name:'Billy the Repeater',
   art:goatSVG({name:'Billy the Repeater', coat:'#2F6B3D', trim:'#C9E2B5', fur:'#E8E2CF', snout:'#F6F1E3', beard:'#BDB59A', horn:'#7656B0', eye:'#F6F1E3', spiral:true, loop:true, glow:'#9ED66A'}),
   blurb:'Billy says the same thing again and again and again. 15 problems on unknown factors, decimals and repeating decimals.', btn:'Face Billy the Repeater', foot:'90% or better breaks his loop. New problems every try.', win:'Billy stopped repeating himself! 🎉', hurt:'Billy is dizzy. Fix the misses.', lose:'Billy loops on. Review and retry.',
   rare:{name:'Sage', wool:'sage', face:'plum', trait:'Curious', line:'A calm lamb who never repeats a mistake twice.'}, build:() => MODES.d.boss()},
  {key:'f', final:true, tag:'FINAL BOSS · every topic', name:'Neon Wizard G.O.A.T.',
   art:goatSVG({name:'Neon Wizard G.O.A.T.', coat:'#4A2F8A', trim:'#9ED66A', fur:'#DCD3F5', snout:'#F0EBFB', beard:'#9ED66A', horn:'#B9F06A', eye:'#C9F26B', hat:'#5B3FA0', band:'#9ED66A', glow:'#B9F06A', staff:true}),
   blurb:'The greatest enemy of sheep. 18 problems mixing add and subtract, multiply and divide, and decimals. Bring everything you have.', btn:'Face the Neon Wizard', foot:'90% or better ends his spell. New problems every try.', win:'The Neon Wizard G.O.A.T. is defeated! The meadow is safe! 🌟', hurt:'The wizard is flickering. Fix the misses.', lose:'The wizard’s spell holds. Practice and return.',
   rare:{name:'Glow', wool:'glow', face:'plum', trait:'Silly', line:'A lamb that glows in the dark, freed from the wizard’s staff.'},
   build:() => shuffle([...shuffle(MODES.c.boss()).slice(0,6), ...shuffle(MODES.m.boss()).slice(0,6), ...shuffle(MODES.d.boss()).slice(0,6)])}
];
const bossByKey = k => BOSSES.find(b => b.key === k);
const oneSeg = (n, cls) => `<div class="hpseg ${cls || ''}" aria-hidden="true">${Array.from({length:n}, () => '<i></i>').join('')}</div>`;

/* the replay: your sheep against the boss, one blow per question */
function battleStage(B, oks, pct){
  const hero = herdHero(), n = oks.length, heroHp = 5;
  const bossSeg = h('div',{html:oneSeg(n)}), heroSeg = h('div',{html:oneSeg(heroHp,'me')});
  const bsEl = h('div',{class:'bs',html:B.art}), hsEl = h('div',{class:'bs',style:'max-width:110px',html:sheepSVG(hero)}), fxt = h('div',{class:'fxt'},'Battle!');
  const stage = h('div',{class:'stage','aria-label':'Battle replay'}, fxt, h('div',{}, hsEl), h('div',{}, bsEl));
  const wrap = h('div',{class:'col'}, stage, h('div',{class:'grid2'}, h('div',{}, h('div',{class:'lbl'},'Your sheep'), heroSeg), h('div',{}, h('div',{class:'lbl'}, B.name), bossSeg)));
  let k = 0, hits = 0, miss = 0;
  const step = () => {
    if (!stage.isConnected) return;
    if (k >= n){ fxt.textContent = pct >= 90 ? 'Victory! 🌟' : pct >= 70 ? 'So close!' : 'Regroup!'; return; }
    const ok = oks[k++], el = ok ? bsEl : hsEl; el.classList.remove('hit', 'lunge'); void el.offsetWidth;
    if (ok){ hits++; bossSeg.querySelectorAll('i')[hits - 1].classList.add('gone'); bsEl.classList.add('hit'); fxt.textContent = pick(['Baa-bam!', 'Direct hit!', 'Wool power!', 'Nice one!']); }
    else { miss++; if (miss <= heroHp) heroSeg.querySelectorAll('i')[miss - 1].classList.add('gone'); hsEl.classList.add('hit'); bsEl.classList.add('lunge'); fxt.textContent = pick(['Ouch!', 'Dodge!', 'He hit back!']); }
    setTimeout(step, 420);
  };
  setTimeout(step, 300);
  return wrap;
}

VIEWS.boss = v => {
  const home = () => { if (cleanup){ cleanup(); cleanup = null; } v.replaceChildren(); VIEWS.boss(v); window.scrollTo(0,0); };
  const fight = B => {
    if (cleanup){ cleanup(); cleanup = null; }
    if (B.mode && B.mode !== MODE){ setMode(B.mode); drawRing(); }
    const box = h('div',{class:'col'}); v.replaceChildren(box);
    const again = () => fight(B);
    runSet(box, B.build(), {mode:'boss', boss:B, bossKey:B.key, onDone:(g, t) => { if (Math.round(100 * g / t) >= 90) bossWon(B); },
      actions:() => [h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:again},'Fight again'), h('button',{class:'btn ghost',onclick:home},'All bosses'))]});
    window.scrollTo(0,0);
  };
  const detail = B => {
    const st = bossStat(B.key), won = S.fl && S.fl.bossWon && S.fl.bossWon[B.key];
    v.replaceChildren(backBtn('All bosses', home), h('div',{class:'card pad col c' + (B.final ? ' final' : '')},
      h('div',{style:'max-width:150px;margin-inline:auto;width:100%',html:B.art}), h('div',{class:'hpbar','aria-label':'Boss health full'}, h('i',{style:'width:100%'})),
      h('div',{class:'tag'}, B.tag), h('h2',{style:'font-size:26px'}, B.name), h('div',{}, B.blurb),
      h('div',{class:'grid2'}, h('div',{class:'card pad'}, h('div',{class:'lbl'},'Best'), h('b',{style:'font:600 26px var(--fd)'}, st.runs ? st.best + '%' : '–')), h('div',{class:'card pad'}, h('div',{class:'lbl'},'Tries'), h('b',{style:'font:600 26px var(--fd)'}, String(st.runs)))),
      h('div',{class:'hint'}, won ? `🏅 Rare sheep earned: ${B.rare.name}` : `First win earns a rare sheep: ${B.rare.name}`),
      h('button',{class:'btn hlb',onclick:() => fight(B)}, B.btn)), h('div',{class:'hint c'}, B.foot));
    window.scrollTo(0,0);
  };
  v.append(h('div',{class:'card pad row sp',style:'flex-wrap:nowrap'}, h('div',{}, h('b',{style:'font:600 17px var(--fd)'}, 'Boss battles'), h('div',{class:'hint'}, 'Goats want your sheep. Win 90% to beat a boss.')), h('span',{style:'font-size:30px'}, '🐐')));
  BOSSES.forEach(B => { const st = bossStat(B.key), won = S.fl && S.fl.bossWon && S.fl.bossWon[B.key];
    v.append(h('button',{class:'card bosscard' + (B.final ? ' final' : ''),onclick:() => detail(B)}, h('div',{class:'bart',html:B.art}),
      h('div',{style:'min-width:0'}, h('div',{class:'tag'}, B.tag), h('div',{style:'font:600 18px var(--fd);margin-top:3px'}, B.name), h('div',{class:'hint'}, st.runs ? `Best ${st.best}% · ${st.runs} ${st.runs === 1 ? 'try' : 'tries'}${won ? ' · 🏅' : ''}` : 'Not fought yet'))));
  });
};
