const { chromium } = require('/opt/node22/lib/node_modules/playwright');
require('fs').mkdirSync('exp', { recursive: true });
const path = require('path');
(async () => {
  const b = await chromium.launch(); const ctxb = await b.newContext({ acceptDownloads: true, viewport: { width: 1400, height: 1000 } });
  const p = await ctxb.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + require('./html.js')(process.argv[2]));
  await p.waitForFunction(() => window.FirstsEditor);
  await p.evaluate(() => { window.showSaveFilePicker = undefined; window.showDirectoryPicker = undefined; });
  await p.click('#editor summary');
  // tick 41..44 with a shift-click, set wobble "people", then zoom on 43
  const ticks = await p.$$('#tlBody .tl-tick');
  const i41 = await p.evaluate(() => window.BalloonScenes.PANELS.findIndex(x => x.n === 41));
  await ticks[i41].click(); await ticks[i41 + 3].click({ modifiers: ['Shift'] });
  await p.selectOption('#tlWob', 'people'); await p.click('#tlWobGo');
  const afterSet = await p.evaluate(() => [41, 42, 43, 44, 45].map(n => window.FirstsEditor.SET[n].wobble).join(','));
  const count = await p.textContent('#tlCount');
  await p.$eval('#tlBody', (el, i) => { const s = el.children[i].querySelector('.tl-zoom'); s.value = 'in'; s.dispatchEvent(new Event('change', { bubbles: true })); }, i41 + 2);
  await p.screenshot({ path: 'exp/v6_editor.png', fullPage: true });
  async function grab(btn, tag, n) {
    const got = [];
    const h = d => got.push(d); p.on('download', h);
    await p.click(btn);
    await p.waitForFunction(() => !document.querySelector('#exMp4').disabled && !/ of \d+/.test(document.querySelector('#exMsg').textContent), null, { timeout: 900000 });
    await p.waitForTimeout(800); p.off('download', h);
    const files = []; for (const d of got) { const f = 'exp/' + tag + '_' + d.suggestedFilename(); await d.saveAs(f); files.push(f); }
    return [files, await p.textContent('#exMsg')];
  }
  const out = { afterSet, count };
  await p.selectOption('#exWhat', 'ticked');
  out.mp4 = await grab('#exMp4', 'h');
  out.expectFrames = await p.evaluate(() => window.FirstsEditor.framesOf(window.FirstsEditor.chosen()));
  out.wobMp4 = await grab('#exWobble', 'i');
  await p.selectOption('#exWobFmt', 'png'); await p.selectOption('#exLayersMode', 'split');
  out.wobPng = await grab('#exWobble', 'j');
  await p.selectOption('#exLayersMode', 'flat');
  out.clips = await grab('#exClips', 'k');
  out.frames = await grab('#exFrames2', 'l');
  console.log(JSON.stringify({ errs, out }, null, 1));
  await b.close();
})();
