/* Pantalla completa + horizontal (solo navegadores: en la app de Android no hace falta).
   Esconde las barras del navegador (en un teléfono ganan ~60 px de alto) y, donde se puede, bloquea la orientación en horizontal.
   Cada taller es una página distinta y el navegador sale de pantalla completa al navegar: se recuerda la elección y se restablece con el primer toque. */
(function(){
  var K = 'tm_fs', saliendo = false, botones = [];
  var raiz = document.documentElement;
  function soporta(){ return !!(raiz.requestFullscreen || raiz.webkitRequestFullscreen); }
  function enApp(){ try { return !!window.Capacitor || window.matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches; } catch (e) { return false; } }
  function activa(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function marca(v){ try { sessionStorage.setItem(K, v ? '1' : '0'); } catch (e) {} }
  function quiere(){ try { return sessionStorage.getItem(K) === '1'; } catch (e) { return false; } }
  function entra(){
    var p; try { p = (raiz.requestFullscreen || raiz.webkitRequestFullscreen).call(raiz, { navigationUI: 'hide' }); } catch (e) { return; }
    Promise.resolve(p).then(function(){ marca(true); try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function(){}); } catch (e) {} pinta(); }).catch(function(){});
  }
  function sale(){
    marca(false); try { (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {} pinta();
  }
  function alterna(){ if (activa()) sale(); else entra(); }
  var ICO_ON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var ICO_OFF = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  function pinta(){ var on = activa(); botones.forEach(function(b){ b.innerHTML = (on ? ICO_OFF : ICO_ON) + '<span>' + (on ? 'Salir' : 'Pantalla completa') + '</span>'; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? 'Salir de pantalla completa' : 'Pantalla completa'); }); }
  function montar(slot){
    if (!slot || !soporta() || enApp() || slot.querySelector('.fs-btn')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'snd-btn fs-btn'; b.onclick = alterna; botones.push(b);
    var ref = slot.querySelector('.mus-btn') || slot.querySelector('.snd-btn'); if (ref && ref.nextSibling) slot.insertBefore(b, ref.nextSibling); else slot.appendChild(b); pinta();
  }
  window.addEventListener('pagehide', function(){ saliendo = true; });
  document.addEventListener('fullscreenchange', function(){ if (!activa() && !saliendo) marca(false); pinta(); });
  document.addEventListener('webkitfullscreenchange', function(){ if (!activa() && !saliendo) marca(false); pinta(); });
  // Con el primer toque de cada página se recupera la pantalla completa si la habían pedido
  document.addEventListener('pointerdown', function(){ if (soporta() && !enApp() && quiere() && !activa()) entra(); }, { capture: true });
  window.PCompleta = { montar: montar, entra: entra, sale: sale, alterna: alterna, activa: activa, disponible: function(){ return soporta() && !enApp(); } };
  [].forEach.call(document.querySelectorAll('.snd-btn:not(.fs-btn)'), function(s){ montar(s.parentNode); });
})();
