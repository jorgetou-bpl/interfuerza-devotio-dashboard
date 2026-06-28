'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Transaction } from '@/lib/supabase/types'
import TransactionCard from './TransactionCard'

interface LiveFeedProps {
  initial: Transaction[]
}

export default function LiveFeed({ initial }: LiveFeedProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initial)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const supabase = createClient() // safe: runs only in browser

    const channel = supabase
      .channel('realtime:transactions')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'transactions' },
        (payload) => {
          setTransactions((prev) => [payload.new as Transaction, ...prev].slice(0, 50))
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="text-white text-sm font-semibold">Transacciones en vivo</h2>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-xs text-gray-500">{isLive ? 'En vivo' : 'Conectando...'}</span>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="px-4 py-10 text-center text-gray-500 text-sm">
          Esperando transacciones...
        </div>
      ) : (
        <div>
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} tx={tx} />
          ))}
        </div>
      )}
    </div>
  )
}
