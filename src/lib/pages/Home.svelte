<script lang="ts">
  import { onMount } from 'svelte'
  import type { FreezerItem } from '$lib/types'
  import { items, loadItems, expiringItems, expiredItems, deleteItem } from '$lib/stores/items'
  import { showToast } from '$lib/stores/ui'
  import { modal } from '$lib/stores/modal'
  import { categories, loadCategories } from '$lib/stores/categories'
  import { getExpirationStatus } from '$lib/utils/expiration'
  import ItemList from '$lib/components/items/ItemList.svelte'
  import SearchInput from '$lib/components/shared/SearchInput.svelte'
  import FilterChips from '$lib/components/shared/FilterChips.svelte'
  import SortSelector, { type SortOption } from '$lib/components/shared/SortSelector.svelte'

  let loading = $state(true)

  // Search, filter, and sort state
  let searchQuery = $state('')
  let selectedCategory = $state<string | null>(null)
  let selectedStatus = $state<'all' | 'expiring' | 'expired'>('all')
  let sortBy = $state<SortOption>('added')

  onMount(async () => {
    await Promise.all([loadItems(), loadCategories()])
    loading = false
  })

  const totalItems = $derived($items.length)
  const expiringCount = $derived($expiringItems.length)
  const expiredCount = $derived($expiredItems.length)

  // Filtered and sorted items
  const filteredItems = $derived.by(() => {
    let result = $items

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(item => item.name.toLowerCase().includes(query))
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(item => item.categoryId === selectedCategory)
    }

    // Filter by status
    if (selectedStatus === 'expiring') {
      result = result.filter(item => {
        const status = getExpirationStatus(item.expirationDate)
        return status === 'expiring' || status === 'use-soon'
      })
    } else if (selectedStatus === 'expired') {
      result = result.filter(item => getExpirationStatus(item.expirationDate) === 'expired')
    }

    // Sort items
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'added':
          return new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()
        case 'expiration':
          // Items without expiration go to the end
          if (!a.expirationDate && !b.expirationDate) return 0
          if (!a.expirationDate) return 1
          if (!b.expirationDate) return -1
          return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
        default:
          return 0
      }
    })

    return result
  })

  function handleEdit(item: FreezerItem) {
    modal.openEditItem(item)
  }

  async function handleDelete(item: FreezerItem) {
    if (confirm(`Delete "${item.name}"?`)) {
      await deleteItem(item.id)
      showToast(`Deleted "${item.name}"`)
    }
  }
</script>

{#if loading}
  <div class="flex flex-col items-center justify-center h-64 gap-3">
    <div class="w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    <div class="text-sm text-gray-500 dark:text-gray-400">Loading your freezer...</div>
  </div>
{:else}
  <!-- Search -->
  <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
    <SearchInput
      value={searchQuery}
      onInput={(v) => searchQuery = v}
      placeholder="Search items..."
    />
  </div>

  <!-- Stats Bar -->
  <div class="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 dark:from-cyan-900/20 dark:to-blue-900/20 px-4 py-4">
    <div class="flex justify-around text-center">
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-1">
          <span class="text-xl font-bold text-gray-900 dark:text-white">{totalItems}</span>
        </div>
        <div class="text-xs font-medium text-gray-600 dark:text-gray-400">Total</div>
      </div>
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 shadow-sm flex items-center justify-center mb-1">
          <span class="text-xl font-bold text-orange-600 dark:text-orange-400">{expiringCount}</span>
        </div>
        <div class="text-xs font-medium text-gray-600 dark:text-gray-400">Expiring</div>
      </div>
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 shadow-sm flex items-center justify-center mb-1">
          <span class="text-xl font-bold text-red-600 dark:text-red-400">{expiredCount}</span>
        </div>
        <div class="text-xs font-medium text-gray-600 dark:text-gray-400">Expired</div>
      </div>
    </div>
  </div>

  <!-- Filter Chips and Sort -->
  <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
    <div class="flex items-center justify-between gap-2 mb-2">
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Filter & Sort</span>
      <SortSelector value={sortBy} onChange={(v) => sortBy = v} />
    </div>
    <FilterChips
      categories={$categories}
      {selectedCategory}
      {selectedStatus}
      onCategoryChange={(id) => selectedCategory = id}
      onStatusChange={(status) => selectedStatus = status}
      {expiringCount}
      {expiredCount}
    />
  </div>

  <!-- Item List -->
  {#if filteredItems.length === 0 && (searchQuery || selectedCategory || selectedStatus !== 'all')}
    <div class="text-center py-16 px-4">
      <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">No items found</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
    </div>
  {:else}
    <ItemList
      items={filteredItems}
      categories={$categories}
      onEdit={handleEdit}
      onDelete={handleDelete}
      groupByCategory={!searchQuery && !selectedCategory && selectedStatus === 'all' && sortBy === 'added'}
    />
  {/if}

  <!-- FAB -->
  <button
    onclick={() => modal.openQuickAdd()}
    class="fixed right-4 bottom-safe w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-2xl shadow-lg shadow-cyan-500/30 flex items-center justify-center hover:shadow-xl hover:shadow-cyan-500/40 active:scale-95 transition-all duration-200"
    aria-label="Add item"
  >
    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
    </svg>
  </button>

{/if}
