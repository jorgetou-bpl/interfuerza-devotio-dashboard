import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/SettingsForm'
import PendingResolutionPanel from '@/components/settings/PendingResolutionPanel'
import type { Transaction } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

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

        <PendingResolutionPanel pending={pendingData} />
      </div>
    </div>
  )
}
