/* M2M Massage service worker - offline shell and fast repeat visits */
"use strict";

const VERSION = "m2m-v1.1.1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGE_CACHE = `${VERSION}-pages`;

const CORE_ASSETS = [
  "/",
  "/index.html",
  "/services.html",
  "/therapists.html",
  "/booking.html",
  "/about.html",
  "/contact.html",
  "/privacy.html",
  "/terms.html",
  "/offline.html",
  "/404.html",
  "/manifest.webmanifest",
  "/assets/css/style.css",
  "/assets/js/main.js",
  "/assets/img/favicon.svg",
  "/assets/img/icon.svg",
  "/assets/img/icon-192.png",
  "/assets/img/icon-512.png",
  "/assets/img/icon-maskable-512.png",
  "/assets/img/apple-touch-icon.png",
  "/assets/img/hero-figure.svg",
  "/assets/img/map.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== PAGE_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

function isCacheable(response) {
  return response && response.ok && (response.type === "basic" || response.type === "default");
}

async function networkFirst(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.status === 404) {
      const notFound = await caches.match("/404.html");
      if (notFound) return notFound;
    }
    if (isCacheable(response)) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = (await cache.match(request)) || (await caches.match(request));
    if (cached) return cached;
    return (await caches.match("/offline.html")) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (isCacheable(response)) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
