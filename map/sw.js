// 세왕 거래처 지도 — Service Worker (scope: /map/) v2
// 항상 서버에 최신 여부를 확인(no-cache 재검증)하고, 실패 시에만 캐시 사용
const CACHE = 'sewang-map-v2';
const SHELL = ['./', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('sewang-map-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // 카카오 지도 SDK/타일 등 외부 요청은 그대로 네트워크
  if (url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;
  // 네트워크 우선 + HTTP 캐시 우회(ETag 재검증) → 배포 즉시 반영. 실패 시에만 캐시.
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
