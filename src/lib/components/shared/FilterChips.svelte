<script lang="ts">
  import type { Category } from '$lib/types'

  interface Props {
    categories: Category[]
    selectedCategory: string | null
    selectedStatus: 'all' | 'expiring' | 'expired'
    onCategoryChange: (categoryId: string | null) => void
    onStatusChange: (status: 'all' | 'expiring' | 'expired') => void
    expiringCount: number
    expiredCount: number
  }

  let {
    categories,
    selectedCategory,
    selectedStatus,
    onCategoryChange,
    onStatusChange,
    expiringCount,
    expiredCount,
  }: Props = $props()

  const statusFilters = $derived([
    { id: 'all' as const, label: 'All' },
    { id: 'expiring' as const, label: 'Expiring', count: expiringCount, color: 'orange' },
    { id: 'expired' as const, label: 'Expired', count: expiredCount, color: 'red' },
  ])
</script>

<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
  <!-- Status filters -->
  {#each statusFilters as filter}
    <button
      onclick={() => onStatusChange(filter.id)}
      class="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors
        {selectedStatus === filter.id
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
    >
      {filter.label}
      {#if filter.count !== undefined && filter.count > 0}
        <span class="ml-1 text-xs opacity-80">({filter.count})</span>
      {/if}
    </button>
  {/each}

  <div class="w-px bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>

  <!-- Category filters -->
  {#each categories as category}
    <button
      onclick={() => onCategoryChange(selectedCategory === category.id ? null : category.id)}
      class="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1
        {selectedCategory === category.id
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
    >
      <span>{category.icon}</span>
      <span class="hidden sm:inline">{category.name.split(' ')[0]}</span>
    </button>
  {/each}
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
