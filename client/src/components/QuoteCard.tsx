import type { Quote } from '../types/types';
import { useAppDispatch, useAppSelector } from '../hooks';
import { deleteQuote, updateQuote } from '../store/slices/quotesSlice';

export default function QuoteCard({ q }:{ q: Quote }){
  const dispatch = useAppDispatch();
  const me = useAppSelector(s => s.auth.user);

  const canEdit = me && (me.id === q.user_id || me.role === 'admin');

  async function onDelete(){
    if (!confirm('Delete this quote?')) return;
    await dispatch(deleteQuote(q.id));
  }

  async function toggleFavorite(){
    await dispatch(updateQuote({ id: q.id, body: { is_favorite: !q.is_favorite } }));
  }

  return (
    <div className="p-3 border rounded">
      <div className="text-lg">{q.text}</div>
      <div className="text-sm text-gray-600">{q.author ?? '—'} • <em>{q.username ?? 'Anonymous'}</em></div>
      <div className="flex gap-2 mt-2">
        <button className="text-sm px-2 py-1 border rounded" onClick={toggleFavorite}>{q.is_favorite ? 'Unfavorite' : 'Favorite'}</button>
        {canEdit && <button className="text-sm px-2 py-1 border rounded" onClick={onDelete}>Delete</button>}
      </div>
    </div>
  );
}