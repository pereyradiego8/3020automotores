# Configuración de Supabase

1. Creá un proyecto Supabase.
2. Ejecutá `migrations/202610100001_inventory.sql` desde el SQL Editor.
3. En Authentication, creá manualmente los usuarios del personal autorizado y desactivá el registro público.
4. Copiá el UUID del administrador desde Authentication → Users.
5. Ejecutá `insert into public.admin_users(user_id) values ('UUID_DEL_USUARIO');` sustituyendo el UUID real.
6. Copiá la URL del proyecto y la clave publishable/anon a `web/.env.local`, tomando `web/.env.example` como guía.
7. Reiniciá el servidor local y probá `/admin/login`.

Los vehículos nuevos se guardan como borrador. El catálogo público solo consulta registros con estado `published`. Las políticas RLS limitan escritura y consulta de fichas privadas a los usuarios habilitados. Las imágenes se deben subir a un almacenamiento de Supabase con políticas de escritura limitadas antes de usar `image_urls` en producción.
