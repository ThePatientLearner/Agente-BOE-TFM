import type { Metadata } from "next";
import { JuegoCabecera } from "@/components/JuegoCabecera";
import { JuegoMarco } from "@/components/JuegoMarco";

export const metadata: Metadata = {
  title: "¡Haz que todos se suscriban! — el juego de Agente BOE",
  description:
    "Juego de parodia política: llena la caja fuerte suiza antes de quedarte sin blanca. Quien más guarde gana finanfocus.com PRO gratis de por vida.",
};

/**
 * El juego vive en `public/juego/suscriban.html` y se muestra aquí dentro de
 * un iframe. No está integrado en la página a propósito: es un lienzo que se
 * adueña del viewport entero (`position: fixed`, `overflow: hidden`, teclado
 * capturado) y, embebido sin marco, arrasaría con el layout del sitio. El
 * iframe le da su propia ventana y deja intactas la cabecera y el pie.
 */
export default function JuegoPage() {
  return (
    <article className="juego-pagina">
      <header className="juego-cabecera">
        <p className="juego-etiqueta">Juego nuevo</p>
        <h1>¡Haz que todos se suscriban!</h1>
        <p className="juego-entradilla">
          Recoge el dinero y guárdalo en la caja fuerte suiza antes de quedarte sin blanca.
          Quien más haya guardado cuando termine el concurso se lleva{" "}
          <strong>finanfocus.com PRO gratis de por vida</strong>.
        </p>
        {/* El contador y el compartir viven aquí, fuera del lienzo: dentro del
            juego había que encajarlos en el único hueco libre de la pantalla
            de inicio y quedaban apretados. */}
        <JuegoCabecera />
      </header>

      <JuegoMarco />

      <section className="juego-reglas">
        <h2>Cómo se participa</h2>
        <ol>
          <li>
            Juega una partida. Cuenta lo que hayas dejado en la{" "}
            <strong>caja fuerte</strong>, no lo que lleves encima al morir.
          </li>
          <li>
            Al terminar puedes escribir un <strong>seudónimo</strong>. Solo quien pone
            seudónimo aparece en el top 5 público; el resto juega en anónimo.
          </li>
          <li>
            Recibirás un <strong>código de partida</strong> tipo <code>BOE-K7Q2-M4XR</code>.
            Guárdalo —una captura de pantalla vale—: es lo único que demuestra que esa partida
            fue tuya si resultas ganador. No se puede volver a consultar.
          </li>
        </ol>
        <p className="juego-nota">
          El concurso se cierra dentro de unas semanas. No hay registro ni se pide ningún dato
          personal: el seudónimo y el código son todo lo que se guarda.
        </p>
      </section>

      {/* Parodia y sátira: la misma advertencia que lleva el propio juego, aquí
          fuera para que se lea antes de entrar. */}
      <aside className="juego-legal">
        <p>
          <strong>Parodia y sátira política.</strong> Obra de humor sin ánimo de lucro (art. 20
          CE). El personaje está caricaturizado y sus frases son declaraciones públicas
          documentadas —las fuentes están dentro del juego— usadas fuera de contexto con fines
          humorísticos; no pretende afirmar hechos. Imágenes generadas con IA. Juego gratuito y
          sin relación con el BOE.
        </p>
      </aside>
    </article>
  );
}
