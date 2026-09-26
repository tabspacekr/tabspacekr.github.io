// 이미지 1회 변환 스크립트 (전략 문서 I1~I4, I5 favicon).
// 원본은 _src/img/ 에 두고(배포 제외), 배포용 파생본을 assets/img/ 에 만든다.
// 사용: cd tools && npm run images      (원본이 바뀌었을 때만 다시 실행하고 결과물을 커밋한다)
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const r = (...p) => path.join(ROOT, ...p);
const SRC = r('_src', 'img');

const AVIF = { quality: 50, effort: 6 };
const WEBP = { quality: 75, effort: 6 };
const log = (f) => console.log(`${path.relative(ROOT, f)}  ${fs.statSync(f).size.toLocaleString()} B`);

// 처음 한 번: 배포 위치의 원본을 _src/img 로 옮긴다
function adoptOriginal(deployed, original) {
  if (fs.existsSync(original)) return;
  fs.mkdirSync(path.dirname(original), { recursive: true });
  fs.copyFileSync(deployed, original);
}

async function write(pipeline, out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await pipeline.toFile(out);
  log(out);
}

// ---- 프로젝트 사진 37장: 같은 경로 736px JPEG + 480/736 AVIF·WebP (I4-a, I4-b)
async function photos() {
  const file = r('data', 'projects.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const p of data.projects) {
    const deployed = r(p.image);
    const name = path.basename(p.image, '.jpg');
    const original = path.join(SRC, 'photos', `${name}.jpg`);
    adoptOriginal(deployed, original);
    const { width } = await sharp(original).metadata();
    const widths = [480, 736].filter((w) => w <= width);
    if (widths.length === 0 || width < 736) widths.push(Math.min(width, 736));
    const unique = [...new Set(widths)].sort((a, b) => a - b);
    const top = unique[unique.length - 1];

    await write(sharp(original).rotate().resize({ width: top, withoutEnlargement: true }).jpeg({ quality: 75, mozjpeg: true }), deployed);
    const avif = [], webp = [];
    for (const w of unique) {
      const base = r('assets', 'img', 'photos', 'opt', `${name}-${w}`);
      await write(sharp(original).rotate().resize({ width: w, withoutEnlargement: true }).avif(AVIF), base + '.avif');
      await write(sharp(original).rotate().resize({ width: w, withoutEnlargement: true }).webp(WEBP), base + '.webp');
      avif.push(`./assets/img/photos/opt/${name}-${w}.avif ${w}w`);
      webp.push(`./assets/img/photos/opt/${name}-${w}.webp ${w}w`);
    }
    // image(JPEG)는 폴백과 캐시 호환을 위해 그대로 두고 새 필드만 더한다
    p.imageWidth = top;
    p.avif = avif.join(', ');
    p.webp = webp.join(', ');
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
}

// ---- 히어로·문의 일러스트: AVIF/WebP (I1, I2)
async function illustrations() {
  // 3d2(히어로)는 sizes 기반 w 서술자, 3d5(문의)는 기존 레이아웃 유지를 위해 1x/2x 서술자를 쓴다
  const widths = { '3d2': [600, 800, 1200], '3d5': [800, 1600] };
  for (const name of Object.keys(widths)) {
    // @2x PNG 는 <img> 폴백으로 그대로 배포되므로 원본을 따로 옮기지 않는다
    const original = r('assets', 'img', 'illustrations', `${name}@2x.png`);
    for (const w of widths[name]) {
      const base = r('assets', 'img', 'illustrations', `${name}-${w}`);
      await write(sharp(original).resize({ width: w }).avif(AVIF), base + '.avif');
      await write(sharp(original).resize({ width: w }).webp(WEBP), base + '.webp');
    }
  }
}

// ---- 사업분야 아이콘 5개: 512px -> 180px PNG-8 (I3)
async function icons() {
  for (const name of ['buildings', 'smarthome', 'smartfarm', 'embedded_system', 'store']) {
    const deployed = r('assets', 'img', `${name}.png`);
    const original = path.join(SRC, 'icons', `${name}.png`);
    adoptOriginal(deployed, original);
    await write(sharp(original).resize({ width: 180 }).png({ palette: true, quality: 90, effort: 10 }), deployed);
  }
}

// ---- favicon: 48/96/192 + apple-touch-icon 180 (I5)
async function favicons() {
  const original = r('assets', 'img', 'favicon.png');
  for (const s of [48, 96, 192]) await write(sharp(original).resize(s, s).png(), r('assets', 'img', `favicon-${s}.png`));
  await write(sharp(original).resize(180, 180).png(), r('assets', 'img', 'apple-touch-icon.png'));
}

const only = process.argv.slice(2);
const steps = { photos, illustrations, icons, favicons };
for (const [k, fn] of Object.entries(steps)) if (!only.length || only.includes(k)) await fn();
