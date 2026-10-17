# 3020 Automotores — aplicación web

Aplicación independiente de WordPress, construida con Next.js, TypeScript y Supabase. La rama `main` está conectada al despliegue de producción en Vercel.

## Funciones implementadas

- Inicio comercial adaptable a móvil y catálogo público con búsqueda por marca/modelo/año/combustible/transmisión, filtros combinables y ordenamiento.
- Fichas públicas dinámicas: solo muestran vehículos cuyo estado sea `published`, con galería de fotos y metadatos para compartir.
- Acceso privado para el personal con Supabase Auth y lista de administradores autorizados.
- Alta de vehículos como borrador, edición de datos y estados borrador/publicado/reservado/vendido.
- Carga de hasta 12 imágenes por vehículo desde el panel, validación de tipo/tamaño, orden de foto principal, eliminación y limpieza de cargas incompletas.
- Políticas RLS para limitar el acceso y la escritura del inventario y Storage.
- Inventario histórico separado para revisión; no se publica automáticamente.
- Páginas de error, no encontrado y carga; endpoint liviano `GET /api/health` para comprobaciones del hosting; chequeo de TypeScript y compilación en CI.

## Ejecutar localmente

Requiere Node.js 20.9 o superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrí http://localhost:3000. Para que funcionen el inicio de sesión, el inventario y la carga de imágenes, completá las variables de entorno con los datos del proyecto Supabase.

## Configuración para preparar otro entorno

1. El proyecto Supabase `3020-automotores` está en la región de São Paulo. Para preparar otra base, revisá y aplicá en orden las migraciones de `supabase/migrations/`: `202610100001_inventory.sql`, `202610100002_import_historical_vehicle_drafts.sql`, `202610100003_import_additional_vehicle_drafts.sql`, `202610100004_harden_inventory_admin_function.sql` y `202610120001_vehicle_trade_in_and_features.sql`. Las migraciones de importación cargan fichas históricas como borradores; no se publican automáticamente.
2. Crear cuentas del personal en Supabase Auth y desactivar el registro público.
3. Autorizar cada cuenta insertando su UUID en `public.admin_users`; ver [la guía de Supabase](supabase/README.md).
4. Configurar las variables de entorno y verificar que las políticas RLS y Storage estén activas.
5. Revisar manualmente vehículos, precios, teléfonos, fotos y datos comerciales. No usar datos históricos como stock actual sin confirmación.
6. Ejecutar `npm run typecheck`, `npm run build` y pruebas de navegación con la configuración real.
7. Configurar `NEXT_PUBLIC_SITE_URL` con la URL pública canónica aprobada; esto habilita el sitemap y su referencia desde `robots.txt`.
8. Antes de promover cambios de inventario o de configuración, comprobar el estado del despliegue y revisar que los datos comerciales sean correctos.

Sin credenciales de Supabase, el catálogo queda vacío intencionalmente.

## SEO técnico

La aplicación incluye `sitemap.xml` con el inicio, el catálogo y las fichas publicadas, y `robots.txt` que permite indexar las páginas públicas y excluye `/admin`. Ambos usan `NEXT_PUBLIC_SITE_URL`; configurala en el entorno de despliegue con la URL canónica aprobada, no con una URL temporal.

## Contacto y consultas comerciales

El número oficial de WhatsApp está centralizado en `src/lib/contact.ts`. Se usa en la navegación, la portada, la página de contacto, las fichas de vehículos y el botón flotante móvil. Las consultas de disponibilidad, permuta y financiación son preguntas, no condiciones comerciales garantizadas.

El concesionario gestiona directamente las fotografías y los precios de permuta desde el administrador. Esta mejora no modifica fotografías ni inventario.

## SEO de vehículos

Las fichas publicadas exponen datos estructurados `Car` y, si hay precio numérico confiable, `Offer` con la moneda original ARS o USD. El kilometraje se publica en el schema solo si es interpretable. El sitemap incluye las fichas publicadas y sus fechas reales de actualización; no se indexan las vistas previas privadas.

Las URLs antiguas correspondientes a vehículos retirados o renombrados se redirigen al catálogo o a una ficha equivalente **solo cuando es el mismo modelo**. No se redirige automáticamente un vehículo a una versión o transmisión distinta.

## Medición gratuita (opcional)

Para medir **visitas y clics a WhatsApp sin pagar Vercel Pro**, podés configurar Google Analytics 4:

1. Crear una propiedad web gratuita en Google Analytics y obtener un ID de medición del formato `G-XXXXXXXXXX`.
2. Configurar `NEXT_PUBLIC_GA_MEASUREMENT_ID` en Vercel para **Production** y, si hace falta, **Preview**. No inventar ni copiar IDs de otros sitios.
3. Volver a desplegar para incorporar el valor al JavaScript del cliente.
4. El sitio solicita permiso explícito antes de cargar Google Analytics. Si el visitante lo rechaza, no se carga ese script.
5. Los clics generan el evento `contact_click` con `placement`, `intent`, `channel` y opcionalmente `vehicle_slug` público. **No se envían nombres, teléfonos ni documentos de compradores.** Las vistas de eventos y sus parámetros deben configurarse dentro de GA4 para crear reportes.

La medición **no se activa** si no se define `NEXT_PUBLIC_GA_MEASUREMENT_ID`. Vercel Web Analytics básico también sirve para visitas, pero los eventos personalizados en Vercel requieren Pro: por eso esta implementación no depende de eventos pagos.

## Administración y privacidad

- Los borradores pueden abrirse en `/admin/previsualizar/[id]`, protegida con autenticación y permisos de inventario. Esa vista **no publica** el vehículo.
- El inventario informa qué datos mínimos faltan para publicar; utiliza la misma política que la acción de publicación.
- Los enlaces a documentos privados de venta se crean **a pedido** del administrador y expiran en aproximadamente 5 minutos. No se generan cientos de enlaces al cargar el listado.
- Las escrituras de venta transaccionales del PR #53 están **pendientes de pruebas en una base de datos aislada**; no instalar la migración SQL en producción sin validación.

## Pruebas visuales responsive

El workflow manual `.github/workflows/visual-responsive.yml` inicia una copia local sin credenciales, visita páginas públicas a 320, 390, 768 y 1440 píxeles, revisa desbordes horizontales y tamaños de títulos, y guarda capturas como artefactos por siete días. Se ejecuta desde **GitHub Actions → Visual responsive (manual, no buyer data) → Run workflow** cuando el archivo exista en la rama elegida. Usa minutos de GitHub Actions; no toca inventario ni compradores.
