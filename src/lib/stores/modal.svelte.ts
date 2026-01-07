import type { FreezerItem, Category } from '$lib/types'

type ModalState =
  | { type: 'none' }
  | { type: 'quickAdd' }
  | { type: 'editItem'; item: FreezerItem }
  | { type: 'category'; category: Category | null }

let modalState = $state<ModalState>({ type: 'none' })

function lockBodyScroll() {
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.width = '100%'
  document.body.style.top = `-${window.scrollY}px`
}

function unlockBodyScroll() {
  const scrollY = document.body.style.top
  document.body.style.overflow = ''
  document.body.style.position = ''
  document.body.style.width = ''
  document.body.style.top = ''
  window.scrollTo(0, parseInt(scrollY || '0') * -1)
}

export const modal = {
  get current() {
    return modalState
  },

  openQuickAdd() {
    lockBodyScroll()
    modalState = { type: 'quickAdd' }
  },

  openEditItem(item: FreezerItem) {
    lockBodyScroll()
    modalState = { type: 'editItem', item }
  },

  openCategory(category: Category | null = null) {
    lockBodyScroll()
    modalState = { type: 'category', category }
  },

  close() {
    unlockBodyScroll()
    modalState = { type: 'none' }
  },
}
