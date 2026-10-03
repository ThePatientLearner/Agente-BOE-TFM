"use client";

import { useEffect, useRef, useState } from "react";

/** Ruta del juego dentro de `public/`. */
const JUEGO_SRC = "/juego/suscriban.html";

/**
 * Ventana del juego. El lienzo es 16:9 y el iframe mantiene esa proporción
 * para que no queden bandas negras ni haga falta hacer scroll dentro.
 *
 * El botón de pantalla completa lo pide sobre el iframe, no sobre el
 * documento: así el juego ocupa la pantalla entera sin arrastrar la cabecera
 * ni el pie del sitio. En iPhone `requestFullscreen` no existe, y por eso el
 * botón se esconde cuando no hay soporte en vez de fallar al pulsarlo.
 */
export function JuegoMarco() {
  const marco = useRef<HTMLIFrameElement>(null);
  const [cargado, setCargado] = useState(false);
  /**
   * Si el navegador sabe ponerse a pantalla completa. Se resuelve en un
   * efecto y no durante el render: mirar `document` al pintar deja al
   * cliente con un botón que el HTML del servidor no traía, y React aborta
   * la hidratación de la página entera por esa diferencia.
   */
  const [hayPantallaCompleta, setHayPantallaCompleta] = useState(false);

  useEffect(() => {
    setHayPantallaCompleta("requestFullscreen" in document.documentElement);
  }, []);

  const aPantallaCompleta = () => {
    void marco.current?.requestFullscreen?.();
  };

  return (
    <div className="juego-marco">
      <div className="juego-lienzo">
        {!cargado && <p className="juego-cargando">Cargando el juego…</p>}
        <iframe
          ref={marco}
          src={JUEGO_SRC}
          title="¡Haz que todos se suscriban!"
          allow="fullscreen; autoplay"
          onLoad={() => setCargado(true)}
        />
      </div>
      <div className="juego-acciones">
        {hayPantallaCompleta && (
          <button type="button" className="juego-boton" onClick={aPantallaCompleta}>
            ⛶ Pantalla completa
          </button>
        )}
        {/* Abre el juego solo, sin la cabecera ni el pie: es como se juega
            de verdad en el móvil, y en el ordenador es el paso previo a la
            pantalla completa. El neón lo señala porque, al lado de un botón
            con icono, un enlace de texto plano no se lee como pulsable. */}
        <a className="juego-boton juego-boton-neon" href={JUEGO_SRC} target="_blank" rel="noopener">
          Juega en el móvil o pantalla completa ordenador
        </a>
      </div>
      <p className="juego-aviso-movil">
        En el móvil se juega en horizontal. Gira el teléfono al empezar.
      </p>
    </div>
  );
}
