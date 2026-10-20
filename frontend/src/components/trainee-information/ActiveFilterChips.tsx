import React from 'react';
import { X } from 'lucide-react';
import type { TraineeFilterKey, TraineeFilterOptions, TraineeFilters } from '../../types/trainee-information.type';
import { enumLabel, formatDateOnly } from './format';
import { INSURANCE_LABELS, PROGRAM_TYPE_LABELS, REQUIREMENT_LABELS } from './TraineeFilterPanel';

interface ActiveFilterChipsProps {
  filters: TraineeFilters;
  options: TraineeFilterOptions | null;
  onRemove: (patch: Partial<TraineeFilters>) => void;
  onClearAll: () => void;
}

/** Each active filter as a removable chip, plus "Clear all". */
const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({ filters, options, onRemove, onClearAll }) => {
  const programName = options?.programs.find((program) => program.id === filters.programId)?.name;
  const batchName = options?.batches.find((batch) => batch.id === filters.batchId)?.name;

  const labels: Record<TraineeFilterKey, string> = {
    search: `Search: “${filters.search}”`,
    programId: `Program: ${programName ?? 'Loading…'}`,
    batchId: `Batch: ${batchName ?? 'Loading…'}`,
    enrollmentStatus: `Status: ${enumLabel(filters.enrollmentStatus)}`,
    batchStatus: `Batch status: ${enumLabel(filters.batchStatus)}`,
    dateFrom: `Enrolled from: ${formatDateOnly(filters.dateFrom)}`,
    dateTo: `Enrolled to: ${formatDateOnly(filters.dateTo)}`,
    programType: `Program type: ${filters.programType ? PROGRAM_TYPE_LABELS[filters.programType] : ''}`,
    gender: `Gender: ${enumLabel(filters.gender)}`,
    insurance: `Insurance: ${filters.insurance ? INSURANCE_LABELS[filters.insurance] : ''}`,
    requirements: `Requirements: ${filters.requirements ? REQUIREMENT_LABELS[filters.requirements] : ''}`,
  };

  const active = (Object.keys(labels) as TraineeFilterKey[]).filter((key) => filters[key] !== '');
  if (active.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {active.map((key) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 py-1 pl-3 pr-1.5 text-xs font-medium text-blue-900"
        >
          {labels[key]}
          <button
            type="button"
            // Removing the program also removes its batch
            onClick={() => onRemove(key === 'programId' ? { programId: '', batchId: '' } : { [key]: '' })}
            aria-label={`Remove filter ${labels[key]}`}
            className="flex h-5 w-5 items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100 hover:text-blue-950"
          >
            <X aria-hidden="true" className="h-3 w-3" />
          </button>
        </span>
      ))}
      <button type="button" onClick={onClearAll} className="px-2 text-xs font-semibold text-slate-500 transition hover:text-slate-900">
        Clear all
      </button>
    </div>
  );
};

export default ActiveFilterChips;
