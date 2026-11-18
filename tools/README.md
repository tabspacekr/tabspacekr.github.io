# 홈페이지 빌드·성능 도구

홈페이지는 **메뉴별 페이지**로 되어 있다(2026-11 개편, SMARTCITY 공개 누리집 구조 + 흑백 톤 + 에이투지체).
루트의 `index.html`, `about.html` … `404.html`, `sitemap.xml`, `assets/dist/`는 모두 **빌드 결과물**이다. 직접 고치지 않는다.

```
_src/pages/    페이지 본문. 첫 줄 <!--page {"key","title","description","lead"}--> 가 제목·설명·메뉴 위치를 정한다
_src/css/      site.css (디자인 토큰 + 컴포넌트, 라이트/다크)
_src/js/       shell(메뉴·테마) → filters → 차트 → 챗봇 → 에너지 → 이메일 확인 → home-init 순서로 합쳐진다
_src/fonts/    Unicons-home.woff2 (에너지 데모 아이콘 서브셋, 빌드 때 CSS 에 인라인)
tools/build/pages.mjs  메뉴 정의(GROUPS), 공용 머리·메뉴·푸터, SEO 태그, data/*.json 목록 미리 그리기
assets/fonts/atoz/     에이투지체 400·700 서브셋(KS X 1001 2,350자 + 라틴). OFL 1.1
assets/dist/   빌드 결과물 site.<해시>.css, site.<해시>.js
```

- 메뉴를 바꾸려면 `tools/build/pages.mjs` 의 `GROUPS` 를 고치고, 페이지는 `_src/pages/<key>.html` 을 추가한다.
- 프로젝트·인사이트 목록은 `data/projects.json`, `data/blog.json` 을 고친 뒤 빌드하면 페이지에 다시 그려진다.
- GitHub Pages 는 정적 파일만 내보내므로 공용 머리·푸터가 각 페이지에 미리 들어간다. 생성 HTML 에는 Jekyll 머리말이 없어 그대로 복사된다.
- 예전 원페이지 주소(`/#Projects` 등)는 `index.html` 의 작은 스크립트가 새 페이지로 옮긴다.

`_src/`는 밑줄로 시작하므로 GitHub Pages(Jekyll)가 배포하지 않는다. `tools/`는 `_config.yml`의 `exclude`로 뺐다.

## 준비

```bash
cd tools
npm ci                     # Node 22
```

## CSS·JS를 고쳤을 때

```bash
# 1) _src/pages, _src/css, _src/js 또는 data/*.json 수정
# 2) 빌드: assets/dist 에 새 해시 파일이 생기고 모든 페이지와 sitemap.xml 이 다시 만들어진다
npm run build
# 3) 확인
npm run serve &            # https://127.0.0.1:8443 (GitHub Pages 흉내: HTTP/2, gzip, max-age=600)
npm run regress            # 기능 회귀 검사 (모바일·데스크톱)
# 4) 루트 *.html, sitemap.xml, assets/dist 의 새 파일, _src 변경을 함께 커밋
```

CI(`.github/workflows/homepage-perf.yml`)의 `npm run check`가 커밋된 결과물이 `_src`와 맞는지 검사한다.

### 옛 결과물 지우기 (배포 10분 뒤)

GitHub Pages는 모든 파일을 10분(`max-age=600`) 캐시하고, 엣지 캐시는 쿼리스트링을 무시한다.
새 `index.html`이 배포된 직후에도 10분 동안은 옛 HTML을 가진 방문자가 옛 파일을 요청할 수 있으므로,
**옛 결과물은 배포 후 10분 이상 지난 다음 커밋에서** 지운다.

```bash
npm run build -- --prune   # 페이지가 참조하지 않는 assets/dist 파일 삭제
```

## 아이콘(Unicons)을 추가했을 때

Unicons 는 AI 솔루션 페이지의 에너지 관리 데모(`data-icon="uil-…"`)에만 쓴다. 메뉴·카드 아이콘은 `tools/build/pages.mjs` 의 `ICONS`(인라인 SVG)다.
서브셋(`_src/fonts/Unicons-home.woff2`)에 없는 Unicons 아이콘은 **표시되지 않는다**(원본 글꼴 안전망은 2026-11 개편 때 뺐다).
새 아이콘을 쓰려면 서브셋에 코드포인트를 더하고 `_src/css/site.css` 에 `.uil-<이름>::before { content: "\xxxx"; }` 를 추가한다.

```bash
pip install fonttools brotli
pyftsubset ../assets/fonts/unicons/Unicons.woff2 \
  --unicodes="U+eb40,U+ed06,U+e9dd,U+e9d6,U+e9d3,U+e9a4,U+e9ee,U+ebc5,U+ed26,U+ec5a,U+ec59,U+e987,U+e949,U+e94c,U+e9ba,U+ebe3,U+ed66,U+e951,U+ed3b" \
  --flavor=woff2 --no-hinting --output-file=../_src/fonts/Unicons-home.woff2
npm run build
```

코드포인트는 개편 전 원본 `git show aa3207a:_src/css/style.css | grep -A2 'uil-<이름>:before'` 에서 찾는다.

## 이미지를 추가·교체했을 때

```bash
npm run images             # 전체
node build/images.mjs photos   # 프로젝트 사진만 (photos | illustrations | icons | favicons)
```

- **프로젝트 사진**: `data/projects.json`에 항목을 추가하고 원본을 `assets/img/photos/<이름>.jpg`에 둔 뒤 실행한다.
  원본은 `_src/img/photos/`로 복사되고, 같은 경로에 736px JPEG, `assets/img/photos/opt/`에 480·736px AVIF/WebP가 생긴다.
  `projects.json`에는 `imageWidth`, `avif`, `webp` 필드가 채워진다.
- 이미 `_src/img/`에 원본이 있으면 그 원본에서 다시 만든다.

## 성능 측정

```bash
npm run serve &
npm run measure -- mobile 3        # 느린 4G + CPU 4배, 3회 중앙값 (히어로 표시, FCP, LCP, DCL, 전송량, CLS)
node perf/idle.js https://127.0.0.1:8443/            # 로드 후 가만히 있을 때 메인 스레드 사용률
node perf/styles.js https://127.0.0.1:8443/ --css <퍼지 전 합본.css>   # 전 요소 computed style 비교
```

`perf/results/`에 개선 전(`baseline-*.json`)과 후(`after-*.json`) 측정값이 있다.
측정 스크립트는 GA 수집 요청(`/g/collect`)을 막아 실제 GA 통계에 측정 트래픽이 섞이지 않게 한다.
