-- Seed data for dashboard testing
-- Run this in Supabase SQL Editor after the schema is applied

-- Clear existing test data (safe to re-run)
DELETE FROM redemptions WHERE customer_phone IN ('+50688881111', '+50677772222', '+50655553333');
DELETE FROM transactions WHERE invoice_id LIKE 'TEST-%';

-- Scenario 1: Cliente encontrado en Devotio → cashback procesado
INSERT INTO transactions (
  invoice_id, customer_name, customer_phone, customer_email,
  amount, cashback_amount, cashback_pct, branch,
  transaction_date, status, devotio_customer_id, devotio_transaction_id
) VALUES
  (
    'TEST-001',
    'María González',
    '+50688881111',
    'maria.gonzalez@email.com',
    45.00, 2.25, 5.00,
    'Sucursal Central',
    NOW() - INTERVAL '2 hours',
    'processed',
    'dev-cust-001',
    'dev-txn-001'
  ),
  (
    'TEST-002',
    'Carlos Rodríguez',
    '+50688881111',
    'maria.gonzalez@email.com',
    128.50, 6.43, 5.00,
    'Sucursal Norte',
    NOW() - INTERVAL '45 minutes',
    'processed',
    'dev-cust-001',
    'dev-txn-002'
  );

-- Scenario 2: Cliente no tiene cuenta Devotio → transacción pendiente
INSERT INTO transactions (
  invoice_id, customer_name, customer_phone, customer_email,
  amount, cashback_amount, cashback_pct, branch,
  transaction_date, status, devotio_customer_id, devotio_transaction_id
) VALUES
  (
    'TEST-003',
    'Roberto Jiménez',
    '+50677772222',
    'roberto.j@empresa.cr',
    76.20, NULL, 5.00,
    'Sucursal Central',
    NOW() - INTERVAL '3 hours',
    'pending',
    NULL,
    NULL
  ),
  (
    'TEST-004',
    'Ana Vargas',
    '+50655553333',
    NULL,
    23.50, NULL, 5.00,
    'Sucursal Sur',
    NOW() - INTERVAL '1 hour',
    'pending',
    NULL,
    NULL
  ),
  (
    'TEST-005',
    'Luis Mora',
    '+50655553333',
    NULL,
    89.00, NULL, 5.00,
    'Sucursal Norte',
    NOW() - INTERVAL '20 minutes',
    'pending',
    NULL,
    NULL
  );

-- Scenario 3: Más transacciones procesadas para ver estadísticas del día
INSERT INTO transactions (
  invoice_id, customer_name, customer_phone, customer_email,
  amount, cashback_amount, cashback_pct, branch,
  transaction_date, status, devotio_customer_id, devotio_transaction_id
) VALUES
  (
    'TEST-006',
    'Sofía Castro',
    '+50699994444',
    'sofia.c@gmail.com',
    52.30, 2.62, 5.00,
    'Sucursal Central',
    NOW() - INTERVAL '4 hours',
    'processed',
    'dev-cust-002',
    'dev-txn-006'
  ),
  (
    'TEST-007',
    'Diego Herrera',
    '+50611115555',
    'dherrera@correo.com',
    34.80, 1.74, 5.00,
    'Sucursal Sur',
    NOW() - INTERVAL '5 hours',
    'processed',
    'dev-cust-003',
    'dev-txn-007'
  ),
  (
    'TEST-008',
    'Valentina López',
    '+50622226666',
    'vlopez@email.com',
    198.00, 9.90, 5.00,
    'Sucursal Norte',
    NOW() - INTERVAL '6 hours',
    'processed',
    'dev-cust-004',
    'dev-txn-008'
  );

-- Scenario 4: Una redención iniciada desde el dashboard
INSERT INTO redemptions (
  customer_phone, customer_email, customer_name,
  devotio_customer_id, amount_redeemed,
  status, devotio_redemption_id, initiated_by,
  created_at, completed_at
) VALUES
  (
    '+50688881111',
    'maria.gonzalez@email.com',
    'María González',
    'dev-cust-001',
    2.25,
    'confirmed',
    'dev-redemp-001',
    'gerente@negocio.com',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '29 minutes'
  );

-- Verify counts
SELECT
  'transactions' AS tabla,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE status = 'processed') AS procesadas,
  COUNT(*) FILTER (WHERE status = 'pending') AS pendientes,
  SUM(cashback_amount) FILTER (WHERE status = 'processed') AS cashback_total
FROM transactions
WHERE invoice_id LIKE 'TEST-%'
UNION ALL
SELECT
  'redemptions',
  COUNT(*),
  COUNT(*) FILTER (WHERE status = 'confirmed'),
  COUNT(*) FILTER (WHERE status = 'pending'),
  SUM(amount_redeemed)
FROM redemptions
WHERE customer_phone = '+50688881111';
