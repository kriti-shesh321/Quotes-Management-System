import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../hooks';
import { createQuote } from '../store/slices/quotesSlice';
import { api } from '../lib/api';

type Topic = { id: number; name: string; };

export default function AddQuote() {
  const dispatch = useAppDispatch();
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [topicId, setTopicId] = useState<number | ''>('');

  const [topics, setTopics] = useState<Topic[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingTopics(true);
    api.get('/topics')
      .then(r => {
        if (!mounted) return;
        setTopics(Array.isArray(r.data) ? r.data : []);
      })
      .catch(err => {
        console.error('topics fetch error', err);
      })
      .finally(() => mounted && setLoadingTopics(false));
    return () => { mounted = false; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const payload: any = {
        text: text.trim(),
        author: author.trim() || null,
        is_public: !!isPublic,
        topic_id: topicId === '' ? null : Number(topicId),
      };
      await dispatch(createQuote(payload));
      setText('');
      setAuthor('');
      setIsPublic(true);
      setTopicId('');
    } catch (err) {
      console.error('create quote failed', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="p-4 bg-white rounded-xl shadow border border-slate-200 flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-slate-800 mb-1">Add a Quote</h3>

      <textarea
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        required
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a quote..."
        rows={3}
        disabled={submitting}
      />

      <input
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Author (optional)"
        disabled={submitting}
      />

      <div className="flex gap-2 items-center">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="accent-orange-500"
            disabled={submitting}
          />
          <span>Public</span>
        </label>

        <div className="flex-1" />

        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value === '' ? '' : Number(e.target.value))}
          className="p-2 border rounded-md bg-white text-sm"
          disabled={loadingTopics || submitting}
        >
          <option value="">No topic</option>
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className={`w-full py-2 rounded-lg text-white font-medium transition ${submitting ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-800'}`}
        disabled={submitting}
      >
        {submitting ? 'Adding…' : 'Add Quote'}
      </button>
    </form>
  );
}