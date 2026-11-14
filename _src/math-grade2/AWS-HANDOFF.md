---
visibility: private
type: handoff
status: ready
created: 2026-11-14
updated: 2026-11-14
---

# Meow Math: AWS handoff (cloud save, friend accounts, leaderboard)

Hand this file to Claude Code (the CLI) in a clone of `grand1llusion/middle-school-projects`. It has everything needed to host the backend on AWS and add accounts and a friends leaderboard to Meow Math.

## 0. TL;DR

| Item | Today | Goal |
|---|---|---|
| App | One static page, `_src/math-grade2/app.html`, published to GitHub Pages at `/math/grade2/` | Same page, plus a **Club** tab (friends and leaderboard) and a **Sign in** card in Progress |
| Save data | `localStorage` key `kitty-math-g2-v1`, on one phone only | Still saved locally first, plus **cloud sync** so progress survives a lost phone or cleared Safari |
| Backend | None | AWS: Cognito (parent login), API Gateway HTTP API, Lambda, DynamoDB. All serverless |
| Hosting | GitHub Pages | **Recommended: keep GitHub Pages** and only add the AWS API (see §3). Optional: move the page to S3 + CloudFront (§11) |
| Cost | $0 | Expected under $1 a month for a few dozen kids (all pay-per-use) |

Scope rule from Bradley: **add only what is asked.** Everything in this file was asked for (cloud save, friends with accounts, leaderboard). Do not add other features. The "Study" and "Games" tabs stay placeholders.

## 1. Read these first

1. `README.md` (repo root): how labs are built and published.
2. `_src/math-grade2/app.html`: the whole app, one hand-written file (~41 KB).
3. `_src/math-grade2/build.sh`: copies `app.html` to `build/index.html` and runs a syntax check.
4. `_tools/publish_lab.py`: wraps the page for full-screen iPhone use and writes it into `math/grade2/`.
5. `_src/math-grade2/tests/`: `click-through.js` (jsdom), `phone-shots.js` and `litter-shots.js` (Playwright).

Build and publish:

```bash
cd _src/math-grade2 && ./build.sh
cd ../.. && python3 _tools/publish_lab.py --html _src/math-grade2/build/index.html --dest math/grade2 \
  --class "Math" --app-name "Meow Math" --subtitle "2nd grade · Draw to add · Kittens to earn" \
  --description "<one line>" --color "<hex from math/grade2/manifest.webmanifest theme_color>"
```

(`labs.json` has the stored values; reuse the same `--dest`. The custom cat-face icon is kept unless `--new-icon` is passed.)

Page rules that must keep holding (the page is also a Claude artifact): `<title>`, `<style>`, markup, `<script>` only, with **no** doctype, html, head or body tags; all `localStorage` calls in try/catch; **never** `alert`, `confirm` or `prompt`; `[hidden]{display:none!important}`; safe-area padding on the header and bottom nav; light and dark mode via the existing tokens.

## 2. How the app stores progress today

All state is one object `S` in `app.html`:

```js
S = { tab, stars, solved, pv:{i,cur}, area:{}, catAreas:[], cats:[], got, sel,
      food, treats, water, streak, day }
```

- `stars`, `solved`: only ever go up.
- `area`: map of skill area id to number solved (today only `'pv-add'`).
- `catAreas`: areas that already gave a kitten. `cats`: `[{name, coat, wear:[ids]}]`.
- `got`: how many rewards are unlocked (`REWARDS[0..got-1]`). Reward cost is `cost(i) = 10 + 15*(i+1)`.
- `food`, `treats`, `water`, `streak`, `day`: daily-care state (`day` is local `YYYY-MM-DD`).
- `tab`, `pv`, `sel`: UI state (do **not** sync these).

Hook points (all in `app.html`):

| Function | What it does | Cloud hook |
|---|---|---|
| `save()` | Writes `S` to `localStorage` | Add `syncSoon()` here (debounced) |
| `award(area)` | A right answer: +1 star, +10 water, then `grant()` | Nothing extra; `save()` already fires |
| `grant()` | Kittens and rewards, then `save()` | Nothing extra |
| `dayTick()` | Daily food, streak, water drain | Nothing extra |
| `TABS` array | Bottom tabs | Add `['club','Club']` |
| `catSVG(cat)` | Draws a kitten | Reuse for leaderboard avatars (send `coat` and `wear`) |

## 3. Architecture

```
iPhone (Home Screen app, GitHub Pages)
   │  HTTPS, JSON, Authorization: Bearer <Cognito ID token>
   ▼
API Gateway (HTTP API) ── JWT authorizer (Cognito)
   ▼
Lambda (Node 20, one function per route or one router)
   ▼
DynamoDB (single table, on-demand)
```

Why this shape:

- **Keep the front end on GitHub Pages.** A Home Screen icon and its saved data are tied to the web address. Moving the page to a new domain would make every child start from zero. Only the API is new. The API needs CORS for `https://grand1llusion.github.io` (and `http://localhost:*` for testing).
- **Offline first.** The app keeps working with no internet and no account. Signing in is optional. Cloud sync is a layer on top of `localStorage`, never a replacement.
- **Serverless and pay-per-use**, so it costs nearly nothing when idle.

Infrastructure as code: use **AWS CDK (TypeScript)** in a new folder `infra/meow-math/` at the repo root. One stack, `MeowMathStack`. Region `us-west-2` (or whatever the account already uses; ask Bradley).

## 4. Child-safety and privacy rules (non-negotiable)

The players are young children (2nd graders and their friends). Treat this as a children's service.

1. **Parents own accounts.** Cognito users are **parents** (email and password). Children never type an email or a password.
2. **No personal data about children.** Store **no real names, photos, birthdays, schools or locations.** A child profile ("player") has only: an auto-generated display name, a kitten avatar, and game numbers.
3. **No free-text anywhere visible to others.** Display names are generated from two word lists (adjective plus animal plus number, e.g. "Sparkly Otter 42"). There is no chat, no comments, no kitten names shared. (Kitten names stay private on the child's own device.)
4. **Private clubs only.** There is no global leaderboard. A "Club" is created by a parent and joined with an invite code. Only members of the same club see each other.
5. **Parent controls:** remove a player from a club, leave a club, delete a player, and **delete the whole account and all data** (a real delete, not a flag).
6. **Minimal logging.** Do not log request bodies or tokens. Set CloudWatch log retention to 14 days.
7. Add a short, plain-language privacy note on the sign-in card ("Only a made-up name and your kitten show to friends. Ask a grown-up to sign in."). Flag to Bradley that COPPA and Apple rules apply if this is ever opened beyond friends and family, and that he should have the privacy text reviewed before sharing widely.

## 5. Data model (DynamoDB, one table `MeowMath`, on-demand)

Key schema: `pk` (string), `sk` (string). One GSI `gsi1` with `gsi1pk`, `gsi1sk` for leaderboard queries. Turn on point-in-time recovery. Encryption at rest is the default.

| Entity | pk | sk | Fields |
|---|---|---|---|
| Parent | `P#<cognitoSub>` | `PROFILE` | `createdAt` |
| Player | `P#<cognitoSub>` | `PLAYER#<playerId>` | `displayName`, `coat`, `wear[]`, `createdAt`, `deleted?` |
| Progress doc | `PL#<playerId>` | `PROGRESS` | `doc` (the synced fields, see §6), `rev`, `updatedAt`, `lastStars`, `lastStarsAt` |
| Club | `C#<clubId>` | `META` | `name`, `inviteCode`, `ownerSub`, `createdAt` |
| Membership | `C#<clubId>` | `M#<playerId>` | `displayName`, `coat`, `wear[]`, `joinedAt` |
| Reverse lookup | `PL#<playerId>` | `CLUB#<clubId>` | (so a player's clubs can be listed) |
| Invite code | `INV#<code>` | `INV` | `clubId` |
| Weekly score | `C#<clubId>#W#<weekId>` | `S#<paddedScore>#<playerId>` | `playerId`, `displayName`, `coat`, `wear[]`, `stars`, `streak`, `kittens` |

Notes:

- `weekId` = the Monday date (`YYYY-MM-DD`) of the week in **America/Denver**, computed on the server. Weeks start Monday.
- Weekly score rows use a zero-padded score in the sort key (`S#00042#<playerId>`) so a plain `Query` with `ScanIndexForward=false, Limit=10` returns the top ten. When a score changes, delete the old row and put the new one in a `TransactWriteItems`. Give each score row a TTL (`expiresAt` = 60 days) so old weeks clean themselves up.
- `playerId`, `clubId`: random 12-character base32 ids (`crypto.randomBytes`).
- `inviteCode`: 6 characters from an unambiguous alphabet (`ABCDEFGHJKMNPQRSTUVWXYZ23456789`); retry on collision with a conditional put.

## 6. What syncs (and how conflicts are merged)

Sync **only** these fields from `S` (never `tab`, `pv`, `sel`):

```
stars, solved, area, catAreas, cats, got, food, treats, water, streak, day
```

Merge rule (run on the client **and** the server so both agree). Given local `L` and remote `R`:

| Field | Rule |
|---|---|
| `stars`, `solved`, `got` | `max(L, R)` (these only go up) |
| `area` | per key, `max` |
| `catAreas` | union |
| `cats` | by index: keep the longer list; for the same index prefer the one with a non-empty `name`, and union the `wear` arrays |
| `streak`, `day` | take the pair with the later `day` |
| `food`, `treats`, `water` | take from the doc with the later `updatedAt` |

After a merge, the client must run `grant()` so any kitten or reward the merged numbers imply is awarded, then `save()`.

Sync protocol (one endpoint, simple):

1. Client holds `rev` (an integer the server returns) in its own `localStorage` key `meow-sync-v1` along with `{playerId, tokens...}` (see §8).
2. `PUT /players/{playerId}/progress` with `{doc, baseRev}`.
3. Server loads the stored doc, merges, writes with a conditional on `rev`, and returns `{doc, rev}`. If the conditional fails (a race), the server re-reads and re-merges, up to 3 tries.
4. Client replaces its fields with the returned merged `doc`.
5. Client syncs: after sign-in, on app open, on `visibilitychange` back to visible, and 3 seconds after the last `save()` (debounce). If offline, set a `dirty` flag and try again later. Never block the UI on the network.

**First sign-in on a phone that already has progress:** upload it. The merge rule means nothing is lost, and a brand-new empty phone just downloads the cloud copy.

## 7. API contract

Base path `/v1`. All routes require the Cognito JWT (HTTP API JWT authorizer) except `GET /v1/health`. The player must belong to the caller (`pk = P#<sub>`); return 404 (not 403) for anything else, to avoid leaking what exists.

| Method and path | Body | Result |
|---|---|---|
| `GET /v1/health` | none | `{ok:true}` (public) |
| `POST /v1/players` | `{}` | Creates a player with a generated name and `coat` random 0 to 5. Returns `{playerId, displayName, coat, wear:[]}`. Max 6 players per parent |
| `GET /v1/players` | none | List the parent's players |
| `DELETE /v1/players/{playerId}` | none | Deletes the player, progress, memberships and score rows |
| `GET /v1/players/{playerId}/progress` | none | `{doc, rev}` |
| `PUT /v1/players/{playerId}/progress` | `{doc, baseRev}` | Merged `{doc, rev}`. Also updates the player's weekly score in each club (see §9) and `coat` and `wear` of the first kitten for the avatar |
| `POST /v1/clubs` | `{name}` (parent types the club name; 2 to 24 chars, letters, digits, spaces) | `{clubId, inviteCode}`. Max 5 clubs per parent. Club name is visible to members, so it is the one free-text field. Run it through a small blocklist and tell Bradley it is parent-entered only |
| `POST /v1/clubs/join` | `{inviteCode, playerId}` | Adds the player. Max 30 members per club |
| `DELETE /v1/clubs/{clubId}/members/{playerId}` | none | Leave. The club owner may also remove any member |
| `GET /v1/players/{playerId}/clubs` | none | The player's clubs with their invite codes if the caller owns them |
| `GET /v1/clubs/{clubId}/leaderboard?playerId=...&period=week\|all` | none | See §9 |
| `DELETE /v1/account` | none | Deletes every item under the parent, then the Cognito user |

Validation: use a schema validator (e.g. `zod`) on every body. Reject unknown fields. Cap request size at 10 KB. Return JSON errors as `{error:"code"}` with no stack traces. Add API Gateway throttling: 20 requests per second burst, 10 steady, per route default.

CORS: allow origins `https://grand1llusion.github.io` and `http://localhost:8080`, methods `GET,POST,PUT,DELETE,OPTIONS`, headers `authorization,content-type`.

## 8. Authentication (Cognito)

- One **User Pool** `meow-math-parents`: sign-in with email, password policy 10+ characters, email verification on, **no** self-service of attributes beyond email. MFA optional (off for v1).
- One **App client** (public, no secret), auth flows: `USER_PASSWORD_AUTH` and `REFRESH_TOKEN_AUTH`. Set **refresh token validity to 365 days** so the child's phone stays signed in all year, and ID/access tokens to 1 hour.
- To avoid pulling in the whole Amplify library into a 41 KB page, call the Cognito Identity Provider JSON API directly with `fetch`:
  - `POST https://cognito-idp.<region>.amazonaws.com/` with header `X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth` and `Content-Type: application/x-amz-json-1.1`, body `{AuthFlow:'USER_PASSWORD_AUTH', ClientId, AuthParameters:{USERNAME, PASSWORD}}`.
  - Refresh: same call with `AuthFlow:'REFRESH_TOKEN_AUTH'` and `AuthParameters:{REFRESH_TOKEN}`.
  - Sign-up and confirm: `SignUp` and `ConfirmSignUp` with the emailed 6-digit code. Forgot password: `ForgotPassword` and `ConfirmForgotPassword`.
  - Send the **ID token** as `Authorization: Bearer ...`.
- The page stores `{refreshToken, playerId}` in `localStorage` key `meow-sync-v1`. Do not store the password.
- **Parent gate:** the sign-in and club-management screens sit behind a simple "ask a grown-up" gate (e.g. "What is 7 × 8?" typed on a keypad, no `prompt`). Children play and see the leaderboard without it; only account, club creation and removal need it.
- **"Who's playing?"** After sign-in, show the parent's players as big kitten buttons so siblings can share one device and each keeps separate progress. The local save key then becomes per player: `kitty-math-g2-v1` for the original local-only player, and `kitty-math-g2-v1:<playerId>` for signed-in players. On first link, copy the existing local save into the chosen player's cloud doc (this is the "first sign-in" case in §6).

## 9. Leaderboard

What to show, per club, with a toggle **This week | All time**:

- Rank, kitten avatar (`catSVG({coat, wear})`), generated display name, and **stars**. Ties break by who reached the score first (earlier `updatedAt`).
- Top 10, plus the viewing player's own row pinned at the bottom with their true rank if they are outside the top 10.
- Secondary badges (small): 🔥 streak days, 🐱 kitten count.
- The viewing player's row is highlighted. Tapping a row does nothing (no profiles, no messages).
- Friendly framing: show "Great job!" copy, no "last place" text. Keep wording kind. Ranks beyond 10 may show "Keep going!"

How it is computed:

- On every `PUT .../progress`, the server compares the new `stars` with the stored `lastStars` and adds the positive difference to the **weekly** counter for the current `weekId` for each club the player is in (so weekly is "stars earned this week", not the lifetime total). Store the running weekly total in the player's score row.
- **All time** = the player's lifetime `stars` from the progress doc (kept in the membership item, updated on the same write).
- `GET .../leaderboard` queries the weekly partition (`C#<clubId>#W#<weekId>`) descending, limit 10, and fetches the caller's own row separately; rank for someone outside the top 10 is computed with a count query on the same partition (members are capped at 30, so this is cheap).

Fair-play checks (server side, on every progress write):

- A right answer takes real time. Accept at most **+30 stars per rolling 5 minutes** per player. Anything above that is clipped for the leaderboard (the player's own local progress is unaffected) and a counter metric `ClippedStars` is emitted.
- Never accept a smaller `stars` than stored (merge uses `max`).
- This is a friendly game, not a competition with prizes. Do not over-engineer cheating defences, but do not skip the clip rule.

Client work for the **Club** tab (new tab `['club','Club']` in `TABS`; it fits at 375 px width with six short labels, check with `phone-shots.js`):

1. Signed out: a friendly card, "Play with friends! Ask a grown-up to sign in", with a Sign in button (behind the parent gate).
2. Signed in, no club: "Join a club" (enter a 6-character code on a big on-screen keypad, uppercase letters and digits only) and, behind the parent gate, "Make a club".
3. In a club: the leaderboard, a This week / All time toggle, a small pull-to-refresh or Refresh button, and the invite code shown only to the owner behind the gate.
4. All new UI must follow the existing look: blue tokens, light and dark mode, `h()` builder, no `alert/confirm/prompt`, tap targets at least 44 px.

## 10. Step-by-step build order

Do these in order and commit after each step. Keep the app fully working at every step.

1. **Ask Bradley** (use the multiple-choice question tool, not plain text): AWS region and account/profile to use; whether he has a custom domain (optional); and a contact address for the privacy note. Everything else here is already decided.
2. **Scaffold CDK:** `mkdir infra/meow-math && cd infra/meow-math && npx cdk init app --language typescript`. Add `aws-cdk-lib` constructs for: DynamoDB table (with GSI, PITR, TTL attribute `expiresAt`), Cognito User Pool and client, HTTP API with a JWT authorizer and CORS, Lambda functions (`NodejsFunction`, Node 20, 256 MB, 10 s timeout, `esbuild` bundling), CloudWatch log groups with 14-day retention, and a budget alarm.
3. **Write the Lambda handlers** in `infra/meow-math/lambda/` with `zod`, the AWS SDK v3 `DynamoDBDocumentClient`, and a shared `merge.ts` (the §6 rule). Unit-test `merge.ts` and the week/rank logic with `vitest` (no AWS needed).
4. **Deploy** with `npx cdk bootstrap` (once) and `npx cdk deploy`. Print outputs: API URL, User Pool id, App client id, region. Put the **public** ids (not secrets; there are none) into `_src/math-grade2/config.json` and inline them at build time via `build.sh`.
5. **Smoke test the API** with `curl` using a test parent created with `aws cognito-idp admin-create-user` and `admin-set-user-password`. Cover: create player, put progress, create club, join, leaderboard, leave, delete player, delete account.
6. **Client: account layer** in `app.html`: sign-up, confirm code, sign in, sign out, refresh, parent gate, "Who's playing?". Keep it behind a single `CLOUD` object. If `config` is empty (for example in tests), the whole cloud layer is inert and the app behaves exactly as today.
7. **Client: sync** (`syncSoon`, `syncNow`, `mergeDoc`) per §6, wired into `save()`.
8. **Client: Club tab and leaderboard** per §9.
9. **Tests:** extend `tests/click-through.js` with a mock `fetch` (a small in-memory fake of the API) covering: sign in, first-link upload, merge of two diverged saves, leaderboard rendering with a pinned own row, join with a bad code, offline mode (fetch rejects, the app still works), and that the app is unchanged when `CLOUD` is inert. Re-run the existing 5000-problem generator check and `phone-shots.js` and `litter-shots.js` (look at the screenshots, check no horizontal overflow at 375×667 light and 390×844 dark).
10. **Publish** with the commands in §1, update `README.md` (a short "Meow Math cloud" section), and push. Also republish the Claude artifact preview if the artifact tool is available.
11. **Tell Bradley** the invite flow for friends (§12) and the monthly cost to expect.

## 11. Optional: host the page on S3 + CloudFront

Only do this if Bradley asks. Warning to include in the message to him: **a new web address means every Home Screen icon starts empty.** If he still wants it, first ship the cloud sync (so every signed-in child has a cloud copy), then move.

- Private S3 bucket + CloudFront with Origin Access Control, default root object `index.html`, HTTPS only, HTTP/2 and 3, compression on, security headers policy (HSTS, `X-Content-Type-Options`, `Referrer-Policy: same-origin`).
- Optional custom domain: Route 53 + ACM certificate in `us-east-1`.
- Copy `math/grade2/` (page, manifest, icons) to the bucket; keep paths identical. Invalidate `/*` after each deploy.
- Update the CORS origins and the `scope`/`start_url` in `manifest.webmanifest`.
- Leave a redirect page at the old GitHub Pages path pointing to the new address.

## 12. How Bradley's family and friends will use it

1. A parent opens the Meow Math Home Screen icon, taps **Club**, taps **Sign in**, answers the grown-up question, creates an account (email plus password), and types the emailed code.
2. The app asks "Who's playing?" and creates a player with a made-up name. The child's existing stars and kittens are uploaded.
3. Bradley makes a club ("The Papke Kittens", say) and gets a 6-character code. He texts it to the other parents.
4. Each friend's parent signs in on their child's phone or tablet, makes a player, and enters the code. The kids appear on each other's leaderboard.

## 13. Acceptance checklist

- [ ] With no network and no account, the app behaves exactly as before (all existing tests still pass: click-through NO ERRORS, generator check, no overflow in screenshots).
- [ ] Signing in uploads existing local progress; signing in on a second device downloads it; two diverged saves merge without losing stars, kittens or rewards.
- [ ] Deleting the Home Screen icon and re-adding it, then signing in, brings everything back.
- [ ] No page ever shows a real name, email or free text from another child. Club names are the only parent-typed text others can see.
- [ ] Leaderboard shows top 10 plus the player's own pinned row, This week and All time, tie-break by earliest.
- [ ] More than 30 stars in 5 minutes is clipped on the leaderboard.
- [ ] A parent can remove a player and delete the account, and the data is gone from DynamoDB.
- [ ] API has throttling, request validation and 14-day log retention; no secrets in the repo.
- [ ] `npx cdk destroy` removes everything (apart from the DynamoDB table if retention is on; note this in the README).
- [ ] Monthly cost estimate and a budget alarm at $5 reported to Bradley.

## 14. Notes for the engineer

- Keep Meow Math's look and tone: simple, kind, no clutter. 2nd graders use it. Big buttons, short words.
- Do not rename `kitty-math-g2-v1`; existing saves depend on it.
- The home-screen icon label cannot be renamed remotely; users must re-add the icon.
- Use the session attribution lines the environment gives for commits.
- If something here conflicts with what Bradley says in the moment, ask him with the multiple-choice question tool.
