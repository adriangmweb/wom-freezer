<script lang="ts">
  import { addDays } from 'date-fns'
  import type { Category } from '$lib/types'
  import { addItem } from '$lib/stores/items'
  import { showToast } from '$lib/stores/ui'
  import CategoryPicker from '$lib/components/categories/CategoryPicker.svelte'

  interface Props {
    open: boolean
    categories: Category[]
    onClose: () => void
  }

  let { open, categories, onClose }: Props = $props()

  let name = $state('')
  let selectedCategory = $state('other')
  let quantity = $state(1)
  let expirationPreset = $state('3months')

  const EXPIRATION_PRESETS = [
    { id: '1week', label: '1 Week', days: 7 },
    { id: '1month', label: '1 Month', days: 30 },
    { id: '3months', label: '3 Months', days: 90 },
    { id: '6months', label: '6 Months', days: 180 },
    { id: 'none', label: 'None', days: null },
  ]

  function resetForm() {
    name = ''
    quantity = 1
    expirationPreset = '3months'
  }

  async function handleSubmit(addAnother = false) {
    if (!name.trim()) return

    const preset = EXPIRATION_PRESETS.find(p => p.id === expirationPreset)
    const expirationDate = preset?.days ? addDays(new Date(), preset.days) : null

    await addItem({
      name: name.trim(),
      categoryId: selectedCategory,
      quantity,
      unit: 'pieces',
      expirationDate,
      notes: '',
    })

    showToast(`Added "${name.trim()}"`)

    if (addAnother) {
      resetForm()
    } else {
      resetForm()
      onClose()
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }
</script>

{#if open}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
    onclick={handleBackdropClick}
  >
    <div class="bg-white w-full max-w-lg rounded-t-2xl p-6 animate-slide-up">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold">Add Item</h2>
        <button
          onclick={onClose}
          class="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-5">
        <!-- Name -->
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
            What are you freezing?
          </label>
          <input
            id="name"
            type="text"
            bind:value={name}
            placeholder="e.g. Chicken breast"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            autofocus
          />
        </div>

        <!-- Category -->
        <div>
          <span class="block text-sm font-medium text-gray-700 mb-2">Category</span>
          <CategoryPicker
            {categories}
            selected={selectedCategory}
            onSelect={(id) => selectedCategory = id}
          />
        </div>

        <!-- Quantity -->
        <div>
          <span class="block text-sm font-medium text-gray-700 mb-2">Quantity</span>
          <div class="flex items-center gap-4">
            <button
              type="button"
              onclick={() => quantity = Math.max(1, quantity - 1)}
              class="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-xl font-medium hover:bg-gray-200 transition-colors"
            >
              -
            </button>
            <span class="text-2xl font-semibold w-12 text-center">{quantity}</span>
            <button
              type="button"
              onclick={() => quantity++}
              class="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-xl font-medium hover:bg-gray-200 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <!-- Expiration -->
        <div>
          <span class="block text-sm font-medium text-gray-700 mb-2">Expires in</span>
          <div class="flex flex-wrap gap-2">
            {#each EXPIRATION_PRESETS as preset}
              <button
                type="button"
                onclick={() => expirationPreset = preset.id}
                class="px-4 py-2 rounded-full text-sm font-medium transition-colors
                  {expirationPreset === preset.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
              >
                {preset.label}
              </button>
            {/each}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 pt-2">
          <button
            type="button"
            onclick={() => handleSubmit(true)}
            disabled={!name.trim()}
            class="flex-1 py-3 px-4 border border-blue-500 text-blue-500 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add & Continue
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            class="flex-1 py-3 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Item
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  @keyframes slide-up {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }
</style>
