import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Transaction } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const status = params.get('status')
  const branch = params.get('branch')
  const q = params.get('q')

  const supabase = await createClient()
  let query = supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status)
  if (branch) query = query.ilike('branch', `%${branch}%`)
  if (q)
    query = query.or(
      `customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%,invoice_id.ilike.%${q}%`
    )

  const { data } = await query
  const rows = (data as Transaction[]) ?? []

  const columns: Array<{ header: string; value: (tx: Transaction) => string }> = [
    { header: 'Factura', value: (tx) => tx.invoice_id },
    { header: 'Cliente', value: (tx) => tx.customer_name ?? '' },
    { header: 'Teléfono', value: (tx) => tx.customer_phone ?? '' },
    { header: 'Email', value: (tx) => tx.customer_email ?? '' },
    { header: 'Monto', value: (tx) => Number(tx.amount).toFixed(2) },
    {
      header: 'Cashback',
      value: (tx) =>
        tx.cashback_amount != null && tx.cashback_amount > 0
          ? Number(tx.cashback_amount).toFixed(2)
          : '',
    },
    { header: '% Cashback', value: (tx) => (tx.cashback_pct != null ? String(tx.cashback_pct) : '') },
    { header: 'Sucursal', value: (tx) => tx.branch ?? '' },
    { header: 'Fecha Factura', value: (tx) => tx.transaction_date ?? '' },
    { header: 'Estado', value: (tx) => tx.status },
  ]

  function csvField(s: string): string {
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const header = columns.map((c) => c.header).join(',')
  const body = rows
    .map((tx) => columns.map((c) => csvField(c.value(tx))).join(','))
    .join('\n')

  const csv = `${header}\n${body}`
  const filename = `transacciones_${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
