# Jugadores virtuales

`jugadores_virtuales.js` recorre el plan de un taller y año (según `rutas.js`) en un teléfono horizontal simulado (844×390),
revisa cada pantalla y juega un poco (toques al azar y «Siguiente» repetido). Detecta problemas mecánicos:
desbordes, botones fuera de pantalla o superpuestos, botones menores de 36 px, texto diminuto o cortado, escala de pantalla baja,
controles de los lados idénticos a los del centro, texto pequeño para primer año, preguntas repetidas, errores de consola y callejones sin salida.

No sustituye a un niño real: no sabe si algo se entiende. Sirve para no abrir a mano cada reto.

## Uso local
```
npm i playwright && npx playwright install chromium
node herramientas/jugadores_virtuales.js --perfiles 1-1,1-2 --rapido
SOLO=contar,dorado node herramientas/jugadores_virtuales.js --perfiles 1-2   # solo algunos temas
```
Deja `herramientas/informes/jugadores_virtuales.md` (resumen y detalle) y capturas antes y después de jugar.

## En GitHub
El flujo **Jugadores virtuales** (pestaña Actions) corre solo cuando cambian páginas, scripts o estilos, o a mano con otros perfiles
(por ejemplo `2-1,2-2`). El informe aparece en el resumen de la ejecución y las capturas en el artefacto `jugadores-virtuales`.
