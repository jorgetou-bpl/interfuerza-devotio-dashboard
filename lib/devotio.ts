const BASE_URL = process.env.DEVOTIO_API_URL!
const API_KEY = process.env.DEVOTIO_API_KEY!

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_KEY}`,
})

export interface DevotioCustomer {
  id: string
  name: string
  phone: string
  email: string
  balance: number
  points: number
  joined_at: string
}

export interface DevotioRedemptionResult {
  redemption_id: string
  customer_id: string
  amount_redeemed: number
  new_balance: number
  status: 'confirmed' | 'failed'
}

export async function searchCustomer(
  query: string
): Promise<DevotioCustomer | null> {
  const params = new URLSearchParams({ q: query })
  const res = await fetch(`${BASE_URL}/customers/search?${params}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.customer ?? data ?? null
}

export async function getCustomerBalance(
  customerId: string
): Promise<{ balance: number; points: number } | null> {
  const res = await fetch(`${BASE_URL}/customers/${customerId}/balance`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export async function redeemCashback(
  customerId: string,
  amount: number,
  initiatedBy: string
): Promise<DevotioRedemptionResult> {
  const res = await fetch(`${BASE_URL}/redemptions`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      customer_id: customerId,
      amount,
      initiated_by: initiatedBy,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? `Devotio API error: ${res.status}`)
  }

  return res.json()
}
