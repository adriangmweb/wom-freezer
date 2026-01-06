<script lang="ts">
  import { toasts, dismissToast } from '$lib/stores/ui'

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }
</script>

<div class="fixed top-16 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
  {#each $toasts as toast (toast.id)}
    <div
      class="pointer-events-auto {typeStyles[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between animate-fade-in"
    >
      <span>{toast.message}</span>
      <button
        onclick={() => dismissToast(toast.id)}
        class="ml-4 hover:opacity-80"
        aria-label="Dismiss"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.2s ease-out;
  }
</style>
