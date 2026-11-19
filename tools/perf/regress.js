// 홈페이지 기능 회귀 검사(모바일·데스크톱, 메뉴별 페이지). 실패 항목이 있으면 종료 코드 1.
// 사용: node tools/perf/regress.js <기준 url, 예: https://127.0.0.1:8443/>
const fs = require('fs');
const path = require('path');
const { launch, PROFILES } = require('./browser');
const base = (process.argv[2] || 'https://127.0.0.1:8443/').replace(/\/?$/, '/');
const ROOT = path.join(__dirname, '..', '..');
const projects = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8')).projects;
const posts = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'blog.json'), 'utf8')).posts;
const PAGES = ['index', 'about', 'technology', 'business', 'solutions', 'product-development', 'reverse-engineering', 'projects', 'live-demo', 'insights', 'contact', 'email-policy'];

async function check(browser, profile) {
  const out = [];
  const ok = (name, pass, detail = '') => out.push({ profile, name, pass: !!pass, detail });
  const ctx = await browser.newContext(PROFILES[profile]);
  await ctx.route(/google-analytics\.com\/g\/collect/, r => r.abort());
  const errors = [], bad = [], uniconsReqs = [];
  const watch = (page) => {
    page.on('request', r => { if (/Unicons\.woff2?$/.test(r.url())) uniconsReqs.push(r.url()); });
    page.on('pageerror', e => errors.push(`${page.url()} ${String(e).slice(0, 200)}`));
    page.on('console', m => { if (m.type() === 'error' && !/collect/.test(m.location().url || '')) errors.push(m.text().slice(0, 200) + ' @ ' + (m.location().url || '')); });
    page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
    // ERR_ABORTED 는 페이지를 떠나며 끊긴 요청(예전 주소 이동 검사)이라 실패로 보지 않는다
    page.on('requestfailed', r => { if (!/collect/.test(r.url()) && r.failure().errorText !== 'net::ERR_ABORTED') bad.push(`${r.failure().errorText} ${r.url()}`); });
  };
  const page = await ctx.newPage();
  watch(page);
  const open = async (name, hash = '') => {
    await page.goto(`${base}${name}.html${hash}`, { waitUntil: 'load' });
    await page.waitForTimeout(400);
  };
  const scrollThrough = async () => {
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 500) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(100); }
  };
  const visible = (sel) => page.evaluate(s => {
    const el = document.querySelector(s); if (!el) return false;
    for (let e = el; e; e = e.parentElement) { const st = getComputedStyle(e); if (st.opacity === '0' || st.visibility === 'hidden' || st.display === 'none') return false; }
    return el.getBoundingClientRect().width > 0;
  }, sel);

  // 1) 모든 메뉴 페이지: 제목 표시·가로 넘침 없음·공용 머리/푸터·폰트
  for (const name of PAGES) {
    await open(name);
    const layoutOk = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    ok(`${name}: 제목 표시`, await visible('main h1'));
    ok(`${name}: 가로 넘침 없음`, layoutOk);
    ok(`${name}: 공용 머리·푸터`, await page.evaluate(() => !!document.querySelector('.site-header .gnb-bar') && !!document.querySelector('.site-footer .email-collect-refusal')));
    if (name !== 'index') ok(`${name}: 현재 메뉴 표시`, await page.evaluate(n => !!document.querySelector(`.allmenu a[aria-current="page"][href="./${n}.html"]`), name));
  }
  ok('에이투지체 로드', await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].some(f => f.family.replace(/"/g, '') === 'ATOZ' && f.status === 'loaded'); }));

  // 2) 예전 원페이지 주소(#Projects)는 새 페이지로 옮겨진다
  await page.goto(`${base}#Projects`, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  ok('예전 구역 주소 이동(#Projects)', /projects\.html$/.test(page.url()), page.url());

  // 3) 내비게이션
  await open('index');
  if (profile === 'desktop') {
    await page.hover('.gnb > li:nth-child(2) > .gnb-main');
    await page.waitForTimeout(300);
    ok('펼침 메뉴 열림', await page.evaluate(() => document.querySelector('.gnb-bar').classList.contains('is-mega')) && await visible('.gnb > li:nth-child(4) .gnb-sub a'));
    await page.mouse.move(5, 800);
    await page.waitForTimeout(400);
    ok('펼침 메뉴 닫힘', await page.evaluate(() => !document.querySelector('.gnb-bar').classList.contains('is-mega')));
  } else {
    ok('좁은 화면은 메인 메뉴 대신 ☰', !(await visible('.gnb')) && await visible('.allmenu-btn'));
  }
  await page.click('.allmenu-btn');
  await page.waitForTimeout(200);
  ok('전체 메뉴 열기', await page.evaluate(() => !document.getElementById('allmenu').hidden) && await visible('#allmenu a[href="./contact.html"]'));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok('전체 메뉴 Esc 로 닫기', await page.evaluate(() => document.getElementById('allmenu').hidden));

  // 4) 테마 전환과 유지
  await page.click('[data-theme-set="dark"]');
  ok('다크 테마 전환', await page.evaluate(() => document.documentElement.dataset.theme === 'dark'));
  await page.reload({ waitUntil: 'load' });
  ok('테마 선택 유지', await page.evaluate(() => document.documentElement.dataset.theme === 'dark'));
  await page.click('[data-theme-set="light"]');

  // 5) 맨 위로 버튼
  await page.evaluate(() => scrollTo(0, 1500));
  await page.waitForTimeout(300);
  ok('맨 위로 버튼 활성', await page.evaluate(() => document.querySelector('.to-top').classList.contains('on')));

  // 6) AI 솔루션: 챗봇·에너지·막대 차트
  await open('solutions');
  await page.locator('#chatbot-demo-messages').scrollIntoViewIfNeeded();
  await page.waitForTimeout(3000);
  ok('챗봇 데모 메시지', await page.evaluate(() => document.querySelector('#chatbot-demo-messages').children.length > 0));
  await page.locator('.energy-feature-list').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  ok('에너지 항목 하이라이트', await page.evaluate(() => !!document.querySelector('.energy-feature-list li.highlight')));
  await page.locator('#project-stats-chart').scrollIntoViewIfNeeded();
  await page.waitForTimeout(2000);
  ok('비즈니스 인사이트 차트', await page.evaluate(() => !!(window.Chart && Chart.getChart(document.getElementById('project-stats-chart')))));

  // 7) 라이브 데모: 차트 3개 + 테마 전환 후 다시 칠하기
  await open('live-demo');
  await scrollThrough();
  await page.waitForTimeout(2000);
  const charts = await page.evaluate(() => ['energy-chart', 'device-status-chart', 'environment-chart'].filter(id => window.Chart && Chart.getChart(document.getElementById(id))).length);
  ok('라이브 차트 3개 생성', charts === 3, `${charts}/3`);
  await page.click('[data-theme-set="dark"]');
  await page.waitForTimeout(300);
  ok('다크 전환 시 차트 색 갱신', await page.evaluate(() => Chart.getChart(document.getElementById('energy-chart')).data.datasets[0].borderColor.toLowerCase() === getComputedStyle(document.documentElement).getPropertyValue('--chart-1').trim().toLowerCase()));
  await page.click('[data-theme-set="light"]');

  // 8) 프로젝트: 목록·사진·필터·주소로 넘긴 분류
  await open('projects');
  ok(`프로젝트 ${projects.length}개`, await page.evaluate(() => document.querySelectorAll('#project-list > li').length) === projects.length);
  ok('첫 사진 로드', await page.evaluate(() => { const i = document.querySelector('#project-list img'); return !!i && i.complete && i.naturalWidth > 0; }));
  await page.click('[data-filter-for="project-list"] [data-filter="commercial"]');
  const want = projects.filter(p => p.category === 'commercial').length;
  const shown = await page.evaluate(() => document.querySelectorAll('#project-list > li:not([hidden])').length);
  const count = await page.evaluate(() => document.querySelector('[data-count-for="project-list"]').textContent);
  ok('프로젝트 필터', shown === want && want > 0 && count === String(want), `${shown}/${want}, 표시 ${count}`);
  await open('projects', '#unmanned');
  const unmanned = projects.filter(p => p.category === 'unmanned').length;
  ok('주소로 넘긴 분류(#unmanned)', await page.evaluate(() => document.querySelectorAll('#project-list > li:not([hidden])').length) === unmanned);

  // 9) 기술 인사이트
  await open('insights');
  ok(`인사이트 ${posts.length}건`, await page.evaluate(() => document.querySelectorAll('#post-list > li').length) === posts.length);
  await page.click('[data-filter-for="post-list"] [data-filter="ai"]');
  ok('인사이트 필터', await page.evaluate(() => document.querySelectorAll('#post-list > li:not([hidden])').length) === posts.filter(p => p.category === 'ai').length);

  // 10) 문의: 이메일 확인하기
  await open('contact');
  const hiddenBefore = await page.evaluate(() => document.querySelector('.contact-reveal-out').hidden && getComputedStyle(document.querySelector('.contact-reveal-out')).display === 'none');
  ok('이메일 주소가 소스에 평문으로 없음', !/@tabspace|mailto:/i.test(await page.content()));
  await page.click('.contact-reveal-btn', { timeout: 5000 }).catch(e => errors.push('reveal click: ' + e.message.split('\n')[0]));
  await page.waitForTimeout(300);
  ok('이메일 확인하기 버튼', hiddenBefore && await page.evaluate(() => /^mailto:/.test((document.querySelector('.contact-reveal-out a') || {}).href || '')));

  // 11) 404 는 깊은 경로에서도 스타일을 받는다(<base href="/">)
  // (로컬 서버는 GitHub Pages 처럼 없는 주소에 404.html 을 내주지 않으므로 파일을 직접 연다)
  await open('404');
  ok('404 페이지 스타일', await page.evaluate(() => getComputedStyle(document.body).fontFamily.includes('ATOZ') && !!document.querySelector('base[href="/"]')));

  ok('원본 Unicons.woff2 요청 없음(인라인 서브셋 사용)', uniconsReqs.length === 0, uniconsReqs.join(' | '));
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
