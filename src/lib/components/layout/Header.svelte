<script lang="ts">
  interface Props {
    title?: string
  }

  let { title = 'Freezer Inventory' }: Props = $props()
</script>

<header class="sticky top-0 z-10 bg-blue-600 text-white px-4 py-3 shadow-md">
  <h1 class="text-xl font-semibold text-center">{title}</h1>
</header>
