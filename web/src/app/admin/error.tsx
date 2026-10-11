'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error en el panel de administración:', error);
  }, [error]);

  return (
    <main className="section">
      <div className="wrap">
        <div className="notice" role="alert">
          <h1 className="page-title">No pudimos completar la operación</h1>
          <p>Puede ser un problema temporal de conexión o permisos. Tus cambios podrían no haberse guardado; verificá el estado antes de repetir la acción.</p>
          {error.digest && <p className="muted">Referencia del error: {error.digest}</p>}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
            <button className="button" onClick={() => reset()}>Reintentar</button>
            <Link className="button secondary" href="/admin">Volver al inventario</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
