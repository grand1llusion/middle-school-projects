#!/usr/bin/env python3
"""Publish a built study-lab page into the middle-school-projects GitHub Pages site.

Wraps a single-file lab page (the same HTML that is published as a Claude artifact:
<title> + <style> + markup + <script>, no <html>/<head>) in a full-screen iPhone web-app
shell, writes its manifest and home-screen icons, records it in labs.json, and
regenerates the landing page (index.html) grouped by class.

Example:
  python3 _tools/publish_lab.py --html /path/to/index.html --dest science/cells \
    --class Science --app-name "Cells Lab" --subtitle "6th grade · Cells" \
    --description "6th grade cells study lab" --color "#0A8273" --label "Cel"

Never change --dest for a lab that already exists: a home-screen icon is tied to its URL.
"""
import argparse, datetime, json, os, re, sys
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def make_icon(path, size, color, label):
    S = size * 4; base = hexrgb(color)
    im = Image.new('RGB', (S, S), base); d = ImageDraw.Draw(im)
    line = tuple(min(255, c + 18) for c in base)
    for y in range(int(S * .16), S, int(S * .12)): d.line([(0, y), (S, y)], fill=line, width=max(1, S // 120))
    d.line([(S * .16, 0), (S * .16, S)], fill=(214, 64, 86), width=max(2, S // 90))
    fs = int(S * (.46 if len(label) <= 2 else .36))
    try: font = ImageFont.truetype(FONT, fs)
    except OSError: font = ImageFont.load_default()
    bb = d.textbbox((0, 0), label, font=font)
    d.text(((S - (bb[2] - bb[0])) / 2 - bb[0] + S * .04, (S - (bb[3] - bb[1])) / 2 - bb[1]), label, font=font, fill=(255, 255, 255))
    im.resize((size, size), Image.LANCZOS).save(path)

WRAP_HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{description}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="{app_name}">
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="{dark_theme}" media="(prefers-color-scheme: dark)">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" href="icon-192.png">
<link rel="manifest" href="manifest.webmanifest">
'''
WRAP_EXTRA = '''
<style>
/* hosted, full-screen app extras */
html{background:var(--bg)}
button{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.a2hs{position:fixed;left:12px;right:12px;bottom:calc(66px + env(safe-area-inset-bottom,0px));z-index:15;display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:14px;background:var(--ink);color:var(--bg);font-size:14px;line-height:1.35;box-shadow:0 6px 18px rgba(0,0,0,.25);max-width:536px;margin-inline:auto}
.a2hs svg{width:16px;height:16px;vertical-align:-3px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.a2hs button{flex:none;width:32px;height:32px;border:0;border-radius:50%;background:rgba(127,127,127,.3);color:inherit;font-size:15px}
</style>
</head>
<body>
'''
WRAP_TAIL = '''
<div class="a2hs" id="a2hs" hidden><span>📲 <b>Make it full screen:</b> tap <b>Share</b> <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/></svg> then <b>Add to Home Screen</b>.</span><button id="a2hsx" aria-label="Dismiss">✕</button></div>
<script>
(function(){ try { if (window.navigator.standalone === false && !localStorage.getItem('a2hs-x')){ var b = document.getElementById('a2hs'); b.hidden = false; document.getElementById('a2hsx').onclick = function(){ b.hidden = true; try { localStorage.setItem('a2hs-x','1'); } catch(e){} }; } } catch(e){} })();
</script>
</body>
</html>
'''

def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def landing(labs):
    classes = []
    for l in labs:
        if l['class'] not in classes: classes.append(l['class'])
    parts = []
    for c in classes:
        items = sorted([l for l in labs if l['class'] == c], key=lambda l: l['added'], reverse=True)
        cards = '\n'.join(f'''    <a class="card" href="{l['path']}/"><img src="{l['path']}/apple-touch-icon.png" alt=""><div><b>{esc(l['app_name'])}</b><span>{esc(l['subtitle'])}</span></div></a>''' for l in items)
        parts.append(f'  <h2>{esc(c)}</h2>\n{cards}')
    return '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Middle School Projects</title>
<link rel="icon" type="image/png" href="science/icon-192.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@600&family=Atkinson+Hyperlegible:wght@400;700&display=swap">
<style>
:root{--bg:#EDF2EE;--surf:#FFFFFF;--ink:#12261D;--mut:#566F63;--line:#D1DDD5;--x:#0A8273;--xt:#D3F0EA}
@media (prefers-color-scheme:dark){:root{--bg:#0D1712;--surf:#15241C;--ink:#E4EFE8;--mut:#93AA9D;--line:#27392F;--x:#3FD3BE;--xt:#103D37;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;padding:calc(24px + env(safe-area-inset-top,0px)) 16px 32px;background:var(--bg);color:var(--ink);font:16px/1.45 'Atkinson Hyperlegible',system-ui,sans-serif}
main{max-width:520px;margin:0 auto;display:flex;flex-direction:column;gap:12px}
h1{font:600 28px/1.15 'Fredoka',ui-rounded,system-ui,sans-serif;margin:0}
h2{font:600 17px 'Fredoka',ui-rounded,system-ui,sans-serif;margin:10px 0 0;color:var(--x)}
p{margin:0;color:var(--mut)}
a.card{display:flex;align-items:center;gap:14px;padding:14px;border-radius:16px;background:var(--surf);border:1px solid var(--line);color:inherit;text-decoration:none}
a.card img{width:56px;height:56px;border-radius:14px;flex:none}
a.card b{display:block;font:600 19px 'Fredoka',ui-rounded,system-ui,sans-serif}
a.card span{color:var(--mut);font-size:14px}
a.card:focus-visible{outline:3px solid var(--x);outline-offset:2px}
</style>
</head>
<body>
<main>
  <h1>Middle School Projects</h1>
  <p>Study labs built for the phone. Open one in Safari, then tap Share → Add to Home Screen for full screen.</p>
''' + '\n'.join(parts) + '''
</main>
</body>
</html>
'''

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--html', help='built single-file lab page (artifact format); omit to only rebuild the landing page')
    ap.add_argument('--dest', help='site folder, e.g. science/cells (never rename an existing one)')
    ap.add_argument('--class', dest='klass', help='class heading on the landing page, e.g. Science, Math, Social Studies')
    ap.add_argument('--app-name', help='home-screen name, 12 characters or fewer is best')
    ap.add_argument('--subtitle', help='landing-page line, e.g. "6th grade · Cells"')
    ap.add_argument('--description', default='')
    ap.add_argument('--color', default='#0A8273', help='icon background color')
    ap.add_argument('--bg', default='#EDF2EE', help='page background for the splash screen')
    ap.add_argument('--dark-theme', default='#15241C')
    ap.add_argument('--label', default='', help='1-3 characters drawn on a generated icon')
    ap.add_argument('--new-icon', action='store_true', help='regenerate icons even if the folder already has them')
    a = ap.parse_args()
    labs_path = os.path.join(ROOT, 'labs.json')
    labs = json.load(open(labs_path)) if os.path.exists(labs_path) else []
    if a.html:
        for k in ('dest', 'klass', 'app_name', 'subtitle'):
            if not getattr(a, k): sys.exit(f'--{k.replace("_", "-").replace("klass", "class")} is required with --html')
        src = open(a.html, encoding='utf-8').read()
        if '<html' in src[:400].lower(): sys.exit('Pass the artifact-format page (starts with <title>), not a full HTML document.')
        if '</style>' not in src: sys.exit('No </style> found in the page.')
        i = src.index('</style>') + len('</style>')
        out_dir = os.path.join(ROOT, a.dest); os.makedirs(out_dir, exist_ok=True)
        page = WRAP_HEAD.format(description=esc(a.description or a.subtitle), app_name=esc(a.app_name), dark_theme=a.dark_theme) + src[:i] + WRAP_EXTRA + src[i:] + WRAP_TAIL
        open(os.path.join(out_dir, 'index.html'), 'w', encoding='utf-8').write(page)
        json.dump({'name': a.app_name, 'short_name': a.app_name, 'description': a.description or a.subtitle, 'start_url': './', 'scope': './', 'display': 'standalone', 'orientation': 'portrait',
                   'background_color': a.bg, 'theme_color': '#FFFFFF', 'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable'}]},
                  open(os.path.join(out_dir, 'manifest.webmanifest'), 'w'), indent=2, ensure_ascii=False)
        have = all(os.path.exists(os.path.join(out_dir, f)) for f in ('apple-touch-icon.png', 'icon-192.png', 'icon-512.png'))
        if a.new_icon or not have:
            label = a.label or a.app_name[:3]
            for f, s in (('apple-touch-icon.png', 180), ('icon-192.png', 192), ('icon-512.png', 512)): make_icon(os.path.join(out_dir, f), s, a.color, label)
        rec = {'path': a.dest.strip('/'), 'class': a.klass, 'app_name': a.app_name, 'subtitle': a.subtitle}
        old = next((l for l in labs if l['path'] == rec['path']), None)
        rec['added'] = old['added'] if old else datetime.date.today().isoformat()
        labs = [l for l in labs if l['path'] != rec['path']] + [rec]
        json.dump(labs, open(labs_path, 'w'), indent=2, ensure_ascii=False)
        print(f'wrote {a.dest}/ ({len(page):,} bytes); labs.json has {len(labs)} lab(s)')
    open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8').write(landing(labs))
    print('landing page rebuilt')
    for l in labs: print(f"  https://grand1llusion.github.io/middle-school-projects/{l['path']}/  ({l['class']}: {l['app_name']})")

if __name__ == '__main__':
    main()
