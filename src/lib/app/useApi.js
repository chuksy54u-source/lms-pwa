'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { apiGet } from '../api/client.js';

// const { data, error, loading, reload, setData } = useApi('/api/v1/courses');
// Pass null as the path to wait (for example until you know the student's id).
// Answers are cached in memory, so going back to a page shows the last answer at once and refreshes quietly.
const cache = new Map();

export function clearApiCache(prefix) {
  for (const key of cache.keys()) if (!prefix || key.startsWith(prefix)) cache.delete(key);
}

export default function useApi(path, { fetcher } = {}) {
  const [state, setState] = useState(() => ({ data: path && cache.has(path) ? cache.get(path) : undefined, error: null, loading: Boolean(path) }));
  const live = useRef(true);
  const fetchRef = useRef(fetcher);
  fetchRef.current = fetcher;

  const load = useCallback(async () => {
    if (!path) return undefined;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await (fetchRef.current ? fetchRef.current(path) : apiGet(path));
      cache.set(path, data);
      if (live.current) setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      if (live.current) setState((s) => ({ ...s, error, loading: false }));
      return undefined;
    }
  }, [path]);

  useEffect(() => {
    live.current = true;
    if (path) {
      setState({ data: cache.get(path), error: null, loading: true });
      load();
    } else setState({ data: undefined, error: null, loading: false });
    return () => {
      live.current = false;
    };
  }, [path, load]);

  const setData = useCallback(
    (updater) => {
      setState((s) => {
        const data = typeof updater === 'function' ? updater(s.data) : updater;
        if (path) cache.set(path, data);
        return { ...s, data };
      });
    },
    [path],
  );

  return { ...state, reload: load, setData };
}
