import { NextRequest, NextResponse } from 'next/server'
import { searchCustomer, getCustomerCard } from '@/lib/devotio'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.trim().length < 3) {
    return NextResponse.json({ error: 'Query demasiado corta' }, { status: 400 })
  }

  const devotioCustomer = await searchCustomer(q.trim())

  if (!devotioCustomer) {
    return NextResponse.json({ customer: null }, { status: 200 })
  }

  const card = await getCustomerCard(devotioCustomer.id)

  if (!card) {
    return NextResponse.json({ customer: null }, { status: 200 })
  }

  return NextResponse.json({
    customer: {
      id: devotioCustomer.id,
      name: `${devotioCustomer.firstName} ${devotioCustomer.surname}`.trim(),
      phone: devotioCustomer.phone,
      email: devotioCustomer.email,
      cardId: card.id,
      balance: card.points,
      points: card.points,
    },
  })
}
