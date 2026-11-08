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
  var TALLER_TEMA={fracciones:'rosa',divisiones:'azul',probabilidad:'amarillo',dorado:'durazno',decimal:'menta',cadenas:'lila',area:'amarillo',angulos:'durazno',ritmo:'rosa',ajedrez:'lila',programacion:'menta',dibujo:'azul',contar:'menta',algebra:'azul',enteros:'rosa',proporciones:'durazno',pitagoras:'azul'};
  function gillE(x,y,ang,L,s){var a=ang*Math.PI/180,dx=s*Math.cos(a),dy=Math.sin(a),cx=x+dx*L*0.5,cy=y+dy*L*0.5,rot=s*ang;
    return '<ellipse cx="'+cx.toFixed(1)+'" cy="'+cy.toFixed(1)+'" rx="'+(L*0.5+4)+'" ry="7.5" fill="__R__" '+st()+' transform="rotate('+rot+' '+cx.toFixed(1)+' '+cy.toFixed(1)+')"/>'+
      '<ellipse cx="'+(cx+dx*3).toFixed(1)+'" cy="'+(cy+dy*3).toFixed(1)+'" rx="'+(L*0.28).toFixed(1)+'" ry="2.2" fill="#f5a99a" transform="rotate('+rot+' '+(cx+dx*3).toFixed(1)+' '+(cy+dy*3).toFixed(1)+')"/>';}
  function axo(e,tema){
    e=e||'feliz';var t=TEMAS[tema]||TEMAS.rosa,P=t.P,PD=t.PD,up=e==='celebra',o='';
    o+='<ellipse cx="100" cy="186" rx="60" ry="8" fill="'+C.sh+'"/>';
    o+=path('M122 160 Q168 170 184 138 Q190 122 178 118 Q170 140 142 142 Z',PD)+path('M150 150 Q170 150 178 132',null,3);
    o+=ell(70,174,15,9,P)+ell(130,174,15,9,P);
    [-1,1].forEach(function(s){o+='<g class="'+(s<0?'i-axl':'i-axr')+'">';[[-58,34],[-22,38],[14,32]].forEach(function(g){o+=gillE(100+s*46,90+(g[0]+22)*0.45,g[0],g[1],s).replace(/__R__/g,t.R);});o+='</g>';});
    o+=ell(100,142,38,36,P)+ell(100,152,22,24,C.cream,0);
    if(up){[-1,1].forEach(function(s){var d='M'+(100+s*34)+' 138 Q'+(100+s*58)+' 118 '+(100+s*60)+' 98';o+='<path d="'+d+'" fill="none" '+st(13)+'/><path d="'+d+'" fill="none" stroke="'+P+'" stroke-width="9" stroke-linecap="round"/>'+circ(100+s*60,96,8,P);});}
    else if(e==='piensa'){o+=ell(70,160,12,9,P)+'<path d="M132 146 Q122 128 112 116" fill="none" '+st(13)+'/><path d="M132 146 Q122 128 112 116" fill="none" stroke="'+P+'" stroke-width="9" stroke-linecap="round"/>'+circ(110,114,8,P);}
    else o+=ell(68,160,12,9,P)+ell(132,160,12,9,P);
    o+=ell(100,92,52,40,P)+ell(100,106,34,20,t.B,0);
    [[84,74],[100,70],[116,74],[92,80],[108,80]].forEach(function(q){o+=circ(q[0],q[1],1.8,'#e6a0b4',0);});
    if(t.acc==='star')o+=star(122,52,13,C.yel);
    if(t.acc==='leaf')o+=path('M120 62 Q112 40 138 36 Q142 58 120 62 Z',C.green,4)+path('M122 58 Q128 48 136 40',null,3);
    if(t.acc==='plus')o+=circ(122,54,12,C.blue,4)+path('M122 48 V60 M116 54 H128',null,4);
    if(t.acc==='drop')o+=path('M122 38 Q138 56 130 64 Q122 70 114 64 Q106 56 122 38 Z',C.blue,4);
    if(up)o+=path('M64 92 Q74 80 84 92',null,5)+path('M116 92 Q126 80 136 92',null,5);
    else if(e==='casi')o+=path('M68 90 Q77 84 86 90',null,5)+path('M114 90 Q123 84 132 90',null,5);
    else{var dy=e==='piensa'?-3:0,dx=e==='piensa'?3:0;o+='<g class="i-ay">';[74,126].forEach(function(x){o+=ell(x,92,10,11.5,C.ink,0)+circ(x-3+dx,87+dy,4.2,'#fff',0)+circ(x+4+dx*0.5,96+dy*0.5,2,'#fff',0);});o+='</g>';}
    o+=ell(56,104,11,7,'#f59aae',0)+ell(144,104,11,7,'#f59aae',0)+circ(96,98,1.4,C.ink,0)+circ(104,98,1.4,C.ink,0);
    if(up)o+=path('M78 104 Q100 134 122 104 Z','#7d4a3f',4)+path('M90 116 Q100 126 110 116 Q100 110 90 116','#e9806c',0);
    else if(e==='casi')o+=path('M82 112 Q91 106 100 112 T118 112',null,4);
    else if(e==='piensa')o+=path('M92 112 Q104 116 114 108',null,4);
    else o+=path('M88 108 Q94 116 100 108 Q106 116 112 108',null,4);
    if(e==='piensa')o+='<text x="152" y="46" font-family="Urbanist,sans-serif" font-weight="800" font-size="38" fill="'+C.ink+'">?</text>';
    if(e==='casi')o+='<text x="150" y="40" font-family="Urbanist,sans-serif" font-weight="800" font-size="34" fill="'+C.ink+'">&#8230;</text>';
    if(up)o+=star(14,22,11,C.pink)+star(188,20,11,C.blue)+star(100,12,9,C.yel)+star(190,86,7,C.green);
    return o;}
  var AXCSS='.i-axl{transform-origin:56px 92px;animation:i-axl 2.6s ease-in-out infinite}.i-axr{transform-origin:144px 92px;animation:i-axr 2.6s ease-in-out infinite}'+
    '@keyframes i-axl{50%{transform:rotate(-4deg)}}@keyframes i-axr{50%{transform:rotate(4deg)}}'+
    '.i-ay{transform-origin:100px 96px;animation:i-ay 4s infinite}@keyframes i-ay{0%,94%,100%{transform:scaleY(1)}97%{transform:scaleY(.1)}}';
  var EXPR=['feliz','piensa','celebra','casi'];
  EXPR.forEach(function(e){def('axo_'+e,'Ajolote '+e,function(op){return '<g'+(e==='celebra'?' class="i-pc"':'')+'>'+axo(e,op&&op.tema)+'</g>';},AXCSS+(e==='celebra'?'.i-pc{animation:i-pc .8s ease-in-out infinite;transform-origin:100px 180px}@keyframes i-pc{50%{transform:translateY(-10px)}}':''));});
  Object.keys(TEMAS).forEach(function(k){if(k==='rosa')return;EXPR.forEach(function(e){def('axo_'+k+'_'+e,'Ajolote '+k+' '+e,function(){return axo(e,k);},AXCSS);});});

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
  def('icono_dibujo','Dibujo',function(){var o=sombra(100,186,70);for(var i=0;i<8;i++){var a=i*Math.PI/4;o+='<ellipse cx="'+(100+34*Math.cos(a)).toFixed(1)+'" cy="'+(100+34*Math.sin(a)).toFixed(1)+'" rx="22" ry="12" transform="rotate('+(i*45)+' '+(100+34*Math.cos(a)).toFixed(1)+' '+(100+34*Math.sin(a)).toFixed(1)+')" fill="'+[C.red,C.yel,C.green,C.blue,C.lila,C.pink,C.yel,C.blue][i]+'" '+st(3.5)+'/>';}return o+circ(100,100,12,C.cream,4);});

  var CSSBASE='.ilu{display:block}';
  function svg(n,op){op=op||{};var d=T[n];if(!d)return '';
    var tag='<svg xmlns="http://www.w3.org/2000/svg" viewBox="'+d.vb+'" class="ilu" role="img" aria-label="'+d.t+'"'+(op.size?' width="'+op.size+'" height="'+op.size+'"':'')+'>';
    return tag+(d.css?'<style>'+d.css+'</style>':'')+d.s(op)+'</svg>';}
  root.Ilu={html:svg,names:function(){return Object.keys(T);},titulo:function(n){return T[n]&&T[n].t;},animada:function(n){return !!(T[n]&&T[n].css&&/@keyframes/.test(T[n].css));},
    mount:function(el,n,op){el.innerHTML=svg(n,op);return el;},colores:C,temas:TEMAS,tema:function(n){return TALLER_TEMA[n]||'rosa';}};
  if(typeof module!=='undefined')module.exports=root.Ilu;
})(typeof window!=='undefined'?window:globalThis);
