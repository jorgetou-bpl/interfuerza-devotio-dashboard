import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/stats/StatsCards'
import PeriodFilter from '@/components/stats/PeriodFilter'
import LiveFeed from '@/components/live-feed/LiveFeed'
import type { Transaction } from '@/lib/supabase/types'

type SearchParams = Promise<{ period?: string; from?: string; to?: string }>

function getPeriodRange(
  period: string,
  customFrom: string,
  customTo: string,
  today: string,
): { from: string; to: string; label: string } {
  if (period === 'week') {
    const d = new Date(today + 'T12:00:00Z')
    const day = d.getUTCDay()
    const diff = day === 0 ? -6 : 1 - day
    const mon = new Date(d)
    mon.setUTCDate(d.getUTCDate() + diff)
    const from = mon.toISOString().slice(0, 10)
    return { from, to: today, label: `${from} → ${today}` }
  }
  if (period === 'month') {
    const from = today.slice(0, 7) + '-01'
    const [y, m] = today.split('-')
    const monthName = new Date(`${y}-${m}-15`).toLocaleString('es', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
    return { from, to: today, label: monthName }
  }
  if (period === 'custom' && customFrom && customTo) {
    return {
      from: customFrom,
      to: customTo,
      label: customFrom === customTo ? customFrom : `${customFrom} → ${customTo}`,
    }
  }
  return { from: today, to: today, label: `hoy, ${today}` }
}

async function RecentTransactions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .order('transaction_date', { ascending: false })
    .limit(30)

  return <LiveFeed initial={(data as Transaction[]) ?? []} />
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 animate-pulse">
          <div className="h-3 w-24 bg-gray-800 rounded mb-3" />
          <div className="h-8 w-16 bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  )
}

export default async function OverviewPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Panama' })
  const { from, to, label } = getPeriodRange(
    sp.period ?? 'today',
    sp.from ?? '',
    sp.to ?? '',
    today,
  )

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Panel de Fidelidad</h1>
        <p className="text-gray-500 text-sm mt-0.5">InterFuerza × Devotio Rewards — tiempo real</p>
      </div>

      <Suspense fallback={null}>
        <PeriodFilter />
      </Suspense>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards from={from} to={to} periodLabel={label} />
      </Suspense>

      <Suspense fallback={
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-10 text-center text-gray-500 animate-pulse text-sm">
          Cargando transacciones...
        </div>
      }>
        <RecentTransactions />
      </Suspense>
    </div>
  )
}
