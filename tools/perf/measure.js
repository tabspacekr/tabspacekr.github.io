// 첫 방문 체감 지표 측정. 느린 4G + CPU 4배, 새 컨텍스트(빈 캐시), N회 중앙값.
// 사용: node tools/perf/measure.js <url> [mobile|desktop] [runs] [--no-throttle] [--json out.json]
const fs = require('fs');
const { launch, PROFILES, throttle } = require('./browser');

const args = process.argv.slice(2);
const url = args[0];
const profile = args[1] || 'mobile';
const runs = +(args[2] || 3);
const noThrottle = args.includes('--no-throttle');
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;

const INIT = `(() => {
  const M = window.__perf = { fcp: null, lcp: null, lcpEl: '', cls: 0, hero: null };
  new PerformanceObserver(l => l.getEntries().forEach(e => { if (e.name === 'first-contentful-paint') M.fcp = e.startTime; })).observe({ type: 'paint', buffered: true });
  new PerformanceObserver(l => l.getEntries().forEach(e => { M.lcp = e.startTime; M.lcpEl = e.element ? e.element.tagName + ' ' + (e.element.textContent || e.url || '').trim().slice(0, 30) : e.url; })).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) M.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
  const tick = () => {
    const h = document.querySelector('section h1');
    if (h && parseFloat(getComputedStyle(h).opacity) >= 0.99) { M.hero = performance.now(); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();`;

const median = a => { const s = a.filter(x => x != null).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };

(async () => {
  const browser = await launch();
  const results = [];
  for (let i = 0; i < runs; i++) {
    const ctx = await browser.newContext(PROFILES[profile]);
    await ctx.addInitScript(INIT);
    // 측정 트래픽이 실제 GA 속성에 page_view로 쌓이지 않게 수집 엔드포인트만 차단한다(gtag.js 다운로드는 그대로 측정).
    await ctx.route(/google-analytics\.com\/g\/collect|googletagmanager\.com\/.*collect/, r => r.abort());
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await throttle(cdp, !noThrottle);
    const reqs = new Map();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e).slice(0, 160)));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
    cdp.on('Network.requestWillBeSent', e => reqs.set(e.requestId, { url: e.request.url }));
    cdp.on('Network.responseReceived', e => { const r = reqs.get(e.requestId); if (r) r.status = e.response.status; });
    cdp.on('Network.loadingFinished', e => { const r = reqs.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
    cdp.on('Network.loadingFailed', e => { const r = reqs.get(e.requestId); if (r) r.failed = e.errorText; });
    await page.goto(url, { waitUntil: 'load', timeout: 180000 });
    await page.waitForTimeout(3000);
    const m = await page.evaluate(() => {
      const n = performance.getEntriesByType('navigation')[0];
      const P = window.__perf;
      return { hero: P.hero == null ? null : Math.max(P.hero, P.fcp || 0), fcp: P.fcp, lcp: P.lcp, lcpEl: P.lcpEl, cls: P.cls,
        dcl: n.domContentLoadedEventStart, load: n.loadEventStart, layoutWidth: innerWidth };
    });
    const list = [...reqs.values()].filter(r => !r.url.startsWith('data:'));
    const origin = new URL(url).origin;
    const r = { ...m, requests: list.length, bytes: list.reduce((s, x) => s + (x.bytes || 0), 0),
      thirdPartyBytes: list.filter(x => !x.url.startsWith(origin)).reduce((s, x) => s + (x.bytes || 0), 0),
      thirdPartyOrigins: [...new Set(list.filter(x => !x.url.startsWith(origin)).map(x => new URL(x.url).origin))],
      failed: list.filter(x => (x.failed && !/collect/.test(x.url)) || x.status >= 400).map(x => `${x.status || x.failed} ${x.url}`), errors };
    results.push(r);
    console.error(`run ${i + 1}: hero ${Math.round(r.hero)}ms FCP ${Math.round(r.fcp)} LCP ${Math.round(r.lcp)} DCL ${Math.round(r.dcl)} ${Math.round(r.bytes / 1024)}KB/${r.requests}req CLS ${r.cls.toFixed(3)}`);
    await ctx.close();
  }
  await browser.close();
  const pick = k => Math.round(median(results.map(r => r[k])));
  const summary = { url, profile, throttled: !noThrottle, runs,
    heroVisibleMs: pick('hero'), fcpMs: pick('fcp'), lcpMs: pick('lcp'), dclMs: pick('dcl'), loadMs: pick('load'),
    cls: +median(results.map(r => r.cls)).toFixed(3), kb: Math.round(median(results.map(r => r.bytes)) / 1024),
    thirdPartyKb: Math.round(median(results.map(r => r.thirdPartyBytes)) / 1024), requests: median(results.map(r => r.requests)),
    lcpElement: results[0].lcpEl, layoutWidth: Math.max(...results.map(r => r.layoutWidth)),
    thirdPartyOrigins: results[0].thirdPartyOrigins, failed: [...new Set(results.flatMap(r => r.failed))], errors: [...new Set(results.flatMap(r => r.errors))] };
  console.log(JSON.stringify(summary, null, 2));
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ summary, results }, null, 2));
})();
