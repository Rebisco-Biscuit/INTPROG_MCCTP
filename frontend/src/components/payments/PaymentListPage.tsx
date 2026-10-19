import { useCallback, useEffect, useState } from 'react';
import { getPaymentDetail, getPaymentFilterOptions, getPayments, type PaymentListQuery, type PaymentListResponse } from '../../api/payments.api';
import { ListToolbar, type ListFilterChip } from '../common/ListToolbar';
import { Pagination } from '../common/Pagination';
import { useServerList } from '../../hooks/useServerList';

const reasonLabels: Record<string, string> = {
  PROCESSING_FEE: 'Processing Fee',
  UNIFORM_ID_FEE: 'Uniform/ID Fee',
  ASSESSMENT_DEPOSIT: 'Assessment Deposit',
  EXTERNAL_FEES: 'External Fees',
};

function formatCurrency(value: string | number | null | undefined) {
  const numeric = Number(value ?? 0);
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numeric) ? numeric : 0);
}

export function PaymentListPage({ role, onRecordPayment, refreshKey = 0 }: { role: 'admin' | 'registrar'; onRecordPayment?: () => void; refreshKey?: number }) {
  const loadPayments = useCallback((params: URLSearchParams, signal: AbortSignal) => {
    const query: PaymentListQuery = {
      search: params.get('search') ?? '',
      reason: params.getAll('reason'),
      paymentMethod: params.getAll('paymentMethod'),
      programId: params.get('programId') ?? '',
      batchId: params.get('batchId') ?? '',
      confirmedBy: params.get('confirmedBy') ?? '',
      fromDate: params.get('fromDate') ?? '',
      toDate: params.get('toDate') ?? '',
      page: Number(params.get('page') ?? '1') || 1,
      limit: Number(params.get('limit') ?? '20') || 20,
      sortBy: (params.get('sortBy') ?? 'payment_date') as PaymentListQuery['sortBy'],
      sortOrder: (params.get('sortOrder') ?? 'desc') as PaymentListQuery['sortOrder'],
    };
    return getPayments(role, query, signal);
  }, [role]);
  const {
    searchParams,
    setSearchParams,
    data: listData,
    loading,
    error: listError,
  } = useServerList<PaymentListResponse>(loadPayments, 300, refreshKey);
  const rows = listData?.data ?? [];
  const meta = listData?.meta ?? { page: 1, limit: 20, total: 0, totalPages: 1 };
  const totals = listData?.totals ?? { count: 0, totalAmount: '0.00' };
  const queryState = {
    search: searchParams.get('search') ?? '',
    reason: searchParams.getAll('reason'),
    paymentMethod: searchParams.getAll('paymentMethod'),
    programId: searchParams.get('programId') ?? '',
    batchId: searchParams.get('batchId') ?? '',
    confirmedBy: searchParams.get('confirmedBy') ?? '',
    fromDate: searchParams.get('fromDate') ?? '',
    toDate: searchParams.get('toDate') ?? '',
    page: Number(searchParams.get('page') ?? '1') || 1,
    limit: Number(searchParams.get('limit') ?? '20') || 20,
    sortBy: searchParams.get('sortBy') ?? 'payment_date',
    sortOrder: searchParams.get('sortOrder') ?? 'desc',
  };
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<any>({
    programs: [],
    batches: [],
    staff: [],
    paymentMethods: [],
    paymentReasons: [],
  });
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeFilters: ListFilterChip[] = [];
  if (queryState.search) activeFilters.push({ key: 'search', label: 'Search', value: queryState.search });
  queryState.reason.forEach((value) => activeFilters.push({ key: `reason:${value}`, label: 'Reason', value: reasonLabels[value] ?? value }));
  queryState.paymentMethod.forEach((value) => activeFilters.push({ key: `paymentMethod:${value}`, label: 'Method', value }));
  if (queryState.programId) activeFilters.push({ key: 'programId', label: 'Program', value: queryState.programId });
  if (queryState.batchId) activeFilters.push({ key: 'batchId', label: 'Batch', value: queryState.batchId });
  if (queryState.confirmedBy) activeFilters.push({ key: 'confirmedBy', label: 'Confirmed by', value: queryState.confirmedBy });
  if (queryState.fromDate) activeFilters.push({ key: 'fromDate', label: 'From', value: queryState.fromDate });
  if (queryState.toDate) activeFilters.push({ key: 'toDate', label: 'To', value: queryState.toDate });

  const selectedProgramBatches = (() => {
    if (!queryState.programId) return filterOptions.batches ?? [];
    return (filterOptions.batches ?? []).filter((item: any) => item.program_id === queryState.programId);
  })();

  useEffect(() => {
    const fetchOptions = async () => {
      const data = await getPaymentFilterOptions(role);
      setFilterOptions(data);
    };
    fetchOptions().catch((error: unknown) => {
      setOptionsError(error instanceof Error ? error.message : 'Unable to load payment filters');
    });
  }, [role]);

  const updateQuery = (patch: Record<string, string | string[] | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        next.delete(key);
        return;
      }
      if (Array.isArray(value)) {
        next.delete(key);
        value.forEach((item) => next.append(key, item));
        return;
      }
      next.set(key, String(value));
    });
    next.set('page', patch.page === undefined ? '1' : String(patch.page));
    setSearchParams(next);
  };

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    if (key === 'search') next.delete('search');
    if (key.startsWith('reason:')) {
      const value = key.slice('reason:'.length);
      const values = next.getAll('reason');
      next.delete('reason');
      values.filter((item) => item !== value).forEach((item) => next.append('reason', item));
    }
    if (key.startsWith('paymentMethod:')) {
      const value = key.split(':')[1];
      const values = next.getAll('paymentMethod');
      next.delete('paymentMethod');
      values.filter((item) => item !== value).forEach((item) => next.append('paymentMethod', item));
    }
    if (key === 'programId') next.delete('programId');
    if (key === 'batchId') next.delete('batchId');
    if (key === 'confirmedBy') next.delete('confirmedBy');
    if (key === 'fromDate') next.delete('fromDate');
    if (key === 'toDate') next.delete('toDate');
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearAll = () => {
    setSearchParams(new URLSearchParams());
  };

  const toggleMultiFilter = (key: 'reason' | 'paymentMethod', value: string) => {
    const values = searchParams.getAll(key);
    const nextValues = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value];
    updateQuery({ [key]: nextValues });
  };

  const setSort = (sortBy: 'payment_date' | 'amount' | 'or_number') => {
    const sortOrder = queryState.sortBy === sortBy && queryState.sortOrder === 'desc' ? 'asc' : 'desc';
    updateQuery({ sortBy, sortOrder });
  };

  async function openReceipt(id: string) {
    const detail = await getPaymentDetail(role, id);
    setSelectedReceipt(detail);
    setDrawerOpen(true);
  }

  const tableHeaders: { label: string; key: 'or_number' | 'trainee' | 'program' | 'reason_of_dues' | 'amount' | 'payment_date' | 'confirmed_by_name'; sortKey?: 'or_number' | 'amount' | 'payment_date' }[] = [
    { label: 'OR Number', key: 'or_number', sortKey: 'or_number' },
    { label: 'Trainee', key: 'trainee' },
    { label: 'Program', key: 'program' },
    { label: 'Reason', key: 'reason_of_dues' },
    { label: 'Amount', key: 'amount', sortKey: 'amount' },
    { label: 'Date', key: 'payment_date', sortKey: 'payment_date' },
    { label: 'Confirmed by', key: 'confirmed_by_name' },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-800">Payment Records</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Official Receipts</h2>
          </div>
          <button
            type="button"
            onClick={() => onRecordPayment?.()}
            className="border border-blue-900 bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-950"
          >
            Record Payment
          </button>
        </div>

        <div className="mb-5 border border-slate-200 bg-white p-3 sm:p-4">
          <div className="mb-4 border-l-4 border-yellow-400 bg-slate-50 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Filter receipts</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Search and narrow payment records by person, program, date, method, and confirmation status.</p>
          </div>

          <div className="flex flex-col gap-3">
            <ListToolbar
              search={queryState.search}
              searchPlaceholder="Search by OR, trainee, or username"
              filters={activeFilters}
              onSearch={(search) => updateQuery({ search })}
              onRemoveFilter={removeFilter}
              onClearAll={clearAll}
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-1.5">
              <span id="payment-reason-label" className="text-xs font-semibold text-slate-600">Reason</span>
              <details aria-labelledby="payment-reason-label" className="relative border border-slate-200 bg-slate-50 text-sm text-slate-700">
                <summary className="cursor-pointer list-none px-3 py-2.5">{queryState.reason.length ? `${queryState.reason.length} reasons selected` : 'All Reasons'}</summary>
                <div className="absolute left-0 top-full z-20 mt-1 max-h-56 min-w-full overflow-auto border border-slate-200 bg-white p-2 shadow-lg">
                  {filterOptions.paymentReasons.map((option: any) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2 whitespace-nowrap px-2 py-1.5 hover:bg-slate-50">
                      <input type="checkbox" checked={queryState.reason.includes(option.value)} onChange={() => toggleMultiFilter('reason', option.value)} />
                      {option.label}
                    </label>
                  ))}
                </div>
              </details>
            </div>

            <div className="space-y-1.5">
              <span id="payment-method-label" className="text-xs font-semibold text-slate-600">Payment method</span>
              <details aria-labelledby="payment-method-label" className="relative border border-slate-200 bg-slate-50 text-sm text-slate-700">
                <summary className="cursor-pointer list-none px-3 py-2.5">{queryState.paymentMethod.length ? `${queryState.paymentMethod.length} methods selected` : 'All Methods'}</summary>
                <div className="absolute left-0 top-full z-20 mt-1 max-h-56 min-w-full overflow-auto border border-slate-200 bg-white p-2 shadow-lg">
                  {filterOptions.paymentMethods.map((option: any) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2 whitespace-nowrap px-2 py-1.5 hover:bg-slate-50">
                      <input type="checkbox" checked={queryState.paymentMethod.includes(option.value)} onChange={() => toggleMultiFilter('paymentMethod', option.value)} />
                      {option.label}
                    </label>
                  ))}
                </div>
              </details>
            </div>

            <label htmlFor="payment-date-from" className="space-y-1.5">
              <span className="block text-xs font-semibold text-slate-600">Payment date from</span>
              <input id="payment-date-from" type="date" value={queryState.fromDate} onChange={(e) => updateQuery({ fromDate: e.target.value })} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-1 focus:ring-blue-900/10" />
            </label>

            <label htmlFor="payment-date-to" className="space-y-1.5">
              <span className="block text-xs font-semibold text-slate-600">Payment date to</span>
              <input id="payment-date-to" type="date" value={queryState.toDate} onChange={(e) => updateQuery({ toDate: e.target.value })} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-1 focus:ring-blue-900/10" />
            </label>

            <label htmlFor="payment-program" className="space-y-1.5">
              <span className="block text-xs font-semibold text-slate-600">Program</span>
              <select id="payment-program" value={queryState.programId} onChange={(e) => updateQuery({ programId: e.target.value, batchId: '' })} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-1 focus:ring-blue-900/10">
                <option value="">All Programs</option>
                {filterOptions.programs.map((item: any) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>

            <label htmlFor="payment-batch" className="space-y-1.5 md:col-span-2 xl:col-span-1">
              <span className="block text-xs font-semibold text-slate-600">Batch</span>
              <select id="payment-batch" value={queryState.batchId} onChange={(e) => updateQuery({ batchId: e.target.value })} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-1 focus:ring-blue-900/10">
                <option value="">All Batches</option>
                {selectedProgramBatches.map((item: any) => (
                  <option key={item.id} value={item.id}>{item.batch_name}</option>
                ))}
              </select>
            </label>

            <label htmlFor="payment-confirmed-by" className="space-y-1.5 md:col-span-2 xl:col-span-1">
              <span className="block text-xs font-semibold text-slate-600">Confirmed by</span>
              <select id="payment-confirmed-by" value={queryState.confirmedBy} onChange={(e) => updateQuery({ confirmedBy: e.target.value })} className="w-full border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:ring-1 focus:ring-blue-900/10">
                <option value="">Confirmed by any</option>
                {filterOptions.staff.map((item: any) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
          </div>
          {optionsError ? <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{optionsError}</p> : null}
          {listError ? <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{listError}</p> : null}
        </div>

        <div className="mb-5 flex items-center justify-between border border-slate-200 bg-white p-4">
          <div>
            <div className="text-sm text-slate-500">Total receipts</div>
            <div className="text-2xl font-bold">{totals.count}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Total amount</div>
            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totals.totalAmount)}</div>
          </div>
        </div>

        <div className="overflow-hidden border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header.key} className="px-4 py-3 font-semibold">
                      {header.sortKey ? (
                        <button type="button" onClick={() => setSort(header.sortKey!)} className="text-left hover:text-blue-900">
                          {header.label}{queryState.sortBy === header.sortKey ? (queryState.sortOrder === 'asc' ? ' ↑' : ' ↓') : ''}
                        </button>
                      ) : header.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && loading ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-500">No receipts found.</td></tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-blue-900"><button type="button" onClick={() => openReceipt(row.id)} className="underline">{row.or_number}</button></td>
                      <td className="px-4 py-3">{row.trainee ? `${row.trainee.first_name} ${row.trainee.last_name}` : '—'}</td>
                      <td className="px-4 py-3">{row.program?.name ?? '—'}</td>
                      <td className="px-4 py-3">{reasonLabels[row.reason_of_dues] ?? row.reason_of_dues}</td>
                      <td className="px-4 py-3">{formatCurrency(row.amount)}</td>
                      <td className="px-4 py-3">{row.payment_date ?? '—'}</td>
                      <td className="px-4 py-3">{row.confirmed_by_name ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Pagination
            page={queryState.page}
            limit={queryState.limit}
            total={meta.total}
            totalPages={meta.totalPages}
            onPageChange={(page) => updateQuery({ page })}
            onLimitChange={(limit) => updateQuery({ limit })}
          />
        </div>
      </div>

      {drawerOpen && selectedReceipt ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/35">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Receipt Detail</h3>
              <button type="button" onClick={() => setDrawerOpen(false)} className="text-sm text-slate-500">Close</button>
            </div>
            <dl className="space-y-4 text-sm">
              <div><dt className="text-slate-500">OR Number</dt><dd className="font-semibold text-slate-900">{selectedReceipt.or_number}</dd></div>
              <div><dt className="text-slate-500">Trainee</dt><dd className="font-semibold text-slate-900">{selectedReceipt.trainee ? `${selectedReceipt.trainee.first_name} ${selectedReceipt.trainee.last_name}` : '—'}</dd></div>
              <div><dt className="text-slate-500">Program</dt><dd className="font-semibold text-slate-900">{selectedReceipt.program?.name ?? '—'}</dd></div>
              <div><dt className="text-slate-500">Batch</dt><dd className="font-semibold text-slate-900">{selectedReceipt.batch?.batch_name ?? '—'}</dd></div>
              <div><dt className="text-slate-500">Reason</dt><dd className="font-semibold text-slate-900">{reasonLabels[selectedReceipt.reason_of_dues] ?? selectedReceipt.reason_of_dues}</dd></div>
              <div><dt className="text-slate-500">Amount Due</dt><dd className="font-semibold text-slate-900">{formatCurrency(selectedReceipt.base_fee)}</dd></div>
              <div><dt className="text-slate-500">Amount Paid</dt><dd className="font-semibold text-slate-900">{formatCurrency(selectedReceipt.amount)}</dd></div>
              <div><dt className="text-slate-500">Payment Method</dt><dd className="font-semibold text-slate-900">{selectedReceipt.payment_method}</dd></div>
              <div><dt className="text-slate-500">Payment Date</dt><dd className="font-semibold text-slate-900">{selectedReceipt.payment_date ?? '—'}</dd></div>
              <div><dt className="text-slate-500">Remarks</dt><dd className="font-semibold text-slate-900">{selectedReceipt.remarks ?? '—'}</dd></div>
              <div><dt className="text-slate-500">Confirmed by</dt><dd className="font-semibold text-slate-900">{selectedReceipt.confirmed_by_name ?? '—'}</dd></div>
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
