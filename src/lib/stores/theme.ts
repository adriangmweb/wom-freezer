import { writable } from 'svelte/store'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'freezer-theme'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return 'system'
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const theme = writable<Theme>(getInitialTheme())

export function initTheme() {
  // Apply theme on load
  theme.subscribe(value => {
    if (typeof window === 'undefined') return

    const effectiveTheme = value === 'system' ? getSystemTheme() : value

    if (effectiveTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    localStorage.setItem(STORAGE_KEY, value)
  })

  // Listen for system theme changes
  if (typeof window !== 'undefined') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      theme.update(current => {
        if (current === 'system') {
          const effectiveTheme = getSystemTheme()
          if (effectiveTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
        return current
      })
    })
  }
}

export function setTheme(newTheme: Theme) {
  theme.set(newTheme)
}
