import { createClient } from '@/lib/supabase/server'
import type { Transaction } from '@/lib/supabase/types'
import TransactionsTable from '@/components/transactions/TransactionsTable'

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

      <div className="flex gap-3 flex-wrap items-start">
        <form method="GET" className="flex gap-3 flex-wrap flex-1">
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

        <a
          href={`/api/transactions/export?${new URLSearchParams({
            ...(params.status && params.status !== 'all' ? { status: params.status } : {}),
            ...(params.branch ? { branch: params.branch } : {}),
            ...(params.q ? { q: params.q } : {}),
          })}`}
          download
          className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-md border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-colors whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar CSV
        </a>
      </div>

      <TransactionsTable transactions={transactions} />

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
