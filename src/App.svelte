<script lang="ts">
  import Layout from '$lib/components/layout/Layout.svelte'
  import Home from '$lib/pages/Home.svelte'
  import Categories from '$lib/pages/Categories.svelte'
  import Settings from '$lib/pages/Settings.svelte'
  import Toast from '$lib/components/shared/Toast.svelte'

  let currentPage: 'home' | 'categories' | 'settings' = $state('home')

  function navigate(page: 'home' | 'categories' | 'settings') {
    currentPage = page
  }

  const pageTitle = $derived({
    home: 'Freezer Inventory',
    categories: 'Categories',
    settings: 'Settings',
  }[currentPage])
</script>

<Toast />

<Layout title={pageTitle} activePage={currentPage} onNavigate={navigate}>
  {#if currentPage === 'home'}
    <Home />
  {:else if currentPage === 'categories'}
    <Categories />
  {:else if currentPage === 'settings'}
    <Settings />
  {/if}
</Layout>
