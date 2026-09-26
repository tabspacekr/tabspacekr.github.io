// 로드 후 가만히 있을 때의 메인 스레드 사용량 (CPU 4배, 모바일). 사용: node tools/perf/idle.js <url>
const { launch, PROFILES } = require('./browser');
(async () => {
  const b = await launch();
  for (const profile of ['mobile', 'desktop']) {
    const ctx = await b.newContext(PROFILES[profile]);
    await ctx.route(/google-analytics\.com\/g\/collect/, r => r.abort());
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await page.goto(process.argv[2], { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    if (process.argv[3]) { await page.evaluate(sel => document.querySelector(sel).scrollIntoView(), process.argv[3]); await page.waitForTimeout(1500); }
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await cdp.send('Performance.enable');
    const m = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
    const a = await m(); await page.waitForTimeout(10000); const z = await m();
    const sec = z.Timestamp - a.Timestamp;
    const busy = (z.TaskDuration - a.TaskDuration) / sec;
    console.log(`${profile}: main thread busy ${(busy * 100).toFixed(1)}% while idle at ${process.argv[3] || 'top of page'} (${((z.LayoutCount - a.LayoutCount) / sec).toFixed(1)} layouts/s)`);
    await ctx.close();
  }
  await b.close();
})();
