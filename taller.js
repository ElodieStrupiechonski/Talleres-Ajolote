/* Talleres de Matemáticas · © 2026 Elodie Strupiechonski y Andrés de Luna Bugallo · CC BY-NC-SA 4.0 · https://creativecommons.org/licenses/by-nc-sa/4.0/ */
// Comportamiento común del quiosco: pasos +/− en lugar de deslizadores,
// botones arcade (control de juego USB) o teclas, y regreso automático al índice.
(function(){
  // Índice de botón del control de juego para cada acción.
  // Para saber qué número tiene cada botón físico, abrir probar-botones.html y pulsarlos.
  var MAPA = { inicio: 0, siguiente: 1, atras: 2 };

  var isIndex = /(^|\/)(index\.html)?$/.test(location.pathname);

  // 1. Convertir cada deslizador en un control − / + grande
  document.querySelectorAll('input[type=range]').forEach(function(r){
    var lab = document.querySelector('label[for="'+r.id+'"]');
    if (lab) {
      var b = lab.querySelector('b'); if (b) b.hidden = true;
      if (lab.firstChild && lab.firstChild.nodeType === 3) lab.firstChild.textContent = lab.firstChild.textContent.replace(/:\s*$/, '');
    }
    var w = document.createElement('span'); w.className = 'stepper';
    var minus = document.createElement('button'); minus.type='button'; minus.textContent='−'; minus.setAttribute('aria-label','Menos');
    var out = document.createElement('output'); out.textContent = r.value;
    var plus = document.createElement('button'); plus.type='button'; plus.textContent='+'; plus.setAttribute('aria-label','Más');
    r.parentNode.insertBefore(w, r); w.append(minus, out, plus, r);
    function set(v){ v=Math.max(+r.min, Math.min(+r.max, v)); if (v==r.value) return; r.value=v; out.textContent=v; r.dispatchEvent(new Event('input',{bubbles:true})); }
    minus.onclick=function(){ set(+r.value-1); };
    plus.onclick=function(){ set(+r.value+1); };
  });

  // 2. Acciones de los botones físicos
  var t;
  function reiniciarInactividad(){
    if (isIndex) return;
    clearTimeout(t);
    clearTimeout(window.__aviso); var av=document.getElementById('aviso-inact'); if (av) av.hidden=true;
    window.__aviso = setTimeout(function(){
      var a=document.getElementById('aviso-inact');
      if(!a){ a=document.createElement('div'); a.id='aviso-inact'; a.setAttribute('role','alert');
        a.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);background:var(--fg);color:var(--bg);padding:12px 22px;border-radius:12px;font:700 1.1rem var(--display);z-index:99;box-shadow:0 4px 16px #0004';
        a.textContent='¿Sigues aquí? Toca la pantalla para continuar.'; document.body.appendChild(a); }
      a.hidden=false; }, 160000);
    t = setTimeout(function(){ location.href = 'index.html'; }, 180000);
  }
  function accion(nombre){
    reiniciarInactividad();
    if (nombre === 'inicio') { location.href = 'index.html'; }
    else if (nombre === 'siguiente') { var n = document.getElementById('next'); if (n) n.click(); }
    else if (nombre === 'atras') { if (!isIndex) history.back(); }
  }

  // 2a. Teclado (pruebas): Inicio, flecha derecha, flecha izquierda
  document.addEventListener('keydown', function(ev){
    var a = ev.key === 'Home' ? 'inicio' : ev.key === 'ArrowRight' ? 'siguiente' : ev.key === 'ArrowLeft' ? 'atras' : null;
    if (!a) return;
    ev.preventDefault(); accion(a);
  });

  // 2b. Control de juego USB (placa de botones arcade)
  var previo = {};
  setInterval(function(){
    var pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (var i = 0; i < pads.length; i++) {
      var p = pads[i]; if (!p) continue;
      for (var nombre in MAPA) {
        var b = p.buttons[MAPA[nombre]], k = i + ':' + nombre, abajo = !!(b && b.pressed);
        if (abajo && !previo[k]) accion(nombre);
        previo[k] = abajo;
      }
    }
  }, 40);

  // 3. Sin actividad por 3 minutos: volver al índice
  ['pointerdown','keydown'].forEach(function(e){ document.addEventListener(e, reiniciarInactividad, {passive:true}); });
  reiniciarInactividad();

  // 4. Evitar menú contextual con pulsación larga
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); });

  // 3. Ayuda: los párrafos .det se muestran solo al tocar "Ayuda"
  document.querySelectorAll('.tray').forEach(function(tr){
    var dets = tr.querySelectorAll('.det'); if (!dets.length) return;
    var b = document.createElement('button'); b.type='button'; b.className='ayuda'; b.textContent='? Ayuda'; b.setAttribute('aria-expanded','false');
    dets[0].parentNode.insertBefore(b, dets[0]);
    b.onclick = function(){ var on = !dets[0].classList.contains('on');
      dets.forEach(function(d){ d.classList.toggle('on', on); });
      b.setAttribute('aria-expanded', on); b.textContent = on ? '× Cerrar ayuda' : '? Ayuda'; reiniciarInactividad(); };
  });

  // 4. Marcador de aciertos: oculto por defecto (se sigue contando); los adultos pueden mostrarlo desde el índice
  var KEY='quiosco-aciertos';
  function leer(){ try{ return localStorage.getItem(KEY)==='1'; }catch(e){ return false; } }
  function guardar(v){ try{ localStorage.setItem(KEY, v?'1':'0'); }catch(e){} }
  document.querySelectorAll('p').forEach(function(p){
    var f = p.firstChild; if (!f || f.nodeType!==3 || f.textContent.indexOf('Aciertos:')!==0) return;
    var sp = document.createElement('span'); sp.className='sc';
    var nodes=[]; for (var n=p.firstChild; n && n.nodeName!=='BUTTON'; n=n.nextSibling) nodes.push(n);
    p.insertBefore(sp, p.firstChild); nodes.forEach(function(n){ sp.appendChild(n); });
    if (!p.querySelector('button')) p.classList.add('sc-solo');
  });
  document.documentElement.classList.toggle('ver-aciertos', leer());
  if (isIndex) {
    var tg = document.createElement('button'); tg.type='button'; tg.className='tg-aciertos';
    function rot(){ tg.textContent = leer() ? 'Ocultar aciertos y resumen (adultos)' : 'Mostrar aciertos y resumen (adultos)'; }
    tg.onclick = function(){ guardar(!leer()); document.documentElement.classList.toggle('ver-aciertos', leer()); rot(); };
    rot(); document.body.appendChild(tg);
  }

  // 6. Resumen para adultos: solo en pantalla, en memoria; se borra al salir de la página
  (function(){
    if (isIndex) return;
    var datos={}, t0=Date.now();
    function nombre(n){ var tr=n.closest&&n.closest('.tray'); if(!tr) return 'General'; var h=tr.querySelector('h2'),st=tr.querySelector('.step'); return (st?st.textContent.split('·')[0].trim()+' · ':'')+(h?h.textContent.trim():''); }
    function cuenta(n){ if(n.nodeType!==1) return;
      var lst=(n.matches&&n.matches('.ok,.bad'))?[n]:Array.prototype.slice.call(n.querySelectorAll?n.querySelectorAll('.ok,.bad'):[]);
      lst.forEach(function(e){ var k=nombre(e); datos[k]=datos[k]||{ok:0,bad:0}; datos[k][e.classList.contains('ok')?'ok':'bad']++; }); }
    new MutationObserver(function(ms){ ms.forEach(function(m){ m.addedNodes.forEach(cuenta); }); }).observe(document.body,{childList:true,subtree:true});
    var btn=document.createElement('button'); btn.type='button'; btn.className='res-btn'; btn.textContent='Resumen'; document.body.appendChild(btn);
    var pan=document.createElement('div'); pan.className='res-panel'; pan.hidden=true; document.body.appendChild(pan);
    btn.onclick=function(){
      if(!pan.hidden){ pan.hidden=true; return; }
      var min=Math.max(1,Math.round((Date.now()-t0)/60000)), f='';
      Object.keys(datos).forEach(function(k){ var d=datos[k], tot=d.ok+d.bad; f+='<tr><td>'+k+'</td><td>'+d.ok+'</td><td>'+d.bad+'</td></tr>'; });
      pan.innerHTML='<b>Resumen de esta visita</b><br><small>'+document.title+' · unos '+min+' min en pantalla</small>'+
        (f?'<table><tr><th>Bandeja</th><th>✓ Correctas</th><th>Intentos fallidos</th></tr>'+f+'</table>':'<p>Todavía no hay respuestas.</p>')+
        '<small>Solo se muestra aquí. No se guarda nada y se borra al salir del taller.</small><br><button type="button" class="res-x">Cerrar</button>';
      pan.querySelector('.res-x').onclick=function(){ pan.hidden=true; }; pan.hidden=false; reiniciarInactividad(); };
  })();

  // 7. Funcionar sin internet cuando se instala como app (requiere https o localhost)
  if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('sw.js'); } catch(e) {} }

  // 8. Pie con licencia y créditos en cada taller
  if (!isIndex && !/creditos\.html$|probar-botones\.html$/.test(location.pathname)) {
    var pie=document.createElement('p'); pie.className='footer pie-creditos';
    pie.innerHTML='© 2026 Elodie Strupiechonski y Andrés de Luna Bugallo · CC BY-NC-SA 4.0 · <a href="creditos.html">Créditos y cómo citar</a>';
    var w=document.querySelector('.wrap')||document.body; w.appendChild(pie);
  }
})();
