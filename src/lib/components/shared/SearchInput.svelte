<script lang="ts">
  interface Props {
    value: string
    onInput: (value: string) => void
    placeholder?: string
  }

  let { value, onInput, placeholder = 'Search...' }: Props = $props()
</script>

<div class="relative">
  <svg
    class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
  <input
    type="text"
    {value}
    oninput={(e) => onInput(e.currentTarget.value)}
    {placeholder}
    class="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-transparent rounded-lg focus:bg-white dark:focus:bg-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-400"
  />
  {#if value}
    <button
      onclick={() => onInput('')}
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      aria-label="Clear search"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  {/if}
</div>
