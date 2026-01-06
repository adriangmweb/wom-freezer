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
  const allItems = await db.items.toArray()
  items.set(allItems)
  return allItems
}

export async function addItem(item: Omit<FreezerItem, 'id' | 'addedDate'>) {
  const newItem: FreezerItem = {
    ...item,
    id: crypto.randomUUID(),
    addedDate: new Date(),
  }
  await db.items.add(newItem)
  items.update(current => [...current, newItem])
  return newItem
}

export async function updateItem(id: string, updates: Partial<FreezerItem>) {
  await db.items.update(id, updates)
  items.update(current =>
    current.map(item => (item.id === id ? { ...item, ...updates } : item))
  )
}

export async function deleteItem(id: string) {
  await db.items.delete(id)
  items.update(current => current.filter(item => item.id !== id))
}

export function getItemsByCategory(allItems: FreezerItem[], categoryId: string) {
  return allItems.filter(item => item.categoryId === categoryId)
}
