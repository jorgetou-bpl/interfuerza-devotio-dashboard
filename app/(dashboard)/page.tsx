import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import StatsCards from '@/components/stats/StatsCards'
import LiveFeed from '@/components/live-feed/LiveFeed'
import type { Transaction } from '@/lib/supabase/types'

async function RecentTransactions() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
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

export default function OverviewPage() {
  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Panel de Fidelidad</h1>
        <p className="text-gray-500 text-sm mt-0.5">InterFuerza × Devotio Rewards — tiempo real</p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <StatsCards />
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
