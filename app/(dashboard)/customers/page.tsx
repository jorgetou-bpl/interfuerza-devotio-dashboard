import CustomersClientView from '@/components/customers/CustomersClientView'
import { createClient } from '@/lib/supabase/server'
import type { Redemption } from '@/lib/supabase/types'

export default async function CustomersPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('redemptions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const redemptions = (data ?? []) as Redemption[]

  return (
    <div className="px-6 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Clientes</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Buscar cliente y redimir cashback
        </p>
      </div>

      <CustomersClientView redemptions={redemptions} />
    </div>
  )
}
