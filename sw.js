// Service worker: guarda todos los archivos para que el taller funcione sin internet.
const VERSION='talleres-926a5f97';
const ARCHIVOS=["./", "ajedrez.html", "angulos.html", "area.html", "cadenas.html", "construir.js", "creditos.html", "decimal.html", "dibujo.html", "divisiones.html", "dorado.html", "fonts/baloo2.woff", "fonts/didactgothic.woff", "fonts/nunito.woff", "fonts/urbanist.woff", "fracciones.html", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "icons/og.png", "index.html", "manifest.webmanifest", "probabilidad.html", "probar-botones.html", "programacion.html", "ritmo.html", "taller.css", "taller.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(ARCHIVOS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(r=>r||fetch(e.request)));});
