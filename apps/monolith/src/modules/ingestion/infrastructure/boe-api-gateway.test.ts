/**
 * El sumario del BOE anida los ítems de forma distinta según el día.
 * Estos tests fijan las formas vistas en sumarios reales y comprueban
 * que el walker genérico no se deja ninguna BOE-A-… con título.
 *
 * Incidentes reales:
 *   2026-08-07 — `departamento → texto → epigrafe → item` (3 leyes Canarias)
 *   2026-08-09 — `seccion → texto → departamento → …` (orden Interior)
 * En ambos casos la ingesta terminó con "0 nuevas, 0 errores" y se
 * perdieron normas en silencio. El assert de integridad del gateway
 * debe impedir que vuelva a pasar.
 */
import { describe, expect, it } from "vitest";
import {
  collectRawBoeAIdsForTest,
  parseSummaryItemsForTest,
} from "./boe-api-gateway.js";

function sumario(departamento: unknown) {
  return {
    data: {
      sumario: {
        diario: {
          seccion: { codigo: "1", nombre: "I. Disposiciones generales", departamento },
        },
      },
    },
  };
}

const item = (id: string, title = `Título de ${id}`) => ({
  identificador: id,
  titulo: title,
  url_html: `https://www.boe.es/diario_boe/txt.php?id=${id}`,
  url_pdf: { texto: `https://www.boe.es/boe/dias/2026/08/07/pdfs/${id}.pdf` },
  url_xml: `https://www.boe.es/diario_boe/xml.php?id=${id}`,
});

describe("parseSummaryItems · formas de anidamiento del sumario", () => {
  it("departamento → item (una sola norma, sin epígrafe)", () => {
    const items = parseSummaryItemsForTest(
      sumario({ nombre: "MINISTERIO DE HACIENDA", codigo: "1000", item: item("BOE-A-2026-00001") }),
    );

    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("BOE-A-2026-00001");
    expect(items[0]?.section).toBe("1");
    expect(items[0]?.department).toBe("MINISTERIO DE HACIENDA");
  });

  it("departamento → epigrafe → item (la forma habitual)", () => {
    const items = parseSummaryItemsForTest(
      sumario({
        nombre: "MINISTERIO DE HACIENDA",
        codigo: "1000",
        epigrafe: { nombre: "Tabaco", item: item("BOE-A-2026-00002") },
      }),
    );

    expect(items.map((i) => i.id)).toEqual(["BOE-A-2026-00002"]);
    expect(items[0]?.department).toBe("MINISTERIO DE HACIENDA");
  });

  it("departamento → texto → epigrafe → item (BOE del 2026-08-07)", () => {
    const items = parseSummaryItemsForTest(
      sumario({
        nombre: "COMUNIDAD AUTÓNOMA DE CANARIAS",
        codigo: "9000",
        texto: {
          epigrafe: [
            { nombre: "Turismo", item: item("BOE-A-2026-17187") },
            { nombre: "Himno de Canarias", item: item("BOE-A-2026-17188") },
            { nombre: "Cabildos insulares", item: item("BOE-A-2026-17189") },
          ],
        },
      }),
    );

    expect(items.map((i) => i.id)).toEqual([
      "BOE-A-2026-17187",
      "BOE-A-2026-17188",
      "BOE-A-2026-17189",
    ]);
    expect(items[0]?.department).toBe("COMUNIDAD AUTÓNOMA DE CANARIAS");
  });

  it("varios departamentos con formas distintas en el mismo día", () => {
    const items = parseSummaryItemsForTest(
      sumario([
        { nombre: "A", codigo: "1", epigrafe: { item: item("BOE-A-2026-00010") } },
        {
          nombre: "B",
          codigo: "2",
          texto: { epigrafe: { item: item("BOE-A-2026-00011") } },
        },
        { nombre: "C", codigo: "3", item: item("BOE-A-2026-00012") },
      ]),
    );

    expect(items.map((i) => i.id).sort()).toEqual([
      "BOE-A-2026-00010",
      "BOE-A-2026-00011",
      "BOE-A-2026-00012",
    ]);
  });

  it("descarta ítems sin identificador válido en lugar de reventar", () => {
    const items = parseSummaryItemsForTest(
      sumario({
        nombre: "A",
        codigo: "1",
        epigrafe: { item: [{ titulo: "sin identificador" }] },
      }),
    );

    expect(items).toHaveLength(0);
  });

  it("seccion → texto → departamento → texto → epigrafe → item (BOE del 2026-08-09)", () => {
    const body = {
      data: {
        sumario: {
          diario: {
            seccion: {
              codigo: "1",
              nombre: "I. Disposiciones generales",
              texto: {
                departamento: {
                  codigo: "7320",
                  nombre: "MINISTERIO DEL INTERIOR",
                  texto: {
                    epigrafe: {
                      nombre: "Controles fronterizos",
                      item: item("BOE-A-2026-17375"),
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const items = parseSummaryItemsForTest(body);
    expect(items).toHaveLength(1);
    expect(items[0]?.id).toBe("BOE-A-2026-17375");
    expect(items[0]?.section).toBe("1");
    expect(items[0]?.department).toBe("MINISTERIO DEL INTERIOR");
  });

  it("item como array bajo epígrafe (forma habitual con varias normas)", () => {
    const items = parseSummaryItemsForTest(
      sumario({
        nombre: "MINISTERIO DE TRABAJO",
        codigo: "5000",
        epigrafe: {
          nombre: "Varias",
          item: [item("BOE-A-2026-00100"), item("BOE-A-2026-00101")],
        },
      }),
    );
    expect(items.map((i) => i.id).sort()).toEqual(["BOE-A-2026-00100", "BOE-A-2026-00101"]);
  });

  it("seccion 2A + anidamiento profundo arbitrario de texto", () => {
    const body = {
      data: {
        sumario: {
          diario: {
            seccion: {
              codigo: "2A",
              nombre: "II. Autoridades y personal",
              texto: {
                texto: {
                  departamento: {
                    codigo: "9999",
                    nombre: "ADMINISTRACIÓN LOCAL",
                    texto: {
                      texto: {
                        epigrafe: {
                          item: item("BOE-A-2026-00999"),
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };
    const items = parseSummaryItemsForTest(body);
    expect(items).toHaveLength(1);
    expect(items[0]?.section).toBe("2A");
    expect(items[0]?.department).toBe("ADMINISTRACIÓN LOCAL");
    expect(items[0]?.id).toBe("BOE-A-2026-00999");
  });

  it("ignora el identificador BOE-S- del PDF del diario (no es una disposición)", () => {
    const body = {
      data: {
        sumario: {
          diario: {
            numero: "194",
            sumario_diario: {
              identificador: "BOE-S-2026-194",
              url_pdf: { texto: "https://www.boe.es/…" },
            },
            seccion: {
              codigo: "1",
              nombre: "I. Disposiciones generales",
              departamento: {
                codigo: "1",
                nombre: "MINISTERIO X",
                item: item("BOE-A-2026-00050"),
              },
            },
          },
        },
      },
    };
    const items = parseSummaryItemsForTest(body);
    expect(items.map((i) => i.id)).toEqual(["BOE-A-2026-00050"]);
  });

  it("no pierde ninguna BOE-A-… con título: raw count === parsed count", () => {
    const body = {
      data: {
        sumario: {
          diario: {
            seccion: [
              {
                codigo: "1",
                nombre: "I",
                texto: {
                  departamento: {
                    codigo: "1",
                    nombre: "DEPT A",
                    texto: { epigrafe: { item: item("BOE-A-2026-10001") } },
                  },
                },
              },
              {
                codigo: "3",
                nombre: "III",
                departamento: {
                  codigo: "2",
                  nombre: "DEPT B",
                  epigrafe: {
                    item: [item("BOE-A-2026-10002"), item("BOE-A-2026-10003")],
                  },
                },
              },
            ],
          },
        },
      },
    };
    const parsed = parseSummaryItemsForTest(body);
    const raw = collectRawBoeAIdsForTest(body);
    expect(parsed.map((i) => i.id).sort()).toEqual(raw.sort());
    expect(parsed).toHaveLength(3);
  });
});
