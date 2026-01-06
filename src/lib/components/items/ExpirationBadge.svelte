<script lang="ts">
  import { getExpirationStatus, STATUS_COLORS, STATUS_LABELS, formatExpirationText } from '$lib/utils/expiration'

  interface Props {
    date: Date | null
    showText?: boolean
  }

  let { date, showText = true }: Props = $props()

  const status = $derived(getExpirationStatus(date))
  const colorClass = $derived(STATUS_COLORS[status])
  const label = $derived(STATUS_LABELS[status])
  const text = $derived(formatExpirationText(date))
</script>

<div class="flex items-center gap-2">
  <span class="w-2.5 h-2.5 rounded-full {colorClass}"></span>
  {#if showText}
    <span class="text-sm text-gray-600">{text}</span>
  {:else}
    <span class="text-xs font-medium text-gray-500">{label}</span>
  {/if}
</div>
