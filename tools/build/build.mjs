// 홈페이지 CSS·JS 빌드 (전략 문서 C2, J3, 2-1, 2-3).
//
//  _src/css/*.css  -> PurgeCSS -> lightningcss 압축 -> assets/dist/site.<hash>.css
//  _src/js/*.js    -> 순서대로 합쳐 esbuild 압축   -> assets/dist/home.<hash>.js
//  index.html 의 두 참조를 새 해시 파일명으로 바꾼다.
//
// GitHub Pages 는 캐시가 10분(max-age=600)이고 엣지 캐시가 쿼리스트링을 무시하므로,
// 내용이 바뀌면 파일명이 바뀌어야 한다. 옛 결과물은 한 캐시 주기(10분) 이상 지난 뒤
// `npm run build -- --prune` 로 지운다 (새 HTML 이 배포된 뒤 옛 HTML 을 가진 방문자 보호).
//
// 사용: cd tools && npm run build          빌드 + index.html 갱신
//       npm run check                      커밋된 결과물이 _src 와 일치하는지 검사 (CI)
//       npm run build -- --prune           index.html 이 참조하지 않는 옛 결과물 삭제
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { PurgeCSS } from 'purgecss';
import { transform as cssTransform } from 'lightningcss';
import { transform as jsTransform } from 'esbuild';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const r = (...p) => path.join(ROOT, ...p);
const DIST = r('assets', 'dist');
const INDEX = r('index.html');
const args = process.argv.slice(2);
const CHECK = args.includes('--check');
const PRUNE = args.includes('--prune');

// 원래 <head> 의 로드 순서 그대로 (plugins -> style -> grape -> cyber-theme)
const CSS_SOURCES = ['plugins.css', 'style.css', 'grape.css', 'cyber-theme.css'];

// 원래 <body> 끝의 실행 순서 그대로. jQuery -> 플러그인 -> 테마가 반드시 먼저 온다.
const JS_VENDOR = ['jquery-3.7.1.min.js', 'plugins.home.js'];
const JS_SOURCES = [
  'theme.home.js',
  'hero-effects.js',
  'data-visualization.js',
  'data-loader.js',
  'chatbot-demo-animation.js',
  'energy-management-animation.js',
  'contact-reveal.js',
  'home-init.js',
];

// 소스에 글자로 나타나지 않고 JS 가 런타임에 붙이는 클래스·상태 (검증된 목록, 전략 문서 C2)
const SAFELIST = {
  standard: [
    'show', 'active', 'open', 'fade', 'fixed', 'mobile', 'highlight', 'fade-in', 'fade-out',
    'active-progress', 'cyber-glitch', 'offcanvas-open', 'navbar-clone', 'navbar-stick', 'navbar-unstick',
    /^owl-/, /^offcanvas/, /^banner--/,
  ],
  deep: [/^owl-/],
  greedy: [/data-color/, /hidden/],
};

const hash = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);
const read = (...p) => fs.readFileSync(r(...p), 'utf8');

async function buildCss() {
  let css = CSS_SOURCES.map((f) => read('_src', 'css', f).replace(/@charset "UTF-8";\s*/g, '')).join('\n');

  // Unicons 서브셋(3.2KB)을 data URI 로 넣어 폰트 요청을 없앤다 (전략 문서 F2)
  const unicons = fs.readFileSync(r('_src', 'fonts', 'Unicons-home.woff2')).toString('base64');
  css = css.replace('url("../../_src/fonts/Unicons-home.woff2")', `url("data:font/woff2;base64,${unicons}")`);

  const content = [
    { raw: read('index.html'), extension: 'html' },
    ...JS_SOURCES.map((f) => ({ raw: read('_src', 'js', f), extension: 'js' })),
  ];
  const [purged] = await new PurgeCSS().purge({
    content,
    css: [{ raw: css }],
    safelist: SAFELIST,
    keyframes: true, // 남은 규칙이 참조하지 않는 @keyframes(animate.css 등)는 뺀다
    fontFace: false,
    variables: false,
  });

  const { code } = cssTransform({
    filename: 'site.css',
    code: Buffer.from(purged.css),
    minify: true,
    errorRecovery: true, // plugins.css 의 원본 오류(잘못된 calc 등)는 원래 브라우저가 무시하던 규칙이다
  });
  return Buffer.from(code);
}

async function buildJs() {
  const vendor = JS_VENDOR.map((f) => read('_src', 'js', f).trim()).join('\n;\n');
  const own = JS_SOURCES.map((f) => `/* ${f} */\n${read('_src', 'js', f)}`).join('\n;\n');
  const { code } = await jsTransform(own, {
    loader: 'js',
    minify: true,
    legalComments: 'inline',
    pure: ['console.log', 'console.info', 'console.debug'], // console.error/warn 은 남긴다
    target: 'es2018',
  });
  return Buffer.from(`${vendor}\n;\n${code}`);
}

function outputs(cssBuf, jsBuf) {
  return {
    css: { name: `site.${hash(cssBuf)}.css`, buf: cssBuf, re: /assets\/dist\/site\.[0-9a-f]+\.css/ },
    js: { name: `home.${hash(jsBuf)}.js`, buf: jsBuf, re: /assets\/dist\/home\.[0-9a-f]+\.js/ },
  };
}

const out = outputs(await buildCss(), await buildJs());
let html = fs.readFileSync(INDEX, 'utf8');

if (CHECK) {
  const problems = [];
  for (const o of Object.values(out)) {
    const ref = (html.match(o.re) || [])[0];
    const expected = `assets/dist/${o.name}`;
    if (ref !== expected) problems.push(`index.html 은 ${ref} 를 참조하지만 _src 로 빌드하면 ${expected} 가 나온다`);
    const file = path.join(DIST, o.name);
    if (!fs.existsSync(file)) problems.push(`${expected} 가 커밋되어 있지 않다`);
    else if (!fs.readFileSync(file).equals(o.buf)) problems.push(`${expected} 내용이 빌드 결과와 다르다`);
  }
  if (problems.length) {
    console.error('빌드 결과물이 _src 와 맞지 않습니다. `cd tools && npm run build` 후 커밋하세요.\n- ' + problems.join('\n- '));
    process.exit(1);
  }
  console.log(`ok: ${out.css.name}, ${out.js.name}`);
  process.exit(0);
}

fs.mkdirSync(DIST, { recursive: true });
for (const o of Object.values(out)) {
  fs.writeFileSync(path.join(DIST, o.name), o.buf);
  if (!o.re.test(html)) throw new Error(`index.html 에서 ${o.re} 참조를 찾지 못했다`);
  html = html.replace(o.re, `assets/dist/${o.name}`);
  console.log(`assets/dist/${o.name}  ${o.buf.length.toLocaleString()} B`);
}
fs.writeFileSync(INDEX, html);

if (PRUNE) {
  const keep = new Set([out.css.name, out.js.name]);
  for (const f of fs.readdirSync(DIST)) {
    if (!keep.has(f)) {
      fs.unlinkSync(path.join(DIST, f));
      console.log(`removed assets/dist/${f}`);
    }
  }
}
