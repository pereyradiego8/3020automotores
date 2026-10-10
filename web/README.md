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
- Página individual por vehículo, generada estáticamente.
- Datos históricos importados para revisión, con advertencias explícitas.

## Importante antes de publicar

El archivo `src/data/catalogo-historico.json` proviene de una exportación histórica. Precios, kilometraje, stock y datos de contacto deben validarse con el equipo. Las fichas actuales son referencias y no ofertas activas. Las imágenes apuntan a los archivos públicos de la rama principal del repositorio de origen; hay que migrarlas a almacenamiento propio antes del lanzamiento.

## Próxima etapa

1. Revisar y aprobar inventario y fotos.
2. Configurar Supabase (PostgreSQL, Auth y Storage) mediante variables de entorno; nunca guardar claves privadas en el repositorio.
3. Crear panel privado `/admin` con permisos, validación y estados borrador/publicado/reservado/vendido.
4. Conectar el catálogo público solo a vehículos aprobados como publicados.
5. Completar pruebas, SEO, redirecciones y despliegue.

El panel administrativo y la base de datos todavía no están implementados; no cargar credenciales hasta definir el proyecto y sus políticas de acceso.
