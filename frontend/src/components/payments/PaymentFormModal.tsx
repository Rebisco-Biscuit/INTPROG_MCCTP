import { useEffect, useMemo, useState } from 'react';
import { getPaymentTraineeOptions, createPayment } from '../../api/payments.api';

const reasonOptions = [
  { value: 'PROCESSING_FEE', label: 'Processing Fee' },
  { value: 'UNIFORM_ID_FEE', label: 'Uniform/ID Fee' },
  { value: 'ASSESSMENT_DEPOSIT', label: 'Assessment Deposit' },
  { value: 'EXTERNAL_FEES', label: 'External Fees' },
];

const methodOptions = [
  { value: 'CASH', label: 'Cash' },
  { value: 'GCASH', label: 'GCash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHECK', label: 'Check' },
];

const isValidAmount = (value: string) =>
  /^(?=.*[1-9])\d{1,8}(?:\.\d{1,2})?$/.test(value);

export function PaymentFormModal({ role, onClose, onSaved }: { role: 'admin' | 'registrar'; onClose: () => void; onSaved: () => void; }) {
  const [search, setSearch] = useState('');
  const [traineeResults, setTraineeResults] = useState<any[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState<any>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [reason, setReason] = useState('PROCESSING_FEE');
  const [baseFee, setBaseFee] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [traineeSearchLoading, setTraineeSearchLoading] = useState(false);
  const [traineeSearchError, setTraineeSearchError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(async () => {
      if (selectedTrainee && search === selectedTrainee.label) {
        setTraineeResults([]);
        setTraineeSearchLoading(false);
        setTraineeSearchError(null);
        return;
      }

      if (search.trim().length < 2) {
        setTraineeResults([]);
        setTraineeSearchLoading(false);
        setTraineeSearchError(null);
        return;
      }

      setTraineeSearchLoading(true);
      setTraineeSearchError(null);
      try {
        const results = await getPaymentTraineeOptions(role, search);
        if (!cancelled) setTraineeResults(Array.isArray(results) ? results : []);
      } catch (requestError) {
        if (!cancelled) {
          setTraineeSearchError(requestError instanceof Error ? requestError.message : 'Unable to search trainees');
          setTraineeResults([]);
        }
      } finally {
        if (!cancelled) setTraineeSearchLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, role, selectedTrainee]);

  const enrollmentChoices = useMemo(() => {
    if (!selectedTrainee) return [];
    return selectedTrainee.enrollments ?? [];
  }, [selectedTrainee]);

  const submitDisabled = loading || !selectedTrainee || !selectedEnrollment || !isValidAmount(baseFee) || !isValidAmount(amount);

  async function handleSubmit() {
    if (submitDisabled) return;
    setLoading(true);
    setError(null);

    try {
      await createPayment(role, {
        enrollment_id: selectedEnrollment.id,
        idempotency_key: idempotencyKey,
        reason_of_dues: reason,
        base_fee: baseFee,
        amount,
        payment_method: method,
        payment_date: paymentDate,
        remarks,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      setError(e.message || 'Unable to save payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/30 p-3 sm:p-4">
      <div className="mx-auto flex min-h-full w-full max-w-3xl items-center justify-center">
        <div className="max-h-[92vh] w-full overflow-y-auto border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-800 sm:text-xs">Record Payment</p>
                <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Official Receipt</h3>
              </div>
              <button type="button" onClick={onClose} className="border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">Close</button>
            </div>
          </div>

          <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
            <div className="border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <div className="mb-3 border-l-4 border-yellow-400 bg-white px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Trainee selection</p>
              </div>

              <label className="mb-2 block text-sm font-medium text-slate-700">Search trainee</label>
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setTraineeResults([]);
                  setSelectedTrainee(null);
                  setSelectedEnrollment(null);
                }}
                placeholder="Type a name or system ID"
                className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-1 focus:ring-blue-900/10"
              />

              {search.trim().length > 0 && search.trim().length < 2 ? (
                <p className="mt-2 text-xs text-slate-500">Type at least 2 characters to search for a trainee.</p>
              ) : null}

              {traineeSearchLoading ? <p className="mt-2 text-xs text-slate-500">Searching trainees...</p> : null}
              {traineeSearchError ? <p className="mt-2 text-xs text-red-700">{traineeSearchError}</p> : null}

              {traineeResults.length ? (
                <div className="mt-3 max-h-52 overflow-auto border border-slate-200 bg-white p-2">
                  {traineeResults.map((trainee: any) => (
                    <button
                      key={trainee.id}
                      type="button"
                      onClick={() => {
                        setSelectedTrainee(trainee);
                        setSelectedEnrollment(trainee.enrollments?.[0] ?? null);
                        setSearch(trainee.label);
                      }}
                      className="flex w-full items-center justify-between px-3 py-2.5 text-left transition hover:bg-slate-50"
                    >
                      <span>
                        <span className="block font-medium text-slate-900">{trainee.label}</span>
                        <span className="text-xs text-slate-500">{trainee.system_id}</span>
                      </span>
                      <span className="text-xs text-slate-500">{trainee.enrollments?.length ?? 0} enrollments</span>
                    </button>
                  ))}
                </div>
              ) : null}

              {!selectedTrainee && !traineeSearchLoading && !traineeSearchError && !traineeResults.length && search.trim().length >= 2 ? (
                <div className="mt-3 border border-dashed border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                  No matching trainee found.
                </div>
              ) : null}

              {selectedTrainee && enrollmentChoices.length === 0 ? (
                <p className="mt-2 text-xs text-amber-700">This trainee has no enrollment available for a payment.</p>
              ) : null}
            </div>

            <div className="border border-slate-200 bg-slate-50 p-3 sm:p-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">Enrollment</label>
              <select
                value={selectedEnrollment?.id ?? ''}
                onChange={(e) => setSelectedEnrollment(enrollmentChoices.find((item: any) => item.id === e.target.value) ?? null)}
                className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-1 focus:ring-blue-900/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!selectedTrainee}
              >
                <option value="">Select an enrollment</option>
                {enrollmentChoices.map((item: any) => (
                  <option key={item.id} value={item.id}>{item.program_name ?? item.batch_name ?? item.id}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Reason</label>
                <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-1 focus:ring-blue-900/10">
                  {reasonOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Payment method</label>
                <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-1 focus:ring-blue-900/10">
                  {methodOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Amount due</label>
                <input type="number" min="0.01" step="0.01" value={baseFee} onChange={(e) => setBaseFee(e.target.value)} className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-1 focus:ring-blue-900/10" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Amount paid</label>
                <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-1 focus:ring-blue-900/10" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Payment date</label>
                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-1 focus:ring-blue-900/10" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Remarks</label>
                <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-1 focus:ring-blue-900/10" />
              </div>
            </div>

            {error ? <div className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}

            <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-0 pt-4">
              <button type="button" onClick={onClose} className="border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">Cancel</button>
              <button type="button" disabled={submitDisabled} onClick={handleSubmit} className="bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
