// 전 요소 computed style 비교 (CSS 퍼지 검증, 전략 문서 C2).
// 같은 페이지를 두 번 연다: 한 번은 빌드된 CSS 그대로, 한 번은 --css 로 준 파일(예: 퍼지 전 합본)로 바꿔서.
// 사용: node tools/perf/styles.js <url> --css <unpurged.css>
const fs = require('fs');
const { launch, PROFILES } = require('./browser');
const url = process.argv[2];
const alt = process.argv[process.argv.indexOf('--css') + 1];

const PROPS = ['display', 'position', 'visibility', 'opacity', 'color', 'background-color', 'background-image', 'font-family', 'font-size',
  'font-weight', 'line-height', 'letter-spacing', 'text-align', 'text-transform', 'margin-top', 'margin-bottom', 'margin-left', 'margin-right',
  'padding-top', 'padding-bottom', 'padding-left', 'padding-right', 'border-top-width', 'border-top-color', 'border-radius', 'box-shadow',
  'width', 'height', 'flex-direction', 'justify-content', 'align-items', 'gap', 'z-index', 'overflow', 'filter', 'transform', 'content', 'list-style-type'];

async function snapshot(browser, profile, swap, state) {
  const ctx = await browser.newContext({ ...PROFILES[profile], reducedMotion: 'reduce' });
  await ctx.route(/google-analytics|googletagmanager/, r => r.abort());
  if (swap) await ctx.route(/assets\/dist\/site\.[0-9a-f]+\.css/, r => r.fulfill({ contentType: 'text/css', body: fs.readFileSync(swap) }));
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load' });
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 700) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(80); }
  await page.waitForTimeout(1500);
  if (state === 'offcanvas') await page.$eval('.hamburger', el => el.click());
  if (state === 'sticky') await page.evaluate(() => scrollTo(0, 1500));
  if (state === 'reveal') { await page.locator('.contact-reveal-btn').scrollIntoViewIfNeeded(); await page.click('.contact-reveal-btn'); }
  if (state === 'top') await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(700);
  const data = await page.evaluate((props) => {
    const out = {};
    const path = el => { const p = []; for (let e = el; e && e !== document.documentElement; e = e.parentElement) { let i = 0, s = e; while ((s = s.previousElementSibling)) i++; p.unshift(e.tagName + i); } return p.join('/'); };
    const skip = el => el.closest('#LiveDemo .cyber-bg-dark-surface, #hero-particles, #chatbot-demo-messages, .energy-feature-list, #energy-feature-icon, canvas, script, style, head, .owl-stage');
    for (const el of document.querySelectorAll('body *')) {
      if (skip(el)) continue;
      const k = path(el);
      for (const pseudo of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, pseudo);
        if (pseudo && (cs.content === 'none' || cs.content === 'normal')) continue;
        out[k + (pseudo || '')] = props.map(p => cs.getPropertyValue(p)).join('|');
      }
    }
    return out;
  }, PROPS);
  await ctx.close();
  return data;
}

(async () => {
  const browser = await launch();
  let diffs = 0;
  for (const profile of ['mobile', 'desktop']) {
    for (const state of profile === 'mobile' ? ['top', 'offcanvas', 'sticky', 'reveal'] : ['top', 'sticky', 'reveal']) {
      const a = await snapshot(browser, profile, null, state);
      const b = await snapshot(browser, profile, alt, state);
      const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
      const d = [];
      for (const k of keys) if (a[k] !== b[k]) {
        const av = (a[k] || '').split('|'), bv = (b[k] || '').split('|');
        const props = PROPS.filter((p, i) => av[i] !== bv[i]).map(p => `${p}: ${av[PROPS.indexOf(p)]} → ${bv[PROPS.indexOf(p)]}`);
        d.push(`${k}  ${props.join('; ') || (a[k] ? 'only in built' : 'only in reference')}`);
      }
      console.log(`[${profile}/${state}] ${Object.keys(a).length} elements, ${d.length} differ`);
      const summary = {};
      d.forEach(x => (x.split('  ')[1] || '').split('; ').forEach(pv => { const k = pv.replace(/[-\d.]+px/g, 'Npx'); summary[k] = (summary[k] || 0) + 1; }));
      Object.entries(summary).sort((x, y) => y[1] - x[1]).slice(0, 12).forEach(([k, n]) => console.log(`   ${n}x ${k}`));
      d.filter(x => !/width: [\d.]+px → [\d.]+px$/.test(x)).slice(0, 10).forEach(x => console.log('   * ' + x));
      diffs += d.length;
    }
  }
  await browser.close();
  process.exit(diffs ? 1 : 0);
})();
