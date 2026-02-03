export interface FreezerItem {
  id: string
  name: string
  quantity: number
  unit: string
  categoryId: string
  expirationDate: Date | null
  addedDate: Date
  notes: string
  updatedAt: Date
  deletedAt: Date | null
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isDefault: boolean
  sortOrder: number
  updatedAt: Date
  deletedAt: Date | null
}

export interface AppSettings {
  id: string
  defaultExpirationDays: number
  expirationWarningDays: number
  theme: 'light' | 'dark' | 'system'
  lastBackup: Date | null
  version: string
}

export interface SyncState {
  id: 'state'
  lastSyncedAt: Date
  deviceId: string
}

const defaultCategoryTimestamp = new Date()

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'meat', name: 'Meat & Poultry', icon: '🥩', color: 'red', isDefault: true, sortOrder: 1, updatedAt: defaultCategoryTimestamp, deletedAt: null },
  { id: 'seafood', name: 'Seafood', icon: '🐟', color: 'cyan', isDefault: true, sortOrder: 2, updatedAt: defaultCategoryTimestamp, deletedAt: null },
  { id: 'vegetables', name: 'Vegetables', icon: '🥦', color: 'green', isDefault: true, sortOrder: 3, updatedAt: defaultCategoryTimestamp, deletedAt: null },
  { id: 'fruits', name: 'Fruits', icon: '🍓', color: 'pink', isDefault: true, sortOrder: 4, updatedAt: defaultCategoryTimestamp, deletedAt: null },
  { id: 'bread', name: 'Bread & Bakery', icon: '🍞', color: 'amber', isDefault: true, sortOrder: 5, updatedAt: defaultCategoryTimestamp, deletedAt: null },
  { id: 'prepared', name: 'Prepared Meals', icon: '🍲', color: 'orange', isDefault: true, sortOrder: 6, updatedAt: defaultCategoryTimestamp, deletedAt: null },
  { id: 'dairy', name: 'Dairy & Ice Cream', icon: '🧈', color: 'yellow', isDefault: true, sortOrder: 7, updatedAt: defaultCategoryTimestamp, deletedAt: null },
  { id: 'other', name: 'Other', icon: '📦', color: 'gray', isDefault: true, sortOrder: 99, updatedAt: defaultCategoryTimestamp, deletedAt: null },
]
