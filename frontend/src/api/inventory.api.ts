
import { apiFetch } from './auth.api'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export type InventoryStockLevel =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'

export type InventoryStockFilter = 'all' | 'in_stock' | 'low' | 'out'

export type InventorySortBy =
  | 'program'
  | 'item'
  | 'size'
  | 'quantity'

export type InventorySortOrder = 'asc' | 'desc'

export interface InventoryListQuery {
  page?: number
  limit?: number
  search?: string
  programId?: string
  size?: string
  stockLevel?: InventoryStockFilter
  sortBy?: InventorySortBy
  sortOrder?: InventorySortOrder
}

export interface InventoryItem {
  id: string
  program_id: string
  item_name: string
  sizes: string
  quantity: number
  updated_at: string
  stock_level: InventoryStockLevel
  programs?: {
    id: string
    name: string
  } | null
  users?: {
    id: string
    first_name: string
    last_name: string
  } | null
}

export interface InventoryListResponse {
  data: InventoryItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface InventorySummary {
  program_id: string
  program_name: string
  total_units: number
  total_items: number
  low_stock_items: number
  out_of_stock_items: number
}

export interface InventoryAvailability {
  program_id: string
  size: string
  available_quantity: number
}

export interface CreateInventoryPayload {
  program_id: string
  sizes: string
  quantity: number
}

export interface RestockInventoryPayload {
  quantity: number
  remarks?: string
}

export interface AdjustInventoryPayload {
  quantity_change: number
  reason: string
}

export interface InventoryMutationResponse {
  id: string
  quantity: number
  stock_level: InventoryStockLevel
}

export interface InventoryHistoryEntry {
  id: string
  type: 'INITIAL' | 'RESTOCK' | 'DISTRIBUTED' | 'ADJUSTMENT'
  quantity_change: number
  quantity_after: number
  enrollment_id: string | null
  remarks: string | null
  created_at: string
  users: {
    id: string
    first_name: string
    last_name: string
  } | null
}

export interface InventoryHistoryResponse {
  data: InventoryHistoryEntry[]
  nextCursor: string | null
  hasMore: boolean
}

async function inventoryRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await apiFetch(`${API_BASE_URL}${path}`, init)
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const message = result?.message

    throw new Error(
      Array.isArray(message)
        ? message.join(', ')
        : message ?? result?.error ?? 'Inventory request failed.',
    )
  }

  return result as T
}

export async function getInventory(
  query: InventoryListQuery = {},
  signal?: AbortSignal,
): Promise<InventoryListResponse> {
  const params = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      value === 'all'
    ) {
      return
    }

    params.set(key, String(value))
  })

  const search = params.toString()

  return inventoryRequest<InventoryListResponse>(
    `/api/inventory${search ? `?${search}` : ''}`,
    { signal },
  )
}

export async function getInventorySummary(
  signal?: AbortSignal,
): Promise<InventorySummary[]> {
  return inventoryRequest<InventorySummary[]>(
    '/api/inventory/summary',
    { signal },
  )
}

export async function getUniformAvailability(
  programId: string,
  size: string,
  signal?: AbortSignal,
): Promise<InventoryAvailability> {
  const params = new URLSearchParams({ programId, size })

  return inventoryRequest<InventoryAvailability>(
    `/api/inventory/availability?${params.toString()}`,
    { signal },
  )
}

export async function createInventory(
  payload: CreateInventoryPayload,
): Promise<InventoryItem> {
  return inventoryRequest<InventoryItem>('/api/inventory', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function restockInventory(
  id: string,
  payload: RestockInventoryPayload,
): Promise<InventoryMutationResponse> {
  return inventoryRequest<InventoryMutationResponse>(
    `/api/inventory/${id}/restock`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )
}

export async function adjustInventory(
  id: string,
  payload: AdjustInventoryPayload,
): Promise<InventoryMutationResponse> {
  return inventoryRequest<InventoryMutationResponse>(
    `/api/inventory/${id}/adjust`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )
}

export async function getInventoryHistory(
  id: string,
  cursor?: string | null,
  signal?: AbortSignal,
): Promise<InventoryHistoryResponse> {
  const params = new URLSearchParams()

  if (cursor) {
    params.set('cursor', cursor)
  }

  const search = params.toString()

  return inventoryRequest<InventoryHistoryResponse>(
    `/api/inventory/${id}/history${search ? `?${search}` : ''}`,
    { signal },
  )
}
