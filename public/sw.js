/* AI-103 刷题 · Service Worker 9880e47fe5
 * 策略：HTML/题库「网络优先 + 4 秒超时回退缓存」——保证每次打开都拿到最新版本，断网时仍可用。
 *     其他静态资源走缓存优先。
 */
const C = 'ai103-9880e47fe5';
const F = ['./', './index.html', './bank.enc.js'];
const NET = ['/', '/index.html', '/bank.enc.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(F)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
function timeout(ms) {
  return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  const isDoc = req.mode === 'navigate' || NET.indexOf(url.pathname.replace(/^.*/ai103-quiz/, '')) >= 0
    || //(index.html|bank.enc.js)$/.test(url.pathname);
  if (isDoc) {
    e.respondWith(
      Promise.race([fetch(req), timeout(4000)])
        .then(resp => {
          if (resp && resp.ok) {
            const cp = resp.clone();
            caches.open(C).then(c => c.put(req, cp)).catch(() => {});
          }
          return resp;
        })
        .catch(() => caches.match(req, { ignoreSearch: true })
          .then(r => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
