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

Sin credenciales de Supabase, la compilación sigue funcionando, pero las solicitudes del inventario muestran un aviso de indisponibilidad; esto evita confundir problemas de conexión con falta de vehículos.

### Operaciones de ventas atómicas (cambio pendiente de aprobación)

La migración `20261014160000_atomic_vehicle_sales.sql` agrega una función RPC transaccional para registrar ventas y cambiar estados conjuntamente. También crea una cola privada que permite reintentar la eliminación de documentación en Storage después de que la transacción se haya confirmado.

**No aplicar esta migración directamente a producción mientras el PR esté en revisión.** Antes de integrar, probar en una base aislada un registro de venta, una reversión, un fallo inducido y el reintento de limpieza. Cuando se apruebe, coordinar la publicación de la migración y el nuevo código: la versión modificada del panel exige las funciones SQL nuevas y no usa el flujo anterior como alternativa.

## SEO técnico

La aplicación incluye `sitemap.xml` con el inicio, el catálogo y las fichas publicadas, y `robots.txt` que permite indexar las páginas públicas y excluye `/admin`. Ambos usan `NEXT_PUBLIC_SITE_URL`; configurala en el entorno de despliegue con la URL canónica aprobada, no con una URL temporal.

## Contacto de WhatsApp

El número oficial está definido en `src/lib/contact.ts` y se utiliza en los enlaces de WhatsApp del sitio. No se configura mediante `NEXT_PUBLIC_WHATSAPP_NUMBER`. Verificar el número comercial antes de modificarlo.
