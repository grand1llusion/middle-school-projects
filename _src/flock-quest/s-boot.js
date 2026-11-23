/* ---------- BOOT ---------- */
MODES.c = {units:UNITS_C, skills:SKILLS_C, guide:GUIDE_C, parts:PARTS_C, lab:LAB_C, cards:CARDS_C, games:GAMES_C, short:SHORT_C, steps:STEPS_C, ready:READY_C, boss:buildBossC};
MODES.m = {units:UNITS_M, skills:SKILLS_M, guide:GUIDE_M, parts:PARTS_M, lab:LAB_M, cards:CARDS_M, games:GAMES_M, short:SHORT_M, steps:STEPS_M, ready:READY_M, boss:buildBossM};
MODES.d = {units:UNITS_D, skills:SKILLS_D, guide:GUIDE_D, parts:PARTS_D, lab:LAB_D, cards:CARDS_D, games:GAMES_D, short:SHORT_D, steps:STEPS_D, ready:READY_D, boss:buildBossD};
initFlock(); dailyCheck();
buildNav(); buildModebar(); $('#subj').addEventListener('click', subjectSheet); setMode(S.mode); applySubject(); drawRing(); go(VIEWS[S.tab] ? S.tab : 'learn');
setTimeout(() => { if (imported && S.fl && S.fl.sheep.length > 1) toast('Welcome! Your Plus & Minus progress came along'); drainNames(); }, 400);
