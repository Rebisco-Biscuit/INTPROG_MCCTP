type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

const PAGE_SIZES = [10, 20, 50];

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-slate-600">Showing {start}-{end} of {total}</div>
      <div className="flex items-center gap-2">
        <select
          aria-label="Rows per page"
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="border border-slate-300 bg-white px-2 py-1.5 text-sm"
        >
          {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="border border-slate-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Prev
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="border border-slate-300 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}