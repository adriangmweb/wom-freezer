<script lang="ts">
  import Header from './Header.svelte'
  import BottomNav from './BottomNav.svelte'
  import type { Snippet } from 'svelte'

  interface Props {
    title?: string
    activePage: 'home' | 'categories' | 'settings'
    onNavigate: (page: 'home' | 'categories' | 'settings') => void
    children: Snippet
  }

  let { title, activePage, onNavigate, children }: Props = $props()
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  <Header {title} />

  <main class="pb-32">
    {@render children()}
  </main>

  <BottomNav {activePage} {onNavigate} />
</div>
