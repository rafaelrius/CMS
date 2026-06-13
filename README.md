# Piloto Decap CMS — pacacervera

Prueba de concepto para que **el cliente mantenga su web** (cambiar textos, añadir
y cambiar fotos) sin tocar el diseño, con el flujo que pediste: **al guardar se
hace commit y se despliega solo**.

Es la demo `pacacervera` (solo la **home**, como piloto) reconstruida con:

- **Eleventy (11ty)** — build ligero. La web sigue siendo 100% estática y rápida.
  11ty solo inyecta el contenido editable en la plantilla; el HTML, el CSS, el JS
  y los efectos son los mismos de la demo original.
- **Decap CMS** — panel de administración en `/admin/`. El cliente edita un
  formulario; Decap guarda los cambios en el repositorio.

## Qué puede tocar el cliente y qué NO (contrato de contenido)

- **EDITABLE** (vía Decap → `src/_data/home.json` y fotos en `src/media/`):
  textos de todas las secciones, botones, imágenes y sus textos alternativos,
  metadatos SEO.
- **BLOQUEADO** (no aparece en el panel): maquetación, CSS, JS, efectos,
  estructura, navegación. El cliente no puede romper el diseño.

Esa separación es la clave: el diseño premiado queda intacto pase lo que pase.

## Probar el bucle COMPLETO en local (sin GitHub, sin cuentas)

Decap trae un modo local (`local_backend`) que escribe directamente en los
ficheros. Necesitas **dos terminales** en esta carpeta:

```bash
npm install          # solo la primera vez

# Terminal 1 — proxy local de Decap (permite guardar en los ficheros)
npm run cms          # = npx decap-server  (escucha en :8081)

# Terminal 2 — sitio + panel, con recarga en caliente
npm run serve        # = eleventy --serve  (sirve en :8080)
```

Luego abre:

- La web: <http://localhost:8080/>
- El panel: <http://localhost:8080/admin/>

En el panel, entra (en local no pide login real), edita cualquier texto o
**cambia una foto**, pulsa **Publicar**. Verás que:

1. Decap escribe el cambio en `src/_data/home.json` (o sube la foto a `src/media/`).
2. Eleventy reconstruye y la web se actualiza al instante.

> Build manual de la web (sin servidor): `npm run build` → genera `_site/`.

## Cómo se conecta en PRODUCCIÓN (commit → deploy solo)

Resumen del flujo objetivo:

```
Cliente edita en /admin/  →  Decap hace commit a GitHub (rama main)
        →  GitHub Action: npm ci + npm run build (Eleventy → _site)
        →  sube _site por FTP a  <servidor 3L>/demos/<slug>/
        →  la demo queda actualizada
```

Pasos para dejarlo operativo (una vez por cliente). **Requiere cuentas que solo
tú/3L Systems podéis crear:**

1. **Repositorio en GitHub** (uno por web), p. ej. `3lsystems/pacacervera-web`,
   con el contenido de esta carpeta. Pon el `repo` real en `src/admin/config.yml`.

2. **OAuth para Decap (GitHub backend).** Decap necesita autenticar al cliente
   contra GitHub mediante un pequeño proxy OAuth (no expone secretos en el front):
   - Crea una **GitHub OAuth App** (GitHub → Settings → Developer settings →
     OAuth Apps): obtén *Client ID* y *Client Secret*.
   - Despliega un proxy OAuth minúsculo y gratuito. La vía más cómoda es un
     **Cloudflare Worker** con el proyecto comunitario `decap-proxy`
     (o un endpoint equivalente en Vercel/Netlify Functions). Configúralo con el
     Client ID/Secret de la OAuth App.
   - Apunta `backend.base_url` en `config.yml` a la URL del proxy.

3. **Secrets del repositorio** (Settings → Secrets and variables → Actions):
   `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` (los del servidor de 3L Systems;
   los mismos que usa `motor/deploy/deploy.config.ps1`, **sin** exponerlos en el
   repo). El workflow ya está en `.github/workflows/deploy.yml`.

4. **Ajusta el destino** en `.github/workflows/deploy.yml`:
   `server-dir: /demos/<slug>/`. ⚠️ SIEMPRE bajo `demos/` (regla crítica de
   WEB-FORGE), nunca en la raíz.

5. **Publica el `/admin/`**: ya se incluye en el build (sale a `_site/admin/`),
   así que queda en `https://<dominio>/demos/<slug>/admin/`. (Para la demo en
   subcarpeta, conviene que `config.yml` y las rutas usen rutas relativas; ver
   notas abajo.)

A partir de ahí, cada **Publicar** del cliente dispara el ciclo completo solo.

## Notas y límites del piloto

- Solo está convertida la **home**. Las demás páginas (firmas, nosotras,
  boutiques, privacidad, 404) se migran igual: extraer su contenido editable a
  `src/_data/<pagina>.json`, plantilla `src/<pagina>.njk` y añadir su colección
  en `config.yml`. Es mecánico.
- En producción, al servir el panel desde una **subcarpeta** `demos/<slug>/`,
  conviene revisar rutas relativas del `/admin/` y del `media_folder`. Si cada
  web va a tener dominio propio más adelante, el panel vive en la raíz y es trivial.
- **Optimización de imágenes**: cuando el cliente suba fotos pesadas conviene
  un paso de optimización en el build (p. ej. `@11ty/eleventy-img`) para no
  perder el rendimiento que tanto cuidamos. Pendiente para la fase de motor.
- Decap se carga por CDN en `src/admin/index.html`. Para cero dependencias
  externas se puede *vendorizar* el bundle (está el código fuente en
  `decap-cms-main/`), pero para empezar la CDN va perfecta.

## Estructura

```
pacacervera/
├─ src/
│  ├─ index.njk            ← plantilla de la home (HTML original + variables)
│  ├─ _data/home.json      ← CONTENIDO EDITABLE (lo que toca el cliente)
│  ├─ admin/
│  │  ├─ index.html        ← carga Decap
│  │  └─ config.yml        ← colecciones/campos del panel
│  ├─ css/ js/ media/      ← activos (copiados de la demo, sin tocar)
│  └─ robots.txt
├─ eleventy.config.js      ← build + filtro de texto enriquecido
├─ .github/workflows/deploy.yml  ← commit → build → FTP a demos/
└─ _site/                  ← salida del build (no se versiona)
```
