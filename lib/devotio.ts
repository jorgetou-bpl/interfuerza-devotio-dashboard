const BASE_URL = process.env.DEVOTIO_API_URL!
const API_KEY = process.env.DEVOTIO_API_KEY!

const headers = () => ({
  'Content-Type': 'application/json',
  'X-Api-Key': API_KEY,
})

export interface DevotioCustomer {
  id: string
  firstName: string
  surname: string
  phone: string
  email: string
  externalUserId: string | null
  createdAt: string
  updatedAt: string
}

export interface DevotioCard {
  id: string
  points: number
}

export async function searchCustomer(query: string): Promise<DevotioCustomer | null> {
  const field = query.includes('@') ? 'email' : 'phone'
  const params = new URLSearchParams({ [field]: query })
  const res = await fetch(`${BASE_URL}/customers?${params}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  if (Array.isArray(data.data) && data.data.length > 0) return data.data[0]
  return null
}

export async function getCustomerCard(customerId: string): Promise<DevotioCard | null> {
  const params = new URLSearchParams({ customerId })
  const res = await fetch(`${BASE_URL}/cards?${params}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data.data) || data.data.length === 0) return null
  const raw = data.data[0]
  return {
    id: raw.id,
    points: raw.balance?.balance ?? 0,
  }
}

export async function getCard(cardId: string): Promise<DevotioCard | null> {
  const res = await fetch(`${BASE_URL}/cards/${cardId}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  if (!data.data) return null
  return {
    id: data.data.id,
    points: data.data.balance?.balance ?? 0,
  }
}

export async function addPoints(
  cardId: string,
  points: number,
  purchaseSum: number,
  comment: string
): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/cards/${cardId}/add-point`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ points, purchaseSum, comment }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `Devotio API error: ${res.status}`)
  }
  return res.json()
}

export async function subtractPoints(
  cardId: string,
  points: number,
  comment: string
): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/cards/${cardId}/subtract-point`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ points, purchaseSum: points, comment }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `Devotio API error: ${res.status}`)
  }
  return res.json()
}
