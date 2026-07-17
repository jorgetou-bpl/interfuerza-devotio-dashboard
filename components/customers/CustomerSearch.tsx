'use client'

import { useState, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import CustomerCard from './CustomerCard'

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  cardId: string
  balance: number
  points: number
}

export default function CustomerSearch() {
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [notFound, setNotFound] = useState(false)
  const [isPending, startTransition] = useTransition()

  function search() {
    if (!query.trim()) return
    setNotFound(false)
    setCustomers([])
    startTransition(async () => {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        const list: Customer[] = data.customers?.length > 0
          ? data.customers
          : data.customer ? [data.customer] : []
        if (list.length > 0) {
          setCustomers(list)
        } else {
          setNotFound(true)
        }
      } else {
        setNotFound(true)
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') search()
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Teléfono, email o nombre..."
          className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500"
        />
        <Button
          onClick={search}
          disabled={isPending || !query.trim()}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6"
        >
          {isPending ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>

      {notFound && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <p className="text-amber-400 text-sm">
            No se encontró ningún cliente en Devotio Rewards.
          </p>
        </div>
      )}

      {customers.length > 1 && (
        <p className="text-gray-500 text-xs">{customers.length} clientes encontrados</p>
      )}

      {customers.map((c) => (
        <CustomerCard
          key={c.id}
          customer={c}
          onRedemptionComplete={() => setCustomers((prev) => prev.filter((x) => x.id !== c.id))}
        />
      ))}
    </div>
  )
}
