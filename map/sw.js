// 세왕 거래처 지도 — Service Worker (scope: /map/) v2
// 항상 서버에 최신 여부를 확인(no-cache 재검증)하고, 실패 시에만 캐시 사용
const CACHE = 'sewang-map-v3';

self.addEventListener('install', e => {
  e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('sewang-map-')).map(k => caches.delete(k))))
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
    fetch(e.request, { cache: 'no-store' })
      .catch(() => new Response('네트워크 연결 후 다시 열어주세요. 보안을 위해 오프라인 거래처 자료는 제공하지 않습니다.',
        {status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}}))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
