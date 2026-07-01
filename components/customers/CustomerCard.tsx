'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import RedemptionModal from './RedemptionModal'

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  cardId: string
  balance: number
  points: number
}

interface CustomerCardProps {
  customer: Customer
  onRedemptionComplete: () => void
}

export default function CustomerCard({ customer, onRedemptionComplete }: CustomerCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [currentBalance, setCurrentBalance] = useState(customer.balance)

  function handleSuccess(newBalance: number) {
    setCurrentBalance(newBalance)
    setModalOpen(false)
    onRedemptionComplete()
  }

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 flex items-start justify-between">
          <div>
            <h3 className="text-white font-semibold text-base">{customer.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              {customer.phone && (
                <span className="text-gray-400 text-sm">{customer.phone}</span>
              )}
              {customer.email && (
                <span className="text-gray-500 text-sm">{customer.email}</span>
              )}
            </div>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            disabled={currentBalance <= 0}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
          >
            Redimir cashback
          </Button>
        </div>

        <div className="px-5 py-4">
          <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Balance disponible</p>
          <p className="text-3xl font-bold text-emerald-400">
            ₡{currentBalance.toLocaleString('es-CR')}
          </p>
          {currentBalance <= 0 && (
            <p className="text-gray-600 text-xs mt-1">Sin saldo disponible para canjear</p>
          )}
        </div>
      </div>

      <RedemptionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={{ ...customer, balance: currentBalance }}
        onSuccess={handleSuccess}
      />
    </>
  )
}
