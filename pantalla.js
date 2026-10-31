// Pantalla fija: una bandeja a la vez, ajustada a la pantalla (sin deslizar), con navegación entre bandejas.
(function(){
  if (/(^|\/)(index\.html)?$|creditos\.html$|probar-botones\.html$/.test(location.pathname)) return;
  var wrap = document.querySelector('.wrap');
  var trays = [].slice.call(document.querySelectorAll('.wrap .tray'));
  if (!wrap || !trays.length) return;
  var MIN = 0.7, MAX = 1.3, cur = 0, scale = [], fitting = false, timer = null;
  document.body.classList.add('pf');

  function el(t, c, x){ var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }

  // Barra superior: volver, título, y huecos para sonido / resumen
  var top = el('div', 'pf-top'), back = document.querySelector('.back'), h1 = document.querySelector('h1');
  if (back) top.appendChild(back);
  if (h1) top.appendChild(h1);
  top.appendChild(el('span', 'pf-sp'));
  var slot = el('span', 'pf-slot'); top.appendChild(slot);
  var cr = document.createElement('a'); cr.href = 'creditos.html'; cr.className = 'pf-cr'; cr.textContent = 'Créditos'; top.appendChild(cr);
  document.body.insertBefore(top, document.body.firstChild);
  var rb = document.querySelector('.res-btn'); if (rb) slot.appendChild(rb);
  window.PF = { slot: slot };
  if (window.Snd) Snd.montar(slot);

  // Barra inferior con una pestaña por bandeja
  var nav = el('nav', 'pf-nav'); nav.setAttribute('aria-label', 'Bandejas');
  trays.forEach(function(tr, i){
    var st = tr.querySelector('.step'), h2 = tr.querySelector('h2');
    var txt = st ? st.textContent.replace(/^Bandeja\s*/i, '') : String(i + 1);
    var inner = el('div', 'pf-inner');
    while (tr.firstChild) inner.appendChild(tr.firstChild);
    tr.appendChild(inner);
    var b = el('button', 'pf-tab', txt); b.type = 'button';
    if (h2) b.title = h2.textContent;
    b.onclick = function(){ show(i); };
    nav.appendChild(b); scale[i] = 1;
  });
  document.body.appendChild(nav);

  function box(tr){ var cs = getComputedStyle(tr); return { w: tr.clientWidth, h: tr.clientHeight }; }
  function natural(tr, s){ var inner = tr.firstChild, b = box(tr); inner.style.width = (b.w / s) + 'px'; inner.style.setProperty('--pfh', (b.h / s) + 'px'); inner.style.transform = 'scale(' + s + ')'; return inner.offsetHeight; }
  function fit(i, force){
    var tr = trays[i]; if (!tr.classList.contains('pf-on')) return;
    fitting = true;
    var b = box(tr), s0 = scale[i], best = null;
    if (!force){ var h0 = natural(tr, s0); if (h0 * s0 <= b.h + 1){ var ok0 = true; } }
    if (!force && ok0){
      // ¿cabe con holgura suficiente para crecer? solo si la ganancia vale la pena
      var cand = s0; for (var s = MAX; s > s0 + 0.09; s = Math.round((s - 0.05) * 100) / 100){ if (natural(tr, s) * s <= b.h + 1){ cand = s; break; } }
      best = cand;
    } else {
      for (var s2 = MAX; s2 >= MIN - 0.001; s2 = Math.round((s2 - 0.05) * 100) / 100){ if (natural(tr, s2) * s2 <= b.h + 1){ best = s2; break; } }
      if (best == null) best = MIN;
    }
    scale[i] = best; var h = natural(tr, best);
    tr.style.overflowY = (h * best > b.h + 1) ? 'auto' : 'hidden';
    tr.dataset.escala = best.toFixed(2);
    fitting = false;
  }
  function show(i){
    cur = i;
    trays.forEach(function(t, k){ t.classList.toggle('pf-on', k === i); });
    [].forEach.call(nav.children, function(b, k){ b.classList.toggle('on', k === i); });
    var e = document.createEvent('Event'); e.initEvent('pointerdown', true, true); trays[i].dispatchEvent(e);
    fit(i, true); window.scrollTo(0, 0);
  }
  function later(force){ clearTimeout(timer); timer = setTimeout(function(){ fit(cur, force); }, 120); }
  new MutationObserver(function(){ if (!fitting) later(false); }).observe(wrap, { childList: true, subtree: true, characterData: true });
  window.addEventListener('resize', function(){ later(true); });
  window.addEventListener('orientationchange', function(){ later(true); });
  document.addEventListener('click', function(){ setTimeout(function(){ if (!fitting) fit(cur, false); }, 250); });
  show(0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fit(cur, true); });
  window.PF.show = show; window.PF.fit = function(f){ fit(cur, f !== false); };
})();
