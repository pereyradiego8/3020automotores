# Mapa inicial de redirecciones del sitio anterior

**Rama:** `propuesta-web-independiente`  
**Objetivo:** conservar entradas de visitantes y buscadores después de la migración. Las redirecciones son permanentes (301) y deben probarse en el entorno de preview antes del lanzamiento.

## URLs antiguas con query `?p=ID`

| URL antigua | Destino inicial | Motivo |
|---|---|---|
| `/?p=15064` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=15904` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=15951` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=16070` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=16096` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=16667` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=16737` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=16760` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17118` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17276` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17296` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17341` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17498` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17569` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17636` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17705` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17798` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17800` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=17957` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=18005` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=18029` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=18051` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=18117` | `/autos` | Ficha de vehículo histórica; stock/precio deben validarse antes de crear una ficha nueva. |
| `/?p=4739` | `/nosotros` | Página institucional antigua |
| `/?p=4743` | `/contacto` | Página de contacto antigua |
| `/?p=4819` | `/marcas` | Índice de marcas antiguo |

## Rutas exportadas como HTML

- `/index.html` → `/`
- `/autos.html` → `/autos`
- `/autos/<slug>/index.html` → `/autos/<slug>`
- `/nosotros/index.html` → `/nosotros`
- `/contacto/index.html` → `/contacto`
- `/marcas/index.html` → `/marcas`
- `/marcas/<marca>/index.html` → `/marcas`

## Limitaciones que deben quedar claras

1. Las 23 fichas antiguas con `?p=ID` se envían por ahora al catálogo general, no a una ficha exacta. Es una alternativa segura mientras no se confirme stock y no se termine el mapeo individual de IDs a slugs.
2. Las URLs de feeds, comentarios y `wp-json` son salidas técnicas de WordPress y no se recrean como páginas comerciales.
3. Las rutas de marcas individuales se redirigen al índice de marcas. En una fase posterior se pueden llevar a filtros específicos, cuando exista un catálogo publicado que los soporte.
4. Las redirecciones de rutas exportadas deben probarse en hosting real; el servidor local puede comportarse distinto en ciertos casos.
5. No se elimina ningún archivo de la exportación original hasta comprobar la migración y el tráfico de las URLs importantes.
