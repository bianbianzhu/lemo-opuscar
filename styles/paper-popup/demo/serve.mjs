// 极简静态服务器（ES module 不能走 file://）
import http from 'http'; import fs from 'fs'; import path from 'path';
const T = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.jpg': 'image/jpeg', '.png': 'image/png', '.hdr': 'application/octet-stream', '.bin': 'application/octet-stream', '.gltf': 'model/gltf+json', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };
export function serve(root, port = 0) {
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      const no = c => { r.writeHead(c); r.end(); };
      // 只认发给本机端口的请求（防 DNS rebinding）
      const port = s.address().port;
      if (q.headers.host !== `127.0.0.1:${port}` && q.headers.host !== `localhost:${port}`) return no(403);
      let u; try { u = decodeURIComponent(q.url.split('?')[0]); } catch { return no(400); }
      const base = path.resolve(root), p = path.join(base, u);
      if (p !== base && !p.startsWith(base + path.sep)) return no(403);   // ../ 不许走出服务根
      fs.readFile(p, (e, d) => { if (e) return no(404); r.writeHead(200, { 'Content-Type': T[path.extname(p)] || 'application/octet-stream' }); r.end(d); });
    });
    s.listen(port, '127.0.0.1', () => res({ server: s, port: s.address().port }));
  });
}
