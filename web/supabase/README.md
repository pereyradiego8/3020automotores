# Configuración de Supabase — 3020 Automotores

## Proyecto conectado

- Proyecto: `3020-automotores`
- Región: São Paulo (`sa-east-1`)
- URL: `https://zoncelsnskpuninitier.supabase.co`
- Bucket público de fotos: `vehicle-images`
- Estado de base: 24 vehículos históricos importados como borradores; 0 publicados.

La clave `sb_publishable_...` configurada en `.env.example` es una clave pública del cliente. Es apropiado incluirla en una aplicación web, siempre que RLS permanezca activado. **Nunca** publiques una clave `service_role` o una clave secreta.

## Migraciones

En el proyecto conectado ya se aplicaron las migraciones en orden. Para reconstruir un entorno nuevo, ejecutá en SQL Editor:

1. `migrations/202610100001_inventory.sql`
2. `migrations/202610100002_import_historical_vehicle_drafts.sql`
3. `migrations/202610100003_import_additional_vehicle_drafts.sql`
4. `migrations/202610100004_harden_inventory_admin_function.sql`\n5. `migrations/20261013190000_vehicle_sales_and_private_documents.sql`

La primera migración crea las tablas, estados, políticas RLS y bucket. Las dos siguientes importan 24 fichas históricas como borradores. La cuarta mueve la función auxiliar de autorización al esquema privado para que no esté expuesta a través de la Data API pública.

## Crear el primer administrador

No se crea una cuenta por SQL ni se guardan contraseñas en el repositorio. Para dar acceso al responsable:

1. Abrí [Authentication → Users](https://supabase.com/dashboard/project/zoncelsnskpuninitier/auth/users).
2. Creá manualmente el usuario con el correo que vaya a usar para ingresar al panel. Definí una contraseña segura y guardala en un gestor de contraseñas.
3. Copiá el UUID de ese usuario.
4. Abrí [SQL Editor](https://supabase.com/dashboard/project/zoncelsnskpuninitier/sql/new) y ejecutá la consulta siguiente, reemplazando el texto de ejemplo por el UUID real:

   ```sql
   insert into public.admin_users (user_id)
   values ('UUID_REAL_DEL_USUARIO')
   on conflict (user_id) do nothing;
   ```

5. En Authentication → URL Configuration, configurá las URLs de tu entorno real una vez que exista el dominio.
6. En Authentication → Sign In / Providers, desactivá el registro público si está habilitado. El panel no debe ofrecer un enlace de registro.

**No ingreses el UUID de ejemplo literalmente.** Autorizá solo a personas que deban gestionar el stock. Si un usuario pierde autorización, eliminá su fila de `public.admin_users`; esto le quita los permisos de inventario.

## Configurar localmente

1. Desde la carpeta `web`, copiá `.env.example` a `.env.local`.
2. Dejá la URL y la clave publishable del proyecto conectado. Configurá `NEXT_PUBLIC_SITE_URL=http://localhost:3000` para desarrollo.
3. Ejecutá `npm install` y `npm run dev`.
4. Abrí `http://localhost:3000/admin/login` e iniciá sesión con la cuenta que autorizaste.

El archivo `.env.local` no debe subirse a Git. Para el hosting, cargá las mismas variables en la configuración de entorno del proveedor, cambiando `NEXT_PUBLIC_SITE_URL` por la URL pública canónica. La clave publishable puede estar en el navegador; una clave secreta no.

## Cómo funciona

- Los vehículos nuevos se guardan como borrador.
- Solo los vehículos en estado `published` aparecen en el catálogo público.
- El personal autorizado puede editar datos, cambiar el estado y administrar hasta 12 fotos por ficha.
- Las políticas RLS protegen las tablas; las políticas de Storage permiten lectura pública de las fotos y restringen altas, cambios y bajas a administradores.\n- Al marcar un vehículo como vendido se pueden guardar comprador, notas internas y hasta 8 documentos (JPG, PNG, WebP o PDF, 10 MB cada uno). Los datos de venta están en una tabla separada con RLS de administradores; los documentos se guardan en el bucket privado `vehicle-sale-documents` y solo se abren mediante enlaces firmados temporales.
- Quitar una foto la elimina de la galería y el sistema intenta borrar el archivo correspondiente del bucket. Si Storage no confirma la eliminación, la ficha se actualiza igualmente y el panel informa que el archivo requiere revisión.

## Comprobación de disponibilidad

La ruta `GET /api/health` devuelve `{"status":"ok"}` para que el hosting pueda comprobar que la aplicación responde. Es una comprobación de vida del proceso; no valida conexión con Supabase ni la integridad del inventario.

## Antes de producción

Confirmá que la política de registro público esté desactivada, autorizá solo las cuentas necesarias y probá permisos con una sesión no administrativa. Probá que un visitante anónimo no pueda leer borradores, reservados ni vendidos. Revisá límites de Storage, copias de seguridad, dominio, redirecciones y variables de entorno. No cargues contraseñas ni claves privadas al repositorio.
