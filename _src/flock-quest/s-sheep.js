/* ---------- SHEEP ART, WEARABLES, RESCUE SCENES (no pink anywhere) ---------- */
const WOOL = {cream:'#F6F1E3', lav:'#E3DAF5', mint:'#DDEFD5', butter:'#F5ECBE', sky:'#DAEBF5', silver:'#E4E4E8', sage:'#BBD9A5', violet:'#A692DA', midnight:'#6A56A6', gold:'#F2D77A', glow:'#CBF26E'};
const FACEC = {char:'#3F3A4D', brown:'#6A5445', tan:'#B99A76', plum:'#4B3A6E'};
const WOOLS = ['cream','lav','mint','butter','sky','silver','sage','violet'], FACES = ['char','brown','tan','plum'];
const TRAITS = [['Brave','hop'],['Sleepy','nap'],['Bouncy','hop'],['Curious','wander'],['Hungry','graze'],['Shy','nap'],['Silly','roll'],['Snuggly','nap'],['Chatty','bleat'],['Thirsty','drink']];
const NAMES = ['Clover','Fern','Willow','Juniper','Lavender','Sage','Basil','Thistle','Poppy','Maple','Olive','Pebble','Meadow','Hazel','Bluebell','Mint','Tansy','Wren','Daisy','Ivy','Burdock','Nettle','Marigold','Rosemary','Bramble','Moss','Pip','Dandelion','Cedar','Heather'];
const WEAR = [['none','Nothing',0],['leaf','Leaf crown',50],['flower','Flower crown',150],['bandana','Purple bandana',250],['shades','Sunglasses',350],['party','Party hat',450],['scarf','Green scarf',600],['cape','Hero cape',800],['wizard','Wizard hat',1000]];
const DECOR = [[100,'🌼','Daisy patch'],[200,'🪵','Log bench'],[300,'🌻','Sunflowers'],[400,'🍀','Lucky clover'],[500,'🌳','Shady oak'],[650,'🐝','Beehive'],[800,'🦋','Butterflies'],[1000,'🌈','Rainbow'],[1250,'⛺','Shepherd tent'],[1500,'🪁','Kite']];

function accSVG(a, where){
  if (where === 'back') return a === 'cape' ? '<path d="M52 34L8 44l8 30 36-12z" fill="#7656B0"/><path d="M8 44l8 30 8-4-6-24z" fill="#5B3FA0"/>' : '';
  if (where === 'head'){
    if (a === 'leaf') return '<g fill="#5AA05A"><ellipse cx="56" cy="27" rx="6" ry="3" transform="rotate(-30 56 27)"/><ellipse cx="66" cy="23" rx="6" ry="3"/><ellipse cx="76" cy="27" rx="6" ry="3" transform="rotate(30 76 27)"/></g>';
    if (a === 'flower') return '<g><circle cx="56" cy="27" r="4" fill="#fff"/><circle cx="66" cy="23" r="4.5" fill="#E8D26A"/><circle cx="76" cy="27" r="4" fill="#C9BCE6"/><circle cx="66" cy="23" r="1.6" fill="#B07A2A"/></g>';
    if (a === 'shades') return '<rect x="66" y="32" width="16" height="7" rx="3" fill="#1E1B2B"/><path d="M66 35h-5" stroke="#1E1B2B" stroke-width="2"/>';
    if (a === 'party') return '<path d="M58 28L66 2l9 26z" fill="#7656B0"/><circle cx="64" cy="18" r="2" fill="#9ED66A"/><circle cx="69" cy="11" r="2" fill="#E8D26A"/><circle cx="66" cy="26" r="2" fill="#9ED66A"/><circle cx="66" cy="2" r="3" fill="#E8D26A"/>';
    if (a === 'wizard') return '<path d="M54 28L64 -4l14 32z" fill="#5B3FA0"/><ellipse cx="66" cy="28" rx="16" ry="4.5" fill="#5B3FA0"/><path d="M64 10l1.6 3.4 3.6.4-2.7 2.5.7 3.6-3.2-1.8-3.2 1.8.7-3.6-2.7-2.5 3.6-.4z" fill="#CBF26E"/>';
  }
  if (where === 'neck'){
    if (a === 'bandana') return '<path d="M50 49l20 0-10 15z" fill="#7656B0"/><circle cx="57" cy="52" r="1.2" fill="#E6DFF5"/><circle cx="63" cy="52" r="1.2" fill="#E6DFF5"/>';
    if (a === 'scarf') return '<rect x="49" y="47" width="22" height="6" rx="3" fill="#5AA05A"/><rect x="52" y="50" width="6" height="14" rx="3" fill="#4B8A3C"/>';
  }
  return '';
}
/* the sheep, facing right. The head group (.hd) nods and tilts; .eyes / .shut swap when napping */
function sheepG(s){
  const w = WOOL[s.wool] || WOOL.cream, f = FACEC[s.face] || FACEC.char, st = 'rgba(40,40,60,.16)', a = s.acc && s.acc !== 'none' ? s.acc : null;
  const puffs = [[22,46,10],[28,33,11],[42,28,12],[56,32,11],[66,44,10],[30,58,10],[44,62,11],[58,58,10],[44,46,16]].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${w}" stroke="${st}" stroke-width="1"/>`).join('');
  return `${a ? accSVG(a,'back') : ''}<ellipse cx="48" cy="77" rx="30" ry="4" fill="rgba(40,60,40,.22)"/>
<g fill="${f}"><rect x="26" y="60" width="6" height="16" rx="3"/><rect x="38" y="62" width="6" height="14" rx="3"/><rect x="54" y="62" width="6" height="14" rx="3"/><rect x="64" y="60" width="6" height="16" rx="3"/></g>
<circle cx="13" cy="46" r="6" fill="${w}" stroke="${st}" stroke-width="1"/>${puffs}
${a ? accSVG(a,'neck') : ''}
<g class="hd"><ellipse cx="57" cy="34" rx="4" ry="7" transform="rotate(-35 57 34)" fill="${f}"/><ellipse cx="68" cy="40" rx="13" ry="12" fill="${f}"/><circle cx="64" cy="29" r="8" fill="${w}" stroke="${st}" stroke-width="1"/>
<g class="eyes"><circle cx="72" cy="38" r="3.2" fill="#fff"/><circle cx="73" cy="38.5" r="1.7" fill="#1B1430"/></g><path class="shut" d="M69 38q3 3 6 0" fill="none" stroke="#1B1430" stroke-width="1.6" stroke-linecap="round"/>
<ellipse cx="78" cy="45" rx="3" ry="2.2" fill="rgba(255,255,255,.18)"/><path d="M74 47q3 2 6 0" fill="none" stroke="#1B1430" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>${a ? accSVG(a,'head') : ''}</g>`;
}
const sheepSVG = s => `<svg viewBox="0 0 100 82" role="img" aria-label="${s.name || 'A sheep'}">${sheepG(s)}</svg>`;

/* rescue scenes: seven ways a sheep gets stuck. Obstacle, sheep and a sneaky goat in the corner. */
const GOATPEEK = '<g transform="translate(246 70)" opacity=".9"><path d="M2 40C-2 24 6 10 10 4c2 8 6 12 12 14l4 22z" fill="#3B2A6B"/><path d="M26 40l6-22c6-2 10-6 12-14 4 6 12 20 8 36z" fill="#3B2A6B"/><circle cx="16" cy="30" r="2" fill="#C9F26B"/><circle cx="36" cy="30" r="2" fill="#C9F26B"/></g>';
const SCN = [
  {id:'bramble', t:'Tangled in the brambles', v:'cut a path through the brambles', draw:s => `<g transform="translate(110 60) scale(.9)">${sheepG(s)}</g><g fill="#3C7A3A" stroke="#2A5A2A" stroke-width="2"><circle cx="100" cy="120" r="22"/><circle cx="130" cy="130" r="26"/><circle cx="170" cy="124" r="22"/><circle cx="115" cy="146" r="20"/><circle cx="160" cy="146" r="22"/></g><path d="M96 104l-6-10M140 108l4-12M172 106l8-8M126 116l-8-8" stroke="#2A5A2A" stroke-width="3"/>`},
  {id:'ledge', t:'Stuck on a high ledge', v:'build a ladder up the rocks', draw:s => `<path d="M90 160V96h90v64z" fill="#8F8A9C"/><path d="M90 96h90l-8-10H98z" fill="#A9A4B6"/><g transform="translate(106 36) scale(.85)">${sheepG(s)}</g><path d="M200 160V120M216 160V120M200 132h16M200 148h16" stroke="#8B6B3E" stroke-width="3" stroke-dasharray="4 4"/>`},
  {id:'fog', t:'Lost in the fog', v:'light a lantern to find the way', draw:s => `<g transform="translate(116 66) scale(.85)">${sheepG(s)}</g><g fill="#fff" opacity=".82"><ellipse cx="120" cy="120" rx="70" ry="26"/><ellipse cx="190" cy="110" rx="60" ry="24"/><ellipse cx="90" cy="96" rx="50" ry="20"/></g><circle cx="230" cy="120" r="8" fill="#F2D77A"/><path d="M226 128h8v10h-8z" fill="#6B5848"/>`},
  {id:'mud', t:'Stuck in the mud', v:'lay stepping stones across the mud', draw:s => `<ellipse cx="150" cy="140" rx="86" ry="20" fill="#7A5E43"/><g transform="translate(112 76) scale(.85)">${sheepG(s)}</g><ellipse cx="150" cy="140" rx="60" ry="10" fill="#8D7050"/><g fill="#A9A4B6"><ellipse cx="232" cy="150" rx="12" ry="5"/><ellipse cx="256" cy="148" rx="10" ry="4"/></g>`},
  {id:'river', t:'Stranded across the river', v:'fix the bridge planks', draw:s => `<rect x="0" y="116" width="300" height="38" fill="#5FA3CC"/><path d="M0 128q20-8 40 0t40 0 40 0 40 0 40 0 40 0 40 0" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/><g transform="translate(200 50) scale(.8)">${sheepG(s)}</g><rect x="60" y="110" width="40" height="8" fill="#8B6B3E"/><rect x="170" y="110" width="40" height="8" fill="#8B6B3E"/><path d="M104 112h8M122 114h8M140 112h8" stroke="#8B6B3E" stroke-width="3" stroke-dasharray="3 5"/>`},
  {id:'gate', t:'Locked in the pen', v:'crack the gate code', draw:s => `<g transform="translate(108 62) scale(.85)">${sheepG(s)}</g><g stroke="#8B6B3E" stroke-width="6" stroke-linecap="round"><path d="M70 150V86M110 150V86M150 150V86M190 150V86M230 150V86M60 100h180M60 130h180"/></g><rect x="136" y="104" width="28" height="22" rx="4" fill="#E6C24A" stroke="#7A5E1A" stroke-width="2"/><path d="M142 104v-8a8 8 0 0 1 16 0v8" fill="none" stroke="#7A5E1A" stroke-width="3"/>`},
  {id:'cave', t:'Trapped in the cave', v:'roll the boulder away', draw:s => `<path d="M60 160V84q90-70 180 0v76z" fill="#4A4660"/><path d="M96 160V104q54-50 108 0v56z" fill="#23202F"/><g transform="translate(122 76) scale(.7)">${sheepG(s)}</g><circle cx="220" cy="134" r="22" fill="#8F8A9C" stroke="#6C6780" stroke-width="2"/><circle cx="228" cy="128" r="3" fill="#C9F26B"/>`}
];
function sceneSVG(s, k){
  return `<svg class="fx" viewBox="0 0 300 170" role="img" aria-label="${SCN[k].t}"><defs><linearGradient id="scg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sky1)"/><stop offset="1" style="stop-color:var(--sky2)"/></linearGradient></defs>
<rect width="300" height="170" fill="url(#scg)"/><path d="M0 120q60-40 120-10t180-14v74H0z" fill="var(--hlA)"/><rect y="146" width="300" height="24" fill="var(--gr1)"/>${GOATPEEK}${SCN[k].draw(s)}</svg>`;
}
