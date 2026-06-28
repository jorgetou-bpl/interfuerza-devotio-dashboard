import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redeemCashback } from '@/lib/devotio'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { customerId, customerName, customerPhone, customerEmail, amount } = body

  if (!customerId || !amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: { user } } = await supabase.auth.getUser()

  let devotioResult
  try {
    devotioResult = await redeemCashback(customerId, amount, user?.email ?? 'dashboard')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error en Devotio API'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('redemptions') as any).insert({
    customer_phone: customerPhone ?? null,
    customer_email: customerEmail ?? null,
    customer_name: customerName ?? null,
    devotio_customer_id: customerId,
    amount_redeemed: amount,
    status: devotioResult.status === 'confirmed' ? 'confirmed' : 'failed',
    devotio_redemption_id: devotioResult.redemption_id,
    initiated_by: user?.email ?? 'dashboard',
    completed_at: devotioResult.status === 'confirmed' ? new Date().toISOString() : null,
  })

  return NextResponse.json({
    success: true,
    newBalance: devotioResult.new_balance,
    redemptionId: devotioResult.redemption_id,
  })
}
