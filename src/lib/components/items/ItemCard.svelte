<script lang="ts">
  import type { FreezerItem, Category } from '$lib/types'
  import ExpirationBadge from './ExpirationBadge.svelte'

  interface Props {
    item: FreezerItem
    category: Category | undefined
    onEdit: (item: FreezerItem) => void
  }

  let { item, category, onEdit }: Props = $props()
</script>

<button
  onclick={() => onEdit(item)}
  class="group w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all duration-200 text-left active:scale-[0.98]"
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
