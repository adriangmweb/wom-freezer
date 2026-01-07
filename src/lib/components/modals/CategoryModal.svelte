<script lang="ts">
  import type { Category } from '$lib/types'
  import { addCategory, updateCategory, deleteCategory } from '$lib/stores/categories'
  import { showToast } from '$lib/stores/ui'

  interface Props {
    category: Category | null // null = add new, Category = edit existing
    onClose: () => void
  }

  let { category, onClose }: Props = $props()

  const isEditing = $derived(category !== null)

  let name = $state(category?.name ?? '')
  let icon = $state(category?.icon ?? '')
  let color = $state(category?.color ?? 'gray')

  const EMOJI_OPTIONS = ['🥩', '🐟', '🥦', '🍎', '🍞', '🍲', '🧁', '🍕', '🌮', '🥗', '🍜', '🧀', '🥚', '🍦', '📦']
  const COLOR_OPTIONS = [
    { id: 'red', class: 'bg-red-500' },
    { id: 'orange', class: 'bg-orange-500' },
    { id: 'yellow', class: 'bg-yellow-500' },
    { id: 'green', class: 'bg-green-500' },
    { id: 'cyan', class: 'bg-cyan-500' },
    { id: 'blue', class: 'bg-blue-500' },
    { id: 'purple', class: 'bg-purple-500' },
    { id: 'pink', class: 'bg-pink-500' },
    { id: 'gray', class: 'bg-gray-500' },
  ]

  $effect(() => {
    if (category) {
      name = category.name
      icon = category.icon
      color = category.color
    }
  })

  async function handleSave() {
    if (!name.trim() || !icon) return

    try {
      if (isEditing && category) {
        await updateCategory(category.id, { name: name.trim(), icon, color })
        showToast(`Updated "${name.trim()}"`)
      } else {
        await addCategory({ name: name.trim(), icon, color })
        showToast(`Added "${name.trim()}"`)
      }
      onClose()
    } catch (error) {
      showToast('Failed to save category')
    }
  }

  async function handleDelete() {
    if (!category) return

    if (category.isDefault) {
      showToast('Cannot delete default categories')
      return
    }

    if (confirm(`Delete "${category.name}"? Items will be moved to "Other".`)) {
      try {
        await deleteCategory(category.id)
        showToast(`Deleted "${category.name}"`)
        onClose()
      } catch (error) {
        showToast('Failed to delete category')
      }
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
  onclick={handleBackdropClick}
>
  <div class="bg-white dark:bg-gray-800 w-full max-w-lg rounded-t-2xl p-6 animate-slide-up">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        {isEditing ? 'Edit Category' : 'Add Category'}
      </h2>
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
        <label for="cat-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category Name
        </label>
        <input
          id="cat-name"
          type="text"
          bind:value={name}
          placeholder="e.g. Frozen Pizza"
          class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
        />
      </div>

      <!-- Icon -->
      <div>
        <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</span>
        <div class="flex flex-wrap gap-2">
          {#each EMOJI_OPTIONS as emoji}
            <button
              type="button"
              onclick={() => icon = emoji}
              class="w-10 h-10 text-xl rounded-lg flex items-center justify-center transition-all
                {icon === emoji
                  ? 'bg-cyan-100 dark:bg-cyan-900/50 ring-2 ring-cyan-500'
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}"
            >
              {emoji}
            </button>
          {/each}
        </div>
        <div class="mt-2">
          <input
            type="text"
            bind:value={icon}
            placeholder="Or type any emoji..."
            class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
            maxlength="2"
          />
        </div>
      </div>

      <!-- Color -->
      <div>
        <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</span>
        <div class="flex flex-wrap gap-2">
          {#each COLOR_OPTIONS as colorOption}
            <button
              type="button"
              onclick={() => color = colorOption.id}
              class="w-8 h-8 rounded-full {colorOption.class} transition-all
                {color === colorOption.id ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : 'hover:scale-110'}"
              aria-label={colorOption.id}
            />
          {/each}
        </div>
      </div>

      <!-- Preview -->
      <div>
        <span class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview</span>
        <div class="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3">
          <span class="text-2xl">{icon || '📦'}</span>
          <span class="font-medium text-gray-900 dark:text-white">{name || 'Category Name'}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 pt-2">
        {#if isEditing && category && !category.isDefault}
          <button
            type="button"
            onclick={handleDelete}
            class="py-3 px-4 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Delete
          </button>
        {/if}
        <button
          type="submit"
          disabled={!name.trim() || !icon}
          class="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? 'Save Changes' : 'Add Category'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
</style>
