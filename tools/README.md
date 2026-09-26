# 홈페이지 빌드·성능 도구

`index.html`이 쓰는 CSS·JS는 `_src/`의 원본을 묶은 결과물(`assets/dist/`)이다.
**`assets/dist/`는 직접 고치지 않는다.** 배경은 `docs/homepage-performance-strategy.md`에 있다.

```
_src/css/      plugins.css, style.css, grape.css, cyber-theme.css   (이 순서로 합쳐진다)
_src/js/       jQuery, 플러그인(Easing·Headhesive·Owl), 테마, 히어로 효과, 차트, 데이터 로더, 챗봇 데모 등
_src/fonts/    Unicons-home.woff2 (홈페이지가 쓰는 아이콘 19개 서브셋, 빌드 때 CSS 에 인라인)
_src/img/      이미지 원본 (프로젝트 사진, 일러스트, 사업분야 아이콘)
assets/dist/   빌드 결과물 site.<해시>.css, home.<해시>.js
```

`_src/`는 밑줄로 시작하므로 GitHub Pages(Jekyll)가 배포하지 않는다. `tools/`는 `_config.yml`의 `exclude`로 뺐다.

## 준비

```bash
cd tools
npm ci                     # Node 22
```

## CSS·JS를 고쳤을 때

```bash
# 1) _src/css 또는 _src/js 수정
# 2) 빌드: assets/dist 에 새 해시 파일이 생기고 index.html 참조가 바뀐다
npm run build
# 3) 확인
npm run serve &            # https://127.0.0.1:8443 (GitHub Pages 흉내: HTTP/2, gzip, max-age=600)
npm run regress            # 기능 회귀 검사 (모바일·데스크톱)
# 4) index.html, assets/dist 의 새 파일, _src 변경을 함께 커밋
```

CI(`.github/workflows/homepage-perf.yml`)의 `npm run check`가 커밋된 결과물이 `_src`와 맞는지 검사한다.

### 옛 결과물 지우기 (배포 10분 뒤)

GitHub Pages는 모든 파일을 10분(`max-age=600`) 캐시하고, 엣지 캐시는 쿼리스트링을 무시한다.
새 `index.html`이 배포된 직후에도 10분 동안은 옛 HTML을 가진 방문자가 옛 파일을 요청할 수 있으므로,
**옛 결과물은 배포 후 10분 이상 지난 다음 커밋에서** 지운다.

```bash
npm run build -- --prune   # index.html 이 참조하지 않는 assets/dist 파일 삭제
```

## 아이콘(Unicons)을 추가했을 때

서브셋에 없는 아이콘은 원본 폰트(122KB)가 자동으로 추가 다운로드되어 표시는 되지만 느려진다.
`npm run regress`의 "원본 Unicons.woff2 요청 없음" 항목이 실패하면 코드포인트를 추가해 서브셋을 다시 만든다.

```bash
pip install fonttools brotli
pyftsubset ../assets/fonts/unicons/Unicons.woff2 \
  --unicodes="U+eb40,U+ed06,U+e9dd,U+e9d6,U+e9d3,U+e9a4,U+e9ee,U+ebc5,U+ed26,U+ec5a,U+ec59,U+e987,U+e949,U+e94c,U+e9ba,U+ebe3,U+ed66,U+e951,U+ed3b" \
  --flavor=woff2 --no-hinting --output-file=../_src/fonts/Unicons-home.woff2
# _src/css/cyber-theme.css 맨 위 Unicons @font-face 의 unicode-range 에도 같은 코드포인트를 추가한 뒤
npm run build
```

코드포인트는 `_src/css/style.css`의 `.uil-<이름>:before { content: "\xxxx" }`에서 찾는다.

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
