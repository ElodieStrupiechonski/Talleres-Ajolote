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
  var tit = el('div', 'pf-tit'), nombre = (location.pathname.split('/').pop() || '').replace('.html', '');
  if (window.Ilu && Ilu.titulo('icono_' + nombre)){ var ico = el('span', 'pf-ico'); ico.innerHTML = Ilu.html('icono_' + nombre); tit.appendChild(ico); }
  if (h1) tit.appendChild(h1);
  top.appendChild(tit);
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
  // El ajolote reacciona: celebra un acierto, "casi" ante un error
  var mas = el('div', 'pf-mas'), masT = null;
  var big = el('div', 'pf-mas-big'), bub = el('div', 'pf-bub'), bigSv = el('div', 'pf-mas-sv'); big.appendChild(bub); big.appendChild(bigSv); document.body.appendChild(big);
  var FRASES = { celebra: ['¡Muy bien!', '¡Lo lograste!', '¡Genial!', '¡Sigue así!', '¡Qué listo!'], casi: ['¡Casi!', 'Inténtalo otra vez', '¡Tú puedes!', 'Piénsalo con calma'], piensa: ['Hmm…'] };
  // Perfil del niño: se guarda solo en este dispositivo (localStorage), no se envía a ningún lado
  var jugador = '';
  function quien(){ var p = window.Perf && Perf.activo(); jugador = p ? p.nombre : ''; return p; }
  quien();
  function conNombre(f){ if (!jugador) return f; var ex = /!$/.test(f); return (ex ? f.slice(0, -1) : f) + ', ' + jugador + (ex ? '!' : ''); }
  function temaAct(){ var p = window.Perf && Perf.activo(); return p ? p.tema : Ilu.tema(nombre); }
  function di(txt, ms){ bub.textContent = txt; bub.classList.toggle('on', !!txt); if (ms) setTimeout(function(){ if (bub.textContent === txt && !masT) { bub.classList.remove('on'); } }, ms); }
  function mood(e, ms){ if (!window.Ilu) return; var sv = Ilu.html('axo_' + e, {tema: temaAct()}); mas.innerHTML = sv; bigSv.innerHTML = sv;
    var f = FRASES[e]; bub.textContent = f ? conNombre(f[Math.floor(Math.random() * f.length)]) : ''; bub.classList.toggle('on', !!f);
    clearTimeout(masT); masT = null; if (ms) masT = setTimeout(function(){ masT = null; mood('feliz'); }, ms); }
  mood('feliz');
  var track = el('aside', 'pf-track'); track.setAttribute('aria-label', 'Seguimiento de nivel'); document.body.appendChild(track);
  var who = el('button', 'pf-who'), body = el('div', 'pt-body'), emoBox = el('div', 'pf-emo-w');
  who.type = 'button';
  function pintaWho(){ var p = quien(); who.innerHTML = ''; var av = el('span', 'pu-av'); av.innerHTML = Ilu.html('axo_feliz', {tema: temaAct()}); who.appendChild(av);
    who.appendChild(el('span', 't', p ? p.nombre : '¿Quién juega?')); who.setAttribute('aria-label', p ? 'Jugador: ' + p.nombre + '. Cambiar' : 'Elegir quién juega'); }
  who.onclick = function(){ PerfUI.elegir(function(){ cargaStats(); pintaWho(); mood('celebra', 2500); bub.textContent = jugador ? '¡Hola, ' + jugador + '!' : '¡Hola!'; renderTrack(); }); };
  track.appendChild(who); track.appendChild(body);
  function cargaStats(){ stats.forEach(function(s){ s.n = {}; s.flag = false; }); }
  function emoStrip(){ var w = emoBox; w.innerHTML = ''; if (!Perf.activo()) return; w.className = 'pf-emo-w'; w.appendChild(el('p', 'pf-emo-l', '¿Cómo me siento?')); var r = el('div', 'pf-emo');
    Perf.EMO.forEach(function(e){ var b = el('button'); b.type = 'button'; b.setAttribute('aria-label', Perf.EMOL[e]); b.title = Perf.EMOL[e]; b.innerHTML = Ilu.html('emo_' + e);
      b.onclick = function(){ var inf = nivInfo(trays[cur]); Perf.emocion(nombre, cur + 1, inf ? inf.lv + 1 : 0, e, 'ahora'); b.classList.add('on'); setTimeout(function(){ b.classList.remove('on'); }, 900); }; r.appendChild(b); }); w.appendChild(r); }
  function nivInfo(tr){
    var nv = tr.querySelector('.niv'); if (!nv || nv.hidden || nv.offsetParent === null) return null;
    var bs = [].slice.call(nv.querySelectorAll('button')); if (!bs.length) return null;
    var lv = bs.findIndex(function(b){ return b.classList.contains('on'); }); if (lv < 0) lv = 0;
    var nm = nv.querySelector('.lbl2:last-child'); return { bs: bs, lv: lv, name: nm ? nm.textContent : '' };
  }
  function renderTrack(){
    var tr = trays[cur], info = nivInfo(tr), st = stats[cur]; body.innerHTML = '';
    emoStrip();
    var hd = el('div', 'pt-hd'), tx = el('div', 'pt-tx'); hd.appendChild(mas); hd.appendChild(tx); body.appendChild(hd);
    if (!info){ tx.appendChild(el('p', 'pt-free', 'Actividad libre')); body.appendChild(emoBox); return; }
    info.bs.forEach(function(b, k){ if (st.n[k] === undefined) st.n[k] = Perf.get(nombre, cur + 1, k + 1); });
    var c = st.n[info.lv] || 0, done = Math.min(c, META);
    tx.appendChild(el('p', 'pt-h', 'Nivel ' + (info.lv + 1) + ' de ' + info.bs.length));
    tx.appendChild(el('p', 'pt-n', info.name));
    var pips = el('div', 'pt-pips'); pips.setAttribute('aria-hidden', 'true');
    info.bs.forEach(function(b, k){ var p = el('i'); if ((st.n[k] || 0) >= META) p.className = 'dn'; if (k === info.lv) p.className += ' cu'; pips.appendChild(p); });
    body.appendChild(pips);
    var stars = el('p', 'pt-s'); for (var k = 0; k < META; k++) stars.appendChild(el('span', k < done ? 'on' : '', k < done ? '★' : '☆'));
    stars.setAttribute('aria-label', done + ' de ' + META + ' aciertos'); body.appendChild(stars);
    body.appendChild(el('p', 'pt-c', done + ' de ' + META + ' aciertos en este nivel'));
    if (c >= META){ body.appendChild(el('p', 'pt-ok', info.lv < info.bs.length - 1 ? '¡Nivel superado!' : '¡Último nivel superado!'));
      if (info.lv < info.bs.length - 1){ var up = el('button', 'pt-btn', 'Subir de nivel'); up.type = 'button'; up.onclick = function(){ info.bs[info.lv + 1].click(); }; body.appendChild(up); } }
    var rs = el('button', 'pt-btn', 'Reiniciar'); rs.type = 'button';
    rs.onclick = function(){ st.n = {}; st.flag = false; Perf.reset(nombre, cur + 1); var i2 = nivInfo(tr); if (i2 && i2.lv !== 0) i2.bs[0].click(); else renderTrack(); };
    body.appendChild(rs); body.appendChild(emoBox);
  }
  var OKRE = /¡(Correcto|Exacto|Compás completo)/;
  trays.forEach(function(tr, i){
    new MutationObserver(function(){
      var st = stats[i], ok = [].some.call(tr.querySelectorAll('.ok'), function(e){ return OKRE.test(e.textContent); });
      var bad = tr.querySelector('.bad'); if (bad && !st.badf){ st.badf = true; if (i === cur) mood('casi', 2500); } else if (!bad) st.badf = false;
      if (ok && !st.flag){ st.flag = true; if (i === cur) mood('celebra', 3000); var inf = nivInfo(tr); if (inf){ st.n[inf.lv] = (st.n[inf.lv] || 0) + 1; var tot = Perf.inc(nombre, i + 1, inf.lv + 1); if (Perf.activo() && tot === META && i === cur) setTimeout(function(){ PerfUI.chequeo('¡Nivel superado! ¿Cómo te sentiste?', function(e){ if (e) Perf.emocion(nombre, i + 1, inf.lv + 1, e, 'fin'); }); }, 1800); } }
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
    fit(i, true); window.scrollTo(0, 0); Perf.visita(nombre, i + 1); renderTrack();
  }
  function later(force){ clearTimeout(timer); timer = setTimeout(function(){ fit(cur, force); }, 120); }
  new MutationObserver(function(){ if (!fitting) later(false); }).observe(wrap, { childList: true, subtree: true, characterData: true });
  window.addEventListener('resize', function(){ later(true); });
  window.addEventListener('orientationchange', function(){ later(true); });
  document.addEventListener('click', function(){ setTimeout(function(){ if (!fitting) fit(cur, false); }, 250); });
  cargaStats(); pintaWho();
  var hm = /^#b(\d+)(?:n(\d+))?$/.exec(location.hash), b0 = hm ? Math.min(+hm[1], trays.length) - 1 : 0;
  show(b0 < 0 ? 0 : b0);
  if (hm && hm[2]){ var i0 = nivInfo(trays[cur]); if (i0 && i0.bs[+hm[2] - 1]) i0.bs[+hm[2] - 1].click(); }
  if (!Perf.activo() && !Perf.lista().length) setTimeout(function(){ who.click(); }, 600);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fit(cur, true); });
  window.PF.show = show; window.PF.fit = function(f){ fit(cur, f !== false); };
})();
