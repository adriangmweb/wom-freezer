import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'
import { initializeDatabase } from '$lib/db/seed'
import { initTheme } from '$lib/stores/theme'
import { initAuth } from '$lib/stores/auth'
import { initSync } from '$lib/sync/syncEngine'

// Initialize theme
initTheme()

// Initialize database before mounting app
initializeDatabase().then(() => {
  initAuth()
    .then(() => {
      initSync()
    })
    .finally(() => {
      mount(App, {
        target: document.getElementById('app')!,
      })
    })
})
