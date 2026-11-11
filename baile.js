/* Baile de ajolotes: celebra los hitos grandes (terminar un tema del año, terminar el año).
   Tema terminado: 3 ajolotes bailan. Año terminado: bailan todos (uno de cada color) con confeti. */
(function(){
  var TEMAS = ['rosa','azul','amarillo','menta','lila','durazno'], KC = 'tm_baile';
  var CONF = ['#e9806c','#86aedb','#f2c77a','#86c496','#c4a6e0','#f59aae'];
  function el(t,c,x){ var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function css(){
    if (document.getElementById('bl-css')) return; var s = el('style'); s.id = 'bl-css';
    s.textContent = '.bl-ov{position:fixed;inset:0;z-index:99999;background:rgba(40,32,24,.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:12px;overflow:hidden;animation:bl-in .3s ease-out}'
    + '@keyframes bl-in{from{opacity:0}}'
    + '.bl-t{font:900 clamp(24px,6vmin,52px) Urbanist,system-ui,sans-serif;color:#fff;text-align:center;text-shadow:0 3px 0 rgba(0,0,0,.35);margin:0}'
    + '.bl-s{font:700 clamp(15px,3.4vmin,26px) Urbanist,system-ui,sans-serif;color:#ffeccc;text-align:center;margin:0}'
    + '.bl-fila{display:flex;justify-content:center;align-items:flex-end;gap:clamp(2px,1.5vmin,18px);flex-wrap:nowrap;width:100%}'
    + '.bl-a{flex:0 1 clamp(80px,27vmin,300px);transform-origin:50% 92%}.bl-fila.m .bl-a{flex-basis:clamp(60px,19vmin,230px)}'
    + '.bl-a svg{width:100%;height:auto;display:block;overflow:visible}'
    + '.bl-a.d0{animation:bl-d0 .9s ease-in-out infinite}.bl-a.d1{animation:bl-d1 .9s ease-in-out infinite .15s}.bl-a.d2{animation:bl-d2 .9s ease-in-out infinite .3s}'
    + '@keyframes bl-d0{0%,100%{transform:translate(0,0) rotate(-8deg)}25%{transform:translate(-8px,-26px) rotate(0)}50%{transform:translate(0,0) rotate(8deg)}75%{transform:translate(8px,-26px) rotate(0)}}'
    + '@keyframes bl-d1{0%,100%{transform:translateY(0) scale(1,1)}30%{transform:translateY(-34px) scale(.96,1.06)}55%{transform:translateY(0) scale(1.06,.94)}}'
    + '@keyframes bl-d2{0%,100%{transform:rotate(10deg) translateX(-6px)}50%{transform:rotate(-10deg) translateX(6px) translateY(-14px)}}'
    + '.bl-c{position:absolute;top:-24px;width:10px;height:16px;opacity:.95;animation:bl-f linear infinite}'
    + '@keyframes bl-f{to{transform:translateY(112vh) rotate(720deg)}}'
    + '.bl-x{min-height:48px;padding:6px 26px;font:800 1.2rem Urbanist,system-ui,sans-serif;border-radius:16px;border:3px solid #41362b;background:#f2c77a;color:#41362b;cursor:pointer}'
    + '@media (prefers-reduced-motion:reduce){.bl-a,.bl-c{animation:none!important}}';
    document.head.appendChild(s);
  }
  function lee(){ try { return JSON.parse(localStorage.getItem(KC) || '{}') || {}; } catch (e) { return {}; } }
  function guarda(o){ try { localStorage.setItem(KC, JSON.stringify(o)); } catch (e) {} }

  function baila(opt){
    css(); var ov = el('div','bl-ov'); ov.setAttribute('role','dialog'); ov.setAttribute('aria-label', opt.titulo);
    for (var i = 0; i < 36; i++){ var c = el('i','bl-c'); c.style.left = (Math.random() * 100) + '%'; c.style.background = CONF[i % CONF.length]; c.style.animationDuration = (2.4 + Math.random() * 2.6) + 's'; c.style.animationDelay = (-Math.random() * 4) + 's'; c.style.borderRadius = i % 3 ? '2px' : '50%'; ov.appendChild(c); }
    ov.appendChild(el('p','bl-t',opt.titulo)); if (opt.sub) ov.appendChild(el('p','bl-s',opt.sub));
    var fila = el('div','bl-fila' + (opt.temas.length > 3 ? ' m' : '')); var et = opt.etapa || 1;
    opt.temas.forEach(function(t,i){ var a = el('div','bl-a d' + (i % 3)); a.innerHTML = window.Ilu ? Ilu.html('axo_celebra',{tema:t,etapa:et}) : ''; fila.appendChild(a); });
    ov.appendChild(fila);
    var bt = el('button','bl-x','¡Seguimos!'); bt.type = 'button'; ov.appendChild(bt);
    document.body.appendChild(ov);
    if (window.Snd && Snd.ok) { Snd.ok(); setTimeout(Snd.ok, 450); }
    try { if (window.Voz && opt.voz) Voz.habla(opt.voz); } catch (e) {}
    function cierra(){ clearTimeout(tm); ov.remove(); }
    var tm = setTimeout(cierra, opt.ms || 9000);
    bt.onclick = cierra; ov.addEventListener('click', function(e){ if (e.target === ov) cierra(); });
    return { cierra: cierra, ov: ov };
  }
  function etapa(p){ var n = p ? +p.taller : 1; return n >= 3 ? 3 : n === 2 ? 2 : 1; }
  function tres(tema){ var i = TEMAS.indexOf(tema); if (i < 0) i = 0; return [TEMAS[(i + 1) % 6], tema, TEMAS[(i + 2) % 6]]; }
  function celebraTema(p, nombreTema){
    return baila({ titulo: '¡Terminaste ' + nombreTema + '!', sub: 'Un tema completo de tu año. ¡A bailar!', temas: tres(p.tema), etapa: etapa(p), voz: '¡Terminaste ' + nombreTema + '! ¡Qué gran trabajo!' });
  }
  function celebraAnio(p){
    return baila({ titulo: '¡Terminaste el año ' + p.anio + '!', sub: 'Todos los ajolotes bailan contigo.', temas: TEMAS, etapa: etapa(p), ms: 14000, voz: '¡Terminaste el año ' + p.anio + '! ¡Todos los ajolotes bailan contigo!' });
  }
  // Temas terminados del año del perfil (todos sus pasos hechos)
  function estado(p){
    var out = { temas: {}, anio: false }; if (!window.Rutas || !window.Perf) return out;
    var ps = Rutas.pasos(p.taller, p.anio), g = {}, todo = ps.length > 0;
    ps.forEach(function(s){ var h = !!Perf.hecho(p, s.p, s.b, s.l); if (!(s.p in g)) g[s.p] = true; if (!h){ g[s.p] = false; todo = false; } });
    Object.keys(g).forEach(function(k){ if (g[k]) out.temas[k] = true; }); out.anio = todo; return out;
  }
  var base = null;
  function revisa(){
    try {
      var p = window.Perf && Perf.activo && Perf.activo(); if (!p || !window.Rutas) return;
      var e = estado(p), K = p.id + '|' + p.taller + '-' + p.anio, ya = lee(), li = ya[K] = ya[K] || [];
      if (!base || base.k !== K){ base = { k: K, temas: JSON.parse(JSON.stringify(e.temas)), anio: e.anio }; return; }
      if (e.anio && !base.anio && li.indexOf('anio') < 0){ li.push('anio'); guarda(ya); base.anio = true; Object.keys(e.temas).forEach(function(k){ base.temas[k] = true; if (li.indexOf('t:' + k) < 0) li.push('t:' + k); }); guarda(ya); celebraAnio(p); return; }
      var nuevo = Object.keys(e.temas).filter(function(k){ return !base.temas[k] && li.indexOf('t:' + k) < 0; })[0];
      if (nuevo){ li.push('t:' + nuevo); base.temas[nuevo] = true; guarda(ya); celebraTema(p, (Rutas.TEMA && Rutas.TEMA[nuevo]) || nuevo); }
    } catch (x) {}
  }
  window.Baile = { revisa: revisa, tema: celebraTema, anio: celebraAnio, baila: baila, estado: estado };
  // Línea base al cargar (así solo se celebra lo que se termina jugando ahora)
  function inicia(){ try { var p = window.Perf && Perf.activo && Perf.activo(); if (p && window.Rutas){ var e = estado(p); base = { k: p.id + '|' + p.taller + '-' + p.anio, temas: e.temas, anio: e.anio }; } } catch (x) {} }
  if (window.Rutas) inicia(); else { var s = document.createElement('script'); s.src = 'rutas.js'; s.onload = inicia; document.head.appendChild(s); }
})();
