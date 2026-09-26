// GitHub Pages 흉내 서버: HTTP/2(TLS), 텍스트 gzip, cache-control max-age=600.
// 사용: node tools/perf/server.js [port] [root]   (인증서는 tools/perf/.cert/ 에 자동 생성)
const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

const PORT = +(process.argv[2] || 8443);
const ROOT = path.resolve(process.argv[3] || path.join(__dirname, '..', '..'));
const CERT = path.join(__dirname, '.cert');
if (!fs.existsSync(path.join(CERT, 'key.pem'))) {
  fs.mkdirSync(CERT, { recursive: true });
  execSync(`openssl req -x509 -newkey rsa:2048 -nodes -days 3650 -subj /CN=127.0.0.1 -keyout ${CERT}/key.pem -out ${CERT}/cert.pem`, { stdio: 'ignore' });
}
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain',
};
const GZ = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt']);
const cache = new Map();

http2.createSecureServer({ key: fs.readFileSync(`${CERT}/key.pem`), cert: fs.readFileSync(`${CERT}/cert.pem`), allowHTTP1: true }, (req, res) => {
  let u = decodeURIComponent(req.url.split('?')[0]);
  if (u.endsWith('/')) u += 'index.html';
  const file = path.join(ROOT, u);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('404'); }
    const ext = path.extname(file).toLowerCase();
    const headers = { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'max-age=600' };
    if (GZ.has(ext) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      const key = file + ':' + st.mtimeMs;
      if (!cache.has(key)) cache.set(key, zlib.gzipSync(fs.readFileSync(file), { level: 6 }));
      const buf = cache.get(key);
      res.writeHead(200, { ...headers, 'content-encoding': 'gzip', 'content-length': buf.length });
      return res.end(buf);
    }
    res.writeHead(200, { ...headers, 'content-length': st.size });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} on https://127.0.0.1:${PORT}`));
