import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/SettingsForm'
import type { Transaction } from '@/lib/supabase/types'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data: settingsRaw } = await supabase
    .from('sync_state')
    .select('key, value')
    .in('key', ['cashback_percentage', 'last_processed_at'])

  const settings = (settingsRaw ?? []) as Array<{ key: string; value: string }>
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))

  const { data: pendingRaw } = await supabase
    .from('transactions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(20)

  const pendingData = (pendingRaw ?? []) as Transaction[]

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Configuración</h1>
        <p className="text-gray-500 text-sm mt-0.5">Estado de la integración y parámetros</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SettingsForm
          cashbackPct={settingsMap['cashback_percentage'] ?? '5'}
          lastSync={settingsMap['last_processed_at'] ?? null}
        />

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h2 className="text-white text-sm font-semibold">
              Transacciones pendientes
              {pendingData.length > 0 && (
                <span className="ml-2 bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                  {pendingData.length}
                </span>
              )}
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">Clientes sin tarjeta Devotio</p>
          </div>
          {pendingData.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              Sin pendientes — todas las transacciones procesadas ✓
            </div>
          ) : (
            pendingData.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm">{tx.customer_name ?? tx.customer_phone ?? 'Sin datos'}</p>
                  <p className="text-gray-500 text-xs">Factura #{tx.invoice_id} · {tx.branch ?? '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-semibold">${Number(tx.amount).toFixed(2)}</p>
                  <p className="text-amber-400 text-xs">Sin match</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
