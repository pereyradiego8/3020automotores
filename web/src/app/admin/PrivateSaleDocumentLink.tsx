'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type SignedAccess = { url: string; expiresAt: number };

/** El documento no obtiene ningún enlace firmado hasta que el admin lo pide. */
export default function PrivateSaleDocumentLink({ path, number }: { path: string; number: number }) {
  const [signed, setSigned] = useState<SignedAccess | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function createLink() {
    if (busy) return;
    setBusy(true);
    setSigned(null);
    setError('');
    try {
      const supabase = createClient();
      const { data, error: signError } = await supabase.storage
        .from('vehicle-sale-documents')
        .createSignedUrl(path, 300);
      if (signError || !data?.signedUrl) throw new Error('No se pudo generar el enlace.');
      setSigned({ url: data.signedUrl, expiresAt: Date.now() + 4 * 60_000 });
    } catch {
      setError('No se pudo generar un acceso seguro. Verificá tu sesión y permisos.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="private-document-control">
    <button type="button" className="text-link private-document-trigger"
      disabled={busy} onClick={() => void createLink()}>
      {busy ? 'Generando acceso…' : `Generar acceso al archivo ${number}`}
    </button>
    {signed && <a className="text-link" href={signed.url} target="_blank" rel="noopener noreferrer"
      onClick={(event) => {
        if (Date.now() > signed.expiresAt) {
          event.preventDefault();
          setSigned(null);
          setError('El enlace venció. Generá uno nuevo.');
        }
      }}>Abrir archivo {number} ↗</a>}
    {error && <span className="muted" role="alert">{error}</span>}
  </div>;
}
