import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: '3020 Automotores | Encontrá tu próximo vehículo', template: '%s | 3020 Automotores' },
  description: 'Conocé el catálogo de 3020 Automotores y consultá por tu próximo vehículo.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR"><body><header className="site-header"><a className="brand" href="/" aria-label="3020 Automotores, inicio"><img className="brand-logo" src="https://raw.githubusercontent.com/pereyradiego8/3020automotores/main/wp-content/uploads/2020/01/aut3020-blanco.png" alt="3020 Automotores" /></a><nav><a href="/autos">Vehículos</a><a href="/#contacto">Contacto</a></nav></header>{children}<footer className="site-footer"><div><strong>3020 Automotores</strong><p>Te acompañamos a encontrar tu próximo vehículo.</p></div><p>La disponibilidad y los valores se confirman con el equipo comercial.</p></footer></body></html>;
}
