import { writable } from 'svelte/store'

// Search and filter state
export const searchQuery = writable('')
export const selectedCategoryFilter = writable<string | null>(null)
export const selectedStatusFilter = writable<'all' | 'expiring' | 'expired'>('all')

// Modal state
export const editingItemId = writable<string | null>(null)

// Toast state
interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

export const toasts = writable<Toast[]>([])

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const id = crypto.randomUUID()
  toasts.update(t => [...t, { id, message, type }])

  setTimeout(() => {
    toasts.update(t => t.filter(toast => toast.id !== id))
  }, 3000)
}

export function dismissToast(id: string) {
  toasts.update(t => t.filter(toast => toast.id !== id))
}
