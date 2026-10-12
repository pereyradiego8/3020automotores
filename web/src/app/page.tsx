import Link from 'next/link';
import { getPublishedVehicles } from '@/lib/inventory';
import { getWhatsAppUrl } from '@/lib/contact';

const googleReviews = [
  {
    author: 'Alejandro Santos',
    text: 'Muy buena atención al cliente y precios acordes a los productos',
    date: '6 de septiembre de 2025',
    rating: 5,
  },
  {
    author: 'Eduardo',
    text: 'La mejor consecionaria\nEn 20 días me dieron un polo track 0km\nCumplieron con todo en tiempo y forma',
    date: '22 de julio de 2025',
    rating: 5,
  },
  {
    author: 'Bianca Almaraz',
    text: 'Excelente experiencia con este consecionario multimarca. Mí familia y yo somos de San Miguel. La entrega del vehículo fue en un plazo mucho más corto que en otros lugares que habíamos averiguado. La atención buenísima, un ambiente de trabajo muy ameno y confiable. Más que agradecida con 3020 Automotores. Nos cumplieron un sueño, sin dudas. ❤️',
    date: '17 de julio de 2025',
    rating: 5,
  },
  {
    author: 'Monica Fernandez',
    text: 'Execelente trato ,súper confiables , cumplen con los tiempos cortisimos de entrega .\nExcelente trabajadores , super responsables .\nConocimos al Dueño ,el señor Luis , amable, sincero ,sencillo,amigable,\nGracias por todo Luis ,Gracias 3020 Automotores , Por Cumplir el sueño de nuestra Familia .saludos hasta pronto .\nSuper Recomendable😊🚘',
    date: '17 de julio de 2025',
    rating: 5,
  },
  {
    author: 'horacio almaraz',
    text: 'Excelente atención, entrega en los plazos establecidos y sobre todo de confianza.\nEl señor Luis el dueño muy amable. Los chicos muy respetuosos y amables.\nMuy recomendables.',
    date: '17 de julio de 2025',
    rating: 5,
  },
];

export default async function HomePage() {
  const vehicles=await getPublishedVehicles();
  const whatsappUrl=getWhatsAppUrl();
  return <main><section className="hero"><div className="wrap"><span className="eyebrow">3020 Automotores</span><h1>Encontrá el vehículo que va con vos.</h1><p>Conocé las opciones publicadas, compará modelos y hablá directamente con nuestro equipo.</p><Link className="button" href="/autos">Explorar vehículos</Link></div></section><section className="section"><div className="wrap"><div className="section-head"><div><span className="eyebrow" style={{color:'var(--accent)'}}>Nuestro catálogo</span><h2>{vehicles.length?'Vehículos para conocer':'Estamos preparando el catálogo'}</h2><p className="muted">Solo mostramos unidades que el equipo haya publicado y confirmado.</p></div><Link className="text-link" href="/autos">Ver catálogo →</Link></div>{vehicles.length?<div className="grid">{vehicles.slice(0,3).map(v=><article className="vehicle-card" key={v.id}><Link href={'/autos/'+v.slug}>{v.image_urls?.[0]?<img className="vehicle-image" src={v.image_urls[0]} alt={v.title} loading="lazy"/>:<div className="vehicle-image" style={{display:'grid',placeItems:'center',color:'var(--muted)'}}>3020 Automotores</div>}<div className="vehicle-body"><span className="tag">Consultar disponibilidad</span><h3>{v.title}</h3><div className="specs"><span>{v.year}</span><span>{v.body_type||'Consultar'}</span><span>{v.mileage_text||'Kilometraje a consultar'}</span></div>{v.price_text&&<p><strong>{v.price_text}</strong></p>}<span className="text-link">Ver ficha →</span></div></Link></article>)}</div>:<div className="empty"><p>Estamos verificando y cargando el inventario actualizado. Mientras tanto, contactanos para consultar por un modelo.</p><Link className="button" href="/#contacto">Hablar con el equipo</Link></div>}</div></section><section className="section reviews-section" id="resenas"><div className="wrap"><div className="section-head"><div><span className="eyebrow" style={{color:'var(--accent)'}}>Opiniones de clientes</span><h2>La experiencia de quienes nos eligieron</h2><p className="muted">Reseñas publicadas originalmente en Google.</p></div><a className="text-link" href="https://www.google.com/maps/search/?api=1&query=3020+Automotores+Berazategui" target="_blank" rel="noreferrer">Ver en Google ↗</a></div><div className="reviews-summary"><div className="google-mark" aria-label="Google">Google</div><div><div className="review-stars" aria-label="5 estrellas">★★★★★</div><strong>223 reseñas en la captura histórica</strong><p className="muted">El sitio original mostraba este total cuando se guardó la página.</p></div></div><div className="reviews-grid">{googleReviews.map((review) => <article className="review-card" key={review.author}><div className="review-card-top"><span className="review-avatar" aria-hidden="true">{review.author.charAt(0)}</span><div><strong>{review.author}</strong><span className="review-source">Google · {review.date}</span></div><span className="review-stars" aria-label={`${review.rating} de 5 estrellas`}>{"★".repeat(review.rating)}</span></div><p style={{whiteSpace:"pre-line"}}>“{review.text}”</p></article>)}</div><p className="reviews-disclaimer">Estas cinco reseñas se recuperaron del HTML archivado del sitio original. En esa captura el widget indicaba 223 reseñas en total, pero el archivo guardado solo conserva estas cinco. No se actualizan automáticamente y las opiniones pueden haber cambiado desde entonces.</p></div></section><section className="section" id="contacto" style={{background:'var(--paper)'}}><div className="wrap contact"><span className="eyebrow" style={{color:'var(--accent)'}}>Hablemos</span><h2>¿Buscás un vehículo en particular?</h2><p className="muted">Consultanos por disponibilidad, precios y condiciones actuales.</p>{whatsappUrl?<a className="button" href={whatsappUrl} target="_blank" rel="noreferrer">Consultar por WhatsApp</a>:<p className="notice">El canal de WhatsApp estará disponible cuando se configure el número oficial de contacto.</p>}</div></section></main>;
}
