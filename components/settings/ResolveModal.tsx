'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { Transaction } from '@/lib/supabase/types'

interface DevotioCustomer {
  id: string
  name: string
  phone: string
  email: string
  cardId: string
  balance: number
}

interface Props {
  transaction: Transaction
  onResolved: (transactionId: string) => void
  onClose: () => void
}

export default function ResolveModal({ transaction, onResolved, onClose }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DevotioCustomer[]>([])
  const [searching, setSearching] = useState(false)
  const [selected, setSelected] = useState<DevotioCustomer | null>(null)
  const [confirming, setConfirming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    inputRef.current?.focus()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  useEffect(() => {
    if (query.length < 3) { setResults([]); return }
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.customer ? [data.customer] : [])
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
  }, [query])

  async function confirm() {
    if (!selected) return
    setConfirming(true)
    try {
      const res = await fetch('/api/resolve-pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          cardId: selected.cardId,
          devotioCustomerId: selected.id,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al resolver')
      toast.success(`Cashback acreditado: $${data.cashbackAmount.toFixed(2)}`)
      onResolved(transaction.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">Resolver cashback pendiente</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* InterFuerza customer info */}
          <div className="bg-gray-800/60 rounded-xl px-4 py-3 space-y-0.5">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-1.5">Cliente en InterFuerza</p>
            <p className="text-white text-sm font-medium">{transaction.customer_name ?? '—'}</p>
            {transaction.customer_phone && (
              <p className="text-gray-400 text-xs">{transaction.customer_phone}</p>
            )}
            {transaction.customer_email && (
              <p className="text-gray-400 text-xs">{transaction.customer_email}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Factura #{transaction.invoice_id} · ${Number(transaction.amount).toFixed(2)}
            </p>
          </div>

          {selected ? (
            /* Confirm step */
            <div className="space-y-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                <p className="text-emerald-400 text-xs font-medium uppercase tracking-wide mb-1.5">Acreditar a</p>
                <p className="text-white text-sm font-medium">{selected.name}</p>
                <p className="text-gray-400 text-xs">{selected.phone}</p>
                <p className="text-gray-500 text-xs">Tarjeta {selected.cardId} · Balance actual ${selected.balance.toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm text-gray-400 border border-gray-700 hover:border-gray-500 transition-colors"
                >
                  Cambiar
                </button>
                <button
                  onClick={confirm}
                  disabled={confirming}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
                >
                  {confirming ? 'Acreditando...' : 'Confirmar ✓'}
                </button>
              </div>
            </div>
          ) : (
            /* Search step */
            <div className="space-y-3">
              <div>
                <label className="text-gray-400 text-xs font-medium block mb-1.5">Buscar en Devotio</label>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Nombre, teléfono o email..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              {searching && (
                <p className="text-gray-500 text-xs text-center py-2">Buscando...</p>
              )}

              {!searching && query.length >= 3 && results.length === 0 && (
                <p className="text-gray-600 text-xs text-center py-2">Sin resultados en Devotio</p>
              )}

              {results.length > 0 && (
                <div className="space-y-1.5">
                  {results.map(r => (
                    <button
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 transition-colors text-left"
                    >
                      <div>
                        <p className="text-white text-sm font-medium">{r.name}</p>
                        <p className="text-gray-400 text-xs">{r.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm font-semibold">${r.balance.toFixed(2)}</p>
                        <p className="text-gray-500 text-xs">Seleccionar →</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query.length < 3 && (
                <p className="text-gray-600 text-xs text-center py-2">Escribe al menos 3 caracteres para buscar</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
