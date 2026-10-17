import PageHero from '@/components/PageHero';

export const metadata = {
  title: 'Privacidad y estadísticas',
  description: 'Información sobre las estadísticas opcionales y los enlaces externos de 3020 Automotores.',
  alternates: { canonical: '/privacidad' },
};

export default function PrivacyPage() {
  return <main>
    <PageHero compact eyebrow="Información del sitio" title="Privacidad y estadísticas"
      description="Cómo funcionan las consultas de contacto y la medición opcional de visitas." />
    <section className="section">
      <div className="wrap content-narrow">
        <h2>Consultas y enlaces externos</h2>
        <p>Las consultas comerciales se realizan mediante WhatsApp, que abre un servicio externo. Evitá enviar documentación o información sensible si no verificaste primero que estás conversando con el concesionario.</p>
        <h2>Estadísticas opcionales</h2>
        <p>Solo si aceptás, el sitio puede cargar Google Analytics 4 para medir visitas y clics de contacto. Los eventos de contacto incluyen la sección del sitio y, cuando corresponda, el identificador público del vehículo, pero no nombres ni datos de compradores.</p>
        <p>Podés retirar el consentimiento borrando la preferencia del sitio desde la configuración de tu navegador y rechazando las estadísticas cuando se vuelva a consultar.</p>
        <h2>Recursos del sitio</h2>
        <p>Las fichas públicas se consultan en Supabase, algunas imágenes se sirven desde GitHub y la ubicación se muestra mediante Google Maps. Cada servicio puede aplicar su propia política de privacidad.</p>
        <p>Para consultas sobre esta información podés escribir a <a className="text-link" href="mailto:automotores3020@hotmail.com">automotores3020@hotmail.com</a>.</p>
      </div>
    </section>
  </main>;
}
