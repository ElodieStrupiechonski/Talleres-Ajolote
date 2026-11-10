/* Trazar números con el dedo: ventana con un camino de puntitos por cada dígito.
   Uso: TrazaNumero.abre(1235). Se considera bien trazado cuando el dedo pasó cerca del 90 % del camino. */
(function(){
  var TAU = Math.PI * 2, W = 600, H = 340, COV = 30, PRE = 46;
  function ar(cx, cy, rx, ry, a0, a1, n){ n = n || 36; var o = []; for (var i = 0; i <= n; i++){ var a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; o.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return o; }
  function pl(){ return [].slice.call(arguments); }
  // Cada dígito: lista de trazos en una caja de 100 × 140
  var D = {
    0: function(){ return [ar(50, 70, 38, 62, -90, 270, 48)]; },
    1: function(){ return [pl([25, 35], [55, 8], [55, 132])]; },
    2: function(){ return [ar(50, 42, 36, 34, 180, 400, 28).concat([[14, 132], [88, 132]])]; },
    3: function(){ return [ar(48, 36, 34, 28, 200, 450, 28).concat(ar(48, 100, 38, 34, 270, 520, 30))]; },
    4: function(){ return [pl([72, 132], [72, 8], [10, 95], [92, 95])]; },
    5: function(){ return [pl([82, 10], [26, 10]).concat(ar(46, 96, 38, 36, 235, 505, 36).slice(0, 1), ar(46, 96, 38, 36, 235, 505, 36))]; },
    6: function(){ return [pl([70, 10], [28, 60]).concat(ar(50, 98, 34, 34, 180, 540, 40))]; },
    7: function(){ return [pl([12, 10], [88, 10], [40, 132])]; },
    8: function(){ return [ar(50, 36, 30, 28, -90, 270, 36), ar(50, 102, 36, 32, -90, 270, 40)]; },
    9: function(){ return [ar(50, 40, 32, 30, -90, 270, 36), pl([82, 40], [78, 100], [40, 132])]; }
  };
  function dense(p, step){ var o = [p[0]]; for (var i = 1; i < p.length; i++){ var a = p[i - 1], b = p[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(d / step)); for (var k = 1; k <= n; k++) o.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]); } return o; }
  function near(q, pts, r){ var r2 = r * r; for (var i = 0; i < pts.length; i++){ var x = q[0] - pts[i][0], y = q[1] - pts[i][1]; if (x * x + y * y <= r2) return true; } return false; }
  function comas(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }

  function abre(num){
    var txt = String(num), nd = txt.length, s = Math.min(2.1, (W - 40) / (nd * 100 + (nd - 1) * 36), (H - 70) / 140);
    var tw = nd * 100 * s + (nd - 1) * 36 * s, x0 = (W - tw) / 2, y0 = (H - 140 * s) / 2, strokes = [];
    for (var i = 0; i < nd; i++){ D[txt[i]]().forEach(function(st){ strokes.push(st.map(function(q){ return [x0 + i * 136 * s + q[0] * s, y0 + q[1] * s]; })); }); }
    abre.ultimo = strokes; var guide = strokes.map(function(st){ return dense(st, 5); }), all = [].concat.apply([], guide), mine = [], cur = null, ok = false;
    var ov = document.createElement('div'); ov.className = 'tz-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    ov.innerHTML = '<div class="tz-bx"><p class="tz-t">Traza el número <b>' + comas(num) + '</b></p><canvas width="' + W + '" height="' + H + '" aria-label="Lienzo para trazar el número"></canvas><p class="tz-m" role="status"></p><div class="tz-bt"><button type="button" class="tz-clr">Borrar</button><button type="button" class="tz-x">Cerrar</button></div></div>';
    document.body.appendChild(ov);
    var cv = ov.querySelector('canvas'), ctx = cv.getContext('2d'), msg = ov.querySelector('.tz-m');
    function draw(){
      ctx.clearRect(0, 0, W, H); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      strokes.forEach(function(st){ ctx.strokeStyle = ok ? '#6fb584' : '#c9bda8'; ctx.lineWidth = ok ? 18 : 20; ctx.setLineDash(ok ? [] : [1, 24]); ctx.beginPath(); st.forEach(function(q, i){ i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); ctx.stroke(); });
      ctx.setLineDash([]);
      mine.concat(cur ? [cur] : []).forEach(function(st){ ctx.strokeStyle = '#4f7fbf'; ctx.lineWidth = 12; ctx.beginPath(); st.forEach(function(q, i){ i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); if (st.length === 1) ctx.lineTo(st[0][0] + .1, st[0][1]); ctx.stroke(); });
      if (!ok) strokes.forEach(function(st, i){ var p = st[0]; ctx.fillStyle = '#4fa36a'; ctx.strokeStyle = '#41362b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p[0], p[1], 15, 0, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = '800 18px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), p[0], p[1] + 1); });
    }
    function pos(e){ var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; }
    cv.addEventListener('pointerdown', function(e){ if (ok) return; e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {} cur = [pos(e)]; draw(); });
    cv.addEventListener('pointermove', function(e){ if (cur){ cur.push(pos(e)); draw(); e.preventDefault(); } });
    function fin(){
      if (!cur) return; var st = cur; cur = null; var d = dense(st, 5), bien = d.filter(function(q){ return near(q, all, PRE); }).length / d.length;
      if (d.length < 4 || bien < .8){ msg.textContent = 'Casi. Sigue los puntitos despacio.'; draw(); return; }
      mine.push(st); msg.textContent = ''; var m = [].concat.apply([], mine.map(function(x){ return dense(x, 5); }));
      var cub = all.filter(function(g){ return near(g, m, COV); }).length / all.length;
      if (cub >= .9){ ok = true; msg.innerHTML = '<span class="ok">¡Muy bien!</span> Trazaste el ' + comas(num) + '.'; if (window.Snd && Snd.ok) Snd.ok(); } else msg.textContent = 'Sigue los puntitos. Te falta un poco.';
      draw();
    }
    cv.addEventListener('pointerup', fin); cv.addEventListener('pointercancel', fin);
    ov.querySelector('.tz-clr').onclick = function(){ mine = []; cur = null; ok = false; msg.textContent = ''; draw(); };
    function cierra(){ ov.remove(); document.removeEventListener('keydown', esc, true); }
    function esc(e){ if (e.key === 'Escape'){ e.stopPropagation(); cierra(); } }
    document.addEventListener('keydown', esc, true);
    ov.querySelector('.tz-x').onclick = cierra; ov.addEventListener('click', function(e){ if (e.target === ov) cierra(); });
    draw();
  }
  window.TrazaNumero = { abre: abre };
})();
