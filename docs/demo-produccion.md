# Plan de Demo y Puesta en Producción
## InterFuerza × Devotio Rewards Dashboard

---

## Parte 1 — Escenarios de Testing para la Demo

> Todos los escenarios 1–3 usan Pin Data en el nodo **Obtener Facturas InterFuerza** de N8N.
> Los escenarios 4 y 5 se demuestran directamente en el dashboard.

---

### Escenario 1 — Acumulación normal (teléfono coincide en Devotio)

**Objetivo:** Mostrar el flujo principal: factura nueva → cashback acreditado automáticamente.

**Pin en `Obtener Facturas InterFuerza`:**
```json
[
  {
    "data": "{\"class\":\"GET\",\"action\":\"invoices\",\"invoices\":[{\"Invoice\":{\"id\":\"INV00023\",\"Cliente\":\"C0005\",\"Nombre\":\"PAMELA VILLARREAL\",\"Pais\":\"PANAMA\",\"Bodega\":\"Bodega Principal\",\"Status\":\"DELIVERED\",\"Date\":\"2024-12-16\",\"Comentario\":\"\",\"SubTotal\":\"41.59\",\"Discount\":\"0.00\",\"Taxes\":\"2.91\",\"Total\":\"44.50\",\"Credit_Term\":\"C.O.D.\",\"Balance\":\"0.00\",\"Type\":\"SALES-TEAM\",\"Vendedor\":\"\",\"Currency\":\"USD\",\"Currency_Rate\":\"1.000000000\"},\"Lines\":[]}],\"count\":\"1\"}"
  }
]
```

**Output esperado:**
- Búsqueda por teléfono `50768279739` → encontrado en Devotio ✓
- Cashback calculado: `$44.50 × 2% = $0.89`
- Supabase: fila con `status: processed`, `cashback_amount: 0.89`
- Devotio: balance de Pamela sube $0.89

---

### Escenario 2 — Fallback por email (teléfono no coincide, email sí)

**Objetivo:** Demostrar la búsqueda secundaria por email cuando el número no está en Devotio.

> ⚠️ Verificar antes: el email de Pamela debe estar registrado en Devotio. Si no, agregarlo en el admin de Devotio.

**Pin 1 — `Obtener Facturas InterFuerza`:**
```json
[
  {
    "data": "{\"class\":\"GET\",\"action\":\"invoices\",\"invoices\":[{\"Invoice\":{\"id\":\"INV00024\",\"Cliente\":\"C0008\",\"Nombre\":\"PAMELA VILLARREAL\",\"Pais\":\"PANAMA\",\"Bodega\":\"Sucursal Norte\",\"Status\":\"DELIVERED\",\"Date\":\"2024-12-17\",\"Comentario\":\"\",\"SubTotal\":\"27.43\",\"Discount\":\"0.00\",\"Taxes\":\"1.92\",\"Total\":\"29.35\",\"Credit_Term\":\"C.O.D.\",\"Balance\":\"0.00\",\"Type\":\"SALES-TEAM\",\"Vendedor\":\"\",\"Currency\":\"USD\",\"Currency_Rate\":\"1.000000000\"},\"Lines\":[]}],\"count\":\"1\"}"
  }
]
```

**Pin 2 — `Obtener Cliente InterFuerza`** (cliente con teléfono ficticio pero email real de Pamela):
```json
[
  {
    "data": "{\"customer\":{\"Nombre\":\"PAMELA VILLARREAL\",\"Telefono_1\":\"60000099\",\"Cellular\":\"\",\"Email\":\"pam051296@hotmail.com\",\"Direccion\":\"Panama\",\"Pais\":\"PANAMA\"}}"
  }
]
```

**Output esperado:**
- Búsqueda por teléfono `50760000099` → no encontrado en Devotio
- Búsqueda por email `pam051296@hotmail.com` → encontrado ✓
- Cashback: `$29.35 × 2% = $0.59`, status `processed`

---

### Escenario 3 — Sin match → transacción pendiente

**Objetivo:** Mostrar qué pasa cuando el cliente no está en Devotio — queda pendiente para resolución manual.

**Pin 1 — `Obtener Facturas InterFuerza`:**
```json
[
  {
    "data": "{\"class\":\"GET\",\"action\":\"invoices\",\"invoices\":[{\"Invoice\":{\"id\":\"INV00025\",\"Cliente\":\"C0015\",\"Nombre\":\"CARLOS MENDOZA\",\"Pais\":\"PANAMA\",\"Bodega\":\"Bodega Principal\",\"Status\":\"DELIVERED\",\"Date\":\"2024-12-18\",\"Comentario\":\"\",\"SubTotal\":\"53.10\",\"Discount\":\"0.00\",\"Taxes\":\"3.72\",\"Total\":\"56.82\",\"Credit_Term\":\"C.O.D.\",\"Balance\":\"0.00\",\"Type\":\"SALES-TEAM\",\"Vendedor\":\"\",\"Currency\":\"USD\",\"Currency_Rate\":\"1.000000000\"},\"Lines\":[]}],\"count\":\"1\"}"
  }
]
```

**Pin 2 — `Obtener Cliente InterFuerza`:**
```json
[
  {
    "data": "{\"customer\":{\"Nombre\":\"CARLOS MENDOZA\",\"Telefono_1\":\"60000001\",\"Cellular\":\"\",\"Email\":\"carlos.mendoza.test@noemail.com\",\"Direccion\":\"Panama\",\"Pais\":\"PANAMA\"}}"
  }
]
```

**Output esperado:**
- Teléfono y email sin match en Devotio
- Supabase: fila con `status: pending`
- Dashboard → Configuración: aparece Carlos Mendoza con botón "Resolver →"

---

### Escenario 4 — Canje de cashback (Dashboard)

**Objetivo:** Demostrar que el cajero puede procesar un canje en segundos.

**Pasos en el dashboard:**
1. Ir a **Canjear Cashback** en el menú lateral
2. Escribir el teléfono del cliente (ej. `50768279739`) y presionar Buscar
3. Mostrar el balance acumulado de Pamela
4. Click en **Canjear** → modal se abre con el monto disponible
5. Ajustar el monto si el cliente quiere canje parcial → Confirmar
6. Toast verde de confirmación → balance reducido en Devotio

> No requiere pin data — funciona con la API de Devotio en vivo.

---

### Escenario 5 — Resolución manual de pendiente (Dashboard)

**Objetivo:** Demostrar que el gerente puede resolver un cliente sin match desde Configuración.

> Ejecutar después del Escenario 3 — INV00014 (Carlos Mendoza) debe estar en Supabase como `pending`.

**Pasos en el dashboard:**
1. Ir a **Configuración** → sección "Transacciones pendientes"
2. Ver la fila de Carlos Mendoza · Factura #INV00014 · $56.82
3. Click **Resolver →**
4. Modal: buscar por nombre/teléfono/email el cliente correcto en Devotio
5. Seleccionar el cliente → pantalla de confirmación
6. Click **Confirmar ✓**
7. Toast verde "Cashback acreditado" → fila desaparece del panel

---

### Orden sugerido para la demo

```
Escenario 1  →  mostrar Live Feed en Overview actualizándose
Escenario 3  →  mostrar badge "pendiente" en Configuración
Escenario 5  →  resolver el pendiente de Carlos en vivo
Escenario 4  →  canjear el cashback acumulado de Pamela
Escenario 2  →  cerrar con el fallback de email como feature extra
```

---

## Parte 2 — Checklist de Puesta en Producción

### N8N

> **Nota técnica:** el workflow usa valores directamente en los nodos (no Variables globales de N8N, que requieren plan Team). Los valores se configuran en el JSON antes de importar o editando cada nodo después.

- [ ] **Preparar el JSON con las keys del cliente**
  - Abrir `n8n/interfuerza-devotio-workflow-v2.json` en un editor de texto (VSCode, Sublime, etc.)
  - Hacer Find & Replace de los siguientes valores:

  | Buscar | Reemplazar con |
  |---|---|
  | `__DEVOTIO_API_KEY__` | API key de Devotio del cliente |
  | `__INTERFUERZA_TOKEN__` | Token de InterFuerza del cliente |
  | `__SUPABASE_SERVICE_KEY__` | Service role key del Supabase del cliente |
  | `TU-PROYECTO.supabase.co` | URL del proyecto Supabase del cliente |
  | `https://api.digitalwallet.cards/api/v2` | Verificar (debería ser la misma URL) |

  - Guardar el archivo con otro nombre (ej. `interfuerza-devotio-cliente-READY.json`)
  - **No subir ese archivo a git** — contiene keys en texto plano

- [ ] **Importar el workflow**
  - N8N del cliente → **Workflows** → **Import from file** → seleccionar el JSON preparado

- [ ] **Quitar todos los Pin Data**
  - Nodo "Obtener Facturas InterFuerza" → botón Pin → quitar
  - Nodo "Obtener Cliente InterFuerza" → verificar que no tenga pin
  - Revisar que ningún nodo tenga el ícono de pin activo

- [ ] **Ajustar punto de inicio en Supabase** (para no reingesar facturas históricas)
  ```sql
  UPDATE sync_state
  SET value = NOW()::TEXT, updated_at = NOW()
  WHERE key = 'last_processed_at';
  ```

- [ ] **Activar el trigger**
  - Click en el nodo "Cada 20 Minutos" → Activate
  - Confirmar que el workflow aparece como "Active" en el listado de N8N

---

### Vercel

> **El deploy se mantiene en la cuenta del desarrollador** — el cliente no necesita cuenta de Vercel ni de GitHub. Esto es parte del modelo de mantenimiento mensual: el desarrollador controla la infraestructura y el código. Si en el futuro el cliente quisiera independizarse, se transfiere el repo y el proyecto de Vercel en ese momento.
>
> **Costo:** Vercel Hobby es suficiente para este proyecto (tráfico bajo, funciones rápidas). No se requiere plan Pro a menos que se escale a múltiples clientes en el mismo equipo.

- [ ] **Actualizar variables de entorno** (Vercel → proyecto → Settings → Environment Variables)

  | Variable | Acción |
  |---|---|
  | `DEVOTIO_API_KEY` | Cambiar a la key de producción |
  | `NEXT_PUBLIC_SUPABASE_URL` | Actualizar si se migra a Supabase del cliente |
  | `SUPABASE_SERVICE_ROLE_KEY` | Actualizar si se migra a Supabase del cliente |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Actualizar si se migra a Supabase del cliente |
  | `DEVOTIO_API_URL` | Verificar |

- [ ] **Redeploy** → Deployments → botón "Redeploy" en el último deployment para que tomen efecto las variables

- [ ] **Verificar URL del dashboard** — compartir con el cliente

---

### Supabase

> **Cambiar de Supabase no requiere cambios en el código.** Solo son variables de entorno. Si se migra a un proyecto Supabase del cliente, los pasos son los indicados abajo.

#### Opción A — Mantener Supabase del desarrollador (más simple)
No hay nada que hacer en esta sección. Solo verificar que Realtime y el usuario del cliente estén configurados.

#### Opción B — Migrar a Supabase propio del cliente
- [ ] Crear proyecto nuevo en [supabase.com](https://supabase.com)
- [ ] Ejecutar el schema en SQL Editor → copiar y pegar el contenido de `supabase/schema.sql`
- [ ] Habilitar Realtime en las tablas `transactions` y `redemptions`
  - Supabase → Database → Replication → activar ambas tablas
- [ ] Copiar las nuevas keys (URL, anon key, service role key) a Vercel y N8N
- [ ] Redeploy en Vercel

#### En cualquier caso:
- [ ] **Crear usuario de acceso al dashboard para el cliente**
  - Supabase → Authentication → Users → Invite User
  - Email del gerente del cliente → recibe correo para crear su contraseña

- [ ] **Ajustar `last_processed_at`** (mismo comando que en la sección N8N arriba)

- [ ] **Verificar RLS** — solo usuarios autenticados pueden leer/escribir

---

### Verificación post-deploy (5 minutos)

1. Que el cliente haga una factura real de prueba en InterFuerza
2. Esperar máximo 20 minutos (o ejecutar el workflow manualmente en N8N una vez)
3. Verificar en Supabase:
   ```sql
   SELECT invoice_id, customer_name, amount, cashback_amount, status
   FROM transactions
   ORDER BY created_at DESC
   LIMIT 1;
   ```
4. Confirmar que aparece en el Live Feed del dashboard
5. Abrir Devotio y verificar que el balance del cliente subió

---

## Parte 3 — Entregables al Cliente

- [ ] URL del dashboard con credenciales de acceso (email + contraseña temporal)
- [ ] Guía de usuario PDF (adjuntar)
- [ ] Acuerdo de mantenimiento mensual — $24/mes cubre:
  - Monitoreo del workflow N8N
  - Ajustes de configuración
  - Soporte en caso de fallas de integración
  - Actualizaciones menores del dashboard

---

## Notas técnicas para referencia

| Componente | Detalle |
|---|---|
| Dashboard URL | Vercel — cuenta del desarrollador (cliente no necesita cuenta) |
| Repo GitHub | Cuenta empresarial del desarrollador — no se entrega al cliente |
| Base de datos | Supabase — cuenta del desarrollador o del cliente (solo cambian env vars) |
| Automatización | N8N Cloud — corre cada 20 min |
| API Cashback | Devotio Rewards / DigitalWalletCards v2 |
| API POS | InterFuerza v4 |
| Cashback % | Configurable desde el dashboard → Configuración |
| Ejecuciones N8N | ~2,160/mes (dentro del límite de 2,500 del plan Starter) |
| Costo infraestructura | Vercel Hobby $0 · Supabase Free tier $0 · N8N Starter $24/mes |
| Schema de BD | `supabase/schema.sql` — correr en cualquier proyecto Supabase nuevo |
