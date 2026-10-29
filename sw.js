/* Service worker do Lenda do CRO: guarda o app para abrir sem internet. */
const CACHE = "lenda-cro-v1";
const ARQUIVOS = ["./", "./index.html", "./manifest.webmanifest", "./firebase-config.js", "./sync-firebase.js",
  "./icones/icon-192.png", "./icones/icon-512.png", "./icones/apple-touch-icon.png", "./icones/favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  /* conversa com o Firebase passa direto, sem cache */
  if (/googleapis\.com|firebaseio\.com|identitytoolkit|securetoken/.test(url.hostname)) return;
  const mesmoSite = url.origin === self.location.origin;
  const biblioteca = /gstatic\.com|fonts\.googleapis\.com/.test(url.hostname);
  if (!mesmoSite && !biblioteca) return;
  /* páginas e arquivos do app: tenta a internet primeiro (pega atualizações), cai no cache sem internet */
  e.respondWith(
    fetch(req).then(res => {
      if (res && (res.ok || res.type === "opaque")) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
  );
});
