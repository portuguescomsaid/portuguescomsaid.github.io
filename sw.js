const C='ptsaid-v2a';
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
  if(u.hostname.endsWith('googleapis.com')&&!u.hostname.startsWith('fonts'))return;
  if(r.destination==='audio'||r.headers.has('range')||/streamelements|translate\.google|wikipedia|wikimedia|recaptcha|firebaseappcheck/.test(u.hostname))return; // firebase traffic: never cache
  const isPage=r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html');
  if(isPage){e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('./index.html',cp));return res}).catch(()=>caches.match('./index.html')));return}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&(u.origin===location.origin||u.hostname.includes('gstatic')||u.hostname.includes('fonts'))){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})));
});

self.addEventListener('push',e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){}const m=d.data||d.notification||d||{};
  e.waitUntil(self.registration.showNotification(m.title||'برتغالي مع سعيد',{body:m.body||'درسك اليوم جاهز 📘',icon:'icon-192.png',badge:'icon-192.png',tag:'daily',renotify:true,data:{url:m.url||'./#path'},dir:'rtl',lang:'ar'}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const url=(e.notification.data&&e.notification.data.url)||'./';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c){c.navigate&&c.navigate(url).catch(()=>{});return c.focus()}}return clients.openWindow(url)}))});
