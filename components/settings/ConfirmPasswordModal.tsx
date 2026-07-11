'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  onConfirmed: () => void
  onCancel: () => void
}

export default function ConfirmPasswordModal({ onConfirmed, onCancel }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function verify() {
    if (!password) { setError('Ingresa tu contraseña'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setError('No se pudo obtener el usuario actual')
      setLoading(false)
      return
    }
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    })
    setLoading(false)
    if (authError) {
      setError('Contraseña incorrecta')
      setPassword('')
      inputRef.current?.focus()
      return
    }
    onConfirmed()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-400 text-base">⚠</span>
            <h2 className="text-white font-semibold text-sm">Confirmar cambio</h2>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 text-xl leading-none">×</button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <p className="text-gray-400 text-sm">
            Cambiar el porcentaje de cashback afecta todas las facturas futuras.
            Ingresa tu contraseña para confirmar.
          </p>

          <div className="space-y-1.5">
            <label className="text-gray-400 text-xs font-medium block">Contraseña</label>
            <input
              ref={inputRef}
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && verify()}
              placeholder="••••••••"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg text-sm text-gray-400 border border-gray-700 hover:border-gray-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={verify}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
