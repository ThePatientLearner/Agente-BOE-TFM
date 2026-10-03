import { EMAIL_CONTACTO, LINKEDIN_URL } from "@/lib/legal";

/**
 * Los dos accesos de contacto en la cabecera: correo y LinkedIn.
 *
 * Antes esto era un botón que abría una ventana con las dos opciones dentro.
 * Se quitó: obligaba a un clic para descubrir algo que cabe en la propia
 * cabecera, y a cambio arrastraba una modal, su estado y su JavaScript. Con
 * los dos enlaces a la vista, el componente ya no necesita nada de eso y
 * puede renderizarse en el servidor.
 *
 * Al ser iconos sin texto, cada uno lleva `aria-label`: para quien usa lector
 * de pantalla, un enlace cuyo contenido es un dibujo no dice nada.
 */
export function ContactButton() {
  return (
    <div className="site-contact">
      <a
        className="contact-trigger"
        href={`mailto:${EMAIL_CONTACTO}`}
        aria-label={`Escribir a ${EMAIL_CONTACTO}`}
        title="Escríbenos"
      >
        <span className="contact-icon" aria-hidden="true">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </span>
      </a>

      {/* mailto: lanza el cliente de correo; LinkedIn sí es una página, y por
          eso este es el único de los dos que abre pestaña nueva. */}
      <a
        className="contact-trigger"
        href={LINKEDIN_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Perfil de LinkedIn de Roberto Casabán"
        title="LinkedIn"
      >
        <span className="contact-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"
            />
          </svg>
        </span>
      </a>
    </div>
  );
}
