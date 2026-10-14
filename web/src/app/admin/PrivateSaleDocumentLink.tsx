'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SignedDocument = { url: string; expiresAt: number };

/** Private links are created only when an authorized staff member asks for one. */
export default function PrivateSaleDocumentLink({ path, number }: { path: string; number: number }) {
  const [signed, setSigned] = useState<SignedDocument | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function generateLink() {
    if (busy) return;
    setBusy(true);
    setError('');
    setSigned(null);
    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.storage
        .from('vehicle-sale-documents')
        .createSignedUrl(path, 300);
      if (signError || !data?.signedUrl) {
        throw new Error('No se pudo generar el enlace. Volvé a iniciar sesión si el problema continúa.');
      }
      // Slightly shorter than the Storage expiration to avoid opening stale URLs.
      setSigned({ url: data.signedUrl, expiresAt: Date.now() + 4 * 60 * 1000 });
    } catch {
      setError('No se pudo generar un acceso seguro. Verificá tu sesión y los permisos.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <button type="button" className="text-link" disabled={busy} onClick={() => void generateLink()}
        style={{ border: 0, background: 'none', padding: 0, textAlign: 'left', cursor: busy ? 'wait' : 'pointer' }}>
        {busy ? 'Generando acceso…' : `Generar acceso al archivo ${number}`}
      </button>
      {signed && (
        <a className="text-link" href={signed.url} target="_blank" rel="noopener noreferrer"
          onClick={(event) => {
            if (Date.now() > signed.expiresAt) {
              event.preventDefault();
              setSigned(null);
              setError('El enlace venció. Generá un acceso nuevo.');
            }
          }}>
          Abrir archivo {number} (acceso temporal) ↗
        </a>
      )}
      {error && <span role="alert" className="muted" style={{ fontSize: 12 }}>{error}</span>}
    </div>
  );
}
