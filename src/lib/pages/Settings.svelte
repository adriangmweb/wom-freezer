<script lang="ts">
  import { db } from '$lib/db/database'
  import { items } from '$lib/stores/items'
  import { theme, setTheme, type Theme } from '$lib/stores/theme'

  const themeOptions: { id: Theme; label: string; icon: string }[] = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'system', label: 'System', icon: '💻' },
  ]

  async function handleExport() {
    const data = {
      items: await db.items.toArray(),
      categories: await db.categories.toArray(),
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `freezer-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleClearAll() {
    if (confirm('Are you sure you want to delete all items? This cannot be undone.')) {
      await db.items.clear()
      items.set([])
    }
  }
</script>

<div class="p-4 space-y-6">
  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Settings</h2>

  <!-- Theme -->
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
    <div class="flex items-center gap-3 mb-3">
      <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
      <span class="font-medium text-gray-900 dark:text-white">Theme</span>
    </div>
    <div class="flex gap-2">
      {#each themeOptions as option}
        <button
          onclick={() => setTheme(option.id)}
          class="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
            {$theme === option.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}"
        >
          {option.icon} {option.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Data -->
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
    <button
      onclick={handleExport}
      class="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <div>
        <div class="font-medium text-gray-900 dark:text-white">Export Data</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Download your freezer inventory as JSON</div>
      </div>
    </button>

    <button
      onclick={handleClearAll}
      class="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <div>
        <div class="font-medium text-red-600 dark:text-red-400">Clear All Items</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Delete all items from your freezer</div>
      </div>
    </button>
  </div>

  <div class="text-center text-sm text-gray-400 dark:text-gray-500 pt-4">
    <p>WOM Freezer v1.0.0</p>
  </div>
</div>
