<script lang="ts">
  import type { Category } from '$lib/types'

  interface Props {
    categories: Category[]
    selected: string
    onSelect: (categoryId: string) => void
  }

  let { categories, selected, onSelect }: Props = $props()
</script>

<div class="grid grid-cols-4 gap-2">
  {#each categories as category (category.id)}
    <button
      type="button"
      onclick={() => onSelect(category.id)}
      class="flex flex-col items-center p-3 rounded-lg border-2 transition-all
        {selected === category.id
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'}"
    >
      <span class="text-2xl">{category.icon}</span>
      <span class="text-xs mt-1 text-gray-600 dark:text-gray-300 truncate w-full text-center">
        {category.name.split(' ')[0]}
      </span>
    </button>
  {/each}
</div>
