# Guía de puesta en producción — 3020 Automotores

Esta guía permite publicar la nueva web sin exponer el inventario histórico ni abrir el panel de administración. La propuesta sigue en la rama `propuesta-web-independiente`; no se publica ni se fusiona automáticamente.

## 1. Preparar Supabase

1. Crear un proyecto Supabase para producción y guardar las credenciales en el gestor seguro del hosting, nunca en Git.
2. En **SQL Editor**, ejecutar una sola vez `web/supabase/migrations/202610100001_inventory.sql`.
3. En **Authentication → Providers / Sign In**, desactivar el registro público de usuarios. Crear manualmente las cuentas individuales del personal autorizado.
4. En **Authentication → Users**, copiar el UUID de cada usuario autorizado. Ejecutar en SQL Editor una instrucción por usuario, sustituyendo el UUID real:

   ```sql
   insert into public.admin_users (user_id)
   values ('UUID_REAL_DEL_USUARIO');
   ```

5. En Storage, confirmar que existe el bucket público `vehicle-images`, con límite de 8 MB y formatos JPEG, PNG y WebP. Las imágenes publicadas son públicas por diseño; no subir documentación ni imágenes privadas.
6. Probar con una cuenta autorizada y otra cuenta sin permisos: solo la primera debe poder crear, editar, publicar y eliminar imágenes.

## 2. Configurar el hosting

Se puede desplegar en Vercel u otro hosting compatible con Next.js. En el proyecto, establecer la raíz de la aplicación en `web` y usar Node.js 20.9 o superior.

Variables de entorno necesarias:

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase de producción |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave publishable/anon de ese proyecto |
| `NEXT_PUBLIC_SITE_URL` | URL canónica pública, con `https://` y sin barra final |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número comercial confirmado, solo dígitos y en formato internacional |

Las variables con prefijo `NEXT_PUBLIC_` son visibles en el navegador. Solo deben contener datos destinados a ser públicos. **No configurar una clave `service_role` en la aplicación ni guardarla en Git.** No compartir credenciales por chat.

Después de cargar las variables, ejecutar un nuevo despliegue. No apuntar el dominio definitivo hasta que las pruebas de aceptación estén completas.

## 3. Antes de habilitar el dominio

- [ ] Confirmar el teléfono oficial de WhatsApp y probar el enlace desde móvil y escritorio.
- [ ] Revisar uno por uno los vehículos históricos; no asumir que siguen disponibles ni publicar automáticamente sus precios o fotos.
- [ ] Confirmar titularidad/permisos de uso de las fotos y exactitud de descripciones, kilometraje y precios.
- [ ] Verificar que un visitante anónimo solo pueda consultar fichas publicadas.
- [ ] Verificar que las fichas borrador, reservadas y vendidas no aparezcan en el catálogo público ni en el sitemap.
- [ ] Probar inicio/cierre de sesión, creación, edición, publicación, cambio de estado, carga, reordenamiento y eliminación de fotos.
- [ ] Probar búsqueda, filtros, ordenamiento, fichas y navegación en móvil.
- [ ] Revisar enlaces antiguos de WordPress y añadir redirecciones específicas cuando corresponda.
- [ ] Configurar dominio HTTPS, renovación DNS, política de copias de seguridad y acceso al proyecto para más de una persona responsable.
- [ ] Confirmar que `/robots.txt` y `/sitemap.xml` usan el dominio canónico correcto.
- [ ] Ejecutar el flujo de GitHub Actions sobre el commit final y comprobar que TypeScript y build terminan correctamente.

## 4. Comprobaciones posteriores al despliegue

- Abrir `https://DOMINIO-REAL/api/health`: debe responder HTTP 200 con `{"status":"ok"}`. Esta ruta comprueba que la aplicación responde, no que Supabase esté operativo.
- Abrir el catálogo público, una ficha publicada y el panel privado.
- Revisar los logs del hosting y Supabase durante las primeras pruebas.
- Confirmar desde una sesión privada del navegador que no existe acceso al inventario administrativo ni al panel.
- Mantener el sitio anterior disponible hasta validar las redirecciones y confirmar que el nuevo catálogo refleja el stock real.

## Estado actual

La aplicación y su verificación de compilación están preparadas en una rama de propuesta, pero todavía no se han configurado aquí un proyecto Supabase real, credenciales de producción, el número comercial confirmado, un dominio ni un despliegue. La puesta en producción requiere completar los pasos anteriores y una aprobación explícita del responsable del negocio.
