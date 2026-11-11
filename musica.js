/* Música de fondo muy suave (generada con WebAudio, sin archivos). Se enciende y apaga aparte del sonido de los botones.
   Preferencia guardada en este dispositivo (tm_musica). Por defecto apagada. */
(function(){
  var K = 'tm_musica', ctx = null, master = null, timer = null, sonando = false, paso = 0, botones = [];
  function pref(){ try { return localStorage.getItem(K) === '1'; } catch (e) { return false; } }
  function guarda(v){ try { localStorage.setItem(K, v ? '1' : '0'); } catch (e) {} }
  // Pentatónica de Do (notas del juguete musical) y una progresión lenta de acordes: Do – La menor – Fa – Sol
  var PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  var ACORDES = [[130.81, 196, 261.63], [110, 164.81, 220], [87.31, 130.81, 174.61], [98, 146.83, 196]];
  function ac(){
    if (!ctx){ try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      // eco suave para dar sensación de espacio
      var d = ctx.createDelay(1.5), fb = ctx.createGain(), lp = ctx.createBiquadFilter(), wet = ctx.createGain();
      d.delayTime.value = 0.42; fb.gain.value = 0.38; lp.type = 'lowpass'; lp.frequency.value = 1800; wet.gain.value = 0.45;
      master.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(ctx.destination);
    } catch (e) { return null; } }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  function nota(f, t, dur, vol, tipo){
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = tipo || 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  function pad(acorde, t, dur){
    acorde.forEach(function(f, i){
      [-3, 3].forEach(function(det){ var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = f; o.detune.value = det;
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.018 - i * 0.003, t + dur * 0.4); g.gain.linearRampToValueAtTime(0.0001, t + dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.1); });
    });
  }
  var proximoPad = 0, ultima = 2;
  function tic(){
    if (!sonando || !ctx) return;
    var t = ctx.currentTime;
    if (t + 0.3 >= proximoPad){ var a = ACORDES[Math.floor(paso / 1) % 4]; pad(a, Math.max(t, proximoPad), 9); proximoPad = Math.max(t, proximoPad) + 8; paso++; }
    // una o dos notas de "caja de música", suaves y espaciadas
    var n = Math.random() < 0.7 ? 1 : 2, i;
    for (i = 0; i < n; i++){
      ultima = Math.max(0, Math.min(PENTA.length - 1, ultima + [-2, -1, -1, 0, 1, 1, 2][Math.floor(Math.random() * 7)]));
      nota(PENTA[ultima], t + 0.05 + i * 0.55, 2.4, 0.032, 'triangle');
    }
    timer = setTimeout(tic, 1500 + Math.random() * 1700);
  }
  function enciende(){
    var c = ac(); if (!c) return; sonando = true; proximoPad = 0; paso = 0;
    master.gain.cancelScheduledValues(c.currentTime); master.gain.setTargetAtTime(0.9, c.currentTime, 1.2);
    clearTimeout(timer); tic();
  }
  function apaga(){
    sonando = false; clearTimeout(timer); if (ctx && master){ master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(0, ctx.currentTime, 0.4); }
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
  window.Musica = { montar: montar, alterna: alterna, enciende: enciende, apaga: apaga, activa: pref };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montaExistentes); else montaExistentes();
})();
