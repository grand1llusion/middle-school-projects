/* ---------- QUESTIONS ---------- */
const MC = (o) => Object.assign({type:'mc'}, o);
const shufMC = (o, correct, wrongs) => { const all = shuffle([correct, ...wrongs]); return MC(Object.assign(o, {choices:all, answer:all.indexOf(correct)})); };
const OIC = ['👀 Observation','💡 Inference'];
const numsHTML = arr => `<div class="num-t">${arr.map(n => `<span>${n}</span>`).join('')}</div>`;

function gWord(){
  const w = pick(WORDS), others = shuffle(WORDS.filter(x => x !== w)).slice(0,3);
  if (Math.random() < .55) return shufMC({skill:1, title:'Science words', prompt:`Which word means: <span class="hl">${w[1]}</span>`, layout:'g2', why:`${w[3]} <b>${w[0]}</b>: ${w[1]} Example: ${w[2]}`}, w[0], others.map(x => x[0]));
  return shufMC({skill:1, title:'Science words', prompt:`What does <span class="hl">${w[0]}</span> mean?`, why:`${w[3]} <b>${w[0]}</b>. Example: ${w[2]}`}, w[1], others.map(x => x[1]));
}
function gOI(){
  const s = pick(OI);
  return MC({skill:2, title:'Observe or infer?', prompt:`“${s[0]}”`, choices:OIC, answer:s[1] === 'O' ? 0 : 1, layout:'big', why:`${s[1] === 'O' ? 'Observation' : 'Inference'}. ${s[2]}`});
}
function gTest(){
  const p = pick(TESTQ);
  return shufMC({skill:3, title:'Testable question', prompt:'Which question is <span class="hl">testable</span>?', why:`You can test it and measure ${p[2]}. “${p[1]}” is an opinion.`}, p[0], [p[1]]);
}
function gFair(){
  const f = pick(FAIR);
  if (Math.random() < .5){
    const ch = shuffle([...shuffle(f.same).slice(0,3), ...shuffle(f.bad).slice(0,2)]);
    return {type:'multi', skill:4, title:'Fair test', ctx:`${f.q} They change only the <b>${f.iv}</b>.`, prompt:'Pick <span class="hl">TWO</span> things to keep the same.', choices:ch, correct:ch.map((c,i) => f.same.includes(c) ? i : -1).filter(i => i >= 0), pick:2, why:`Keep everything the same except the ${f.iv}. Then you know the ${f.iv} caused the result.`};
  }
  const b = pick(f.bad);
  return shufMC({skill:4, title:'Fair test', ctx:`${f.q} They change only the <b>${f.iv}</b>.`, prompt:'Which choice would make the test <span class="hl">UNFAIR</span>?', why:`“${b}” changes a second thing. A fair test changes only one thing.`}, b, shuffle(f.same).slice(0,3));
}
function gSteps(){
  const r = Math.random();
  if (r < .4) return {type:'order', skill:5, title:'Science steps', prompt:'Put the steps in order. Tap them 1 to 6.', items:STEPS.map(s => s[0]), why:'Question → Hypothesis → Procedure → Experiment → Analyze → Conclusion.'};
  if (r < .7){ const i = rnd(0,4); return shufMC({skill:5, title:'Science steps', prompt:`What comes right after <span class="hl">${STEPS[i][0]}</span>?`, why:`Order: ${STEPS.map(s => s[0]).join(' → ')}.`}, STEPS[i+1][0], shuffle(STEPS.filter((s,k) => k !== i + 1 && k !== i).map(s => s[0])).slice(0,3)); }
  const i = rnd(0,5);
  return shufMC({skill:5, title:'Science steps', prompt:`Which step is this? <span class="hl">${STEPS[i][1]}</span>`, why:`${STEPS[i][0]}: ${STEPS[i][1]}`}, STEPS[i][0], shuffle(STEPS.filter((s,k) => k !== i).map(s => s[0])).slice(0,3));
}
function ivRows(f){
  const opts = shuffle([f[2], f[3], f[4]]);
  return [{h:'IV (cause)', opts, a:opts.indexOf(f[2])}, {h:'DV (effect)', opts, a:opts.indexOf(f[3])}];
}
function gIV(f){
  f = f || pick(IFS);
  return {type:'rows', skill:6, title:'IV and DV', ctx:`<b>If</b> ${f[0]}, <b>then</b> ${f[1]}.`, prompt:'Find the IV and the DV.', rows:ivRows(f), why:`IV = what is changed: <b>${f[2]}</b>. DV = what is measured: <b>${f[3]}</b>.`};
}
function gGraph(){
  if (Math.random() < .35){
    const ch = shuffle([...GRAPH_GOOD, ...shuffle(GRAPH_BAD).slice(0,2)]);
    return {type:'multi', skill:7, title:'Good graphs', prompt:'Pick <span class="hl">THREE</span> things a good science graph needs.', choices:ch, correct:ch.map((c,i) => GRAPH_GOOD.includes(c) ? i : -1).filter(i => i >= 0), pick:3, why:'A good graph has a title, labels on both axes, and an even scale.'};
  }
  const kind = pick(['up','up','down','same']), T = pick([['Seedling height','Week','Height (cm)'],['Ice cube size','Minute','Size (cm)'],['Puppy weight','Month','Weight (kg)']]);
  let ys = []; let y = kind === 'down' ? rnd(14,18) : kind === 'same' ? rnd(5,9) : rnd(2,4);
  for (let i = 0; i < 4; i++){ ys.push(y); y += kind === 'up' ? rnd(2,4) : kind === 'down' ? -rnd(2,4) : 0; }
  const right = {up:'It increases each time.', down:'It decreases each time.', same:'It stays the same.'}[kind];
  const ymax = Math.ceil((Math.max(...ys) + 2) / 5) * 5;
  return shufMC({skill:7, title:'Read the pattern', ctx:`${T[0]} over 4 ${T[1].toLowerCase()}s:`, fig:tbl([[T[1],1,2,3,4],[T[2],...ys]]) + `<div style="max-width:260px;margin:6px auto 0">${lineGraph({xs:[1,2,3,4], ys, ymax, ystep:5, xlab:T[1], ylab:T[2]})}</div>`, prompt:'What pattern do the data show?', why:`${ys.join(' → ')}. ${right}`}, right, Object.values({up:'It increases each time.', down:'It decreases each time.', same:'It stays the same.'}).filter(x => x !== right).concat(['It goes up, then down.']));
}
function mmmSet(){
  for (let t = 0; t < 500; t++){
    const noMode = Math.random() < .3; let a = [];
    if (noMode){ const s = new Set(); while (s.size < 5) s.add(rnd(1,14)); a = [...s]; }
    else { const m = rnd(1,12); a = [m, m]; while (a.length < 5){ const v = rnd(1,14); if (v !== m && !a.includes(v)) a.push(v); } }
    const sum = a.reduce((x,y) => x + y, 0); if (sum % 5) continue;
    const srt = a.slice().sort((x,y) => x - y), cnt = {}; a.forEach(v => cnt[v] = (cnt[v] || 0) + 1);
    const top = Math.max(...Object.values(cnt)), modes = Object.keys(cnt).filter(k => cnt[k] === top).map(Number);
    return {a, srt, mean:sum / 5, sum, median:srt[2], mode: top === 1 ? null : modes[0]};
  }
}
const mmmWhy = m => [`Mean: ${m.a.join(' + ')} = ${m.sum}. ${m.sum} ÷ 5 = ${m.mean}.`, `Median: in order ${m.srt.join(', ')}. The middle is ${m.median}.`, m.mode == null ? 'Mode: no number repeats, so there is no mode.' : `Mode: ${m.mode} shows up most often.`];
function gMMM(set){
  const m = set || mmmSet(), shown = Math.random() < .5 ? m.a : m.srt;
  return {type:'num', skill:8, title:'Mean, median, mode', ctx:'Numbers:', fig:numsHTML(shown), prompt:'Find the mean, median, and mode.', blanks:[{label:'Mean', answer:m.mean},{label:'Median', answer:m.median},{label:'Mode', answer:m.mode, none:true}], why:mmmWhy(m).join('<br>')};
}
function gModel(){
  if (Math.random() < .3) return MC({skill:9, title:'Honest results', prompt:'An experiment’s results do <span class="hl">NOT</span> support the hypothesis. What should the scientist do?', choices:['Change the results','Ignore the investigation','Report the evidence honestly and explain it','Repeat until it agrees'], answer:2, why:'Scientists report what really happened, even when the hypothesis was wrong.'});
  const s = pick(SEP);
  return MC({skill:9, title:'Science practices', ctx:s[0], prompt:'Which practice is being used?', choices:PRACTICES, answer:s[1], why:`${PRACTICES[s[1]]}.` + (s[1] === 1 ? ' A model represents something real.' : '')});
}
function conclusionScenario(){
  const T = pick([
    () => { const a = rnd(9,15), b = a - rnd(2,5); return {pred:'Students predicted that plants with 6 hours of light would grow taller than plants with 3 hours.', A:`6-hour plants averaged ${a} cm`, B:`3-hour plants averaged ${b} cm`, sup:true, ev:`Plants with 6 hours of light averaged ${a} cm, compared with ${b} cm for plants with 3 hours, a ${a - b} cm difference.`}; },
    () => { const hot = rnd(20,40), cold = hot + rnd(20,50), flip = Math.random() < .4; return flip
      ? {pred:'Students predicted that sugar would dissolve faster in cold water than in hot water.', A:`Hot water: ${hot} seconds`, B:`Cold water: ${cold} seconds`, sup:false, ev:`Sugar dissolved in ${hot} seconds in hot water but took ${cold} seconds in cold water, ${cold - hot} seconds slower.`}
      : {pred:'Students predicted that sugar would dissolve faster in hot water than in cold water.', A:`Hot water: ${hot} seconds`, B:`Cold water: ${cold} seconds`, sup:true, ev:`Sugar dissolved in ${hot} seconds in hot water and ${cold} seconds in cold water, ${cold - hot} seconds faster.`}; },
    () => { const lo = rnd(60,90), hi = lo + rnd(20,60); return {pred:'Students predicted that a higher ramp would make a toy car roll farther.', A:`High ramp: ${hi} cm`, B:`Low ramp: ${lo} cm`, sup:true, ev:`The car rolled ${hi} cm from the high ramp and ${lo} cm from the low ramp, ${hi - lo} cm farther.`}; },
    () => { const more = rnd(10,14), less = more + rnd(2,4); return {pred:'Students predicted that more fertilizer would make flowers grow taller.', A:`More fertilizer: ${more} cm`, B:`Less fertilizer: ${less} cm`, sup:false, ev:`Flowers with more fertilizer averaged ${more} cm, but flowers with less fertilizer averaged ${less} cm, ${less - more} cm taller.`}; }
  ]);
  return T();
}
function gConc(sc){
  const c = sc || conclusionScenario(), say = s => `The results ${s ? 'support' : 'do not support'} the hypothesis.`;
  return shufMC({skill:9, title:'Strong conclusion', ctx:`${c.pred}<br><b>${c.A}</b> · <b>${c.B}</b>`, prompt:'Which is the <span class="hl">strongest</span> conclusion?', why:'A strong conclusion says if the evidence supports the hypothesis and uses the numbers.'},
    `${say(c.sup)} ${c.ev}`, [`${say(!c.sup)} ${c.ev}`, 'My hypothesis was right.', 'I liked doing this experiment.']);
}
const GENS = [null, gWord, gOI, gTest, gFair, gSteps, gIV, gGraph, gMMM, gModel];
const buildBoss = () => [gWord(), gWord(), gWord(), gOI(), gOI(), gTest(), gFair(), Object.assign(gSteps(), {}), gIV(), gIV(), gGraph(), gGraph(), gMMM(), gModel(), gConc()];

/* ---------- THE STUDY GUIDE, question by question ---------- */
const wb = (no, def, ans) => MC({no, part:'A', skill:1, title:'Vocabulary', prompt:def, choices:BANK, answer:BANK.indexOf(ans), layout:'g2', why:`<b>${ans[0].toUpperCase() + ans.slice(1)}</b>.`});
const oi = (no, s, a, why) => MC({no, part:'B', skill:2, title:'Observation or inference?', prompt:`“${s}”`, choices:OIC, answer:a === 'O' ? 0 : 1, layout:'big', why:`${a === 'O' ? 'Observation' : 'Inference'}. ${why}`});
const GUIDE = [
  wb(1,'A testable prediction explaining what may happen in an investigation.','hypothesis'),
  wb(2,'Information using numbers or measurements.','quantitative'),
  wb(3,'Information describing a color, shape, sound, or texture.','qualitative'),
  wb(4,'A reasonable explanation based on what you observe.','inference'),
  wb(5,'A representation of something real, such as a globe.','model'),
  wb(6,'Characteristics that help identify or compare materials.','properties'),
  wb(7,'Knowledge gained from observations and experiments.','science'),
  wb(8,'An investigation in which only one variable is changed while other conditions stay the same.','controlled experiment'),
  wb(9,'The part of a lab report that explains results and whether the evidence supports the hypothesis.','conclusion'),
  oi(10,'The liquid in the beaker is blue.','O','You can see the color.'),
  oi(11,'The dog is hiding because it is scared.','I','"Because it is scared" explains why.'),
  oi(12,'The thermometer reads 18°C.','O','18°C is a measurement.'),
  oi(13,'The sidewalk is wet, so it must have rained.','I','"Must have rained" explains the wet sidewalk.'),
  MC({no:14, part:'C', skill:3, title:'Testable question', prompt:'Which question is testable, and why?', choices:['“How does fertilizer amount affect flower height?” You can change the fertilizer and measure the height.','“What is the prettiest flower?” Everyone can look at flowers.','“What is the prettiest flower?” You can measure how pretty it is.','“How does fertilizer amount affect flower height?” It is an opinion.'], answer:0, why:'Fertilizer amount and flower height can be measured, so it is testable. “Prettiest” is an opinion.'}),
  (() => { const ch = ['same soil','different amounts of water','same seed type','one group in a dark closet','same container size','same amount of light','different seed types','same temperature']; return {type:'multi', no:15, part:'C', skill:4, title:'Fair test', ctx:'Two groups grow beans using different amounts of water.', prompt:'Pick <span class="hl">TWO</span> conditions to keep the same.', choices:ch, correct:[0,2,4,5,7], pick:2, why:'Any two: same soil, seed type, container size, light, or temperature. Only the water changes.'}; })(),
  {type:'order', no:16, part:'D', skill:5, title:'Scientific process', prompt:'Number the steps from 1 to 6. Tap them in order.', items:STEPS.map(s => s[0]), why:'Ask a question → Make a hypothesis → Write a procedure → Perform experiment/collect data → Analyze data → Draw a conclusion.'},
  Object.assign(gIV(IFS[0]), {no:17, part:'E', ctx:'<b>If</b> a ramp is raised higher, <b>then</b> a toy car will travel farther.'}),
  Object.assign(gIV(IFS[1]), {no:18, part:'E', ctx:'<b>If</b> the temperature of water increases, <b>then</b> sugar will dissolve faster.'}),
  {type:'rows', no:19, part:'E', skill:6, title:'Build a hypothesis', ctx:'How does the amount of sunlight affect the growth of a seedling?', prompt:'Build an IF–THEN hypothesis.', rows:[{h:'IF…', opts:['the seedling is green','sunlight hours increase','I like plants'], a:1},{h:'THEN…', opts:['the sun will get hotter','the pot will change color','seedlings will grow taller'], a:2}], why:'If sunlight hours increase, then seedlings will grow taller. The IF part is the cause (IV). The THEN part is the effect (DV).'},
  MC({no:20, part:'F', skill:7, title:'Patterns', ctx:'A student recorded how tall a seedling was over four weeks.', fig:tbl([['Week',1,2,3,4],['Height (cm)',3,5,8,11]]), prompt:'What pattern do the data show?', choices:['The seedling gets taller each week.','The seedling gets shorter each week.','The height stays the same.','The seedling grew 11 cm every week.'], answer:0, why:'3 → 5 → 8 → 11 cm. The seedling increases in height each week.'}),
  (() => { const ch = ['Title','Rainbow colors','Labeled x-axis','A drawing of the plant','Labeled y-axis','Even scale']; return {type:'multi', no:21, part:'F', skill:7, title:'Good graphs', prompt:'Pick <span class="hl">THREE</span> things a well-made graph should include.', choices:ch, correct:[0,2,4,5], pick:3, why:'Title, labeled x-axis, labeled y-axis. An even scale also counts.'}; })(),
  Object.assign(gMMM({a:[2,4,4,6,9], srt:[2,4,4,6,9], sum:25, mean:5, median:4, mode:4}), {no:22, part:'F', fig:numsHTML([2,4,4,6,9])}),
  Object.assign(gMMM({a:[3,5,7,9,11], srt:[3,5,7,9,11], sum:35, mean:7, median:7, mode:null}), {no:23, part:'F', fig:numsHTML([3,5,7,9,11])}),
  MC({no:24, part:'G', skill:9, title:'Science practices', ctx:'A class builds a small working representation of a volcano.', prompt:'Which practice is being used?', choices:['A. Asking questions','B. Developing and using models','C. Using mathematics','D. Communicating information'], answer:1, why:'B. A small volcano represents a real one, so it is a model.'}),
  MC({no:25, part:'G', skill:9, title:'Honest results', prompt:'An experiment produces results that do NOT support the hypothesis. What should the scientist do?', choices:['A. Change the results','B. Ignore the investigation','C. Report the evidence honestly and explain it','D. Repeat until it agrees'], answer:2, why:'C. Report the evidence honestly and explain it.'}),
  MC({no:26, part:'G', skill:9, title:'Strong conclusion', ctx:'Students predicted that 6 hours of light would produce taller plants than 3 hours. <b>6-hour plants averaged 12 cm</b> · <b>3-hour plants averaged 8 cm</b>', prompt:'Which is the strongest conclusion?', choices:['The results support the hypothesis that more light increases plant growth. Plants with 6 hours of light averaged 12 cm, compared with 8 cm for plants with 3 hours, a 4 cm difference.','My hypothesis was right because the plants grew.','The results do not support the hypothesis. The 6-hour plants averaged 12 cm and the 3-hour plants averaged 8 cm.','I liked growing the plants. It was fun.'], answer:0, why:'It says the results support the hypothesis and uses the numbers: 12 cm vs 8 cm, a 4 cm difference.'})
];
const PARTS = [['A','Vocabulary',1,9],['B','Observe or infer',10,13],['C','Testable & fair',14,15],['D','Science steps',16,16],['E','Hypotheses & variables',17,19],['F','Graphs & math',20,23],['G','Practices & conclusions',24,26]];
