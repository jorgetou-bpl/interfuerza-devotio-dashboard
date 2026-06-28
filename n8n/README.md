# N8N Workflow — InterFuerza × Devotio Rewards

## Cómo importar

1. Abrí tu instancia N8N Cloud en [app.n8n.cloud](https://app.n8n.cloud)
2. Ir a **Workflows → Import from file**
3. Seleccioná `interfuerza-devotio-workflow.json`
4. El workflow aparece importado — configurá las credenciales (paso siguiente)

## Variables de entorno requeridas en N8N

Ir a **Settings → Environment Variables** y agregar:

| Variable | Descripción |
|----------|-------------|
| `INTERFUERZA_API_URL` | URL base de la API InterFuerza (ej: `https://api.interfuerza.com`) |
| `INTERFUERZA_TOKEN` | Token de lectura de facturas y clientes |
| `DEVOTIO_API_URL` | URL base de Devotio API (ej: `https://api.devotiorewards.com`) |
| `DEVOTIO_API_KEY` | API Key de Devotio Rewards |
| `SUPABASE_URL` | URL del proyecto Supabase (ej: `https://xxxx.supabase.co`) |
| `SUPABASE_SERVICE_KEY` | Service Role Key (no la anon) |
| `CASHBACK_PERCENTAGE` | Porcentaje de cashback (ej: `5`) |

## Campos de InterFuerza usados

El workflow mapea automáticamente ambas convenciones (mayúscula y minúscula):

| Campo en InterFuerza | Uso |
|---------------------|-----|
| `id` | ID único de la factura (clave de dedup) |
| `Total` / `total` | Monto base para calcular cashback |
| `Cliente` / `cliente` | Nombre del cliente |
| `Telefono_1` / `telefono` | Teléfono para buscar en Devotio |
| `Email` / `email` | Email para buscar en Devotio |
| `Bodega` / `bodega` | Sucursal donde se realizó la compra |
| `Date` / `date` | Fecha/hora de la factura |

## Ajustar al endpoint real de InterFuerza

El nodo **"Obtener Facturas InterFuerza"** usa la URL:
```
{INTERFUERZA_API_URL}/api/v1/invoices?date_from=...&limit=50
```

Si el endpoint de InterFuerza es diferente, editá ese nodo con el path correcto.

## Rate limiting

- El workflow corre cada 2 minutos
- InterFuerza permite máx 20 req / 10 segundos
- El nodo **"Rate Limit (500ms)"** está disponible — conectalo en el loop si el batch supera 15 facturas
