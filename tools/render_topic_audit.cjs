// Render docs/audit/index.html to docs/HCM_Academy_Topic_Audit.pdf (landscape, page numbers in the footer).
//   python3 tools/build_topic_audit.py && node tools/render_topic_audit.cjs
const path = require('path');
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node-tools/node_modules/playwright'); }
(async () => {
  const root = path.resolve(__dirname, '..');
  const b = await pw.chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.join(root, 'docs', 'audit', 'index.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: path.join(root, 'docs', 'HCM_Academy_Topic_Audit.pdf'), printBackground: true, preferCSSPageSize: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;font:7px Arial,sans-serif;color:#5E5B55;padding:0 .55in;display:flex;justify-content:space-between"><span>HCM Academy topic audit &middot; V.01 draft &middot; Return to pcb@vanderbilt.edu</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>' });
  console.log('wrote docs/HCM_Academy_Topic_Audit.pdf'); await b.close();
})();
