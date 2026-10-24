export type ListFilterChip = {
  key: string;
  label: string;
  value: string;
};

type ListToolbarProps = {
  search: string;
  searchPlaceholder: string;
  filters: ListFilterChip[];
  onSearch: (value: string) => void;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
};

export function ListToolbar({
  search,
  searchPlaceholder,
  filters,
  onSearch,
  onRemoveFilter,
  onClearAll,
}: ListToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={searchPlaceholder}
          className="w-full flex-1 border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-900 focus:ring-1 focus:ring-blue-900/10"
        />
        {filters.length > 0 ? (
          <button
            type="button"
            onClick={onClearAll}
            className="self-start text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-4 sm:self-auto"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {filters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onRemoveFilter(filter.key)}
              className="border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] font-medium text-slate-700"
              aria-label={`Remove ${filter.label} filter ${filter.value}`}
            >
              {filter.label}: {filter.value} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}