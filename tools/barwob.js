const { chromium } = require('/opt/node22/lib/node_modules/playwright');
require('fs').mkdirSync('exp', { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ acceptDownloads: true, viewport: { width: 1400, height: 1000 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + require('./html.js')(process.argv[2]));
  await p.waitForFunction(() => window.FirstsEditor);
  await p.evaluate(() => { window.showDirectoryPicker = undefined; });
  const before = await p.textContent('#barWobEx');
  const snaps = {};
  for (const n of [12, 17, 56]) {
    await p.evaluate(n => window.FirstsEditor.go(window.BalloonScenes.PANELS.findIndex(x => x.n === n)), n);
    await p.selectOption('#barWob', 'all');
    const a = await p.evaluate(() => document.getElementById('cv').toDataURL());
    await p.waitForTimeout(260);
    const c = await p.evaluate(() => document.getElementById('cv').toDataURL());
    snaps[n] = a !== c;
  }
  const after = await p.textContent('#barWobEx');
  const [d] = await Promise.all([p.waitForEvent('download', { timeout: 600000 }), p.click('#barWobEx')]);
  await d.saveAs('exp/barwob.zip');
  await p.waitForFunction(() => /Done/.test(document.getElementById('exMsg').textContent), null, { timeout: 600000 });
  console.log(JSON.stringify({ errs, before, after, pausedWobbleMoves: snaps, msg: await p.textContent('#exMsg') }));
  await b.close();
})();
