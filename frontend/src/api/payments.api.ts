import { apiFetch } from './auth.api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export type PaymentReason =
  | 'PROCESSING_FEE'
  | 'UNIFORM_ID_FEE'
  | 'ASSESSMENT_DEPOSIT'
  | 'EXTERNAL_FEES';

export type PaymentMethod = 'CASH' | 'GCASH' | 'BANK_TRANSFER' | 'CHECK';

export interface PaymentListQuery {
  search?: string;
  reason?: string | string[];
  paymentMethod?: string[];
  programId?: string;
  batchId?: string;
  confirmedBy?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'payment_date' | 'amount' | 'or_number';
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentListResponse {
  data: PaymentRow[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  totals: {
    count: number;
    totalAmount: string;
  };
}

export interface PaymentRow {
  id: string;
  or_number: string;
  payment_date: string | null;
  amount: string;
  reason_of_dues: PaymentReason;
  confirmed_by_name: string | null;
  trainee: {
    first_name: string;
    last_name: string;
  } | null;
  program: {
    name: string;
  } | null;
}

export async function getPayments(role: 'admin' | 'registrar', query: PaymentListQuery = {}, signal?: AbortSignal) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
      return;
    }
    params.append(key, String(value));
  });

  const response = await apiFetch(`${API_BASE_URL}/api/${role}/payments?${params.toString()}`, { signal });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Failed to load payments');
  }
  return (await response.json()) as PaymentListResponse;
}

export async function getPaymentDetail(role: 'admin' | 'registrar', id: string) {
  const response = await apiFetch(`${API_BASE_URL}/api/${role}/payments/${id}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Failed to load payment detail');
  }
  return response.json();
}

export async function getPaymentTraineeOptions(role: 'admin' | 'registrar', q: string) {
  const response = await apiFetch(`${API_BASE_URL}/api/${role}/payments/trainee-options?q=${encodeURIComponent(q)}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Failed to load trainee options');
  }
  return response.json();
}

export async function getPaymentFilterOptions(role: 'admin' | 'registrar') {
  const response = await apiFetch(`${API_BASE_URL}/api/${role}/payments/filter-options`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message ?? 'Failed to load payment filters');
  }
  return response.json();
}

export async function createPayment(role: 'admin' | 'registrar', payload: any) {
  const response = await apiFetch(`${API_BASE_URL}/api/${role}/payments`, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Failed to record payment');
  }
  return data;
}
