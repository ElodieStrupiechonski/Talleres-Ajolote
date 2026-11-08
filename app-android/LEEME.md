# App de Android · Talleres del Ajolote

Esta carpeta convierte los talleres en una app de Android que se sube a Google Play. La app lleva **todo el contenido adentro** y funciona sin internet. La compilación se hace sola en GitHub: no hace falta instalar Android Studio.

> Estado: la receta de compilación está escrita y revisada, pero **todavía no se ha ejecutado** (el entorno donde se preparó no podía descargar las herramientas de Android). La primera corrida en GitHub puede necesitar un ajuste menor; el registro de «Actions» dirá exactamente en qué paso.

## Una sola vez: crear la llave de subida

Google Play pide que cada versión venga firmada con una «llave de subida». Se crea una vez y se guarda con cuidado.

1. En una computadora con Java instalado (en Raspberry Pi: `sudo apt install default-jre-headless`), ejecutar:

   ```
   keytool -genkeypair -v -keystore subida.jks -alias ajolote -keyalg RSA -keysize 4096 -validity 10000
   ```

   Pedirá una contraseña (usar la misma para el almacén y para la llave) y algunos datos del titular. Guardar **dos copias** de `subida.jks` y de la contraseña fuera de GitHub (por ejemplo, un USB y un gestor de contraseñas). **No subir `subida.jks` al repositorio.**

2. Convertirla a texto:
   - Linux / Raspberry Pi: `base64 -w0 subida.jks`
   - macOS: `base64 -i subida.jks`

3. En GitHub, en el repositorio: **Settings → Secrets and variables → Actions → New repository secret**, y crear estos cuatro:

   | Nombre | Valor |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | el texto largo del paso 2 |
   | `ANDROID_KEYSTORE_PASSWORD` | la contraseña |
   | `ANDROID_KEY_ALIAS` | `ajolote` |
   | `ANDROID_KEY_PASSWORD` | la misma contraseña |

## Cada vez que haya una versión nueva

1. Subir al repositorio los archivos nuevos o cambiados de los talleres (como siempre).
2. Ir a **Actions → Android → Run workflow**, escribir el nombre de versión (por ejemplo `1.0.1`) y ejecutar. Tarda unos 10 a 15 minutos.
3. Al terminar, abrir la ejecución y bajar el archivo comprimido **talleres-ajolote-android**. Dentro hay:
   - `talleres-ajolote.aab`: el que se sube a Google Play.
   - `talleres-ajolote-prueba.apk`: para instalar directo en una tableta y probar antes (hay que permitir «instalar apps de origen desconocido» en esa tableta).
4. En Play Console: **Probar y publicar → (la prueba o la producción que corresponda) → Crear versión nueva → subir el .aab**, escribir las notas de la versión y enviar a revisión.

El número interno de versión (`versionCode`) sube solo con cada ejecución, así que Play siempre acepta la siguiente.

## Qué hace la receta

1. Copia los talleres a una carpeta temporal y quita el service worker (la app ya lleva los archivos, así que no hace falta guardarlos aparte y no pueden quedar versiones viejas).
2. Instala Capacitor 8 y crea el proyecto Android (requiere Node 22 y destino Android 16, API 36; ambos ya están en la receta).
3. Genera los íconos y la pantalla de arranque a partir de `app-android/assets/`.
4. Fija el número y nombre de versión y desactiva la copia de seguridad automática de Android, para que los datos de las niñas y los niños no salgan del dispositivo.
5. Compila, firma el AAB con la llave de subida y lo deja como descarga.

## Cambiar el nombre, el ícono o el identificador

- **Nombre que se ve bajo el ícono:** `app-android/capacitor.config.json`, campo `appName`.
- **Ícono y pantalla de arranque:** reemplazar los PNG de `app-android/assets/` (mismos nombres y tamaños).
- **Identificador (`appId`):** `io.github.elodiestrupiechonski.ajolote`. **No se puede cambiar después de publicar.** Si prefieren otro (por ejemplo, el de la asociación), hay que cambiarlo **antes** de la primera subida.

## Si la receta falla

Abrir la ejecución fallida en la pestaña Actions, copiar el mensaje del paso en rojo y compartirlo. Como alternativa sin GitHub: instalar Android Studio, abrir una terminal en `app-android`, copiar los talleres a `www`, y ejecutar `npm install`, `npx cap add android`, `npx cap sync android` y `npx cap open android`.
