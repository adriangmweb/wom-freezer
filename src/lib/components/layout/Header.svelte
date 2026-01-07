<script lang="ts">
  interface Props {
    title?: string
  }

  let { title = 'Freezer' }: Props = $props()
</script>

<header class="sticky top-0 z-10 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 pt-safe pb-3 shadow-lg">
  <div class="flex items-center justify-center gap-2 pt-3">
    <svg class="w-7 h-7" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
        <line x1="60" y1="20" x2="60" y2="100" />
        <line x1="20" y1="60" x2="100" y2="60" />
        <line x1="32" y1="32" x2="88" y2="88" />
        <line x1="88" y1="32" x2="32" y2="88" />
        <line x1="60" y1="20" x2="50" y2="30" />
        <line x1="60" y1="20" x2="70" y2="30" />
        <line x1="60" y1="100" x2="50" y2="90" />
        <line x1="60" y1="100" x2="70" y2="90" />
        <line x1="20" y1="60" x2="30" y2="50" />
        <line x1="20" y1="60" x2="30" y2="70" />
        <line x1="100" y1="60" x2="90" y2="50" />
        <line x1="100" y1="60" x2="90" y2="70" />
        <polygon points="60,48 72,60 60,72 48,60" fill="currentColor" stroke="none" />
      </g>
    </svg>
    <h1 class="text-xl font-bold tracking-tight">{title}</h1>
  </div>
</header>
