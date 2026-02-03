import { db } from './database'
import { DEFAULT_CATEGORIES } from '$lib/types'

export async function initializeDatabase() {
  const categoryCount = await db.categories.count()

  if (categoryCount === 0) {
    await db.categories.bulkAdd(DEFAULT_CATEGORIES)
  }

  const settings = await db.settings.get('settings')
  if (!settings) {
    await db.settings.add({
      id: 'settings',
      defaultExpirationDays: 90,
      expirationWarningDays: 7,
      theme: 'system',
      lastBackup: null,
      version: '1.0.0'
    })
  }

  const syncState = await db.sync.get('state')
  if (!syncState) {
    await db.sync.add({
      id: 'state',
      lastSyncedAt: new Date(0),
      deviceId: crypto.randomUUID(),
    })
  }
}
