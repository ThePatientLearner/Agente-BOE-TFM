import type { NextConfig } from "next";

/**
 * Caché de los archivos estáticos de `public/`.
 *
 * Next.js sirve `public/` con `max-age=0, must-revalidate`, así que el
 * navegador vuelve a preguntar por el vídeo en cada carga de página. Con el
 * emblema pesando casi 1 MB, eso es mucho tráfico para un archivo que no
 * cambia nunca. Los chunks de JS no tienen el problema porque su nombre lleva
 * un hash y Next ya les pone un año de caché.
 *
 * ⚠️ `immutable` significa literalmente eso: el navegador no volverá a pedir
 * el archivo durante un año, ni siquiera al recargar. Si algún día cambia el
 * vídeo o el póster, hay que **renombrarlos** (`emblema-loop-v2.mp4`) y
 * actualizar la referencia en `HeroVideo.tsx`. Sobrescribirlos con el mismo
 * nombre dejaría a los visitantes que vuelven viendo el antiguo.
 */
const CACHE_UN_AÑO = "public, max-age=31536000, immutable";

/**
 * `/cv` es el CV interactivo de Roberto (`public/cv/index.html` y sus PDFs).
 * Es una página personal, no parte del servicio: solo llega quien tenga la
 * dirección. Nada del sitio la enlaza, no está en el sitemap y lleva
 * `noindex` en cabecera y en el HTML.
 *
 * ⚠️ No la metas en `robots.ts`: un `Disallow: /cv` en robots.txt la
 * anunciaría a cualquiera que lo lea, que es justo lo que se quiere evitar.
 */
const NO_INDEXAR = "noindex, nofollow, noarchive";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/electricidad/[[...path]]": ["./private/**/*"],
    "/electricidadTest/[[...path]]": ["./private/**/*"],
  },
  async rewrites() {
    return [
      { source: "/cv", destination: "/cv/index.html" },
    ];
  },
  async headers() {
    return [
      {
        source: "/:archivo(emblema-.*\\.(?:mp4|jpg|webp))",
        headers: [{ key: "Cache-Control", value: CACHE_UN_AÑO }],
      },
      {
        source: "/:pagina(cv|electricidad|electricidadTest|tfm)/:ruta*",
        headers: [{ key: "X-Robots-Tag", value: NO_INDEXAR }],
      },
    ];
  },
};

export default nextConfig;
