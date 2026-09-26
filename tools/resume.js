const { chromium } = require('/opt/node22/lib/node_modules/playwright');
require('fs').mkdirSync('exp', { recursive: true });
const path = require('path');
/* an in-memory folder that behaves like the File System Access API, with ways to make saves fail */
const FAKE = () => {
  const FAIL = window.__fail = { always: null, times: {} };
  function mkFile(name) { return { kind: 'file', name, data: new Blob([]),
    async getFile() { const f = this.data; return Object.assign(f, { name }); },
    async createWritable() {
      const self = this; let parts = [];
      if (FAIL.always === name) throw new DOMException('locked', 'NoModificationAllowedError');
      if (FAIL.times[name] > 0) { FAIL.times[name]--; throw new DOMException('busy', 'InvalidStateError'); }
      return { async write(d) { parts.push(d); }, async close() { self.data = new Blob(parts); }, async abort() {} };
    } }; }
  function mkDir(name) { const m = new Map(); return { kind: 'directory', name, m,
    async getDirectoryHandle(n, o) { let h = m.get(n); if (!h) { if (!(o && o.create)) throw new DOMException('nf', 'NotFoundError'); h = mkDir(n); m.set(n, h); } return h; },
    async getFileHandle(n, o) { let h = m.get(n); if (!h) { if (!(o && o.create)) throw new DOMException('nf', 'NotFoundError'); h = mkFile(n); m.set(n, h); } return h; },
    async *values() { for (const v of m.values()) yield v; } }; }
  window.__root = mkDir('Firsts export');
  window.showDirectoryPicker = async () => window.__root;
};
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/^https?:/, r => r.abort());
  await p.addInitScript(FAKE);
  await p.goto('file://' + require('./html.js')(process.argv[2]));
  await p.waitForFunction(() => window.FirstsEditor);
  await p.evaluate(() => { window.showSaveFilePicker = undefined; });
  await p.click('#editor summary');
  await p.selectOption('#exWhat', 'range'); await p.fill('#exFrom', '41'); await p.fill('#exTo', '42');
  const done = () => p.waitForFunction(() => !document.querySelector('#exMp4').disabled, null, { timeout: 600000 });
  const state = () => p.evaluate(() => { const d = window.__root.m.get('frames'); if (!d) return null; const names = [...d.m.keys()].sort(); const sizes = [...d.m.values()].map(f => f.data.size); return { n: names.length, first: names[0], last: names[names.length - 1], small: sizes.filter(s => s < 1000).length }; });
  const out = {};
  const total = await p.evaluate(() => window.FirstsEditor.framesOf(window.FirstsEditor.chosen()));
  out.total = total;
  // 1) a save that fails twice then works (retried), and one that never works (stops)
  await p.evaluate(() => { window.__fail.times['firsts_00010.png'] = 2; window.__fail.always = 'firsts_00060.png'; });
  await p.click('#exFrames2'); await done();
  out.run1 = [await p.textContent('#exMsg'), await state()];
  // 2) the lock goes away; pick the same folder: it should carry on from 60
  await p.evaluate(() => { window.__fail.always = null; });
  await p.click('#exFrames2'); await done();
  out.run2 = [await p.textContent('#exMsg'), await state()];
  // 3) run again with nothing changed: nothing to do
  await p.click('#exFrames2'); await done();
  out.run3 = await p.textContent('#exMsg');
  // 4) change panel 42's wobble: only panel 42's frames are redone
  await p.evaluate(() => { window.FirstsEditor.SET[42].wobble = 'all'; });
  await p.click('#exFrames2'); await done();
  out.run4 = await p.textContent('#exMsg');
  // 5) an old folder with no firsts-export.json and an empty last file (like a real stop): carries on from the empty one
  await p.evaluate(async () => { window.__root.m.delete('firsts-export.json'); const d = window.__root.m.get('frames'); for (const k of [...d.m.keys()]) if (k > 'firsts_00120.png') d.m.delete(k); d.m.get('firsts_00120.png').data = new Blob([]); });
  await p.click('#exFrames2'); await done();
  out.run5 = [await p.textContent('#exMsg'), await state()];
  // 6) the user picks the "frames" folder itself
  await p.evaluate(async () => { const d = window.__root.m.get('frames'); for (const k of [...d.m.keys()]) if (k > 'firsts_00150.png') d.m.delete(k); window.__keep = window.__root; window.showDirectoryPicker = async () => d; });
  await p.click('#exFrames2'); await done();
  out.run6 = [await p.textContent('#exMsg'), await state(), await p.evaluate(() => [...window.__root.m.get('frames').m.keys()].filter(k => !k.startsWith('firsts_')))];
  // 7) cancel part way
  await p.evaluate(() => { window.showDirectoryPicker = async () => window.__keep; const d = window.__root.m.get('frames'); for (const k of [...d.m.keys()]) if (k > 'firsts_00030.png') d.m.delete(k); });
  await p.click('#exFrames2'); await p.waitForFunction(() => /Carrying on/.test(document.querySelector('#exMsg').textContent)); await p.click('#exCancel'); await done();
  out.run7 = [await p.textContent('#exMsg'), await state()];
  console.log(JSON.stringify({ errs, out }, null, 1));
  await b.close();
})();
