import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BATCH_STATUSES,
  ENROLLMENT_STATUSES,
  GENDERS,
  INSURANCE_FILTERS,
  PAGE_SIZES,
  PROGRAM_TYPES,
  REQUIREMENT_FILTERS,
  SORT_FIELDS,
  SORT_ORDERS,
} from '../types/student-information.type';
import type { TraineeFilters, TraineeListQuery } from '../types/student-information.type';

export const EMPTY_FILTERS: TraineeFilters = {
  search: '',
  programId: '',
  batchId: '',
  enrollmentStatus: '',
  batchStatus: '',
  dateFrom: '',
  dateTo: '',
  programType: '',
  gender: '',
  insurance: '',
  requirements: '',
};

export const DEFAULT_QUERY: TraineeListQuery = {
  ...EMPTY_FILTERS,
  page: 1,
  limit: PAGE_SIZES[0],
  sortBy: 'enrolledAt',
  sortOrder: 'desc',
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** The value if it is one of the allowed ones, otherwise the fallback. */
function oneOf<T extends string | number>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

/**
 * Reads the list state from the URL. Unknown or malformed values fall back
 * to their defaults, so a hand-edited link never causes a failed request.
 */
export function parseTraineeListQuery(params: URLSearchParams): TraineeListQuery {
  const text = (key: string) => params.get(key) ?? '';
  const pattern = (key: string, regex: RegExp) => (regex.test(text(key)) ? text(key) : '');
  const page = Number.parseInt(text('page'), 10);

  return {
    search: text('search').slice(0, 100),
    programId: pattern('programId', UUID),
    batchId: pattern('batchId', UUID),
    enrollmentStatus: oneOf(text('enrollmentStatus'), ENROLLMENT_STATUSES, ''),
    batchStatus: oneOf(text('batchStatus'), BATCH_STATUSES, ''),
    dateFrom: pattern('dateFrom', DATE_ONLY),
    dateTo: pattern('dateTo', DATE_ONLY),
    programType: oneOf(text('programType'), PROGRAM_TYPES, ''),
    gender: oneOf(text('gender'), GENDERS, ''),
    insurance: oneOf(text('insurance'), INSURANCE_FILTERS, ''),
    requirements: oneOf(text('requirements'), REQUIREMENT_FILTERS, ''),
    page: Number.isInteger(page) && page >= 1 ? page : DEFAULT_QUERY.page,
    limit: oneOf(Number(text('limit')), PAGE_SIZES, DEFAULT_QUERY.limit),
    sortBy: oneOf(text('sortBy'), SORT_FIELDS, DEFAULT_QUERY.sortBy),
    sortOrder: oneOf(text('sortOrder'), SORT_ORDERS, DEFAULT_QUERY.sortOrder),
  };
}

/** Writes only values that differ from the defaults, keeping links short. */
function toSearchParams(query: TraineeListQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of Object.keys(DEFAULT_QUERY) as (keyof TraineeListQuery)[]) {
    if (query[key] !== DEFAULT_QUERY[key]) params.set(key, String(query[key]));
  }
  return params;
}

/**
 * Search, filter, sort and page state for the trainee list, kept in the URL
 * so it survives reloads, can be shared, and is restored on Back.
 */
export function useTraineeListQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const query = useMemo(() => parseTraineeListQuery(new URLSearchParams(queryString)), [queryString]);

  /**
   * Applies a change. Any change other than the page itself returns to
   * page 1. `replace` avoids a history entry (used while typing a search).
   */
  const update = useCallback(
    (patch: Partial<TraineeListQuery>, options: { replace?: boolean } = {}) => {
      setSearchParams(
        (previous) => {
          const next = { ...parseTraineeListQuery(previous), ...patch };
          if (!('page' in patch)) next.page = 1;
          return toSearchParams(next);
        },
        { replace: options.replace },
      );
    },
    [setSearchParams],
  );

  return { query, queryString, update };
}
