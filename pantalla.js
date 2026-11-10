// Pantalla fija: una bandeja a la vez, ajustada a la pantalla (sin deslizar), con navegación entre bandejas.
(function(){
  if (/(^|\/)(index\.html)?$|creditos\.html$|probar-botones\.html$/.test(location.pathname)) return;
  var wrap = document.querySelector('.wrap');
  var trays = [].slice.call(document.querySelectorAll('.wrap .tray'));
  if (!wrap || !trays.length) return;
  var MIN = 0.5, MAX = 1.8, cur = 0, scale = [], fitting = false, timer = null;
  document.body.classList.add('pf');
  var SUG = {
    'divisiones:2': 'Elige 12 galletas y 3 platos y reparte. Luego prueba con 13: ¿qué pasa con la que sobra?',
    'divisiones:3': 'Pon «Cuántas» en 20 y el tamaño del grupo en 5. Luego prueba 23 con 8: ¿cuántas sobran?',
    'dorado:1': 'Forma el número 1 235: 1 cubo, 2 placas, 3 barras y 5 cuentas.',
    'decimal:1': 'Toca la casilla de la fila 3 y la columna 4. ¿Qué número sale? Prueba otra.',
    'cadenas:2': 'Toca la casilla de la fila 3 y la columna 4. Cuenta las cuentas del rectángulo.',
    'ajedrez:2': 'Elige el caballo y toca una casilla. Cuenta los puntos verdes: son sus movimientos.',
    'dibujo:1': 'Dibuja una forma con el dedo. Después cambia el número de sectores y mira qué pasa.',
    'probabilidad:1': 'Lanza la moneda 20 veces. ¿Salió águila la mitad de las veces?',
    'ritmo:1': 'Arrastra figuras hasta llenar el compás: cuando suma 1, está completo.',
    'angulos:1': 'Abre el ángulo hasta que sea recto (90°). Luego ábrelo hasta 180°.'
  };

  function setVh(){ var v = window.visualViewport ? window.visualViewport.height : window.innerHeight; if (v > 200) document.documentElement.style.setProperty('--vh', Math.round(v) + 'px'); }
  setVh(); window.addEventListener('resize', setVh); window.addEventListener('orientationchange', function(){ setTimeout(setVh, 300); }); if (window.visualViewport) window.visualViewport.addEventListener('resize', setVh);

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
    var b = el('button', 'pf-tab', txt); b.type = 'button'; b.setAttribute('data-n', (/^\d+/.exec(txt) || [String(i + 1)])[0]);
    if (h2) b.title = h2.textContent;
    b.onclick = function(){ show(i); };
    nav.appendChild(b); scale[i] = 1;
  });
  document.body.appendChild(nav);

  // Seguimiento de nivel (siempre visible): lee el selector .niv de la bandeja activa y cuenta aciertos por nivel
  var META = 5, stats = trays.map(function(){ return { n: {}, flag: false }; });
  // El ajolote reacciona: celebra un acierto, "casi" ante un error
  var mas = el('div', 'pf-mas'), masT = null;
  var side = el('div', 'pf-side'), big = el('div', 'pf-mas-big'), bub = el('div', 'pf-bub'), bigSv = el('div', 'pf-mas-sv'), masNom = el('div', 'pf-mas-nom');
  var bubA = el('span', 'pf-ba'), bubT2 = el('span', 'pf-bt'); bub.appendChild(bubA); bub.appendChild(bubT2); bub.setAttribute('role', 'status'); bigSv.setAttribute('role', 'button'); bigSv.tabIndex = 0; big.appendChild(bub); big.appendChild(bigSv); big.appendChild(masNom); document.body.appendChild(side);
  var FRASES = { celebra: ['¡Muy bien!', '¡Lo lograste!', '¡Genial!', '¡Sigue así!', '¡Qué listo!'], casi: ['¡Casi!', 'Inténtalo otra vez', '¡Tú puedes!', 'Piénsalo con calma'], piensa: ['Hmm…'] };
  // Perfil del niño: se guarda solo en este dispositivo (localStorage), no se envía a ningún lado
  var jugador = '';
  function quien(){ var p = window.Perf && Perf.activo(); jugador = p ? p.nombre : ''; return p; }
  quien();
  function conNombre(f){ if (!jugador) return f; var ex = /!$/.test(f); return (ex ? f.slice(0, -1) : f) + ', ' + jugador + (ex ? '!' : ''); }
  function temaAct(){ var p = window.Perf && Perf.activo(); return p ? p.tema : Ilu.tema(nombre); }
  var bubT = null;
  // La burbuja se queda el tiempo suficiente para leerla (más si el texto es largo)
  function di(txt){ clearTimeout(bubT); bubT2.textContent = txt || ''; if (txt){ var ms = document.querySelector('.pf-mas svg'); bubA.innerHTML = ms ? ms.outerHTML : ''; } bub.classList.toggle('on', !!txt); if (txt) bubT = setTimeout(function(){ bub.classList.remove('on'); }, Math.max(7000, 2500 + 90 * txt.length)); }
  function mood(e, ms){ if (!window.Ilu) return; var sv = Ilu.html('axo_' + e, {tema: temaAct()}); mas.innerHTML = sv; bigSv.innerHTML = sv;
    var f = FRASES[e]; if (f) di(conNombre(f[Math.floor(Math.random() * f.length)]));
    clearTimeout(masT); masT = null; if (ms) masT = setTimeout(function(){ masT = null; mood('feliz'); }, ms); }
  function masInfo(){ var p = window.Perf && Perf.activo(); return Perf.mascota(p, Ilu.tema(nombre)); }
  function pintaNom(){ var m = masInfo(); masNom.textContent = m.nombre; masNom.title = m.nombre + (m.propio ? ' (en náhuatl: ' + m.nat + ', ' + m.sig + ')' : ' significa ' + m.sig + ' en náhuatl'); bigSv.setAttribute('aria-label', 'Mi ajolote ' + m.nombre + (Perf.activo() ? '. Tócalo para cambiarlo' : '')); }
  function saludo(){ var m = masInfo(), p = Perf.activo();
    if (window.matchMedia('(min-aspect-ratio:1/1) and (max-height:520px)').matches){ di(p ? '¡Hola, ' + p.nombre + '! Soy ' + m.nombre + '.' : '¡Hola! Soy ' + m.nombre + '.'); return; }
    di(p ? '¡Hola, ' + p.nombre + '! Soy ' + m.nombre + ' («' + m.sig + '» en náhuatl).' : '¡Hola! Soy ' + m.nombre + ' («' + m.sig + '» en náhuatl). Toca «¿Quién juega?» para guardar tu avance.'); }
  function cambiaMas(){ var p = Perf.activo(); if (!p) return; PerfUI.mascota(function(){ pintaWho(); pintaNom(); mood('celebra', 2500); di('¡Hola, ' + p.nombre + '! Soy ' + masInfo().nombre + '.'); }, p); }
  bigSv.addEventListener('click', cambiaMas); bigSv.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); e.stopPropagation(); cambiaMas(); } });
  mood('feliz');
  var track = el('aside', 'pf-track'); track.setAttribute('aria-label', 'Seguimiento de nivel'); side.appendChild(track); side.appendChild(big);
  var who = el('button', 'pf-who'), body = el('div', 'pt-body'), emoBox = el('div', 'pf-emo-w');
  who.type = 'button';
  // Primer año del Taller 1 (6-7 años, aprenden a leer): instrucciones en letra grande y negrita
  function lector(){ var p = window.Perf && Perf.activo(); document.body.classList.toggle('pf-lector', !!(p && +p.taller === 1 && +p.anio === 1)); }
  lector();
  function pintaWho(){ lector(); var p = quien(); who.innerHTML = ''; var av = el('span', 'pu-av'); av.innerHTML = Ilu.html('axo_feliz', {tema: temaAct()}); who.appendChild(av);
    who.appendChild(el('span', 't', p ? p.nombre : '¿Quién juega?')); who.setAttribute('aria-label', p ? 'Jugador: ' + p.nombre + '. Cambiar' : 'Elegir quién juega'); }
  who.onclick = function(){ PerfUI.elegir(function(){ cargaStats(); pintaWho(); pintaNom(); mood('celebra', 2500); saludo(); renderTrack(); }); };
  track.appendChild(who); track.appendChild(body);
  function cargaStats(){ stats.forEach(function(s){ s.n = {}; s.flag = false; }); }
  function emoStrip(){ return; var w = emoBox; w.innerHTML = ''; if (!Perf.activo()) return; w.className = 'pf-emo-w'; w.appendChild(el('p', 'pf-emo-l', '¿Cómo me siento?')); var r = el('div', 'pf-emo');
    Perf.EMO.forEach(function(e){ var b = el('button'); b.type = 'button'; b.setAttribute('aria-label', Perf.EMOL[e]); b.title = Perf.EMOL[e]; b.innerHTML = Ilu.html('emo_' + e);
      b.onclick = function(){ var inf = nivInfo(trays[cur]); Perf.emocion(nombre, cur + 1, inf ? inf.lv + 1 : 0, e, 'ahora'); b.classList.add('on'); setTimeout(function(){ b.classList.remove('on'); }, 900); }; r.appendChild(b); }); w.appendChild(r); }
  // La encuesta «¿Cómo te sentiste?» no sale en cada reto: solo al terminar todos los retos de una bandeja o,
  // en los demás niveles, cuando han pasado al menos 10 minutos desde la última.
  function quiereChequeo(inf){
    var st = stats[cur], todos = inf.un ? inf.bs.every(function(b, k){ return (st.n[k] || 0) >= META; }) : true;
    if (inf.un && !todos) return false;
    var t = 0; try { t = +sessionStorage.getItem('tm_chq') || 0; } catch (e) {}
    if (Date.now() - t < 10 * 60000) return false;
    try { sessionStorage.setItem('tm_chq', String(Date.now())); } catch (e) {}
    return true;
  }
  function nivInfo(tr){
    var nv = tr.querySelector('.niv'), un = false; if (!nv){ nv = tr.querySelector('.chips.lv'); un = !!nv; } if (!nv || nv.hidden || nv.offsetParent === null) return null;
    var bs = [].slice.call(nv.querySelectorAll('button')); if (!bs.length) return null;
    var lv = bs.findIndex(function(b){ return b.classList.contains('on'); }); if (lv < 0) lv = 0;
    var nm = nv.querySelector('.lbl2:last-child'); return { bs: bs, lv: lv, name: (nm && !un) ? nm.textContent : '', un: un };
  }
  // ¿Ya se superó todo en esta bandeja? ¿Cuál es el paso siguiente?
  function sigBandeja(){
    if (cur < trays.length - 1) return { txt: 'Siguiente bandeja →', go: function(){ show(cur + 1); } };
    return { txt: 'Elegir otro tema →', go: function(){ location.href = Perf.activo() ? 'camino.html' : 'index.html'; } };
  }
  function marcaSig(on){ [].forEach.call(nav.children, function(b, k){ b.classList.toggle('pf-pulse', !!on && k === cur + 1); }); }
  function ganttDe(info, st){
    var g = el('div', 'gantt'); g.setAttribute('aria-hidden', 'true');
    info.bs.forEach(function(b, k){
      var c = Math.min(st.n[k] || 0, META), s = el('div', 'gs' + (c >= META ? ' dn' : '') + (k === info.lv ? ' cu' : '')), f = el('i');
      f.style.width = (info.un ? (c >= META ? 100 : 0) : 100 * c / META) + '%'; s.appendChild(f);
      if (info.bs.length <= 8) s.appendChild(el('span', null, String(k + 1)));
      g.appendChild(s); });
    return g;
  }
  function btnSig(txt, fn){ var b = el('button', 'pt-btn pf-pulse', txt); b.type = 'button'; b.onclick = fn; return b; }
  function renderTrack(){
    var tr = trays[cur], info = nivInfo(tr), st = stats[cur]; body.innerHTML = ''; marcaSig(false);
    emoStrip();
    var hd = el('div', 'pt-hd'), tx = el('div', 'pt-tx'); hd.appendChild(mas); hd.appendChild(tx); body.appendChild(hd);
    if (!info){
      tx.appendChild(el('p', 'pt-free', 'Actividad libre: explora'));
      var sgT = SUG[nombre + ':' + (cur + 1)] || tr.querySelector('.pf-sug') && tr.querySelector('.pf-sug').textContent.replace(/^[^:]*:\s*/, '');
      if (sgT){ var sp = el('p', 'pt-sug'); sp.innerHTML = '🎯 <b>Prueba esto:</b> '; sp.appendChild(document.createTextNode(sgT)); body.appendChild(sp); }
      var listo = (st.mut || 0) >= 8 && Date.now() - (st.t0 || 0) >= 15000;
      if (listo){ var sg = sigBandeja(); body.appendChild(btnSig(sg.txt, sg.go)); marcaSig(cur < trays.length - 1); }
      else { clearTimeout(tr._eg); tr._eg = setTimeout(function(){ if (cur === trays.indexOf(tr)) renderTrack(); }, Math.max(500, 15000 - (Date.now() - (st.t0 || Date.now())) + 60)); }
      body.appendChild(emoBox); return; }
    info.bs.forEach(function(b, k){ if (st.n[k] === undefined) st.n[k] = Perf.get(nombre, cur + 1, k + 1); });
    var c = st.n[info.lv] || 0, done = Math.min(c, META), N = info.bs.length;
    var todo = info.bs.every(function(b, k){ return (st.n[k] || 0) >= META; });
    tx.appendChild(el('p', 'pt-lv', (info.un ? 'Reto ' : 'Nivel ') + (info.lv + 1) + ' de ' + N));
    if (info.name) tx.appendChild(el('p', 'pt-nm', info.name));
    body.appendChild(ganttDe(info, st));
    if (info.un){
      var rs0 = c >= META, nres = info.bs.filter(function(b, k){ return (st.n[k] || 0) >= META; }).length;
      var m0 = el('div', 'meta'); m0.appendChild(el('div', 'meta-t')).innerHTML = '<span>Retos</span><span>' + nres + ' de ' + N + '</span>';
      m0.appendChild(el('p', 'meta-f' + (rs0 ? ' ok2' : ''), todo ? '¡Terminaste todos los retos!' : rs0 ? '¡Reto resuelto! Sigue con otro.' : 'Resuelve este reto'));
      body.appendChild(m0);
      if (todo){ var sg0 = sigBandeja(); body.appendChild(btnSig(sg0.txt, sg0.go)); marcaSig(cur < trays.length - 1); }
      else if (rs0){ var nx = info.bs.findIndex(function(b, k){ return k > info.lv && (st.n[k] || 0) < META; }); if (nx < 0) nx = info.bs.findIndex(function(b, k){ return (st.n[k] || 0) < META; }); if (nx >= 0) body.appendChild(btnSig('Siguiente reto →', function(){ info.bs[nx].click(); })); }
      body.appendChild(emoBox); return; }
    // Aciertos para subir de nivel: META casillas que se llenan
    var m = el('div', 'meta'), bar = el('div', 'meta-b'), prev = (st.shown && st.shown.lv === info.lv) ? st.shown.done : done;
    m.appendChild(el('div', 'meta-t')).innerHTML = '<span>Aciertos</span><span>' + done + ' de ' + META + '</span>';
    for (var k = 0; k < META; k++){ var q = el('i', k < done ? 'on' + (k >= prev ? ' nw' : '') : ''); bar.appendChild(q); }
    bar.setAttribute('role', 'img'); bar.setAttribute('aria-label', done + ' de ' + META + ' aciertos'); m.appendChild(bar);
    st.shown = { lv: info.lv, done: done };
    var falta = META - done;
    m.appendChild(el('p', 'meta-f' + (c >= META ? ' ok2' : ''), c >= META ? (todo ? '¡Terminaste todos los niveles!' : '¡Nivel superado!') : (falta === 1 ? '¡Te falta 1 para subir!' : 'Te faltan ' + falta + ' para subir')));
    body.appendChild(m);
    if (c >= META){
      if (info.lv < N - 1){ var nl = info.bs.findIndex(function(b, k){ return k > info.lv && (st.n[k] || 0) < META; }); if (nl < 0) nl = info.lv + 1; body.appendChild(btnSig('Subir de nivel ↑', function(){ info.bs[nl].click(); })); }
      else { var sg = sigBandeja(); body.appendChild(btnSig(sg.txt, sg.go)); marcaSig(cur < trays.length - 1); }
    }
    var rs = el('button', 'pt-btn', 'Reiniciar'); rs.type = 'button';
    var armado = 0;
    rs.onclick = function(){ if (!armado){ armado = 1; rs.textContent = '¿Seguro? Toca otra vez'; rs.classList.add('pt-peligro'); setTimeout(function(){ armado = 0; rs.textContent = 'Reiniciar'; rs.classList.remove('pt-peligro'); }, 4000); return; } armado = 0; st.n = {}; st.flag = false; st.shown = null; Perf.reset(nombre, cur + 1); var i2 = nivInfo(tr); if (i2 && i2.lv !== 0) i2.bs[0].click(); else renderTrack(); };
    body.appendChild(rs); body.appendChild(emoBox);
  }
  // Parpadeo en el botón «Siguiente» (u «Otra», «Otro»…) cuando la respuesta fue correcta
  var SIGRE = /^[^A-Za-zÁ-ú]*(Siguiente|Otro|Otra|Nuevo|Nueva)/i;
  function pulseSig(tr){ [].forEach.call(tr.querySelectorAll('button'), function(b){ if (b.classList.contains('ayuda') || b.hidden || b.offsetParent === null) return; if (SIGRE.test(b.textContent)) b.classList.add('pf-pulse'); }); }
  function clearPulse(tr){ [].forEach.call(tr.querySelectorAll('.pf-pulse'), function(b){ b.classList.remove('pf-pulse'); }); }
  document.addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('.tray .pf-pulse'); if (b) b.classList.remove('pf-pulse'); }, true);

  // ---- Anti-repetición: si tras «Siguiente/Otro» aparece una pregunta con los mismos números que una de las últimas,
  // se vuelve a pulsar (hasta 8 veces). Los números se ordenan para detectar también 4×2 y 2×4. ----
  var HIST = [], reint = 0, auto = false;
  function firma(tr){ var c = (tr.firstChild || tr).cloneNode(true); [].forEach.call(c.querySelectorAll('.msg,.ok,.bad,.cn,.niv,.chips.lv,h2,.pf-sug,button.ayuda,.note,.step,.pt-sug'), function(e){ e.remove(); });
    var tx = (c.textContent || '').replace(/(Aciertos|Puntos|Racha|Intentos|Correctas|Retos?|Nivel)[:\s]*\d+(\s*(de|\/)\s*\d+)?/gi, ''), t = tx.match(/\d+(?:[.,]\d+)?/g); return t ? t.sort().join(',') : null; }
  function sigBtn(tr){ return [].filter.call(tr.querySelectorAll('button'), function(b){ return !b.classList.contains('ayuda') && !b.hidden && b.offsetParent !== null && SIGRE.test(b.textContent); })[0]; }
  setTimeout(function(){ var tr = trays[cur]; if (tr) HIST = [firma(tr)]; }, 600);
  document.addEventListener('click', function(e){
    if (auto) return; var b = e.target.closest && e.target.closest('.tray button'); if (!b || !SIGRE.test(b.textContent) || b.classList.contains('ayuda')) return;
    var tr = b.closest('.tray'); reint = 0;
    (function revisa(){ setTimeout(function(){
      var f = firma(tr);
      if (f !== null && HIST.indexOf(f) >= 0 && reint < 8){ var nb = sigBtn(tr); if (nb){ reint++; auto = true; nb.click(); auto = false; return revisa(); } }
      if (f !== null){ HIST.push(f); if (HIST.length > 3) HIST.shift(); }
    }, 70); })();
  }, false);
  var OKRE = /¡(Correcto|Exacto|Compás completo|Llegó|Lo lograste)/;
  trays.forEach(function(tr, i){
    new MutationObserver(function(){
      var st = stats[i], ok = [].some.call(tr.querySelectorAll('.ok'), function(e){ return OKRE.test(e.textContent); });
      st.mut = (st.mut || 0) + 1;
      var bad = tr.querySelector('.bad'); if (bad && !st.badf){ st.badf = true; if (i === cur) mood('casi', 2500); } else if (!bad) st.badf = false;
      if (ok && !st.flag){ st.flag = true; if (i === cur){ mood('celebra', 3000); setTimeout(function(){ pulseSig(tr); }, 90); } sesion('ok'); var inf = nivInfo(tr); if (inf){ st.n[inf.lv] = (st.n[inf.lv] || 0) + 1; if (inf.un) st.n[inf.lv] = META; var tot = inf.un ? Perf.marca(nombre, i + 1, inf.lv + 1) : Perf.inc(nombre, i + 1, inf.lv + 1); if (tot === META) sesion('nivel'); if (Perf.activo() && tot === META && i === cur && quiereChequeo(inf)) setTimeout(function(){ PerfUI.chequeo('¡Nivel superado! ¿Cómo te sentiste?', function(e){ if (e) Perf.emocion(nombre, i + 1, inf.lv + 1, e, 'fin'); }); }, 1800); } }
      else if (!ok){ st.flag = false; clearPulse(tr); }
      if (i === cur) { clearTimeout(tr._rt); tr._rt = setTimeout(renderTrack, 30); }
    }).observe(tr, { childList: true, subtree: true, characterData: true });
  });

  var mqC = window.matchMedia('(min-aspect-ratio:1/1) and (max-height:520px)');
  function box(tr){ var cs = getComputedStyle(tr); return { w: tr.clientWidth, h: tr.clientHeight }; }
  function natural(tr, s){ var inner = tr.firstChild, b = box(tr); inner.style.width = (b.w / s) + 'px'; inner.style.setProperty('--pfh', (b.h / (mqC.matches ? 1 : s)) + 'px'); inner.style.transform = 'scale(' + s + ')'; return inner.offsetHeight; }
  // Escala estable: se calcula al mostrar la bandeja, al girar la pantalla o al cargar las fuentes, con un margen
  // (HOLGURA) para que el contenido pueda crecer al iniciar una actividad sin que la pantalla "salte".
  // Durante el juego solo se reduce si el contenido de verdad ya no cabe (nunca crece sola).
  var HOLGURA = 1.06;
  // En teléfono horizontal la escala se queda en 1 (letra legible) y las imágenes se adaptan al alto con --vis (ver taller.css)
  function fit(i, force){
    var tr = trays[i]; if (!tr.classList.contains('pf-on')) return;
    fitting = true;
    var b = box(tr), s0 = scale[i], best = null;
    if (force){
      var MXc = mqC.matches ? 1 : MAX;
      for (var s2 = MXc; s2 >= MIN - 0.001; s2 = Math.round((s2 - 0.05) * 100) / 100){ if (natural(tr, s2) * s2 <= b.h / HOLGURA + 1){ best = s2; break; } }
      if (best == null){ for (var s3 = MXc; s3 >= MIN - 0.001; s3 = Math.round((s3 - 0.05) * 100) / 100){ if (natural(tr, s3) * s3 <= b.h + 1){ best = s3; break; } } }
      if (best == null) best = MIN;
    } else {
      best = s0;
      if (natural(tr, s0) * s0 > b.h + 1){ for (var s4 = s0; s4 >= MIN - 0.001; s4 = Math.round((s4 - 0.05) * 100) / 100){ best = s4; if (natural(tr, s4) * s4 <= b.h + 1) break; } }
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
    if (!stats[i].t0){ stats[i].t0 = Date.now(); stats[i].mut = 0; }
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
  var inv = false; try { inv = !!sessionStorage.getItem('tm_inv'); } catch (e) {}
  pintaNom();
  if (!Perf.activo() && !Perf.lista().length && !inv) setTimeout(function(){ who.click(); }, 600); else setTimeout(saludo, 700);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fit(cur, true); });

  // ---- Ayuda grande: se abre sobre la actividad, con letra grande y la opción de escucharla ----
  var ayAbierta = null;
  function lee(txt){ try { if (!('speechSynthesis' in window)) return; speechSynthesis.cancel(); var u = new SpeechSynthesisUtterance(txt); u.lang = 'es-MX'; u.rate = 0.9; speechSynthesis.speak(u); } catch (e) {} }
  function paraAyuda(tr){
    var h2 = tr.querySelector('h2'), partes = [], inner = tr.firstChild;
    var lead = [].slice.call(inner.children).filter(function(p){ return p.tagName === 'P' && !p.classList.contains('det') && !p.classList.contains('pf-sug') && !/^(note|big|goal|sc|lead)/.test(p.className) && p.textContent.length > 25 && !/Aciertos/.test(p.textContent); })[0];
    return { titulo: h2 ? h2.textContent : 'Ayuda', lead: lead ? lead.textContent : '', det: [].map.call(tr.querySelectorAll('.det'), function(d){ return d.innerHTML; }) };
  }
  function cierraAyuda(){ if (!ayAbierta) return; try { speechSynthesis.cancel(); } catch (e) {} ayAbierta.remove(); ayAbierta = null; }
  function abreAyuda(tr){
    cierraAyuda(); var d = paraAyuda(tr), ov = el('div', 'pf-ay'), bx = el('div', 'pf-ay-b'), av = el('div', 'pf-ay-av'), c = el('div', 'pf-ay-c'), t = el('div', 'pf-ay-t');
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Ayuda');
    var ms = document.querySelector('.pf-mas svg'); av.innerHTML = ms ? ms.outerHTML : '';
    c.appendChild(el('h3', 'pf-ay-h', d.titulo));
    var yaEsta = d.lead && d.det.join(' ').replace(/<[^>]*>/g, '').indexOf(d.lead.slice(0, 25)) >= 0;
    if (d.lead && !yaEsta){ var q = el('p', 'pf-ay-q', d.lead); t.appendChild(q); }
    d.det.forEach(function(h){ var p = el('p'); p.innerHTML = h; t.appendChild(p); });
    c.appendChild(t);
    var bt = el('div', 'pf-ay-bt');
    if ('speechSynthesis' in window){ var es = el('button', null, '🔊 Escúchame'); es.type = 'button'; es.onclick = function(){ lee(d.titulo + '. ' + t.textContent); }; bt.appendChild(es); }
    var ok = el('button', 'go', 'Entendido ✓'); ok.type = 'button'; ok.onclick = cierraAyuda; bt.appendChild(ok);
    c.appendChild(bt); bx.appendChild(av); bx.appendChild(c); ov.appendChild(bx);
    ov.addEventListener('click', function(e){ if (e.target === ov) cierraAyuda(); });
    document.body.appendChild(ov); ayAbierta = ov; ok.focus();
  }
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') cierraAyuda(); });
  trays.forEach(function(tr){ var ab = tr.querySelector('button.ayuda'); if (!ab) return; ab.onclick = function(){ abreAyuda(tr); }; ab.setAttribute('aria-haspopup', 'dialog'); });

  // ---- Qué hacer en las bandejas de exploración (borrador para revisar con las guías) ----
  trays.forEach(function(tr, i){ var t = SUG[nombre + ':' + (i + 1)], h2 = tr.querySelector('h2'); if (!t || !h2) return;
    var p = el('p', 'pf-sug'); p.innerHTML = '🎯 <b>Prueba esto:</b> '; p.appendChild(document.createTextNode(t)); h2.parentNode.insertBefore(p, h2.nextSibling); });

  // ---- Pausas y cambio de tema ----
  var SK = 'tm_ses', LIM_MIN = 20, LIM_NIV = 1, psAbierta = false, ult = Date.now();
  try { var lm = parseInt(localStorage.getItem('tm_pausa_min'), 10); if (!isNaN(lm)) LIM_MIN = lm; } catch (e) {}
  function ses(){ try { var o = JSON.parse(sessionStorage.getItem(SK) || 'null'); if (o && typeof o.seg === 'number') return o; } catch (e) {} return { seg: 0, lv: 0 }; }
  function guardaSes(o){ try { sessionStorage.setItem(SK, JSON.stringify(o)); } catch (e) {} }
  function sesion(tipo){ var o = ses(); if (tipo === 'nivel') o.lv = (o.lv || 0) + 1; guardaSes(o); setTimeout(revisaPausa, tipo === 'nivel' ? 4500 : 2500); }
  // Propone cambiar de tema solo si, en el plan del año (Gantt), este tema va muy adelantado y otros siguen sin avance.
  var RUT = null; (function(){ var sc = document.createElement('script'); sc.src = 'rutas.js'; sc.onload = function(){ RUT = window.Rutas; }; document.head.appendChild(sc); })();
  function desequilibrio(){
    try {
      var p = window.Perf && Perf.activo(); if (!p || !RUT || !p.taller || !p.anio) return null;
      var ps = RUT.pasos(p.taller, p.anio), T = {};
      ps.forEach(function(s){ var t = T[s.p] || (T[s.p] = { n: 0, h: 0 }); t.n++; if (Perf.hecho(p, s.p, s.b, s.l)) t.h++; });
      var me = T[nombre]; if (!me || me.h < 4 || me.h / me.n < 0.5) return null;
      var vacios = Object.keys(T).filter(function(k){ return k !== nombre && T[k].h === 0; });
      if (vacios.length < 2) return null;
      var av = {}; try { av = JSON.parse(localStorage.getItem('tm_tema_av') || '{}'); } catch (e) {}
      var hoy = new Date().toISOString().slice(0, 10); if (av[nombre] === hoy) return null;
      av[nombre] = hoy; try { localStorage.setItem('tm_tema_av', JSON.stringify(av)); } catch (e) {}
      return { tema: RUT.TEMA[nombre] || nombre, otros: vacios.slice(0, 3).map(function(k){ return RUT.TEMA[k] || k; }) };
    } catch (e) { return null; }
  }
  function revisaPausa(){
    if (psAbierta || ayAbierta) return; var o = ses();
    if (LIM_MIN > 0 && (o.seg || 0) / 60 >= LIM_MIN) return pausa('tiempo');
    if ((o.lv || 0) >= LIM_NIV && !o.avT){ var d = desequilibrio(); if (d){ o.avT = 1; guardaSes(o); pausa('temas', d); } }
  }
  function pausa(tipo, info){
    psAbierta = true; var ov = el('div', 'pf-ps'), bx = el('div', 'pf-ps-b'), av = el('div', 'pf-ps-av'), ms = document.querySelector('.pf-mas svg');
    ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); av.innerHTML = ms ? ms.outerHTML : ''; bx.appendChild(av);
    var nom = jugador ? ', ' + jugador : '';
    var cuenta = null;
    if (tipo === 'tiempo'){
      bx.appendChild(el('h2', null, '¡Hora de una pausa' + nom + '!'));
      bx.appendChild(el('p', null, 'Llevas un buen rato jugando. Mira lejos por la ventana, estira los brazos y toma un poco de agua.'));
      cuenta = el('p', 'pf-ps-r', '30'); bx.appendChild(cuenta);
    } else {
      bx.appendChild(el('h2', null, '¡Mucho avance en ' + (info ? info.tema : 'este tema') + nom + '!'));
      bx.appendChild(el('p', null, 'Tu plan también tiene ' + (info ? info.otros.join(', ') : 'otros temas') + '. Tu cerebro aprende más cuando alternamos. Después puedes volver aquí.'));
    }
    var bt = el('div', 'pf-ps-bt'), cam = el('button', 'go', 'Cambiar de tema'), seg = el('button', null, 'Seguir jugando'); cam.type = seg.type = 'button';
    function fin(){ clearInterval(iv); ov.remove(); psAbierta = false; }
    var iv = null;
    if (cuenta){ var n = 30; iv = setInterval(function(){ n--; if (n <= 0){ clearInterval(iv); cuenta.textContent = '¡Listo!'; } else cuenta.textContent = String(n); }, 1000); }
    cam.onclick = function(){ guardaSes({ seg: 0, lv: 0 }); fin(); location.href = Perf.activo() ? 'camino.html' : 'index.html'; };
    seg.onclick = function(){ var o = ses(); o.seg = 0; o.lv = 0; guardaSes(o); fin(); };
    bt.appendChild(cam); bt.appendChild(seg); bx.appendChild(bt); ov.appendChild(bx); document.body.appendChild(ov); cam.focus();
  }
  document.addEventListener('pointerdown', function(){ ult = Date.now(); }, true);
  setInterval(function(){ if (document.hidden || Date.now() - ult > 60000) return; var o = ses(); o.seg = (o.seg || 0) + 5; guardaSes(o); if (LIM_MIN > 0 && o.seg / 60 >= LIM_MIN + 3) revisaPausa(); }, 5000);

  // ---- Aviso en teléfono vertical ----
  try { if (window.matchMedia('(max-aspect-ratio:1/1) and (max-width:699px)').matches && !sessionStorage.getItem('tm_gira')){
    var gi = el('div', 'pf-gira'); gi.setAttribute('role', 'status'); gi.appendChild(el('span', null, '↻ Gira el teléfono: se juega mejor en horizontal.'));
    var gx = el('button', null, 'Ok'); gx.type = 'button'; gx.onclick = function(){ gi.remove(); try { sessionStorage.setItem('tm_gira', '1'); } catch (e) {} }; gi.appendChild(gx); document.body.appendChild(gi); } } catch (e) {}

  window.PF.show = show; window.PF.pausa = pausa; window.PF.deseq = function(){ return desequilibrio(); }; window.PF.fit = function(f){ fit(cur, f !== false); };
})();
