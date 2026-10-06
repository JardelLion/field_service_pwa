const CACHE_VERSION = 'v1';
// Scope-based cache name ensures different portals don't conflict
const getCacheName = `field_service_pwa-${CACHE_VERSION}`

// Ensure offlineUrl is a valid path on your portal
const offlineUrl = '/offline'; 

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(getCacheName()).then((cache) => {
            // Pre-cache the offline page so it's ready when the network fails
            return cache.add(offlineUrl).catch(err => console.log("Offline page not found", err));
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k.startsWith('portal-cache-') && k !== getCacheName())
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});
//just for not clone the site right now
// self.addEventListener("fetch", (event) => {
//     const { request } = event;
//     const url = new URL(request.url);

//     if (!url.protocol.startsWith("http")) {
//         return;
//     }

//     // Skip Odoo's internal /longpolling or /websocket requests
//     if (url.pathname.includes("/longpolling")) return;

//     event.respondWith(
//         caches.open(getCacheName()).then(async (cache) => {
//             // Check if already in cache
//             const cachedResponse = await cache.match(request);
//             if (cachedResponse) return cachedResponse;

//             // If not, fetch from network
//             try {
//                 const response = await fetch(request);
//                 // Only cache successful, GET requests
//                 if (response && response.status === 200 && request.method === "GET") {
//                     cache.put(request, response.clone());
//                 }
//                 return response;
//             } catch (err) {
//                 // Offline and not in cache
//                 if (request.mode === "navigate") {
//                     const offlineResponse = await cache.match(offlineUrl);
//                     if (offlineResponse) return offlineResponse;
//                 }

//                 console.warn("SW fetch failed, no cache available:", request.url);
//                 return new Response("", {
//                     status: 503,
//                     statusText: "Offline - resource not cached",
//                 });
//             }
//         })
//     );
// });