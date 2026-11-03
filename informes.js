/* Informes descargables: CSV (para hojas de cálculo) y PDF (para leer o imprimir). Todo se genera en este dispositivo. */
(function(root){
  var P=root.Perf,R=root.Rutas,PDF=root.PDF;
  var COL={feliz:'#f2c77a',tranquilo:'#bfe5c6',aburrido:'#ddd6c8',confundido:'#c9b0e6',frustrado:'#ec8e78'};
  var INK='#41362b',MUT='#7a6c5c';
  function fecha(t){var d=new Date(t); return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);}
  function hora(t){var d=new Date(t); return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);}
  function fechaLarga(t){if(!t)return '—'; var m=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],d=new Date(t); return d.getDate()+' de '+m[d.getMonth()]+' de '+d.getFullYear();}
  function csvc(v){v=String(v==null?'':v); return /[",\n;]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
  function csv(filas){return '﻿'+filas.map(function(f){return f.map(csvc).join(',');}).join('\r\n')+'\r\n';}
  function bandeja(pg,b){var e=R.EST[pg]&&R.EST[pg][b-1]; return e?e[0]:'';}
  function claves(p){return Object.keys(p.prog).map(function(k){var a=k.split('|'); return {p:a[0],b:+a[1],l:+a[2],n:p.prog[k],t:p.sup[k]||0};});}
  var API={
    csvProgreso:function(ps){var f=[['Perfil','Taller','Año','Tema','Bandeja','Nivel','Aciertos','Superado (5 aciertos)','Fecha superado']];
      ps.forEach(function(p){claves(p).sort(function(a,b){return (a.p>b.p)-(a.p<b.p)||a.b-b.b||a.l-b.l;}).forEach(function(c){
        f.push([p.nombre,p.taller,p.anio,R.TEMA[c.p]||c.p,c.b+'. '+bandeja(c.p,c.b),c.l||'',c.n,c.n>=P.META?'sí':'no',c.t?fecha(c.t):'']);});
        Object.keys(p.vis).forEach(function(k){var a=k.split('|'); f.push([p.nombre,p.taller,p.anio,R.TEMA[a[0]]||a[0],a[1]+'. '+bandeja(a[0],+a[1]),'','','visitada',fecha(p.vis[k])]);});});
      return csv(f);},
    csvEmociones:function(ps){var f=[['Perfil','Taller','Año','Fecha','Hora','Tema','Bandeja','Nivel','Emoción','Momento']];
      ps.forEach(function(p){p.emo.forEach(function(e){f.push([p.nombre,p.taller,p.anio,fecha(e.t),hora(e.t),R.TEMA[e.p]||e.p,e.b+'. '+bandeja(e.p,e.b),e.l||'',P.EMOL[e.e],e.tipo==='fin'?'al terminar el nivel':'durante la actividad']);});});
      return csv(f);},
    resumen:function(p){var est=R.estado(p),cuenta={};P.EMO.forEach(function(e){cuenta[e]=0;}); p.emo.forEach(function(e){cuenta[e.e]++;});
      var sup=claves(p).filter(function(c){return c.n>=P.META;}).length;
      var temas={}; est.pasos.forEach(function(s){var t=temas[s.p]=temas[s.p]||{h:0,t:0}; t.t++; if(P.hecho(p,s.p,s.b,s.l))t.h++;});
      return {est:est,cuenta:cuenta,sup:sup,temas:temas,vis:Object.keys(p.vis).length};},
    // ---------- PDF ----------
    _cara:function(d,cx,cy,r,e){d.circ(cx,cy,r,{fill:COL[e],stroke:INK,lw:1.2}); var o=r*.32,y=cy-r*.1;
      if(e==='feliz'){d.curva(cx-o-r*.18,y,cx-o,y-r*.3,cx-o+r*.18,y,{lw:1,color:INK});d.curva(cx+o-r*.18,y,cx+o,y-r*.3,cx+o+r*.18,y,{lw:1,color:INK});d.curva(cx-r*.45,cy+r*.2,cx,cy+r*.75,cx+r*.45,cy+r*.2,{lw:1.2,color:INK});}
      else if(e==='tranquilo'){d.curva(cx-o-r*.18,y,cx-o,y+r*.2,cx-o+r*.18,y,{lw:1,color:INK});d.curva(cx+o-r*.18,y,cx+o,y+r*.2,cx+o+r*.18,y,{lw:1,color:INK});d.curva(cx-r*.3,cy+r*.35,cx,cy+r*.6,cx+r*.3,cy+r*.35,{lw:1.2,color:INK});}
      else if(e==='aburrido'){d.linea(cx-o-r*.2,y,cx-o+r*.2,y,{lw:1.2,color:INK});d.linea(cx+o-r*.2,y,cx+o+r*.2,y,{lw:1.2,color:INK});d.linea(cx-r*.3,cy+r*.45,cx+r*.3,cy+r*.45,{lw:1.2,color:INK});}
      else if(e==='confundido'){d.circ(cx-o,y,r*.1,{fill:INK});d.circ(cx+o,y,r*.1,{fill:INK});d.curva(cx-r*.35,cy+r*.45,cx-r*.12,cy+r*.25,cx,cy+r*.45,{lw:1.2,color:INK});d.curva(cx,cy+r*.45,cx+r*.12,cy+r*.65,cx+r*.35,cy+r*.45,{lw:1.2,color:INK});}
      else {d.circ(cx-o,y,r*.1,{fill:INK});d.circ(cx+o,y,r*.1,{fill:INK});d.linea(cx-o-r*.22,y-r*.3,cx-o+r*.2,y-r*.12,{lw:1.3,color:INK});d.linea(cx+o+r*.22,y-r*.3,cx+o-r*.2,y-r*.12,{lw:1.3,color:INK});d.curva(cx-r*.35,cy+r*.6,cx,cy+r*.25,cx+r*.35,cy+r*.6,{lw:1.2,color:INK});}},
    _marco:function(d,titulo,sub){d.pagina(); d.rect(0,0,d.W,58,{fill:'#f2c77a'}); d.texto(40,30,titulo,{size:18,bold:true,color:INK}); d.texto(40,48,sub,{size:10,color:INK});
      d.texto(40,d.H-26,'Talleres de Matemáticas · Generado en este dispositivo el '+fechaLarga(Date.now())+' · CC BY-NC-SA 4.0 · Página '+d.n(),{size:8,color:MUT}); return 82;},
    _barra:function(d,x,y,w,fr,h){d.rect(x,y,w,h||9,{fill:'#eee6d6'}); if(fr>0)d.rect(x,y,Math.max(2,w*fr),h||9,{fill:'#6fae7e'});},
    pdfPerfil:function(p){var d=PDF.nuevo(),s=API.resumen(p),y=API._marco(d,'Informe de '+p.nombre,'Taller '+p.taller+' ('+R.TALLER[p.taller].edad+') · año '+p.anio+' del ciclo · última actividad: '+fechaLarga(p.ult));
      function salto(h){if(y+h>d.H-50){y=API._marco(d,'Informe de '+p.nombre,'continuación');}}
      d.texto(40,y,'Avance en su camino',{size:13,bold:true,color:INK}); y+=14;
      API._barra(d,40,y,515,s.est.total?s.est.hechos/s.est.total:0,12); y+=14; d.texto(40,y+10,s.est.hechos+' de '+s.est.total+' pasos del camino de Taller '+p.taller+', año '+p.anio+'  ·  '+s.sup+(s.sup===1?' nivel superado':' niveles superados')+' (5 aciertos)  ·  '+s.vis+(s.vis===1?' bandeja visitada':' bandejas visitadas'),{size:10,color:MUT}); y+=26;
      if(s.est.sig){d.texto(40,y,'Siguiente paso sugerido:',{size:10,bold:true,color:INK}); y=d.parrafo(160,y-10,395,R.etiqueta(s.est.sig)+({repaso:' (repaso, por las últimas emociones)',reto:' (un poco más difícil, por las últimas emociones)',sigue:'',año:''}[s.est.motivo]||''),{size:10,color:INK})+12;}
      else {d.texto(40,y,'¡Completó todos los pasos de este año del camino!',{size:10,bold:true,color:'#3f7a50'}); y+=18;}
      salto(60); d.texto(40,y,'Por tema',{size:13,bold:true,color:INK}); y+=12;
      Object.keys(s.temas).forEach(function(t){salto(20); var q=s.temas[t]; d.texto(40,y+9,R.TEMA[t],{size:10,color:INK}); API._barra(d,200,y,260,q.t?q.h/q.t:0,9); d.texto(470,y+9,q.h+' de '+q.t,{size:10,color:MUT}); y+=18;});
      y+=10; salto(120); d.texto(40,y,'Cómo se sintió',{size:13,bold:true,color:INK}); y+=8;
      var tot=p.emo.length; if(!tot){d.texto(40,y+14,'Aún no hay emociones registradas.',{size:10,color:MUT}); y+=28;}
      else {P.EMO.forEach(function(e,i){var x=60+i*100; API._cara(d,x,y+22,16,e); d.texto(x-24,y+52,P.EMOL[e]+': '+s.cuenta[e],{size:9,color:INK});}); y+=66;
        d.parrafo(40,y,515,'Las caritas las elige el propio niño (al terminar un nivel o cuando quiere). Es una autoevaluación sencilla, no una prueba psicológica: sirve para conversar con él, no para etiquetarlo.',{size:9,color:MUT}); y+=34;}
      var rec=p.emo.slice(-12).reverse(); if(rec.length){salto(30+rec.length*16); d.texto(40,y,'Últimos registros',{size:11,bold:true,color:INK}); y+=8; rec.forEach(function(e){salto(18); API._cara(d,48,y+9,6.5,e.e); d.texto(62,y+12,fecha(e.t)+'  ·  '+(R.TEMA[e.p]||e.p)+' · '+bandeja(e.p,e.b)+(e.l?' · nivel '+e.l:'')+'  ·  '+P.EMOL[e.e],{size:9,color:INK}); y+=16;});}
      return d.bytes();},
    pdfGrupo:function(ps,titulo){var d=PDF.nuevo(),y=API._marco(d,titulo||'Resumen del grupo',ps.length+' perfiles · '+fechaLarga(Date.now()));
      function cab(){d.rect(40,y,515,18,{fill:'#eee6d6'}); ['Nombre','Taller-año','Avance del camino','Niveles','Emoción frecuente'].forEach(function(t,i){d.texto([46,150,215,420,470][i],y+12,t,{size:9,bold:true,color:INK});}); y+=22;}
      cab();
      ps.forEach(function(p){if(y>d.H-60){y=API._marco(d,titulo||'Resumen del grupo','continuación'); cab();}
        var s=API.resumen(p),top=null,m=0; P.EMO.forEach(function(e){if(s.cuenta[e]>m){m=s.cuenta[e];top=e;}});
        d.texto(46,y+11,p.nombre,{size:10,color:INK}); d.texto(150,y+11,p.taller+'-'+p.anio,{size:10,color:INK}); API._barra(d,215,y+3,140,s.est.total?s.est.hechos/s.est.total:0,9); d.texto(360,y+11,s.est.hechos+'/'+s.est.total,{size:9,color:MUT});
        d.texto(430,y+11,String(s.sup),{size:10,color:INK}); if(top){API._cara(d,478,y+7,6.5,top); d.texto(488,y+11,P.EMOL[top],{size:9,color:INK});} else d.texto(472,y+11,'—',{size:10,color:MUT});
        d.linea(40,y+17,555,y+17,{color:'#e6dccb',lw:.5}); y+=20;});
      y+=10; d.parrafo(40,y,515,'«Avance del camino»: pasos superados de la ruta propuesta para su Taller y año. «Niveles»: niveles con 5 aciertos. Las emociones son autoevaluaciones del niño; úselas para conversar, no para calificar. Los datos no salen de este dispositivo.',{size:9,color:MUT});
      return d.bytes();}
  };
  root.Inf=API;
  if(typeof module!=='undefined')module.exports=API;
})(typeof window!=='undefined'?window:globalThis);
