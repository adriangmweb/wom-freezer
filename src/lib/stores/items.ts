import { writable, derived } from 'svelte/store'
import { db } from '$lib/db/database'
import type { FreezerItem } from '$lib/types'
import { getExpirationStatus } from '$lib/utils/expiration'

export const items = writable<FreezerItem[]>([])

export const expiringItems = derived(items, $items =>
  $items.filter(item => {
    const status = getExpirationStatus(item.expirationDate)
    return status === 'expiring' || status === 'use-soon'
  })
)

export const expiredItems = derived(items, $items =>
  $items.filter(item => getExpirationStatus(item.expirationDate) === 'expired')
)

export async function loadItems() {
  const allItems = await db.items.filter(item => item.deletedAt == null).toArray()
  items.set(allItems)
  return allItems
}

export async function addItem(
  item: Omit<FreezerItem, 'id' | 'addedDate' | 'updatedAt' | 'deletedAt'>
) {
  const now = new Date()
  const newItem: FreezerItem = {
    ...item,
    id: crypto.randomUUID(),
    addedDate: now,
    updatedAt: now,
    deletedAt: null,
  }
  await db.items.add(newItem)
  items.update(current => [...current, newItem])
  return newItem
}

export async function updateItem(id: string, updates: Partial<FreezerItem>) {
  const updatedAt = new Date()
  await db.items.update(id, { ...updates, updatedAt })
  items.update(current =>
    current.map(item => (item.id === id ? { ...item, ...updates, updatedAt } : item))
  )
}

export async function deleteItem(id: string) {
  await db.items.update(id, { deletedAt: new Date(), updatedAt: new Date() })
  items.update(current => current.filter(item => item.id !== id))
}

export function getItemsByCategory(allItems: FreezerItem[], categoryId: string) {
  return allItems.filter(item => item.categoryId === categoryId && item.deletedAt == null)
}
