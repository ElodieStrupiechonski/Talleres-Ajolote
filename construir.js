/* Talleres de Matemáticas · © 2026 Elodie Strupiechonski y Andrés de Luna Bugallo · CC BY-NC-SA 4.0 · https://creativecommons.org/licenses/by-nc-sa/4.0/ */
// Construir la respuesta: teclado numérico en pantalla (en lugar de elegir entre opciones)
(function(){
  window.Construir = function(el, sp){
    el.innerHTML=''; el.classList.add('cn');
    var n=sp.n||1, max=sp.max||4, vals=[], foco=0, campos=[];
    for (var i=0;i<n;i++) vals.push('');
    var caja=document.createElement('div'); caja.className='cn-campos';
    function pinta(){ campos.forEach(function(c,i){ c.textContent = vals[i]===''?'?':vals[i]; c.classList.toggle('foco', i===foco); c.classList.toggle('vacio', vals[i]===''); }); }
    for (i=0;i<n;i++){
      (function(i){
        if (i>0 && sp.sep){ var s=document.createElement('span'); s.className='cn-sep'; s.textContent=sp.sep; caja.appendChild(s); }
        var wrap=document.createElement('div'); wrap.className='cn-wrap';
        if (sp.labels && sp.labels[i]){ var l=document.createElement('small'); l.textContent=sp.labels[i]; wrap.appendChild(l); }
        var c=document.createElement('button'); c.type='button'; c.className='cn-campo';
        c.setAttribute('aria-label', (sp.labels&&sp.labels[i])||'Respuesta');
        c.onclick=function(){ foco=i; pinta(); };
        campos.push(c); wrap.appendChild(c); caja.appendChild(wrap);
      })(i);
    }
    if (sp.unit){ var u=document.createElement('span'); u.className='cn-unit'; u.textContent=sp.unit; caja.appendChild(u); }
    var pad=document.createElement('div'); pad.className='cn-pad';
    ['1','2','3','4','5','6','7','8','9','0','⌫','✓'].forEach(function(k){
      var b=document.createElement('button'); b.type='button'; b.className='cn-k'+(k==='✓'?' cn-ok':'');
      b.textContent=k; if (k==='⌫'){ b.setAttribute('aria-label','Borrar'); b.style.gridColumn='span 2'; } if (k==='✓'){ b.setAttribute('aria-label','Comprobar'); b.textContent='✓ Comprobar'; }
      b.onclick=function(){
        if (k==='⌫'){ vals[foco]=vals[foco].slice(0,-1); }
        else if (k==='✓'){
          var v=vals.findIndex(function(x){return x==='';}); if (v>=0){ foco=v; pinta(); return; }
          var nums=vals.map(Number); if (sp.sep==='/' && nums[1]===0){ foco=1; vals[1]=''; pinta(); return; }
          sp.submit(nums); return; }
        else { if (vals[foco].length<max) vals[foco]=(vals[foco]==='0'?'':vals[foco])+k; }
        pinta();
      };
      pad.appendChild(b);
    });
    el.appendChild(caja); el.appendChild(pad); pinta();
  };

})();

/* Selector de niveles compartido: Niveles(ancla, nombres, alCambiar) -> {get()}. Nunca bloquea niveles. */
window.Niveles = function(ancla, nombres, cb){
  var caja=document.createElement('div'); caja.className='niv'; var lv=0;
  function pinta(){
    caja.innerHTML='';
    var t=document.createElement('span'); t.className='lbl2'; t.textContent='Nivel'; caja.appendChild(t);
    nombres.forEach(function(n,i){ var b=document.createElement('button'); b.type='button'; b.textContent=String(i+1); b.className=lv===i?'on':(i<lv?'pas':'');
      b.title=n; b.setAttribute('aria-label','Nivel '+(i+1)+': '+n); b.style.minWidth='46px';
      b.onclick=function(){ lv=i; pinta(); cb&&cb(i); }; caja.appendChild(b); });
    var d=document.createElement('span'); d.className='lbl2'; d.textContent=/^Hasta [\d.,]+$/.test(nombres[lv])?'Con números hasta '+nombres[lv].slice(6):nombres[lv]; caja.appendChild(d);
  }
  var nodo=ancla; while(nodo.parentNode && !(nodo.parentNode.classList && nodo.parentNode.classList.contains('tray')) && nodo.parentNode!==document.body) nodo=nodo.parentNode;
  nodo.parentNode.insertBefore(caja,nodo); pinta();
  return { get:function(){return lv;} };
};
