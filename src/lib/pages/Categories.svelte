<script lang="ts">
  import { onMount } from 'svelte'
  import { categories, loadCategories } from '$lib/stores/categories'
  import { items, loadItems } from '$lib/stores/items'

  let loading = $state(true)

  onMount(async () => {
    await Promise.all([loadCategories(), loadItems()])
    loading = false
  })

  function getItemCount(categoryId: string): number {
    return $items.filter(item => item.categoryId === categoryId).length
  }
</script>

{#if loading}
  <div class="flex items-center justify-center h-64">
    <div class="text-gray-500 dark:text-gray-400">Loading...</div>
  </div>
{:else}
  <div class="p-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h2>
    <div class="space-y-2">
      {#each $categories as category (category.id)}
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
          <span class="text-2xl">{category.icon}</span>
          <div class="flex-1">
            <h3 class="font-medium text-gray-900 dark:text-white">{category.name}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{getItemCount(category.id)} items</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
