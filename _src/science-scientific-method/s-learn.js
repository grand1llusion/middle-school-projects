/* ---------- LEARN LABS ---------- */
const L = {};
const out = (t, sz) => h('div',{class:'big-out',style:'font-size:' + (sz || 19) + 'px',html:t || ''});

/* 1 · science words */
L[1] = box => {
  let mode = 'look', target = null, streak = 0;
  const def = h('div',{class:'def'}), grid = h('div',{class:'grid3'});
  const show = w => { def.innerHTML = `<b>${w[3]} ${w[0]}</b><div>${w[1]}</div><div class="hint">Example: ${w[2]}</div>`; };
  const ask = () => { target = pick(WORDS.filter(w => w !== target)); def.innerHTML = `<div class="lbl">Tap the word that means…</div><div style="font-weight:700;font-size:17px">${target[1]}</div><div class="hint">Streak: ${streak} 🔥</div>`; };
  WORDS.forEach(w => { const t = h('button',{class:'tile',style:'font-size:13px;min-height:58px',onclick:() => {
    grid.querySelectorAll('.tile').forEach(x => x.classList.remove('sel','good','bad'));
    if (mode === 'look'){ t.classList.add('sel'); show(w); return; }
    if (w === target){ streak++; t.classList.add('good'); xp(2); setTimeout(() => { t.classList.remove('good'); ask(); }, 600); if (streak === 5){ bump(1, 10); toast('5 in a row! +10 mastery'); } }
    else { streak = 0; t.classList.add('bad','shake'); setTimeout(() => t.classList.remove('bad','shake'), 500); def.querySelector('.hint').textContent = 'Streak: 0. Try again.'; }
  }}, h('div',{style:'font-size:20px'}, w[3]), w[0]); grid.append(t); });
  def.innerHTML = '<div class="hint" style="margin:auto">Tap a word to see what it means.</div>';
  box.append(seg([['look','Explore'],['quiz','Quiz me']], 'look', k => { mode = k; streak = 0; grid.querySelectorAll('.tile').forEach(x => x.classList.remove('sel','good','bad')); if (k === 'quiz') ask(); else def.innerHTML = '<div class="hint" style="margin:auto">Tap a word to see what it means.</div>'; }), def, grid);
};

/* 2 · observe or infer */
const PLANT = `<svg class="fx" viewBox="0 0 260 150" role="img" aria-label="A drooping plant in dry soil next to a ruler"><rect width="260" height="150" fill="var(--at)"/>
<g stroke="#2E8B57" stroke-width="3" fill="none" stroke-linecap="round"><path d="M110 108V60"/><path d="M110 70c-14 2-24 12-28 26"/><path d="M110 64c14 2 24 12 28 28"/><path d="M110 82c-10 4-16 12-18 22"/></g>
<g fill="#3FA36B"><ellipse cx="80" cy="98" rx="9" ry="4" transform="rotate(60 80 98)"/><ellipse cx="140" cy="94" rx="9" ry="4" transform="rotate(-60 140 94)"/><ellipse cx="91" cy="105" rx="8" ry="3.5" transform="rotate(70 91 105)"/></g>
<path d="M82 108h56l-8 34H90z" fill="#C0643A"/><rect x="80" y="104" width="60" height="7" rx="2" fill="#D9C08F"/><path d="M92 106l5 3 4-2M118 106l4 3 5-2" stroke="#9C7B45" stroke-width="1.4" fill="none"/>
<g><rect x="176" y="34" width="18" height="108" fill="#F2D35B" stroke="#8C6E12"/>${Array.from({length:13},(_,i) => `<line x1="176" x2="${i % 2 ? 182 : 186}" y1="${142 - i*8.5}" y2="${142 - i*8.5}" stroke="#5A4708"/>`).join('')}<text x="200" y="42" font-size="11" font-weight="700" fill="var(--ink)">12 cm</text><line x1="112" x2="176" y1="40" y2="40" stroke="var(--ink)" stroke-dasharray="3 3"/></g></svg>`;
L[2] = box => {
  const S2 = [['The plant is 12 cm tall.','O','You measured it with a ruler.'],['The leaves are drooping.','O','You can see it.'],['The plant needs water.','I','It explains why the plant droops.'],['The soil is light brown and cracked.','O','You can see the soil.'],['Someone forgot to water it.','I','It is a guess about why.']];
  const list = h('div',{class:'col',style:'gap:6px'}); let done = 0;
  S2.forEach(s => {
    const note = h('div',{class:'hint'});
    const mk = (lab, v) => h('button',{class:'chip',style:'min-height:36px;padding:4px 10px;background:var(--surf);border-color:var(--line)',onclick:ev => { if (row.dataset.d) return; const ok = v === s[1]; row.dataset.d = 1; ev.currentTarget.style.borderColor = `var(--${ok ? 'ok' : 'no'})`; row.style.borderColor = `var(--${ok ? 'ok' : 'no'})`; note.textContent = (ok ? '✓ ' : '✗ ') + (s[1] === 'O' ? 'Observation. ' : 'Inference. ') + s[2]; if (ok) xp(2); if (++done === S2.length){ bump(2, 10); toast('All 5 sorted!'); } }}, lab);
    const row = h('div',{class:'card',style:'padding:8px 10px;display:flex;flex-direction:column;gap:6px;border-width:2px'}, h('div',{class:'row sp',style:'flex-wrap:nowrap'}, h('b',{style:'font-size:15px'}, s[0]), h('div',{class:'row',style:'flex-wrap:nowrap;gap:4px'}, mk('👀','O'), mk('💡','I'))), note);
    list.append(row);
  });
  box.append(h('div',{class:'stage',html:PLANT}), h('div',{class:'rule'},'Did I notice it 👀, or am I explaining it 💡?'), list,
    h('div',{class:'hint c'},'Clue words for inferences: because · must · might · may · probably'));
};

/* 3 · testable questions */
L[3] = box => {
  let i = rnd(0, TESTQ.length - 1);
  const area = h('div',{class:'col'}), msg = out('', 17);
  const paint = () => {
    const p = TESTQ[i], two = shuffle([[p[0],1],[p[1],0]]); msg.innerHTML = '';
    area.replaceChildren(...two.map(([q,ok]) => { const b = h('button',{class:'opt',onclick:() => {
      area.querySelectorAll('.opt').forEach(x => x.disabled = true); b.classList.add(ok ? 'good' : 'bad');
      msg.innerHTML = ok ? `✓ Testable! You can measure <span class="hl">${p[2]}</span>.` : `✗ That one is an opinion. Words like best, prettiest, coolest can’t be measured.`; msg.style.color = `var(--${ok ? 'ok' : 'no'})`;
      if (ok){ xp(2); bump(3, 4); }
    }}, q); return b; }));
  };
  box.append(h('div',{class:'rule'},'Testable = you can change something and measure the result.'), h('div',{class:'hint'},'Tap the question a scientist could test.'), area, msg,
    h('button',{class:'btn ghost',onclick:() => { i = (i + 1) % TESTQ.length; paint(); }},'Next pair →'));
  paint();
};

/* 4 · fair tests: make two bean pots match except the water */
L[4] = box => {
  const C = [['Water','50 mL','100 mL',true],['Soil','potting soil','sand'],['Seed','bean','bean'],['Pot size','small','large'],['Light','sunny window','dark closet'],['Temperature','room temp','room temp']];
  const B = C.map(c => c[2]); const fig = h('div',{class:'stage'}), rows = h('div',{class:'col',style:'gap:6px'}), msg = out('', 17);
  const pot = (x, big, sand, sun, drops, lab) => { const w = big ? 64 : 48, hh = big ? 40 : 32, y = 132 - hh;
    return `<g>${sun ? `<circle cx="${x}" cy="22" r="10" fill="#F5B82E"/>` : `<path d="M${x+4} 14a10 10 0 1 0 6 14a8 8 0 1 1-6-14z" fill="var(--mut)"/>`}
    ${Array.from({length:drops},(_,k) => `<path d="M${x - 12 + k*12} 40c-3 5-4 7 0 9c4-2 3-4 0-9z" fill="#3F8FE0"/>`).join('')}
    <path d="M${x} ${y}V76M${x} 86c-8-4-14-2-16 2M${x} 82c8-4 14-2 16 2" stroke="#2E8B57" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M${x-w/2} ${y}h${w}l-6 ${hh}h${-w+12}z" fill="#C0643A"/><rect x="${x-w/2-2}" y="${y-4}" width="${w+4}" height="7" rx="2" fill="${sand ? '#E8D48A' : '#6B4A2B'}"/>
    <text x="${x}" y="146" font-size="11" font-weight="700" text-anchor="middle" fill="var(--ink)">${lab}</text></g>`; };
  const paint = () => {
    const A = C.map(c => c[1]);
    fig.innerHTML = `<svg class="fx" viewBox="0 0 260 150" role="img" aria-label="Two bean pots">${pot(70, A[3] === 'large', A[1] === 'sand', A[4] === 'sunny window', 2, 'Group A')}${pot(190, B[3] === 'large', B[1] === 'sand', B[4] === 'sunny window', 4, 'Group B')}</svg>`;
    const diff = C.filter((c,k) => !c[3] && B[k] !== c[1]).length;
    rows.replaceChildren(...C.map((c,k) => { const same = B[k] === c[1];
      return h('div',{class:'card',style:`display:grid;grid-template-columns:1fr auto;gap:6px;align-items:center;padding:6px 10px;border-color:var(--${c[3] ? 'x' : same ? 'line' : 'no'})`},
        h('div',{style:'min-width:0'}, h('b',{}, c[0]), h('div',{class:'hint'}, `A: ${c[1]} · B: ${B[k]}`)),
        c[3] ? h('span',{class:'chip',style:'min-height:30px;font-size:12px'},'changes (IV)') : same ? h('span',{style:'color:var(--ok);font-weight:700'},'✓ same') : h('button',{class:'chip',style:'min-height:34px;background:var(--hl);color:var(--hlk)',onclick:() => { B[k] = c[1]; paint(); }},'Make same')); }));
    msg.innerHTML = diff ? `✗ Not fair yet: ${diff} other thing${diff > 1 ? 's are' : ' is'} different` : '✓ Fair test! Only the water changes.'; msg.style.color = `var(--${diff ? 'no' : 'ok'})`;
    if (!diff && !box.dataset.won){ box.dataset.won = 1; bump(4, 12); xp(5); }
  };
  box.append(h('div',{class:'rule'},'Change ONE thing. Keep everything else the same.'), fig, msg, rows,
    h('button',{class:'btn ghost',onclick:() => { C.forEach((c,k) => B[k] = c[2]); delete box.dataset.won; paint(); }},'Mess it up again'));
  paint();
};

/* 5 · science steps */
L[5] = box => {
  let next = 0; const slots = h('div',{class:'ord'}), pk = h('div',{class:'pick'}), msg = out('', 16);
  const paint = () => {
    slots.replaceChildren(...STEPS.map((s,k) => h('div',{class:'slot' + (k < next ? ' good' : '')}, h('i',{}, k + 1), k < next ? h('div',{}, s[0], h('div',{class:'hint',style:'font-weight:400'}, s[1])) : h('span',{class:'mut',style:'font-weight:400'}, k === next ? 'Which step is next?' : ''))));
  };
  const deal = () => { next = 0; pk.replaceChildren(...shuffle(STEPS.map((s,i) => i)).map(i => { const b = h('button',{onclick:() => {
    if (i === next){ b.remove(); next++; paint(); if (next === 6){ msg.innerHTML = '🐹 <b>Q</b>uick <b>H</b>amsters <b>P</b>ack <b>E</b>xtra <b>A</b>pple <b>C</b>hips'; bump(5, 12); xp(5); } }
    else { b.classList.add('bad','shake'); setTimeout(() => b.classList.remove('bad','shake'), 450); }
  }}, STEPS[i][0]); return b; })); msg.innerHTML = ''; paint(); };
  box.append(h('div',{class:'hint'},'Tap the steps in order, 1 to 6.'), slots, pk, msg, h('button',{class:'btn ghost',onclick:deal},'Shuffle again'));
  deal();
};

/* 6 · IV and DV with a ramp */
L[6] = box => {
  let ht = 2; const fig = h('div',{class:'stage'}), msg = h('div',{class:'col',style:'gap:6px'}), sl = h('input',{type:'range',min:1,max:4,step:1,value:ht,'aria-label':'Ramp height'});
  const paint = () => {
    const rh = ht * 22, dist = 40 + ht * 45, x0 = 20, base = 120, rw = 70, px = x0 + rw + dist * .7;
    fig.innerHTML = `<svg class="fx" viewBox="0 0 280 150" role="img" aria-label="A toy car rolling off a ramp"><path d="M${x0} ${base}V${base - rh}L${x0 + rw} ${base}z" fill="var(--wt)" stroke="var(--w)" stroke-width="2.5"/>
    <line x1="0" x2="280" y1="${base}" y2="${base}" stroke="var(--ink)" stroke-width="2"/><line x1="${x0 + rw}" x2="${px}" y1="${base + 14}" y2="${base + 14}" stroke="var(--x)" stroke-width="2.5" marker-end="url(#ar)"/>
    <defs><marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="var(--x)"/></marker></defs>
    <text x="${x0 + rw + (px - x0 - rw) / 2}" y="${base + 28}" font-size="12" font-weight="700" text-anchor="middle" fill="var(--x)">${dist} cm</text>
    <text x="${x0 + 4}" y="${base - rh - 6}" font-size="12" font-weight="700" fill="var(--w)">${ht * 10} cm high</text>
    <g transform="translate(${px - 14} ${base - 14})"><rect width="28" height="10" rx="3" fill="var(--d)"/><circle cx="7" cy="12" r="3.5" fill="var(--ink)"/><circle cx="21" cy="12" r="3.5" fill="var(--ink)"/></g></svg>`;
    msg.innerHTML = `<div><b style="color:var(--w)">IF</b> the ramp is <span class="chip u-w" style="min-height:28px;padding:2px 8px">${ht * 10} cm high</span><div class="hint">↑ IV: the thing I change</div></div><div><b style="color:var(--x)">THEN</b> the car rolls <span class="chip u-x" style="min-height:28px;padding:2px 8px">${dist} cm</span><div class="hint">↑ DV: the data I measure</div></div>`;
  };
  sl.addEventListener('input', () => { ht = +sl.value; paint(); });
  let k = 0; const ex = h('div',{class:'card pad col',style:'gap:6px'});
  const showEx = (rev) => { const f = IFS[k]; ex.innerHTML = `<div><b>If</b> ${f[0]}, <b>then</b> ${f[1]}.</div>` + (rev ? `<div><span class="chip u-w" style="min-height:28px">IV: ${f[2]}</span></div><div><span class="chip u-x" style="min-height:28px">DV: ${f[3]}</span></div>` : ''); };
  box.append(h('div',{class:'rule'},'IV = what I change (cause). DV = what I measure (effect).'), fig, h('div',{class:'row sp'}, h('span',{class:'lbl'},'Ramp height'), h('b',{},'slide it')), sl, msg,
    h('div',{class:'lbl'},'Your turn'), ex, h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:() => { showEx(true); bump(6, 3); }},'Show IV & DV'), h('button',{class:'btn ghost',onclick:() => { k = (k + 1) % IFS.length; showEx(false); }},'Next one →')));
  paint(); showEx(false);
};

/* 7 · graphs and patterns */
L[7] = box => {
  const on = {title:false, x:false, y:false, scale:false}, fig = h('div',{class:'stage',style:'padding:6px'}), meter = h('div',{class:'hint c'}), pat = out('', 17);
  const paint = () => {
    fig.innerHTML = lineGraph({xs:[1,2,3,4], ys:[3,5,8,11], ymax:12, ystep:2, title:on.title ? 'Seedling Height Over Time' : '', xlab:on.x ? 'Week' : '', ylab:on.y ? 'Height (cm)' : '', scale:on.scale});
    const n = Object.values(on).filter(Boolean).length; meter.innerHTML = n === 4 ? '<b style="color:var(--ok)">✓ Great graph! 4 of 4</b>' : `Graph checklist: ${n} of 4`;
    if (n === 4 && !box.dataset.g){ box.dataset.g = 1; bump(7, 6); xp(3); }
  };
  const tg = (k, lab) => { const b = h('button',{class:'chip',onclick:() => { on[k] = !on[k]; b.classList.toggle('sel', on[k]); b.textContent = (on[k] ? '✓ ' : '+ ') + lab; paint(); }}, '+ ' + lab); return b; };
  box.append(h('div',{class:'hint'},'Add the parts a good graph needs.'), h('div',{class:'grid2'}, tg('title','Title'), tg('x','X-axis label'), tg('y','Y-axis label'), tg('scale','Even scale')), fig, meter,
    h('div',{html:tbl([['Week',1,2,3,4],['Height (cm)',3,5,8,11]])}), h('b',{},'What is the pattern?'),
    h('div',{class:'grid3'}, [['Goes up',1],['Goes down',0],['Stays same',0]].map(([t,ok]) => h('button',{class:'tile',style:'font-size:14px',onclick:ev => { box.querySelectorAll('.grid3 .tile').forEach(x => x.classList.remove('good','bad')); ev.currentTarget.classList.add(ok ? 'good' : 'bad'); pat.innerHTML = ok ? '✓ The seedling gets taller each week: 3 → 5 → 8 → 11 cm.' : '✗ Look at the numbers again.'; pat.style.color = `var(--${ok ? 'ok' : 'no'})`; if (ok) bump(7, 4); }}, t))), pat);
  paint();
};

/* 8 · mean, median, mode */
L[8] = box => {
  let m = {a:[3,10,5,7,5], srt:[3,5,5,7,10], sum:30, mean:6, median:5, mode:5}, sorted = false;
  const tiles = h('div',{class:'num-t'}), steps = h('div',{class:'card pad',style:'min-height:86px'});
  const paint = (hi) => {
    const arr = sorted ? m.srt : m.a;
    tiles.innerHTML = arr.map((n,i) => `<span class="${hi === 'med' && sorted && i === 2 ? 'mid' : hi === 'mode' && n === m.mode ? 'mo' : ''}">${n}</span>`).join('');
  };
  const say = html => { steps.innerHTML = html; };
  const B = (lab, fn) => h('button',{class:'btn ghost',style:'min-height:44px',onclick:fn}, lab);
  box.append(h('div',{class:'rule'},'Mean = average · Median = middle · Mode = most'), tiles,
    h('div',{class:'grid2'},
      B('↕ Sort', () => { sorted = true; paint(); say('Put the numbers in order, smallest to biggest. You need this for the median.'); }),
      B('➗ Mean', () => { paint(); say(`<b>Step 1: add.</b> ${m.a.join(' + ')} = ${m.sum}<br><b>Step 2: divide</b> by how many numbers: ${m.sum} ÷ 5 = <span class="hl">${m.mean}</span>`); xp(1); }),
      B('🎯 Median', () => { sorted = true; paint('med'); say(`In order: ${m.srt.join(', ')}.<br>The middle number is <span class="hl">${m.median}</span>.`); xp(1); }),
      B('🔁 Mode', () => { paint('mode'); say(m.mode == null ? 'No number repeats, so there is <span class="hl">no mode</span>.' : `<span class="hl">${m.mode}</span> appears most often, so the mode is ${m.mode}.`); xp(1); })),
    steps, h('button',{class:'btn hlb',onclick:() => { m = mmmSet(); sorted = false; paint(); say('New numbers! Try mean, median, and mode in your head first.'); bump(8, 3); }},'New numbers'),
    h('div',{class:'hint c'},'Tip: MOde = MOst. Median is in the middle, like the median of a road.'));
  paint(); say('Tap a button to see how it works.');
};

/* 9 · models and conclusions */
L[9] = box => {
  const area = h('div',{class:'col'});
  const models = () => {
    let s = pick(SEP); const card = h('div',{class:'def'}), opts = h('div',{class:'col',style:'gap:6px'}), msg = h('div',{class:'hint',style:'min-height:20px'});
    const deal = () => { card.innerHTML = `<div class="lbl">What practice is this?</div><div style="font-weight:700">${s[0]}</div>`; msg.textContent = '';
      opts.replaceChildren(...PRACTICES.map((p,i) => { const b = h('button',{class:'opt',style:'min-height:42px;padding:6px 12px',onclick:() => { opts.querySelectorAll('.opt').forEach(x => x.disabled = true); b.classList.add(i === s[1] ? 'good' : 'bad'); if (i !== s[1]) opts.children[s[1]].classList.add('good'); msg.innerHTML = i === s[1] ? '✓ Yes!' + (i === 1 ? ' A model represents something real.' : '') : `✗ It is <b>${PRACTICES[s[1]]}</b>.`; if (i === s[1]){ bump(9, 3); xp(2); } }}, p); return b; })); };
    area.replaceChildren(h('div',{class:'rule'},'🌍 Globe · 🌋 volcano · ☀️ solar system = MODELS'), card, opts, msg, h('button',{class:'btn ghost',onclick:() => { s = pick(SEP.filter(x => x !== s)); deal(); }},'Next →'));
    deal();
  };
  const concl = () => {
    const parts = [['The results support the hypothesis.',1],['6-hour plants averaged 12 cm.',1],['3-hour plants averaged 8 cm.',1],['That is a 4 cm difference.',1],['I liked the experiment.',0],['My hypothesis was right.',0],['Change the data so it looks better.',0]];
    let used = []; const para = h('div',{class:'card pad',style:'min-height:70px;font-weight:700'}), meter = h('div',{class:'bar u-d'}, h('i',{style:'width:0%'})), msg = h('div',{class:'hint',style:'min-height:20px'});
    const chips = h('div',{class:'pick'}, shuffle(parts).map(p => { const b = h('button',{onclick:() => {
      if (!p[1]){ b.classList.add('bad','shake'); msg.innerHTML = p[0].startsWith('Change') ? '✗ Never change data. Report results honestly.' : '✗ That is not evidence. Use the numbers.'; setTimeout(() => b.classList.remove('shake'), 400); return; }
      if (used.includes(p)) return; used.push(p); b.disabled = true; para.textContent = used.map(x => x[0]).join(' '); meter.firstChild.style.width = used.length * 25 + '%'; msg.textContent = used.length === 4 ? '✓ Strong conclusion! It answers the question and uses evidence.' : 'Keep going: add more evidence.';
      if (used.length === 4){ bump(9, 10); xp(5); }
    }}, p[0]); return b; }));
    para.innerHTML = '<span class="hint" style="font-weight:400">Tap sentences to build the conclusion.</span>';
    area.replaceChildren(h('div',{class:'stage',style:'padding:6px'}, h('div',{html:`<svg class="fx" viewBox="0 0 260 110" role="img" aria-label="Bar chart: 6 hours of light 12 cm, 3 hours 8 cm"><rect width="260" height="110" fill="var(--surf)" rx="10"/><line x1="30" x2="240" y1="92" y2="92" stroke="var(--ink)" stroke-width="1.6"/><rect x="60" y="20" width="56" height="72" fill="var(--d)"/><rect x="150" y="44" width="56" height="48" fill="var(--dt)" stroke="var(--d)" stroke-width="2"/><text x="88" y="15" font-size="12" font-weight="700" text-anchor="middle" fill="var(--ink)">12 cm</text><text x="178" y="39" font-size="12" font-weight="700" text-anchor="middle" fill="var(--ink)">8 cm</text><text x="88" y="105" font-size="11" text-anchor="middle" fill="var(--ink)">6 hours light</text><text x="178" y="105" font-size="11" text-anchor="middle" fill="var(--ink)">3 hours light</text></svg>`})),
      h('div',{class:'hint'},'Prediction: more light = taller plants.'), para, meter, chips, msg);
  };
  box.append(seg([['m','Models & practices'],['c','Conclusions']], 'm', k => k === 'm' ? models() : concl()), area);
  models();
};

/* the Learn tab */
function practiceSet(id, n){
  const out = [], seen = new Set();
  for (let t = 0; t < 60 && out.length < n; t++){ const q = GENS[id](), key = JSON.stringify([q.prompt, q.ctx, q.fig, q.choices && q.choices.slice().sort(), q.rows && q.rows.map(r => r.opts.slice().sort()), q.blanks && q.blanks.map(b => b.answer), q.type]); if (!seen.has(key)){ seen.add(key); out.push(q); } }
  return out;
}
VIEWS.learn = v => {
  let open = null; const heads = {};
  v.append(h('div',{class:'card pad row sp',style:'flex-wrap:nowrap'}, h('div',{}, h('b',{style:'font:600 17px var(--fd)'},'9 skills for the test'), h('div',{class:'hint'},'Open one, play with it, then practice 5.')), h('span',{style:'font-size:30px'},'🧪')));
  Object.entries(UNITS).forEach(([u,name]) => {
    v.append(h('div',{class:'unit u-' + u}, h('h2',{}, name)));
    SKILLS.filter(t => t.u === u).forEach(t => {
      const m = mast(t.id), dot = h('i',{class:'dot ' + (m >= 80 ? 'm' : m >= 30 ? 'h' : '')}), body = h('div',{class:'body',hidden:true});
      const head = h('button',{'aria-expanded':'false'}, h('span',{class:'ico'}, t.e), t.n, dot), card = h('div',{class:'card tp u-' + t.u}, head, body); heads[t.id] = head;
      const lesson = () => {
        if (cleanup){ cleanup(); cleanup = null; }
        body.replaceChildren(); L[t.id](body);
        body.append(h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:() => practice()},'Practice 5'), h('button',{class:'btn ghost',onclick:() => { bump(t.id, 15); dot.className = 'dot ' + (mast(t.id) >= 80 ? 'm' : 'h'); xp(5); toast('Nice! +15 mastery'); }},'I know this')));
      };
      const practice = () => {
        const box = h('div',{class:'col'});
        body.replaceChildren(backBtn('Back to lesson', lesson), box);
        const run = () => runSet(box, practiceSet(t.id, 5), {mode:'drill', actions:() => [h('div',{class:'grid2'}, h('button',{class:'btn hlb',onclick:run},'5 more'), h('button',{class:'btn ghost',onclick:lesson},'Back to lesson'))]});
        run(); card.scrollIntoView({block:'start'});
      };
      head.addEventListener('click', () => {
        const was = !body.hidden;
        if (open){ open.b.hidden = true; open.b.replaceChildren(); open.h.setAttribute('aria-expanded','false'); open = null; if (cleanup){ cleanup(); cleanup = null; } }
        if (!was){ lesson(); body.hidden = false; head.setAttribute('aria-expanded','true'); open = {b:body, h:head}; setTimeout(() => card.scrollIntoView({behavior:'smooth',block:'start'}), 50); }
      });
      v.append(card);
    });
  });
  if (S.focus){ const f = heads[S.focus]; S.focus = null; if (f) setTimeout(() => f.click(), 0); }
};
