'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Application route error', error.digest || 'no digest'); }, [error.digest]);
  return (
    <main>
      <PageHero compact eyebrow="Ocurrió un inconveniente" title="No pudimos cargar esta página."
        description="Probá nuevamente. Si el problema continúa, podés volver al catálogo o al inicio." />
      <section className="section">
        <div className="wrap">
          <div className="action-row">
            <button className="button" type="button" onClick={() => reset()}>Reintentar</button>
            <Link className="button secondary" href="/autos">Ver vehículos</Link>
            <Link className="text-link" href="/">Volver al inicio →</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
