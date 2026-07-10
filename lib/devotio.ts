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

function detectQueryField(query: string): 'phone' | 'email' | 'name' {
  if (query.includes('@')) return 'email'
  if (/^[\d+\s\-().]+$/.test(query)) return 'phone'
  return 'name'
}

export async function searchCustomers(query: string): Promise<DevotioCustomer[]> {
  const field = detectQueryField(query)
  const params = new URLSearchParams({ [field]: query })
  const res = await fetch(`${BASE_URL}/customers?${params}`, {
    headers: headers(),
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  if (!Array.isArray(data.data)) return []

  const results: DevotioCustomer[] = data.data

  if (field !== 'name') return results

  // For name queries: filter to customers that actually match all search words,
  // then sort so firstName matches come before surname-only matches.
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)

  const filtered = results.filter((c) => {
    const full = `${c.firstName} ${c.surname}`.toLowerCase()
    return words.every((w) => full.includes(w))
  })

  filtered.sort((a, b) => {
    const aFirst = a.firstName.toLowerCase()
    const bFirst = b.firstName.toLowerCase()
    const firstWord = words[0]
    const aScore = aFirst.startsWith(firstWord) ? 0 : 1
    const bScore = bFirst.startsWith(firstWord) ? 0 : 1
    if (aScore !== bScore) return aScore - bScore
    return `${a.firstName} ${a.surname}`.localeCompare(`${b.firstName} ${b.surname}`)
  })

  return filtered
}

export async function searchCustomer(query: string): Promise<DevotioCustomer | null> {
  const results = await searchCustomers(query)
  return results[0] ?? null
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
