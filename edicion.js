/* Edición especial «Niños y Niñas de la Sierra»: dedicatoria de Inès y Adrián.
   Solo se activa si edicion-config.js define window.EDICION (lo hace la compilación especial de Android). */
(function(){
  var E = window.EDICION; if (!E || E.id !== 'sierra') return;
  function el(t, c, x){ var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  var TIT = 'Para los Niños y Niñas de la Sierra',
      TX1 = 'Este ajolote llega con mucho cariño de Inès y Adrián.',
      TX2 = 'Ellos probaron cada taller antes que nadie y quisieron compartirlos con ustedes. ¡Ojalá se diviertan tanto como ellos!',
      FIR = 'Con amor, Inès y Adrián 💛';
  function axo(){ var d = el('div', 'ed-axo'); d.setAttribute('aria-hidden', 'true'); try { if (window.Ilu) d.innerHTML = Ilu.html('axo_feliz', { tema: 'rosa' }); } catch (e) {} return d; }
  // Tarjeta fija en el inicio y en créditos
  function tarjeta(){ var c = el('section', 'ed-card'); c.setAttribute('aria-label', 'Dedicatoria'); c.appendChild(axo()); var t = el('div', 'ed-tx'); t.appendChild(el('h2', null, TIT)); t.appendChild(el('p', null, TX1 + ' ' + TX2)); t.appendChild(el('p', 'ed-fir', FIR)); c.appendChild(t); return c; }
  function monta(){
    var ancla = document.querySelector('.mapa') || document.querySelector('header') || document.querySelector('.wrap h1');
    if (/index\.html$|\/$/.test(location.pathname) && document.querySelector('.hero')){ var h = document.querySelector('.hero'); h.parentNode.insertBefore(tarjeta(), h.nextSibling); }
    else if (/creditos\.html$/.test(location.pathname)){ var s = document.querySelector('.wrap section.tray'); if (s) s.parentNode.insertBefore(tarjeta(), s); }
    // Primera vez: ventana de bienvenida
    var visto = false; try { visto = localStorage.getItem('tm_ed_visto') === '1'; } catch (e) {}
    if (!visto && document.querySelector('.hero')){
      var ov = el('div', 'ed-ov'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', TIT);
      var bx = el('div', 'ed-bx'); bx.appendChild(axo()); bx.appendChild(el('h2', null, TIT)); bx.appendChild(el('p', null, TX1)); bx.appendChild(el('p', null, TX2)); bx.appendChild(el('p', 'ed-fir', FIR));
      var b = el('button', 'ed-go', '¡Vamos a jugar!'); b.type = 'button'; b.onclick = function(){ try { localStorage.setItem('tm_ed_visto', '1'); } catch (e) {} ov.remove(); }; bx.appendChild(b); ov.appendChild(bx); document.body.appendChild(ov); setTimeout(function(){ b.focus(); }, 80);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(monta, 50); }); else setTimeout(monta, 50);
})();
