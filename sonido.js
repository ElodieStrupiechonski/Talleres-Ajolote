// Sonidos suaves (WebAudio, sin archivos) con interruptor por actividad.
(function(){
  var file = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
  var KEY = 'quiosco-sonido:' + file;
  var ctx = null, master = null, on = true;
  try { on = localStorage.getItem(KEY) !== '0'; } catch (e) {}
  function ac(){
    if (!ctx){ try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
    } catch (e) { return null; } }
    if (ctx.state === 'suspended') { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }
  // Una voz: seno + armónico suave. Con 'sost' el volumen se mantiene toda la duración; sin 'sost' decae como campanita.
  function voz(f, t0, dur, o){
    o = o || {}; var c = ac(); if (!c) return null;
    var t = c.currentTime + (t0 || 0), g = c.createGain(), v = o.vol == null ? 0.12 : o.vol;
    var o1 = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain();
    o1.type = o.tipo || 'sine'; o2.type = 'sine'; o1.frequency.value = f; o2.frequency.value = f * (o.arm || 2); g2.gain.value = o.armV == null ? 0.18 : o.armV;
    if (o.desliza) { o1.frequency.setValueAtTime(f, t); o1.frequency.exponentialRampToValueAtTime(o.desliza, t + dur); o2.frequency.setValueAtTime(f * 2, t); o2.frequency.exponentialRampToValueAtTime(o.desliza * 2, t + dur); }
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
    var a = o.ataque || 0.012, r = o.relevo == null ? 0.08 : o.relevo;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a);
    if (o.sost) { g.gain.setValueAtTime(v, t + Math.max(a, dur - r)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
    else { g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    return { f: f };
  }
  var S = {
    on: function(){ return on; },
    unlock: function(){ ac(); },
    nota: function(f, dur, o){ if (!on) return; voz(f, 0, dur, o); },
    // Notas de una escala pentatónica (agradable, sin disonancias)
    ok: function(){ if (!on) return; [523.25, 659.25, 783.99, 1046.5].forEach(function(f, i){ voz(f, i * 0.085, 0.45, { vol: 0.11 }); }); },
    bad: function(){ if (!on) return; voz(392, 0, 0.22, { vol: 0.07, armV: 0.05 }); voz(329.63, 0.16, 0.32, { vol: 0.07, armV: 0.05 }); },
    tick: function(){ if (!on) return; voz(1100, 0, 0.05, { vol: 0.035, armV: 0, ataque: 0.004 }); },
    pop: function(){ if (!on) return; voz(520, 0, 0.09, { vol: 0.08, tipo: 'triangle', armV: 0.05 }); },
    exchange: function(){ if (!on) return; voz(392, 0, 0.28, { vol: 0.09, desliza: 784 }); voz(1318.5, 0.26, 0.4, { vol: 0.07 }); },
    angulo: function(grados){ if (!on) return; var f = 220 * Math.pow(2, (grados % 360) / 360 * 2); voz(f, 0, 0.11, { vol: 0.06, tipo: 'triangle', armV: 0.08 }); },
    toggle: function(){ on = !on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) {} if (on) { ac(); S.tick(); } return on; },
    voz: voz
  };
  window.Snd = S;
  document.addEventListener('pointerdown', function(e){ ac(); if (e.target.closest && e.target.closest('button') && !e.target.closest('.cn-k,.pf-tab')) S.tick(); }, true);
  document.addEventListener('pointerdown', function(e){ if (e.target.closest && e.target.closest('.cn-k')) S.tick(); }, true);
  var ICO_ON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/></svg>';
  var ICO_OFF = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>';
  S.montar = function(slot){
    var b = document.createElement('button'); b.type = 'button'; b.className = 'snd-btn';
    function pinta(){ b.innerHTML = (on ? ICO_ON : ICO_OFF) + '<span>' + (on ? 'Sonido' : 'Sin sonido') + '</span>'; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', on ? 'Desactivar el sonido de esta actividad' : 'Activar el sonido de esta actividad'); }
    b.onclick = function(){ S.toggle(); pinta(); }; pinta(); slot.insertBefore(b, slot.firstChild);
  };
})();
