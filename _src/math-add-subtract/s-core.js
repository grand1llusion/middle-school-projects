/* ---------- CORE ---------- */
const $ = (s, r=document) => r.querySelector(s);
function h(tag, a, ...kids){
  const e = document.createElement(tag);
  if (a) for (const k in a){
    const v = a[k];
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.slice(0,2) === 'on') e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(9)) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
  return e;
}
const shuffle = arr => { const a = arr.slice(); for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const rnd = (a,b) => a + Math.floor(Math.random()*(b-a+1));
const pick = arr => arr[Math.floor(Math.random()*arr.length)];
const N = x => String(Math.round(x*1000)/1000).replace('-','−');

/* state */
const KEY = 'plus-minus-lab-v1';
let S = { m:{}, tab:'learn', xp:0, best:0, bossRuns:0, hs:{}, chk:{} };
try { const r = localStorage.getItem(KEY); if (r) S = Object.assign(S, JSON.parse(r)); } catch(e){}
S.hs = S.hs || {}; S.chk = S.chk || {}; S.m = S.m || {};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} };
const mast = id => S.m[id] || 0;

const UNITS = { w:'Number Lines', x:'Adding', d:'Subtracting' };
const SKILLS = [
  [1,'w','Hop on the Number Line','🐸'],[2,'w','Distance Between Points','📏'],
  [3,'x','Same Signs','🤝'],[4,'x','Opposite Signs','🪢'],[5,'x','Estimate First','🎯'],
  [6,'d','Keep · Change · Change','🔄'],[7,'d','Subtract Fractions & Decimals','🍕'],[8,'d','Temperature Problems','🌡️']
].map(([id,u,n,e]) => ({id,u,n,e}));
const SK = Object.fromEntries(SKILLS.map(t => [t.id, t]));

/* no test date in the materials: the kicker names the unit instead */
const TEST_DATE = null; /* e.g. new Date(2026, 10, 6) */
function testLine(){
  if (!TEST_DATE) return '<b>Grade 7</b> · Module 2';
  const now = new Date(), d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()), days = Math.round((TEST_DATE - d0) / 864e5);
  const lab = TEST_DATE.toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric'});
  if (days < 0) return '<b>Grade 7</b> · Module 2';
  if (days === 0) return '<b>Quiz today!</b> You got this';
  return days === 1 ? `<b>Quiz tomorrow</b> · ${lab}` : `<b>Quiz in ${days} days</b> · ${lab}`;
}

const lvl = () => Math.floor(S.xp / 100) + 1;
const overall = () => Math.round(SKILLS.reduce((s,t) => s + mast(t.id), 0) / SKILLS.length);
function drawRing(){
  const p = overall(), C = 2*Math.PI*17;
  $('#ring').innerHTML = `<svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="17" fill="none" stroke="var(--line)" stroke-width="5"/><circle cx="21" cy="21" r="17" fill="none" stroke="var(--pos)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p/100)}"/></svg><b>${p}%</b>`;
  $('#ring').setAttribute('role','img'); $('#ring').setAttribute('aria-label','Overall mastery ' + p + ' percent');
  $('#lv').innerHTML = `Level ${lvl()}<br>${S.xp} XP`;
  $('#kick').innerHTML = testLine();
}
function bump(id, d){ S.m[id] = Math.max(0, Math.min(100, mast(id) + d)); save(); drawRing(); }
function xp(n){ const was = lvl(); S.xp += n; save(); drawRing(); if (lvl() > was) toast('Level up! Level ' + lvl()); }
let tt;
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 1600); }

const ICONS = {
  learn:'<path d="M12 3v9M7.5 7.5h9M7.5 18h9"/>',
  guide:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
  boss:'<path d="M6 3v18M6 4h11l-2 4 2 4H6"/>',
  games:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><path d="M16.5 13v7M13 16.5h7"/>',
  me:'<path d="M5 19V11M12 19V5M19 19v-5"/>'
};
const TABS = [['learn','Learn'],['guide','Study Guide'],['boss','Boss Quiz'],['games','Games'],['me','Progress']];
const VIEWS = {};
let cleanup = null;
function go(tab){
  if (cleanup){ cleanup(); cleanup = null; }
  S.tab = tab; save();
  document.querySelectorAll('#nav button').forEach(b => { const on = b.dataset.t === tab; b.classList.toggle('on', on); on ? b.setAttribute('aria-current','page') : b.removeAttribute('aria-current'); });
  const v = $('#view'); v.replaceChildren(); VIEWS[tab](v);
  window.scrollTo(0,0);
}
function buildNav(){
  const n = $('#nav');
  TABS.forEach(([k,l]) => n.append(h('button',{'data-t':k,onclick:()=>go(k)}, h('span',{html:`<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg>`}), l)));
}
function seg(items, cur, fn){
  const el = h('div',{class:'seg'});
  items.forEach(([k,l]) => el.append(h('button',{class:k===cur?'on':'',onclick:ev => { el.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === ev.currentTarget)); fn(k); }}, l)));
  return el;
}
const backBtn = (label, fn) => h('button',{class:'btn ghost back',onclick:fn}, '← ' + label);
const tbl = rows => `<table class="tb">${rows.map(r => `<tr><th>${r[0]}</th>${r.slice(1).map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;

/* number line. o: {min, max, tick, lab, pts:[{x, t, c}], arr:[{a, b, c, t}], w}
   arrows stack above the line in the order given; data-* attributes let the tests read the picture */
const fmtTick = v => (v < 0 ? '−' : '') + String(Math.round(Math.abs(v) * 1000) / 1000);
function nline(o){
  const W = o.w || 320, P = 18, arr = o.arr || [], top = 10 + arr.length * 24, y0 = top + 14, H = y0 + 30;
  const X = v => P + (v - o.min) / (o.max - o.min) * (W - 2 * P);
  const n = Math.round((o.max - o.min) / o.tick), labEvery = Math.max(1, Math.round(o.lab / o.tick));
  let s = `<rect width="${W}" height="${H}" rx="10" fill="var(--surf)"/>`;
  s += `<line x1="6" x2="${W - 6}" y1="${y0}" y2="${y0}" stroke="var(--ink)" stroke-width="2"/><path d="M4 ${y0}l7-5v10zM${W - 4} ${y0}l-7-5v10z" fill="var(--ink)"/>`;
  for (let k = 0; k <= n; k++){
    const v = o.min + k * o.tick, big = k % labEvery === 0, x = X(v).toFixed(1);
    s += `<line x1="${x}" x2="${x}" y1="${y0 - (big ? 7 : 4)}" y2="${y0 + (big ? 7 : 4)}" stroke="var(--ink)" stroke-width="${Math.abs(v) < 1e-9 ? 2.4 : 1.4}"/>`;
    if (big) s += `<text x="${x}" y="${y0 + 21}" font-size="${o.fs || 10.5}" text-anchor="middle" fill="var(--ink)" font-weight="${Math.abs(v) < 1e-9 ? 700 : 400}">${fmtTick(v)}</text>`;
  }
  arr.forEach((a, r) => {
    const y = 12 + r * 24, x1 = X(a.a), x2 = X(a.b), dir = x2 >= x1 ? 1 : -1, c = a.c || 'var(--ink)';
    if (Math.abs(x2 - x1) > 1) s += `<line x1="${x1.toFixed(1)}" x2="${(x2 - dir * 7).toFixed(1)}" y1="${y}" y2="${y}" stroke="${c}" stroke-width="3" stroke-linecap="round"/><path d="M${x2.toFixed(1)} ${y}l${-dir * 9} -6v12z" fill="${c}"/>`;
    s += `<circle cx="${x1.toFixed(1)}" cy="${y}" r="3.5" fill="${c}"/><line x1="${x2.toFixed(1)}" x2="${x2.toFixed(1)}" y1="${y + 4}" y2="${y0 - 2}" stroke="${c}" stroke-dasharray="2 3" opacity=".55"/>`;
    if (a.t) s += `<text x="${((x1 + x2) / 2).toFixed(1)}" y="${y - 5}" font-size="11" font-weight="700" text-anchor="middle" fill="${c}">${a.t}</text>`;
  });
  (o.pts || []).forEach(p => { const x = X(p.x).toFixed(1); s += `<circle cx="${x}" cy="${y0}" r="5.5" fill="${p.c || 'var(--ink)'}" stroke="var(--surf)" stroke-width="1.5"/>`; if (p.t) s += `<text x="${x}" y="${y0 - 10}" font-size="13" font-weight="800" text-anchor="middle" fill="${p.c || 'var(--ink)'}">${p.t}</text>`; });
  const data = arr.map(a => `${a.a}>${a.b}`).join(',');
  return `<svg class="fx" viewBox="0 0 ${W} ${H}" role="img" aria-label="Number line" data-arr="${data}" data-pts="${(o.pts || []).map(p => (p.t || '') + '=' + p.x).join(',')}">${s}</svg>`;
}
/* pick a friendly range and tick for a set of values */
function autoLine(vals, extra){
  let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals); const span = hi - lo || 1;
  const tick = span <= 6 ? .5 : span <= 14 ? 1 : span <= 30 ? 2 : 5, lab = span <= 6 ? 1 : span <= 14 ? 2 : span <= 30 ? 4 : 10;
  lo = Math.floor(lo / lab) * lab - (lo % lab === 0 ? lab : 0); hi = Math.ceil(hi / lab) * lab + (hi % lab === 0 ? lab : 0);
  return Object.assign({min:lo, max:hi, tick, lab}, extra || {});
}
