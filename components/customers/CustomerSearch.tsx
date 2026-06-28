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
  balance: number
  points: number
}

export default function CustomerSearch() {
  const [query, setQuery] = useState('')
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [isPending, startTransition] = useTransition()

  function search() {
    if (!query.trim()) return
    setNotFound(false)
    setCustomer(null)
    startTransition(async () => {
      const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.customer) {
          setCustomer(data.customer)
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
          placeholder="Teléfono o email del cliente..."
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
            No se encontró ningún cliente con ese teléfono o email en Devotio Rewards.
          </p>
        </div>
      )}

      {customer && <CustomerCard customer={customer} onRedemptionComplete={() => setCustomer(null)} />}
    </div>
  )
}
