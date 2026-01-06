<script lang="ts">
  export type SortOption = 'name' | 'added' | 'expiration'

  interface Props {
    value: SortOption
    onChange: (value: SortOption) => void
  }

  let { value, onChange }: Props = $props()

  const options: { id: SortOption; label: string }[] = [
    { id: 'name', label: 'Name' },
    { id: 'added', label: 'Recently Added' },
    { id: 'expiration', label: 'Expiring Soon' },
  ]
</script>

<div class="flex items-center gap-2">
  <span class="text-sm text-gray-500 dark:text-gray-400">Sort:</span>
  <select
    {value}
    onchange={(e) => onChange(e.currentTarget.value as SortOption)}
    class="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-0 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
  >
    {#each options as option}
      <option value={option.id}>{option.label}</option>
    {/each}
  </select>
</div>
