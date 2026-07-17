/**
 * Format a transaction date from Supabase/InterFuerza.
 *
 * Handles two cases:
 *  - Date-only values stored as midnight UTC (e.g. "2026-07-16T00:00:00+00:00"):
 *    shifted +12h before formatting so UTC-5/UTC-6 clients see the correct calendar day.
 *    Time is omitted because we don't actually have a time component.
 *  - Full datetimes with a real time component: shown with date + HH:MM.
 */
export function formatTxDateTime(raw: string | null | undefined): string {
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return '—'

  const isDateOnly =
    d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0

  if (isDateOnly) {
    const shifted = new Date(d.getTime() + 12 * 60 * 60 * 1000)
    return shifted.toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return d.toLocaleString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
