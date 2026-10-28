# Middle School Projects

Phone-first study labs for middle school tests, hosted with GitHub Pages at
https://grand1llusion.github.io/middle-school-projects/

| Lab | Class | Path |
| --- | --- | --- |
| Science Lab · 6th grade Scientific Method | Science | [`science/`](science/) |

## How it is organized

- `<class>/<unit>/` holds one published lab: `index.html`, `manifest.webmanifest`, and home-screen icons.
  (`science/` is the first lab and stays at that path, because a home-screen icon is tied to its URL.)
- `labs.json` lists every lab. `index.html` at the root is generated from it, grouped by class.
- `_src/<lab>/` holds each lab's source parts, build script, and tests. Folders starting with `_` are not published by GitHub Pages.
- `_tools/publish_lab.py` wraps a built lab for full-screen iPhone use, writes its icons and manifest, updates `labs.json`, and rebuilds the landing page.

## Add a lab

```bash
python3 _tools/publish_lab.py --html _src/<lab>/build/index.html --dest <class>/<unit> \
  --class "<Class>" --app-name "<Home screen name>" --subtitle "<grade> · <unit>" --color "#0A8273" --label "Abc"
```

Then commit and push to `main`. Pages redeploys in about a minute.

## Use it on an iPhone

Open the lab link in **Safari** (Chrome and the Google app can't add it to the Home Screen), tap **Share**, then **Add to Home Screen**.
Progress is saved on the phone, separately for the home-screen icon and for Safari.
