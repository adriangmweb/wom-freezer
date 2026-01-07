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

export async function addCategory(category: Omit<Category, 'id' | 'sortOrder' | 'isDefault'>) {
  const allCategories = await db.categories.toArray()
  const maxSortOrder = Math.max(...allCategories.map(c => c.sortOrder), 0)

  const newCategory: Category = {
    ...category,
    id: crypto.randomUUID(),
    sortOrder: maxSortOrder + 1,
    isDefault: false,
  }

  await db.categories.add(newCategory)
  await loadCategories()
  return newCategory
}

export async function updateCategory(id: string, updates: Partial<Pick<Category, 'name' | 'icon' | 'color'>>) {
  await db.categories.update(id, updates)
  await loadCategories()
}

export async function deleteCategory(id: string) {
  // Don't allow deleting default categories
  const category = await db.categories.get(id)
  if (category?.isDefault) {
    throw new Error('Cannot delete default categories')
  }

  // Move items in this category to "other"
  const itemsInCategory = await db.items.where('categoryId').equals(id).toArray()
  for (const item of itemsInCategory) {
    await db.items.update(item.id, { categoryId: 'other' })
  }

  await db.categories.delete(id)
  await loadCategories()
}
