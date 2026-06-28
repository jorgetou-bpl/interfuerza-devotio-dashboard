'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Customer {
  id: string
  name: string
  phone: string
  email: string
  balance: number
}

interface RedemptionModalProps {
  open: boolean
  onClose: () => void
  customer: Customer
  onSuccess: (newBalance: number) => void
}

export default function RedemptionModal({
  open,
  onClose,
  customer,
  onSuccess,
}: RedemptionModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const parsedAmount = parseFloat(amount)
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= customer.balance

  async function handleRedeem() {
    if (!isValid) return
    setLoading(true)

    const res = await fetch('/api/redemptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        amount: parsedAmount,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      toast.error(data.error ?? 'Error al procesar la redención.')
      return
    }

    toast.success(`Redención de $${parsedAmount.toFixed(2)} confirmada para ${customer.name}`)
    setAmount('')
    onSuccess(data.newBalance ?? customer.balance - parsedAmount)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Redimir Cashback</DialogTitle>
          <DialogDescription className="text-gray-400">
            {customer.name} — Balance disponible:{' '}
            <span className="text-emerald-400 font-semibold">${customer.balance.toFixed(2)}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-gray-300 text-sm">
              Monto a redimir
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <Input
                id="amount"
                type="number"
                min="0.01"
                max={customer.balance}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-7 bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-violet-500"
              />
            </div>
            {amount && !isNaN(parsedAmount) && parsedAmount > customer.balance && (
              <p className="text-red-400 text-xs">El monto supera el balance disponible.</p>
            )}
            {amount && !isNaN(parsedAmount) && parsedAmount <= customer.balance && parsedAmount > 0 && (
              <p className="text-gray-500 text-xs">
                Balance restante: ${(customer.balance - parsedAmount).toFixed(2)}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-gray-700 text-gray-400 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={!isValid || loading}
              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white"
            >
              {loading ? 'Procesando...' : 'Confirmar redención'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
