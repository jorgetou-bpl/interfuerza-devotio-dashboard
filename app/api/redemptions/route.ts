import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { subtractPoints, getCard } from '@/lib/devotio'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { cardId, customerId, customerName, customerPhone, customerEmail, amount } = body

  if (!cardId || !amount || typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const { data: { user } } = await supabase.auth.getUser()

  try {
    await subtractPoints(cardId, amount, 'Canje cashback')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error en Devotio API'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const updatedCard = await getCard(cardId)
  const newBalance = updatedCard?.points ?? 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('redemptions') as any).insert({
    customer_phone: customerPhone ?? null,
    customer_email: customerEmail ?? null,
    customer_name: customerName ?? null,
    devotio_customer_id: customerId ?? null,
    devotio_card_id: cardId,
    amount_redeemed: amount,
    status: 'confirmed',
    initiated_by: user?.email ?? 'dashboard',
    completed_at: new Date().toISOString(),
  })

  return NextResponse.json({ success: true, newBalance })
}
