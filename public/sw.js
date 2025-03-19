if (!self.define) {
  let e, s = {};
  const a = (a, t) => (
    a = new URL(a + ".js", t).href, 
    s[a] || new Promise((s => {
      if ("document" in self) {
        const e = document.createElement("script");
        e.src = a, e.onload = s, document.head.appendChild(e);
      } else {
        e = a;
        importScripts(a);
        s();
      }
    })).then(() => {
      let e = s[a];
      if (!e) throw new Error(`Module ${a} didn’t register its module`);
      return e;
    })
  );
  self.define = (t, n) => {
    const i = e || ("document" in self ? document.currentScript.src : "") || location.href;
    if (s[i]) return;
    let c = {};
    const p = e => a(e, i),
      r = { module: { uri: i }, exports: c, require: p };
    s[i] = Promise.all(t.map(e => r[e] || p(e))).then(e => (n(...e), c));
  };
}

// Define a custom NetworkOnly strategy
class NetworkOnlyStrategy {
  async handle({ event }) {
    return fetch(event.request);
  }
}

// Register Workbox
define(["./workbox-4754cb34"], function (e) {
  "use strict";

  importScripts();
  self.skipWaiting();
  e.clientsClaim();

  // Precache assets (but exclude Next.js internal build files)
  e.precacheAndRoute([
    { url: "/Arrow.png", revision: "fa1d4eec9835e08596cf564461a3d579" },
    { url: "/Background.png", revision: "36c8b90479f7371f31f856472274734b" },
    { url: "/MoodSwang.png", revision: "342c0e83b2514eca4e129bbdba945525" },
    { url: "/manifest.json", revision: "5a08c3971d4bc9f9ae3933c3d925e6ee" },
    { url: "/next.svg", revision: "8e061864f388b47f33a1c3780831193e" },
    { url: "/vercel.svg", revision: "c0af2f507b369b085b35ef4bbe3bcf1e" },
  ], { ignoreURLParametersMatching: [] });

  e.cleanupOutdatedCaches();

  // Prevent Workbox from caching Next.js build files
  e.registerRoute(
    ({ url }) => url.pathname.startsWith("/_next/"),
    new e.NetworkFirst({ cacheName: "nextjs-files" })
  );

  // Prevent Workbox from caching Supabase Storage URLs using our custom network-only strategy
  e.registerRoute(
    ({ url }) => url.hostname.includes("supabase.co"),
    new NetworkOnlyStrategy()
  );

  // Cache static image assets
  e.registerRoute(
    /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    new e.StaleWhileRevalidate({
      cacheName: "static-image-assets",
      plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })],
    }),
    "GET"
  );

  // Cache static data assets
  e.registerRoute(
    /\.(?:json|xml|csv)$/i,
    new e.NetworkFirst({
      cacheName: "static-data-assets",
      plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })],
    }),
    "GET"
  );

  // Google Fonts caching
  e.registerRoute(
    /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
    new e.CacheFirst({
      cacheName: "google-fonts-webfonts",
      plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })],
    }),
    "GET"
  );

  e.registerRoute(
    /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
    new e.StaleWhileRevalidate({
      cacheName: "google-fonts-stylesheets",
      plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })],
    }),
    "GET"
  );

  // API caching (excluding auth endpoints)
  e.registerRoute(
    ({ url }) => url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/auth/"),
    new e.NetworkFirst({
      cacheName: "apis",
      networkTimeoutSeconds: 10,
      plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })],
    }),
    "GET"
  );

  // Handle Cross-Origin Requests
  e.registerRoute(
    ({ url }) => !(self.origin === url.origin),
    new e.NetworkFirst({
      cacheName: "cross-origin",
      networkTimeoutSeconds: 10,
      plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })],
    }),
    "GET"
  );
});
