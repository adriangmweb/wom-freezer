import type { FreezerItem, Category } from '$lib/types'

type ModalState =
  | { type: 'none' }
  | { type: 'quickAdd' }
  | { type: 'editItem'; item: FreezerItem }
  | { type: 'category'; category: Category | null }

let modalState = $state<ModalState>({ type: 'none' })

export const modal = {
  get current() {
    return modalState
  },

  openQuickAdd() {
    modalState = { type: 'quickAdd' }
  },

  openEditItem(item: FreezerItem) {
    modalState = { type: 'editItem', item }
  },

  openCategory(category: Category | null = null) {
    modalState = { type: 'category', category }
  },

  close() {
    modalState = { type: 'none' }
  },
}
