<script lang="ts">
  import type { FreezerItem, Category } from '$lib/types'
  import ExpirationBadge from './ExpirationBadge.svelte'

  interface Props {
    item: FreezerItem
    category: Category | undefined
    onEdit: (item: FreezerItem) => void
    onDelete?: (item: FreezerItem) => void
    onQuantityChange?: (item: FreezerItem, delta: number) => void
  }

  let { item, category, onEdit, onDelete, onQuantityChange }: Props = $props()

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
    } else if (swipeOffset > SWIPE_THRESHOLD && onQuantityChange) {
      // Swiped right - use one (decrement quantity)
      onQuantityChange(item, -1)
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

  <!-- Use one action (right swipe) -->
  <div
    class="absolute inset-y-0 left-0 w-24 bg-green-500 flex items-center justify-center transition-opacity duration-200"
    style="opacity: {swipeOffset > 20 ? Math.min(1, swipeOffset / SWIPE_THRESHOLD) : 0}"
  >
    <div class="flex flex-col items-center text-white">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
      </svg>
      <span class="text-xs font-medium mt-1">Use 1</span>
    </div>
  </div>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <!-- Card content -->
  <div
    role="button"
    tabindex="0"
    ontouchstart={handleTouchStart}
    ontouchmove={handleTouchMove}
    ontouchend={handleTouchEnd}
    onclick={handleClick}
    onkeydown={(e) => e.key === 'Enter' && handleClick()}
    class="group w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 hover:border-cyan-200 dark:hover:border-cyan-800 text-left touch-pan-y cursor-pointer"
    style="transform: translateX({swipeOffset}px); transition: {swiping ? 'none' : 'transform 0.2s ease-out'}"
  >
    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/30 dark:to-blue-900/30 flex items-center justify-center text-2xl flex-shrink-0">
      {category?.icon ?? '📦'}
    </div>

    <div class="flex-1 min-w-0">
      <h3 class="font-semibold text-gray-900 dark:text-white truncate mb-1">{item.name}</h3>
      <ExpirationBadge date={item.expirationDate} />
    </div>

    <!-- Inline quantity controls -->
    <div
      class="flex items-center gap-1"
      onclick={(e) => e.stopPropagation()}
      ontouchstart={(e) => e.stopPropagation()}
      ontouchmove={(e) => e.stopPropagation()}
      ontouchend={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onclick={() => onQuantityChange?.(item, -1)}
        disabled={item.quantity <= 1}
        class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Decrease quantity"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
      </button>
      <span class="w-8 text-center font-semibold text-gray-900 dark:text-white">{item.quantity}</span>
      <button
        type="button"
        onclick={() => onQuantityChange?.(item, 1)}
        class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
        aria-label="Increase quantity"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  </div>
</div>
