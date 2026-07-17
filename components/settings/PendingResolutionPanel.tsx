'use client'

import { useState } from 'react'
import ResolveModal from './ResolveModal'
import { formatTxDateTime } from '@/lib/format'
import type { Transaction } from '@/lib/supabase/types'

interface Props {
  pending: Transaction[]
}

export default function PendingResolutionPanel({ pending }: Props) {
  const [items, setItems] = useState<Transaction[]>(pending)
  const [resolving, setResolving] = useState<Transaction | null>(null)

  function handleResolved(transactionId: string) {
    setItems(prev => prev.filter(t => t.id !== transactionId))
    setResolving(null)
  }

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="text-white text-sm font-semibold">
            Transacciones pendientes
            {items.length > 0 && (
              <span className="ml-2 bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">Clientes sin tarjeta Devotio</p>
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            Sin pendientes — todas las transacciones procesadas ✓
          </div>
        ) : (
          items.map((tx) => {
            const dateStr = formatTxDateTime(tx.transaction_date ?? tx.created_at)
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-800 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-white text-sm">{tx.customer_name ?? tx.customer_phone ?? 'Sin datos'}</p>
                  <p className="text-gray-500 text-xs">
                    Factura #{tx.invoice_id} · {tx.branch ?? '—'}
                  </p>
                  <p className="text-gray-600 text-xs">{dateStr}</p>
                </div>
                <div className="text-right ml-4 flex-shrink-0 flex flex-col items-end gap-1.5">
                  <p className="text-white text-sm font-semibold">${Number(tx.amount).toFixed(2)}</p>
                  <button
                    onClick={() => setResolving(tx)}
                    className="text-xs px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20 transition-colors"
                  >
                    Resolver →
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {resolving && (
        <ResolveModal
          transaction={resolving}
          onResolved={handleResolved}
          onClose={() => setResolving(null)}
        />
      )}
    </>
  )
}
