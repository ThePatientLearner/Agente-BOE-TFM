import { describe, expect, it } from "vitest";
import {
  COMUNIDADES,
  VERIFICADO_EL,
  type Comunidad,
  comunidadDeDisposicion,
  comunidadesMencionadas,
  etiquetaGobierno,
  gobiernoDeDisposicion,
} from "./comunidad.js";

describe("comunidadDeDisposicion", () => {
  // Cadenas copiadas tal cual de catalog.entries en producción.
  it.each([
    ["COMUNIDAD AUTÓNOMA DE CATALUÑA", "CT"],
    ["COMUNIDAD AUTÓNOMA DE CANARIAS", "CN"],
    ["COMUNIDAD AUTÓNOMA DE CANTABRIA", "CB"],
    ["COMUNIDAD FORAL DE NAVARRA", "NC"],
    ["COMUNIDAD AUTÓNOMA DE EXTREMADURA", "EX"],
    ["COMUNIDAD AUTÓNOMA DE ARAGÓN", "AR"],
    ["COMUNIDAD AUTÓNOMA DEL PAÍS VASCO", "PV"],
    ["COMUNIDAD AUTÓNOMA DEL PRINCIPADO DE ASTURIAS", "AS"],
    ["COMUNIDAD AUTÓNOMA DE LAS ILLES BALEARS", "IB"],
    ["COMUNITAT VALENCIANA", "VC"],
    ["COMUNIDAD DE MADRID", "MD"],
    ["CIUDAD AUTÓNOMA DE MELILLA", "ML"],
  ])("reconoce %s", (departamento, codigo) => {
    expect(comunidadDeDisposicion(departamento)?.codigo).toBe(codigo);
  });

  // El caso que rompe cualquier búsqueda ingenua por subcadena: las dos
  // Castillas comparten prefijo y son gobiernos distintos.
  it("no confunde las dos Castillas", () => {
    expect(comunidadDeDisposicion("COMUNIDAD AUTÓNOMA DE CASTILLA-LA MANCHA")?.codigo).toBe("CM");
    expect(comunidadDeDisposicion("COMUNIDAD DE CASTILLA Y LEÓN")?.codigo).toBe("CL");
  });

  it("no etiqueta las disposiciones estatales", () => {
    expect(comunidadDeDisposicion("MINISTERIO DE HACIENDA")).toBeNull();
    expect(comunidadDeDisposicion("MINISTERIO DEL INTERIOR")).toBeNull();
  });

  it("usa el título cuando el departamento es un ministerio y nombra a una sola", () => {
    const comunidad = comunidadDeDisposicion(
      "MINISTERIO DE HACIENDA",
      "Real Decreto por el que se aprueba el traspaso de funciones a la Comunitat Valenciana",
    );
    expect(comunidad?.codigo).toBe("VC");
  });

  // Media España en el título no es "afecta a una comunidad": es una norma
  // estatal. Etiquetarla con la primera que aparezca sería un dato inventado.
  it("no elige una comunidad cuando el título nombra a varias", () => {
    expect(
      comunidadDeDisposicion(
        "MINISTERIO PARA LA TRANSICIÓN ECOLÓGICA Y EL RETO DEMOGRÁFICO",
        "Resolución sobre el reparto de fondos entre Galicia, Asturias y Cantabria",
      ),
    ).toBeNull();
  });

  it("no salta dentro de otra palabra", () => {
    expect(comunidadesMencionadas("Federación de municipios leoneses y madrileños")).toEqual([]);
  });
});

/**
 * OJO AL AFIRMAR SOBRE PARTIDOS CONCRETOS.
 *
 * La tabla de gobiernos la actualiza el cron del día 5, que puede editar
 * `comunidad.ts` pero NO este fichero (ver el `PERMITIDOS` de
 * scripts/actualizar-datos.sh). Un test que dijera «Extremadura es PP+VOX»
 * se rompería solo en las siguientes elecciones y bloquearía la pasada
 * entera sin que nadie pudiera arreglarlo desde dentro.
 *
 * Así que aquí se prueba el COMPORTAMIENTO con datos de mentira, y de los
 * datos de verdad solo lo que no depende del resultado electoral.
 */
describe("etiquetaGobierno", () => {
  function comunidadFalsa(gobierno: readonly string[]): Comunidad {
    return {
      codigo: "MD",
      nombre: "Comunidad de prueba",
      gobierno,
      presidente: "Quien sea",
      desde: "hace tiempo",
      alias: ["comunidad de prueba"],
    };
  }

  it("deja solo el partido si gobierna en solitario", () => {
    expect(etiquetaGobierno(comunidadFalsa(["PP"]))).toBe("PP");
  });

  it("une los socios con + respetando el orden", () => {
    expect(etiquetaGobierno(comunidadFalsa(["PP", "VOX"]))).toBe("PP+VOX");
    expect(etiquetaGobierno(comunidadFalsa(["PSN", "Geroa Bai", "Contigo"]))).toBe(
      "PSN+Geroa Bai+Contigo",
    );
  });
});

describe("la tabla de gobiernos", () => {
  it("cubre las 17 comunidades y las 2 ciudades autónomas", () => {
    expect(COMUNIDADES.size).toBe(19);
  });

  it("no deja ninguna sin partido, presidente ni alias", () => {
    for (const comunidad of COMUNIDADES.values()) {
      expect(comunidad.gobierno.length, comunidad.nombre).toBeGreaterThan(0);
      expect(comunidad.presidente, comunidad.nombre).not.toBe("");
      expect(comunidad.alias.length, comunidad.nombre).toBeGreaterThan(0);
    }
  });

  // La fecha sale a la web como "dato verificado el …". Una mal escrita se
  // pintaría como "Invalid Date"; una futura sería mentira. Que esté vieja no
  // se comprueba aquí a propósito: haría fallar el build por el paso del
  // tiempo, y de la frescura ya se encarga el cron del día 5.
  //
  // El margen de un día no es holgura gratis: "2026-08-20" se interpreta como
  // medianoche UTC, y quien apunta la fecha vive en Europe/Madrid (UTC+2), así
  // que entre las 22:00 y las 24:00 de aquí la fecha de hoy todavía es futuro
  // en UTC. Sin el margen, el build fallaría dos horas cada noche.
  it("tiene una fecha de verificación válida y no futura", () => {
    const UN_DIA = 24 * 60 * 60 * 1000;
    expect(VERIFICADO_EL).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(VERIFICADO_EL).getTime()).not.toBeNaN();
    expect(new Date(VERIFICADO_EL).getTime()).toBeLessThanOrEqual(Date.now() + UN_DIA);
  });

  // Los alias se comparan contra texto normalizado; uno con tilde o mayúscula
  // no coincidiría nunca y la comunidad quedaría invisible sin que falle nada.
  it("tiene todos los alias normalizados", () => {
    for (const comunidad of COMUNIDADES.values()) {
      for (const alias of comunidad.alias) {
        expect(alias, `${comunidad.nombre}: "${alias}"`).toBe(
          alias.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase(),
        );
      }
    }
  });
});

describe("gobiernoDeDisposicion", () => {
  // Sin nombrar partidos: quién gobierne Cataluña es cosa de las urnas, que
  // la vista llegue entera y coherente es cosa de este código.
  it("devuelve la vista completa lista para servir", () => {
    const vista = gobiernoDeDisposicion("COMUNIDAD AUTÓNOMA DE CATALUÑA");

    expect(vista).toMatchObject({ codigo: "CT", nombre: "Cataluña" });
    expect(vista?.etiqueta).toBe(vista?.partidos.join("+"));
    expect(vista?.presidente).not.toBe("");
    expect(vista?.verificadoEl).toBe(VERIFICADO_EL);
  });

  // Antes esto devolvía null y media portada salía sin decir de quién venía.
  // Una orden ministerial la firma el Gobierno de España; eso no es una
  // suposición, es lo que significa que el departamento sea un ministerio.
  it("cae al Gobierno de España cuando no hay comunidad", () => {
    const vista = gobiernoDeDisposicion("MINISTERIO DE TRABAJO Y ECONOMÍA SOCIAL");

    expect(vista).toMatchObject({ codigo: "ES", ambito: "estatal" });
    expect(vista.etiqueta).toBe(vista.partidos.join("+"));
    expect(vista.partidos.length).toBeGreaterThan(0);
  });

  // El caso que antes se quedaba mudo: una norma estatal que cita a varias
  // comunidades no es de ninguna de ellas, es del Estado.
  it("cae al Estado también cuando el título nombra a varias comunidades", () => {
    expect(
      gobiernoDeDisposicion(
        "MINISTERIO DE HACIENDA",
        "Resolución sobre el reparto de fondos entre Galicia, Asturias y Cantabria",
      ).codigo,
    ).toBe("ES");
  });

  it("lo autonómico sigue ganando al Estado", () => {
    expect(gobiernoDeDisposicion("COMUNIDAD AUTÓNOMA DE ARAGÓN")).toMatchObject({
      codigo: "AR",
      ambito: "autonomico",
    });
  });
});
