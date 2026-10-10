'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Application route error', error.digest || 'no digest'); }, [error.digest]);
  return <main className="section"><div className="wrap" style={{ maxWidth: 720 }}><span className="eyebrow" style={{ color: 'var(--accent)' }}>Ocurrió un inconveniente</span><h1 className="page-title">No pudimos cargar esta página.</h1><p className="muted">Probá nuevamente. Si el problema continúa, podés volver al catálogo o al inicio.</p><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><button className="button" type="button" onClick={() => reset()}>Reintentar</button><a className="button secondary" href="/autos">Ver vehículos</a></div></div></main>;
}
