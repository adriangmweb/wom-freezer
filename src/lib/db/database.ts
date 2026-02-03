import Dexie, { type Table } from 'dexie'
import type { FreezerItem, Category, AppSettings, SyncState } from '$lib/types'

export class FreezerDatabase extends Dexie {
  items!: Table<FreezerItem>
  categories!: Table<Category>
  settings!: Table<AppSettings>
  sync!: Table<SyncState>

  constructor() {
    super('FreezerInventory')

    this.version(1).stores({
      items: 'id, name, categoryId, expirationDate, addedDate',
      categories: 'id, name, sortOrder',
      settings: 'id'
    })

    this.version(2)
      .stores({
        items: 'id, name, categoryId, expirationDate, addedDate, updatedAt, deletedAt',
        categories: 'id, name, sortOrder, updatedAt, deletedAt',
        settings: 'id',
        sync: 'id',
      })
      .upgrade(async tx => {
        const now = new Date()

        await tx.table('items').toCollection().modify(item => {
          if (!item.updatedAt) {
            item.updatedAt = item.addedDate ?? now
          }
          if (!('deletedAt' in item)) {
            item.deletedAt = null
          }
        })

        await tx.table('categories').toCollection().modify(category => {
          if (!category.updatedAt) {
            category.updatedAt = now
          }
          if (!('deletedAt' in category)) {
            category.deletedAt = null
          }
        })

        await tx.table('sync').put({
          id: 'state',
          lastSyncedAt: new Date(0),
          deviceId: crypto.randomUUID(),
        })
      })
  }
}

export const db = new FreezerDatabase()
