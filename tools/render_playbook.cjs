// Render playbook/index.html to playbook/HCM_Playbook.pdf with Playwright (Chromium).
// Pages that overflow get a tighter type setting; any page still overflowing is reported.
//   python3 tools/build_playbook.py && node tools/render_playbook.cjs
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node-tools/node_modules/playwright'); }
(async () => {
  const root = path.resolve(__dirname, '..');
  const b = await pw.chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.join(root, 'playbook', 'index.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))));
  const over = () => p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => {
    const foot = pg.querySelector('.foot'); const limit = foot ? foot.getBoundingClientRect().top - 4 : pg.getBoundingClientRect().bottom;
    const kids = [...pg.children].filter(k => !k.matches('.run,.foot,.mark'));
    const bottom = Math.max(...kids.map(k => k.getBoundingClientRect().bottom));
    return bottom > limit ? i : -1; }).filter(i => i >= 0));
  for (const cls of ['tight', 'tighter']) {
    const o = await over(); if (!o.length) break;
    await p.evaluate(([o, cls]) => { const pgs = document.querySelectorAll('.page'); o.forEach(i => pgs[i].classList.add(cls)); }, [o, cls]);
  }
  const still = await over();
  await p.emulateMedia({ media: 'print' });
  await p.pdf({ path: path.join(root, 'playbook', 'HCM_Playbook.pdf'), width: '8.5in', height: '11in', printBackground: true, preferCSSPageSize: true });
  const n = await p.evaluate(() => document.querySelectorAll('.page').length);
  console.log(`rendered ${n} pages` + (still.length ? `; still overflowing: ${still.map(i => i + 1).join(', ')}` : '; no overflow'));
  await b.close();
})();
