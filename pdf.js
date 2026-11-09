/* Generador mínimo de PDF (sin librerías, sin internet). Hojas A4, Helvetica, texto, rectángulos, líneas y círculos.
   Coordenadas en puntos desde la esquina superior izquierda. */
(function(root){
  var W=595.28,H=841.89;
  var WR=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
  var WB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
  var CP={8364:128,8218:130,402:131,8222:132,8230:133,8224:134,8225:135,710:136,8240:137,352:138,8249:139,338:140,381:142,8216:145,8217:146,8220:147,8221:148,8226:149,8211:150,8212:151,732:152,8482:153,353:154,8250:155,339:156,382:158,376:159};
  function code(ch){var c=ch.charCodeAt(0); if(c<128&&c>=32)return c; if(c>=160&&c<=255)return c; if(CP[c])return CP[c]; if(c===10)return 32; return 63;}
  function hex(s){var o='';for(var i=0;i<s.length;i++){var c=code(s[i]);o+=(c<16?'0':'')+c.toString(16);}return '<'+o+'>';}
  function ancho(s,size,bold){var t=bold?WB:WR,w=0;for(var i=0;i<s.length;i++){var c=s.charCodeAt(i),b=c;
      if(c>127){var n=s[i].normalize('NFD').charCodeAt(0); b=n<128?n:0;}
      w+=(b>=32&&b<=126)?t[b-32]:(c===8226?350:556);}
    return w*size/1000;}
  function col(c){ if(!c)return '0 g'; if(typeof c==='string'){var r=parseInt(c.substr(1,2),16)/255,g=parseInt(c.substr(3,2),16)/255,b=parseInt(c.substr(5,2),16)/255; return [r.toFixed(3),g.toFixed(3),b.toFixed(3)]; } return c;}
  function fillc(c){var a=col(c); return a.join?a.join(' ')+' rg':a;}
  function strokec(c){var a=col(c); return a.join?a.join(' ')+' RG':'0 G';}
  function nuevo(){
    var pages=[],cur=null;
    function f(n){return (Math.round(n*100)/100).toString();}
    var d={W:W,H:H,ancho:ancho,
      pagina:function(){cur=[];pages.push(cur);return d;},
      n:function(){return pages.length;},
      texto:function(x,y,s,o){o=o||{};var sz=o.size||11; cur.push('BT /'+(o.bold?'F2':'F1')+' '+f(sz)+' Tf '+fillc(o.color||'#222222')+' '+f(x)+' '+f(H-y)+' Td '+hex(String(s))+' Tj ET'); return d;},
      // texto con ajuste de línea; devuelve la y siguiente
      parrafo:function(x,y,w,s,o){o=o||{};var sz=o.size||11,lh=o.lh||sz*1.35,ws=String(s).split(/\s+/),ln='';
        ws.forEach(function(p){var t=ln?ln+' '+p:p; if(ancho(t,sz,o.bold)>w&&ln){d.texto(x,y+sz,ln,o);y+=lh;ln=p;}else ln=t;});
        if(ln){d.texto(x,y+sz,ln,o);y+=lh;} return y;},
      rect:function(x,y,w,h,o){o=o||{};var s=''; if(o.fill)s+=fillc(o.fill)+' '; if(o.stroke)s+=strokec(o.stroke)+' '+f(o.lw||1)+' w ';
        s+=f(x)+' '+f(H-y-h)+' '+f(w)+' '+f(h)+' re '+(o.fill&&o.stroke?'B':o.fill?'f':'S'); cur.push(s); return d;},
      linea:function(x1,y1,x2,y2,o){o=o||{}; cur.push(strokec(o.color||'#999999')+' '+f(o.lw||1)+' w '+f(x1)+' '+f(H-y1)+' m '+f(x2)+' '+f(H-y2)+' l S'); return d;},
      circ:function(cx,cy,r,o){o=o||{};var k=0.5523*r,x=cx,y=H-cy,s='';
        if(o.fill)s+=fillc(o.fill)+' '; if(o.stroke)s+=strokec(o.stroke)+' '+f(o.lw||1)+' w ';
        s+=f(x+r)+' '+f(y)+' m '+f(x+r)+' '+f(y+k)+' '+f(x+k)+' '+f(y+r)+' '+f(x)+' '+f(y+r)+' c '+f(x-k)+' '+f(y+r)+' '+f(x-r)+' '+f(y+k)+' '+f(x-r)+' '+f(y)+' c '+f(x-r)+' '+f(y-k)+' '+f(x-k)+' '+f(y-r)+' '+f(x)+' '+f(y-r)+' c '+f(x+k)+' '+f(y-r)+' '+f(x+r)+' '+f(y-k)+' '+f(x+r)+' '+f(y)+' c '+(o.fill&&o.stroke?'B':o.fill?'f':'S'); cur.push(s); return d;},
      // curva cuadrática simple (para bocas): de (x1,y1) a (x2,y2) con control (cx,cy)
      curva:function(x1,y1,cx,cy,x2,y2,o){o=o||{}; var c1x=x1+2/3*(cx-x1),c1y=y1+2/3*(cy-y1),c2x=x2+2/3*(cx-x2),c2y=y2+2/3*(cy-y2);
        cur.push(strokec(o.color||'#222222')+' '+f(o.lw||1)+' w 1 J '+f(x1)+' '+f(H-y1)+' m '+f(c1x)+' '+f(H-c1y)+' '+f(c2x)+' '+f(H-c2y)+' '+f(x2)+' '+f(H-y2)+' c S'); return d;},
      bytes:function(){
        var objs=[],np=pages.length;
        objs[1]='<< /Type /Catalog /Pages 2 0 R >>';
        var kids=[];for(var i=0;i<np;i++)kids.push((5+i*2)+' 0 R');
        objs[2]='<< /Type /Pages /Kids ['+kids.join(' ')+'] /Count '+np+' >>';
        objs[3]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
        objs[4]='<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
        pages.forEach(function(p,i){var c=p.join('\n'); objs[6+i*2]='<< /Length '+c.length+' >>\nstream\n'+c+'\nendstream';
          objs[5+i*2]='<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+f(W)+' '+f(H)+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+(6+i*2)+' 0 R >>';});
        var out='%PDF-1.4\n',off=[0];
        for(var k=1;k<objs.length;k++){off[k]=out.length; out+=k+' 0 obj\n'+objs[k]+'\nendobj\n';}
        var x=out.length; out+='xref\n0 '+objs.length+'\n0000000000 65535 f \n';
        for(k=1;k<objs.length;k++)out+=('0000000000'+off[k]).slice(-10)+' 00000 n \n';
        out+='trailer\n<< /Size '+objs.length+' /Root 1 0 R >>\nstartxref\n'+x+'\n%%EOF';
        var u=new Uint8Array(out.length); for(var j=0;j<out.length;j++)u[j]=out.charCodeAt(j)&255; return u;}
    };
    return d;
  }
  function descarga(nombre,datos,tipo){
    var blob=new Blob([datos],{type:tipo||'application/pdf'});
    // En la app de Android (WebView) las descargas con enlace no funcionan: se ofrece compartir/guardar el archivo.
    try { if (root.Capacitor && navigator.canShare) { var fl = new File([blob], nombre, { type: blob.type }); if (navigator.canShare({ files: [fl] })) { navigator.share({ files: [fl], title: nombre }).catch(function(){}); return; } } } catch (e) {}
    var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=nombre; document.body.appendChild(a); a.click();
    setTimeout(function(){document.body.removeChild(a); URL.revokeObjectURL(a.href);},2000);
  }
  root.PDF={nuevo:nuevo,descarga:descarga,ancho:ancho,W:W,H:H};
  if(typeof module!=='undefined')module.exports=root.PDF;
})(typeof window!=='undefined'?window:globalThis);
