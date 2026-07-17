import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import type { Transaction, TransactionStatus } from '@/lib/supabase/types'

const statusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  processed: { label: 'Procesado', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  pending: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  error: { label: 'Error', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
}

interface SearchParams {
  status?: string
  branch?: string
  q?: string
  page?: string
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const pageSize = 30
  const page = Number(params.page ?? 1)
  const offset = (page - 1) * pageSize

  let query = supabase
    .from('transactions')
    .select('*', { count: 'exact' })
    .order('transaction_date', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (params.status && params.status !== 'all') {
    query = query.eq('status', params.status)
  }
  if (params.branch) {
    query = query.ilike('branch', `%${params.branch}%`)
  }
  if (params.q) {
    query = query.or(
      `customer_name.ilike.%${params.q}%,customer_phone.ilike.%${params.q}%,invoice_id.ilike.%${params.q}%`
    )
  }

  const { data, count } = await query
  const transactions = (data as Transaction[]) ?? []
  const totalPages = Math.ceil((count ?? 0) / pageSize)

  return (
    <div className="px-6 py-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Transacciones</h1>
        <p className="text-gray-500 text-sm mt-0.5">{count ?? 0} registros totales</p>
      </div>

      <form method="GET" className="flex gap-3 flex-wrap">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Buscar cliente, teléfono o factura..."
          className="flex-1 min-w-52 bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500"
        />
        <select
          name="status"
          defaultValue={params.status ?? 'all'}
          className="bg-gray-900 border border-gray-700 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Todos los estados</option>
          <option value="processed">Procesado</option>
          <option value="pending">Pendiente</option>
          <option value="error">Error</option>
        </select>
        <input
          name="branch"
          defaultValue={params.branch}
          placeholder="Sucursal..."
          className="bg-gray-900 border border-gray-700 text-white placeholder-gray-500 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-md transition-colors"
        >
          Filtrar
        </button>
        {(params.q || params.status || params.branch) && (
          <a
            href="/transactions"
            className="text-gray-400 hover:text-white text-sm px-4 py-2 rounded-md border border-gray-700 transition-colors"
          >
            Limpiar
          </a>
        )}
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Factura</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Cliente</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Monto</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Cashback</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Sucursal</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Fecha</th>
              <th className="text-left text-gray-500 text-xs uppercase tracking-wide px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                  No hay transacciones con esos filtros.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const cfg = statusConfig[tx.status] ?? statusConfig.pending
                const raw = tx.transaction_date ?? tx.created_at
                const dateStr = raw
                  ? new Date(raw).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '—'
                return (
                  <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{tx.invoice_id}</td>
                    <td className="px-4 py-3">
                      <p className="text-white">{tx.customer_name ?? '—'}</p>
                      {tx.customer_phone && (
                        <p className="text-gray-500 text-xs">{tx.customer_phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white font-semibold">${Number(tx.amount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-emerald-400">
                      {tx.cashback_amount != null && tx.cashback_amount > 0
                        ? `+$${Number(tx.cashback_amount).toFixed(2)}`
                        : <span className="text-gray-600">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-400">{tx.branch ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{dateStr}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                        {cfg.label}
                      </Badge>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-sm">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/transactions?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                Anterior
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/transactions?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                Siguiente
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
