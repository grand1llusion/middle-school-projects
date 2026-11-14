#!/bin/bash
# Builds the Kitty Math page. app.html is already in artifact format (title, style, markup, script).
#   build/index.html  the page itself (artifact + publish_lab.py input)
#   build/_page.html  with a doctype and viewport, for phone screenshots
#   build/_test.html  with window.__TEST__ so tests can read state
set -e
cd "$(dirname "$0")"
mkdir -p build

# Inline cloud config: replace __CONFIG_PLACEHOLDER__ with the JSON from config.json (if set)
python3 - <<'PY'
import json, re
src = open('app.html').read()
cfg = json.load(open('config.json'))
# Only inline if apiUrl is non-empty; otherwise leave as empty object so CLOUD is inert
if cfg.get('apiUrl'):
    replacement = json.dumps(cfg)
else:
    replacement = '{}'
out = src.replace('__CONFIG_PLACEHOLDER__', replacement)
open('build/index.html', 'w').write(out)
print('config inlined' if cfg.get('apiUrl') else 'config empty (CLOUD inert)')
PY

{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>'; cat build/index.html; echo '</body></html>'; } > build/_page.html
{ echo '<script>window.__TEST__=true</script>'; cat build/index.html; } > build/_test.html
python3 - <<'PY'
import re, subprocess, tempfile
src = open('build/index.html').read()
js = re.search(r'<script>([\s\S]*)</script>', src).group(1)
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f: f.write(js)
subprocess.run(['node', '--check', f.name], check=True)
print('syntax ok ·', len(src.encode()), 'bytes')
PY
