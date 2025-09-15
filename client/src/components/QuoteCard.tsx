// src/components/QuoteCard.tsx
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateQuote, deleteQuote } from '../store/slices/quotesSlice';
import type { Quote } from '../types/types';
import toast from 'react-hot-toast';
import { HeartIcon as SolidHeart } from "@heroicons/react/24/solid";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";

export default function QuoteCard({ q }: { q: Quote; }) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);

  const isOwner = auth.user && q.user_id === auth.user.id;
  const canEdit = isOwner || auth.user?.role === 'admin';

  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(q.text);
  const [author, setAuthor] = useState(q.author ?? '');
  const [isPublic, setIsPublic] = useState(!!q.is_public);
  const [saving, setSaving] = useState(false);

  const [favorited, setFavorited] = useState<boolean>(!!q.is_favorite);
  const [favSaving, setFavSaving] = useState(false);

  useEffect(() => {
    setFavorited(!!q.is_favorite);
    setText(q.text);
    setAuthor(q.author ?? '');
    setIsPublic(!!q.is_public);
  }, [q]);

  async function toggleFavorite() {
    if (favSaving) return;
    setFavSaving(true);
    try {
      const updated = await dispatch(updateQuote({ id: q.id, body: { is_favorite: !favorited } })).unwrap();
      setFavorited(!!updated.is_favorite);
      toast.success(updated.is_favorite ? 'Marked favorite' : 'Removed from favorites');
    } catch (err) {
      console.error('toggle favorite failed', err);
      toast.error('Could not update favorite');
    } finally {
      setFavSaving(false);
    }
  }

  async function onDelete() {
    if (!confirm('Delete this quote?')) return;
    try {
      await dispatch(deleteQuote(q.id)).unwrap();
      toast.success('Deleted');
    } catch (err) {
      console.error('delete failed', err);
      toast.error('Delete failed');
    }
  }

  async function onSaveEdit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!text.trim()) {
      toast.error('Text is required');
      return;
    }
    setSaving(true);
    try {
      const body: any = {
        text: text.trim(),
        author: author.trim() || null,
        is_public: !!isPublic,
      };
      const updated = await dispatch(updateQuote({ id: q.id, body })).unwrap();
      setText(updated.text);
      setAuthor(updated.author ?? '');
      setIsPublic(!!updated.is_public);
      setEditing(false);
      toast.success('Updated');
    } catch (err: any) {
      console.error('update failed', err);
      const message = typeof err === 'string' ? err : (err?.message || 'Update failed');
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function onCancelEdit() {
    setEditing(false);
    setText(q.text);
    setAuthor(q.author ?? '');
    setIsPublic(!!q.is_public);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 flex gap-4 items-start">
      <div className="flex-1">
        {!editing ? (
          <>
            <div className="text-base md:text-lg text-slate-800 leading-snug">{q.text}</div>
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm text-slate-500">
                <span className="font-medium">{q.author ?? '—'}</span>
                {q.username && <span className="ml-2 text-xs text-slate-400"> • {q.username}</span>}
              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={toggleFavorite}
                  aria-label={favorited ? 'Unfavorite' : 'Favorite'}
                  className="p-2 rounded-md hover:bg-orange-50 transition"
                  disabled={favSaving}
                >
                  {isOwner &&
                    (favorited ? (
                      <SolidHeart className="w-5 h-5 text-red-600" />
                    ) : (
                      <HeartOutline className="w-5 h-5 text-slate-600" />
                    ))}
                </button>

                {canEdit && (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="text-sm px-2 py-1 rounded-md border text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={onDelete}
                      className="text-sm px-2 py-1 rounded-md border text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <form onSubmit={onSaveEdit} className="flex flex-col gap-2">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
              disabled={saving}
            />
            <input
              value={author}
              onChange={e => setAuthor(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Author (optional)"
              disabled={saving}
            />
            <div className="flex items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} disabled={saving} />
                <span className="text-sm">Public</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="px-3 py-1 rounded-md border text-sm bg-white"
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={`px-3 py-1 rounded-md text-sm text-white ${saving ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}