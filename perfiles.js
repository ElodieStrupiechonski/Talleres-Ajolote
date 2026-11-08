/* Perfiles y progreso. TODO se guarda solo en este dispositivo (localStorage); no se envía a ningún servidor.
   Tipo de uso: "hogar" = hasta 5 perfiles, "salon" = hasta 25. El adulto lo cambia en el Diario.
   Un perfil guarda: nombre, Taller (1, 2 o 3) y año del ciclo (1, 2 o 3), aciertos por nivel, bandejas visitadas y emociones. */
(function(root){
  var KEY='tm_v2', META=5, TEMAS=['rosa','azul','amarillo','menta','lila','durazno'];
  var EMO=['feliz','tranquilo','aburrido','confundido','frustrado'];
  var EMOL={feliz:'Feliz',tranquilo:'Tranquilo',aburrido:'Aburrido',confundido:'Confundido',frustrado:'Frustrado'};
  // Ajolotes: un color por nombre en náhuatl (el niño puede cambiarle el nombre)
  var MASC={rosa:{n:'Xochitl',s:'flor',d:'so-chil'},azul:{n:'Atl',s:'agua',d:'atl'},amarillo:{n:'Tonalli',s:'sol, calor del sol',d:'to-na-li'},menta:{n:'Quetzalli',s:'pluma preciosa',d:'ket-sa-li'},lila:{n:'Citlali',s:'estrella',d:'sit-la-li'},durazno:{n:'Papalotl',s:'mariposa',d:'pa-pa-lotl'}};
  var D=null, oyentes=[];
  function nuevo(){return {v:2,modo:'hogar',pin:'',activo:null,perfiles:[]};}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(D));}catch(e){} oyentes.forEach(function(f){try{f();}catch(e){}});}
  function limpia(n){return String(n||'').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñÈèÀàÂâÊêÎîÔôÛûÇç' -]/g,'').replace(/\s+/g,' ').trim().slice(0,14);}
  function limpiaMas(n){return String(n||'').replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g,'').replace(/\s+/g,' ').trim().slice(0,12);}
  function uid(){return Math.random().toString(36).slice(2,8);}
  function max(){return D.modo==='salon'?25:5;}
  function activo(){for(var i=0;i<D.perfiles.length;i++)if(D.perfiles[i].id===D.activo)return D.perfiles[i];return null;}
  function porId(id){for(var i=0;i<D.perfiles.length;i++)if(D.perfiles[i].id===id)return D.perfiles[i];return null;}
  function crear(nombre,taller,anio,tema,mas){
    nombre=limpia(nombre); if(!nombre)return {err:'nombre'};
    if(D.perfiles.length>=max())return {err:'lleno'};
    if(D.perfiles.some(function(p){return p.nombre.toLowerCase()===nombre.toLowerCase();}))return {err:'repetido'};
    var p={id:uid(),nombre:nombre,taller:+taller||2,anio:+anio||1,tema:(TEMAS.indexOf(tema)>=0?tema:TEMAS[D.perfiles.length%TEMAS.length]),mas:limpiaMas(mas),creado:Date.now(),prog:{},sup:{},vis:{},emo:[],ult:0};
    D.perfiles.push(p); save(); return {ok:p};}
  function k(page,b,l){return page+'|'+b+'|'+(l||0);}
  function load(){
    D=nuevo();
    try{var s=localStorage.getItem(KEY); if(s){var o=JSON.parse(s); if(o&&o.v===2&&o.perfiles)D=o;}}catch(e){}
    try{var n=localStorage.getItem('tm_nombre'); if(n&&!D.perfiles.length){var r=crear(n,2,1); if(r.ok){D.activo=r.ok.id;save();} localStorage.removeItem('tm_nombre');}}catch(e){}
  }
  load();
  var P={
    META:META, EMO:EMO, EMOL:EMOL, TEMAS:TEMAS,
    MASC:MASC, limpiaMas:limpiaMas,
    // ajolote de un perfil (o del tema dado si no hay perfil): {tema, nombre, sig, dice}
    mascota:function(p,temaInv){var t=(p&&p.tema)||temaInv||'rosa'; if(!MASC[t])t='rosa'; var m=MASC[t]; return {tema:t,nombre:(p&&p.mas)||m.n,nat:m.n,sig:m.s,dice:m.d,propio:!!(p&&p.mas&&p.mas!==m.n)};},
    limpia:limpia, max:function(){return max();}, modo:function(){return D.modo;},
    setModo:function(m){ if(m!=='hogar'&&m!=='salon')return {err:'modo'}; if(m==='hogar'&&D.perfiles.length>5)return {err:'muchos'}; D.modo=m; save(); return {ok:1};},
    lista:function(){return D.perfiles.slice();}, activo:activo, porId:porId,
    setActivo:function(id){D.activo=(id&&porId(id))?id:null; save();},
    crear:crear,
    editar:function(id,c){var p=porId(id); if(!p)return {err:'no'};
      if(c.nombre!=null){var n=limpia(c.nombre); if(!n)return {err:'nombre'}; if(D.perfiles.some(function(q){return q!==p&&q.nombre.toLowerCase()===n.toLowerCase();}))return {err:'repetido'}; p.nombre=n;}
      if(c.taller)p.taller=+c.taller; if(c.anio)p.anio=+c.anio; if(c.tema&&TEMAS.indexOf(c.tema)>=0){ if(c.tema!==p.tema&&c.mas==null&&(!p.mas||p.mas===MASC[p.tema].n))p.mas=''; p.tema=c.tema;} if(c.mas!=null)p.mas=limpiaMas(c.mas); save(); return {ok:1};},
    borrar:function(id){D.perfiles=D.perfiles.filter(function(p){return p.id!==id;}); if(D.activo===id)D.activo=null; save();},
    // progreso del perfil activo (sin perfil = invitado: no se guarda)
    get:function(page,b,l){var p=activo(); return p?(p.prog[k(page,b,l)]||0):0;},
    inc:function(page,b,l){var p=activo(); if(!p)return 0; var key=k(page,b,l); p.prog[key]=(p.prog[key]||0)+1; p.ult=Date.now(); if(p.prog[key]===META&&!p.sup[key])p.sup[key]=Date.now(); save(); return p.prog[key];},
    marca:function(page,b,l){var p=activo(); if(!p)return 0; var key=k(page,b,l); if((p.prog[key]||0)<META){p.prog[key]=META; if(!p.sup[key])p.sup[key]=Date.now(); p.ult=Date.now(); save(); return META;} return 0;},
    reset:function(page,b){var p=activo(); if(!p)return; Object.keys(p.prog).forEach(function(x){if(x.indexOf(page+'|'+b+'|')===0)delete p.prog[x];}); save();},
    visita:function(page,b){var p=activo(); if(!p)return; var key=page+'|'+b; if(!p.vis[key]){p.vis[key]=Date.now(); p.ult=Date.now(); save();}},
    emocion:function(page,b,l,e,tipo){var p=activo(); if(!p||EMO.indexOf(e)<0)return; p.emo.push({t:Date.now(),p:page,b:b,l:l||0,e:e,tipo:tipo||'fin'}); if(p.emo.length>600)p.emo=p.emo.slice(-600); p.ult=Date.now(); save();},
    hecho:function(p,page,b,l){ if(!l)return !!p.vis[page+'|'+b];
      // superar un nivel cuenta también como superados los niveles inferiores de la misma bandeja
      var pre=page+'|'+b+'|'; return Object.keys(p.prog).some(function(x){ if(x.indexOf(pre)!==0)return false; var n=+x.slice(pre.length); return n>=l&&(p.prog[x]||0)>=META; }); },
    ultimasEmo:function(p,n){return p.emo.slice(-(n||2));},
    // PIN del adulto (solo evita que los niños entren por curiosidad; no es seguridad real)
    tienePin:function(){return !!D.pin;},
    hash:function(s){var h=5381,t='tm·'+s; for(var i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0; return String(h);},
    setPin:function(pin){D.pin=pin?P.hash(pin):''; save();},
    revisaPin:function(pin){return D.pin===P.hash(pin);},
    abierto:function(){try{return Date.now()-(+sessionStorage.getItem('tm_ok')||0)<15*60*1000;}catch(e){return false;}},
    abre:function(){try{sessionStorage.setItem('tm_ok',String(Date.now()));}catch(e){}},
    cierra:function(){try{sessionStorage.removeItem('tm_ok');}catch(e){}},
    // copia de seguridad y traslado entre dispositivos
    exportar:function(id){var o={tipo:'tm-perfiles',v:2,fecha:new Date().toISOString(),perfiles:id?[porId(id)]:D.perfiles}; return JSON.stringify(o);},
    importar:function(txt){var o; try{o=JSON.parse(txt);}catch(e){return {err:'formato'};} if(!o||o.tipo!=='tm-perfiles'||!o.perfiles)return {err:'formato'};
      var n=0,omit=0; o.perfiles.forEach(function(q){ if(!q||!q.nombre)return; var ex=D.perfiles.filter(function(p){return p.id===q.id||p.nombre.toLowerCase()===String(q.nombre).toLowerCase();})[0];
        if(ex){var i=D.perfiles.indexOf(ex); D.perfiles[i]=q; n++;} else if(D.perfiles.length<max()){ q.tema=q.tema||TEMAS[D.perfiles.length%6]; D.perfiles.push(q); n++; } else omit++; });
      save(); return {ok:n,omitidos:omit};},
    borrarTodo:function(){D=nuevo(); try{localStorage.removeItem(KEY);}catch(e){} save();},
    alCambiar:function(f){oyentes.push(f);}
  };
  root.Perf=P;
  if(typeof module!=='undefined')module.exports=P;
})(typeof window!=='undefined'?window:globalThis);
