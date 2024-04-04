importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";
const OFFLINE_PAGES = ["indexOffLine.html", "quizOffLine.html"];

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(OFFLINE_PAGES))
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {
        const cache = await caches.open(CACHE);
        let cachedResp;

        // Verifica se a solicitação é para a página quizOffLine.html
        if (event.request.url.includes("quizOffLine.html")) {
          cachedResp = await cache.match("quizOffLine.html");
        } else {
          // Caso contrário, retorna a página offline padrão
          cachedResp = await cache.match("offLine.html");
        }

        return cachedResp;
      }
    })());
  }
});
