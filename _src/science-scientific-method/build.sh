#!/bin/bash
# Builds the lab from its parts.
#   build/index.html  artifact-format page (publish this as the Claude artifact and pass it to _tools/publish_lab.py)
#   build/_test.html  same page plus test hooks (window.__T, __last, __q) for tests/click-through.js
#   build/_page.html  full HTML document for local phone-size screenshots
set -e
cd "$(dirname "$0")"; mkdir -p build
PARTS="s-core.js s-data.js s-gen.js s-engine.js s-learn.js s-games.js s-views.js"
EXPORTS="GENS,GUIDE,PARTS,SHORT,buildBoss,runSet,S,SKILLS,partMax,grade,isRight,answerText,N,GAMES,CARDS,VIEWS,go,mast,lvl,mmmSet,gConc,gIV,OI,WORDS,STEPS,IFS"
{ cat s-head.html; echo "<script>"; echo "(()=>{'use strict';"; for f in $PARTS; do cat "$f"; echo; done; echo "})();"; echo "</script>"; } > build/index.html
EXPORTS="$EXPORTS" python3 - <<'PY'
import os, re
s = open('build/index.html').read()
open('build/_check.js', 'w').write(re.search(r'<script>(.*)</script>', s, re.S).group(1))
t = s.replace('function runSet(box, items, o){', 'function runSet(box, items, o){ window.__last = items;', 1).replace('const q = G.gen(); st.n++;', 'const q = G.gen(); window.__q = q; st.n++;', 1)
i = t.rindex('})();')
open('build/_test.html', 'w').write(t[:i] + 'window.__T={' + os.environ['EXPORTS'] + '};\n' + t[i:])
open('build/_page.html', 'w').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + s + '</body></html>')
PY
node --check build/_check.js && rm build/_check.js && echo "syntax ok · $(wc -c < build/index.html) bytes"
