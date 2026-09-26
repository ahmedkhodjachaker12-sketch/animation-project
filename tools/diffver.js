const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
async function shots(b, file) {
  const p = await b.newPage(); await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + require('./html.js')(file)); await p.waitForFunction(() => window.BalloonScenes);
  const r = await p.evaluate(() => { const S = window.BalloonScenes, o = {}; S.setText(true); S.PANELS.forEach(x => { const c = document.createElement('canvas'); c.width = 480; c.height = 270; S.render(c.getContext('2d'), x.n, 0, { scale: 0.25 }); const d = c.getContext('2d').getImageData(0, 0, 480, 270).data; let h = []; for (let i = 0; i < d.length; i += 4 * 7) h.push(d[i], d[i + 1], d[i + 2]); o[x.n] = h; }); return o; });
  await p.close(); return r;
}
(async () => {
  const b = await chromium.launch();
  const a = await shots(b, process.argv[2]), c = await shots(b, process.argv[3]);
  const ch = [];
  Object.keys(c).forEach(n => { const x = a[n], y = c[n]; if (!x) { ch.push(+n); return; } let d = 0; for (let i = 0; i < y.length; i++) if (Math.abs(x[i] - y[i]) > 24) d++; if (d > 20) ch.push(+n); });
  console.log(JSON.stringify(ch));
  await b.close();
})();
