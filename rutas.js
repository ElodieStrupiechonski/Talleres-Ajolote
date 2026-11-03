/* Rutas por Taller Montessori (Taller 1 = 6 a 9 años, Taller 2 = 9 a 12, Taller 3 = 12 a 15) y año del ciclo (1, 2 o 3).
   PROPUESTA para revisar con las guías: cada línea es una lista de pasos "tema:bandeja" o "tema:bandeja:nivel" o "tema:bandeja:nivel-nivel".
   Una bandeja sin niveles (exploración) cuenta como hecha al visitarla; un nivel cuenta como superado con 5 aciertos.
   EST (nombre y número de niveles de cada bandeja) se generó de las páginas; hay que actualizarlo si se agregan bandejas. */
(function(root){
  var EST={"ajedrez":[["El tablero",0],["Cómo se mueve cada pieza",0],["Llegar a la casilla",5],["Capturar",5],["Puntos de las piezas",5],["Jaque",5],["Ponte a prueba",5]],"angulos":[["Abrir un ángulo",0],["Medir con el transportador",5],["Ponte a prueba",5],["Construye el ángulo",5]],"area":[["Cubrir con cuadritos",0],["Cortar por la diagonal",0],["Perímetro",0],["Figuras compuestas",5],["Diseña",5],["Problemas",5],["Ponte a prueba",5]],"cadenas":[["Cadenas de cuentas",0],["La tabla de multiplicar",0],["Patrones",5],["Partir rectángulos",5],["Múltiplos",5],["Problemas",5],["Ponte a prueba",5]],"decimal":[["Explorar",0],["× 10 y ÷ 10",0],["Ponte a prueba",0],["Formar números",6],["Sumar y restar",6],["Mover cuentas",0]],"dibujo":[["Mandala",0],["Cuadrícula de colores",0]],"divisiones":[["Repartir",0],["Hacer grupos",0],["Multiplicar y dividir",5],["División larga",5],["Problemas",5],["Ponte a prueba",5]],"dorado":[["Construir un número",0],["Sumar y cambiar 10 por 1",0],["Ponte a prueba",5]],"fracciones":[["Partir el entero",0],["Fracciones equivalentes",0],["Comparar",5],["Sumar y restar",5],["De una cantidad",5],["Recta numérica",5],["Ponte a prueba",5]],"probabilidad":[["Moneda",0],["Dados",0],["Qué tan probable",5],["Ruleta",5],["Dos monedas",0],["Todos los resultados",5],["La bolsa de canicas",5]],"programacion":[["Secuencias",0],["Repetir",0],["Decidir y fracciones",0]],"ritmo":[["Armar",5],["Completar",5],["Ponte a prueba",5],["Melodía",5]]};
  var TEMA={dorado:'Cuentas doradas',decimal:'Tablero decimal',cadenas:'Tablas de multiplicar',divisiones:'Divisiones',fracciones:'Fracciones',ritmo:'Ritmo',angulos:'Ángulos',area:'Área',dibujo:'Dibujo',ajedrez:'Ajedrez',programacion:'Programación',probabilidad:'Probabilidad'};
  var TALLER={1:{n:'Taller 1',edad:'6 a 9 años'},2:{n:'Taller 2',edad:'9 a 12 años'},3:{n:'Taller 3',edad:'12 a 15 años',nota:'El contenido de este taller está en construcción: por ahora son los niveles de reto.'}};
  var R={
    '1-1':'dorado:1 dorado:2 decimal:1 cadenas:1 divisiones:1 fracciones:1 area:1 ajedrez:1 ajedrez:2 dibujo:1 programacion:1 probabilidad:1',
    '1-2':'dorado:3:1-2 cadenas:2 cadenas:3:1-2 divisiones:2 divisiones:3:1 fracciones:2 area:2 area:3 angulos:1 ritmo:1:1-2 probabilidad:2 programacion:2 dibujo:2',
    '1-3':'dorado:3:3 decimal:2 decimal:3 cadenas:3:3-4 cadenas:4:1-2 divisiones:3:2-3 fracciones:3:1-2 area:4:1-2 angulos:2:1-2 ritmo:2:1-2 ajedrez:3:1-3',
    '2-1':'dorado:3:4-5 decimal:4:1-3 decimal:5:1-3 cadenas:3:5 cadenas:4:3-5 divisiones:3:3-5 divisiones:4:1-2 fracciones:3:3-5 fracciones:4:1-2 area:4:3-5 angulos:2:3-5 ritmo:3:1-3 ajedrez:4:1-3 programacion:3 probabilidad:3:1-3',
    '2-2':'decimal:4:4-6 decimal:5:4-6 decimal:6 cadenas:5 cadenas:6 divisiones:4:3-5 divisiones:5 fracciones:4:3-5 fracciones:5 area:5 area:6 angulos:3 angulos:4:1-3 ritmo:3:4-5 ajedrez:4:4-5 ajedrez:5 probabilidad:4 probabilidad:5 probabilidad:6:1-3',
    '2-3':'cadenas:7 divisiones:6 fracciones:6 fracciones:7 area:7 angulos:4:4-5 ritmo:4 ajedrez:6 ajedrez:7 probabilidad:6:4-5 probabilidad:7',
    '3-1':'decimal:4:6 dorado:3:5 cadenas:7:5 divisiones:6:5 fracciones:7:5',
    '3-2':'area:7:5 angulos:4:5 ritmo:3:5 probabilidad:7:5 ajedrez:7:5',
    '3-3':'fracciones:5:5 cadenas:6:5 divisiones:5:5 area:6:5 probabilidad:4:5'
  };
  function expande(spec){var a=spec.split(':'),p=a[0],b=+a[1],out=[],bn=EST[p]&&EST[p][b-1]; if(!bn)return out;
    var niv=bn[1]; if(!niv||!a[2]){out.push({p:p,b:b,l:niv?1:0}); if(niv&&!a[2]){out.length=0; for(var l=1;l<=niv;l++)out.push({p:p,b:b,l:l});} return out;}
    var r=a[2].split('-'),d=+r[0],h=+(r[1]||r[0]); for(var l2=d;l2<=h&&l2<=niv;l2++)out.push({p:p,b:b,l:l2}); return out;}
  function pasos(taller,anio){var s=R[taller+'-'+anio]; if(!s)return []; var out=[]; s.split(' ').forEach(function(x){expande(x).forEach(function(y){out.push(y);});}); return out;}
  function etiqueta(s){var bn=EST[s.p][s.b-1][0]; return TEMA[s.p]+' · '+bn+(s.l?' · nivel '+s.l:'');}
  function url(s){return s.p+'.html#b'+s.b+(s.l?'n'+s.l:'');}
  // siguiente paso recomendado para un perfil (usa Perf.hecho). Ajusta según las dos últimas emociones.
  function estado(perfil){var ps=pasos(perfil.taller,perfil.anio),hechos=0,sig=-1;
    ps.forEach(function(s,i){var h=root.Perf.hecho(perfil,s.p,s.b,s.l); if(h)hechos++; else if(sig<0)sig=i;});
    var rec=sig>=0?ps[sig]:null,motivo=sig>=0?'sigue':'año';
    var ue=root.Perf.ultimasEmo(perfil,2).map(function(x){return x.e;});
    if(rec&&ue.length===2){
      if(ue.every(function(e){return e==='frustrado'||e==='confundido';})){ // repasar un nivel más fácil
        if(rec.l>1){rec={p:rec.p,b:rec.b,l:rec.l-1}; motivo='repaso';} else if(sig>0){rec=ps[sig-1]; motivo='repaso';} }
      else if(ue.every(function(e){return e==='aburrido';})&&sig+1<ps.length){rec=ps[sig+1]; motivo='reto';} }
    return {pasos:ps,hechos:hechos,total:ps.length,sig:rec,motivo:motivo,fin:sig<0};}
  root.Rutas={EST:EST,TEMA:TEMA,TALLER:TALLER,R:R,pasos:pasos,etiqueta:etiqueta,url:url,estado:estado};
})(typeof window!=='undefined'?window:globalThis);
