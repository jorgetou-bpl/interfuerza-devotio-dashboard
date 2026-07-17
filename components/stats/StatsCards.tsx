import { createClient } from '@/lib/supabase/server'

interface StatCard {
  label: string
  value: string
  sub?: string
  color: 'emerald' | 'blue' | 'amber' | 'red'
}

function Card({ label, value, sub, color }: StatCard) {
  const dot: Record<StatCard['color'], string> = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-400',
    red: 'bg-red-500',
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full ${dot[color]}`} />
        <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}

export default async function StatsCards() {
  const supabase = await createClient()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayISO = today.toISOString()

  const [todayResult, pendingResult, syncResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount, cashback_amount, status')
      .gte('created_at', todayISO),
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('sync_state')
      .select('value')
      .eq('key', 'last_processed_at')
      .maybeSingle(),
  ])

  type TxRow = { amount: number; cashback_amount: number | null; status: string }
  const todayTx = (todayResult.data ?? []) as TxRow[]
  const pendingCount = pendingResult.count ?? 0
  const syncValue = (syncResult.data as { value: string } | null)?.value

  const processed = todayTx.filter((t) => t.status === 'processed')
  const totalCashback = processed.reduce((sum, t) => sum + (t.cashback_amount ?? 0), 0)
  const txCount = todayTx.length

  const lastSync = syncValue
    ? new Date(syncValue).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Transacciones hoy"
        value={String(txCount)}
        sub="desde las 00:00"
        color="blue"
      />
      <Card
        label="Cashback acreditado"
        value={`$${totalCashback.toFixed(2)}`}
        sub="hoy"
        color="emerald"
      />
      <Card
        label="Sin match Devotio"
        value={String(pendingCount)}
        sub="clientes no registrados"
        color="amber"
      />
      <Card
        label="Última sync N8N"
        value={lastSync}
        sub="actualiza cada ~20 min"
        color="blue"
      />
    </div>
  )
}
