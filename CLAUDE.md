# Firsts, drawn in code: notes for Claude

Read this before touching anything. It is everything learned while making the first video, so the next one
does not start from zero.

## What this project is

The user makes narrated history videos for YouTube. They write a script split into numbered lines (one line
per panel) and I draw every panel as a hand-drawn-looking stick-figure cartoon in code.

- `test` is the whole thing: one self-contained HTML file that opens in Chrome or Edge, with no server and
  nothing to install. I deliver it as `Firsts_drawn_in_code_vN.html`, plus a PNG contact sheet of the panels
  that changed.
- It has four `<script>` blocks:
  0. the drawing engine and every panel;
  1. mp4-muxer;
  2. fflate (zip);
  3. the player, editor and exporter.
- The user's video editors are Premiere Pro and After Effects.

### Map of script 0

The `/* ---------- ... ---------- */` headers split it into sections:

- **Engine:**
  - seeded randomness;
  - geometry;
  - ink (`S`, `E`, `Rc`, `Ln`, `T`, `polyR`, `ribbon`), all wobbly on purpose;
  - people (`person`, `personArms`, `bust`, `mini`, `watcher`, `personTop`, `lying`, `falling`, `seated`, `crowd`, `looks`);
  - props;
  - depth shots (`cam`, `personAt`, `streetDepth`, `q3`);
  - scenery.
- **Kits:** one per story (railway, parachute, car, plane, core, capsule, robot, self-driving). Reuse them or delete them.
- **Chrome:** `ITEMS` gives each story's title and badge face. `DARK` lists panels with a night palette.
- **Panels:** `P[n] = function (ctx) { seed(n); ... }`, one per script line.
- **`LINES`:** `[n, 'narration', item, { grid, dur, push, zoomTo, zoomFrom }]`. Everything is driven by this table.
- **Grids:** the opening grid (`GRID_LABELS`, `GRID_FIRST`: the first panel of each story, used as its tile)
  and the outro grid (`G2` thumbnails, `OUTRO_LIT`).

### Drawing conventions

- **People:** round white head `HEAD_R = 6` u, where `u = s * 10`.
  - The feet are at `o.y` and the head is 47.4 u above.
  - The body is a narrow shape filled with the coat colour.
  - Arms use IK (`armP`, `{ to: [x, y], type: 'fist' | 'open' | 'point', bend: ±1 }`).
  - `SKIN` / `SKINS` give 7 skin tones. Hair styles: part, wavy, curly, buzz, bald, receding, bob, ponytail, long,
    bun, short; beards too.
  - Hats: tricorne, top, bonnet, cap.
- **RNG streams:**
  - `_s` (`rr`, `rnd`) places things and never changes between wobble frames.
  - `_w` is the line wobble.
  - `_p` / `_q` keep people still, or let them wobble on their own.
  - Always `seed(n)` at the top of a panel.
- **Canvas:** 1920x1080. The title bar is 150 px tall. The portrait badge is centred at (1792, 140), radius 116:
  keep anything important out of the top-right corner.

## Who the user is and how they give feedback

- They send screenshots with blunt, casual notes, e.g. "why is this floating", "looks like a room", "wtf is that".
  Each note is a logic problem, not a style preference.
- Fix the reason behind the note, then look for the same mistake in every other panel.
- Redraw from what would really be there. Don't nudge the thing they pointed at.
- They want to wrap up and export. Keep replies short: what changed, where the file is, what to do.
  Push every version and send the HTML plus a preview.

## Picture rules (every one came from feedback)

**Story and script**

- A panel shows only what its line has said so far. Never spoil the next line: on "…did something no human had
  ever done", don't show the flight when the next line is "He flew."
- Deaths are shown by aftermath only, never the moment of impact. The body is shown clearly, with a light blur
  over the blood.
- No jokes from story 6 (the nuclear core) on.
- No photos in story 9 (self-driving car).
- `PHOTO` placeholder cards mark where the user drops real photos in.
- No speech bubbles. Written text is only dates, labels and numbers, on a white card only when the background is
  busy.
- No dates on the grids. The date appears on the first panel of each story.

**Accuracy (research every event before drawing it)**

- Get right who was there, where it was and what it looked like: vehicles, clothes, buildings of the period.
  - No Eiffel Tower in 1783.
  - The 1783 Montgolfier balloon had a ring-shaped wicker gallery with the fire in the middle, not a basket.
  - Wellington sat in an open carriage with a canopy.
  - Orville and Selfridge were bare-headed.
  - Los Alamos is pine-covered mesa, not cactus desert.
  - Soyuz rockets have strap-on boosters.
- Where the script is wrong, draw what the script says and tell the user the line to reword, with sources.
  Don't change the script yourself.

**Physical logic**

- Everything is supported and connected. No one floats.
  - People stand on floors; balloon walkways have floors.
  - Rivers have banks, and bridges reach land.
  - Hands actually reach what they hold, and legs go behind rails.
- Things must read as what they are at a glance. Past mistakes:
  - burn marks that formed a face;
  - bags that looked like eggs;
  - a court wall that looked like stairs;
  - a straight fence that looked like a bridge over a cliff;
  - a walled gallery that looked like a room;
  - lamps in trees that looked like festival baubles;
  - bunting hanging in open sky.
- A person pushing a bike walks beside it; a rider sits on it.
- Walking uses `walkPose` / `o.walk`: legs never cross.

**Settings and camera**

- Real places, not empty green fields. A few big buildings, not rows of tiny ones: zoom in on the main subject.
- Vary the camera. Use depth shots (`cam`), over the shoulder, top-down, close-ups, views from behind.
  Not everything flat and side-on.

**People and crowds**

- Crowds are sparse (`gap` ≥ 46·s) and everyone faces what they are watching.
  - Show backs when the camera is behind them.
  - Nobody small stares at the camera. If in doubt, leave the extras out.
- Reactions fit the moment: people are shocked when a plane falls.
- Crowds mix skin tones and hair to suit the time and place. Real people look like themselves.
  Two different characters must never share the same hair and look.

**Before every delivery, check each changed panel against these questions:**

- What does its line say, and does the picture show exactly that?
- Where and when is it?
- What holds everyone up?
- Where is everyone looking, and why?
- Would a stranger understand it in 2 seconds?
- Does any shape accidentally read as something else?

## The player and exporter (script 3)

- **Per-panel settings** live in `SET[n]` = `{ dur, wobble: 'off' | 'lines' | 'people' | 'all', zoom, amount, fx, fy, text, picks }`.
  - Wobble starts **off** on every panel: the user wants wobble only on panels they pick.
  - Settings persist in `localStorage` under `firsts-drawn-in-code-settings-v1`, so they carry into the next
    version of the file.
- **Under the picture:**
  - the Wobble menu for the panel on screen (a paused wobbling panel keeps wobbling so you can see it);
  - **Wobble frames**, which picks exact boil frames;
  - **Save wobble clips**, which gives one MP4 per wobbling panel, identical to that stretch of the whole video.
    Its `timing.csv` column `in_whole_video_at` says where each clip goes.
- **Exports:**
  - one MP4;
  - one MP4 per panel;
  - wobble loops (no zoom);
  - PNG stills in layers;
  - every frame as PNG, into a folder: it resumes and redraws only changed panels.
- **Video encoding:** WebCodecs, H.264 in Chrome and Edge (VP9 in headless test Chromium).
- **Every delivered version:** bump `DRAWN` and add `REDRAWN[newVersion] = [changed panels]`, taken from
  `tools/diffver.js`. That makes a resumed frame export redraw only what changed.

## Making the next video from a new script

1. Copy `test` to the new file. Keep the engine (people, ink, cam, crowds, generic props) and scripts 1–3 as they are.
2. Replace `LINES` with the new script. Each story starts with a `grid` panel: `zoomTo` goes into the story's tile,
   and a later grid panel uses `zoomFrom` to come back out.
3. Replace `ITEMS` (title and badge per story), `GRID_LABELS`, `GRID_FIRST`, `NAMES` (in script 3), the outro
   `G2` / `OUTRO_LIT`, and `DARK` / `LAB`.
4. Write `P[n]` for every line. Reuse helpers, and delete story kits that aren't needed.
5. Set `DRAWN = 1` and `REDRAWN = {}`. Give the settings key `STORE` a new name so the old video's settings don't leak in.
6. Research every story first, then draw, then run the checklist above on every panel.

## Tools and testing (`tools/`)

The tools need Playwright's Chromium at `/opt/pw-browsers` (already set up in this environment). They take the
file as their first argument. `test` works as is: `tools/html.js` gives Chrome a `.html` copy, because Chrome
won't render a file without that extension as a page.

- `node tools/render.js test out/ 3 4 5`: renders panels to PNGs (`TXT=1` to include text; no panel list = all).
- `python3 tools/sheet.py out/ sheets/ 1 221`: 4-column contact sheets (16 per sheet). Look at every one.
- `node tools/check.js test`: renders all panels at 3 wobble frames and drives the player.
  It must print `"bad":[]` and `"errs":[]`.
- `node tools/diffver.js old.html test`: lists the panels that changed between two versions, for `REDRAWN`.
- `node tools/exptest.js test`, `node tools/resume.js test`, `node tools/wfbtn.js test`, `node tools/barwob.js test`:
  export, resume, wobble-picker and wobble-clip tests. They save into `exp/`.
- `tools/patchlib.py`: `load()`, `save()`, `rep(s, old, new, count)` (asserts the match count) and
  `set_panel(s, n, code)`, for scripted edits of the big file.
- ffmpeg is at `/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2`.

## Git

- Work on the branch the session names.
- Commit messages describe the picture changes in plain words. No AI model names in commits or files.
