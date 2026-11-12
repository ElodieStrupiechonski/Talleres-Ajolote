/* Música de fondo (generada con WebAudio, sin archivos): melodía original, juguetona y relajada, de espíritu "bosque de juguete".
   Marimba, bajo pizzicato, flauta suave, shaker y algún pajarito. La progresión y la melodía cambian en cada vuelta.
   Se enciende y apaga aparte del sonido de los botones. Preferencia guardada en este dispositivo (tm_musica). Por defecto apagada. */
(function(){
  var K = 'tm_musica', ctx = null, master = null, timer = null, sonando = false, botones = [];
  function pref(){ try { return localStorage.getItem(K) === '1'; } catch (e) { return false; } }
  function guarda(v){ try { localStorage.setItem(K, v ? '1' : '0'); } catch (e) {} }
  var BPM = 96, PASO = 60 / BPM / 2, SWING = 0.14;           // corcheas con un poco de vaivén
  function mf(m){ return 440 * Math.pow(2, (m - 69) / 12); }
  var ACORDE = { C:[48,[0,4,7,11]], Am:[45,[0,3,7,10]], F:[41,[0,4,7,11]], G:[43,[0,4,7,9]], Em:[40,[0,3,7,10]], Dm:[38,[0,3,7,10]] };
  var PROG = [['C','Am','F','G','C','Em','F','G'], ['C','F','Dm','G','C','Am','Dm','G'], ['C','Em','Am','G','F','C','Dm','G']];
  var POOL = [72, 74, 76, 79, 81, 84, 86, 88];                 // pentatónica de Do, notas de la melodía
  var ruido = null;
  function construye(c){
    master = c.createGain(); master.gain.value = 0; master.connect(c.destination);
    var d = c.createDelay(1), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();
    d.delayTime.value = 60 / BPM * 0.75; fb.gain.value = 0.26; lp.type = 'lowpass'; lp.frequency.value = 2400; wet.gain.value = 0.2;
    master.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(c.destination);
    var n = c.sampleRate * 0.5, b = c.createBuffer(1, n, c.sampleRate), x = b.getChannelData(0); for (var i = 0; i < n; i++) x[i] = Math.random() * 2 - 1; ruido = b;
  }
  function ac(){
    if (!ctx){ try { ctx = new (window.AudioContext || window.webkitAudioContext)(); construye(ctx); } catch (e) { ctx = null; return null; } }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function env(g, t, a, v, dur){ g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function osc(tipo, f, t, dur){ var o = ctx.createOscillator(); o.type = tipo; o.frequency.value = f; o.start(t); o.stop(t + dur + 0.05); return o; }
  function marimba(f, t, v, dur){
    dur = dur || 0.55;
    var o = osc('sine', f, t, dur), g = ctx.createGain(); env(g, t, 0.004, v, dur); o.connect(g); g.connect(master);
    var o2 = osc('sine', f * 4, t, 0.12), g2 = ctx.createGain(); env(g2, t, 0.002, v * 0.3, 0.1); o2.connect(g2); g2.connect(master);
  }
  function bajo(f, t, v){ var o = osc('triangle', f, t, 0.3), g = ctx.createGain(); env(g, t, 0.006, v, 0.28); o.connect(g); g.connect(master); }
  function flauta(f, t, dur, v){
    var o = osc('sine', f, t, dur + 0.3), o2 = osc('sine', f * 2, t, dur + 0.3), g = ctx.createGain(), g2 = ctx.createGain(), l = osc('sine', 5, t, dur + 0.3), lg = ctx.createGain();
    lg.gain.value = 7; l.connect(lg); lg.connect(o.detune); lg.connect(o2.detune);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.14); g.gain.setValueAtTime(v, t + dur * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.25);
    g2.gain.value = 0.16; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
  }
  function shaker(t, v){
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = ruido; f.type = 'bandpass'; f.frequency.value = 7000; f.Q.value = 0.9;
    env(g, t, 0.003, v, 0.05); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.3, 0.08);
  }
  function pajaro(t){
    var f0 = 2600 + Math.random() * 1400, n = 2 + Math.floor(Math.random() * 3);
    for (var i = 0; i < n; i++){ var tt = t + i * 0.12, o = osc('sine', f0, tt, 0.09), g = ctx.createGain(); o.frequency.setValueAtTime(f0, tt); o.frequency.exponentialRampToValueAtTime(f0 * 1.45, tt + 0.07); env(g, tt, 0.01, 0.014, 0.08); o.connect(g); g.connect(master); }
  }
  // --- composición: se genera compás a compás, con un motivo de 2 compases que se repite y se contesta
  var paso = 0, prox = 0, prog = PROG[0], motivos = [];
  function nuevoMotivo(largo){
    var pos = [[0,2,3,5,6,8,10,11,13], [0,3,4,6,8,10,12,14], [0,1,3,6,8,9,11,14], [1,3,4,6,9,11,12,14]][Math.floor(Math.random() * 4)], k = 5 + Math.floor(Math.random() * 3), m = [], idx = 2 + Math.floor(Math.random() * 3), i;
    pos = pos.slice(0, k);
    for (i = 0; i < pos.length; i++){ idx = Math.max(0, Math.min(POOL.length - 1, idx + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)])); m.push([pos[i], idx, i === pos.length - 1 ? 3 : 1]); }
    return m;
  }
  function nuevaVuelta(){
    prog = PROG[Math.floor(Math.random() * PROG.length)];
    var a = nuevoMotivo(), b = nuevoMotivo(); motivos = [a, b, a, nuevoMotivo()];
  }
  function programa(){
    var n = paso % 64, compas = Math.floor(n / 8), s = n % 8, t = prox + (s % 2 ? PASO * SWING * 2 : 0), ch = ACORDE[prog[compas]], raiz = ch[0], tonos = ch[1], pcs = tonos.map(function(x){ return (raiz + x) % 12; });
    if (n === 0) nuevaVuelta(); ch = ACORDE[prog[compas]]; raiz = ch[0]; tonos = ch[1]; pcs = tonos.map(function(x){ return (raiz + x) % 12; });
    // bajo pizzicato
    if (s === 0) bajo(mf(raiz), t, 0.1);
    else if (s === 4) bajo(mf(raiz + (Math.random() < 0.5 ? 7 : 0)), t, 0.085);
    else if (s === 6 && Math.random() < 0.5) bajo(mf(raiz + 7), t, 0.06);
    // arpegio de marimba (acompañamiento)
    if (Math.random() > 0.14){ var orden = [0, 1, 2, 1, 3, 2, 1, 2], tn = tonos[orden[s] % tonos.length]; marimba(mf(raiz + 24 + tn), t, s % 4 === 0 ? 0.05 : 0.034, 0.4); }
    // shaker suave en los contratiempos
    shaker(t, s % 2 ? 0.02 : 0.009);
    // melodía (marimba aguda): motivo de dos compases; en las notas fuertes se pega a un sonido del acorde
    var mot = motivos[Math.floor(compas / 2)], p16 = (compas % 2) * 8 + s, i;
    for (i = 0; i < mot.length; i++){ if (mot[i][0] === p16){
      var idx = mot[i][1], mn = POOL[idx];
      if (p16 % 4 === 0){ for (var d = 0; d < POOL.length; d++){ var c1 = POOL[Math.max(0, Math.min(POOL.length - 1, idx + (d % 2 ? -1 : 1) * Math.ceil(d / 2)))]; if (pcs.indexOf(c1 % 12) >= 0){ mn = c1; break; } } }
      marimba(mf(mn), t, 0.07, mot[i][2] > 1 ? 0.9 : 0.5);
    } }
    // flauta larga en la segunda mitad de la vuelta
    if (compas >= 4 && s === 0 && Math.random() < 0.8){ flauta(mf(raiz + 24 + tonos[1 + Math.floor(Math.random() * 2)]), t, PASO * 6, 0.03); }
    // pajarito de vez en cuando
    if (s === 3 && Math.random() < 0.09) pajaro(t + 0.02);
    paso++; prox += PASO;
  }
  function tic(){
    if (!sonando || !ctx) return;
    if (prox < ctx.currentTime) prox = ctx.currentTime + 0.08;
    while (prox < ctx.currentTime + 0.3) programa();
    timer = setTimeout(tic, 90);
  }
  function enciende(){
    var c = ac(); if (!c) return; sonando = true; paso = 0; prox = c.currentTime + 0.15;
    master.gain.cancelScheduledValues(c.currentTime); master.gain.setTargetAtTime(1.3, c.currentTime, 0.8);
    clearTimeout(timer); tic();
  }
  function apaga(){
    sonando = false; clearTimeout(timer); if (ctx && master){ master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, 0.4); }
  }
  // Solo para pruebas: renderiza unos segundos sin altavoz
  function prueba(seg){
    var oc = new OfflineAudioContext(1, 44100 * seg, 44100); ctx = oc; construye(oc); master.gain.value = 1.3; sonando = true; paso = 0; prox = 0.1;
    while (prox < seg - 0.5) programa(); sonando = false;
    return oc.startRendering().then(function(b){ ctx = null; master = null; return Array.prototype.slice.call(b.getChannelData(0)); });
  }
  var ICO_ON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="3" fill="currentColor"/><circle cx="17.5" cy="16" r="3" fill="currentColor"/></svg>';
  var ICO_OFF = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l11-2v13" /><circle cx="6.5" cy="18" r="3" fill="currentColor"/><circle cx="17.5" cy="16" r="3" fill="currentColor"/><path d="M3 3l18 18"/></svg>';
  function pintaTodos(){ var on = pref(); botones.forEach(function(b){ b.innerHTML = (on ? ICO_ON : ICO_OFF) + '<span>' + (on ? 'Música' : 'Sin música') + '</span>'; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? 'Apagar la música de fondo' : 'Encender la música de fondo'); }); }
  function alterna(){ var v = !pref(); guarda(v); if (v) enciende(); else apaga(); pintaTodos(); }
  function montar(slot){
    if (!slot || slot.querySelector('.mus-btn')) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'snd-btn mus-btn'; b.onclick = alterna; botones.push(b);
    var ref = slot.querySelector('.snd-btn:not(.mus-btn)'); if (ref && ref.nextSibling) slot.insertBefore(b, ref.nextSibling); else slot.appendChild(b); pintaTodos();
  }
  function montaExistentes(){ [].forEach.call(document.querySelectorAll('.snd-btn:not(.mus-btn)'), function(s){ montar(s.parentNode); }); }
  // Los navegadores exigen un toque antes de reproducir audio: si la música está encendida, arranca con el primer toque
  function primerToque(){ if (pref() && !sonando) enciende(); }
  document.addEventListener('pointerdown', primerToque, { once: false, capture: true });
  document.addEventListener('visibilitychange', function(){ if (document.hidden){ if (ctx) { try { ctx.suspend(); } catch (e) {} } } else if (pref() && ctx){ try { ctx.resume(); } catch (e) {} } });
  window.Musica = { montar: montar, alterna: alterna, enciende: enciende, apaga: apaga, activa: pref, _prueba: prueba };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montaExistentes); else montaExistentes();
})();
