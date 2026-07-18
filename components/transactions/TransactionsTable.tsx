'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import type { Transaction, TransactionStatus } from '@/lib/supabase/types'
import { formatTxDateTime } from '@/lib/format'
import ResolveModal from '@/components/settings/ResolveModal'

const statusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  processed: { label: 'Procesado', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  pending: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  error: { label: 'Error', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

interface Props {
  transactions: Transaction[]
}

export default function TransactionsTable({ transactions: initial }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>(initial)
  const [resolving, setResolving] = useState<Transaction | null>(null)

  function handleResolved(transactionId: string) {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId ? { ...t, status: 'processed' as TransactionStatus } : t
      )
    )
    setResolving(null)
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-10 text-center text-gray-500 text-sm">
        No hay transacciones con esos filtros.
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">Factura</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Cliente</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">Monto</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3 whitespace-nowrap">Cashback</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Sucursal</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Fecha</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const cfg = statusConfig[tx.status] ?? statusConfig.pending
              const dateStr = formatTxDateTime(tx.transaction_date ?? tx.created_at)
              const isPending = tx.status === 'pending'

              return (
                <tr
                  key={tx.id}
                  className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">
                    #{tx.invoice_id}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">{tx.customer_name ?? '—'}</p>
                    {tx.customer_phone && (
                      <p className="text-gray-500 text-xs">{tx.customer_phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">
                    ${Number(tx.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {tx.cashback_amount != null && tx.cashback_amount > 0 ? (
                      <span className="text-emerald-400">
                        +${Number(tx.cashback_amount).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{tx.branch ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{dateStr}</td>
                  <td className="px-4 py-3">
                    {isPending ? (
                      <button
                        onClick={() => setResolving(tx)}
                        className="text-xs px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20 transition-colors whitespace-nowrap"
                      >
                        Resolver →
                      </button>
                    ) : (
                      <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                        {cfg.label}
                      </Badge>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
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
