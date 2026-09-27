/* AI-103 刷题 · 离线缓存 671050738a */
const C = 'ai103-671050738a';
const F = ['./', './index.html', './bank.enc.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(F)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(resp => {
    const cp = resp.clone();
    caches.open(C).then(c => c.put(e.request, cp)).catch(() => {});
    return resp;
  }).catch(() => caches.match('./index.html'))));
});
