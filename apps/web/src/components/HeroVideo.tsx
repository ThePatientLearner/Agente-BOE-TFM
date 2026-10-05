"use client";

import { useEffect, useRef } from "react";

/**
 * Emblema animado de la portada.
 *
 * El vídeo es un ping-pong (el original hacia delante y luego hacia atrás),
 * montado así en el propio archivo: el movimiento es un zoom lento, y al
 * llegar al final y volver sobre sus pasos el empalme cae exactamente sobre
 * el mismo fotograma, así que el bucle no tiene costura. Sin eso se veía un
 * salto brusco al reiniciarse, porque el último fotograma estaba mucho más
 * cerca que el primero.
 *
 * `muted` + `playsInline` no son opcionales: sin `muted` los navegadores
 * bloquean la reproducción automática, y sin `playsInline` iOS abre el vídeo
 * a pantalla completa en cuanto arranca.
 */
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  // La animación también abre la portada móvil. Si el sistema pide menos
  // movimiento, se mantiene el póster.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const media = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const apply = () => {
      if (media.matches) {
        if (!video.getAttribute("src")) video.src = "/emblema-loop.mp4";
        // Si el navegador bloquea el autoplay, se mantiene el póster.
        void video.play().catch(() => {});
      } else if (!media.matches && video.getAttribute("src")) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  return (
    <>
      <video
        ref={ref}
        className="hero-video"
        poster="/emblema-poster.jpg"
        preload="none"
        loop
        muted
        playsInline
        aria-label="Emblema de Agente BOE: figura dorada con lupa y pluma sobre fondo azul marino"
      />
    </>
  );
}
