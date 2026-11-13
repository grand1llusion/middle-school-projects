/* ---------- PICTURES: fraction bars, pizzas, number lines, tape diagrams (all SVG strings) ---------- */
const PA = 'var(--pa)', PB = 'var(--pb)', PC = 'var(--pc)';
const r2 = v => (Math.round(v * 100) / 100).toString();

/* a stacked fraction and a mixed number drawn inside an SVG, centered on (x, y) = the fraction bar */
function sFr(x, y, n, d, c, z){
  z = z || 12; c = c || 'var(--ink)'; const hw = Math.max(String(n).length, String(d).length) * z * .32 + 3;
  return `<text x="${r2(x)}" y="${r2(y - 3)}" font-size="${z}" font-weight="800" text-anchor="middle" fill="${c}">${n}</text><line x1="${r2(x - hw)}" x2="${r2(x + hw)}" y1="${r2(y)}" y2="${r2(y)}" stroke="${c}" stroke-width="1.5"/><text x="${r2(x)}" y="${r2(y + z - 1)}" font-size="${z}" font-weight="800" text-anchor="middle" fill="${c}">${d}</text>`;
}
function sMx(x, y, q, c, z){
  z = z || 12; c = c || 'var(--ink)'; const w = whole(q), r = q.n - w * q.d;
  if (!r) return `<text x="${r2(x)}" y="${r2(y + z * .45)}" font-size="${r2(z * 1.3)}" font-weight="800" text-anchor="middle" fill="${c}">${w}</text>`;
  if (!w) return sFr(x, y, r, q.d, c, z);
  const ww = String(w).length * z * .74, hw = Math.max(String(r).length, String(q.d).length) * z * .32 + 3, left = x - (ww + 2 + 2 * hw) / 2;
  return `<text x="${r2(left + ww)}" y="${r2(y + z * .45)}" font-size="${r2(z * 1.3)}" font-weight="800" text-anchor="end" fill="${c}">${w}</text>` + sFr(left + ww + 2 + hw, y, r, q.d, c, z);
}

/* fraction bars. rows: [{parts, on (count, or a list of piece numbers), col, cut (sub-cuts per original piece), cross:[from, to), lab:{n,d} or q, tag}] */
function bars(rows, o){
  o = o || {};
  const W = o.w || 320, LW = o.lw == null ? 50 : o.lw, BH = o.bh || 26, G = o.gap || 12, H = rows.length * (BH + G) - G + 8, x0 = LW + 2, x1 = W - (o.rw || 0) - 3, bw = x1 - x0;
  let s = '';
  rows.forEach((r, i) => {
    const y = 4 + i * (BH + G), n = r.parts, pw = bw / n, cut = r.cut || 1;
    for (let k = 0; k < n; k++){
      const on = typeof r.on === 'number' ? k < r.on : (r.on || []).includes(k), fill = r.fills ? r.fills[k] : on ? (r.col || PA) : 'var(--surf)';
      s += `<rect x="${r2(x0 + k * pw)}" y="${y}" width="${r2(pw + .4)}" height="${BH}" fill="${fill}"/>`;
    }
    for (let k = 1; k < n; k++){ const x = r2(x0 + k * pw), sub = k % cut !== 0; s += `<line x1="${x}" x2="${x}" y1="${y}" y2="${y + BH}" stroke="var(--ink)" stroke-width="${sub ? .8 : 1.4}"${sub ? ' stroke-dasharray="3 2"' : ''}/>`; }
    if (r.cross) for (let k = r.cross[0]; k < r.cross[1]; k++){ const x = x0 + k * pw, m = Math.min(5, pw * .25); s += `<path d="M${r2(x + m)} ${y + 5}L${r2(x + pw - m)} ${y + BH - 5}M${r2(x + pw - m)} ${y + 5}L${r2(x + m)} ${y + BH - 5}" stroke="var(--no)" stroke-width="2.2" stroke-linecap="round"/>`; }
    s += `<rect x="${x0}" y="${y}" width="${r2(bw)}" height="${BH}" rx="3" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
    if (r.lab) s += r.lab.d === 1 || r.lab.n >= r.lab.d ? sMx(LW / 2, y + BH / 2, r.lab, r.col || 'var(--ink)', 12) : sFr(LW / 2, y + BH / 2, r.lab.n, r.lab.d, r.col || 'var(--ink)', 12);
    if (r.tag) s += `<text x="${r2(x1 + 6)}" y="${y + BH / 2 + 5}" font-size="13" font-weight="800" fill="var(--ink)">${r.tag}</text>`;
  });
  return `<svg class="fx" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.label || 'Fraction bars'}" data-bars="${rows.map(r => r.parts + ':' + (typeof r.on === 'number' ? r.on : (r.on || []).length)).join(',')}">${s}</svg>`;
}

/* n pizzas (or brownies), each cut into k equal pieces. Friend 1's piece of each one is colored. */
function pies(n, k, sq){
  const W = 320, per = n <= 5 ? n : Math.ceil(n / 2), rows = Math.ceil(n / per), cell = Math.min(62, (W - 8) / per), R = cell / 2 - 5, H = rows * cell + 6;
  let s = '';
  for (let i = 0; i < n; i++){
    const r = Math.floor(i / per), c = i % per, inRow = r === rows - 1 ? n - per * (rows - 1) : per, cx = (W - inRow * cell) / 2 + c * cell + cell / 2, cy = 3 + r * cell + cell / 2;
    if (sq){
      const x = cx - R, y = cy - R, sw = 2 * R / k;
      s += `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(2 * R)}" height="${r2(2 * R)}" rx="5" fill="var(--brw)"/><rect x="${r2(x)}" y="${r2(y)}" width="${r2(sw)}" height="${r2(2 * R)}" rx="3" fill="var(--x)"/>`;
      for (let j = 1; j < k; j++) s += `<line x1="${r2(x + j * sw)}" x2="${r2(x + j * sw)}" y1="${r2(y)}" y2="${r2(y + 2 * R)}" stroke="var(--surf)" stroke-width="1.6"/>`;
      s += `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(2 * R)}" height="${r2(2 * R)}" rx="5" fill="none" stroke="var(--brwk)" stroke-width="2"/>`;
    } else {
      const P = a => [cx + R * Math.cos(a), cy + R * Math.sin(a)], a0 = -Math.PI / 2, a1 = a0 + 2 * Math.PI / k, [x0, y0] = P(a0), [x1, y1] = P(a1);
      s += `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(R)}" fill="var(--chz)" stroke="var(--crust)" stroke-width="3"/>`;
      s += `<path d="M${r2(cx)} ${r2(cy)}L${r2(x0)} ${r2(y0)}A${r2(R)} ${r2(R)} 0 ${k < 2 ? 1 : 0} 1 ${r2(x1)} ${r2(y1)}Z" fill="var(--x)"/>`;
      for (let j = 0; j < k; j++){ const [x, y] = P(a0 + j * 2 * Math.PI / k); s += `<line x1="${r2(cx)}" y1="${r2(cy)}" x2="${r2(x)}" y2="${r2(y)}" stroke="var(--crust)" stroke-width="1.6"/>`; }
    }
  }
  return `<svg class="fx" viewBox="0 0 ${W} ${H}" role="img" aria-label="${n} ${sq ? 'brownies' : 'pizzas'}, each cut into ${k} equal pieces" data-share="${n}/${k}">${s}</svg>`;
}

/* number line with fraction ticks. o: {min, max, den, w, arr:[{a, b, c, t}], pts:[{x, t, c}]} (a, b, x are fractions {n,d}) */
function nlF(o){
  const W = o.w || 320, P = 14, hasArc = (o.arr || []).length, y0 = hasArc ? (o.arcLab === false ? 52 : 76) : 30, H = y0 + 30;
  const X = v => P + (v - o.min) / (o.max - o.min) * (W - 2 * P), n = Math.round((o.max - o.min) * o.den);
  let s = `<rect width="${W}" height="${H}" rx="10" fill="var(--surf)"/><line x1="5" x2="${W - 5}" y1="${y0}" y2="${y0}" stroke="var(--ink)" stroke-width="2"/><path d="M3 ${y0}l7-5v10zM${W - 3} ${y0}l-7-5v10z" fill="var(--ink)"/>`;
  for (let k = 0; k <= n; k++){
    const v = o.min + k / o.den, big = k % o.den === 0, x = r2(X(v));
    s += `<line x1="${x}" x2="${x}" y1="${y0 - (big ? 8 : 5)}" y2="${y0 + (big ? 8 : 5)}" stroke="var(--ink)" stroke-width="${big ? 1.8 : 1.1}"/>`;
    if (big) s += `<text x="${x}" y="${y0 + 23}" font-size="12" font-weight="700" text-anchor="middle" fill="var(--ink)">${Math.round(v)}</text>`;
  }
  (o.arr || []).forEach(a => {
    const x1 = X(qv(a.a)), x2 = X(qv(a.b)), mx = (x1 + x2) / 2, cy = y0 - 46, c = a.c || 'var(--x)';
    const ex = x2 - 1, ey = y0 - 4, dx = ex - mx, dy = ey - cy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    s += `<path d="M${r2(x1)} ${y0 - 3}Q${r2(mx)} ${cy} ${r2(ex - ux * 7)} ${r2(ey - uy * 7)}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<path d="M${r2(ex)} ${r2(ey)}L${r2(ex - ux * 10 - uy * 5)} ${r2(ey - uy * 10 + ux * 5)}L${r2(ex - ux * 10 + uy * 5)} ${r2(ey - uy * 10 - ux * 5)}Z" fill="${c}"/>`;
    if (a.t && o.arcLab !== false) s += sMx(mx, y0 - 58, a.t, c, 11);
  });
  (o.pts || []).forEach(p => { const x = X(qv(p.x)); s += `<circle cx="${r2(x)}" cy="${y0}" r="5.5" fill="${p.c || 'var(--ink)'}" stroke="var(--surf)" stroke-width="1.5"/>`; if (p.t) s += `<text x="${r2(x)}" y="${y0 - 11}" font-size="12" font-weight="800" text-anchor="middle" fill="${p.c || 'var(--ink)'}">${p.t}</text>`; });
  return `<svg class="fx" viewBox="0 0 ${W} ${H}" role="img" aria-label="Number line from ${o.min} to ${o.max} in ${unitName(o.den)}" data-arr="${(o.arr || []).map(a => MXt(a.a) + '>' + MXt(a.b)).join(',')}">${s}</svg>`;
}
/* a number line that fits these values, or null when the ticks would be too crowded */
function fitLine(vals, den, extra){
  const max = Math.max(1, Math.ceil(Math.max(...vals.map(qv)) - 1e-9));
  return max * den <= 48 ? nlF(Object.assign({min:0, max, den}, extra || {})) : null;
}

/* tape diagram. rows: [{lab, segs:[{v, t, c, dash}]}], all drawn to one scale */
function tape(rows, o){
  o = o || {};
  const W = o.w || 320, LW = o.lw || 74, BH = 30, G = 10, max = o.max || Math.max(...rows.map(r => r.segs.reduce((s, g) => s + qv(g.v), 0))), sc = (W - LW - 6) / max, H = rows.length * (BH + G) - G + 6;
  let s = '';
  rows.forEach((r, i) => {
    const y = 3 + i * (BH + G); let x = LW;
    s += `<text x="${LW - 6}" y="${y + BH / 2 + 4}" font-size="11.5" font-weight="700" text-anchor="end" fill="var(--ink)">${r.lab}</text>`;
    r.segs.forEach(g => {
      const w = qv(g.v) * sc;
      s += `<rect x="${r2(x)}" y="${y}" width="${r2(w)}" height="${BH}" rx="5" fill="${g.dash ? 'var(--surf)' : g.c || 'var(--wt)'}" stroke="var(--ink)" stroke-width="1.6"${g.dash ? ' stroke-dasharray="5 3"' : ''}/>`;
      if (g.t) s += `<text x="${r2(x + w / 2)}" y="${y + BH / 2 + 5}" font-size="12.5" font-weight="800" text-anchor="middle" fill="${g.dash ? 'var(--ink)' : 'var(--hlk)'}">${g.t}</text>`;
      x += w;
    });
  });
  return `<svg class="fx" viewBox="0 0 ${W} ${H}" role="img" aria-label="${o.label || 'Tape diagram'}">${s}</svg>`;
}
