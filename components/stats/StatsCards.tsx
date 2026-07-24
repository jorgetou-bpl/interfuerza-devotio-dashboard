import { createClient } from '@/lib/supabase/server'

interface StatsCardsProps {
  from: string
  to: string
  periodLabel: string
}

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

export default async function StatsCards({ from, to, periodLabel }: StatsCardsProps) {
  const supabase = await createClient()

  const fromISO = `${from}T00:00:00.000Z`
  const toISO = `${to}T23:59:59.999Z`

  const [periodResult, pendingResult, syncResult] = await Promise.all([
    supabase
      .from('transactions')
      .select('amount, cashback_amount, status')
      .gte('transaction_date', fromISO)
      .lte('transaction_date', toISO),
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gte('transaction_date', fromISO)
      .lte('transaction_date', toISO),
    supabase
      .from('sync_state')
      .select('value')
      .eq('key', 'last_processed_at')
      .maybeSingle(),
  ])

  type TxRow = { amount: number; cashback_amount: number | null; status: string }
  const txRows = (periodResult.data ?? []) as TxRow[]
  const pendingCount = pendingResult.count ?? 0
  const syncValue = (syncResult.data as { value: string } | null)?.value

  const processed = txRows.filter((t) => t.status === 'processed')
  const totalCashback = processed.reduce((sum, t) => sum + (t.cashback_amount ?? 0), 0)

  const lastSync = syncValue
    ? new Date(syncValue).toLocaleString('es', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Panama',
      })
    : '—'

  const rangeLabel = from === to ? from : `${from} → ${to}`

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card
        label="Transacciones"
        value={String(txRows.length)}
        sub={periodLabel}
        color="blue"
      />
      <Card
        label="Cashback acreditado"
        value={`$${totalCashback.toFixed(2)}`}
        sub={periodLabel}
        color="emerald"
      />
      <Card
        label="Sin match Devotio"
        value={String(pendingCount)}
        sub={rangeLabel}
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
