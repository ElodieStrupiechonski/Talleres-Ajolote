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
    ['7','8','9','4','5','6','1','2','3','⌫','0','✓'].forEach(function(k){
      var b=document.createElement('button'); b.type='button'; b.className='cn-k'+(k==='✓'?' cn-ok':'');
      b.textContent=k; if (k==='⌫') b.setAttribute('aria-label','Borrar'); if (k==='✓'){ b.setAttribute('aria-label','Comprobar'); b.textContent='✓ Comprobar'; }
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
