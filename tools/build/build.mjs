// 홈페이지 빌드 (전략 문서 C2, J3, 2-1, 2-3 + 2026-11 메뉴별 페이지 개편).
//
//  _src/css/site.css  -> PurgeCSS -> lightningcss 압축 -> assets/dist/site.<hash>.css
//  _src/js/*.js       -> 순서대로 합쳐 esbuild 압축   -> assets/dist/site.<hash>.js
//  _src/pages/*.html  -> 공용 머리·메뉴·푸터(pages.mjs)를 입혀 -> 저장소 루트 *.html (+ sitemap.xml)
//
// GitHub Pages 는 캐시가 10분(max-age=600)이고 엣지 캐시가 쿼리스트링을 무시하므로,
// 내용이 바뀌면 파일명이 바뀌어야 한다. 옛 결과물은 한 캐시 주기(10분) 이상 지난 뒤
// `npm run build -- --prune` 로 지운다 (새 HTML 이 배포된 뒤 옛 HTML 을 가진 방문자 보호).
//
// 사용: cd tools && npm run build          빌드 + 페이지 생성
//       npm run check                      커밋된 결과물(dist·페이지·sitemap)이 _src 와 일치하는지 검사 (CI)
//       npm run build -- --prune           페이지가 참조하지 않는 옛 dist 결과물 삭제
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PurgeCSS } from 'purgecss';
import { transform as cssTransform } from 'lightningcss';
import { transform as jsTransform } from 'esbuild';
import { parsePage, renderPage, loadData, outName, ORIGIN, areaPages } from './pages.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const r = (...p) => path.join(ROOT, ...p);
const DIST = r('assets', 'dist');
const PAGES_DIR = r('_src', 'pages');
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const PRUNE = args.includes('--prune');

const CSS_SOURCES = ['site.css'];

// 실행 순서. 각 스크립트는 자기 요소가 없는 페이지에서는 아무것도 하지 않는다.
const JS_SOURCES = [
  'shell.js',
  'filters.js',
  'lightbox.js',
  'data-visualization.js',
  'chatbot-demo-animation.js',
  'energy-management-animation.js',
  'contact-reveal.js',
  'home-init.js',
];

// 소스에 글자로 나타나지 않고 JS 가 런타임에 붙이는 클래스·속성
const SAFELIST = {
  standard: ['is-mega', 'is-hot', 'on', 'highlight', 'fade-in', 'fade-out', 'allmenu-open', 'lightbox-open', 'single', /^uil-/],
  greedy: [/data-theme/, /aria-pressed/, /aria-current/, /hidden/],
};

const hash = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
const read = (...p) => fs.readFileSync(r(...p), 'utf8');

const data = loadData(ROOT);
// _src/pages 의 손으로 쓴 페이지 + _src/areas.json 으로 만드는 사업 분야 하위 영역 페이지
const pageSources = fs.readdirSync(PAGES_DIR).filter((f) => f.endsWith('.html')).sort()
  .map((f) => parsePage(read('_src', 'pages', f), f))
  .concat(areaPages(ROOT, data));

async function buildCss(htmlForPurge) {
  let css = CSS_SOURCES.map((f) => read('_src', 'css', f)).join('\n');
  // Unicons 서브셋(3.2KB)을 data URI 로 넣어 폰트 요청을 없앤다 (전략 문서 F2)
  const unicons = fs.readFileSync(r('_src', 'fonts', 'Unicons-home.woff2')).toString('base64');
  css = css.replace('url("../../_src/fonts/Unicons-home.woff2")', `url("data:font/woff2;base64,${unicons}")`);

  const content = [
    ...htmlForPurge.map((raw) => ({ raw, extension: 'html' })),
    ...JS_SOURCES.map((f) => ({ raw: read('_src', 'js', f), extension: 'js' })),
  ];
  const [purged] = await new PurgeCSS().purge({
    content,
    css: [{ raw: css }],
    safelist: SAFELIST,
    keyframes: true,
    fontFace: false,
    variables: false,
  });
  const { code } = cssTransform({ filename: 'site.css', code: Buffer.from(purged.css), minify: true });
  return Buffer.from(code);
}

async function buildJs() {
  const own = JS_SOURCES.map((f) => `/* ${f} */\n${read('_src', 'js', f)}`).join('\n;\n');
  const { code } = await jsTransform(own, {
    loader: 'js',
    minify: true,
    legalComments: 'inline',
    pure: ['console.log', 'console.info', 'console.debug'], // console.error/warn 은 남긴다
    target: 'es2018',
  });
  return Buffer.from(code);
}

function renderAll(refs) {
  return pageSources.map((p) => ({ file: outName(p.meta.key), html: renderPage(p, refs, data), meta: p.meta }));
}

function sitemap(pages) {
  const urls = pages.filter((p) => p.meta.key !== '404').map((p) => {
    const loc = p.meta.key === 'home' ? `${ORIGIN}/` : `${ORIGIN}/${p.file}`;
    const pri = p.meta.key === 'home' ? '1.0' : '0.8';
    return `  <url><loc>${loc}</loc><changefreq>${p.meta.changefreq || 'monthly'}</changefreq><priority>${pri}</priority></url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

const draft = renderAll({ css: 'site.css', js: 'site.js' }).map((p) => p.html);
const cssBuf = await buildCss(draft);
const jsBuf = await buildJs();
const refs = { css: `site.${hash(cssBuf)}.css`, js: `site.${hash(jsBuf)}.js` };
const pages = renderAll(refs);
const outputs = [
  ...pages.map((p) => ({ file: r(p.file), buf: Buffer.from(p.html), label: p.file })),
  { file: r('sitemap.xml'), buf: Buffer.from(sitemap(pages)), label: 'sitemap.xml' },
  { file: path.join(DIST, refs.css), buf: cssBuf, label: `assets/dist/${refs.css}` },
  { file: path.join(DIST, refs.js), buf: jsBuf, label: `assets/dist/${refs.js}` },
];

if (CHECK) {
  const problems = outputs.filter((o) => !fs.existsSync(o.file) || !fs.readFileSync(o.file).equals(o.buf))
    .map((o) => `${o.label} 가 _src 로 빌드한 결과와 다르거나 없다`);
  if (problems.length) {
    console.error('빌드 결과물이 _src 와 맞지 않습니다. `cd tools && npm run build` 후 커밋하세요.\n- ' + problems.join('\n- '));
    process.exit(1);
  }
  console.log(`ok: ${pages.length} pages, ${refs.css}, ${refs.js}`);
  process.exit(0);
}

fs.mkdirSync(DIST, { recursive: true });
for (const o of outputs) {
  fs.writeFileSync(o.file, o.buf);
  console.log(`${o.label.padEnd(40)} ${o.buf.length.toLocaleString()} B`);
}

if (PRUNE) {
  const keep = new Set([refs.css, refs.js]);
  for (const f of fs.readdirSync(DIST)) {
    if (!keep.has(f)) {
      fs.unlinkSync(path.join(DIST, f));
      console.log(`removed assets/dist/${f}`);
    }
  }
}
