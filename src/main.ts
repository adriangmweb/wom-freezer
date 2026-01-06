import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'
import { initializeDatabase } from '$lib/db/seed'

// Initialize database before mounting app
initializeDatabase().then(() => {
  mount(App, {
    target: document.getElementById('app')!,
  })
})
