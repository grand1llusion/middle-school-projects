# Middle School Projects

Phone-first study labs for middle school tests, hosted with GitHub Pages at
https://grand1llusion.github.io/middle-school-projects/

| Lab | Class | Path |
| --- | --- | --- |
| Science Lab · 6th grade Scientific Method | Science | [`science/`](science/) |
| Plus & Minus Lab · 7th grade add, subtract, multiply & divide (Classic + Mult · Div modes) | Math | [`math/add-subtract/`](math/add-subtract/) |
| Fraction Lab · 5th grade adding & subtracting fractions (Module 2) | Math | [`math/grade5-fractions/`](math/grade5-fractions/) |
| Meow Math · 2nd grade math app with kittens to earn — cloud save, friend clubs, weekly leaderboard (source `_src/math-grade2/`) | Math | [`math/grade2/`](math/grade2/) |

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

Optional: `--bg`, `--light-theme` and `--dark-theme` set the splash and browser-bar colors (match them to the page background). To update a lab, re-run with the same `--dest`; its icon is kept unless you pass `--new-icon`.

Then commit and push to `main`. Pages redeploys in about a minute.

## Meow Math cloud (AWS backend)

The backend lives in `infra/meow-math/` and is deployed with AWS CDK to account `209211309990 us-west-2`.

| Resource | Name / ID |
| --- | --- |
| API Gateway HTTP API | `https://ye4s7c5kf8.execute-api.us-west-2.amazonaws.com` |
| Cognito User Pool | `us-west-2_LuiGQus4J` |
| Cognito App Client | `4tuo3rkbgh9rh0da2qtmeck9bc` |
| DynamoDB table | `MeowMath` (PAY_PER_REQUEST, PITR, TTL `expiresAt`) |
| Budget alarm | Email to `bradley.papke@gmail.com` at $5/mo (80% threshold) |

**To redeploy after changes:**
```bash
cd infra/meow-math
NODE_PATH="C:/Users/bradl/AppData/Local/Temp/meow-deps/node_modules" cdk deploy
```
(Requires `tsx` and `esbuild` to be installed globally: `npm install -g tsx esbuild`. The project `node_modules` only has CDK core packages due to Google Drive npm constraints.)

**Cloud is opt-in.** The app works fully offline without an account. Parents sign up, choose a display name for each child, then invite friends with a 6-character code. All data syncs on the next PUT; merge rules are in `lambda/shared/merge.ts`.

**To invite a friend:** From the Club tab → create a club → share the 6-character invite code. The friend opens the app → Club tab → Join with Code.

## Use it on an iPhone

Open the lab link in **Safari** (Chrome and the Google app can't add it to the Home Screen), tap **Share**, then **Add to Home Screen**.
Progress is saved on the phone, separately for the home-screen icon and for Safari.
