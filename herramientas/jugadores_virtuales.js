#!/usr/bin/env node
/* Jugadores virtuales de Talleres del Ajolote.
   Recorre cada paso del plan de un taller/año (rutas.js) como lo haría un niño con un teléfono horizontal,
   revisa la pantalla y juega un poco (toques al azar, «Siguiente» repetido) para encontrar problemas mecánicos:
   desbordes, botones tapados o muy chicos, texto diminuto o cortado, controles que se parecen entre sí,
   preguntas repetidas, errores de consola y callejones sin salida.
   NO sustituye a un niño real: no sabe si algo «se entiende». Para eso sirve la revisión de capturas.

   Uso:  node herramientas/jugadores_virtuales.js [--perfiles 1-1,1-2] [--viewport 844x390] [--salida herramientas/informes] [--rapido]
   Requiere: npm i playwright  (y chromium: npx playwright install chromium) */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const RAIZ = path.resolve(__dirname, '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PERFILES = arg('perfiles', '1-1,1-2').split(',');
const [VW, VH] = arg('viewport', '844x390').split('x').map(Number);
const SALIDA = path.resolve(arg('salida', path.join(RAIZ, 'herramientas', 'informes')));
const RAPIDO = process.argv.includes('--rapido');
const NSIG = RAPIDO ? 4 : 8, NTAP = RAPIDO ? 8 : 20;
const URL = f => 'file://' + path.join(RAIZ, f);
fs.mkdirSync(path.join(SALIDA, 'capturas'), { recursive: true });

// ---- Revisión de una pantalla (se ejecuta dentro de la página) ----
function inspecciona(taller, anio) {
  const out = [], add = (sev, tipo, msg) => out.push({ sev, tipo, msg });
  const tr = document.querySelector('.tray.pf-on') || document.querySelector('.tray');
  if (!tr) { add('error', 'sin-bandeja', 'No hay bandeja visible'); return out; }
  const vis = e => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && cs.display !== 'none' && e.offsetParent !== null && !(document.body.classList.contains('pf') && e.closest('.niv')); };
  const s = (window.PF && PF.escala && PF.escala()) || 1;
  if (s < 0.6) add('error', 'escala', 'Escala de pantalla ' + s.toFixed(2) + ' (< 0.6): todo se ve diminuto');
  else if (s < 0.8) add('aviso', 'escala', 'Escala de pantalla ' + s.toFixed(2) + ' (< 0.8): contenido algo chico');
  const W = innerWidth, H = innerHeight, tb = tr.getBoundingClientRect();
  if (document.documentElement.scrollWidth > W + 2) add('error', 'desborde', 'La página se desliza horizontalmente (' + document.documentElement.scrollWidth + ' > ' + W + ')');
  if (document.documentElement.scrollHeight > H + 2) add('aviso', 'desborde', 'La página se desliza verticalmente (' + document.documentElement.scrollHeight + ' > ' + H + ')');
  const inter = [...tr.querySelectorAll('button,input,select,canvas,[role=button],.cn-k')].filter(vis);
  const fuera = inter.filter(e => { const r = e.getBoundingClientRect(); return r.right > tb.right + 3 || r.bottom > tb.bottom + 3 || r.left < tb.left - 3 || r.top < tb.top - 3 || r.right > W + 1 || r.bottom > H + 1; });
  fuera.slice(0, 4).forEach(e => add('error', 'fuera', 'Fuera de la pantalla o de la bandeja: «' + (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 30) + '»'));
  const chicos = inter.filter(e => e.tagName === 'BUTTON' && Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height) < 36);
  if (chicos.length) add(chicos.some(e => Math.min(e.getBoundingClientRect().width, e.getBoundingClientRect().height) < 28) ? 'error' : 'aviso', 'toque', chicos.length + ' botón(es) de menos de 36 px: «' + chicos.slice(0, 3).map(e => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 14)).join('», «') + '»');
  // texto pequeño / cortado
  let chico = 0, ej = '';
  tr.querySelectorAll('h2,h3,p,span,label,button,td,th,b,small').forEach(e => { if (!vis(e) || !e.childNodes.length) return; const t = [...e.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(''); if (!t) return; const fs = parseFloat(getComputedStyle(e).fontSize) * s; if (fs < 12) { chico++; ej = ej || t.slice(0, 20); } });
  if (chico) add('aviso', 'texto', chico + ' texto(s) con tamaño efectivo < 12 px, p. ej. «' + ej + '»');
  const cort = [...tr.querySelectorAll('button,.lbl2,.step,h2')].filter(e => vis(e) && e.scrollWidth > e.clientWidth + 3 && getComputedStyle(e).overflow !== 'visible');
  if (cort.length) add('aviso', 'cortado', 'Texto cortado en: «' + cort.slice(0, 3).map(e => e.textContent.trim().slice(0, 20)).join('», «') + '»');
  // superposición entre controles
  const bt = inter.filter(e => e.tagName === 'BUTTON' || e.classList.contains('cn-k')); let sup = 0, supEj = '';
  for (let i = 0; i < bt.length; i++) for (let j = i + 1; j < bt.length; j++) { if (bt[i].contains(bt[j]) || bt[j].contains(bt[i])) continue; const a = bt[i].getBoundingClientRect(), b = bt[j].getBoundingClientRect(), w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (w > 0 && h > 0 && w * h > 0.25 * Math.min(a.width * a.height, b.width * b.height)) { sup++; supEj = supEj || (bt[i].textContent.trim().slice(0, 12) + ' / ' + bt[j].textContent.trim().slice(0, 12)); } }
  if (sup) add('error', 'superpuestos', sup + ' par(es) de botones se superponen, p. ej. ' + supEj);
  // controles de los lados que se parecen a los del centro
  const firma = e => { const c = getComputedStyle(e), r = e.getBoundingClientRect(); return { bg: c.backgroundColor, bc: c.borderColor, rad: parseFloat(c.borderRadius) || 0, w: r.width, h: r.height }; };
  const lat = [...document.querySelectorAll('.pf-tab,.pf-track button,.niv button')].filter(vis), cen = [...tr.querySelectorAll('.cn-k,.chips button,.row button,.opts button,.grid button')].filter(e => vis(e) && !e.closest('.niv') && !e.closest('.pf-track'));
  let parecidos = 0, pEj = '';
  lat.forEach(a => { const fa = firma(a); if (cen.some(b => { const fb = firma(b); return fa.bg === fb.bg && fa.bc === fb.bc && Math.abs(fa.rad - fb.rad) < 4 && Math.abs(fa.w - fb.w) < 0.25 * fb.w && Math.abs(fa.h - fb.h) < 0.25 * fb.h; })) { parecidos++; pEj = pEj || (a.textContent.trim().slice(0, 10) || a.className); } });
  if (parecidos) add('aviso', 'parecidos', parecidos + ' control(es) lateral(es) idénticos a los del centro, p. ej. «' + pEj + '»');
  // texto grande para quienes apenas leen
  if (taller === 1 && anio === 1) {
    const h2 = tr.querySelector('h2'), p = [...tr.querySelectorAll('p')].find(vis);
    if (h2 && parseFloat(getComputedStyle(h2).fontSize) * s < 20) add('aviso', 'lector', 'Título menor a 20 px efectivos para primer año');
    if (p && parseFloat(getComputedStyle(p).fontSize) * s < 17) add('aviso', 'lector', 'Instrucción menor a 17 px efectivos para primer año');
  }
  return out;
}
const SIGRE = '^[^A-Za-zÁ-ú]*(Siguiente|Otro|Otra|Nuevo|Nueva)';
async function juega(p, nsig, ntap) {
  return p.evaluate(async ({ nsig, ntap, SIGRE }) => {
    const re = new RegExp(SIGRE, 'i'), res = { repetidos: 0, distintos: 0, sinSalida: false, toques: 0 };
    const tr = document.querySelector('.tray.pf-on') || document.querySelector('.tray');
    const vis = e => e.offsetParent !== null && e.getBoundingClientRect().width > 2;
    const nxt = () => [...tr.querySelectorAll('button')].find(b => vis(b) && !b.hidden && !b.classList.contains('ayuda') && re.test(b.textContent));
    const sig = () => { const c = tr.firstChild.cloneNode(true); c.querySelectorAll('.msg,.ok,.bad,.cn,.niv,.chips.lv,h2,.pf-sug,button.ayuda,.note,.step,.pt-sug').forEach(e => e.remove()); return (c.textContent.replace(/(Aciertos|Puntos|Racha|Intentos|Nivel)[:\s]*\d+/gi, '').match(/\d+(?:[.,]\d+)?/g) || []).sort().join(','); };
    const w = ms => new Promise(r => setTimeout(r, ms));
    const vistos = [], u = new Set();
    if (nxt()) for (let k = 0; k < nsig; k++) { nxt() && nxt().click(); await w(750); const s = sig(); if (s && vistos.includes(s)) res.repetidos++; if (s) { vistos.push(s); u.add(s); } }
    res.distintos = u.size; res.conSiguiente = vistos.length > 0;
    // toques al azar (un niño que toca por probar)
    const cand = () => [...tr.querySelectorAll('button,.cn-k,canvas,.grid>*,.bd .c,.tabla button,svg *[onclick],.chips button')].filter(e => vis(e) && !e.classList.contains('ayuda') && !e.closest('.pf-nav') && !e.closest('a'));
    for (let k = 0; k < ntap; k++) { const c = cand(); if (!c.length) break; const e = c[Math.floor(Math.random() * c.length)], r = e.getBoundingClientRect(); const o = { clientX: r.x + r.width * (0.2 + 0.6 * Math.random()), clientY: r.y + r.height * (0.2 + 0.6 * Math.random()), bubbles: true, pointerId: 1 }; try { e.dispatchEvent(new PointerEvent('pointerdown', o)); e.dispatchEvent(new PointerEvent('pointerup', o)); e.click(); } catch (er) {} res.toques++; await w(120); }
    res.sinSalida = cand().length === 0 && !document.querySelector('.pf-nav button');
    return res;
  }, { nsig, ntap, SIGRE });
}

(async () => {
  const b = await chromium.launch();
  const informe = [], resumen = {};
  for (const pf of PERFILES) {
    const [taller, anio] = pf.split('-').map(Number);
    const ctx = await b.newContext({ viewport: { width: VW, height: VH }, isMobile: true, hasTouch: true });
    const perfil = { v: 2, modo: 'hogar', pin: '', activo: 'v1', perfiles: [{ id: 'v1', nombre: 'Virtual', taller, anio, tema: 'rosa', mas: '', prog: {}, sup: {}, vis: {}, emo: [], ult: Date.now() }] };
    await ctx.addInitScript(pj => { try { localStorage.setItem('tm_v2', pj); sessionStorage.setItem('tm_inv', '1'); } catch (e) {} }, JSON.stringify(perfil));
    const p0 = await ctx.newPage(); await p0.goto(URL('camino.html')); await p0.waitForTimeout(500);
    const pasos = await p0.evaluate(([t, a]) => Rutas.pasos(t, a).map(s => ({ p: s.p, b: s.b, l: s.l })), [taller, anio]); await p0.close();
    const trays = []; pasos.filter(s=>!process.env.SOLO||process.env.SOLO.split(',').includes(s.p)).forEach(s => { let t = trays.find(x => x.p === s.p && x.b === s.b); if (!t) trays.push(t = { p: s.p, b: s.b, ls: [] }); if (!t.ls.includes(s.l)) t.ls.push(s.l); });
    console.log(`Perfil ${pf}: ${pasos.length} pasos en ${trays.length} bandejas`);
    for (const t of trays) {
      const page = await ctx.newPage(), errs = [];
      page.on('pageerror', e => { if (!/ServiceWorker/.test(e.message)) errs.push(e.message); });
      page.on('console', m => { if (m.type() === 'error' && !/ServiceWorker|favicon|net::ERR/.test(m.text())) errs.push(m.text()); });
      await page.goto(URL(t.p + '.html') + '#b' + t.b); await page.waitForTimeout(700);
      for (const l of t.ls) {
        const id = `${pf}_${t.p}_b${t.b}${l ? '_n' + l : ''}`, hall = [];
        await page.evaluate(([b, l]) => { PF.show(b - 1); const tr = document.querySelector('.tray.pf-on'), nv = tr && (tr.querySelector('.niv') || tr.querySelector('.chips.lv')); if (l && nv && nv.querySelectorAll('button')[l - 1]) nv.querySelectorAll('button')[l - 1].click(); }, [t.b, l]);
        await page.waitForTimeout(500);
        hall.push(...await page.evaluate(`(${inspecciona.toString()})(${taller},${anio})`));
        await page.screenshot({ path: path.join(SALIDA, 'capturas', id + '.png') });
        try {
          const r = await juega(page, NSIG, NTAP);
          if (r.conSiguiente && r.repetidos >= Math.ceil(NSIG / 3)) hall.push({ sev: 'error', tipo: 'repetidas', msg: `${r.repetidos} de ${NSIG} preguntas repetidas (solo ${r.distintos} distintas)` });
          else if (r.conSiguiente && r.repetidos > 0) hall.push({ sev: 'aviso', tipo: 'repetidas', msg: `${r.repetidos} de ${NSIG} preguntas repetidas` });
          if (r.sinSalida) hall.push({ sev: 'error', tipo: 'sin-salida', msg: 'Tras jugar no queda ningún botón visible' });
          await page.waitForTimeout(300);
          const d2 = await page.evaluate(`(${inspecciona.toString()})(${taller},${anio})`);
          d2.filter(x => !hall.some(h => h.tipo === x.tipo)).forEach(x => hall.push({ ...x, msg: '(tras jugar) ' + x.msg }));
          await page.screenshot({ path: path.join(SALIDA, 'capturas', id + '_despues.png') });
        } catch (e) { hall.push({ sev: 'error', tipo: 'juego', msg: 'Falló el jugador virtual: ' + String(e.message).slice(0, 120) }); }
        errs.splice(0).forEach(m => hall.push({ sev: 'error', tipo: 'consola', msg: m.slice(0, 160) }));
        informe.push({ perfil: pf, tema: t.p, bandeja: t.b, nivel: l, id, hallazgos: hall });
      }
      await page.close();
    }
    await ctx.close();
  }
  await b.close();
  // ---- Informe ----
  const cnt = s => informe.reduce((n, x) => n + x.hallazgos.filter(h => h.sev === s).length, 0);
  const porTipo = {}; informe.forEach(x => x.hallazgos.forEach(h => { const k = h.sev + ' · ' + h.tipo; (porTipo[k] = porTipo[k] || []).push(`${x.perfil} ${x.tema} b${x.bandeja}${x.nivel ? ' n' + x.nivel : ''}`); }));
  let md = `# Jugadores virtuales · informe\n\nPantalla simulada: ${VW}×${VH} (teléfono horizontal). Perfiles: ${PERFILES.join(', ')}. Pasos revisados: ${informe.length}.\n\n**Errores: ${cnt('error')} · Avisos: ${cnt('aviso')}**\n\n## Resumen por tipo\n\n| Tipo | Pasos afectados | Ejemplos |\n|---|---|---|\n`;
  Object.keys(porTipo).sort().forEach(k => { md += `| ${k} | ${porTipo[k].length} | ${porTipo[k].slice(0, 4).join('; ')} |\n`; });
  md += `\n## Detalle por paso\n\n`;
  informe.filter(x => x.hallazgos.length).forEach(x => { md += `### ${x.perfil} · ${x.tema} · bandeja ${x.bandeja}${x.nivel ? ' · nivel ' + x.nivel : ''}\n` + x.hallazgos.map(h => `- **${h.sev}** (${h.tipo}): ${h.msg}`).join('\n') + `\n\nCaptura: capturas/${x.id}.png\n\n`; });
  if (!informe.some(x => x.hallazgos.length)) md += 'Sin hallazgos.\n';
  fs.writeFileSync(path.join(SALIDA, 'jugadores_virtuales.md'), md);
  fs.writeFileSync(path.join(SALIDA, 'jugadores_virtuales.json'), JSON.stringify(informe, null, 1));
  console.log(`Listo: ${cnt('error')} errores, ${cnt('aviso')} avisos → ${path.join(SALIDA, 'jugadores_virtuales.md')}`);
})();
