/* Biblioteca de ilustraciones "Abedul": mismo estilo en todos los talleres.
   Reglas de estilo: contorno marrón (#41362b) de 5 px con esquinas redondas, colores planos pastel, sin degradados,
   un brillo blanco pequeño en objetos redondos, sombra suave debajo. Mascota: ajolote (cambia de color según el taller).
   Uso en la página:  Ilu.html('moneda_aguila')  -> cadena SVG;   Ilu.mount(elemento,'dado_6',{size:96}).
   Los mismos dibujos se exportan a img/*.svg y img/gif/*.gif con herramientas/exportar_ilustraciones.js */
(function(root){
  var C={ink:'#41362b',cream:'#fffdf9',gold:'#e8b84a',goldD:'#c9962c',red:'#e9806c',blue:'#86aedb',green:'#86c496',lila:'#c4a6e0',yel:'#f2c77a',pink:'#f7c8da',paper:'#f0e3c8',wood:'#d9b98a',sh:'rgba(65,54,43,.16)'};
  var W=5; // grosor de contorno
  function st(w){return 'stroke="'+C.ink+'" stroke-width="'+(w||W)+'" stroke-linejoin="round" stroke-linecap="round"';}
  function circ(x,y,r,f,w){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+f+'" '+(w===0?'':st(w))+'/>';}
  function rect(x,y,w,h,r,f,sw){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+f+'" '+st(sw)+'/>';}
  function path(d,f,w){return '<path d="'+d+'" fill="'+(f||'none')+'" '+st(w)+'/>';}
  function ell(x,y,rx,ry,f,w){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="'+f+'" '+(w===0?'':st(w))+'/>';}
  function sombra(x,y,rx){return '<ellipse cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+(rx*0.16)+'" fill="'+C.sh+'"/>';}
  function brillo(x,y,r){return '<path d="M'+(x-r)+' '+y+' A'+r+' '+r+' 0 0 1 '+x+' '+(y-r)+'" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="5" stroke-linecap="round"/>';}
  function star(cx,cy,R,f){var p=[];for(var i=0;i<10;i++){var r=i%2?R*0.45:R,a=-Math.PI/2+i*Math.PI/5;p.push((cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1));}return '<polygon points="'+p.join(' ')+'" fill="'+f+'" '+st(4)+'/>';}
  var T={}; // dibujos: {t:'título', s: función(op)->inner, css:'animaciones', vb}
  function def(n,t,s,css,vb){T[n]={t:t,s:s,css:css||'',vb:vb||'0 0 200 200'};}

  /* ---- Cara "tierna" común a todos los personajes: ojos oscuros con dos brillos, mejillas y sonrisa chica ---- */
  function ojoK(x,y,r){r=r||9;return ell(x,y+r*0.4,r*0.9,r*1.1,C.ink,0)+circ((x-r*0.3).toFixed(1),(y-r*0.1).toFixed(1),r*0.38,'#fff',0)+circ((x+r*0.4).toFixed(1),(y+r*0.9).toFixed(1),r*0.2,'#fff',0);}
  function mejilla(x,y,r){return ell(x,y,r||10,(r||10)*0.65,'#f59aae',0);}
  function carita(cx,cy,sep,r){return ojoK(cx-sep,cy,r)+ojoK(cx+sep,cy,r)+mejilla(cx-sep-r*1.5,cy+r*1.8,r)+mejilla(cx+sep+r*1.5,cy+r*1.8,r)+path('M'+(cx-r*0.9)+' '+(cy+r*2)+' Q'+cx+' '+(cy+r*3.2)+' '+(cx+r*0.9)+' '+(cy+r*2),null,3.5);}

  /* ---- Ajolote, la mascota (cambia de color en cada taller) ---- */
  var TEMAS={
    rosa:{P:'#f7c8da',PD:'#f2a9c0',R:'#e9806c',B:'#fde4ec',acc:'star'},
    azul:{P:'#bcd8f0',PD:'#9bc2e6',R:'#c4a6e0',B:'#e6f1fb',acc:'leaf'},
    amarillo:{P:'#f9e0a0',PD:'#f2c77a',R:'#e9806c',B:'#fff3d0',acc:'plus'},
    menta:{P:'#bfe5c6',PD:'#9fd3ab',R:'#f2c77a',B:'#e8f6ea',acc:'drop'},
    lila:{P:'#dccbf0',PD:'#c4a6e0',R:'#86aedb',B:'#f1e9fa',acc:'leaf'},
    durazno:{P:'#f9cfb0',PD:'#f2b08a',R:'#86c496',B:'#fdeadb',acc:'drop'}};
  var TALLER_TEMA={fracciones:'rosa',divisiones:'azul',probabilidad:'amarillo',dorado:'durazno',decimal:'menta',cadenas:'lila',area:'amarillo',angulos:'durazno',ritmo:'rosa',ajedrez:'lila',programacion:'menta',dibujo:'azul',trazos:'menta',contar:'menta',algebra:'azul',enteros:'rosa',proporciones:'durazno',pitagoras:'azul'};
  function gillE(x,y,ang,L,s){var a=ang*Math.PI/180,dx=s*Math.cos(a),dy=Math.sin(a),cx=x+dx*L*0.5,cy=y+dy*L*0.5,rot=s*ang;
    return '<ellipse cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" rx="'+(L*0.5+4)+'" ry="7.5" fill="__R__" '+st()+' transform="rotate('+rot+' '+cx.toFixed(1)+' '+cy.toFixed(1)+')"/>'+
      '<ellipse cx="'+(cx+dx*3).toFixed(1)+'" cy="'+(cy+dy*3).toFixed(1)+'" rx="'+(L*0.28).toFixed(1)+'" ry="2.2" fill="#f5a99a" transform="rotate('+rot+' '+(cx+dx*3).toFixed(1)+' '+(cy+dy*3).toFixed(1)+')"/>';}
  /* Etapa del ajolote según el taller del perfil activo: 1 = tierno, 2 = con actitud, 3 = cool */
  function etapaActiva(){try{var p=window.Perf&&Perf.activo&&Perf.activo();var n=p?+p.taller:1;return n>=3?3:n===2?2:1;}catch(_){return 1;}}

  /* Mano abierta: palma y tres deditos separados (no es un círculo cerrado) */
  function mano(x,y,rot,P){var o='<g transform="translate('+x+' '+y+') rotate('+rot+')">';
    [-1,0,1].forEach(function(i){o+='<ellipse cx="'+(i*7.5)+'" cy="'+(i?-9.5:-11.5)+'" rx="3.9" ry="6.6" fill="'+P+'" '+st(3.2)+' transform="rotate('+(i*24)+' '+(i*7.5)+' -3)"/>';});
    return o+ell(0,0,9,7.5,P,3.5)+'</g>';}
  function engrane(cx,cy,R,f){var p=[],i,pat=[1,1,.76,.76];for(i=0;i<32;i++){var a=i*Math.PI/16,r=R*pat[i%4];p.push((cx+r*Math.cos(a)).toFixed(1)+','+(cy+r*Math.sin(a)).toFixed(1));}return '<polygon points="'+p.join(' ')+'" fill="'+f+'" '+st(3.5)+'/>'+circ(cx,cy,R*0.3,C.cream,3);}
  var PERS={rosa:'artista',azul:'deportista',amarillo:'ingeniero',menta:'estudioso',lila:'timido',durazno:'rebelde'};
  /* Personalidad: desde la etapa 1 hay un rasgo propio; en las etapas 2 y 3 se acentúa */
  function rasgos(per,et,e,up,t){
    var o='',ver=!up&&e!=='casi',R=t.R,cej=ver?path('M62 79 L88 85',null,5.5)+path('M138 79 L112 85',null,5.5):'';
    var lente=function(x,r){return '<circle cx="'+x+'" cy="92" r="'+r+'" fill="rgba(255,255,255,.28)" stroke="'+C.ink+'" stroke-width="3.6"/>';};
    var capucha=function(g){var d='M45 100 Q38 32 100 30 Q162 32 155 100';return path(d,null,g+5)+'<path d="'+d+'" fill="none" stroke="'+R+'" stroke-width="'+g+'" stroke-linecap="round"/>';};
    if(per==='artista'){ // boina, manchas de pintura y, al final, gafas de sol
      var k=et===1?0:et===2?7:10;
      o+='<g transform="rotate(-12 112 50)">'+ell(112,50,24+k,11+k*0.3,R)+circ(112,38-k*0.3,4,R,3.5)+'</g>';
      if(et>=2)o+=circ(150,70,4,C.blue,0)+circ(142,62,3,C.yel,0)+circ(155,80,3,C.green,0);
      if(et===3)o+='<rect x="58" y="82" width="36" height="21" rx="7" fill="#2b2430" stroke="'+C.ink+'" stroke-width="3.5"/><rect x="106" y="82" width="36" height="21" rx="7" fill="#2b2430" stroke="'+C.ink+'" stroke-width="3.5"/>'+path('M94 90 Q100 86 106 90',null,3.5)+'<path d="M65 88 L72 87 M113 88 L120 87" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>';
      if(et>=2)o+=cej;}
    else if(per==='deportista'){ // cinta, luego sudor y al final gorra al revés
      if(et===1)o+=path('M52 78 Q100 64 148 78',null,10)+'<path d="M52 78 Q100 64 148 78" fill="none" stroke="'+R+'" stroke-width="5.5" stroke-linecap="round"/>';
      else if(et===2){o+=path('M52 80 Q100 62 148 80',null,12)+'<path d="M52 80 Q100 62 148 80" fill="none" stroke="'+R+'" stroke-width="7.5" stroke-linecap="round"/>'+circ(150,81,6,R,3.5)+path('M150 84 L158 96 M150 84 L145 97',null,4)+path('M146 56 Q154 66 148 72 Q140 66 146 56 Z',C.blue,3)+cej;}
      else o+=path('M54 80 Q52 38 100 38 Q148 38 146 80 Q100 70 54 80 Z',R,4)+path('M146 78 Q172 76 176 86 Q160 90 146 86 Z',t.PD,4)+circ(100,40,5,C.cream,3)+cej;}
    else if(per==='ingeniero'){ // engrane, casco y gafas de protección
      if(et===1)o+=engrane(124,50,13,C.blue);
      else{o+=path('M56 78 Q54 38 100 38 Q146 38 144 78 Z',R,4)+rect(46,74,108,10,5,R,4)+rect(92,30,16,12,4,R,3.5)+circ(100,56,0.1,R,0);
        if(et===3)o+='<rect x="56" y="84" width="88" height="22" rx="10" fill="rgba(134,174,219,.4)" stroke="'+C.ink+'" stroke-width="4"/>'+path('M62 90 L72 88',null,0)+'<path d="M64 91 L74 89" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>'+circ(100,52,7,'#fff5b8',3.5);
        o+=cej;}}
    else if(per==='estudioso'){ // lentes, lápiz y birrete
      o+=lente(74,et===1?14:16.5)+lente(126,et===1?14:16.5)+path('M88 91 Q100 85 112 91',null,3.6);
      if(et>=2)o+='<g transform="rotate(32 136 52)">'+rect(116,47,40,9,3,C.yel,3.5)+path('M156 47 L168 51.5 L156 56',C.pink,3)+rect(110,47,8,9,2,C.pink,3.5)+'</g>';
      if(et===3)o+=path('M82 56 V70 Q100 80 118 70 V56','#3b3552',4)+path('M52 52 L100 32 L148 52 L100 72 Z','#3b3552',4.5)+path('M142 53 L144 74',null,3.5)+circ(144,76,4.5,C.gold,3)+cej;}
    else if(per==='timido'){ // flequillo, luego capucha y audífonos
      if(et===1)o+=path('M54 72 Q66 42 112 46 Q106 68 82 82 Q64 86 54 72 Z',t.PD,4);
      else{o+=capucha(et===3?13:10);
        if(et===3)o+=ell(46,100,9,15,R)+ell(154,100,9,15,R)+path('M62 84 Q74 76 88 82',null,5)+path('M138 84 Q126 76 112 82',null,5);}}
    else { // rebelde: cresta, arete y gorro de lana
      if(et<3)o+=path('M82 58 L88 30 L97 52 L106 24 L113 52 L124 32 L120 60 Z',R,4);
      else o+=path('M54 78 Q52 36 100 36 Q148 36 146 78 Z',R,4)+path('M52 76 Q100 88 148 76 L146 66 Q100 78 54 66 Z','#f6efe0',4)+circ(100,30,9,'#f6efe0',4);
      if(et>=2)o+='<circle cx="52" cy="116" r="5" fill="none" stroke="'+C.gold+'" stroke-width="3.5"/>';
      if(ver)o+=path('M62 80 L88 84',null,5.5)+path('M138 74 Q126 74 112 84',null,5.5);}
    return o;}
  function axo(e,tema,etapa){
    e=e||'feliz';var et=etapa||etapaActiva(),t=TEMAS[tema]||TEMAS.rosa,P=t.P,PD=t.PD,up=e==='celebra',o='',per=PERS[TEMAS[tema]?tema:'rosa'];
    o+='<ellipse cx="100" cy="186" rx="60" ry="8" fill="'+C.sh+'"/>';
    o+=path('M122 160 Q168 170 184 138 Q190 122 178 118 Q170 140 142 142 Z',PD)+path('M150 150 Q170 150 178 132',null,3);
    o+=ell(70,174,15,9,P)+ell(130,174,15,9,P);
    [-1,1].forEach(function(s){o+='<g class="'+(s<0?'i-axl':'i-axr')+'">';[[-58,34],[-22,38],[14,32]].forEach(function(g){o+=gillE(100+s*46,90+(g[0]+22)*0.45,g[0],g[1],s).replace(/__R__/g,t.R);});o+='</g>';});
    o+=ell(100,142,38,36,P)+ell(100,152,22,24,C.cream,0);
    if(up){[-1,1].forEach(function(s){var d='M'+(100+s*34)+' 138 Q'+(100+s*58)+' 118 '+(100+s*60)+' 98';o+='<path d="'+d+'" fill="none" '+st(13)+'/><path d="'+d+'" fill="none" stroke="'+P+'" stroke-width="9" stroke-linecap="round"/>'+mano(100+s*60,98,s*12,P);});}
    else if(e==='piensa'){o+=ell(70,160,12,9,P)+'<path d="M132 146 Q122 128 112 116" fill="none" '+st(13)+'/><path d="M132 146 Q122 128 112 116" fill="none" stroke="'+P+'" stroke-width="9" stroke-linecap="round"/>'+mano(111,116,-24,P);}
    else o+=ell(68,160,12,9,P)+ell(132,160,12,9,P);
    o+=ell(100,92,52,40,P)+ell(100,106,34,20,t.B,0);
    [[84,74],[100,70],[116,74],[92,80],[108,80]].forEach(function(q){o+=circ(q[0],q[1],1.8,'#e6a0b4',0);});
    if(up)o+=path('M64 92 Q74 80 84 92',null,5)+path('M116 92 Q126 80 136 92',null,5);
    else if(e==='casi')o+=path('M68 90 Q77 84 86 90',null,5)+path('M114 90 Q123 84 132 90',null,5);
    else{var dy=e==='piensa'?-3:0,dx=e==='piensa'?3:0;if(per==='timido'&&e==='feliz'){dx=-4;dy=3;}o+='<g class="i-ay">';[74,126].forEach(function(x){o+=ell(x,92,10,11.5,C.ink,0)+circ(x-3+dx,87+dy,4.2,'#fff',0)+circ(x+4+dx*0.5,96+dy*0.5,2,'#fff',0);});o+='</g>';}
    var tim=per==='timido';o+=ell(63,107,tim?10:8.5,tim?6.5:5.5,tim?'#f2819a':'#f59aae',0)+ell(137,107,tim?10:8.5,tim?6.5:5.5,tim?'#f2819a':'#f59aae',0)+circ(96,98,1.4,C.ink,0)+circ(104,98,1.4,C.ink,0);
    if(up)o+=path('M78 104 Q100 134 122 104 Z','#7d4a3f',4)+path('M90 116 Q100 126 110 116 Q100 110 90 116','#e9806c',0);
    else if(e==='casi')o+=path('M82 112 Q91 106 100 112 T118 112',null,4);
    else if(e==='piensa')o+=path('M92 112 Q104 116 114 108',null,4);
    else if(per==='timido')o+=path('M92 111 Q100 116 108 111',null,3.5);
    else if(et>=2||per==='rebelde')o+=path('M88 110 Q104 120 118 104',null,4.5)+path('M116 103 L121 100',null,3.5);
    else o+=path('M88 108 Q94 116 100 108 Q106 116 112 108',null,4);
    o+=rasgos(PERS[TEMAS[tema]?tema:'rosa'],et,e,up,t);
    if(e==='piensa')o+='<text x="152" y="46" font-family="Urbanist,sans-serif" font-weight="800" font-size="38" fill="'+C.ink+'">?</text>';
    if(e==='casi')o+='<text x="150" y="40" font-family="Urbanist,sans-serif" font-weight="800" font-size="34" fill="'+C.ink+'">&#8230;</text>';
    if(up)o+=star(14,22,11,C.pink)+star(188,20,11,C.blue)+star(100,12,9,C.yel)+star(190,86,7,C.green);
    return o;}
  var AXCSS='.i-axl{transform-origin:56px 92px;animation:i-axl 2.6s ease-in-out infinite}.i-axr{transform-origin:144px 92px;animation:i-axr 2.6s ease-in-out infinite}'+
    '@keyframes i-axl{50%{transform:rotate(-4deg)}}@keyframes i-axr{50%{transform:rotate(4deg)}}'+
    '.i-ay{transform-origin:100px 96px;animation:i-ay 4s infinite}@keyframes i-ay{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}';
  var EXPR=['feliz','piensa','celebra','casi'];
  EXPR.forEach(function(e){def('axo_'+e,'Ajolote '+e,function(op){return '<g'+(e==='celebra'?' class="i-pc"':'')+'>'+axo(e,op&&op.tema,op&&op.etapa)+'</g>';},AXCSS+(e==='celebra'?'.i-pc{animation:i-pc .8s ease-in-out infinite;transform-origin:100px 180px}@keyframes i-pc{50%{transform:translateY(-10px)}}':''));});
  Object.keys(TEMAS).forEach(function(k){if(k==='rosa')return;EXPR.forEach(function(e){def('axo_'+k+'_'+e,'Ajolote '+k+' '+e,function(op){return axo(e,k,op&&op.etapa);},AXCSS);});});

  /* ---- Caritas de emociones (5): feliz, tranquilo, aburrido, confundido, frustrado ---- */
  function cara(fill,cont){return sombra(100,182,56)+circ(100,100,70,fill)+brillo(56,70,14)+cont;}
  var EMOS={
    feliz:function(){return cara('#f2c77a',path('M64 88 Q76 72 88 88',null,5)+path('M112 88 Q124 72 136 88',null,5)+path('M66 112 Q100 156 134 112 Z','#7d4a3f',4)+path('M84 130 Q100 142 116 130 Q100 124 84 130 Z','#e9806c',0)+ell(56,112,11,7,'#f59aae',0)+ell(144,112,11,7,'#f59aae',0));},
    tranquilo:function(){return cara('#bfe5c6',path('M64 96 Q76 106 88 96',null,5)+path('M112 96 Q124 106 136 96',null,5)+path('M82 124 Q100 138 118 124',null,5)+ell(58,114,11,7,'#f59aae',0)+ell(142,114,11,7,'#f59aae',0));},
    aburrido:function(){return cara('#ddd6c8',path('M62 92 L90 92 M110 92 L138 92',null,5)+circ(78,100,4.5,C.ink,0)+circ(122,100,4.5,C.ink,0)+path('M82 128 L118 128',null,5)+'<text x="150" y="52" font-family="Urbanist,sans-serif" font-weight="800" font-size="26" fill="'+C.ink+'">z</text>');},
    confundido:function(){return cara('#c9b0e6',ojoK(78,94,10)+circ(124,92,7,C.ink,0)+circ(126,89,2.5,'#fff',0)+path('M64 70 Q78 62 92 72',null,5)+path('M110 66 L138 62',null,5)+path('M80 128 Q90 120 100 128 T120 128',null,5)+'<text x="148" y="56" font-family="Urbanist,sans-serif" font-weight="800" font-size="34" fill="'+C.ink+'">?</text>');},
    frustrado:function(){return cara('#ec8e78',path('M62 74 L90 86 M138 74 L110 86',null,6)+circ(78,100,6,C.ink,0)+circ(122,100,6,C.ink,0)+path('M78 138 Q100 118 122 138',null,5)+ell(56,116,10,6,'#d9594a',0)+ell(144,116,10,6,'#d9594a',0));}
  };
  Object.keys(EMOS).forEach(function(k){def('emo_'+k,{feliz:'Feliz',tranquilo:'Tranquilo',aburrido:'Aburrido',confundido:'Confundido',frustrado:'Frustrado'}[k],EMOS[k]);});

  /* ---- Monedas ---- */
  function moneda(cara){
    var o=sombra(100,184,70)+circ(100,100,78,C.gold)+circ(100,100,62,C.gold,3);
    if(cara==='aguila'){ // águila de perfil, estilizada
      o+=path('M70 124 Q60 96 84 88 Q92 70 112 74 Q124 62 138 70 L152 76 L138 84 Q140 100 126 112 Q112 140 86 140 Z',C.goldD,4);
      o+=path('M84 88 Q60 80 52 60 Q80 62 98 80',C.goldD,4)+path('M78 138 L68 156 M96 142 L92 160',null,4)+circ(132,78,3.4,C.ink,0)+path('M138 84 L152 92 L138 94',C.yel,3);
    }else{ // sol con cara
      o+=circ(100,100,26,C.yel,4);
      for(var i=0;i<12;i++){var a=i*Math.PI/6;o+='<line x1="'+(100+34*Math.cos(a)).toFixed(1)+'" y1="'+(100+34*Math.sin(a)).toFixed(1)+'" x2="'+(100+50*Math.cos(a)).toFixed(1)+'" y2="'+(100+50*Math.sin(a)).toFixed(1)+'" '+st(4)+'/>';}
      o+=carita(100,95,10,7.5);
    }
    return o+brillo(50,78,16);}
  def('moneda_aguila','Moneda: águila',function(){return moneda('aguila');});
  def('moneda_sol','Moneda: sol',function(){return moneda('sol');});
  def('moneda_gira','Moneda girando',function(){return sombra(100,184,60)+'<g class="i-mb"><g class="i-fa">'+moneda('aguila').replace(sombra(100,184,70),'')+'</g><g class="i-fb">'+moneda('sol').replace(sombra(100,184,70),'')+'</g></g>';},
    '.i-fa,.i-fb{transform-box:fill-box;transform-origin:center}.i-mb{animation:i-mb 1.4s ease-in-out infinite}.i-fa{animation:i-fa 1.4s linear infinite}.i-fb{animation:i-fb 1.4s linear infinite}'+
    '@keyframes i-mb{50%{transform:translateY(-26px)}}@keyframes i-fa{0%{transform:scaleX(1)}25%{transform:scaleX(0)}75%{transform:scaleX(0)}100%{transform:scaleX(1)}}@keyframes i-fb{0%{transform:scaleX(0)}25%{transform:scaleX(0)}50%{transform:scaleX(1)}75%{transform:scaleX(0)}100%{transform:scaleX(0)}}');

  /* ---- Dados ---- */
  var PIP={1:[[100,100]],2:[[68,68],[132,132]],3:[[68,68],[100,100],[132,132]],4:[[68,68],[132,68],[68,132],[132,132]],5:[[68,68],[132,68],[100,100],[68,132],[132,132]],6:[[68,64],[132,64],[68,100],[132,100],[68,136],[132,136]]};
  function dado(n,c){var o=rect(30,30,140,140,26,c||C.cream);PIP[n].forEach(function(p){o+=circ(p[0],p[1],11,C.ink,0);});return o+brillo(48,62,12);}
  for(var n=1;n<=6;n++)(function(n){def('dado_'+n,'Dado: '+n,function(){return sombra(100,182,64)+dado(n);});})(n);
  def('dado_rueda','Dado rodando',function(){var o=sombra(100,184,54);o+='<g class="i-dr">';for(var n=1;n<=6;n++)o+='<g class="i-df i-df'+n+'">'+dado(n,[C.cream,C.pink,C.blue,C.yel,C.green,C.lila][n-1])+'</g>';return o+'</g>';},
    '.i-dr{animation:i-dr 1.2s ease-in-out infinite;transform-origin:100px 110px}.i-df{opacity:0}'+[1,2,3,4,5,6].map(function(n){return '.i-df'+n+'{animation:i-d'+n+' 1.2s steps(1) infinite}@keyframes i-d'+n+'{0%{opacity:0}'+((n-1)*16.66).toFixed(1)+'%{opacity:1}'+(n*16.66).toFixed(1)+'%{opacity:0}100%{opacity:0}}';}).join('')+'@keyframes i-dr{0%{transform:rotate(-20deg) translateY(0)}25%{transform:rotate(25deg) translateY(-24px)}50%{transform:rotate(-15deg) translateY(0)}75%{transform:rotate(15deg) translateY(-12px)}100%{transform:rotate(0) translateY(0)}}');

  /* ---- Canicas y bolsa ---- */
  var CAN={roja:C.red,azul:C.blue,verde:C.green,amarilla:C.yel};
  function canica(x,y,r,f){return circ(x,y,r,f,4)+brillo(x-r*0.35,y-r*0.1,r*0.45);}
  def('canica_roja','Canica roja',function(){return sombra(100,170,50)+canica(100,100,62,C.red);});
  def('canica_azul','Canica azul',function(){return sombra(100,170,50)+canica(100,100,62,C.blue);});
  def('canica_verde','Canica verde',function(){return sombra(100,170,50)+canica(100,100,62,C.green);});
  function bolsa(){var o=sombra(100,186,66);
    o+=path('M56 70 Q30 120 44 160 Q56 184 100 184 Q144 184 156 160 Q170 120 144 70 Z',C.wood);
    o+=path('M70 70 Q74 52 64 40 Q100 52 136 40 Q126 52 130 70',C.wood)+path('M68 70 Q100 82 132 70',null,5);
    o+=star(100,128,24,C.cream);return o;}
  def('bolsa_canicas','Bolsa de canicas',function(){return bolsa()+canica(78,52,15,C.red)+canica(104,46,15,C.blue)+canica(128,54,14,C.green);});
  def('bolsa_saca','Sacando una canica',function(){return bolsa()+'<g class="i-cs">'+canica(100,46,17,C.red)+'</g>'+canica(76,56,14,C.blue)+canica(128,58,14,C.green);},
    '.i-cs{animation:i-cs 2s ease-in-out infinite}@keyframes i-cs{0%{transform:translate(0,30px);opacity:0}25%{transform:translate(0,0);opacity:1}60%{transform:translate(60px,-14px) rotate(80deg)}100%{transform:translate(0,30px);opacity:0}}');

  /* ---- Ruleta ---- */
  function ruleta(cols,ang){var n=cols.length,o=sombra(100,186,70),R=76,cx=100,cy=98;o+='<g class="i-rg" style="transform-origin:100px 98px">';
    for(var i=0;i<n;i++){var a0=-Math.PI/2+i*2*Math.PI/n,a1=-Math.PI/2+(i+1)*2*Math.PI/n;
      o+='<path d="M'+cx+' '+cy+' L'+(cx+R*Math.cos(a0)).toFixed(1)+' '+(cy+R*Math.sin(a0)).toFixed(1)+' A'+R+' '+R+' 0 0 1 '+(cx+R*Math.cos(a1)).toFixed(1)+' '+(cy+R*Math.sin(a1)).toFixed(1)+' Z" fill="'+cols[i]+'" '+st(4)+'/>';}
    o+='</g>'+circ(cx,cy,10,C.cream,4)+'<g transform="rotate('+(ang||0)+' 100 98)">'+path('M100 98 L100 24 M92 34 L100 20 L108 34',null,6)+'</g>';return o;}
  def('ruleta','Ruleta de 4 colores',function(){return ruleta([C.red,C.blue,C.yel,C.green],20);});
  def('ruleta_gira','Ruleta girando',function(){return ruleta([C.red,C.blue,C.yel,C.green,C.red,C.blue,C.yel,C.green],0);},'.i-rg{animation:i-rg 2.4s cubic-bezier(.2,.7,.3,1) infinite}@keyframes i-rg{0%{transform:rotate(0)}85%,100%{transform:rotate(700deg)}}');

  /* ---- Galletas, platos y reparto ---- */
  function galleta(x,y,r,cara){var o=circ(x,y,r,C.wood,4),k=cara?[[-0.62,-0.45],[0.58,-0.5],[-0.64,0.3],[0.62,0.38],[0,0.74]]:[[-0.4,-0.3],[0.35,-0.25],[0,0.35],[-0.35,0.3],[0.4,0.35]];k.forEach(function(q){o+=circ((x+q[0]*r).toFixed(1),(y+q[1]*r).toFixed(1),r*0.12,C.ink,0);});if(cara)o+=carita(x,y-r*0.12,r*0.27,r*0.17);return o;}
  def('galleta','Galleta',function(){return sombra(100,170,50)+galleta(100,100,60,true);});
  def('plato','Plato',function(){return sombra(100,170,70)+ell(100,110,76,40,C.cream)+ell(100,108,52,24,C.cream,3);});
  function platos(n,galls){var o='',w=200/n;for(var i=0;i<n;i++){var cx=w*i+w/2;o+=ell(cx,132,w*0.47,26,C.cream,4);for(var j=0;j<(galls[i]||0);j++)o+=galleta(cx-14+(j%2)*28,114-Math.floor(j/2)*14,15);}return o;}
  def('reparto','Repartir galletas',function(){return platos(3,[3,2,3]);},'');
  T.reparto.s=function(){var o=platos(3,[0,0,0]);var pos=[[34,128],[100,128],[166,128]];
    for(var i=0;i<6;i++){var d=pos[i%3];o+='<g class="i-gl i-gl'+i+'" style="--dx:'+(d[0]-100+((i>2)?14:-14))+'px;--dy:'+(d[1]-60-(i>2?14:0))+'px">'+galleta(100,44,15)+'</g>';}
    return o;};
  T.reparto.css=[0,1,2,3,4,5].map(function(i){return '.i-gl'+i+'{animation:i-g 4s ease-in-out infinite;animation-delay:'+(i*0.35)+'s}';}).join('')+'@keyframes i-g{0%{transform:translate(0,0)}20%,85%{transform:translate(var(--dx),var(--dy))}100%{transform:translate(0,0)}}';

  /* ---- Fracciones: pizza ---- */
  function pizza(n,k,f){var o=sombra(100,186,70),R=76,cx=100,cy=98;
    if(n===1)return o+circ(cx,cy,R,f||C.yel);
    for(var i=0;i<n;i++){var a0=-Math.PI/2+i*2*Math.PI/n,a1=-Math.PI/2+(i+1)*2*Math.PI/n;
      o+='<path d="M'+cx+' '+cy+' L'+(cx+R*Math.cos(a0)).toFixed(1)+' '+(cy+R*Math.sin(a0)).toFixed(1)+' A'+R+' '+R+' 0 0 1 '+(cx+R*Math.cos(a1)).toFixed(1)+' '+(cy+R*Math.sin(a1)).toFixed(1)+' Z" fill="'+(i<k?(f||C.red):C.cream)+'" '+st(4)+'/>';}
    return o;}
  def('pizza_3_4','Tres cuartos',function(){return pizza(4,3);});
  def('pizza_1_2','Un medio',function(){return pizza(2,1);});

  /* ---- Estrella y confeti ---- */
  def('estrella','Estrella',function(){return sombra(100,184,50)+star(100,100,70,C.gold)+brillo(70,86,12)+carita(100,104,15,9);},'.i-st{}');

  /* ---- Íconos de cada taller ---- */
  def('icono_fracciones','Fracciones',function(){return pizza(4,3);});
  def('icono_divisiones','Divisiones',function(){return platos(3,[3,2,3]);});
  def('icono_probabilidad','Probabilidad',function(){return sombra(100,184,64)+dado(5);});
  def('icono_dorado','Cuentas doradas',function(){var o=sombra(100,186,70);o+='<polygon points="40,70 70,40 160,40 160,130 130,160 40,160" fill="'+C.gold+'" '+st()+'/><polygon points="40,70 130,70 160,40 70,40" fill="#f8dc8a" '+st()+'/><polygon points="130,70 130,160 160,130 160,40" fill="'+C.goldD+'" '+st()+'/>';return o+'<text x="85" y="130" text-anchor="middle" font-family="Urbanist,sans-serif" font-weight="800" font-size="34" fill="'+C.ink+'">1 000</text>';});
  def('icono_decimal','Tablero decimal',function(){var o=sombra(100,186,70),cs=[C.green,C.red,C.blue];for(var r=0;r<3;r++)for(var c=0;c<3;c++)o+=rect(34+c*44,34+r*44,40,40,6,cs[(r+c)%3],4);return o;});
  def('icono_cadenas','Cadenas de cuentas',function(){var o=sombra(100,186,70)+'<path d="M32 90 L66 110 L100 90 L134 110 L168 90" fill="none" stroke="'+C.ink+'" stroke-width="4"/>';for(var i=0;i<5;i++)o+=circ(32+i*34,100+(i%2?10:-10),16,[C.red,C.blue,C.green,C.yel,C.lila][i],4);return o;});
  def('icono_area','Área',function(){var o=sombra(100,186,70)+rect(30,50,140,100,6,C.blue);for(var i=1;i<7;i++)o+='<line x1="'+(30+i*20)+'" y1="50" x2="'+(30+i*20)+'" y2="150" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>';for(i=1;i<5;i++)o+='<line x1="30" y1="'+(50+i*20)+'" x2="170" y2="'+(50+i*20)+'" stroke="#fff" stroke-opacity=".7" stroke-width="3"/>';return o;});
  def('icono_angulos','Ángulos',function(){return sombra(100,186,70)+path('M40 150 L170 150 A130 130 0 0 0 128 56 Z',C.yel)+path('M40 150 L170 150 M40 150 L128 56',null,6);});
  def('icono_ritmo','Ritmo',function(){return sombra(100,186,70)+'<ellipse cx="78" cy="148" rx="24" ry="18" fill="'+C.red+'" transform="rotate(-20 78 148)" '+st()+'/>'+path('M98 142 L98 48 Q130 56 138 90',null,6)+'<ellipse cx="136" cy="130" rx="22" ry="16" fill="'+C.blue+'" transform="rotate(-20 136 130)" '+st()+'/>';});
  def('icono_ajedrez','Ajedrez',function(){var o=sombra(100,186,70);for(var r=0;r<4;r++)for(var c=0;c<4;c++)o+='<rect x="'+(36+c*32)+'" y="'+(36+r*32)+'" width="32" height="32" fill="'+((r+c)%2?C.wood:C.cream)+'" stroke="'+C.ink+'" stroke-width="3"/>';return o+'<text x="100" y="124" text-anchor="middle" font-size="76" fill="'+C.ink+'">&#9822;</text>';});
  def('icono_contar','Contar y partir',function(){var o=sombra(100,186,66)+rect(34,60,132,84,12,C.cream);var k=0;for(var r=0;r<2;r++)for(var c=0;c<5;c++){o+=rect(40+c*25,66+r*36,24,34,4,'none',3);if(k<7)o+=circ(52+c*25,83+r*36,8,k<5?C.red:C.blue,3);k++;}return o;});
  def('icono_algebra','Álgebra con balanza',function(){var o=sombra(100,186,70)+path('M100 52 L100 160',null,6)+path('M70 164 Q100 152 130 164 Z',C.wood,4)+path('M38 62 L162 62',null,7)+circ(100,58,9,C.gold,4);o+=path('M38 62 L22 118 M38 62 L58 118',null,3)+path('M162 62 L146 118 M162 62 L182 118',null,3)+path('M16 118 H64 Q60 132 54 132 H26 Q20 132 16 118 Z',C.cream,4)+path('M140 118 H188 Q184 132 178 132 H150 Q144 132 140 118 Z',C.cream,4);o+=rect(26,94,24,24,6,C.blue,3.5)+'<text x="38" y="113" text-anchor="middle" font-size="18" font-weight="800" fill="'+C.ink+'">x</text>';for(var i=0;i<3;i++)o+=rect(146+i*13,102,12,16,3,C.yel,2.5);return o;});
  def('icono_enteros','Números enteros',function(){var o=sombra(100,186,70)+rect(20,70,160,34,10,C.cream)+rect(100,70,80,34,10,C.blue,4)+rect(20,70,80,34,10,C.red,4)+path('M100 62 L100 112',null,6);var t=['-3','-2','-1','0','1','2','3'];for(var i=0;i<7;i++)o+='<text x="'+(34+i*22)+'" y="132" text-anchor="middle" font-size="15" font-weight="800" fill="'+C.ink+'">'+t[i].replace('-','&#8722;')+'</text>';return o+circ(78,50,13,C.gold,4)+circ(138,50,13,C.gold,4,.0);});
  def('icono_proporciones','Proporciones y porcentajes',function(){var o=sombra(100,186,70)+rect(26,56,148,28,8,C.cream)+rect(26,56,52,28,8,C.blue,4)+rect(26,104,148,28,8,C.cream)+rect(26,104,104,28,8,C.blue,4);return o+'<text x="150" y="76" text-anchor="middle" font-size="17" font-weight="800" fill="'+C.ink+'">%</text><text x="152" y="124" text-anchor="middle" font-size="15" font-weight="800" fill="'+C.ink+'">1:2</text>'+circ(100,160,8,C.gold,4)+circ(124,160,8,C.gold,4)+circ(76,160,8,C.gold,4);});
  def('icono_pitagoras','Pitágoras y raíces',function(){var o=sombra(100,186,70)+rect(40,40,50,50,4,C.blue)+rect(40,90,50,50,4,C.yel)+path('M90 90 L90 140 L40 90 Z',C.cream,4)+path('M90 140 L40 90 L76 54 L126 104 Z',C.green,4);return o+'<text x="65" y="72" text-anchor="middle" font-size="18" font-weight="800" fill="'+C.ink+'">a&#178;</text><text x="65" y="122" text-anchor="middle" font-size="18" font-weight="800" fill="'+C.ink+'">b&#178;</text>';});
  def('icono_programacion','Programación',function(){var o=sombra(100,186,60)+rect(54,64,92,80,16,C.blue)+path('M100 64 L100 42',null,5)+circ(100,38,8,C.red,4);o+=ojoK(80,96,10)+ojoK(120,96,10)+mejilla(62,118,9)+mejilla(138,118,9)+path('M88 120 Q100 132 112 120',null,4);return o+rect(70,148,60,18,6,C.yel,4);});
  def('icono_trazos','Trazos',function(){var o=sombra(100,186,70)+rect(40,50,120,100,12,C.cream,4);o+='<path d="M58 118 C72 74 88 74 100 100 S128 128 142 82" fill="none" stroke="'+C.green+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="1 14"/>';return o+circ(58,118,9,C.green,3.5)+path('M118 150 L150 70 L162 76 L130 156 Z',C.yel,4);});
  def('icono_dibujo','Dibujo',function(){var o=sombra(100,186,70);for(var i=0;i<8;i++){var a=i*Math.PI/4;o+='<ellipse cx="'+(100+34*Math.cos(a)).toFixed(1)+'" cy="'+(100+34*Math.sin(a)).toFixed(1)+'" rx="22" ry="12" transform="rotate('+(i*45)+' '+(100+34*Math.cos(a)).toFixed(1)+' '+(100+34*Math.sin(a)).toFixed(1)+')" fill="'+[C.red,C.yel,C.green,C.blue,C.lila,C.pink,C.yel,C.blue][i]+'" '+st(3.5)+'/>';}return o+circ(100,100,12,C.cream,4);});

  var CSSBASE='.ilu{display:block}';
  function svg(n,op){op=op||{};var d=T[n];if(!d)return '';
    var tag='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+d.vb+'" class="ilu" role="img" aria-label="'+d.t+'"'+(op.size?' width="'+op.size+'" height="'+op.size+'"':'')+'>';
    return tag+(d.css?'<style>'+d.css+'</style>':'')+d.s(op)+'</svg>';}
  root.Ilu={html:svg,names:function(){return Object.keys(T);},titulo:function(n){return T[n]&&T[n].t;},animada:function(n){return !!(T[n]&&T[n].css&&/@keyframes/.test(T[n].css));},
    mount:function(el,n,op){el.innerHTML=svg(n,op);return el;},colores:C,temas:TEMAS,tema:function(n){return TALLER_TEMA[n]||'rosa';}};
  if(typeof module!=='undefined')module.exports=root.Ilu;
})(typeof window!=='undefined'?window:globalThis);
