import { Badge } from '@/components/ui/badge'
import type { Transaction } from '@/lib/supabase/types'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const statusConfig = {
  processed: { label: 'Procesado', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  pending: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  error: { label: 'Error', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

export default function TransactionCard({ tx }: { tx: Transaction }) {
  const cfg = statusConfig[tx.status] ?? statusConfig.pending
  const ago = formatDistanceToNow(new Date(tx.created_at), { addSuffix: true, locale: es })

  return (
    <div className="flex items-start gap-4 px-4 py-3 border-b border-gray-800 hover:bg-gray-900/50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-white text-sm font-medium truncate">
            {tx.customer_name ?? tx.customer_phone ?? 'Cliente desconocido'}
          </p>
          <Badge variant="outline" className={`text-xs flex-shrink-0 ${cfg.className}`}>
            {cfg.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-gray-400 text-xs">
            Factura #{tx.invoice_id}
          </span>
          {tx.branch && (
            <span className="text-gray-500 text-xs">{tx.branch}</span>
          )}
          <span className="text-gray-600 text-xs">{ago}</span>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-white text-sm font-semibold">${Number(tx.amount).toFixed(2)}</p>
        {tx.cashback_amount != null && tx.cashback_amount > 0 && (
          <p className="text-emerald-400 text-xs mt-0.5">+${Number(tx.cashback_amount).toFixed(2)} CB</p>
        )}
      </div>
    </div>
  )
}
