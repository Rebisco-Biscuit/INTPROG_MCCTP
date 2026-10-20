import React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import EnrollmentStatusBadge from '../enrollment/EnrollmentStatusBadge';
import type { SortOrder, TraineeListRow, TraineeSortField } from '../../types/trainee-information.type';
import { formatTimestamp, listName, valueOrDash } from './format';

interface TraineeTableProps {
  rows: TraineeListRow[];
  sortBy: TraineeSortField;
  sortOrder: SortOrder;
  onSort: (field: TraineeSortField) => void;
  onOpen: (traineeId: string) => void;
  isLoading: boolean;
}

const headerClass = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600';

const SortHeader: React.FC<{
  field: TraineeSortField;
  label: string;
  sortBy: TraineeSortField;
  sortOrder: SortOrder;
  onSort: (field: TraineeSortField) => void;
}> = ({ field, label, sortBy, sortOrder, onSort }) => {
  const isActive = sortBy === field;
  const Icon = !isActive ? ArrowUpDown : sortOrder === 'asc' ? ArrowUp : ArrowDown;
  return (
    <th scope="col" className={headerClass} aria-sort={isActive ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className={`inline-flex items-center gap-1.5 uppercase tracking-wider transition hover:text-blue-900 ${isActive ? 'text-blue-900' : ''}`}
      >
        {label}
        <Icon aria-hidden="true" className={`h-3.5 w-3.5 ${isActive ? '' : 'text-slate-400'}`} />
      </button>
    </th>
  );
};

/** One row per trainee; clicking a row (or pressing Enter on it) opens the profile. */
const TraineeTable: React.FC<TraineeTableProps> = ({ rows, sortBy, sortOrder, onSort, onOpen, isLoading }) => (
  <div className={`overflow-x-auto rounded-lg border border-slate-200 bg-white transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
    <table className="w-full min-w-[960px]">
      <thead className="border-b border-slate-200 bg-slate-50">
        <tr>
          <SortHeader field="name" label="Trainee" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
          <th scope="col" className={headerClass}>Contact</th>
          <th scope="col" className={headerClass}>Program / Batch</th>
          <SortHeader field="idCard" label="ID Card" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
          <th scope="col" className={headerClass}>Status</th>
          <SortHeader field="enrolledAt" label="Enrolled" sortBy={sortBy} sortOrder={sortOrder} onSort={onSort} />
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {rows.map((row) => (
          <tr
            key={row.id}
            tabIndex={0}
            onClick={() => onOpen(row.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onOpen(row.id);
              }
            }}
            aria-label={`Open profile of ${listName(row)}`}
            className="cursor-pointer transition hover:bg-slate-50 focus:bg-blue-50 focus:outline-none"
          >
            <td className="px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{listName(row)}</p>
              <p className="text-xs text-slate-500">{valueOrDash(row.username)}</p>
            </td>
            <td className="px-4 py-3 text-sm text-slate-700">
              <p>{valueOrDash(row.contactNumber)}</p>
              {row.email && <p className="text-xs text-slate-500">{row.email}</p>}
            </td>
            <td className="px-4 py-3 text-sm">
              {row.enrollment ? (
                <>
                  <p className="font-medium text-slate-900">
                    {row.enrollment.programName}
                    {row.otherEnrollmentCount > 0 && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        +{row.otherEnrollmentCount} more
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500">{row.enrollment.batchName}</p>
                </>
              ) : (
                <span className="text-slate-400">No enrollment</span>
              )}
            </td>
            <td className="px-4 py-3 font-mono text-sm text-slate-900">{valueOrDash(row.enrollment?.idCardNumber)}</td>
            <td className="px-4 py-3 text-sm">
              {row.enrollment ? <EnrollmentStatusBadge status={row.enrollment.status} /> : <span className="text-slate-400">—</span>}
            </td>
            <td className="px-4 py-3 text-sm text-slate-600">{formatTimestamp(row.enrollment?.enrolledAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default TraineeTable;
