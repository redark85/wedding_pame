# María & Juan — Invitación de boda

Invitación web de boda de una sola página. Solo frontend: HTML5, CSS3 y JavaScript vanilla, sin frameworks, sin backend, sin base de datos. Lista para publicarse en GitHub Pages.

## Estructura

```text
wedding-invitation/
│
├── index.html
├── styles.css
├── script.js
│
├── assets/
│   ├── images/
│   │   ├── hero.svg        (placeholder — reemplazar por foto real)
│   │   ├── couple-1.svg ... couple-6.svg (placeholders de galería)
│   │   └── favicon.svg
│   │
│   └── audio/
│       └── song.mp3.placeholder  (colocar aquí song.mp3 real)
│
└── README.md
```

## Cómo probarlo

Abre `index.html` directamente en el navegador (doble clic) o usa un servidor estático local. No requiere `npm install`, Node.js ni ningún backend.

## Cómo personalizar

### 1. Nombres, fecha y textos generales

Al inicio de `script.js` encontrarás el objeto de configuración:

```javascript
const wedding = {
  couple: "María & Juan",
  date: "12 de diciembre de 2026",
  weddingDate: "2026-12-12T16:00:00",
  ceremony: { ... },
  reception: { ... },
  dressCode: "Formal / Elegante",
  music: "assets/audio/song.mp3"
};
```

Modifica estos valores y se aplicarán automáticamente a ceremonia, recepción, dress code y cuenta regresiva.

Los nombres, la fecha del hero, la frase de bienvenida, la introducción, el itinerario y el texto final están escritos directamente en `index.html` (búscalos por el texto visible) para que puedas editarlos con libertad sin tocar JavaScript.

### 2. Fecha y cuenta regresiva

Cambia `weddingDate` en `script.js` con formato ISO (`"YYYY-MM-DDTHH:mm:ss"`). La cuenta regresiva se recalcula sola. Al llegar la fecha, se muestra automáticamente el mensaje "¡Hoy celebramos nuestra boda!" en lugar de números negativos.

### 3. Lugares (ceremonia / recepción)

Edita los objetos `ceremony` y `reception` dentro de `wedding` en `script.js` (`name`, `address`, `time`, `mapsUrl`). La descripción de cada lugar está en `index.html`, dentro de `.venue-card__desc`.

### 4. Google Maps

Cada lugar usa una URL de Google Maps normal (no se usa la API de Google Maps):

```javascript
mapsUrl: "https://maps.google.com/?q=Nombre+del+lugar"
```

Puedes generar el enlace buscando el lugar en Google Maps y copiando la URL, o usar el formato `?q=` con la dirección.

### 5. Fotos

Reemplaza los archivos en `assets/images/`:

- `hero.svg` → foto principal de portada y cierre (usa una imagen real, por ejemplo `hero.jpg`, y actualiza las 3 referencias en `index.html`: hero, meta `og:image` y sección final).
- `couple-1.svg` ... `couple-6.svg` → fotos de la galería (actualiza `src` y `data-full` de cada `<button class="gallery__item">` en `index.html`).
- `favicon.svg` → icono del sitio.

Recomendado: usa fotos horizontales/cuadradas comprimidas (JPEG/WebP) para mantener el sitio ligero.

### 6. Canción

1. Coloca tu archivo de audio en `assets/audio/song.mp3` (sustituye o coloca junto al placeholder `song.mp3.placeholder`).
2. No se incluye ninguna canción con copyright en este repositorio.
3. La música se intenta reproducir cuando el usuario pulsa "Abrir invitación" (los navegadores bloquean el autoplay con sonido). También puede activarse/pausarse en cualquier momento con el botón circular flotante (♪) en la esquina inferior derecha.

### 7. Textos

Todos los textos visibles (intro, dress code, itinerario, RSVP, sección final) están directamente en `index.html` en español y pueden editarse como texto plano.

### 8. Formulario de confirmación (RSVP)

El formulario es **solo frontend**: valida los campos, muestra un estado de éxito y **no envía ni guarda ningún dato** todavía. El punto de integración futura está claramente marcado en `script.js`:

```javascript
async function submitRSVP(data) {
  // TODO: conectar posteriormente con backend
}
```

Cuando exista un backend, sustituye el contenido de esta función por una llamada `fetch` real (hay un ejemplo comentado dentro de la propia función).

## Publicar en GitHub Pages

1. Sube este proyecto a un repositorio de GitHub (la raíz del repo debe contener `index.html`).
2. En GitHub: **Settings → Pages → Source**, selecciona la rama (por ejemplo `main`) y la carpeta raíz (`/`).
3. Guarda. GitHub Pages generará una URL pública (tipo `https://usuario.github.io/repositorio/`).
4. No se necesita configuración adicional: no hay variables de entorno, backend, Node.js ni bases de datos.

## Accesibilidad y rendimiento

- HTML semántico, `alt` descriptivos, labels reales en el formulario, navegación por teclado y `aria-label`/`aria-pressed` en los controles interactivos.
- Se respeta `prefers-reduced-motion`: si el usuario lo tiene activado, se desactivan las animaciones de scroll y del botón de música.
- Imágenes fuera del hero usan `loading="lazy"`.
- Sin librerías externas de JavaScript; solo Google Fonts vía `<link>`.
