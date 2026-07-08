import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { addPoints, getCard } from '@/lib/devotio'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { transactionId, cardId, devotioCustomerId } = body

  if (!transactionId || !cardId || !devotioCustomerId) {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tx } = await (supabase.from('transactions') as any)
    .select('*')
    .eq('id', transactionId)
    .single()

  if (!tx) {
    return NextResponse.json({ error: 'Transacción no encontrada' }, { status: 404 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: pctRow } = await (supabase.from('sync_state') as any)
    .select('value')
    .eq('key', 'cashback_percentage')
    .single()

  const cashbackPct = parseFloat(pctRow?.value ?? '2')
  const cashbackAmount = parseFloat((Number(tx.amount) * cashbackPct / 100).toFixed(2))

  try {
    await addPoints(cardId, cashbackAmount, Number(tx.amount), `Factura #${tx.invoice_id}`)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error en Devotio API'
    return NextResponse.json({ error: message }, { status: 502 })
  }

  const updatedCard = await getCard(cardId)
  const newBalance = updatedCard?.points ?? 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('transactions') as any)
    .update({
      status: 'processed',
      devotio_customer_id: devotioCustomerId,
      devotio_card_id: cardId,
      cashback_amount: cashbackAmount,
      cashback_pct: cashbackPct,
    })
    .eq('id', transactionId)

  return NextResponse.json({ success: true, cashbackAmount, newBalance })
}
