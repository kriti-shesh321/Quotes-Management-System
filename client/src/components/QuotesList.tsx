import { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchQuotes, appendQuotes, resetQuotes } from '../store/slices/quotesSlice';
import { api } from '../lib/api';
import QuoteCard from './QuoteCard';
import { debounce } from '../lib/debounce';

export default function QuotesList(){
  const dispatch = useAppDispatch();
  const { items, offset, finished } = useAppSelector(s => s.quotes);

  const [topics, setTopics] = useState<{id:number;name:string}[]>([]);
  const [topicId, setTopicId] = useState<number | ''>('');
  const [query, setQuery] = useState('');
  const [loadingTopics, setLoadingTopics] = useState(false);

  // fetching topics on mount
  useEffect(() => {
    let mounted = true;
    setLoadingTopics(true);
    api.get('/topics')
      .then(r => { if (mounted) setTopics(r.data); })
      .catch(e => console.error('topics fetch error', e))
      .finally(() => mounted && setLoadingTopics(false));
    return () => { mounted = false; };
  }, []);

  // fetching initial data
  useEffect(() => {
    dispatch(fetchQuotes({ limit: 10, offset: 0 }));
  }, [dispatch]);

  const runFilter = async (q: string, tId: number | '') => {
    dispatch(resetQuotes());
    await dispatch(fetchQuotes({ limit: 10, offset: 0, q: q || undefined, topic_id: tId === '' ? undefined : tId }));
  };

  // debouncing the runFilter for query changes
  const debouncedRun = useMemo(() => debounce(runFilter, 350), []);

  useEffect(() => {
    debouncedRun(query, topicId);
  }, [query, topicId]);

  async function loadMore(){
    // use current filters
    const params: any = { limit: 10, offset };
    if (query) params.q = query;
    if (topicId !== '') params.topic_id = topicId;
    const res = await api.get('/quotes', { params });
    dispatch(appendQuotes(res.data));
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
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
        >
          <option value="">All topics</option>
          {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div className="grid gap-3">
        {items.map(q => <QuoteCard q={q} key={q.id} />)}
      </div>

      {!finished && (
        <div className="mt-4">
          <button className="px-4 py-2 border rounded" onClick={loadMore}>Load more</button>
        </div>
      )}
    </div>
  );
}
