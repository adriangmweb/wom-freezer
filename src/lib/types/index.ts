export interface FreezerItem {
  id: string
  name: string
  quantity: number
  unit: string
  categoryId: string
  expirationDate: Date | null
  addedDate: Date
  notes: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isDefault: boolean
  sortOrder: number
}

export interface AppSettings {
  id: string
  defaultExpirationDays: number
  expirationWarningDays: number
  theme: 'light' | 'dark' | 'system'
  lastBackup: Date | null
  version: string
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'meat', name: 'Meat & Poultry', icon: '🥩', color: 'red', isDefault: true, sortOrder: 1 },
  { id: 'seafood', name: 'Seafood', icon: '🐟', color: 'cyan', isDefault: true, sortOrder: 2 },
  { id: 'vegetables', name: 'Vegetables', icon: '🥦', color: 'green', isDefault: true, sortOrder: 3 },
  { id: 'fruits', name: 'Fruits', icon: '🍓', color: 'pink', isDefault: true, sortOrder: 4 },
  { id: 'bread', name: 'Bread & Bakery', icon: '🍞', color: 'amber', isDefault: true, sortOrder: 5 },
  { id: 'prepared', name: 'Prepared Meals', icon: '🍲', color: 'orange', isDefault: true, sortOrder: 6 },
  { id: 'dairy', name: 'Dairy & Ice Cream', icon: '🧈', color: 'yellow', isDefault: true, sortOrder: 7 },
  { id: 'other', name: 'Other', icon: '📦', color: 'gray', isDefault: true, sortOrder: 99 },
]
