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
const N = x => String(Math.round(x*1000)/1000);

/* state */
const KEY = 'sci-method-lab-v1';
let S = { m:{}, tab:'learn', xp:0, best:0, bossRuns:0, hs:{}, chk:{} };
try { const r = localStorage.getItem(KEY); if (r) S = Object.assign(S, JSON.parse(r)); } catch(e){}
S.hs = S.hs || {}; S.chk = S.chk || {}; S.m = S.m || {};
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} };
const mast = id => S.m[id] || 0;

const UNITS = { w:'Words & Observing', x:'Experiments', d:'Data & Conclusions' };
const SKILLS = [
  [1,'w','Science Words','🔤'],[2,'w','Observe or Infer?','👀'],
  [3,'x','Testable Questions','❓'],[4,'x','Fair Tests','⚖️'],[5,'x','Science Steps','🪜'],[6,'x','IV & DV','🎯'],
  [7,'d','Graphs & Patterns','📈'],[8,'d','Mean, Median, Mode','🧮'],[9,'d','Models & Conclusions','🌋']
].map(([id,u,n,e]) => ({id,u,n,e}));
const SK = Object.fromEntries(SKILLS.map(t => [t.id, t]));

/* test day: Wednesday, Oct 28, 2026 (from the class slides) */
function testLine(){
  const t = new Date(2026, 9, 28), now = new Date(), d0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((t - d0) / 864e5);
  if (days < 0) return '6th Grade Science';
  if (days === 0) return '<b>Test today!</b> You got this';
  if (days === 1) return '<b>Test tomorrow</b> · Wed Oct 28';
  return `<b>Test in ${days} days</b> · Wed Oct 28`;
}

const lvl = () => Math.floor(S.xp / 100) + 1;
const overall = () => Math.round(SKILLS.reduce((s,t) => s + mast(t.id), 0) / SKILLS.length);
function drawRing(){
  const p = overall(), C = 2*Math.PI*17;
  $('#ring').innerHTML = `<svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="17" fill="none" stroke="var(--line)" stroke-width="5"/><circle cx="21" cy="21" r="17" fill="none" stroke="var(--x)" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p/100)}"/></svg><b>${p}%</b>`;
  $('#ring').setAttribute('role','img'); $('#ring').setAttribute('aria-label','Overall mastery ' + p + ' percent');
  $('#lv').innerHTML = `Level ${lvl()}<br>${S.xp} XP`;
  $('#kick').innerHTML = testLine();
}
function bump(id, d){ S.m[id] = Math.max(0, Math.min(100, mast(id) + d)); save(); drawRing(); }
function xp(n){ const was = lvl(); S.xp += n; save(); drawRing(); if (lvl() > was) toast('Level up! Level ' + lvl()); }
let tt;
function toast(msg){ const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => t.hidden = true, 1600); }

const ICONS = {
  learn:'<path d="M9 3h6M10 3v6L5 18a2 2 0 0 0 1.7 3h10.6A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 14h9"/>',
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

/* small line graph for patterns: xs labels, ys values */
function lineGraph(o){
  const W = 280, H = 170, L = o.bare ? 14 : 40, R = 12, T = o.title ? 26 : 12, B = o.bare ? 14 : 34, n = o.ys.length, ymax = o.ymax;
  const px = i => L + (i + .5) * (W - L - R) / n, py = y => H - B - y / ymax * (H - B - T);
  let s = `<rect width="${W}" height="${H}" rx="10" fill="var(--surf)"/>`;
  if (o.scale !== false) for (let y = 0; y <= ymax; y += o.ystep) s += `<line x1="${L}" x2="${W-R}" y1="${py(y)}" y2="${py(y)}" stroke="var(--line)"/>` + (o.bare ? '' : `<text x="${L-6}" y="${py(y)+4}" font-size="10" text-anchor="end" fill="var(--mut)">${y}</text>`);
  s += `<path d="M${L} ${T}V${H-B}H${W-R}" fill="none" stroke="var(--ink)" stroke-width="1.8"/>`;
  if (o.scale !== false && !o.bare) o.xs.forEach((x,i) => { s += `<text x="${px(i)}" y="${H-B+14}" font-size="10" text-anchor="middle" fill="var(--mut)">${x}</text>`; });
  s += `<polyline points="${o.ys.map((y,i) => px(i)+','+py(y)).join(' ')}" fill="none" stroke="var(--ac,var(--d))" stroke-width="3" stroke-linejoin="round"/>`;
  o.ys.forEach((y,i) => { s += `<circle cx="${px(i)}" cy="${py(y)}" r="4.5" fill="var(--ink)"/>`; });
  if (o.title) s += `<text x="${(L+W-R)/2}" y="17" font-size="13" font-weight="700" text-anchor="middle" fill="var(--ink)">${o.title}</text>`;
  if (o.xlab) s += `<text x="${(L+W-R)/2}" y="${H-4}" font-size="11" font-weight="700" text-anchor="middle" fill="var(--ink)">${o.xlab}</text>`;
  if (o.ylab) s += `<text transform="translate(11 ${(T+H-B)/2}) rotate(-90)" font-size="11" font-weight="700" text-anchor="middle" fill="var(--ink)">${o.ylab}</text>`;
  return `<svg class="fx" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line graph">${s}</svg>`;
}
