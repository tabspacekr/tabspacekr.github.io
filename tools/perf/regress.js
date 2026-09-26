// 홈페이지 기능 회귀 검사(모바일·데스크톱). 실패 항목이 있으면 종료 코드 1.
// 사용: node tools/perf/regress.js <url>
const { launch, PROFILES } = require('./browser');
const url = process.argv[2] || 'https://127.0.0.1:8443/';

async function check(browser, profile) {
  const out = [];
  const ok = (name, pass, detail = '') => out.push({ profile, name, pass: !!pass, detail });
  const ctx = await browser.newContext(PROFILES[profile]);
  await ctx.route(/google-analytics\.com\/g\/collect/, r => r.abort());
  const page = await ctx.newPage();
  const errors = [], bad = [], fontReqs = [];
  page.on('request', r => { if (/Unicons\.woff2?$/.test(r.url())) fontReqs.push(r.url()); });
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error' && !/collect/.test(m.location().url || '')) errors.push(m.text().slice(0, 200) + ' @ ' + (m.location().url || '')); });
  page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
  page.on('requestfailed', r => { if (!/collect/.test(r.url())) bad.push(`${r.failure().errorText} ${r.url()}`); });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const hero = await page.evaluate(() => {
    const h = document.querySelector('section h1'); const img = document.querySelector('section img[alt="IoT 3D Illustration"]');
    const vis = el => { let e = el; while (e) { const s = getComputedStyle(e); if (s.opacity === '0' || s.visibility === 'hidden' || s.display === 'none') return false; e = e.parentElement; } return true; };
    return { h1: h && vis(h), img: img && vis(img) };
  });
  ok('히어로 문구 표시', hero.h1);
  if (profile === 'desktop') ok('히어로 그림 표시', hero.img);
  ok('레이아웃 폭 = 뷰포트 폭', await page.evaluate(() => innerWidth) === PROFILES[profile].viewport.width, String(await page.evaluate(() => innerWidth)));

  const icons = await page.evaluate(() => [...document.querySelectorAll('#BusinessAreas .cyber-card img, #Features .icon-svg, #Contact .icon-svg')]
    .map(el => ({ ok: getComputedStyle(el).visibility !== 'hidden' && el.getBoundingClientRect().width > 0 })));
  ok('사업분야·특징·연락처 아이콘 표시', icons.length >= 14 && icons.every(i => i.ok), `${icons.filter(i => i.ok).length}/${icons.length}`);
  ok('아이콘 폰트(Unicons) 로드', await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some(f => f.family.replace(/"/g, '') === 'Unicons' && f.status === 'loaded'); }));

  if (profile === 'mobile') {
    await page.$eval('.hamburger', el => el.click());
    await page.waitForTimeout(400);
    ok('모바일 메뉴 열기', await page.evaluate(() => document.querySelector('.offcanvas-nav').classList.contains('open')));
    await page.$eval('.offcanvas-nav-close', el => el.click());
    await page.waitForTimeout(400);
    ok('모바일 메뉴 닫기', await page.evaluate(() => !document.querySelector('.offcanvas-nav').classList.contains('open')));
  }

  // 전체를 천천히 스크롤해 지연 초기화되는 섹션을 깨운다
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 500) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(120); }
  await page.evaluate(() => scrollTo(0, 1200));
  await page.waitForTimeout(600);
  ok('스티키 헤더', await page.evaluate(() => !!document.querySelector('.navbar.banner--stick')));
  ok('맨 위로 버튼 활성', await page.evaluate(() => document.querySelector('.progress-wrap').classList.contains('active-progress')));

  await page.locator('#AISolutions').scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);
  ok('챗봇 데모 메시지', await page.evaluate(() => document.querySelector('#chatbot-demo-messages').children.length > 0));
  await page.locator('.energy-feature-list').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  ok('에너지 항목 하이라이트', await page.evaluate(() => !!document.querySelector('.energy-feature-list li.highlight')));
  await page.locator('#LiveDemo').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const charts = await page.evaluate(() => ['energy-chart', 'device-status-chart', 'environment-chart', 'project-stats-chart']
    .filter(id => window.Chart && Chart.getChart(document.getElementById(id))).length);
  ok('차트 4개 생성', charts === 4, `${charts}/4`);

  await page.locator('#Projects').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  const items = await page.evaluate(() => document.querySelectorAll('#project-gallery .owl-item:not(.cloned)').length);
  ok('프로젝트 캐러셀 37개', items === 37, String(items));
  const imgOk = await page.evaluate(() => { const i = document.querySelector('#project-gallery .owl-item.active img'); return !!i && i.complete && i.naturalWidth > 0; });
  ok('캐러셀 활성 사진 로드', imgOk);
  const before = await page.evaluate(() => document.querySelector('#project-gallery .owl-stage').style.transform);
  await page.$eval('#project-gallery .owl-next', el => el.click()).catch(() => {});
  await page.waitForTimeout(900);
  ok('캐러셀 다음 버튼', before !== await page.evaluate(() => document.querySelector('#project-gallery .owl-stage').style.transform));
  await page.$eval('#project-filters [data-filter="commercial"]', el => el.click()).catch(() => {});
  await page.waitForTimeout(1200);
  const expected = await page.evaluate(() => window.dataLoaderInstance.getProjectsByCategory('commercial').length);
  const shown = await page.evaluate(() => document.querySelectorAll('#project-gallery .owl-item:not(.cloned)').length);
  ok('프로젝트 필터', shown === expected && expected > 0, `${shown}/${expected}`);

  await page.locator('#TechInsights').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  ok('블로그 카드', await page.evaluate(() => document.querySelectorAll('#blog-container article').length > 0));

  await page.locator('.contact-reveal-btn').scrollIntoViewIfNeeded();
  const hiddenBefore = await page.evaluate(() => document.querySelector('.contact-reveal-out').hidden && getComputedStyle(document.querySelector('.contact-reveal-out')).display === 'none');
  await page.click('.contact-reveal-btn', { timeout: 5000 }).catch(e => errors.push('reveal click: ' + e.message.split('\n')[0]));
  await page.waitForTimeout(300);
  ok('이메일 확인하기 버튼', hiddenBefore && await page.evaluate(() => /^mailto:/.test((document.querySelector('.contact-reveal-out a') || {}).href || '')));

  // 서브셋에 빠진 아이콘이 있으면 원본 122KB 가 조용히 추가로 받아진다 (전략 문서 F2)
  if (await page.evaluate(() => !!document.querySelector('link[href*="assets/dist/site."]'))) {
    ok('원본 Unicons.woff2 요청 없음', fontReqs.length === 0, fontReqs.join(' | '));
  }
  ok('페이지 오류 없음', errors.length === 0, errors.join(' | '));
  ok('실패 요청 없음', bad.length === 0, bad.join(' | '));
  await ctx.close();
  return out;
}

(async () => {
  const browser = await launch();
  const results = [...await check(browser, 'mobile'), ...await check(browser, 'desktop')];
  await browser.close();
  for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'} [${r.profile}] ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
  const failed = results.filter(r => !r.pass).length;
  console.log(failed ? `${failed} failed` : 'all passed');
  process.exit(failed ? 1 : 0);
})();
