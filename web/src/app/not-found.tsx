import Link from 'next/link';
import PageHero from '@/components/PageHero';

export default function NotFound() {
  return (
    <main>
      <PageHero compact eyebrow="Página no encontrada" title="No encontramos esa página."
        description="Puede que el enlace haya cambiado o que el vehículo ya no esté publicado." />
      <section className="section">
        <div className="wrap">
          <div className="action-row">
            <Link className="button" href="/autos">Ver vehículos</Link>
            <Link className="button secondary" href="/">Ir al inicio</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
