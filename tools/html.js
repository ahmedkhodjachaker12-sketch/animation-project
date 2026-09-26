// Chrome only renders a file as a page if it ends in .html, and the project file is called `test`:
// give the tools any path and they get a .html copy to open.
const fs = require('fs'), path = require('path'), os = require('os');
module.exports = function (f) {
  f = path.resolve(f || 'work.html');
  if (/\.html?$/i.test(f)) return f;
  const t = path.join(os.tmpdir(), 'firsts-' + path.basename(f) + '-' + process.pid + '-' + Math.random().toString(36).slice(2, 8) + '.html');
  fs.copyFileSync(f, t); return t;
};
