import Link from 'next/link';

export default function NotFound() {
  return <main className="section"><div className="wrap" style={{ maxWidth: 720 }}><span className="eyebrow" style={{ color: 'var(--accent)' }}>Página no encontrada</span><h1 className="page-title">No encontramos esa página.</h1><p className="muted">Puede que el enlace haya cambiado o que el vehículo ya no esté publicado.</p><div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}><Link className="button" href="/autos">Ver vehículos</Link><Link className="button secondary" href="/">Ir al inicio</Link></div></div></main>;
}
