# Auditoría inicial de catálogo — 3020 Automotores

Fecha de revisión: 2026-10-10.
Repositorio fuente: https://github.com/pereyradiego8/3020automotores
Página de catálogo examinada: `autos.html`.

## Resultado preliminar
- Se detectaron 15 enlaces de fichas de vehículos en la página estática examinada.
- El catálogo referencia fotografías locales bajo `wp-content/uploads/`; hay archivos con carpetas de 2026/10, 2026/09, 2026/08 y 2026/07.
- Las fichas individuales contienen galerías y campos como marca, kilometraje, tipo, combustible, año, motor, puertas, transmisión y color.
- Las URLs antiguas mezclan páginas del formato `index.html@p=ID.html` con URLs en directorios como `autos/slug/index.html`. El migrador debe normalizar estas rutas y guardar el mapeo de redirecciones.
- Una ficha de ejemplo (JETOUR X50) contiene precio y condiciones promocionales; esos datos se deben considerar históricos hasta que el equipo confirme que siguen vigentes.

## Exportación de trabajo
El archivo `data/catalogo-historico.json` contiene títulos, ruta antigua e imagen detectada para las fichas que aparecen en el listado. Por seguridad comercial, precio se deja en `null` y disponibilidad como `requires_verification`; no se deben importar directamente como unidades publicadas.

## Siguiente paso recomendado
1. Verificar qué fotos existen realmente en GitHub y si las rutas son accesibles.
2. Recuperar metadatos de cada ficha individual para completar campos normalizados.
3. Crear una planilla CSV con una columna de validación humana para precio, kilometraje, estado y publicación.
4. Confirmar con el equipo cuáles unidades siguen a la venta y qué información comercial puede publicarse.
5. Importar sólo unidades verificadas al nuevo panel.
