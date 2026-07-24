'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

type Period = 'today' | 'week' | 'month' | 'custom'

const TABS: { id: Period; label: string }[] = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'custom', label: 'Personalizado' },
]

export default function PeriodFilter() {
  const router = useRouter()
  const params = useSearchParams()
  const period = (params.get('period') ?? 'today') as Period

  const [from, setFrom] = useState(params.get('from') ?? '')
  const [to, setTo] = useState(params.get('to') ?? '')

  function selectPeriod(p: Period) {
    const url = new URLSearchParams({ period: p })
    router.push(`?${url.toString()}`)
  }

  function applyCustom() {
    if (!from || !to) return
    const url = new URLSearchParams({ period: 'custom', from, to })
    router.push(`?${url.toString()}`)
  }

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Panama' })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => selectPeriod(tab.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              period === tab.id
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {period === 'custom' && (
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="date"
            value={from}
            max={today}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          />
          <span className="text-gray-500 text-sm">→</span>
          <input
            type="date"
            value={to}
            min={from}
            max={today}
            onChange={(e) => setTo(e.target.value)}
            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={applyCustom}
            disabled={!from || !to}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  )
}
