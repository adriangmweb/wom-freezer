<script lang="ts">
  import Layout from '$lib/components/layout/Layout.svelte'
  import Home from '$lib/pages/Home.svelte'
  import Categories from '$lib/pages/Categories.svelte'
  import Settings from '$lib/pages/Settings.svelte'
  import Toast from '$lib/components/shared/Toast.svelte'
  import QuickAddModal from '$lib/components/modals/QuickAddModal.svelte'
  import EditItemModal from '$lib/components/modals/EditItemModal.svelte'
  import CategoryModal from '$lib/components/modals/CategoryModal.svelte'
  import { modal } from '$lib/stores/modal'
  import { categories } from '$lib/stores/categories'

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

<!-- Modals rendered OUTSIDE Layout to fix iOS stacking context -->
{#if modal.current.type === 'quickAdd'}
  <QuickAddModal
    open={true}
    categories={$categories}
    onClose={() => modal.close()}
  />
{/if}

{#if modal.current.type === 'editItem'}
  <EditItemModal
    item={modal.current.item}
    categories={$categories}
    onClose={() => modal.close()}
  />
{/if}

{#if modal.current.type === 'category'}
  <CategoryModal
    category={modal.current.category}
    onClose={() => modal.close()}
  />
{/if}
