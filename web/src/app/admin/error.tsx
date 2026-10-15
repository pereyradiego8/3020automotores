'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import PageHero from '@/components/PageHero';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error en el panel de administración:', error.digest || 'sin referencia');
  }, [error.digest]);

  return (
    <main>
      <PageHero compact eyebrow="Panel de administración" title="No pudimos completar la operación"
        description="Puede ser un problema temporal de conexión o permisos. Verificá el estado antes de repetir la acción." />
      <section className="section admin-section">
        <div className="wrap">
          <div className="notice" role="alert">
            Tus cambios podrían no haberse guardado. Comprobá el estado del vehículo antes de intentarlo nuevamente.
            {error.digest && <p className="muted">Referencia del error: {error.digest}</p>}
          </div>
          <div className="action-row">
            <button className="button" type="button" onClick={() => reset()}>Reintentar</button>
            <Link className="button secondary" href="/admin">Volver al inventario</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
