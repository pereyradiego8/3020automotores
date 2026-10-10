import Link from 'next/link';

export const metadata = {
  title: 'Marcas',
  description: 'Explorá marcas de vehículos y consultá por las unidades publicadas por 3020 Automotores.',
};

const brands = [
  'Audi','Chevrolet','Citroën','DS','Dodge','Fiat','Ford','Hyundai','Jeep',
  'Jetour','Kia','Nissan','Peugeot','Renault','Suzuki','Toyota','Volkswagen',
];

export default function MarcasPage() {
  return <main>
    <section className="page-hero"><div className="wrap"><span className="eyebrow">Encontrá tu próximo auto</span><h1 className="page-title">Marcas para explorar.</h1><p>Buscá entre las marcas que formaron parte de nuestro catálogo. La disponibilidad actual depende de las unidades publicadas por el equipo.</p></div></section>
    <section className="section"><div className="wrap"><div className="brand-grid">
      {brands.map((brand)=><Link className="brand-tile" href={`/autos?marca=${encodeURIComponent(brand)}`} key={brand}><span>{brand}</span><span aria-hidden="true">↗</span></Link>)}
    </div><p className="muted brand-note">No todas las marcas tienen unidades disponibles en todo momento. Consultá el catálogo actualizado.</p><Link className="button" href="/autos">Ver todos los vehículos</Link></div></section>
  </main>;
}
