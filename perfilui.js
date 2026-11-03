/* Ventanas de perfiles y de emociones (usa Perf). Todo queda en este dispositivo. */
(function(){
  var P=window.Perf; if(!P) return;
  function el(t,c,x){var e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e;}
  function avatar(p,w){var s=el('span','pu-av'); if(window.Ilu) s.innerHTML=Ilu.html('axo_feliz',{tema:p?p.tema:'rosa'}); if(w)s.style.width=w; return s;}
  function capa(titulo,cierra){
    var ov=el('div','pu-ov'), box=el('div','pu-box'); ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true'); ov.setAttribute('aria-label',titulo);
    ov.appendChild(box); box.appendChild(el('h2','pu-h',titulo));
    function fin(){ if(ov.parentNode)ov.parentNode.removeChild(ov); document.removeEventListener('keydown',kd,true); if(cierra)cierra(); }
    function kd(e){ e.stopPropagation(); if(e.key==='Escape'){e.preventDefault(); fin();} }
    document.addEventListener('keydown',kd,true);
    ov.addEventListener('click',function(e){ if(e.target===ov)fin(); });
    document.body.appendChild(ov); return {ov:ov,box:box,fin:fin};
  }
  var TALL={1:'Taller 1 · 6 a 9 años',2:'Taller 2 · 9 a 12 años',3:'Taller 3 · 12 a 15 años'};
  function sel(opts,val,lab){var s=el('select'); s.setAttribute('aria-label',lab); Object.keys(opts).forEach(function(k){var o=el('option',null,opts[k]); o.value=k; if(String(k)===String(val))o.selected=true; s.appendChild(o);}); return s;}

  window.PerfUI={
    TALL:TALL, avatar:avatar,
    // "¿Quién juega?"
    elegir:function(cb){
      var c=capa('¿Quién juega?'), b=c.box, lista=el('div','pu-list'); b.appendChild(lista);
      function pinta(){
        lista.innerHTML='';
        P.lista().forEach(function(p){
          var bt=el('button','pu-card'); bt.type='button'; bt.appendChild(avatar(p)); bt.appendChild(el('span','pu-nom',p.nombre)); bt.appendChild(el('span','pu-sub','Taller '+p.taller+' · año '+p.anio));
          bt.onclick=function(){P.setActivo(p.id); c.fin(); if(cb)cb();}; lista.appendChild(bt);
        });
        if(P.lista().length<P.max()){
          var n=el('button','pu-card pu-new'); n.type='button'; n.appendChild(el('span','pu-plus','+')); n.appendChild(el('span','pu-nom','Nuevo')); n.onclick=form; lista.appendChild(n);
        }
        var g=el('button','pu-card pu-guest'); g.type='button'; g.appendChild(el('span','pu-plus','?')); g.appendChild(el('span','pu-nom','Jugar sin perfil')); g.appendChild(el('span','pu-sub','no se guarda nada'));
        g.onclick=function(){P.setActivo(null); c.fin(); if(cb)cb();}; lista.appendChild(g);
        if(P.lista().length>=P.max()) pie.textContent='Ya hay '+P.max()+' perfiles. Un adulto puede borrar alguno o cambiar a «salón» en el Diario.'; else pie.textContent='';
      }
      var pie=el('p','pu-pie'); b.appendChild(pie);
      function form(){
        b.innerHTML=''; b.appendChild(el('h2','pu-h','Perfil nuevo'));
        var f=el('div','pu-form'), l1=el('label',null,'Nombre'), inp=el('input'); inp.type='text'; inp.maxLength=14; inp.autocomplete='off'; inp.spellcheck=false; l1.appendChild(inp);
        var t=sel(TALL,2,'Taller'), a=sel({1:'Año 1',2:'Año 2',3:'Año 3'},1,'Año del ciclo');
        var l2=el('label',null,'Taller (un adulto puede ajustarlo)'); l2.appendChild(t); var l3=el('label',null,'Año del taller'); l3.appendChild(a);
        var er=el('p','pu-err'); er.setAttribute('role','alert');
        var ok=el('button','pu-go','Listo'); ok.type='button'; var ca=el('button','pu-sec','Volver'); ca.type='button';
        ok.onclick=function(){var r=P.crear(inp.value,t.value,a.value); if(r.ok){P.setActivo(r.ok.id); c.fin(); if(cb)cb();} else er.textContent={nombre:'Escribe tu nombre (solo letras).',repetido:'Ese nombre ya existe. Agrega una letra o tu apellido.',lleno:'Ya no caben más perfiles.'}[r.err];};
        ca.onclick=function(){b.innerHTML=''; b.appendChild(el('h2','pu-h','¿Quién juega?')); b.appendChild(lista); b.appendChild(pie); pinta();};
        inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault(); ok.click();}});
        [l1,l2,l3,er].forEach(function(x){f.appendChild(x);}); var fila=el('div','pu-row'); fila.appendChild(ca); fila.appendChild(ok); f.appendChild(fila); b.appendChild(f); setTimeout(function(){inp.focus();},50);
      }
      pinta();
    },
    // "¿Cómo te sentiste?" (se puede saltar)
    chequeo:function(titulo,cb){
      var c=capa(titulo||'¿Cómo te sentiste?'), row=el('div','pu-emo');
      P.EMO.forEach(function(e){
        var b=el('button','pu-e'); b.type='button'; b.setAttribute('aria-label',P.EMOL[e]);
        var s=el('span','pu-eface'); if(window.Ilu)s.innerHTML=Ilu.html('emo_'+e); b.appendChild(s); b.appendChild(el('span',null,P.EMOL[e]));
        b.onclick=function(){c.fin(); if(cb)cb(e);}; row.appendChild(b);
      });
      c.box.appendChild(row);
      var sk=el('button','pu-sec','Ahora no'); sk.type='button'; sk.onclick=function(){c.fin(); if(cb)cb(null);}; c.box.appendChild(sk);
    }
  };
})();
