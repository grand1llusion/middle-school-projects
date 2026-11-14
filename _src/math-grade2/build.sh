#!/bin/bash
# Builds the Kitty Math page. app.html is already in artifact format (title, style, markup, script).
#   build/index.html  the page itself (artifact + publish_lab.py input)
#   build/_page.html  with a doctype and viewport, for phone screenshots
#   build/_test.html  with window.__TEST__ so tests can read state
set -e
cd "$(dirname "$0")"
mkdir -p build
cp app.html build/index.html
{ echo '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>'; cat app.html; echo '</body></html>'; } > build/_page.html
{ echo '<script>window.__TEST__=true</script>'; cat app.html; } > build/_test.html
python3 - <<'PY'
import re, subprocess, tempfile
src = open('app.html').read()
js = re.search(r'<script>([\s\S]*)</script>', src).group(1)
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f: f.write(js)
subprocess.run(['node', '--check', f.name], check=True)
print('syntax ok ·', len(src.encode()), 'bytes')
PY
