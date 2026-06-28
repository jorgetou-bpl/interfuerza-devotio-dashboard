import CustomerSearch from '@/components/customers/CustomerSearch'
import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Redemption } from '@/lib/supabase/types'

export default async function CustomersPage() {
  const supabase = await createClient()

  const { data: recentRaw } = await supabase
    .from('redemptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const recent = (recentRaw ?? []) as Redemption[]

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Clientes</h1>
        <p className="text-gray-500 text-sm mt-0.5">Buscar balance y redimir cashback</p>
      </div>

      <CustomerSearch />

      {recent.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-gray-400 text-sm font-medium uppercase tracking-wide">
            Últimas redenciones
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            {recent.map((r) => {
              const ago = formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: es })
              const statusColor =
                r.status === 'confirmed'
                  ? 'text-emerald-400'
                  : r.status === 'failed'
                  ? 'text-red-400'
                  : 'text-amber-400'
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-4 py-3 border-b border-gray-800 last:border-0"
                >
                  <div>
                    <p className="text-white text-sm">{r.customer_name ?? r.customer_phone ?? '—'}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{ago}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-semibold">
                      -${Number(r.amount_redeemed).toFixed(2)}
                    </p>
                    <p className={`text-xs mt-0.5 ${statusColor}`}>
                      {r.status === 'confirmed' ? 'Confirmado' : r.status === 'failed' ? 'Fallido' : 'Pendiente'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
