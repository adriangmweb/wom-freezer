<script lang="ts">
  import type { FreezerItem, Category } from '$lib/types'
  import ItemCard from './ItemCard.svelte'
  import { getCategoryById } from '$lib/stores/categories'

  interface Props {
    items: FreezerItem[]
    categories: Category[]
    groupByCategory?: boolean
    onEdit: (item: FreezerItem) => void
  }

  let { items, categories, groupByCategory = true, onEdit }: Props = $props()

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
    <h3 class="text-lg font-medium text-gray-900 mb-2">Your freezer is empty</h3>
    <p class="text-gray-500">Tap the + button to add your first item</p>
  </div>
{:else if groupByCategory && groupedItems}
  <div class="space-y-6">
    {#each groupedItems as group}
      <div>
        <div class="flex items-center gap-2 px-4 py-2 bg-gray-100">
          <span class="text-lg">{group.category.icon}</span>
          <h2 class="font-semibold text-gray-700">{group.category.name}</h2>
          <span class="text-sm text-gray-500">({group.items.length})</span>
        </div>
        <div class="px-4 py-2 space-y-2">
          {#each group.items as item (item.id)}
            <ItemCard {item} category={group.category} {onEdit} />
          {/each}
        </div>
      </div>
    {/each}
  </div>
{:else}
  <div class="px-4 py-2 space-y-2">
    {#each items as item (item.id)}
      <ItemCard {item} category={getCategoryById(categories, item.categoryId)} {onEdit} />
    {/each}
  </div>
{/if}
