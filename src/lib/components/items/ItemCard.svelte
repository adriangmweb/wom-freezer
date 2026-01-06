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
  class="w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
>
  <div class="text-2xl">{category?.icon ?? '📦'}</div>

  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2">
      <h3 class="font-medium text-gray-900 truncate">{item.name}</h3>
      <span class="text-sm text-gray-500">x{item.quantity}</span>
    </div>
    <ExpirationBadge date={item.expirationDate} />
  </div>

  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
  </svg>
</button>
