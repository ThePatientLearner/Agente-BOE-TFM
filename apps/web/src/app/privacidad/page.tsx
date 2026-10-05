import type { Metadata } from "next";
import { formatDate } from "@/lib/format";
import { ACTUALIZADO, EMAIL_PRIVACIDAD, TITULAR } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Política de privacidad — BOE Inspector",
  description:
    "Qué datos trata BOE Inspector, con qué base jurídica, qué proveedores intervienen, y cómo solicitar la supresión o desindexación de contenidos.",
};

export default function PrivacidadPage() {
  return (
    <article className="legal-page">
      <h1>Política de privacidad</h1>

      <div className="legal-warning">
        <p>
          <strong>Este sitio no utiliza cookies de seguimiento</strong> y la única analítica que emplea es
          anónima y sin identificadores persistentes. No hay publicidad, ni perfilado, ni venta o
          cesión de datos. No existe lista de correo: la distribución se hace por canales públicos
          de Telegram y Discord. Al entrar en una cuenta se establece una cookie técnica de
          sesión, HttpOnly, que caduca a los siete días.
        </p>
      </div>

      <h2>1. Responsable del tratamiento</h2>
      <ul>
        <li>
          <strong>Responsable:</strong> {TITULAR}
        </li>
        <li>
          <strong>Contacto en materia de protección de datos:</strong>{" "}
          <a href={`mailto:${EMAIL_PRIVACIDAD}`}>{EMAIL_PRIVACIDAD}</a>
        </li>
      </ul>

      <h2>2. Qué datos tratamos y con qué finalidad</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Tratamiento</th>
              <th>Datos</th>
              <th>Finalidad</th>
              <th>Base jurídica</th>
              <th>Conservación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cuentas y acceso</td><td>Nombre de usuario, contraseña protegida mediante hash y sesión</td>
              <td>Permitir el acceso al asistente y, cuando se autorice, al cuaderno de electricidad</td>
              <td>Prestación del servicio solicitado</td><td>Hasta la eliminación de la cuenta; sesiones de siete días</td>
            </tr>
            <tr>
              <td>Asistente BOE</td><td>Pregunta, últimos cuatro mensajes y resúmenes públicos. En la ficha de una disposición, su texto oficial o pasajes relevantes</td>
              <td>Responder con fuentes de nuestro archivo</td><td>Solicitud de la persona usuaria</td>
              <td>Conversación en memoria del navegador mientras el chat permanece abierto. No se guarda en nuestra base. Contadores de uso durante 30 días</td>
            </tr>
            <tr>
              <td>Navegación web</td>
              <td>Dirección IP y datos técnicos del navegador, en los registros del servidor</td>
              <td>Prestar el servicio y garantizar su seguridad</td>
              <td>Interés legítimo (art. 6.1.f RGPD)</td>
              <td>El plazo del proveedor de alojamiento, en ningún caso más de 12 meses</td>
            </tr>
            <tr>
              <td>Medición de audiencia</td>
              <td>
                Página visitada, país, tipo de dispositivo, procedencia y acciones de lectura
                (abrir contenidos, llegar al final del resumen o acceder a los canales). Sin cookies y sin
                identificador que permita reconocer a la misma persona en días distintos
              </td>
              <td>Saber qué contenidos se consultan para decidir qué mejorar</td>
              <td>Interés legítimo (art. 6.1.f RGPD)</td>
              <td>El plazo del proveedor de analítica</td>
            </tr>
            <tr>
              <td>Consultas y solicitudes</td>
              <td>Los que la persona facilite en su mensaje</td>
              <td>Atender la consulta o la solicitud de derechos</td>
              <td>Consentimiento (art. 6.1.a RGPD)</td>
              <td>1 año desde su resolución</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        En particular,{" "}
        <strong>no se toman decisiones automatizadas con efectos jurídicos</strong> sobre las
        personas usuarias.
      </p>

      <h2>3. Datos personales contenidos en el BOE</h2>
      <p>
        El Boletín Oficial del Estado contiene, en determinadas secciones, datos personales de
        terceros (nombramientos, procesos selectivos, sanciones, notificaciones edictales). Nuestra
        política al respecto:
      </p>
      <ol>
        <li>
          <strong>Publicamos únicamente la Sección I (Disposiciones generales)</strong>, que por su
          naturaleza normativa no contiene datos personales identificativos de forma sistemática.
        </li>
        <li>
          El buscador del sitio opera sobre títulos, ministerios y resúmenes de esas disposiciones.{" "}
          <strong>No ofrecemos búsqueda por nombre de persona</strong> ni ninguna funcionalidad
          orientada a construir el perfil de un individuo a partir de publicaciones oficiales.
        </li>
        <li>
          Cualquier persona puede solicitar la supresión o desindexación de contenidos que le
          afecten, conforme al procedimiento del apartado 6.
        </li>
      </ol>

      <h2>4. Proveedores</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Servicio</th>
              <th>¿Trata datos de usuarios?</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vercel Inc.</td>
              <td>Alojamiento de la web y medición de audiencia</td>
              <td>Sí, registros de acceso y datos de visita agregados — encargado del tratamiento</td>
            </tr>
            <tr>
              <td>Cloudflare, Inc.</td>
              <td>DNS y transporte del tráfico hacia la API</td>
              <td>Sí, registros de acceso — encargado del tratamiento</td>
            </tr>
            <tr>
              <td>Hetzner Online GmbH</td>
              <td>Servidor donde se ejecuta la API y la base de datos (centro de datos en Helsinki, Finlandia)</td>
              <td>Sí, registros del servidor — encargado del tratamiento</td>
            </tr>
            <tr>
              <td>MiniMax (Nanonoble Pte. Ltd., Singapur)</td>
              <td>Respuestas del asistente BOE y generación de los resúmenes</td>
              <td>En el asistente, sí: recibe la pregunta, contexto breve de conversación y fragmentos del BOE — encargado del tratamiento. No recibe usuario, contraseña ni token de sesión. En los resúmenes solo recibe texto público del BOE</td>
            </tr>
            <tr>
              <td>OpenAI</td><td>Proveedor alternativo del asistente BOE</td>
              <td>Cuando el servicio tiene seleccionado OpenAI en lugar de MiniMax, o si MiniMax no está disponible: recibe lo mismo que este. No recibe usuario, contraseña ni token de sesión</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Para los resúmenes diarios, MiniMax recibe exclusivamente texto público del BOE.
        El asistente utiliza también MiniMax, y en ese caso recibe además el texto de tus
        preguntas y un contexto breve de conversación. El servicio puede cambiar el proveedor
        del asistente a OpenAI, que entonces recibe esos mismos datos en lugar de MiniMax. Evita incluir datos personales o
        información confidencial en tus preguntas. Puedes consultar la{" "}
        <a href="https://platform.minimax.io/protocol/privacy-policy" rel="noopener noreferrer">política de privacidad de MiniMax</a> y la{" "}
        <a href="https://openai.com/policies/privacy-policy/" rel="noopener noreferrer">política de privacidad de OpenAI</a>.
      </p>
      <p>
        La base de datos del servicio se aloja en un servidor contratado a Hetzner Online GmbH,
        con el centro de datos en <strong>Helsinki (Finlandia)</strong>, dentro del Espacio
        Económico Europeo: tus datos de cuenta no salen de él.
      </p>
      <p>
        Las preguntas que haces al asistente sí salen del Espacio Económico Europeo: MiniMax
        las trata a través de Nanonoble Pte. Ltd., con sede en <strong>Singapur</strong>. Según
        su política de privacidad, esas transferencias se amparan en las cláusulas
        contractuales tipo aprobadas por la Comisión Europea, junto con medidas técnicas
        adicionales. Por eso te pedimos que no incluyas datos personales en tus preguntas.
      </p>

      <h2>5. Derechos de las personas interesadas</h2>
      <p>
        Puedes ejercer en cualquier momento tus derechos de <strong>acceso, rectificación,
        supresión, limitación, portabilidad y oposición</strong>, así como retirar el consentimiento
        prestado —sin que ello afecte a la licitud del tratamiento previo—, escribiendo a{" "}
        <a href={`mailto:${EMAIL_PRIVACIDAD}`}>{EMAIL_PRIVACIDAD}</a>.
      </p>
      <p>
        Si consideras que el tratamiento no se ajusta a la normativa, puedes presentar una
        reclamación ante la{" "}
        <a href="https://www.aepd.es" rel="noopener noreferrer">
          Agencia Española de Protección de Datos
        </a>
        .
      </p>
      <p>
        Para dejar de recibir los avisos basta con abandonar el canal de Telegram o de Discord. No
        tratamos ningún dato identificativo de sus miembros: esas listas las gestiona cada
        plataforma bajo su propia política de privacidad.
      </p>

      <h2>6. Supresión y desindexación de contenidos</h2>
      <p>
        Si eres una persona física cuyos datos aparecen en una disposición publicada en este sitio y
        consideras que su difusión perjudica tus derechos, puedes solicitar su supresión o
        desindexación escribiendo a{" "}
        <a href={`mailto:${EMAIL_PRIVACIDAD}`}>{EMAIL_PRIVACIDAD}</a> e indicando la URL concreta y
        el motivo. No es necesario que aportes documentación identificativa en la primera
        comunicación.
      </p>
      <p>Nuestro compromiso:</p>
      <ol>
        <li>Acusamos recibo en 48 horas.</li>
        <li>Resolvemos en un plazo máximo de 30 días (art. 12 RGPD).</li>
        <li>
          Si la solicitud es estimada, la página se elimina o se marca como no indexable y se
          solicita a los motores de búsqueda su desindexación.
        </li>
        <li>Te informamos por escrito de la decisión y, si es denegatoria, del motivo.</li>
      </ol>
      <p>
        La supresión afecta a este sitio, no al Boletín Oficial del Estado: el texto oficial seguirá
        publicado en{" "}
        <a href="https://www.boe.es" rel="noopener noreferrer">
          boe.es
        </a>
        , cuya gestión no nos corresponde.
      </p>

      <h2>7. Cookies, almacenamiento y analítica</h2>
      <p>
        <strong>Este sitio no instala ninguna cookie</strong>, ni propia ni de terceros. Tampoco
        carga fuentes ni imágenes alojadas en servidores ajenos.
      </p>
      <p>
        <strong>Analítica.</strong> Se utiliza Vercel Web Analytics para contar visitas y acciones de lectura: apertura de
        resúmenes, informes y enlaces a medios, llegada al final de un resumen y clics en los
        canales de suscripción o el juego. No se envían las búsquedas, contraseñas ni texto
        introducido por el visitante. No emplea
        cookies ni almacena ningún identificador en el dispositivo: las visitas se agregan sin
        conservar un dato que permita reconocer a la misma persona en días distintos. No se
        comparte con anunciantes ni se usa para seguir a nadie por otros sitios web.
      </p>
      <p>
        <strong>Almacenamiento de sesión.</strong> Si desbloqueas la búsqueda completa, la clave
        se conserva en la pestaña para autorizar las consultas al archivo. Se elimina al cerrar
        la pestaña o desactivar esa búsqueda.
      </p>
      <p>
        <strong>Invitación a los canales.</strong> Se guarda en este navegador una marca local
        cuando se muestra la invitación a Telegram o Discord, para no volver a abrirla en
        visitas posteriores. Esta marca no contiene datos personales ni se envía al servidor.
        Se conserva hasta que borres los datos del sitio. El aviso del juego no se abre
        automáticamente; su antigua marca también puede borrarse vaciando los datos del sitio.
      </p>
      <p>
        Por eso no se muestra banner de cookies: no se almacena ni se consulta información en el
        dispositivo con fines de seguimiento o publicidad, que es lo que exigiría el
        consentimiento del artículo 22.2 de la LSSI.
      </p>

      <p className="legal-updated">
        Última actualización: {formatDate(ACTUALIZADO)} · <a href="/legal">Aviso legal</a>
      </p>
    </article>
  );
}
