<script lang="ts">
  import { onMount } from 'svelte'
  import type { Category } from '$lib/types'
  import { categories, loadCategories } from '$lib/stores/categories'
  import { items, loadItems } from '$lib/stores/items'
  import { modal } from '$lib/stores/modal'

  let loading = $state(true)

  onMount(async () => {
    await Promise.all([loadCategories(), loadItems()])
    loading = false
  })

  function getItemCount(categoryId: string): number {
    return $items.filter(item => item.categoryId === categoryId).length
  }

  function handleAdd() {
    modal.openCategory(null)
  }

  function handleEdit(category: Category) {
    modal.openCategory(category)
  }
</script>

{#if loading}
  <div class="flex flex-col items-center justify-center h-64 gap-3">
    <div class="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    <div class="text-sm text-gray-500 dark:text-gray-400">Loading categories...</div>
  </div>
{:else}
  <div class="p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Categories</h2>
      <button
        onclick={handleAdd}
        class="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add
      </button>
    </div>

    <div class="space-y-2">
      {#each $categories as category (category.id)}
        <button
          onclick={() => handleEdit(category)}
          class="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors text-left"
        >
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center text-2xl flex-shrink-0">
            {category.icon}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-gray-900 dark:text-white truncate">{category.name}</h3>
              {#if category.isDefault}
                <span class="px-1.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                  Default
                </span>
              {/if}
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400">{getItemCount(category.id)} items</p>
          </div>
          <svg class="w-5 h-5 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      {/each}
    </div>
  </div>

{/if}
