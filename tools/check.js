const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + require('./html.js')(process.argv[2]));
  await p.waitForFunction(() => window.BalloonScenes);
  const r = await p.evaluate(() => {
    const S = window.BalloonScenes, bad = [];
    [false, true].forEach(t => { S.setText(t); S.setBarName(!t); S.PANELS.forEach(x => [0, 1, 2].forEach(b => { try { const c = document.createElement('canvas'); c.width = S.W; c.height = S.H; S.render(c.getContext('2d'), x.n, b); } catch (e) { bad.push(x.n + '/' + b + ': ' + e.message); } })); }); S.setText(false); S.setBarName(true);
    return { panels: S.PANELS.length, bad };
  });
  // drive the player UI: step through every panel with Next, then play briefly
  for (let i = 0; i < r.panels; i++) await p.click('#next');
  await p.click('#optText'); await p.click('#optName'); await p.click('#restart'); await p.click('#play'); await p.waitForTimeout(3000); await p.click('#play');
  const count = await p.textContent('#count');
  console.log(JSON.stringify({ ...r, errs, count }));
  await b.close();
})();
