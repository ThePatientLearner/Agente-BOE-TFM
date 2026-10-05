"use client";

import { useEffect, useRef, useState } from "react";

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
  const [canAnimate, setCanAnimate] = useState(false);
  const [playing, setPlaying] = useState(false);

  // La animación también abre la portada móvil. Si el sistema pide menos
  // movimiento, se mantiene el póster.
  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const media = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const apply = () => {
      setCanAnimate(media.matches);
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

  const togglePlayback = () => {
    const video = ref.current;
    if (!video || !window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;
    if (video.paused) {
      // También permite iniciar la animación si el autoplay fue bloqueado.
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

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
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEmptied={() => setPlaying(false)}
        aria-label="Emblema de Agente BOE: figura dorada con lupa y pluma sobre fondo azul marino"
      />
      {canAnimate && (
        <button
          type="button"
          className="hero-video-control"
          onClick={togglePlayback}
          aria-label={playing ? "Pausar la animación del emblema" : "Reproducir la animación del emblema"}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
            {playing ? <path d="M6 5h4v14H6zm8 0h4v14h-4z" /> : <path d="m8 5 11 7-11 7z" />}
          </svg>
          <span>{playing ? "Pausar" : "Animar"}</span>
        </button>
      )}
    </>
  );
}
