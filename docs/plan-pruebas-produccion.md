# Plan de pruebas previo al lanzamiento

## Preparación

- [ ] Crear proyecto Supabase independiente para pruebas.
- [ ] Ejecutar la migración SQL desde el SQL Editor.
- [ ] Crear dos cuentas de prueba: una autorizada y otra sin permiso de inventario.
- [ ] Configurar `web/.env.local` con URL y clave pública del proyecto.
- [ ] Confirmar que el dominio y el teléfono de WhatsApp estén verificados antes de producción.

## Catálogo público

- [ ] Sin variables de Supabase, inicio y catálogo cargan sin exponer inventario histórico.
- [ ] Con Supabase configurado, borradores, reservados y vendidos no aparecen en el catálogo público.
- [ ] Solo unidades en estado `published` aparecen en inicio, catálogo, ficha y sitemap.
- [ ] Búsqueda por marca/modelo y filtro por carrocería funcionan.
- [ ] Una URL de ficha inexistente o no publicada responde como no encontrada.
- [ ] Precio, año, kilometraje, descripción y fotos coinciden con el registro aprobado.

## Panel y autorización

- [ ] Usuario anónimo es redirigido al inicio de sesión.
- [ ] Usuario autenticado pero no autorizado no puede leer ni modificar el inventario.
- [ ] Administrador puede crear una unidad; el estado inicial es borrador.
- [ ] Administrador puede editar datos y cambiar entre borrador, publicado, reservado y vendido.
- [ ] La publicación o despublicación se refleja en el catálogo después de guardar.
- [ ] Cerrar sesión invalida la sesión en el navegador.

## Fotos

- [ ] JPG, PNG y WebP de hasta 8 MB se suben correctamente.
- [ ] Otros formatos y archivos mayores a 8 MB se rechazan.
- [ ] Se respeta el máximo de 12 fotos por ficha.
- [ ] Las fotos guardadas se ven en catálogo y ficha.
- [ ] Un usuario no administrador no puede cargar, modificar ni eliminar objetos del bucket.

## Lanzamiento

- [ ] Build de GitHub Actions en verde para el último commit.
- [ ] Pruebas visuales en móvil y escritorio.
- [ ] Confirmar número de WhatsApp, logo, dominio, precios y disponibilidad.
- [ ] Configurar `NEXT_PUBLIC_SITE_URL` con la URL definitiva y revisar robots/sitemap.
- [ ] Mapear y probar redirecciones para las URLs antiguas importantes.
- [ ] Configurar dominio HTTPS y hosting; revisar logs y alertas.
- [ ] No fusionar el PR ni cambiar tráfico de producción hasta completar las pruebas críticas.
