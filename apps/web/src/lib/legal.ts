/**
 * Datos del titular y fechas de los textos legales.
 *
 * Viven en un solo sitio porque aparecen repetidos en /legal y en /privacidad,
 * y dos páginas legales que se contradicen son peor que ninguna.
 *
 * Al ser un servicio gratuito, sin publicidad ni patrocinadores, el artículo 10
 * de la LSSI se cumple con un nombre y un correo operativo: no hace falta
 * publicar NIF ni domicilio. Eso cambiaría el día que entrase cualquier ingreso
 * —donaciones incluidas—, según LEGAL.md §1.1.
 */

export const TITULAR = "Roberto C. C.";

/** Debe ser una dirección que alguien lea de verdad: la ley pide un contacto
 *  "efectivo", y el RGPD cuenta los plazos desde que llega la solicitud. */
export const EMAIL_CONTACTO = "contacto@agenteboe.com";
export const EMAIL_PRIVACIDAD = "privacidad@agenteboe.com";

/** Perfil público del desarrollador; sale en la cabecera y en la modal de búsqueda completa. */
export const LINKEDIN_URL =
  "https://www.linkedin.com/in/roberto-casab%C3%A1n-climent-3ab661b2/";

/** Contacto público de Telegram para solicitar acceso a BoeBot. */
export const TELEGRAM_CONTACT_URL = "https://t.me/FinanFocus";

export const SITIO_WEB = "https://agenteboe.com";

/** Fecha de la última revisión de los textos, visible al pie de cada página. */
export const ACTUALIZADO = "2026-10-02";
