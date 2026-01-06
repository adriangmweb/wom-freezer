<script lang="ts">
  import { onMount } from 'svelte'
  import type { FreezerItem } from '$lib/types'
  import { items, loadItems, expiringItems, expiredItems } from '$lib/stores/items'
  import { categories, loadCategories } from '$lib/stores/categories'
  import { getExpirationStatus } from '$lib/utils/expiration'
  import ItemList from '$lib/components/items/ItemList.svelte'
  import QuickAddModal from '$lib/components/modals/QuickAddModal.svelte'
  import EditItemModal from '$lib/components/modals/EditItemModal.svelte'
  import SearchInput from '$lib/components/shared/SearchInput.svelte'
  import FilterChips from '$lib/components/shared/FilterChips.svelte'
  import SortSelector, { type SortOption } from '$lib/components/shared/SortSelector.svelte'

  let showAddModal = $state(false)
  let editingItem = $state<FreezerItem | null>(null)
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
    editingItem = item
  }
</script>

{#if loading}
  <div class="flex items-center justify-center h-64">
    <div class="text-gray-500 dark:text-gray-400">Loading...</div>
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
  <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
    <div class="flex justify-around text-center">
      <div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Total Items</div>
      </div>
      <div>
        <div class="text-2xl font-bold text-orange-500">{expiringCount}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Expiring Soon</div>
      </div>
      <div>
        <div class="text-2xl font-bold text-red-500">{expiredCount}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">Expired</div>
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
    <div class="text-center py-12 px-4">
      <div class="text-4xl mb-4">🔍</div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No items found</h3>
      <p class="text-gray-500 dark:text-gray-400">Try adjusting your search or filters</p>
    </div>
  {:else}
    <ItemList
      items={filteredItems}
      categories={$categories}
      onEdit={handleEdit}
      groupByCategory={!searchQuery && !selectedCategory && selectedStatus === 'all' && sortBy === 'added'}
    />
  {/if}

  <!-- FAB -->
  <button
    onclick={() => showAddModal = true}
    class="fixed right-4 bottom-24 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:bg-blue-600 active:scale-95 transition-all"
    aria-label="Add item"
  >
    +
  </button>

  <!-- Add Modal -->
  <QuickAddModal
    open={showAddModal}
    categories={$categories}
    onClose={() => showAddModal = false}
  />

  <!-- Edit Modal -->
  <EditItemModal
    item={editingItem}
    categories={$categories}
    onClose={() => editingItem = null}
  />
{/if}
