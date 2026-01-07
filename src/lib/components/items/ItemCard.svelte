<script lang="ts">
  import type { FreezerItem, Category } from '$lib/types'
  import ExpirationBadge from './ExpirationBadge.svelte'

  interface Props {
    item: FreezerItem
    category: Category | undefined
    onEdit: (item: FreezerItem) => void
    onDelete?: (item: FreezerItem) => void
  }

  let { item, category, onEdit, onDelete }: Props = $props()

  // Swipe state
  let startX = $state(0)
  let currentX = $state(0)
  let swiping = $state(false)
  let swipeOffset = $state(0)

  const SWIPE_THRESHOLD = 80
  const MAX_SWIPE = 100

  function handleTouchStart(e: TouchEvent) {
    startX = e.touches[0].clientX
    currentX = startX
    swiping = true
  }

  function handleTouchMove(e: TouchEvent) {
    if (!swiping) return
    currentX = e.touches[0].clientX
    const diff = currentX - startX
    // Clamp the swipe offset
    swipeOffset = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, diff))
  }

  function handleTouchEnd() {
    if (!swiping) return
    swiping = false

    if (swipeOffset < -SWIPE_THRESHOLD && onDelete) {
      // Swiped left - delete
      onDelete(item)
    } else if (swipeOffset > SWIPE_THRESHOLD) {
      // Swiped right - edit
      onEdit(item)
    }
    // Reset
    swipeOffset = 0
  }

  function handleClick() {
    if (Math.abs(swipeOffset) < 10) {
      onEdit(item)
    }
  }
</script>

<div class="relative overflow-hidden rounded-xl">
  <!-- Delete action (left swipe) -->
  <div
    class="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center transition-opacity duration-200"
    style="opacity: {swipeOffset < -20 ? Math.min(1, Math.abs(swipeOffset) / SWIPE_THRESHOLD) : 0}"
  >
    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  </div>

  <!-- Edit action (right swipe) -->
  <div
    class="absolute inset-y-0 left-0 w-24 bg-cyan-500 flex items-center justify-center transition-opacity duration-200"
    style="opacity: {swipeOffset > 20 ? Math.min(1, swipeOffset / SWIPE_THRESHOLD) : 0}"
  >
    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  </div>

  <!-- Card content -->
  <button
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    onclick={handleClick}
    class="group w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 hover:border-cyan-200 dark:hover:border-cyan-800 text-left touch-pan-y"
    style="transform: translateX({swipeOffset}px); transition: {swiping ? 'none' : 'transform 0.2s ease-out'}"
  >
    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center text-2xl flex-shrink-0">
      {category?.icon ?? '📦'}
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2 mb-1">
        <h3 class="font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
        <span class="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
          {item.quantity}x
        </span>
      </div>
      <ExpirationBadge date={item.expirationDate} />
    </div>

    <svg class="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </button>
</div>
