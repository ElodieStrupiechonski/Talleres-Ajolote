/* Música de fondo (generada con WebAudio, sin archivos). Melodías originales, serenas, con una atmósfera por temática:
   · Bosque (números y operaciones, y el mapa): marimba, bajo pizzicato, flauta y pajaritos.
   · Pastelería (divisiones y fracciones): vals en 3/4 con celesta, arpa y pizzicato.
   · Acuarela (geometría y dibujo): arpa lenta, colchón suave y gotas de agua.
   · Estrellas (lógica, datos y azar): caja de música, relojito y destellos, en modo menor luminoso.
   Cada taller suena en su propia tonalidad dentro de la familia. La melodía cambia en cada vuelta.
   Se enciende y apaga aparte del sonido de los botones. Preferencia guardada en este dispositivo (tm_musica). Por defecto apagada. */
(function(){
  var K = 'tm_musica', ctx = null, master = null, eco = null, timer = null, sonando = false, botones = [];
  function pref(){ try { return localStorage.getItem(K) === '1'; } catch (e) { return false; } }
  function guarda(v){ try { localStorage.setItem(K, v ? '1' : '0'); } catch (e) {} }
  function mf(m){ return 440 * Math.pow(2, (m - 69) / 12); }
  var ruido = null, TR = 0, PASO = 0.3125, A = null;
  function F(m){ return mf(m + TR); }

  // ---------- voces ----------
  function env(g, t, a, v, dur){ g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
  function osc(tipo, f, t, dur){ var o = ctx.createOscillator(); o.type = tipo; o.frequency.value = f; o.start(t); o.stop(t + dur + 0.05); return o; }
  function marimba(f, t, v, dur){
    dur = dur || 0.55;
    var o = osc('sine', f, t, dur), g = ctx.createGain(); env(g, t, 0.004, v, dur); o.connect(g); g.connect(master);
    var o2 = osc('sine', f * 4, t, 0.12), g2 = ctx.createGain(); env(g2, t, 0.002, v * 0.3, 0.1); o2.connect(g2); g2.connect(master);
  }
  function celesta(f, t, v, dur){
    dur = dur || 1.3;
    var o = osc('sine', f, t, dur), g = ctx.createGain(); env(g, t, 0.003, v, dur); o.connect(g); g.connect(master);
    var o2 = osc('sine', f * 3, t, 0.4), g2 = ctx.createGain(); env(g2, t, 0.002, v * 0.22, 0.35); o2.connect(g2); g2.connect(master);
    var o3 = osc('sine', f * 5.4, t, 0.18), g3 = ctx.createGain(); env(g3, t, 0.001, v * 0.09, 0.15); o3.connect(g3); g3.connect(master);
  }
  function arpa(f, t, v, dur){
    dur = dur || 1.6;
    var o = osc('triangle', f, t, dur), g = ctx.createGain(); env(g, t, 0.005, v, dur); o.connect(g); g.connect(master);
    var o2 = osc('sine', f * 2, t, dur * 0.5), g2 = ctx.createGain(); env(g2, t, 0.004, v * 0.3, dur * 0.4); o2.connect(g2); g2.connect(master);
  }
  function bajo(f, t, v, dur){ dur = dur || 0.3; var o = osc('triangle', f, t, dur), g = ctx.createGain(); env(g, t, 0.006, v, dur - 0.02); o.connect(g); g.connect(master); }
  function flauta(f, t, dur, v){
    if (inten() < 2) return;
    var o = osc('sine', f, t, dur + 0.3), o2 = osc('sine', f * 2, t, dur + 0.3), g = ctx.createGain(), g2 = ctx.createGain(), l = osc('sine', 5, t, dur + 0.3), lg = ctx.createGain();
    lg.gain.value = 7; l.connect(lg); lg.connect(o.detune); lg.connect(o2.detune);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.14); g.gain.setValueAtTime(v, t + dur * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.25);
    g2.gain.value = 0.16; o.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
  }
  function colchon(notas, t, dur, v){
    notas.forEach(function(f, i){ [-3, 3].forEach(function(det){ var o = osc('sine', f, t, dur + 0.1), g = ctx.createGain(); o.detune.value = det;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(Math.max(0.002, v - i * 0.002), t + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(master); }); });
  }
  function shaker(t, v){
    if (suave()) return;
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = ruido; f.type = 'bandpass'; f.frequency.value = 7000; f.Q.value = 0.9;
    env(g, t, 0.003, v, 0.05); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.3, 0.08);
  }
  function reloj(t, v){
    if (suave()) return;
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = ruido; f.type = 'bandpass'; f.frequency.value = 2300; f.Q.value = 9;
    env(g, t, 0.001, v, 0.04); s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 0.3, 0.06);
    var o = osc('sine', 1000, t, 0.05), g2 = ctx.createGain(); env(g2, t, 0.001, v * 0.5, 0.04); o.connect(g2); g2.connect(master);
  }
  function pajaro(t){
    if (suave()) return;
    var f0 = 2600 + Math.random() * 1400, n = 2 + Math.floor(Math.random() * 3);
    for (var i = 0; i < n; i++){ var tt = t + i * 0.12, o = osc('sine', f0, tt, 0.09), g = ctx.createGain(); o.frequency.setValueAtTime(f0, tt); o.frequency.exponentialRampToValueAtTime(f0 * 1.45, tt + 0.07); env(g, tt, 0.01, 0.014, 0.08); o.connect(g); g.connect(master); }
  }
  function gota(t){
    var f0 = 1500 + Math.random() * 900, o = osc('sine', f0, t, 0.16), g = ctx.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f0 * 0.5, t + 0.12); env(g, t, 0.006, 0.026, 0.15); o.connect(g); g.connect(master);
  }
  var LEAD = { marimba: marimba, celesta: celesta, arpa: arpa };

  // ---------- atmósferas ----------
  function acordes(o){ return o; }
  var ATM = {
    bosque: { bpm: 96, pasos: 8, swing: 0.14, eco: [0.75, 0.26, 0.2], lead: 'marimba', vl: 0.07, k: [5, 7],
      pool: [72, 74, 76, 79, 81, 84, 86, 88],
      ch: { C:[48,[0,4,7,11]], Am:[45,[0,3,7,10]], F:[41,[0,4,7,11]], G:[43,[0,4,7,9]], Em:[40,[0,3,7,10]], Dm:[38,[0,3,7,10]] },
      prog: [['C','Am','F','G','C','Em','F','G'], ['C','F','Dm','G','C','Am','Dm','G'], ['C','Em','Am','G','F','C','Dm','G']],
      tick: function(s, t, r, tn, c){
        if (s === 0) bajo(F(r), t, 0.1); else if (s === 4) bajo(F(r + (Math.random() < 0.5 ? 7 : 0)), t, 0.085); else if (s === 6 && Math.random() < 0.5) bajo(F(r + 7), t, 0.06);
        if (inten() >= 3 || Math.random() > 0.14){ var o = [0, 1, 2, 1, 3, 2, 1, 2][s]; marimba(F(r + 24 + tn[o % tn.length]), t, s % 4 === 0 ? 0.05 : 0.034, 0.4); }
        shaker(t, s % 2 ? 0.02 : 0.009);
        if (c >= 4 && s === 0 && Math.random() < 0.8) flauta(F(r + 24 + tn[1 + Math.floor(Math.random() * 2)]), t, PASO * 6, 0.03);
        if (s === 3 && Math.random() < (inten() >= 3 ? 0.25 : 0.09)) pajaro(t + 0.02);
      } },
    pasteleria: { bpm: 100, pasos: 6, swing: 0.05, eco: [0.6, 0.28, 0.24], lead: 'celesta', vl: 0.06, k: [4, 6],
      pool: [79, 81, 83, 86, 88, 91],
      ch: { G:[43,[0,4,7,11]], Em:[40,[0,3,7,10]], C:[48,[0,4,7,11]], D:[38,[0,4,7,9]], Am:[45,[0,3,7,10]] },
      prog: [['G','Em','C','D','G','Em','Am','D'], ['G','C','Em','D','G','C','Am','D'], ['G','Em','Am','D','G','C','C','D']],
      tick: function(s, t, r, tn, c){
        if (s === 0) bajo(F(r), t, 0.1, 0.34);                                           // pum
        if (s === 2 || s === 4){ marimba(F(r + 24 + tn[1]), t, 0.03, 0.3); marimba(F(r + 24 + tn[2]), t + 0.004, 0.026, 0.3); } // pa-pa
        if (s === 0 && Math.random() < 0.75){ [0, 1, 2].forEach(function(i){ arpa(F(r + 12 + tn[i]), t + i * PASO * 0.5, 0.04, 1.1); }); }
        if (c >= 4 && s === 0 && Math.random() < 0.6) flauta(F(r + 24 + tn[2]), t, PASO * 5, 0.026);
        if (s === 5 && Math.random() < (inten() >= 3 ? 0.3 : 0.1)) celesta(F(100 + Math.floor(Math.random() * 4) * 2), t, 0.02, 0.9);
      } },
    acuarela: { bpm: 66, pasos: 8, swing: 0, eco: [0.9, 0.34, 0.36], lead: 'arpa', vl: 0.05, k: [3, 4],
      pool: [74, 76, 78, 81, 83, 86, 88],
      ch: { D:[38,[0,4,7,11]], G:[43,[0,4,7,11]], A:[45,[0,4,7,9]], Bm:[47,[0,3,7,10]], Em:[40,[0,3,7,10]] },
      prog: [['D','G','D','A','Bm','G','D','A'], ['D','A','Bm','G','D','G','Em','A'], ['D','Bm','G','A','D','G','A','D']],
      tick: function(s, t, r, tn, c){
        if (s === 0){ bajo(F(r), t, 0.07, 1.6); colchon([F(r + 12), F(r + 12 + tn[2]), F(r + 24 + tn[1])], t, PASO * 8, 0.013); }
        var o = [0, 1, 2, 3, 2, 1, 2, 1][s]; if (Math.random() > 0.2) arpa(F(r + 24 + tn[o]), t, s % 4 === 0 ? 0.04 : 0.028, 1.8);
        if (Math.random() < (inten() >= 3 ? 0.14 : 0.05)) gota(t + 0.03);
        if (c >= 4 && s === 0 && Math.random() < 0.6) flauta(F(r + 36 + tn[1]), t, PASO * 7, 0.024);
      } },
    estrellas: { bpm: 88, pasos: 8, swing: 0.06, eco: [0.7, 0.3, 0.3], lead: 'celesta', vl: 0.055, k: [4, 6],
      pool: [76, 79, 81, 84, 86, 88, 91, 93],
      ch: { Am:[45,[0,3,7,10]], Dm:[38,[0,3,7,10]], F:[41,[0,4,7,11]], G:[43,[0,4,7,9]], Em:[40,[0,3,7,10]], C:[48,[0,4,7,11]] },
      prog: [['Am','F','C','G','Am','Dm','Em','Am'], ['Am','Dm','F','C','G','Dm','Em','Am'], ['Am','C','G','Dm','F','C','Em','Am']],
      tick: function(s, t, r, tn, c){
        if (s === 0) bajo(F(r), t, 0.09); else if (s === 5 && Math.random() < 0.5) bajo(F(r + 7), t, 0.06);
        if (Math.random() > 0.2){ var o = [0, 2, 1, 3, 2, 1, 3, 2][s]; celesta(F(r + 24 + tn[o % tn.length]), t, s % 4 === 0 ? 0.035 : 0.024, 0.9); }
        if (s === 0 || s === 4) reloj(t, 0.012);
        if (s === 6 && Math.random() < (inten() >= 3 ? 0.4 : 0.16)) celesta(F(96 + [0, 2, 4, 7, 9][Math.floor(Math.random() * 5)]), t, 0.018, 1.2);
        if (c >= 4 && s === 0 && Math.random() < 0.5) flauta(F(r + 24 + tn[2]), t, PASO * 6, 0.022);
      } }
  };
  // Página → atmósfera y tonalidad (la tonalidad distingue cada taller dentro de su familia)
  var TR_LISTA = [0, 2, -2, 3, -3, 1, -1];
  var PAGINAS = { contar:['bosque',0], proporciones:['bosque',1], enteros:['bosque',2], algebra:['bosque',3], dorado:['bosque',4], decimal:['bosque',5], cadenas:['bosque',6],
    divisiones:['pasteleria',0], fracciones:['pasteleria',1], ritmo:['pasteleria',2],
    pitagoras:['acuarela',0], angulos:['acuarela',1], area:['acuarela',2], trazos:['acuarela',3], dibujo:['acuarela',4],
    ajedrez:['estrellas',0], programacion:['estrellas',1], probabilidad:['estrellas',2] };
  function deLaPagina(){
    var f = ''; try { f = (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/, ''); } catch (e) {}
    var p = PAGINAS[f]; return p ? { nombre: p[0], tr: TR_LISTA[p[1] % TR_LISTA.length] } : { nombre: 'bosque', tr: 0 };
  }
  function elige(nombre, tr){
    A = ATM[nombre] || ATM.bosque; TR = tr || 0; PASO = 60 / A.bpm / 2;
    if (eco){ eco.d.delayTime.value = 60 / A.bpm * A.eco[0]; eco.fb.gain.value = A.eco[1]; eco.wet.gain.value = A.eco[2]; }
  }

  function construye(c){
    master = c.createGain(); master.gain.value = 0; master.connect(c.destination);
    var d = c.createDelay(1.5), fb = c.createGain(), lp = c.createBiquadFilter(), wet = c.createGain();
    d.delayTime.value = 0.4; fb.gain.value = 0.26; lp.type = 'lowpass'; lp.frequency.value = 2400; wet.gain.value = 0.2;
    master.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(c.destination); eco = { d: d, fb: fb, wet: wet };
    var n = c.sampleRate * 0.5, b = c.createBuffer(1, n, c.sampleRate), x = b.getChannelData(0); for (var i = 0; i < n; i++) x[i] = Math.random() * 2 - 1; ruido = b;
    var u = deLaPagina(); elige(u.nombre, u.tr);
  }
  function ac(){
    if (!ctx){ try { ctx = new (window.AudioContext || window.webkitAudioContext)(); construye(ctx); } catch (e) { ctx = null; return null; } }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  // ---------- composición: se genera compás a compás; un motivo de 2 compases se repite y se contesta ----------
  var paso = 0, prox = 0, prog = null, motivos = [], cur = null;
  // Reacción al niño: la voz baja la música, un acierto toca una nota del acorde y un error la deja más tenue un momento
  var hablando = 0, perro = null, racha = 0, calmaHasta = 0, tCalma = null;
  function suave(){ return !!ctx && ctx.currentTime < calmaHasta; }
  function inten(){ return suave() ? 1 : (racha >= 5 ? 3 : 2); }
  // Ritmo del niño: si responde despacio la música se aquieta un poco; si va rápido, sube un poco el pulso
  var ultimoEv = 0, ritmoEma = 10, factor = 1, factorMeta = 1;
  function marcaRitmo(){
    if (!ctx) return; var ahora = ctx.currentTime;
    if (ultimoEv && ahora - ultimoEv < 90) ritmoEma = ritmoEma * 0.7 + (ahora - ultimoEv) * 0.3;
    ultimoEv = ahora; factorMeta = ritmoEma > 20 ? 0.9 : ritmoEma > 12 ? 0.95 : ritmoEma < 5 ? 1.06 : 1;
  }
  function nivel(){ if (!ctx || !master || !sonando) return; master.gain.setTargetAtTime(hablando > 0 ? 0.5 : (suave() ? 0.85 : 1.3), ctx.currentTime, 0.2); }
  function habla(on){
    hablando = Math.max(0, hablando + (on ? 1 : -1)); clearTimeout(perro);
    if (hablando > 0) perro = setTimeout(function(){ hablando = 0; nivel(); }, 20000);   // por si el sintetizador no avisa que terminó
    nivel();
  }
  function acierto(){
    if (!sonando || !ctx || !cur) return;
    racha++; calmaHasta = 0; marcaRitmo(); nivel();
    var t = ctx.currentTime + 0.22, i = (racha - 1) % 4, oct = Math.floor((racha - 1) / 4) % 2 * 12, tn = cur.tn, f = LEAD[A.lead];
    f(F(cur.r + 24 + tn[i % tn.length] + oct), t, 0.085, 1.2);
    if (racha % 3 === 0) f(F(cur.r + 36 + tn[(i + 2) % tn.length]), t + 0.11, 0.06, 1.2);   // cada tres seguidos, un destello arriba
  }
  function error(){
    racha = 0; if (!sonando || !ctx) return; marcaRitmo();
    calmaHasta = ctx.currentTime + 8; nivel(); clearTimeout(tCalma); tCalma = setTimeout(nivel, 8200);
  }
  function nuevoMotivo(){
    var P = A.pasos, k = A.k[0] + Math.floor(Math.random() * (A.k[1] - A.k[0] + 1)), pos = [0], i, intentos = 0;
    while (pos.length < k && intentos++ < 200){ var q = 1 + Math.floor(Math.random() * (2 * P - 2)); if (pos.indexOf(q) < 0 && Math.random() < (q % 2 ? 0.35 : 0.8)) pos.push(q); }
    pos.sort(function(a, b){ return a - b; });
    var m = [], idx = 1 + Math.floor(Math.random() * 3);
    for (i = 0; i < pos.length; i++){ idx = Math.max(0, Math.min(A.pool.length - 1, idx + [-2, -1, -1, 1, 1, 2][Math.floor(Math.random() * 6)])); m.push([pos[i], idx, i === pos.length - 1 ? 3 : 1]); }
    return m;
  }
  function nuevaVuelta(){ prog = A.prog[Math.floor(Math.random() * A.prog.length)]; var a = nuevoMotivo(), b = nuevoMotivo(); motivos = [a, b, a, nuevoMotivo()]; }
  function programa(){
    var P = A.pasos, n = paso % (P * 8), compas = Math.floor(n / P), s = n % P, t = prox + (s % 2 ? PASO * A.swing * 2 : 0);
    if (n === 0) nuevaVuelta();
    if (s === 0){ factor += (factorMeta - factor) * 0.35; PASO = 60 / (A.bpm * factor) / 2; }
    var ch = A.ch[prog[compas]], raiz = ch[0], tonos = ch[1], pcs = tonos.map(function(x){ return (raiz + x + TR + 120) % 12; });
    cur = { r: raiz, tn: tonos }; A.tick(s, t, raiz, tonos, compas);
    if (s === 0 && inten() >= 3) colchon([F(raiz + 12), F(raiz + 12 + tonos[2])], t, PASO * P, 0.01);
    var mot = motivos[Math.floor(compas / 2)], p = (compas % 2) * P + s, i, pool = A.pool;
    for (i = 0; i < mot.length; i++){ if (mot[i][0] === p && !(suave() && i % 2)){
      var idx = mot[i][1], mn = pool[idx];
      if (p % 4 === 0){ for (var d = 0; d < pool.length; d++){ var c1 = pool[Math.max(0, Math.min(pool.length - 1, idx + (d % 2 ? -1 : 1) * Math.ceil(d / 2)))]; if (pcs.indexOf((c1 + TR + 120) % 12) >= 0){ mn = c1; break; } } }
      LEAD[A.lead](F(mn), t, A.vl, mot[i][2] > 1 ? 1.4 : 0.7);
      if (inten() >= 3) LEAD[A.lead](F(mn - 12), t + 0.01, A.vl * 0.45, 0.9);
    } }
    paso++; prox += PASO;
  }
  function tic(){
    if (!sonando || !ctx) return;
    if (prox < ctx.currentTime) prox = ctx.currentTime + 0.08;
    while (prox < ctx.currentTime + 0.3) programa();
    timer = setTimeout(tic, 90);
  }
  function enciende(){
    var c = ac(); if (!c) return; sonando = true; paso = 0; prox = c.currentTime + 0.15; racha = 0; calmaHasta = 0;
    master.gain.cancelScheduledValues(c.currentTime); master.gain.setTargetAtTime(hablando > 0 ? 0.5 : 1.3, c.currentTime, 0.8);
    clearTimeout(timer); tic();
  }
  function apaga(){
    sonando = false; clearTimeout(timer); if (ctx && master){ master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, 0.4); }
  }
  // Solo para pruebas: renderiza unos segundos sin altavoz
  function prueba(seg, nombre, tr, r0){
    var oc = new OfflineAudioContext(1, 44100 * seg, 44100); ctx = oc; construye(oc); elige(nombre || 'bosque', tr || 0); master.gain.value = 1.3; sonando = true; paso = 0; prox = 0.1; racha = r0 | 0; factor = factorMeta = 1;
    while (prox < seg - 0.5) programa(); sonando = false;
    return oc.startRendering().then(function(b){ ctx = null; master = null; eco = null; return Array.prototype.slice.call(b.getChannelData(0)); });
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
  window.Musica = { montar: montar, alterna: alterna, enciende: enciende, apaga: apaga, activa: pref, habla: habla, acierto: acierto, error: error, _prueba: prueba };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montaExistentes); else montaExistentes();
})();
