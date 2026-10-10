# Configuración de Supabase

1. Creá un proyecto Supabase.
2. Ejecutá `migrations/202610100001_inventory.sql` desde el SQL Editor. La migración crea las tablas, roles, políticas RLS y el bucket público `vehicle-images` con límite de 8 MB por archivo y formatos JPG/PNG/WebP.
3. En Authentication, creá manualmente los usuarios del personal autorizado y desactivá el registro público.
4. Copiá el UUID de cada cuenta desde Authentication → Users.
5. Autorizá al personal con: `insert into public.admin_users(user_id) values ('UUID_DEL_USUARIO');` sustituyendo el UUID real.
6. Copiá la URL del proyecto y la clave publishable/anon a `web/.env.local`, tomando `web/.env.example` como guía. Nunca pongas una clave service_role en variables públicas ni en el navegador.
7. Reiniciá el servidor local y probá `/admin/login`, `/admin`, la edición de fichas y la carga de fotos.

## Cómo funciona

- Los vehículos nuevos se guardan como borrador.
- Solo los vehículos en estado `published` aparecen en el catálogo público.
- El personal autorizado puede editar datos, cambiar el estado y administrar hasta 12 fotos por ficha.
- Las políticas RLS protegen las tablas; las políticas de Storage permiten lectura pública de las fotos y restringen altas, cambios y bajas a administradores.
- Quitar una foto de una ficha la elimina de la galería, pero no borra automáticamente el archivo del bucket. Para evitar borrar imágenes que se usan en otras fichas, la limpieza de archivos debe hacerse por separado.

## Antes de producción

Confirmá que la política de registro público esté desactivada, autorizá solo las cuentas necesarias y probá permisos con una sesión no administrativa. Revisá también los límites de Storage, copias de seguridad y la configuración de dominio. No cargues contraseñas ni claves privadas al repositorio.
