import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PAGE_SIZES } from '../../types/student-information.type';

interface ListPaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  disabled?: boolean;
}

const buttonClass =
  'inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50';

const ListPagination: React.FC<ListPaginationProps> = ({ page, limit, total, totalPages, onPageChange, onLimitChange, disabled }) => {
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <span>
          Showing {first}–{last} of {total.toLocaleString()}
        </span>
        <label className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Per page</span>
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={disabled || page <= 1} className={buttonClass}>
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          Previous
        </button>
        <span className="px-2 text-sm text-slate-600">
          Page {totalPages === 0 ? 0 : page} of {totalPages.toLocaleString()}
        </span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={disabled || page >= totalPages} className={buttonClass}>
          Next
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ListPagination;
