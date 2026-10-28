/* ---------- PRACTICE ENGINE ---------- */
const partMax = p => p.type === 'rows' ? p.rows.length : p.type === 'num' ? p.blanks.length : p.type === 'multi' ? p.pick : 1;
function parseNum(s){
  s = String(s == null ? '' : s).trim(); if (!s) return NaN;
  const m = s.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/); if (m) return +m[2] ? m[1] / m[2] : NaN;
  return /^\d*\.?\d+$|^\d+\.$/.test(s) ? Number(s) : NaN;
}
const isRight = (typed, b) => b.answer == null ? typed === 'none' : (typed !== 'none' && Math.abs(parseNum(typed) - b.answer) < 1e-6);
function grade(p, r){
  const max = partMax(p);
  if (p.type === 'mc') return {got: r === p.answer ? 1 : 0, max};
  if (p.type === 'rows') return {got: p.rows.filter((row,i) => r && r[i] === row.a).length, max};
  if (p.type === 'num') return {got: p.blanks.filter((b,i) => r && isRight(r[i], b)).length, max};
  if (p.type === 'order') return {got: r && r.length === p.items.length && r.every((v,i) => v === i) ? 1 : 0, max};
  return {got: Math.min(p.pick, (r || []).filter(i => p.correct.includes(i)).length), max};
}
const showVal = v => v === 'none' ? 'no mode' : v;
function answerText(p){
  if (p.type === 'mc') return p.choices[p.answer];
  if (p.type === 'rows') return p.rows.map(r => `${r.h} ${r.opts[r.a]}`).join(' · ');
  if (p.type === 'num') return p.blanks.map(b => `${b.label} ${b.answer == null ? 'no mode' : N(b.answer)}`).join(' · ');
  if (p.type === 'order') return p.items.join(' → ');
  return (p.correct.length > p.pick ? `Any ${p.pick}: ` : '') + p.correct.map(i => p.choices[i]).join(', ');
}
function userText(p, r){
  if (r == null || (Array.isArray(r) && !r.length)) return '(no answer)';
  if (p.type === 'mc') return p.choices[r];
  if (p.type === 'rows') return p.rows.map((row,i) => `${row.h} ${r[i] != null ? row.opts[r[i]] : '–'}`).join(' · ');
  if (p.type === 'num') return p.blanks.map((b,i) => `${b.label} ${showVal(r[i]) || '–'}`).join(' · ');
  if (p.type === 'order') return r.map(i => p.items[i]).join(' → ');
  return r.map(i => p.choices[i]).join(', ');
}
/* the order puzzle shows items shuffled; keep one shuffle per question */
const orderView = p => p._sh || (p._sh = shuffle(p.items.map((_,i) => i)));

function runSet(box, items, o){
  const boss = o.mode === 'boss';
  const resp = items.map(() => null), res = items.map(() => null), total = items.reduce((s,p) => s + partMax(p), 0);
  let idx = 0, kd = null;
  const stopKd = () => { if (kd){ document.removeEventListener('keydown', kd); kd = null; } };
  cleanup = stopKd;

  function render(){
    stopKd();
    if (idx >= items.length) return finish();
    const p = items[idx], done = !boss && res[idx] !== null, last = idx === items.length - 1;
    const wrap = h('div',{class:'col u-' + SK[p.skill].u});
    wrap.append(h('div',{class:'dots'}, items.map((it,k) => h('i',{class: boss ? (k < idx ? 'm' : k === idx ? 'c' : '') : (res[k] ? (res[k].got === res[k].max ? 'g' : 'b') : k === idx ? 'c' : '')}))));
    wrap.append(h('div',{class:'row sp'}, h('span',{class:'lbl'}, p.no ? `#${p.no}${p.part ? ' · Part ' + p.part : ''}` : `${idx + 1} of ${items.length}`), h('span',{class:'chip',style:'min-height:26px;font-size:12px;padding:2px 10px'}, SK[p.skill].e + ' ' + p.title)));
    if (p.ctx || p.fig) wrap.append(h('div',{class:'ctx'}, p.ctx ? h('div',{html:p.ctx}) : null, p.fig ? h('div',{html:p.fig,style:'overflow-x:auto'}) : null));
    wrap.append(h('div',{class:'pq',html:p.prompt}));
    let primary; const canCheck = () => primary && (primary.disabled = !ready());
    const ready = () => { const r = resp[idx]; if (p.type === 'mc') return r != null; if (p.type === 'rows') return r && p.rows.every((_,i) => r[i] != null); if (p.type === 'num') return r && r.every(v => v !== ''); if (p.type === 'order') return r && r.length === p.items.length; return r && r.length === p.pick; };

    if (p.type === 'mc'){
      const list = h('div',{class:'opts' + (p.layout ? ' ' + p.layout : '')});
      p.choices.forEach((c,k) => {
        const b = h('button',{class:'opt' + (resp[idx] === k ? ' sel' : ''),html:c,onclick:() => { if (done) return; resp[idx] = k; if (boss){ list.querySelectorAll('.opt').forEach((x,j) => x.classList.toggle('sel', j === k)); canCheck(); } else check(); }});
        if (done){ b.classList.remove('sel'); if (k === p.answer) b.classList.add('good'); else if (k === resp[idx]) b.classList.add('bad'); }
        list.append(b);
      });
      wrap.append(list);
    }
    if (p.type === 'rows'){
      const R = resp[idx] || (resp[idx] = []);
      p.rows.forEach((row,k) => {
        const pk = h('div',{class:'pick'}, row.opts.map((t,j) => { const b = h('button',{class:R[k] === j ? 'sel' : '',onclick:() => { if (done) return; R[k] = j; pk.querySelectorAll('button').forEach((x,y) => x.classList.toggle('sel', y === j)); canCheck(); }}, t);
          if (done){ b.classList.remove('sel'); if (j === R[k]) b.classList.add(j === row.a ? 'good' : 'bad'); else if (j === row.a) b.classList.add('good'); } return b; }));
        wrap.append(h('div',{class:'col',style:'gap:6px'}, h('b',{}, row.h), pk));
      });
    }
    if (p.type === 'multi'){
      const R = resp[idx] || (resp[idx] = []), cnt = h('div',{class:'hint'});
      const pk = h('div',{class:'pick g2'});
      const paint = () => { pk.querySelectorAll('button').forEach((b,j) => { b.classList.toggle('sel', !done && R.includes(j)); b.disabled = !done && !R.includes(j) && R.length >= p.pick; }); cnt.textContent = `${R.length} of ${p.pick} picked`; };
      p.choices.forEach((c,j) => { const b = h('button',{onclick:() => { if (done) return; const at = R.indexOf(j); if (at >= 0) R.splice(at,1); else if (R.length < p.pick) R.push(j); paint(); canCheck(); }}, c);
        if (done && R.includes(j)) b.classList.add(p.correct.includes(j) ? 'good' : 'bad'); pk.append(b); });
      wrap.append(pk); if (!done){ wrap.append(cnt); paint(); }
    }
    if (p.type === 'order'){
      const R = resp[idx] || (resp[idx] = []), ord = h('div',{class:'ord'}), pk = h('div',{class:'pick'});
      const paint = () => {
        ord.replaceChildren(...p.items.map((_,k) => { const v = R[k]; const s = h('button',{class:'slot' + (v != null ? ' full' : '') + (done && v != null ? (v === k ? ' good' : ' bad') : ''),style:'background:none;text-align:left;width:100%',onclick:() => { if (done || v == null) return; R.splice(k,1); paint(); canCheck(); }}, h('i',{}, k + 1), v != null ? p.items[v] : h('span',{class:'mut',style:'font-weight:400'},'tap a step below')); return s; }));
        pk.replaceChildren(...orderView(p).filter(i => !R.includes(i)).map(i => h('button',{onclick:() => { if (done) return; R.push(i); paint(); canCheck(); }}, p.items[i])));
      };
      paint(); wrap.append(ord); if (!done) wrap.append(pk);
    }
    if (p.type === 'num'){
      const R = resp[idx] || (resp[idx] = p.blanks.map(() => ''));
      let act = Math.max(0, R.findIndex(v => !v));
      const bl = p.blanks.map((b,k) => h('button',{class:'blank',onclick:() => { if (!done){ act = k; paint(); } }}));
      const paint = () => bl.forEach((b,k) => { b.textContent = showVal(R[k]); b.classList.toggle('on', !done && k === act); if (done) b.classList.add(isRight(R[k], p.blanks[k]) ? 'good' : 'bad'); });
      wrap.append(h('div',{class:p.blanks.length === 3 ? 'flds3' : 'col',style:'gap:6px'}, p.blanks.map((b,k) => h('div',{class:'fld'}, h('span',{}, b.label), bl[k]))));
      paint();
      if (!done){
        const key = c => { let s = R[act]; if (c === '⌫') s = s === 'none' ? '' : s.slice(0,-1); else if (c === 'none') s = 'none'; else { if (s === 'none') s = ''; if (s.length < 6) s += c; } R[act] = s; if (c !== '⌫' && c !== '.' && R[act] && act < R.length - 1 && c === 'none'){ act++; } paint(); canCheck(); };
        const pad = h('div',{class:'pad4'});
        ['1','2','3','⌫','4','5','6','.','7','8','9','0'].forEach(c => pad.append(h('button',{onclick:() => key(c),'aria-label':c === '⌫' ? 'Backspace' : c}, c)));
        if (p.blanks.some(b => b.none)) pad.append(h('button',{class:'wide',onclick:() => key('none')},'No mode'), h('button',{class:'wide',onclick:() => { act = (act + 1) % R.length; paint(); }},'Next box →'));
        else pad.append(h('button',{class:'wide',style:'grid-column:span 4',onclick:() => { act = (act + 1) % R.length; paint(); }},'Next box →'));
        wrap.append(pad);
        kd = e => { if (e.metaKey || e.ctrlKey || e.altKey) return; if (/^[0-9.]$/.test(e.key)) key(e.key); else if (e.key === 'Backspace') key('⌫'); else if (e.key === 'Tab'){ e.preventDefault(); act = (act + 1) % R.length; paint(); } else if (e.key === 'Enter'){ e.preventDefault(); if (!primary.disabled) primary.click(); } };
        document.addEventListener('keydown', kd);
      }
    }

    if (done){
      const r = res[idx], ok = r.got === r.max;
      const fb = h('div',{class:'fb ' + (ok ? 'good' : 'bad')}, ok ? pick(['Nice!','Got it!','Correct!','Yes!']) + ` +${r.got * 10} XP` : [(r.max > 1 ? `${r.got} of ${r.max} right. ` : 'Not quite. '), 'Answer: ', h('span',{html:answerText(p)})]);
      wrap.append(fb, h('div',{class:'hint',style:'font-size:14px;color:var(--ink)',html:'💡 ' + p.why}));
      setTimeout(() => fb.scrollIntoView({block:'nearest',behavior:'smooth'}), 30);
    }
    primary = h('button',{class:'btn' + (done || boss ? '' : ' hlb'),onclick:() => { if (done || boss){ idx++; render(); window.scrollTo(0,0); } else check(); }}, done || boss ? (last ? 'Finish' : 'Next') : 'Check');
    if (!done) canCheck();
    if (!(p.type === 'mc' && !boss && !done)) wrap.append(primary);
    box.replaceChildren(wrap);
  }

  function check(){
    const p = items[idx]; res[idx] = grade(p, resp[idx]);
    const ok = res[idx].got === res[idx].max; xp(res[idx].got * 10); bump(p.skill, ok ? 6 : -2); render();
  }

  function finish(){
    stopKd();
    items.forEach((p,k) => { if (!res[k]) res[k] = grade(p, resp[k]); });
    const got = res.reduce((s,r) => s + r.got, 0), pct = Math.round(100 * got / total);
    if (boss){ items.forEach((p,k) => bump(p.skill, res[k].got === res[k].max ? 8 : -3)); xp(got * 8); S.bossRuns++; if (pct > S.best) S.best = pct; save(); }
    if (o.onDone) o.onDone(got, total);
    const verdict = boss ? (pct >= 90 ? 'Beast defeated! 🎉' : pct >= 70 ? 'The Beaker Beast is hurt. Fix the misses.' : 'The Beast wins this round. Review and retry.') : (pct === 100 ? 'Perfect! 🎉' : pct >= 70 ? 'Solid work' : 'Keep going');
    const card = h('div',{class:'card pad col'}, h('div',{class:'score'}, `${got}/${total}`), h('div',{class:'big-out',style:'color:var(--ink)'}, verdict));
    if (boss) card.append(h('div',{class:'hpbar','aria-label':'Boss health'}, h('i',{style:`width:${100 - pct}%`})));
    const list = h('div',{class:'col'}, h('div',{class:'lbl'},'Review'));
    items.forEach((p,k) => {
      const r = res[k], ok = r.got === r.max;
      list.append(h('details',{class:'card pad',style:'padding:6px 12px'},
        h('summary',{style:'font-weight:700;min-height:40px;display:flex;align-items:center;gap:8px;cursor:pointer'}, h('span',{style:`color:var(--${ok ? 'ok' : 'no'})`}, ok ? '✓' : '✗'), p.no ? `#${p.no} · ${p.title}` : `${k + 1}. ${p.title}`, h('span',{class:'mut',style:'margin-left:auto'}, `${r.got}/${r.max}`)),
        h('div',{class:'col',style:'margin-top:6px;gap:6px'}, p.ctx ? h('div',{class:'hint',html:p.ctx}) : null, h('div',{html:p.prompt,style:'font-weight:700'}), h('div',{class:'hint'}, 'Your answer: ', h('span',{html:userText(p, resp[k])})), h('div',{class:'hint'}, 'Answer: ', h('span',{html:answerText(p)})), h('div',{class:'hint',style:'color:var(--ink)',html:'💡 ' + p.why}))));
    });
    box.replaceChildren(card, ...(o.actions ? o.actions() : []), list);
    window.scrollTo(0,0);
  }
  render();
}
