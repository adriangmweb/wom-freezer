import { differenceInDays, isBefore, startOfDay } from 'date-fns'

export type ExpirationStatus =
  | 'fresh'
  | 'good'
  | 'use-soon'
  | 'expiring'
  | 'expired'
  | 'no-date'

export function getExpirationStatus(date: Date | null): ExpirationStatus {
  if (!date) return 'no-date'

  const today = startOfDay(new Date())
  const expirationDay = startOfDay(date)

  if (isBefore(expirationDay, today)) return 'expired'

  const daysUntil = differenceInDays(expirationDay, today)

  if (daysUntil <= 7) return 'expiring'
  if (daysUntil <= 14) return 'use-soon'
  if (daysUntil <= 30) return 'good'
  return 'fresh'
}

export const STATUS_COLORS: Record<ExpirationStatus, string> = {
  'fresh': 'bg-green-500',
  'good': 'bg-blue-500',
  'use-soon': 'bg-yellow-500',
  'expiring': 'bg-orange-500',
  'expired': 'bg-red-500',
  'no-date': 'bg-gray-400',
}

export const STATUS_TEXT_COLORS: Record<ExpirationStatus, string> = {
  'fresh': 'text-green-600',
  'good': 'text-blue-600',
  'use-soon': 'text-yellow-600',
  'expiring': 'text-orange-600',
  'expired': 'text-red-600',
  'no-date': 'text-gray-500',
}

export const STATUS_LABELS: Record<ExpirationStatus, string> = {
  'fresh': 'Fresh',
  'good': 'Good',
  'use-soon': 'Use Soon',
  'expiring': 'Expiring!',
  'expired': 'Expired',
  'no-date': 'No Date',
}

export function formatExpirationText(date: Date | null): string {
  if (!date) return 'No expiration date'

  const today = startOfDay(new Date())
  const expirationDay = startOfDay(date)
  const daysUntil = differenceInDays(expirationDay, today)

  if (daysUntil < 0) return `Expired ${Math.abs(daysUntil)} days ago`
  if (daysUntil === 0) return 'Expires today'
  if (daysUntil === 1) return 'Expires tomorrow'
  if (daysUntil <= 7) return `Expires in ${daysUntil} days`
  if (daysUntil <= 30) return `Expires in ${Math.ceil(daysUntil / 7)} weeks`
  return `Expires in ${Math.ceil(daysUntil / 30)} months`
}
