'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function VehicleGallery({ title, imageUrls }: { title: string; imageUrls: string[] }) {
  const [active, setActive] = useState(0);
  if (!imageUrls.length) return <div className="detail-image" style={{ display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>3020 Automotores</div>;
  const current = imageUrls[active] || imageUrls[0];
  return <div>
    <Image className="detail-image" src={current} alt={`${title} — foto ${active + 1} de ${imageUrls.length}`} width={1280} height={800} sizes="(max-width: 760px) 100vw, 55vw" priority={active === 0} quality={82} />
    {imageUrls.length > 1 && <div aria-label="Fotos del vehículo" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(76px,1fr))', gap: 8, marginTop: 10 }}>
      {imageUrls.map((url, index) => <button key={url} type="button" onClick={() => setActive(index)} aria-label={`Ver foto ${index + 1}`} aria-pressed={active === index} style={{ padding: 0, border: active === index ? '2px solid var(--accent)' : '2px solid transparent', borderRadius: 5, overflow: 'hidden', background: 'var(--paper)', cursor: 'pointer' }}>
        <Image src={url} alt="" width={160} height={100} sizes="80px" quality={70} style={{ display: 'block', width: '100%', height: 58, objectFit: 'cover' }} />
      </button>)}
    </div>}
    {imageUrls.length > 1 && <p className="muted" style={{ fontSize: 12 }} aria-live="polite">Foto {active + 1} de {imageUrls.length}</p>}
  </div>;
}
