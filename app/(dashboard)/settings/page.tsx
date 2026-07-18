import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()

  const [settingsResult, pendingResult] = await Promise.all([
    supabase
      .from('sync_state')
      .select('key, value')
      .in('key', ['cashback_percentage', 'last_processed_at']),
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  const settings = (settingsResult.data ?? []) as Array<{ key: string; value: string }>
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))
  const pendingCount = pendingResult.count ?? 0

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

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
          <h2 className="text-white text-sm font-semibold">Transacciones sin match</h2>
          <p className="text-gray-500 text-xs">
            Facturas donde el cliente no fue encontrado en Devotio Rewards. Se resuelven
            directamente desde la tabla de transacciones.
          </p>

          <div className="flex items-center justify-between bg-gray-800/60 rounded-xl px-4 py-3">
            <div>
              <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
              <p className="text-gray-500 text-xs mt-0.5">pendientes de resolver</p>
            </div>
            {pendingCount > 0 && (
              <a
                href="/transactions?status=pending"
                className="text-xs px-3 py-1.5 rounded-md bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20 transition-colors whitespace-nowrap"
              >
                Ver y resolver →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
