# 3020 Automotores — aplicación web

Primera base de la nueva web independiente, con Next.js + TypeScript. Esta aplicación no depende de WordPress.

## Ejecutar localmente

Requiere Node.js 20.9 o superior.

```bash
npm install
npm run dev
```

Abrí http://localhost:3000.

## Qué incluye esta primera etapa

- Inicio comercial adaptable a móvil.
- Catálogo de fichas con búsqueda por nombre y filtro por carrocería.
- Página individual por vehículo, consultada desde el inventario publicado en Supabase.
- Datos históricos importados para revisión, con advertencias explícitas.

## Importante antes de publicar

El archivo `src/data/catalogo-historico.json` se conserva solo como fuente de revisión. No se muestra automáticamente en el catálogo público. Las fotos deben cargarse a almacenamiento propio y aprobarse antes del lanzamiento.

## Próxima etapa

1. Revisar y aprobar inventario y fotos.
2. Configurar Supabase (PostgreSQL, Auth y Storage) mediante variables de entorno; nunca guardar claves privadas en el repositorio.
3. Crear panel privado `/admin` con permisos, validación y estados borrador/publicado/reservado/vendido.
4. Conectar el catálogo público solo a vehículos aprobados como publicados.
5. Completar pruebas, SEO, redirecciones y despliegue.

El panel administrativo y la base de datos todavía no están implementados; no cargar credenciales hasta definir el proyecto y sus políticas de acceso.

## Panel privado y base de datos

Se agregó el primer flujo de acceso del personal, un panel de inventario, carga de vehículos y cambios de estado. Para configurarlo, seguí [`supabase/README.md`](supabase/README.md), ejecutá el SQL de `supabase/migrations/202610100001_inventory.sql` y completá `web/.env.local` con los valores de `web/.env.example`.

Los vehículos nuevos se guardan como borrador. El catálogo público consulta únicamente registros con estado `published`; las fichas históricas no se publican automáticamente. Sin credenciales de Supabase, el catálogo público queda vacío intencionalmente.

La conexión real a Supabase, las pruebas de compilación/navegador, el almacenamiento de imágenes y el despliegue todavía requieren configuración y validación. No publicar hasta probarlos.
