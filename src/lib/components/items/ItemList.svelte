<script lang="ts">
  import type { FreezerItem, Category } from '$lib/types'
  import ItemCard from './ItemCard.svelte'
  import { getCategoryById } from '$lib/stores/categories'

  interface Props {
    items: FreezerItem[]
    categories: Category[]
    groupByCategory?: boolean
    onEdit: (item: FreezerItem) => void
    onDelete?: (item: FreezerItem) => void
    onQuantityChange?: (item: FreezerItem, delta: number) => void
  }

  let { items, categories, groupByCategory = true, onEdit, onDelete, onQuantityChange }: Props = $props()

  // Track collapsed categories
  let collapsedCategories = $state<Set<string>>(new Set())

  function toggleCategory(categoryId: string) {
    if (collapsedCategories.has(categoryId)) {
      collapsedCategories.delete(categoryId)
    } else {
      collapsedCategories.add(categoryId)
    }
    // Trigger reactivity
    collapsedCategories = new Set(collapsedCategories)
  }

  interface GroupedItems {
    category: Category
    items: FreezerItem[]
  }

  const groupedItems = $derived.by(() => {
    if (!groupByCategory) return null

    const groups: GroupedItems[] = []
    const categoryMap = new Map<string, FreezerItem[]>()

    for (const item of items) {
      const existing = categoryMap.get(item.categoryId)
      if (existing) {
        existing.push(item)
      } else {
        categoryMap.set(item.categoryId, [item])
      }
    }

    for (const cat of categories) {
      const catItems = categoryMap.get(cat.id)
      if (catItems && catItems.length > 0) {
        groups.push({ category: cat, items: catItems })
      }
    }

    return groups
  })
</script>

{#if items.length === 0}
  <div class="text-center py-12 px-4">
    <div class="text-6xl mb-4">🧊</div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">Your freezer is empty</h3>
    <p class="text-gray-500 dark:text-gray-400">Tap the + button to add your first item</p>
  </div>
{:else if groupByCategory && groupedItems}
  <div class="space-y-2">
    {#each groupedItems as group}
      {@const isCollapsed = collapsedCategories.has(group.category.id)}
      <div>
        <button
          onclick={() => toggleCategory(group.category.id)}
          class="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <svg
            class="w-4 h-4 text-gray-400 transition-transform duration-200 {isCollapsed ? '-rotate-90' : ''}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
          <span class="text-lg">{group.category.icon}</span>
          <h2 class="font-semibold text-gray-700 dark:text-gray-200">{group.category.name}</h2>
          <span class="text-sm text-gray-500 dark:text-gray-400">({group.items.length})</span>
        </button>
        {#if !isCollapsed}
          <div class="px-4 py-2 space-y-2">
            {#each group.items as item (item.id)}
              <ItemCard {item} category={group.category} {onEdit} {onDelete} {onQuantityChange} />
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
{:else}
  <div class="px-4 py-2 space-y-2">
    {#each items as item (item.id)}
      <ItemCard {item} category={getCategoryById(categories, item.categoryId)} {onEdit} {onDelete} {onQuantityChange} />
    {/each}
  </div>
{/if}
