import Dexie, { type Table } from 'dexie'
import type { FreezerItem, Category, AppSettings } from '$lib/types'

export class FreezerDatabase extends Dexie {
  items!: Table<FreezerItem>
  categories!: Table<Category>
  settings!: Table<AppSettings>

  constructor() {
    super('FreezerInventory')

    this.version(1).stores({
      items: 'id, name, categoryId, expirationDate, addedDate',
      categories: 'id, name, sortOrder',
      settings: 'id'
    })
  }
}

export const db = new FreezerDatabase()
