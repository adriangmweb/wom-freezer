<script lang="ts">
  import { db } from '$lib/db/database'
  import { items, loadItems } from '$lib/stores/items'
  import { categories, loadCategories } from '$lib/stores/categories'
  import { theme, setTheme, type Theme } from '$lib/stores/theme'
  import { showToast } from '$lib/stores/ui'
  import { session, user, signInWithApple, signInWithEmail, verifyEmailOtp, signOut } from '$lib/stores/auth'
  import { syncState, syncOnce } from '$lib/sync/syncEngine'
  import { isSupabaseConfigured } from '$lib/supabase/client'

  const themeOptions: { id: Theme; label: string; icon: string }[] = [
    { id: 'light', label: 'Light', icon: '☀️' },
    { id: 'dark', label: 'Dark', icon: '🌙' },
    { id: 'system', label: 'System', icon: '💻' },
  ]

  let fileInput: HTMLInputElement
  let email = ''
  let otp = ''
  let otpSent = false
  let authError: string | null = null
  const appleEnabled = false

  async function handleExport() {
    const items = await db.items.filter(item => item.deletedAt == null).toArray()
    const categories = await db.categories.filter(category => category.deletedAt == null).toArray()
    const data = {
      items,
      categories,
      exportedAt: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `freezer-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported successfully')
  }

  async function handleImport(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.items || !Array.isArray(data.items)) {
        throw new Error('Invalid backup file: missing items array')
      }

      const now = new Date()
      const existingItems = await db.items.toArray()
      for (const item of existingItems) {
        await db.items.update(item.id, { deletedAt: now, updatedAt: now })
      }

      if (data.categories) {
        const existingCategories = await db.categories.toArray()
        for (const category of existingCategories) {
          await db.categories.update(category.id, { deletedAt: now, updatedAt: now })
        }
      }

      // Import items
      for (const item of data.items) {
        // Convert date strings back to Date objects
        if (item.expirationDate) {
          item.expirationDate = new Date(item.expirationDate)
        }
        if (item.addedDate) {
          item.addedDate = new Date(item.addedDate)
        }
        if (item.updatedAt) {
          item.updatedAt = new Date(item.updatedAt)
        } else {
          item.updatedAt = item.addedDate ? new Date(item.addedDate) : new Date()
        }
        if (item.deletedAt) {
          item.deletedAt = new Date(item.deletedAt)
        } else {
          item.deletedAt = null
        }

        await db.items.put(item)
      }

      // Import custom categories if present
      if (data.categories && Array.isArray(data.categories)) {
        for (const category of data.categories) {
          if (category.updatedAt) {
            category.updatedAt = new Date(category.updatedAt)
          } else {
            category.updatedAt = new Date()
          }
          if (category.deletedAt) {
            category.deletedAt = new Date(category.deletedAt)
          } else {
            category.deletedAt = null
          }
          await db.categories.put(category)
        }
      }

      // Reload stores
      await loadItems()
      await loadCategories()

      showToast(`Imported ${data.items.length} items successfully`)
    } catch (error) {
      console.error('Import error:', error)
      showToast('Failed to import: Invalid file format')
    }

    // Reset file input
    input.value = ''
  }

  async function handleClearAll() {
    if (confirm('Are you sure you want to delete all items? This cannot be undone.')) {
      const now = new Date()
      const allItems = await db.items.toArray()
      for (const item of allItems) {
        await db.items.update(item.id, { deletedAt: now, updatedAt: now })
      }
      await loadItems()
      showToast('All items deleted')
    }
  }

  async function handleAppleSignIn() {
    authError = null
    try {
      await signInWithApple()
    } catch (error) {
      authError = error instanceof Error ? error.message : 'Failed to sign in'
    }
  }

  async function handleEmailSignIn() {
    authError = null
    if (!email.trim()) return
    try {
      await signInWithEmail(email.trim())
      otpSent = true
      showToast('Code sent. Check your email for the code.')
    } catch (error) {
      authError = error instanceof Error ? error.message : 'Failed to send code'
    }
  }

  async function handleVerifyOtp() {
    authError = null
    const trimmedEmail = email.trim()
    const trimmedOtp = otp.trim()
    if (!trimmedEmail || !trimmedOtp) return
    try {
      await verifyEmailOtp(trimmedEmail, trimmedOtp)
      otp = ''
      otpSent = false
      showToast('Signed in successfully')
    } catch (error) {
      authError = error instanceof Error ? error.message : 'Invalid code'
    }
  }

  async function handleSignOut() {
    authError = null
    try {
      await signOut()
      showToast('Signed out')
    } catch (error) {
      authError = error instanceof Error ? error.message : 'Failed to sign out'
    }
  }

  async function handleSyncNow() {
    authError = null
    try {
      await syncOnce()
    } catch (error) {
      authError = error instanceof Error ? error.message : 'Sync failed'
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

    <input
      type="file"
      accept=".json"
      onchange={handleImport}
      bind:this={fileInput}
      class="hidden"
    />
    <button
      onclick={() => fileInput.click()}
      class="w-full px-4 py-4 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
    >
      <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
      </svg>
      <div>
        <div class="font-medium text-gray-900 dark:text-white">Import Data</div>
        <div class="text-sm text-gray-500 dark:text-gray-400">Restore from a backup JSON file</div>
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

  <!-- Sync -->
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
    <div class="flex items-center gap-3">
      <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0014-7M19 5a9 9 0 00-14 7" />
      </svg>
      <span class="font-medium text-gray-900 dark:text-white">Sync</span>
    </div>

    {#if !isSupabaseConfigured}
      <div class="text-sm text-gray-500 dark:text-gray-400">
        Supabase is not configured. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
      </div>
    {:else if $session}
      <div class="text-sm text-gray-600 dark:text-gray-300">
        Signed in as {$user?.email ?? 'unknown'}
      </div>
      <div class="text-xs text-gray-500 dark:text-gray-400">
        Last sync: {$syncState.lastSyncedAt ? $syncState.lastSyncedAt.toLocaleString() : 'Never'}
      </div>
      <div class="flex gap-2">
        <button
          onclick={handleSyncNow}
          class="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
        >
          {$syncState.status === 'syncing' ? 'Syncing…' : 'Sync now'}
        </button>
        <button
          onclick={handleSignOut}
          class="flex-1 py-2 px-3 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Sign out
        </button>
      </div>
    {:else}
      {#if appleEnabled}
        <button
          onclick={handleAppleSignIn}
          class="w-full py-2 px-3 rounded-lg text-sm font-medium bg-black text-white hover:bg-gray-900 transition-colors"
        >
          Sign in with Apple
        </button>
      {/if}
      <div class="space-y-2">
        <div class="flex gap-2">
          <input
            type="email"
            placeholder="you@example.com"
            bind:value={email}
            class="flex-1 px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          />
          <button
            onclick={handleEmailSignIn}
            class="py-2 px-3 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Send code
          </button>
        </div>

        {#if otpSent}
          <div class="flex gap-2">
            <input
              type="text"
              inputmode="numeric"
              placeholder="Code"
              bind:value={otp}
              class="flex-1 px-3 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <button
              onclick={handleVerifyOtp}
              class="py-2 px-3 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Verify
            </button>
          </div>
        {/if}
      </div>
    {/if}

    {#if authError}
      <div class="text-sm text-red-500">{authError}</div>
    {/if}
  </div>

  <div class="text-center text-sm text-gray-400 dark:text-gray-500 pt-4">
    <p>WOM Freezer v1.0.0</p>
  </div>
</div>
