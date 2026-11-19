// 메뉴별 페이지 생성 — _src/pages/*.html(본문) + 공용 골격(머리·메뉴·푸터) -> 저장소 루트의 *.html
//
// GitHub Pages 는 정적 파일만 내보내므로 공용 머리·푸터를 빌드 때 각 페이지에 넣어 커밋한다.
// 생성 결과에는 Jekyll 머리말(---)이 없으므로 Jekyll 은 Liquid 처리 없이 그대로 복사한다.
//
// 본문 파일 첫 줄: <!--page {"key":"about","title":"회사 개요","description":"…","lead":"…"}-->
// 본문 안 자리표시: {{icon:이름}}, {{projects}}, {{project-filters}}, {{project-total}},
//                   {{posts}}, {{post-filters}}, {{post-total}}, {{recent-projects}}, {{recent-posts}}
import fs from 'node:fs';
import path from 'node:path';

export const ORIGIN = 'https://www.tabspace.kr';
const GA_ID = 'G-TNGS7LHP2X';

// 메인 메뉴 묶음: [화면 키, 이름, 주소]. 바깥 주소는 새 창으로 연다.
export const GROUPS = [
  ['회사 소개', [['about', '회사 개요', 'about.html'], ['technology', '기술 역량', 'technology.html']]],
  ['사업 분야', [['business', '사업 분야', 'business.html'], ['solutions', 'AI 솔루션', 'solutions.html'], ['product-development', 'IoT 제품 개발', 'product-development.html'], ['reverse-engineering', '리버스 엔지니어링', 'reverse-engineering.html']]],
  ['구축 사례', [['projects', '프로젝트', 'projects.html'], ['live-demo', '라이브 데모', 'live-demo.html']]],
  ['고객 지원', [['insights', '기술 인사이트', 'insights.html'], ['contact', '문의하기', 'contact.html']]],
];
const EXTRA_GROUPS = [
  ['사이트 정책', [['email-policy', '이메일무단수집거부', 'email-policy.html']]],
  ['바로가기', [
    ['blog', '네이버 블로그', 'https://blog.naver.com/tabspacekr'],
    ['store', '네이버 스마트스토어', 'https://smartstore.naver.com/tabspace'],
    ['github', '깃허브 저장소', 'https://github.com/tabspacekr'],
  ]],
];

// 선 아이콘(24px, stroke=currentColor). 장식용이라 aria-hidden.
const ICONS = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  building: '<rect x="4" y="3" width="10" height="18" rx="1"/><path d="M14 9h6v12h-6"/><path d="M7 7h1M10 7h1M7 11h1M10 11h1M7 15h1M10 15h1M17 13h1M17 17h1"/>',
  chip: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
  store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9h16v2a3 3 0 0 1-5.3 1.9A3 3 0 0 1 12 14a3 3 0 0 1-2.7-1.1A3 3 0 0 1 4 11z"/><path d="M5 13.5V20h14v-6.5"/><path d="M10 20v-4h4v4"/>',
  leaf: '<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z"/><path d="M5 19l7-7"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
  chart: '<path d="M4 4v16h16"/><path d="M8 15l4-5 3 3 5-6"/>',
  pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
  wrench: '<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 6.7-6.7"/><path d="M14.7 6.3L13 4.6a4 4 0 0 0-5.4 5.4L3 14.6 6.4 18l4.6-4.6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  pin: '<path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  ext: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M8 7h7M8 11h5"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  code: '<path d="M8 8l-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  cloud: '<path d="M7 18a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 8.5a4.8 4.8 0 0 1-.5 9.5z"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0"/><path d="M5.5 12.5a10 10 0 0 1 13 0"/><path d="M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r=".8"/>',
  cube: '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
  server: '<rect x="4" y="4" width="16" height="7" rx="1.5"/><rect x="4" y="13" width="16" height="7" rx="1.5"/><path d="M8 7.5h.01M8 16.5h.01"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
  badge: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21l5-3 5 3-1.5-7"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>',
};
export const icon = (name, cls = 'ico') => {
  if (!ICONS[name]) throw new Error(`알 수 없는 아이콘: ${name}`);
  return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isExternal = (href) => /^https?:/.test(href);
const NEW_WIN = ' target="_blank" rel="noopener" title="새 창에서 열립니다"';
const newMark = (href) => (isExternal(href) ? ` ${icon('ext', 'ico ext')}<span class="sr-only">(새 창)</span>` : '');
const link = (href, label, current, extraAttr = '') =>
  `<a href="${isExternal(href) ? href : './' + href}"${isExternal(href) ? NEW_WIN : ''}${current ? ' aria-current="page"' : ''}${extraAttr}>${esc(label)}${newMark(href)}</a>`;

const groupOf = (key) => GROUPS.concat(EXTRA_GROUPS).find(([, items]) => items.some(([k]) => k === key));

/* ── 머리 ── */
function renderHeader(key) {
  const current = groupOf(key);
  const gnb = GROUPS.map(([name, items]) => {
    const isCur = current && current[0] === name;
    return `<li>
          <a class="gnb-main${isCur ? ' is-current' : ''}" href="./${items[0][2]}" aria-expanded="false">${esc(name)}</a>
          <ul class="gnb-sub">${items.map(([k, label, href]) => `<li>${link(href, label, k === key)}</li>`).join('')}</ul>
        </li>`;
  }).join('\n        ');

  const all = GROUPS.concat(EXTRA_GROUPS).map(([name, items]) => `<section>
            <h3>${esc(name)}</h3>
            <ul>${items.map(([k, label, href]) => `<li>${link(href, label, k === key)}</li>`).join('')}</ul>
          </section>`).join('\n          ');

  return `<a class="skip-link" href="#main">본문 바로가기</a>
  <div class="topline">
    <div class="inner">
      <p class="svc">탭스페이스는 AI와 IoT를 융합해 무인매장·상업시설·스마트빌딩 자동화 솔루션을 만드는 IoT 전문기업입니다.</p>
      <div class="theme-switch" role="group" aria-label="화면 테마">
        <button type="button" data-theme-set="auto" aria-pressed="true">자동</button>
        <button type="button" data-theme-set="light" aria-pressed="false">라이트</button>
        <button type="button" data-theme-set="dark" aria-pressed="false">다크</button>
      </div>
    </div>
  </div>
  <header class="site-header">
    <div class="inner branding">
      <a class="logo" href="./index.html"><span class="mark" role="img" aria-label="탭스페이스(tabspace)"></span><span class="tag">AI 시대의 IoT 자동화 솔루션</span></a>
      <ul class="util">
        <li>${link('https://blog.naver.com/tabspacekr', '네이버 블로그')}</li>
        <li>${link('https://smartstore.naver.com/tabspace', '스마트스토어')}</li>
        <li>${link('contact.html', '문의하기', key === 'contact')}</li>
      </ul>
    </div>
    <nav class="gnb-bar" aria-label="주 메뉴">
      <div class="inner">
        <ul class="gnb">
        ${gnb}
        </ul>
        <button type="button" class="allmenu-btn" aria-expanded="false" aria-controls="allmenu">${icon('menu')}<span class="sr-only">전체 메뉴 보기</span></button>
      </div>
    </nav>
    <div class="allmenu" id="allmenu" role="dialog" aria-modal="true" aria-labelledby="allmenuTitle" hidden>
      <div class="allmenu-dim"></div>
      <div class="allmenu-box">
        <div class="allmenu-hd"><h2 id="allmenuTitle">전체 메뉴</h2><button type="button" class="allmenu-x">${icon('close')}<span class="sr-only">전체 메뉴 닫기</span></button></div>
        <div class="allmenu-grid">
          ${all}
        </div>
      </div>
    </div>
  </header>`;
}

/* ── 하위 화면 머리(경로 + 묶음 탭) ── */
function renderSubhead(key, title) {
  const group = groupOf(key);
  if (!group) return '';
  const [name, items] = group;
  const tabs = items.length > 1
    ? `<nav class="subnav" aria-label="${esc(name)} 하위 메뉴"><div class="inner"><ul>${items.map(([k, label, href]) => `<li>${link(href, label, k === key)}</li>`).join('')}</ul></div></nav>`
    : '';
  return `<div class="subhead">
    <div class="inner">
      <ol class="crumb" aria-label="현재 위치">
        <li class="home"><a href="./index.html"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 8h-3v9h-5v-6h-2v6H6v-9H3z"/></svg>홈</a></li>
        <li><a href="./${items[0][2]}">${esc(name)}</a></li>
        <li aria-current="page">${esc(title)}</li>
      </ol>
    </div>
  </div>
  ${tabs}`;
}

/* ── 푸터 ── */
function renderFooter() {
  return `<nav class="foot-quick" aria-label="바로가기">
    <div class="inner">
      <ul>
        <li><a href="./contact.html">${icon('mail')}솔루션 도입 문의</a></li>
        <li><a href="./projects.html">${icon('grid')}구축 사례</a></li>
        <li><a href="https://blog.naver.com/tabspacekr"${NEW_WIN}>${icon('book')}네이버 블로그${newMark('https://')}</a></li>
        <li><a href="https://smartstore.naver.com/tabspace"${NEW_WIN}>${icon('bag')}스마트스토어${newMark('https://')}</a></li>
      </ul>
    </div>
  </nav>
  <footer class="site-footer">
    <div class="inner">
      <div class="foot-top">
        <div>
          <span class="foot-logo" role="img" aria-label="탭스페이스(tabspace)"></span>
          <address class="foot-info">
            <span>주식회사 탭스페이스</span><span>서울특별시 마포구 매봉산로 18, 405호</span><br>
            <span>대표번호 <a href="tel:050713997864">0507-1399-7864</a></span><span>사무실(주간) <a href="tel:07077805577">070-7780-5577</a></span><br>
            <span>통신판매업신고번호 제 2026-서울마포-0456 호</span>
          </address>
        </div>
        <div class="foot-links">
          <section>
            <h2>안내</h2>
            <ul>
              <li><a class="strong" href="./email-policy.html">이메일무단수집거부</a></li>
              <li><a href="./about.html#registrations">등록·인증 현황</a></li>
              <li><a href="./contact.html">문의하기</a></li>
            </ul>
          </section>
          <section>
            <h2>사이트 링크</h2>
            <ul>
              <li><a href="https://blog.naver.com/tabspacekr"${NEW_WIN}>탭스페이스 네이버 블로그${newMark('https://')}</a></li>
              <li><a href="https://smartstore.naver.com/tabspace"${NEW_WIN}>탭스페이스 네이버 스마트스토어${newMark('https://')}</a></li>
              <li><a href="https://github.com/tabspacekr"${NEW_WIN}>탭스페이스 깃허브 저장소${newMark('https://')}</a></li>
            </ul>
          </section>
        </div>
      </div>
      <div class="foot-bottom">
        <!-- 이메일 무단수집 거부 고지(정보통신망법 제50조의2): 법적 보호는 "수집을 거부하는 의사가 명시된" 홈페이지에서만 성립하므로 모든 페이지 본문에 상시 노출한다 -->
        <p class="email-collect-refusal">본 웹사이트에 게시된 이메일 주소가 전자우편 수집 프로그램이나 그 밖의 기술적 장치를 이용하여 무단으로 수집되는 것을 거부하며, 이를 위반 시 1년 이하의 징역 또는 1천만원 이하의 벌금에 처해질 수 있습니다. (정보통신망 이용촉진 및 정보보호 등에 관한 법률 제50조의2, 제74조)</p>
        <p class="copyright">© 2021-<span id="current-year"></span> TabSpace. All rights reserved.</p>
      </div>
    </div>
  </footer>
  <aside class="quickmenu" aria-label="빠른 메뉴">
    <ul class="quickmenu-list" id="quickmenuList">
      <li><a href="./contact.html">${icon('mail')}도입 문의</a></li>
      <li><a href="./projects.html">${icon('grid')}구축 사례</a></li>
      <li><a href="./live-demo.html">${icon('pulse')}라이브 데모</a></li>
      <li><a href="https://blog.naver.com/tabspacekr"${NEW_WIN}>${icon('book')}블로그<span class="sr-only">(새 창)</span></a></li>
    </ul>
    <button type="button" class="quickmenu-btn quickmenu-tog" aria-expanded="false" aria-controls="quickmenuList">${icon('grid')}<span class="sr-only">빠른 메뉴 펴기</span></button>
    <button type="button" class="quickmenu-btn to-top">${icon('up')}<span class="sr-only">맨 위로</span></button>
  </aside>`;
}

/* ── SEO: 공유 카드(OG·트위터), 구조화 데이터(JSON-LD) ── */
const ORG = {
  '@type': 'Organization',
  '@id': `${ORIGIN}/#organization`,
  name: '탭스페이스',
  legalName: '주식회사 탭스페이스',
  alternateName: 'TabSpace',
  url: `${ORIGIN}/`,
  logo: `${ORIGIN}/assets/img/favicon-192.png`,
  description: 'AI와 IoT를 융합해 무인매장·상업시설·스마트빌딩 자동화 솔루션을 제공하는 IoT 전문기업',
  telephone: '+82-507-1399-7864',
  address: { '@type': 'PostalAddress', streetAddress: '매봉산로 18, 405호', addressLocality: '마포구', addressRegion: '서울특별시', addressCountry: 'KR' },
  sameAs: ['https://blog.naver.com/tabspacekr', 'https://smartstore.naver.com/tabspace', 'https://github.com/tabspacekr'],
};
function jsonLd(meta, url) {
  if (meta.key === '404') return null;
  if (meta.key === 'home') {
    return { '@context': 'https://schema.org', '@graph': [ORG, { '@type': 'WebSite', '@id': `${ORIGIN}/#website`, url: `${ORIGIN}/`, name: '탭스페이스', inLanguage: 'ko-KR', publisher: { '@id': ORG['@id'] } }] };
  }
  const group = groupOf(meta.key);
  const crumbs = [['홈', `${ORIGIN}/`]];
  if (group) crumbs.push([group[0], `${ORIGIN}/${group[1][0][2]}`]);
  crumbs.push([meta.title, url]);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', '@id': url, url, name: meta.title, description: meta.description, inLanguage: 'ko-KR', isPartOf: { '@id': `${ORIGIN}/#website` }, publisher: { '@id': ORG['@id'] } },
      { '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) },
    ],
  };
}
function renderSeo(meta, url, fullTitle) {
  if (meta.key === '404') return '';
  const img = `${ORIGIN}/assets/img/og-image.jpg`;
  const ld = jsonLd(meta, url);
  return `<meta property="og:type" content="website">
  <meta property="og:site_name" content="탭스페이스">
  <meta property="og:locale" content="ko_KR">
  <meta property="og:title" content="${esc(fullTitle)}">
  <meta property="og:description" content="${esc(meta.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${img}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="탭스페이스 — AI 시대의 IoT">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(fullTitle)}">
  <meta name="twitter:description" content="${esc(meta.description)}">
  <meta name="twitter:image" content="${img}">${meta.keywords ? `\n  <meta name="keywords" content="${esc(meta.keywords)}">` : ''}
  <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

/* ── <head> ── */
function renderHead(meta, refs) {
  const url = meta.key === 'home' ? `${ORIGIN}/` : `${ORIGIN}/${meta.key}.html`;
  const fullTitle = meta.key === 'home' ? '탭스페이스 - AI 시대의 IoT 자동화 솔루션' : `${meta.title} | 탭스페이스`;
  return `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)">
  <meta name="author" content="탭스페이스">
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(meta.description)}">
  ${meta.key === '404' ? '<base href="/">\n  <meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
  ${renderSeo(meta, url, fullTitle)}
  <!-- 테마: 첫 그리기 전에 정한다(깜빡임 방지). 선택은 shell.js 가 저장한다 -->
  <script>(function(){var t;try{t=localStorage.getItem('ts-theme')}catch(e){}if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();</script>
  <link rel="icon" type="image/png" sizes="48x48" href="./assets/img/favicon-48.png">
  <link rel="icon" type="image/png" sizes="96x96" href="./assets/img/favicon-96.png">
  <link rel="icon" type="image/png" sizes="192x192" href="./assets/img/favicon-192.png">
  <link rel="apple-touch-icon" href="./assets/img/apple-touch-icon.png">
  <!-- 스타일·스크립트는 _src/ 원본을 tools/build 로 묶은 결과물이다. 이 파일도 빌드 결과물이므로 _src/pages/ 를 고친 뒤 \`cd tools && npm run build\` -->
  <link rel="preload" href="./assets/fonts/atoz/atoz-400.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="./assets/fonts/atoz/atoz-700.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="./assets/dist/${refs.css}">
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
  <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>
  <!-- 실사용자 측정(RUM): 첫 화면 제목이 실제로 보인 시점. 전송은 body 끝 web-vitals 스크립트가 한다 -->
  <script>(function p(){var h=document.querySelector('main h1');if(h&&parseFloat(getComputedStyle(h).opacity)>=0.99){window.__heroVisible=Math.round(performance.now());return;}if(performance.now()<15000)requestAnimationFrame(p);})();</script>`;
}

const RUM = `<script type="module">
    const report = async () => {
      const { onLCP, onINP, onCLS, onFCP, onTTFB } = await import('./assets/vendor/web-vitals-5.3.0.attribution.js');
      const ct = navigator.connection?.effectiveType || 'na';
      const tgt = a => (a?.target || a?.interactionTarget || a?.largestShiftTarget || '').slice(0, 100);
      const send = m => window.gtag && gtag('event', m.name, {
        value: Math.round(m.name === 'CLS' ? m.delta * 1000 : m.delta),
        metric_id: m.id, metric_value: m.value, metric_rating: m.rating,
        debug_target: tgt(m.attribution),
        lcp_render_delay: m.name === 'LCP' ? Math.round(m.attribution.elementRenderDelay) : undefined,
        effective_type: ct, page_key: document.body.dataset.page
      });
      [onLCP, onINP, onCLS, onFCP, onTTFB].forEach(f => f(send));
      setTimeout(() => {
        const css = performance.getEntriesByType('resource')
          .find(e => e.name.startsWith(location.origin) && e.name.endsWith('.css') && e.transferSize > 0);
        const fcp = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
        window.gtag && gtag('event', 'hero_visible', {
          value: window.__heroVisible == null ? -1 : Math.round(Math.max(window.__heroVisible, fcp)),
          effective_type: ct, page_key: document.body.dataset.page,
          layout_overflow: document.documentElement.scrollWidth > innerWidth ? 1 : 0,
          css_wait: css ? Math.round(css.responseStart - css.requestStart) : -1
        });
      }, 3000);
    };
    document.readyState === 'complete' ? report() : addEventListener('load', report);
  </script>`;

/* ── 데이터 목록(빌드 때 그린다: 검색엔진이 읽고, 자리가 미리 잡혀 화면이 밀리지 않는다) ── */
function projectPicture(p, eager = false) {
  const size = p.imageWidth || 736;
  const sizes = '(min-width: 1200px) 280px, (min-width: 768px) 33vw, 50vw';
  const alt = /logo\.jpg$/.test(p.image) ? `${p.title} — 공식 로고` : `${p.title} 구축 사진`;
  const img = `<img src="${p.image}" alt="${esc(alt)}" width="${size}" height="${size}"${eager ? '' : ' loading="lazy"'} decoding="async">`;
  if (!p.avif && !p.webp) return img;
  return `<picture>${p.avif ? `<source type="image/avif" srcset="${p.avif}" sizes="${sizes}">` : ''}${p.webp ? `<source type="image/webp" srcset="${p.webp}" sizes="${sizes}">` : ''}${img}</picture>`;
}

function renderData(data) {
  const { projects, blog } = data;
  const pc = projects.categories;
  const bc = blog.categories;
  const chips = (cats, listId) => `<div class="chips" role="group" aria-label="분류" data-filter-for="${listId}">
        <button type="button" class="chip" data-filter="all" aria-pressed="true">전체</button>
        ${Object.entries(cats).map(([k, v]) => `<button type="button" class="chip" data-filter="${k}" aria-pressed="false">${esc(v)}</button>`).join('\n        ')}
      </div>`;
  // 블로그 후기(blogUrl)가 없는 사례는 링크 없는 카드로, 위치가 비어 있으면 분류만 적는다
  const projItems = projects.projects.map((p, i) => {
    const body = `
            <div class="ph">${projectPicture(p, i < 4)}<span class="badge solid">${esc(pc[p.category] || p.category)}</span></div>
            <div class="bd"><h3>${esc(p.title)}</h3><p class="loc">${icon('pin')}${p.location ? `${esc(p.location)} · ` : ''}${esc(p.subCategory)}</p>${p.blogUrl ? '<span class="sr-only">(새 창에서 블로그 글이 열립니다)</span>' : ''}</div>
          `;
    return `<li data-category="${p.category}">
          ${p.blogUrl ? `<a class="proj" href="${p.blogUrl}"${NEW_WIN}>${body}</a>` : `<div class="proj">${body}</div>`}
        </li>`;
  }).join('\n        ');
  const posts = [...blog.posts].sort((a, b) => b.date.localeCompare(a.date));
  const postItems = posts.map((p) => `<li data-category="${p.category}" id="${p.id}">
          <article class="card post fx">
            <div class="head"><span class="badge">${esc(bc[p.category] || p.category)}</span><time datetime="${p.date}" class="meta">${p.date}</time></div>
            <h3>${esc(p.title)}</h3>
            <p>${esc(p.excerpt)}</p>
            <p class="meta"><span>${esc(p.author)}</span><span>읽는 시간 ${esc(p.readTime)}</span></p>
            <ul class="tags">${p.tags.slice(0, 3).map((t) => `<li>#${esc(t)}</li>`).join('')}</ul>
          </article>
        </li>`).join('\n        ');
  // 최근 구축 사례: projects.json 의 순서(최신 사례가 앞)대로 5건. 블로그 링크가 없으면 누를 수 없는 줄로, 위치가 없으면 비운다
  const recentProjects = projects.projects.slice(0, 5)
    .map((p) => {
      const inner = `<span class="badge">${esc(pc[p.category] || p.category)}</span><span class="tit">${esc(p.title)}</span><span class="date">${esc(p.location || '')}</span>`;
      return p.blogUrl ? `<li><a href="${p.blogUrl}"${NEW_WIN}>${inner}<span class="sr-only">(새 창)</span></a></li>` : `<li><div class="row">${inner}</div></li>`;
    }).join('\n            ');
  const recentPosts = posts.slice(0, 5)
    .map((p) => `<li><a href="./insights.html#${p.id}"><span class="badge">${esc(bc[p.category] || p.category)}</span><span class="tit">${esc(p.title)}</span><time class="date" datetime="${p.date}">${p.date}</time></a></li>`).join('\n            ');
  return {
    'projects': projItems,
    'project-filters': chips(pc, 'project-list'),
    'project-total': String(projects.projects.length),
    'posts': postItems,
    'post-filters': chips(bc, 'post-list'),
    'post-total': String(posts.length),
    'recent-projects': recentProjects,
    'recent-posts': recentPosts,
  };
}

/* ── 페이지 조립 ── */
export function parsePage(src, file) {
  const m = src.match(/^<!--page (\{.*?\})-->\s*\n/);
  if (!m) throw new Error(`${file}: 첫 줄에 <!--page {...}--> 가 없다`);
  const meta = JSON.parse(m[1]);
  for (const k of ['key', 'title', 'description']) if (!meta[k]) throw new Error(`${file}: page.${k} 가 없다`);
  return { meta, body: src.slice(m[0].length) };
}

export function renderPage({ meta, body }, refs, data) {
  const fill = renderData(data);
  const content = body.replace(/\{\{([a-z-]+)(?::([a-z-]+))?\}\}/g, (all, name, arg) => {
    if (name === 'icon') return icon(arg);
    if (name === 'count') {
      const n = data.projects.projects.filter((p) => p.category === arg).length;
      if (!n) throw new Error(`${meta.key}: 분류 ${arg} 의 사례가 없다`);
      return String(n);
    }
    if (!(name in fill)) throw new Error(`${meta.key}: 알 수 없는 자리표시 ${all}`);
    return fill[name];
  });
  const isSub = !['home', '404'].includes(meta.key);
  const pageHead = isSub
    ? `<div class="inner page-head"><h1 class="page-title">${esc(meta.title)}</h1>${meta.lead ? `<p class="page-desc">${esc(meta.lead)}</p>` : ''}</div>\n`
    : '';
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  ${renderHead(meta, refs)}
</head>
<body data-page="${meta.key}">
  ${renderHeader(meta.key)}
  ${isSub ? renderSubhead(meta.key, meta.title) : ''}
  <main id="main" tabindex="-1" class="${isSub ? 'page' : ''}">
${pageHead}${content.trim()}
  </main>
  ${renderFooter()}
  <script defer src="./assets/dist/${refs.js}"></script>
  ${RUM}
</body>
</html>
`;
}

export function loadData(root) {
  return {
    projects: JSON.parse(fs.readFileSync(path.join(root, 'data', 'projects.json'), 'utf8')),
    blog: JSON.parse(fs.readFileSync(path.join(root, 'data', 'blog.json'), 'utf8')),
  };
}

export const outName = (key) => (key === 'home' ? 'index.html' : `${key}.html`);
