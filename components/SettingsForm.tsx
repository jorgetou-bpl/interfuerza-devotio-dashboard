'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import ConfirmPasswordModal from '@/components/settings/ConfirmPasswordModal'

interface SettingsFormProps {
  cashbackPct: string
  lastSync: string | null
}

export default function SettingsForm({ cashbackPct, lastSync }: SettingsFormProps) {
  const [pct, setPct] = useState(cashbackPct)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const lastSyncFormatted = lastSync
    ? new Date(lastSync).toLocaleString('es', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Panama',
      })
    : 'Sin datos'

  function requestSave() {
    const val = parseFloat(pct)
    if (isNaN(val) || val < 0 || val > 100) {
      toast.error('Porcentaje inválido (0–100)')
      return
    }
    setShowConfirm(true)
  }

  async function save() {
    setShowConfirm(false)
    const val = parseFloat(pct)
    setSaving(true)
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('sync_state') as any)
      .upsert(
        { key: 'cashback_percentage', value: String(val), updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      )
    setSaving(false)
    if (error) {
      toast.error('No se pudo guardar')
    } else {
      toast.success('Porcentaje actualizado')
    }
  }

  return (
    <>
    <div className="space-y-5">
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="text-white text-sm font-semibold">Parámetros de cashback</h2>

        <div className="space-y-1.5">
          <Label className="text-gray-300 text-sm">Porcentaje de cashback</Label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={pct}
                onChange={(e) => setPct(e.target.value)}
                className="pr-7 bg-gray-800 border-gray-700 text-white focus:border-violet-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
            <Button
              onClick={requestSave}
              disabled={saving}
              className="bg-violet-600 hover:bg-violet-500 text-white"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
          <p className="text-gray-500 text-xs">
            Cada factura procesada acredita este % del subtotal (sin impuestos) como cashback.
            Los cambios aplican solo a facturas futuras.
          </p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
        <h2 className="text-white text-sm font-semibold">Estado N8N</h2>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Última sincronización</span>
            <span className="text-white">{lastSyncFormatted}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Frecuencia</span>
            <span className="text-white">Cada 20 minutos</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Origen</span>
            <span className="text-white">InterFuerza API</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Destino</span>
            <span className="text-white">Devotio Rewards API</span>
          </div>
        </div>
      </div>
    </div>

    {showConfirm && (
      <ConfirmPasswordModal
        onConfirmed={save}
        onCancel={() => setShowConfirm(false)}
      />
    )}
    </>
  )
}
