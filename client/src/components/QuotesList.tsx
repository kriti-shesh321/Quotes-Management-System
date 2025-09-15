// src/components/QuotesList.tsx
import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchQuotes, appendQuotes, resetQuotes } from '../store/slices/quotesSlice';
import { api } from '../lib/api';
import QuoteCard from './QuoteCard';
import FilterButton from './FilterButton';
import { debounce } from '../lib/debounce';

type Topic = { id: number; name: string; };

export default function QuotesList() {
  const dispatch = useAppDispatch();
  const { items, offset, finished } = useAppSelector(s => s.quotes);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicId, setTopicId] = useState<number | ''>('');
  const [query, setQuery] = useState('');
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState<'all' | 'my' | 'favorites'>('all');

  // fetching topics on mount
  useEffect(() => {
    let mounted = true;
    setLoadingTopics(true);
    api.get('/topics')
      .then(r => { if (mounted) setTopics(r.data || []); })
      .catch(e => console.error('topics fetch error', e))
      .finally(() => mounted && setLoadingTopics(false));
    return () => { mounted = false; };
  }, []);

  // fetching initial data
  useEffect(() => {
    setLoading(true);
    dispatch(fetchQuotes({ limit: 5, offset: 0 }))
      .unwrap()
      .catch(e => console.error('fetch quotes error', e))
      .finally(() => setLoading(false));
  }, [dispatch]);

  const buildParams = (q: string, tId: number | '', f: typeof filter) => {
    const params: any = { limit: 10, offset: 0 };
    if (q) params.q = q;
    if (tId !== '') params.topic_id = tId;

    if (f === 'my') params.only_my = true;
    if (f === 'favorites') params.is_favorite = true;
    return params;
  };

  const runFilter = async (q: string, tId: number | '', f: typeof filter) => {
    dispatch(resetQuotes());
    await dispatch(fetchQuotes(buildParams(q, tId, f)));
  };

  // debouncing the runFilter for query changes
  const debouncedRun = useMemo(() => debounce(runFilter, 350), [dispatch]);

  useEffect(() => {
    debouncedRun(query, topicId, filter);
  }, [query, topicId, filter, debouncedRun]);

  async function loadMore() {
    const params: any = { limit: 10, offset };
    if (query) params.q = query;
    if (topicId !== '') params.topic_id = topicId;
    if (filter === 'my') params.only_my = true;
    if (filter === 'favorites') params.is_favorite = true;

    const res = await api.get('/quotes', { params });
    dispatch(appendQuotes(res.data));
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex flex-1 gap-2 w-full">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search quotes or author..."
            className="flex-1 p-2 border rounded"
          />

          <select
            value={topicId}
            onChange={e => setTopicId(e.target.value === '' ? '' : Number(e.target.value))}
            className="p-2 border rounded"
            disabled={loadingTopics}
          >
            <option value="">All topics</option>
            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
          <FilterButton active={filter === 'my'} onClick={() => setFilter('my')}>My Quotes</FilterButton>
          <FilterButton active={filter === 'favorites'} onClick={() => setFilter('favorites')}>My Favorites</FilterButton>
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-3">
          {items.map(q => <QuoteCard q={q} key={q.id} />)}
          {loading && <div className="text-sm text-gray-500 py-4">Loading...</div>}
          {!loading && items.length === 0 && <div className="text-sm text-gray-500 py-4">No quotes found.</div>}
        </div>

        {!finished && items.length > 0 && (
          <div className="mt-4">
            <button className="px-4 py-2 border rounded" onClick={loadMore}>Load more</button>
          </div>
        )}
      </div>
    </div>
  );
}