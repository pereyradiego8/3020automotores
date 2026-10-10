# 3020 Automotores — aplicación web

Nueva aplicación independiente de WordPress, construida con Next.js, TypeScript y Supabase.

## Funciones implementadas en la rama de propuesta

- Inicio comercial adaptable a móvil y catálogo público con búsqueda y filtro por carrocería.
- Fichas públicas dinámicas: solo muestran vehículos cuyo estado sea `published`.
- Acceso privado para el personal con Supabase Auth y lista de administradores autorizados.
- Alta de vehículos como borrador, edición de datos y estados borrador/publicado/reservado/vendido.
- Carga de hasta 12 imágenes por vehículo desde el panel, con validación de tipo y tamaño.
- Políticas RLS para limitar el acceso y la escritura del inventario y Storage.
- Inventario histórico separado para revisión; no se publica automáticamente.

## Ejecutar localmente

Requiere Node.js 20.9 o superior.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrí http://localhost:3000. Para que funcionen el inicio de sesión, el inventario y la carga de imágenes, completá las variables de entorno con los datos del proyecto Supabase.

## Configuración obligatoria antes de usar

1. Crear el proyecto Supabase y ejecutar `supabase/migrations/202610100001_inventory.sql` desde SQL Editor.
2. Crear cuentas del personal en Supabase Auth y desactivar el registro público.
3. Autorizar cada cuenta insertando su UUID en `public.admin_users`; ver [la guía de Supabase](supabase/README.md).
4. Configurar `.env.local` y verificar que las políticas RLS y Storage estén activas.
5. Revisar manualmente los vehículos, precios, teléfonos, fotos y datos comerciales. No usar los datos históricos como stock actual sin confirmación.
6. Ejecutar build y pruebas de navegación con la configuración real.
7. Configurar dominio, hosting, metadatos SEO, redirecciones desde las URLs antiguas y analítica antes del lanzamiento.

Sin credenciales de Supabase, el catálogo queda vacío intencionalmente. No se debe publicar ni fusionar la propuesta en producción hasta que las pruebas estén verdes y los datos comerciales estén aprobados.


## Contacto de WhatsApp

El número de WhatsApp no se toma automáticamente de la web histórica para evitar enviar consultas a un teléfono desactualizado. Configurá `NEXT_PUBLIC_WHATSAPP_NUMBER` con el número comercial confirmado en formato internacional, solo dígitos (sin `+`, espacios ni guiones), tanto en el entorno local como en el hosting. Si no está configurado o el formato no es válido, el sitio muestra un aviso y no ofrece un enlace de WhatsApp. No cargues números personales sin autorización.
