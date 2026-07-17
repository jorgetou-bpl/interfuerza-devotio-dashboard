'use client'

import { useState } from 'react'
import CustomerSearch from './CustomerSearch'
import type { Redemption } from '@/lib/supabase/types'

interface Props {
  redemptions: Redemption[]
}

export default function CustomersClientView({ redemptions }: Props) {
  const [tab, setTab] = useState<'search' | 'history'>('search')

  return (
    <div>
      <div className="flex gap-1 border-b border-gray-800 mb-6">
        <TabButton active={tab === 'search'} onClick={() => setTab('search')}>
          Canjear cashback
        </TabButton>
        <TabButton
          active={tab === 'history'}
          onClick={() => setTab('history')}
          badge={redemptions.length > 0 ? redemptions.length : undefined}
        >
          Historial de canjes
        </TabButton>
      </div>

      {tab === 'search' && <CustomerSearch />}
      {tab === 'history' && <RedemptionHistory redemptions={redemptions} />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
  badge,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? 'border-emerald-500 text-white'
          : 'border-transparent text-gray-500 hover:text-gray-300'
      }`}
    >
      {children}
      {badge !== undefined && (
        <span className="bg-gray-700 text-gray-400 text-xs px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  )
}

function RedemptionHistory({ redemptions }: { redemptions: Redemption[] }) {
  if (redemptions.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 text-sm">No hay canjes registrados aún.</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {redemptions.map((r) => {
        const ago = new Date(r.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
        const statusClass =
          r.status === 'confirmed'
            ? 'text-emerald-400 bg-emerald-400/10'
            : r.status === 'failed'
            ? 'text-red-400 bg-red-400/10'
            : 'text-amber-400 bg-amber-400/10'
        const statusLabel =
          r.status === 'confirmed'
            ? 'Confirmado'
            : r.status === 'failed'
            ? 'Fallido'
            : 'Pendiente'

        return (
          <div
            key={r.id}
            className="flex items-center justify-between px-4 py-3.5 border-b border-gray-800 last:border-0"
          >
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {r.customer_name ?? r.customer_phone ?? '—'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-gray-500 text-xs">{ago}</span>
                {r.initiated_by && r.initiated_by !== 'dashboard' && (
                  <>
                    <span className="text-gray-700 text-xs">·</span>
                    <span className="text-gray-600 text-xs truncate">{r.initiated_by}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
              <p className="text-white text-sm font-semibold">
                -${Number(r.amount_redeemed).toFixed(2)}
              </p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-0.5 ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
