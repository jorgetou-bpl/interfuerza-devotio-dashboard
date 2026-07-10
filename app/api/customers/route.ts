import { NextRequest, NextResponse } from 'next/server'
import { searchCustomers, getCustomerCard } from '@/lib/devotio'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.trim().length < 3) {
    return NextResponse.json({ error: 'Query demasiado corta' }, { status: 400 })
  }

  const devotioCustomers = await searchCustomers(q.trim())

  if (devotioCustomers.length === 0) {
    return NextResponse.json({ customer: null, customers: [] }, { status: 200 })
  }

  const withCards = await Promise.all(
    devotioCustomers.map(async (c) => {
      const card = await getCustomerCard(c.id)
      if (!card) return null
      return {
        id: c.id,
        name: `${c.firstName} ${c.surname}`.trim(),
        phone: c.phone,
        email: c.email,
        cardId: card.id,
        balance: card.points,
        points: card.points,
      }
    })
  )

  const customers = withCards.filter(Boolean) as NonNullable<typeof withCards[number]>[]

  return NextResponse.json({
    customer: customers[0] ?? null,   // backward compat for CustomerSearch
    customers,
  })
}
