// usage: node render.js <html> <outdir> [panel numbers...]
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [html, out, ...which] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage();
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.route(/^https?:/, r => r.abort()); await p.goto('file://' + require('./html.js')(html));
  await p.waitForFunction(() => window.BalloonScenes);
  const nums = which.length ? which.map(Number) : await p.evaluate(() => window.BalloonScenes.PANELS.filter(x => !x.grid).map(x => x.n));
  for (const n of nums) {
    const data = await p.evaluate(([n, txt]) => {
      const S = window.BalloonScenes, c = document.createElement('canvas'); c.width = S.W; c.height = S.H;
      if (txt) S.setText(true); S.render(c.getContext("2d"), n, 0); if (txt) S.setText(false); return c.toDataURL("image/png");
    }, [n, !!process.env.TXT]);
    fs.writeFileSync(path.join(out, 'p' + String(n).padStart(3, '0') + '.png'), Buffer.from(data.split(',')[1], 'base64'));
  }
  await b.close();
  console.log('rendered', nums.length);
})();
