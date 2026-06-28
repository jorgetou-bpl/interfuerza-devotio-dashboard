-- ============================================================
-- InterFuerza × Devotio Rewards — Supabase Schema
-- Ejecutar en Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabla principal de transacciones (N8N inserta aquí)
CREATE TABLE IF NOT EXISTS transactions (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id             TEXT UNIQUE NOT NULL,
  customer_name          TEXT,
  customer_phone         TEXT,
  customer_email         TEXT,
  amount                 DECIMAL(10,2) NOT NULL,
  cashback_amount        DECIMAL(10,2),
  cashback_pct           DECIMAL(5,2),
  branch                 TEXT,
  transaction_date       TIMESTAMPTZ,
  status                 TEXT NOT NULL DEFAULT 'processed',
  devotio_customer_id    TEXT,
  devotio_transaction_id TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_phone ON transactions(customer_phone);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice_id ON transactions(invoice_id);

-- Tabla de redenciones (dashboard las inicia)
CREATE TABLE IF NOT EXISTS redemptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_phone        TEXT,
  customer_email        TEXT,
  customer_name         TEXT,
  devotio_customer_id   TEXT,
  amount_redeemed       DECIMAL(10,2) NOT NULL,
  status                TEXT NOT NULL DEFAULT 'pending',
  devotio_redemption_id TEXT,
  initiated_by          TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at          TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_redemptions_created_at ON redemptions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_redemptions_customer_phone ON redemptions(customer_phone);

-- Estado de sincronización (N8N lee y escribe aquí)
CREATE TABLE IF NOT EXISTS sync_state (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Valores iniciales
INSERT INTO sync_state (key, value) VALUES
  ('last_processed_at', to_char(NOW() - interval '1 hour', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')),
  ('cashback_percentage', '5')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- Row Level Security
-- N8N usa service_role_key (bypasa RLS)
-- Dashboard usa anon_key (respeta RLS, requiere auth)
-- ============================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados del dashboard pueden leer/escribir
CREATE POLICY "authenticated_users_transactions"
  ON transactions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_users_redemptions"
  ON redemptions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- sync_state: solo service_role puede escribir (N8N)
-- el dashboard puede leer en modo servidor con service_role_key
ALTER TABLE sync_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_read_sync_state"
  ON sync_state FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- Habilitar Realtime
-- También ir a Supabase Dashboard > Database > Replication
-- y habilitar las tablas: transactions, redemptions
-- ============================================================
-- Ejecutar en SQL Editor:
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE redemptions;
