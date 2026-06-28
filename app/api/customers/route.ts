import { NextRequest, NextResponse } from 'next/server'
import { searchCustomer } from '@/lib/devotio'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')

  if (!q || q.trim().length < 3) {
    return NextResponse.json({ error: 'Query demasiado corta' }, { status: 400 })
  }

  const customer = await searchCustomer(q.trim())

  if (!customer) {
    return NextResponse.json({ customer: null }, { status: 200 })
  }

  return NextResponse.json({ customer })
}
