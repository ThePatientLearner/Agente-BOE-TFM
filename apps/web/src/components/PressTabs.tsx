"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

const tabs = [
  { id: "espana", label: "España" },
  { id: "internacional", label: "Internacional" },
] as const;

/** Los paneles llegan renderizados del servidor: cambiar de pestaña no
 * descarga titulares ni interrumpe la lectura con una pantalla de carga. */
export function PressTabs({ spain, international }: { spain: ReactNode; international: ReactNode }) {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    buttons.current[next]?.focus();
  }

  return (
    <>
      <div className="press-tabs" role="tablist" aria-label="Ámbito de las noticias">
        {tabs.map((tab, index) => (
          <button key={tab.id} ref={(element) => { buttons.current[index] = element; }}
            type="button" role="tab" id={`press-tab-${tab.id}`} aria-controls={`press-panel-${tab.id}`}
            aria-selected={selected === index} tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)} onKeyDown={(event) => onKeyDown(event, index)}>
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, index) => (
        <div key={tab.id} className="press-panel" role="tabpanel" id={`press-panel-${tab.id}`}
          aria-labelledby={`press-tab-${tab.id}`} hidden={selected !== index} tabIndex={0}>
          {index === 0 ? spain : international}
        </div>
      ))}
    </>
  );
}
