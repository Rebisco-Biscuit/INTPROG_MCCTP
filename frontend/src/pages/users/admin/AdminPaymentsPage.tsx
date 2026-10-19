import { useState } from 'react';
import Header from '../../../components/layout/Header';
import Sidebar from '../../../components/layout/Sidebar';
import Footer from '../../../components/layout/Footer';
import { PaymentListPage } from '../../../components/payments/PaymentListPage';
import { PaymentFormModal } from '../../../components/payments/PaymentFormModal';

export default function AdminPaymentsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <Header />

      <div className="relative flex min-h-0 flex-1">
        <Sidebar variant="admin" />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
                <div>
                  <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-800">Administration</p>
                  <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-950 md:text-5xl">
                    Official
                    <span className="block text-blue-900">Receipts</span>
                  </h1>
                  <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                    Record and review all official payment receipts for dues paid outside enrollment.
                  </p>
                </div>

                <div className="border-l border-slate-200 pl-6 lg:ml-auto lg:max-w-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Current Access</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">Payment Ledger</p>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Search receipts, verify details, and record new official payments from the admin side.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-50 px-6 py-12 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <PaymentListPage role="admin" onRecordPayment={() => setShowCreate(true)} refreshKey={listRefreshKey} />
            </div>
          </section>
        </main>
      </div>

      <Footer />

      {showCreate ? (
        <PaymentFormModal
          role="admin"
          onClose={() => setShowCreate(false)}
          onSaved={() => {
            setShowCreate(false);
            setListRefreshKey((key) => key + 1);
          }}
        />
      ) : null}
    </div>
  );
}
