# Propuesta de migración y línea visual — 3020 Automotores

## Decisiones confirmadas
- Sitio independiente, sin volver a WordPress.
- Panel privado para que el personal cree, edite, publique, pause y marque vehículos como vendidos.
- Diseño equilibrado, profesional y orientado a generar consultas.
- El logo existente debe conservarse; no redibujarlo ni reemplazarlo por uno genérico.

## Hallazgos del repositorio de referencia
- Repositorio de origen: https://github.com/pereyradiego8/3020automotores
- La portada exportada identifica el sitio como “3020 Automotores”.
- La exportación referencia los archivos de marca `wp-content/uploads/2020/01/aut3020-blanco.png`, `aut3020-iso.png` y variantes de favicon.
- La portada contiene recursos y rutas generados por WordPress, Elementor, WooCommerce y otros plugins; no se reutilizará esa arquitectura.
- Los datos de vehículos y sus precios se tratarán como contenido por verificar, no como inventario actual confirmado.

## Dirección visual propuesta
- Mantener el logo original, en blanco sobre fondos oscuros cuando corresponda.
- Base grafito/negro para cabecera y pie, superficies claras para legibilidad y un acento rojo sobrio en llamadas a la acción. Esta es una propuesta inicial de interfaz; se contrastará con los colores reales del logo antes de cerrar el sistema visual.
- Tipografía sans serif legible, títulos con jerarquía fuerte, fotografías reales como protagonistas y tarjetas consistentes.
- Evitar precios, financiación, stock o beneficios inventados. Los ejemplos de la maqueta son marcadores visuales, no ofertas reales.
- Prioridad mobile-first, accesibilidad, velocidad, filtros útiles y contacto por WhatsApp.

## Arquitectura objetivo
- Next.js + TypeScript + Tailwind CSS.
- Supabase/PostgreSQL para datos y autenticación; almacenamiento de fotos con permisos.
- Roles para personal autorizado y protección de rutas/acciones del servidor.
- Estados del vehículo: borrador, publicado, reservado, vendido.
- SEO técnico, sitemap, metadatos por ficha y redirecciones desde URLs antiguas relevantes.

## Próximas tareas
1. Auditar todas las fichas y recursos gráficos que efectivamente estén disponibles en el repositorio.
2. Crear un CSV de migración con campos normalizados y marcas de revisión para datos inciertos.
3. Validar logo y paleta con los recursos de marca existentes.
4. Implementar catálogo público y ficha individual.
5. Implementar panel autenticado y políticas de acceso.
6. Probar una importación pequeña antes de importar el inventario completo.
7. Mapear URLs antiguas a URLs nuevas y comprobar redirecciones antes de publicar.

## Vista previa estática
La carpeta `propuesta/` contiene una maqueta HTML/CSS adaptable para revisar la dirección visual. Las tarjetas son ejemplos de diseño, no vehículos reales. El enlace de contacto apunta temporalmente al dominio de referencia y debe sustituirse por el canal comercial verificado antes de publicar.
