// Copia offline del canzoniere. La pagina principale si prende sempre da internet
// se possibile (così gli aggiornamenti arrivano subito), altrimenti dalla copia salvata.
const CACHE = 'canzoniere-8ed5323d';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k.startsWith('canzoniere-')).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));
function put(req, res){ if (res && (res.ok || res.type === 'opaque')){ const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; }
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const url = new URL(r.url);
  const isPage = r.mode === 'navigate' || (url.origin === location.origin && (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')));
  if (isPage){
    e.respondWith(fetch(r).then(res => put(new Request('./'), res))
      .catch(() => caches.match('./')));
    return;
  }
  e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => put(r, res))));
});
