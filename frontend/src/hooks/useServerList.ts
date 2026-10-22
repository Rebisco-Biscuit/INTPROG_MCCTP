import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

type ServerListLoader<T> = (
  params: URLSearchParams,
  signal: AbortSignal,
) => Promise<T>;

export function useServerList<T>(
  loadData: ServerListLoader<T>,
  debounceMs = 300,
  refreshKey?: number,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const paramsKey = searchParams.toString();

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await loadData(new URLSearchParams(paramsKey), controller.signal);
        setData(result);
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load records');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [debounceMs, loadData, paramsKey, refreshKey]);

  return { searchParams, setSearchParams, data, loading, error };
}