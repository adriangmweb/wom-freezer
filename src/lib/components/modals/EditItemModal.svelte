<script lang="ts">
  import { format } from 'date-fns'
  import type { FreezerItem, Category } from '$lib/types'
  import { updateItem, deleteItem } from '$lib/stores/items'
  import { showToast } from '$lib/stores/ui'
  import CategoryPicker from '$lib/components/categories/CategoryPicker.svelte'

  interface Props {
    item: FreezerItem | null
    categories: Category[]
    onClose: () => void
  }

  let { item, categories, onClose }: Props = $props()

  let name = $state(item?.name ?? '')
  let selectedCategory = $state(item?.categoryId ?? 'other')
  let quantity = $state(item?.quantity ?? 1)
  let expirationDate = $state(item?.expirationDate ? format(item.expirationDate, 'yyyy-MM-dd') : '')
  let notes = $state(item?.notes ?? '')

  $effect(() => {
    if (item) {
      name = item.name
      selectedCategory = item.categoryId
      quantity = item.quantity
      expirationDate = item.expirationDate ? format(item.expirationDate, 'yyyy-MM-dd') : ''
      notes = item.notes
    }
  })

  async function handleSave() {
    if (!item || !name.trim()) return

    await updateItem(item.id, {
      name: name.trim(),
      categoryId: selectedCategory,
      quantity,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      notes: notes.trim(),
    })

    showToast('Item updated')
    onClose()
  }

  async function handleDelete() {
    if (!item) return

    if (confirm(`Delete "${item.name}"?`)) {
      await deleteItem(item.id)
      showToast('Item deleted')
      onClose()
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
</script>

{#if item}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
    onclick={handleBackdropClick}
  >
    <div class="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Edit Item</h2>
        <button
          onclick={onClose}
          class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleSave(); }} class="space-y-5">
        <!-- Name -->
        <div>
          <label for="edit-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input
            id="edit-name"
            type="text"
            bind:value={name}
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>

        <!-- Category -->
        <div>
          <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</span>
          <CategoryPicker
            {categories}
            selected={selectedCategory}
            onSelect={(id) => selectedCategory = id}
          />
        </div>

        <!-- Quantity -->
        <div>
          <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</span>
          <div class="flex items-center gap-4">
            <button
              type="button"
              onclick={() => quantity = Math.max(1, quantity - 1)}
              class="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
            >
              -
            </button>
            <span class="text-2xl font-semibold w-12 text-center text-gray-900 dark:text-white">{quantity}</span>
            <button
              type="button"
              onclick={() => quantity++}
              class="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full text-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <!-- Expiration Date -->
        <div>
          <label for="edit-expiration" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiration Date
          </label>
          <input
            id="edit-expiration"
            type="date"
            bind:value={expirationDate}
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>

        <!-- Notes -->
        <div>
          <label for="edit-notes" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (optional)
          </label>
          <textarea
            id="edit-notes"
            bind:value={notes}
            rows="2"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none resize-none"
            placeholder="Any additional notes..."
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2 pb-4">
          <button
            type="button"
            onclick={handleDelete}
            class="py-3 px-4 border border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Delete
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            class="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
</style>
