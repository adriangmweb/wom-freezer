import { writable } from 'svelte/store'
import { db } from '$lib/db/database'
import type { Category } from '$lib/types'

export const categories = writable<Category[]>([])

export async function loadCategories() {
  const allCategories = await db.categories.orderBy('sortOrder').toArray()
  categories.set(allCategories)
  return allCategories
}

export function getCategoryById(cats: Category[], id: string): Category | undefined {
  return cats.find(c => c.id === id)
}
