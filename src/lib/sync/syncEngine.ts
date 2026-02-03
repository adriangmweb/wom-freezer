import { writable } from 'svelte/store'
import { db } from '$lib/db/database'
import { supabase, isSupabaseConfigured } from '$lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadItems } from '$lib/stores/items'
import { loadCategories } from '$lib/stores/categories'
import type { FreezerItem, Category, SyncState } from '$lib/types'

export type SyncStatus = 'idle' | 'syncing' | 'error'

interface SyncStateView {
  status: SyncStatus
  lastSyncedAt: Date | null
  error: string | null
}

export const syncState = writable<SyncStateView>({
  status: 'idle',
  lastSyncedAt: null,
  error: null,
})

interface RemoteCategory {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  sort_order: number
  updated_at: string
  deleted_at: string | null
}

interface RemoteItem {
  id: string
  user_id: string
  name: string
  quantity: number
  unit: string
  category_id: string
  expiration_date: string | null
  added_date: string
  notes: string
  updated_at: string
  deleted_at: string | null
}

let syncInProgress = false
let pendingSync = false
let syncTimer: number | null = null
let initialized = false

export function initSync() {
  if (initialized) return
  initialized = true

  if (!supabase || !isSupabaseConfigured) {
    return
  }
  const client = supabase

  client.auth.onAuthStateChange(() => {
    void syncOnce()
  })

  syncTimer = window.setInterval(() => {
    void syncOnce()
  }, 30000)

  void syncOnce()
}

export async function syncOnce() {
  if (!supabase || !isSupabaseConfigured) {
    return
  }
  const client = supabase

  if (syncInProgress) {
    pendingSync = true
    return
  }

  const { data: sessionData } = await client.auth.getSession()
  const currentSession = sessionData.session

  if (!currentSession) {
    syncState.update(state => ({ ...state, status: 'idle' }))
    return
  }

  syncInProgress = true
  syncState.update(state => ({ ...state, status: 'syncing', error: null }))

  try {
    const userId = currentSession.user.id
    const sync = await getSyncState()
    const since = sync.lastSyncedAt ?? new Date(0)

    const pushMax = await pushLocalChanges(client, userId, since)
    const pullMax = await pullRemoteChanges(client, userId, since)

    const newLastSyncedAt = maxDate(since, pushMax, pullMax) ?? new Date()
    await db.sync.put({ ...sync, lastSyncedAt: newLastSyncedAt })

    await loadCategories()
    await loadItems()

    syncState.update(state => ({
      ...state,
      status: 'idle',
      lastSyncedAt: newLastSyncedAt,
      error: null,
    }))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error'
    console.error('Sync error:', error)
    syncState.update(state => ({ ...state, status: 'error', error: message }))
  } finally {
    syncInProgress = false
    if (pendingSync) {
      pendingSync = false
      void syncOnce()
    }
  }
}

async function getSyncState(): Promise<SyncState> {
  let state = await db.sync.get('state')
  if (!state) {
    state = {
      id: 'state',
      lastSyncedAt: new Date(0),
      deviceId: crypto.randomUUID(),
    }
    await db.sync.put(state)
  }
  syncState.update(current => ({
    ...current,
    lastSyncedAt: state.lastSyncedAt,
  }))
  return state
}

async function pushLocalChanges(
  client: SupabaseClient,
  userId: string,
  since: Date
): Promise<Date | null> {
  const changedCategories = await db.categories.where('updatedAt').above(since).toArray()
  const changedItems = await db.items.where('updatedAt').above(since).toArray()

  const categoryPayload: RemoteCategory[] = changedCategories.map(category => ({
    id: category.id,
    user_id: userId,
    name: category.name,
    icon: category.icon,
    color: category.color,
    is_default: category.isDefault,
    sort_order: category.sortOrder,
    updated_at: category.updatedAt.toISOString(),
    deleted_at: category.deletedAt ? category.deletedAt.toISOString() : null,
  }))

  const itemPayload: RemoteItem[] = changedItems.map(item => ({
    id: item.id,
    user_id: userId,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category_id: item.categoryId,
    expiration_date: item.expirationDate ? item.expirationDate.toISOString() : null,
    added_date: item.addedDate.toISOString(),
    notes: item.notes,
    updated_at: item.updatedAt.toISOString(),
    deleted_at: item.deletedAt ? item.deletedAt.toISOString() : null,
  }))

  if (categoryPayload.length > 0) {
    const { error } = await client
      .from('categories')
      .upsert(categoryPayload, { onConflict: 'user_id,id' })
    if (error) throw error
  }

  if (itemPayload.length > 0) {
    const { error } = await client
      .from('items')
      .upsert(itemPayload, { onConflict: 'user_id,id' })
    if (error) throw error
  }

  const latestCategory = maxDateFrom(changedCategories.map(c => c.updatedAt))
  const latestItem = maxDateFrom(changedItems.map(i => i.updatedAt))
  return maxDate(latestCategory, latestItem)
}

async function pullRemoteChanges(
  client: SupabaseClient,
  userId: string,
  since: Date
): Promise<Date | null> {
  const sinceIso = since.toISOString()

  const { data: remoteCategories, error: categoryError } = await client
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', sinceIso)

  if (categoryError) throw categoryError

  const { data: remoteItems, error: itemError } = await client
    .from('items')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', sinceIso)

  if (itemError) throw itemError

  const categoryDates: Date[] = []
  const itemDates: Date[] = []

  for (const remote of remoteCategories as RemoteCategory[]) {
    const remoteUpdatedAt = new Date(remote.updated_at)
    categoryDates.push(remoteUpdatedAt)

    const existing = await db.categories.get(remote.id)
    if (!existing || remoteUpdatedAt > existing.updatedAt) {
      const updatedCategory: Category = {
        id: remote.id,
        name: remote.name,
        icon: remote.icon,
        color: remote.color,
        isDefault: remote.is_default,
        sortOrder: remote.sort_order,
        updatedAt: remoteUpdatedAt,
        deletedAt: remote.deleted_at ? new Date(remote.deleted_at) : null,
      }
      await db.categories.put(updatedCategory)
    }
  }

  for (const remote of remoteItems as RemoteItem[]) {
    const remoteUpdatedAt = new Date(remote.updated_at)
    itemDates.push(remoteUpdatedAt)

    const existing = await db.items.get(remote.id)
    if (!existing || remoteUpdatedAt > existing.updatedAt) {
      const updatedItem: FreezerItem = {
        id: remote.id,
        name: remote.name,
        quantity: remote.quantity,
        unit: remote.unit,
        categoryId: remote.category_id,
        expirationDate: remote.expiration_date ? new Date(remote.expiration_date) : null,
        addedDate: new Date(remote.added_date),
        notes: remote.notes,
        updatedAt: remoteUpdatedAt,
        deletedAt: remote.deleted_at ? new Date(remote.deleted_at) : null,
      }
      await db.items.put(updatedItem)
    }
  }

  return maxDate(maxDateFrom(categoryDates), maxDateFrom(itemDates))
}

function maxDate(...dates: Array<Date | null | undefined>): Date | null {
  const validDates = dates.filter(Boolean) as Date[]
  if (validDates.length === 0) return null
  return validDates.reduce((max, value) => (value > max ? value : max), validDates[0])
}

function maxDateFrom(dates: Date[]): Date | null {
  if (dates.length === 0) return null
  return dates.reduce((max, value) => (value > max ? value : max), dates[0])
}
