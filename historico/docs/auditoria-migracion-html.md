# Auditoría de migración HTML — 3020 Automotores

**Fecha de revisión:** 10 de octubre de 2026  
**Rama revisada:** `propuesta-web-independiente`  
**Alcance:** inventario de archivos HTML presentes en el repositorio y comparación con las rutas visibles implementadas en `web/src/app`. Esta auditoría no modifica ni elimina archivos originales.

## Resumen ejecutivo

- Se detectaron **86 archivos HTML** en el árbol del repositorio de la rama revisada.
- La web nueva implementa estas rutas funcionales: inicio (`/`), catálogo (`/autos`), detalle dinámico (`/autos/[slug]`), acceso y gestión privada (`/admin`, `/admin/login`, `/admin/nuevo`, `/admin/editar/[id]`), más páginas técnicas de error, carga, sitemap, robots y salud.
- **No equivalen a 86 páginas nuevas pendientes:** la exportación incluye fichas repetidas en dos formatos de URL, índices de marcas, feeds y salidas técnicas de WordPress.
- Hay al menos tres páginas comerciales/institucionales que deben migrarse explícitamente a la experiencia nueva: **Nosotros, Marcas y Contacto**. Actualmente no aparecen como rutas públicas propias en `web/src/app`.
- La portada nueva y el catálogo están reconstruidos, pero el inventario visible depende de Supabase y de vehículos publicados por el equipo.
- La revisión inicial estructuró **15 fichas** en `data/catalogo-historico.json`; además se encontraron **24 páginas de vehículos** bajo `autos/`. Se prepararon migraciones para cargar las 24 fichas como borradores con fotos referenciadas y sin precio ni kilometraje público; el equipo debe confirmar stock, precio, kilometraje, especificaciones y fotos antes de publicar.
- Los HTML y los recursos históricos se mantienen intactos. No se recomienda borrar nada durante esta etapa.

## Estado por área

| Área original | Estado en la web nueva | Acción recomendada |
|---|---|---|
| Portada `index.html` | Reconstruida en `web/src/app/page.tsx` | Comparar contenido comercial, enlaces y mensajes para detectar omisiones. |
| Catálogo `autos.html` | Reconstruido en `web/src/app/autos/page.tsx` con búsqueda/filtros | Mantener; revisar filtros y contenido frente al original. |
| Fichas de vehículos bajo `autos/<slug>/` | Existe ficha dinámica `/autos/[slug]` | Consolidar todas las fichas en una única fuente; no migrar automáticamente stock/precios antiguos. |
| Fichas antiguas `index.html@p=ID.html` | Redirección histórica prevista para vehículos; cobertura pendiente de auditar ID por ID | Se creó \`docs/mapa-redirecciones-html.md\`; probar todas las reglas en preview y mejorar el mapeo ID → ficha exacta cuando se confirme stock. |
| Nosotros | Implementada en \`web/src/app/nosotros/page.tsx\` | Revisar el texto institucional con el negocio antes de lanzar. |
| Contacto | Implementada en \`web/src/app/contacto/page.tsx\` con datos históricos y aviso de verificación | Confirmar teléfonos, correo, dirección y horarios; añadir redes sociales verificadas si corresponde. |
| Marcas e índices de marca | Implementada en \`web/src/app/marcas/page.tsx\`; los enlaces precargan búsqueda en el catálogo | Probar búsqueda de marcas con inventario real y decidir qué marcas deben mostrarse según stock. |
| `propuesta/index.html` | Es una propuesta de diseño anterior, no necesariamente contenido oficial | Usarla como referencia visual/conceptual, no copiarla sin comparar con la identidad solicitada. |
| Feeds, comentarios, `wp-json` y salidas técnicas | No son páginas comerciales para reproducir | No recrearlas como páginas de navegación. Mantener solo lo necesario para compatibilidad o redirecciones. |
| Fotos, logo y recursos | Muchos recursos siguen dentro del archivo histórico de WordPress | Seleccionar logo/fotos originales y comprobar licencia, calidad y correspondencia antes de incorporarlos a la app nueva. |

## Rutas nuevas comprobadas en el árbol de archivos

- `web/src/app/page.tsx` — inicio.
- `web/src/app/autos/page.tsx` — catálogo.
- `web/src/app/autos/[slug]/page.tsx` — ficha dinámica de vehículo.
- `web/src/app/admin/page.tsx`, `admin/login`, `admin/nuevo`, `admin/editar/[id]` — panel privado.
- `web/src/app/sitemap.ts`, `robots.ts`, `api/health/route.ts` — soporte técnico/SEO.
- **Ausentes como páginas públicas independientes:** `/nosotros`, `/marcas`, `/contacto`.

## Reglas para decidir qué conservar

1. **No borrar los HTML ni la exportación de WordPress ahora.** Son respaldo, referencia de contenido y origen de URLs que pueden seguir recibiendo visitas.
2. Conservar y adaptar el contenido comercial vigente; no copiar precios/stock históricos como ofertas actuales.
3. Unificar fichas duplicadas y definir redirecciones explícitas para cada URL antigua relevante.
4. Los feeds y archivos técnicos pueden quedar solo como archivo histórico; no requieren equivalentes en la nueva navegación.
5. Antes de lanzamiento, probar cada URL antigua relevante y verificar que llegue a una página válida o a un destino equivalente (sin redirigir todo indiscriminadamente a inicio).
6. Revisar manualmente imágenes, logo, teléfono/WhatsApp, correo, dirección, horarios y enlaces sociales.

## Inventario completo de HTML detectados

La lista siguiente enumera todos los archivos HTML detectados en el árbol de esta rama al momento de la revisión. Los grupos son orientativos por ruta; los duplicados semánticos deben resolverse en la fase de redirecciones.

### Portada y páginas principales (6)

- `autos.html`
- `contacto/index.html`
- `index.html`
- `marcas/index.html`
- `nosotros/index.html`
- `propuesta/index.html`

### Fichas de vehículos en /autos/ (24)

- `autos/argo-drive-1-3-cvt/index.html`
- `autos/chevrolet-cruze-1-4-turbo-premier-at-2023/index.html`
- `autos/cronos-1-3-pack-plus-0km/index.html`
- `autos/ds3-thp-mt6-sport-chic-2019/index.html`
- `autos/fiat-strada-1-3-fire-fly-freedom-cs-0km/index.html`
- `autos/ford-ka-1-5-s-sedan-2019/index.html`
- `autos/ford-maverick-lariat-2-0l-4x4-at-2022/index.html`
- `autos/ford-ranger-xlt-2-0-4x4/index.html`
- `autos/hyundai-tucson-2wd-2-0-2018/index.html`
- `autos/jeep-compass-sport-1-3t-at6-4x2/index.html`
- `autos/jeep-renegade-1-3t-sport-at-4x2-0km/index.html`
- `autos/jeep-renegade-longitude-1-8l-at6-2021/index.html`
- `autos/jetour-dashing-1-5t-6dct-0km/index.html`
- `autos/jetour-x50-1-5-6dct-0km/index.html`
- `autos/nissan-note-advance-cvt-2019/index.html`
- `autos/peugeot-2008-1-6-feline-mt-l-22-2022/index.html`
- `autos/renault-sandero-ph2-life-1-6-2023/index.html`
- `autos/suzuki-grand-vitara-2-0-5ptas-mt-2006/index.html`
- `autos/toyota-etios-xls-1-5-6m-t-2021/index.html`
- `autos/toyota-hilux-4x4-srx-2-8-tdi-a-t-2016/index.html`
- `autos/volkswagen-amarok-2-0-180cv-highline-4x2-aut-2019/index.html`
- `autos/volkswagen-amarok-trendline-140cv-4x4/index.html`
- `autos/volkswagen-t-cross-extreme-at-0km/index.html`
- `autos/volkswagen-vento-2-5-advance-plus-at-2016/index.html`

### Fichas históricas con URL antigua ?p=ID (26)

- `index.html@p=15064.html`
- `index.html@p=15904.html`
- `index.html@p=15951.html`
- `index.html@p=16070.html`
- `index.html@p=16096.html`
- `index.html@p=16667.html`
- `index.html@p=16737.html`
- `index.html@p=16760.html`
- `index.html@p=17118.html`
- `index.html@p=17276.html`
- `index.html@p=17296.html`
- `index.html@p=17341.html`
- `index.html@p=17498.html`
- `index.html@p=17569.html`
- `index.html@p=17636.html`
- `index.html@p=17705.html`
- `index.html@p=17798.html`
- `index.html@p=17800.html`
- `index.html@p=17957.html`
- `index.html@p=18005.html`
- `index.html@p=18029.html`
- `index.html@p=18051.html`
- `index.html@p=18117.html`
- `index.html@p=4739.html`
- `index.html@p=4743.html`
- `index.html@p=4819.html`

### Índices de marcas (13)

- `marcas/audi/index.html`
- `marcas/chevrolet/index.html`
- `marcas/citroen/index.html`
- `marcas/dodge/index.html`
- `marcas/fiat/index.html`
- `marcas/ford/index.html`
- `marcas/jeep/index.html`
- `marcas/kia/index.html`
- `marcas/nissan/index.html`
- `marcas/peugeot/index.html`
- `marcas/renault/index.html`
- `marcas/toyota/index.html`
- `marcas/volkswagen/index.html`

### Feeds y endpoints exportados (17)

- `autos/feed/index.html`
- `comments/feed/index.html`
- `feed/index.html`
- `marcas/audi/feed/index.html`
- `marcas/chevrolet/feed/index.html`
- `marcas/citroen/feed/index.html`
- `marcas/dodge/feed/index.html`
- `marcas/fiat/feed/index.html`
- `marcas/ford/feed/index.html`
- `marcas/jeep/feed/index.html`
- `marcas/kia/feed/index.html`
- `marcas/nissan/feed/index.html`
- `marcas/peugeot/feed/index.html`
- `marcas/renault/feed/index.html`
- `marcas/toyota/feed/index.html`
- `marcas/volkswagen/feed/index.html`
- `wp-json/index.html`

### Otros HTML exportados (0)

- Ninguno detectado.

## Próximos pasos recomendados

1. Validar con el negocio el contenido y los datos de las páginas nuevas **Nosotros**, **Contacto** y **Marcas**.
2. Probar el mapa inicial de redirecciones de \`docs/mapa-redirecciones-html.md\` en preview y mejorar los destinos exactos de las fichas cuando haya stock confirmado.
3. Revisar las 15 fichas históricas una por una y confirmar cuáles están realmente en venta.
4. Auditar las fotos para elegir originales, quitar duplicados de tamaños generados por WordPress y asociar las imágenes correctas.
5. Mantener este documento como checklist; no borrar recursos hasta cerrar la migración y probar los enlaces.
