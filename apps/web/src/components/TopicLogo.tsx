export type Topic = 'subvenciones' | 'pensiones' | 'quien-paga';

/** Identidad compartida por los accesos a cada radiografía. El texto del enlace da el nombre. */
export function TopicLogo({ topic }: { topic: Topic }) {
  return <span className={`topic-logo topic-logo-${topic}`} aria-hidden="true">
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
      {topic === 'subvenciones' && <>
        <g className="topic-logo-detail">
          <circle cx="25" cy="15" r="9" fill="currentColor" fillOpacity=".07" />
          <path d="M28 10.5a5 5 0 1 0 0 9M19 13.5h7M19 16.5h6" />
        </g>
        <path d="m7 33 6-6h8c3 0 4 2 4 4H15m10 0 10-4c3-1 5 2 3 4L26 40H14l-7-4M4 30l7 8-4 5-6-8" />
      </>}
      {topic === 'pensiones' && <>
        <g className="topic-logo-detail">
          <circle cx="24" cy="8" r="5" fill="currentColor" fillOpacity=".07" />
          <path d="M24 5v6M22 6.5h3a1.5 1.5 0 0 1 0 3h-3" />
        </g>
        <path d="M18 19h10M10 24c-3-1-4 1-3 3m4-5c3-5 10-7 17-5l7-4v8l4 4h4v10h-6l-4 7h-5v-5H19v5h-5l-3-9a12 12 0 0 1 0-11Z" fill="currentColor" fillOpacity=".04" />
        <circle cx="33" cy="25" r="1.3" fill="currentColor" stroke="none" />
      </>}
      {topic === 'quien-paga' && <>
        <path d="M7 20v-5a4 4 0 0 1 4-4h18M7 20h30a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4V20Z" fill="currentColor" fillOpacity=".04" />
        <g className="topic-logo-detail">
          <path d="M17 20V5l3 2 3-2 3 2 3-2 3 2v13M22 12h5M22 16h3" />
        </g>
        <path d="M41 28h-9a4 4 0 0 0 0 8h9" />
        <circle cx="33" cy="32" r="1.2" fill="currentColor" stroke="none" />
      </>}
    </svg>
  </span>;
}
