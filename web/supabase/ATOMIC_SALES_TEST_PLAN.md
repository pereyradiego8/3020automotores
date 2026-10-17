# Plan de validación — ventas atómicas (entorno aislado)

**Estado:** preparado en GitHub, pendiente de ejecutar. No usar datos de compradores reales.

## Requisitos previos

- Crear o disponer de una base Supabase de pruebas separada de producción.
- Aplicar todas las migraciones anteriores y finalmente `20261014160000_atomic_vehicle_sales.sql`.
- Crear una cuenta administrativa de prueba, una cuenta autenticada sin permisos de inventario y una sesión anónima.
- Conectar una vista previa de Vercel exclusivamente a la base de pruebas. No utilizar una vista previa contra la base productiva para modificar ventas.
- Usar vehículos, compradores y documentos de ejemplo sin información personal real.

## Casos obligatorios

| Caso | Procedimiento | Resultado esperado |
| --- | --- | --- |
| Autenticación | Invocar `save_vehicle_sale_atomic` sin sesión | RPC denegada |
| Autorización | Invocar la RPC con cuenta autenticada no autorizada | RPC denegada; datos sin cambios |
| Venta nueva | Guardar un vehículo de prueba como vendido con comprador válido | Estado y registro de venta creados conjuntamente |
| Venta inválida | Intentar vender con comprador o documento vacío | Operación rechazada; vehículo no pasa a vendido |
| Documento inválido | Enviar ruta de un archivo de otro vehículo | Operación rechazada; sin cambios |
| Registrar de nuevo | Editar notas/patente de una venta existente | `sold_at` original conservado |
| Quitar documentación | Editar una venta y desmarcar un archivo existente | El archivo quitado se encola para eliminación; los que siguen adjuntos se conservan |
| Volver a adjuntar un archivo | Reincorporar una ruta que seguía en la cola | Se cancela la eliminación pendiente para esa ruta; no se borra un documento activo |
| Sintaxis SQL | Aplicar la migración a una base temporal nueva y ejecutar las tres RPC | Migración completa, sin funciones duplicadas ni declaraciones truncadas |
| Publicación incompleta | Intentar publicar un borrador sin datos o fotos | Operación rechazada |
| Revertir venta | Cambiar de vendido a borrador, reservado o publicado | Estado actualizado y registro de comprador eliminado en una transacción |
| Falla de Storage | Impedir temporalmente el borrado del archivo tras revertir | El estado queda correcto y la ruta privada permanece en cola de limpieza |
| Reintentar | Restablecer Storage y presionar «Reintentar limpieza documental» | El documento se elimina y se quita la ruta de la cola |
| Idempotencia | Repetir el reintento una vez completada la limpieza | No hay daño ni cambios en las ventas |
| Concurrencia | Dos administradores intentan cambiar un mismo vehículo | No se obtienen estados/filas inconsistentes |
| Regresión | Alta, edición, publicación, catálogo, galerías y WhatsApp | Continúan funcionando |
| Aislamiento | Correr build y tests sin secretos en GitHub Actions | El CI permanece correcto |

## Consulta de control (ejecutar solo en la base de pruebas)

```sql
-- Registros de venta cuyo estado de vehículo no es 'sold':
select count(*) as ventas_desincronizadas
from public.vehicle_sales as s
join public.vehicles as v on v.id = s.vehicle_id
where v.status <> 'sold';

-- Cantidad de rutas privadas pendientes de eliminar:
select count(*) as documentos_pendientes
from private.sale_document_cleanup_queue;
```

Esperado: `ventas_desincronizadas = 0` luego de los casos normales; `documentos_pendientes = 0` luego de la prueba del reintento.

## Antes de integrar a producción

1. Conservar un respaldo verificable de los datos y comprobar una ruta de reversión.
2. Revisar RLS y permisos con los dos tipos de usuarios.
3. Aprobar el código del PR base y el PR de ventas, así como los resultados en el entorno aislado.
4. Coordinar la aplicación de la migración con la versión web que consume la nueva RPC (el código nuevo no tiene un fallback de escrituras no transaccionales).
5. Ejecutar una operación de prueba controlada, revisar el panel y monitorear los errores sin exponer datos personales.

**Límite de la verificación actual:** el CI compila el código, pero no ejecuta esta migración SQL ni realiza transacciones en Supabase.

**Nota:** las verificaciones estáticas de GitHub no sustituyen una prueba de ejecución real de PostgreSQL y Storage. No aplicar esta migración en el proyecto productivo.
