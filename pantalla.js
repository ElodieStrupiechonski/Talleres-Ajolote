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

  // Seguimiento de nivel (siempre visible): lee el selector .niv de la bandeja activa y cuenta aciertos por nivel
  var META = 5, stats = trays.map(function(){ return { n: {}, flag: false }; });
  var track = el('aside', 'pf-track'); track.setAttribute('aria-label', 'Seguimiento de nivel'); document.body.appendChild(track);
  function nivInfo(tr){
    var nv = tr.querySelector('.niv'); if (!nv || nv.hidden || nv.offsetParent === null) return null;
    var bs = [].slice.call(nv.querySelectorAll('button')); if (!bs.length) return null;
    var lv = bs.findIndex(function(b){ return b.classList.contains('on'); }); if (lv < 0) lv = 0;
    var nm = nv.querySelector('.lbl2:last-child'); return { bs: bs, lv: lv, name: nm ? nm.textContent : '' };
  }
  function renderTrack(){
    var tr = trays[cur], info = nivInfo(tr), st = stats[cur]; track.innerHTML = '';
    if (!info){ track.appendChild(el('p', 'pt-free', 'Actividad libre: sin niveles aquí.')); return; }
    var c = st.n[info.lv] || 0, done = Math.min(c, META);
    track.appendChild(el('p', 'pt-h', 'Nivel ' + (info.lv + 1) + ' de ' + info.bs.length));
    track.appendChild(el('p', 'pt-n', info.name));
    var pips = el('div', 'pt-pips'); pips.setAttribute('aria-hidden', 'true');
    info.bs.forEach(function(b, k){ var p = el('i'); if ((st.n[k] || 0) >= META) p.className = 'dn'; if (k === info.lv) p.className += ' cu'; pips.appendChild(p); });
    track.appendChild(pips);
    var stars = el('p', 'pt-s'); for (var k = 0; k < META; k++) stars.appendChild(el('span', k < done ? 'on' : '', k < done ? '★' : '☆'));
    stars.setAttribute('aria-label', done + ' de ' + META + ' aciertos'); track.appendChild(stars);
    track.appendChild(el('p', 'pt-c', done + ' de ' + META + ' aciertos en este nivel'));
    if (c >= META){ track.appendChild(el('p', 'pt-ok', info.lv < info.bs.length - 1 ? '¡Nivel superado!' : '¡Último nivel superado!'));
      if (info.lv < info.bs.length - 1){ var up = el('button', 'pt-btn', 'Subir de nivel'); up.type = 'button'; up.onclick = function(){ info.bs[info.lv + 1].click(); }; track.appendChild(up); } }
    var rs = el('button', 'pt-btn', 'Reiniciar'); rs.type = 'button';
    rs.onclick = function(){ st.n = {}; st.flag = false; var i2 = nivInfo(tr); if (i2 && i2.lv !== 0) i2.bs[0].click(); else renderTrack(); };
    track.appendChild(rs);
  }
  var OKRE = /¡(Correcto|Exacto|Compás completo)/;
  trays.forEach(function(tr, i){
    new MutationObserver(function(){
      var st = stats[i], ok = [].some.call(tr.querySelectorAll('.ok'), function(e){ return OKRE.test(e.textContent); });
      if (ok && !st.flag){ st.flag = true; var inf = nivInfo(tr); if (inf) st.n[inf.lv] = (st.n[inf.lv] || 0) + 1; }
      else if (!ok) st.flag = false;
      if (i === cur) { clearTimeout(tr._rt); tr._rt = setTimeout(renderTrack, 30); }
    }).observe(tr, { childList: true, subtree: true, characterData: true });
  });

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
    fit(i, true); window.scrollTo(0, 0); renderTrack();
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
